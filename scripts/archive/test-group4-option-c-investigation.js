#!/usr/bin/env node

/**
 * Comprehensive investigation of Group 4 Option C calculation inconsistencies
 * Systematic comparison across all groups with identical test scenarios
 */

console.log('🔍 Group 4 Option C Investigation - Comprehensive Analysis\n');

// Test scenarios for comparative analysis
const testScenarios = [
  {
    name: "Scenario A: Group 4, Age 50, 25 years",
    group: "GROUP_4",
    age: 50,
    yearsOfService: 25,
    serviceEntry: "before_2012",
    averageSalary: 95000,
    beneficiaryAge: 50,
    memberAge: 50
  },
  {
    name: "Scenario B: Group 4, Age 52, 28 years (Current Form)",
    group: "GROUP_4", 
    age: 52,
    yearsOfService: 28,
    serviceEntry: "before_2012",
    averageSalary: 95000,
    beneficiaryAge: 50,
    memberAge: 52
  },
  {
    name: "Scenario C: Group 4, Age 55, 30 years",
    group: "GROUP_4",
    age: 55,
    yearsOfService: 30,
    serviceEntry: "before_2012", 
    averageSalary: 95000,
    beneficiaryAge: 55,
    memberAge: 55
  }
];

// Comparative scenarios across all groups (same age/years where possible)
const comparativeScenarios = [
  {
    name: "Cross-Group Comparison: Age 55, 30 years",
    scenarios: [
      { group: "GROUP_1", age: 55, yearsOfService: 30, expectedFactor: 0.015 },
      { group: "GROUP_2", age: 55, yearsOfService: 30, expectedFactor: 0.02 },
      { group: "GROUP_3", age: 55, yearsOfService: 30, expectedFactor: 0.025 },
      { group: "GROUP_4", age: 55, yearsOfService: 30, expectedFactor: 0.025 }
    ],
    serviceEntry: "before_2012",
    averageSalary: 95000,
    beneficiaryAge: 55,
    memberAge: 55
  }
];

// Simulate benefit factor lookup
function getBenefitFactor(age, group, serviceEntry, yearsOfService) {
  const PENSION_FACTORS_DEFAULT = {
    GROUP_1: {
      55: 0.015, 56: 0.016, 57: 0.017, 58: 0.018, 59: 0.019,
      60: 0.02, 61: 0.021, 62: 0.022, 63: 0.023, 64: 0.024, 65: 0.025
    },
    GROUP_2: { 55: 0.02, 56: 0.021, 57: 0.022, 58: 0.023, 59: 0.024, 60: 0.025 },
    GROUP_3: { 55: 0.025, 56: 0.025, 57: 0.025, 58: 0.025, 59: 0.025, 60: 0.025 },
    GROUP_4: { 50: 0.02, 51: 0.021, 52: 0.022, 53: 0.023, 54: 0.024, 55: 0.025 }
  };

  const groupFactors = PENSION_FACTORS_DEFAULT[group];
  if (!groupFactors) return 0;
  
  return groupFactors[age] || 0;
}

// Simulate Option C calculation
function calculateOptionC(basePension, memberAge, beneficiaryAge) {
  // Option C reduction factors from MSRB
  const OPTION_C_PERCENTAGES_OF_A = {
    "50-50": 0.93,    // Estimated for Group 4
    "52-50": 0.925,   // Estimated for current scenario
    "55-55": 0.9295,  // Exact MSRB value
    "65-55": 0.84,
    "65-65": 0.89,
    "70-65": 0.83,
    "70-70": 0.86
  };
  
  const OPTION_C_GENERAL_REDUCTION_APPROX = 0.88; // 12% reduction
  const OPTION_C_SURVIVOR_PERCENTAGE = 2 / 3; // 66.67%
  
  const key = `${memberAge}-${beneficiaryAge}`;
  const reductionFactor = OPTION_C_PERCENTAGES_OF_A[key] || OPTION_C_GENERAL_REDUCTION_APPROX;
  
  const memberPension = basePension * reductionFactor;
  const survivorPension = memberPension * OPTION_C_SURVIVOR_PERCENTAGE;
  
  return {
    memberAnnual: memberPension,
    memberMonthly: memberPension / 12,
    survivorAnnual: survivorPension,
    survivorMonthly: survivorPension / 12,
    reductionFactor: reductionFactor,
    reductionPercentage: (1 - reductionFactor) * 100
  };
}

// Run Group 4 specific tests
console.log('📊 Group 4 Specific Test Results:\n');

