import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { monitorServerOperation, reportAPIError } from '@/lib/error-monitoring'
import { calculateScenarioResults } from '@/lib/scenario-modeling/scenario-calculator'
import { RetirementScenario } from '@/lib/scenario-modeling/scenario-types'

interface RouteParams {
  params: Promise<{ id: string }>
}

// Validation schemas
const updateScenarioSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long').optional(),
  description: z.string().optional(),
  isBaseline: z.boolean().optional(),
  personalParameters: z.object({
    retirementAge: z.number().min(50).max(75),
    lifeExpectancy: z.number().min(70).max(100),
    currentAge: z.number().min(18).max(75),
    birthYear: z.number().min(1940).max(2010)
  }).optional(),
  pensionParameters: z.object({
    retirementGroup: z.enum(['1', '2', '3', '4']),
    yearsOfService: z.number().min(0).max(50),
    averageSalary: z.number().min(0),
    retirementOption: z.enum(['A', 'B', 'C', 'D']),
    beneficiaryAge: z.number().optional(),
    servicePurchases: z.array(z.any()).optional()
  }).optional(),
  socialSecurityParameters: z.object({
    claimingAge: z.number().min(62).max(70),
    fullRetirementAge: z.number().min(65).max(67),
    estimatedBenefit: z.number().min(0),
    spousalBenefit: z.number().optional(),
    survivorBenefit: z.number().optional()
  }).optional(),
  financialParameters: z.object({
    currentSavings: z.number().min(0),
    monthlyContributions: z.number().min(0),
    expectedReturnRate: z.number().min(0).max(0.15),
    riskTolerance: z.enum(['conservative', 'moderate', 'aggressive']),
    withdrawalRate: z.number().min(0).max(0.1),
    otherRetirementIncome: z.number().min(0)
  }).optional(),
  taxParameters: z.object({
    filingStatus: z.enum(['single', 'married_filing_jointly', 'married_filing_separately', 'head_of_household']),
    stateOfResidence: z.string().default('MA'),
    taxOptimizationStrategy: z.enum(['none', 'basic', 'advanced']),
    rothConversions: z.boolean().default(false),
    taxLossHarvesting: z.boolean().default(false)
  }).optional(),
  colaParameters: z.object({
    pensionCOLA: z.number().min(0).max(0.1),
    socialSecurityCOLA: z.number().min(0).max(0.1),
    colaScenario: z.enum(['conservative', 'moderate', 'optimistic'])
  }).optional()
})

const actionSchema = z.object({
  action: z.enum(['duplicate', 'set_baseline', 'recalculate'])
})

