"use client"

import React from 'react'

// Temporary placeholder components to test build without recharts
const ChartPlaceholder = ({ height = "h-64", title = "Chart" }: { height?: string, title?: string }) => (
  <div className={`${height} bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 rounded-lg flex items-center justify-center border-2 border-dashed border-blue-200 dark:border-blue-800`}>
    <div className="text-center">
      <div className="text-lg font-medium text-blue-600 dark:text-blue-400">{title}</div>
      <div className="text-sm text-muted-foreground mt-1">Chart temporarily disabled for build testing</div>
    </div>
  </div>
)

export const IncomeVisualization = ({ calculation, className = "" }: any) => (
  <ChartPlaceholder title="Income Visualization" height="h-96" />
)

export const BenefitProjectionChart = (props: any) => (
  <ChartPlaceholder title="Benefit Projection Chart" />
)

export const ComparisonChart = (props: any) => (
  <ChartPlaceholder title="Comparison Chart" />
)

export const IncomeBreakdownChart = (props: any) => (
  <ChartPlaceholder title="Income Breakdown Chart" />
)

export const ChartShowcase = (props: any) => (
  <ChartPlaceholder title="Chart Showcase" height="h-96" />
)

// Re-export types for convenience
export type {
  BenefitProjectionChartProps,
  BenefitProjectionData
} from '@/components/charts/benefit-projection-chart'

export type {
  ComparisonChartProps,
  ComparisonData
} from '@/components/charts/comparison-chart'

export type {
  IncomeBreakdownChartProps,
  IncomeBreakdownData
} from '@/components/charts/income-breakdown-chart'
