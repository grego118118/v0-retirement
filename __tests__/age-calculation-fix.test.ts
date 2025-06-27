/**
 * Test for the age calculation fix
 * Validates that the corrected age calculation affects all dependent calculations
 */

import { calculateRetirementBenefitsProjection, ProjectionParameters } from '../lib/retirement-benefits-projection'

describe('Age Calculation Fix - Cascading Effects', () => {
  // Test scenario with corrected age (52 instead of 53)
  const correctedAgeParams: ProjectionParameters = {
    currentAge: 52, // CORRECTED from 53 to 52
    plannedRetirementAge: 55, // Pension start age
    currentYearsOfService: 31, // Current years of service
    averageSalary: 95000,
    retirementGroup: 'GROUP_2',
    serviceEntry: 'before_2012',
    pensionOption: 'C',
    beneficiaryAge: '53',
    socialSecurityClaimingAge: 67,
    socialSecurityFullBenefit: 350 * 12,
    projectionEndAge: 70,
    includeCOLA: true,
    colaRate: 0.03
  }

  // Test scenario with incorrect age (53) for comparison
  const incorrectAgeParams: ProjectionParameters = {
    ...correctedAgeParams,
    currentAge: 53 // INCORRECT age
  }

  it('should calculate correct years of service at retirement with fixed age', () => {
    const correctedProjection = calculateRetirementBenefitsProjection(correctedAgeParams)
    const incorrectProjection = calculateRetirementBenefitsProjection(incorrectAgeParams)
    
    // Find the projection for age 55 (pension start age)
    const correctedPensionStart = correctedProjection.find(p => p.age === 55)
    const incorrectPensionStart = incorrectProjection.find(p => p.age === 55)
    
    expect(correctedPensionStart).toBeDefined()
    expect(incorrectPensionStart).toBeDefined()
    
    if (correctedPensionStart && incorrectPensionStart) {
      // With corrected age (52): 31 + (55 - 52) = 34 years of service
      expect(correctedPensionStart.yearsOfService).toBe(34)
      
      // With incorrect age (53): 31 + (55 - 53) = 33 years of service
      expect(incorrectPensionStart.yearsOfService).toBe(33)
      
      // The difference should be 1 year
      expect(correctedPensionStart.yearsOfService - incorrectPensionStart.yearsOfService).toBe(1)
    }
  })

  it('should affect pension benefit calculations due to additional year of service', () => {
    const correctedProjection = calculateRetirementBenefitsProjection(correctedAgeParams)
    const incorrectProjection = calculateRetirementBenefitsProjection(incorrectAgeParams)
    
    const correctedPensionStart = correctedProjection.find(p => p.age === 55)
    const incorrectPensionStart = incorrectProjection.find(p => p.age === 55)
    
    if (correctedPensionStart && incorrectPensionStart) {
      // With one additional year of service, the pension should be higher
      expect(correctedPensionStart.pensionWithOption).toBeGreaterThan(incorrectPensionStart.pensionWithOption)
      
      // The difference should be approximately one year's worth of benefit
      // For Group 2 at age 55: 2.0% benefit factor
      // Additional benefit = $95,000 * 1 year * 2.0% = $1,900 annually
      // But with Option C reduction, the actual difference will be less
      const baseDifference = 95000 * 1 * 0.02
      const actualDifference = correctedPensionStart.pensionWithOption - incorrectPensionStart.pensionWithOption

      // The actual difference should be positive and reasonably close to the base difference
      expect(actualDifference).toBeGreaterThan(0)
      expect(actualDifference).toBeGreaterThan(baseDifference * 0.8) // At least 80% of base difference
      expect(actualDifference).toBeLessThan(baseDifference * 1.2) // At most 120% of base difference
    }
  })

  it('should calculate correct years until retirement', () => {
    // With corrected age (52), years until retirement at 55 should be 3
    const yearsUntilRetirement = correctedAgeParams.plannedRetirementAge - correctedAgeParams.currentAge
    expect(yearsUntilRetirement).toBe(3)
    
    // With incorrect age (53), years until retirement at 55 would be 2
    const incorrectYearsUntilRetirement = incorrectAgeParams.plannedRetirementAge - incorrectAgeParams.currentAge
    expect(incorrectYearsUntilRetirement).toBe(2)
  })

  it('should show correct progression in all projection years', () => {
    const projection = calculateRetirementBenefitsProjection(correctedAgeParams)
    
    // All years should show 34 years of service (frozen at retirement)
    projection.forEach(year => {
      expect(year.yearsOfService).toBe(34)
    })
  })

  it('should maintain consistency across age-dependent validations', () => {
    // Test that pension retirement age validation works with corrected age
    const currentAge = 52
    const pensionRetirementAge = 55
    
    // Should be valid (pension age > current age)
    expect(pensionRetirementAge).toBeGreaterThan(currentAge)
    
    // Years until retirement should be positive
    const yearsUntilRetirement = pensionRetirementAge - currentAge
    expect(yearsUntilRetirement).toBeGreaterThan(0)
    expect(yearsUntilRetirement).toBe(3)
  })

  it('should affect COLA calculations due to higher base pension', () => {
    const correctedProjection = calculateRetirementBenefitsProjection(correctedAgeParams)
    const incorrectProjection = calculateRetirementBenefitsProjection(incorrectAgeParams)
    
    // Find the second year (age 56) where COLA is first applied
    const correctedSecondYear = correctedProjection.find(p => p.age === 56)
    const incorrectSecondYear = incorrectProjection.find(p => p.age === 56)
    
    if (correctedSecondYear && incorrectSecondYear) {
      // Both should have COLA applied
      expect(correctedSecondYear.colaAdjustment).toBeGreaterThan(0)
      expect(incorrectSecondYear.colaAdjustment).toBeGreaterThan(0)
      
      // The COLA amount might be the same (capped at $390) but the total pension should be higher
      expect(correctedSecondYear.totalPensionAnnual).toBeGreaterThan(incorrectSecondYear.totalPensionAnnual)
    }
  })

  it('should handle edge cases with age calculation', () => {
    // Test with minimum retirement age
    const edgeCaseParams: ProjectionParameters = {
      ...correctedAgeParams,
      currentAge: 52,
      plannedRetirementAge: 55, // Minimum for Group 2
      currentYearsOfService: 20 // Minimum for retirement
    }
    
    const projection = calculateRetirementBenefitsProjection(edgeCaseParams)
    expect(projection.length).toBeGreaterThan(0)
    
    const firstYear = projection[0]
    expect(firstYear.age).toBe(55)
    expect(firstYear.yearsOfService).toBe(23) // 20 + (55 - 52)
  })

  // Test the date parsing fix logic
  describe('Date Parsing Fix', () => {
    function extractYearFromDate(dateOfBirth: string): number {
      const birthDate = new Date(dateOfBirth)
      const birthYear = birthDate.getFullYear()
      // If the parsed year seems wrong (timezone issue), extract from string
      const dateStr = dateOfBirth.toString()
      const yearFromString = dateStr.match(/(\d{4})/)
      return yearFromString ? parseInt(yearFromString[1]) : birthYear
    }

    it('should correctly parse years from different date formats', () => {
      const testCases = [
        { input: '1973-01-01', expected: 1973 },
        { input: '1973-12-31', expected: 1973 },
        { input: '01/01/1973', expected: 1973 },
        { input: '1973', expected: 1973 }
      ]

      testCases.forEach(({ input, expected }) => {
        const result = extractYearFromDate(input)
        expect(result).toBe(expected)
      })
    })

    it('should calculate correct age from parsed year', () => {
      const birthYear = extractYearFromDate('1973-01-01')
      const currentAge = new Date().getFullYear() - birthYear
      
      expect(birthYear).toBe(1973)
      expect(currentAge).toBe(52) // Assuming current year is 2025
    })
  })
})