/**
 * GET /api/scenarios/[id]
 * Get a specific scenario
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  return monitorServerOperation(async () => {
    try {
      const session = await getServerSession(authOptions)
      
      if (!session?.user?.id) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        )
      }

      const { id } = await params

      const scenario = await prisma.retirementScenario.findFirst({
        where: {
          id,
          userId: session.user.id
        },
        include: {
          results: true
        }
      })

      if (!scenario) {
        return NextResponse.json(
          { error: "Scenario not found" },
          { status: 404 }
        )
      }

      // Format response
      const formattedScenario = {
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
      }

      return NextResponse.json({ scenario: formattedScenario })

    } catch (error) {
      console.error("Error fetching scenario:", error)
      reportAPIError(error as Error, `/api/scenarios/${(await params).id}`, 'GET')
      
      return NextResponse.json(
        { error: "Failed to fetch scenario" },
        { status: 500 }
      )
    }
  }, 'get_scenario_api')
}

/**
 * PATCH /api/scenarios/[id]
 * Update a specific scenario
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  return monitorServerOperation(async () => {
    try {
      const session = await getServerSession(authOptions)
      
      if (!session?.user?.id) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        )
      }

      const { id } = await params
      const body = await request.json()

      // Validate request body
      const validatedData = updateScenarioSchema.parse(body)

      // Check if scenario exists and belongs to user
      const existingScenario = await prisma.retirementScenario.findFirst({
        where: {
          id,
          userId: session.user.id
        }
      })

      if (!existingScenario) {
        return NextResponse.json(
          { error: "Scenario not found" },
          { status: 404 }
        )
      }

      // If setting as baseline, unset other baselines
      if (validatedData.isBaseline) {
        await prisma.retirementScenario.updateMany({
          where: {
            userId: session.user.id,
            isBaseline: true,
            id: { not: id }
          },
          data: {
            isBaseline: false
          }
        })
      }

      // Prepare update data
      const updateData: any = {}
      
      if (validatedData.name !== undefined) updateData.name = validatedData.name
      if (validatedData.description !== undefined) updateData.description = validatedData.description
      if (validatedData.isBaseline !== undefined) updateData.isBaseline = validatedData.isBaseline
      
      if (validatedData.personalParameters) {
        updateData.personalParameters = JSON.stringify(validatedData.personalParameters)
      }
      if (validatedData.pensionParameters) {
        updateData.pensionParameters = JSON.stringify(validatedData.pensionParameters)
      }
      if (validatedData.socialSecurityParameters) {
        updateData.socialSecurityParameters = JSON.stringify(validatedData.socialSecurityParameters)
      }
      if (validatedData.financialParameters) {
        updateData.financialParameters = JSON.stringify(validatedData.financialParameters)
      }
      if (validatedData.taxParameters) {
        updateData.taxParameters = JSON.stringify(validatedData.taxParameters)
      }
      if (validatedData.colaParameters) {
        updateData.colaParameters = JSON.stringify(validatedData.colaParameters)
      }

      // Update scenario
      const updatedScenario = await prisma.retirementScenario.update({
        where: { id },
        data: updateData,
        include: { results: true }
      })

      // If parameters changed, recalculate results
      const parametersChanged = validatedData.personalParameters || 
                               validatedData.pensionParameters || 
                               validatedData.socialSecurityParameters || 
                               validatedData.financialParameters || 
                               validatedData.taxParameters || 
                               validatedData.colaParameters

      if (parametersChanged) {
        try {
          // Build scenario data for calculation
          const scenarioData: RetirementScenario = {
            id: updatedScenario.id,
            name: updatedScenario.name,
            description: updatedScenario.description || undefined,
            isBaseline: updatedScenario.isBaseline,
            createdAt: updatedScenario.createdAt.toISOString(),
            updatedAt: updatedScenario.updatedAt.toISOString(),
            personalParameters: JSON.parse(updatedScenario.personalParameters),
            pensionParameters: JSON.parse(updatedScenario.pensionParameters),
            socialSecurityParameters: JSON.parse(updatedScenario.socialSecurityParameters),
            financialParameters: JSON.parse(updatedScenario.financialParameters),
            taxParameters: JSON.parse(updatedScenario.taxParameters),
            colaParameters: JSON.parse(updatedScenario.colaParameters)
          }

          const results = await calculateScenarioResults(scenarioData)
          
          // Update or create results
          await prisma.scenarioResult.upsert({
            where: { scenarioId: id },
            update: {
              pensionMonthlyBenefit: results.pensionBenefits.monthlyBenefit,
              pensionAnnualBenefit: results.pensionBenefits.annualBenefit,
              pensionLifetimeBenefits: results.pensionBenefits.lifetimeBenefits,
              pensionBenefitReduction: results.pensionBenefits.benefitReduction || 0,
              pensionSurvivorBenefit: results.pensionBenefits.survivorBenefit,
              ssMonthlyBenefit: results.socialSecurityBenefits.monthlyBenefit,
              ssAnnualBenefit: results.socialSecurityBenefits.annualBenefit,
              ssLifetimeBenefits: results.socialSecurityBenefits.lifetimeBenefits,
              ssSpousalBenefit: results.socialSecurityBenefits.spousalBenefit,
              ssSurvivorBenefit: results.socialSecurityBenefits.survivorBenefit,
              totalMonthlyIncome: results.incomeProjections.totalMonthlyIncome,
              totalAnnualIncome: results.incomeProjections.totalAnnualIncome,
              netAfterTaxIncome: results.incomeProjections.netAfterTaxIncome,
              replacementRatio: results.incomeProjections.replacementRatio,
              annualTaxBurden: results.taxAnalysis.annualTaxBurden,
              effectiveTaxRate: results.taxAnalysis.effectiveTaxRate,
              marginalTaxRate: results.taxAnalysis.marginalTaxRate,
              federalTax: results.taxAnalysis.federalTax,
              stateTax: results.taxAnalysis.stateTax,
              socialSecurityTax: results.taxAnalysis.socialSecurityTax,
              initialPortfolioBalance: results.portfolioAnalysis?.initialBalance,
              finalPortfolioBalance: results.portfolioAnalysis?.finalBalance,
              totalWithdrawals: results.portfolioAnalysis?.totalWithdrawals,
              portfolioLongevity: results.portfolioAnalysis?.portfolioLongevity,
              probabilityOfSuccess: results.portfolioAnalysis?.probabilityOfSuccess,
              totalLifetimeIncome: results.keyMetrics.totalLifetimeIncome,
              breakEvenAge: results.keyMetrics.breakEvenAge,
              riskScore: results.keyMetrics.riskScore,
              flexibilityScore: results.keyMetrics.flexibilityScore,
              optimizationScore: results.keyMetrics.optimizationScore,
              yearlyProjections: JSON.stringify(results.incomeProjections.yearlyProjections)
            },
            create: {
              scenarioId: id,
              pensionMonthlyBenefit: results.pensionBenefits.monthlyBenefit,
              pensionAnnualBenefit: results.pensionBenefits.annualBenefit,
              pensionLifetimeBenefits: results.pensionBenefits.lifetimeBenefits,
              pensionBenefitReduction: results.pensionBenefits.benefitReduction || 0,
              pensionSurvivorBenefit: results.pensionBenefits.survivorBenefit,
              ssMonthlyBenefit: results.socialSecurityBenefits.monthlyBenefit,
              ssAnnualBenefit: results.socialSecurityBenefits.annualBenefit,
              ssLifetimeBenefits: results.socialSecurityBenefits.lifetimeBenefits,
              ssSpousalBenefit: results.socialSecurityBenefits.spousalBenefit,
              ssSurvivorBenefit: results.socialSecurityBenefits.survivorBenefit,
              totalMonthlyIncome: results.incomeProjections.totalMonthlyIncome,
              totalAnnualIncome: results.incomeProjections.totalAnnualIncome,
              netAfterTaxIncome: results.incomeProjections.netAfterTaxIncome,
              replacementRatio: results.incomeProjections.replacementRatio,
              annualTaxBurden: results.taxAnalysis.annualTaxBurden,
              effectiveTaxRate: results.taxAnalysis.effectiveTaxRate,
              marginalTaxRate: results.taxAnalysis.marginalTaxRate,
              federalTax: results.taxAnalysis.federalTax,
              stateTax: results.taxAnalysis.stateTax,
              socialSecurityTax: results.taxAnalysis.socialSecurityTax,
              initialPortfolioBalance: results.portfolioAnalysis?.initialBalance,
              finalPortfolioBalance: results.portfolioAnalysis?.finalBalance,
              totalWithdrawals: results.portfolioAnalysis?.totalWithdrawals,
              portfolioLongevity: results.portfolioAnalysis?.portfolioLongevity,
              probabilityOfSuccess: results.portfolioAnalysis?.probabilityOfSuccess,
              totalLifetimeIncome: results.keyMetrics.totalLifetimeIncome,
              breakEvenAge: results.keyMetrics.breakEvenAge,
              riskScore: results.keyMetrics.riskScore,
              flexibilityScore: results.keyMetrics.flexibilityScore,
              optimizationScore: results.keyMetrics.optimizationScore,
              yearlyProjections: JSON.stringify(results.incomeProjections.yearlyProjections)
            }
          })
        } catch (calcError) {
          console.error('Error recalculating scenario results:', calcError)
          // Continue without updating results
        }
      }

      // Get updated scenario with results
      const finalScenario = await prisma.retirementScenario.findUnique({
        where: { id },
        include: { results: true }
      })

      const formattedScenario = {
        ...finalScenario!,
        personalParameters: JSON.parse(finalScenario!.personalParameters),
        pensionParameters: JSON.parse(finalScenario!.pensionParameters),
        socialSecurityParameters: JSON.parse(finalScenario!.socialSecurityParameters),
        financialParameters: JSON.parse(finalScenario!.financialParameters),
        taxParameters: JSON.parse(finalScenario!.taxParameters),
        colaParameters: JSON.parse(finalScenario!.colaParameters),
        results: finalScenario!.results ? {
          ...finalScenario!.results,
          yearlyProjections: finalScenario!.results.yearlyProjections ? 
            JSON.parse(finalScenario!.results.yearlyProjections) : null
        } : null
      }

      return NextResponse.json({
        scenario: formattedScenario,
        message: "Scenario updated successfully"
      })

    } catch (error) {
      console.error("Error updating scenario:", error)
      reportAPIError(error as Error, `/api/scenarios/${(await params).id}`, 'PATCH')
      
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: "Invalid scenario data", details: error.errors },
          { status: 400 }
        )
      }
      
      return NextResponse.json(
        { error: "Failed to update scenario" },
        { status: 500 }
      )
    }
  }, 'update_scenario_api')
}

/**
 * POST /api/scenarios/[id]
 * Perform actions on a specific scenario (duplicate, set_baseline, recalculate)
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  return monitorServerOperation(async () => {
    try {
      const session = await getServerSession(authOptions)

      if (!session?.user?.id) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        )
      }

      const { id } = await params
      const body = await request.json()

      // Validate request body
      const validatedData = actionSchema.parse(body)

      // Check if scenario exists and belongs to user
      const scenario = await prisma.retirementScenario.findFirst({
        where: {
          id,
          userId: session.user.id
        },
        include: { results: true }
      })

      if (!scenario) {
        return NextResponse.json(
          { error: "Scenario not found" },
          { status: 404 }
        )
      }

      let result
      let message

      switch (validatedData.action) {
        case 'duplicate':
          // Create a duplicate scenario
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

          result = await prisma.retirementScenario.findUnique({
            where: { id: duplicateScenario.id },
            include: { results: true }
          })
          message = "Scenario duplicated successfully"
          break

        case 'set_baseline':
          // Unset other baselines first
          await prisma.retirementScenario.updateMany({
            where: {
              userId: session.user.id,
              isBaseline: true,
              id: { not: id }
            },
            data: {
              isBaseline: false
            }
          })

          // Set this scenario as baseline
          result = await prisma.retirementScenario.update({
            where: { id },
            data: { isBaseline: true },
            include: { results: true }
          })
          message = "Scenario set as baseline successfully"
          break

        case 'recalculate':
          // Recalculate scenario results
          try {
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

            const results = await calculateScenarioResults(scenarioData)

            // Update results
            await prisma.scenarioResult.upsert({
              where: { scenarioId: id },
              update: {
                pensionMonthlyBenefit: results.pensionBenefits.monthlyBenefit,
                pensionAnnualBenefit: results.pensionBenefits.annualBenefit,
                pensionLifetimeBenefits: results.pensionBenefits.lifetimeBenefits,
                pensionBenefitReduction: results.pensionBenefits.benefitReduction || 0,
                pensionSurvivorBenefit: results.pensionBenefits.survivorBenefit,
                ssMonthlyBenefit: results.socialSecurityBenefits.monthlyBenefit,
                ssAnnualBenefit: results.socialSecurityBenefits.annualBenefit,
                ssLifetimeBenefits: results.socialSecurityBenefits.lifetimeBenefits,
                ssSpousalBenefit: results.socialSecurityBenefits.spousalBenefit,
                ssSurvivorBenefit: results.socialSecurityBenefits.survivorBenefit,
                totalMonthlyIncome: results.incomeProjections.totalMonthlyIncome,
                totalAnnualIncome: results.incomeProjections.totalAnnualIncome,
                netAfterTaxIncome: results.incomeProjections.netAfterTaxIncome,
                replacementRatio: results.incomeProjections.replacementRatio,
                annualTaxBurden: results.taxAnalysis.annualTaxBurden,
                effectiveTaxRate: results.taxAnalysis.effectiveTaxRate,
                marginalTaxRate: results.taxAnalysis.marginalTaxRate,
                federalTax: results.taxAnalysis.federalTax,
                stateTax: results.taxAnalysis.stateTax,
                socialSecurityTax: results.taxAnalysis.socialSecurityTax,
                initialPortfolioBalance: results.portfolioAnalysis?.initialBalance,
                finalPortfolioBalance: results.portfolioAnalysis?.finalBalance,
                totalWithdrawals: results.portfolioAnalysis?.totalWithdrawals,
                portfolioLongevity: results.portfolioAnalysis?.portfolioLongevity,
                probabilityOfSuccess: results.portfolioAnalysis?.probabilityOfSuccess,
                totalLifetimeIncome: results.keyMetrics.totalLifetimeIncome,
                breakEvenAge: results.keyMetrics.breakEvenAge,
                riskScore: results.keyMetrics.riskScore,
                flexibilityScore: results.keyMetrics.flexibilityScore,
                optimizationScore: results.keyMetrics.optimizationScore,
                yearlyProjections: JSON.stringify(results.incomeProjections.yearlyProjections)
              },
              create: {
                scenarioId: id,
                pensionMonthlyBenefit: results.pensionBenefits.monthlyBenefit,
                pensionAnnualBenefit: results.pensionBenefits.annualBenefit,
                pensionLifetimeBenefits: results.pensionBenefits.lifetimeBenefits,
                pensionBenefitReduction: results.pensionBenefits.benefitReduction || 0,
                pensionSurvivorBenefit: results.pensionBenefits.survivorBenefit,
                ssMonthlyBenefit: results.socialSecurityBenefits.monthlyBenefit,
                ssAnnualBenefit: results.socialSecurityBenefits.annualBenefit,
                ssLifetimeBenefits: results.socialSecurityBenefits.lifetimeBenefits,
                ssSpousalBenefit: results.socialSecurityBenefits.spousalBenefit,
                ssSurvivorBenefit: results.socialSecurityBenefits.survivorBenefit,
                totalMonthlyIncome: results.incomeProjections.totalMonthlyIncome,
                totalAnnualIncome: results.incomeProjections.totalAnnualIncome,
                netAfterTaxIncome: results.incomeProjections.netAfterTaxIncome,
                replacementRatio: results.incomeProjections.replacementRatio,
                annualTaxBurden: results.taxAnalysis.annualTaxBurden,
                effectiveTaxRate: results.taxAnalysis.effectiveTaxRate,
                marginalTaxRate: results.taxAnalysis.marginalTaxRate,
                federalTax: results.taxAnalysis.federalTax,
                stateTax: results.taxAnalysis.stateTax,
                socialSecurityTax: results.taxAnalysis.socialSecurityTax,
                initialPortfolioBalance: results.portfolioAnalysis?.initialBalance,
                finalPortfolioBalance: results.portfolioAnalysis?.finalBalance,
                totalWithdrawals: results.portfolioAnalysis?.totalWithdrawals,
                portfolioLongevity: results.portfolioAnalysis?.portfolioLongevity,
                probabilityOfSuccess: results.portfolioAnalysis?.probabilityOfSuccess,
                totalLifetimeIncome: results.keyMetrics.totalLifetimeIncome,
                breakEvenAge: results.keyMetrics.breakEvenAge,
                riskScore: results.keyMetrics.riskScore,
                flexibilityScore: results.keyMetrics.flexibilityScore,
                optimizationScore: results.keyMetrics.optimizationScore,
                yearlyProjections: JSON.stringify(results.incomeProjections.yearlyProjections)
              }
            })

            result = await prisma.retirementScenario.findUnique({
              where: { id },
              include: { results: true }
            })
            message = "Scenario recalculated successfully"
          } catch (calcError) {
            console.error('Error recalculating scenario:', calcError)
            return NextResponse.json(
              { error: "Failed to recalculate scenario" },
              { status: 500 }
            )
          }
          break

        default:
          return NextResponse.json(
            { error: "Invalid action" },
            { status: 400 }
          )
      }

      // Format response
      const formattedScenario = {
        ...result!,
        personalParameters: JSON.parse(result!.personalParameters),
        pensionParameters: JSON.parse(result!.pensionParameters),
        socialSecurityParameters: JSON.parse(result!.socialSecurityParameters),
        financialParameters: JSON.parse(result!.financialParameters),
        taxParameters: JSON.parse(result!.taxParameters),
        colaParameters: JSON.parse(result!.colaParameters),
        results: result!.results ? {
          ...result!.results,
          yearlyProjections: result!.results.yearlyProjections ?
            JSON.parse(result!.results.yearlyProjections) : null
        } : null
      }

      return NextResponse.json({
        scenario: formattedScenario,
        message
      })

    } catch (error) {
      console.error("Error performing scenario action:", error)
      reportAPIError(error as Error, `/api/scenarios/${(await params).id}`, 'POST')

      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: "Invalid action data", details: error.errors },
          { status: 400 }
        )
      }

      return NextResponse.json(
        { error: "Failed to perform scenario action" },
        { status: 500 }
      )
    }
  }, 'scenario_action_api')
}

/**
 * DELETE /api/scenarios/[id]
 * Delete a specific scenario
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  return monitorServerOperation(async () => {
    try {
      const session = await getServerSession(authOptions)

      if (!session?.user?.id) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        )
      }

      const { id } = await params

      // Check if scenario exists and belongs to user
      const scenario = await prisma.retirementScenario.findFirst({
        where: {
          id,
          userId: session.user.id
        }
      })

      if (!scenario) {
        return NextResponse.json(
          { error: "Scenario not found" },
          { status: 404 }
        )
      }

      // Delete scenario (cascade will handle results and relationships)
      await prisma.retirementScenario.delete({
        where: { id }
      })

      return NextResponse.json({
        message: "Scenario deleted successfully"
      })

    } catch (error) {
      console.error("Error deleting scenario:", error)
      reportAPIError(error as Error, `/api/scenarios/${(await params).id}`, 'DELETE')

      return NextResponse.json(
        { error: "Failed to delete scenario" },
        { status: 500 }
      )
    }
  }, 'delete_scenario_api')
}
