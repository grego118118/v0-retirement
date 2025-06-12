import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { monitorServerOperation, reportAPIError } from '@/lib/error-monitoring'

// Validation schemas
const bulkActionSchema = z.object({
  action: z.enum(['delete', 'duplicate', 'compare']),
  scenarioIds: z.array(z.string()).min(1, 'At least one scenario ID required').max(10, 'Maximum 10 scenarios allowed'),
  options: z.object({
    comparisonName: z.string().optional(), // For compare action
    comparisonDescription: z.string().optional() // For compare action
  }).optional()
})

/**
 * POST /api/scenarios/bulk
 * Perform bulk operations on multiple scenarios
 */
export async function POST(request: NextRequest) {
  return monitorServerOperation(async () => {
    try {
      const session = await getServerSession(authOptions)
      
      if (!session?.user?.id) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        )
      }

      const body = await request.json()

      // Validate request body
      const validatedData = bulkActionSchema.parse(body)

      // Verify all scenarios belong to the user
      const scenarios = await prisma.retirementScenario.findMany({
        where: {
          id: { in: validatedData.scenarioIds },
          userId: session.user.id
        },
        include: { results: true }
      })

      if (scenarios.length !== validatedData.scenarioIds.length) {
        return NextResponse.json(
          { error: "One or more scenarios not found or not accessible" },
          { status: 404 }
        )
      }

      let result
      let message

      switch (validatedData.action) {
        case 'delete':
          // Delete multiple scenarios
          const deleteResult = await prisma.retirementScenario.deleteMany({
            where: {
              id: { in: validatedData.scenarioIds },
              userId: session.user.id
            }
          })

          result = { deletedCount: deleteResult.count }
          message = `Successfully deleted ${deleteResult.count} scenarios`
          break

        case 'duplicate':
          // Duplicate multiple scenarios
          const duplicatedScenarios = []

          for (const scenario of scenarios) {
            const duplicateScenario = await prisma.retirementScenario.create({
              data: {
                userId: session.user.id,
                name: `${scenario.name} (Copy)`,
                description: scenario.description,
                isBaseline: false, // Duplicates are never baseline
                personalParameters: scenario.personalParameters,
                pensionParameters: scenario.pensionParameters,
                socialSecurityParameters: scenario.socialSecurityParameters,
                financialParameters: scenario.financialParameters,
                taxParameters: scenario.taxParameters,
                colaParameters: scenario.colaParameters
              }
            })

            // Copy results if they exist
            if (scenario.results) {
              await prisma.scenarioResult.create({
                data: {
                  scenarioId: duplicateScenario.id,
                  pensionMonthlyBenefit: scenario.results.pensionMonthlyBenefit,
                  pensionAnnualBenefit: scenario.results.pensionAnnualBenefit,
                  pensionLifetimeBenefits: scenario.results.pensionLifetimeBenefits,
                  pensionBenefitReduction: scenario.results.pensionBenefitReduction,
                  pensionSurvivorBenefit: scenario.results.pensionSurvivorBenefit,
                  ssMonthlyBenefit: scenario.results.ssMonthlyBenefit,
                  ssAnnualBenefit: scenario.results.ssAnnualBenefit,
                  ssLifetimeBenefits: scenario.results.ssLifetimeBenefits,
                  ssSpousalBenefit: scenario.results.ssSpousalBenefit,
                  ssSurvivorBenefit: scenario.results.ssSurvivorBenefit,
                  totalMonthlyIncome: scenario.results.totalMonthlyIncome,
                  totalAnnualIncome: scenario.results.totalAnnualIncome,
                  netAfterTaxIncome: scenario.results.netAfterTaxIncome,
                  replacementRatio: scenario.results.replacementRatio,
                  annualTaxBurden: scenario.results.annualTaxBurden,
                  effectiveTaxRate: scenario.results.effectiveTaxRate,
                  marginalTaxRate: scenario.results.marginalTaxRate,
                  federalTax: scenario.results.federalTax,
                  stateTax: scenario.results.stateTax,
                  socialSecurityTax: scenario.results.socialSecurityTax,
                  initialPortfolioBalance: scenario.results.initialPortfolioBalance,
                  finalPortfolioBalance: scenario.results.finalPortfolioBalance,
                  totalWithdrawals: scenario.results.totalWithdrawals,
                  portfolioLongevity: scenario.results.portfolioLongevity,
                  probabilityOfSuccess: scenario.results.probabilityOfSuccess,
                  totalLifetimeIncome: scenario.results.totalLifetimeIncome,
                  breakEvenAge: scenario.results.breakEvenAge,
                  riskScore: scenario.results.riskScore,
                  flexibilityScore: scenario.results.flexibilityScore,
                  optimizationScore: scenario.results.optimizationScore,
                  yearlyProjections: scenario.results.yearlyProjections
                }
              })
            }

            duplicatedScenarios.push(duplicateScenario.id)
          }

          // Get the duplicated scenarios with results
          const newScenarios = await prisma.retirementScenario.findMany({
            where: { id: { in: duplicatedScenarios } },
            include: { results: true }
          })

          // Format response
          const formattedScenarios = newScenarios.map(scenario => ({
            ...scenario,
            personalParameters: JSON.parse(scenario.personalParameters),
            pensionParameters: JSON.parse(scenario.pensionParameters),
            socialSecurityParameters: JSON.parse(scenario.socialSecurityParameters),
            financialParameters: JSON.parse(scenario.financialParameters),
            taxParameters: JSON.parse(scenario.taxParameters),
            colaParameters: JSON.parse(scenario.colaParameters),
            results: scenario.results ? {
              ...scenario.results,
              yearlyProjections: scenario.results.yearlyProjections ? 
                JSON.parse(scenario.results.yearlyProjections) : null
            } : null
          }))

          result = { 
            duplicatedScenarios: formattedScenarios,
            duplicatedCount: duplicatedScenarios.length 
          }
          message = `Successfully duplicated ${duplicatedScenarios.length} scenarios`
          break

        case 'compare':
          // Create a scenario comparison
          const comparisonName = validatedData.options?.comparisonName || 
            `Comparison of ${scenarios.length} scenarios`
          const comparisonDescription = validatedData.options?.comparisonDescription || 
            `Comparison created on ${new Date().toLocaleDateString()}`

          // Calculate comparison metrics
          const comparisonMetrics = {
            scenarioCount: scenarios.length,
            averageMonthlyIncome: scenarios.reduce((sum, s) => 
              sum + (s.results?.totalMonthlyIncome || 0), 0) / scenarios.length,
            averageReplacementRatio: scenarios.reduce((sum, s) => 
              sum + (s.results?.replacementRatio || 0), 0) / scenarios.length,
            averageRiskScore: scenarios.reduce((sum, s) => 
              sum + (s.results?.riskScore || 0), 0) / scenarios.length,
            bestScenario: scenarios.reduce((best, current) => 
              (current.results?.optimizationScore || 0) > (best.results?.optimizationScore || 0) 
                ? current : best, scenarios[0]),
            worstScenario: scenarios.reduce((worst, current) => 
              (current.results?.optimizationScore || 0) < (worst.results?.optimizationScore || 0) 
                ? current : worst, scenarios[0])
          }

          // Generate recommendations
          const recommendations = [
            {
              type: 'optimization',
              title: 'Best Performing Scenario',
              description: `${comparisonMetrics.bestScenario.name} shows the highest optimization score`,
              priority: 'high'
            },
            {
              type: 'risk',
              title: 'Risk Assessment',
              description: `Average risk score is ${comparisonMetrics.averageRiskScore.toFixed(1)}/10`,
              priority: 'medium'
            },
            {
              type: 'income',
              title: 'Income Replacement',
              description: `Average replacement ratio is ${(comparisonMetrics.averageReplacementRatio * 100).toFixed(1)}%`,
              priority: 'medium'
            }
          ]

          // Create comparison record
          const comparison = await prisma.scenarioComparison.create({
            data: {
              userId: session.user.id,
              name: comparisonName,
              description: comparisonDescription,
              comparisonMetrics: JSON.stringify(comparisonMetrics),
              recommendations: JSON.stringify(recommendations)
            }
          })

          // Connect scenarios to comparison (many-to-many relationship)
          await prisma.scenarioComparison.update({
            where: { id: comparison.id },
            data: {
              scenarios: {
                connect: validatedData.scenarioIds.map(id => ({ id }))
              }
            }
          })

          result = {
            comparison: {
              ...comparison,
              comparisonMetrics: JSON.parse(comparison.comparisonMetrics),
              recommendations: JSON.parse(comparison.recommendations),
              scenarios: scenarios.map(s => ({
                id: s.id,
                name: s.name,
                isBaseline: s.isBaseline
              }))
            }
          }
          message = `Successfully created comparison with ${scenarios.length} scenarios`
          break

        default:
          return NextResponse.json(
            { error: "Invalid action" },
            { status: 400 }
          )
      }

      return NextResponse.json({
        ...result,
        message
      })

    } catch (error) {
      console.error("Error performing bulk scenario operation:", error)
      reportAPIError(error as Error, '/api/scenarios/bulk', 'POST')
      
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: "Invalid bulk operation data", details: error.errors },
          { status: 400 }
        )
      }
      
      return NextResponse.json(
        { error: "Failed to perform bulk operation" },
        { status: 500 }
      )
    }
  }, 'bulk_scenarios_api')
}
