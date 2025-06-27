#!/usr/bin/env node

/**
 * Group 1 Option C Analysis Test
 * Analyzes the MSRB calculator data to determine correct Group 1 Option C reduction factors
 */

const { 
  calculateAnnualPension,
  calculatePensionWithOption 
} = require('./lib/pension-calculations.ts');

console.log('🔍 Group 1 Option C Analysis - MSRB Calculator Data Analysis...\n');

// MSRB Calculator Data from the provided screenshot
const msrbGroup1Data = {
  memberAge: 60,
  beneficiaryAge: 58,
  yearsOfService: 36,
  averageSalary: 95000,
  group: "GROUP_1",
  serviceEntry: "before_2012",
  
  // Official MSRB Results
  optionA: 68400.00,
  optionB: 67716.00,
  optionCMember: 62004.60,
  optionCSurvivor: 41336.40
};

console.log('📊 MSRB Calculator Data Analysis:');
console.log('='.repeat(60));
console.log(`Member Age: ${msrbGroup1Data.memberAge}`);
console.log(`Beneficiary Age: ${msrbGroup1Data.beneficiaryAge}`);
console.log(`Years of Service: ${msrbGroup1Data.yearsOfService}`);
console.log(`Average Salary: $${msrbGroup1Data.averageSalary.toLocaleString()}`);
console.log(`Group: ${msrbGroup1Data.group}`);
console.log(`Service Entry: ${msrbGroup1Data.serviceEntry}`);

console.log('\n📋 Official MSRB Results:');
console.log(`Option A: $${msrbGroup1Data.optionA.toLocaleString()}`);
console.log(`Option B: $${msrbGroup1Data.optionB.toLocaleString()}`);
console.log(`Option C Member: $${msrbGroup1Data.optionCMember.toLocaleString()}`);
console.log(`Option C Survivor: $${msrbGroup1Data.optionCSurvivor.toLocaleString()}`);

// Calculate what our system produces
console.log('\n🧮 Our Current Calculator Results:');
console.log('='.repeat(60));

const ourOptionA = calculateAnnualPension(
  msrbGroup1Data.averageSalary,
  msrbGroup1Data.memberAge,
  msrbGroup1Data.yearsOfService,
  "A",
  msrbGroup1Data.group,
  msrbGroup1Data.serviceEntry
);

const ourOptionB = calculateAnnualPension(
  msrbGroup1Data.averageSalary,
  msrbGroup1Data.memberAge,
  msrbGroup1Data.yearsOfService,
  "B",
  msrbGroup1Data.group,
  msrbGroup1Data.serviceEntry
);

const ourOptionC = calculateAnnualPension(
  msrbGroup1Data.averageSalary,
  msrbGroup1Data.memberAge,
  msrbGroup1Data.yearsOfService,
  "C",
  msrbGroup1Data.group,
  msrbGroup1Data.serviceEntry,
  msrbGroup1Data.beneficiaryAge.toString()
);

console.log(`Our Option A: $${ourOptionA.toLocaleString()}`);
console.log(`Our Option B: $${ourOptionB.toLocaleString()}`);
console.log(`Our Option C: $${ourOptionC.toLocaleString()}`);

// Calculate differences
console.log('\n📊 Accuracy Analysis:');
console.log('='.repeat(60));

const optionADiff = ourOptionA - msrbGroup1Data.optionA;
const optionBDiff = ourOptionB - msrbGroup1Data.optionB;
const optionCDiff = ourOptionC - msrbGroup1Data.optionCMember;

console.log(`Option A Difference: $${optionADiff.toFixed(2)} ${optionADiff === 0 ? '✅' : '❌'}`);
console.log(`Option B Difference: $${optionBDiff.toFixed(2)} ${Math.abs(optionBDiff) < 1 ? '✅' : '❌'}`);
console.log(`Option C Difference: $${optionCDiff.toFixed(2)} ${Math.abs(optionCDiff) < 1 ? '✅' : '❌'}`);

// Calculate the correct Option C reduction factor for Group 1
console.log('\n🔍 Option C Reduction Factor Analysis:');
console.log('='.repeat(60));

const correctReductionFactor = msrbGroup1Data.optionCMember / msrbGroup1Data.optionA;
const reductionPercentage = (1 - correctReductionFactor) * 100;

console.log(`Correct Reduction Factor: ${correctReductionFactor.toFixed(6)}`);
console.log(`Reduction Percentage: ${reductionPercentage.toFixed(2)}%`);

// Verify survivor percentage
const survivorPercentage = msrbGroup1Data.optionCSurvivor / msrbGroup1Data.optionCMember;
console.log(`Survivor Percentage: ${(survivorPercentage * 100).toFixed(2)}% (Expected: 66.67%)`);

// Test with our current Group 2 factors for comparison
console.log('\n🔍 Current Group 2 Factor Comparison:');
console.log('='.repeat(60));

// Our current factors for age 60 (Group 2 based)
const currentFactor = 0.9295; // This is what we use for age combinations not in our table
console.log(`Current Factor (Group 2): ${currentFactor.toFixed(6)}`);
console.log(`Current Reduction: ${((1 - currentFactor) * 100).toFixed(2)}%`);
console.log(`Difference: ${((correctReductionFactor - currentFactor) * 100).toFixed(2)} percentage points`);

// Calculate what Option C should be with the correct factor
const correctedOptionC = msrbGroup1Data.optionA * correctReductionFactor;
console.log(`\nCorrected Option C with proper factor: $${correctedOptionC.toFixed(2)}`);
console.log(`MSRB Option C: $${msrbGroup1Data.optionCMember.toFixed(2)}`);
console.log(`Match: ${Math.abs(correctedOptionC - msrbGroup1Data.optionCMember) < 0.01 ? '✅' : '❌'}`);

console.log('\n📋 Summary:');
console.log('='.repeat(60));
console.log('🔍 **Issue Identified:**');
console.log('   Group 1 uses different Option C reduction factors than Group 2');
console.log(`   Group 1 Age 60/Beneficiary 58: ${reductionPercentage.toFixed(2)}% reduction`);
console.log(`   Current (Group 2 based): ${((1 - currentFactor) * 100).toFixed(2)}% reduction`);
console.log('\n✅ **Solution Required:**');
console.log('   Implement Group 1-specific Option C reduction factors');
console.log('   Update calculatePensionWithOption to use group-specific factors');

console.log('\n🎯 **Next Steps:**');
console.log('1. Research additional Group 1 age combinations from MSRB calculator');
console.log('2. Create Group 1-specific reduction factor table');
console.log('3. Update calculation logic to use group-specific factors');
console.log('4. Test all groups to ensure no regressions');
