/**
 * Comprehensive test suite to validate that wizard calculations match existing calculator
 * This ensures calculation accuracy and consistency across the application
 */

import {
  calculateAnnualPension,
  calculatePensionWithOption,
  getBenefitFactor,
  checkEligibility,
  calculatePensionPercentage
} from '@/lib/pension-calculations'

import {
  calculateCOLAProjection,
  calculateMassachusettsCOLA
} from '@/lib/pension/ma-cola-calculator'

import { calculateStandardizedPension } from '@/lib/standardized-pension-calculator'

// Test scenarios covering all retirement groups and edge cases
const TEST_SCENARIOS = [
  // Group 1 scenarios
  {
    name: "Group 1 - Standard retirement",
    group: "GROUP_1",
    age: 62,
    yearsOfService: 30,
    averageSalary: 75000,
    serviceEntry: "before_2012",
    retirementOption: "A",
    expectedResults: {
      benefitFactor: 0.022,
      annualPension: 49500, // 75000 * 30 * 0.022
      monthlyPension: 4125
    }
  },
  {
    name: "Group 1 - Post-2012 hire with 30+ years",
    group: "GROUP_1", 
    age: 65,
    yearsOfService: 32,
    averageSalary: 80000,
    serviceEntry: "after_2012",
    retirementOption: "A",
    expectedResults: {
      benefitFactor: 0.025, // Uses default table with 30+ years
      annualPension: 64000, // 80000 * 32 * 0.025 = 64000
      monthlyPension: 5333.33
    }
  },
  {
    name: "Group 1 - Post-2012 hire with <30 years",
    group: "GROUP_1",
    age: 65,
    yearsOfService: 25,
    averageSalary: 70000,
    serviceEntry: "after_2012", 
    retirementOption: "A",
    expectedResults: {
      benefitFactor: 0.022, // Uses post-2012 <30 YOS table
      annualPension: 38500, // 70000 * 25 * 0.022
      monthlyPension: 3208.33
    }
  },

  // Group 2 scenarios
  {
    name: "Group 2 - Standard retirement",
    group: "GROUP_2",
    age: 58,
    yearsOfService: 28,
    averageSalary: 85000,
    serviceEntry: "before_2012",
    retirementOption: "A",
    expectedResults: {
      benefitFactor: 0.023,
      annualPension: 54740, // 85000 * 28 * 0.023
      monthlyPension: 4561.67
    }
  },

  // Group 3 scenarios
  {
    name: "Group 3 - State Police retirement",
    group: "GROUP_3",
    age: 55,
    yearsOfService: 25,
    averageSalary: 90000,
    serviceEntry: "before_2012",
    retirementOption: "A",
    expectedResults: {
      benefitFactor: 0.025, // Flat 2.5% for Group 3
      annualPension: 56250, // 90000 * 25 * 0.025
      monthlyPension: 4687.50
    }
  },

  // Group 4 scenarios
  {
    name: "Group 4 - Public safety retirement",
    group: "GROUP_4",
    age: 52,
    yearsOfService: 22,
    averageSalary: 78000,
    serviceEntry: "before_2012",
    retirementOption: "A",
    expectedResults: {
      benefitFactor: 0.022,
      annualPension: 37752, // 78000 * 22 * 0.022
      monthlyPension: 3146
    }
  },

  // 80% cap scenarios
  {
    name: "Group 1 - 80% cap applied",
    group: "GROUP_1",
    age: 65,
    yearsOfService: 40,
    averageSalary: 100000,
    serviceEntry: "before_2012",
    retirementOption: "A",
    expectedResults: {
      benefitFactor: 0.025,
      annualPension: 80000, // Capped at 80% of 100000
      monthlyPension: 6666.67
    }
  }
]

// Pension option test scenarios
const PENSION_OPTION_SCENARIOS = [
  {
    name: "Option B - Age 55 reduction",
    basePension: 50000,
    option: "B",
    memberAge: 55,
    beneficiaryAge: "",
    expectedReduction: 0.01, // 1% reduction
    expectedPension: 49500
  },
  {
    name: "Option B - Age 65 reduction",
    basePension: 60000,
    option: "B",
    memberAge: 65,
    beneficiaryAge: "",
    expectedReduction: 0.01, // 1% reduction (MSRB validated)
    expectedPension: 59400
  },
  {
    name: "Option C - 55/55 survivor benefit",
    basePension: 58900,
    option: "C",
    memberAge: 55,
    beneficiaryAge: "55",
    expectedReduction: 0.0705, // 7.05% reduction per MSRB
    expectedPension: 54747.55
  },
  {
    name: "Option C - 65/65 survivor benefit",
    basePension: 60000,
    option: "C", 
    memberAge: 65,
    beneficiaryAge: "65",
    expectedReduction: 0.11, // 11% reduction
    expectedPension: 53400
  }
]

// COLA calculation test scenarios
const COLA_SCENARIOS = [
  {
    name: "Standard COLA - Under $13,000 base",
    basePension: 12000,
    years: 1,
    expectedCOLA: 360, // 12000 * 0.03 = 360
    expectedTotal: 12360
  },
  {
    name: "Standard COLA - Over $13,000 base",
    basePension: 20000,
    years: 1,
    expectedCOLA: 390, // 13000 * 0.03 = 390 (capped)
    expectedTotal: 20390
  },
  {
    name: "Multi-year COLA projection",
    basePension: 15000,
    years: 5,
    expectedTotalCOLA: 1950, // 390 * 5 years
    expectedFinalAmount: 16950
  }
]

