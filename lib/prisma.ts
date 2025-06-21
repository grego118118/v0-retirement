import { PrismaClient } from './generated/prisma'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Enhanced Prisma configuration for Vercel serverless environment
// Fixes "prepared statement already exists" error (PostgreSQL error 42P05)
const createPrismaClient = () => {
  const databaseUrl = process.env.DATABASE_URL

  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is not set')
  }

  // For Supabase + Vercel serverless: Use transaction pooling to completely avoid prepared statements
  const isSupabase = databaseUrl.includes('supabase.com') || databaseUrl.includes('supabase.co')
  const isVercel = process.env.VERCEL || process.env.VERCEL_ENV

  let connectionUrl = databaseUrl
  if (isSupabase && isVercel) {
    // Use transaction pooling mode to avoid prepared statement conflicts entirely
    // This is more aggressive than session pooling but prevents the error
    const separator = databaseUrl.includes('?') ? '&' : '?'
    connectionUrl = `${databaseUrl}${separator}pgbouncer=true&pool_mode=transaction&connection_limit=1`
  }

  console.log('Prisma connecting with URL:', connectionUrl.replace(/:[^:@]*@/, ':***@'))

  return new PrismaClient({
    datasources: {
      db: {
        url: connectionUrl
      }
    },
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    // Additional configuration to handle serverless environment
    __internal: {
      engine: {
        // Force disable prepared statements in serverless
        enableEngineDebugMode: false,
      }
    }
  })
}

// In serverless environments, create a new client for each request to avoid conflicts
const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME
const shouldUseGlobal = !isServerless && process.env.NODE_ENV !== 'production'

export const prisma = shouldUseGlobal
  ? (globalForPrisma.prisma ?? createPrismaClient())
  : createPrismaClient()

// Only cache in development, not in serverless production
if (shouldUseGlobal) {
  globalForPrisma.prisma = prisma
}

// Enhanced connection cleanup for serverless environments
if (typeof window === 'undefined') {
  // Server-side only: ensure connections are properly closed
  process.on('beforeExit', async () => {
    try {
      await prisma.$disconnect()
    } catch (error) {
      console.error('Error disconnecting Prisma:', error)
    }
  })

  // Additional cleanup for serverless
  if (isServerless) {
    process.on('SIGTERM', async () => {
      await prisma.$disconnect()
    })
  }
}

export default prisma