import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

// Schema for validating retirement profile data
const retirementProfileSchema = z.object({
  dateOfBirth: z.string().datetime(),
  membershipDate: z.string().datetime(),
  retirementGroup: z.enum(["1", "2", "3", "4"]),
  benefitPercentage: z.number().min(0).max(5),
  currentSalary: z.number().positive(),
  averageHighest3Years: z.number().positive().optional(),
  yearsOfService: z.number().min(0).optional(),
  plannedRetirementAge: z.number().min(50).max(80).optional(),
  retirementOption: z.enum(["A", "B", "C"]).optional(),
})

// GET - Retrieve user's retirement profile
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const profile = await prisma.retirementProfile.findUnique({
      where: { userId: session.user.id },
    })

    return NextResponse.json({ profile })
  } catch (error) {
    console.error("Error fetching retirement profile:", error)
    return NextResponse.json(
      { error: "Failed to fetch retirement profile" },
      { status: 500 }
    )
  }
}

// POST - Create a new retirement profile
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = retirementProfileSchema.parse(body)

    // Check if profile already exists
    const existingProfile = await prisma.retirementProfile.findUnique({
      where: { userId: session.user.id },
    })

    if (existingProfile) {
      return NextResponse.json(
        { error: "Profile already exists. Use PUT to update." },
        { status: 400 }
      )
    }

    const profile = await prisma.retirementProfile.create({
      data: {
        userId: session.user.id,
        dateOfBirth: new Date(validatedData.dateOfBirth),
        membershipDate: new Date(validatedData.membershipDate),
        retirementGroup: validatedData.retirementGroup,
        benefitPercentage: validatedData.benefitPercentage,
        currentSalary: validatedData.currentSalary,
        averageHighest3Years: validatedData.averageHighest3Years,
        yearsOfService: validatedData.yearsOfService,
        plannedRetirementAge: validatedData.plannedRetirementAge,
        retirementOption: validatedData.retirementOption,
      },
    })

    return NextResponse.json({ profile }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error.errors },
        { status: 400 }
      )
    }
    
    console.error("Error creating retirement profile:", error)
    return NextResponse.json(
      { error: "Failed to create retirement profile" },
      { status: 500 }
    )
  }
}

// PUT - Update existing retirement profile
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = retirementProfileSchema.parse(body)

    const profile = await prisma.retirementProfile.update({
      where: { userId: session.user.id },
      data: {
        dateOfBirth: new Date(validatedData.dateOfBirth),
        membershipDate: new Date(validatedData.membershipDate),
        retirementGroup: validatedData.retirementGroup,
        benefitPercentage: validatedData.benefitPercentage,
        currentSalary: validatedData.currentSalary,
        averageHighest3Years: validatedData.averageHighest3Years,
        yearsOfService: validatedData.yearsOfService,
        plannedRetirementAge: validatedData.plannedRetirementAge,
        retirementOption: validatedData.retirementOption,
      },
    })

    return NextResponse.json({ profile })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error.errors },
        { status: 400 }
      )
    }
    
    console.error("Error updating retirement profile:", error)
    return NextResponse.json(
      { error: "Failed to update retirement profile" },
      { status: 500 }
    )
  }
} 