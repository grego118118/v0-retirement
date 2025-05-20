import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import type { Database } from "@/types/supabase"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  try {
    // Create a Supabase client configured to use cookies
    const supabase = createMiddlewareClient<Database>({ req, res })

    // Refresh session if expired - required for Server Components
    await supabase.auth.getSession()

    return res
  } catch (e) {
    // If there's an error, just continue without blocking the request
    console.error("Auth middleware error:", e)
    return res
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - public files
     */
    "/((?!_next/static|_next/image|favicon.ico|public/|sitemap.xml|robots.txt).*)",
  ],
}
