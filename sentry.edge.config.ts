/**
 * Sentry Edge Runtime Configuration
 * Massachusetts Retirement System - Error Tracking and Monitoring
 * 
 * Edge runtime Sentry configuration for middleware and edge functions
 * error tracking and performance monitoring.
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

  // Performance monitoring configuration (minimal for edge)
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.01 : 0.1,

  // Debug mode for development
  debug: process.env.NODE_ENV === 'development',

  // Minimal integrations for edge runtime
  integrations: [
    // Basic HTTP integration for edge functions
    new Sentry.Integrations.Http({ tracing: true }),
  ],

  // Error filtering for edge runtime
  beforeSend(event, hint) {
    // Filter out edge runtime specific errors that aren't actionable
    if (event.exception) {
      const error = hint.originalException
      if (error instanceof Error) {
        // Skip edge runtime timeout errors
        if (error.message.includes('TimeoutError') || 
            error.message.includes('AbortError')) {
          return null
        }
      }
    }

    return event
  },

  // Add custom tags for edge context
  initialScope: {
    tags: {
      component: 'edge',
      application: 'massachusetts-retirement-system',
      version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
      runtime: 'edge',
    },
    contexts: {
      app: {
        name: 'Massachusetts Retirement System Edge',
        version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
      },
      runtime: {
        name: 'edge',
        version: 'latest',
      },
    },
  },

  // Minimal performance monitoring for edge
  profilesSampleRate: 0,

  // Reduced breadcrumbs for edge runtime
  maxBreadcrumbs: 20,

  // Attach stack traces to messages
  attachStacktrace: true,

  // Send default PII (Personally Identifiable Information) - disabled
  sendDefaultPii: false,

  // Custom transaction naming for edge functions
  beforeSendTransaction(event) {
    // Add custom context for middleware
    if (event.transaction?.includes('middleware')) {
      event.tags = {
        ...event.tags,
        edge_function: 'middleware',
        critical: 'true',
      }
    }

    // Add context for authentication middleware
    if (event.transaction?.includes('auth')) {
      event.tags = {
        ...event.tags,
        feature: 'authentication',
        security_critical: 'true',
      }
    }

    return event
  },
})

// Export Sentry for use in edge functions and middleware
export { Sentry }

// Edge-specific error reporting functions
export const reportEdgeError = (error: Error, context?: Record<string, any>) => {
  Sentry.withScope((scope) => {
    if (context) {
      scope.setContext('edge', context)
    }
    scope.setLevel('error')
    scope.setTag('component', 'edge')
    Sentry.captureException(error)
  })
}

export const reportMiddlewareError = (
  error: Error, 
  pathname: string,
  context?: Record<string, any>
) => {
  Sentry.withScope((scope) => {
    scope.setContext('middleware', {
      pathname,
      ...context,
    })
    scope.setLevel('error')
    scope.setTag('component', 'middleware')
    scope.setTag('pathname', pathname)
    Sentry.captureException(error)
  })
}

// Performance monitoring for edge operations
export const monitorEdgeOperation = async <T>(
  operation: () => Promise<T>,
  operationName: string
): Promise<T> => {
  const transaction = Sentry.startTransaction({
    name: operationName,
    op: 'edge',
  })

  const startTime = Date.now()

  try {
    const result = await operation()
    const duration = Date.now() - startTime
    
    transaction.setStatus('ok')
    transaction.setData('duration_ms', duration)
    
    // Log slow edge operations (lower threshold for edge)
    if (duration > 500) { // 500ms threshold for edge functions
      Sentry.addBreadcrumb({
        message: `Slow edge operation: ${operationName}`,
        category: 'performance',
        level: 'warning',
        data: { duration_ms: duration },
      })
    }
    
    return result
  } catch (error) {
    transaction.setStatus('internal_error')
    reportEdgeError(error as Error, { operation: operationName })
    throw error
  } finally {
    transaction.finish()
  }
}

// Middleware monitoring wrapper
export const withSentryMiddleware = (middleware: any) => {
  return async (request: Request, event: any) => {
    const url = new URL(request.url)
    const transaction = Sentry.startTransaction({
      name: `middleware ${url.pathname}`,
      op: 'middleware',
    })

    // Set request context
    Sentry.setContext('request', {
      method: request.method,
      url: request.url,
      pathname: url.pathname,
      headers: Object.fromEntries(request.headers.entries()),
    })

    try {
      const result = await middleware(request, event)
      transaction.setStatus('ok')
      return result
    } catch (error) {
      transaction.setStatus('internal_error')
      reportMiddlewareError(
        error as Error,
        url.pathname,
        {
          method: request.method,
          url: request.url,
        }
      )
      throw error
    } finally {
      transaction.finish()
    }
  }
}
