/**
 * Specialized Database Client for Blog Operations
 * Massachusetts Retirement System - Supabase Prepared Statement Conflict Resolution
 */

import { PrismaClient } from '@prisma/client'

class BlogDatabaseClient {
  private static instance: BlogDatabaseClient | null = null
  private client: PrismaClient | null = null
  private connectionAttempts = 0
  private maxRetries = 3

  private constructor() {
    // Private constructor for singleton pattern
  }

  public static getInstance(): BlogDatabaseClient {
    if (!BlogDatabaseClient.instance) {
      BlogDatabaseClient.instance = new BlogDatabaseClient()
    }
    return BlogDatabaseClient.instance
  }

  private async createFreshClient(): Promise<PrismaClient> {
    const databaseUrl = process.env.DATABASE_URL
    
    if (!databaseUrl) {
      throw new Error('DATABASE_URL environment variable is not set')
    }

    // Create a completely fresh client with unique connection parameters
    const client = new PrismaClient({
      datasources: {
        db: {
          url: databaseUrl
        }
      },
      log: ['error']
    })

    // Test the connection
    await client.$connect()
    return client
  }

  public async getClient(): Promise<PrismaClient> {
    if (!this.client) {
      this.client = await this.createFreshClient()
    }
    return this.client
  }

  public async resetConnection(): Promise<PrismaClient> {
    console.log('Resetting database connection to resolve prepared statement conflicts...')
    
    // Disconnect existing client
    if (this.client) {
      try {
        await this.client.$disconnect()
      } catch (error) {
        console.warn('Error disconnecting existing client:', error)
      }
      this.client = null
    }

    // Create fresh client
    this.client = await this.createFreshClient()
    console.log('Database connection reset successfully')
    return this.client
  }

  public async executeWithRetry<T>(
    operation: (client: PrismaClient) => Promise<T>,
    operationName: string = 'database operation'
  ): Promise<T> {
    let lastError: Error | null = null

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const client = await this.getClient()
        const result = await operation(client)
        
        // Reset attempt counter on success
        this.connectionAttempts = 0
        return result

      } catch (error) {
        lastError = error as Error
        console.warn(`${operationName} attempt ${attempt} failed:`, error)

        // Check if it's a prepared statement conflict
        if (error instanceof Error && error.message.includes('prepared statement')) {
          console.log('Detected prepared statement conflict, resetting connection...')
          
          try {
            await this.resetConnection()
          } catch (resetError) {
            console.error('Failed to reset connection:', resetError)
          }
        }

        // If this is the last attempt, throw the error
        if (attempt === this.maxRetries) {
          break
        }

        // Wait before retry (exponential backoff)
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }

    throw new Error(`${operationName} failed after ${this.maxRetries} attempts. Last error: ${lastError?.message}`)
  }

  public async createBlogPost(data: any): Promise<any> {
    return this.executeWithRetry(
      async (client) => {
        return await client.blogPost.create({ data })
      },
      'blog post creation'
    )
  }

  public async disconnect(): Promise<void> {
    if (this.client) {
      try {
        await this.client.$disconnect()
      } catch (error) {
        console.warn('Error disconnecting blog database client:', error)
      }
      this.client = null
    }
  }
}

// Export singleton instance
export const blogDbClient = BlogDatabaseClient.getInstance()

// Cleanup on process exit
if (typeof window === 'undefined') {
  process.on('beforeExit', async () => {
    await blogDbClient.disconnect()
  })

  process.on('SIGTERM', async () => {
    await blogDbClient.disconnect()
    process.exit(0)
  })

  process.on('SIGINT', async () => {
    await blogDbClient.disconnect()
    process.exit(0)
  })
}
