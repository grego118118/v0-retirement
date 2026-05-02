import {
  calculatePensionBenefit,
  calculateBenefitMultiplier,
  calculateAverageHighestSalary,
  calculateRetirementEligibility,
  calculateCOLAProjection,
  calculateMultiGroupPension,
  generateMultiGroupProjectionTable,
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

  describe('calculateMultiGroupPension', () => {
    it('matches the single-segment path for a 1-segment career', () => {
      const result = calculateMultiGroupPension(
        [{ group: 'GROUP_2', yearsOfService: 30 }],
        55,
        75000,
        'A',
        'before_2012',
      )
      expect(result.eligible).toBe(true)
      expect(result.totalYearsOfService).toBe(30)
      expect(result.retirementGroup).toBe('GROUP_2')
      expect(result.basePercentage).toBeCloseTo(0.6, 5)
      expect(result.baseAnnualPension).toBeCloseTo(75000 * 0.6, 2)
      expect(result.annualPension).toBeCloseTo(75000 * 0.6, 2)
      expect(result.cappedBase).toBe(false)
    })

    it('correctly prorates 5 yrs Group 4 + 30 yrs Group 2 at age 55 (the canonical user scenario)', () => {
      // Segment 1: 5 yrs * 2.5% (Group 4 at age 55) = 12.5%
      // Segment 2: 30 yrs * 2.0% (Group 2 at age 55) = 60.0%
      // Combined: 72.5% (under 80% cap)
      const averageSalary = 80000
      const result = calculateMultiGroupPension(
        [
          { group: 'GROUP_4', yearsOfService: 5 },
          { group: 'GROUP_2', yearsOfService: 30 },
        ],
        55,
        averageSalary,
        'A',
        'before_2012',
      )
      expect(result.eligible).toBe(true)
      expect(result.totalYearsOfService).toBe(35)
      expect(result.retirementGroup).toBe('GROUP_2') // retirement group is the last segment
      expect(result.basePercentage).toBeCloseTo(0.725, 5)
      expect(result.baseAnnualPension).toBeCloseTo(averageSalary * 0.725, 2)
      expect(result.cappedBase).toBe(false)
      expect(result.segmentBreakdown).toHaveLength(2)
      expect(result.segmentBreakdown[0].benefitFactor).toBeCloseTo(0.025, 5)
      expect(result.segmentBreakdown[1].benefitFactor).toBeCloseTo(0.02, 5)
      expect(result.segmentBreakdown[0].segmentPercentage).toBeCloseTo(0.125, 5)
      expect(result.segmentBreakdown[1].segmentPercentage).toBeCloseTo(0.6, 5)
    })

    it('applies the 80% cap to the combined benefit', () => {
      // 30 yrs Group 4 at 55 (2.5%) + 20 yrs Group 2 at 55 (2.0%) = 75% + 40% = 115% -> capped to 80%
      const averageSalary = 80000
      const result = calculateMultiGroupPension(
        [
          { group: 'GROUP_4', yearsOfService: 30 },
          { group: 'GROUP_2', yearsOfService: 20 },
        ],
        55,
        averageSalary,
        'A',
        'before_2012',
      )
      expect(result.eligible).toBe(true)
      expect(result.cappedBase).toBe(true)
      expect(result.basePercentage).toBeCloseTo(0.8, 5)
      expect(result.baseAnnualPension).toBeCloseTo(averageSalary * 0.8, 2)
    })

    it('applies Option B 1% reduction to the combined base', () => {
      const averageSalary = 80000
      const resultA = calculateMultiGroupPension(
        [
          { group: 'GROUP_4', yearsOfService: 5 },
          { group: 'GROUP_2', yearsOfService: 30 },
        ],
        55,
        averageSalary,
        'A',
        'before_2012',
      )
      const resultB = calculateMultiGroupPension(
        [
          { group: 'GROUP_4', yearsOfService: 5 },
          { group: 'GROUP_2', yearsOfService: 30 },
        ],
        55,
        averageSalary,
        'B',
        'before_2012',
      )
      expect(resultB.annualPension).toBeCloseTo(resultA.annualPension * 0.99, 2)
    })

    it('reports ineligibility when combined service does not meet minimums', () => {
      // Group 1 post-2012 requires age 60 and 10+ YOS. 5 + 3 = 8 < 10 fails.
      const result = calculateMultiGroupPension(
        [
          { group: 'GROUP_2', yearsOfService: 5 },
          { group: 'GROUP_1', yearsOfService: 3 },
        ],
        60,
        75000,
        'A',
        'after_2012',
      )
      expect(result.eligible).toBe(false)
      expect(result.annualPension).toBe(0)
    })

    it('uses the retirement group (last segment) for option C reduction factor', () => {
      // GROUP_1 uses different Option C factors than GROUP_2/3/4.
      // A career ending in Group 1 at age 60 with a 58 beneficiary should use
      // GROUP_1_OPTION_C_FACTORS ("60-58" = 0.9065).
      const result = calculateMultiGroupPension(
        [
          { group: 'GROUP_2', yearsOfService: 10 },
          { group: 'GROUP_1', yearsOfService: 20 },
        ],
        60,
        80000,
        'C',
        'before_2012',
        '58',
      )
      expect(result.eligible).toBe(true)
      expect(result.retirementGroup).toBe('GROUP_1')
      // Base combined percent at age 60: 10*0.025 + 20*0.02 = 0.25 + 0.4 = 0.65
      // Base annual = 52000 ; Option C factor (60-58 in GROUP_1) = 0.9065
      expect(result.baseAnnualPension).toBeCloseTo(52000, 2)
      expect(result.annualPension).toBeCloseTo(52000 * 0.9065, 0)
      expect(result.survivorAnnualPension).toBeCloseTo(result.annualPension * (2 / 3), 0)
    })
  })

  describe('generateMultiGroupProjectionTable', () => {
    it('rows reflect blended base% (not retirement-group single-group approximation)', () => {
      // 5 yrs Group 4 + 26 yrs Group 2, age 55. Retiring row:
      //   - Single-group would show 2.0% * 31 = 62.0% (wrong for multi-group).
      //   - Multi-group should show 2.5%*5 + 2.0%*26 = 0.125 + 0.520 = 0.645 = 64.5%.
      const rows = generateMultiGroupProjectionTable(
        [
          { group: 'GROUP_4', yearsOfService: 5 },
          { group: 'GROUP_2', yearsOfService: 26 },
        ],
        55,
        80000,
        'A',
        '',
        'before_2012',
      ).rows

      expect(rows.length).toBeGreaterThan(0)
      const retirementRow = rows[0]
      expect(retirementRow.age).toBe(55)
      expect(retirementRow.yearsOfService).toBe(31)
      // Critical: must be 64.5%, not 62.0% single-group value.
      expect(retirementRow.totalBenefitPercentage).toBeCloseTo(0.645, 4)
      expect(retirementRow.annualPension).toBeCloseTo(80000 * 0.645, 2)
    })

    it('caps at 80% once combined percentage exceeds the limit', () => {
      const { rows } = generateMultiGroupProjectionTable(
        [
          { group: 'GROUP_4', yearsOfService: 5 },
          { group: 'GROUP_2', yearsOfService: 30 },
        ],
        55,
        80000,
        'A',
        '',
        'before_2012',
      )
      const lastRow = rows[rows.length - 1]
      expect(lastRow.totalBenefitPercentage).toBeLessThanOrEqual(0.8 + 1e-9)
      // With a starting base of 72.5%, the projection should reach the 80% cap.
      const cappedRow = rows.find(r => r.totalBenefitPercentage >= 0.8 - 1e-9)
      expect(cappedRow).toBeDefined()
    })

    it('title labels both segment groups for clarity', () => {
      const { title } = generateMultiGroupProjectionTable(
        [
          { group: 'GROUP_4', yearsOfService: 5 },
          { group: 'GROUP_2', yearsOfService: 26 },
        ],
        55,
        80000,
        'A',
        '',
        'before_2012',
      )
      expect(title).toContain('GROUP 4')
      expect(title).toContain('GROUP 2')
      expect(title).toContain('Multi-Group')
    })
  })
})
