#!/usr/bin/env node

/**
 * DETAILED DISCREPANCY ANALYSIS
 * 
 * This script analyzes the specific differences between our calculations
 * and the official MSRB calculator to identify the root causes.
 */

// Reverse engineer the MSRB calculations from the screenshots
function analyzeDiscrepancies() {
  console.log("🔍 DETAILED DISCREPANCY ANALYSIS");
  console.log("=" .repeat(50));
  
  // From screenshot: Group 2 projection table
  const msrbResults = {
    age55: { yos: 31.0, factor: 0.020, optionA: 55366.00, optionC: 36910.67 },
    age56: { yos: 32.0, factor: 0.021, optionA: 60009.60, optionC: 40006.40 },
    age57: { yos: 33.0, factor: 0.022, optionA: 64831.80, optionC: 43221.20 },
    age58: { yos: 34.0, factor: 0.023, optionA: 69832.60, optionC: 46555.07 },
    age59: { yos: 35.0, factor: 0.024, optionA: 71440.00, optionC: 47626.67 }
  };
  
  // From screenshot: Specific calculation
  const specificCase = {
    optionA: 58900.00,
    optionB: 58311.00,
    optionC: 54747.55,
    survivorAnnual: 36498.37
  };
  
  console.log("\n1. REVERSE ENGINEERING AVERAGE SALARY");
  console.log("-".repeat(40));
  
  // Calculate implied average salary from each age scenario
  Object.entries(msrbResults).forEach(([age, data]) => {
    const impliedSalary = data.optionA / (data.yos * data.factor);
    console.log(`Age ${age.slice(3)}: $${data.optionA} ÷ (${data.yos} × ${data.factor}) = $${impliedSalary.toFixed(2)}`);
  });
  
  console.log("\n2. OPTION C REDUCTION FACTOR ANALYSIS");
  console.log("-".repeat(40));
  
  // Analyze Option C reduction factors
  Object.entries(msrbResults).forEach(([age, data]) => {
    const reductionFactor = data.optionC / data.optionA;
    const reductionPercent = (1 - reductionFactor) * 100;
    console.log(`Age ${age.slice(3)}: $${data.optionC} ÷ $${data.optionA} = ${reductionFactor.toFixed(4)} (${reductionPercent.toFixed(1)}% reduction)`);
  });
  
  console.log("\n3. OPTION B ANALYSIS (from specific case)");
  console.log("-".repeat(40));
  
  const optionBReduction = (specificCase.optionA - specificCase.optionB) / specificCase.optionA;
  console.log(`Option B reduction: ($${specificCase.optionA} - $${specificCase.optionB}) ÷ $${specificCase.optionA} = ${(optionBReduction * 100).toFixed(2)}%`);
  
  console.log("\n4. SURVIVOR BENEFIT ANALYSIS");
  console.log("-".repeat(40));
  
  const survivorRatio = specificCase.survivorAnnual / specificCase.optionC;
  console.log(`Survivor ratio: $${specificCase.survivorAnnual} ÷ $${specificCase.optionC} = ${survivorRatio.toFixed(4)} (${(survivorRatio * 100).toFixed(2)}%)`);
  
  console.log("\n5. POTENTIAL ISSUES IDENTIFIED");
  console.log("-".repeat(40));
  
  // Check for consistent patterns
  const salaries = Object.values(msrbResults).map(data => data.optionA / (data.yos * data.factor));
  const avgSalary = salaries.reduce((sum, sal) => sum + sal, 0) / salaries.length;
  const salaryVariance = Math.max(...salaries) - Math.min(...salaries);
  
  console.log(`Average implied salary: $${avgSalary.toFixed(2)}`);
  console.log(`Salary variance: $${salaryVariance.toFixed(2)}`);
  
  if (salaryVariance > 100) {
    console.log("⚠️  HIGH SALARY VARIANCE - May indicate calculation inconsistency");
  }
  
  // Check Option C factors
  const optionCFactors = Object.values(msrbResults).map(data => data.optionC / data.optionA);
  const avgOptionCFactor = optionCFactors.reduce((sum, factor) => sum + factor, 0) / optionCFactors.length;
  const factorVariance = Math.max(...optionCFactors) - Math.min(...optionCFactors);
  
  console.log(`Average Option C factor: ${avgOptionCFactor.toFixed(4)}`);
  console.log(`Option C factor variance: ${factorVariance.toFixed(4)}`);
  
  if (factorVariance > 0.01) {
    console.log("⚠️  HIGH OPTION C VARIANCE - May indicate age-specific factors");
  }
  
  return {
    avgSalary,
    avgOptionCFactor,
    optionBReduction,
    survivorRatio
  };
}

