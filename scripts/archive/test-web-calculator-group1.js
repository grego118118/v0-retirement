#!/usr/bin/env node

/**
 * Test Web Calculator Group 1 Integration
 * Tests the exact functions used by the web calculator interface
 */

const { 
  calculatePensionWithOption,
  getBenefitFactor,
  checkEligibility 
} = require('./lib/pension-calculations.ts');

console.log('🌐 Testing Web Calculator Group 1 Integration...\n');

// User's exact scenario from screenshots
const scenario = {
  memberAge: 62,
  beneficiaryAge: 60,
  yearsOfService: 38,
  averageSalary: 95000,
  group: "GROUP_1",
  serviceEntry: "before_2012"
};

console.log('📊 User\'s Test Scenario (Web Calculator):');
console.log('='.repeat(60));
console.log(`Member Age: ${scenario.memberAge}`);
console.log(`Beneficiary Age: ${scenario.beneficiaryAge}`);
console.log(`Years of Service: ${scenario.yearsOfService}`);
console.log(`Average Salary: $${scenario.averageSalary.toLocaleString()}`);
console.log(`Group: ${scenario.group}`);
console.log(`Service Entry: ${scenario.serviceEntry}`);

// Expected MSRB Results from user's screenshots
const expectedResults = {
  optionA: 76000.00,
  optionB: 75240.00,
  optionC: 68080.80,
  optionCSurvivor: 45387.20
};

console.log('\n📋 Expected MSRB Results:');
console.log(`Option A: $${expectedResults.optionA.toLocaleString()}`);
console.log(`Option B: $${expectedResults.optionB.toLocaleString()}`);
console.log(`Option C Member: $${expectedResults.optionC.toLocaleString()}`);
console.log(`Option C Survivor: $${expectedResults.optionCSurvivor.toLocaleString()}`);

// Simulate the exact web calculator calculation process
console.log('\n🧮 Web Calculator Simulation:');
console.log('='.repeat(60));

// Step 1: Calculate benefit factor
const benefitFactor = getBenefitFactor(scenario.memberAge, scenario.group, scenario.serviceEntry, scenario.yearsOfService);
console.log(`1. Benefit Factor: ${benefitFactor} (${(benefitFactor * 100).toFixed(1)}%)`);

// Step 2: Calculate benefit percentage
const benefitPercentage = scenario.yearsOfService * benefitFactor;
console.log(`2. Benefit Percentage: ${(benefitPercentage * 100).toFixed(1)}%`);

// Step 3: Calculate base pension (before cap)
const basePension = scenario.averageSalary * benefitPercentage;
console.log(`3. Base Pension (before cap): $${basePension.toLocaleString()}`);

// Step 4: Apply 80% cap
const maxPension = scenario.averageSalary * 0.8;
const cappedPension = Math.min(basePension, maxPension);
console.log(`4. 80% Cap: $${maxPension.toLocaleString()}`);
console.log(`5. Final Base Pension: $${cappedPension.toLocaleString()}`);

// Step 5: Test each option using calculatePensionWithOption (web calculator function)
console.log('\n🔍 Testing Web Calculator Functions:');
console.log('='.repeat(60));

// Option A
const optionAResult = calculatePensionWithOption(
  cappedPension,
  "A",
  scenario.memberAge,
  scenario.beneficiaryAge.toString(),
  scenario.group
);

console.log(`Option A Result:`);
console.log(`  Pension: $${optionAResult.pension.toLocaleString()}`);
console.log(`  Description: ${optionAResult.description}`);

// Option B
const optionBResult = calculatePensionWithOption(
  cappedPension,
  "B",
  scenario.memberAge,
  scenario.beneficiaryAge.toString(),
  scenario.group
);

console.log(`\nOption B Result:`);
console.log(`  Pension: $${optionBResult.pension.toLocaleString()}`);
console.log(`  Description: ${optionBResult.description}`);

// Option C
const optionCResult = calculatePensionWithOption(
  cappedPension,
  "C",
  scenario.memberAge,
  scenario.beneficiaryAge.toString(),
  scenario.group
);

