import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth/auth-config"
import { z } from "zod"
import { prisma } from "@/lib/prisma"

// Schema for updating calculation data
const updateCalculationSchema = z.object({
  calculationName: z.string().optional(),
  notes: z.string().optional(),
  isFavorite: z.boolean().optional(),
  // Allow updating calculation parameters
  retirementAge: z.number().min(50).max(80).optional(),
  yearsOfService: z.number().min(0).max(50).optional(),
  averageSalary: z.number().min(1000).max(500000).optional(),
  retirementGroup: z.enum(["1", "2", "3", "4"]).optional(),
  retirementOption: z.enum(["A", "B", "C"]).optional(),
  // Allow updating calculated results
  monthlyBenefit: z.number().optional(),
  annualBenefit: z.number().optional(),
  benefitPercentage: z.number().optional(),
  benefitReduction: z.number().optional(),
  survivorBenefit: z.number().optional(),
})

// GET - Retrieve a specific calculation
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const calculation = await prisma.retirementCalculation.findFirst({
      where: {
        id: id,
        userId: session.user.id,
      },
    })

    if (!calculation) {
      return NextResponse.json(
        { error: "Calculation not found" },
        { status: 404 }
      )
    }

    // Parse Social Security data if it exists
    let socialSecurityData = null
    if (calculation.socialSecurityData) {
      try {
        socialSecurityData = JSON.parse(calculation.socialSecurityData)
      } catch (error) {
        console.error('Error parsing Social Security data:', error)
      }
    }

    // Transform Prisma data to expected format
    const formattedCalculation = {
      id: calculation.id,
      userId: calculation.userId,
      calculationName: calculation.calculationName,
      retirementDate: calculation.retirementDate.toISOString(),
      retirementAge: calculation.retirementAge,
      yearsOfService: calculation.yearsOfService,
      averageSalary: calculation.averageSalary,
      retirementGroup: calculation.retirementGroup,
      benefitPercentage: calculation.benefitPercentage,
      retirementOption: calculation.retirementOption,
      monthlyBenefit: calculation.monthlyBenefit,
      annualBenefit: calculation.annualBenefit,
      benefitReduction: calculation.benefitReduction,
      survivorBenefit: calculation.survivorBenefit,
      notes: calculation.notes,
      isFavorite: calculation.isFavorite,
      createdAt: calculation.createdAt.toISOString(),
      updatedAt: calculation.updatedAt.toISOString(),
      socialSecurityData: socialSecurityData,
    }

    return NextResponse.json({ calculation: formattedCalculation })
  } catch (error) {
    console.error("Error fetching calculation:", error)
    return NextResponse.json(
      { error: "Failed to fetch calculation" },
      { status: 500 }
    )
  }
}

// PUT - Update a calculation
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = updateCalculationSchema.parse(body)

    const { id } = await params

    // Check if calculation exists and belongs to user
    const existingCalculation = await prisma.retirementCalculation.findFirst({
      where: {
        id: id,
        userId: session.user.id,
      },
    })

    if (!existingCalculation) {
      return NextResponse.json(
        { error: "Calculation not found" },
        { status: 404 }
      )
    }

    // Prepare update data - only update provided fields
    const updateData: any = {}

    if (validatedData.calculationName !== undefined) {
      updateData.calculationName = validatedData.calculationName
    }

    if (validatedData.isFavorite !== undefined) {
      updateData.isFavorite = validatedData.isFavorite
    }

    if (validatedData.retirementAge !== undefined) {
      updateData.retirementAge = validatedData.retirementAge
    }

    if (validatedData.yearsOfService !== undefined) {
      updateData.yearsOfService = validatedData.yearsOfService
    }

    if (validatedData.averageSalary !== undefined) {
      updateData.averageSalary = validatedData.averageSalary
    }

    if (validatedData.retirementGroup !== undefined) {
      updateData.retirementGroup = validatedData.retirementGroup
    }

    if (validatedData.retirementOption !== undefined) {
      updateData.retirementOption = validatedData.retirementOption
    }

    if (validatedData.monthlyBenefit !== undefined) {
      updateData.monthlyBenefit = validatedData.monthlyBenefit
    }

    if (validatedData.annualBenefit !== undefined) {
      updateData.annualBenefit = validatedData.annualBenefit
    }

    if (validatedData.benefitPercentage !== undefined) {
      updateData.benefitPercentage = validatedData.benefitPercentage
    }

    if (validatedData.benefitReduction !== undefined) {
      updateData.benefitReduction = validatedData.benefitReduction
    }

    if (validatedData.survivorBenefit !== undefined) {
      updateData.survivorBenefit = validatedData.survivorBenefit
    }

    if (validatedData.notes !== undefined) {
      updateData.notes = validatedData.notes
    }

    // Update the calculation using Prisma
    const updatedCalculation = await prisma.retirementCalculation.update({
      where: {
        id: id,
      },
      data: updateData,
    })

    // Parse Social Security data if it exists
    let socialSecurityData = null
    if (updatedCalculation.socialSecurityData) {
      try {
        socialSecurityData = JSON.parse(updatedCalculation.socialSecurityData)
      } catch (error) {
        console.error('Error parsing Social Security data:', error)
      }
    }

    // Transform Prisma data to expected format
    const formattedCalculation = {
      id: updatedCalculation.id,
      userId: updatedCalculation.userId,
      calculationName: updatedCalculation.calculationName,
      retirementDate: updatedCalculation.retirementDate.toISOString(),
      retirementAge: updatedCalculation.retirementAge,
      yearsOfService: updatedCalculation.yearsOfService,
      averageSalary: updatedCalculation.averageSalary,
      retirementGroup: updatedCalculation.retirementGroup,
      benefitPercentage: updatedCalculation.benefitPercentage,
      retirementOption: updatedCalculation.retirementOption,
      monthlyBenefit: updatedCalculation.monthlyBenefit,
      annualBenefit: updatedCalculation.annualBenefit,
      benefitReduction: updatedCalculation.benefitReduction,
      survivorBenefit: updatedCalculation.survivorBenefit,
      notes: updatedCalculation.notes,
      isFavorite: updatedCalculation.isFavorite,
      createdAt: updatedCalculation.createdAt.toISOString(),
      updatedAt: updatedCalculation.updatedAt.toISOString(),
      socialSecurityData: socialSecurityData,
    }

    return NextResponse.json({ calculation: formattedCalculation })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error updating calculation:", error)
    return NextResponse.json(
      { error: "Failed to update calculation" },
      { status: 500 }
    )
  }
}



