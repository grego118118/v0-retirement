import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Enhanced Prisma configuration with optimized connection pooling
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
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })
}

// Use global singleton in development to prevent multiple instances
// Create new instances in production/serverless environments
const isProduction = process.env.NODE_ENV === 'production'
const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME

export const prisma = (!isProduction && !isServerless)
  ? (globalForPrisma.prisma ?? (globalForPrisma.prisma = createPrismaClient()))
  : createPrismaClient()

// Enhanced connection cleanup for proper resource management
if (typeof window === 'undefined') {
  // Server-side only: ensure connections are properly closed
  const gracefulShutdown = async (signal: string) => {
    console.log(`Received ${signal}, closing database connections...`)
    try {
      await prisma.$disconnect()
      console.log('Database connections closed successfully')
    } catch (error) {
      console.error(`Error disconnecting Prisma on ${signal}:`, error)
    }
  }

  process.on('beforeExit', async () => {
    await gracefulShutdown('beforeExit')
  })

  process.on('SIGTERM', async () => {
    await gracefulShutdown('SIGTERM')
    process.exit(0)
  })

  process.on('SIGINT', async () => {
    await gracefulShutdown('SIGINT')
    process.exit(0)
  })

  // Handle uncaught exceptions
  process.on('uncaughtException', async (error) => {
    console.error('Uncaught Exception:', error)
    await gracefulShutdown('uncaughtException')
    process.exit(1)
  })

  process.on('unhandledRejection', async (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason)
    await gracefulShutdown('unhandledRejection')
    process.exit(1)
  })
}

export default prisma
