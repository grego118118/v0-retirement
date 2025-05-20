import { NextResponse } from "next/server"
import bcrypt from "bcrypt"
import { v4 as uuidv4 } from "uuid"
import { query } from "@/lib/db/postgres"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ message: "Email and password are required" }, { status: 400 })
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
