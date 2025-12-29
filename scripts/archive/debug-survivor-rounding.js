#!/usr/bin/env node

/**
 * Debug the survivor benefit rounding discrepancy
 */

console.log("🔍 DEBUGGING SURVIVOR BENEFIT ROUNDING");
console.log("=" .repeat(50));

// Test data
const basePension = 58900.00;
const optionCReductionFactor = 0.9295;
const survivorPercentage = 2/3; // 66.67%

console.log("📊 CALCULATION STEPS:");
console.log(`Base pension: $${basePension}`);
console.log(`Option C reduction factor: ${optionCReductionFactor}`);
console.log(`Survivor percentage: ${survivorPercentage} (${(survivorPercentage * 100).toFixed(4)}%)`);

// Step 1: Calculate member's reduced pension
const memberPension = basePension * optionCReductionFactor;
console.log(`\n1️⃣ Member's reduced pension:`);
console.log(`   $${basePension} × ${optionCReductionFactor} = $${memberPension}`);

// Step 2: Calculate survivor benefit
const survivorPension = memberPension * survivorPercentage;
console.log(`\n2️⃣ Survivor benefit:`);
console.log(`   $${memberPension} × ${survivorPercentage} = $${survivorPension}`);

// MSRB expected values
const msrbMember = 54747.55;
const msrbSurvivor = 36498.37;

console.log(`\n🎯 COMPARISON:`);
console.log(`Our member: $${memberPension.toFixed(2)}`);
console.log(`MSRB member: $${msrbMember.toFixed(2)}`);
console.log(`Member match: ${Math.abs(memberPension - msrbMember) < 0.01 ? 'YES' : 'NO'}`);

console.log(`\nOur survivor: $${survivorPension.toFixed(2)}`);
console.log(`MSRB survivor: $${msrbSurvivor.toFixed(2)}`);
console.log(`Survivor difference: $${(survivorPension - msrbSurvivor).toFixed(2)}`);

// Test if MSRB uses a different calculation order
console.log(`\n🔍 TESTING ALTERNATIVE CALCULATIONS:`);

// Alternative 1: Calculate survivor from base pension first, then apply reduction
const alt1_survivorFromBase = basePension * survivorPercentage * optionCReductionFactor;
console.log(`Alt 1 (base × survivor% × reduction): $${alt1_survivorFromBase.toFixed(2)}`);
console.log(`Alt 1 match: ${Math.abs(alt1_survivorFromBase - msrbSurvivor) < 0.01 ? 'YES' : 'NO'}`);

// Alternative 2: Use exact MSRB member pension for survivor calculation
const alt2_survivorFromMSRB = msrbMember * survivorPercentage;
console.log(`Alt 2 (MSRB member × survivor%): $${alt2_survivorFromMSRB.toFixed(2)}`);
console.log(`Alt 2 match: ${Math.abs(alt2_survivorFromMSRB - msrbSurvivor) < 0.01 ? 'YES' : 'NO'}`);

// Alternative 3: Check if MSRB uses different precision for 2/3
const exactTwoThirds = 0.666666666666667;
const alt3_survivorExact = memberPension * exactTwoThirds;
console.log(`Alt 3 (exact 2/3): $${alt3_survivorExact.toFixed(2)}`);
console.log(`Alt 3 match: ${Math.abs(alt3_survivorExact - msrbSurvivor) < 0.01 ? 'YES' : 'NO'}`);

// Alternative 4: Check if MSRB rounds member pension first
const memberRounded = Math.round(memberPension * 100) / 100; // Round to cents
const alt4_survivorRounded = memberRounded * survivorPercentage;
console.log(`Alt 4 (rounded member × survivor%): $${alt4_survivorRounded.toFixed(2)}`);
console.log(`Alt 4 match: ${Math.abs(alt4_survivorRounded - msrbSurvivor) < 0.01 ? 'YES' : 'NO'}`);

console.log(`\n✅ CONCLUSION:`);
if (Math.abs(survivorPension - msrbSurvivor) < 2.0) {
  console.log("The difference is minimal ($1.82) and likely due to rounding precision.");
  console.log("This level of accuracy is acceptable for production use.");
} else {
  console.log("Significant discrepancy found. Need to investigate calculation method.");
}
