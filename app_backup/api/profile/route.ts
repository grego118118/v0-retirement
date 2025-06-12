import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth/auth-options"
import { query } from "@/lib/db/postgres"

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
    const result = await query("SELECT * FROM users_metadata WHERE id = $1", [session.user.id])

    console.log("Profile query result:", { rowCount: result.rows.length, rows: result.rows })

    const userData = result.rows[0] || {}

    const responseData = {
      fullName: userData.full_name || "",
      retirementDate: userData.retirement_date || "",
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

    const { full_name, retirement_date } = requestBody

    // Validate required fields
    if (!full_name && !retirement_date) {
      console.error("No data provided for profile update")
      return NextResponse.json({
        message: "At least one field (full_name or retirement_date) is required"
      }, { status: 400 })
    }

    console.log("Checking for existing user metadata for user:", session.user.id)
    // Check if user metadata exists
    const existingResult = await query("SELECT * FROM users_metadata WHERE id = $1", [session.user.id])
    console.log("Existing user metadata:", { rowCount: existingResult.rows.length, rows: existingResult.rows })

    if (existingResult.rows.length > 0) {
      console.log("Updating existing user metadata")
      // Update existing record
      await query(
        `UPDATE users_metadata
         SET full_name = $2, retirement_date = $3, updated_at = NOW()
         WHERE id = $1`,
        [session.user.id, full_name, retirement_date],
      )
    } else {
      console.log("Creating new user metadata record")
      // Create new record
      await query(
        `INSERT INTO users_metadata (id, full_name, retirement_date, created_at, updated_at)
         VALUES ($1, $2, $3, NOW(), NOW())`,
        [session.user.id, full_name, retirement_date],
      )
    }

    const responseData = {
      message: "Profile updated successfully",
      fullName: full_name,
      retirementDate: retirement_date,
    }

    console.log("Profile update successful, returning:", responseData)
    return NextResponse.json(responseData)
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
