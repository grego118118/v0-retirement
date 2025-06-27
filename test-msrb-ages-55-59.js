#!/usr/bin/env node

/**
 * MSRB Calculation Accuracy Test for Ages 55-59
 * Tests Group 2 calculations across the age range to validate accuracy
 */

// Import the calculation functions
const { 
  getBenefitFactor, 
  calculatePensionWithOption,
  checkEligibility 
} = require('./lib/pension-calculations.ts');

console.log('🧪 Testing MSRB Calculation Accuracy for Ages 55-59...\n');

// Base test scenario
const baseTestScenario = {
  yearsOfService: 31.0,
  group: "GROUP_2",
  serviceEntry: "before_2012",
  averageSalary: 95000,
  retirementOption: "C"
};

// Age range to test
const testAges = [55, 56, 57, 58, 59];

// Expected benefit factors for Group 2 before 2012
const expectedBenefitFactors = {
  55: 0.020, // 2.0%
  56: 0.021, // 2.1%
  57: 0.022, // 2.2%
  58: 0.023, // 2.3%
  59: 0.024  // 2.4%
};

// MSRB Official Results for age 55 (reference scenario)
const msrbReferenceResults = {
  55: {
    optionA: 58900.00,
    optionB: 58311.00,
    optionC: 54747.55,
    survivor: 36498.37
  }
};

console.log('📊 Testing Group 2 Calculations Across Age Range');
console.log('='.repeat(60));

let totalTests = 0;
let passedTests = 0;
const testResults = [];

