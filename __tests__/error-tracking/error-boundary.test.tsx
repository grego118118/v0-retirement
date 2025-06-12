import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { 
  ErrorBoundary, 
  AsyncErrorBoundary, 
  ChartErrorBoundary,
  useAsyncErrorHandler
} from '@/components/error-boundary'

// Mock Sentry
jest.mock('@/sentry.client.config', () => ({
  reportError: jest.fn(),
  addBreadcrumb: jest.fn(),
  setUserContext: jest.fn(),
  setRetirementContext: jest.fn(),
  monitorPerformance: jest.fn((operation) => operation()),
}))

// Mock navigator.clipboard
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(() => Promise.resolve()),
  },
})

// Test component that throws errors
const ThrowError = ({ shouldThrow = false, errorMessage = 'Test error' }) => {
  if (shouldThrow) {
    throw new Error(errorMessage)
  }
  return <div>No error</div>
}

// Async component that throws errors
const AsyncThrowError = ({ shouldThrow = false }) => {
  React.useEffect(() => {
    if (shouldThrow) {
      Promise.reject(new Error('Async test error'))
    }
  }, [shouldThrow])
  
  return <div>Async component</div>
}

describe('Error Boundary Components', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Suppress console.error for tests
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('ErrorBoundary', () => {
    it('renders children when there is no error', () => {
      render(
        <ErrorBoundary title="Test Boundary">
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      )

      expect(screen.getByText('No error')).toBeInTheDocument()
    })

    it('renders error UI when child component throws', () => {
      render(
        <ErrorBoundary title="Test Boundary">
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      expect(screen.getByText('Something went wrong')).toBeInTheDocument()
      expect(screen.getByText('Test error')).toBeInTheDocument()
    })

    it('shows retry button and allows retry', async () => {
      const user = userEvent.setup()
      let shouldThrow = true

      const { rerender } = render(
        <ErrorBoundary title="Test Boundary">
          <ThrowError shouldThrow={shouldThrow} />
        </ErrorBoundary>
      )

      // Error should be displayed
      expect(screen.getByText('Something went wrong')).toBeInTheDocument()

      // Click retry button
      const retryButton = screen.getByText(/Try Again/)
      await user.click(retryButton)

      // Update component to not throw error
      shouldThrow = false
      rerender(
        <ErrorBoundary title="Test Boundary">
          <ThrowError shouldThrow={shouldThrow} />
        </ErrorBoundary>
      )

      // Should show success after retry
      await waitFor(() => {
        expect(screen.getByText('No error')).toBeInTheDocument()
      })
    })

    it('shows report error button when enabled', () => {
      render(
        <ErrorBoundary title="Test Boundary" showReportButton={true}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      expect(screen.getByText('Report Error')).toBeInTheDocument()
    })

    it('calls onError callback when error occurs', () => {
      const onError = jest.fn()

      render(
        <ErrorBoundary title="Test Boundary" onError={onError}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      expect(onError).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          componentStack: expect.any(String),
        })
      )
    })

    it('shows technical details when toggled', async () => {
      const user = userEvent.setup()

      render(
        <ErrorBoundary title="Test Boundary">
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      // Technical details should be hidden initially
      expect(screen.queryByText('Stack Trace')).not.toBeInTheDocument()

      // Click show details button
      const showDetailsButton = screen.getByText('Show Technical Details')
      await user.click(showDetailsButton)

      // Technical details should now be visible
      expect(screen.getByText('Stack Trace')).toBeInTheDocument()
      expect(screen.getByText('Component Stack')).toBeInTheDocument()
    })

    it('copies error details to clipboard', async () => {
      const user = userEvent.setup()

      render(
        <ErrorBoundary title="Test Boundary">
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      const copyButton = screen.getByText('Copy Details')
      await user.click(copyButton)

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        expect.stringContaining('Error: Test error')
      )
    })

    it('limits retry attempts', async () => {
      const user = userEvent.setup()

      render(
        <ErrorBoundary title="Test Boundary" maxRetries={2}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      // Should show retry button initially
      expect(screen.getByText(/Try Again \(2 attempts left\)/)).toBeInTheDocument()

      // Click retry multiple times
      const retryButton = screen.getByText(/Try Again/)
      await user.click(retryButton)

      // Should still show retry with decremented count
      await waitFor(() => {
        expect(screen.getByText(/Try Again \(1 attempts left\)/)).toBeInTheDocument()
      })
    })

    it('renders custom fallback when provided', () => {
      const customFallback = <div>Custom error fallback</div>

      render(
        <ErrorBoundary title="Test Boundary" fallback={customFallback}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      expect(screen.getByText('Custom error fallback')).toBeInTheDocument()
      expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument()
    })
  })

  describe('AsyncErrorBoundary', () => {
    it('renders children normally', () => {
      render(
        <AsyncErrorBoundary>
          <AsyncThrowError shouldThrow={false} />
        </AsyncErrorBoundary>
      )

      expect(screen.getByText('Async component')).toBeInTheDocument()
    })

    it('handles unhandled promise rejections', async () => {
      render(
        <AsyncErrorBoundary>
          <AsyncThrowError shouldThrow={true} />
        </AsyncErrorBoundary>
      )

      // Wait for async error to be caught
      await waitFor(() => {
        expect(screen.getByText('Operation Failed')).toBeInTheDocument()
      }, { timeout: 1000 })
    })

    it('shows network status when enabled', () => {
      render(
        <AsyncErrorBoundary showNetworkStatus={true}>
          <div>Test content</div>
        </AsyncErrorBoundary>
      )

      // Should show online status
      expect(screen.getByText('Online')).toBeInTheDocument()
    })

    it('provides retry functionality for async errors', async () => {
      const user = userEvent.setup()
      const onRetry = jest.fn()

      render(
        <AsyncErrorBoundary onRetry={onRetry}>
          <AsyncThrowError shouldThrow={true} />
        </AsyncErrorBoundary>
      )

      // Wait for error to appear
      await waitFor(() => {
        expect(screen.getByText('Operation Failed')).toBeInTheDocument()
      })

      // Click retry button
      const retryButton = screen.getByText(/Retry/)
      await user.click(retryButton)

      expect(onRetry).toHaveBeenCalled()
    })
  })

  describe('ChartErrorBoundary', () => {
    it('renders chart children normally', () => {
      render(
        <ChartErrorBoundary chartTitle="Test Chart">
          <div>Chart content</div>
        </ChartErrorBoundary>
      )

      expect(screen.getByText('Chart content')).toBeInTheDocument()
    })

    it('shows chart-specific error UI', () => {
      render(
        <ChartErrorBoundary chartTitle="Test Chart">
          <ThrowError shouldThrow={true} />
        </ChartErrorBoundary>
      )

      expect(screen.getByText('Chart Error')).toBeInTheDocument()
      expect(screen.getByText('Test Chart could not be displayed')).toBeInTheDocument()
    })

    it('shows data download button when data is available', () => {
      const chartData = [
        { name: 'A', value: 100 },
        { name: 'B', value: 200 },
      ]

      render(
        <ChartErrorBoundary 
          chartTitle="Test Chart" 
          chartData={chartData}
          showDataDownload={true}
        >
          <ThrowError shouldThrow={true} />
        </ChartErrorBoundary>
      )

      expect(screen.getByText('Download Data')).toBeInTheDocument()
    })

    it('shows retry functionality for charts', async () => {
      const user = userEvent.setup()

      render(
        <ChartErrorBoundary chartTitle="Test Chart">
          <ThrowError shouldThrow={true} />
        </ChartErrorBoundary>
      )

      const retryButton = screen.getByText(/Retry/)
      expect(retryButton).toBeInTheDocument()

      await user.click(retryButton)

      // Should show retrying state
      await waitFor(() => {
        expect(screen.getByText('Retrying Chart...')).toBeInTheDocument()
      })
    })

    it('creates CSV download when download button clicked', async () => {
      const user = userEvent.setup()
      const chartData = [
        { name: 'A', value: 100 },
        { name: 'B', value: 200 },
      ]

      // Mock URL.createObjectURL and document.createElement
      const mockCreateObjectURL = jest.fn(() => 'blob:mock-url')
      const mockClick = jest.fn()
      const mockAppendChild = jest.fn()
      const mockRemoveChild = jest.fn()

      global.URL.createObjectURL = mockCreateObjectURL
      
      const mockLink = {
        setAttribute: jest.fn(),
        click: mockClick,
        style: { visibility: '' },
      }
      
      jest.spyOn(document, 'createElement').mockReturnValue(mockLink as any)
      jest.spyOn(document.body, 'appendChild').mockImplementation(mockAppendChild)
      jest.spyOn(document.body, 'removeChild').mockImplementation(mockRemoveChild)

      render(
        <ChartErrorBoundary 
          chartTitle="Test Chart" 
          chartData={chartData}
          showDataDownload={true}
        >
          <ThrowError shouldThrow={true} />
        </ChartErrorBoundary>
      )

      const downloadButton = screen.getByText('Download Data')
      await user.click(downloadButton)

      expect(mockCreateObjectURL).toHaveBeenCalled()
      expect(mockClick).toHaveBeenCalled()
    })
  })

  describe('useAsyncErrorHandler', () => {
    const TestComponent = () => {
      const { error, isLoading, executeAsync, clearError } = useAsyncErrorHandler()

      const handleAsyncOperation = () => {
        executeAsync(async () => {
          throw new Error('Async operation failed')
        })
      }

      return (
        <div>
          {error && <div>Error: {error.message}</div>}
          {isLoading && <div>Loading...</div>}
          <button onClick={handleAsyncOperation}>Execute Async</button>
          <button onClick={clearError}>Clear Error</button>
        </div>
      )
    }

    it('handles async operations and errors', async () => {
      const user = userEvent.setup()

      render(<TestComponent />)

      const executeButton = screen.getByText('Execute Async')
      await user.click(executeButton)

      await waitFor(() => {
        expect(screen.getByText('Error: Async operation failed')).toBeInTheDocument()
      })
    })

    it('clears errors when requested', async () => {
      const user = userEvent.setup()

      render(<TestComponent />)

      // Trigger error
      const executeButton = screen.getByText('Execute Async')
      await user.click(executeButton)

      await waitFor(() => {
        expect(screen.getByText('Error: Async operation failed')).toBeInTheDocument()
      })

      // Clear error
      const clearButton = screen.getByText('Clear Error')
      await user.click(clearButton)

      expect(screen.queryByText('Error: Async operation failed')).not.toBeInTheDocument()
    })
  })
})
