// Error monitoring utilities
export function logError(error: Error, context?: Record<string, any>) {
  console.error('Error:', error.message, context)

  // In production, this would integrate with Sentry or other monitoring service
  if (process.env.NODE_ENV === 'production') {
    // Send to monitoring service
  }
}

export function captureException(error: Error, context?: Record<string, any>) {
  logError(error, context)
}

export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
  console.log(`[${level.toUpperCase()}] ${message}`)

  // In production, this would integrate with monitoring service
  if (process.env.NODE_ENV === 'production') {
    // Send to monitoring service
  }
}

export function monitorServerOperation<T>(
  operation: () => Promise<T>,
  operationName: string
): Promise<T> {
  return operation().catch((error) => {
    logError(error, { operation: operationName })
    throw error
  })
}

export function reportAPIError(error: Error, context?: Record<string, any>) {
  logError(error, { ...context, type: 'API_ERROR' })
}
