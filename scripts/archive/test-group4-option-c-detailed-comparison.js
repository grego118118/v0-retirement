#!/usr/bin/env node

/**
 * Detailed comparison of Group 4 Option C results vs MSRB official calculator
 * Based on the screenshots provided by the user
 */

console.log('🔍 Group 4 Option C Detailed Comparison Analysis\n');

// MSRB Official Results from screenshots
const msrbOfficialResults = {
  scenario: {
    birthYear: 1973,
    currentAge: 52,
    retirementAge: 52,
    yearsOfService: 28,
    projectedYearsAtRetirement: 28.0,
    averageSalary: 95000,
    group: "GROUP_4",
    beneficiaryAge: 50,
    serviceEntry: "before_2012"
  },
  calculations: {
    benefitFactor: 0.022, // 2.2%
    totalBenefitPercentage: 0.616, // 61.6%
    baseAnnualPension: 58520,
    optionA: {
      annual: 58520,
      monthly: 4877
    },
    optionB: {
      annual: 57934.8,
      monthly: 4828,
      reduction: 1.0 // 1.0%
    },
    optionC: {
      annual: 54394.34,
      monthly: 4533,
      reduction: 7.1, // 7.1%
      survivorAnnual: 36262.893,
      survivorMonthly: 3022
    }
  }
};

// Our system's calculation simulation
function simulateOurCalculation(scenario) {
  const { currentAge, yearsOfService, averageSalary, beneficiaryAge } = scenario;
  
  // Get benefit factor
  const GROUP_4_FACTORS = { 50: 0.02, 51: 0.021, 52: 0.022, 53: 0.023, 54: 0.024, 55: 0.025 };
  const benefitFactor = GROUP_4_FACTORS[currentAge] || 0;
  
  // Calculate base pension
  const benefitPercentage = yearsOfService * benefitFactor;
  const basePension = averageSalary * benefitPercentage;
  
  // Option A (no reduction)
  const optionA = {
    annual: basePension,
    monthly: basePension / 12
  };
  
  // Option B (age-based reduction)
  // For age 52, interpolate between age 50 (1%) and age 60 (3%)
  const age50Reduction = 0.01;
  const age60Reduction = 0.03;
  const agePosition = (currentAge - 50) / (60 - 50);
  const optionBReduction = age50Reduction + (agePosition * (age60Reduction - age50Reduction));
  
  const optionB = {
    annual: basePension * (1 - optionBReduction),
    monthly: (basePension * (1 - optionBReduction)) / 12,
    reduction: optionBReduction * 100
  };
  
  // Option C (joint & survivor)
  // For age 52/50, we need to find the closest match or use approximation
  const OPTION_C_PERCENTAGES_OF_A = {
    "55-55": 0.9295,  // 7.05% reduction
    "65-55": 0.84,    // 16% reduction
    "65-65": 0.89,    // 11% reduction
    "70-65": 0.83,    // 17% reduction
    "70-70": 0.86     // 14% reduction
  };
  
  const key = `${currentAge}-${beneficiaryAge}`;
  let optionCFactor = OPTION_C_PERCENTAGES_OF_A[key];
  
  if (!optionCFactor) {
    // Find closest member age
    const memberAges = [55, 65, 70];
    const closestMemberAge = memberAges.reduce((prev, curr) => 
      Math.abs(curr - currentAge) < Math.abs(prev - currentAge) ? curr : prev
    );
    
    // Use the closest available factor
    const approximateKey = Object.keys(OPTION_C_PERCENTAGES_OF_A).find(k => 
      k.startsWith(closestMemberAge + "-")
    );
    
    if (approximateKey) {
      optionCFactor = OPTION_C_PERCENTAGES_OF_A[approximateKey];
    } else {
      optionCFactor = 0.88; // General approximation
    }
  }
  
  const optionCMemberPension = basePension * optionCFactor;
  const optionCSurvivorPension = optionCMemberPension * (2/3); // 66.67%
  
  const optionC = {
    annual: optionCMemberPension,
    monthly: optionCMemberPension / 12,
    reduction: (1 - optionCFactor) * 100,
    survivorAnnual: optionCSurvivorPension,
    survivorMonthly: optionCSurvivorPension / 12,
    factor: optionCFactor
  };
  
  return {
    benefitFactor,
    benefitPercentage,
    basePension,
    optionA,
    optionB,
    optionC
  };
}

// Run the comparison
console.log('📊 MSRB Official vs Our System Comparison:\n');

const ourResults = simulateOurCalculation(msrbOfficialResults.scenario);

