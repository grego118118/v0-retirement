// Test script to check scenario status data
const { PrismaClient } = require('./lib/generated/prisma');

const prisma = new PrismaClient();

async function checkScenarioStatus() {
  console.log('🔍 Checking scenario status data...\n');

  try {
    // Query scenarios with their results
    const scenarios = await prisma.retirementScenario.findMany({
      where: {
        userId: '113615221466278220538'
      },
      include: {
        results: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    });

    console.log(`📊 Found ${scenarios.length} scenarios:\n`);

    scenarios.forEach((scenario, index) => {
      console.log(`${index + 1}. ${scenario.name}`);
      console.log(`   ID: ${scenario.id}`);
      console.log(`   Baseline: ${scenario.isBaseline ? 'Yes' : 'No'}`);
      console.log(`   Has Results: ${scenario.results ? 'Yes ✅' : 'No ❌'}`);

      if (scenario.results) {
        console.log(`   Monthly Income: $${scenario.results.totalMonthlyIncome?.toLocaleString() || 'N/A'}`);
        console.log(`   Replacement Ratio: ${(scenario.results.replacementRatio * 100)?.toFixed(1) || 'N/A'}%`);
        console.log(`   Risk Score: ${scenario.results.riskScore || 'N/A'}`);
        console.log(`   Status: CALCULATED 🟢`);
      } else {
        console.log(`   Status: PENDING 🟡`);
      }
      console.log(`   Created: ${new Date(scenario.createdAt).toLocaleDateString()}\n`);
    });

    // Summary
    const withResults = scenarios.filter(s => s.results).length;
    const withoutResults = scenarios.length - withResults;

    console.log('📈 Summary:');
    console.log(`   Scenarios with results (Calculated): ${withResults}`);
    console.log(`   Scenarios without results (Pending): ${withoutResults}`);

    if (withoutResults > 0) {
      console.log('\n🔧 Issue identified: Some scenarios are missing calculated results!');
      console.log('   This explains why they show "Pending" instead of "Calculated" status.');
    } else {
      console.log('\n✅ All scenarios have calculated results!');
    }

  } catch (error) {
    console.error('❌ Error querying scenarios:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkScenarioStatus();
