#!/usr/bin/env tsx

/**
 * Calculation Validation Script
 * Runs comprehensive comparison between wizard and existing calculator
 * Usage: npm run validate-calculations
 */

import {
  runComprehensiveValidation,
  generateDiscrepancyReport,
  formatComparisonResult,
  compareCalculations,
  type ComparisonInput
} from '../lib/validation/calculation-comparison-tool'

import { writeFileSync } from 'fs'
import { join } from 'path'

// Critical test cases that must pass
const CRITICAL_TEST_CASES: ComparisonInput[] = [
  // Group 1 - Standard case
  {
    group: 'GROUP_1',
    age: 62,
    yearsOfService: 30,
    averageSalary: 75000,
    serviceEntry: 'before_2012',
    retirementOption: 'A'
  },
  // Group 2 - Standard case  
  {
    group: 'GROUP_2',
    age: 58,
    yearsOfService: 25,
    averageSalary: 80000,
    serviceEntry: 'before_2012',
    retirementOption: 'A'
  },
  // Group 3 - State Police
  {
    group: 'GROUP_3',
    age: 55,
    yearsOfService: 25,
    averageSalary: 90000,
    serviceEntry: 'before_2012',
    retirementOption: 'A'
  },
  // Group 4 - Public Safety
  {
    group: 'GROUP_4',
    age: 52,
    yearsOfService: 22,
    averageSalary: 78000,
    serviceEntry: 'before_2012',
    retirementOption: 'A'
  },
  // Post-2012 hire with <30 years (different factor table)
  {
    group: 'GROUP_1',
    age: 65,
    yearsOfService: 25,
    averageSalary: 70000,
    serviceEntry: 'after_2012',
    retirementOption: 'A'
  },
  // Post-2012 hire with 30+ years (uses default table)
  {
    group: 'GROUP_1',
    age: 65,
    yearsOfService: 32,
    averageSalary: 80000,
    serviceEntry: 'after_2012',
    retirementOption: 'A'
  },
  // 80% cap scenario
  {
    group: 'GROUP_1',
    age: 65,
    yearsOfService: 40,
    averageSalary: 100000,
    serviceEntry: 'before_2012',
    retirementOption: 'A'
  },
  // Option B scenarios
  {
    group: 'GROUP_2',
    age: 55,
    yearsOfService: 25,
    averageSalary: 75000,
    serviceEntry: 'before_2012',
    retirementOption: 'B'
  },
  {
    group: 'GROUP_2',
    age: 65,
    yearsOfService: 25,
    averageSalary: 75000,
    serviceEntry: 'before_2012',
    retirementOption: 'B'
  },
  // Option C scenarios
  {
    group: 'GROUP_2',
    age: 55,
    yearsOfService: 25,
    averageSalary: 75000,
    serviceEntry: 'before_2012',
    retirementOption: 'C',
    beneficiaryAge: '55'
  },
  {
    group: 'GROUP_2',
    age: 65,
    yearsOfService: 25,
    averageSalary: 75000,
    serviceEntry: 'before_2012',
    retirementOption: 'C',
    beneficiaryAge: '65'
  }
]

async function runValidation() {
  console.log('🔍 Starting Calculation Validation...\n')

  // Run critical test cases first
  console.log('📋 Running Critical Test Cases...')
  let criticalPassed = 0
  let criticalFailed = 0

  for (const testCase of CRITICAL_TEST_CASES) {
    const result = compareCalculations(testCase, 0.01)
    if (result.isIdentical) {
      console.log(`✅ ${testCase.group} Age ${testCase.age} Option ${testCase.retirementOption} - PASSED`)
      criticalPassed++
    } else {
      console.log(`❌ ${testCase.group} Age ${testCase.age} Option ${testCase.retirementOption} - FAILED`)
      console.log(`   Difference: $${result.discrepancies.annualPensionDiff.toFixed(2)} annually`)
      criticalFailed++
    }
  }

  console.log(`\n📊 Critical Tests Summary: ${criticalPassed} passed, ${criticalFailed} failed\n`)

  // Run comprehensive validation
  console.log('🔄 Running Comprehensive Validation...')
  const report = runComprehensiveValidation()

  console.log('\n' + report.summary)

  // Generate detailed report
  const detailedReport = generateDiscrepancyReport(report)
  
  // Save report to file
  const reportPath = join(process.cwd(), 'validation-report.txt')
  const timestamp = new Date().toISOString()
  const fullReport = `
MASSACHUSETTS RETIREMENT SYSTEM
CALCULATION VALIDATION REPORT
Generated: ${timestamp}

${detailedReport}

CRITICAL TEST RESULTS:
Critical Tests Passed: ${criticalPassed}/${CRITICAL_TEST_CASES.length}
Critical Tests Failed: ${criticalFailed}/${CRITICAL_TEST_CASES.length}

COMPREHENSIVE TEST RESULTS:
${report.summary}

${criticalFailed === 0 && report.discrepanciesFound === 0 
  ? '🎉 ALL TESTS PASSED - Calculations are consistent!' 
  : '⚠️  DISCREPANCIES FOUND - Review required before deployment'}
  `

  writeFileSync(reportPath, fullReport)
  console.log(`\n📄 Detailed report saved to: ${reportPath}`)

  // Exit with error code if any critical tests failed
  if (criticalFailed > 0) {
    console.log('\n❌ CRITICAL TESTS FAILED - Deployment blocked until resolved')
    process.exit(1)
  } else if (report.discrepanciesFound > 0) {
    console.log('\n⚠️  Non-critical discrepancies found - Review recommended')
    process.exit(0)
  } else {
    console.log('\n✅ ALL VALIDATIONS PASSED - Ready for deployment')
    process.exit(0)
  }
}

// Handle command line arguments
const args = process.argv.slice(2)
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
Massachusetts Retirement System - Calculation Validator

Usage: npm run validate-calculations [options]

Options:
  --help, -h     Show this help message
  --critical     Run only critical test cases
  --verbose      Show detailed output for all tests

This tool validates that the wizard calculations match the existing calculator
to ensure accuracy and consistency across the application.
  `)
  process.exit(0)
}

if (args.includes('--critical')) {
  console.log('Running critical tests only...')
  // Run only critical tests
  CRITICAL_TEST_CASES.forEach((testCase, index) => {
    const result = compareCalculations(testCase, 0.01)
    console.log(`\nTest ${index + 1}:`)
    console.log(formatComparisonResult(result))
  })
} else {
  // Run full validation
  runValidation().catch(error => {
    console.error('❌ Validation failed:', error)
    process.exit(1)
  })
}