console.log('🎯 Scenario Details:');
console.log(`   Group 4, Age ${msrbOfficialResults.scenario.currentAge}, ${msrbOfficialResults.scenario.yearsOfService} years of service`);
console.log(`   Average Salary: $${msrbOfficialResults.scenario.averageSalary.toLocaleString()}`);
console.log(`   Beneficiary Age: ${msrbOfficialResults.scenario.beneficiaryAge}`);
console.log('');

console.log('📋 Base Calculation Comparison:');
console.log(`   Benefit Factor:`);
console.log(`     MSRB Official: ${(msrbOfficialResults.calculations.benefitFactor * 100).toFixed(1)}%`);
console.log(`     Our System: ${(ourResults.benefitFactor * 100).toFixed(1)}%`);
console.log(`     Match: ${Math.abs(msrbOfficialResults.calculations.benefitFactor - ourResults.benefitFactor) < 0.001 ? '✅' : '❌'}`);

console.log(`   Total Benefit Percentage:`);
console.log(`     MSRB Official: ${(msrbOfficialResults.calculations.totalBenefitPercentage * 100).toFixed(1)}%`);
console.log(`     Our System: ${(ourResults.benefitPercentage * 100).toFixed(1)}%`);
console.log(`     Match: ${Math.abs(msrbOfficialResults.calculations.totalBenefitPercentage - ourResults.benefitPercentage) < 0.001 ? '✅' : '❌'}`);

console.log(`   Base Annual Pension:`);
console.log(`     MSRB Official: $${msrbOfficialResults.calculations.baseAnnualPension.toLocaleString()}`);
console.log(`     Our System: $${Math.round(ourResults.basePension).toLocaleString()}`);
console.log(`     Match: ${Math.abs(msrbOfficialResults.calculations.baseAnnualPension - ourResults.basePension) < 1 ? '✅' : '❌'}`);
console.log('');

console.log('🔄 Option A Comparison:');
console.log(`   Annual Benefit:`);
console.log(`     MSRB Official: $${msrbOfficialResults.calculations.optionA.annual.toLocaleString()}`);
console.log(`     Our System: $${Math.round(ourResults.optionA.annual).toLocaleString()}`);
console.log(`     Match: ${Math.abs(msrbOfficialResults.calculations.optionA.annual - ourResults.optionA.annual) < 1 ? '✅' : '❌'}`);

console.log(`   Monthly Benefit:`);
console.log(`     MSRB Official: $${msrbOfficialResults.calculations.optionA.monthly.toLocaleString()}`);
console.log(`     Our System: $${Math.round(ourResults.optionA.monthly).toLocaleString()}`);
console.log(`     Match: ${Math.abs(msrbOfficialResults.calculations.optionA.monthly - ourResults.optionA.monthly) < 1 ? '✅' : '❌'}`);
console.log('');

console.log('🔄 Option B Comparison:');
console.log(`   Annual Benefit:`);
console.log(`     MSRB Official: $${msrbOfficialResults.calculations.optionB.annual.toLocaleString()}`);
console.log(`     Our System: $${Math.round(ourResults.optionB.annual).toLocaleString()}`);
console.log(`     Match: ${Math.abs(msrbOfficialResults.calculations.optionB.annual - ourResults.optionB.annual) < 10 ? '✅' : '❌'}`);

console.log(`   Reduction Percentage:`);
console.log(`     MSRB Official: ${msrbOfficialResults.calculations.optionB.reduction.toFixed(1)}%`);
console.log(`     Our System: ${ourResults.optionB.reduction.toFixed(1)}%`);
console.log(`     Match: ${Math.abs(msrbOfficialResults.calculations.optionB.reduction - ourResults.optionB.reduction) < 0.1 ? '✅' : '❌'}`);
console.log('');

console.log('🔄 Option C Comparison (CRITICAL):');
console.log(`   Annual Benefit:`);
console.log(`     MSRB Official: $${msrbOfficialResults.calculations.optionC.annual.toLocaleString()}`);
console.log(`     Our System: $${Math.round(ourResults.optionC.annual).toLocaleString()}`);
console.log(`     Difference: $${Math.abs(msrbOfficialResults.calculations.optionC.annual - ourResults.optionC.annual).toLocaleString()}`);
console.log(`     Match: ${Math.abs(msrbOfficialResults.calculations.optionC.annual - ourResults.optionC.annual) < 10 ? '✅' : '❌'}`);

