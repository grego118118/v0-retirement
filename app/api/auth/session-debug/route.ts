import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth/auth-options"

export async function GET(request: Request) {
  try {
    console.log("Session debug request started")
    
    // Get request headers for debugging
    const headers = Object.fromEntries(request.headers.entries())
    console.log("Request headers:", {
      cookie: headers.cookie ? "present" : "missing",
      authorization: headers.authorization ? "present" : "missing",
      userAgent: headers["user-agent"],
      referer: headers.referer
    })
    
    const session = await getServerSession(authOptions)

    const debugInfo = {
      timestamp: new Date().toISOString(),
      hasSession: !!session,
      sessionData: session ? {
        hasUser: !!session.user,
        userId: session.user?.id || null,
        userEmail: session.user?.email || null,
        userName: session.user?.name || null,
        sessionKeys: Object.keys(session),
        userKeys: session.user ? Object.keys(session.user) : []
      } : null,
      headers: {
        hasCookie: !!headers.cookie,
        hasAuthorization: !!headers.authorization,
        userAgent: headers["user-agent"],
        referer: headers.referer
      },
      authOptions: {
        hasSecret: !!process.env.NEXTAUTH_SECRET,
        hasGoogleClientId: !!process.env.GOOGLE_CLIENT_ID,
        hasGoogleClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
        nodeEnv: process.env.NODE_ENV
      }
    }

    console.log("Session debug info:", debugInfo)

    return NextResponse.json(debugInfo)
  } catch (error) {
    console.error("Session debug error:", error)
    return NextResponse.json({
      error: "Failed to debug session",
      message: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
