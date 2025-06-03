/**
 * Rate Limiting Utility
 * Provides in-memory rate limiting for API endpoints
 */

interface RateLimitOptions {
  interval: number // Time window in milliseconds
  uniqueTokenPerInterval: number // Max unique tokens to track
}

interface TokenBucket {
  count: number
  lastReset: number
}

export function rateLimit(options: RateLimitOptions) {
  const tokenCache = new Map<string, TokenBucket>()

  return {
    check: async (limit: number, token: string): Promise<void> => {
      const now = Date.now()
      const tokenBucket = tokenCache.get(token) || { count: 0, lastReset: now }

      // Reset count if interval has passed
      if (now - tokenBucket.lastReset > options.interval) {
        tokenBucket.count = 0
        tokenBucket.lastReset = now
      }

      // Check if limit exceeded
      if (tokenBucket.count >= limit) {
        throw new Error('Rate limit exceeded')
      }

      // Increment count
      tokenBucket.count++
      tokenCache.set(token, tokenBucket)

      // Clean up old entries to prevent memory leaks
      if (tokenCache.size > options.uniqueTokenPerInterval) {
        const oldestEntries = Array.from(tokenCache.entries())
          .sort(([, a], [, b]) => a.lastReset - b.lastReset)
          .slice(0, Math.floor(options.uniqueTokenPerInterval * 0.1))

        oldestEntries.forEach(([key]) => tokenCache.delete(key))
      }
    }
  }
}