function identifySpecificFixes() {
  console.log("\n🔧 SPECIFIC FIXES REQUIRED");
  console.log("=" .repeat(50));
  
  const analysis = analyzeDiscrepancies();
  
  console.log("\n1. AVERAGE SALARY CALCULATION");
  console.log("   Current: Using estimated $89,000");
  console.log(`   MSRB Implied: $${analysis.avgSalary.toFixed(2)}`);
  console.log("   ✅ Fix: Update test cases with correct average salary");
  
  console.log("\n2. OPTION B REDUCTION FACTOR");
  console.log("   Current: Age-based interpolation (1%-5%)");
  console.log(`   MSRB Actual: ${(analysis.optionBReduction * 100).toFixed(2)}% reduction`);
  console.log("   ⚠️  Fix: Verify Option B reduction calculation method");
  
  console.log("\n3. OPTION C REDUCTION FACTOR");
  console.log("   Current: Using 0.94 (6% reduction) for age 55-55");
  console.log(`   MSRB Actual: ${analysis.avgOptionCFactor.toFixed(4)} (${((1 - analysis.avgOptionCFactor) * 100).toFixed(1)}% reduction)`);
  console.log("   ⚠️  Fix: Update Option C reduction factors");
  
  console.log("\n4. SURVIVOR BENEFIT CALCULATION");
  console.log("   Current: 66.67% of Option C pension");
  console.log(`   MSRB Actual: ${(analysis.survivorRatio * 100).toFixed(2)}% of Option C pension`);
  
  if (Math.abs(analysis.survivorRatio - (2/3)) > 0.01) {
    console.log("   ⚠️  Fix: Verify survivor benefit calculation method");
  } else {
    console.log("   ✅ Survivor calculation appears correct");
  }
  
  console.log("\n5. PROJECTION TABLE DISCREPANCIES");
  console.log("   Issue: Consistent $200-400 underestimation");
  console.log("   Likely Cause: Average salary mismatch");
  console.log("   ✅ Fix: Use correct average salary in calculations");
}

function generateFixPlan() {
  console.log("\n📋 COMPREHENSIVE FIX PLAN");
  console.log("=" .repeat(50));
  
  console.log("\nPRIORITY 1 - IMMEDIATE FIXES:");
  console.log("1. Update average salary in test cases to match MSRB");
  console.log("2. Verify and correct Option B reduction calculation");
  console.log("3. Update Option C reduction factors for all age combinations");
  console.log("4. Validate survivor benefit calculation method");
  
  console.log("\nPRIORITY 2 - VALIDATION:");
  console.log("1. Create comprehensive test suite with MSRB data");
  console.log("2. Test all retirement groups (1-4) against official calculator");
  console.log("3. Validate edge cases (minimum ages, maximum benefits)");
  console.log("4. Test service pro-rating for post-2012 hires");
  
  console.log("\nPRIORITY 3 - DOCUMENTATION:");
  console.log("1. Document exact MSRB methodology used");
  console.log("2. Create validation test cases for future changes");
  console.log("3. Implement automated testing against MSRB results");
  console.log("4. Add compliance verification to CI/CD pipeline");
  
  console.log("\n⚠️  CRITICAL: Do not deploy calculation changes until");
  console.log("   ALL tests pass with 100% accuracy against MSRB calculator");
}

// Run analysis
if (require.main === module) {
  analyzeDiscrepancies();
  identifySpecificFixes();
  generateFixPlan();
}

module.exports = {
  analyzeDiscrepancies,
  identifySpecificFixes,
  generateFixPlan
};
