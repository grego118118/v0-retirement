import { Pool } from "pg"

// Create a singleton pool instance that's compatible with serverless environments
let pool: Pool | null = null

export function getPool() {
  if (!pool) {
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

// Query helper function optimized for serverless
export async function query(text: string, params: any[] = []) {
  const client = await getPool().connect()

  try {
    const start = Date.now()
    const result = await client.query(text, params)
    const duration = Date.now() - start

    if (process.env.NODE_ENV !== "production") {
      console.log("Executed query", {
        text,
        duration,
        rows: result.rowCount,
      })
    }

    return result
  } catch (error) {
    console.error("Error executing query", { text, error })
    throw error
  } finally {
    client.release()
  }
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
