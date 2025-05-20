import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth/auth-options"
import { query } from "@/lib/db/postgres"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const result = await query("SELECT * FROM users_metadata WHERE id = $1", [session.user.id])

    const userData = result.rows[0] || {}

    return NextResponse.json({
      fullName: userData.full_name || "",
      retirementDate: userData.retirement_date || "",
    })
  } catch (error) {
    console.error("Error fetching profile:", error)
    return NextResponse.json({ message: "Failed to fetch profile" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { full_name, retirement_date } = await request.json()

    // Check if user metadata exists
    const existingResult = await query("SELECT * FROM users_metadata WHERE id = $1", [session.user.id])

    if (existingResult.rows.length > 0) {
      // Update existing record
      await query(
        `UPDATE users_metadata 
         SET full_name = $2, retirement_date = $3, updated_at = NOW() 
         WHERE id = $1`,
        [session.user.id, full_name, retirement_date],
      )
    } else {
      // Create new record
      await query(
        `INSERT INTO users_metadata (id, full_name, retirement_date, created_at, updated_at)
         VALUES ($1, $2, $3, NOW(), NOW())`,
        [session.user.id, full_name, retirement_date],
      )
    }

    return NextResponse.json({
      message: "Profile updated successfully",
      fullName: full_name,
      retirementDate: retirement_date,
    })
  } catch (error) {
    console.error("Error updating profile:", error)
    return NextResponse.json({ message: "Failed to update profile" }, { status: 500 })
  }
}
