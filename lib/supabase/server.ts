import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { Database } from "@/types/supabase"

export function getSupabaseServerClient() {
  try {
    return createServerComponentClient<Database>({ cookies })
  } catch (error) {
    console.error("Failed to create server Supabase client:", error)
    // Return a mock client that won't crash the app
    return {
      auth: {
        getSession: async () => ({ data: { session: null }, error: null }),
      },
      from: () => ({
        select: () => ({ data: null, error: new Error("Supabase not configured") }),
      }),
    } as any
  }
}
