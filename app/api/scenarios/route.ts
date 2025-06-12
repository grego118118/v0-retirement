import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { monitorServerOperation, reportAPIError } from '@/lib/error-monitoring'
import { calculateScenarioResults } from '@/lib/scenario-modeling/scenario-calculator'
import { RetirementScenario } from '@/lib/scenario-modeling/scenario-types'

// Validation schemas
const createScenarioSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  description: z.string().optional(),
  isBaseline: z.boolean().default(false),
  personalParameters: z.object({
    retirementAge: z.number().min(50).max(75),
    lifeExpectancy: z.number().min(70).max(100),
    currentAge: z.number().min(18).max(75),
    birthYear: z.number().min(1940).max(2010)
  }),
  pensionParameters: z.object({
    retirementGroup: z.enum(['1', '2', '3', '4']),
    yearsOfService: z.number().min(0).max(50),
    averageSalary: z.number().min(0),
    retirementOption: z.enum(['A', 'B', 'C', 'D']),
    beneficiaryAge: z.number().optional(),
    servicePurchases: z.array(z.any()).optional()
  }),
  socialSecurityParameters: z.object({
    claimingAge: z.number().min(62).max(70),
    fullRetirementAge: z.number().min(65).max(67),
    estimatedBenefit: z.number().min(0),
    spousalBenefit: z.number().optional(),
    survivorBenefit: z.number().optional()
  }),
  financialParameters: z.object({
    currentSavings: z.number().min(0),
    monthlyContributions: z.number().min(0),
    expectedReturnRate: z.number().min(0).max(0.15),
    riskTolerance: z.enum(['conservative', 'moderate', 'aggressive']),
    withdrawalRate: z.number().min(0).max(0.1),
    otherRetirementIncome: z.number().min(0)
  }),
  taxParameters: z.object({
    filingStatus: z.enum(['single', 'married_filing_jointly', 'married_filing_separately', 'head_of_household']),
    stateOfResidence: z.string().default('MA'),
    taxOptimizationStrategy: z.enum(['none', 'basic', 'advanced']),
    rothConversions: z.boolean().default(false),
    taxLossHarvesting: z.boolean().default(false)
  }),
  colaParameters: z.object({
    pensionCOLA: z.number().min(0).max(0.1),
    socialSecurityCOLA: z.number().min(0).max(0.1),
    colaScenario: z.enum(['conservative', 'moderate', 'optimistic'])
  })
})

const filterSchema = z.object({
  isBaseline: z.boolean().optional(),
  search: z.string().optional(),
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0)
})

/**
 * GET /api/scenarios
 * Get all scenarios for the authenticated user
 */
