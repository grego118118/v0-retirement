/**
 * Sentry Server-Side Configuration
 * Error monitoring and performance tracking for the server
 */

import * as Sentry from '@sentry/nextjs'

const SENTRY_DSN = process.env.SENTRY_DSN
const SENTRY_ENVIRONMENT = process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV
const SENTRY_RELEASE = process.env.SENTRY_RELEASE

Sentry.init({
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
  
  // Integrations
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
    new Sentry.Integrations.OnUncaughtException(),
    new Sentry.Integrations.OnUnhandledRejection(),
    new Sentry.Integrations.Console(),
    new Sentry.Integrations.Modules(),
    new Sentry.Integrations.Context({
      app: true,
      device: true,
      os: true,
    }),
  ],
  
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
  
  // Transport options for server
  transport: Sentry.makeNodeTransport,
  
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