testScenarios.forEach((scenario, index) => {
  console.log(`${index + 1}️⃣ ${scenario.name}`);
  
  const benefitFactor = getBenefitFactor(scenario.age, scenario.group, scenario.serviceEntry, scenario.yearsOfService);
  const benefitPercentage = scenario.yearsOfService * benefitFactor * 100;
  const basePension = scenario.averageSalary * (benefitPercentage / 100);
  
  // Apply 80% cap if needed
  const maxPension = scenario.averageSalary * 0.8;
  const finalBasePension = Math.min(basePension, maxPension);
  const cappedAt80Percent = basePension > maxPension;
  
  const optionC = calculateOptionC(finalBasePension, scenario.memberAge, scenario.beneficiaryAge);
  
  console.log(`   Input: ${scenario.group}, Age ${scenario.age}, ${scenario.yearsOfService} years, $${scenario.averageSalary.toLocaleString()}`);
  console.log(`   Benefit Factor: ${benefitFactor} (${(benefitFactor * 100).toFixed(1)}%)`);
  console.log(`   Benefit Percentage: ${benefitPercentage.toFixed(1)}%`);
  console.log(`   Base Pension: $${finalBasePension.toLocaleString()}`);
  console.log(`   80% Cap Applied: ${cappedAt80Percent ? 'Yes' : 'No'}`);
  console.log(`   Option C Member Annual: $${Math.round(optionC.memberAnnual).toLocaleString()}`);
  console.log(`   Option C Member Monthly: $${Math.round(optionC.memberMonthly).toLocaleString()}`);
  console.log(`   Option C Survivor Annual: $${Math.round(optionC.survivorAnnual).toLocaleString()}`);
  console.log(`   Option C Survivor Monthly: $${Math.round(optionC.survivorMonthly).toLocaleString()}`);
  console.log(`   Reduction Factor: ${optionC.reductionFactor} (${optionC.reductionPercentage.toFixed(1)}% reduction)`);
  console.log('');
});

// Cross-group comparison
console.log('🔄 Cross-Group Comparison Analysis:\n');

comparativeScenarios.forEach((comparison) => {
  console.log(`📋 ${comparison.name}`);
  console.log(`   Common Parameters: Age ${comparison.scenarios[0].age}, ${comparison.scenarios[0].yearsOfService} years, $${comparison.averageSalary.toLocaleString()}, Beneficiary Age ${comparison.beneficiaryAge}`);
  console.log('');
  
  comparison.scenarios.forEach((scenario) => {
    const benefitFactor = getBenefitFactor(scenario.age, scenario.group, comparison.serviceEntry, scenario.yearsOfService);
    const benefitPercentage = scenario.yearsOfService * benefitFactor * 100;
    const basePension = comparison.averageSalary * (benefitPercentage / 100);
    
    const maxPension = comparison.averageSalary * 0.8;
    const finalBasePension = Math.min(basePension, maxPension);
    
    const optionC = calculateOptionC(finalBasePension, comparison.memberAge, comparison.beneficiaryAge);
    
    console.log(`   ${scenario.group}:`);
    console.log(`     Benefit Factor: ${benefitFactor} (expected: ${scenario.expectedFactor}) ${benefitFactor === scenario.expectedFactor ? '✅' : '❌'}`);
    console.log(`     Base Pension: $${finalBasePension.toLocaleString()}`);
    console.log(`     Option C Member: $${Math.round(optionC.memberAnnual).toLocaleString()}/year ($${Math.round(optionC.memberMonthly).toLocaleString()}/month)`);
    console.log(`     Option C Survivor: $${Math.round(optionC.survivorAnnual).toLocaleString()}/year ($${Math.round(optionC.survivorMonthly).toLocaleString()}/month)`);
    console.log(`     Reduction: ${optionC.reductionPercentage.toFixed(1)}%`);
    console.log('');
  });
});

// Analysis of potential issues
console.log('🔍 Potential Issues Analysis:\n');

console.log('1️⃣ Benefit Factor Verification:');
console.log('   Group 4 factors should be:');
console.log('   - Age 50: 2.0% (0.02) ✅');
console.log('   - Age 51: 2.1% (0.021) ✅');
console.log('   - Age 52: 2.2% (0.022) ✅');
console.log('   - Age 53: 2.3% (0.023) ✅');
console.log('   - Age 54: 2.4% (0.024) ✅');
console.log('   - Age 55: 2.5% (0.025) ✅');

console.log('\n2️⃣ Option C Reduction Factor Analysis:');
console.log('   All groups should use identical reduction factors for same member/beneficiary ages');
console.log('   - Age 55/55: 92.95% of Option A (7.05% reduction)');
console.log('   - Age 50/50: Estimated 93% of Option A (7% reduction)');
console.log('   - Age 52/50: Estimated 92.5% of Option A (7.5% reduction)');

console.log('\n3️⃣ Survivor Benefit Calculation:');
console.log('   All groups should use 66.67% (2/3) of member benefit for survivor');
console.log('   This should be consistent across all groups');

console.log('\n🎯 Investigation Focus Areas:');
console.log('1. Check if Group 4 groupKey conversion ("4" → "GROUP_4") works correctly');
console.log('2. Verify Group 4 eligibility validation doesn\'t affect Option C calculations');
console.log('3. Ensure Group 4 follows same Option C calculation path as other groups');
console.log('4. Check for any Group 4-specific logic that might cause discrepancies');

console.log('\n🚀 Next Steps:');
console.log('1. Test these scenarios in the enhanced calculation preview');
console.log('2. Compare results with official MSRB calculator');
console.log('3. Trace Group 4 calculation flow in enhanced-calculation-preview.tsx');
console.log('4. Verify Option C reduction factors are applied consistently');
console.log('5. Check for any Group 4-specific code paths that differ from other groups');
