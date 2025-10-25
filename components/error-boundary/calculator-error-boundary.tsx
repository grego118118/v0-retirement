"use client"

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, RefreshCw, Calculator } from "lucide-react"

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  errorId: string | null
  retryCount: number
}

export class CalculatorErrorBoundary extends Component<Props, State> {
  private maxRetries = 3

  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      retryCount: 0
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const errorId = `calc_err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    this.setState({
      errorInfo,
      errorId,
    })

    // Log error for debugging (replace with actual error monitoring when available)
    console.error('Calculator Error Boundary - Error Details:', {
      errorBoundary: 'calculator',
      component: 'PensionCalculator',
      errorInfo: {
        componentStack: errorInfo.componentStack,
      },
      errorId,
      retryCount: this.state.retryCount,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
      url: typeof window !== 'undefined' ? window.location.href : 'Unknown'
    })

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    console.error('Calculator Error Boundary caught an error:', error, errorInfo)
  }

  handleRetry = () => {
    if (this.state.retryCount < this.maxRetries) {
      this.setState(prevState => ({
        hasError: false,
        error: null,
        errorInfo: null,
        errorId: null,
        retryCount: prevState.retryCount + 1
      }))
    }
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default error UI
      return (
        <div className="w-full max-w-4xl mx-auto p-4">
          <Card className="border-destructive">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <CardTitle className="text-destructive">Calculator Error</CardTitle>
              </div>
              <CardDescription>
                The pension calculator encountered an unexpected error and couldn't load properly.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Error:</strong> {this.state.error?.message || 'Unknown error occurred'}
                  {this.state.errorId && (
                    <div className="mt-2 text-sm opacity-75">
                      Error ID: {this.state.errorId}
                    </div>
                  )}
                </AlertDescription>
              </Alert>

              <div className="flex flex-col sm:flex-row gap-3">
                {this.state.retryCount < this.maxRetries && (
                  <Button 
                    onClick={this.handleRetry}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Try Again ({this.maxRetries - this.state.retryCount} attempts left)
                  </Button>
                )}
                
                <Button 
                  onClick={this.handleReload}
                  variant="default"
                  className="flex items-center gap-2"
                >
                  <Calculator className="h-4 w-4" />
                  Reload Calculator
                </Button>
              </div>

              <div className="text-sm text-muted-foreground">
                <p>If this problem persists, please try:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Refreshing the page</li>
                  <li>Clearing your browser cache</li>
                  <li>Using a different browser</li>
                  <li>Checking your internet connection</li>
                </ul>
              </div>

              {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm font-medium">
                    Developer Information (Development Mode)
                  </summary>
                  <pre className="mt-2 p-3 bg-muted rounded text-xs overflow-auto">
                    {this.state.error?.stack}
                    {'\n\nComponent Stack:'}
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

export default CalculatorErrorBoundary
