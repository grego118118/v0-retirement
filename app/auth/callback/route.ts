import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

import type { NextRequest } from "next/server"
import type { Database } from "@/types/supabase"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")

  if (code) {
    try {
      const cookieStore = cookies()
      const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore })
      await supabase.auth.exchangeCodeForSession(code)
    } catch (error) {
      console.error("Error in auth callback:", error)
      // Redirect to error page if exchange fails
      return NextResponse.redirect(new URL("/auth/error", request.url))
    }
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(new URL("/profile", request.url))
}
