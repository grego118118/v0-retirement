/**
 * Test for the specific user scenario fix
 * Validates that the years of service calculation works correctly
 */

import { calculateRetirementBenefitsProjection, ProjectionParameters } from '../lib/retirement-benefits-projection'

describe('User Scenario Fix - Years of Service Calculation', () => {
  const userScenarioParams: ProjectionParameters = {
    currentAge: 53,
    plannedRetirementAge: 55, // Pension start age
    currentYearsOfService: 31, // Current years of service
    averageSalary: 95000,
    retirementGroup: 'GROUP_2',
    serviceEntry: 'before_2012',
    pensionOption: 'C',
    beneficiaryAge: '53',
    socialSecurityClaimingAge: 67, // Different from pension start age
    socialSecurityFullBenefit: 350 * 12, // $350/month * 12
    projectionEndAge: 70,
    includeCOLA: true,
    colaRate: 0.03
  }

  it('should correctly calculate years of service at pension start age', () => {
    const projection = calculateRetirementBenefitsProjection(userScenarioParams)
    
    // Find the projection for age 55 (pension start age)
    const pensionStartYear = projection.find(p => p.age === 55)
    
    expect(pensionStartYear).toBeDefined()
    if (pensionStartYear) {
      // At age 55, should have 31 (current) + 2 (years until retirement) = 33 years of service
      expect(pensionStartYear.yearsOfService).toBe(33)
    }
  })

  it('should freeze years of service after pension start age', () => {
    const projection = calculateRetirementBenefitsProjection(userScenarioParams)
    
    // Check that years of service remain constant after pension start age
    const postRetirementYears = projection.filter(p => p.age > 55)
    
    postRetirementYears.forEach(year => {
      expect(year.yearsOfService).toBe(33) // Should remain frozen at 33
    })
  })

  it('should handle the two different retirement ages correctly', () => {
    const projection = calculateRetirementBenefitsProjection(userScenarioParams)
    
    // Pension should start at age 55
    const pensionStartYear = projection.find(p => p.age === 55)
    expect(pensionStartYear?.pensionWithOption).toBeGreaterThan(0)
    
    // Social Security should start at age 67
    const beforeSS = projection.find(p => p.age === 66)
    const atSS = projection.find(p => p.age === 67)
    
    if (beforeSS && atSS) {
      expect(beforeSS.socialSecurityAnnual).toBe(0)
      expect(atSS.socialSecurityAnnual).toBeGreaterThan(0)
    }
  })

  it('should show correct progression in the projection table', () => {
    const projection = calculateRetirementBenefitsProjection(userScenarioParams)
    
    // Verify the key ages and their characteristics
    const keyAges = [55, 56, 57, 67, 68]
    
    keyAges.forEach(age => {
      const yearData = projection.find(p => p.age === age)
      if (yearData) {
        // Years of service should be 33 for all ages 55 and above
        expect(yearData.yearsOfService).toBe(33)
        
        // Pension should be active for all ages 55 and above
        expect(yearData.pensionWithOption).toBeGreaterThan(0)
        
        // Social Security should only be active for ages 67 and above
        if (age >= 67) {
          expect(yearData.socialSecurityAnnual).toBeGreaterThan(0)
        } else {
          expect(yearData.socialSecurityAnnual).toBe(0)
        }
      }
    })
  })

  it('should apply COLA correctly to the frozen pension benefit', () => {
    const projection = calculateRetirementBenefitsProjection(userScenarioParams)
    
    // First year should have no COLA
    const firstYear = projection.find(p => p.age === 55)
    expect(firstYear?.colaAdjustment).toBe(0)
    
    // Second year should have COLA applied
    const secondYear = projection.find(p => p.age === 56)
    expect(secondYear?.colaAdjustment).toBeGreaterThan(0)
    
    // Third year should have compounded COLA
    const thirdYear = projection.find(p => p.age === 57)
    if (secondYear && thirdYear) {
      expect(thirdYear.colaAdjustment).toBeGreaterThan(secondYear.colaAdjustment)
    }
  })

  it('should correctly apply Group 2 benefit factors', () => {
    const projection = calculateRetirementBenefitsProjection(userScenarioParams)
    
    // Group 2: 2.0% at age 55, increasing 0.1% per year to 2.5% at age 60
    const age55 = projection.find(p => p.age === 55)
    const age60 = projection.find(p => p.age === 60)
    
    if (age55 && age60) {
      expect(age55.benefitFactor).toBeCloseTo(0.020, 3) // 2.0%
      expect(age60.benefitFactor).toBeCloseTo(0.025, 3) // 2.5%
    }
  })

  it('should apply Option C reduction correctly', () => {
    const projection = calculateRetirementBenefitsProjection(userScenarioParams)
    
    // Compare with Option A to ensure reduction is applied
    const optionAParams = { ...userScenarioParams, pensionOption: 'A' as const }
    const optionAProjection = calculateRetirementBenefitsProjection(optionAParams)
    
    const optionCYear = projection.find(p => p.age === 55)
    const optionAYear = optionAProjection.find(p => p.age === 55)
    
    if (optionCYear && optionAYear) {
      // Option C should result in lower pension than Option A
      expect(optionCYear.pensionWithOption).toBeLessThan(optionAYear.pensionWithOption)
    }
  })
})
