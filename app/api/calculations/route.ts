import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth/auth-options"
import { query } from "@/lib/db/postgres"
import { v4 as uuidv4 } from "uuid"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const result = await query(
      `SELECT * FROM pension_calculations 
       WHERE user_id = $1 
       ORDER BY created_at DESC`,
      [session.user.id],
    )

    return NextResponse.json(result.rows)
  } catch (error) {
    console.error("Error fetching calculations:", error)
    return NextResponse.json({ message: "Failed to fetch calculations" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()
    const calculationId = data.id || uuidv4()

    // Convert result to JSONB if it's a string
    const result = typeof data.result === "string" ? JSON.parse(data.result) : data.result

    // Check if calculation exists
    const existingResult = await query("SELECT * FROM pension_calculations WHERE id = $1", [calculationId])

    if (existingResult.rows.length > 0) {
      // Update existing calculation
      await query(
        `UPDATE pension_calculations SET
         name = $3, service_entry_date = $4, age = $5, years_of_service = $6,
         group_type = $7, salary1 = $8, salary2 = $9, salary3 = $10,
         retirement_option = $11, beneficiary_age = $12, result = $13,
         updated_at = NOW()
         WHERE id = $1 AND user_id = $2`,
        [
          calculationId,
          session.user.id,
          data.name,
          data.service_entry_date,
          data.age,
          data.years_of_service,
          data.group_type,
          data.salary1,
          data.salary2,
          data.salary3,
          data.retirement_option,
          data.beneficiary_age,
          result,
        ],
      )
    } else {
      // Create new calculation
      await query(
        `INSERT INTO pension_calculations (
          id, user_id, name, service_entry_date, age, years_of_service,
          group_type, salary1, salary2, salary3, retirement_option,
          beneficiary_age, result, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW())`,
        [
          calculationId,
          session.user.id,
          data.name,
          data.service_entry_date,
          data.age,
          data.years_of_service,
          data.group_type,
          data.salary1,
          data.salary2,
          data.salary3,
          data.retirement_option,
          data.beneficiary_age,
          result,
        ],
      )
    }

    return NextResponse.json({ id: calculationId, success: true })
  } catch (error) {
    console.error("Error saving calculation:", error)
    return NextResponse.json({ message: "Failed to save calculation" }, { status: 500 })
  }
}
