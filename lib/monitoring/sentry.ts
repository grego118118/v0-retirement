/**
 * Sentry Error Monitoring Configuration
 * Comprehensive error tracking and performance monitoring for production
 */

import * as Sentry from '@sentry/nextjs'
interface User {
  id?: string
  email?: string | null
  name?: string | null
}

// Sentry configuration
const SENTRY_DSN = process.env.SENTRY_DSN
const SENTRY_ENVIRONMENT = process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV || 'development'
const SENTRY_RELEASE = process.env.SENTRY_RELEASE || process.env.VERCEL_GIT_COMMIT_SHA

/**
 * Initialize Sentry with production-ready configuration
 */
export function initSentry() {
  if (!SENTRY_DSN) {
    console.warn('Sentry DSN not configured - error monitoring disabled')
    return
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: SENTRY_ENVIRONMENT,
    release: SENTRY_RELEASE,
    
    // Performance monitoring
    tracesSampleRate: SENTRY_ENVIRONMENT === 'production' ? 0.1 : 1.0,
    
    // Session replay for debugging
    replaysSessionSampleRate: SENTRY_ENVIRONMENT === 'production' ? 0.01 : 0.1,
    replaysOnErrorSampleRate: 1.0,
    
    // Error filtering
    beforeSend(event, hint) {
      // Filter out known non-critical errors
      const error = hint.originalException
      
      if (error instanceof Error) {
        // Filter out network errors that are user-related
        if (error.message.includes('Network Error') || 
            error.message.includes('Failed to fetch')) {
          return null
        }
        
        // Filter out authentication errors (these are expected)
        if (error.message.includes('Authentication required') ||
            error.message.includes('Unauthorized')) {
          return null
        }
        
        // Filter out rate limiting errors
        if (error.message.includes('Rate limit exceeded')) {
          return null
        }
      }
      
      return event
    },
    
    // Performance monitoring configuration
    beforeSendTransaction(transaction) {
      // Sample API routes more heavily
      if ((transaction as any).transaction?.startsWith('/api/')) {
        // Adjust sampling for API routes
        return Math.random() < (SENTRY_ENVIRONMENT === 'production' ? 0.5 : 1.0) ? transaction : null
      }

      return transaction
    },
    
    // Additional configuration
    integrations: [
      new Sentry.Integrations.Http({ tracing: true }),
      // Prisma integration will be added when available
    ],
    
    // Debug mode for development
    debug: SENTRY_ENVIRONMENT === 'development',
    
    // Additional monitoring options
    enableTracing: true,
    
    // Additional options
    autoSessionTracking: true,
  })

  console.log(`Sentry initialized for ${SENTRY_ENVIRONMENT} environment`)
}

/**
 * Set user context for error tracking
 */
export function setSentryUser(user: Partial<User> | null) {
  Sentry.setUser(user ? {
    id: user.id,
    email: user.email || undefined,
    username: user.name || undefined,
  } : null)
}

/**
 * Set additional context for error tracking
 */
export function setSentryContext(context: Record<string, any>) {
  Sentry.setContext('additional', context)
}

/**
 * Capture exception with additional context
 */
export function captureException(error: Error, context?: Record<string, any>) {
  if (context) {
    Sentry.withScope((scope) => {
      Object.entries(context).forEach(([key, value]) => {
        scope.setTag(key, value)
      })
      Sentry.captureException(error)
    })
  } else {
    Sentry.captureException(error)
  }
}

/**
 * Capture message with level and context
 */
export function captureMessage(
  message: string, 
  level: Sentry.SeverityLevel = 'info',
  context?: Record<string, any>
) {
  if (context) {
    Sentry.withScope((scope) => {
      Object.entries(context).forEach(([key, value]) => {
        scope.setTag(key, value)
      })
      Sentry.captureMessage(message, level)
    })
  } else {
    Sentry.captureMessage(message, level)
  }
}

/**
 * Start a performance transaction
 */
export function startTransaction(name: string, op: string) {
  return Sentry.startTransaction({ name, op })
}

/**
 * Add breadcrumb for debugging
 */
export function addBreadcrumb(
  message: string, 
  category: string = 'custom',
  level: Sentry.SeverityLevel = 'info',
  data?: Record<string, any>
) {
  Sentry.addBreadcrumb({
    message,
    category,
    level,
    data,
    timestamp: Date.now() / 1000,
  })
}

/**
 * Performance monitoring decorator for functions
 */