// Run tests for each age
for (const age of testAges) {
  const testScenario = {
    ...baseTestScenario,
    age: age,
    beneficiaryAge: age.toString()
  };

  console.log(`\n🔍 Testing Age ${age}:`);
  console.log(`   Years of Service: ${testScenario.yearsOfService}`);
  console.log(`   Employee Group: ${testScenario.group}`);
  console.log(`   Average Salary: $${testScenario.averageSalary.toLocaleString()}`);
  console.log(`   Beneficiary Age: ${testScenario.beneficiaryAge}`);

  const ageResults = {
    age: age,
    tests: [],
    summary: { passed: 0, total: 0 }
  };

  // Test 1: Check eligibility
  console.log('\n  1️⃣ Eligibility Check:');
  try {
    const eligibility = checkEligibility(testScenario.age, testScenario.yearsOfService, testScenario.group, testScenario.serviceEntry);
    const passed = eligibility.eligible;
    console.log(`     ${passed ? '✅' : '❌'} Eligible: ${eligibility.eligible}`);
    
    ageResults.tests.push({ name: 'Eligibility', passed, details: eligibility.eligible });
    ageResults.summary.total++;
    if (passed) ageResults.summary.passed++;
    totalTests++;
    if (passed) passedTests++;
  } catch (error) {
    console.log(`     ❌ Error checking eligibility: ${error.message}`);
    ageResults.tests.push({ name: 'Eligibility', passed: false, details: error.message });
    ageResults.summary.total++;
    totalTests++;
  }

  // Test 2: Benefit Factor
  console.log('\n  2️⃣ Benefit Factor:');
  try {
    const benefitFactor = getBenefitFactor(testScenario.age, testScenario.group, testScenario.serviceEntry, testScenario.yearsOfService);
    const expectedFactor = expectedBenefitFactors[age];
    const passed = Math.abs(benefitFactor - expectedFactor) < 0.0001;
    
    console.log(`     Factor: ${benefitFactor} (${(benefitFactor * 100).toFixed(1)}%)`);
    console.log(`     Expected: ${expectedFactor} (${(expectedFactor * 100).toFixed(1)}%)`);
    console.log(`     ${passed ? '✅' : '❌'} Factor ${passed ? 'matches' : 'differs from'} expected value`);
    
    ageResults.tests.push({ 
      name: 'Benefit Factor', 
      passed, 
      details: `${benefitFactor} vs ${expectedFactor}` 
    });
    ageResults.summary.total++;
    if (passed) ageResults.summary.passed++;
    totalTests++;
    if (passed) passedTests++;

    // Calculate base pension
    const basePension = testScenario.averageSalary * testScenario.yearsOfService * benefitFactor;
    console.log(`     Base Pension: $${basePension.toFixed(2)}`);

    // Test 3: Option A (should equal base pension)
    console.log('\n  3️⃣ Option A Calculation:');
    try {
      const optionA = calculatePensionWithOption(basePension, "A", testScenario.age, "");
      const passed = Math.abs(optionA.pension - basePension) < 1;
      
      console.log(`     Option A: $${optionA.pension.toFixed(2)}`);
      console.log(`     ${passed ? '✅' : '❌'} Option A ${passed ? 'equals' : 'differs from'} base pension`);
      
      ageResults.tests.push({ 
        name: 'Option A', 
        passed, 
        details: `$${optionA.pension.toFixed(2)}` 
      });
      ageResults.summary.total++;
      if (passed) ageResults.summary.passed++;
      totalTests++;
      if (passed) passedTests++;
    } catch (error) {
      console.log(`     ❌ Error calculating Option A: ${error.message}`);
      ageResults.tests.push({ name: 'Option A', passed: false, details: error.message });
      ageResults.summary.total++;
      totalTests++;
    }

    // Test 4: Option B (1% reduction)
    console.log('\n  4️⃣ Option B Calculation:');
    try {
      const optionB = calculatePensionWithOption(basePension, "B", testScenario.age, "");
      const expectedB = basePension * 0.99; // 1% reduction
      const passed = Math.abs(optionB.pension - expectedB) < 1;
      
      console.log(`     Option B: $${optionB.pension.toFixed(2)}`);
      console.log(`     Expected: $${expectedB.toFixed(2)} (1% reduction)`);
      console.log(`     ${passed ? '✅' : '❌'} Option B ${passed ? 'matches' : 'differs from'} expected 1% reduction`);
      
      ageResults.tests.push({ 
        name: 'Option B', 
        passed, 
        details: `$${optionB.pension.toFixed(2)} vs $${expectedB.toFixed(2)}` 
      });
      ageResults.summary.total++;
      if (passed) ageResults.summary.passed++;
      totalTests++;
      if (passed) passedTests++;
    } catch (error) {
      console.log(`     ❌ Error calculating Option B: ${error.message}`);
      ageResults.tests.push({ name: 'Option B', passed: false, details: error.message });
      ageResults.summary.total++;
      totalTests++;
    }

    // Test 5: Option C
    console.log('\n  5️⃣ Option C Calculation:');
    try {
      const optionC = calculatePensionWithOption(basePension, "C", testScenario.age, testScenario.beneficiaryAge);
      
      console.log(`     Option C Member: $${optionC.pension.toFixed(2)}`);
      console.log(`     Option C Survivor: $${optionC.survivorPension.toFixed(2)}`);
      
      // Check survivor percentage (should be 66.67%)
      const survivorPercent = (optionC.survivorPension / optionC.pension);
      const survivorPassed = Math.abs(survivorPercent - (2/3)) < 0.001;
      
      console.log(`     Survivor Percentage: ${(survivorPercent * 100).toFixed(2)}% (expected: 66.67%)`);
      console.log(`     ${survivorPassed ? '✅' : '❌'} Survivor percentage ${survivorPassed ? 'correct' : 'incorrect'}`);
      
      // For age 55, compare against MSRB reference
      if (age === 55 && msrbReferenceResults[55]) {
        const msrbC = msrbReferenceResults[55].optionC;
        const msrbSurvivor = msrbReferenceResults[55].survivor;
        const cPassed = Math.abs(optionC.pension - msrbC) < 1;
        const survivorMsrbPassed = Math.abs(optionC.survivorPension - msrbSurvivor) < 1;
        
        console.log(`     MSRB Reference - Member: $${msrbC.toFixed(2)} ${cPassed ? '✅' : '❌'}`);
        console.log(`     MSRB Reference - Survivor: $${msrbSurvivor.toFixed(2)} ${survivorMsrbPassed ? '✅' : '❌'}`);
        
        ageResults.tests.push({ 
          name: 'Option C vs MSRB', 
          passed: cPassed && survivorMsrbPassed, 
          details: `Member: $${optionC.pension.toFixed(2)} vs $${msrbC.toFixed(2)}, Survivor: $${optionC.survivorPension.toFixed(2)} vs $${msrbSurvivor.toFixed(2)}` 
        });
        ageResults.summary.total++;
        if (cPassed && survivorMsrbPassed) ageResults.summary.passed++;
        totalTests++;
        if (cPassed && survivorMsrbPassed) passedTests++;
      }
      
      ageResults.tests.push({ 
        name: 'Option C Survivor %', 
        passed: survivorPassed, 
        details: `${(survivorPercent * 100).toFixed(2)}%` 
      });
      ageResults.summary.total++;
      if (survivorPassed) ageResults.summary.passed++;
      totalTests++;
      if (survivorPassed) passedTests++;
      
    } catch (error) {
      console.log(`     ❌ Error calculating Option C: ${error.message}`);
      ageResults.tests.push({ name: 'Option C', passed: false, details: error.message });
      ageResults.summary.total++;
      totalTests++;
    }

  } catch (error) {
    console.log(`     ❌ Error getting benefit factor: ${error.message}`);
  }

  testResults.push(ageResults);
  
  // Age summary
  const agePassRate = ageResults.summary.total > 0 ? (ageResults.summary.passed / ageResults.summary.total * 100) : 0;
  console.log(`\n  📊 Age ${age} Summary: ${ageResults.summary.passed}/${ageResults.summary.total} tests passed (${agePassRate.toFixed(1)}%)`);
}

// Overall summary
console.log('\n' + '='.repeat(60));
console.log('📋 OVERALL TEST SUMMARY');
console.log('='.repeat(60));

const overallPassRate = totalTests > 0 ? (passedTests / totalTests * 100) : 0;
console.log(`Total Tests: ${totalTests}`);
console.log(`Passed: ${passedTests}`);
console.log(`Failed: ${totalTests - passedTests}`);
console.log(`Pass Rate: ${overallPassRate.toFixed(1)}%`);

if (overallPassRate === 100) {
  console.log('\n✅ ALL TESTS PASSED - CALCULATIONS VERIFIED');
  console.log('Application calculations are accurate across ages 55-59.');
} else {
  console.log('\n⚠️  SOME TESTS FAILED - REVIEW REQUIRED');
  console.log('Check the detailed results above for specific issues.');
}

console.log('\n🎯 Age-by-Age Results:');
testResults.forEach(result => {
  const passRate = result.summary.total > 0 ? (result.summary.passed / result.summary.total * 100) : 0;
  console.log(`Age ${result.age}: ${result.summary.passed}/${result.summary.total} (${passRate.toFixed(1)}%)`);
});
