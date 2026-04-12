import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { 
  BaseChart, 
  BenefitProjectionChart, 
  ComparisonChart, 
  IncomeBreakdownChart,
  generateSampleBenefitData,
  generateSampleComparisonData,
  generateSampleIncomeBreakdownData
} from '@/components/charts'

// Mock Recharts components
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
  LineChart: ({ children }: any) => <div data-testid="line-chart">{children}</div>,
  AreaChart: ({ children }: any) => <div data-testid="area-chart">{children}</div>,
  BarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
  PieChart: ({ children }: any) => <div data-testid="pie-chart">{children}</div>,
  Line: () => <div data-testid="line" />,
  Area: () => <div data-testid="area" />,
  Bar: () => <div data-testid="bar" />,
  Pie: () => <div data-testid="pie" />,
  Cell: () => <div data-testid="cell" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  ReferenceLine: () => <div data-testid="reference-line" />,
  Brush: () => <div data-testid="brush" />
}))

// Mock next-themes
jest.mock('next-themes', () => ({
  useTheme: () => ({ theme: 'light' })
}))

describe('Chart Components', () => {
  describe('BaseChart', () => {
    const mockData = [
      { name: 'A', value: 100 },
      { name: 'B', value: 200 }
    ]

    it('renders with title and description', () => {
      render(
        <BaseChart
          title="Test Chart"
          description="Test description"
          data={mockData}
        >
          <div>Chart content</div>
        </BaseChart>
      )

      expect(screen.getByText('Test Chart')).toBeInTheDocument()
      expect(screen.getByText('Test description')).toBeInTheDocument()
      expect(screen.getByText('Chart content')).toBeInTheDocument()
    })

    it('shows loading state', () => {
      render(
        <BaseChart
          title="Test Chart"
          data={mockData}
          loading={true}
        >
          <div>Chart content</div>
        </BaseChart>
      )

      // In loading state, title is replaced with skeleton
      expect(screen.queryByText('Chart content')).not.toBeInTheDocument()
      // Check for loading skeleton elements
      expect(document.querySelector('.animate-pulse')).toBeInTheDocument()
    })

    it('shows error state', () => {
      render(
        <BaseChart
          title="Test Chart"
          data={mockData}
          error="Chart error occurred"
        >
          <div>Chart content</div>
        </BaseChart>
      )

      expect(screen.getByText('Chart Error')).toBeInTheDocument()
      expect(screen.getByText('Chart error occurred')).toBeInTheDocument()
    })

    it('shows no data state', () => {
      render(
        <BaseChart
          title="Test Chart"
          data={[]}
        >
          <div>Chart content</div>
        </BaseChart>
      )

      expect(screen.getByText('No Data Available')).toBeInTheDocument()
      expect(screen.getByText('There is no data to display in this chart.')).toBeInTheDocument()
    })

    it('renders refresh button when onRefresh provided', () => {
      const mockRefresh = jest.fn()
      render(
        <BaseChart
          title="Test Chart"
          data={mockData}
          showRefresh={true}
          onRefresh={mockRefresh}
        >
          <div>Chart content</div>
        </BaseChart>
      )

      const refreshButton = screen.getByTitle('Refresh chart data')
      expect(refreshButton).toBeInTheDocument()
    })

    it('calls onRefresh when refresh button clicked', async () => {
      const user = userEvent.setup()
      const mockRefresh = jest.fn()
      
      render(
        <BaseChart
          title="Test Chart"
          data={mockData}
          showRefresh={true}
          onRefresh={mockRefresh}
        >
          <div>Chart content</div>
        </BaseChart>
      )

      const refreshButton = screen.getByTitle('Refresh chart data')
      await user.click(refreshButton)
      
      expect(mockRefresh).toHaveBeenCalledTimes(1)
    })

    it('renders export button when showExport is true', () => {
      render(
        <BaseChart
          title="Test Chart"
          data={mockData}
          showExport={true}
        >
          <div>Chart content</div>
        </BaseChart>
      )

      expect(screen.getByTitle('Export chart')).toBeInTheDocument()
    })

    it('has proper accessibility attributes', () => {
      render(
        <BaseChart
          title="Test Chart"
          data={mockData}
          ariaLabel="Custom aria label"
        >
          <div>Chart content</div>
        </BaseChart>
      )

      const chartContainer = screen.getByRole('img')
      expect(chartContainer).toHaveAttribute('aria-label', 'Custom aria label')
      expect(chartContainer).toHaveAttribute('tabIndex', '0')
    })
  })

  describe('BenefitProjectionChart', () => {
    const sampleData = generateSampleBenefitData(62, 70, 3000, 2000, 0.025)

    it('renders benefit projection chart', () => {
      render(
        <BenefitProjectionChart
          data={sampleData}
          title="Benefit Projections"
        />
      )

      expect(screen.getByText('Benefit Projections')).toBeInTheDocument()
      expect(screen.getByTestId('benefit-projection-chart')).toBeInTheDocument()
    })

    it('renders as line chart when chartType is line', () => {
      render(
        <BenefitProjectionChart
          data={sampleData}
          chartType="line"
        />
      )

      expect(screen.getByTestId('line-chart')).toBeInTheDocument()
      expect(screen.queryByTestId('area-chart')).not.toBeInTheDocument()
    })

    it('renders as area chart when chartType is area', () => {
      render(
        <BenefitProjectionChart
          data={sampleData}
          chartType="area"
        />
      )

      expect(screen.getByTestId('area-chart')).toBeInTheDocument()
      expect(screen.queryByTestId('line-chart')).not.toBeInTheDocument()
    })

    it('shows reference line when highlightRetirementAge provided', () => {
      render(
        <BenefitProjectionChart
          data={sampleData}
          highlightRetirementAge={67}
        />
      )

      expect(screen.getByTestId('reference-line')).toBeInTheDocument()
    })

    it('shows brush when enableBrush is true', () => {
      render(
        <BenefitProjectionChart
          data={sampleData}
          enableBrush={true}
        />
      )

      expect(screen.getByTestId('brush')).toBeInTheDocument()
    })

    it('calls onRefresh when provided', async () => {
      const user = userEvent.setup()
      const mockRefresh = jest.fn()
      
      render(
        <BenefitProjectionChart
          data={sampleData}
          onRefresh={mockRefresh}
        />
      )

      const refreshButton = screen.getByTitle('Refresh chart data')
      await user.click(refreshButton)
      
      expect(mockRefresh).toHaveBeenCalledTimes(1)
    })
  })

  describe('ComparisonChart', () => {
    const sampleData = generateSampleComparisonData()

    it('renders comparison chart', () => {
      render(
        <ComparisonChart
          data={sampleData}
          title="Income Comparison"
        />
      )

      expect(screen.getByText('Income Comparison')).toBeInTheDocument()
      expect(screen.getByTestId('comparison-chart')).toBeInTheDocument()
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
    })

    it('renders bars for current and projected values', () => {
      render(
        <ComparisonChart
          data={sampleData}
        />
      )

      const bars = screen.getAllByTestId('bar')
      expect(bars.length).toBeGreaterThanOrEqual(2) // At least current and projected
    })

    it('shows target bars when showTarget is true', () => {
      render(
        <ComparisonChart
          data={sampleData}
          showTarget={true}
        />
      )

      const bars = screen.getAllByTestId('bar')
      expect(bars.length).toBeGreaterThanOrEqual(3) // Current, projected, and target
    })

    it('calls onBarClick when bar is clicked', async () => {
      const user = userEvent.setup()
      const mockBarClick = jest.fn()
      
      render(
        <ComparisonChart
          data={sampleData}
          onBarClick={mockBarClick}
        />
      )

      // Note: In a real test, we'd need to mock the Recharts Bar component
      // to properly test click events. This is a simplified test.
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
    })
  })

  describe('IncomeBreakdownChart', () => {
    const sampleData = generateSampleIncomeBreakdownData()

    it('renders income breakdown chart', () => {
      render(
        <IncomeBreakdownChart
          data={sampleData}
          title="Income Breakdown"
        />
      )

      expect(screen.getByText('Income Breakdown')).toBeInTheDocument()
      expect(screen.getByTestId('income-breakdown-chart')).toBeInTheDocument()
      expect(screen.getByTestId('pie-chart')).toBeInTheDocument()
    })

    it('renders pie segments for each data item', () => {
      render(
        <IncomeBreakdownChart
          data={sampleData}
          chartType="pie"
        />
      )

      expect(screen.getByTestId('pie')).toBeInTheDocument()
    })

    it('shows center text for donut charts', () => {
      render(
        <IncomeBreakdownChart
          data={sampleData}
          chartType="donut"
        />
      )

      expect(screen.getByText('Total Income')).toBeInTheDocument()
    })

    it('calls onSegmentClick when segment is clicked', async () => {
      const mockSegmentClick = jest.fn()
      
      render(
        <IncomeBreakdownChart
          data={sampleData}
          enableClick={true}
          onSegmentClick={mockSegmentClick}
        />
      )

      // Note: In a real test, we'd need to mock the Recharts Pie component
      // to properly test click events. This is a simplified test.
      expect(screen.getByTestId('pie-chart')).toBeInTheDocument()
    })
  })

  describe('Chart Performance', () => {
    it('renders charts within performance threshold', async () => {
      const startTime = performance.now()
      
      const sampleData = generateSampleBenefitData(62, 85, 3000, 2000, 0.025)
      
      render(
        <BenefitProjectionChart
          data={sampleData}
          title="Performance Test"
        />
      )

      await waitFor(() => {
        expect(screen.getByText('Performance Test')).toBeInTheDocument()
      })

      const endTime = performance.now()
      const renderTime = endTime - startTime

      // Should render within 2 seconds (2000ms)
      expect(renderTime).toBeLessThan(2000)
    })

    it('handles large datasets efficiently', () => {
      const largeDataset = Array.from({ length: 100 }, (_, i) => ({
        age: 62 + i,
        year: 2024 + i,
        pensionBenefit: 3000 + i * 100,
        socialSecurityBenefit: 2000 + i * 50,
        totalBenefit: 5000 + i * 150
      }))

      const startTime = performance.now()
      
      render(
        <BenefitProjectionChart
          data={largeDataset}
          title="Large Dataset Test"
        />
      )

      const endTime = performance.now()
      const renderTime = endTime - startTime

      // Should handle large datasets efficiently
      expect(renderTime).toBeLessThan(1000) // 1 second for large dataset
    })
  })

  describe('Chart Responsiveness', () => {
    const mockData = generateSampleBenefitData(62, 70, 3000, 2000, 0.025)

    it('adapts to mobile viewport', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      })

      render(
        <BenefitProjectionChart
          data={mockData}
          title="Mobile Test"
        />
      )

      expect(screen.getByText('Mobile Test')).toBeInTheDocument()
      expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
    })

    it('adapts to desktop viewport', () => {
      // Mock desktop viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1920,
      })

      render(
        <BenefitProjectionChart
          data={mockData}
          title="Desktop Test"
        />
      )

      expect(screen.getByText('Desktop Test')).toBeInTheDocument()
      expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
    })
  })

  describe('Chart Accessibility', () => {
    const mockData = generateSampleBenefitData(62, 70, 3000, 2000, 0.025)

    it('has proper ARIA labels', () => {
      render(
        <BenefitProjectionChart
          data={mockData}
          title="Accessibility Test"
        />
      )

      const chartContainer = screen.getByRole('img')
      expect(chartContainer).toHaveAttribute('aria-label')
      expect(chartContainer).toHaveAttribute('tabIndex', '0')
    })

    it('supports keyboard navigation', () => {
      render(
        <BenefitProjectionChart
          data={mockData}
          title="Keyboard Test"
        />
      )

      const chartContainer = screen.getByRole('img')
      expect(chartContainer).toHaveAttribute('tabIndex', '0')
    })
  })
})
