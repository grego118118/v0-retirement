import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    console.log("Profile GET request started")
    const session = await getServerSession(authOptions)

    console.log("Session in profile GET:", {
      hasSession: !!session,
      userId: session?.user?.id,
      userEmail: session?.user?.email
    })

    if (!session?.user?.id) {
      console.error("No session or user ID in profile GET")
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Ensure user exists in database
    let user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user) {
      console.log("User not found in GET, creating user record...")
      try {
        user = await prisma.user.create({
          data: {
            id: session.user.id,
            email: session.user.email || "",
            name: session.user.name || "",
            image: session.user.image || null
          }
        })
        console.log("User created in GET:", user)
      } catch (userCreateError) {
        console.error("Failed to create user in GET:", userCreateError)
        return NextResponse.json({
          message: "Failed to create user record",
          error: userCreateError instanceof Error ? userCreateError.message : "Unknown error"
        }, { status: 500 })
      }
    }

    // Query the database for user profile
    const userProfile = await prisma.retirementProfile.findUnique({
      where: {
        userId: session.user.id
      }
    })

    // Calculate years of service if membership date exists (only if not manually set)
    let yearsOfService = userProfile?.yearsOfService
    if (!yearsOfService && userProfile?.membershipDate) {
      const membershipDate = new Date(userProfile.membershipDate)
      const currentDate = new Date()
      const diffTime = Math.abs(currentDate.getTime() - membershipDate.getTime())
      yearsOfService = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 365.25))
    }

    // Calculate planned retirement age if date of birth exists
    let plannedRetirementAge = userProfile?.plannedRetirementAge
    if (!plannedRetirementAge && userProfile?.dateOfBirth) {
      const birthDate = new Date(userProfile.dateOfBirth)
      const currentDate = new Date()
      const currentAge = Math.floor((currentDate.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25))
      plannedRetirementAge = Math.max(55, currentAge + 5) // Default to current age + 5 years, minimum 55
    }

    const responseData = {
      fullName: session.user.name || "",
      retirementDate: userProfile?.plannedRetirementAge ?
        new Date(new Date().getFullYear() + (plannedRetirementAge || 65) - (userProfile?.dateOfBirth ?
          Math.floor((new Date().getTime() - new Date(userProfile.dateOfBirth).getTime()) / (1000 * 60 * 60 * 24 * 365.25)) : 50), 0, 1).toISOString().split('T')[0] : "",
      dateOfBirth: userProfile?.dateOfBirth ? userProfile.dateOfBirth.toISOString().split('T')[0] : "",
      membershipDate: userProfile?.membershipDate ? userProfile.membershipDate.toISOString().split('T')[0] : "",
      retirementGroup: userProfile?.retirementGroup || "Group 1",
      benefitPercentage: userProfile?.benefitPercentage || 2.0,
      currentSalary: userProfile?.currentSalary || 0,
      averageHighest3Years: userProfile?.averageHighest3Years || 0,
      yearsOfService: yearsOfService || userProfile?.yearsOfService || 0,
      plannedRetirementAge: plannedRetirementAge || 65,
      retirementOption: userProfile?.retirementOption || "A",
      hasProfile: !!userProfile
    }

    console.log("Returning profile data:", responseData)
    return NextResponse.json(responseData)
  } catch (error) {
    console.error("Error fetching profile:", error)
    return NextResponse.json({
      message: "Failed to fetch profile",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    console.log("Profile POST request started")
    const session = await getServerSession(authOptions)

    console.log("Session in profile POST:", {
      hasSession: !!session,
      userId: session?.user?.id,
      userEmail: session?.user?.email
    })

    if (!session?.user?.id) {
      console.error("No session or user ID in profile POST")
      return NextResponse.json({
        message: "Unauthorized",
        error: "NO_SESSION"
      }, { status: 401 })
    }

    const requestBody = await request.json()
    console.log("Profile POST request body:", requestBody)

    // Validate and prepare data for database
    const profileData: any = {}

    // Handle both camelCase and snake_case field names for compatibility
    if (requestBody.dateOfBirth || requestBody.date_of_birth) {
      profileData.dateOfBirth = new Date(requestBody.dateOfBirth || requestBody.date_of_birth)
    }
    if (requestBody.membershipDate || requestBody.membership_date) {
      profileData.membershipDate = new Date(requestBody.membershipDate || requestBody.membership_date)
    }
    if (requestBody.retirementGroup || requestBody.retirement_group) {
      profileData.retirementGroup = requestBody.retirementGroup || requestBody.retirement_group
    }
    if (requestBody.benefitPercentage !== undefined || requestBody.benefit_percentage !== undefined) {
      profileData.benefitPercentage = parseFloat(requestBody.benefitPercentage || requestBody.benefit_percentage)
    }
    if (requestBody.currentSalary !== undefined || requestBody.current_salary !== undefined) {
      profileData.currentSalary = parseFloat(requestBody.currentSalary || requestBody.current_salary)
    }
    if (requestBody.averageHighest3Years !== undefined || requestBody.average_highest_3_years !== undefined) {
      profileData.averageHighest3Years = parseFloat(requestBody.averageHighest3Years || requestBody.average_highest_3_years)
    }
    if (requestBody.yearsOfService !== undefined || requestBody.years_of_service !== undefined) {
      profileData.yearsOfService = parseFloat(requestBody.yearsOfService || requestBody.years_of_service)
    }
    if (requestBody.plannedRetirementAge !== undefined || requestBody.planned_retirement_age !== undefined) {
      profileData.plannedRetirementAge = parseInt(requestBody.plannedRetirementAge || requestBody.planned_retirement_age)
    }
    if (requestBody.retirementOption || requestBody.retirement_option) {
      profileData.retirementOption = requestBody.retirementOption || requestBody.retirement_option
    }

    // Handle legacy fields from profile form
    if (requestBody.full_name && session.user.name !== requestBody.full_name) {
      // Update user name in the User table if it's different
      await prisma.user.update({
        where: { id: session.user.id },
        data: { name: requestBody.full_name }
      })
    }

    // Handle retirement_date field - convert to plannedRetirementAge if dateOfBirth exists
    if (requestBody.retirement_date && (profileData.dateOfBirth || requestBody.dateOfBirth)) {
      const retirementDate = new Date(requestBody.retirement_date)
      const birthDate = profileData.dateOfBirth || new Date(requestBody.dateOfBirth)
      const retirementAge = retirementDate.getFullYear() - birthDate.getFullYear()
      if (retirementAge > 0 && retirementAge < 100) {
        profileData.plannedRetirementAge = retirementAge
      }
    }

    console.log("About to upsert profile with data:", JSON.stringify(profileData, null, 2))
    console.log("User ID:", session.user.id)

    // CRITICAL FIX: Ensure user exists before creating profile
    console.log("🔍 Checking if user exists in database...")
    let user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user) {
      console.log("❌ User not found, creating user record...")
      try {
        user = await prisma.user.create({
          data: {
            id: session.user.id,
            email: session.user.email || "",
            name: session.user.name || "",
            image: session.user.image || null
          }
        })
        console.log("✅ User created successfully:", user)
      } catch (userCreateError) {
        console.error("❌ Failed to create user:", userCreateError)
        throw new Error(`Failed to create user record: ${userCreateError instanceof Error ? userCreateError.message : 'Unknown error'}`)
      }
    } else {
      console.log("✅ User exists:", { id: user.id, email: user.email, name: user.name })
    }

    // Upsert the profile (create if doesn't exist, update if it does)
    let updatedProfile
    try {
      updatedProfile = await prisma.retirementProfile.upsert({
        where: {
          userId: session.user.id
        },
        update: profileData,
        create: {
          userId: session.user.id,
          dateOfBirth: profileData.dateOfBirth || new Date('1970-01-01'),
          membershipDate: profileData.membershipDate || new Date(),
          retirementGroup: profileData.retirementGroup || 'Group 1',
          benefitPercentage: profileData.benefitPercentage || 2.0,
          currentSalary: profileData.currentSalary || 0,
          ...profileData
        }
      })
      console.log("✅ Profile upsert successful:", JSON.stringify(updatedProfile, null, 2))
    } catch (upsertError) {
      console.error("❌ Profile upsert failed:", {
        error: upsertError,
        errorType: typeof upsertError,
        errorConstructor: upsertError?.constructor?.name,
        message: upsertError instanceof Error ? upsertError.message : String(upsertError),
        stack: upsertError instanceof Error ? upsertError.stack : undefined,
        profileData: JSON.stringify(profileData),
        userId: session.user.id,
        userExists: !!user
      })
      throw upsertError
    }

    const responseData = {
      message: "Profile updated successfully",
      profile: updatedProfile
    }

    console.log("Profile update successful, returning:", responseData)
    return NextResponse.json(responseData)
  } catch (error) {
    console.error("Error updating profile:", error)
    return NextResponse.json({
      message: "Failed to update profile",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
