#!/usr/bin/env node

/**
 * Calculate the exact Option C reduction factors from MSRB data
 */

// MSRB data from screenshots
const msrbData = [
  { age: 55, optionA: 55366.00, survivorAnnual: 36910.67 },
  { age: 56, optionA: 60009.60, survivorAnnual: 40006.40 },
  { age: 57, optionA: 64831.80, survivorAnnual: 43221.20 },
  { age: 58, optionA: 69832.60, survivorAnnual: 46555.07 },
  { age: 59, optionA: 71440.00, survivorAnnual: 47626.67 }
];

console.log("🔍 CALCULATING OPTION C FACTORS FROM MSRB DATA");
console.log("=" .repeat(60));

msrbData.forEach(data => {
  // If survivor gets 66.67% of member's reduced pension:
  // survivorAnnual = memberReducedPension * 0.6667
  // Therefore: memberReducedPension = survivorAnnual / 0.6667
  
  const memberReducedPension = data.survivorAnnual / (2/3);
  const reductionFactor = memberReducedPension / data.optionA;
  const reductionPercent = (1 - reductionFactor) * 100;
  
  console.log(`Age ${data.age}:`);
  console.log(`  Option A: $${data.optionA}`);
  console.log(`  Survivor: $${data.survivorAnnual}`);
  console.log(`  Implied Member Pension: $${memberReducedPension.toFixed(2)}`);
  console.log(`  Reduction Factor: ${reductionFactor.toFixed(4)}`);
  console.log(`  Reduction %: ${reductionPercent.toFixed(2)}%`);
  console.log();
});

// Check the specific case from the other screenshot
const specificCase = {
  optionA: 58900.00,
  optionC: 54747.55,
  survivorAnnual: 36498.37
};

console.log("SPECIFIC CASE ANALYSIS:");
console.log(`Option A: $${specificCase.optionA}`);
console.log(`Option C (Member): $${specificCase.optionC}`);
console.log(`Survivor: $${specificCase.survivorAnnual}`);

const specificReductionFactor = specificCase.optionC / specificCase.optionA;
const specificReductionPercent = (1 - specificReductionFactor) * 100;
const calculatedSurvivor = specificCase.optionC * (2/3);

console.log(`Reduction Factor: ${specificReductionFactor.toFixed(4)}`);
console.log(`Reduction %: ${specificReductionPercent.toFixed(2)}%`);
console.log(`Calculated Survivor (66.67% of Option C): $${calculatedSurvivor.toFixed(2)}`);
console.log(`Matches MSRB Survivor: ${Math.abs(calculatedSurvivor - specificCase.survivorAnnual) < 1.0 ? 'YES' : 'NO'}`);

console.log("\n🎯 CONCLUSION:");
console.log(`The specific case shows Option C reduction factor: ${specificReductionFactor.toFixed(4)}`);
console.log(`This should be used as the standard Option C reduction factor.`);
