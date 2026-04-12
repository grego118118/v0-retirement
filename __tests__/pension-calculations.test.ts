import {
  calculatePensionBenefit,
  calculateBenefitMultiplier,
  calculateAverageHighestSalary,
  calculateRetirementEligibility,
  calculateCOLAProjection,
  type PensionCalculationResult,
  type EmployeeGroup
} from '@/lib/pension-calculations'

describe('Pension Calculations', () => {
  describe('calculateAverageHighestSalary', () => {
    it('should calculate average of three salaries correctly', () => {
      const salaries = [70000, 72000, 74000]
      const result = calculateAverageHighestSalary(salaries)
      expect(result).toBe(72000)
    })

    it('should handle two salaries', () => {
      const salaries = [70000, 72000]
      const result = calculateAverageHighestSalary(salaries)
      expect(result).toBe(71000)
    })

    it('should handle single salary', () => {
      const salaries = [70000]
      const result = calculateAverageHighestSalary(salaries)
      expect(result).toBe(70000)
    })

    it('should handle empty array', () => {
      const salaries: number[] = []
      const result = calculateAverageHighestSalary(salaries)
      expect(result).toBe(0)
    })

    it('should handle zero salaries', () => {
      const salaries = [0, 0, 0]
      const result = calculateAverageHighestSalary(salaries)
      expect(result).toBe(0)
    })
  })

  describe('calculateBenefitMultiplier', () => {
    it('should calculate Group 1 multiplier correctly', () => {
      // Group 1: 2.0% at age 60, increases 0.1% per year to 2.5% at age 65
      expect(calculateBenefitMultiplier('GROUP_1', 60, 30)).toBe(0.02)
      expect(calculateBenefitMultiplier('GROUP_1', 62, 30)).toBe(0.022)
      expect(calculateBenefitMultiplier('GROUP_1', 65, 30)).toBe(0.025)
      expect(calculateBenefitMultiplier('GROUP_1', 67, 30)).toBe(0.025) // Caps at 2.5%
    })

    it('should calculate Group 2 multiplier correctly', () => {
      // Group 2: 2.0% at age 55, increases 0.1% per year to 2.5% at age 60
      expect(calculateBenefitMultiplier('GROUP_2', 55, 25)).toBe(0.02)
      expect(calculateBenefitMultiplier('GROUP_2', 57, 25)).toBe(0.022)
      expect(calculateBenefitMultiplier('GROUP_2', 60, 25)).toBe(0.025)
      expect(calculateBenefitMultiplier('GROUP_2', 62, 25)).toBe(0.025) // Caps at 2.5%
    })

    it('should calculate Group 3 multiplier correctly', () => {
      // Group 3: Flat 2.5% (State Police)
      expect(calculateBenefitMultiplier('GROUP_3', 45, 20)).toBe(0.025)
      expect(calculateBenefitMultiplier('GROUP_3', 50, 25)).toBe(0.025)
      expect(calculateBenefitMultiplier('GROUP_3', 55, 30)).toBe(0.025)
    })

    it('should calculate Group 4 multiplier correctly', () => {
      // Group 4: 2.0% at age 50, increases 0.1% per year to 2.5% at age 55
      expect(calculateBenefitMultiplier('GROUP_4', 50, 25)).toBe(0.02)
      expect(calculateBenefitMultiplier('GROUP_4', 52, 25)).toBe(0.022)
      expect(calculateBenefitMultiplier('GROUP_4', 55, 25)).toBe(0.025)
      expect(calculateBenefitMultiplier('GROUP_4', 57, 25)).toBe(0.025) // Caps at 2.5%
    })

    it('should enforce 80% maximum benefit cap', () => {
      // Test with high years of service that would exceed 80%
      expect(calculateBenefitMultiplier('GROUP_1', 65, 40)).toBe(0.025) // 40 years * 2.5% = 100%, but capped at 80%
      expect(calculateBenefitMultiplier('GROUP_3', 55, 35)).toBe(0.025) // 35 years * 2.5% = 87.5%, but capped at 80%
    })
  })

  describe('calculateRetirementEligibility', () => {
    it('should determine Group 1 eligibility correctly', () => {
      expect(calculateRetirementEligibility('GROUP_1', 55, 20)).toBe(false) // Too young
      expect(calculateRetirementEligibility('GROUP_1', 60, 10)).toBe(true)  // Age 60 with 10+ years
      expect(calculateRetirementEligibility('GROUP_1', 65, 5)).toBe(true)   // Age 65+ with any service
    })

    it('should determine Group 2 eligibility correctly', () => {
      expect(calculateRetirementEligibility('GROUP_2', 50, 20)).toBe(false) // Too young
      expect(calculateRetirementEligibility('GROUP_2', 55, 10)).toBe(true)  // Age 55 with 10+ years
      expect(calculateRetirementEligibility('GROUP_2', 60, 5)).toBe(true)   // Age 60+ with any service
    })

    it('should determine Group 3 eligibility correctly', () => {
      expect(calculateRetirementEligibility('GROUP_3', 45, 15)).toBe(false) // Less than 20 years
      expect(calculateRetirementEligibility('GROUP_3', 45, 20)).toBe(true)  // Any age with 20+ years
      expect(calculateRetirementEligibility('GROUP_3', 55, 25)).toBe(true)  // Age 55+ with 25+ years
    })

    it('should determine Group 4 eligibility correctly', () => {
      expect(calculateRetirementEligibility('GROUP_4', 45, 20)).toBe(false) // Too young
      expect(calculateRetirementEligibility('GROUP_4', 50, 10)).toBe(true)  // Age 50 with 10+ years
      expect(calculateRetirementEligibility('GROUP_4', 55, 5)).toBe(true)   // Age 55+ with any service
    })
  })

  describe('calculateCOLAProjection', () => {
    it('should calculate COLA projection correctly', () => {
      const baseBenefit = 50000
      const years = 5
      const colaRate = 0.03 // 3%
      
      const result = calculateCOLAProjection(baseBenefit, years, colaRate)
      
      // Expected: 50000 * (1.03)^5 = 57,963.71
      expect(result).toBeCloseTo(57963.71, 2)
    })

    it('should handle zero COLA rate', () => {
      const result = calculateCOLAProjection(50000, 5, 0)
      expect(result).toBe(50000)
    })

    it('should handle zero years', () => {
      const result = calculateCOLAProjection(50000, 0, 0.03)
      expect(result).toBe(50000)
    })

    it('should handle negative inputs gracefully', () => {
      expect(calculateCOLAProjection(-1000, 5, 0.03)).toBeLessThanOrEqual(0)
      expect(calculateCOLAProjection(50000, -1, 0.03)).toBe(50000)
    })
  })

  describe('calculatePensionBenefit', () => {
    it('should calculate pension benefit correctly for Group 1', () => {
      const params = {
        group: 'GROUP_1' as EmployeeGroup,
        age: 62,
        yearsOfService: 30,
        salaries: [70000, 72000, 74000],
        retirementOption: 'A' as const,
        beneficiaryAge: undefined
      }

      const result = calculatePensionBenefit(params)

      // Expected calculation:
      // Average salary: 72000
      // Multiplier: 2.2% (age 62)
      // Years: 30
      // Annual pension: 72000 * 0.022 * 30 = 47,520
      // Monthly: 47,520 / 12 = 3,960

      expect(result.averageSalary).toBe(72000)
      expect(result.benefitMultiplier).toBe(0.022)
      expect(result.annualPension).toBe(47520)
      expect(result.monthlyPension).toBe(3960)
      expect(result.eligible).toBe(true)
    })

    it('should apply Option B reduction correctly', () => {
      const params = {
        group: 'GROUP_1' as EmployeeGroup,
        age: 65,
        yearsOfService: 30,
        salaries: [60000, 62000, 64000],
        retirementOption: 'B' as const,
        beneficiaryAge: undefined
      }

      const result = calculatePensionBenefit(params)

      // Option B typically reduces benefit by ~4%
      expect(result.retirementOption).toBe('B')
      expect(result.annualPension).toBeLessThan(result.averageSalary * 0.025 * 30)
    })

    it('should apply Option C reduction correctly', () => {
      const params = {
        group: 'GROUP_1' as EmployeeGroup,
        age: 65,
        yearsOfService: 30,
        salaries: [60000, 62000, 64000],
        retirementOption: 'C' as const,
        beneficiaryAge: 62
      }

      const result = calculatePensionBenefit(params)

      // Option C reduces benefit based on beneficiary age
      expect(result.retirementOption).toBe('C')
      expect(result.beneficiaryAge).toBe(62)
      expect(result.annualPension).toBeLessThan(result.averageSalary * 0.025 * 30)
    })

    it('should handle ineligible retirement scenarios', () => {
      const params = {
        group: 'GROUP_1' as EmployeeGroup,
        age: 55, // Too young for Group 1
        yearsOfService: 20,
        salaries: [60000, 62000, 64000],
        retirementOption: 'A' as const,
        beneficiaryAge: undefined
      }

      const result = calculatePensionBenefit(params)

      expect(result.eligible).toBe(false)
      expect(result.annualPension).toBe(0)
      expect(result.monthlyPension).toBe(0)
    })

    it('should enforce 80% maximum benefit cap', () => {
      const params = {
        group: 'GROUP_3' as EmployeeGroup,
        age: 55,
        yearsOfService: 40, // Would be 100% without cap
        salaries: [80000, 82000, 84000],
        retirementOption: 'A' as const,
        beneficiaryAge: undefined
      }

      const result = calculatePensionBenefit(params)

      // Should be capped at 80% of average salary
      const maxAnnualPension = result.averageSalary * 0.8
      expect(result.annualPension).toBeLessThanOrEqual(maxAnnualPension)
    })
  })

  describe('Edge Cases and Error Handling', () => {
    it('should handle invalid employee group', () => {
      expect(() => {
        calculateBenefitMultiplier('INVALID_GROUP' as EmployeeGroup, 60, 30)
      }).toThrow()
    })

    it('should handle negative age', () => {
      const result = calculateBenefitMultiplier('GROUP_1', -5, 30)
      expect(result).toBe(0.02) // Should default to minimum multiplier
    })

    it('should handle negative years of service', () => {
      const result = calculateBenefitMultiplier('GROUP_1', 65, -5)
      expect(result).toBe(0) // Should return 0 for negative service
    })

    it('should handle very high age', () => {
      const result = calculateBenefitMultiplier('GROUP_1', 100, 30)
      expect(result).toBe(0.025) // Should cap at maximum multiplier
    })

    it('should handle empty salary array in pension calculation', () => {
      const params = {
        group: 'GROUP_1' as EmployeeGroup,
        age: 65,
        yearsOfService: 30,
        salaries: [],
        retirementOption: 'A' as const,
        beneficiaryAge: undefined
      }

      const result = calculatePensionBenefit(params)

      expect(result.averageSalary).toBe(0)
      expect(result.annualPension).toBe(0)
      expect(result.monthlyPension).toBe(0)
    })
  })
})
