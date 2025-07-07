interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccessed: number;
}

interface CacheStats {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  evictions: number;
  totalEntries: number;
}

class MemoryCache {
  private cache = new Map<string, CacheEntry<any>>();
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    evictions: 0,
    totalEntries: 0,
  };
  private maxEntries: number;
  private cleanupInterval: NodeJS.Timeout;

  constructor(maxEntries: number = 1000) {
    this.maxEntries = maxEntries;
    
    // Cleanup expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  set<T>(key: string, data: T, ttlSeconds: number = 300): void {
    const now = Date.now();
    
    // If cache is full, evict least recently used entry
    if (this.cache.size >= this.maxEntries && !this.cache.has(key)) {
      this.evictLRU();
    }

    this.cache.set(key, {
      data,
      timestamp: now,
      ttl: ttlSeconds * 1000,
      accessCount: 0,
      lastAccessed: now,
    });

    this.stats.sets++;
    this.stats.totalEntries = this.cache.size;
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.stats.misses++;
      return null;
    }
    
    const now = Date.now();
    
    // Check if entry has expired
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.stats.misses++;
      this.stats.deletes++;
      this.stats.totalEntries = this.cache.size;
      return null;
    }
    
    // Update access statistics
    entry.accessCount++;
    entry.lastAccessed = now;
    this.stats.hits++;
    
    return entry.data;
  }

  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.stats.deletes++;
      this.stats.totalEntries = this.cache.size;
    }
    return deleted;
  }

  clear(): void {
    const entriesCleared = this.cache.size;
    this.cache.clear();
    this.stats.deletes += entriesCleared;
    this.stats.totalEntries = 0;
  }

  // Evict least recently used entry
  private evictLRU(): void {
    let oldestKey: string | null = null;
    let oldestTime = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
      this.stats.evictions++;
      this.stats.totalEntries = this.cache.size;
    }
  }

  // Clean up expired entries
  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => {
      this.cache.delete(key);
      this.stats.deletes++;
    });

    this.stats.totalEntries = this.cache.size;

    if (keysToDelete.length > 0) {
      console.log(`Cache cleanup: removed ${keysToDelete.length} expired entries`);
    }
  }

  // Get cache statistics
  getStats(): CacheStats & { hitRate: number } {
    const totalRequests = this.stats.hits + this.stats.misses;
    const hitRate = totalRequests > 0 ? (this.stats.hits / totalRequests) * 100 : 0;

    return {
      ...this.stats,
      hitRate: Math.round(hitRate * 100) / 100,
    };
  }

  // Get cache size and memory usage estimate
  getInfo(): { size: number; estimatedMemoryMB: number } {
    const size = this.cache.size;
    // Rough estimate: each entry ~1KB on average
    const estimatedMemoryMB = Math.round((size * 1024) / (1024 * 1024) * 100) / 100;

    return { size, estimatedMemoryMB };
  }

  // Destroy cache and cleanup
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.clear();
  }
}

// Global cache instance
export const cache = new MemoryCache(1000);

// Cache wrapper for API calls with error handling
export async function withCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds: number = 300,
  options: {
    fallbackOnError?: boolean;
    logErrors?: boolean;
  } = {}
): Promise<T> {
  const { fallbackOnError = true, logErrors = true } = options;

  // Try to get from cache first
  const cached = cache.get<T>(key);
  if (cached) return cached;

  try {
    // Fetch fresh data
    const data = await fetcher();
    
    // Cache the result
    cache.set(key, data, ttlSeconds);
    
    return data;
  } catch (error) {
    if (logErrors) {
      console.error(`Cache fetch error for key "${key}":`, error);
    }

    // If fallback is enabled, try to return stale data
    if (fallbackOnError) {
      // Look for any cached version, even if expired
      const staleEntry = cache.cache.get(key);
      if (staleEntry) {
        console.warn(`Using stale cache data for key "${key}" due to fetch error`);
        return staleEntry.data;
      }
    }

    throw error;
  }
}

// Specialized cache functions for common use cases

// Profile caching with user-specific keys
export async function cacheUserProfile<T>(
  userId: string,
  fetcher: () => Promise<T>,
  ttlSeconds: number = 300
): Promise<T> {
  return withCache(`profile:${userId}`, fetcher, ttlSeconds, {
    fallbackOnError: true,
    logErrors: true,
  });
}

// Calculations caching
export async function cacheUserCalculations<T>(
  userId: string,
  fetcher: () => Promise<T>,
  ttlSeconds: number = 600 // 10 minutes for calculations
): Promise<T> {
  return withCache(`calculations:${userId}`, fetcher, ttlSeconds, {
    fallbackOnError: true,
    logErrors: true,
  });
}

// Subscription status caching
export async function cacheSubscriptionStatus<T>(
  userId: string,
  fetcher: () => Promise<T>,
  ttlSeconds: number = 180 // 3 minutes for subscription status
): Promise<T> {
  return withCache(`subscription:${userId}`, fetcher, ttlSeconds, {
    fallbackOnError: false, // Don't use stale subscription data
    logErrors: true,
  });
}

// Pension calculation caching (for repeated calculations with same parameters)
export async function cachePensionCalculation<T>(
  calculationParams: Record<string, any>,
  fetcher: () => Promise<T>,
  ttlSeconds: number = 3600 // 1 hour for pension calculations
): Promise<T> {
  // Create a stable cache key from parameters
  const paramString = Object.keys(calculationParams)
    .sort()
    .map(key => `${key}:${calculationParams[key]}`)
    .join('|');
  
  const cacheKey = `pension:${Buffer.from(paramString).toString('base64')}`;
  
  return withCache(cacheKey, fetcher, ttlSeconds, {
    fallbackOnError: true,
    logErrors: true,
  });
}

// Cache invalidation helpers
export function invalidateUserCache(userId: string): void {
  const keysToDelete = [
    `profile:${userId}`,
    `calculations:${userId}`,
    `subscription:${userId}`,
  ];

  keysToDelete.forEach(key => cache.delete(key));
  console.log(`Invalidated cache for user ${userId}`);
}

export function invalidateAllUserCaches(): void {
  // Get all keys and filter for user-specific ones
  const userKeys: string[] = [];
  
  for (const key of cache.cache.keys()) {
    if (key.startsWith('profile:') || 
        key.startsWith('calculations:') || 
        key.startsWith('subscription:')) {
      userKeys.push(key);
    }
  }

  userKeys.forEach(key => cache.delete(key));
  console.log(`Invalidated ${userKeys.length} user cache entries`);
}

// Graceful shutdown
if (typeof process !== 'undefined') {
  process.on('beforeExit', () => {
    cache.destroy();
  });
}

export default cache;
