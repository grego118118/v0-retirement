import { query } from "../lib/db/postgres"

async function setupDatabase() {
  console.log("Setting up database schema...")

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

    // Create accounts table for OAuth providers
    await query(`
      CREATE TABLE IF NOT EXISTS accounts (
        id SERIAL PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        provider_id TEXT NOT NULL,
        provider_type TEXT NOT NULL,
        provider_account_id TEXT NOT NULL,
        refresh_token TEXT,
        access_token TEXT,
        expires_at BIGINT,
        token_type TEXT,
        scope TEXT,
        id_token TEXT,
        UNIQUE(provider_id, provider_account_id)
      )
    `)

    // Create sessions table
    await query(`
      CREATE TABLE IF NOT EXISTS sessions (
        id SERIAL PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        session_token TEXT UNIQUE NOT NULL,
        expires TIMESTAMP WITH TIME ZONE NOT NULL
      )
    `)

    // Create verification tokens table
    await query(`
      CREATE TABLE IF NOT EXISTS verification_tokens (
        identifier TEXT NOT NULL,
        token TEXT NOT NULL,
        expires TIMESTAMP WITH TIME ZONE NOT NULL,
        PRIMARY KEY (identifier, token)
      )
    `)

    // Create users_metadata table
    await query(`
      CREATE TABLE IF NOT EXISTS users_metadata (
        id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
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
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
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

    console.log("Database schema setup completed successfully!")
  } catch (error) {
    console.error("Database schema setup failed:", error)
  }
}

// Run the setup function
setupDatabase()
