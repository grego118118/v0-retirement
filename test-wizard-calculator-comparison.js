/**
 * Test script to compare calculations between the calculator and wizard
 * This will help identify specific discrepancies in pension calculations
 */

// Import calculation functions from the validated calculator
const { 
  calculateAnnualPension, 
  getBenefitFactor, 
  calculatePensionWithOption 
} = require('./v0-retirement/lib/pension-calculations.ts')

// Test scenarios to compare
const testScenarios = [
  {
    name: "Group 2 - Standard Scenario",
    averageSalary: 95000,
    age: 60,
    yearsOfService: 32,
    group: "GROUP_2",
    serviceEntry: "before_2012",
    option: "A"
  },
  {
    name: "Group 2 - Option B",
    averageSalary: 95000,
    age: 60,
    yearsOfService: 32,
    group: "GROUP_2",
    serviceEntry: "before_2012",
    option: "B"
  },
  {
    name: "Group 2 - Option C",
    averageSalary: 95000,
    age: 60,
    yearsOfService: 32,
    group: "GROUP_2",
    serviceEntry: "before_2012",
    option: "C",
    beneficiaryAge: "58"
  },
  {
    name: "Group 1 - High Salary (80% Cap Test)",
    averageSalary: 120000,
    age: 65,
    yearsOfService: 35,
    group: "GROUP_1",
    serviceEntry: "before_2012",
    option: "A"
  },
  {
    name: "Group 4 - Early Retirement",
    averageSalary: 85000,
    age: 50,
    yearsOfService: 25,
    group: "GROUP_4",
    serviceEntry: "before_2012",
    option: "A"
  }
]

// Simulate calculator calculation (validated approach)
function simulateCalculatorCalculation(scenario) {
  try {
    // This is how the calculator does it
    const benefitFactor = getBenefitFactor(
      Math.floor(scenario.age), 
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
      scenario.age,
      scenario.beneficiaryAge || "",
      scenario.group
    )

    return {
      benefitFactor,
      basePension,
      maxPension,
      cappedAt80Percent: basePension >= maxPension,
      annualPension: optionResult.pension,
      monthlyPension: optionResult.pension / 12,
      optionDescription: optionResult.description,
      survivorPension: optionResult.survivorPension || 0
    }
  } catch (error) {
    console.error('Calculator simulation error:', error)
    return null
  }
}

// Simulate wizard calculation (current approach)
function simulateWizardCalculation(scenario) {
  try {
    // This is how the wizard does it (using calculateAnnualPension)
    const annualBenefit = calculateAnnualPension(
      scenario.averageSalary,
      scenario.age,
      scenario.yearsOfService,
      scenario.option,
      scenario.group,
      scenario.serviceEntry,
      scenario.beneficiaryAge
    )

    // Get benefit factor for comparison
    const benefitFactor = getBenefitFactor(
      scenario.age, 
      scenario.group, 
      scenario.serviceEntry, 
      scenario.yearsOfService
    )

    // Calculate base pension for comparison
    let basePension = scenario.averageSalary * scenario.yearsOfService * benefitFactor
    const maxPension = scenario.averageSalary * 0.8
    const cappedAt80Percent = basePension > maxPension

    return {
      benefitFactor,
      basePension: Math.min(basePension, maxPension),
      maxPension,
      cappedAt80Percent,
      annualPension: annualBenefit,
      monthlyPension: annualBenefit / 12,
      optionDescription: `Option ${scenario.option}`,
      survivorPension: 0 // Would need to extract from calculatePensionWithOption
    }
  } catch (error) {
    console.error('Wizard simulation error:', error)
    return null
  }
}

// Run comparison tests
console.log('🔍 CALCULATOR vs WIZARD COMPARISON TEST')
console.log('=' .repeat(60))

testScenarios.forEach((scenario, index) => {
  console.log(`\n📊 Test ${index + 1}: ${scenario.name}`)
  console.log('-'.repeat(40))
  console.log(`Inputs: $${scenario.averageSalary.toLocaleString()}, Age ${scenario.age}, ${scenario.yearsOfService} years, ${scenario.group}, Option ${scenario.option}`)
  
  const calculatorResult = simulateCalculatorCalculation(scenario)
  const wizardResult = simulateWizardCalculation(scenario)
  
  if (!calculatorResult || !wizardResult) {
    console.log('❌ ERROR: Could not calculate results for this scenario')
    return
  }
  
  console.log('\n📈 CALCULATOR (Validated):')
  console.log(`  Benefit Factor: ${calculatorResult.benefitFactor}`)
  console.log(`  Base Pension: $${calculatorResult.basePension.toFixed(2)}`)
  console.log(`  80% Cap Applied: ${calculatorResult.cappedAt80Percent ? 'Yes' : 'No'}`)
  console.log(`  Annual Pension: $${calculatorResult.annualPension.toFixed(2)}`)
  console.log(`  Monthly Pension: $${calculatorResult.monthlyPension.toFixed(2)}`)
  
  console.log('\n🧙 WIZARD (Current):')
  console.log(`  Benefit Factor: ${wizardResult.benefitFactor}`)
  console.log(`  Base Pension: $${wizardResult.basePension.toFixed(2)}`)
  console.log(`  80% Cap Applied: ${wizardResult.cappedAt80Percent ? 'Yes' : 'No'}`)
  console.log(`  Annual Pension: $${wizardResult.annualPension.toFixed(2)}`)
  console.log(`  Monthly Pension: $${wizardResult.monthlyPension.toFixed(2)}`)
  
  // Compare results
  const annualDifference = Math.abs(calculatorResult.annualPension - wizardResult.annualPension)
  const monthlyDifference = Math.abs(calculatorResult.monthlyPension - wizardResult.monthlyPension)
  const percentDifference = (annualDifference / calculatorResult.annualPension) * 100
  
  console.log('\n🔍 COMPARISON:')
  console.log(`  Annual Difference: $${annualDifference.toFixed(2)} (${percentDifference.toFixed(2)}%)`)
  console.log(`  Monthly Difference: $${monthlyDifference.toFixed(2)}`)
  
  if (annualDifference < 1) {
    console.log('  ✅ MATCH: Results are identical')
  } else if (percentDifference < 1) {
    console.log('  ⚠️  MINOR: Small difference (< 1%)')
  } else {
    console.log('  ❌ MAJOR: Significant difference (> 1%)')
  }
})

console.log('\n' + '='.repeat(60))
console.log('🎯 ANALYSIS COMPLETE')
console.log('Review the results above to identify calculation discrepancies.')
