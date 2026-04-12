import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth/auth-options"
import { query } from "@/lib/db/postgres"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const result = await query(
      `SELECT * FROM pension_calculations
       WHERE id = $1 AND user_id = $2`,
      [id, session.user.id],
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ message: "Calculation not found" }, { status: 404 })
    }

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error("Error fetching calculation:", error)
    return NextResponse.json({ message: "Failed to fetch calculation" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const result = await query("DELETE FROM pension_calculations WHERE id = $1 AND user_id = $2 RETURNING id", [
      id,
      session.user.id,
    ])

    if (result.rows.length === 0) {
      return NextResponse.json({ message: "Calculation not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting calculation:", error)
    return NextResponse.json({ message: "Failed to delete calculation" }, { status: 500 })
  }
}
