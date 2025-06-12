/**
 * Massachusetts Retirement System - Production Monitoring
 * 
 * Comprehensive monitoring, logging, and observability for production operations.
 * Integrates with Sentry, custom metrics, and performance tracking.
 */

import * as Sentry from '@sentry/nextjs'
import { performanceMonitor } from '@/lib/utils/performance-monitor'

// Monitoring configuration
export const MONITORING_CONFIG = {
  // Performance thresholds (milliseconds)
  thresholds: {
    pageLoad: 2000,      // Sub-2-second requirement
    apiResponse: 1500,   // API response time
    databaseQuery: 1000, // Database query time
    calculation: 500,    // Calculation operations
    cacheOperation: 100  // Cache operations
  },
  
  // Alert thresholds
  alerts: {
    errorRate: 0.05,        // 5% error rate
    responseTime: 2000,     // 2 second response time
    memoryUsage: 0.85,      // 85% memory usage
    cpuUsage: 0.80,         // 80% CPU usage
    diskUsage: 0.90         // 90% disk usage
  },
  
  // Sampling rates
  sampling: {
    performance: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    errors: 1.0,
    traces: process.env.NODE_ENV === 'production' ? 0.1 : 1.0
  }
}

/**
 * Enhanced error tracking with context
 */
export class ErrorTracker {
  /**
   * Report application error with context
   */
  static reportError(error: Error, context: {
    userId?: string
    operation?: string
    component?: string
    additionalData?: any
  }) {
    const errorContext = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      ...context
    }
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Application Error:', {
        error: error.message,
        stack: error.stack,
        context: errorContext
      })
    }
    
    // Report to Sentry
    Sentry.withScope((scope) => {
      scope.setTag('component', context.component || 'unknown')
      scope.setTag('operation', context.operation || 'unknown')
      
      if (context.userId) {
        scope.setUser({ id: context.userId })
      }
      
      if (context.additionalData) {
        scope.setContext('additional', context.additionalData)
      }
      
      Sentry.captureException(error)
    })
  }
  
  /**
   * Report performance issue
   */
  static reportPerformanceIssue(operation: string, duration: number, threshold: number, context?: any) {
    const issue = {
      type: 'performance',
      operation,
      duration,
      threshold,
      exceedBy: duration - threshold,
      timestamp: new Date().toISOString(),
      context
    }
    
    // Log performance issue
    console.warn('Performance Issue:', issue)
    
    // Report to Sentry as a message
    Sentry.addBreadcrumb({
      message: `Performance threshold exceeded: ${operation}`,
      level: 'warning',
      data: issue
    })
    
    Sentry.captureMessage(`Performance threshold exceeded: ${operation}`, 'warning')
  }
  
  /**
   * Report security event
   */
  static reportSecurityEvent(event: {
    type: string
    severity: 'low' | 'medium' | 'high' | 'critical'
    details: any
    ip?: string
    userAgent?: string
  }) {
    const securityEvent = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      ...event
    }
    
    // Log security event
    console.warn('Security Event:', securityEvent)
    
    // Report to Sentry with appropriate level
    const sentryLevel = event.severity === 'critical' ? 'fatal' : 
                       event.severity === 'high' ? 'error' :
                       event.severity === 'medium' ? 'warning' : 'info'
    
    Sentry.withScope((scope) => {
      scope.setTag('security_event', event.type)
      scope.setTag('severity', event.severity)
      scope.setLevel(sentryLevel)
      
      if (event.ip) scope.setTag('ip', event.ip)
      if (event.userAgent) scope.setTag('user_agent', event.userAgent)
      
      scope.setContext('security_details', event.details)
      
      Sentry.captureMessage(`Security Event: ${event.type}`, sentryLevel)
    })
  }
}

/**
 * Performance metrics collector
 */
export class MetricsCollector {
  private static metrics: Map<string, any[]> = new Map()
  
  /**
   * Record performance metric
   */
  static recordMetric(name: string, value: number, tags?: Record<string, string>) {
    const metric = {
      name,
      value,
      timestamp: Date.now(),
      tags: tags || {}
    }
    
    if (!this.metrics.has(name)) {
      this.metrics.set(name, [])
    }
    
    const metrics = this.metrics.get(name)!
    metrics.push(metric)
    
    // Keep only last 1000 metrics per type
    if (metrics.length > 1000) {
      metrics.shift()
    }
    
    // Check thresholds
    this.checkThresholds(name, value, tags)
  }
  
