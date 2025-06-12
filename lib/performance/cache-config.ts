/**
 * Massachusetts Retirement System - Performance Optimization Configuration
 * 
 * Caching strategies, Redis configuration, and performance monitoring
 * for production deployment with sub-2-second performance requirements.
 */

import { Redis } from 'ioredis'

// Redis configuration for production caching
export const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0'),
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
  keepAlive: 30000,
  connectTimeout: 10000,
  commandTimeout: 5000,
}

// Initialize Redis client
let redis: Redis | null = null

export const getRedisClient = (): Redis => {
  if (!redis) {
    redis = new Redis(redisConfig)
    
    redis.on('error', (error) => {
      console.error('Redis connection error:', error)
    })
    
    redis.on('connect', () => {
      console.log('Redis connected successfully')
    })
  }
  
  return redis
}

// Cache key generators
export const cacheKeys = {
  // User-specific caches
  userProfile: (userId: string) => `user:profile:${userId}`,
  userCalculations: (userId: string) => `user:calculations:${userId}`,
  userScenarios: (userId: string) => `user:scenarios:${userId}`,
  
  // Calculation caches
  pensionCalculation: (params: string) => `calc:pension:${params}`,
  socialSecurityCalculation: (params: string) => `calc:ss:${params}`,
  taxCalculation: (params: string) => `calc:tax:${params}`,
  
  // Scenario caches
  scenarioResults: (scenarioId: string) => `scenario:results:${scenarioId}`,
  scenarioComparison: (scenarioIds: string[]) => `scenario:comparison:${scenarioIds.sort().join(':')}`,
  
  // Static data caches
  retirementGroups: () => 'static:retirement-groups',
  colaRates: () => 'static:cola-rates',
  benefitMultipliers: () => 'static:benefit-multipliers',
  
  // Session caches
  userSession: (sessionId: string) => `session:${sessionId}`,
  authToken: (tokenId: string) => `auth:token:${tokenId}`,
}

// Cache TTL (Time To Live) configurations in seconds
export const cacheTTL = {
  // User data - moderate TTL for data consistency
  userProfile: 300, // 5 minutes
  userCalculations: 600, // 10 minutes
  userScenarios: 300, // 5 minutes
  
  // Calculation results - longer TTL as they're deterministic
  pensionCalculation: 3600, // 1 hour
  socialSecurityCalculation: 3600, // 1 hour
  taxCalculation: 1800, // 30 minutes (tax rules may change)
  
  // Scenario results - moderate TTL
  scenarioResults: 1800, // 30 minutes
  scenarioComparison: 900, // 15 minutes
  
  // Static data - very long TTL
  retirementGroups: 86400, // 24 hours
  colaRates: 43200, // 12 hours
  benefitMultipliers: 86400, // 24 hours
  
  // Session data - short TTL for security
  userSession: 1800, // 30 minutes
  authToken: 3600, // 1 hour
}

// Cache utility functions
export class CacheManager {
  private redis: Redis
  
  constructor() {
    this.redis = getRedisClient()
  }
  
