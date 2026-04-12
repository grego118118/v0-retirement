/**
 * Next.js Instrumentation Hook
 * Initializes Sentry for server-side error monitoring and performance tracking
 * This file is automatically loaded by Next.js when the application starts
 */

export async function register() {
  // Set up global polyfills for server-side compatibility
  if (typeof global !== 'undefined' && typeof (global as any).self === 'undefined') {
    (global as any).self = global;
  }
  if (typeof globalThis !== 'undefined' && typeof (globalThis as any).self === 'undefined') {
    (globalThis as any).self = globalThis;
  }
  if (typeof global !== 'undefined' && typeof (global as any).webpackChunk_N_E === 'undefined') {
    (global as any).webpackChunk_N_E = [];
  }

  // Temporarily disabled Sentry initialization to resolve build issues
  // TODO: Re-enable once Sentry package compatibility is resolved
  console.log('Instrumentation hook loaded - Sentry disabled for build compatibility')

  /*
  if (process.env.NEXT_RUNTIME === 'nodejs' && false) {
    // Only initialize Sentry on the server side
    try {
      const { init } = await import('@sentry/nextjs')

      const SENTRY_DSN = process.env.SENTRY_DSN
      const SENTRY_ENVIRONMENT = process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV
      const SENTRY_RELEASE = process.env.SENTRY_RELEASE

    init({
      dsn: SENTRY_DSN,
      environment: SENTRY_ENVIRONMENT,
      release: SENTRY_RELEASE,
      
      // Performance monitoring
      tracesSampleRate: SENTRY_ENVIRONMENT === 'production' ? 0.1 : 1.0,
      
      // Error filtering for server-side
      beforeSend(event, hint) {
        const error = hint.originalException
        
        if (error instanceof Error) {
          // Filter out expected authentication errors
          if (error.message.includes('Authentication required') ||
              error.message.includes('Unauthorized') ||
              error.message.includes('Invalid token')) {
            return null
          }
          
          // Filter out rate limiting errors (these are expected)
          if (error.message.includes('Rate limit exceeded')) {
            return null
          }
          
          // Filter out validation errors (these are user errors, not system errors)
          if (error.message.includes('Validation failed') ||
              error.message.includes('Invalid input')) {
            return null
          }
        }
        
        return event
      },
      
      // Debug mode for development
      debug: SENTRY_ENVIRONMENT === 'development',
      
      // Server-specific configuration
      serverName: process.env.SERVER_NAME || 'ma-retirement-server',
      
      // Additional server options
      autoSessionTracking: true,
      
      // Additional server configuration
      beforeBreadcrumb(breadcrumb) {
        // Filter out health check requests
        if (breadcrumb.category === 'http' && 
            breadcrumb.data?.url?.includes('/api/health')) {
          return null
        }
        
        // Filter out noisy console logs in production
        if (SENTRY_ENVIRONMENT === 'production' && 
            breadcrumb.category === 'console' && 
            breadcrumb.level === 'log') {
          return null
        }
        
        return breadcrumb
      },
      
      // Normalize URLs for better grouping
      normalizeDepth: 6,
      
      // Additional context
      initialScope: {
        tags: {
          component: 'server',
          service: 'ma-retirement-system',
        },
      },
    })
    } catch (error) {
      console.error('Failed to initialize Sentry:', error)
    }
  }
  */
}

/**
 * Utility functions for Sentry error reporting
 * These functions are exported for use in API routes and server components
 */

/**
 * Report an API error to Sentry with additional context
 * Temporarily disabled to resolve build issues
 */
export async function reportAPIError(error: Error, endpoint: string, method: string) {
  // Temporarily disabled Sentry error reporting
  console.error(`API Error [${method} ${endpoint}]:`, error)

  // TODO: Re-enable Sentry reporting once package compatibility is resolved
  /*
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { captureException, withScope } = await import('@sentry/nextjs')

    withScope((scope) => {
      scope.setTag('errorType', 'api')
      scope.setTag('endpoint', endpoint)
      scope.setTag('method', method)
      scope.setContext('api', {
        endpoint,
        method,
        timestamp: new Date().toISOString(),
      })
      captureException(error)
    })
  }
  */
}

/**
 * Monitor server operations with performance tracking
 * Temporarily disabled Sentry integration to resolve build issues
 */
export async function monitorServerOperation<T>(
  operation: () => Promise<T>,
  operationName: string
): Promise<T> {
  // Simplified monitoring without Sentry
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

  // TODO: Re-enable Sentry monitoring once package compatibility is resolved
  /*
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { startSpan } = await import('@sentry/nextjs')

    return startSpan(
      {
        name: operationName,
        op: 'function',
      },
      async () => {
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
          const { captureException, withScope } = await import('@sentry/nextjs')

          withScope((scope) => {
            scope.setTag('operationType', 'server')
            scope.setTag('operationName', operationName)
            scope.setContext('operation', {
              name: operationName,
              duration: Date.now() - startTime,
              timestamp: new Date().toISOString(),
            })
            captureException(error)
          })

          throw error
        }
      }
    )
  } else {
    // Fallback for edge runtime or client-side
    return await operation()
  }
  */
}
