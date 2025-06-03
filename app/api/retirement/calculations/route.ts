import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth/auth-config"
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

    const where = {
      userId: session.user.id,
      ...(favorites && { isFavorite: true }),
    }

    let [calculations, total] = await Promise.all([
      prisma.retirementCalculation.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.retirementCalculation.count({ where }),
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

    // Parse socialSecurityData JSON fields for real database records
    const parsedCalculations = calculations.map(calc => ({
      ...calc,
      socialSecurityData: typeof calc.socialSecurityData === 'string' 
        ? JSON.parse(calc.socialSecurityData) 
        : calc.socialSecurityData,
    }))

    return NextResponse.json({
      calculations: parsedCalculations,
      total,
      limit,
      offset,
    })
  } catch (error) {
    console.error("Error fetching calculations:", error)
    return NextResponse.json(
      { error: "Failed to fetch calculations" },
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

    const calculation = await prisma.retirementCalculation.create({
      data: {
        userId: session.user.id,
        calculationName: validatedData.calculationName,
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
      },
    })

    console.log('Calculation saved successfully:', calculation.id)

    return NextResponse.json({ calculation }, { status: 201 })
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