/**
 * Performance Monitoring Utility
 * Ensures all calculations meet sub-2-second performance requirements
 */

export interface PerformanceMetrics {
  operationName: string
  startTime: number
  endTime: number
  duration: number
  memoryUsage?: number
  success: boolean
  error?: string
}

export interface PerformanceThresholds {
  warning: number // milliseconds
  critical: number // milliseconds
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = []
  private thresholds: PerformanceThresholds = {
    warning: 1000, // 1 second
    critical: 2000 // 2 seconds
  }

  /**
   * Start monitoring a performance-critical operation
   */
  startOperation(operationName: string): PerformanceTracker {
    return new PerformanceTracker(operationName, this)
  }

  /**
   * Record performance metrics
   */
  recordMetrics(metrics: PerformanceMetrics): void {
    this.metrics.push(metrics)
    
    // Log performance warnings/errors
    if (metrics.duration > this.thresholds.critical) {
      console.error(`🚨 CRITICAL: ${metrics.operationName} took ${metrics.duration}ms (>${this.thresholds.critical}ms)`)
    } else if (metrics.duration > this.thresholds.warning) {
      console.warn(`⚠️ WARNING: ${metrics.operationName} took ${metrics.duration}ms (>${this.thresholds.warning}ms)`)
    }

    // Keep only last 100 metrics to prevent memory leaks
    if (this.metrics.length > 100) {
      this.metrics = this.metrics.slice(-100)
    }
  }

  /**
   * Get performance statistics for an operation
   */
  getOperationStats(operationName: string) {
    const operationMetrics = this.metrics.filter(m => m.operationName === operationName)
    
    if (operationMetrics.length === 0) {
      return null
    }

    const durations = operationMetrics.map(m => m.duration)
    const successfulOperations = operationMetrics.filter(m => m.success)
    
    return {
      totalOperations: operationMetrics.length,
      successfulOperations: successfulOperations.length,
      successRate: (successfulOperations.length / operationMetrics.length) * 100,
      averageDuration: durations.reduce((sum, d) => sum + d, 0) / durations.length,
      minDuration: Math.min(...durations),
      maxDuration: Math.max(...durations),
      medianDuration: this.calculateMedian(durations),
      p95Duration: this.calculatePercentile(durations, 95),
      p99Duration: this.calculatePercentile(durations, 99),
      warningCount: operationMetrics.filter(m => m.duration > this.thresholds.warning).length,
      criticalCount: operationMetrics.filter(m => m.duration > this.thresholds.critical).length
    }
  }

  /**
   * Get overall performance summary
   */
  getPerformanceSummary() {
    const operationNames = [...new Set(this.metrics.map(m => m.operationName))]
    const summary = operationNames.map(name => ({
      operation: name,
      stats: this.getOperationStats(name)
    }))

    const allDurations = this.metrics.map(m => m.duration)
    const totalWarnings = this.metrics.filter(m => m.duration > this.thresholds.warning).length
    const totalCritical = this.metrics.filter(m => m.duration > this.thresholds.critical).length

    return {
      totalOperations: this.metrics.length,
      averageDuration: allDurations.length > 0 ? allDurations.reduce((sum, d) => sum + d, 0) / allDurations.length : 0,
      warningCount: totalWarnings,
      criticalCount: totalCritical,
      operationSummary: summary,
      performanceScore: this.calculatePerformanceScore()
    }
  }

  /**
   * Calculate performance score (0-100)
   */
  private calculatePerformanceScore(): number {
    if (this.metrics.length === 0) return 100

    const totalOperations = this.metrics.length
    const warningCount = this.metrics.filter(m => m.duration > this.thresholds.warning).length
    const criticalCount = this.metrics.filter(m => m.duration > this.thresholds.critical).length
    const errorCount = this.metrics.filter(m => !m.success).length

    // Deduct points for performance issues
    let score = 100
    score -= (warningCount / totalOperations) * 20 // -20 points for warnings
    score -= (criticalCount / totalOperations) * 40 // -40 points for critical
    score -= (errorCount / totalOperations) * 30 // -30 points for errors

    return Math.max(0, Math.round(score))
  }

  /**
   * Calculate median of an array
   */
  private calculateMedian(values: number[]): number {
    const sorted = [...values].sort((a, b) => a - b)
    const mid = Math.floor(sorted.length / 2)
    return sorted.length % 2 === 0 
      ? (sorted[mid - 1] + sorted[mid]) / 2 
      : sorted[mid]
  }

  /**
   * Calculate percentile of an array
   */
  private calculatePercentile(values: number[], percentile: number): number {
    const sorted = [...values].sort((a, b) => a - b)
    const index = Math.ceil((percentile / 100) * sorted.length) - 1
    return sorted[Math.max(0, index)]
  }

