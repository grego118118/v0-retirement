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

  // For Supabase + Vercel serverless: Use connection pooling to prevent prepared statement conflicts
  // The pgbouncer=true parameter enables Supabase's connection pooler
  // connection_limit=1 prevents multiple concurrent connections from same function
  const isSupabase = databaseUrl.includes('supabase.com') || databaseUrl.includes('supabase.co')

  let connectionUrl = databaseUrl
  if (isSupabase && process.env.VERCEL) {
    // Add Supabase connection pooling parameters for Vercel deployment
    const separator = databaseUrl.includes('?') ? '&' : '?'
    connectionUrl = `${databaseUrl}${separator}pgbouncer=true&connection_limit=1&pool_timeout=0&statement_timeout=30000`
  }

  console.log('Prisma connecting with URL:', connectionUrl.replace(/:[^:@]*@/, ':***@'))

  return new PrismaClient({
    datasources: {
      db: {
        url: connectionUrl
      }
    },
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

// Ensure proper connection management in serverless
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// Add connection cleanup for serverless environments
if (typeof window === 'undefined') {
  // Server-side only: ensure connections are properly closed
  process.on('beforeExit', async () => {
    await prisma.$disconnect()
  })
}

export default prisma