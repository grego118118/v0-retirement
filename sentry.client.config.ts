/**
 * Sentry Client-Side Configuration
 * Error monitoring and performance tracking for the browser
 */

import * as Sentry from '@sentry/nextjs'

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN
const SENTRY_ENVIRONMENT = process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || process.env.NODE_ENV
const SENTRY_RELEASE = process.env.NEXT_PUBLIC_SENTRY_RELEASE

Sentry.init({
  dsn: SENTRY_DSN,
  environment: SENTRY_ENVIRONMENT,
  release: SENTRY_RELEASE,
  
  // Performance monitoring
  tracesSampleRate: SENTRY_ENVIRONMENT === 'production' ? 0.1 : 1.0,
  
  // Session replay
  replaysSessionSampleRate: SENTRY_ENVIRONMENT === 'production' ? 0.01 : 0.1,
  replaysOnErrorSampleRate: 1.0,
  
  // Error filtering for client-side
  beforeSend(event, hint) {
    const error = hint.originalException
    
    if (error instanceof Error) {
      // Filter out common browser errors that aren't actionable
      if (error.message.includes('Script error') ||
          error.message.includes('Non-Error promise rejection captured') ||
          error.message.includes('ResizeObserver loop limit exceeded')) {
        return null
      }
      
      // Filter out network errors (these are often user connectivity issues)
      if (error.message.includes('Failed to fetch') ||
          error.message.includes('NetworkError') ||
          error.message.includes('Load failed')) {
        return null
      }
      
      // Filter out extension-related errors
      if (error.stack?.includes('extension://') ||
          error.stack?.includes('moz-extension://')) {
        return null
      }
    }
    
    return event
  },
  
  // Integrations
  integrations: [
    new Sentry.Integrations.Breadcrumbs({
      console: SENTRY_ENVIRONMENT !== 'production',
      dom: true,
      fetch: true,
      history: true,
      sentry: true,
      xhr: true,
    }),
    new Sentry.Integrations.GlobalHandlers({
      onerror: true,
      onunhandledrejection: true,
    }),
    new Sentry.Integrations.HttpContext(),
  ],
  
  // Debug mode for development
  debug: SENTRY_ENVIRONMENT === 'development',
  
  // Additional client options
  autoSessionTracking: true,
  
  // Additional client-specific configuration
  beforeBreadcrumb(breadcrumb) {
    // Filter out noisy breadcrumbs
    if (breadcrumb.category === 'console' && breadcrumb.level === 'log') {
      return null
    }
    
    if (breadcrumb.category === 'xhr' && breadcrumb.data?.url?.includes('/api/health')) {
      return null
    }
    
    return breadcrumb
  },
  
  // Additional configuration
  maxBreadcrumbs: 50,
  
  // Normalize URLs for better grouping
  normalizeDepth: 6,
})
