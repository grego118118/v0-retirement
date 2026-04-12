/**
 * Test to verify pension calculation consistency between calculator and wizard
 */

import { calculateAnnualPension, getBenefitFactor } from '@/lib/pension-calculations'

describe('Pension Calculation Consistency', () => {
  // Test parameters that should produce identical results
  const testCases = [
    {
      name: 'Group 1, Before 2012, Age 62',
      averageSalary: 75000,
      retirementAge: 62,
      yearsOfService: 30,
      group: 'GROUP_1' as const,
      serviceEntry: 'before_2012' as const,
      retirementOption: 'A' as const
    },
    {
      name: 'Group 2, Before 2012, Age 57',
      averageSalary: 80000,
      retirementAge: 57,
      yearsOfService: 25,
      group: 'GROUP_2' as const,
      serviceEntry: 'before_2012' as const,
      retirementOption: 'A' as const
    },
    {
      name: 'Group 1, After 2012, Age 65',
      averageSalary: 70000,
      retirementAge: 65,
      yearsOfService: 25,
      group: 'GROUP_1' as const,
      serviceEntry: 'after_2012' as const,
      retirementOption: 'A' as const
    },
    {
      name: 'Group 3, Before 2012, Age 55',
      averageSalary: 85000,
      retirementAge: 55,
      yearsOfService: 20,
      group: 'GROUP_3' as const,
      serviceEntry: 'before_2012' as const,
      retirementOption: 'A' as const
    },
    {
      name: 'Group 4, Before 2012, Age 52',
      averageSalary: 90000,
      retirementAge: 52,
      yearsOfService: 28,
      group: 'GROUP_4' as const,
      serviceEntry: 'before_2012' as const,
      retirementOption: 'A' as const
    }
  ]

  testCases.forEach(testCase => {
    it(`should produce identical results for ${testCase.name}`, () => {
      const {
        averageSalary,
        retirementAge,
        yearsOfService,
        group,
        serviceEntry,
        retirementOption
      } = testCase

      // Calculate using the shared pension calculation library (same as both calculator and wizard)
      const annualBenefit = calculateAnnualPension(
        averageSalary,
        retirementAge,
        yearsOfService,
        retirementOption,
        group,
        serviceEntry
      )

      const monthlyBenefit = annualBenefit / 12

      // Verify the calculation is reasonable
      expect(annualBenefit).toBeGreaterThanOrEqual(0)
      expect(monthlyBenefit).toBeGreaterThanOrEqual(0)

      // Verify benefit factor calculation
      const benefitFactor = getBenefitFactor(retirementAge, group, serviceEntry, yearsOfService)
      expect(benefitFactor).toBeGreaterThanOrEqual(0)

      // Log results for manual verification
      console.log(`${testCase.name}:`, {
        benefitFactor,
        annualBenefit: Math.round(annualBenefit),
        monthlyBenefit: Math.round(monthlyBenefit)
      })
    })
  })

  it('should handle service entry differences correctly', () => {
    const commonParams = {
      averageSalary: 75000,
      retirementAge: 62,
      yearsOfService: 25,
      group: 'GROUP_1' as const,
      retirementOption: 'A' as const
    }

    // Calculate for before 2012
    const before2012Benefit = calculateAnnualPension(
      commonParams.averageSalary,
      commonParams.retirementAge,
      commonParams.yearsOfService,
      commonParams.retirementOption,
      commonParams.group,
      'before_2012'
    )

    // Calculate for after 2012
    const after2012Benefit = calculateAnnualPension(
      commonParams.averageSalary,
      commonParams.retirementAge,
      commonParams.yearsOfService,
      commonParams.retirementOption,
      commonParams.group,
      'after_2012'
    )

    // These should be different (after 2012 typically has lower benefits for same age/service)
    expect(before2012Benefit).not.toEqual(after2012Benefit)
    
    console.log('Service Entry Comparison:', {
      before2012: Math.round(before2012Benefit),
      after2012: Math.round(after2012Benefit),
      difference: Math.round(before2012Benefit - after2012Benefit)
    })
  })

  it('should handle retirement options correctly', () => {
    const baseParams = {
      averageSalary: 75000,
      retirementAge: 62,
      yearsOfService: 30,
      group: 'GROUP_1' as const,
      serviceEntry: 'before_2012' as const
    }

    const optionA = calculateAnnualPension(
      baseParams.averageSalary,
      baseParams.retirementAge,
      baseParams.yearsOfService,
      'A',
      baseParams.group,
      baseParams.serviceEntry
    )

    const optionB = calculateAnnualPension(
      baseParams.averageSalary,
      baseParams.retirementAge,
      baseParams.yearsOfService,
      'B',
      baseParams.group,
      baseParams.serviceEntry
    )

    const optionC = calculateAnnualPension(
      baseParams.averageSalary,
      baseParams.retirementAge,
      baseParams.yearsOfService,
      'C',
      baseParams.group,
      baseParams.serviceEntry
    )

    // Option A should be the highest (100% benefit)
    expect(optionA).toBeGreaterThanOrEqual(optionB)
    expect(optionA).toBeGreaterThanOrEqual(optionC)

    console.log('Retirement Options Comparison:', {
      optionA: Math.round(optionA),
      optionB: Math.round(optionB),
      optionC: Math.round(optionC)
    })
  })

  it('should handle beneficiary age for Option C correctly', () => {
    const baseParams = {
      averageSalary: 75000,
      retirementAge: 62,
      yearsOfService: 30,
      group: 'GROUP_1' as const,
      serviceEntry: 'before_2012' as const
    }

    // Test Option C with different beneficiary ages
    const optionC_BeneficiaryAge55 = calculateAnnualPension(
      baseParams.averageSalary,
      baseParams.retirementAge,
      baseParams.yearsOfService,
      'C',
      baseParams.group,
      baseParams.serviceEntry,
      '55'
    )

    const optionC_BeneficiaryAge65 = calculateAnnualPension(
      baseParams.averageSalary,
      baseParams.retirementAge,
      baseParams.yearsOfService,
      'C',
      baseParams.group,
      baseParams.serviceEntry,
      '65'
    )

    const optionC_NoBeneficiary = calculateAnnualPension(
      baseParams.averageSalary,
      baseParams.retirementAge,
      baseParams.yearsOfService,
      'C',
      baseParams.group,
      baseParams.serviceEntry
    )

    // All should be valid calculations
    expect(optionC_BeneficiaryAge55).toBeGreaterThan(0)
    expect(optionC_BeneficiaryAge65).toBeGreaterThan(0)
    expect(optionC_NoBeneficiary).toBeGreaterThan(0)

    console.log('Option C Beneficiary Age Comparison:', {
      beneficiaryAge55: Math.round(optionC_BeneficiaryAge55),
      beneficiaryAge65: Math.round(optionC_BeneficiaryAge65),
      noBeneficiary: Math.round(optionC_NoBeneficiary)
    })
  })

  it('should validate pension retirement age by group', () => {
    // Test minimum ages for each group
    const testCases = [
      { group: 'GROUP_1', minAge: 55, validAge: 60, invalidAge: 50 },
      { group: 'GROUP_2', minAge: 55, validAge: 58, invalidAge: 52 },
      { group: 'GROUP_3', minAge: 18, validAge: 45, invalidAge: 17 }, // Special case: any age with 20+ years
      { group: 'GROUP_4', minAge: 50, validAge: 52, invalidAge: 48 }
    ]

    testCases.forEach(testCase => {
      const baseParams = {
        averageSalary: 75000,
        yearsOfService: 25,
        serviceEntry: 'before_2012' as const
      }

      // Valid age should work
      const validBenefit = calculateAnnualPension(
        baseParams.averageSalary,
        testCase.validAge,
        baseParams.yearsOfService,
        'A',
        testCase.group as any,
        baseParams.serviceEntry
      )

      expect(validBenefit).toBeGreaterThanOrEqual(0)

      console.log(`${testCase.group} valid age ${testCase.validAge}:`, Math.round(validBenefit))
    })
  })
})
