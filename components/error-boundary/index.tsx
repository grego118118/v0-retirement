/**
 * Error Boundary Components
 * Massachusetts Retirement System - Error Tracking and Monitoring
 *
 * Comprehensive error boundary system providing graceful error handling
 * for different types of components and operations.
 */

import React from 'react'

// Main error boundary components
export { ErrorBoundary } from './error-boundary'
export { AsyncErrorBoundary, useAsyncErrorHandler } from './async-error-boundary'
export { ChartErrorBoundary } from './chart-error-boundary'

// Import for internal use
import { ErrorBoundary } from './error-boundary'
import { AsyncErrorBoundary } from './async-error-boundary'
import { ChartErrorBoundary } from './chart-error-boundary'

// Error boundary wrapper components
export { default as withErrorBoundary } from './with-error-boundary'
export { default as ErrorProvider } from './error-provider'

// Error monitoring utilities
export * from './error-monitoring'

// Error boundary types
export interface ErrorBoundaryConfig {
  level: 'page' | 'component' | 'critical'
  showReportButton?: boolean
  showDetails?: boolean
  maxRetries?: number
  context?: Record<string, any>
  onError?: (error: Error, errorInfo?: any) => void
  onRetry?: () => void
}

export interface AsyncErrorConfig {
  retryDelay?: number
  maxRetries?: number
  showNetworkStatus?: boolean
  onError?: (error: Error) => void
  onRetry?: () => void
}

export interface ChartErrorConfig {
  chartTitle?: string
  fallbackHeight?: number
  showDataDownload?: boolean
  chartData?: any[]
  maxRetries?: number
  onError?: (error: Error, errorInfo?: any) => void
  onRetry?: () => void
}

// Pre-configured error boundary components for common use cases
export const PageErrorBoundary = ({ children, ...props }: any) => (
  <ErrorBoundary level="page" showReportButton={true} showDetails={false} {...props}>
    {children}
  </ErrorBoundary>
)

export const ComponentErrorBoundary = ({ children, ...props }: any) => (
  <ErrorBoundary level="component" showReportButton={false} showDetails={false} {...props}>
    {children}
  </ErrorBoundary>
)

export const CriticalErrorBoundary = ({ children, ...props }: any) => (
  <ErrorBoundary level="critical" showReportButton={true} showDetails={true} {...props}>
    {children}
  </ErrorBoundary>
)

// Error boundary factory function
export const createErrorBoundary = (config: ErrorBoundaryConfig) => {
  return ({ children }: { children: React.ReactNode }) => (
    <ErrorBoundary {...config}>
      {children}
    </ErrorBoundary>
  )
}

// Async error boundary factory
export const createAsyncErrorBoundary = (config: AsyncErrorConfig) => {
  return ({ children }: { children: React.ReactNode }) => (
    <AsyncErrorBoundary {...config}>
      {children}
    </AsyncErrorBoundary>
  )
}

// Chart error boundary factory
export const createChartErrorBoundary = (config: ChartErrorConfig) => {
  return ({ children }: { children: React.ReactNode }) => (
    <ChartErrorBoundary {...config}>
      {children}
    </ChartErrorBoundary>
  )
}

// Error boundary decorators for different contexts
export const withPageErrorBoundary = (Component: React.ComponentType) => {
  return (props: any) => (
    <PageErrorBoundary>
      <Component {...props} />
    </PageErrorBoundary>
  )
}

export const withComponentErrorBoundary = (Component: React.ComponentType) => {
  return (props: any) => (
    <ComponentErrorBoundary>
      <Component {...props} />
    </ComponentErrorBoundary>
  )
}

export const withAsyncErrorBoundary = (Component: React.ComponentType, config?: AsyncErrorConfig) => {
  return (props: any) => (
    <AsyncErrorBoundary {...config}>
      <Component {...props} />
    </AsyncErrorBoundary>
  )
}

