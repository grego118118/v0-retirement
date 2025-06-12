"use client"

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { ResponsiveContainer } from 'recharts'
import { useTheme } from 'next-themes'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Download, Maximize2, RefreshCw } from 'lucide-react'
import { 
  getChartTheme, 
  getResponsiveDimensions, 
  measureChartPerformance,
  ACCESSIBILITY_CONFIG,
  PERFORMANCE_THRESHOLDS
} from '@/lib/charts/chart-config'

export interface BaseChartProps {
  title: string
  description?: string
  data: any[]
  loading?: boolean
  error?: string | null
  height?: number
  className?: string
  showExport?: boolean
  showRefresh?: boolean
  showFullscreen?: boolean
  onRefresh?: () => void
  onExport?: (format: 'png' | 'svg') => void
  children: React.ReactNode
  ariaLabel?: string
  testId?: string
}

interface ChartState {
  isClient: boolean
  dimensions: ReturnType<typeof getResponsiveDimensions>
  theme: ReturnType<typeof getChartTheme>
  performanceMetrics: {
    renderTime: number
    lastUpdate: number
  }
}

export function BaseChart({
  title,
  description,
  data,
  loading = false,
  error = null,
  height,
  className = '',
  showExport = false,
  showRefresh = false,
  showFullscreen = false,
  onRefresh,
  onExport,
  children,
  ariaLabel,
  testId
}: BaseChartProps) {
  const { theme: currentTheme } = useTheme()
  const isDark = currentTheme === 'dark'

  const [state, setState] = useState<ChartState>({
    isClient: false,
    dimensions: getResponsiveDimensions(1024), // Default to desktop
    theme: getChartTheme(isDark),
    performanceMetrics: {
      renderTime: 0,
      lastUpdate: Date.now()
    }
  })

  // Performance monitoring
  const performanceMonitor = useMemo(() => measureChartPerformance('render'), [data])

  // Update client state and dimensions on mount
  useEffect(() => {
    const updateDimensions = () => {
      const width = window.innerWidth
      setState(prev => ({
        ...prev,
        isClient: true,
        dimensions: getResponsiveDimensions(width),
        theme: getChartTheme(isDark)
      }))
    }

    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    
    return () => {
      window.removeEventListener('resize', updateDimensions)
      const renderTime = performanceMonitor.end()
      setState(prev => ({
        ...prev,
        performanceMetrics: {
          renderTime,
          lastUpdate: Date.now()
        }
      }))
    }
  }, [isDark, performanceMonitor])

  // Update theme when it changes
  useEffect(() => {
    setState(prev => ({
      ...prev,
      theme: getChartTheme(isDark)
    }))
  }, [isDark])

  // Handle export functionality
  const handleExport = useCallback((format: 'png' | 'svg') => {
    if (onExport) {
      onExport(format)
    } else {
      // Default export implementation
      console.log(`Exporting chart as ${format}`)
      // TODO: Implement actual export functionality
    }
  }, [onExport])

  // Handle refresh functionality
  const handleRefresh = useCallback(() => {
    if (onRefresh) {
      onRefresh()
    }
  }, [onRefresh])

  // Calculate chart height based on responsive dimensions
  const chartHeight = height || state.dimensions.height

  // Loading state
  if (loading) {
    return (
      <Card className={className} data-testid={testId}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <Skeleton className="h-6 w-48" />
            <div className="flex gap-2">
              {showRefresh && <Skeleton className="h-8 w-8" />}
              {showExport && <Skeleton className="h-8 w-8" />}
              {showFullscreen && <Skeleton className="h-8 w-8" />}
            </div>
          </CardTitle>
          {description && <Skeleton className="h-4 w-64" />}
        </CardHeader>
        <CardContent>
          <Skeleton className="w-full" style={{ height: chartHeight }} />
        </CardContent>
      </Card>
    )
  }

  // Error state
  if (error) {
    return (
      <Card className={className} data-testid={testId}>
        <CardHeader>
          <CardTitle className="text-red-600 dark:text-red-400">{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="text-red-500 mb-4">
              <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">
              Chart Error
            </h3>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            {showRefresh && (
              <Button variant="outline" onClick={handleRefresh} size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  // No data state
  if (!data || data.length === 0) {
    return (
      <Card className={className} data-testid={testId}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="text-muted-foreground mb-4">
              <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-muted-foreground mb-2">
              No Data Available
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              There is no data to display in this chart.
            </p>
            {showRefresh && (
              <Button variant="outline" onClick={handleRefresh} size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Data
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className} data-testid={testId}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{title}</span>
          <div className="flex gap-2">
            {showRefresh && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                className="h-8 w-8 p-0"
                title="Refresh chart data"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            )}
            {showExport && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleExport('png')}
                className="h-8 w-8 p-0"
                title="Export chart"
              >
                <Download className="h-4 w-4" />
              </Button>
            )}
            {showFullscreen && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                title="View fullscreen"
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>

      <CardContent>
        <div 
          style={{ height: chartHeight }}
          role={ACCESSIBILITY_CONFIG.role}
          aria-label={ariaLabel || `${title} chart`}
          tabIndex={ACCESSIBILITY_CONFIG.tabIndex}
        >
          {state.isClient ? (
            <ResponsiveContainer width="100%" height="100%">
              {children}
            </ResponsiveContainer>
          ) : (
            <div 
              className="w-full bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse flex items-center justify-center"
              style={{ height: chartHeight }}
            >
              <div className="text-sm text-muted-foreground">Loading chart...</div>
            </div>
          )}
        </div>

        {/* Performance indicator (development only) */}
        {process.env.NODE_ENV === 'development' && state.performanceMetrics.renderTime > 0 && (
          <div className="mt-2 text-xs text-muted-foreground">
            Render time: {state.performanceMetrics.renderTime.toFixed(2)}ms
            {state.performanceMetrics.renderTime > PERFORMANCE_THRESHOLDS.renderTime && (
              <span className="text-yellow-600 ml-2">⚠️ Slow render</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
