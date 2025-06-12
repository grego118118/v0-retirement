// Test script to verify the scenario calculation fix
const { PrismaClient } = require('./lib/generated/prisma');

const prisma = new PrismaClient();

async function testScenarioFix() {
  console.log('🧪 Testing scenario calculation fix...\n');

  try {
    // First, check current status
    console.log('📊 Current scenario status:');
    const currentScenarios = await prisma.retirementScenario.findMany({
      where: { userId: '113615221466278220538' },
      include: { results: true },
      orderBy: { createdAt: 'desc' }
    });

    currentScenarios.forEach((scenario, index) => {
      console.log(`${index + 1}. ${scenario.name}`);
      console.log(`   Has Results: ${scenario.results ? 'Yes ✅' : 'No ❌'}`);
      if (scenario.results) {
        console.log(`   Monthly Income: $${scenario.results.totalMonthlyIncome?.toLocaleString()}`);
        console.log(`   Replacement Ratio: ${(scenario.results.replacementRatio * 100)?.toFixed(1)}%`);
      }
      console.log('');
    });

    // Summary
    const withResults = currentScenarios.filter(s => s.results).length;
    const withoutResults = currentScenarios.length - withResults;
    
    console.log(`📈 Summary: ${withResults} calculated, ${withoutResults} pending\n`);

    if (withoutResults === 0) {
      console.log('🎉 All scenarios have calculated results! The fix is working.');
    } else {
      console.log('⚠️  Some scenarios still missing results. The fix may need more work.');
      
      // Show the data structure that would be expected
      console.log('\n🔍 Expected data structure for calculations:');
      console.log('   results.pensionBenefits.monthlyBenefit');
      console.log('   results.socialSecurityBenefits.monthlyBenefit');
      console.log('   results.incomeProjections.totalMonthlyIncome');
      console.log('   results.taxAnalysis.annualTaxBurden');
      console.log('   results.portfolioAnalysis?.initialBalance');
      console.log('   results.keyMetrics.riskScore');
      console.log('   results.incomeProjections.yearlyProjections');
    }

    // Test the status determination logic
    console.log('\n🔧 Testing status determination logic:');
    
    // Import the getScenarioResult function logic
    function getScenarioResult(scenario) {
      // Check if scenario has embedded results
      if (scenario.results) {
        return scenario.results;
      }
      
      // If no embedded results, return null (should show "Pending")
      return null;
    }

    currentScenarios.forEach((scenario, index) => {
      const result = getScenarioResult(scenario);
      const status = result ? 'Calculated' : 'Pending';
      console.log(`${index + 1}. ${scenario.name}: ${status} ${status === 'Calculated' ? '🟢' : '🟡'}`);
    });

  } catch (error) {
    console.error('❌ Error in test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testScenarioFix();
