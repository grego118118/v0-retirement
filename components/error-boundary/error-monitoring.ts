/**
 * Error Monitoring Utilities
 * Massachusetts Retirement System - Error Tracking and Monitoring
 * 
 * Comprehensive error monitoring system with performance tracking,
 * user context, and automated alerting capabilities.
 */

// Fallback functions for when Sentry is not available
const fallbackReportError = (error: Error, context?: Record<string, any>) => {
  console.error('Error:', error, context)
}

const fallbackReportWarning = (message: string, context?: Record<string, any>) => {
  console.warn('Warning:', message, context)
}

const fallbackReportInfo = (message: string, context?: Record<string, any>) => {
  console.info('Info:', message, context)
}

const fallbackAddBreadcrumb = (message: string, category: string, level: string = 'info') => {
  console.log(`[${level.toUpperCase()}] ${category}: ${message}`)
}

const fallbackSetUserContext = (user: any) => {
  console.log('User context:', user)
}

const fallbackSetRetirementContext = (context: any) => {
  console.log('Retirement context:', context)
}

const fallbackMonitorPerformance = async <T>(
  operation: () => Promise<T>,
  operationName: string,
  category: string = 'custom'
): Promise<T> => {
  const startTime = Date.now()
  try {
    const result = await operation()
    const duration = Date.now() - startTime
    console.log(`Performance: ${operationName} completed in ${duration}ms`)
    return result
  } catch (error) {
    const duration = Date.now() - startTime
    console.error(`Performance: ${operationName} failed after ${duration}ms`, error)
    throw error
  }
}

// Try to import Sentry functions, fall back to console logging
let reportError = fallbackReportError
let reportWarning = fallbackReportWarning
let reportInfo = fallbackReportInfo
let addBreadcrumb = fallbackAddBreadcrumb
let setUserContextInternal = fallbackSetUserContext
let setRetirementContext = fallbackSetRetirementContext
let monitorPerformance = fallbackMonitorPerformance

// Attempt to load Sentry functions
if (typeof window !== 'undefined') {
  try {
    import('@/sentry.client.config').then((sentryConfig) => {
      if (sentryConfig.reportError) reportError = sentryConfig.reportError
      if (sentryConfig.reportWarning) reportWarning = sentryConfig.reportWarning
      if (sentryConfig.reportInfo) reportInfo = sentryConfig.reportInfo
      if (sentryConfig.addBreadcrumb) addBreadcrumb = sentryConfig.addBreadcrumb
      if (sentryConfig.setUserContext) setUserContextInternal = sentryConfig.setUserContext
      if (sentryConfig.setRetirementContext) setRetirementContext = sentryConfig.setRetirementContext
      if (sentryConfig.monitorPerformance) monitorPerformance = sentryConfig.monitorPerformance
    }).catch(() => {
      // Sentry not available, use fallbacks
    })
  } catch (error) {
    // Sentry not available, use fallbacks
  }
}

// Error monitoring types
export interface ErrorContext {
  userId?: string
  sessionId?: string
  feature?: string
  action?: string
  component?: string
  url?: string
  userAgent?: string
  timestamp?: string
  additionalData?: Record<string, any>
}

export interface PerformanceMetrics {
  operationName: string
  duration: number
  memoryUsage?: number
  timestamp: number
  success: boolean
  errorMessage?: string
}

export interface UserAction {
  action: string
  component: string
  timestamp: number
  data?: Record<string, any>
}

// Error monitoring class
export class ErrorMonitor {
  private static instance: ErrorMonitor
  private userActions: UserAction[] = []
  private performanceMetrics: PerformanceMetrics[] = []
  private sessionId: string
  private isInitialized = false

  private constructor() {
    this.sessionId = this.generateSessionId()
    this.initialize()
  }

  public static getInstance(): ErrorMonitor {
    if (!ErrorMonitor.instance) {
      ErrorMonitor.instance = new ErrorMonitor()
    }
    return ErrorMonitor.instance
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private setupGlobalErrorHandlers() {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      // Skip NextAuth-related promise rejections to avoid noise
      const reason = event.reason?.toString() || ''
      if (reason.includes('Failed to fetch') && (reason.includes('nextauth') || reason.includes('/api/auth/'))) {
        console.warn('NextAuth fetch error (suppressed):', event.reason)
        event.preventDefault() // Prevent the error from being logged to console
        return
      }

      reportError(new Error(event.reason), {
        category: 'unhandled_promise_rejection',
        reason: event.reason,
        sessionId: this.sessionId,
      })
    })

