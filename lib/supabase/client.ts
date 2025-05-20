import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/types/supabase"

// Create a singleton instance to prevent multiple instances
let supabaseClient: ReturnType<typeof createClientComponentClient<Database>> | null = null

export function getSupabaseBrowserClient() {
  if (!supabaseClient) {
    try {
      supabaseClient = createClientComponentClient<Database>({
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
        supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        options: {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
          },
        },
      })
    } catch (error) {
      console.error("Failed to create Supabase client:", error)
      // Return a mock client that won't crash the app
      return {
        auth: {
          getSession: async () => ({ data: { session: null }, error: null }),
          onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
          signInWithOAuth: async () => ({ error: new Error("Supabase not configured") }),
          signOut: async () => ({ error: null }),
        },
        from: () => ({
          select: () => ({ data: null, error: new Error("Supabase not configured") }),
        }),
      } as any
    }
  }
  return supabaseClient
}