// DELETE - Delete a calculation
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  console.log("DELETE calculation: API endpoint called")

  try {
    // Get session with detailed logging
    const session = await getServerSession(authOptions)
    console.log("DELETE calculation: Session check:", {
      hasSession: !!session,
      hasUser: !!session?.user,
      hasUserId: !!session?.user?.id,
      userId: session?.user?.id
    })

    if (!session?.user?.id) {
      console.log("DELETE calculation: Unauthorized - no session or user ID")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    console.log("DELETE calculation: Extracted params:", { calculationId: id })

    // Validate the ID parameter
    if (!id || typeof id !== 'string') {
      console.log("DELETE calculation: Invalid ID parameter:", id)
      return NextResponse.json(
        { error: "Invalid calculation ID" },
        { status: 400 }
      )
    }

    console.log("DELETE calculation: Starting delete for ID:", id, "User:", session.user.id)

    // Check if calculation exists and belongs to user using Prisma
    console.log("DELETE calculation: Checking if calculation exists...")
    const existingCalculation = await prisma.retirementCalculation.findFirst({
      where: {
        id: id,
        userId: session.user.id,
      },
      select: {
        id: true,
        userId: true,
        calculationName: true,
      }
    })

    console.log("DELETE calculation: Existence check result:", {
      found: !!existingCalculation,
      calculation: existingCalculation
    })

    if (!existingCalculation) {
      console.log("DELETE calculation: Calculation not found or doesn't belong to user")

      // Check if calculation exists for any user (for debugging)
      const anyUserCalculation = await prisma.retirementCalculation.findUnique({
        where: { id: id },
        select: { id: true, userId: true }
      })

      console.log("DELETE calculation: Check for any user:", {
        found: !!anyUserCalculation,
        actualUserId: anyUserCalculation?.userId,
        requestUserId: session.user.id
      })

      return NextResponse.json(
        { error: "Calculation not found or you don't have permission to delete it" },
        { status: 404 }
      )
    }

    // Delete the calculation using Prisma
    console.log("DELETE calculation: Proceeding with deletion...")
    const deletedCalculation = await prisma.retirementCalculation.delete({
      where: {
        id: id,
      },
    })

    console.log("DELETE calculation: Delete operation successful:", {
      deletedId: deletedCalculation.id,
      deletedName: deletedCalculation.calculationName
    })

    const successResponse = {
      success: true,
      message: "Calculation deleted successfully",
      deletedId: id
    }

    console.log("DELETE calculation: Returning success response:", successResponse)
    return NextResponse.json(successResponse)

  } catch (error) {
    console.error("DELETE calculation: Caught error:", {
      error: error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      type: typeof error
    })

    // Provide more specific error messages based on error type
    let errorMessage = "Failed to delete calculation"
    let statusCode = 500

    if (error instanceof Error) {
      if (error.message.includes('connect') || error.message.includes('timeout')) {
        errorMessage = "Database connection error"
        console.log("DELETE calculation: Database connection issue detected")
      } else if (error.message.includes('Record to delete does not exist')) {
        errorMessage = "Calculation not found"
        statusCode = 404
        console.log("DELETE calculation: Record not found during delete")
      } else if (error.message.includes('Foreign key constraint')) {
        errorMessage = "Cannot delete calculation due to dependencies"
        statusCode = 409
        console.log("DELETE calculation: Foreign key constraint issue")
      }
    }

    const errorResponse = {
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : String(error) : undefined
    }

    console.log("DELETE calculation: Returning error response:", errorResponse)
    return NextResponse.json(errorResponse, { status: statusCode })
  }
}