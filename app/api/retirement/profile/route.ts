import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth/auth-config"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

// Extended session type to include user.id
interface ExtendedSession {
  user?: {
    id?: string
    name?: string
    email?: string
    image?: string
  }
}

// Helper function to validate and parse dates
const validateDate = (date: string | undefined): boolean => {
  if (!date || date === "") return true // Allow empty strings
  const parsedDate = new Date(date)
  return !isNaN(parsedDate.getTime()) && parsedDate.getFullYear() > 1900 && parsedDate.getFullYear() < 2100
}

// Helper function to normalize retirement group
const normalizeRetirementGroup = (group: string): string => {
  if (!group) return "1"
  // Handle "Group 1", "GROUP_1", "1" formats
  const normalized = group.replace(/[^0-9]/g, "")
  return ["1", "2", "3", "4"].includes(normalized) ? normalized : "1"
}

// Schema for validating retirement profile data (complete profile)
const retirementProfileSchema = z.object({
  dateOfBirth: z.string().refine(validateDate, "Invalid date format"),
  membershipDate: z.string().refine(validateDate, "Invalid date format"),
  retirementGroup: z.string().transform(normalizeRetirementGroup),
  benefitPercentage: z.number().min(0).max(5),
  currentSalary: z.number().min(0),
  averageHighest3Years: z.number().min(0).optional(),
  yearsOfService: z.number().min(0).optional(),
  retirementOption: z.enum(["A", "B", "C"]).optional(),
  retirementDate: z.string().optional().refine(validateDate, "Invalid retirement date format"),
  estimatedSocialSecurityBenefit: z.number().min(0).optional(),
})

// Schema for partial updates (auto-save)
const partialRetirementProfileSchema = z.object({
  dateOfBirth: z.string().optional().refine(validateDate, "Invalid date format"),
  membershipDate: z.string().optional().refine(validateDate, "Invalid date format"),
  retirementGroup: z.string().optional().transform((group) => group ? normalizeRetirementGroup(group) : undefined),
  benefitPercentage: z.number().min(0).max(5).optional(),
  currentSalary: z.number().min(0).optional(),
  averageHighest3Years: z.number().min(0).optional(),
  yearsOfService: z.number().min(0).optional(),
  retirementOption: z.enum(["A", "B", "C"]).optional(),
  retirementDate: z.string().optional().refine(validateDate, "Invalid retirement date format"),
  estimatedSocialSecurityBenefit: z.number().min(0).optional(),
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
  console.log("POST /api/retirement/profile - Starting profile save request")

  // Declare session outside try block to make it accessible in catch block
  let session: ExtendedSession | null = null

  try {
    session = await getServerSession(authOptions)
    console.log("Session check:", {
      hasSession: !!session,
      hasUser: !!session?.user,
      userId: session?.user?.id,
      userEmail: session?.user?.email
    })

    if (!session?.user?.id) {
      console.error("Unauthorized: No session or user ID")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    console.log("Received retirement profile data:", {
      ...body,
      // Don't log sensitive data in production
      dataKeys: Object.keys(body),
      hasDateOfBirth: !!body.dateOfBirth,
      hasMembershipDate: !!body.membershipDate,
      retirementGroup: body.retirementGroup
    })

    // Try partial validation first (for auto-save)
    const partialValidation = partialRetirementProfileSchema.safeParse(body)

    if (!partialValidation.success) {
      console.error("Validation error:", {
        errors: partialValidation.error.errors,
        receivedData: body
      })
      return NextResponse.json(
        {
          error: "Invalid data",
          details: partialValidation.error.errors,
          message: "Please check your input data and try again"
        },
        { status: 400 }
      )
    }

    const validatedData = partialValidation.data
    console.log("Validated data:", validatedData)

    // Check if profile already exists
    const existingProfile = await prisma.retirementProfile.findUnique({
      where: { userId: session.user.id },
    })
    console.log("Existing profile found:", !!existingProfile)

    // Safe date parsing function
    const parseDate = (dateString: string | undefined): Date | undefined => {
      if (!dateString || dateString === "") return undefined
      try {
        const date = new Date(dateString)
        if (isNaN(date.getTime())) {
          console.warn("Invalid date string:", dateString)
          return undefined
        }
        return date
      } catch (error) {
        console.error("Error parsing date:", dateString, error)
        return undefined
      }
    }

    // Prepare data for database (only include non-undefined, non-empty values)
    const updateData: any = {}

    const dateOfBirth = parseDate(validatedData.dateOfBirth)
    if (dateOfBirth) {
      updateData.dateOfBirth = dateOfBirth
    }

    const membershipDate = parseDate(validatedData.membershipDate)
    if (membershipDate) {
      updateData.membershipDate = membershipDate
    }

    const retirementDate = parseDate(validatedData.retirementDate)
    if (retirementDate) {
      updateData.retirementDate = retirementDate
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
    if (validatedData.estimatedSocialSecurityBenefit !== undefined) {
      updateData.estimatedSocialSecurityBenefit = validatedData.estimatedSocialSecurityBenefit
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
    try {
      if (existingProfile) {
        // Update existing profile
        console.log("Updating existing profile with data:", updateData)
        profile = await prisma.retirementProfile.update({
          where: { userId: session.user.id },
          data: updateData,
        })
        console.log("Updated existing profile successfully:", profile.id)
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

        console.log("Creating new profile with data:", createData)
        profile = await prisma.retirementProfile.create({
          data: createData,
        })
        console.log("Created new profile successfully:", profile.id)
      }
    } catch (dbError) {
      console.error("Database operation failed:", {
        error: dbError,
        message: dbError instanceof Error ? dbError.message : "Unknown database error",
        updateData: updateData,
        userId: session.user.id,
        operation: existingProfile ? "update" : "create"
      })

      // Handle specific database errors
      if (dbError instanceof Error) {
        if (dbError.message.includes('Unique constraint')) {
          return NextResponse.json(
            { error: "Profile already exists for this user", message: "A profile already exists for your account." },
            { status: 409 }
          )
        } else if (dbError.message.includes('Foreign key constraint')) {
          return NextResponse.json(
            { error: "Invalid user reference", message: "User account not found. Please sign in again." },
            { status: 400 }
          )
        } else if (dbError.message.includes('Data too long')) {
          return NextResponse.json(
            { error: "Data validation error", message: "Some of your data is too long. Please check your inputs." },
            { status: 400 }
          )
        }
      }

      // Re-throw for general error handling
      throw new Error(`Database operation failed: ${dbError instanceof Error ? dbError.message : "Unknown error"}`)
    }

    return NextResponse.json({
      message: "Profile updated successfully",
      profile
    }, { status: existingProfile ? 200 : 201 })
  } catch (error) {
    console.error("Error in POST /api/retirement/profile:", {
      error: error,
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      userId: session?.user?.id
    })

    // Handle specific error types
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: error.errors,
          message: "Please check your input data and try again."
        },
        { status: 400 }
      )
    }

    // Handle custom error messages from database operations
    if (error instanceof Error && error.message.startsWith('Database operation failed:')) {
      return NextResponse.json(
        {
          error: "Database error",
          message: "Failed to save your profile. Please try again in a moment."
        },
        { status: 500 }
      )
    }

    // Generic error response
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "An unexpected error occurred. Please try again."
      },
      { status: 500 }
    )
  }
}

