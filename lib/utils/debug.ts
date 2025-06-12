/**
 * Centralized Debug Logging Utility
 * Provides environment-aware logging with performance optimization
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface DebugConfig {
  enabled: boolean
  level: LogLevel
  components: {
    subscription: boolean
    pension: boolean
    premium: boolean
    api: boolean
    general: boolean
  }
}

class DebugLogger {
  private config: DebugConfig
  private lastLogs: Map<string, number> = new Map()
  private readonly THROTTLE_MS = 1000 // Throttle identical logs for 1 second

  constructor() {
    this.config = {
      enabled: process.env.NODE_ENV === 'development',
      level: (process.env.NEXT_PUBLIC_DEBUG_LEVEL as LogLevel) || 'info',
      components: {
        subscription: process.env.NEXT_PUBLIC_DEBUG_SUBSCRIPTION === 'true',
        pension: process.env.NEXT_PUBLIC_DEBUG_PENSION === 'true',
        premium: process.env.NEXT_PUBLIC_DEBUG_PREMIUM === 'true',
        api: process.env.NEXT_PUBLIC_DEBUG_API === 'true',
        general: process.env.NEXT_PUBLIC_DEBUG_GENERAL === 'true'
      }
    }
  }

  private shouldLog(component: keyof DebugConfig['components'], level: LogLevel): boolean {
    if (!this.config.enabled) return false
    if (!this.config.components[component]) return false
    
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error']
    const currentLevelIndex = levels.indexOf(this.config.level)
    const messageLevelIndex = levels.indexOf(level)
    
    return messageLevelIndex >= currentLevelIndex
  }

  private throttleLog(key: string): boolean {
    const now = Date.now()
    const lastTime = this.lastLogs.get(key)
    
    if (lastTime && (now - lastTime) < this.THROTTLE_MS) {
      return false // Throttled
    }
    
    this.lastLogs.set(key, now)
    return true
  }

  private formatMessage(component: string, message: string, data?: any): string {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0]
    const prefix = `[${timestamp}] [${component.toUpperCase()}]`
    
    if (data) {
      return `${prefix} ${message} ${JSON.stringify(data, null, 2)}`
    }
    return `${prefix} ${message}`
  }

  subscription(message: string, data?: any, level: LogLevel = 'debug'): void {
    if (!this.shouldLog('subscription', level)) return
    
    const key = `subscription:${message}`
    if (!this.throttleLog(key)) return
    
    const formatted = this.formatMessage('subscription', message, data)
    console[level](formatted)
  }

  pension(message: string, data?: any, level: LogLevel = 'debug'): void {
    if (!this.shouldLog('pension', level)) return
    
    const key = `pension:${message}`
    if (!this.throttleLog(key)) return
    
    const formatted = this.formatMessage('pension', message, data)
    console[level](formatted)
  }

  premium(message: string, data?: any, level: LogLevel = 'debug'): void {
    if (!this.shouldLog('premium', level)) return
    
    const key = `premium:${message}`
    if (!this.throttleLog(key)) return
    
    const formatted = this.formatMessage('premium', message, data)
    console[level](formatted)
  }

  api(message: string, data?: any, level: LogLevel = 'info'): void {
    if (!this.shouldLog('api', level)) return
    
    const key = `api:${message}`
    if (!this.throttleLog(key)) return
    
    const formatted = this.formatMessage('api', message, data)
    console[level](formatted)
  }

  general(message: string, data?: any, level: LogLevel = 'info'): void {
    if (!this.shouldLog('general', level)) return
    
    const formatted = this.formatMessage('general', message, data)
    console[level](formatted)
  }

  // State change logging with comparison
  stateChange(component: string, oldState: any, newState: any, level: LogLevel = 'debug'): void {
    if (!this.shouldLog(component as keyof DebugConfig['components'], level)) return
    
    // Only log if state actually changed
    if (JSON.stringify(oldState) === JSON.stringify(newState)) return
    
    const key = `${component}:state-change`
    if (!this.throttleLog(key)) return
    
    const formatted = this.formatMessage(component, 'State changed', {
      from: oldState,
      to: newState
    })
    console[level](formatted)
  }

  // Performance logging
  performance(component: string, operation: string, duration: number): void {
    if (!this.shouldLog(component as keyof DebugConfig['components'], 'info')) return
    
    const formatted = this.formatMessage(component, `Performance: ${operation}`, {
      duration: `${duration}ms`,
      slow: duration > 100 ? 'WARNING: Slow operation' : undefined
    })
    
    if (duration > 100) {
      console.warn(formatted)
    } else {
      console.info(formatted)
    }
  }

  // Error logging (always enabled)
  error(component: string, message: string, error?: any): void {
    const formatted = this.formatMessage(component, `ERROR: ${message}`, error)
    console.error(formatted)
  }

  // Clean up old throttle entries periodically
  cleanup(): void {
    const now = Date.now()
    for (const [key, time] of this.lastLogs.entries()) {
      if (now - time > this.THROTTLE_MS * 10) {
        this.lastLogs.delete(key)
      }
    }
  }
}

// Create singleton instance
export const debugLogger = new DebugLogger()

// Cleanup old entries every 30 seconds
if (typeof window !== 'undefined') {
  setInterval(() => debugLogger.cleanup(), 30000)
}

// Convenience exports
export const logSubscription = debugLogger.subscription.bind(debugLogger)
export const logPension = debugLogger.pension.bind(debugLogger)
export const logPremium = debugLogger.premium.bind(debugLogger)
export const logApi = debugLogger.api.bind(debugLogger)
export const logGeneral = debugLogger.general.bind(debugLogger)
export const logStateChange = debugLogger.stateChange.bind(debugLogger)
export const logPerformance = debugLogger.performance.bind(debugLogger)
export const logError = debugLogger.error.bind(debugLogger)

// Environment variable helper
export function isDebugEnabled(component?: keyof DebugConfig['components']): boolean {
  if (process.env.NODE_ENV !== 'development') return false
  if (!component) return true
  return debugLogger['config'].components[component]
}
