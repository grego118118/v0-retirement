/**
 * Sentry Server Configuration
 * Massachusetts Retirement System - Error Tracking and Monitoring
 * 
 * Server-side Sentry configuration for API error tracking,
 * database monitoring, and server performance analysis.
 */

import * as Sentry from "@sentry/nextjs"

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN

Sentry.init({
  // Data Source Name (DSN) - unique identifier for your Sentry project
  dsn: SENTRY_DSN,

  // Environment configuration
  environment: process.env.NODE_ENV || 'development',

  // Release tracking for deployment monitoring
  release: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',

  // Performance monitoring configuration (lower sampling for server)
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.05 : 1.0,

  // Debug mode for development
  debug: process.env.NODE_ENV === 'development',

  // Server-specific integrations
  integrations: [
    // Node.js profiling for server performance
    new Sentry.ProfilingIntegration(),
    
    // HTTP integration for API monitoring
    new Sentry.Integrations.Http({ tracing: true }),
    
    // Console integration for log capture
    new Sentry.Integrations.Console(),
    
    // OnUncaughtException integration
    new Sentry.Integrations.OnUncaughtException({
      exitEvenIfOtherHandlersAreRegistered: false,
    }),
  ],

  // Error filtering for server-side
  beforeSend(event, hint) {
    // Filter out development-only errors
    if (process.env.NODE_ENV === 'development') {
      // Skip certain development errors
      if (event.exception) {
        const error = hint.originalException
        if (error instanceof Error) {
          // Skip Next.js development hot reload errors
          if (error.message.includes('ECONNRESET') || 
              error.message.includes('socket hang up')) {
            return null
          }
        }
      }
    }

    // Filter out non-critical database connection errors
    if (event.exception) {
      const error = hint.originalException
      if (error instanceof Error) {
        // Skip temporary database connection issues
        if (error.message.includes('ECONNREFUSED') && 
            process.env.NODE_ENV === 'development') {
          return null
        }
      }
    }

    return event
  },

  // Add custom tags for server context
  initialScope: {
    tags: {
      component: 'server',
      application: 'massachusetts-retirement-system',
      version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
      node_version: process.version,
    },
    contexts: {
      app: {
        name: 'Massachusetts Retirement System Server',
        version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
      },
      runtime: {
        name: 'node',
        version: process.version,
      },
    },
  },

  // Performance monitoring thresholds
  profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.05 : 1.0,

  // Maximum breadcrumbs to keep in memory
  maxBreadcrumbs: 100,

  // Attach stack traces to messages
  attachStacktrace: true,

  // Send default PII (Personally Identifiable Information) - disabled for privacy
  sendDefaultPii: false,

  // Custom transaction naming for API routes
  beforeSendTransaction(event) {
    // Add custom context for API routes
    if (event.transaction?.includes('/api/')) {
      event.tags = {
        ...event.tags,
        api_route: 'true',
        critical: 'true',
      }
    }

    // Add context for calculation endpoints
    if (event.transaction?.includes('calculate') || 
        event.transaction?.includes('pension') ||
        event.transaction?.includes('social-security')) {
      event.tags = {
        ...event.tags,
        feature: 'retirement-calculator',
        performance_critical: 'true',
      }
    }

    // Add context for authentication
    if (event.transaction?.includes('auth') || 
        event.transaction?.includes('login')) {
      event.tags = {
        ...event.tags,
        feature: 'authentication',
        security_critical: 'true',
      }
    }

    return event
  },
})

// Export Sentry for use in API routes and server components
export { Sentry }

// Server-specific error reporting functions
export const reportServerError = (error: Error, context?: Record<string, any>) => {
  Sentry.withScope((scope) => {
    if (context) {
      scope.setContext('server', context)
    }
    scope.setLevel('error')
    scope.setTag('component', 'server')
    Sentry.captureException(error)
  })
}

