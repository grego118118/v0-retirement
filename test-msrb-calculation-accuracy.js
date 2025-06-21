#!/usr/bin/env node

/**
 * Test script to verify our calculations match official MSRB results
 * Based on the screenshots provided showing discrepancies
 */

// Import the calculation functions
const { 
  getBenefitFactor, 
  calculatePensionWithOption,
  checkEligibility 
} = require('./lib/pension-calculations.ts');

console.log('🧪 Testing MSRB Calculation Accuracy...\n');

// Test data from the screenshots
const testScenario = {
  age: 55,
  yearsOfService: 31.0,
  group: "GROUP_2",
  serviceEntry: "before_2012", // Assuming before April 2, 2012 based on 31 years of service
  averageSalary: 95000,
  retirementOption: "C",
  beneficiaryAge: "55"
};

console.log('📊 Test Scenario (from MSRB screenshots):');
console.log(`   Age at Retirement: ${testScenario.age}`);
console.log(`   Years of Service: ${testScenario.yearsOfService}`);
console.log(`   Employee Group: ${testScenario.group}`);
console.log(`   Average Salary: $${testScenario.averageSalary.toLocaleString()}`);
console.log(`   Retirement Option: ${testScenario.retirementOption}`);
console.log(`   Beneficiary Age: ${testScenario.beneficiaryAge}`);

console.log('\n🎯 MSRB Official Results:');
console.log('   Option A: $58,900.00 annual / $4,908.33 monthly');
console.log('   Option B: $58,311.00 annual / $4,859.25 monthly');
console.log('   Option C: $54,747.55 annual / $4,562.30 monthly');
console.log('   Survivor: $36,498.37 annual / $3,041.53 monthly');

console.log('\n🔍 Our Calculation Analysis:');

// Test 1: Check eligibility
console.log('\n1️⃣ Eligibility Check:');
try {
  const eligibility = checkEligibility(testScenario.age, testScenario.yearsOfService, testScenario.group, testScenario.serviceEntry);
  console.log(`   ✅ Eligible: ${eligibility.eligible}`);
  if (!eligibility.eligible) {
    console.log(`   ❌ Message: ${eligibility.message}`);
  }
} catch (error) {
  console.log(`   ❌ Error checking eligibility: ${error.message}`);
}

// Test 2: Get benefit factor
console.log('\n2️⃣ Benefit Factor:');
try {
  const benefitFactor = getBenefitFactor(testScenario.age, testScenario.group, testScenario.serviceEntry, testScenario.yearsOfService);
  console.log(`   Factor: ${benefitFactor} (${(benefitFactor * 100).toFixed(1)}%)`);
  
  // Calculate expected base pension
  const expectedBasePension = testScenario.averageSalary * testScenario.yearsOfService * benefitFactor;
  console.log(`   Expected Base Calculation: $${testScenario.averageSalary.toLocaleString()} × ${testScenario.yearsOfService} × ${benefitFactor} = $${expectedBasePension.toFixed(2)}`);
  
  // Check if this matches MSRB Option A result
  const msrbOptionA = 58900;
  const difference = Math.abs(expectedBasePension - msrbOptionA);
  const percentDiff = (difference / msrbOptionA * 100).toFixed(2);
  
  if (difference < 1) {
    console.log(`   ✅ Matches MSRB Option A: $${expectedBasePension.toFixed(2)} ≈ $${msrbOptionA.toFixed(2)}`);
  } else {
    console.log(`   ❌ Differs from MSRB Option A: $${expectedBasePension.toFixed(2)} vs $${msrbOptionA.toFixed(2)} (${percentDiff}% difference)`);
  }
} catch (error) {
  console.log(`   ❌ Error getting benefit factor: ${error.message}`);
}

// Test 3: Option calculations
console.log('\n3️⃣ Retirement Option Calculations:');

// Calculate base pension for options
const benefitFactor = 0.02; // Group 2 at age 55 should be 2.0%
const basePension = testScenario.averageSalary * testScenario.yearsOfService * benefitFactor;