  /**
   * Get metric statistics
   */
  static getMetricStats(name: string, timeWindow: number = 300000): {
    count: number
    average: number
    min: number
    max: number
    p95: number
    p99: number
  } {
    const metrics = this.metrics.get(name) || []
    const cutoff = Date.now() - timeWindow
    const recentMetrics = metrics.filter(m => m.timestamp > cutoff)
    
    if (recentMetrics.length === 0) {
      return { count: 0, average: 0, min: 0, max: 0, p95: 0, p99: 0 }
    }
    
    const values = recentMetrics.map(m => m.value).sort((a, b) => a - b)
    const count = values.length
    const sum = values.reduce((a, b) => a + b, 0)
    
    return {
      count,
      average: sum / count,
      min: values[0],
      max: values[count - 1],
      p95: values[Math.floor(count * 0.95)],
      p99: values[Math.floor(count * 0.99)]
    }
  }
  
  /**
   * Check performance thresholds
   */
  private static checkThresholds(name: string, value: number, tags?: Record<string, string>) {
    const thresholds = MONITORING_CONFIG.thresholds
    let threshold: number | undefined
    
    // Determine threshold based on metric name
    if (name.includes('page_load')) threshold = thresholds.pageLoad
    else if (name.includes('api_response')) threshold = thresholds.apiResponse
    else if (name.includes('database')) threshold = thresholds.databaseQuery
    else if (name.includes('calculation')) threshold = thresholds.calculation
    else if (name.includes('cache')) threshold = thresholds.cacheOperation
    
    if (threshold && value > threshold) {
      ErrorTracker.reportPerformanceIssue(name, value, threshold, tags)
    }
  }
  
  /**
   * Export metrics for external monitoring
   */
  static exportMetrics(): Record<string, any> {
    const exported: Record<string, any> = {}
    
    for (const [name, metrics] of this.metrics.entries()) {
      exported[name] = this.getMetricStats(name)
    }
    
    return exported
  }
}

/**
 * Application health monitor
 */