export function withPerformanceMonitoring<T extends (...args: any[]) => any>(
  fn: T,
  operationName: string
): T {
  return ((...args: Parameters<T>) => {
    const transaction = startTransaction(operationName, 'function')
    
    try {
      const result = fn(...args)
      
      // Handle async functions
      if (result instanceof Promise) {
        return result
          .then((value) => {
            transaction.setStatus('ok')
            transaction.finish()
            return value
          })
          .catch((error) => {
            transaction.setStatus('internal_error')
            captureException(error, { operation: operationName })
            transaction.finish()
            throw error
          })
      }
      
      // Handle sync functions
      transaction.setStatus('ok')
      transaction.finish()
      return result
    } catch (error) {
      transaction.setStatus('internal_error')
      captureException(error as Error, { operation: operationName })
      transaction.finish()
      throw error
    }
  }) as T
}

/**
 * API route error handler with Sentry integration
 */
export function withSentryErrorHandler<T extends (...args: any[]) => any>(
  handler: T,
  routeName: string
): T {
  return (async (...args: Parameters<T>) => {
    const transaction = startTransaction(`API ${routeName}`, 'http.server')
    
    try {
      addBreadcrumb(`API call started: ${routeName}`, 'http')
      
      const result = await handler(...args)
      
      transaction.setStatus('ok')
      addBreadcrumb(`API call completed: ${routeName}`, 'http', 'info')
      
      return result
    } catch (error) {
      transaction.setStatus('internal_error')
      
      captureException(error as Error, {
        route: routeName,
        args: JSON.stringify(args, null, 2)
      })
      
      addBreadcrumb(
        `API call failed: ${routeName}`, 
        'http', 
        'error',
        { error: (error as Error).message }
      )
      
      throw error
    } finally {
      transaction.finish()
    }
  }) as T
}

/**
 * Database operation monitoring
 */
export function withDatabaseMonitoring<T extends (...args: any[]) => any>(
  operation: T,
  operationName: string,
  tableName?: string
): T {
  return withPerformanceMonitoring(operation, `db.${operationName}`) as T
}

/**
 * Email operation monitoring
 */
export function withEmailMonitoring<T extends (...args: any[]) => any>(
  operation: T,
  emailType: string
): T {
  return ((...args: Parameters<T>) => {
    const transaction = startTransaction(`email.${emailType}`, 'email')
    
    addBreadcrumb(`Email operation started: ${emailType}`, 'email')
    
    try {
      const result = operation(...args)
      
      if (result instanceof Promise) {
        return result
          .then((value) => {
            transaction.setStatus('ok')
            addBreadcrumb(`Email sent successfully: ${emailType}`, 'email', 'info')
            transaction.finish()
            return value
          })
          .catch((error) => {
            transaction.setStatus('internal_error')
            captureException(error, { emailType, operation: 'send' })
            addBreadcrumb(`Email failed: ${emailType}`, 'email', 'error')
            transaction.finish()
            throw error
          })
      }
      
      transaction.setStatus('ok')
      transaction.finish()
      return result
    } catch (error) {
      transaction.setStatus('internal_error')
      captureException(error as Error, { emailType, operation: 'send' })
      transaction.finish()
      throw error
    }
  }) as T
}

/**
 * PDF generation monitoring
 */
export function withPDFMonitoring<T extends (...args: any[]) => any>(
  operation: T,
  pdfType: string
): T {
  return withPerformanceMonitoring(operation, `pdf.${pdfType}`) as T
}

/**
 * Custom error classes for better error categorization
 */
export class ValidationError extends Error {
  constructor(message: string, field?: string) {
    super(message)
    this.name = 'ValidationError'
    
    if (field) {
      setSentryContext({ validationField: field })
    }
  }
}

export class AuthenticationError extends Error {
  constructor(message: string = 'Authentication required') {
    super(message)
    this.name = 'AuthenticationError'
  }
}

export class AuthorizationError extends Error {
  constructor(message: string = 'Insufficient permissions') {
    super(message)
    this.name = 'AuthorizationError'
  }
}

export class RateLimitError extends Error {
  constructor(message: string = 'Rate limit exceeded') {
    super(message)
    this.name = 'RateLimitError'
  }
}

export class ExternalServiceError extends Error {
  constructor(service: string, message: string) {
    super(`${service}: ${message}`)
    this.name = 'ExternalServiceError'
    setSentryContext({ externalService: service })
  }
}

// Export Sentry for direct use when needed
export { Sentry }
