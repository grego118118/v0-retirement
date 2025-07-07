interface ErrorContext {
  userId?: string;
  endpoint?: string;
  userAgent?: string;
  timestamp: string;
  sessionId?: string;
  requestId?: string;
}

interface ApiPerformanceMetrics {
  endpoint: string;
  method: string;
  duration: number;
  status: number;
  timestamp: string;
  userId?: string;
  errorMessage?: string;
}

interface DatabaseMetrics {
  operation: string;
  table?: string;
  duration: number;
  success: boolean;
  timestamp: string;
  errorMessage?: string;
}

// Error severity levels
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Determine error severity based on error characteristics
function getErrorSeverity(error: Error, context: ErrorContext): ErrorSeverity {
  const message = error.message.toLowerCase();
  
  // Critical errors
  if (message.includes('database') || 
      message.includes('connection timeout') ||
      message.includes('prisma') ||
      context.endpoint?.includes('/api/profile') ||
      context.endpoint?.includes('/api/subscription')) {
    return ErrorSeverity.CRITICAL;
  }
  
  // High severity errors
  if (message.includes('500') || 
      message.includes('internal server error') ||
      message.includes('authentication')) {
    return ErrorSeverity.HIGH;
  }
  
  // Medium severity errors
  if (message.includes('400') || 
      message.includes('validation') ||
      message.includes('bad request')) {
    return ErrorSeverity.MEDIUM;
  }
  
  return ErrorSeverity.LOW;
}

// Enhanced error logging with context and severity
export function logError(error: Error, context: ErrorContext) {
  const severity = getErrorSeverity(error, context);
  
  const errorData = {
    message: error.message,
    stack: error.stack,
    name: error.name,
    severity,
    ...context,
  };

  // Always log to console with appropriate level
  const logMethod = severity === ErrorSeverity.CRITICAL ? console.error :
                   severity === ErrorSeverity.HIGH ? console.error :
                   severity === ErrorSeverity.MEDIUM ? console.warn :
                   console.log;

  logMethod(`[${severity.toUpperCase()}] Application Error:`, errorData);

  // In production, send to monitoring service
  if (process.env.NODE_ENV === 'production') {
    // Example integrations (uncomment and configure as needed):
    
    // Sentry integration
    // if (typeof window !== 'undefined' && window.Sentry) {
    //   window.Sentry.captureException(error, { 
    //     extra: context,
    //     level: severity === ErrorSeverity.CRITICAL ? 'fatal' : 
    //            severity === ErrorSeverity.HIGH ? 'error' :
    //            severity === ErrorSeverity.MEDIUM ? 'warning' : 'info'
    //   });
    // }
    
    // Custom webhook for critical errors
    if (severity === ErrorSeverity.CRITICAL) {
      sendCriticalErrorAlert(errorData).catch(console.error);
    }
  }
}

// API performance monitoring
export function logApiPerformance(metrics: ApiPerformanceMetrics) {
  const { endpoint, method, duration, status, timestamp, userId, errorMessage } = metrics;
  
  const performanceData = {
    endpoint,
    method,
    duration,
    status,
    timestamp,
    userId,
    errorMessage,
  };

  // Log performance metrics
  if (duration > 5000) {
    console.error('VERY_SLOW_API_RESPONSE:', performanceData);
  } else if (duration > 3000) {
    console.warn('SLOW_API_RESPONSE:', performanceData);
  } else if (process.env.NODE_ENV === 'development') {
    console.log('API_PERFORMANCE:', performanceData);
  }

  // Log API errors
  if (status >= 500) {
    console.error('API_SERVER_ERROR:', performanceData);
  } else if (status >= 400) {
    console.warn('API_CLIENT_ERROR:', performanceData);
  }

  // Track specific endpoints that are critical
  const criticalEndpoints = ['/api/profile', '/api/retirement/calculations', '/api/subscription/status'];
  if (criticalEndpoints.some(ep => endpoint.includes(ep))) {
    if (status >= 500 || duration > 2000) {
      console.error('CRITICAL_ENDPOINT_ISSUE:', performanceData);
    }
  }
}

// Database operation monitoring
export function logDatabaseOperation(metrics: DatabaseMetrics) {
  const { operation, table, duration, success, timestamp, errorMessage } = metrics;
  
  const dbData = {
    operation,
    table,
    duration,
    success,
    timestamp,
    errorMessage,
  };

  // Log slow database operations
  if (duration > 5000) {
    console.error('VERY_SLOW_DB_OPERATION:', dbData);
  } else if (duration > 1000) {
    console.warn('SLOW_DB_OPERATION:', dbData);
  }

  // Log database errors
  if (!success) {
    console.error('DATABASE_OPERATION_FAILED:', dbData);
  }
}

// Send critical error alerts (implement based on your notification system)
async function sendCriticalErrorAlert(errorData: any) {
  try {
    // Example: Send to webhook, Slack, email, etc.
    // This is a placeholder - implement based on your alerting needs
    
    if (process.env.CRITICAL_ERROR_WEBHOOK_URL) {
      await fetch(process.env.CRITICAL_ERROR_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: `🚨 CRITICAL ERROR in Massachusetts Pension System`,
          attachments: [{
            color: 'danger',
            fields: [
              { title: 'Error', value: errorData.message, short: false },
              { title: 'Endpoint', value: errorData.endpoint || 'Unknown', short: true },
              { title: 'User ID', value: errorData.userId || 'Unknown', short: true },
              { title: 'Timestamp', value: errorData.timestamp, short: true },
            ]
          }]
        }),
      });
    }
  } catch (alertError) {
    console.error('Failed to send critical error alert:', alertError);
  }
}

// Performance monitoring wrapper for API routes
export function withPerformanceMonitoring<T extends (...args: any[]) => Promise<any>>(
  handler: T,
  endpoint: string,
  method: string = 'GET'
): T {
  return (async (...args: any[]) => {
    const startTime = Date.now();
    let status = 200;
    let errorMessage: string | undefined;

    try {
      const result = await handler(...args);
      return result;
    } catch (error) {
      status = 500;
      errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw error;
    } finally {
      const duration = Date.now() - startTime;
      
      logApiPerformance({
        endpoint,
        method,
        duration,
        status,
        timestamp: new Date().toISOString(),
        errorMessage,
      });
    }
  }) as T;
}

// Database operation wrapper
export function withDatabaseMonitoring<T extends (...args: any[]) => Promise<any>>(
  operation: T,
  operationName: string,
  tableName?: string
): T {
  return (async (...args: any[]) => {
    const startTime = Date.now();
    let success = true;
    let errorMessage: string | undefined;

    try {
      const result = await operation(...args);
      return result;
    } catch (error) {
      success = false;
      errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw error;
    } finally {
      const duration = Date.now() - startTime;
      
      logDatabaseOperation({
        operation: operationName,
        table: tableName,
        duration,
        success,
        timestamp: new Date().toISOString(),
        errorMessage,
      });
    }
  }) as T;
}

// System health metrics
export interface SystemHealthMetrics {
  timestamp: string;
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  uptime: number;
  activeConnections?: number;
}

export function getSystemHealthMetrics(): SystemHealthMetrics {
  const memUsage = process.memoryUsage();
  
  return {
    timestamp: new Date().toISOString(),
    memory: {
      used: memUsage.heapUsed,
      total: memUsage.heapTotal,
      percentage: (memUsage.heapUsed / memUsage.heapTotal) * 100,
    },
    uptime: process.uptime(),
  };
}
