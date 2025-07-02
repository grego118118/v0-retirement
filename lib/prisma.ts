import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Simplified Prisma configuration to fix "prepared statement already exists" errors
const createPrismaClient = () => {
  const databaseUrl = process.env.DATABASE_URL

  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is not set')
  }

  console.log('Prisma connecting with URL:', databaseUrl.replace(/:[^:@]*@/, ':***@'))

  return new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl
      }
    },
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })
}

// Use global singleton in development to prevent multiple instances
// Create new instances in production/serverless environments
const isProduction = process.env.NODE_ENV === 'production'
const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME

export const prisma = (!isProduction && !isServerless)
  ? (globalForPrisma.prisma ?? (globalForPrisma.prisma = createPrismaClient()))
  : createPrismaClient()

// Connection cleanup for proper resource management
if (typeof window === 'undefined') {
  // Server-side only: ensure connections are properly closed
  process.on('beforeExit', async () => {
    try {
      await prisma.$disconnect()
    } catch (error) {
      console.error('Error disconnecting Prisma:', error)
    }
  })

  process.on('SIGTERM', async () => {
    try {
      await prisma.$disconnect()
    } catch (error) {
      console.error('Error disconnecting Prisma on SIGTERM:', error)
    }
  })
}

export default prisma