export class HealthMonitor {
  /**
   * Perform comprehensive health check
   */
  static async performHealthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy'
    checks: Record<string, any>
    timestamp: string
  }> {
    const checks: Record<string, any> = {}
    let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy'
    
    try {
      // Database health check
      checks.database = await this.checkDatabase()
      if (checks.database.status !== 'healthy') {
        overallStatus = 'unhealthy'
      }
      
      // Memory usage check
      checks.memory = await this.checkMemoryUsage()
      if (checks.memory.status === 'critical') {
        overallStatus = 'unhealthy'
      } else if (checks.memory.status === 'warning') {
        overallStatus = 'degraded'
      }
      
      // Performance metrics check
      checks.performance = await this.checkPerformanceMetrics()
      if (checks.performance.status !== 'healthy') {
        overallStatus = 'degraded'
      }
      
      // External services check
      checks.externalServices = await this.checkExternalServices()
      if (checks.externalServices.status !== 'healthy') {
        overallStatus = 'degraded'
      }
      
    } catch (error) {
      overallStatus = 'unhealthy'
      checks.error = {
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }
    }
    
    return {
      status: overallStatus,
      checks,
      timestamp: new Date().toISOString()
    }
  }
  
  /**
   * Check database connectivity and performance
   */
  private static async checkDatabase(): Promise<any> {
    try {
      const startTime = Date.now()
      
      // Import here to avoid circular dependencies
      const { performDatabaseHealthCheck } = await import('@/lib/performance/query-optimizer')
      const result = await performDatabaseHealthCheck()
      
      const responseTime = Date.now() - startTime
      
      return {
        status: result.status === 'healthy' ? 'healthy' : 'unhealthy',
        responseTime,
        details: result
      }
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
  
  /**
   * Check memory usage
   */
  private static async checkMemoryUsage(): Promise<any> {
    try {
      const usage = process.memoryUsage()
      const totalMemory = usage.heapTotal
      const usedMemory = usage.heapUsed
      const memoryUsagePercent = usedMemory / totalMemory
      
      let status = 'healthy'
      if (memoryUsagePercent > 0.9) status = 'critical'
      else if (memoryUsagePercent > 0.8) status = 'warning'
      
      return {
        status,
        usagePercent: Math.round(memoryUsagePercent * 100),
        heapUsed: Math.round(usedMemory / 1024 / 1024), // MB
        heapTotal: Math.round(totalMemory / 1024 / 1024), // MB
        external: Math.round(usage.external / 1024 / 1024) // MB
      }
    } catch (error) {
      return {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
  
  /**
   * Check performance metrics
   */
  private static async checkPerformanceMetrics(): Promise<any> {
    try {
      const pageLoadStats = MetricsCollector.getMetricStats('page_load_time')
      const apiResponseStats = MetricsCollector.getMetricStats('api_response_time')
      
      let status = 'healthy'
      
      if (pageLoadStats.p95 > MONITORING_CONFIG.thresholds.pageLoad ||
          apiResponseStats.p95 > MONITORING_CONFIG.thresholds.apiResponse) {
        status = 'degraded'
      }
      
      return {
        status,
        pageLoad: {
          p95: pageLoadStats.p95,
          average: pageLoadStats.average,
          count: pageLoadStats.count
        },
        apiResponse: {
          p95: apiResponseStats.p95,
          average: apiResponseStats.average,
          count: apiResponseStats.count
        }
      }
    } catch (error) {
      return {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
  
  /**
   * Check external services
   */
  private static async checkExternalServices(): Promise<any> {
    try {
      const checks = {
        sentry: process.env.SENTRY_DSN ? 'configured' : 'not_configured',
        redis: process.env.REDIS_URL ? 'configured' : 'not_configured',
        oauth: {
          google: process.env.GOOGLE_CLIENT_ID ? 'configured' : 'not_configured'
        }
      }
      
      const configuredServices = Object.values(checks).filter(status => 
        status === 'configured' || (typeof status === 'object' && 
        Object.values(status).some(s => s === 'configured'))
      ).length
      
      return {
        status: configuredServices > 0 ? 'healthy' : 'degraded',
        services: checks
      }
    } catch (error) {
      return {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
}

/**
 * User activity tracker
 */
export class ActivityTracker {
  /**
   * Track user action
   */
  static trackUserAction(action: string, userId: string, details?: any) {
    const activity = {
      action,
      userId,
      timestamp: new Date().toISOString(),
      details: details || {},
      environment: process.env.NODE_ENV
    }
    
    // Log activity (in production, send to analytics service)
    if (process.env.NODE_ENV === 'development') {
      console.log('User Activity:', activity)
    }
    
    // Add breadcrumb to Sentry for debugging
    Sentry.addBreadcrumb({
      message: `User action: ${action}`,
      level: 'info',
      data: { userId, details }
    })
    
    // Record performance metric
    MetricsCollector.recordMetric('user_action', 1, { action })
  }
  
  /**
   * Track page view
   */
  static trackPageView(page: string, userId?: string, loadTime?: number) {
    const pageView = {
      page,
      userId,
      loadTime,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV
    }
    
    // Log page view
    if (process.env.NODE_ENV === 'development') {
      console.log('Page View:', pageView)
    }
    
    // Record performance metrics
    if (loadTime) {
      MetricsCollector.recordMetric('page_load_time', loadTime, { page })
    }
    
    MetricsCollector.recordMetric('page_view', 1, { page })
  }
  
  /**
   * Track calculation performance
   */
  static trackCalculation(type: string, duration: number, success: boolean, userId?: string) {
    const calculation = {
      type,
      duration,
      success,
      userId,
      timestamp: new Date().toISOString()
    }
    
    // Record metrics
    MetricsCollector.recordMetric('calculation_time', duration, { type, success: success.toString() })
    MetricsCollector.recordMetric('calculation_count', 1, { type, success: success.toString() })
    
    // Log calculation
    if (process.env.NODE_ENV === 'development') {
      console.log('Calculation:', calculation)
    }
  }
}

/**
 * Initialize monitoring system
 */
export function initializeMonitoring() {
  // Set up global error handlers
  if (typeof window !== 'undefined') {
    window.addEventListener('error', (event) => {
      ErrorTracker.reportError(event.error, {
        component: 'global',
        operation: 'window_error',
        additionalData: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno
        }
      })
    })
    
    window.addEventListener('unhandledrejection', (event) => {
      ErrorTracker.reportError(new Error(event.reason), {
        component: 'global',
        operation: 'unhandled_promise_rejection'
      })
    })
  }
  
  // Set up performance monitoring
  performanceMonitor.onThresholdExceeded((operation, duration, threshold) => {
    ErrorTracker.reportPerformanceIssue(operation, duration, threshold)
  })
  
  console.log('Production monitoring initialized')
}
