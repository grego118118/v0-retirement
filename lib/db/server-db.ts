import { query } from "./postgres"
import { v4 as uuidv4 } from "uuid"
import bcrypt from "bcrypt"

// User management
export async function createUser(email: string, password: string) {
  const userId = uuidv4()
  const passwordHash = await bcrypt.hash(password, 10)

  await query("INSERT INTO users (id, email, password_hash) VALUES ($1, $2, $3)", [userId, email, passwordHash])

  return { id: userId, email }
}

export async function getUserByEmail(email: string) {
  const result = await query("SELECT * FROM users WHERE email = $1", [email])

  return result.rows[0] || null
}

export async function verifyPassword(user: any, password: string) {
  return bcrypt.compare(password, user.password_hash)
}

// User metadata
export async function getUserMetadata(userId: string) {
  const result = await query("SELECT * FROM users_metadata WHERE id = $1", [userId])

  return result.rows[0] || null
}

export async function updateUserMetadata(userId: string, data: { full_name?: string; retirement_date?: string }) {
  const { full_name, retirement_date } = data

  // Check if record exists
  const existing = await getUserMetadata(userId)

  if (existing) {
    await query("UPDATE users_metadata SET full_name = $2, retirement_date = $3, updated_at = NOW() WHERE id = $1", [
      userId,
      full_name,
      retirement_date,
    ])
  } else {
    await query("INSERT INTO users_metadata (id, full_name, retirement_date) VALUES ($1, $2, $3)", [
      userId,
      full_name,
      retirement_date,
    ])
  }

  return await getUserMetadata(userId)
}

// Pension calculations
export async function savePensionCalculation(data: any) {
  const {
    user_id,
    name,
    service_entry_date,
    age,
    years_of_service,
    group_type,
    salary1,
    salary2,
    salary3,
    retirement_option,
    beneficiary_age,
    result,
  } = data

  const result_json = typeof result === "string" ? result : JSON.stringify(result)

  const queryResult = await query(
    `INSERT INTO pension_calculations (
      user_id, name, service_entry_date, age, years_of_service, group_type,
      salary1, salary2, salary3, retirement_option, beneficiary_age, result
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    RETURNING id`,
    [
      user_id,
      name,
      service_entry_date,
      age,
      years_of_service,
      group_type,
      salary1,
      salary2,
      salary3,
      retirement_option,
      beneficiary_age,
      result_json,
    ],
  )

  return queryResult.rows[0].id
}

export async function getPensionCalculations(userId: string) {
  const result = await query(
    `SELECT * FROM pension_calculations 
     WHERE user_id = $1 
     ORDER BY created_at DESC`,
    [userId],
  )

  return result.rows
}

export async function getPensionCalculationById(id: string, userId: string) {
  const result = await query(
    `SELECT * FROM pension_calculations 
     WHERE id = $1 AND user_id = $2`,
    [id, userId],
  )

  return result.rows[0] || null
}

export async function deletePensionCalculation(id: string, userId: string) {
  await query("DELETE FROM pension_calculations WHERE id = $1 AND user_id = $2", [id, userId])

  return { success: true }
}
