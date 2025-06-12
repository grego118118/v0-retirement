// Test script to verify scenario creation and calculation
const { PrismaClient } = require('./lib/generated/prisma');

const prisma = new PrismaClient();

async function testScenarioCreation() {
  console.log('🧪 Testing scenario creation and calculation...\n');

  try {
    // Create a test scenario directly in the database
    const testScenario = await prisma.retirementScenario.create({
      data: {
        userId: '113615221466278220538',
        name: 'Test Scenario - Direct Creation',
        description: 'Testing scenario calculation fix',
        isBaseline: false,
        personalParameters: JSON.stringify({
          currentAge: 45,
          retirementAge: 62,
          lifeExpectancy: 85
        }),
        pensionParameters: JSON.stringify({
          yearsOfService: 20,
          retirementGroup: 4,
          averageSalary: 85000,
          retirementOption: 'A',
          beneficiaryAge: 60
        }),
        socialSecurityParameters: JSON.stringify({
          fullRetirementAge: 67,
          fullRetirementBenefit: 2500,
          earlyRetirementBenefit: 1875,
          delayedRetirementBenefit: 3300,
          claimingAge: 67,
          isMarried: false,
          spouseFullRetirementBenefit: 0,
          spouseFullRetirementAge: 67,
          spouseClaimingAge: 67
        }),
        financialParameters: JSON.stringify({
          rothIRABalance: 50000,
          traditional401kBalance: 150000,
          traditionalIRABalance: 25000,
          savingsAccountBalance: 10000,
          otherRetirementIncome: 0,
          withdrawalRate: 0.04,
          expectedReturnRate: 0.07,
          inflationRate: 0.03,
          riskTolerance: 'moderate'
        }),
        taxParameters: JSON.stringify({
          filingStatus: 'single',
          stateOfResidence: 'MA',
          taxOptimizationStrategy: 'basic',
          rothConversions: false
        }),
        colaParameters: JSON.stringify({
          pensionCOLA: 0.03,
          socialSecurityCOLA: 0.025
        })
      }
    });

    console.log(`✅ Created test scenario: ${testScenario.name}`);
    console.log(`   ID: ${testScenario.id}\n`);

    // Now test if we can manually trigger the calculation
    // Since we can't import the TypeScript module directly, let's check if the scenario was created
    const scenarioWithResults = await prisma.retirementScenario.findUnique({
      where: { id: testScenario.id },
      include: { results: true }
    });

    if (scenarioWithResults?.results) {
      console.log('🎉 Scenario has calculated results!');
      console.log(`   Monthly Income: $${scenarioWithResults.results.totalMonthlyIncome?.toLocaleString()}`);
      console.log(`   Replacement Ratio: ${(scenarioWithResults.results.replacementRatio * 100)?.toFixed(1)}%`);
    } else {
      console.log('⚠️  Scenario was created but has no calculated results');
      console.log('   This confirms the issue - calculations are not being saved');
    }

    // Clean up - delete the test scenario
    await prisma.scenarioResult.deleteMany({
      where: { scenarioId: testScenario.id }
    });
    await prisma.retirementScenario.delete({
      where: { id: testScenario.id }
    });

    console.log('\n🧹 Cleaned up test scenario');

  } catch (error) {
    console.error('❌ Error in test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testScenarioCreation();
