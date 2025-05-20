import { query } from "./postgres"

export async function runMigrations() {
  console.log("Running database migrations...")

  try {
    // Create users table
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `)

    // Create users_metadata table
    await query(`
      CREATE TABLE IF NOT EXISTS users_metadata (
        id UUID PRIMARY KEY REFERENCES users(id),
        full_name TEXT,
        retirement_date TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `)

    // Create pension_calculations table
    await query(`
      CREATE TABLE IF NOT EXISTS pension_calculations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id),
        name TEXT NOT NULL,
        service_entry_date TEXT NOT NULL,
        age TEXT NOT NULL,
        years_of_service TEXT NOT NULL,
        group_type TEXT NOT NULL,
        salary1 TEXT NOT NULL,
        salary2 TEXT NOT NULL,
        salary3 TEXT NOT NULL,
        retirement_option TEXT NOT NULL,
        beneficiary_age TEXT,
        result JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `)

    console.log("Migrations completed successfully")
  } catch (error) {
    console.error("Migration failed:", error)
    throw error
  }
}
