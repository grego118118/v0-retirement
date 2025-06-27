#!/usr/bin/env node

/**
 * Test User's Specific Group 1 Scenario
 * Tests the exact scenario from the user's MSRB screenshots
 */

const { 
  calculateAnnualPension,
  getBenefitFactor 
} = require('./lib/pension-calculations.ts');

console.log('🔍 Testing User\'s Specific Group 1 Scenario...\n');

// User's actual test scenario from screenshots
const userScenario = {
  memberAge: 62,
  beneficiaryAge: 60,
  yearsOfService: 38,
  averageSalary: 95000,
  group: "GROUP_1",
  serviceEntry: "before_2012"
};

console.log('📊 User\'s Test Scenario:');
console.log('='.repeat(60));
console.log(`Member Age: ${userScenario.memberAge}`);
console.log(`Beneficiary Age: ${userScenario.beneficiaryAge}`);
console.log(`Years of Service: ${userScenario.yearsOfService}`);
console.log(`Average Salary: $${userScenario.averageSalary.toLocaleString()}`);
console.log(`Group: ${userScenario.group}`);
console.log(`Service Entry: ${userScenario.serviceEntry}`);

// Expected MSRB Results from user's screenshots
const expectedResults = {
  optionA: 76000.00,
  optionB: 75240.00,
  optionC: 68080.80,
  optionCSurvivor: 45387.20
};

console.log('\n📋 Expected MSRB Results (from screenshots):');
console.log(`Option A: $${expectedResults.optionA.toLocaleString()}`);
console.log(`Option B: $${expectedResults.optionB.toLocaleString()}`);
console.log(`Option C Member: $${expectedResults.optionC.toLocaleString()}`);
console.log(`Option C Survivor: $${expectedResults.optionCSurvivor.toLocaleString()}`);

// Calculate what our system produces
console.log('\n🧮 Our Current Calculator Results:');
console.log('='.repeat(60));

const ourOptionA = calculateAnnualPension(
  userScenario.averageSalary,
  userScenario.memberAge,
  userScenario.yearsOfService,
  "A",
  userScenario.group,
  userScenario.serviceEntry
);

const ourOptionB = calculateAnnualPension(
  userScenario.averageSalary,
  userScenario.memberAge,
  userScenario.yearsOfService,
  "B",
  userScenario.group,
  userScenario.serviceEntry
);

const ourOptionC = calculateAnnualPension(
  userScenario.averageSalary,
  userScenario.memberAge,
  userScenario.yearsOfService,
  "C",
  userScenario.group,
  userScenario.serviceEntry,
  userScenario.beneficiaryAge.toString()
);

console.log(`Our Option A: $${ourOptionA.toLocaleString()}`);
console.log(`Our Option B: $${ourOptionB.toLocaleString()}`);
console.log(`Our Option C: $${ourOptionC.toLocaleString()}`);

// Calculate differences
console.log('\n📊 Accuracy Analysis:');
console.log('='.repeat(60));

const optionADiff = ourOptionA - expectedResults.optionA;
const optionBDiff = ourOptionB - expectedResults.optionB;
const optionCDiff = ourOptionC - expectedResults.optionC;

console.log(`Option A Difference: $${optionADiff.toFixed(2)} ${Math.abs(optionADiff) < 1 ? '✅' : '❌'}`);
console.log(`Option B Difference: $${optionBDiff.toFixed(2)} ${Math.abs(optionBDiff) < 1 ? '✅' : '❌'}`);
console.log(`Option C Difference: $${optionCDiff.toFixed(2)} ${Math.abs(optionCDiff) < 1 ? '✅' : '❌'}`);

// Analyze the Option C reduction factor
console.log('\n🔍 Option C Reduction Factor Analysis:');
console.log('='.repeat(60));

const correctReductionFactor = expectedResults.optionC / expectedResults.optionA;
const actualReductionFactor = ourOptionC / ourOptionA;
const reductionPercentage = (1 - correctReductionFactor) * 100;
const actualReductionPercentage = (1 - actualReductionFactor) * 100;

console.log(`Expected Reduction Factor: ${correctReductionFactor.toFixed(6)} (${reductionPercentage.toFixed(2)}% reduction)`);
console.log(`Our Reduction Factor: ${actualReductionFactor.toFixed(6)} (${actualReductionPercentage.toFixed(2)}% reduction)`);
console.log(`Factor Difference: ${(actualReductionFactor - correctReductionFactor).toFixed(6)}`);

// Verify survivor percentage
const expectedSurvivorPercentage = expectedResults.optionCSurvivor / expectedResults.optionC;
console.log(`\nExpected Survivor Percentage: ${(expectedSurvivorPercentage * 100).toFixed(2)}% (should be 66.67%)`);

// Check benefit factor
console.log('\n🔍 Benefit Factor Analysis:');
console.log('='.repeat(60));

const benefitFactor = getBenefitFactor(userScenario.memberAge, userScenario.group, userScenario.serviceEntry, userScenario.yearsOfService);
const benefitPercentage = userScenario.yearsOfService * benefitFactor;
const basePension = userScenario.averageSalary * benefitPercentage;
const maxPension = userScenario.averageSalary * 0.8;
const cappedPension = Math.min(basePension, maxPension);

console.log(`Benefit Factor: ${benefitFactor} (${(benefitFactor * 100).toFixed(1)}%)`);
console.log(`Benefit Percentage: ${(benefitPercentage * 100).toFixed(1)}%`);
console.log(`Base Pension (before cap): $${basePension.toLocaleString()}`);
console.log(`80% Cap: $${maxPension.toLocaleString()}`);
console.log(`Final Base Pension: $${cappedPension.toLocaleString()}`);
console.log(`Matches Option A: ${Math.abs(cappedPension - expectedResults.optionA) < 1 ? '✅' : '❌'}`);

console.log('\n📋 Summary:');
console.log('='.repeat(60));

if (Math.abs(optionCDiff) < 1) {
  console.log('✅ **SUCCESS:** Group 1 Option C calculation is accurate!');
} else {
  console.log('❌ **ISSUE FOUND:** Group 1 Option C calculation needs correction');
  console.log(`   Expected: $${expectedResults.optionC.toLocaleString()}`);
  console.log(`   Actual: $${ourOptionC.toLocaleString()}`);
  console.log(`   Error: $${Math.abs(optionCDiff).toLocaleString()}`);
  console.log(`   Required Factor: ${correctReductionFactor.toFixed(6)}`);
  console.log(`   Current Factor: ${actualReductionFactor.toFixed(6)}`);
}

console.log('\n🎯 **Action Required:**');
if (Math.abs(optionCDiff) >= 1) {
  console.log('1. Update Group 1 Option C reduction factor for age 62/beneficiary 60');
  console.log(`2. Change factor from current to ${correctReductionFactor.toFixed(6)}`);
  console.log('3. Test to ensure accuracy');
} else {
  console.log('✅ No action required - calculations are accurate!');
}
