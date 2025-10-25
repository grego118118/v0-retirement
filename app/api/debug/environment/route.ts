import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    // Environment variable check
    const envCheck = {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: process.env.VERCEL,
      VERCEL_ENV: process.env.VERCEL_ENV,
      DATABASE_URL_EXISTS: !!process.env.DATABASE_URL,
      DATABASE_URL_PREFIX: process.env.DATABASE_URL?.substring(0, 20) + '...',
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      NEXTAUTH_SECRET_EXISTS: !!process.env.NEXTAUTH_SECRET,
      GOOGLE_CLIENT_ID_EXISTS: !!process.env.GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET_EXISTS: !!process.env.GOOGLE_CLIENT_SECRET,
      SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      SUPABASE_ANON_KEY_EXISTS: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_KEY_EXISTS: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    }

    // Database connectivity test
    let databaseTest = {
      connected: false,
      error: null as string | null,
      userCount: null as number | null,
      tables: [] as string[]
    }

    try {
      // Test basic connectivity
      await prisma.$queryRaw`SELECT 1 as test`
      databaseTest.connected = true

      // Test user table access
      try {
        const userCount = await prisma.user.count()
        databaseTest.userCount = userCount
      } catch (error) {
        databaseTest.error = `User table error: ${error instanceof Error ? error.message : 'Unknown'}`
      }

      // Test retirement profile table access
      try {
        const profileCount = await prisma.retirementProfile.count()
        databaseTest.tables.push(`retirementProfile: ${profileCount} records`)
      } catch (error) {
        databaseTest.tables.push(`retirementProfile: ERROR - ${error instanceof Error ? error.message : 'Unknown'}`)
      }

    } catch (error) {
      databaseTest.connected = false
      databaseTest.error = error instanceof Error ? error.message : 'Unknown database error'
    }

    // NextAuth configuration test
    const authTest = {
      configExists: true,
      googleProviderConfigured: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
      secretConfigured: !!process.env.NEXTAUTH_SECRET,
      urlConfigured: !!process.env.NEXTAUTH_URL,
    }

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      environment: envCheck,
      database: databaseTest,
      auth: authTest,
      status: databaseTest.connected && authTest.googleProviderConfigured ? 'healthy' : 'unhealthy'
    })

  } catch (error) {
    console.error("Debug endpoint error:", error)
    
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      status: 'error'
    }, { status: 500 })
  }
}
