/**
 * Automated Calculation Comparison Tool
 * Runs identical inputs through both wizard and existing calculator to identify discrepancies
 */

import {
  calculateAnnualPension,
  calculatePensionWithOption,
  getBenefitFactor,
  checkEligibility,
  calculatePensionPercentage
} from '@/lib/pension-calculations'

import { calculateStandardizedPension } from '@/lib/standardized-pension-calculator'
import { calculateMassachusettsCOLA } from '@/lib/pension/ma-cola-calculator'

export interface ComparisonInput {
  group: string
  age: number
  yearsOfService: number
  averageSalary: number
  serviceEntry: 'before_2012' | 'after_2012'
  retirementOption: 'A' | 'B' | 'C'
  beneficiaryAge?: string
  membershipDate?: string
}

export interface ComparisonResult {
  input: ComparisonInput
  existingCalculator: {
    annualPension: number
    monthlyPension: number
    benefitFactor: number
    eligible: boolean
    eligibilityMessage?: string
  }
  wizardCalculator: {
    annualPension: number
    monthlyPension: number
    benefitFactor: number
    eligible: boolean
    eligibilityMessage?: string
  }
  discrepancies: {
    annualPensionDiff: number
    monthlyPensionDiff: number
    benefitFactorDiff: number
    eligibilityMismatch: boolean
  }
  isIdentical: boolean
  tolerance: number
}

export interface BatchComparisonReport {
  totalTests: number
  identicalResults: number
  discrepanciesFound: number
  maxDiscrepancy: number
  averageDiscrepancy: number
  results: ComparisonResult[]
  summary: string
}

/**
 * Compare calculations between existing calculator and wizard for a single input
 */
export function compareCalculations(
  input: ComparisonInput,
  tolerance: number = 1.0
): ComparisonResult {

  // Existing calculator calculations
  const existingEligibility = checkEligibility(
    input.age,
    input.yearsOfService,
    input.group,
    input.serviceEntry
  )

  const existingBenefitFactor = getBenefitFactor(
    input.age,
    input.group,
    input.serviceEntry,
    input.yearsOfService
  )

  const existingAnnualPension = calculateAnnualPension(
    input.averageSalary,
    input.age,
    input.yearsOfService,
    input.retirementOption,
    input.group,
    input.serviceEntry,
    input.beneficiaryAge
  )

  // Wizard calculator calculations
  const membershipDate = input.membershipDate ||
    (input.serviceEntry === 'before_2012' ? '2010-01-01' : '2015-01-01')

  const wizardResult = calculateStandardizedPension({
    retirementGroup: input.group.replace('GROUP_', 'Group '),
    retirementAge: input.age,
    yearsOfService: input.yearsOfService,
    averageSalary: input.averageSalary,
    membershipDate,
    retirementOption: input.retirementOption,
    beneficiaryAge: input.beneficiaryAge ? parseInt(input.beneficiaryAge) : undefined
  })

  // Calculate discrepancies with consistent rounding
  // The wizard rounds to whole dollars, so we round existing values for comparison
  const roundedExistingAnnual = Math.round(existingAnnualPension)
  const roundedExistingMonthly = Math.round(existingAnnualPension / 12)

  const annualPensionDiff = Math.abs(roundedExistingAnnual - wizardResult.annualBenefit)
  const monthlyPensionDiff = Math.abs(roundedExistingMonthly - wizardResult.monthlyBenefit)
  const benefitFactorDiff = Math.abs(existingBenefitFactor - (wizardResult.benefitFactor || 0))

  const isIdentical =
    annualPensionDiff < tolerance &&
    monthlyPensionDiff < tolerance &&
    benefitFactorDiff <= 0.0001 &&
    existingEligibility.eligible === wizardResult.eligible


  return {
    input,
    existingCalculator: {
      annualPension: roundedExistingAnnual,
      monthlyPension: roundedExistingMonthly,
      benefitFactor: existingBenefitFactor,
      eligible: existingEligibility.eligible,
      eligibilityMessage: existingEligibility.message
    },

    wizardCalculator: {
      annualPension: wizardResult.annualBenefit,
      monthlyPension: wizardResult.monthlyBenefit,
      benefitFactor: wizardResult.benefitFactor || 0,
      eligible: wizardResult.eligible,
      eligibilityMessage: wizardResult.eligibilityMessage
    },
    discrepancies: {
      annualPensionDiff,
      monthlyPensionDiff,
      benefitFactorDiff,
      eligibilityMismatch: existingEligibility.eligible !== wizardResult.eligible
    },
    isIdentical,
    tolerance
  }
}

/**
 * Run batch comparison tests across multiple scenarios
 */
