import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth/auth-options"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

// Schema for validating calculation data
const calculationSchema = z.object({
  calculationName: z.string().optional(),
  retirementDate: z.string().datetime(),
  retirementAge: z.number().min(50).max(80),
  yearsOfService: z.number().min(0),
  averageSalary: z.number().min(0),
  retirementGroup: z.enum(["1", "2", "3", "4"]),
  benefitPercentage: z.number().min(0).max(5),
  retirementOption: z.enum(["A", "B", "C"]),
  monthlyBenefit: z.number(),
  annualBenefit: z.number(),
  benefitReduction: z.number().optional(),
  survivorBenefit: z.number().optional(),
  notes: z.string().optional(),
  isFavorite: z.boolean().optional(),
  // Social Security fields
  socialSecurityData: z.object({
    fullRetirementAge: z.number().min(62).max(67).optional(),
    earlyRetirementBenefit: z.number().min(0).optional(),
    fullRetirementBenefit: z.number().min(0).optional(),
    delayedRetirementBenefit: z.number().min(0).optional(),
    selectedClaimingAge: z.number().min(62).max(70).optional(),
    selectedMonthlyBenefit: z.number().min(0).optional(),
    combinedMonthlyIncome: z.number().min(0).optional(),
    replacementRatio: z.number().min(0).max(2).optional(),
  }).optional(),
})

// GET - Retrieve all user's calculations
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get("limit") || "10")
    const offset = parseInt(searchParams.get("offset") || "0")
    const favorites = searchParams.get("favorites") === "true"

    // Query calculations using Prisma Client
    const whereCondition: any = {
      userId: session.user.id
    }

    if (favorites) {
      whereCondition.isFavorite = true
    }

    let [calculations, total] = await Promise.all([
      prisma.retirementCalculation.findMany({
        where: whereCondition,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.retirementCalculation.count({
        where: whereCondition,
      }),
    ])

    // If no calculations exist, provide mock data for demonstration
    if (calculations.length === 0 && offset === 0) {
      console.log(`No calculations found for user ${session.user.id}, returning mock data`)
      const mockCalculations = [
        {
          id: "mock-1",
          userId: session.user.id,
          calculationName: "Current Plan - Age 65",
          retirementDate: new Date("2029-06-15"),
          retirementAge: 65,
          yearsOfService: 30,
          averageSalary: 75000,
          retirementGroup: "1" as const,
          benefitPercentage: 2.5,
          retirementOption: "A" as const,
          monthlyBenefit: 4465,
          annualBenefit: 53580,
          benefitReduction: null,
          survivorBenefit: null,
          notes: "Standard retirement plan at full retirement age",
          isFavorite: true,
          createdAt: new Date("2024-01-15T10:30:00Z"),
          updatedAt: new Date("2024-01-15T10:30:00Z"),
          socialSecurityData: null,
        },
        {
          id: "mock-2", 
          userId: session.user.id,
          calculationName: "Early Retirement - Age 62",
          retirementDate: new Date("2026-06-15"),
          retirementAge: 62,
          yearsOfService: 27,
          averageSalary: 73000,
          retirementGroup: "1" as const,
          benefitPercentage: 2.5,
          retirementOption: "A" as const,
          monthlyBenefit: 3890,
          annualBenefit: 46680,
          benefitReduction: 0.13,
          survivorBenefit: null,
          notes: "Early retirement with reduced benefits",
          isFavorite: false,
          createdAt: new Date("2024-01-10T14:15:00Z"),
          updatedAt: new Date("2024-01-10T14:15:00Z"),
          socialSecurityData: null,
        },
        {
          id: "mock-3",
          userId: session.user.id,
          calculationName: "Option C - With Survivor Benefits",
          retirementDate: new Date("2029-06-15"),
          retirementAge: 65,
          yearsOfService: 30,
          averageSalary: 75000,
          retirementGroup: "1" as const,
          benefitPercentage: 2.5,
          retirementOption: "C" as const,
          monthlyBenefit: 2977,
          annualBenefit: 35720,
          benefitReduction: null,
          survivorBenefit: 2977,
          notes: "Joint survivor allowance for spouse protection",
          isFavorite: false,
          createdAt: new Date("2024-01-08T09:45:00Z"),
          updatedAt: new Date("2024-01-08T09:45:00Z"),
          socialSecurityData: null,
        },
        {
          id: "mock-4",
          userId: session.user.id,
          calculationName: "Maximum Service - Age 67",
          retirementDate: new Date("2031-06-15"),
          retirementAge: 67,
          yearsOfService: 32,
          averageSalary: 78000,
          retirementGroup: "1" as const,
          benefitPercentage: 2.5,
          retirementOption: "A" as const,
          monthlyBenefit: 5200,
          annualBenefit: 62400,
          benefitReduction: null,
          survivorBenefit: null,
          notes: "Maximum benefit with additional years of service",
          isFavorite: true,
          createdAt: new Date("2024-01-05T16:20:00Z"),
          updatedAt: new Date("2024-01-05T16:20:00Z"),
          socialSecurityData: null,
        },
        {
          id: "mock-5",
          userId: session.user.id,
          calculationName: "Combined Retirement Plan - With Social Security",
          retirementDate: new Date("2029-06-15"),
          retirementAge: 65,
          yearsOfService: 30,
          averageSalary: 75000,
          retirementGroup: "1" as const,
          benefitPercentage: 2.5,
          retirementOption: "A" as const,
          monthlyBenefit: 4465,
          annualBenefit: 53580,
          benefitReduction: null,
          survivorBenefit: null,
          notes: "Combined calculation with Social Security benefits included",
          isFavorite: true,
          createdAt: new Date("2024-01-20T14:30:00Z"),
          updatedAt: new Date("2024-01-20T14:30:00Z"),
          socialSecurityData: JSON.stringify({
            fullRetirementAge: 67,
            earlyRetirementBenefit: 2100,
            fullRetirementBenefit: 2800,
            delayedRetirementBenefit: 3500,
            selectedClaimingAge: 67,
            selectedMonthlyBenefit: 2800,
            combinedMonthlyIncome: 7265,
            replacementRatio: 0.85,
          }),
        }
      ]
      
      calculations = mockCalculations
      total = mockCalculations.length
    } else {
      console.log(`Found ${calculations.length} real calculations for user ${session.user.id}`)
    }

    // Transform Prisma data to match expected format
    const parsedCalculations = calculations.map(calc => {
      // Parse the socialSecurityData JSON if it exists
      let socialSecurityData = null
      try {
        socialSecurityData = calc.socialSecurityData ? JSON.parse(calc.socialSecurityData) : null
      } catch (error) {
        console.error('Error parsing social security data:', error)
      }

      return {
        id: calc.id,
        userId: calc.userId,
        calculationName: calc.calculationName,
        retirementDate: calc.retirementDate,
        retirementAge: calc.retirementAge,
        yearsOfService: calc.yearsOfService,
        averageSalary: calc.averageSalary,
        retirementGroup: calc.retirementGroup,
        benefitPercentage: calc.benefitPercentage,
        retirementOption: calc.retirementOption,
        monthlyBenefit: calc.monthlyBenefit,
        annualBenefit: calc.annualBenefit,
        benefitReduction: calc.benefitReduction,
        survivorBenefit: calc.survivorBenefit,
        notes: calc.notes,
        isFavorite: calc.isFavorite,
        createdAt: calc.createdAt,
        updatedAt: calc.updatedAt,
        socialSecurityData: socialSecurityData,
      }
    })

    const response = {
      calculations: parsedCalculations,
      total,
      limit,
      offset,
    }

    console.log('API Response structure:', {
      calculationsCount: response.calculations.length,
      total: response.total,
      limit: response.limit,
      offset: response.offset,
      sampleCalculation: response.calculations[0] ? {
        id: response.calculations[0].id,
        calculationName: response.calculations[0].calculationName,
        monthlyBenefit: response.calculations[0].monthlyBenefit,
        hasSSData: !!response.calculations[0].socialSecurityData
      } : null
    })

    console.log('Complete API Response being sent to frontend:', JSON.stringify(response, null, 2))

    return NextResponse.json(response)
  } catch (error) {
    // Enhanced error logging for debugging
    console.error("=== CALCULATIONS API ERROR ===")
    console.error("Error type:", error?.constructor?.name)
    console.error("Error message:", error instanceof Error ? error.message : String(error))
    console.error("Error stack:", error instanceof Error ? error.stack : 'No stack trace')
    console.error("Session user ID:", (await getServerSession(authOptions))?.user?.id)
    console.error("Database URL configured:", !!process.env.DATABASE_URL)
    console.error("Prisma client available:", typeof prisma)

    // Check if it's a database connection error
    if (error instanceof Error) {
      if (error.message.includes('connect') || error.message.includes('timeout')) {
        console.error("DATABASE CONNECTION ERROR detected")
        return NextResponse.json(
          { error: "Database connection error. Please try again." },
          { status: 503 }
        )
      } else if (error.message.includes('prepared statement')) {
        console.error("PREPARED STATEMENT ERROR detected")
        return NextResponse.json(
          { error: "Database query error. Please try again." },
          { status: 503 }
        )
      }
    }

    return NextResponse.json(
      {
        error: "Failed to fetch calculations",
        details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined
      },
      { status: 500 }
    )
  }
}

