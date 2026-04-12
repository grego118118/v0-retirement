#!/usr/bin/env node

/**
 * Debug the remaining survivor calculation discrepancy
 */

// Test data from audit
const testCase = {
  optionA: 58900.00,
  expectedSurvivor: 36498.37,
  calculatedSurvivor: 39266.67
};

console.log("🔍 DEBUGGING SURVIVOR CALCULATION DISCREPANCY");
console.log("=" .repeat(50));

console.log(`Option A Pension: $${testCase.optionA}`);
console.log(`Expected Survivor: $${testCase.expectedSurvivor}`);
console.log(`Calculated Survivor: $${testCase.calculatedSurvivor}`);
console.log(`Difference: $${(testCase.calculatedSurvivor - testCase.expectedSurvivor).toFixed(2)}`);

// Calculate ratios
const expectedRatio = testCase.expectedSurvivor / testCase.optionA;
const calculatedRatio = testCase.calculatedSurvivor / testCase.optionA;

console.log(`\nExpected Ratio: ${(expectedRatio * 100).toFixed(2)}%`);
console.log(`Calculated Ratio: ${(calculatedRatio * 100).toFixed(2)}%`);
console.log(`66.67% Reference: ${((2/3) * 100).toFixed(2)}%`);

// The issue might be that the "Option C" amount in MSRB is actually the survivor benefit
// Let's check if the MSRB "Option C" amount matches our survivor calculation
const msrbOptionC = 54747.55; // From screenshot
const msrbSurvivor = 36498.37; // From screenshot

console.log(`\nMSRB Analysis:`);
console.log(`MSRB Option C Amount: $${msrbOptionC}`);
console.log(`MSRB Survivor Amount: $${msrbSurvivor}`);
console.log(`Ratio: ${(msrbSurvivor / msrbOptionC * 100).toFixed(2)}%`);

// Check if MSRB Option C is actually the member's reduced pension
const msrbOptionCRatio = msrbOptionC / testCase.optionA;
console.log(`MSRB Option C vs Option A: ${(msrbOptionCRatio * 100).toFixed(2)}%`);

// Check if survivor is 66.67% of the MSRB Option C amount
const survivorOfOptionC = msrbOptionC * (2/3);
console.log(`66.67% of MSRB Option C: $${survivorOfOptionC.toFixed(2)}`);
console.log(`Matches MSRB Survivor: ${Math.abs(survivorOfOptionC - msrbSurvivor) < 1.0 ? 'YES' : 'NO'}`);

console.log(`\n🎯 CONCLUSION:`);
if (Math.abs(survivorOfOptionC - msrbSurvivor) < 1.0) {
  console.log(`✅ MSRB Option C IS the member's reduced pension`);
  console.log(`✅ Survivor gets 66.67% of the reduced member pension`);
  console.log(`⚠️  Our current logic is incorrect - we need to revert Option C logic`);
} else {
  console.log(`❌ Need further investigation`);
}
