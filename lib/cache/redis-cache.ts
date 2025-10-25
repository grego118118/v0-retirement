/**
 * Redis Cache Implementation
 * High-performance caching layer for production deployment
 */

import Redis from 'ioredis'
import { measureAsync } from '@/lib/utils/performance-monitor'
import { captureException } from '@/lib/monitoring/sentry'

interface CacheOptions {
  ttl?: number // Time to live in seconds
  prefix?: string
  serialize?: boolean
}

interface CacheStats {
  hits: number
  misses: number
  sets: number
  deletes: number
  errors: number
}

class RedisCache {
  private client: Redis | null = null
  private isConnected = false
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    errors: 0
  }

  constructor() {
    this.initialize()
  }

  /**
   * Initialize Redis connection
   */
  private async initialize(): Promise<void> {
    try {
      const redisUrl = process.env.REDIS_URL
      
      if (!redisUrl) {
        console.warn('Redis URL not configured - caching disabled')
        return
      }

      this.client = new Redis(redisUrl, {
        enableReadyCheck: true,
        maxRetriesPerRequest: 3,
        lazyConnect: true,
        keepAlive: 30000,
        connectTimeout: 10000,
        commandTimeout: 5000,
        family: 4, // IPv4
      })

      // Event handlers
      this.client.on('connect', () => {
        console.log('Redis connected')
        this.isConnected = true
      })

      this.client.on('error', (error) => {
        console.error('Redis error:', error)
        this.isConnected = false
        this.stats.errors++
        captureException(error, { component: 'redis-cache' })
      })

      this.client.on('close', () => {
        console.log('Redis connection closed')
        this.isConnected = false
      })

      this.client.on('reconnecting', () => {
        console.log('Redis reconnecting...')
      })

      // Test connection
      await this.client.ping()
      console.log('Redis cache initialized successfully')
    } catch (error) {
      console.error('Failed to initialize Redis cache:', error)
      captureException(error as Error, { component: 'redis-cache-init' })
    }
  }

  /**
   * Check if cache is available
   */
  isAvailable(): boolean {
    return this.client !== null && this.isConnected
  }

  /**
   * Generate cache key with prefix
   */
  private generateKey(key: string, prefix?: string): string {
    const defaultPrefix = process.env.CACHE_PREFIX || 'ma-retirement'
    const keyPrefix = prefix || defaultPrefix
    return `${keyPrefix}:${key}`
  }

  /**
   * Serialize value for storage
   */
  private serialize(value: any): string {
    try {
      return JSON.stringify(value)
    } catch (error) {
      captureException(error as Error, { component: 'cache-serialize' })
      throw new Error('Failed to serialize cache value')
    }
  }

  /**
   * Deserialize value from storage
   */
  private deserialize<T>(value: string): T {
    try {
      return JSON.parse(value)
    } catch (error) {
      captureException(error as Error, { component: 'cache-deserialize' })
      throw new Error('Failed to deserialize cache value')
    }
  }

  /**
   * Get value from cache
   */
  async get<T>(key: string, options: CacheOptions = {}): Promise<T | null> {
    if (!this.isAvailable()) {
      this.stats.misses++
      return null
    }

    return measureAsync('cache-get', async () => {
      try {
        const cacheKey = this.generateKey(key, options.prefix)
        const value = await this.client!.get(cacheKey)

        if (value === null) {
          this.stats.misses++
          return null
        }

        this.stats.hits++
        
        if (options.serialize !== false) {
          return this.deserialize<T>(value)
        }
        
        return value as T
      } catch (error) {
        this.stats.errors++
        captureException(error as Error, { 
          component: 'cache-get',
          key,
          options 
        })
        return null
      }
    })
  }

  /**
   * Set value in cache
   */
  async set(
    key: string, 
    value: any, 
    options: CacheOptions = {}
  ): Promise<boolean> {
    if (!this.isAvailable()) {
      return false
    }

    return measureAsync('cache-set', async () => {
      try {
        const cacheKey = this.generateKey(key, options.prefix)
        const serializedValue = options.serialize !== false 
          ? this.serialize(value) 
          : value

        let result: string
        
        if (options.ttl) {
          result = await this.client!.setex(cacheKey, options.ttl, serializedValue)
        } else {
          result = await this.client!.set(cacheKey, serializedValue)
        }

        this.stats.sets++
        return result === 'OK'
      } catch (error) {
        this.stats.errors++
        captureException(error as Error, { 
          component: 'cache-set',
          key,
          options 
        })
        return false
      }
    })
  }

  /**
   * Delete value from cache
   */
  async delete(key: string, options: CacheOptions = {}): Promise<boolean> {
    if (!this.isAvailable()) {
      return false
    }

    return measureAsync('cache-delete', async () => {
      try {
        const cacheKey = this.generateKey(key, options.prefix)
        const result = await this.client!.del(cacheKey)
        
        this.stats.deletes++
        return result > 0
      } catch (error) {
        this.stats.errors++
        captureException(error as Error, { 
          component: 'cache-delete',
          key,
          options 
        })
        return false
      }
    })
  }

  /**
   * Check if key exists in cache
   */
  async exists(key: string, options: CacheOptions = {}): Promise<boolean> {
    if (!this.isAvailable()) {
      return false
    }

    try {
      const cacheKey = this.generateKey(key, options.prefix)
      const result = await this.client!.exists(cacheKey)
      return result === 1
    } catch (error) {
      this.stats.errors++
      captureException(error as Error, { 
        component: 'cache-exists',
        key,
        options 
      })
      return false
    }
  }

  /**
   * Set expiration time for a key
   */
  async expire(key: string, ttl: number, options: CacheOptions = {}): Promise<boolean> {
    if (!this.isAvailable()) {
      return false
    }

    try {
      const cacheKey = this.generateKey(key, options.prefix)
      const result = await this.client!.expire(cacheKey, ttl)
      return result === 1
    } catch (error) {
      this.stats.errors++
      captureException(error as Error, { 
        component: 'cache-expire',
        key,
        ttl,
        options 
      })
      return false
    }
  }

  /**
   * Get multiple values from cache
   */
  async mget<T>(keys: string[], options: CacheOptions = {}): Promise<(T | null)[]> {
    if (!this.isAvailable()) {
      return keys.map(() => null)
    }

    return measureAsync('cache-mget', async () => {
      try {
        const cacheKeys = keys.map(key => this.generateKey(key, options.prefix))
        const values = await this.client!.mget(...cacheKeys)

        return values.map(value => {
          if (value === null) {
            this.stats.misses++
            return null
          }

          this.stats.hits++
          
          if (options.serialize !== false) {
            return this.deserialize<T>(value)
          }
          
          return value as T
        })
      } catch (error) {
        this.stats.errors++
        captureException(error as Error, { 
          component: 'cache-mget',
          keys,
          options 
        })
        return keys.map(() => null)
      }
    })
  }

  /**
   * Clear all cache entries with a specific prefix
   */
  async clear(prefix?: string): Promise<number> {
    if (!this.isAvailable()) {
      return 0
    }

    try {
      const pattern = this.generateKey('*', prefix)
      const keys = await this.client!.keys(pattern)
      
      if (keys.length === 0) {
        return 0
      }

      const result = await this.client!.del(...keys)
      this.stats.deletes += result
      return result
    } catch (error) {
      this.stats.errors++
      captureException(error as Error, { 
        component: 'cache-clear',
        prefix 
      })
      return 0
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats & { connected: boolean } {
    return {
      ...this.stats,
      connected: this.isConnected
    }
  }

  /**
   * Reset cache statistics
   */
  resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      errors: 0
    }
  }

  /**
   * Close Redis connection
   */
  async close(): Promise<void> {
    if (this.client) {
      await this.client.quit()
      this.client = null
      this.isConnected = false
    }
  }
}

// Export singleton instance
export const redisCache = new RedisCache()

// Export cache utilities
export const cache = {
  get: <T>(key: string, options?: CacheOptions) => redisCache.get<T>(key, options),
  set: (key: string, value: any, options?: CacheOptions) => redisCache.set(key, value, options),
  delete: (key: string, options?: CacheOptions) => redisCache.delete(key, options),
  exists: (key: string, options?: CacheOptions) => redisCache.exists(key, options),
  expire: (key: string, ttl: number, options?: CacheOptions) => redisCache.expire(key, ttl, options),
  mget: <T>(keys: string[], options?: CacheOptions) => redisCache.mget<T>(keys, options),
  clear: (prefix?: string) => redisCache.clear(prefix),
  stats: () => redisCache.getStats(),
  isAvailable: () => redisCache.isAvailable()
}
