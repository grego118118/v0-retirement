/**
 * Sentry Client Configuration
 * Massachusetts Retirement System - Error Tracking and Monitoring
 * 
 * Client-side Sentry configuration for browser error tracking,
 * performance monitoring, and user session recording.
 */

// Temporarily disable Sentry to fix initialization issues
// import * as Sentry from "@sentry/nextjs"

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN

// Mock Sentry object for fallback
const Sentry = {
  init: () => {},
  withScope: (callback: any) => callback({}),
  captureException: (error: any) => console.error('Error:', error),
  captureMessage: (message: any) => console.log('Message:', message),
  addBreadcrumb: (breadcrumb: any) => console.log('Breadcrumb:', breadcrumb),
  setUser: (user: any) => console.log('User:', user),
  setContext: (key: string, context: any) => console.log(`Context ${key}:`, context),
  startTransaction: (options: any) => ({
    setStatus: () => {},
    finish: () => {},
  }),
}

// Export Sentry for use in other parts of the application
export { Sentry }

// Custom error reporting functions with fallbacks
export const reportError = (error: Error, context?: Record<string, any>) => {
  if (SENTRY_DSN && typeof Sentry !== 'undefined' && Sentry.withScope) {
    try {
      Sentry.withScope((scope) => {
        if (context) {
          scope.setContext('custom', context)
        }
        scope.setLevel('error')
        Sentry.captureException(error)
      })
    } catch (sentryError) {
      console.error('Sentry error reporting failed:', sentryError)
      console.error('Original error:', error, context)
    }
  } else {
    console.error('Error:', error, context)
  }
}

export const reportWarning = (message: string, context?: Record<string, any>) => {
  if (SENTRY_DSN && typeof Sentry !== 'undefined' && Sentry.withScope) {
    try {
      Sentry.withScope((scope) => {
        if (context) {
          scope.setContext('custom', context)
        }
        scope.setLevel('warning')
        Sentry.captureMessage(message)
      })
    } catch (sentryError) {
      console.warn('Sentry warning reporting failed:', sentryError)
      console.warn('Original warning:', message, context)
    }
  } else {
    console.warn('Warning:', message, context)
  }
}

export const reportInfo = (message: string, context?: Record<string, any>) => {
  if (SENTRY_DSN && typeof Sentry !== 'undefined' && Sentry.withScope) {
    try {
      Sentry.withScope((scope) => {
        if (context) {
          scope.setContext('custom', context)
        }
        scope.setLevel('info')
        Sentry.captureMessage(message)
      })
    } catch (sentryError) {
      console.info('Sentry info reporting failed:', sentryError)
      console.info('Original info:', message, context)
    }
  } else {
    console.info('Info:', message, context)
  }
}

// Performance monitoring helpers
export const startTransaction = (name: string, op: string) => {
  if (SENTRY_DSN && typeof Sentry !== 'undefined' && Sentry.startTransaction) {
    try {
      return Sentry.startTransaction({ name, op })
    } catch (error) {
      console.log(`Transaction: ${name} (${op})`)
      return null
    }
  } else {
    console.log(`Transaction: ${name} (${op})`)
    return null
  }
}

export const addBreadcrumb = (message: string, category: string, level: string = 'info') => {
  if (SENTRY_DSN && typeof Sentry !== 'undefined' && Sentry.addBreadcrumb) {
    try {
      Sentry.addBreadcrumb({
        message,
        category,
        level: level as any,
        timestamp: Date.now() / 1000,
      })
    } catch (error) {
      console.log(`[${level.toUpperCase()}] ${category}: ${message}`)
    }
  } else {
    console.log(`[${level.toUpperCase()}] ${category}: ${message}`)
  }
}

// User context helpers
export const setSentryUserContext = (user: {
  id?: string
  email?: string
  username?: string
  [key: string]: any
}) => {
  if (SENTRY_DSN && typeof Sentry !== 'undefined' && Sentry.setUser) {
    try {
      Sentry.setUser(user)
    } catch (error) {
      console.log('User context:', user)
    }
  } else {
    console.log('User context:', user)
  }
}

export const clearUserContext = () => {
  if (SENTRY_DSN && typeof Sentry !== 'undefined' && Sentry.setUser) {
    try {
      Sentry.setUser(null)
    } catch (error) {
      console.log('User context cleared')
    }
  } else {
    console.log('User context cleared')
  }
}

// Custom tags for Massachusetts Retirement System
export const setRetirementContext = (context: {
  calculationType?: 'pension' | 'social-security' | 'combined'
  userGroup?: 'GROUP_1' | 'GROUP_2' | 'GROUP_3' | 'GROUP_4'
  retirementAge?: number
  yearsOfService?: number
}) => {
  if (SENTRY_DSN && typeof Sentry !== 'undefined' && Sentry.setContext) {
    try {
      Sentry.setContext('retirement', context)
    } catch (error) {
      console.log('Retirement context:', context)
    }
  } else {
    console.log('Retirement context:', context)
  }
}

// Performance monitoring for critical operations
export const monitorPerformance = async <T>(
  operation: () => Promise<T>,
  operationName: string,
  category: string = 'custom'
): Promise<T> => {
  const startTime = Date.now()
  let transaction: any = null

  if (SENTRY_DSN && typeof Sentry !== 'undefined' && Sentry.startTransaction) {
    try {
      transaction = Sentry.startTransaction({
        name: operationName,
        op: category,
      })
    } catch (error) {
      // Fallback to console logging
    }
  }

  try {
    const result = await operation()
    const duration = Date.now() - startTime

    if (transaction && transaction.setStatus) {
      transaction.setStatus('ok')
    }

    console.log(`Performance: ${operationName} completed in ${duration}ms`)
    return result
  } catch (error) {
    const duration = Date.now() - startTime

    if (transaction && transaction.setStatus) {
      transaction.setStatus('internal_error')
    }

    reportError(error as Error, { operation: operationName, duration })
    throw error
  } finally {
    if (transaction && transaction.finish) {
      transaction.finish()
    }
  }
}
