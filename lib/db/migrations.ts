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

    // Create action_items table
    await query(`
      CREATE TABLE IF NOT EXISTS action_items (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        category TEXT NOT NULL CHECK (category IN ('profile', 'calculation', 'planning', 'optimization', 'education')),
        priority TEXT NOT NULL CHECK (priority IN ('high', 'medium', 'low')),
        status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'completed', 'dismissed')),
        action_type TEXT NOT NULL CHECK (action_type IN ('navigate', 'calculate', 'review', 'contact', 'learn')),
        action_url TEXT,
        action_data TEXT,
        trigger_condition TEXT,
        target_group TEXT,
        target_age_range TEXT,
        target_service_range TEXT,
        related_calculation_id TEXT,
        display_order INTEGER,
        expires_at TIMESTAMP,
        is_system_generated BOOLEAN NOT NULL DEFAULT FALSE,
        generation_reason TEXT,
        completed_at TIMESTAMP,
        dismissed_at TIMESTAMP,
        dismissal_reason TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create index for better query performance
    await query(`
      CREATE INDEX IF NOT EXISTS idx_action_items_user_id ON action_items(user_id)
    `)

    await query(`
      CREATE INDEX IF NOT EXISTS idx_action_items_status ON action_items(status)
    `)

    await query(`
      CREATE INDEX IF NOT EXISTS idx_action_items_priority ON action_items(priority)
    `)

    console.log("Migrations completed successfully")
  } catch (error) {
    console.error("Migration failed:", error)
    throw error
  }
}
