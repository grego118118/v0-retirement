import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const testResults = {
    timestamp: new Date().toISOString(),
    tests: [] as Array<{name: string, status: 'pass' | 'fail', message: string, details?: any}>,
    summary: {
      passed: 0,
      failed: 0,
      total: 0
    }
  }

  function addTest(name: string, status: 'pass' | 'fail', message: string, details?: any) {
    testResults.tests.push({ name, status, message, details })
    testResults.summary.total++
    if (status === 'pass') {
      testResults.summary.passed++
    } else {
      testResults.summary.failed++
    }
  }

  // Test 1: Environment Variables
  try {
    const requiredEnvVars = [
      'DATABASE_URL',
      'NEXTAUTH_URL', 
      'NEXTAUTH_SECRET',
      'GOOGLE_CLIENT_ID',
      'GOOGLE_CLIENT_SECRET'
    ]

    const missingVars = requiredEnvVars.filter(varName => !process.env[varName])
    
    if (missingVars.length === 0) {
      addTest('Environment Variables', 'pass', 'All required environment variables are set')
    } else {
      addTest('Environment Variables', 'fail', `Missing variables: ${missingVars.join(', ')}`, { missingVars })
    }
  } catch (error) {
    addTest('Environment Variables', 'fail', `Error checking environment: ${error instanceof Error ? error.message : 'Unknown'}`)
  }

  // Test 2: Database URL Format
  try {
    const dbUrl = process.env.DATABASE_URL
    if (!dbUrl) {
      addTest('Database URL Format', 'fail', 'DATABASE_URL not set')
    } else if (!dbUrl.startsWith('postgresql://') && !dbUrl.startsWith('postgres://')) {
      addTest('Database URL Format', 'fail', `Invalid protocol. Expected postgresql:// or postgres://, got: ${dbUrl.substring(0, 20)}...`)
    } else {
      addTest('Database URL Format', 'pass', 'Database URL has correct PostgreSQL protocol')
    }
  } catch (error) {
    addTest('Database URL Format', 'fail', `Error checking database URL: ${error instanceof Error ? error.message : 'Unknown'}`)
  }

  // Test 3: Prisma Client Initialization
  try {
    // This should not throw an error if Prisma client can be created
    const prismaInfo = {
      clientExists: !!prisma,
      clientType: typeof prisma
    }
    addTest('Prisma Client', 'pass', 'Prisma client initialized successfully', prismaInfo)
  } catch (error) {
    addTest('Prisma Client', 'fail', `Prisma client initialization failed: ${error instanceof Error ? error.message : 'Unknown'}`)
  }

  // Test 4: Database Connectivity
  try {
    await prisma.$queryRaw`SELECT 1 as connectivity_test`
    addTest('Database Connectivity', 'pass', 'Successfully connected to database')
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    addTest('Database Connectivity', 'fail', `Database connection failed: ${errorMessage}`, {
      error: errorMessage,
      databaseUrl: process.env.DATABASE_URL ? 'SET' : 'MISSING'
    })
  }

  // Test 5: User Table Access
  try {
    const userCount = await prisma.user.count()
    addTest('User Table Access', 'pass', `User table accessible with ${userCount} records`)
  } catch (error) {
    addTest('User Table Access', 'fail', `Cannot access user table: ${error instanceof Error ? error.message : 'Unknown'}`)
  }

  // Test 6: Retirement Profile Table Access
  try {
    const profileCount = await prisma.retirementProfile.count()
    addTest('Retirement Profile Table', 'pass', `Retirement profile table accessible with ${profileCount} records`)
  } catch (error) {
    addTest('Retirement Profile Table', 'fail', `Cannot access retirement profile table: ${error instanceof Error ? error.message : 'Unknown'}`)
  }

  // Test 7: NextAuth Configuration
  try {
    const authConfig = {
      googleClientId: !!process.env.GOOGLE_CLIENT_ID,
      googleClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
      nextAuthSecret: !!process.env.NEXTAUTH_SECRET,
      nextAuthUrl: process.env.NEXTAUTH_URL
    }

    const authConfigured = authConfig.googleClientId && authConfig.googleClientSecret && authConfig.nextAuthSecret

    if (authConfigured) {
      addTest('NextAuth Configuration', 'pass', 'NextAuth properly configured', authConfig)
    } else {
      addTest('NextAuth Configuration', 'fail', 'NextAuth configuration incomplete', authConfig)
    }
  } catch (error) {
    addTest('NextAuth Configuration', 'fail', `Error checking NextAuth config: ${error instanceof Error ? error.message : 'Unknown'}`)
  }

  // Test 8: Database Schema Check
  try {
    const tablesQuery = `
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `

    const tables = await prisma.$queryRawUnsafe(tablesQuery) as Array<{table_name: string}>
    const tableNames = tables.map(t => t.table_name)

    const expectedTables = ['User', 'Account', 'Session', 'RetirementProfile', 'RetirementCalculation', 'EmailLog', 'NewsletterSubscriber']
    const missingTables = expectedTables.filter(table => !tableNames.includes(table))

    if (missingTables.length === 0) {
      addTest('Database Schema', 'pass', `All ${expectedTables.length} required tables exist`, {
        existingTables: tableNames,
        allTablesPresent: true
      })
    } else {
      addTest('Database Schema', 'fail', `Missing ${missingTables.length} tables: ${missingTables.join(', ')}`, {
        existingTables: tableNames,
        missingTables: missingTables,
        expectedTables: expectedTables
      })
    }
  } catch (error) {
    addTest('Database Schema', 'fail', `Error checking database schema: ${error instanceof Error ? error.message : 'Unknown'}`)
  }

  // Determine overall status
  const overallStatus = testResults.summary.failed === 0 ? 'healthy' : 'unhealthy'
  
  return NextResponse.json({
    ...testResults,
    status: overallStatus,
    recommendation: overallStatus === 'healthy' 
      ? 'All systems operational' 
      : 'Check failed tests and resolve configuration issues'
  })
}
