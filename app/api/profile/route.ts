import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth/auth-config"
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

    console.log("Querying profile for user:", session.user.id)

    // Query both User table and RetirementProfile table
    const [user, retirementProfile] = await Promise.all([
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: { name: true, retirementDate: true }
      }),
      prisma.retirementProfile.findUnique({
        where: { userId: session.user.id }
      })
    ])

    console.log("Profile query result:", { user, retirementProfile })

    // Convert Prisma result to expected format
    const responseData = {
      fullName: user?.name || "",
      retirementDate: user?.retirementDate?.toISOString() || "",
      dateOfBirth: retirementProfile?.dateOfBirth?.toISOString() || "",
      membershipDate: retirementProfile?.membershipDate?.toISOString() || "",
      retirementGroup: retirementProfile?.retirementGroup || "1",
      benefitPercentage: retirementProfile?.benefitPercentage || 2.0,
      currentSalary: retirementProfile?.currentSalary || 0,
      averageHighest3Years: retirementProfile?.averageHighest3Years || 0,
      yearsOfService: retirementProfile?.yearsOfService || 0,
      retirementOption: retirementProfile?.retirementOption || "A",
      estimatedSocialSecurityBenefit: retirementProfile?.estimatedSocialSecurityBenefit || 0
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

    // Get request headers for debugging
    const headers = Object.fromEntries(request.headers.entries())
    console.log("Request headers:", {
      cookie: headers.cookie ? "present" : "missing",
      authorization: headers.authorization ? "present" : "missing",
      userAgent: headers["user-agent"]
    })

    const session = await getServerSession(authOptions)

    console.log("Session in profile POST:", {
      hasSession: !!session,
      userId: session?.user?.id,
      userEmail: session?.user?.email,
      sessionKeys: session ? Object.keys(session) : [],
      userKeys: session?.user ? Object.keys(session.user) : []
    })

    if (!session) {
      console.error("No session found in profile POST")
      return NextResponse.json({
        message: "No session found. Please sign in again.",
        error: "NO_SESSION"
      }, { status: 401 })
    }

    if (!session.user) {
      console.error("No user in session")
      return NextResponse.json({
        message: "Invalid session. Please sign in again.",
        error: "NO_USER_IN_SESSION"
      }, { status: 401 })
    }

    if (!session.user.id) {
      console.error("No user ID in session", {
        sessionUser: session.user,
        userKeys: Object.keys(session.user),
        hasId: !!session.user.id,
        idValue: session.user.id
      })
      return NextResponse.json({
        message: "Session missing user ID. Please sign in again.",
        error: "NO_USER_ID",
        debug: {
          hasUser: !!session.user,
          userKeys: Object.keys(session.user),
          userId: session.user.id
        }
      }, { status: 401 })
    }

    const requestBody = await request.json()
    console.log("Profile POST request body:", requestBody)

    // Extract profile data from request body
    const {
      // Basic profile fields
      full_name,
      retirement_date,
      // Detailed retirement profile fields
      dateOfBirth,
      membershipDate,
      retirementGroup,
      benefitPercentage,
      currentSalary,
      averageHighest3Years,
      yearsOfService,
      retirementOption,
      retirementDate,
      estimatedSocialSecurityBenefit
    } = requestBody

    console.log("Validation check:", {
      full_name,
      retirement_date,
      dateOfBirth,
      membershipDate,
      retirementGroup,
      benefitPercentage,
      currentSalary,
      averageHighest3Years,
      yearsOfService,
      retirementOption,
      retirementDate,
      estimatedSocialSecurityBenefit
    })

    // Check if this is a basic profile update (full_name, retirement_date)
    const isBasicProfileUpdate = full_name !== undefined || retirement_date !== undefined
    const isDetailedProfileUpdate = dateOfBirth || membershipDate || retirementGroup || currentSalary
    // Check if this is a Social Security partial update
    const isSocialSecurityUpdate = estimatedSocialSecurityBenefit !== undefined

    console.log("Update type:", {
      isBasicProfileUpdate,
      isDetailedProfileUpdate,
      isSocialSecurityUpdate
    })

    console.log("Social Security check values:", {
      estimatedSocialSecurityBenefit,
      estimatedSocialSecurityBenefitUndefined: estimatedSocialSecurityBenefit === undefined
    })

    console.log("Updating user profile for user:", session.user.id)

    // Prioritize Social Security updates when they only contain SS fields
    if (isSocialSecurityUpdate && !isBasicProfileUpdate && (!isDetailedProfileUpdate || estimatedSocialSecurityBenefit !== undefined)) {
      // Handle Social Security partial update
      console.log("Processing Social Security partial update")

      // Prepare update data for Social Security fields only
      const socialSecurityData: {
        estimatedSocialSecurityBenefit?: number;
      } = {}

      if (estimatedSocialSecurityBenefit !== undefined) {
        socialSecurityData.estimatedSocialSecurityBenefit = estimatedSocialSecurityBenefit
      }

      console.log("Social Security update data:", socialSecurityData)

      // Check if retirement profile exists
      const existingProfile = await prisma.retirementProfile.findUnique({
        where: { userId: session.user.id }
      })

      if (!existingProfile) {
        // If no profile exists, we can't do a partial update for Social Security data
        // Return an error asking user to complete their profile first
        return NextResponse.json({
          message: "Please complete your retirement profile first before saving Social Security data",
          error: "PROFILE_REQUIRED"
        }, { status: 400 })
      }

      // Update existing profile with Social Security data
      const updatedProfile = await prisma.retirementProfile.update({
        where: { userId: session.user.id },
        data: socialSecurityData
      })

      console.log("Social Security data updated successfully:", updatedProfile)

      const responseData = {
        message: "Social Security data updated successfully",
        estimatedSocialSecurityBenefit: updatedProfile.estimatedSocialSecurityBenefit
      }

      console.log("Social Security update successful, returning:", responseData)
      return NextResponse.json(responseData)
    }

    if (isBasicProfileUpdate) {
      // Handle basic profile update (full_name, retirement_date)
      console.log("Processing basic profile update")

      // Prepare update data for User table
      const updateData: { name?: string; retirementDate?: Date | null } = {}

      if (full_name !== undefined) {
        updateData.name = full_name
      }

      if (retirement_date !== undefined) {
        updateData.retirementDate = retirement_date ? new Date(retirement_date) : null
      }

      // Update user data in NextAuth user table (use upsert to handle missing records)
      if (Object.keys(updateData).length > 0) {
        await prisma.user.upsert({
          where: { id: session.user.id },
          update: updateData,
          create: {
            id: session.user.id,
            email: session.user.email || "",
            ...updateData
          }
        })
        console.log("Updated user data:", updateData)
      }

      console.log("Basic profile update completed successfully")

      return NextResponse.json({
        message: "Basic profile updated successfully",
        fullName: full_name || session.user.name,
        retirementDate: retirement_date || ""
      })
    }

    if (isDetailedProfileUpdate) {
      // Handle detailed retirement profile update
      console.log("Processing detailed retirement profile update")

      // Validate required fields for detailed profile
      if (!dateOfBirth || !membershipDate || !retirementGroup || !currentSalary) {
        console.error("Missing required retirement profile fields")
        return NextResponse.json({
          message: "Date of birth, membership date, retirement group, and current salary are required for detailed profile"
        }, { status: 400 })
      }

      // Use Prisma to update the RetirementProfile
      const profileData = {
        dateOfBirth: new Date(dateOfBirth),
        membershipDate: new Date(membershipDate),
        retirementGroup,
        benefitPercentage: benefitPercentage || 2.0,
        currentSalary,
        averageHighest3Years: averageHighest3Years || undefined,
        yearsOfService: yearsOfService || undefined,
        retirementOption: retirementOption || undefined,
        retirementDate: retirementDate ? new Date(retirementDate) : undefined,
        estimatedSocialSecurityBenefit: estimatedSocialSecurityBenefit || undefined
      }

      // Remove undefined values
      const cleanProfileData = Object.fromEntries(
        Object.entries(profileData).filter(([_, value]) => value !== undefined)
      )

      console.log("Clean profile data for Prisma:", cleanProfileData)

      // Use Prisma upsert to create or update the profile
      const updatedProfile = await prisma.retirementProfile.upsert({
        where: {
          userId: session.user.id
        },
        update: cleanProfileData,
        create: {
          userId: session.user.id,
          dateOfBirth: new Date(dateOfBirth),
          membershipDate: new Date(membershipDate),
          retirementGroup,
          benefitPercentage: benefitPercentage || 2.0,
          currentSalary,
          averageHighest3Years: averageHighest3Years || null,
          yearsOfService: yearsOfService || null,
          retirementOption: retirementOption || null,
          retirementDate: retirementDate ? new Date(retirementDate) : null,
          estimatedSocialSecurityBenefit: estimatedSocialSecurityBenefit || null
        }
      })

      console.log("User retirement profile updated successfully:", updatedProfile)

      const responseData = {
        message: "Retirement profile updated successfully",
        dateOfBirth: updatedProfile.dateOfBirth.toISOString(),
        membershipDate: updatedProfile.membershipDate.toISOString(),
        retirementGroup: updatedProfile.retirementGroup,
        benefitPercentage: updatedProfile.benefitPercentage,
        currentSalary: updatedProfile.currentSalary,
        averageHighest3Years: updatedProfile.averageHighest3Years,
        yearsOfService: updatedProfile.yearsOfService,
        retirementOption: updatedProfile.retirementOption,
        retirementDate: updatedProfile.retirementDate?.toISOString(),
        estimatedSocialSecurityBenefit: updatedProfile.estimatedSocialSecurityBenefit
      }

      console.log("Retirement profile update successful, returning:", responseData)
      return NextResponse.json(responseData)
    }



    // If none of the update types match, return error
    return NextResponse.json({
      message: "No valid profile data provided"
    }, { status: 400 })


  } catch (error) {
    console.error("Error updating profile:", error)

    // More detailed error information
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    const errorDetails = {
      message: "Failed to update profile",
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined
    }

    console.error("Profile update error details:", errorDetails)
    return NextResponse.json({
      message: "Failed to update profile",
      error: errorMessage
    }, { status: 500 })
  }
}
