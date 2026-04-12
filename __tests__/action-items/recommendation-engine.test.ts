import { recommendationEngine, RecommendationEngine } from '@/lib/recommendations/recommendation-engine'
import { RetirementProfile, RetirementCalculation } from '@prisma/client'

// Mock the standardized pension calculator
jest.mock('@/lib/standardized-pension-calculator', () => ({
  calculateCurrentAge: jest.fn((dateOfBirth: Date) => {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    return today.getFullYear() - birthDate.getFullYear()
  }),
  calculateYearsOfService: jest.fn((membershipDate: Date) => {
    const today = new Date()
    const startDate = new Date(membershipDate)
    return Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25))
  }),
}))

describe('RecommendationEngine', () => {
  let engine: RecommendationEngine

  beforeEach(() => {
    engine = RecommendationEngine.getInstance()
  })

  describe('analyzeUser', () => {
    it('should analyze user with complete profile and calculations', () => {
      const profile: RetirementProfile = {
        id: 'profile1',
        userId: 'user1',
        dateOfBirth: new Date('1970-01-01'),
        membershipDate: new Date('2000-01-01'),
        retirementGroup: '1',
        currentSalary: 80000,
        averageHighest3Years: 75000,
        plannedRetirementAge: 65,
        retirementOption: 'A',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const calculations: RetirementCalculation[] = [
        {
          id: 'calc1',
          userId: 'user1',
          retirementAge: 65,
          yearsOfService: 25,
          averageSalary: 75000,
          monthlyBenefit: 3000,
          annualBenefit: 36000,
          benefitReduction: null,
          socialSecurityData: JSON.stringify({ monthlyBenefit: 2000 }),
          notes: null,
          isFavorite: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      const analysis = engine.analyzeUser(profile, calculations)

      expect(analysis.profile).toBe(profile)
      expect(analysis.calculations).toBe(calculations)
      expect(analysis.currentAge).toBe(54) // 2024 - 1970
      expect(analysis.yearsOfService).toBe(24) // 2024 - 2000
      expect(analysis.retirementReadiness).toBeDefined()
      expect(analysis.missingData).toBeInstanceOf(Array)
      expect(analysis.opportunities).toBeInstanceOf(Array)
      expect(analysis.risks).toBeInstanceOf(Array)
    })

    it('should handle user with no profile', () => {
      const analysis = engine.analyzeUser(null, [])

      expect(analysis.profile).toBeNull()
      expect(analysis.calculations).toEqual([])
      expect(analysis.currentAge).toBe(0)
      expect(analysis.yearsOfService).toBe(0)
      expect(analysis.retirementReadiness).toBe('critical')
      expect(analysis.missingData).toContain('retirement_profile')
    })

    it('should identify missing data correctly', () => {
      const incompleteProfile: RetirementProfile = {
        id: 'profile1',
        userId: 'user1',
        dateOfBirth: new Date('1970-01-01'),
        membershipDate: new Date('2000-01-01'),
        retirementGroup: '1',
        currentSalary: null,
        averageHighest3Years: null,
        plannedRetirementAge: null,
        retirementOption: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const analysis = engine.analyzeUser(incompleteProfile, [])

      expect(analysis.missingData).toContain('average_salary')
      expect(analysis.missingData).toContain('planned_retirement_age')
      expect(analysis.missingData).toContain('retirement_option')
      expect(analysis.missingData).toContain('calculations')
    })

    it('should assess retirement readiness correctly', () => {
      // Test excellent readiness
      const excellentProfile: RetirementProfile = {
        id: 'profile1',
        userId: 'user1',
        dateOfBirth: new Date('1965-01-01'),
        membershipDate: new Date('1990-01-01'),
        retirementGroup: '1',
        currentSalary: 80000,
        averageHighest3Years: 75000,
        plannedRetirementAge: 65,
        retirementOption: 'A',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const recentCalculations: RetirementCalculation[] = [
        {
          id: 'calc1',
          userId: 'user1',
          retirementAge: 65,
          yearsOfService: 35,
          averageSalary: 75000,
          monthlyBenefit: 4500,
          annualBenefit: 54000,
          benefitReduction: null,
          socialSecurityData: JSON.stringify({ monthlyBenefit: 2000 }),
          notes: null,
          isFavorite: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      const analysis = engine.analyzeUser(excellentProfile, recentCalculations)
      expect(analysis.retirementReadiness).toBe('excellent')
    })

    it('should identify opportunities correctly', () => {
      const youngProfile: RetirementProfile = {
        id: 'profile1',
        userId: 'user1',
        dateOfBirth: new Date('1980-01-01'),
        membershipDate: new Date('2010-01-01'),
        retirementGroup: '1',
        currentSalary: 90000,
        averageHighest3Years: 75000,
        plannedRetirementAge: 65,
        retirementOption: 'A',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const analysis = engine.analyzeUser(youngProfile, [])

      expect(analysis.opportunities).toContain('salary_optimization')
      expect(analysis.opportunities).toContain('maximize_benefits')
    })

    it('should identify risks correctly', () => {
      const riskProfile: RetirementProfile = {
        id: 'profile1',
        userId: 'user1',
        dateOfBirth: new Date('1960-01-01'),
        membershipDate: new Date('2015-01-01'),
        retirementGroup: '1',
        currentSalary: 60000,
        averageHighest3Years: 55000,
        plannedRetirementAge: 65,
        retirementOption: 'A',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const analysis = engine.analyzeUser(riskProfile, [])

      expect(analysis.risks).toContain('insufficient_service_credit')
      expect(analysis.risks).toContain('approaching_retirement_no_planning')
    })
  })

  describe('generateRecommendations', () => {
    it('should generate recommendations for user with no profile', () => {
      const analysis = engine.analyzeUser(null, [])
      const context = {
        userId: 'user1',
        analysis,
        existingActionItems: [],
      }

      const recommendations = engine.generateRecommendations(context)

      expect(recommendations.length).toBeGreaterThan(0)
      expect(recommendations.some(r => r.triggerCondition === 'no_profile')).toBe(true)
    })

    it('should generate recommendations for incomplete profile', () => {
      const incompleteProfile: RetirementProfile = {
        id: 'profile1',
        userId: 'user1',
        dateOfBirth: new Date('1970-01-01'),
        membershipDate: new Date('2000-01-01'),
        retirementGroup: '1',
        currentSalary: null,
        averageHighest3Years: null,
        plannedRetirementAge: null,
        retirementOption: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const analysis = engine.analyzeUser(incompleteProfile, [])
      const context = {
        userId: 'user1',
        analysis,
        existingActionItems: [],
      }

      const recommendations = engine.generateRecommendations(context)

      expect(recommendations.some(r => r.triggerCondition === 'incomplete_profile')).toBe(true)
    })

    it('should not generate duplicate recommendations', () => {
      const analysis = engine.analyzeUser(null, [])
      const existingActionItems = [
        {
          id: 'item1',
          title: 'Complete Your Retirement Profile',
          status: 'pending',
        },
      ] as any[]

      const context = {
        userId: 'user1',
        analysis,
        existingActionItems,
      }

      const recommendations = engine.generateRecommendations(context)

      expect(recommendations.every(r => r.title !== 'Complete Your Retirement Profile')).toBe(true)
    })

    it('should prioritize recommendations correctly', () => {
      const analysis = engine.analyzeUser(null, [])
      const context = {
        userId: 'user1',
        analysis,
        existingActionItems: [],
      }

      const recommendations = engine.generateRecommendations(context)

      // High priority items should come first
      const highPriorityIndex = recommendations.findIndex(r => r.priority === 'high')
      const lowPriorityIndex = recommendations.findIndex(r => r.priority === 'low')

      if (highPriorityIndex !== -1 && lowPriorityIndex !== -1) {
        expect(highPriorityIndex).toBeLessThan(lowPriorityIndex)
      }
    })

    it('should generate appropriate recommendations for approaching retirement', () => {
      const approachingRetirementProfile: RetirementProfile = {
        id: 'profile1',
        userId: 'user1',
        dateOfBirth: new Date('1965-01-01'),
        membershipDate: new Date('1990-01-01'),
        retirementGroup: '1',
        currentSalary: 80000,
        averageHighest3Years: 75000,
        plannedRetirementAge: 65,
        retirementOption: 'A',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const analysis = engine.analyzeUser(approachingRetirementProfile, [])
      const context = {
        userId: 'user1',
        analysis,
        existingActionItems: [],
      }

      const recommendations = engine.generateRecommendations(context)

      expect(recommendations.some(r => r.triggerCondition === 'approaching_retirement')).toBe(true)
    })

    it('should generate early retirement recommendations when eligible', () => {
      const earlyRetirementProfile: RetirementProfile = {
        id: 'profile1',
        userId: 'user1',
        dateOfBirth: new Date('1965-01-01'),
        membershipDate: new Date('1985-01-01'),
        retirementGroup: '1',
        currentSalary: 80000,
        averageHighest3Years: 75000,
        plannedRetirementAge: 62,
        retirementOption: 'A',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const analysis = engine.analyzeUser(earlyRetirementProfile, [])
      const context = {
        userId: 'user1',
        analysis,
        existingActionItems: [],
      }

      const recommendations = engine.generateRecommendations(context)

      expect(recommendations.some(r => r.triggerCondition === 'early_retirement_eligible')).toBe(true)
    })
  })

  describe('singleton pattern', () => {
    it('should return the same instance', () => {
      const instance1 = RecommendationEngine.getInstance()
      const instance2 = RecommendationEngine.getInstance()

      expect(instance1).toBe(instance2)
    })
  })

  describe('edge cases', () => {
    it('should handle null dates gracefully', () => {
      const profileWithNullDates: any = {
        id: 'profile1',
        userId: 'user1',
        dateOfBirth: null,
        membershipDate: null,
        retirementGroup: '1',
        currentSalary: 80000,
        averageHighest3Years: 75000,
        plannedRetirementAge: 65,
        retirementOption: 'A',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      expect(() => {
        engine.analyzeUser(profileWithNullDates, [])
      }).not.toThrow()
    })

    it('should handle empty calculations array', () => {
      const profile: RetirementProfile = {
        id: 'profile1',
        userId: 'user1',
        dateOfBirth: new Date('1970-01-01'),
        membershipDate: new Date('2000-01-01'),
        retirementGroup: '1',
        currentSalary: 80000,
        averageHighest3Years: 75000,
        plannedRetirementAge: 65,
        retirementOption: 'A',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const analysis = engine.analyzeUser(profile, [])

      expect(analysis.calculations).toEqual([])
      expect(analysis.missingData).toContain('calculations')
    })

    it('should handle very old calculations', () => {
      const profile: RetirementProfile = {
        id: 'profile1',
        userId: 'user1',
        dateOfBirth: new Date('1970-01-01'),
        membershipDate: new Date('2000-01-01'),
        retirementGroup: '1',
        currentSalary: 80000,
        averageHighest3Years: 75000,
        plannedRetirementAge: 65,
        retirementOption: 'A',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const oldCalculation: RetirementCalculation = {
        id: 'calc1',
        userId: 'user1',
        retirementAge: 65,
        yearsOfService: 25,
        averageSalary: 75000,
        monthlyBenefit: 3000,
        annualBenefit: 36000,
        benefitReduction: null,
        socialSecurityData: null,
        notes: null,
        isFavorite: false,
        createdAt: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000), // 100 days ago
        updatedAt: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000),
      }

      const analysis = engine.analyzeUser(profile, [oldCalculation])

      expect(analysis.risks).toContain('outdated_calculations')
    })
  })
})
