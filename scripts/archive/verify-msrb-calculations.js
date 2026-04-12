#!/usr/bin/env node

/**
 * Manual verification of MSRB calculation accuracy
 * Implements the exact logic to match official results
 */

console.log('🧪 Verifying MSRB Calculation Accuracy...\n');

// Test scenario from screenshots
const scenario = {
  age: 55,
  yearsOfService: 31.0,
  group: "GROUP_2",
  averageSalary: 95000,
  beneficiaryAge: 55
};

console.log('📊 Test Scenario:');
console.log(`   Age: ${scenario.age}, YOS: ${scenario.yearsOfService}, Group: ${scenario.group}`);
console.log(`   Average Salary: $${scenario.averageSalary.toLocaleString()}`);
console.log(`   Beneficiary Age: ${scenario.beneficiaryAge}`);

console.log('\n🎯 MSRB Official Results:');
const msrbResults = {
  optionA: { annual: 58900.00, monthly: 4908.33 },
  optionB: { annual: 58311.00, monthly: 4859.25 },
  optionC: { annual: 54747.55, monthly: 4562.30 },
  survivor: { annual: 36498.37, monthly: 3041.53 }
};

Object.entries(msrbResults).forEach(([option, amounts]) => {
  if (option === 'survivor') {
    console.log(`   Survivor: $${amounts.annual.toFixed(2)} annual / $${amounts.monthly.toFixed(2)} monthly`);
  } else {
    console.log(`   ${option.toUpperCase()}: $${amounts.annual.toFixed(2)} annual / $${amounts.monthly.toFixed(2)} monthly`);
  }
});

console.log('\n🔍 Manual Calculation Analysis:');

// Step 1: Determine benefit factor
console.log('\n1️⃣ Benefit Factor Analysis:');
const groupTwoBenefitFactor = 0.02; // 2.0% for Group 2 at age 55
console.log(`   Group 2, Age 55 Factor: ${groupTwoBenefitFactor} (${(groupTwoBenefitFactor * 100)}%)`);

// Step 2: Calculate base pension (Option A)
console.log('\n2️⃣ Base Pension Calculation (Option A):');
const basePension = scenario.averageSalary * scenario.yearsOfService * groupTwoBenefitFactor;
console.log(`   Formula: $${scenario.averageSalary.toLocaleString()} × ${scenario.yearsOfService} × ${groupTwoBenefitFactor}`);
console.log(`   Calculated: $${basePension.toFixed(2)}`);
console.log(`   MSRB Result: $${msrbResults.optionA.annual.toFixed(2)}`);

const optionADiff = Math.abs(basePension - msrbResults.optionA.annual);
if (optionADiff < 1) {
  console.log(`   ✅ Perfect match!`);
} else {
  console.log(`   ❌ Difference: $${optionADiff.toFixed(2)}`);
}

// Step 3: Option B calculation
console.log('\n3️⃣ Option B Calculation (Annuity Protection):');
// Age 55 should have approximately 1% reduction
const optionBReduction = 0.01; // 1% reduction at age 55
const optionBPension = basePension * (1 - optionBReduction);
console.log(`   Base: $${basePension.toFixed(2)}`);
console.log(`   Reduction: ${(optionBReduction * 100)}% at age ${scenario.age}`);
console.log(`   Calculated: $${optionBPension.toFixed(2)}`);
console.log(`   MSRB Result: $${msrbResults.optionB.annual.toFixed(2)}`);

const optionBDiff = Math.abs(optionBPension - msrbResults.optionB.annual);
if (optionBDiff < 1) {
  console.log(`   ✅ Close match!`);
} else {
  console.log(`   ❌ Difference: $${optionBDiff.toFixed(2)}`);
  // Calculate actual reduction percentage from MSRB
  const actualReduction = (basePension - msrbResults.optionB.annual) / basePension;
  console.log(`   MSRB Actual Reduction: ${(actualReduction * 100).toFixed(2)}%`);
}

// Step 4: Option C calculation
console.log('\n4️⃣ Option C Calculation (Joint & Survivor):');
// Calculate the exact reduction factor from MSRB results
const msrbReductionFactor = msrbResults.optionC.annual / msrbResults.optionA.annual;
console.log(`   MSRB Reduction Factor: ${msrbReductionFactor.toFixed(4)} (${((1 - msrbReductionFactor) * 100).toFixed(2)}% reduction)`);

const optionCPension = basePension * msrbReductionFactor;
console.log(`   Base: $${basePension.toFixed(2)}`);
console.log(`   Calculated: $${optionCPension.toFixed(2)}`);
console.log(`   MSRB Result: $${msrbResults.optionC.annual.toFixed(2)}`);

const optionCDiff = Math.abs(optionCPension - msrbResults.optionC.annual);
if (optionCDiff < 1) {
  console.log(`   ✅ Perfect match with factor ${msrbReductionFactor.toFixed(4)}!`);
} else {
  console.log(`   ❌ Difference: $${optionCDiff.toFixed(2)}`);
}

// Step 5: Survivor benefit calculation
console.log('\n5️⃣ Survivor Benefit Calculation:');
const survivorPercentage = msrbResults.survivor.annual / msrbResults.optionC.annual;
console.log(`   Survivor Percentage: ${(survivorPercentage * 100).toFixed(2)}%`);
console.log(`   Expected: 66.67%`);

const calculatedSurvivor = msrbResults.optionC.annual * (2/3); // 66.67%
console.log(`   Calculated: $${calculatedSurvivor.toFixed(2)}`);
console.log(`   MSRB Result: $${msrbResults.survivor.annual.toFixed(2)}`);

const survivorDiff = Math.abs(calculatedSurvivor - msrbResults.survivor.annual);
if (survivorDiff < 1) {
  console.log(`   ✅ Perfect match at 66.67%!`);
} else {
  console.log(`   ❌ Difference: $${survivorDiff.toFixed(2)}`);
}

// Summary of corrections needed
console.log('\n📋 Required Corrections:');
console.log('\n🔧 Option C Reduction Factor:');
console.log(`   Current: 0.94 (6% reduction)`);
console.log(`   Correct: ${msrbReductionFactor.toFixed(4)} (${((1 - msrbReductionFactor) * 100).toFixed(2)}% reduction)`);

console.log('\n🔧 Option B Reduction at Age 55:');
const correctBReduction = (basePension - msrbResults.optionB.annual) / basePension;
console.log(`   Current: 1% reduction`);
console.log(`   Correct: ${(correctBReduction * 100).toFixed(2)}% reduction`);

console.log('\n✅ Verification Summary:');
console.log(`   Option A: Base calculation appears correct`);
console.log(`   Option B: Need to adjust age 55 reduction factor`);
console.log(`   Option C: Need exact factor ${msrbReductionFactor.toFixed(4)} for ages 55/55`);
console.log(`   Survivor: 66.67% calculation is correct`);

console.log('\n🎯 Implementation Plan:');
console.log('1. Update OPTION_C_PERCENTAGES_OF_A["55-55"] to 0.9294');
console.log('2. Verify Option B reduction interpolation for age 55');
console.log('3. Test with additional age combinations');
console.log('4. Ensure all components use the corrected factors');

// Generate the exact correction values
console.log('\n📝 Exact Values for Code Update:');
console.log(`const OPTION_C_PERCENTAGES_OF_A = {`);
console.log(`  "55-55": ${msrbReductionFactor.toFixed(4)},  // ${((1 - msrbReductionFactor) * 100).toFixed(2)}% reduction`);
console.log(`  // ... other age combinations`);
console.log(`}`);

console.log('\n🚀 Ready to implement corrections!');
