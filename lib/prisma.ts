import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | null
}

// Enhanced Prisma configuration with optimized connection pooling
const createPrismaClient = () => {
  const databaseUrl = process.env.DATABASE_URL

  // During build time, DATABASE_URL might not be available
  // Return null to prevent build failures
  if (!databaseUrl) {
    if (process.env.NODE_ENV === 'production' && !process.env.VERCEL_ENV) {
      // Only throw error in production runtime (not build time)
      throw new Error('DATABASE_URL environment variable is not set')
    }
    // During build or when DATABASE_URL is not available, return null
    console.log('DATABASE_URL not available, returning null Prisma client (likely build time)')
    return null
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

// Create Prisma client with null safety for build time
const createSafePrismaClient = (): PrismaClient | null => {
  if (!isProduction && !isServerless) {
    // Development: use global singleton
    const client = globalForPrisma.prisma ?? createPrismaClient()
    if (client) {
      globalForPrisma.prisma = client
    }
    return client
  } else {
    // Production/serverless: always use global singleton to prevent prepared statement conflicts
    if (!globalForPrisma.prisma) {
      globalForPrisma.prisma = createPrismaClient()
    }
    return globalForPrisma.prisma
  }
}

// Create a proxy that throws helpful errors when prisma is null
const createPrismaProxy = (client: PrismaClient | null): PrismaClient => {
  if (client === null) {
    // During build time, return a proxy that throws helpful errors
    return new Proxy({} as PrismaClient, {
      get(target, prop) {
        throw new Error(
          `Prisma client is not available during build time. ` +
          `This usually happens when DATABASE_URL is not set during the build process. ` +
          `Property accessed: ${String(prop)}`
        )
      }
    })
  }
  return client
}

export const prisma = createPrismaProxy(createSafePrismaClient())

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