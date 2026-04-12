"use client"

import { useCallback } from 'react'
import { reportError, reportWarning, reportInfo, addBreadcrumb } from '@/sentry.client.config'
import { errorMonitor } from './error-monitoring'

/**
 * Error Reporting Hook
 * Massachusetts Retirement System - Error Tracking and Monitoring
 */

export interface ErrorReportingActions {
  reportError: (error: Error, context?: Record<string, any>) => void
  reportWarning: (message: string, context?: Record<string, any>) => void
  reportInfo: (message: string, context?: Record<string, any>) => void
  reportCalculationError: (error: Error, calculationData: Record<string, any>) => void
  reportChartError: (error: Error, chartData: { chartType: string; dataLength: number; chartTitle?: string }) => void
  reportPerformanceIssue: (operation: string, duration: number, threshold?: number) => void
  addBreadcrumb: (message: string, category: string, level?: 'info' | 'warning' | 'error') => void
  recordUserAction: (action: string, component: string, data?: Record<string, any>) => void
}

export function useErrorReporting(): ErrorReportingActions {
  const reportErrorAction = useCallback((error: Error, context?: Record<string, any>) => {
    reportError(error, context)
  }, [])

  const reportWarningAction = useCallback((message: string, context?: Record<string, any>) => {
    reportWarning(message, context)
  }, [])

  const reportInfoAction = useCallback((message: string, context?: Record<string, any>) => {
    reportInfo(message, context)
  }, [])

  const reportCalculationErrorAction = useCallback((error: Error, calculationData: Record<string, any>) => {
    errorMonitor.reportCalculationError(error, calculationData)
  }, [])

  const reportChartErrorAction = useCallback((error: Error, chartData: { chartType: string; dataLength: number; chartTitle?: string }) => {
    errorMonitor.reportChartError(error, chartData)
  }, [])

  const reportPerformanceIssueAction = useCallback((operation: string, duration: number, threshold: number = 2000) => {
    errorMonitor.reportPerformanceIssue(operation, duration, threshold)
  }, [])

  const addBreadcrumbAction = useCallback((message: string, category: string, level: 'info' | 'warning' | 'error' = 'info') => {
    addBreadcrumb(message, category, level)
  }, [])

  const recordUserActionAction = useCallback((action: string, component: string, data?: Record<string, any>) => {
    errorMonitor.recordUserAction({
      action,
      component,
      timestamp: Date.now(),
      data,
    })
  }, [])

  return {
    reportError: reportErrorAction,
    reportWarning: reportWarningAction,
    reportInfo: reportInfoAction,
    reportCalculationError: reportCalculationErrorAction,
    reportChartError: reportChartErrorAction,
    reportPerformanceIssue: reportPerformanceIssueAction,
    addBreadcrumb: addBreadcrumbAction,
    recordUserAction: recordUserActionAction,
  }
}
