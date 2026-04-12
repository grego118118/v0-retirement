import {
  calculatePensionBenefit,
  calculateBenefitMultiplier,
  calculateAverageHighestSalary,
  calculateRetirementEligibility,
  calculateCOLAProjection
} from '@/lib/pension-calculations'

import {
  calculateSocialSecurityBenefit,
  calculateSpousalBenefit,
  calculateCOLAAdjustment,
  calculateMedicarePremium,
  calculateDelayedRetirementCredits
} from '@/lib/social-security-calculations'

import {
  calculateRetirementTaxes,
  calculateFederalTax,
  calculateMassachusettsTax,
  calculateSocialSecurityTax
} from '@/lib/tax-calculations'

describe('Calculation Performance Tests', () => {
  const PERFORMANCE_THRESHOLD = 100 // 100ms for calculations
  const BULK_OPERATIONS_THRESHOLD = 500 // 500ms for bulk operations

  describe('Pension Calculation Performance', () => {
    it('should calculate pension benefits within performance threshold', () => {
      const startTime = performance.now()

      const params = {
        group: 'GROUP_1' as const,
        age: 62,
        yearsOfService: 30,
        salaries: [70000, 72000, 74000],
        retirementOption: 'A' as const,
        beneficiaryAge: undefined
      }

      const result = calculatePensionBenefit(params)
      const endTime = performance.now()
      const executionTime = endTime - startTime

      expect(executionTime).toBeLessThan(PERFORMANCE_THRESHOLD)
      expect(result).toBeDefined()
      expect(result.annualPension).toBeGreaterThan(0)
    })

    it('should calculate benefit multipliers quickly', () => {
      const startTime = performance.now()

      // Test multiple calculations
      for (let i = 0; i < 100; i++) {
        calculateBenefitMultiplier('GROUP_1', 60 + i % 10, 20 + i % 20)
        calculateBenefitMultiplier('GROUP_2', 55 + i % 10, 20 + i % 20)
        calculateBenefitMultiplier('GROUP_3', 45 + i % 15, 20 + i % 20)
        calculateBenefitMultiplier('GROUP_4', 50 + i % 10, 20 + i % 20)
      }

      const endTime = performance.now()
      const executionTime = endTime - startTime

      expect(executionTime).toBeLessThan(BULK_OPERATIONS_THRESHOLD)
    })

    it('should calculate average salary efficiently', () => {
      const startTime = performance.now()

      // Test with various salary arrays
      for (let i = 0; i < 1000; i++) {
        const salaries = [50000 + i, 52000 + i, 54000 + i]
        calculateAverageHighestSalary(salaries)
      }

      const endTime = performance.now()
      const executionTime = endTime - startTime

      expect(executionTime).toBeLessThan(PERFORMANCE_THRESHOLD)
    })

    it('should check retirement eligibility quickly', () => {
      const startTime = performance.now()

      // Test eligibility for all groups and various scenarios
      const groups = ['GROUP_1', 'GROUP_2', 'GROUP_3', 'GROUP_4'] as const
      
      for (let i = 0; i < 100; i++) {
        groups.forEach(group => {
          calculateRetirementEligibility(group, 50 + i % 20, 10 + i % 30)
        })
      }

      const endTime = performance.now()
      const executionTime = endTime - startTime

      expect(executionTime).toBeLessThan(PERFORMANCE_THRESHOLD)
    })

    it('should calculate COLA projections efficiently', () => {
      const startTime = performance.now()

      // Test various COLA scenarios
      for (let i = 0; i < 100; i++) {
        calculateCOLAProjection(50000 + i * 1000, i % 30, 0.02 + (i % 5) * 0.01)
      }

      const endTime = performance.now()
      const executionTime = endTime - startTime

      expect(executionTime).toBeLessThan(PERFORMANCE_THRESHOLD)
    })
  })

  describe('Social Security Calculation Performance', () => {
    it('should calculate Social Security benefits within threshold', () => {
      const startTime = performance.now()

      const params = {
        birthYear: 1960,
        retirementAge: 67,
        averageIndexedMonthlyEarnings: 5000,
        earningsRecord: []
      }

      const result = calculateSocialSecurityBenefit(params)
      const endTime = performance.now()
      const executionTime = endTime - startTime

      expect(executionTime).toBeLessThan(PERFORMANCE_THRESHOLD)
      expect(result).toBeDefined()
      expect(result.monthlyBenefit).toBeGreaterThan(0)
    })

    it('should calculate spousal benefits quickly', () => {
      const startTime = performance.now()

      // Test multiple spousal benefit calculations
      for (let i = 0; i < 1000; i++) {
        calculateSpousalBenefit(2000 + i, 800 + i)
      }

      const endTime = performance.now()
      const executionTime = endTime - startTime

      expect(executionTime).toBeLessThan(PERFORMANCE_THRESHOLD)
    })

    it('should calculate COLA adjustments efficiently', () => {
      const startTime = performance.now()

      // Test various COLA scenarios
      for (let i = 0; i < 1000; i++) {
        calculateCOLAAdjustment(2000 + i, i % 30, 0.025)
      }

      const endTime = performance.now()
      const executionTime = endTime - startTime

      expect(executionTime).toBeLessThan(PERFORMANCE_THRESHOLD)
    })

    it('should calculate Medicare premiums quickly', () => {
      const startTime = performance.now()

      // Test various income levels
      for (let i = 0; i < 100; i++) {
        calculateMedicarePremium(50000 + i * 5000)
      }

      const endTime = performance.now()
      const executionTime = endTime - startTime

      expect(executionTime).toBeLessThan(PERFORMANCE_THRESHOLD)
    })

    it('should calculate delayed retirement credits efficiently', () => {
      const startTime = performance.now()

      // Test various scenarios
      for (let i = 0; i < 100; i++) {
        calculateDelayedRetirementCredits(67, 70, 2000 + i * 100)
      }

      const endTime = performance.now()
      const executionTime = endTime - startTime

      expect(executionTime).toBeLessThan(PERFORMANCE_THRESHOLD)
    })
  })

  describe('Tax Calculation Performance', () => {
    it('should calculate comprehensive retirement taxes within threshold', () => {
      const startTime = performance.now()

      const result = calculateRetirementTaxes(60000, 25000, 5000, 'single', false)
      const endTime = performance.now()
      const executionTime = endTime - startTime

      expect(executionTime).toBeLessThan(PERFORMANCE_THRESHOLD)
      expect(result).toBeDefined()
      expect(result.totalTax).toBeGreaterThan(0)
    })

    it('should calculate federal taxes efficiently', () => {
      const startTime = performance.now()

      const filingStatuses = ['single', 'marriedFilingJointly', 'marriedFilingSeparately', 'headOfHousehold'] as const

      // Test various income levels and filing statuses
      for (let i = 0; i < 100; i++) {
        filingStatuses.forEach(status => {
          calculateFederalTax(50000 + i * 1000, status)
        })
      }

      const endTime = performance.now()
      const executionTime = endTime - startTime

      expect(executionTime).toBeLessThan(BULK_OPERATIONS_THRESHOLD)
    })

    it('should calculate Massachusetts taxes quickly', () => {
      const startTime = performance.now()

      // Test various scenarios
      for (let i = 0; i < 1000; i++) {
        calculateMassachusettsTax(50000 + i * 100, 'single', i % 2 === 0)
      }

      const endTime = performance.now()
      const executionTime = endTime - startTime

      expect(executionTime).toBeLessThan(PERFORMANCE_THRESHOLD)
    })

    it('should calculate Social Security taxation efficiently', () => {
      const startTime = performance.now()

      // Test various income combinations
      for (let i = 0; i < 100; i++) {
        calculateSocialSecurityTax(20000 + i * 100, 30000 + i * 200, 'single')
        calculateSocialSecurityTax(25000 + i * 100, 40000 + i * 200, 'marriedFilingJointly')
      }

      const endTime = performance.now()
      const executionTime = endTime - startTime

      expect(executionTime).toBeLessThan(PERFORMANCE_THRESHOLD)
    })
  })

  describe('Combined Calculation Performance', () => {
    it('should handle complete retirement calculation workflow within threshold', () => {
      const startTime = performance.now()

      // Simulate complete calculation workflow
      const pensionParams = {
        group: 'GROUP_1' as const,
        age: 62,
        yearsOfService: 30,
        salaries: [70000, 72000, 74000],
        retirementOption: 'A' as const,
        beneficiaryAge: undefined
      }

      const ssParams = {
        birthYear: 1960,
        retirementAge: 67,
        averageIndexedMonthlyEarnings: 5000,
        earningsRecord: []
      }

      // Calculate pension
      const pensionResult = calculatePensionBenefit(pensionParams)
      
      // Calculate Social Security
      const ssResult = calculateSocialSecurityBenefit(ssParams)
      
      // Calculate taxes
      const taxResult = calculateRetirementTaxes(
        pensionResult.annualPension,
        ssResult.annualBenefit,
        0,
        'single',
        false
      )

      // Calculate spousal benefits
      const spousalResult = calculateSpousalBenefit(ssResult.monthlyBenefit, 800)

      // Calculate Medicare premiums
      const medicareResult = calculateMedicarePremium(pensionResult.annualPension + ssResult.annualBenefit)

      const endTime = performance.now()
      const executionTime = endTime - startTime

      expect(executionTime).toBeLessThan(PERFORMANCE_THRESHOLD)
      expect(pensionResult).toBeDefined()
      expect(ssResult).toBeDefined()
      expect(taxResult).toBeDefined()
      expect(spousalResult).toBeDefined()
      expect(medicareResult).toBeDefined()
    })

    it('should handle bulk calculations for scenario analysis', () => {
      const startTime = performance.now()

      // Simulate calculating multiple retirement scenarios
      for (let age = 60; age <= 70; age++) {
        for (let years = 20; years <= 35; years += 5) {
          const pensionParams = {
            group: 'GROUP_1' as const,
            age,
            yearsOfService: years,
            salaries: [60000, 62000, 64000],
            retirementOption: 'A' as const,
            beneficiaryAge: undefined
          }

          const ssParams = {
            birthYear: 1960,
            retirementAge: age,
            averageIndexedMonthlyEarnings: 4000,
            earningsRecord: []
          }

          const pensionResult = calculatePensionBenefit(pensionParams)
          const ssResult = calculateSocialSecurityBenefit(ssParams)
          
          if (pensionResult.eligible && ssResult.eligible) {
            calculateRetirementTaxes(
              pensionResult.annualPension,
              ssResult.annualBenefit,
              0,
              'single',
              false
            )
          }
        }
      }

      const endTime = performance.now()
      const executionTime = endTime - startTime

      expect(executionTime).toBeLessThan(2000) // 2 seconds for bulk scenario analysis
    })
  })

  describe('Memory Usage and Efficiency', () => {
    it('should not create memory leaks during repeated calculations', () => {
      const initialMemory = process.memoryUsage().heapUsed

      // Perform many calculations
      for (let i = 0; i < 1000; i++) {
        const pensionParams = {
          group: 'GROUP_1' as const,
          age: 62,
          yearsOfService: 30,
          salaries: [70000 + i, 72000 + i, 74000 + i],
          retirementOption: 'A' as const,
          beneficiaryAge: undefined
        }

        calculatePensionBenefit(pensionParams)
        
        calculateRetirementTaxes(50000 + i, 20000 + i, 0, 'single', false)
      }

      // Force garbage collection if available
      if (global.gc) {
        global.gc()
      }

      const finalMemory = process.memoryUsage().heapUsed
      const memoryIncrease = finalMemory - initialMemory

      // Memory increase should be reasonable (less than 50MB)
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024)
    })

    it('should handle edge cases efficiently', () => {
      const startTime = performance.now()

      // Test edge cases that might cause performance issues
      const edgeCases = [
        { pension: 0, ss: 0, other: 0 },
        { pension: 1000000, ss: 50000, other: 100000 },
        { pension: -1000, ss: -500, other: -200 },
        { pension: 0.01, ss: 0.01, other: 0.01 }
      ]

      edgeCases.forEach(testCase => {
        try {
          calculateRetirementTaxes(testCase.pension, testCase.ss, testCase.other, 'single', false)
        } catch (error) {
          // Edge cases might throw errors, but shouldn't hang
        }
      })

      const endTime = performance.now()
      const executionTime = endTime - startTime

      expect(executionTime).toBeLessThan(PERFORMANCE_THRESHOLD)
    })
  })
})
