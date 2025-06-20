import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth/auth-options"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

// Schema for validating retirement profile data (complete profile)
const retirementProfileSchema = z.object({
  dateOfBirth: z.string().datetime(),
  membershipDate: z.string().datetime(),
  retirementGroup: z.enum(["1", "2", "3", "4"]),
  benefitPercentage: z.number().min(0).max(5),
  currentSalary: z.number().positive(),
  averageHighest3Years: z.number().positive().optional(),
  yearsOfService: z.number().min(0).optional(),
  retirementOption: z.enum(["A", "B", "C"]).optional(),
})

// Schema for partial updates (auto-save)
const partialRetirementProfileSchema = z.object({
  dateOfBirth: z.string().optional().refine((date) => {
    if (!date || date === "") return true // Allow empty strings
    const parsedDate = new Date(date)
    return !isNaN(parsedDate.getTime()) // Must be valid date if provided
  }, "Invalid date format"),
  membershipDate: z.string().optional().refine((date) => {
    if (!date || date === "") return true // Allow empty strings
    const parsedDate = new Date(date)
    return !isNaN(parsedDate.getTime()) // Must be valid date if provided
  }, "Invalid date format"),
  retirementGroup: z.enum(["1", "2", "3", "4"]).optional(),
  benefitPercentage: z.number().min(0).max(5).optional(),
  currentSalary: z.number().min(0).optional(), // Allow 0 for auto-save
  averageHighest3Years: z.number().min(0).optional(), // Allow 0 for auto-save
  yearsOfService: z.number().min(0).optional(),
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

// POST - Create or update retirement profile (supports partial updates for auto-save)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    console.log("Received retirement profile data:", body)

    // Try partial validation first (for auto-save)
    const partialValidation = partialRetirementProfileSchema.safeParse(body)

    if (!partialValidation.success) {
      console.error("Validation error:", partialValidation.error)
      return NextResponse.json(
        { error: "Invalid data", details: partialValidation.error.errors },
        { status: 400 }
      )
    }

    const validatedData = partialValidation.data

    // Check if profile already exists
    const existingProfile = await prisma.retirementProfile.findUnique({
      where: { userId: session.user.id },
    })

    // Prepare data for database (only include non-undefined, non-empty values)
    const updateData: any = {}

    if (validatedData.dateOfBirth && validatedData.dateOfBirth !== "") {
      updateData.dateOfBirth = new Date(validatedData.dateOfBirth)
    }
    if (validatedData.membershipDate && validatedData.membershipDate !== "") {
      updateData.membershipDate = new Date(validatedData.membershipDate)
    }
    if (validatedData.retirementGroup) {
      updateData.retirementGroup = validatedData.retirementGroup
    }
    if (validatedData.benefitPercentage !== undefined) {
      updateData.benefitPercentage = validatedData.benefitPercentage
    }
    if (validatedData.currentSalary !== undefined) {
      updateData.currentSalary = validatedData.currentSalary
    }
    if (validatedData.averageHighest3Years !== undefined) {
      updateData.averageHighest3Years = validatedData.averageHighest3Years
    }
    if (validatedData.yearsOfService !== undefined) {
      updateData.yearsOfService = validatedData.yearsOfService
    }
    if (validatedData.retirementOption) {
      updateData.retirementOption = validatedData.retirementOption
    }

    console.log("Prepared update data:", updateData)

    // Only proceed if there's actual data to update
    if (Object.keys(updateData).length === 0) {
      console.log("No data to update, returning existing profile or defaults")

      if (existingProfile) {
        return NextResponse.json({
          message: "No changes to save",
          profile: existingProfile
        })
      } else {
        return NextResponse.json({
          message: "No data provided for new profile",
          profile: null
        })
      }
    }

    let profile
    if (existingProfile) {
      // Update existing profile
      profile = await prisma.retirementProfile.update({
        where: { userId: session.user.id },
        data: updateData,
      })
      console.log("Updated existing profile")
    } else {
      // Create new profile with default values for required fields
      const createData = {
        userId: session.user.id,
        dateOfBirth: updateData.dateOfBirth || new Date('1970-01-01'),
        membershipDate: updateData.membershipDate || new Date('2000-01-01'),
        retirementGroup: updateData.retirementGroup || '1',
        benefitPercentage: updateData.benefitPercentage || 2.0,
        currentSalary: updateData.currentSalary || 0,
        ...updateData
      }

      profile = await prisma.retirementProfile.create({
        data: createData,
      })
      console.log("Created new profile with defaults")
    }

    return NextResponse.json({
      message: "Profile updated successfully",
      profile
    }, { status: existingProfile ? 200 : 201 })
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