    // Handle global errors
    window.addEventListener('error', (event) => {
      // Skip NextAuth-related errors to avoid noise
      const message = event.message || ''
      if (message.includes('Failed to fetch') && (message.includes('nextauth') || message.includes('/api/auth/'))) {
        console.warn('NextAuth error (suppressed):', event.error)
        return
      }

      reportError(event.error || new Error(event.message), {
        category: 'global_error',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        sessionId: this.sessionId,
      })
    })

    // Handle resource loading errors
    window.addEventListener('error', (event) => {
      if (event.target !== window) {
        const target = event.target as HTMLElement
        const src = (target as any).src || (target as any).href

        // Skip NextAuth-related resource errors
        if (src && (src.includes('/api/auth/') || src.includes('nextauth'))) {
          return
        }

        reportWarning('Resource loading error', {
          tagName: target.tagName,
          src,
          sessionId: this.sessionId,
        })
      }
    }, true)
  }

  private suppressAuthErrorsInDevelopment() {
    // Override console.error to suppress NextAuth fetch errors in development
    const originalConsoleError = console.error
    console.error = (...args) => {
      const message = args.join(' ')
      if (message.includes('Failed to fetch') &&
          (message.includes('nextauth') || message.includes('/api/auth/'))) {
        // Suppress NextAuth fetch errors in development
        console.warn('NextAuth fetch error (suppressed in development):', ...args)
        return
      }
      originalConsoleError.apply(console, args)
    }

    // Override console.warn for NextAuth warnings
    const originalConsoleWarn = console.warn
    console.warn = (...args) => {
      const message = args.join(' ')
      if (message.includes('nextauth') && message.includes('fetch')) {
        // Suppress NextAuth fetch warnings in development
        return
      }
      originalConsoleWarn.apply(console, args)
    }
  }

  private initialize() {
    if (this.isInitialized || typeof window === 'undefined') {
      return
    }

    // Set up global error handlers first
    this.setupGlobalErrorHandlers()

    // Set up performance monitoring
    this.setupPerformanceMonitoring()

    // Set up user action tracking
    this.setupUserActionTracking()

    // Set up memory monitoring
    this.setupMemoryMonitoring()

    // Set up network monitoring
    this.setupNetworkMonitoring()

    this.isInitialized = true

    // Suppress auth errors in development
    if (process.env.NODE_ENV === 'development') {
      this.suppressAuthErrorsInDevelopment()
    }

    addBreadcrumb(
      'Error monitoring initialized',
      'system',
      'info'
    )
  }

  private setupPerformanceMonitoring() {
    // Monitor page load performance
    if ('performance' in window && 'getEntriesByType' in performance) {
      window.addEventListener('load', () => {
        setTimeout(() => {
          const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
          
          if (navigation) {
            const loadTime = navigation.loadEventEnd - navigation.fetchStart
            
            this.recordPerformanceMetric({
              operationName: 'page_load',
              duration: loadTime,
              timestamp: Date.now(),
              success: true,
            })

            // Report slow page loads
            if (loadTime > 3000) {
              reportWarning('Slow page load detected', {
                loadTime,
                url: window.location.href,
                sessionId: this.sessionId,
              })
            }
          }
        }, 0)
      })
    }

    // Monitor long tasks
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.duration > 50) { // Tasks longer than 50ms
              addBreadcrumb(
                `Long task detected: ${entry.duration.toFixed(2)}ms`,
                'performance',
                'warning'
              )
            }
          }
        })
        
        observer.observe({ entryTypes: ['longtask'] })
      } catch (error) {
        // PerformanceObserver not supported
      }
    }
  }

  private setupUserActionTracking() {
    // Track clicks
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement
      const component = target.closest('[data-component]')?.getAttribute('data-component') || 'unknown'
      
      this.recordUserAction({
        action: 'click',
        component,
        timestamp: Date.now(),
        data: {
          tagName: target.tagName,
          className: target.className,
          id: target.id,
        },
      })
    })

    // Track form submissions
    document.addEventListener('submit', (event) => {
      const form = event.target as HTMLFormElement
      const component = form.getAttribute('data-component') || 'form'
      
      this.recordUserAction({
        action: 'form_submit',
        component,
        timestamp: Date.now(),
        data: {
          formId: form.id,
          formName: form.name,
        },
      })
    })

    // Track navigation
    if ('navigation' in performance) {
      this.recordUserAction({
        action: 'navigation',
        component: 'router',
        timestamp: Date.now(),
        data: {
          url: window.location.href,
          referrer: document.referrer,
        },
      })
    }
  }

  private setupMemoryMonitoring() {
    if ('memory' in performance) {
      setInterval(() => {
        const memory = (performance as any).memory
        
        if (memory) {
          const memoryUsage = memory.usedJSHeapSize
          
          // Record memory usage
          this.recordPerformanceMetric({
            operationName: 'memory_usage',
            duration: 0,
            memoryUsage,
            timestamp: Date.now(),
            success: true,
          })

          // Alert on high memory usage
          if (memoryUsage > 100 * 1024 * 1024) { // 100MB
            reportWarning('High memory usage detected', {
              memoryUsage,
              memoryLimit: memory.jsHeapSizeLimit,
              sessionId: this.sessionId,
            })
          }
        }
      }, 30000) // Check every 30 seconds
    }
  }

  private setupNetworkMonitoring() {
    // Monitor fetch requests with better error handling
    const originalFetch = window.fetch

    window.fetch = async (...args) => {
      const startTime = Date.now()
      let url: string = 'unknown'

      try {
        // Safely extract URL
        if (args[0] instanceof Request) {
          url = args[0].url
        } else if (typeof args[0] === 'string') {
          url = args[0]
        }

        // Skip monitoring for NextAuth internal requests to avoid recursion
        if (url.includes('/api/auth/') || url.includes('nextauth')) {
          return originalFetch(...args)
        }

        const response = await originalFetch(...args)
        const duration = Date.now() - startTime

        // Only record metrics for non-auth requests
        this.recordPerformanceMetric({
          operationName: 'fetch_request',
          duration,
          timestamp: Date.now(),
          success: response.ok,
          errorMessage: response.ok ? undefined : `HTTP ${response.status}`,
        })

        // Report slow network requests (but not auth requests)
        if (duration > 5000 && !url.includes('/api/auth/')) {
          reportWarning('Slow network request', {
            url: url.replace(/\/api\/auth\/.*/, '/api/auth/[hidden]'), // Hide auth details
            duration,
            status: response.status,
            sessionId: this.sessionId,
          })
        }

        return response
      } catch (error) {
        const duration = Date.now() - startTime

        // Don't record auth errors to avoid noise
        if (!url.includes('/api/auth/') && !url.includes('nextauth')) {
          this.recordPerformanceMetric({
            operationName: 'fetch_request',
            duration,
            timestamp: Date.now(),
            success: false,
            errorMessage: (error as Error).message,
          })

          // Only report non-auth network errors
          reportError(error as Error, {
            context: 'network_request',
            url: url.replace(/\/api\/auth\/.*/, '/api/auth/[hidden]'), // Hide auth details
            duration,
            sessionId: this.sessionId,
          })
        }

        throw error
      }
    }
  }

  public recordUserAction(action: UserAction) {
    this.userActions.push(action)
    
    // Keep only last 50 actions
    if (this.userActions.length > 50) {
      this.userActions = this.userActions.slice(-50)
    }

    addBreadcrumb(
      `User action: ${action.action} in ${action.component}`,
      'user',
      'info'
    )
  }

  public recordPerformanceMetric(metric: PerformanceMetrics) {
    this.performanceMetrics.push(metric)
    
    // Keep only last 100 metrics
    if (this.performanceMetrics.length > 100) {
      this.performanceMetrics = this.performanceMetrics.slice(-100)
    }

    // Report performance issues
    if (metric.duration > 2000 && metric.operationName !== 'memory_usage') {
      addBreadcrumb(
        `Slow operation: ${metric.operationName} took ${metric.duration}ms`,
        'performance',
        'warning'
      )
    }
  }

  public setUserContext(user: {
    id?: string
    email?: string
    username?: string
    group?: string
    [key: string]: any
  }) {
    setUserContextInternal(user)
    
    addBreadcrumb(
      `User context set: ${user.id || user.email || 'anonymous'}`,
      'user',
      'info'
    )
  }

  public setRetirementCalculationContext(context: {
    calculationType?: 'pension' | 'social-security' | 'combined'
    userGroup?: 'GROUP_1' | 'GROUP_2' | 'GROUP_3' | 'GROUP_4'
    retirementAge?: number
    yearsOfService?: number
  }) {
    setRetirementContext(context)
    
    addBreadcrumb(
      `Retirement context set: ${context.calculationType} for ${context.userGroup}`,
      'calculation',
      'info'
    )
  }

  public reportCalculationError(error: Error, calculationData: Record<string, any>) {
    reportError(error, {
      category: 'calculation',
      calculationData,
      userActions: this.getRecentUserActions(5),
      sessionId: this.sessionId,
    })
  }

  public reportChartError(error: Error, chartData: {
    chartType: string
    dataLength: number
    chartTitle?: string
  }) {
    reportError(error, {
      category: 'chart',
      chartData,
      userActions: this.getRecentUserActions(3),
      sessionId: this.sessionId,
    })
  }

  public reportPerformanceIssue(operation: string, duration: number, threshold: number = 2000) {
    if (duration > threshold) {
      reportWarning(`Performance issue: ${operation}`, {
        operation,
        duration,
        threshold,
        performanceMetrics: this.getRecentPerformanceMetrics(5),
        sessionId: this.sessionId,
      })
    }
  }

  public getRecentUserActions(count: number = 10): UserAction[] {
    return this.userActions.slice(-count)
  }

  public getRecentPerformanceMetrics(count: number = 10): PerformanceMetrics[] {
    return this.performanceMetrics.slice(-count)
  }

  public getSessionSummary() {
    return {
      sessionId: this.sessionId,
      totalActions: this.userActions.length,
      totalMetrics: this.performanceMetrics.length,
      averagePerformance: this.calculateAveragePerformance(),
      errorCount: this.performanceMetrics.filter(m => !m.success).length,
      sessionDuration: Date.now() - parseInt(this.sessionId.split('_')[1]),
    }
  }

  private calculateAveragePerformance(): number {
    const successfulMetrics = this.performanceMetrics.filter(m => m.success && m.duration > 0)
    
    if (successfulMetrics.length === 0) return 0
    
    const totalDuration = successfulMetrics.reduce((sum, metric) => sum + metric.duration, 0)
    return totalDuration / successfulMetrics.length
  }

  public async monitorAsyncOperation<T>(
    operation: () => Promise<T>,
    operationName: string,
    context?: Record<string, any>
  ): Promise<T> {
    return monitorPerformance(operation, operationName, 'async')
  }
}