console.log(`\nOption C Result:`);
console.log(`  Member Pension: $${optionCResult.pension.toLocaleString()}`);
console.log(`  Survivor Pension: $${optionCResult.survivorPension.toLocaleString()}`);
console.log(`  Description: ${optionCResult.description}`);

// Calculate differences
console.log('\n📊 Accuracy Analysis:');
console.log('='.repeat(60));

const optionADiff = optionAResult.pension - expectedResults.optionA;
const optionBDiff = optionBResult.pension - expectedResults.optionB;
const optionCDiff = optionCResult.pension - expectedResults.optionC;
const survivorDiff = optionCResult.survivorPension - expectedResults.optionCSurvivor;

console.log(`Option A Difference: $${optionADiff.toFixed(2)} ${Math.abs(optionADiff) < 1 ? '✅' : '❌'}`);
console.log(`Option B Difference: $${optionBDiff.toFixed(2)} ${Math.abs(optionBDiff) < 1 ? '✅' : '❌'}`);
console.log(`Option C Difference: $${optionCDiff.toFixed(2)} ${Math.abs(optionCDiff) < 1 ? '✅' : '❌'}`);
console.log(`Survivor Difference: $${survivorDiff.toFixed(2)} ${Math.abs(survivorDiff) < 1 ? '✅' : '❌'}`);

// Check reduction factor
console.log('\n🔍 Reduction Factor Analysis:');
console.log('='.repeat(60));

const actualReductionFactor = optionCResult.pension / optionAResult.pension;
const expectedReductionFactor = expectedResults.optionC / expectedResults.optionA;
const factorDiff = actualReductionFactor - expectedReductionFactor;

console.log(`Expected Reduction Factor: ${expectedReductionFactor.toFixed(6)} (${((1 - expectedReductionFactor) * 100).toFixed(2)}% reduction)`);
console.log(`Actual Reduction Factor: ${actualReductionFactor.toFixed(6)} (${((1 - actualReductionFactor) * 100).toFixed(2)}% reduction)`);
console.log(`Factor Difference: ${factorDiff.toFixed(6)} ${Math.abs(factorDiff) < 0.001 ? '✅' : '❌'}`);

// Verify survivor percentage
const survivorPercentage = optionCResult.survivorPension / optionCResult.pension;
console.log(`\nSurvivor Percentage: ${(survivorPercentage * 100).toFixed(2)}% ${Math.abs(survivorPercentage - (2/3)) < 0.001 ? '✅' : '❌'}`);

// Final Summary
console.log('\n📋 Web Calculator Integration Summary:');
console.log('='.repeat(60));

const allAccurate = Math.abs(optionADiff) < 1 && Math.abs(optionBDiff) < 1 && Math.abs(optionCDiff) < 1 && Math.abs(survivorDiff) < 1;

if (allAccurate) {
  console.log('✅ **SUCCESS:** Web calculator functions are accurate!');
  console.log('✅ All pension options match MSRB calculator exactly');
  console.log('✅ Group 1 Option C calculations are working correctly');
} else {
  console.log('❌ **ISSUE FOUND:** Web calculator functions have discrepancies');
  console.log('❌ Group 1 Option C calculations need investigation');
  
  if (Math.abs(optionCDiff) >= 1) {
    console.log(`\n🔍 **Option C Issue Details:**`);
    console.log(`   Expected: $${expectedResults.optionC.toLocaleString()}`);
    console.log(`   Actual: $${optionCResult.pension.toLocaleString()}`);
    console.log(`   Error: $${Math.abs(optionCDiff).toLocaleString()}`);
    console.log(`   Required Factor: ${expectedReductionFactor.toFixed(6)}`);
    console.log(`   Current Factor: ${actualReductionFactor.toFixed(6)}`);
  }
}

console.log('\n🎯 **Next Steps:**');
if (allAccurate) {
  console.log('✅ Web calculator integration is working correctly');
  console.log('✅ Issue may be in the UI display or form data processing');
  console.log('✅ Check browser console and form values in web interface');
} else {
  console.log('1. Fix web calculator function discrepancies');
  console.log('2. Update Group 1 reduction factors if needed');
  console.log('3. Test web interface after backend fixes');
}
