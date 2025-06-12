import Database from "better-sqlite3"
import path from "path"

async function setupSQLiteDatabase() {
  console.log("Setting up SQLite database schema...")

  try {
    const dbPath = path.join(process.cwd(), "dev.db")
    const db = new Database(dbPath)

    // Enable foreign keys
    db.pragma("foreign_keys = ON")

    console.log(`SQLite database initialized at: ${dbPath}`)

    // Create users table
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT,
        created_at DATETIME DEFAULT (datetime('now')),
        updated_at DATETIME DEFAULT (datetime('now'))
      )
    `)

    // Create accounts table for OAuth providers
    db.exec(`
      CREATE TABLE IF NOT EXISTS accounts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        provider_id TEXT NOT NULL,
        provider_type TEXT NOT NULL,
        provider_account_id TEXT NOT NULL,
        refresh_token TEXT,
        access_token TEXT,
        expires_at INTEGER,
        token_type TEXT,
        scope TEXT,
        id_token TEXT,
        UNIQUE(provider_id, provider_account_id)
      )
    `)

    // Create sessions table
    db.exec(`
      CREATE TABLE IF NOT EXISTS sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        session_token TEXT UNIQUE NOT NULL,
        expires DATETIME NOT NULL
      )
    `)

    // Create verification tokens table
    db.exec(`
      CREATE TABLE IF NOT EXISTS verification_tokens (
        identifier TEXT NOT NULL,
        token TEXT NOT NULL,
        expires DATETIME NOT NULL,
        PRIMARY KEY (identifier, token)
      )
    `)

    // Create users_metadata table
    db.exec(`
      CREATE TABLE IF NOT EXISTS users_metadata (
        id TEXT PRIMARY KEY,
        full_name TEXT,
        retirement_date TEXT,
        created_at DATETIME DEFAULT (datetime('now')),
        updated_at DATETIME DEFAULT (datetime('now'))
      )
    `)

    // Create pension_calculations table
    db.exec(`
      CREATE TABLE IF NOT EXISTS pension_calculations (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
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
        result TEXT NOT NULL,
        is_favorite BOOLEAN DEFAULT FALSE,
        created_at DATETIME DEFAULT (datetime('now')),
        updated_at DATETIME DEFAULT (datetime('now'))
      )
    `)

    console.log("SQLite database schema setup completed successfully!")

    // Test the setup by creating a sample user
    console.log("Testing database with sample operations...")

    // Check if any users exist
    const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get() as { count: number }
    console.log(`Current user count: ${userCount.count}`)

    // Test metadata table
    const metadataCount = db.prepare("SELECT COUNT(*) as count FROM users_metadata").get() as { count: number }
    console.log(`Current metadata count: ${metadataCount.count}`)

    console.log("✅ SQLite database is ready for use!")

    db.close()

  } catch (error) {
    console.error("SQLite database schema setup failed:", error)

    if (error instanceof Error) {
      console.error("Error details:", {
        message: error.message,
        stack: error.stack
      })
    }
  }
}

// Run the setup function
setupSQLiteDatabase()