  /**
   * Clear all metrics
   */
  clearMetrics(): void {
    this.metrics = []
  }

  /**
   * Set custom thresholds
   */
  setThresholds(thresholds: Partial<PerformanceThresholds>): void {
    this.thresholds = { ...this.thresholds, ...thresholds }
  }
}

class PerformanceTracker {
  private startTime: number
  private startMemory?: number

  constructor(
    private operationName: string,
    private monitor: PerformanceMonitor
  ) {
    this.startTime = performance.now()
    
    // Track memory usage if available
    if (typeof window !== 'undefined' && 'memory' in performance) {
      this.startMemory = (performance as any).memory.usedJSHeapSize
    }
  }

  /**
   * End the operation and record metrics
   */
  end(success: boolean = true, error?: string): PerformanceMetrics {
    const endTime = performance.now()
    const duration = endTime - this.startTime

    let memoryUsage: number | undefined
    if (this.startMemory && typeof window !== 'undefined' && 'memory' in performance) {
      const endMemory = (performance as any).memory.usedJSHeapSize
      memoryUsage = endMemory - this.startMemory
    }

    const metrics: PerformanceMetrics = {
      operationName: this.operationName,
      startTime: this.startTime,
      endTime,
      duration,
      memoryUsage,
      success,
      error
    }

    this.monitor.recordMetrics(metrics)
    return metrics
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor()

/**
 * Decorator for monitoring function performance
 */
export function monitorPerformance(operationName?: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value
    const name = operationName || `${target.constructor.name}.${propertyKey}`

    descriptor.value = async function (...args: any[]) {
      const tracker = performanceMonitor.startOperation(name)
      
      try {
        const result = await originalMethod.apply(this, args)
        tracker.end(true)
        return result
      } catch (error) {
        tracker.end(false, error instanceof Error ? error.message : 'Unknown error')
        throw error
      }
    }

    return descriptor
  }
}

/**
 * Higher-order function for monitoring async operations
 */
export function withPerformanceMonitoring<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  operationName: string
): T {
  return (async (...args: any[]) => {
    const tracker = performanceMonitor.startOperation(operationName)
    
    try {
      const result = await fn(...args)
      tracker.end(true)
      return result
    } catch (error) {
      tracker.end(false, error instanceof Error ? error.message : 'Unknown error')
      throw error
    }
  }) as T
}

/**
 * Utility for monitoring synchronous operations
 */
export function measureSync<T>(operationName: string, fn: () => T): T {
  const tracker = performanceMonitor.startOperation(operationName)
  
  try {
    const result = fn()
    tracker.end(true)
    return result
  } catch (error) {
    tracker.end(false, error instanceof Error ? error.message : 'Unknown error')
    throw error
  }
}

/**
 * Utility for monitoring async operations
 */
export async function measureAsync<T>(operationName: string, fn: () => Promise<T>): Promise<T> {
  const tracker = performanceMonitor.startOperation(operationName)
  
  try {
    const result = await fn()
    tracker.end(true)
    return result
  } catch (error) {
    tracker.end(false, error instanceof Error ? error.message : 'Unknown error')
    throw error
  }
}

/**
 * Performance assertion - throws if operation exceeds threshold
 */
export function assertPerformance(metrics: PerformanceMetrics, maxDuration: number = 2000): void {
  if (metrics.duration > maxDuration) {
    throw new Error(
      `Performance assertion failed: ${metrics.operationName} took ${metrics.duration}ms (max: ${maxDuration}ms)`
    )
  }
}

/**
 * Get performance report for debugging
 */
export function getPerformanceReport(): string {
  const summary = performanceMonitor.getPerformanceSummary()
  
  let report = `Performance Report\n`
  report += `==================\n`
  report += `Total Operations: ${summary.totalOperations}\n`
  report += `Average Duration: ${summary.averageDuration.toFixed(2)}ms\n`
  report += `Performance Score: ${summary.performanceScore}/100\n`
  report += `Warnings: ${summary.warningCount}\n`
  report += `Critical Issues: ${summary.criticalCount}\n\n`
  
  report += `Operation Details:\n`
  summary.operationSummary.forEach(({ operation, stats }) => {
    if (stats) {
      report += `  ${operation}:\n`
      report += `    Avg: ${stats.averageDuration.toFixed(2)}ms\n`
      report += `    P95: ${stats.p95Duration.toFixed(2)}ms\n`
      report += `    Success Rate: ${stats.successRate.toFixed(1)}%\n`
      report += `    Warnings: ${stats.warningCount}\n`
      report += `    Critical: ${stats.criticalCount}\n\n`
    }
  })
  
  return report
}
