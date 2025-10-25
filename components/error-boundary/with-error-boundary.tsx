"use client"

import React from 'react'
import { ErrorBoundary } from './error-boundary'
import { ErrorBoundaryConfig } from './index'

/**
 * Higher-Order Component for wrapping components with error boundaries
 * Massachusetts Retirement System - Error Tracking and Monitoring
 */

export default function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  config?: ErrorBoundaryConfig
) {
  const WrappedComponent = (props: P) => {
    return (
      <ErrorBoundary {...config}>
        <Component {...props} />
      </ErrorBoundary>
    )
  }

  // Set display name for debugging
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`

  return WrappedComponent
}
