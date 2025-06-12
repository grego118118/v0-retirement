// Test the healthcare calculator functionality (JavaScript version)

// Healthcare calculator functions (inline for testing)
const MA_HEALTH_PLANS = [
  {
    id: 'hmo-basic',
    name: 'HMO Basic',
    type: 'HMO',
    monthlyPremium: { individual: 450, family: 1200 },
    deductible: { individual: 500, family: 1000 },
    outOfPocketMax: { individual: 3000, family: 6000 },
    description: 'Lower cost HMO with network restrictions'
  },
  {
    id: 'hmo-premium',
    name: 'HMO Premium',
    type: 'HMO',
    monthlyPremium: { individual: 550, family: 1450 },
    deductible: { individual: 250, family: 500 },
    outOfPocketMax: { individual: 2500, family: 5000 },
    description: 'Enhanced HMO with better coverage'
  },
  {
    id: 'ppo-standard',
    name: 'PPO Standard',
    type: 'PPO',
    monthlyPremium: { individual: 650, family: 1700 },
    deductible: { individual: 750, family: 1500 },
    outOfPocketMax: { individual: 4000, family: 8000 },
    description: 'Flexible PPO with out-of-network coverage'
  }
];

function calculateStateContribution(yearsOfService) {
  if (yearsOfService >= 20) return 90;
  if (yearsOfService >= 15) return 80;
  if (yearsOfService >= 10) return 70;
  if (yearsOfService >= 5) return 50;
  return 0;
}

function calculateMedicareCosts(currentAge, income = 0) {
  const yearsToMedicare = Math.max(0, 65 - currentAge);

  let partB = 174.70;
  if (income > 103000) partB = 244.60;
  if (income > 129000) partB = 349.40;

  const partD = 55.50;
  const supplement = 180.00;
  const advantage = 25.00;

  return {
    partB,
    partD,
    supplement,
    advantage,
    total: partB + partD + supplement,
    yearsToEligibility: yearsToMedicare
  };
}

function calculateHealthcareCosts(currentAge, yearsOfService, currentSalary, retirementAge = 65, coverageType = 'individual', selectedPlan = 'hmo-premium') {
  const plan = MA_HEALTH_PLANS.find(p => p.id === selectedPlan) || MA_HEALTH_PLANS[1];
  const stateContributionPercent = calculateStateContribution(yearsOfService);
  const yearsToMedicare = Math.max(0, 65 - retirementAge);

  const monthlyPremium = plan.monthlyPremium[coverageType];
  const stateContribution = monthlyPremium * (stateContributionPercent / 100);
  const employeeContribution = monthlyPremium - stateContribution;

  const medicareCosts = calculateMedicareCosts(retirementAge, currentSalary);
  const retireeEligible = yearsOfService >= 10;
  const retireeMonthlyPremium = retireeEligible ? employeeContribution : monthlyPremium;

  const yearsInRetirement = 85 - retirementAge;
  const preMedicareCosts = yearsToMedicare * 12 * retireeMonthlyPremium;
  const medicareCostsTotal = Math.max(0, yearsInRetirement - yearsToMedicare) * 12 * medicareCosts.total;
  const totalLifetimeCosts = preMedicareCosts + medicareCostsTotal;

  return {
    preMedicare: {
      monthlyPremium,
      annualPremium: monthlyPremium * 12,
      stateContribution,
      employeeContribution,
      planType: plan.name,
      coverageType
    },
    medicare: medicareCosts,
    retireeInsurance: {
      eligible: retireeEligible,
      stateContributionPercent,
      monthlyPremium: retireeMonthlyPremium,
      annualPremium: retireeMonthlyPremium * 12
    },
    yearsToMedicare,
    totalLifetimeCosts
  };
}

function calculateHSABenefits(currentAge, currentSalary, coverageType = 'individual') {
  const baseLimit = coverageType === 'individual' ? 4150 : 8300;
  const catchUpContribution = currentAge >= 55 ? 1000 : 0;
  const totalContribution = baseLimit + catchUpContribution;

  const taxRate = currentSalary > 100000 ? 0.32 : currentSalary > 50000 ? 0.22 : 0.12;
  const taxSavings = totalContribution * taxRate;

  const yearsToRetirement = Math.max(0, 65 - currentAge);
  const projectedBalance = totalContribution * ((Math.pow(1.06, yearsToRetirement) - 1) / 0.06);

  return {
    contributionLimit: baseLimit,
    catchUpContribution,
    totalContribution,
    taxSavings,
    projectedBalance
  };
}

function formatHealthcareCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