export function runBatchComparison(
  inputs: ComparisonInput[],
  tolerance: number = 1.0
): BatchComparisonReport {

  const results = inputs.map(input => compareCalculations(input, tolerance))

  const identicalResults = results.filter(r => r.isIdentical).length
  const discrepanciesFound = results.length - identicalResults

  const discrepancies = results
    .filter(r => !r.isIdentical)
    .map(r => r.discrepancies.annualPensionDiff)

  const maxDiscrepancy = discrepancies.length > 0 ? Math.max(...discrepancies) : 0
  const averageDiscrepancy = discrepancies.length > 0
    ? discrepancies.reduce((sum, diff) => sum + diff, 0) / discrepancies.length
    : 0

  const summary = `
Calculation Comparison Report:
- Total Tests: ${results.length}
- Identical Results: ${identicalResults} (${((identicalResults / results.length) * 100).toFixed(1)}%)
- Discrepancies Found: ${discrepanciesFound}
- Max Discrepancy: $${maxDiscrepancy.toFixed(2)}
- Average Discrepancy: $${averageDiscrepancy.toFixed(2)}
- Tolerance: $${tolerance.toFixed(2)}
  `.trim()

  return {
    totalTests: results.length,
    identicalResults,
    discrepanciesFound,
    maxDiscrepancy,
    averageDiscrepancy,
    results,
    summary
  }
}

/**
 * Generate comprehensive test scenarios for validation
 */
export function generateTestScenarios(): ComparisonInput[] {
  const scenarios: ComparisonInput[] = []

  // Standard scenarios for each group
  const groups = ['GROUP_1', 'GROUP_2', 'GROUP_3', 'GROUP_4']
  const serviceEntries: ('before_2012' | 'after_2012')[] = ['before_2012', 'after_2012']
  const retirementOptions: ('A' | 'B' | 'C')[] = ['A', 'B', 'C']

  groups.forEach(group => {
    serviceEntries.forEach(serviceEntry => {
      retirementOptions.forEach(option => {
        // Base scenario
        scenarios.push({
          group,
          age: group === 'GROUP_4' ? 52 : group === 'GROUP_3' ? 55 : 60,
          yearsOfService: 25,
          averageSalary: 75000,
          serviceEntry,
          retirementOption: option,
          beneficiaryAge: option === 'C' ? '60' : undefined
        })

        // High salary scenario (test 80% cap)
        scenarios.push({
          group,
          age: 65,
          yearsOfService: 35,
          averageSalary: 120000,
          serviceEntry,
          retirementOption: option,
          beneficiaryAge: option === 'C' ? '65' : undefined
        })
      })
    })
  })

  // Edge cases
  scenarios.push(
    // Minimum eligibility
    {
      group: 'GROUP_1',
      age: 55,
      yearsOfService: 10,
      averageSalary: 50000,
      serviceEntry: 'before_2012',
      retirementOption: 'A'
    },
    // Maximum years of service
    {
      group: 'GROUP_2',
      age: 65,
      yearsOfService: 40,
      averageSalary: 100000,
      serviceEntry: 'before_2012',
      retirementOption: 'A'
    },
    // Post-2012 with exactly 30 years (should use default table)
    {
      group: 'GROUP_1',
      age: 62,
      yearsOfService: 30,
      averageSalary: 80000,
      serviceEntry: 'after_2012',
      retirementOption: 'A'
    }
  )

  return scenarios
}

/**
 * Run comprehensive validation and generate report
 */
export function runComprehensiveValidation(): BatchComparisonReport {
  const scenarios = generateTestScenarios()
  return runBatchComparison(scenarios, 1.0)
}


/**
 * Format comparison result for display
 */
export function formatComparisonResult(result: ComparisonResult): string {
  const { input, existingCalculator, wizardCalculator, discrepancies, isIdentical } = result

  return `
Test: ${input.group} Age ${input.age}, ${input.yearsOfService} YOS, $${input.averageSalary}, ${input.serviceEntry}, Option ${input.retirementOption}
Status: ${isIdentical ? '✅ IDENTICAL' : '❌ DISCREPANCY'}

Existing Calculator:
- Annual: $${existingCalculator.annualPension.toFixed(2)}
- Monthly: $${existingCalculator.monthlyPension.toFixed(2)}
- Factor: ${existingCalculator.benefitFactor.toFixed(4)}
- Eligible: ${existingCalculator.eligible}

Wizard Calculator:
- Annual: $${wizardCalculator.annualPension.toFixed(2)}
- Monthly: $${wizardCalculator.monthlyPension.toFixed(2)}
- Factor: ${wizardCalculator.benefitFactor.toFixed(4)}
- Eligible: ${wizardCalculator.eligible}

Differences:
- Annual: $${discrepancies.annualPensionDiff.toFixed(2)}
- Monthly: $${discrepancies.monthlyPensionDiff.toFixed(2)}
- Factor: ${discrepancies.benefitFactorDiff.toFixed(4)}
- Eligibility: ${discrepancies.eligibilityMismatch ? 'MISMATCH' : 'MATCH'}
  `.trim()
}

/**
 * Generate detailed discrepancy report for failed tests
 */
export function generateDiscrepancyReport(report: BatchComparisonReport): string {
  const failedTests = report.results.filter(r => !r.isIdentical)

  if (failedTests.length === 0) {
    return "🎉 All tests passed! No discrepancies found."
  }

  let reportText = `
📊 CALCULATION DISCREPANCY REPORT
${report.summary}

🔍 DETAILED ANALYSIS OF FAILED TESTS:
${'='.repeat(50)}
`

  failedTests.forEach((result, index) => {
    reportText += `\n${index + 1}. ${formatComparisonResult(result)}\n${'='.repeat(50)}`
  })

  return reportText
}
