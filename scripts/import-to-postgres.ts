import { Pool } from "pg"
import fs from "fs"
import path from "path"
import bcrypt from "bcrypt"

// PostgreSQL connection details
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
})

async function importData() {
  console.log("Starting data import to PostgreSQL...")
  const exportDir = path.join(process.cwd(), "data-export")

  // Check if export directory exists
  if (!fs.existsSync(exportDir)) {
    console.error("Export directory not found. Run export script first.")
    return
  }

  const client = await pool.connect()

  try {
    // Start transaction
    await client.query("BEGIN")

    // Create tables if they don't exist
    await createTables(client)

    // Import users
    console.log("Importing users...")
    const usersData = JSON.parse(fs.readFileSync(path.join(exportDir, "users.json"), "utf8"))

    for (const user of usersData.users) {
      // Generate a secure password hash for each user
      // In a real migration, you might want to set temporary passwords and force resets
      const passwordHash = await bcrypt.hash(user.email + Date.now(), 10)

      await client.query(
        `INSERT INTO users (id, email, password_hash, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (id) DO NOTHING`,
        [user.id, user.email, passwordHash, user.created_at, user.updated_at || new Date().toISOString()],
      )
    }
    console.log(`Imported ${usersData.users.length} users`)

    // Import users_metadata
    console.log("Importing users_metadata...")
    const usersMetadataData = JSON.parse(fs.readFileSync(path.join(exportDir, "users_metadata.json"), "utf8"))

    for (const metadata of usersMetadataData) {
      await client.query(
        `INSERT INTO users_metadata (id, full_name, retirement_date, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (id) DO UPDATE SET
         full_name = EXCLUDED.full_name,
         retirement_date = EXCLUDED.retirement_date,
         updated_at = EXCLUDED.updated_at`,
        [metadata.id, metadata.full_name, metadata.retirement_date, metadata.created_at, metadata.updated_at],
      )
    }
    console.log(`Imported ${usersMetadataData.length} user metadata records`)

    // Import pension_calculations
    console.log("Importing pension_calculations...")
    const pensionCalculationsData = JSON.parse(
      fs.readFileSync(path.join(exportDir, "pension_calculations.json"), "utf8"),
    )

    for (const calculation of pensionCalculationsData) {
      await client.query(
        `INSERT INTO pension_calculations (
          id, user_id, name, service_entry_date, age, years_of_service, 
          group_type, salary1, salary2, salary3, retirement_option, 
          beneficiary_age, result, created_at, updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        updated_at = EXCLUDED.updated_at`,
        [
          calculation.id,
          calculation.user_id,
          calculation.name,
          calculation.service_entry_date,
          calculation.age,
          calculation.years_of_service,
          calculation.group_type,
          calculation.salary1,
          calculation.salary2,
          calculation.salary3,
          calculation.retirement_option,
          calculation.beneficiary_age,
          calculation.result,
          calculation.created_at,
          calculation.updated_at,
        ],
      )
    }
    console.log(`Imported ${pensionCalculationsData.length} pension calculations`)

    // Commit transaction
    await client.query("COMMIT")
    console.log("Data import completed successfully!")
  } catch (error) {
    // Rollback transaction on error
    await client.query("ROLLBACK")
    console.error("Import failed:", error)
  } finally {
    client.release()
    await pool.end()
  }
}

async function createTables(client) {
  console.log("Creating database tables...")

  // Create users table
  await client.query(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT,
      created_at TIMESTAMP WITH TIME ZONE,
      updated_at TIMESTAMP WITH TIME ZONE
    )
  `)

  // Create users_metadata table
  await client.query(`
    CREATE TABLE IF NOT EXISTS users_metadata (
      id UUID PRIMARY KEY REFERENCES users(id),
      full_name TEXT,
      retirement_date TEXT,
      created_at TIMESTAMP WITH TIME ZONE,
      updated_at TIMESTAMP WITH TIME ZONE
    )
  `)

  // Create pension_calculations table
  await client.query(`
    CREATE TABLE IF NOT EXISTS pension_calculations (
      id UUID PRIMARY KEY,
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
      created_at TIMESTAMP WITH TIME ZONE,
      updated_at TIMESTAMP WITH TIME ZONE
    )
  `)

  console.log("Database tables created successfully")
}

// Run the import function
importData()