describe('Wizard vs Calculator Validation Tests', () => {
  describe('Benefit Factor Calculations', () => {
    TEST_SCENARIOS.forEach(scenario => {
      it(`should calculate correct benefit factor for ${scenario.name}`, () => {
        const benefitFactor = getBenefitFactor(
          scenario.age,
          scenario.group,
          scenario.serviceEntry,
          scenario.yearsOfService
        )

        expect(benefitFactor).toBeCloseTo(scenario.expectedResults.benefitFactor, 4)
      })
    })
  })

  describe('Annual Pension Calculations', () => {
    TEST_SCENARIOS.forEach(scenario => {
      it(`should calculate correct annual pension for ${scenario.name}`, () => {
        const annualPension = calculateAnnualPension(
          scenario.averageSalary,
          scenario.age,
          scenario.yearsOfService,
          scenario.retirementOption as "A" | "B" | "C",
          scenario.group,
          scenario.serviceEntry
        )

        expect(annualPension).toBeCloseTo(scenario.expectedResults.annualPension, 2)
      })
    })
  })

  describe('Monthly Pension Calculations', () => {
    TEST_SCENARIOS.forEach(scenario => {
      it(`should calculate correct monthly pension for ${scenario.name}`, () => {
        const annualPension = calculateAnnualPension(
          scenario.averageSalary,
          scenario.age,
          scenario.yearsOfService,
          scenario.retirementOption as "A" | "B" | "C",
          scenario.group,
          scenario.serviceEntry
        )
        const monthlyPension = annualPension / 12

        expect(monthlyPension).toBeCloseTo(scenario.expectedResults.monthlyPension, 2)
      })
    })
  })

  describe('Pension Option Calculations', () => {
    PENSION_OPTION_SCENARIOS.forEach(scenario => {
      it(`should calculate correct pension for ${scenario.name}`, () => {
        const result = calculatePensionWithOption(
          scenario.basePension,
          scenario.option,
          scenario.memberAge,
          scenario.beneficiaryAge
        )

        expect(result.pension).toBeCloseTo(scenario.expectedPension, 2)
      })
    })
  })

  describe('Eligibility Validation', () => {
    const eligibilityTests = [
      {
        name: "Group 1 - Before 2012 - 20+ years eligible",
        age: 50,
        yearsOfService: 25,
        group: "GROUP_1",
        serviceEntry: "before_2012",
        expectedEligible: true
      },
      {
        name: "Group 1 - After 2012 - Under age 60 ineligible",
        age: 58,
        yearsOfService: 25,
        group: "GROUP_1", 
        serviceEntry: "after_2012",
        expectedEligible: false
      },
      {
        name: "Group 3 - Any age with 20+ years eligible",
        age: 45,
        yearsOfService: 22,
        group: "GROUP_3",
        serviceEntry: "before_2012",
        expectedEligible: true
      }
    ]

    eligibilityTests.forEach(test => {
      it(`should validate eligibility for ${test.name}`, () => {
        const eligibility = checkEligibility(
          test.age,
          test.yearsOfService,
          test.group,
          test.serviceEntry
        )

        expect(eligibility.eligible).toBe(test.expectedEligible)
      })
    })
  })

  describe('COLA Calculations', () => {
    COLA_SCENARIOS.forEach(scenario => {
      it(`should calculate correct COLA for ${scenario.name}`, () => {
        const colaResult = calculateMassachusettsCOLA(
          scenario.basePension,
          scenario.years
        )

        if ('expectedCOLA' in scenario) {
          expect(colaResult.totalIncrease).toBeCloseTo(scenario.expectedCOLA, 2)
        }
        
        if ('expectedTotalCOLA' in scenario) {
          expect(colaResult.totalIncrease).toBeCloseTo(scenario.expectedTotalCOLA, 2)
        }
      })
    })
  })

  describe('Cross-Calculator Consistency', () => {
    it('should produce identical results between wizard and existing calculator', () => {
      const testCase = {
        group: "GROUP_2",
        age: 60,
        yearsOfService: 25,
        averageSalary: 75000,
        serviceEntry: "before_2012",
        retirementOption: "A"
      }

      // Calculate using existing calculator logic
      const existingResult = calculateAnnualPension(
        testCase.averageSalary,
        testCase.age,
        testCase.yearsOfService,
        testCase.retirementOption as "A",
        testCase.group,
        testCase.serviceEntry
      )

      // Calculate using standardized calculator (wizard logic)
      const wizardResult = calculateStandardizedPension({
        retirementGroup: testCase.group.replace('GROUP_', 'Group '),
        retirementAge: testCase.age,
        yearsOfService: testCase.yearsOfService,
        averageSalary: testCase.averageSalary,
        membershipDate: testCase.serviceEntry === "before_2012" ? "2010-01-01" : "2015-01-01",
        retirementOption: testCase.retirementOption
      })

      // Results should be identical
      expect(wizardResult.annualBenefit).toBeCloseTo(existingResult, 2)
    })
  })
})
