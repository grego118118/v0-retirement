#!/usr/bin/env node

/**
 * MSRB Calculation Accuracy Test Suite
 * Tests specific Group 2 scenarios with varying years of service and survivor ages
 * Based on official MSRB calculator results
 */

// Import the calculation functions
const {
  getBenefitFactor,
  calculatePensionWithOption,
  checkEligibility
} = require('./lib/pension-calculations.ts');

console.log('🧪 Testing MSRB Calculation Accuracy - Group 2 Scenarios...\n');

// Test scenarios with varying years of service and survivor ages
const testScenarios = [
  {
    name: "Scenario 1",
    age: 56,
    yearsOfService: 32,
    survivorAge: 54,
    group: "GROUP_2",
    serviceEntry: "before_2012",
    averageSalary: 95000,
    expectedBenefitFactor: 0.021, // 2.1%
    msrbResults: {
      optionA: 63840.00,
      optionB: 63201.60,
      optionC: 59071.15,
      survivor: 39380.77
    }
  },
  {
    name: "Scenario 2",
    age: 57,
    yearsOfService: 33,
    survivorAge: 55,
    group: "GROUP_2",
    serviceEntry: "before_2012",
    averageSalary: 95000,
    expectedBenefitFactor: 0.022, // 2.2%
    msrbResults: {
      optionA: 68970.00,
      optionB: 68280.30,
      optionC: 63514.47,
      survivor: 42342.98
    }
  },
  {
    name: "Scenario 3",
    age: 58,
    yearsOfService: 34,
    survivorAge: 56,
    group: "GROUP_2",
    serviceEntry: "before_2012",
    averageSalary: 95000,
    expectedBenefitFactor: 0.023, // 2.3%
    msrbResults: {
      optionA: 74290.00,
      optionB: 73547.10,
      optionC: 68071.93,
      survivor: 45381.28
    }
  },
  {
    name: "Scenario 4",
    age: 59,
    yearsOfService: 34,
    survivorAge: 57,
    group: "GROUP_2",
    serviceEntry: "before_2012",
    averageSalary: 95000,
    expectedBenefitFactor: 0.024, // 2.4%
    msrbResults: {
      optionA: 76000.00,
      optionB: 75240.00,
      optionC: 69274.00,
      survivor: 46182.67
    }
  }
];

// MSRB Official Results for age 55 (reference scenario)
const msrbReferenceResults = {
  55: {
    optionA: 58900.00,
    optionB: 58311.00,
    optionC: 54747.55,
    survivor: 36498.37
  }
};

console.log('📊 Testing Age Range 55-59 for Group 2 Calculations');
console.log('=' .repeat(60));

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
  console.log(`   Retirement Option: ${testScenario.retirementOption}`);
  console.log(`   Beneficiary Age: ${testScenario.beneficiaryAge}`);

  // Test 1: Check eligibility
  console.log('\n  1️⃣ Eligibility Check:');
  try {
    const eligibility = checkEligibility(testScenario.age, testScenario.yearsOfService, testScenario.group, testScenario.serviceEntry);
    console.log(`     ✅ Eligible: ${eligibility.eligible}`);
    if (!eligibility.eligible) {
      console.log(`     ❌ Message: ${eligibility.message}`);
    }
  } catch (error) {
    console.log(`     ❌ Error checking eligibility: ${error.message}`);
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
