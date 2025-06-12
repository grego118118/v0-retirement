"use client"

import React, { createContext, useContext, ReactNode } from 'react'
import { errorMonitor } from './error-monitoring'

/**
 * Error Provider Context
 * Massachusetts Retirement System - Error Tracking and Monitoring
 */

interface ErrorContextType {
  reportError: (error: Error, context?: Record<string, any>) => void
  recordUserAction: (action: string, component: string, data?: Record<string, any>) => void
  setUserContext: (user: any) => void
  setCalculationContext: (context: any) => void
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined)

interface ErrorProviderProps {
  children: ReactNode
}

export default function ErrorProvider({ children }: ErrorProviderProps) {
  const contextValue: ErrorContextType = {
    reportError: (error: Error, context?: Record<string, any>) => {
      errorMonitor.reportCalculationError(error, context || {})
    },
    recordUserAction: (action: string, component: string, data?: Record<string, any>) => {
      errorMonitor.recordUserAction({
        action,
        component,
        timestamp: Date.now(),
        data,
      })
    },
    setUserContext: (user: any) => {
      errorMonitor.setUserContext(user)
    },
    setCalculationContext: (context: any) => {
      errorMonitor.setRetirementCalculationContext(context)
    },
  }

  return (
    <ErrorContext.Provider value={contextValue}>
      {children}
    </ErrorContext.Provider>
  )
}

export function useErrorContext() {
  const context = useContext(ErrorContext)
  if (context === undefined) {
    throw new Error('useErrorContext must be used within an ErrorProvider')
  }
  return context
}