// PUT - Update existing retirement profile (complete update)
export async function PUT(request: NextRequest) {
  console.log("PUT /api/retirement/profile - Starting complete profile update")

  // Declare session outside try block to make it accessible in catch block
  let session: ExtendedSession | null = null

  try {
    session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      console.error("Unauthorized: No session or user ID")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    console.log("Received complete profile data for PUT:", Object.keys(body))

    const validatedData = retirementProfileSchema.parse(body)

    // Safe date parsing function
    const parseDate = (dateString: string): Date => {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) {
        throw new Error(`Invalid date: ${dateString}`)
      }
      return date
    }

    const updateData = {
      dateOfBirth: parseDate(validatedData.dateOfBirth),
      membershipDate: parseDate(validatedData.membershipDate),
      retirementGroup: validatedData.retirementGroup,
      benefitPercentage: validatedData.benefitPercentage,
      currentSalary: validatedData.currentSalary,
      averageHighest3Years: validatedData.averageHighest3Years,
      yearsOfService: validatedData.yearsOfService,
      retirementOption: validatedData.retirementOption,
      retirementDate: validatedData.retirementDate ? parseDate(validatedData.retirementDate) : undefined,
      estimatedSocialSecurityBenefit: validatedData.estimatedSocialSecurityBenefit,
    }

    const profile = await prisma.retirementProfile.update({
      where: { userId: session.user.id },
      data: updateData,
    })

    console.log("Complete profile update successful:", profile.id)
    return NextResponse.json({
      message: "Profile updated successfully",
      profile
    })
  } catch (error) {
    console.error("Error in PUT /api/retirement/profile:", {
      error: error,
      message: error instanceof Error ? error.message : "Unknown error",
      userId: session?.user?.id
    })

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: error.errors,
          message: "Please check your input data and try again."
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Failed to update profile. Please try again."
      },
      { status: 500 }
    )
  }
}