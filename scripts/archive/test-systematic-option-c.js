#!/usr/bin/env node

/**
 * Test the systematic Option C implementation
 * Validates that the new age combination lookup system works correctly
 */

console.log('🎯 TESTING SYSTEMATIC OPTION C IMPLEMENTATION');
console.log('=' .repeat(60));

// Import the updated calculation function
const { calculatePensionWithOption } = require('./lib/pension-calculations.ts');

// Test scenarios with different age combinations
const testScenarios = [
  {
    name: "Age 55-53 (2-year gap) - MSRB Validated",
    basePension: 58900,
    memberAge: 55,
    beneficiaryAge: "53",
    expectedReductionFactor: 0.9295,
    expectedMember: 54747.55,
    expectedSurvivor: 36498.37
  },
  {
    name: "Age 58-56 (2-year gap) - MSRB Validated", 
    basePension: 74290,
    memberAge: 58,
    beneficiaryAge: "56",
    expectedReductionFactor: 0.9163,
    expectedMember: 68071.93,
    expectedSurvivor: 45381.28
  },
  {
    name: "Age 59-57 (2-year gap) - MSRB Validated",
    basePension: 72380.95,
    memberAge: 59,
    beneficiaryAge: "57", 
    expectedReductionFactor: 0.9570750314827313,
    expectedMember: 69274.00,
    expectedSurvivor: 46182.67
  },
  {
    name: "Age 55-55 (same age) - MSRB Official",
    basePension: 60000,
    memberAge: 55,
    beneficiaryAge: "55",
    expectedReductionFactor: 0.94,
    expectedMember: 56400,
    expectedSurvivor: 37600
  },
  {
    name: "Age 65-55 (10-year gap) - MSRB Official",
    basePension: 70000,
    memberAge: 65,
    beneficiaryAge: "55",
    expectedReductionFactor: 0.84,
    expectedMember: 58800,
    expectedSurvivor: 39200
  },
  {
    name: "Age 60-58 (fallback to age-specific)",
    basePension: 65000,
    memberAge: 60,
    beneficiaryAge: "58",
    expectedReductionFactor: 0.9295, // Should fallback to default
    expectedMember: 60417.5,
    expectedSurvivor: 40278.33
  }
];

console.log('\n📊 SYSTEMATIC OPTION C TEST RESULTS:\n');

let passedTests = 0;
let totalTests = testScenarios.length;

testScenarios.forEach((scenario, index) => {
  console.log(`${index + 1}. ${scenario.name}`);
  console.log('-'.repeat(50));
  
  try {
    const result = calculatePensionWithOption(
      scenario.basePension,
      "C",
      scenario.memberAge,
      scenario.beneficiaryAge
    );
    
    const memberPension = result.pension;
    const survivorPension = result.survivorPension;
    const actualReductionFactor = memberPension / scenario.basePension;
    
    console.log(`Input: $${scenario.basePension.toLocaleString()} base, ages ${scenario.memberAge}/${scenario.beneficiaryAge}`);
    console.log(`Expected: Member $${scenario.expectedMember.toLocaleString()}, Survivor $${scenario.expectedSurvivor.toLocaleString()}`);
    console.log(`Actual:   Member $${memberPension.toFixed(2)}, Survivor $${survivorPension.toFixed(2)}`);
    console.log(`Reduction Factor: Expected ${scenario.expectedReductionFactor.toFixed(4)}, Actual ${actualReductionFactor.toFixed(4)}`);
    
    // Check if results match expectations (within $1 tolerance)
    const memberMatch = Math.abs(memberPension - scenario.expectedMember) < 1.0;
    const survivorMatch = Math.abs(survivorPension - scenario.expectedSurvivor) < 1.0;
    const factorMatch = Math.abs(actualReductionFactor - scenario.expectedReductionFactor) < 0.0001;
    
    const allMatch = memberMatch && survivorMatch && factorMatch;
    
    console.log(`Member Match: ${memberMatch ? '✅' : '❌'}`);
    console.log(`Survivor Match: ${survivorMatch ? '✅' : '❌'}`);
    console.log(`Factor Match: ${factorMatch ? '✅' : '❌'}`);
    console.log(`Overall: ${allMatch ? '✅ PASSED' : '❌ FAILED'}`);
    
    if (allMatch) {
      passedTests++;
    }
    
  } catch (error) {
    console.log(`❌ ERROR: ${error.message}`);
  }
  
  console.log();
});

console.log('📋 TEST SUMMARY:');
console.log('='.repeat(60));
console.log(`Total Tests: ${totalTests}`);
console.log(`Passed: ${passedTests}`);
console.log(`Failed: ${totalTests - passedTests}`);
console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

if (passedTests === totalTests) {
  console.log('\n🎉 ALL TESTS PASSED!');
  console.log('✅ Systematic Option C implementation is working correctly');
  console.log('✅ Age combination lookup system is functional');
  console.log('✅ Fallback to age-specific factors works');
  console.log('✅ MSRB compliance maintained');
} else {
  console.log('\n⚠️  SOME TESTS FAILED');
  console.log('🔧 Review the implementation for issues');
  console.log('📝 Check age combination lookup logic');
  console.log('🎯 Verify reduction factor calculations');
}

console.log('\n🚀 Next Steps:');
console.log('1. Test the live calculator at http://localhost:3000/calculator');
console.log('2. Verify projection tables show correct Option C amounts');
console.log('3. Validate additional age combinations with MSRB calculator');
console.log('4. Add more age combinations to the lookup table as needed');
console.log('\n✨ Systematic Option C implementation test complete!');
