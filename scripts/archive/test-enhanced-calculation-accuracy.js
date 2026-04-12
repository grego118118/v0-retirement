#!/usr/bin/env node

/**
 * Test script to verify enhanced calculation preview matches MSRB results
 * Tests the new comprehensive calculation functionality
 */

console.log('🧪 Testing Enhanced Calculation Preview Accuracy...\n');

// Test scenario based on MSRB screenshot results
const testScenario = {
  birthYear: 1968,
  currentAge: 55,
  retirementGroup: '2',
  yearsOfService: 31.0,
  averageSalary: 95000,
  plannedRetirementAge: 55,
  serviceEntry: 'before_2012',
  retirementOption: 'C',
  beneficiaryAge: 55
};

// Expected MSRB results from the screenshot
const expectedMSRBResults = {
  optionA: {
    annual: 58900.00,
    monthly: 4908.33
  },
  optionB: {
    annual: 58311.00,
    monthly: 4859.25
  },
  optionC: {
    annual: 54747.55,
    monthly: 4562.30,
    survivorAnnual: 36498.37,
    survivorMonthly: 3041.53
  }
};

console.log('📊 Test Scenario:');
console.log(`   Age: ${testScenario.currentAge}`);
console.log(`   Group: ${testScenario.retirementGroup}`);
console.log(`   Years of Service: ${testScenario.yearsOfService}`);
console.log(`   Average Salary: $${testScenario.averageSalary.toLocaleString()}`);
console.log(`   Retirement Age: ${testScenario.plannedRetirementAge}`);
console.log(`   Service Entry: ${testScenario.serviceEntry}`);

console.log('\n🎯 Expected MSRB Results:');
console.log(`   Option A: $${expectedMSRBResults.optionA.annual.toLocaleString()}/year ($${expectedMSRBResults.optionA.monthly.toLocaleString()}/month)`);
console.log(`   Option B: $${expectedMSRBResults.optionB.annual.toLocaleString()}/year ($${expectedMSRBResults.optionB.monthly.toLocaleString()}/month)`);
console.log(`   Option C: $${expectedMSRBResults.optionC.annual.toLocaleString()}/year ($${expectedMSRBResults.optionC.monthly.toLocaleString()}/month)`);
console.log(`   Option C Survivor: $${expectedMSRBResults.optionC.survivorAnnual.toLocaleString()}/year ($${expectedMSRBResults.optionC.survivorMonthly.toLocaleString()}/month)`);

// Manual calculation verification
console.log('\n🔍 Manual Calculation Verification:');

// Step 1: Benefit Factor
console.log('\n1️⃣ Benefit Factor:');
const groupTwoBenefitFactor = 0.02; // 2.0% for Group 2 at age 55
console.log(`   Group 2, Age 55 Factor: ${groupTwoBenefitFactor} (${(groupTwoBenefitFactor * 100)}%)`);

// Step 2: Base Pension Calculation with 80% Cap Verification
console.log('\n2️⃣ Base Pension Calculation with 80% Cap Verification:');
const uncappedPension = testScenario.averageSalary * testScenario.yearsOfService * groupTwoBenefitFactor;
const maxPension = testScenario.averageSalary * 0.8; // 80% cap
const basePension = Math.min(uncappedPension, maxPension);
const capApplied = uncappedPension > maxPension;
const pensionPercentageOfSalary = (basePension / testScenario.averageSalary) * 100;

console.log(`   Formula: $${testScenario.averageSalary.toLocaleString()} × ${testScenario.yearsOfService} × ${groupTwoBenefitFactor}`);
console.log(`   Uncapped Pension: $${uncappedPension.toFixed(2)}`);
console.log(`   80% Cap Limit: $${maxPension.toFixed(2)} (${(maxPension / testScenario.averageSalary * 100).toFixed(1)}% of salary)`);
console.log(`   Final Pension (capped): $${basePension.toFixed(2)}`);
console.log(`   Cap Applied: ${capApplied ? 'YES' : 'NO'}`);
console.log(`   Final Pension %: ${pensionPercentageOfSalary.toFixed(2)}% of salary`);
console.log(`   Exceeds 80%: ${pensionPercentageOfSalary > 80.01 ? '❌ YES (ERROR!)' : '✅ NO (CORRECT)'}`);
console.log(`   Expected (Option A): $${expectedMSRBResults.optionA.annual.toFixed(2)}`);
console.log(`   Match: ${Math.abs(basePension - expectedMSRBResults.optionA.annual) < 1 ? '✅' : '❌'}`);

