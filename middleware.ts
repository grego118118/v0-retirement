import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const response = NextResponse.next()

    // Basic security headers
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

    return response
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to public pages
        const publicPaths = [
          '/',
          '/calculator',
          '/auth/signin',
          '/auth/error',
          '/social-security',
          '/wizard',
          '/resources',
          '/blog',
          '/faq',
          '/about',
          '/contact'
        ]

        // Allow access to all blog posts (dynamic routes)
        if (req.nextUrl.pathname.startsWith('/blog/')) {
          return true
        }

        if (publicPaths.includes(req.nextUrl.pathname)) {
          return true
        }

        // Require authentication for protected pages like dashboard and scenarios
        return !!token
      },
    },
    pages: {
      signIn: "/auth/signin",
      error: "/auth/error",
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
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}

// Temporarily disabled middleware
// export const config = {
//   matcher: [
//     /*
//      * Match all request paths except for the ones starting with:
//      * - api (API routes)
//      * - _next/static (static files)
//      * - _next/image (image optimization files)
//      * - favicon.ico (favicon file)
//      */
//     "/((?!api|_next/static|_next/image|favicon.ico).*)",
//   ],
// }
