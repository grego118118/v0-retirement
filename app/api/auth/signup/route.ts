import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs" // Changed from bcrypt to bcryptjs
import { v4 as uuidv4 } from "uuid"
import { query } from "@/lib/db/postgres"
import { rateLimit } from "@/lib/utils/rate-limit"

// Rate limiting: 5 signup attempts per hour per IP to slow down account-creation abuse
const signupRateLimit = rateLimit({
  interval: 60 * 60 * 1000,
  uniqueTokenPerInterval: 1000,
})

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
    try {
      await signupRateLimit.check(5, ip)
    } catch {
      return NextResponse.json({ message: "Too many signup attempts. Please try again later." }, { status: 429 })
    }

    const { email, password } = await request.json()

    if (!email || !password || typeof email !== "string" || typeof password !== "string") {
      return NextResponse.json({ message: "Email and password are required" }, { status: 400 })
    }

    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json({ message: "Please provide a valid email address" }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ message: "Password must be at least 8 characters" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await query("SELECT * FROM users WHERE email = $1", [email])

    if (existingUser.rows.length > 0) {
      return NextResponse.json({ message: "User with this email already exists" }, { status: 409 })
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10)
    const userId = uuidv4()

    // Create user
    await query(
      `INSERT INTO users (id, email, password_hash, created_at, updated_at)
       VALUES ($1, $2, $3, NOW(), NOW())`,
      [userId, email, passwordHash],
    )

    // Create empty user metadata
    await query(
      `INSERT INTO users_metadata (id, created_at, updated_at)
       VALUES ($1, NOW(), NOW())`,
      [userId],
    )

    return NextResponse.json({ message: "User created successfully" }, { status: 201 })
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json({ message: "Failed to create user" }, { status: 500 })
  }
}
