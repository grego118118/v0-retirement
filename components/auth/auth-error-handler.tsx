/**
 * Massachusetts Retirement System - Authentication Error Handler
 * 
 * Handles NextAuth.js authentication errors gracefully and provides
 * user-friendly error messages and recovery options.
 */

'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw, Wifi, WifiOff } from 'lucide-react'

interface AuthErrorHandlerProps {
  children: React.ReactNode
}

interface AuthError {
  type: 'network' | 'session' | 'configuration' | 'unknown'
  message: string
  recoverable: boolean
}

export function AuthErrorHandler({ children }: AuthErrorHandlerProps) {
  const { data: session, status } = useSession()
  const [authError, setAuthError] = useState<AuthError | null>(null)
  const [isOnline, setIsOnline] = useState(true)
  const [retryCount, setRetryCount] = useState(0)

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Monitor for authentication errors
  useEffect(() => {
    const handleAuthError = (event: ErrorEvent) => {
      const error = event.error
      const message = event.message || error?.message || ''

      // Check for NextAuth-related errors
      if (message.includes('Failed to fetch') && 
          (message.includes('nextauth') || message.includes('/api/auth/'))) {
        
        let errorType: AuthError['type'] = 'unknown'
        let userMessage = 'Authentication error occurred'
        let recoverable = true

        // Categorize the error
        if (!isOnline) {
          errorType = 'network'
          userMessage = 'No internet connection. Please check your network and try again.'
        } else if (message.includes('CORS') || message.includes('cors')) {
          errorType = 'configuration'
          userMessage = 'Authentication service configuration error. Please contact support.'
          recoverable = false
        } else if (message.includes('timeout') || message.includes('Timeout')) {
          errorType = 'network'
          userMessage = 'Authentication request timed out. Please try again.'
        } else if (message.includes('Failed to fetch')) {
          errorType = 'network'
          userMessage = 'Unable to connect to authentication service. Please try again.'
        } else {
          errorType = 'session'
          userMessage = 'Session error occurred. Please sign in again.'
        }

        setAuthError({
          type: errorType,
          message: userMessage,
          recoverable
        })

        // Auto-clear network errors when back online
        if (errorType === 'network' && isOnline) {
          setTimeout(() => {
            setAuthError(null)
            setRetryCount(0)
          }, 3000)
        }
      }
    }

    // Listen for authentication errors
    window.addEventListener('error', handleAuthError)

    // Listen for unhandled promise rejections (common with fetch errors)
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason?.toString() || ''
      if (reason.includes('Failed to fetch') && 
          (reason.includes('nextauth') || reason.includes('/api/auth/'))) {
        
        setAuthError({
          type: 'network',
          message: 'Authentication service temporarily unavailable. Please try again.',
          recoverable: true
        })
      }
    }

    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    return () => {
      window.removeEventListener('error', handleAuthError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [isOnline])

  // Auto-retry for recoverable errors
  useEffect(() => {
    if (authError?.recoverable && retryCount < 3 && isOnline) {
      const timer = setTimeout(() => {
        setRetryCount(prev => prev + 1)
        // Trigger a session refresh
        window.location.reload()
      }, 5000 * (retryCount + 1)) // Exponential backoff

      return () => clearTimeout(timer)
    }
  }, [authError, retryCount, isOnline])

  // Handle manual retry
  const handleRetry = () => {
    setAuthError(null)
    setRetryCount(0)
    window.location.reload()
  }

  // Handle sign out and redirect to sign in
  const handleSignOut = () => {
    setAuthError(null)
    window.location.href = '/auth/signin'
  }

  // Show error UI if there's an authentication error
  if (authError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full space-y-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="mt-2">
              <div className="space-y-3">
                <p className="font-medium">Authentication Error</p>
                <p className="text-sm">{authError.message}</p>
                
                {!isOnline && (
                  <div className="flex items-center gap-2 text-sm">
                    <WifiOff className="h-4 w-4" />
                    <span>No internet connection</span>
                  </div>
                )}

                {isOnline && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <Wifi className="h-4 w-4" />
                    <span>Connected</span>
                  </div>
                )}

                {authError.recoverable && retryCount > 0 && (
                  <p className="text-sm text-gray-600">
                    Retry attempt {retryCount} of 3...
                  </p>
                )}
              </div>
            </AlertDescription>
          </Alert>

          <div className="flex gap-3">
            {authError.recoverable && (
              <Button 
                onClick={handleRetry}
                disabled={!isOnline}
                className="flex-1"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            )}
            
            <Button 
              variant="outline" 
              onClick={handleSignOut}
              className="flex-1"
            >
              Sign In
            </Button>
          </div>

          {authError.type === 'configuration' && (
            <div className="text-center">
              <p className="text-sm text-gray-600">
                If this problem persists, please contact technical support.
              </p>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Show loading state for authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    )
  }

  // Render children if no errors
  return <>{children}</>
}

/**
 * Hook to handle authentication errors in components
 */
export function useAuthErrorHandler() {
  const [error, setError] = useState<string | null>(null)

  const handleAuthError = (error: Error) => {
    const message = error.message || ''
    
    if (message.includes('Failed to fetch') && 
        (message.includes('nextauth') || message.includes('/api/auth/'))) {
      setError('Authentication service temporarily unavailable. Please try again.')
      
      // Auto-clear after 5 seconds
      setTimeout(() => setError(null), 5000)
    }
  }

  const clearError = () => setError(null)

  return {
    error,
    handleAuthError,
    clearError
  }
}

/**
 * Utility function to check if an error is auth-related
 */
export function isAuthError(error: Error): boolean {
  const message = error.message || ''
  return message.includes('Failed to fetch') && 
         (message.includes('nextauth') || message.includes('/api/auth/'))
}

/**
 * Utility function to suppress auth errors in development
 */
export function suppressAuthErrors() {
  if (process.env.NODE_ENV === 'development') {
    const originalConsoleError = console.error
    console.error = (...args) => {
      const message = args.join(' ')
      if (message.includes('Failed to fetch') && 
          (message.includes('nextauth') || message.includes('/api/auth/'))) {
        // Suppress NextAuth fetch errors in development
        return
      }
      originalConsoleError.apply(console, args)
    }
  }
}
