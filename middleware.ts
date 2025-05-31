import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"
import { getCSP } from "@/lib/csp"

export default withAuth(
  function middleware(req) {
    // Create a response
    const response = NextResponse.next()
    
    // Add security headers
    const isDevelopment = process.env.NODE_ENV !== 'production'
    response.headers.set('Content-Security-Policy', getCSP(isDevelopment))
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
    
    // Add Trusted Types header for browsers that support it
    if (!isDevelopment) {
      response.headers.set('Require-Trusted-Types-For', "'script'")
    }
    
    return response
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to public routes
        const publicRoutes = ["/", "/about", "/faq", "/blog", "/resources", "/contact", "/auth/signin", "/auth/error"]
        const isPublicRoute = publicRoutes.some(route => req.nextUrl.pathname.startsWith(route))
        
        if (isPublicRoute) {
          return true
        }
        
        // Require authentication for protected routes
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
