/**
 * Tests for Enhanced Retirement Benefits Projection
 * Validates MSRB methodology, benefit factor progression, COLA calculations, and Social Security integration
 */

import { 
  calculateRetirementBenefitsProjection, 
  getProjectionSummary,
  ProjectionParameters 
} from '../lib/retirement-benefits-projection'

describe('Enhanced Retirement Benefits Projection', () => {
  const baseProjectionParams: ProjectionParameters = {
    currentAge: 55,
    plannedRetirementAge: 60,
    currentYearsOfService: 30,
    averageSalary: 95000,
    retirementGroup: 'GROUP_2',
    serviceEntry: 'before_2012',
    pensionOption: 'A',
    beneficiaryAge: '',
    socialSecurityClaimingAge: 67,
    socialSecurityFullBenefit: 36000, // $3,000/month * 12
    projectionEndAge: 70,
    includeCOLA: true,
    colaRate: 0.03
  }

  describe('Basic Projection Calculation', () => {
    it('should generate projection years from retirement age to end age', () => {
      const projection = calculateRetirementBenefitsProjection(baseProjectionParams)
      
      expect(projection.length).toBeGreaterThan(0)
      expect(projection[0].age).toBe(60) // Starts at retirement age
      expect(projection[projection.length - 1].age).toBeLessThanOrEqual(70) // Ends at or before end age
    })

    it('should calculate years of service progression correctly', () => {
      const projection = calculateRetirementBenefitsProjection(baseProjectionParams)

      // At retirement age (60), should have 35 years of service (30 current + 5 years until retirement)
      const retirementYear = projection.find(p => p.age === 60)
      expect(retirementYear?.yearsOfService).toBe(35)

      // Years of service should be frozen at retirement - they don't continue to accumulate after retirement
      if (projection.length > 1) {
        const secondYear = projection[1]
        expect(secondYear.yearsOfService).toBe(35) // Should remain the same as retirement year
      }
    })

    it('should apply 80% benefit cap correctly', () => {
      const highSalaryParams = {
        ...baseProjectionParams,
        averageSalary: 150000, // High salary to trigger cap
        currentYearsOfService: 35
      }
      
      const projection = calculateRetirementBenefitsProjection(highSalaryParams)
      const cappedYears = projection.filter(p => p.cappedAt80Percent)
      
      expect(cappedYears.length).toBeGreaterThan(0)
      
      // Check that capped pension doesn't exceed 80% of salary
      cappedYears.forEach(year => {
        expect(year.basePensionAfterCap).toBeLessThanOrEqual(highSalaryParams.averageSalary * 0.8)
      })
    })
  })

  describe('Benefit Factor Progression', () => {
    it('should show increasing benefit factors for Group 2 from age 55 to 60', () => {
      const projection = calculateRetirementBenefitsProjection(baseProjectionParams)
      
      // Group 2: 2.0% at age 55, increasing 0.1% per year to 2.5% at age 60
      const age55 = projection.find(p => p.age === 55)
      const age60 = projection.find(p => p.age === 60)
      
      if (age55 && age60) {
        expect(age55.benefitFactor).toBeCloseTo(0.020, 3)
        expect(age60.benefitFactor).toBeCloseTo(0.025, 3)
      }
    })

    it('should handle Group 1 benefit factor progression correctly', () => {
      const group1Params = {
        ...baseProjectionParams,
        retirementGroup: 'GROUP_1',
        plannedRetirementAge: 65,
        currentAge: 60
      }
      
      const projection = calculateRetirementBenefitsProjection(group1Params)
      
      // Group 1: 2.0% at age 60, increasing 0.1% per year to 2.5% at age 65
      const age60 = projection.find(p => p.age === 60)
      const age65 = projection.find(p => p.age === 65)
      
      if (age60 && age65) {
        expect(age60.benefitFactor).toBeCloseTo(0.020, 3)
        expect(age65.benefitFactor).toBeCloseTo(0.025, 3)
      }
    })

    it('should handle Group 3 flat benefit factor correctly', () => {
      const group3Params = {
        ...baseProjectionParams,
        retirementGroup: 'GROUP_3',
        plannedRetirementAge: 55
      }
      
      const projection = calculateRetirementBenefitsProjection(group3Params)
      
      // Group 3: Flat 2.5% for all ages
      projection.forEach(year => {
        expect(year.benefitFactor).toBeCloseTo(0.025, 3)
      })
    })
  })

  describe('COLA Calculations', () => {
    it('should apply Massachusetts COLA methodology correctly', () => {
      const projection = calculateRetirementBenefitsProjection(baseProjectionParams)
      
      // First year should have no COLA
      expect(projection[0].colaAdjustment).toBe(0)
      
      // Second year should have COLA applied
      if (projection.length > 1) {
        const secondYear = projection[1]
        expect(secondYear.colaAdjustment).toBeGreaterThan(0)
        
        // COLA should not exceed $390 (3% of $13,000)
        expect(secondYear.colaAdjustment).toBeLessThanOrEqual(390)
      }
    })

    it('should compound COLA increases year over year', () => {
      const projection = calculateRetirementBenefitsProjection(baseProjectionParams)
      
      if (projection.length >= 3) {
        const year2 = projection[1]
        const year3 = projection[2]
        
        // Year 3 COLA should be greater than Year 2 COLA (compounding effect)
        expect(year3.colaAdjustment).toBeGreaterThan(year2.colaAdjustment)
      }
    })

    it('should handle COLA disabled correctly', () => {
      const noCOLAParams = {
        ...baseProjectionParams,
        includeCOLA: false
      }
      
      const projection = calculateRetirementBenefitsProjection(noCOLAParams)
      
      // All years should have zero COLA adjustment
      projection.forEach(year => {
        expect(year.colaAdjustment).toBe(0)
      })
    })
  })

  describe('Social Security Integration', () => {
    it('should include Social Security benefits starting from claiming age', () => {
      const projection = calculateRetirementBenefitsProjection(baseProjectionParams)
      
      // Before claiming age (67), SS should be 0
      const beforeClaiming = projection.filter(p => p.age < 67)
      beforeClaiming.forEach(year => {
        expect(year.socialSecurityAnnual).toBe(0)
        expect(year.socialSecurityMonthly).toBe(0)
      })
      
      // At and after claiming age, SS should be positive
      const afterClaiming = projection.filter(p => p.age >= 67)
      afterClaiming.forEach(year => {
        expect(year.socialSecurityAnnual).toBeGreaterThan(0)
        expect(year.socialSecurityMonthly).toBeGreaterThan(0)
      })
    })

    it('should apply early claiming reduction correctly', () => {
      const earlyClaimingParams = {
        ...baseProjectionParams,
        socialSecurityClaimingAge: 62
      }
      
      const projection = calculateRetirementBenefitsProjection(earlyClaimingParams)
      const claimingYear = projection.find(p => p.age === 62)
      
      if (claimingYear) {
        // Early claiming should result in reduced benefits (less than full benefit)
        expect(claimingYear.socialSecurityAnnual).toBeLessThan(baseProjectionParams.socialSecurityFullBenefit)
      }
    })

    it('should apply delayed retirement credits correctly', () => {
      const delayedClaimingParams = {
        ...baseProjectionParams,
        socialSecurityClaimingAge: 70
      }
      
      const projection = calculateRetirementBenefitsProjection(delayedClaimingParams)
      const claimingYear = projection.find(p => p.age === 70)
      
      if (claimingYear) {
        // Delayed claiming should result in increased benefits (more than full benefit)
        expect(claimingYear.socialSecurityAnnual).toBeGreaterThan(baseProjectionParams.socialSecurityFullBenefit)
      }
    })
  })

  describe('Pension Options', () => {
    it('should apply Option B reduction correctly', () => {
      const optionBParams = {
        ...baseProjectionParams,
        pensionOption: 'B' as const
      }
      
      const optionAProjection = calculateRetirementBenefitsProjection(baseProjectionParams)
      const optionBProjection = calculateRetirementBenefitsProjection(optionBParams)
      
      // Option B should result in lower pension than Option A
      if (optionAProjection.length > 0 && optionBProjection.length > 0) {
        expect(optionBProjection[0].pensionWithOption).toBeLessThan(optionAProjection[0].pensionWithOption)
      }
    })

    it('should apply Option C reduction correctly', () => {
      const optionCParams = {
        ...baseProjectionParams,
        pensionOption: 'C' as const,
        beneficiaryAge: '58'
      }
      
      const optionAProjection = calculateRetirementBenefitsProjection(baseProjectionParams)
      const optionCProjection = calculateRetirementBenefitsProjection(optionCParams)
      
      // Option C should result in lower pension than Option A
      if (optionAProjection.length > 0 && optionCProjection.length > 0) {
        expect(optionCProjection[0].pensionWithOption).toBeLessThan(optionAProjection[0].pensionWithOption)
      }
    })
  })

  describe('Projection Summary', () => {
    it('should generate accurate summary statistics', () => {
      const projection = calculateRetirementBenefitsProjection(baseProjectionParams)
      const summary = getProjectionSummary(projection)
      
      expect(summary).toBeDefined()
      if (summary) {
        expect(summary.startAge).toBe(projection[0].age)
        expect(summary.endAge).toBe(projection[projection.length - 1].age)
        expect(summary.totalProjectionYears).toBe(projection.length)
        expect(summary.initialMonthlyPension).toBeCloseTo(projection[0].totalPensionMonthly, 2)
        expect(summary.finalMonthlyPension).toBeCloseTo(projection[projection.length - 1].totalPensionMonthly, 2)
      }
    })

    it('should handle empty projection correctly', () => {
      const summary = getProjectionSummary([])
      expect(summary).toBeNull()
    })
  })

  describe('Edge Cases', () => {
    it('should handle minimum retirement age constraints', () => {
      const underageParams = {
        ...baseProjectionParams,
        plannedRetirementAge: 50, // Below Group 2 minimum of 55
        retirementGroup: 'GROUP_2'
      }
      
      const projection = calculateRetirementBenefitsProjection(underageParams)
      
      // Should start at minimum age (55) not planned age (50)
      if (projection.length > 0) {
        expect(projection[0].age).toBeGreaterThanOrEqual(55)
      }
    })

    it('should stop projection when 80% cap is reached and no further increases possible', () => {
      const maxBenefitParams = {
        ...baseProjectionParams,
        averageSalary: 200000,
        currentYearsOfService: 40,
        includeCOLA: false // Disable COLA to test cap stopping condition
      }
      
      const projection = calculateRetirementBenefitsProjection(maxBenefitParams)
      
      // Should stop early when cap is reached and no further progression
      expect(projection.length).toBeLessThan(11) // Less than full 10-year projection
    })
  })
})
