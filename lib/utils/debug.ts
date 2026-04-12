/**
 * Debug Utility Module
 * Massachusetts Retirement System - Debug logging utilities
 * Provides environment-based conditional logging for development debugging
 */

interface PremiumLogData {
  userId?: string
  feature?: string
  hasAccess?: boolean
  subscriptionStatus?: string
  timestamp?: string
  action?: string
  component?: string
}

/**
 * Logs premium feature access attempts and subscription status
 * Only logs in development environment for clean production builds
 */
export function logPremium(
  message: string, 
  data?: PremiumLogData,
  level: 'info' | 'warn' | 'error' = 'info'
) {
  // Only log in development environment
  if (process.env.NODE_ENV !== 'development') {
    return
  }

  const timestamp = new Date().toISOString()
  const logData = {
    timestamp,
    message,
    ...data
  }

  // Format console output for readability
  const prefix = '🔐 [Premium Gate]'
  
  switch (level) {
    case 'error':
      console.error(`${prefix} ERROR:`, message, logData)
      break
    case 'warn':
      console.warn(`${prefix} WARNING:`, message, logData)
      break
    case 'info':
    default:
      console.log(`${prefix}`, message, logData)
      break
  }
}

/**
 * Logs premium feature access granted
 */
export function logPremiumAccess(feature: string, userId?: string) {
  logPremium('Premium access granted', {
    feature,
    userId,
    hasAccess: true,
    action: 'access_granted'
  })
}

/**
 * Logs premium feature access denied
 */
export function logPremiumDenied(feature: string, reason: string, userId?: string) {
  logPremium(`Premium access denied: ${reason}`, {
    feature,
    userId,
    hasAccess: false,
    action: 'access_denied'
  }, 'warn')
}

/**
 * Logs subscription status checks
 */
export function logSubscriptionCheck(status: string, userId?: string) {
  logPremium('Subscription status check', {
    userId,
    subscriptionStatus: status,
    action: 'subscription_check'
  })
}

/**
 * Logs premium component rendering
 */
export function logPremiumComponent(component: string, hasAccess: boolean) {
  logPremium('Premium component render', {
    component,
    hasAccess,
    action: 'component_render'
  })
}

/**
 * General debug logger for development
 */
export function debugLog(message: string, data?: any) {
  if (process.env.NODE_ENV === 'development') {
    console.log('🐛 [Debug]', message, data)
  }
}

/**
 * Performance logging for development
 */
export function logPerformance(operation: string, startTime: number) {
  if (process.env.NODE_ENV === 'development') {
    const duration = performance.now() - startTime
    console.log(`⚡ [Performance] ${operation}: ${duration.toFixed(2)}ms`)
  }
}
