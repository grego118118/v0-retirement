import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if the path is protected
  const isProtected = ["/profile"].some((path) => pathname.startsWith(path))

  if (isProtected) {
    try {
      const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })

      // Redirect to login if not authenticated
      if (!token) {
        const url = new URL("/auth/signin", request.url)
        url.searchParams.set("callbackUrl", encodeURI(pathname))
        return NextResponse.redirect(url)
      }
    } catch (error) {
      console.error("Authentication middleware error:", error)
      // Redirect to error page on authentication error
      const url = new URL("/auth/error", request.url)
      url.searchParams.set("error", "unknown")
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/profile/:path*"],
}
