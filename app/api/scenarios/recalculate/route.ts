import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { calculateScenarioResults } from '@/lib/scenario-modeling/scenario-calculator'
import { RetirementScenario } from '@/lib/scenario-modeling/scenario-types'

/**
 * POST /api/scenarios/recalculate
 * Recalculate scenarios that are missing results
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { scenarioIds } = body

    // Get scenarios without results
    const scenarios = await prisma.retirementScenario.findMany({
      where: {
        userId: session.user.id,
        ...(scenarioIds ? { id: { in: scenarioIds } } : {}),
        results: null // Only scenarios without results
      }
    })

    console.log(`Found ${scenarios.length} scenarios to recalculate`)

    const results = []
    let successCount = 0
    let errorCount = 0

    for (const scenario of scenarios) {
      try {
        // Convert database scenario to calculation format
        const scenarioData: RetirementScenario = {
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
        }

        // Calculate results
        const calculationResults = await calculateScenarioResults(scenarioData)
        
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
        })

        results.push({
          scenarioId: scenario.id,
          scenarioName: scenario.name,
          status: 'success',
          totalMonthlyIncome: calculationResults.incomeProjections.totalMonthlyIncome,
          replacementRatio: calculationResults.incomeProjections.replacementRatio
        })
        
        successCount++
        console.log(`✅ Successfully calculated results for scenario: ${scenario.name}`)

      } catch (error) {
        console.error(`❌ Error calculating scenario ${scenario.name}:`, error)
        results.push({
          scenarioId: scenario.id,
          scenarioName: scenario.name,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        errorCount++
      }
    }

    return NextResponse.json({
      message: `Recalculation complete: ${successCount} successful, ${errorCount} errors`,
      totalScenarios: scenarios.length,
      successCount,
      errorCount,
      results
    }, { status: 200 })

  } catch (error) {
    console.error('Error in recalculate endpoint:', error)
    return NextResponse.json(
      { error: 'Failed to recalculate scenarios' },
      { status: 500 }
    )
  }
}
