import { NextResponse } from "next/server"

/**
 * Diagnostic/debug endpoints leak infrastructure details (env var presence,
 * DB connection info, session internals) and must never respond in
 * production, regardless of what auth checks a given route also has.
 * Call this first in any /api/debug/* or diagnostic route handler.
 */
export function blockInProduction(): NextResponse | null {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }
  return null
}
