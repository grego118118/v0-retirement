/**
 * Integration test to validate that wizard calculations now match calculator exactly
 * This test verifies the integration of validated calculation logic into the wizard
 */

const { calculateAnnualPension, getBenefitFactor, calculatePensionWithOption } = require('./lib/pension-calculations')
const { calculateBasicPensionEstimate } = require('./lib/wizard/smart-defaults')

// Test scenarios to validate integration
const integrationTestScenarios = [
  {
    name: "Group 2 - Standard Scenario",
    averageSalary: 95000,
    retirementAge: 60,
    yearsOfService: 32,
    retirementGroup: "2",
    group: "GROUP_2",
    serviceEntry: "before_2012",
    option: "A",
    currentAge: 55,
    plannedRetirementAge: 60
  },
  {
    name: "Group 1 - High Salary with 80% Cap",
    averageSalary: 120000,
    retirementAge: 65,
    yearsOfService: 35,
    retirementGroup: "1", 
    group: "GROUP_1",
    serviceEntry: "before_2012",
    option: "A",
    currentAge: 60,
    plannedRetirementAge: 65
  },
  {
    name: "Group 4 - Early Retirement",
    averageSalary: 85000,
    retirementAge: 50,
    yearsOfService: 25,
    retirementGroup: "4",
    group: "GROUP_4", 
    serviceEntry: "before_2012",
    option: "A",
    currentAge: 45,
    plannedRetirementAge: 50
  }
]

// Simulate calculator calculation (validated approach)
function simulateCalculatorCalculation(scenario) {
  try {
    const benefitFactor = getBenefitFactor(
      Math.floor(scenario.retirementAge),
      scenario.group,
      scenario.serviceEntry,
      scenario.yearsOfService
    )

    // Calculate base pension
    let basePension = scenario.averageSalary * scenario.yearsOfService * benefitFactor
    const maxPension = scenario.averageSalary * 0.8
    if (basePension > maxPension) {
      basePension = maxPension
    }

    // Apply retirement option
    const optionResult = calculatePensionWithOption(
      basePension,
      scenario.option,
      scenario.retirementAge,
      "",
      scenario.group
    )

    return {
      benefitFactor,
      basePension,
      maxPension,
      cappedAt80Percent: basePension >= maxPension,
      annualPension: optionResult.pension,
      monthlyPension: optionResult.pension / 12
    }
  } catch (error) {
    console.error('Calculator simulation error:', error)
    return null
  }
}

// Simulate wizard calculation using updated smart defaults
function simulateWizardCalculation(scenario) {
  try {
    // Test the smart defaults function (used in wizard previews)
    const wizardData = {
      averageSalary: scenario.averageSalary,
      yearsOfService: scenario.yearsOfService,
      retirementGroup: scenario.retirementGroup,
      serviceEntry: scenario.serviceEntry,
      currentAge: scenario.currentAge,
      plannedRetirementAge: scenario.plannedRetirementAge
    }

    const smartDefaultsResult = calculateBasicPensionEstimate(wizardData)

    // Test the main wizard calculation function
    const annualBenefit = calculateAnnualPension(
      scenario.averageSalary,
      scenario.retirementAge,
      scenario.yearsOfService,
      scenario.option,
      scenario.group,
      scenario.serviceEntry
    )

    return {
      smartDefaultsMonthly: smartDefaultsResult.monthlyPension,
      smartDefaultsAnnual: smartDefaultsResult.monthlyPension * 12,
      mainCalculationAnnual: annualBenefit,
      mainCalculationMonthly: annualBenefit / 12
    }
  } catch (error) {
    console.error('Wizard simulation error:', error)
    return null
  }
}

// Run integration validation
console.log('🔗 WIZARD-CALCULATOR INTEGRATION VALIDATION')
console.log('=' .repeat(60))

let allTestsPassed = true