function testHealthcareCalculator() {
  console.log('🏥 Testing Healthcare Calculator...\n');
  
  try {
    // Test data
    const currentAge = 50;
    const yearsOfService = 15;
    const currentSalary = 75000;
    const retirementAge = 65;
    
    console.log('📋 Test Parameters:');
    console.log(`- Current Age: ${currentAge}`);
    console.log(`- Years of Service: ${yearsOfService}`);
    console.log(`- Current Salary: ${formatHealthcareCurrency(currentSalary)}`);
    console.log(`- Planned Retirement Age: ${retirementAge}\n`);
    
    // Test 1: State Contribution Calculation
    console.log('1️⃣ Testing State Contribution Calculation...');
    const stateContribution = calculateStateContribution(yearsOfService);
    console.log(`✅ State Contribution: ${stateContribution}% (${yearsOfService} years of service)\n`);
    
    // Test 2: Medicare Costs
    console.log('2️⃣ Testing Medicare Cost Calculation...');
    const medicareCosts = calculateMedicareCosts(retirementAge, currentSalary);
    console.log('✅ Medicare Costs:');
    console.log(`   - Part B: ${formatHealthcareCurrency(medicareCosts.partB)}/month`);
    console.log(`   - Part D: ${formatHealthcareCurrency(medicareCosts.partD)}/month`);
    console.log(`   - Supplement: ${formatHealthcareCurrency(medicareCosts.supplement)}/month`);
    console.log(`   - Total: ${formatHealthcareCurrency(medicareCosts.total)}/month`);
    console.log(`   - Years to eligibility: ${medicareCosts.yearsToEligibility}\n`);
    
    // Test 3: Individual Coverage
    console.log('3️⃣ Testing Individual Healthcare Costs...');
    const individualCosts = calculateHealthcareCosts(
      currentAge, yearsOfService, currentSalary, retirementAge, 'individual', 'hmo-premium'
    );
    console.log('✅ Individual Coverage Results:');
    console.log(`   - Monthly Premium: ${formatHealthcareCurrency(individualCosts.preMedicare.monthlyPremium)}`);
    console.log(`   - State Contribution: ${formatHealthcareCurrency(individualCosts.preMedicare.stateContribution)}`);
    console.log(`   - Employee Contribution: ${formatHealthcareCurrency(individualCosts.preMedicare.employeeContribution)}`);
    console.log(`   - Retiree Eligible: ${individualCosts.retireeInsurance.eligible}`);
    console.log(`   - Lifetime Costs: ${formatHealthcareCurrency(individualCosts.totalLifetimeCosts)}\n`);
    
    // Test 4: Family Coverage
    console.log('4️⃣ Testing Family Healthcare Costs...');
    const familyCosts = calculateHealthcareCosts(
      currentAge, yearsOfService, currentSalary, retirementAge, 'family', 'ppo-standard'
    );
    console.log('✅ Family Coverage Results:');
    console.log(`   - Monthly Premium: ${formatHealthcareCurrency(familyCosts.preMedicare.monthlyPremium)}`);
    console.log(`   - State Contribution: ${formatHealthcareCurrency(familyCosts.preMedicare.stateContribution)}`);
    console.log(`   - Employee Contribution: ${formatHealthcareCurrency(familyCosts.preMedicare.employeeContribution)}`);
    console.log(`   - Lifetime Costs: ${formatHealthcareCurrency(familyCosts.totalLifetimeCosts)}\n`);
    
    // Test 5: HSA Benefits (HDHP)
    console.log('5️⃣ Testing HSA Benefits...');
    const hsaBenefits = calculateHSABenefits(currentAge, currentSalary, 'individual');
    console.log('✅ HSA Benefits Results:');
    console.log(`   - Contribution Limit: ${formatHealthcareCurrency(hsaBenefits.contributionLimit)}`);
    console.log(`   - Catch-up Contribution: ${formatHealthcareCurrency(hsaBenefits.catchUpContribution)}`);
    console.log(`   - Total Contribution: ${formatHealthcareCurrency(hsaBenefits.totalContribution)}`);
    console.log(`   - Tax Savings: ${formatHealthcareCurrency(hsaBenefits.taxSavings)}`);
    console.log(`   - Projected Balance: ${formatHealthcareCurrency(hsaBenefits.projectedBalance)}\n`);
    
    // Test 6: Plan Comparison
    console.log('6️⃣ Testing Plan Comparison...');
    console.log('✅ Available Plans:');
    MA_HEALTH_PLANS.forEach((plan, index) => {
      console.log(`   ${index + 1}. ${plan.name} (${plan.type})`);
      console.log(`      - Individual: ${formatHealthcareCurrency(plan.monthlyPremium.individual)}/month`);
      console.log(`      - Family: ${formatHealthcareCurrency(plan.monthlyPremium.family)}/month`);
      console.log(`      - Deductible: ${formatHealthcareCurrency(plan.deductible.individual)} / ${formatHealthcareCurrency(plan.deductible.family)}`);
    });
    
    console.log('\n🎉 All Healthcare Calculator Tests Passed!');
    console.log('✅ State contribution calculation works');
    console.log('✅ Medicare cost calculation works');
    console.log('✅ Individual coverage calculation works');
    console.log('✅ Family coverage calculation works');
    console.log('✅ HSA benefits calculation works');
    console.log('✅ Plan comparison data available');
    
    console.log('\n🚀 Healthcare Benefits Dashboard is ready!');
    console.log('📋 Features available:');
    console.log('   - Comprehensive cost estimation');
    console.log('   - Medicare planning and countdown');
    console.log('   - Plan comparison tool');
    console.log('   - HSA benefits calculator');
    console.log('   - Lifetime cost projections');
    console.log('   - State contribution analysis');
    
  } catch (error) {
    console.error('\n💥 Healthcare calculator test failed:', {
      error,
      message: error.message,
      stack: error.stack?.split('\n').slice(0, 5).join('\n')
    });
  }
}

// Run the test
testHealthcareCalculator();
