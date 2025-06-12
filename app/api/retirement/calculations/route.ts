import { NextResponse, NextRequest } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    console.log("Calculations GET request started")
    const session = await getServerSession(authOptions)

    console.log("Session in calculations GET:", {
      hasSession: !!session,
      userId: session?.user?.id,
      userEmail: session?.user?.email
    })

    if (!session?.user?.id) {
      console.error("No session or user ID in calculations GET")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get("limit") || "10")
    const offset = parseInt(searchParams.get("offset") || "0")
    const favorites = searchParams.get("favorites") === "true"

    console.log("Query parameters:", { limit, offset, favorites })

    // Query the database for user's calculations
    const whereClause: any = {
      userId: session.user.id
    }

    if (favorites) {
      whereClause.isFavorite = true
    }

    const calculations = await prisma.retirementCalculation.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc'
      },
      skip: offset,
      take: limit
    })

    // Parse social security data from JSON strings
    const parsedCalculations = calculations.map(calc => ({
      ...calc,
      socialSecurityData: calc.socialSecurityData ? JSON.parse(calc.socialSecurityData) : null,
      retirementDate: calc.retirementDate.toISOString().split('T')[0],
      createdAt: calc.createdAt.toISOString(),
      updatedAt: calc.updatedAt.toISOString()
    }))

    // Get total count for pagination
    const totalCount = await prisma.retirementCalculation.count({
      where: whereClause
    })

    const responseData = {
      calculations: parsedCalculations,
      total: totalCount,
      limit,
      offset
    }

    console.log("Returning calculations data:", {
      count: parsedCalculations.length,
      total: totalCount
    })

    return NextResponse.json(responseData)
  } catch (error) {
    console.error("Error fetching calculations:", error)
    return NextResponse.json({
      error: "Failed to fetch calculations",
      message: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    console.log("Calculations POST request started")
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      console.error("No session or user ID in calculations POST")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const requestBody = await request.json()
    console.log("Calculations POST request body:", requestBody)

    // Validate and prepare data for database
    const calculationData = {
      userId: session.user.id,
      calculationName: requestBody.calculationName || 'Retirement Analysis',
      retirementDate: new Date(requestBody.retirementDate),
      retirementAge: parseInt(requestBody.retirementAge),
      yearsOfService: parseFloat(requestBody.yearsOfService),
      averageSalary: parseFloat(requestBody.averageSalary),
      retirementGroup: requestBody.retirementGroup || 'Group 1',
      benefitPercentage: parseFloat(requestBody.benefitPercentage || 2.0),
      retirementOption: requestBody.retirementOption || 'A',
      monthlyBenefit: parseFloat(requestBody.monthlyBenefit),
      annualBenefit: parseFloat(requestBody.annualBenefit),
      benefitReduction: requestBody.benefitReduction ? parseFloat(requestBody.benefitReduction) : null,
      survivorBenefit: requestBody.survivorBenefit ? parseFloat(requestBody.survivorBenefit) : null,
      socialSecurityData: requestBody.socialSecurityData ? JSON.stringify(requestBody.socialSecurityData) : null,
      notes: requestBody.notes || null,
      isFavorite: requestBody.isFavorite || false
    }

    // Save to database
    const newCalculation = await prisma.retirementCalculation.create({
      data: calculationData
    })

    // Format response
    const responseCalculation = {
      ...newCalculation,
      socialSecurityData: newCalculation.socialSecurityData ? JSON.parse(newCalculation.socialSecurityData) : null,
      retirementDate: newCalculation.retirementDate.toISOString().split('T')[0],
      createdAt: newCalculation.createdAt.toISOString(),
      updatedAt: newCalculation.updatedAt.toISOString()
    }

    console.log("Calculation created successfully:", newCalculation.id)
    return NextResponse.json(responseCalculation, { status: 201 })
  } catch (error) {
    console.error("Error creating calculation:", error)
    return NextResponse.json({
      error: "Failed to create calculation",
      message: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