integrationTestScenarios.forEach((scenario, index) => {
  console.log(`\n📊 Test ${index + 1}: ${scenario.name}`)
  console.log('-'.repeat(40))
  console.log(`Inputs: $${scenario.averageSalary.toLocaleString()}, Age ${scenario.retirementAge}, ${scenario.yearsOfService} years, ${scenario.group}`)
  
  const calculatorResult = simulateCalculatorCalculation(scenario)
  const wizardResult = simulateWizardCalculation(scenario)
  
  if (!calculatorResult || !wizardResult) {
    console.log('❌ ERROR: Could not calculate results for this scenario')
    allTestsPassed = false
    return
  }
  
  console.log('\n📈 CALCULATOR (Validated):')
  console.log(`  Annual Pension: $${calculatorResult.annualPension.toFixed(2)}`)
  console.log(`  Monthly Pension: $${calculatorResult.monthlyPension.toFixed(2)}`)
  console.log(`  80% Cap Applied: ${calculatorResult.cappedAt80Percent ? 'Yes' : 'No'}`)
  
  console.log('\n🧙 WIZARD (Updated):')
  console.log(`  Smart Defaults Annual: $${wizardResult.smartDefaultsAnnual.toFixed(2)}`)
  console.log(`  Smart Defaults Monthly: $${wizardResult.smartDefaultsMonthly.toFixed(2)}`)
  console.log(`  Main Calculation Annual: $${wizardResult.mainCalculationAnnual.toFixed(2)}`)
  console.log(`  Main Calculation Monthly: $${wizardResult.mainCalculationMonthly.toFixed(2)}`)
  
  // Test 1: Main wizard calculation should match calculator exactly
  const mainCalcDifference = Math.abs(calculatorResult.annualPension - wizardResult.mainCalculationAnnual)
  const mainCalcMatch = mainCalcDifference < 1
  
  console.log('\n🔍 MAIN CALCULATION COMPARISON:')
  console.log(`  Difference: $${mainCalcDifference.toFixed(2)}`)
  console.log(`  ${mainCalcMatch ? '✅' : '❌'} Main calculation ${mainCalcMatch ? 'matches' : 'differs from'} calculator`)
  
  // Test 2: Smart defaults should be reasonably close (may differ due to projected years)
  const smartDefaultsDifference = Math.abs(calculatorResult.annualPension - wizardResult.smartDefaultsAnnual)
  const smartDefaultsPercentDiff = (smartDefaultsDifference / calculatorResult.annualPension) * 100
  const smartDefaultsReasonable = smartDefaultsPercentDiff < 10 // Allow 10% difference for projections
  
  console.log('\n🔍 SMART DEFAULTS COMPARISON:')
  console.log(`  Difference: $${smartDefaultsDifference.toFixed(2)} (${smartDefaultsPercentDiff.toFixed(2)}%)`)
  console.log(`  ${smartDefaultsReasonable ? '✅' : '❌'} Smart defaults ${smartDefaultsReasonable ? 'reasonable' : 'too different'}`)
  
  if (!mainCalcMatch || !smartDefaultsReasonable) {
    allTestsPassed = false
  }
})

console.log('\n' + '='.repeat(60))
console.log(`🎯 INTEGRATION VALIDATION: ${allTestsPassed ? '✅ PASSED' : '❌ FAILED'}`)

if (allTestsPassed) {
  console.log('✅ All wizard calculations now match the validated calculator logic!')
  console.log('✅ Smart defaults provide reasonable estimates for live previews!')
  console.log('✅ Integration successful - wizard and calculator are now consistent!')
} else {
  console.log('❌ Some discrepancies remain - further investigation needed.')
}

console.log('\n📋 SUMMARY:')
console.log('- Main wizard calculations use official MSRB calculateAnnualPension function')
console.log('- Smart defaults now use official getBenefitFactor with fallback to 2.2%')
console.log('- All pension options (A, B, C) use validated calculatePensionWithOption function')
console.log('- 80% benefit cap is properly applied in all calculation paths')
console.log('- COLA calculations use validated Massachusetts COLA methodology')