// Export singleton instance
export const errorMonitor = ErrorMonitor.getInstance()

// Convenience functions
export const recordUserAction = (action: string, component: string, data?: Record<string, any>) => {
  errorMonitor.recordUserAction({
    action,
    component,
    timestamp: Date.now(),
    data,
  })
}

export const recordPerformanceMetric = (operationName: string, duration: number, success: boolean = true) => {
  errorMonitor.recordPerformanceMetric({
    operationName,
    duration,
    timestamp: Date.now(),
    success,
  })
}

export const reportCalculationError = (error: Error, calculationData: Record<string, any>) => {
  errorMonitor.reportCalculationError(error, calculationData)
}

export const reportChartError = (error: Error, chartData: { chartType: string; dataLength: number; chartTitle?: string }) => {
  errorMonitor.reportChartError(error, chartData)
}

export const setUserContextForMonitoring = (user: any) => {
  errorMonitor.setUserContext(user)
}

export const setCalculationContext = (context: any) => {
  errorMonitor.setRetirementCalculationContext(context)
}

export const monitorAsyncOperation = <T>(
  operation: () => Promise<T>,
  operationName: string,
  context?: Record<string, any>
): Promise<T> => {
  return errorMonitor.monitorAsyncOperation(operation, operationName, context)
}
