import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth/auth-options"
import { prisma } from "@/lib/prisma"
import { v4 as uuidv4 } from "uuid"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Use Prisma to fetch calculations - for now return empty array since we don't have the table structure
    // This should be replaced with proper Prisma model when the calculations table is set up
    const calculations: any[] = []

    return NextResponse.json(calculations)
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

    // For now, just return success since we need to set up the proper Prisma model
    // This should be replaced with proper Prisma operations when the calculations table is set up
    console.log("Calculation data received:", data)

    return NextResponse.json({ id: calculationId, success: true })
  } catch (error) {
    console.error("Error saving calculation:", error)
    return NextResponse.json({ message: "Failed to save calculation" }, { status: 500 })
  }
}
