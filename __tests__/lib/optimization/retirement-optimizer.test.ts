/**
 * Comprehensive tests for the Retirement Income Optimization Engine
 */

import { optimizeRetirementStrategy } from '@/lib/optimization/retirement-optimizer'
import { CombinedCalculationData } from '@/lib/wizard/wizard-types'

// Mock data for testing
const mockCalculationData: CombinedCalculationData = {
  personalInfo: {
    birthYear: 1965,
    currentAge: 58,
    retirementGoalAge: 62,
    lifeExpectancy: 85,
    filingStatus: 'married'
  },
  pensionData: {
    yearsOfService: 25,
    averageSalary: 80000,
    retirementGroup: '3',
    benefitPercentage: 2.5,
    retirementOption: 'A',
    retirementDate: '2027-01-01',
    monthlyBenefit: 4000,
    annualBenefit: 48000
  },
  socialSecurityData: {
    fullRetirementAge: 67,
    earlyRetirementBenefit: 1800,
    fullRetirementBenefit: 2400,
    delayedRetirementBenefit: 3000,
    selectedClaimingAge: 67,
    selectedMonthlyBenefit: 2400,
    isMarried: false
  },
  incomeData: {
    totalAnnualIncome: 80000,
    otherRetirementIncome: 6000,
    hasRothIRA: true,
    rothIRABalance: 150000,
    has401k: true,
    traditional401kBalance: 100000,
    estimatedMedicarePremiums: 2000
  },
  preferences: {
    retirementIncomeGoal: 6000
  }
}

describe('Retirement Optimization Engine', () => {
  describe('optimizeRetirementStrategy', () => {
    it('should return a valid optimization result', () => {
      const result = optimizeRetirementStrategy(mockCalculationData)
      
      expect(result).toBeDefined()
      expect(result.recommendedStrategy).toBeDefined()
      expect(result.alternativeScenarios).toHaveLength(3)
      expect(result.breakEvenAnalysis).toBeDefined()
      expect(result.taxOptimization).toBeDefined()
    })

    it('should recommend optimal claiming ages', () => {
      const result = optimizeRetirementStrategy(mockCalculationData)
      
      expect(result.recommendedStrategy.pensionClaimingAge).toBeGreaterThanOrEqual(55)
      expect(result.recommendedStrategy.pensionClaimingAge).toBeLessThanOrEqual(70)
      expect(result.recommendedStrategy.socialSecurityClaimingAge).toBeGreaterThanOrEqual(62)
      expect(result.recommendedStrategy.socialSecurityClaimingAge).toBeLessThanOrEqual(70)
    })

    it('should calculate lifetime benefits correctly', () => {
      const result = optimizeRetirementStrategy(mockCalculationData)
      
      expect(result.recommendedStrategy.totalLifetimeBenefits).toBeGreaterThan(0)
      expect(result.recommendedStrategy.monthlyRetirementIncome).toBeGreaterThan(0)
    })

    it('should include Monte Carlo results when requested', () => {
      const result = optimizeRetirementStrategy(mockCalculationData)
      
      expect(result.monteCarloResults).toBeDefined()
      expect(result.monteCarloResults?.scenarios).toBe(1000)
      expect(result.monteCarloResults?.successRate).toBeGreaterThanOrEqual(0)
      expect(result.monteCarloResults?.successRate).toBeLessThanOrEqual(100)
    })

    it('should not include Monte Carlo results when not requested', () => {
      const dataWithoutMonteCarlo = {
        ...mockCalculationData,
        preferences: {
          ...mockCalculationData.preferences,
          includeMonteCarloAnalysis: false
        }
      }
      
      const result = optimizeRetirementStrategy(dataWithoutMonteCarlo)
      
      expect(result.monteCarloResults).toBeUndefined()
    })
  })

  describe('Group 3 specific optimizations', () => {
    it('should handle Group 3 benefit multiplier correctly', () => {
      const result = optimizeRetirementStrategy(mockCalculationData)
      
      // Group 3 should have 2.5% benefit factor
      expect(result.recommendedStrategy.monthlyRetirementIncome).toBeGreaterThan(3000)
    })

    it('should respect Group 3 early retirement eligibility', () => {
      const result = optimizeRetirementStrategy(mockCalculationData)
      
      // Group 3 can retire at 55 with 20+ years
      expect(result.recommendedStrategy.pensionClaimingAge).toBeGreaterThanOrEqual(55)
    })
  })

  describe('Performance requirements', () => {
    it('should complete optimization within 2 seconds', () => {
      const startTime = Date.now()
      
      optimizeRetirementStrategy(mockCalculationData)
      
      const endTime = Date.now()
      const executionTime = endTime - startTime
      
      expect(executionTime).toBeLessThan(2000) // 2 seconds
    })

    it('should handle Monte Carlo simulation efficiently', () => {
      const startTime = Date.now()
      
      const result = optimizeRetirementStrategy(mockCalculationData)
      
      const endTime = Date.now()
      const executionTime = endTime - startTime
      
      expect(executionTime).toBeLessThan(2000) // 2 seconds even with Monte Carlo
      expect(result.monteCarloResults?.scenarios).toBe(1000)
    })
  })

  describe('Edge cases', () => {
    it('should handle very young retirement age', () => {
      const youngRetirementData = {
        ...mockCalculationData,
        personalInfo: {
          ...mockCalculationData.personalInfo,
          currentAge: 50,
          retirementGoalAge: 55
        }
      }
      
      const result = optimizeRetirementStrategy(youngRetirementData)
      
      expect(result.recommendedStrategy).toBeDefined()
      expect(result.recommendedStrategy.pensionClaimingAge).toBeGreaterThanOrEqual(55)
    })

    it('should handle high income goals', () => {
      const highIncomeData = {
        ...mockCalculationData,
        preferences: {
          ...mockCalculationData.preferences,
          retirementIncomeGoal: 15000
        }
      }
      
      const result = optimizeRetirementStrategy(highIncomeData)
      
      expect(result.recommendedStrategy).toBeDefined()
      // Should recommend delaying benefits for higher income
      expect(result.recommendedStrategy.socialSecurityClaimingAge).toBeGreaterThanOrEqual(67)
    })

    it('should handle married couples', () => {
      const marriedData = {
        ...mockCalculationData,
        socialSecurityData: {
          ...mockCalculationData.socialSecurityData,
          isMarried: true,
          spouseFullRetirementBenefit: 1800,
          spouseFullRetirementAge: 67,
          spouseBirthYear: 1960
        }
      }
      
      const result = optimizeRetirementStrategy(marriedData)
      
      expect(result.recommendedStrategy).toBeDefined()
      expect(result.recommendedStrategy.monthlyRetirementIncome).toBeGreaterThan(
        mockCalculationData.socialSecurityData.selectedMonthlyBenefit + 
        mockCalculationData.pensionData.monthlyBenefit
      )
    })
  })
})