// POST - Create a new calculation
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = calculationSchema.parse(body)

    // Create calculation using Prisma
    const calculation = await prisma.retirementCalculation.create({
      data: {
        userId: session.user.id,
        calculationName: validatedData.calculationName || 'Retirement Calculation',
        retirementDate: new Date(validatedData.retirementDate),
        retirementAge: validatedData.retirementAge,
        yearsOfService: validatedData.yearsOfService,
        averageSalary: validatedData.averageSalary,
        retirementGroup: validatedData.retirementGroup,
        benefitPercentage: validatedData.benefitPercentage,
        retirementOption: validatedData.retirementOption,
        monthlyBenefit: validatedData.monthlyBenefit,
        annualBenefit: validatedData.annualBenefit,
        benefitReduction: validatedData.benefitReduction,
        survivorBenefit: validatedData.survivorBenefit,
        notes: validatedData.notes,
        isFavorite: validatedData.isFavorite || false,
        socialSecurityData: validatedData.socialSecurityData ? JSON.stringify(validatedData.socialSecurityData) : null,
      }
    })

    console.log('Calculation saved successfully:', calculation.id)

    // Transform the response to include parsed socialSecurityData
    const responseCalculation = {
      ...calculation,
      socialSecurityData: calculation.socialSecurityData ? JSON.parse(calculation.socialSecurityData) : null,
    }

    return NextResponse.json({ calculation: responseCalculation }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Validation error:", error.errors)
      return NextResponse.json(
        { error: "Invalid data", details: error.errors },
        { status: 400 }
      )
    }
    
    console.error("Error creating calculation:", error)
    return NextResponse.json(
      { error: "Failed to create calculation" },
      { status: 500 }
    )
  }
} 