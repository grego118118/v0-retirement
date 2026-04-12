import { 
  ErrorMonitor,
  errorMonitor,
  recordUserAction,
  recordPerformanceMetric,
  reportCalculationError,
  reportChartError,
  setUserContext,
  setCalculationContext,
  monitorAsyncOperation
} from '@/components/error-boundary/error-monitoring'

// Mock Sentry
jest.mock('@/sentry.client.config', () => ({
  reportError: jest.fn(),
  reportWarning: jest.fn(),
  reportInfo: jest.fn(),
  addBreadcrumb: jest.fn(),
  setUserContext: jest.fn(),
  setRetirementContext: jest.fn(),
  monitorPerformance: jest.fn((operation) => operation()),
}))

// Mock performance API
const mockPerformance = {
  now: jest.fn(() => Date.now()),
  getEntriesByType: jest.fn(() => []),
  memory: {
    usedJSHeapSize: 50 * 1024 * 1024, // 50MB
    jsHeapSizeLimit: 100 * 1024 * 1024, // 100MB
  },
}

Object.defineProperty(global, 'performance', {
  value: mockPerformance,
  writable: true,
})

// Mock PerformanceObserver
global.PerformanceObserver = jest.fn().mockImplementation((callback) => ({
  observe: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock window and document
Object.defineProperty(global, 'window', {
  value: {
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    location: { href: 'https://test.com' },
    fetch: jest.fn(),
  },
  writable: true,
})

Object.defineProperty(global, 'document', {
  value: {
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    referrer: 'https://referrer.com',
  },
  writable: true,
})

describe('Error Monitoring System', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(Date, 'now').mockReturnValue(1234567890000)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('ErrorMonitor', () => {
    it('should be a singleton', () => {
      const instance1 = ErrorMonitor.getInstance()
      const instance2 = ErrorMonitor.getInstance()
      
      expect(instance1).toBe(instance2)
    })

    it('should generate unique session IDs', () => {
      const monitor = ErrorMonitor.getInstance()
      const sessionSummary = monitor.getSessionSummary()
      
      expect(sessionSummary.sessionId).toMatch(/^session_\d+_[a-z0-9]+$/)
    })

    it('should record user actions', () => {
      const monitor = ErrorMonitor.getInstance()
      
      monitor.recordUserAction({
        action: 'click',
        component: 'button',
        timestamp: Date.now(),
        data: { buttonId: 'test-button' },
      })

      const recentActions = monitor.getRecentUserActions(1)
      expect(recentActions).toHaveLength(1)
      expect(recentActions[0].action).toBe('click')
      expect(recentActions[0].component).toBe('button')
    })

    it('should record performance metrics', () => {
      const monitor = ErrorMonitor.getInstance()
      
      monitor.recordPerformanceMetric({
        operationName: 'test_operation',
        duration: 1500,
        timestamp: Date.now(),
        success: true,
      })

      const recentMetrics = monitor.getRecentPerformanceMetrics(1)
      expect(recentMetrics).toHaveLength(1)
      expect(recentMetrics[0].operationName).toBe('test_operation')
      expect(recentMetrics[0].duration).toBe(1500)
    })

    it('should limit stored user actions to 50', () => {
      const monitor = ErrorMonitor.getInstance()
      
      // Add 60 actions
      for (let i = 0; i < 60; i++) {
        monitor.recordUserAction({
          action: `action_${i}`,
          component: 'test',
          timestamp: Date.now() + i,
        })
      }

      const allActions = monitor.getRecentUserActions(100)
      expect(allActions).toHaveLength(50)
      expect(allActions[0].action).toBe('action_10') // Should start from action 10
    })

    it('should limit stored performance metrics to 100', () => {
      const monitor = ErrorMonitor.getInstance()
      
      // Add 120 metrics
      for (let i = 0; i < 120; i++) {
        monitor.recordPerformanceMetric({
          operationName: `operation_${i}`,
          duration: i * 10,
          timestamp: Date.now() + i,
          success: true,
        })
      }

      const allMetrics = monitor.getRecentPerformanceMetrics(150)
      expect(allMetrics).toHaveLength(100)
      expect(allMetrics[0].operationName).toBe('operation_20') // Should start from operation 20
    })

    it('should calculate session summary correctly', () => {
      const monitor = ErrorMonitor.getInstance()
      
      // Add some test data
      monitor.recordUserAction({
        action: 'test_action',
        component: 'test',
        timestamp: Date.now(),
      })

      monitor.recordPerformanceMetric({
        operationName: 'test_operation',
        duration: 1000,
        timestamp: Date.now(),
        success: true,
      })

      monitor.recordPerformanceMetric({
        operationName: 'failed_operation',
        duration: 2000,
        timestamp: Date.now(),
        success: false,
      })

      const summary = monitor.getSessionSummary()
      
      expect(summary.sessionId).toBeDefined()
      expect(summary.totalActions).toBeGreaterThan(0)
      expect(summary.totalMetrics).toBeGreaterThan(0)
      expect(summary.errorCount).toBe(1) // One failed operation
      expect(summary.averagePerformance).toBe(1000) // Only successful operations counted
    })

    it('should report calculation errors with context', () => {
      const { reportError } = require('@/sentry.client.config')
      const monitor = ErrorMonitor.getInstance()
      
      const error = new Error('Calculation failed')
      const calculationData = {
        pensionAmount: 3000,
        yearsOfService: 30,
        retirementAge: 65,
      }

      monitor.reportCalculationError(error, calculationData)

      expect(reportError).toHaveBeenCalledWith(error, expect.objectContaining({
        category: 'calculation',
        calculationData,
        userActions: expect.any(Array),
        sessionId: expect.any(String),
      }))
    })

    it('should report chart errors with context', () => {
      const { reportError } = require('@/sentry.client.config')
      const monitor = ErrorMonitor.getInstance()
      
      const error = new Error('Chart rendering failed')
      const chartData = {
        chartType: 'line',
        dataLength: 50,
        chartTitle: 'Benefit Projection',
      }

      monitor.reportChartError(error, chartData)

      expect(reportError).toHaveBeenCalledWith(error, expect.objectContaining({
        category: 'chart',
        chartData,
        userActions: expect.any(Array),
        sessionId: expect.any(String),
      }))
    })

    it('should monitor async operations', async () => {
      const monitor = ErrorMonitor.getInstance()
      
      const asyncOperation = jest.fn().mockResolvedValue('success')
      
      const result = await monitor.monitorAsyncOperation(
        asyncOperation,
        'test_async_operation'
      )

      expect(result).toBe('success')
      expect(asyncOperation).toHaveBeenCalled()
    })

    it('should handle async operation failures', async () => {
      const monitor = ErrorMonitor.getInstance()
      
      const asyncOperation = jest.fn().mockRejectedValue(new Error('Async failed'))
      
      await expect(
        monitor.monitorAsyncOperation(asyncOperation, 'failing_async_operation')
      ).rejects.toThrow('Async failed')
    })
  })

  describe('Convenience Functions', () => {
    it('should record user action via convenience function', () => {
      recordUserAction('click', 'test-button', { id: 'btn-1' })

      const recentActions = errorMonitor.getRecentUserActions(1)
      expect(recentActions[0].action).toBe('click')
      expect(recentActions[0].component).toBe('test-button')
      expect(recentActions[0].data).toEqual({ id: 'btn-1' })
    })

    it('should record performance metric via convenience function', () => {
      recordPerformanceMetric('test_operation', 1500, true)

      const recentMetrics = errorMonitor.getRecentPerformanceMetrics(1)
      expect(recentMetrics[0].operationName).toBe('test_operation')
      expect(recentMetrics[0].duration).toBe(1500)
      expect(recentMetrics[0].success).toBe(true)
    })

    it('should report calculation error via convenience function', () => {
      const { reportError } = require('@/sentry.client.config')
      
      const error = new Error('Test calculation error')
      const calculationData = { test: 'data' }
      
      reportCalculationError(error, calculationData)

      expect(reportError).toHaveBeenCalledWith(error, expect.objectContaining({
        category: 'calculation',
        calculationData,
      }))
    })

    it('should report chart error via convenience function', () => {
      const { reportError } = require('@/sentry.client.config')
      
      const error = new Error('Test chart error')
      const chartData = {
        chartType: 'bar',
        dataLength: 10,
        chartTitle: 'Test Chart',
      }
      
      reportChartError(error, chartData)

      expect(reportError).toHaveBeenCalledWith(error, expect.objectContaining({
        category: 'chart',
        chartData,
      }))
    })

    it('should set user context via convenience function', () => {
      const { setUserContext: sentrySetUserContext } = require('@/sentry.client.config')
      
      const user = {
        id: 'user123',
        email: 'test@example.com',
        group: 'GROUP_1',
      }
      
      setUserContext(user)

      expect(sentrySetUserContext).toHaveBeenCalledWith(user)
    })

    it('should set calculation context via convenience function', () => {
      const { setRetirementContext } = require('@/sentry.client.config')
      
      const context = {
        calculationType: 'pension' as const,
        userGroup: 'GROUP_1' as const,
        retirementAge: 65,
        yearsOfService: 30,
      }
      
      setCalculationContext(context)

      expect(setRetirementContext).toHaveBeenCalledWith(context)
    })

    it('should monitor async operation via convenience function', async () => {
      const { monitorPerformance } = require('@/sentry.client.config')
      
      const operation = jest.fn().mockResolvedValue('result')
      
      const result = await monitorAsyncOperation(operation, 'test_operation')

      expect(result).toBe('result')
      expect(monitorPerformance).toHaveBeenCalledWith(
        operation,
        'test_operation',
        'async'
      )
    })
  })

  describe('Performance Monitoring', () => {
    it('should detect slow operations', () => {
      const { addBreadcrumb } = require('@/sentry.client.config')
      
      recordPerformanceMetric('slow_operation', 3000, true)

      expect(addBreadcrumb).toHaveBeenCalledWith(
        'Slow operation: slow_operation took 3000ms',
        'performance',
        'warning'
      )
    })

    it('should not flag fast operations', () => {
      const { addBreadcrumb } = require('@/sentry.client.config')
      
      recordPerformanceMetric('fast_operation', 500, true)

      // Should not call addBreadcrumb for performance warning
      expect(addBreadcrumb).not.toHaveBeenCalledWith(
        expect.stringContaining('Slow operation'),
        'performance',
        'warning'
      )
    })

    it('should calculate average performance correctly', () => {
      const monitor = ErrorMonitor.getInstance()
      
      // Clear existing metrics
      monitor.getRecentPerformanceMetrics(1000)
      
      // Add test metrics
      monitor.recordPerformanceMetric({
        operationName: 'op1',
        duration: 1000,
        timestamp: Date.now(),
        success: true,
      })
      
      monitor.recordPerformanceMetric({
        operationName: 'op2',
        duration: 2000,
        timestamp: Date.now(),
        success: true,
      })
      
      monitor.recordPerformanceMetric({
        operationName: 'op3',
        duration: 0, // Should be excluded from average
        timestamp: Date.now(),
        success: true,
      })

      const summary = monitor.getSessionSummary()
      expect(summary.averagePerformance).toBe(1500) // (1000 + 2000) / 2
    })
  })

  describe('Error Context', () => {
    it('should include recent user actions in error reports', () => {
      const { reportError } = require('@/sentry.client.config')
      
      // Record some user actions
      recordUserAction('click', 'button1')
      recordUserAction('input', 'form1')
      recordUserAction('submit', 'form1')
      
      const error = new Error('Test error')
      reportCalculationError(error, {})

      expect(reportError).toHaveBeenCalledWith(error, expect.objectContaining({
        userActions: expect.arrayContaining([
          expect.objectContaining({ action: 'click', component: 'button1' }),
          expect.objectContaining({ action: 'input', component: 'form1' }),
          expect.objectContaining({ action: 'submit', component: 'form1' }),
        ]),
      }))
    })

    it('should include session ID in error reports', () => {
      const { reportError } = require('@/sentry.client.config')
      
      const error = new Error('Test error')
      reportCalculationError(error, {})

      expect(reportError).toHaveBeenCalledWith(error, expect.objectContaining({
        sessionId: expect.stringMatching(/^session_\d+_[a-z0-9]+$/),
      }))
    })
  })
})
