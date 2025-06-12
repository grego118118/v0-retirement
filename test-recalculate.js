// Test script to recalculate scenarios directly
const { PrismaClient } = require('./lib/generated/prisma');
const { calculateScenarioResults } = require('./lib/scenario-modeling/scenario-calculator');

const prisma = new PrismaClient();

async function recalculateScenarios() {
  console.log('🔧 Starting scenario recalculation...\n');

  try {
    // Get scenarios without results
    const scenarios = await prisma.retirementScenario.findMany({
      where: {
        userId: '113615221466278220538',
        results: null // Only scenarios without results
      }
    });

    console.log(`Found ${scenarios.length} scenarios to recalculate\n`);

    let successCount = 0;
    let errorCount = 0;

    for (const scenario of scenarios) {
      try {
        console.log(`🔄 Processing: ${scenario.name}`);
        
        // Convert database scenario to calculation format
        const scenarioData = {
          id: scenario.id,
          name: scenario.name,
          description: scenario.description || undefined,
          isBaseline: scenario.isBaseline,
          createdAt: scenario.createdAt.toISOString(),
          updatedAt: scenario.updatedAt.toISOString(),
          personalParameters: JSON.parse(scenario.personalParameters),
          pensionParameters: JSON.parse(scenario.pensionParameters),
          socialSecurityParameters: JSON.parse(scenario.socialSecurityParameters),
          financialParameters: JSON.parse(scenario.financialParameters),
          taxParameters: JSON.parse(scenario.taxParameters),
          colaParameters: JSON.parse(scenario.colaParameters)
        };

        // Calculate results
        const calculationResults = await calculateScenarioResults(scenarioData);
        
        // Save results to database
        await prisma.scenarioResult.create({
          data: {
            scenarioId: scenario.id,
            pensionMonthlyBenefit: calculationResults.pensionBenefits.monthlyBenefit,
            pensionAnnualBenefit: calculationResults.pensionBenefits.annualBenefit,
            pensionLifetimeBenefits: calculationResults.pensionBenefits.lifetimeBenefits,
            pensionBenefitReduction: calculationResults.pensionBenefits.benefitReduction || 0,
            pensionSurvivorBenefit: calculationResults.pensionBenefits.survivorBenefit,
            ssMonthlyBenefit: calculationResults.socialSecurityBenefits.monthlyBenefit,
            ssAnnualBenefit: calculationResults.socialSecurityBenefits.annualBenefit,
            ssLifetimeBenefits: calculationResults.socialSecurityBenefits.lifetimeBenefits,
            ssSpousalBenefit: calculationResults.socialSecurityBenefits.spousalBenefit,
            ssSurvivorBenefit: calculationResults.socialSecurityBenefits.survivorBenefit,
            totalMonthlyIncome: calculationResults.incomeProjections.totalMonthlyIncome,
            totalAnnualIncome: calculationResults.incomeProjections.totalAnnualIncome,
            netAfterTaxIncome: calculationResults.incomeProjections.netAfterTaxIncome,
            replacementRatio: calculationResults.incomeProjections.replacementRatio,
            annualTaxBurden: calculationResults.taxAnalysis.annualTaxBurden,
            effectiveTaxRate: calculationResults.taxAnalysis.effectiveTaxRate,
            marginalTaxRate: calculationResults.taxAnalysis.marginalTaxRate,
            federalTax: calculationResults.taxAnalysis.federalTax,
            stateTax: calculationResults.taxAnalysis.stateTax,
            socialSecurityTax: calculationResults.taxAnalysis.socialSecurityTax,
            initialPortfolioBalance: calculationResults.portfolioAnalysis?.initialBalance,
            finalPortfolioBalance: calculationResults.portfolioAnalysis?.finalBalance,
            totalWithdrawals: calculationResults.portfolioAnalysis?.totalWithdrawals,
            portfolioLongevity: calculationResults.portfolioAnalysis?.portfolioLongevity,
            probabilityOfSuccess: calculationResults.portfolioAnalysis?.probabilityOfSuccess,
            totalLifetimeIncome: calculationResults.keyMetrics.totalLifetimeIncome,
            breakEvenAge: calculationResults.keyMetrics.breakEvenAge,
            riskScore: calculationResults.keyMetrics.riskScore,
            flexibilityScore: calculationResults.keyMetrics.flexibilityScore,
            optimizationScore: calculationResults.keyMetrics.optimizationScore,
            yearlyProjections: JSON.stringify(calculationResults.incomeProjections.yearlyProjections)
          }
        });

        console.log(`   ✅ Success! Monthly Income: $${calculationResults.incomeProjections.totalMonthlyIncome.toLocaleString()}`);
        console.log(`   📊 Replacement Ratio: ${(calculationResults.incomeProjections.replacementRatio * 100).toFixed(1)}%\n`);
        
        successCount++;

      } catch (error) {
        console.error(`   ❌ Error calculating scenario ${scenario.name}:`, error.message);
        errorCount++;
      }
    }

    console.log('📈 Recalculation Summary:');
    console.log(`   ✅ Successful: ${successCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log(`   📊 Total: ${scenarios.length}`);

    if (successCount > 0) {
      console.log('\n🎉 Scenarios should now show "Calculated" status instead of "Pending"!');
    }

  } catch (error) {
    console.error('❌ Error in recalculation process:', error);
  } finally {
    await prisma.$disconnect();
  }
}

recalculateScenarios();