export const reportAPIError = (
  error: Error, 
  endpoint: string, 
  method: string,
  context?: Record<string, any>
) => {
  Sentry.withScope((scope) => {
    scope.setContext('api', {
      endpoint,
      method,
      ...context,
    })
    scope.setLevel('error')
    scope.setTag('component', 'api')
    scope.setTag('endpoint', endpoint)
    scope.setTag('method', method)
    Sentry.captureException(error)
  })
}

export const reportDatabaseError = (error: Error, operation: string, context?: Record<string, any>) => {
  Sentry.withScope((scope) => {
    scope.setContext('database', {
      operation,
      ...context,
    })
    scope.setLevel('error')
    scope.setTag('component', 'database')
    scope.setTag('operation', operation)
    Sentry.captureException(error)
  })
}

// Performance monitoring for server operations
export const monitorServerOperation = async <T>(
  operation: () => Promise<T>,
  operationName: string,
  category: string = 'server'
): Promise<T> => {
  const transaction = Sentry.startTransaction({
    name: operationName,
    op: category,
  })

  const startTime = Date.now()

  try {
    const result = await operation()
    const duration = Date.now() - startTime
    
    transaction.setStatus('ok')
    transaction.setData('duration_ms', duration)
    
    // Log slow operations
    if (duration > 2000) { // 2 second threshold
      Sentry.addBreadcrumb({
        message: `Slow operation detected: ${operationName}`,
        category: 'performance',
        level: 'warning',
        data: { duration_ms: duration },
      })
    }
    
    return result
  } catch (error) {
    transaction.setStatus('internal_error')
    reportServerError(error as Error, { operation: operationName })
    throw error
  } finally {
    transaction.finish()
  }
}

// Database operation monitoring
export const monitorDatabaseOperation = async <T>(
  operation: () => Promise<T>,
  operationName: string,
  tableName?: string
): Promise<T> => {
  const transaction = Sentry.startTransaction({
    name: `db.${operationName}`,
    op: 'db',
  })

  if (tableName) {
    transaction.setData('table', tableName)
  }

  const startTime = Date.now()

  try {
    const result = await operation()
    const duration = Date.now() - startTime
    
    transaction.setStatus('ok')
    transaction.setData('duration_ms', duration)
    
    // Log slow database operations
    if (duration > 1000) { // 1 second threshold for DB operations
      Sentry.addBreadcrumb({
        message: `Slow database operation: ${operationName}`,
        category: 'database',
        level: 'warning',
        data: { 
          duration_ms: duration,
          table: tableName,
        },
      })
    }
    
    return result
  } catch (error) {
    transaction.setStatus('internal_error')
    reportDatabaseError(error as Error, operationName, { table: tableName })
    throw error
  } finally {
    transaction.finish()
  }
}

// API route monitoring wrapper
export const withSentryAPI = (handler: any) => {
  return async (req: any, res: any) => {
    const transaction = Sentry.startTransaction({
      name: `${req.method} ${req.url}`,
      op: 'http.server',
    })

    // Set request context
    Sentry.setContext('request', {
      method: req.method,
      url: req.url,
      headers: req.headers,
      query: req.query,
    })

    try {
      const result = await handler(req, res)
      transaction.setStatus('ok')
      return result
    } catch (error) {
      transaction.setStatus('internal_error')
      reportAPIError(
        error as Error,
        req.url,
        req.method,
        {
          query: req.query,
          body: req.body,
        }
      )
      throw error
    } finally {
      transaction.finish()
    }
  }
}

// Health check monitoring
export const reportHealthCheck = (status: 'healthy' | 'unhealthy', details?: Record<string, any>) => {
  Sentry.addBreadcrumb({
    message: `Health check: ${status}`,
    category: 'health',
    level: status === 'healthy' ? 'info' : 'error',
    data: details,
  })

  if (status === 'unhealthy') {
    Sentry.captureMessage(`Application health check failed`, 'error')
  }
}

// Deployment tracking
export const reportDeployment = (version: string, environment: string) => {
  Sentry.addBreadcrumb({
    message: `Deployment: ${version} to ${environment}`,
    category: 'deployment',
    level: 'info',
    data: { version, environment },
  })
}
