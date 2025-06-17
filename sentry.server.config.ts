/**
 * Sentry Server-Side Configuration
 * Legacy file - Sentry initialization has been moved to instrumentation.ts
 * This file now only exports utility functions for backward compatibility
 * Temporarily using stub implementations for build compatibility
 */

/**
 * Report an API error to Sentry with additional context (stub implementation)
 * @deprecated Use the function from instrumentation.ts instead
 */
export async function reportAPIError(error: Error, endpoint: string, method: string) {
  console.error(`API Error [${method} ${endpoint}]:`, error)
}

/**
 * Monitor server operations with performance tracking (stub implementation)
 * @deprecated Use the function from instrumentation.ts instead
 */
export async function monitorServerOperation<T>(
  operation: () => Promise<T>,
  operationName: string
): Promise<T> {
  const startTime = Date.now()
  try {
    const result = await operation()
    const duration = Date.now() - startTime

    // Log slow operations
    if (duration > 2000) {
      console.warn(`Slow operation detected: ${operationName} took ${duration}ms`)
    }

    return result
  } catch (error) {
    console.error(`Operation failed [${operationName}]:`, error)
    throw error
  }
}