console.log(`   Monthly Benefit:`);
console.log(`     MSRB Official: $${msrbOfficialResults.calculations.optionC.monthly.toLocaleString()}`);
console.log(`     Our System: $${Math.round(ourResults.optionC.monthly).toLocaleString()}`);
console.log(`     Difference: $${Math.abs(msrbOfficialResults.calculations.optionC.monthly - ourResults.optionC.monthly).toLocaleString()}`);
console.log(`     Match: ${Math.abs(msrbOfficialResults.calculations.optionC.monthly - ourResults.optionC.monthly) < 1 ? '✅' : '❌'}`);

console.log(`   Reduction Percentage:`);
console.log(`     MSRB Official: ${msrbOfficialResults.calculations.optionC.reduction.toFixed(1)}%`);
console.log(`     Our System: ${ourResults.optionC.reduction.toFixed(1)}%`);
console.log(`     Difference: ${Math.abs(msrbOfficialResults.calculations.optionC.reduction - ourResults.optionC.reduction).toFixed(1)}%`);
console.log(`     Match: ${Math.abs(msrbOfficialResults.calculations.optionC.reduction - ourResults.optionC.reduction) < 0.1 ? '✅' : '❌'}`);

console.log(`   Survivor Annual Benefit:`);
console.log(`     MSRB Official: $${msrbOfficialResults.calculations.optionC.survivorAnnual.toLocaleString()}`);
console.log(`     Our System: $${Math.round(ourResults.optionC.survivorAnnual).toLocaleString()}`);
console.log(`     Difference: $${Math.abs(msrbOfficialResults.calculations.optionC.survivorAnnual - ourResults.optionC.survivorAnnual).toLocaleString()}`);
console.log(`     Match: ${Math.abs(msrbOfficialResults.calculations.optionC.survivorAnnual - ourResults.optionC.survivorAnnual) < 10 ? '✅' : '❌'}`);

console.log(`   Survivor Monthly Benefit:`);
console.log(`     MSRB Official: $${msrbOfficialResults.calculations.optionC.survivorMonthly.toLocaleString()}`);
console.log(`     Our System: $${Math.round(ourResults.optionC.survivorMonthly).toLocaleString()}`);
console.log(`     Difference: $${Math.abs(msrbOfficialResults.calculations.optionC.survivorMonthly - ourResults.optionC.survivorMonthly).toLocaleString()}`);
console.log(`     Match: ${Math.abs(msrbOfficialResults.calculations.optionC.survivorMonthly - ourResults.optionC.survivorMonthly) < 1 ? '✅' : '❌'}`);
console.log('');

console.log('🔍 Root Cause Analysis:');
console.log(`   Option C Factor Used: ${ourResults.optionC.factor.toFixed(4)}`);
console.log(`   Expected MSRB Factor: ${(msrbOfficialResults.calculations.optionC.annual / msrbOfficialResults.calculations.baseAnnualPension).toFixed(4)}`);

const expectedMSRBFactor = msrbOfficialResults.calculations.optionC.annual / msrbOfficialResults.calculations.baseAnnualPension;
console.log(`   Factor Difference: ${Math.abs(ourResults.optionC.factor - expectedMSRBFactor).toFixed(4)}`);

console.log('\n🎯 Key Findings:');
if (Math.abs(ourResults.optionC.factor - expectedMSRBFactor) > 0.01) {
  console.log('❌ ISSUE IDENTIFIED: Option C reduction factor mismatch');
  console.log(`   Our system uses: ${ourResults.optionC.factor.toFixed(4)} (${(ourResults.optionC.reduction).toFixed(1)}% reduction)`);
  console.log(`   MSRB uses: ${expectedMSRBFactor.toFixed(4)} (${((1 - expectedMSRBFactor) * 100).toFixed(1)}% reduction)`);
  console.log('   This suggests missing or incorrect age-specific factors for Group 4');
} else {
  console.log('✅ Option C reduction factors appear correct');
}

console.log('\n🔧 Recommended Fixes:');
console.log('1. Add specific Option C reduction factors for Group 4 ages 50-54');
console.log('2. Verify MSRB official factors for member/beneficiary age combinations');
console.log('3. Update OPTION_C_PERCENTAGES_OF_A table with Group 4-specific values');
console.log('4. Test all Group 4 scenarios against MSRB calculator');

console.log('\n📋 Missing Age Combinations in OPTION_C_PERCENTAGES_OF_A:');
console.log('   "50-50": Need official MSRB factor');
console.log('   "51-50": Need official MSRB factor');
console.log('   "52-50": Need official MSRB factor (current scenario)');
console.log('   "53-50": Need official MSRB factor');
console.log('   "54-50": Need official MSRB factor');
console.log('   Plus combinations with other beneficiary ages...');
