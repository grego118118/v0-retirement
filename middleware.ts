import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"
import { getCSP } from "@/lib/csp"

export default withAuth(
  function middleware(req) {
    const isDevelopment = process.env.NODE_ENV !== 'production'
    const isEmbedRoute = req.nextUrl.pathname.startsWith('/embed/')

    // Block access to development routes in production
    if (!isDevelopment && req.nextUrl.pathname.startsWith('/dev/')) {
      return NextResponse.redirect(new URL('/404', req.url))
    }

    // Create a response
    const response = NextResponse.next()

    // For embed routes, use permissive headers to allow iframe embedding
    if (isEmbedRoute) {
      const embedCSP = [
        "default-src 'self'",
        "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "img-src 'self' data: https: blob:",
        "font-src 'self' data: https://fonts.gstatic.com",
        "connect-src 'self' https://*.supabase.co",
        "frame-ancestors *",
        "object-src 'none'"
      ].join('; ')

      response.headers.set('Content-Security-Policy', embedCSP)
      // Don't set X-Frame-Options for embed routes (allows iframe embedding)
      response.headers.set('X-Content-Type-Options', 'nosniff')
      response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
      return response
    }

    // Add security headers for non-embed routes
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
        const publicRoutes = [
          "/about", "/faq", "/blog", "/resources", "/contact",
          "/auth/signin", "/auth/error", "/embed", "/tools", "/calculator"
        ]
        const pathname = req.nextUrl.pathname
        const isPublicRoute =
          pathname === "/" ||
          publicRoutes.some(route => pathname === route || pathname.startsWith(`${route}/`))

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
     * - images (static image files)
     * - static assets with common extensions
     */
    "/((?!api|_next/static|_next/image|favicon.ico|images/).*)",
  ],
}
