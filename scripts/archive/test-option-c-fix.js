#!/usr/bin/env node

/**
 * Test the Option C fix to verify calculations match MSRB results
 */

// Import the calculation function
const { calculatePensionWithOption } = require('./lib/pension-calculations.ts');

console.log('🧪 TESTING OPTION C FIX');
console.log('=' .repeat(50));

// Test scenarios based on MSRB data
const testScenarios = [
  {
    name: 'Age 55 (should have 7.05% reduction)',
    basePension: 58900.00,
    memberAge: 55,
    beneficiaryAge: '55',
    expectedMember: 54747.55,  // From MSRB specific calculation
    expectedSurvivor: 36498.37
  },
  {
    name: 'Age 56 (should have no reduction)', 
    basePension: 63840.00,
    memberAge: 56,
    beneficiaryAge: '53',
    expectedMember: 63840.00,  // From MSRB projection table
    expectedSurvivor: 42560.00
  },
  {
    name: 'Age 57 (should have no reduction)',
    basePension: 68970.00, 
    memberAge: 57,
    beneficiaryAge: '53',
    expectedMember: 68970.00,  // From MSRB projection table
    expectedSurvivor: 45980.00
  },
  {
    name: 'Age 58 (should have no reduction)',
    basePension: 74290.00,
    memberAge: 58, 
    beneficiaryAge: '53',
    expectedMember: 74290.00,  // From MSRB projection table
    expectedSurvivor: 49526.67
  },
  {
    name: 'Age 59 (should have 4.76% reduction)',
    basePension: 79800.00,
    memberAge: 59,
    beneficiaryAge: '53', 
    expectedMember: 76000.00,  // From MSRB projection table
    expectedSurvivor: 50666.67
  }
];

console.log('Testing each scenario:\n');

let allTestsPassed = true;

testScenarios.forEach((scenario, index) => {
  console.log(`${index + 1}. ${scenario.name}`);
  
  try {
    const result = calculatePensionWithOption(
      scenario.basePension,
      'C',
      scenario.memberAge,
      scenario.beneficiaryAge
    );
    
    const memberError = Math.abs(result.pension - scenario.expectedMember);
    const survivorError = Math.abs(result.survivorPension - scenario.expectedSurvivor);
    
    const memberMatch = memberError < 1.0;  // Within $1
    const survivorMatch = survivorError < 1.0;  // Within $1
    
    console.log(`   Base Pension: $${scenario.basePension.toFixed(2)}`);
    console.log(`   Our Member:   $${result.pension.toFixed(2)}`);
    console.log(`   MSRB Member:  $${scenario.expectedMember.toFixed(2)}`);
    console.log(`   Member Match: ${memberMatch ? '✅ YES' : '❌ NO'} (error: $${memberError.toFixed(2)})`);
    
    console.log(`   Our Survivor: $${result.survivorPension.toFixed(2)}`);
    console.log(`   MSRB Survivor: $${scenario.expectedSurvivor.toFixed(2)}`);
    console.log(`   Survivor Match: ${survivorMatch ? '✅ YES' : '❌ NO'} (error: $${survivorError.toFixed(2)})`);
    
    if (!memberMatch || !survivorMatch) {
      allTestsPassed = false;
    }
    
    console.log(`   Overall: ${memberMatch && survivorMatch ? '✅ PASS' : '❌ FAIL'}\n`);
    
  } catch (error) {
    console.log(`   ❌ ERROR: ${error.message}\n`);
    allTestsPassed = false;
  }
});

console.log('=' .repeat(50));
console.log(`🎯 FINAL RESULT: ${allTestsPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);

if (allTestsPassed) {
  console.log('\n🎉 SUCCESS! The Option C fix correctly matches MSRB calculations.');
  console.log('The age-specific reduction factors are working properly.');
} else {
  console.log('\n⚠️  Some tests failed. The fix may need further adjustment.');
}
