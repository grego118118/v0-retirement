import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

// Schema for updating calculation data
const updateCalculationSchema = z.object({
  calculationName: z.string().optional(),
  notes: z.string().optional(),
  isFavorite: z.boolean().optional(),
})

// GET - Retrieve a specific calculation
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const calculation = await prisma.retirementCalculation.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!calculation) {
      return NextResponse.json(
        { error: "Calculation not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ calculation })
  } catch (error) {
    console.error("Error fetching calculation:", error)
    return NextResponse.json(
      { error: "Failed to fetch calculation" },
      { status: 500 }
    )
  }
}

// PUT - Update a calculation (only name, notes, and favorite status)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = updateCalculationSchema.parse(body)

    // Check if calculation exists and belongs to user
    const existingCalculation = await prisma.retirementCalculation.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!existingCalculation) {
      return NextResponse.json(
        { error: "Calculation not found" },
        { status: 404 }
      )
    }

    const calculation = await prisma.retirementCalculation.update({
      where: { id: params.id },
      data: validatedData,
    })

    return NextResponse.json({ calculation })
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
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if calculation exists and belongs to user
    const existingCalculation = await prisma.retirementCalculation.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!existingCalculation) {
      return NextResponse.json(
        { error: "Calculation not found" },
        { status: 404 }
      )
    }

    await prisma.retirementCalculation.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting calculation:", error)
    return NextResponse.json(
      { error: "Failed to delete calculation" },
      { status: 500 }
    )
  }
} 