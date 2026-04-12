"use client"

import { useState, useCallback } from 'react'
import { reportError, addBreadcrumb } from '@/sentry.client.config'

/**
 * Error Handler Hook
 * Massachusetts Retirement System - Error Tracking and Monitoring
 */

export interface ErrorHandlerState {
  error: Error | null
  hasError: boolean
  errorId: string | null
}

export interface ErrorHandlerActions {
  reportError: (error: Error, context?: Record<string, any>) => void
  clearError: () => void
  handleError: (error: Error, context?: Record<string, any>) => void
}

export function useErrorHandler(): ErrorHandlerState & ErrorHandlerActions {
  const [state, setState] = useState<ErrorHandlerState>({
    error: null,
    hasError: false,
    errorId: null,
  })

  const handleError = useCallback((error: Error, context?: Record<string, any>) => {
    const errorId = `hook_err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    setState({
      error,
      hasError: true,
      errorId,
    })

    addBreadcrumb(
      `Error handled by useErrorHandler: ${error.message}`,
      'error',
      'error'
    )

    reportError(error, {
      errorHandler: 'useErrorHandler',
      errorId,
      context,
    })
  }, [])

  const reportErrorAction = useCallback((error: Error, context?: Record<string, any>) => {
    handleError(error, context)
  }, [handleError])

  const clearError = useCallback(() => {
    setState({
      error: null,
      hasError: false,
      errorId: null,
    })
  }, [])

  return {
    ...state,
    reportError: reportErrorAction,
    clearError,
    handleError,
  }
}