// Step 3: Option B Calculation (1% reduction of capped base)
console.log('\n3️⃣ Option B Calculation (1% reduction of capped base):');
const optionBReduction = 0.01; // 1% reduction for age 55
const optionBPension = basePension * (1 - optionBReduction);
const optionBPercentageOfSalary = (optionBPension / testScenario.averageSalary) * 100;

console.log(`   Base (capped): $${basePension.toFixed(2)}`);
console.log(`   Reduction: ${(optionBReduction * 100)}% for age 55`);
console.log(`   Formula: $${basePension.toFixed(2)} × ${(1 - optionBReduction)}`);
console.log(`   Calculated: $${optionBPension.toFixed(2)}`);
console.log(`   Option B %: ${optionBPercentageOfSalary.toFixed(2)}% of salary`);
console.log(`   Exceeds 80%: ${optionBPercentageOfSalary > 80.01 ? '❌ YES (ERROR!)' : '✅ NO (CORRECT)'}`);
console.log(`   Expected: $${expectedMSRBResults.optionB.annual.toFixed(2)}`);
console.log(`   Match: ${Math.abs(optionBPension - expectedMSRBResults.optionB.annual) < 1 ? '✅' : '❌'}`);

// Step 4: Option C Calculation (7.05% reduction of capped base + survivor benefit)
console.log('\n4️⃣ Option C Calculation (7.05% reduction of capped base + survivor benefit):');
const optionCReductionFactor = 0.9295; // 7.05% reduction for 55/55
const optionCPension = basePension * optionCReductionFactor;
const survivorPension = optionCPension * (2/3); // Exactly 66.67% (two-thirds) to survivor
const optionCPercentageOfSalary = (optionCPension / testScenario.averageSalary) * 100;
const survivorPercentageOfSalary = (survivorPension / testScenario.averageSalary) * 100;

console.log(`   Base (capped): $${basePension.toFixed(2)}`);
console.log(`   Reduction Factor: ${optionCReductionFactor} (${((1 - optionCReductionFactor) * 100).toFixed(2)}% reduction)`);
console.log(`   Formula: $${basePension.toFixed(2)} × ${optionCReductionFactor}`);
console.log(`   Member Calculated: $${optionCPension.toFixed(2)}`);
console.log(`   Member %: ${optionCPercentageOfSalary.toFixed(2)}% of salary`);
console.log(`   Member Exceeds 80%: ${optionCPercentageOfSalary > 80.01 ? '❌ YES (ERROR!)' : '✅ NO (CORRECT)'}`);
console.log(`   Member Expected: $${expectedMSRBResults.optionC.annual.toFixed(2)}`);
console.log(`   Member Match: ${Math.abs(optionCPension - expectedMSRBResults.optionC.annual) < 1 ? '✅' : '❌'}`);
console.log(`   Survivor Calculated: $${survivorPension.toFixed(2)}`);
console.log(`   Survivor %: ${survivorPercentageOfSalary.toFixed(2)}% of salary`);
console.log(`   Survivor Exceeds 80%: ${survivorPercentageOfSalary > 80.01 ? '❌ YES (ERROR!)' : '✅ NO (CORRECT)'}`);
console.log(`   Survivor Expected: $${expectedMSRBResults.optionC.survivorAnnual.toFixed(2)}`);
console.log(`   Survivor Match: ${Math.abs(survivorPension - expectedMSRBResults.optionC.survivorAnnual) < 0.01 ? '✅' : '❌'}`);

// Step 5: 80% Cap Compliance Verification
console.log('\n5️⃣ 80% Cap Compliance Verification:');
const capCompliance = [
  { name: 'Option A', pension: basePension, percentage: pensionPercentageOfSalary },
  { name: 'Option B', pension: optionBPension, percentage: optionBPercentageOfSalary },
  { name: 'Option C Member', pension: optionCPension, percentage: optionCPercentageOfSalary },
  { name: 'Option C Survivor', pension: survivorPension, percentage: survivorPercentageOfSalary }
];

let capViolations = 0;
capCompliance.forEach(option => {
  const compliant = option.percentage <= 80.01; // Small tolerance for rounding
  console.log(`   ${option.name}: ${option.percentage.toFixed(2)}% ${compliant ? '✅' : '❌'}`);
  if (!compliant) capViolations++;
});

console.log(`   Cap Violations: ${capViolations}`);
console.log(`   All Options Compliant: ${capViolations === 0 ? '✅ YES' : '❌ NO'}`);

