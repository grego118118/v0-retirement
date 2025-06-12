import { Pool } from "pg"
import Database from "better-sqlite3"
import * as path from "path"

// Database configuration
const DB_TYPE = process.env.POSTGRES_URL ? "postgresql" : "sqlite"
console.log(`Database type: ${DB_TYPE}`)

// PostgreSQL pool instance
let pool: Pool | null = null

// SQLite database instance
let sqliteDb: Database.Database | null = null

export function getPool() {
  if (!pool && DB_TYPE === "postgresql") {
    // For serverless environments, we want to limit the pool size
    pool = new Pool({
      connectionString: process.env.POSTGRES_URL,
      ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
      max: 1, // Limit connections for serverless environment
      idleTimeoutMillis: 120000, // 2 minutes
      connectionTimeoutMillis: 10000, // 10 seconds
    })

    // Log pool errors but don't crash the app
    pool.on("error", (err) => {
      console.error("Unexpected database pool error", err)
    })
  }

  return pool
}

export function getSQLiteDb() {
  if (!sqliteDb && DB_TYPE === "sqlite") {
    const dbPath = path.join(process.cwd(), "dev.db")
    sqliteDb = new Database(dbPath)

    // Enable foreign keys
    sqliteDb.pragma("foreign_keys = ON")

    console.log(`SQLite database initialized at: ${dbPath}`)
  }

  return sqliteDb
}

// Force refresh SQLite connection (for development)
export function refreshSQLiteConnection() {
  if (sqliteDb) {
    sqliteDb.close()
    sqliteDb = null
  }
}

// Query helper function that works with both PostgreSQL and SQLite
export async function query(text: string, params: any[] = []) {
  const start = Date.now()

  try {
    if (DB_TYPE === "postgresql") {
      const client = await getPool()!.connect()

      try {
        const result = await client.query(text, params)
        const duration = Date.now() - start

        if (process.env.NODE_ENV !== "production") {
          console.log("Executed PostgreSQL query", {
            text,
            duration,
            rows: result.rowCount,
          })
        }

        return result
      } finally {
        client.release()
      }
    } else {
      // SQLite implementation
      const db = getSQLiteDb()!

      // Convert PostgreSQL-style queries to SQLite
      let sqliteQuery = convertPostgresToSQLite(text)
      // Convert boolean values to integers for SQLite compatibility
      let sqliteParams = (params || []).map(param =>
        typeof param === 'boolean' ? (param ? 1 : 0) : param
      )

      const duration = Date.now() - start

      if (process.env.NODE_ENV !== "production") {
        console.log("Executing SQLite query", {
          original: text,
          converted: sqliteQuery,
          duration,
          params: sqliteParams
        })
      }

      // Handle different query types
      if (sqliteQuery.trim().toUpperCase().startsWith("SELECT")) {
        const stmt = db.prepare(sqliteQuery)
        const rows = stmt.all(...sqliteParams)
        return { rows, rowCount: rows.length }
      } else if (sqliteQuery.trim().toUpperCase().startsWith("INSERT")) {
        const stmt = db.prepare(sqliteQuery)
        const result = stmt.run(...sqliteParams)
        return {
          rows: [{ id: result.lastInsertRowid }],
          rowCount: result.changes
        }
      } else {
        // UPDATE, DELETE, etc.
        const stmt = db.prepare(sqliteQuery)
        const result = stmt.run(...sqliteParams)
        return {
          rows: [],
          rowCount: result.changes
        }
      }
    }
  } catch (error) {
    console.error("Error executing query", {
      text,
      params,
      dbType: DB_TYPE,
      error
    })
    throw error
  }
}

// Convert PostgreSQL queries to SQLite compatible format
function convertPostgresToSQLite(query: string): string {
  let converted = query

  // Replace PostgreSQL-specific functions and syntax
  converted = converted.replace(/NOW\(\)/g, "datetime('now')")
  converted = converted.replace(/gen_random_uuid\(\)/g, "lower(hex(randomblob(16)))")
  converted = converted.replace(/UUID/g, "TEXT")
  converted = converted.replace(/TIMESTAMP WITH TIME ZONE/g, "DATETIME")
  converted = converted.replace(/JSONB/g, "TEXT")

  // Convert PostgreSQL parameter placeholders ($1, $2, etc.) to SQLite (?)
  converted = converted.replace(/\$\d+/g, "?")

  // Handle CREATE TABLE IF NOT EXISTS differences
  if (converted.includes("CREATE TABLE IF NOT EXISTS")) {
    // More careful handling of REFERENCES and ON DELETE CASCADE
    // Remove the entire REFERENCES clause including ON DELETE CASCADE
    converted = converted.replace(/REFERENCES\s+[^,)]+(\s+ON\s+DELETE\s+CASCADE)?/gi, "")

    // Clean up any double commas or trailing commas that might result
    converted = converted.replace(/,\s*,/g, ",")
    converted = converted.replace(/,\s*\)/g, ")")
    converted = converted.replace(/\(\s*,/g, "(")
  }

  return converted
}

// Transaction helper optimized for serverless
export async function withTransaction<T>(callback: (client: any) => Promise<T>): Promise<T> {
  const client = await getPool().connect()

  try {
    await client.query("BEGIN")
    const result = await callback(client)
    await client.query("COMMIT")
    return result
  } catch (error) {
    await client.query("ROLLBACK")
    throw error
  } finally {
    client.release()
  }
}