  // Generic cache get with JSON parsing
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.redis.get(key)
      return value ? JSON.parse(value) : null
    } catch (error) {
      console.error(`Cache get error for key ${key}:`, error)
      return null
    }
  }
  
  // Generic cache set with JSON stringification
  async set<T>(key: string, value: T, ttl?: number): Promise<boolean> {
    try {
      const serialized = JSON.stringify(value)
      if (ttl) {
        await this.redis.setex(key, ttl, serialized)
      } else {
        await this.redis.set(key, serialized)
      }
      return true
    } catch (error) {
      console.error(`Cache set error for key ${key}:`, error)
      return false
    }
  }
  
  // Cache delete
  async delete(key: string): Promise<boolean> {
    try {
      await this.redis.del(key)
      return true
    } catch (error) {
      console.error(`Cache delete error for key ${key}:`, error)
      return false
    }
  }
  
  // Cache with automatic TTL
  async setWithTTL<T>(key: string, value: T, ttlKey: keyof typeof cacheTTL): Promise<boolean> {
    return this.set(key, value, cacheTTL[ttlKey])
  }
  
  // Batch operations
  async mget<T>(keys: string[]): Promise<(T | null)[]> {
    try {
      const values = await this.redis.mget(...keys)
      return values.map(value => value ? JSON.parse(value) : null)
    } catch (error) {
      console.error(`Cache mget error for keys ${keys.join(', ')}:`, error)
      return keys.map(() => null)
    }
  }
  
  async mset(keyValuePairs: Array<[string, any, number?]>): Promise<boolean> {
    try {
      const pipeline = this.redis.pipeline()
      
      for (const [key, value, ttl] of keyValuePairs) {
        const serialized = JSON.stringify(value)
        if (ttl) {
          pipeline.setex(key, ttl, serialized)
        } else {
          pipeline.set(key, serialized)
        }
      }
      
      await pipeline.exec()
      return true
    } catch (error) {
      console.error('Cache mset error:', error)
      return false
    }
  }
  
  // Cache invalidation patterns
  async invalidatePattern(pattern: string): Promise<number> {
    try {
      const keys = await this.redis.keys(pattern)
      if (keys.length > 0) {
        return await this.redis.del(...keys)
      }
      return 0
    } catch (error) {
      console.error(`Cache invalidation error for pattern ${pattern}:`, error)
      return 0
    }
  }
  
  // User-specific cache invalidation
  async invalidateUserCache(userId: string): Promise<void> {
    await Promise.all([
      this.invalidatePattern(`user:*:${userId}`),
      this.invalidatePattern(`scenario:*:${userId}:*`),
      this.invalidatePattern(`calc:*:${userId}:*`)
    ])
  }
  
  // Health check
  async healthCheck(): Promise<{ status: 'healthy' | 'unhealthy', latency?: number }> {
    try {
      const start = Date.now()
      await this.redis.ping()
      const latency = Date.now() - start
      
      return {
        status: latency < 100 ? 'healthy' : 'unhealthy',
        latency
      }
    } catch (error) {
      return { status: 'unhealthy' }
    }
  }
}

// Singleton cache manager instance
let cacheManager: CacheManager | null = null

export const getCacheManager = (): CacheManager => {
  if (!cacheManager) {
    cacheManager = new CacheManager()
  }
  return cacheManager
}

// Cache decorator for functions
export function cached<T extends (...args: any[]) => Promise<any>>(
  keyGenerator: (...args: Parameters<T>) => string,
  ttl: number
) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value
    
    descriptor.value = async function (...args: Parameters<T>) {
      const cache = getCacheManager()
      const key = keyGenerator(...args)
      
      // Try to get from cache first
      const cached = await cache.get(key)
      if (cached !== null) {
        return cached
      }
      
      // Execute original method
      const result = await method.apply(this, args)
      
      // Cache the result
      await cache.set(key, result, ttl)
      
      return result
    }
  }
}

// Performance monitoring for cache operations
export const monitorCacheOperation = async <T>(
  operation: () => Promise<T>,
  operationName: string,
  cacheKey?: string
): Promise<T> => {
  const startTime = Date.now()
  
  try {
    const result = await operation()
    const duration = Date.now() - startTime
    
    // Log slow cache operations
    if (duration > 100) {
      console.warn(`Slow cache operation: ${operationName} took ${duration}ms`, {
        operation: operationName,
        duration,
        cacheKey
      })
    }
    
    return result
  } catch (error) {
    console.error(`Cache operation failed: ${operationName}`, {
      operation: operationName,
      cacheKey,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    throw error
  }
}

// Cache warming strategies
export const warmCache = async (): Promise<void> => {
  const cache = getCacheManager()
  
  try {
    // Warm static data caches
    console.log('Warming static data caches...')
    
    // This would typically load from database and cache
    // Implementation depends on your data models
    
    console.log('Cache warming completed')
  } catch (error) {
    console.error('Cache warming failed:', error)
  }
}

// Export default cache manager
export default getCacheManager
