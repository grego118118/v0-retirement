/**
 * Sentry Error Monitoring Configuration
 * Comprehensive error tracking and performance monitoring for production
 * Temporarily disabled for build compatibility - using stub implementations
 */

// import * as Sentry from '@sentry/nextjs' // Temporarily disabled for build compatibility

interface User {
  id?: string
  email?: string | null
  name?: string | null
}

// Mock Sentry types for compatibility
type SeverityLevel = 'fatal' | 'error' | 'warning' | 'info' | 'debug'

// Sentry configuration
const SENTRY_DSN = process.env.SENTRY_DSN
const SENTRY_ENVIRONMENT = process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV || 'development'
const SENTRY_RELEASE = process.env.SENTRY_RELEASE || process.env.VERCEL_GIT_COMMIT_SHA

/**
 * Initialize Sentry with production-ready configuration (stub implementation)
 */
export function initSentry() {
  console.log('Sentry initialization disabled for build compatibility')
  /*
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
  */
}

/**
 * Set user context for error tracking (stub implementation)
 */
export function setSentryUser(user: Partial<User> | null) {
  console.log('Sentry user context set (stub):', user?.id)
}

/**
 * Set additional context for error tracking (stub implementation)
 */
export function setSentryContext(context: Record<string, any>) {
  console.log('Sentry context set (stub):', Object.keys(context))
}

/**
 * Capture exception with additional context (stub implementation)
 */
export function captureException(error: Error, context?: Record<string, any>) {
  console.error('Error captured (stub):', error.message, context)
}

/**
 * Capture message with level and context (stub implementation)
 */
export function captureMessage(
  message: string,
  level: SeverityLevel = 'info',
  context?: Record<string, any>
) {
  console.log(`Message captured (stub) [${level}]:`, message, context)
}

/**
 * Start a performance transaction (stub implementation)
 */
export function startTransaction(name: string, op: string) {
  return {
    setStatus: (status: string) => console.log(`Transaction status (stub): ${status}`),
    finish: () => console.log(`Transaction finished (stub): ${name}`),
  }
}

/**
 * Add breadcrumb for debugging (stub implementation)
 */
export function addBreadcrumb(
  message: string,
  category: string = 'custom',
  level: SeverityLevel = 'info',
  data?: Record<string, any>
) {
  console.log(`Breadcrumb added (stub) [${level}]:`, message, { category, data })
}

/**
 * Performance monitoring decorator for functions (stub implementation)
 */
export function withPerformanceMonitoring<T extends (...args: any[]) => any>(
  fn: T,
  operationName: string
): T {
  return ((...args: Parameters<T>) => {
    console.log(`Performance monitoring started (stub): ${operationName}`)

    try {
      const result = fn(...args)

      // Handle async functions
      if (result instanceof Promise) {
        return result
          .then((value) => {
            console.log(`Operation completed (stub): ${operationName}`)
            return value
          })
          .catch((error) => {
            console.error(`Operation failed (stub): ${operationName}`, error)
            throw error
          })
      }

      // Handle sync functions
      console.log(`Operation completed (stub): ${operationName}`)
      return result
    } catch (error) {
      console.error(`Operation failed (stub): ${operationName}`, error)
      throw error
    }
  }) as T
}

/**
 * API route error handler with Sentry integration (stub implementation)
 */
export function withSentryErrorHandler<T extends (...args: any[]) => any>(
  handler: T,
  routeName: string
): T {
  return (async (...args: Parameters<T>) => {
    console.log(`API call started (stub): ${routeName}`)

    try {
      const result = await handler(...args)
      console.log(`API call completed (stub): ${routeName}`)
      return result
    } catch (error) {
      console.error(`API call failed (stub): ${routeName}`, error)
      throw error
    }
  }) as T
}

/**
 * Database operation monitoring (stub implementation)
 */
export function withDatabaseMonitoring<T extends (...args: any[]) => any>(
  operation: T,
  operationName: string,
  tableName?: string
): T {
  return withPerformanceMonitoring(operation, `db.${operationName}`) as T
}

/**
 * Email operation monitoring (stub implementation)
 */
export function withEmailMonitoring<T extends (...args: any[]) => any>(
  operation: T,
  emailType: string
): T {
  return ((...args: Parameters<T>) => {
    console.log(`Email operation started (stub): ${emailType}`)

    try {
      const result = operation(...args)

      if (result instanceof Promise) {
        return result
          .then((value) => {
            console.log(`Email sent successfully (stub): ${emailType}`)
            return value
          })
          .catch((error) => {
            console.error(`Email failed (stub): ${emailType}`, error)
            throw error
          })
      }

      console.log(`Email sent successfully (stub): ${emailType}`)
      return result
    } catch (error) {
      console.error(`Email failed (stub): ${emailType}`, error)
      throw error
    }
  }) as T
}

/**
 * PDF generation monitoring (stub implementation)
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

// Export stub Sentry object for compatibility
export const Sentry = {
  init: () => console.log('Sentry init (stub)'),
  captureException: (error: Error) => console.error('Sentry captureException (stub):', error),
  captureMessage: (message: string) => console.log('Sentry captureMessage (stub):', message),
  setUser: (user: any) => console.log('Sentry setUser (stub):', user),
  setContext: (key: string, context: any) => console.log('Sentry setContext (stub):', key, context),
}