console.log(`   Base Pension: $${basePension.toFixed(2)}`);

// Test Option A
try {
  const optionA = calculatePensionWithOption(basePension, "A", testScenario.age, "");
  console.log(`   Option A: $${optionA.pension.toFixed(2)} annual / $${(optionA.pension / 12).toFixed(2)} monthly`);
  
  const msrbA = 58900;
  const diffA = Math.abs(optionA.pension - msrbA);
  if (diffA < 1) {
    console.log(`   ✅ Option A matches MSRB`);
  } else {
    console.log(`   ❌ Option A differs by $${diffA.toFixed(2)}`);
  }
} catch (error) {
  console.log(`   ❌ Error calculating Option A: ${error.message}`);
}

// Test Option B
try {
  const optionB = calculatePensionWithOption(basePension, "B", testScenario.age, "");
  console.log(`   Option B: $${optionB.pension.toFixed(2)} annual / $${(optionB.pension / 12).toFixed(2)} monthly`);
  
  const msrbB = 58311;
  const diffB = Math.abs(optionB.pension - msrbB);
  if (diffB < 1) {
    console.log(`   ✅ Option B matches MSRB`);
  } else {
    console.log(`   ❌ Option B differs by $${diffB.toFixed(2)}`);
  }
} catch (error) {
  console.log(`   ❌ Error calculating Option B: ${error.message}`);
}

// Test Option C
try {
  const optionC = calculatePensionWithOption(basePension, "C", testScenario.age, testScenario.beneficiaryAge);
  console.log(`   Option C: $${optionC.pension.toFixed(2)} annual / $${(optionC.pension / 12).toFixed(2)} monthly`);
  console.log(`   Survivor: $${optionC.survivorPension.toFixed(2)} annual / $${(optionC.survivorPension / 12).toFixed(2)} monthly`);
  
  const msrbC = 54747.55;
  const msrbSurvivor = 36498.37;
  const diffC = Math.abs(optionC.pension - msrbC);
  const diffSurvivor = Math.abs(optionC.survivorPension - msrbSurvivor);
  
  if (diffC < 1) {
    console.log(`   ✅ Option C matches MSRB`);
  } else {
    console.log(`   ❌ Option C differs by $${diffC.toFixed(2)}`);
  }
  
  if (diffSurvivor < 1) {
    console.log(`   ✅ Survivor benefit matches MSRB`);
  } else {
    console.log(`   ❌ Survivor benefit differs by $${diffSurvivor.toFixed(2)}`);
  }
  
  // Check reduction percentage
  const reductionPercent = ((basePension - optionC.pension) / basePension * 100);
  console.log(`   Option C Reduction: ${reductionPercent.toFixed(2)}% (MSRB shows ~7.06%)`);
  
  // Check survivor percentage
  const survivorPercent = (optionC.survivorPension / optionC.pension * 100);
  console.log(`   Survivor Percentage: ${survivorPercent.toFixed(2)}% (should be 66.67%)`);
  
} catch (error) {
  console.log(`   ❌ Error calculating Option C: ${error.message}`);
}

console.log('\n📋 Analysis Summary:');
console.log('🔍 Key Issues to Address:');
console.log('1. Verify Group 2 benefit factor is exactly 2.0% at age 55');
console.log('2. Ensure Option C reduction factor is 0.9294 for ages 55/55');
console.log('3. Confirm survivor benefit is exactly 66.67% of retiree benefit');
console.log('4. Check that base calculation uses: Salary × YOS × Factor');

console.log('\n🎯 Expected MSRB Formula:');
console.log('Base Pension = $95,000 × 31 × 0.02 = $58,900');
console.log('Option C = $58,900 × 0.9294 = $54,747.55');
console.log('Survivor = $54,747.55 × 0.6667 = $36,498.37');

console.log('\n🚀 Next Steps:');
console.log('1. Update Option C reduction factor for ages 55/55');
console.log('2. Verify all benefit factor tables match MSRB guidelines');
console.log('3. Test with additional scenarios to ensure accuracy');
console.log('4. Update any components using simplified calculations');
