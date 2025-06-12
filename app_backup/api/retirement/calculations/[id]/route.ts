import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth/auth-options"
import { query } from "@/lib/db/postgres"
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const result = await query(
      "SELECT * FROM pension_calculations WHERE id = $1 AND user_id = $2",
      [id, session.user.id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Calculation not found" },
        { status: 404 }
      )
    }

    const calc = result.rows[0]

    // Transform SQLite data to expected format
    let parsedResult = null
    try {
      parsedResult = typeof calc.result === 'string' ? JSON.parse(calc.result) : calc.result
    } catch (error) {
      console.error('Error parsing calculation result:', error)
    }

    const calculation = {
      id: calc.id,
      userId: calc.user_id,
      calculationName: calc.name,
      retirementDate: calc.created_at,
      retirementAge: calc.age || 65,
      yearsOfService: calc.years_of_service || 0,
      averageSalary: (calc.salary1 + calc.salary2 + calc.salary3) / 3 || 0,
      retirementGroup: calc.group_type || "1",
      benefitPercentage: 2.5,
      retirementOption: calc.retirement_option || "A",
      monthlyBenefit: parsedResult?.monthlyBenefit || 0,
      annualBenefit: parsedResult?.annualBenefit || 0,
      benefitReduction: parsedResult?.benefitReduction || null,
      survivorBenefit: parsedResult?.survivorBenefit || null,
      notes: `Calculation from ${new Date(calc.created_at).toLocaleDateString()}`,
      isFavorite: calc.is_favorite || false,
      createdAt: calc.created_at,
      updatedAt: calc.updated_at,
      socialSecurityData: parsedResult?.socialSecurityData || null,
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
    const existingResult = await query(
      "SELECT * FROM pension_calculations WHERE id = $1 AND user_id = $2",
      [id, session.user.id]
    )

    if (existingResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Calculation not found" },
        { status: 404 }
      )
    }

    // Update the calculation (only name and favorite status are typically updated)
    await query(
      "UPDATE pension_calculations SET name = $1, is_favorite = $2, updated_at = datetime('now') WHERE id = $3 AND user_id = $4",
      [
        validatedData.calculationName || existingResult.rows[0].name,
        validatedData.isFavorite !== undefined ? validatedData.isFavorite : existingResult.rows[0].is_favorite,
        id,
        session.user.id
      ]
    )

    // Fetch the updated calculation
    const updatedResult = await query(
      "SELECT * FROM pension_calculations WHERE id = $1 AND user_id = $2",
      [id, session.user.id]
    )

    const calc = updatedResult.rows[0]
    let parsedResult = null
    try {
      parsedResult = typeof calc.result === 'string' ? JSON.parse(calc.result) : calc.result
    } catch (error) {
      console.error('Error parsing calculation result:', error)
    }

    const calculation = {
      id: calc.id,
      userId: calc.user_id,
      calculationName: calc.name,
      retirementDate: calc.created_at,
      retirementAge: calc.age || 65,
      yearsOfService: calc.years_of_service || 0,
      averageSalary: (calc.salary1 + calc.salary2 + calc.salary3) / 3 || 0,
      retirementGroup: calc.group_type || "1",
      benefitPercentage: 2.5,
      retirementOption: calc.retirement_option || "A",
      monthlyBenefit: parsedResult?.monthlyBenefit || 0,
      annualBenefit: parsedResult?.annualBenefit || 0,
      benefitReduction: parsedResult?.benefitReduction || null,
      survivorBenefit: parsedResult?.survivorBenefit || null,
      notes: validatedData.notes || `Calculation from ${new Date(calc.created_at).toLocaleDateString()}`,
      isFavorite: calc.is_favorite || false,
      createdAt: calc.created_at,
      updatedAt: calc.updated_at,
      socialSecurityData: parsedResult?.socialSecurityData || null,
    }

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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    // Check if calculation exists and belongs to user
    const existingResult = await query(
      "SELECT * FROM pension_calculations WHERE id = $1 AND user_id = $2",
      [id, session.user.id]
    )

    if (existingResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Calculation not found" },
        { status: 404 }
      )
    }

    // Delete the calculation
    await query(
      "DELETE FROM pension_calculations WHERE id = $1 AND user_id = $2",
      [id, session.user.id]
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting calculation:", error)
    return NextResponse.json(
      { error: "Failed to delete calculation" },
      { status: 500 }
    )
  }
}

// DELETE - Delete a calculation
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

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

    await prisma.retirementCalculation.delete({
      where: { id: id },
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