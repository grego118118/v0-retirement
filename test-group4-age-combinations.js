#!/usr/bin/env node

/**
 * Systematic investigation of Group 4 Option C calculations across all age combinations
 * Comparing our system's results with MSRB official calculator
 */

console.log('🔍 Group 4 Option C Investigation - All Age Combinations\n');

// Group 4 benefit factors (from our system)
const GROUP_4_FACTORS = {
  50: 0.02,   // 2.0%
  51: 0.021,  // 2.1% 
  52: 0.022,  // 2.2%
  53: 0.023,  // 2.3%
  54: 0.024,  // 2.4%
  55: 0.025   // 2.5%
};

// Current Option C reduction factors in our system
const CURRENT_OPTION_C_FACTORS = {
  "50-50": 0.9295,  // 7.05% reduction
  "51-50": 0.9295,  // 7.05% reduction
  "52-50": 0.9295,  // 7.05% reduction (KNOWN INCORRECT)
  "53-50": 0.9295,  // 7.05% reduction
  "54-50": 0.9295,  // 7.05% reduction
  "55-55": 0.9295   // 7.05% reduction
};

// Test scenarios for each Group 4 age
const TEST_SCENARIOS = [
  {
    name: "Group 4 Age 50",
    memberAge: 50,
    beneficiaryAge: 50,
    yearsOfService: 25,  // Typical for age 50 retirement
    averageSalary: 90000,
    serviceEntry: "before_2012"
  },
  {
    name: "Group 4 Age 51", 
    memberAge: 51,
    beneficiaryAge: 50,
    yearsOfService: 26,
    averageSalary: 92000,
    serviceEntry: "before_2012"
  },
  {
    name: "Group 4 Age 52",
    memberAge: 52,
    beneficiaryAge: 50,
    yearsOfService: 28,  // Known scenario from investigation
    averageSalary: 95000,
    serviceEntry: "before_2012"
  },
  {
    name: "Group 4 Age 53",
    memberAge: 53,
    beneficiaryAge: 50,
    yearsOfService: 28,
    averageSalary: 97000,
    serviceEntry: "before_2012"
  },
  {
    name: "Group 4 Age 54",
    memberAge: 54,
    beneficiaryAge: 50,
    yearsOfService: 29,
    averageSalary: 100000,
    serviceEntry: "before_2012"
  },
  {
    name: "Group 4 Age 55",
    memberAge: 55,
    beneficiaryAge: 55,
    yearsOfService: 30,
    averageSalary: 105000,
    serviceEntry: "before_2012"
  }
];

function calculateOurSystemResult(scenario) {
  const { memberAge, beneficiaryAge, yearsOfService, averageSalary } = scenario;
  
  // Get benefit factor
  const benefitFactor = GROUP_4_FACTORS[memberAge];
  if (!benefitFactor) return null;
  
  // Calculate base pension
  const benefitPercentage = yearsOfService * benefitFactor;
  const basePension = averageSalary * benefitPercentage;
  
  // Apply 80% cap
  const maxPension = averageSalary * 0.8;
  const cappedBasePension = Math.min(basePension, maxPension);
  
  // Option A (no reduction)
  const optionA = {
    annual: cappedBasePension,
    monthly: cappedBasePension / 12
  };
  
  // Option C (joint & survivor)
  const key = `${memberAge}-${beneficiaryAge}`;
  const optionCFactor = CURRENT_OPTION_C_FACTORS[key] || 0.9295; // Default to 0.9295
  
  const optionC = {
    annual: cappedBasePension * optionCFactor,
    monthly: (cappedBasePension * optionCFactor) / 12,
    survivorAnnual: (cappedBasePension * optionCFactor) * (2/3),
    survivorMonthly: ((cappedBasePension * optionCFactor) * (2/3)) / 12,
    reductionFactor: optionCFactor,
    reductionPercent: (1 - optionCFactor) * 100
  };
  
  return {
    basePension: cappedBasePension,
    benefitFactor,
    benefitPercentage: benefitPercentage * 100,
    optionA,
    optionC
  };
}

// Run calculations for each scenario
console.log('📊 Our System Calculations:\n');

TEST_SCENARIOS.forEach((scenario, index) => {
  console.log(`${index + 1}. ${scenario.name}`);
  console.log(`   Member Age: ${scenario.memberAge}, Beneficiary Age: ${scenario.beneficiaryAge}`);
  console.log(`   Years of Service: ${scenario.yearsOfService}, Average Salary: $${scenario.averageSalary.toLocaleString()}`);
  
  const result = calculateOurSystemResult(scenario);
  
  if (result) {
    console.log(`   Benefit Factor: ${(result.benefitFactor * 100).toFixed(1)}%`);
    console.log(`   Benefit Percentage: ${result.benefitPercentage.toFixed(1)}%`);
    console.log(`   Base Pension: $${result.basePension.toLocaleString()}`);
    console.log(`   Option A: $${result.optionA.annual.toLocaleString()} annual / $${result.optionA.monthly.toLocaleString()} monthly`);
    console.log(`   Option C: $${result.optionC.annual.toLocaleString()} annual / $${result.optionC.monthly.toLocaleString()} monthly`);
    console.log(`   Option C Reduction: ${result.optionC.reductionPercent.toFixed(1)}% (factor: ${result.optionC.reductionFactor})`);
    console.log(`   Survivor Benefit: $${result.optionC.survivorAnnual.toLocaleString()} annual / $${result.optionC.survivorMonthly.toLocaleString()} monthly`);
  } else {
    console.log(`   ERROR: No benefit factor available for age ${scenario.memberAge}`);
  }
  
  console.log('');
});

console.log('🎯 Next Steps:');
console.log('1. Test each scenario on MSRB official calculator');
console.log('2. Compare MSRB results with our calculations above');
console.log('3. Identify which reduction factors need correction');
console.log('4. Calculate correct factors: MSRB_Option_C / Base_Pension');
console.log('\n📝 Known Issue: Age 52 should produce $55,055.62 (not $54,394.34)');
console.log('   Correct factor for 52-50: 0.9408 (not 0.9295)');
