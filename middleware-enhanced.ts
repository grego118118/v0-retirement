import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"
import { getCSP } from "@/lib/csp"

// IP allowlist for API endpoints (production)
const ALLOWED_IPS = [
  '127.0.0.1',      // localhost
  '::1',            // localhost IPv6
  // Add your n8n server IP here
  // '192.168.1.100',  // Example: your n8n server
]

// Rate limiting store (use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

function checkRateLimit(ip: string, limit: number = 10, window: number = 60000): boolean {
  const now = Date.now()
  const key = `rate_limit_${ip}`
  const record = rateLimitStore.get(key)
  
  if (!record || now > record.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + window })
    return true
  }
  
  if (record.count >= limit) {
    return false
  }
  
  record.count++
  return true
}

export default withAuth(
  function middleware(req) {
    const isDevelopment = process.env.NODE_ENV !== 'production'
    const clientIP = req.headers.get('x-forwarded-for') ||
                    req.headers.get('x-real-ip') ||
                    'unknown'

    // Enhanced security for API endpoints
    if (req.nextUrl.pathname.startsWith('/api/admin/') || 
        req.nextUrl.pathname.startsWith('/api/public/')) {
      
      // Rate limiting
      if (!checkRateLimit(clientIP, 20, 60000)) { // 20 requests per minute
        console.warn(`Rate limit exceeded for IP: ${clientIP}`)
        return NextResponse.json(
          { error: 'Rate limit exceeded' }, 
          { status: 429 }
        )
      }
      
      // IP allowlist (production only)
      if (!isDevelopment && !ALLOWED_IPS.includes(clientIP)) {
        console.warn(`Blocked request from unauthorized IP: ${clientIP}`)
        return NextResponse.json(
          { error: 'Access denied' }, 
          { status: 403 }
        )
      }
      
      // Log API access for monitoring
      console.log(`API access: ${req.nextUrl.pathname} from ${clientIP}`)
    }

    // Block access to development routes in production
    if (!isDevelopment && req.nextUrl.pathname.startsWith('/dev/')) {
      return NextResponse.redirect(new URL('/404', req.url))
    }

    // Create a response
    const response = NextResponse.next()

    // Add security headers
    response.headers.set('Content-Security-Policy', getCSP(isDevelopment))
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')

    // Add API-specific headers
    if (req.nextUrl.pathname.startsWith('/api/')) {
      response.headers.set('X-API-Version', '1.0')
      response.headers.set('X-Rate-Limit-Remaining', '19') // Example
    }

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
          "/", "/about", "/faq", "/blog", "/resources", "/contact", 
          "/auth/signin", "/auth/error", "/api/public/"
        ]
        const isPublicRoute = publicRoutes.some(route => 
          req.nextUrl.pathname.startsWith(route)
        )
        
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
