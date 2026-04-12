"use client"

import React, { useState, useEffect, ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertTriangle, RefreshCw, Wifi, WifiOff } from 'lucide-react'
import { reportError, addBreadcrumb } from '@/sentry.client.config'

interface AsyncErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  loadingFallback?: ReactNode
  onError?: (error: Error) => void
  onRetry?: () => void
  retryDelay?: number
  maxRetries?: number
  showNetworkStatus?: boolean
}

interface AsyncErrorState {
  error: Error | null
  isLoading: boolean
  retryCount: number
  isOnline: boolean
}

export function AsyncErrorBoundary({
  children,
  fallback,
  loadingFallback,
  onError,
  onRetry,
  retryDelay = 1000,
  maxRetries = 3,
  showNetworkStatus = true,
}: AsyncErrorBoundaryProps) {
  const [state, setState] = useState<AsyncErrorState>({
    error: null,
    isLoading: false,
    retryCount: 0,
    isOnline: navigator?.onLine ?? true,
  })

  // Monitor network status
  useEffect(() => {
    if (!showNetworkStatus) return

    const handleOnline = () => {
      setState(prev => ({ ...prev, isOnline: true }))
      addBreadcrumb('Network connection restored', 'network', 'info')
    }

    const handleOffline = () => {
      setState(prev => ({ ...prev, isOnline: false }))
      addBreadcrumb('Network connection lost', 'network', 'warning')
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [showNetworkStatus])

  // Global error handler for unhandled promise rejections
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error = event.reason instanceof Error 
        ? event.reason 
        : new Error(String(event.reason))

      handleAsyncError(error)
      event.preventDefault()
    }

    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [])

  const handleAsyncError = (error: Error) => {
    const errorId = `async_err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    setState(prev => ({
      ...prev,
      error,
      isLoading: false,
    }))

    // Add breadcrumb for async error
    addBreadcrumb(
      `Async error caught: ${error.message}`,
      'async',
      'error'
    )

    // Report error to Sentry
    reportError(error, {
      errorBoundary: 'async',
      errorId,
      retryCount: state.retryCount,
      isOnline: state.isOnline,
      context: {
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
      },
    })

    // Call custom error handler
    if (onError) {
      onError(error)
    }
  }

  const handleRetry = async () => {
    if (state.retryCount >= maxRetries) {
      return
    }

    setState(prev => ({
      ...prev,
      isLoading: true,
      retryCount: prev.retryCount + 1,
    }))

    addBreadcrumb(
      `Async retry attempt ${state.retryCount + 1}`,
      'user',
      'info'
    )

    try {
      // Wait for retry delay
      await new Promise(resolve => setTimeout(resolve, retryDelay))

      // Call custom retry handler
      if (onRetry) {
        await onRetry()
      }

      // Reset error state on successful retry
      setState(prev => ({
        ...prev,
        error: null,
        isLoading: false,
      }))
    } catch (retryError) {
      handleAsyncError(retryError as Error)
    }
  }

  const getErrorType = (error: Error): 'network' | 'timeout' | 'server' | 'client' | 'unknown' => {
    const message = error.message.toLowerCase()
    
    if (message.includes('network') || message.includes('fetch')) {
      return 'network'
    }
    if (message.includes('timeout') || message.includes('aborted')) {
      return 'timeout'
    }
    if (message.includes('500') || message.includes('502') || message.includes('503')) {
      return 'server'
    }
    if (message.includes('400') || message.includes('401') || message.includes('403')) {
      return 'client'
    }
    return 'unknown'
  }

  const getErrorMessage = (error: Error): string => {
    const errorType = getErrorType(error)
    
    switch (errorType) {
      case 'network':
        return 'Network connection error. Please check your internet connection and try again.'
      case 'timeout':
        return 'The request timed out. Please try again.'
      case 'server':
        return 'Server error. Our team has been notified and is working to fix this issue.'
      case 'client':
        return 'There was an issue with your request. Please try again or contact support.'
      default:
        return 'An unexpected error occurred. Please try again.'
    }
  }

  const getErrorIcon = (error: Error) => {
    const errorType = getErrorType(error)
    
    switch (errorType) {
      case 'network':
        return <WifiOff className="h-5 w-5" />
      case 'timeout':
        return <RefreshCw className="h-5 w-5" />
      default:
        return <AlertTriangle className="h-5 w-5" />
    }
  }

  // Show loading state
  if (state.isLoading) {
    if (loadingFallback) {
      return <>{loadingFallback}</>
    }

    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </CardContent>
      </Card>
    )
  }

  // Show error state
  if (state.error) {
    if (fallback) {
      return <>{fallback}</>
    }

    const canRetry = state.retryCount < maxRetries
    const errorType = getErrorType(state.error)
    const isNetworkError = errorType === 'network'

    return (
      <Card className="border-red-200 dark:border-red-800">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-red-100 dark:bg-red-900/20">
              {getErrorIcon(state.error)}
            </div>
            <div className="flex-1">
              <CardTitle className="text-lg text-red-900 dark:text-red-100">
                Operation Failed
              </CardTitle>
              <CardDescription>
                {getErrorMessage(state.error)}
              </CardDescription>
            </div>
            {showNetworkStatus && (
              <div className="flex items-center gap-2">
                {state.isOnline ? (
                  <Wifi className="h-4 w-4 text-green-600" />
                ) : (
                  <WifiOff className="h-4 w-4 text-red-600" />
                )}
                <span className="text-xs text-slate-600 dark:text-slate-400">
                  {state.isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Network Status Alert */}
          {!state.isOnline && (
            <Alert>
              <WifiOff className="h-4 w-4" />
              <AlertTitle>No Internet Connection</AlertTitle>
              <AlertDescription>
                Please check your internet connection and try again when you're back online.
              </AlertDescription>
            </Alert>
          )}

          {/* Error Details */}
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error Details</AlertTitle>
            <AlertDescription className="mt-2">
              <div className="font-mono text-sm bg-red-50 dark:bg-red-950/50 p-2 rounded">
                {state.error.message}
              </div>
            </AlertDescription>
          </Alert>

          {/* Action Buttons */}
          <div className="flex gap-2">
            {canRetry && (state.isOnline || !isNetworkError) && (
              <Button onClick={handleRetry} variant="default">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry ({maxRetries - state.retryCount} attempts left)
              </Button>
            )}

            <Button 
              onClick={() => window.location.reload()} 
              variant="outline"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Page
            </Button>
          </div>

          {/* Retry Information */}
          {state.retryCount > 0 && (
            <div className="text-sm text-slate-600 dark:text-slate-400 border-t pt-3">
              <p>
                Attempted {state.retryCount} of {maxRetries} retries.
                {!canRetry && ' Maximum retry attempts reached.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  // Render children normally
  return <>{children}</>
}

// Hook for handling async operations with error boundary
export function useAsyncErrorHandler() {
  const [error, setError] = useState<Error | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const executeAsync = async <T,>(
    operation: () => Promise<T>,
    onSuccess?: (result: T) => void,
    onError?: (error: Error) => void
  ): Promise<T | null> => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await operation()
      if (onSuccess) {
        onSuccess(result)
      }
      return result
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err))
      setError(error)
      
      if (onError) {
        onError(error)
      } else {
        // Report to Sentry if no custom error handler
        reportError(error, {
          context: 'useAsyncErrorHandler',
          operation: operation.name || 'anonymous',
        })
      }
      
      return null
    } finally {
      setIsLoading(false)
    }
  }

  const clearError = () => setError(null)

  return {
    error,
    isLoading,
    executeAsync,
    clearError,
  }
}
