#!/usr/bin/env node

/**
 * Debug the Option C discrepancy between our implementation and MSRB calculator
 */

console.log("🔍 DEBUGGING OPTION C DISCREPANCY");
console.log("=" .repeat(60));

// MSRB data from the screenshots provided
const msrbData = {
  optionA: 58900.00,  // From first screenshot
  optionC_member: 54747.55,  // From first screenshot - member's reduced pension
  optionC_survivor: 36498.37,  // From first screenshot - survivor benefit
  
  // Projection table data from second screenshot
  projectionTable: [
    { age: 55, yos: 31.0, optionC_annual: 58900.00, survivor_annual: 39266.67 },
    { age: 56, yos: 32.0, optionC_annual: 63840.00, survivor_annual: 42560.00 },
    { age: 57, yos: 33.0, optionC_annual: 68970.00, survivor_annual: 45980.00 },
    { age: 58, yos: 34.0, optionC_annual: 74290.00, survivor_annual: 49526.67 },
    { age: 59, yos: 35.0, optionC_annual: 76000.00, survivor_annual: 50666.67 }
  ]
};

console.log("📊 MSRB DATA ANALYSIS");
console.log("-".repeat(40));

console.log("From specific calculation screenshot:");
console.log(`Option A: $${msrbData.optionA}`);
console.log(`Option C Member: $${msrbData.optionC_member}`);
console.log(`Option C Survivor: $${msrbData.optionC_survivor}`);

// Calculate the reduction factor from specific calculation
const specificReductionFactor = msrbData.optionC_member / msrbData.optionA;
const specificReductionPercent = (1 - specificReductionFactor) * 100;

console.log(`\nSpecific calculation reduction factor: ${specificReductionFactor.toFixed(4)}`);
console.log(`Specific calculation reduction %: ${specificReductionPercent.toFixed(2)}%`);

// Verify survivor is 66.67% of member's reduced pension
const calculatedSurvivor = msrbData.optionC_member * (2/3);
console.log(`\nCalculated survivor (66.67% of reduced): $${calculatedSurvivor.toFixed(2)}`);
console.log(`MSRB survivor: $${msrbData.optionC_survivor}`);
console.log(`Match: ${Math.abs(calculatedSurvivor - msrbData.optionC_survivor) < 1.0 ? 'YES' : 'NO'}`);

console.log("\n📊 PROJECTION TABLE ANALYSIS");
console.log("-".repeat(40));

console.log("From projection table screenshot:");
msrbData.projectionTable.forEach(row => {
  // Calculate what Option A should be
  const averageSalary = 95000; // Estimated from projection
  const factor = row.age === 55 ? 0.020 : 
                 row.age === 56 ? 0.021 :
                 row.age === 57 ? 0.022 :
                 row.age === 58 ? 0.023 : 0.024;
  
  const calculatedOptionA = averageSalary * row.yos * factor;
  const optionCReductionFactor = row.optionC_annual / calculatedOptionA;
  const survivorRatio = row.survivor_annual / row.optionC_annual;
  
  console.log(`\nAge ${row.age}:`);
  console.log(`  Calculated Option A: $${calculatedOptionA.toFixed(2)}`);
  console.log(`  MSRB Option C: $${row.optionC_annual}`);
  console.log(`  Reduction factor: ${optionCReductionFactor.toFixed(4)}`);
  console.log(`  MSRB Survivor: $${row.survivor_annual}`);
  console.log(`  Survivor ratio: ${(survivorRatio * 100).toFixed(2)}%`);
});

console.log("\n🎯 KEY FINDINGS");
console.log("-".repeat(40));

console.log("1. SPECIFIC CALCULATION vs PROJECTION TABLE:");
console.log(`   Specific: Member gets ${specificReductionPercent.toFixed(2)}% reduction`);
console.log(`   Projection: Member appears to get full pension`);

console.log("\n2. SURVIVOR BENEFIT CALCULATION:");
console.log(`   Both scenarios: Survivor gets 66.67% of member's pension`);

console.log("\n3. DISCREPANCY EXPLANATION:");
console.log(`   The projection table shows different behavior than specific calculation`);
console.log(`   This suggests Option C may have scenario-specific or age-specific factors`);

console.log("\n🔧 RECOMMENDED FIX");
console.log("-".repeat(40));

console.log("Based on the specific calculation screenshot (most authoritative):");
console.log(`1. Member gets reduced pension: ${specificReductionFactor.toFixed(4)} factor`);
console.log(`2. Survivor gets 66.67% of member's reduced pension`);
console.log(`3. Use the specific calculation behavior as the standard`);

console.log("\n⚠️  CRITICAL ISSUE IDENTIFIED:");
console.log("Our current implementation gives member full pension, but MSRB");
console.log("specific calculation shows member gets reduced pension!");

// Test our current implementation
console.log("\n🧪 TESTING CURRENT IMPLEMENTATION");
console.log("-".repeat(40));

// Simulate our current Option C logic
const ourCurrentMemberPension = msrbData.optionA; // We give full pension
const ourCurrentSurvivorPension = msrbData.optionA * (2/3); // 66.67% of full

console.log(`Our current member pension: $${ourCurrentMemberPension}`);
console.log(`Our current survivor pension: $${ourCurrentSurvivorPension.toFixed(2)}`);
console.log(`MSRB member pension: $${msrbData.optionC_member}`);
console.log(`MSRB survivor pension: $${msrbData.optionC_survivor}`);

const memberError = ourCurrentMemberPension - msrbData.optionC_member;
const survivorError = ourCurrentSurvivorPension - msrbData.optionC_survivor;

console.log(`\nMember pension error: $${memberError.toFixed(2)} (${memberError > 0 ? 'OVERESTIMATE' : 'UNDERESTIMATE'})`);
console.log(`Survivor pension error: $${survivorError.toFixed(2)} (${survivorError > 0 ? 'OVERESTIMATE' : 'UNDERESTIMATE'})`);

console.log("\n✅ CONCLUSION:");
console.log("We need to revert to the reduced member pension approach for Option C");
console.log(`Use reduction factor: ${specificReductionFactor.toFixed(4)}`);
console.log("Survivor gets 66.67% of the reduced member pension");
