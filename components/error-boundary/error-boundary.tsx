"use client"

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, RefreshCw, Home, Bug, Copy, CheckCircle } from 'lucide-react'
import { reportError, addBreadcrumb } from '@/sentry.client.config'

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  errorId: string | null
  isReporting: boolean
  reportSent: boolean
  showDetails: boolean
}

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  showReportButton?: boolean
  showDetails?: boolean
  level?: 'page' | 'component' | 'critical'
  context?: Record<string, any>
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private retryCount = 0
  private maxRetries = 3

  constructor(props: ErrorBoundaryProps) {
    super(props)
    
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      isReporting: false,
      reportSent: false,
      showDetails: props.showDetails || false,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Generate unique error ID for tracking
    const errorId = `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    this.setState({
      errorInfo,
      errorId,
    })

    // Add breadcrumb for error context
    addBreadcrumb(
      `Error boundary caught error: ${error.message}`,
      'error',
      'error'
    )

    // Report error to Sentry with context
    reportError(error, {
      errorBoundary: true,
      level: this.props.level || 'component',
      context: this.props.context,
      errorInfo: {
        componentStack: errorInfo.componentStack,
      },
      errorId,
      retryCount: this.retryCount,
    })

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // Log error for development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error Boundary caught an error:', error, errorInfo)
    }
  }

  handleRetry = () => {
    if (this.retryCount < this.maxRetries) {
      this.retryCount++
      
      addBreadcrumb(
        `Error boundary retry attempt ${this.retryCount}`,
        'user',
        'info'
      )

      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        errorId: null,
        reportSent: false,
        showDetails: false,
      })
    }
  }

  handleReportError = async () => {
    if (this.state.error && !this.state.reportSent) {
      this.setState({ isReporting: true })

      try {
        // Send additional error report with user feedback
        reportError(this.state.error, {
          userReported: true,
          errorId: this.state.errorId,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href,
        })

        this.setState({ 
          reportSent: true,
          isReporting: false,
        })
      } catch (reportingError) {
        console.error('Failed to report error:', reportingError)
        this.setState({ isReporting: false })
      }
    }
  }

  handleCopyError = async () => {
    if (this.state.error && this.state.errorInfo) {
      const errorText = `
Error ID: ${this.state.errorId}
Error: ${this.state.error.message}
Stack: ${this.state.error.stack}
Component Stack: ${this.state.errorInfo.componentStack}
URL: ${window.location.href}
Timestamp: ${new Date().toISOString()}
      `.trim()

      try {
        await navigator.clipboard.writeText(errorText)
        // Could show a toast notification here
      } catch (err) {
        console.error('Failed to copy error details:', err)
      }
    }
  }

  toggleDetails = () => {
    this.setState(prevState => ({
      showDetails: !prevState.showDetails
    }))
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI if provided
      if (this.props.fallback) {
        return this.props.fallback
      }

      const { error, errorInfo, errorId, isReporting, reportSent, showDetails } = this.state
      const canRetry = this.retryCount < this.maxRetries
      const isPageLevel = this.props.level === 'page'
      const isCritical = this.props.level === 'critical'

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-900">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${
                  isCritical 
                    ? 'bg-red-100 dark:bg-red-900/20' 
                    : 'bg-orange-100 dark:bg-orange-900/20'
                }`}>
                  <AlertTriangle className={`h-6 w-6 ${
                    isCritical 
                      ? 'text-red-600 dark:text-red-400' 
                      : 'text-orange-600 dark:text-orange-400'
                  }`} />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-xl">
                    {isCritical ? 'Critical Error' : 'Something went wrong'}
                  </CardTitle>
                  <CardDescription>
                    {isPageLevel 
                      ? 'The page encountered an unexpected error and cannot be displayed.'
                      : 'A component on this page encountered an error.'
                    }
                  </CardDescription>
                </div>
                {errorId && (
                  <Badge variant="outline" className="font-mono text-xs">
                    {errorId}
                  </Badge>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Error Summary */}
              <Alert>
                <Bug className="h-4 w-4" />
                <AlertTitle>Error Details</AlertTitle>
                <AlertDescription className="mt-2">
                  <div className="font-mono text-sm bg-slate-100 dark:bg-slate-800 p-2 rounded">
                    {error?.message || 'Unknown error occurred'}
                  </div>
                </AlertDescription>
              </Alert>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2">
                {canRetry && (
                  <Button onClick={this.handleRetry} variant="default">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Try Again ({this.maxRetries - this.retryCount} attempts left)
                  </Button>
                )}

                <Button 
                  onClick={() => window.location.href = '/'} 
                  variant="outline"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Go Home
                </Button>

                {this.props.showReportButton !== false && (
                  <Button
                    onClick={this.handleReportError}
                    variant="outline"
                    disabled={isReporting || reportSent}
                  >
                    {isReporting ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : reportSent ? (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    ) : (
                      <Bug className="h-4 w-4 mr-2" />
                    )}
                    {reportSent ? 'Report Sent' : 'Report Error'}
                  </Button>
                )}

                <Button
                  onClick={this.handleCopyError}
                  variant="ghost"
                  size="sm"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Details
                </Button>

                <Button
                  onClick={this.toggleDetails}
                  variant="ghost"
                  size="sm"
                >
                  {showDetails ? 'Hide' : 'Show'} Technical Details
                </Button>
              </div>

              {/* Technical Details */}
              {showDetails && error && errorInfo && (
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-sm mb-2">Stack Trace</h4>
                    <pre className="text-xs bg-slate-100 dark:bg-slate-800 p-3 rounded overflow-auto max-h-40">
                      {error.stack}
                    </pre>
                  </div>

                  <div>
                    <h4 className="font-medium text-sm mb-2">Component Stack</h4>
                    <pre className="text-xs bg-slate-100 dark:bg-slate-800 p-3 rounded overflow-auto max-h-40">
                      {errorInfo.componentStack}
                    </pre>
                  </div>

                  <div>
                    <h4 className="font-medium text-sm mb-2">Environment</h4>
                    <div className="text-xs bg-slate-100 dark:bg-slate-800 p-3 rounded space-y-1">
                      <div><strong>URL:</strong> {window.location.href}</div>
                      <div><strong>User Agent:</strong> {navigator.userAgent}</div>
                      <div><strong>Timestamp:</strong> {new Date().toISOString()}</div>
                      <div><strong>Error ID:</strong> {errorId}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Help Text */}
              <div className="text-sm text-slate-600 dark:text-slate-400 border-t pt-4">
                <p>
                  If this error persists, please contact support with the error ID above. 
                  Our team has been automatically notified of this issue.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}