export async function GET(request: NextRequest) {
  return monitorServerOperation(async () => {
    try {
      console.log("Scenarios GET request started")
      const session = await getServerSession(authOptions)

      console.log("Session in scenarios GET:", {
        hasSession: !!session,
        userId: session?.user?.id,
        userEmail: session?.user?.email,
        fullSession: session
      })

      if (!session?.user?.id) {
        console.error("No session or user ID in scenarios GET", {
          session,
          hasUser: !!session?.user,
          userKeys: session?.user ? Object.keys(session.user) : []
        })
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        )
      }

      const { searchParams } = new URL(request.url)
      const filters = {
        isBaseline: searchParams.get('isBaseline') === 'true' ? true : 
                   searchParams.get('isBaseline') === 'false' ? false : undefined,
        search: searchParams.get('search') || undefined,
        limit: parseInt(searchParams.get('limit') || '50'),
        offset: parseInt(searchParams.get('offset') || '0')
      }

      // Validate filters
      const validatedFilters = filterSchema.parse(filters)

      // Build where clause
      const where: any = {
        userId: session.user.id
      }

      if (validatedFilters.isBaseline !== undefined) {
        where.isBaseline = validatedFilters.isBaseline
      }

      if (validatedFilters.search) {
        // SQLite doesn't support case-insensitive mode, so we'll use contains without mode
        where.OR = [
          { name: { contains: validatedFilters.search } },
          { description: { contains: validatedFilters.search } }
        ]
      }

      // Query scenarios from database
      const scenarios = await prisma.retirementScenario.findMany({
        where,
        include: {
          results: true
        },
        orderBy: [
          { isBaseline: 'desc' },
          { updatedAt: 'desc' }
        ],
        take: validatedFilters.limit,
        skip: validatedFilters.offset
      })

      // Get total count for pagination
      const totalCount = await prisma.retirementScenario.count({ where })

      // Format response
      const formattedScenarios = scenarios.map(scenario => ({
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

      return NextResponse.json({
        scenarios: formattedScenarios,
        pagination: {
          total: totalCount,
          limit: validatedFilters.limit,
          offset: validatedFilters.offset,
          hasMore: validatedFilters.offset + validatedFilters.limit < totalCount
        }
      })

    } catch (error) {
      console.error("Error fetching scenarios:", error)
      reportAPIError(error as Error, '/api/scenarios', 'GET')
      
      return NextResponse.json(
        { error: "Failed to fetch scenarios" },
        { status: 500 }
      )
    }
  }, 'get_scenarios_api')
}

/**
 * POST /api/scenarios
 * Create a new scenario
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
      const validatedData = createScenarioSchema.parse(body)

      // If setting as baseline, unset other baselines
      if (validatedData.isBaseline) {
        await prisma.retirementScenario.updateMany({
          where: {
            userId: session.user.id,
            isBaseline: true
          },
          data: {
            isBaseline: false
          }
        })
      }

      // Create scenario
      const scenario = await prisma.retirementScenario.create({
        data: {
          userId: session.user.id,
          name: validatedData.name,
          description: validatedData.description,
          isBaseline: validatedData.isBaseline,
          personalParameters: JSON.stringify(validatedData.personalParameters),
          pensionParameters: JSON.stringify(validatedData.pensionParameters),
          socialSecurityParameters: JSON.stringify(validatedData.socialSecurityParameters),
          financialParameters: JSON.stringify(validatedData.financialParameters),
          taxParameters: JSON.stringify(validatedData.taxParameters),
          colaParameters: JSON.stringify(validatedData.colaParameters)
        }
      })

      // Calculate results for the new scenario
      const scenarioData: RetirementScenario = {
        id: scenario.id,
        name: scenario.name,
        description: scenario.description || undefined,
        isBaseline: scenario.isBaseline,
        createdAt: scenario.createdAt.toISOString(),
        updatedAt: scenario.updatedAt.toISOString(),
        personalParameters: validatedData.personalParameters,
        pensionParameters: validatedData.pensionParameters,
        socialSecurityParameters: validatedData.socialSecurityParameters,
        financialParameters: validatedData.financialParameters,
        taxParameters: validatedData.taxParameters,
        colaParameters: validatedData.colaParameters
      }

      try {
        const results = await calculateScenarioResults(scenarioData)
        
        // Save results to database
        await prisma.scenarioResult.create({
          data: {
            scenarioId: scenario.id,
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
        console.error('Error calculating scenario results:', calcError)
        console.error('Scenario data for calculation:', JSON.stringify(scenarioData, null, 2))
        // Continue without results - they can be calculated later
        // In development, we might want to see these errors more prominently
        if (process.env.NODE_ENV === 'development') {
          console.warn('Scenario calculation failed - scenario will show as pending')
        }
      }

      // Return created scenario
      const createdScenario = await prisma.retirementScenario.findUnique({
        where: { id: scenario.id },
        include: { results: true }
      })

      const formattedScenario = {
        ...createdScenario!,
        personalParameters: JSON.parse(createdScenario!.personalParameters),
        pensionParameters: JSON.parse(createdScenario!.pensionParameters),
        socialSecurityParameters: JSON.parse(createdScenario!.socialSecurityParameters),
        financialParameters: JSON.parse(createdScenario!.financialParameters),
        taxParameters: JSON.parse(createdScenario!.taxParameters),
        colaParameters: JSON.parse(createdScenario!.colaParameters),
        results: createdScenario!.results ? {
          ...createdScenario!.results,
          yearlyProjections: createdScenario!.results.yearlyProjections ? 
            JSON.parse(createdScenario!.results.yearlyProjections) : null
        } : null
      }

      return NextResponse.json({
        scenario: formattedScenario,
        message: "Scenario created successfully"
      }, { status: 201 })

    } catch (error) {
      console.error("Error creating scenario:", error)
      reportAPIError(error as Error, '/api/scenarios', 'POST')
      
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: "Invalid scenario data", details: error.errors },
          { status: 400 }
        )
      }
      
      return NextResponse.json(
        { error: "Failed to create scenario" },
        { status: 500 }
      )
    }
  }, 'create_scenario_api')
}