export const withChartErrorBoundary = (Component: React.ComponentType, config?: ChartErrorConfig) => {
  return (props: any) => (
    <ChartErrorBoundary {...config}>
      <Component {...props} />
    </ChartErrorBoundary>
  )
}

// Error boundary hooks
export { useErrorHandler } from './use-error-handler'
export { useErrorReporting } from './use-error-reporting'

// Error monitoring configuration
export const ERROR_MONITORING_CONFIG = {
  // Error levels
  levels: {
    CRITICAL: 'critical',
    ERROR: 'error',
    WARNING: 'warning',
    INFO: 'info',
  },
  
  // Error categories
  categories: {
    AUTHENTICATION: 'authentication',
    CALCULATION: 'calculation',
    CHART: 'chart',
    DATABASE: 'database',
    NETWORK: 'network',
    PERFORMANCE: 'performance',
    UI: 'ui',
    VALIDATION: 'validation',
  },
  
  // Performance thresholds
  thresholds: {
    SLOW_OPERATION: 2000, // 2 seconds
    VERY_SLOW_OPERATION: 5000, // 5 seconds
    MEMORY_WARNING: 50 * 1024 * 1024, // 50MB
    MEMORY_CRITICAL: 100 * 1024 * 1024, // 100MB
  },
  
  // Retry configurations
  retry: {
    DEFAULT_MAX_RETRIES: 3,
    DEFAULT_RETRY_DELAY: 1000,
    EXPONENTIAL_BACKOFF: true,
    MAX_RETRY_DELAY: 10000,
  },
  
  // Reporting configurations
  reporting: {
    AUTO_REPORT_CRITICAL: true,
    AUTO_REPORT_ERRORS: true,
    INCLUDE_USER_CONTEXT: true,
    INCLUDE_PERFORMANCE_DATA: true,
    SAMPLE_RATE_PRODUCTION: 0.1,
    SAMPLE_RATE_DEVELOPMENT: 1.0,
  },
} as const

// Error boundary middleware for Next.js
export const errorBoundaryMiddleware = (req: any, res: any, next: any) => {
  try {
    return next()
  } catch (error) {
    // Handle middleware errors
    console.error('Middleware error:', error)
    
    // Report to Sentry
    if (typeof window === 'undefined') {
      // Server-side
      const { reportServerError } = require('@/sentry.server.config')
      reportServerError(error as Error, {
        middleware: true,
        url: req.url,
        method: req.method,
      })
    }
    
    throw error
  }
}

// Global error handler setup
export const setupGlobalErrorHandling = () => {
  // Handle unhandled promise rejections
  if (typeof window !== 'undefined') {
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason)
      
      const { reportError } = require('@/sentry.client.config')
      const error = event.reason instanceof Error 
        ? event.reason 
        : new Error(String(event.reason))
      
      reportError(error, {
        type: 'unhandledrejection',
        url: window.location.href,
      })
    })

    // Handle global errors
    window.addEventListener('error', (event) => {
      console.error('Global error:', event.error)
      
      const { reportError } = require('@/sentry.client.config')
      reportError(event.error, {
        type: 'global',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        url: window.location.href,
      })
    })
  }
}

// Error boundary testing utilities (development only)
export const ErrorBoundaryTester = process.env.NODE_ENV === 'development' ? {
  throwError: (message: string = 'Test error') => {
    throw new Error(message)
  },
  
  throwAsyncError: async (message: string = 'Test async error') => {
    await new Promise(resolve => setTimeout(resolve, 100))
    throw new Error(message)
  },
  
  throwChartError: (message: string = 'Test chart error') => {
    const error = new Error(message)
    error.name = 'ChartRenderError'
    throw error
  },
  
  simulateNetworkError: () => {
    const error = new Error('Network request failed')
    error.name = 'NetworkError'
    throw error
  },
  
  simulateTimeoutError: () => {
    const error = new Error('Operation timed out')
    error.name = 'TimeoutError'
    throw error
  },
} : undefined
