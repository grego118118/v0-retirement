"use client"

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { BarChart3, AlertTriangle, RefreshCw, Download } from 'lucide-react'
import { reportError, addBreadcrumb } from '@/sentry.client.config'

interface ChartErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  isRetrying: boolean
  retryCount: number
}

interface ChartErrorBoundaryProps {
  children: ReactNode
  chartTitle?: string
  fallbackHeight?: number
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  onRetry?: () => void
  showDataDownload?: boolean
  chartData?: any[]
  maxRetries?: number
}

export class ChartErrorBoundary extends Component<ChartErrorBoundaryProps, ChartErrorBoundaryState> {
  private retryTimeout: NodeJS.Timeout | null = null

  constructor(props: ChartErrorBoundaryProps) {
    super(props)
    
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      isRetrying: false,
      retryCount: 0,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ChartErrorBoundaryState> {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo })

    // Add breadcrumb for chart error context
    addBreadcrumb(
      `Chart error in ${this.props.chartTitle || 'unknown chart'}: ${error.message}`,
      'chart',
      'error'
    )

    // Report error to Sentry with chart-specific context
    reportError(error, {
      errorBoundary: 'chart',
      chartTitle: this.props.chartTitle,
      chartData: this.props.chartData ? {
        length: this.props.chartData.length,
        hasData: this.props.chartData.length > 0,
        firstItem: this.props.chartData[0],
      } : null,
      errorInfo: {
        componentStack: errorInfo.componentStack,
      },
      retryCount: this.state.retryCount,
    })

    // Call custom error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // Log error for development
    if (process.env.NODE_ENV === 'development') {
      console.error('Chart Error Boundary caught an error:', error, errorInfo)
    }
  }

  componentWillUnmount() {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout)
    }
  }

  handleRetry = () => {
    const maxRetries = this.props.maxRetries || 2
    
    if (this.state.retryCount >= maxRetries) {
      return
    }

    this.setState({ 
      isRetrying: true,
      retryCount: this.state.retryCount + 1,
    })

    addBreadcrumb(
      `Chart retry attempt ${this.state.retryCount + 1}`,
      'user',
      'info'
    )

    // Call custom retry handler if provided
    if (this.props.onRetry) {
      this.props.onRetry()
    }

    // Retry after a short delay
    this.retryTimeout = setTimeout(() => {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        isRetrying: false,
      })
    }, 1000)
  }

  handleDownloadData = () => {
    if (!this.props.chartData || this.props.chartData.length === 0) {
      return
    }

    try {
      // Convert chart data to CSV
      const headers = Object.keys(this.props.chartData[0]).join(',')
      const rows = this.props.chartData.map(item => 
        Object.values(item).map(value => 
          typeof value === 'string' && value.includes(',') 
            ? `"${value}"` 
            : value
        ).join(',')
      )
      
      const csvContent = [headers, ...rows].join('\n')
      
      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      
      link.setAttribute('href', url)
      link.setAttribute('download', `${this.props.chartTitle || 'chart-data'}.csv`)
      link.style.visibility = 'hidden'
      
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      addBreadcrumb(
        'Chart data downloaded as CSV',
        'user',
        'info'
      )
    } catch (error) {
      console.error('Failed to download chart data:', error)
      reportError(error as Error, {
        context: 'chart-data-download',
        chartTitle: this.props.chartTitle,
      })
    }
  }

  getErrorType = (error: Error): 'data' | 'rendering' | 'performance' | 'unknown' => {
    const message = error.message.toLowerCase()
    
    if (message.includes('data') || message.includes('undefined') || message.includes('null')) {
      return 'data'
    }
    if (message.includes('render') || message.includes('canvas') || message.includes('svg')) {
      return 'rendering'
    }
    if (message.includes('memory') || message.includes('timeout')) {
      return 'performance'
    }
    return 'unknown'
  }

  getErrorMessage = (error: Error): string => {
    const errorType = this.getErrorType(error)
    
    switch (errorType) {
      case 'data':
        return 'There was an issue with the chart data. Please try refreshing or contact support if the problem persists.'
      case 'rendering':
        return 'The chart could not be rendered properly. This might be due to browser compatibility issues.'
      case 'performance':
        return 'The chart is taking too long to load. Try reducing the data range or refreshing the page.'
      default:
        return 'An unexpected error occurred while displaying the chart.'
    }
  }

  render() {
    if (this.state.isRetrying) {
      // Show loading state during retry
      const height = this.props.fallbackHeight || 300
      
      return (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 animate-spin text-blue-600" />
              <CardTitle>Retrying Chart...</CardTitle>
            </div>
            <CardDescription>
              Attempting to reload {this.props.chartTitle || 'the chart'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3" style={{ height }}>
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-full w-full" />
            </div>
          </CardContent>
        </Card>
      )
    }

    if (this.state.hasError && this.state.error) {
      const { error } = this.state
      const height = this.props.fallbackHeight || 300
      const maxRetries = this.props.maxRetries || 2
      const canRetry = this.state.retryCount < maxRetries
      const hasData = this.props.chartData && this.props.chartData.length > 0

      return (
        <Card className="border-orange-200 dark:border-orange-800">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-orange-100 dark:bg-orange-900/20">
                <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-lg text-orange-900 dark:text-orange-100">
                  Chart Error
                </CardTitle>
                <CardDescription>
                  {this.props.chartTitle || 'Chart'} could not be displayed
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Error Message */}
            <Alert>
              <BarChart3 className="h-4 w-4" />
              <AlertTitle>Visualization Error</AlertTitle>
              <AlertDescription>
                {this.getErrorMessage(error)}
              </AlertDescription>
            </Alert>

            {/* Fallback Chart Area */}
            <div 
              className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800/50"
              style={{ height }}
            >
              <BarChart3 className="h-12 w-12 text-slate-400 mb-3" />
              <p className="text-slate-600 dark:text-slate-400 text-center max-w-sm">
                Chart visualization is temporarily unavailable
              </p>
              {hasData && (
                <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">
                  Data is available ({this.props.chartData?.length} items)
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              {canRetry && (
                <Button onClick={this.handleRetry} variant="default" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry ({maxRetries - this.state.retryCount} attempts left)
                </Button>
              )}

              {hasData && this.props.showDataDownload && (
                <Button 
                  onClick={this.handleDownloadData} 
                  variant="outline" 
                  size="sm"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Data
                </Button>
              )}

              <Button 
                onClick={() => window.location.reload()} 
                variant="ghost" 
                size="sm"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Page
              </Button>
            </div>

            {/* Technical Details (Development Only) */}
            {process.env.NODE_ENV === 'development' && (
              <details className="text-xs">
                <summary className="cursor-pointer text-slate-600 dark:text-slate-400 mb-2">
                  Technical Details (Development)
                </summary>
                <pre className="bg-slate-100 dark:bg-slate-800 p-2 rounded overflow-auto max-h-32">
                  {error.stack}
                </pre>
              </details>
            )}

            {/* Help Text */}
            <div className="text-sm text-slate-600 dark:text-slate-400 border-t pt-3">
              <p>
                If this chart continues to fail, try refreshing the page or 
                {hasData && this.props.showDataDownload && ' download the raw data for manual analysis.'}
                {!hasData && ' ensure you have the necessary data loaded.'}
              </p>
            </div>
          </CardContent>
        </Card>
      )
    }

    return this.props.children
  }
}