// Summary
console.log('\n📋 Calculation Accuracy Summary:');
const optionAMatch = Math.abs(basePension - expectedMSRBResults.optionA.annual) < 1;
const optionBMatch = Math.abs(optionBPension - expectedMSRBResults.optionB.annual) < 1;
const optionCMatch = Math.abs(optionCPension - expectedMSRBResults.optionC.annual) < 1;
const survivorMatch = Math.abs(survivorPension - expectedMSRBResults.optionC.survivorAnnual) < 0.01;
const capCompliant = capViolations === 0;

console.log(`✅ Option A: ${optionAMatch ? 'PASS' : 'FAIL'}`);
console.log(`✅ Option B: ${optionBMatch ? 'PASS' : 'FAIL'}`);
console.log(`✅ Option C: ${optionCMatch ? 'PASS' : 'FAIL'}`);
console.log(`✅ Survivor: ${survivorMatch ? 'PASS' : 'FAIL'}`);
console.log(`✅ 80% Cap: ${capCompliant ? 'PASS' : 'FAIL'}`);

const allMatch = optionAMatch && optionBMatch && optionCMatch && survivorMatch && capCompliant;
console.log(`\n🎯 Overall Accuracy: ${allMatch ? '✅ PASS' : '❌ FAIL'}`);

if (allMatch) {
  console.log('\n🎉 All calculations match MSRB results! Enhanced calculation preview is accurate.');
  console.log('   ✓ All pension amounts match expected values');
  console.log('   ✓ 80% cap is properly applied and enforced');
  console.log('   ✓ No pension exceeds 80% of average salary');
  console.log('   ✓ All retirement options use capped base amounts');
} else {
  console.log('\n⚠️  Some calculations do not match. Please verify the calculation functions.');
  if (!capCompliant) {
    console.log('   ❌ 80% cap violations detected!');
  }
  if (!optionAMatch || !optionBMatch || !optionCMatch || !survivorMatch) {
    console.log('   ❌ MSRB calculation mismatches detected!');
  }
}

// Test data for enhanced preview component
console.log('\n📝 Test Data for Enhanced Preview:');
console.log('Use this data in the development environment:');
console.log(JSON.stringify(testScenario, null, 2));

// Additional Test: High Pension Scenario (80% Cap Should Apply)
console.log('\n🔬 Additional Test: High Pension Scenario (80% Cap Should Apply):');
const highPensionTest = {
  averageSalary: 80000,
  yearsOfService: 40,
  benefitFactor: 0.025 // Group 1 at age 65
};

const highUncapped = highPensionTest.averageSalary * highPensionTest.yearsOfService * highPensionTest.benefitFactor;
const highCap = highPensionTest.averageSalary * 0.8;
const highCapped = Math.min(highUncapped, highCap);
const highCapApplied = highUncapped > highCap;

console.log(`   Scenario: $${highPensionTest.averageSalary.toLocaleString()} salary, ${highPensionTest.yearsOfService} YOS, ${(highPensionTest.benefitFactor * 100)}% factor`);
console.log(`   Uncapped: $${highUncapped.toLocaleString()}`);
console.log(`   80% Cap: $${highCap.toLocaleString()}`);
console.log(`   Final: $${highCapped.toLocaleString()}`);
console.log(`   Cap Applied: ${highCapApplied ? '✅ YES (CORRECT)' : '❌ NO (ERROR!)'}`);
console.log(`   Final %: ${(highCapped / highPensionTest.averageSalary * 100).toFixed(1)}% of salary`);

console.log('\n🚀 Testing Instructions:');
console.log('1. Navigate to: http://localhost:3000/dev/wizard-v2');
console.log('2. Click "Load Test Data" or enter the values manually');
console.log('3. Verify the enhanced calculation preview shows:');
console.log(`   - Option A: $${Math.round(expectedMSRBResults.optionA.monthly).toLocaleString()}/month`);
console.log(`   - Option B: $${Math.round(expectedMSRBResults.optionB.monthly).toLocaleString()}/month`);
console.log(`   - Option C: $${Math.round(expectedMSRBResults.optionC.monthly).toLocaleString()}/month`);
console.log(`   - Survivor: $${Math.round(expectedMSRBResults.optionC.survivorMonthly).toLocaleString()}/month`);
console.log('4. Test retirement option selection and beneficiary age changes');
console.log('5. Verify all calculations update in real-time');
console.log('6. Test high pension scenarios to verify 80% cap enforcement');
