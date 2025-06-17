"use client"

import React, { useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts'
import { BaseChart } from './base-chart'
import { 
  CHART_COLORS, 
  TOOLTIP_CONFIG, 
  LEGEND_CONFIG, 
  GRID_CONFIG,
  AXIS_CONFIG,
  CHART_TYPE_CONFIG,
  formatChartCurrency
} from '@/lib/charts/chart-config'

export interface ComparisonData {
  category: string
  label: string
  currentValue: number
  projectedValue: number
  targetValue?: number
  difference?: number
  percentChange?: number
  description?: string
}

export interface ComparisonChartProps {
  data: ComparisonData[]
  title?: string
  description?: string
  chartType?: 'grouped' | 'stacked'
  showTarget?: boolean
  showDifference?: boolean
  orientation?: 'vertical' | 'horizontal'
  colorScheme?: 'default' | 'income' | 'performance'
  className?: string
  loading?: boolean
  error?: string | null
  onRefresh?: () => void
  onBarClick?: (data: ComparisonData) => void
}

export function ComparisonChart({
  data,
  title = "Retirement Income Comparison",
  description = "Compare current vs projected retirement income",
  chartType = 'grouped',
  showTarget = false,
  showDifference = false,
  orientation = 'vertical',
  colorScheme = 'default',
  className,
  loading,
  error,
  onRefresh,
  onBarClick
}: ComparisonChartProps) {

  // Color scheme selection
  const colors = useMemo(() => {
    switch (colorScheme) {
      case 'income':
        return {
          current: CHART_COLORS.pension,
          projected: CHART_COLORS.socialSecurity,
          target: CHART_COLORS.target,
          difference: CHART_COLORS.other
        }
      case 'performance':
        return {
          current: CHART_COLORS.current,
          projected: CHART_COLORS.projected,
          target: CHART_COLORS.target,
          difference: CHART_COLORS.warning
        }
      default:
        return {
          current: CHART_COLORS.pension,
          projected: CHART_COLORS.projected,
          target: CHART_COLORS.target,
          difference: CHART_COLORS.other
        }
    }
  }, [colorScheme])

  // Process data for chart display
  const chartData = useMemo(() => {
    return data.map(item => ({
      ...item,
      currentDisplay: formatChartCurrency(item.currentValue),
      projectedDisplay: formatChartCurrency(item.projectedValue),
      targetDisplay: item.targetValue ? formatChartCurrency(item.targetValue) : null,
      differenceDisplay: item.difference ? formatChartCurrency(Math.abs(item.difference)) : null,
      percentChangeDisplay: item.percentChange ? `${item.percentChange > 0 ? '+' : ''}${item.percentChange.toFixed(1)}%` : null,
      // Calculate difference if not provided
      calculatedDifference: item.difference || (item.projectedValue - item.currentValue),
      // Determine bar color based on performance
      performanceColor: item.projectedValue >= item.currentValue ? colors.projected : CHART_COLORS.warning
    }))
  }, [data, colors])

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white dark:bg-slate-800 p-4 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg min-w-[200px]">
          <p className="font-semibold text-slate-900 dark:text-slate-100 mb-3">
            {data.label}
          </p>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-sm text-slate-600 dark:text-slate-400">Current:</span>
              </div>
              <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                {data.currentDisplay}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-sm text-slate-600 dark:text-slate-400">Projected:</span>
              </div>
              <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                {data.projectedDisplay}
              </span>
            </div>

            {showTarget && data.targetValue && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-lime-500" />
                  <span className="text-sm text-slate-600 dark:text-slate-400">Target:</span>
                </div>
                <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  {data.targetDisplay}
                </span>
              </div>
            )}

            <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-400">Change:</span>
                <span className={`text-sm font-medium ${
                  data.calculatedDifference >= 0 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {data.calculatedDifference >= 0 ? '+' : ''}
                  {formatChartCurrency(data.calculatedDifference)}
                </span>
              </div>
              
              {data.percentChangeDisplay && (
                <div className="flex items-center justify-between mt-1">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Percent:</span>
                  <span className={`text-sm font-medium ${
                    data.calculatedDifference >= 0 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {data.percentChangeDisplay}
                  </span>
                </div>
              )}
            </div>
          </div>

          {data.description && (
            <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-700">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {data.description}
              </span>
            </div>
          )}
        </div>
      )
    }
    return null
  }

  // Handle bar click
  const handleBarClick = (data: any) => {
    if (onBarClick) {
      onBarClick(data)
    }
  }

  const renderChart = () => (
    <BarChart
      data={chartData}
      margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
      layout={orientation === 'horizontal' ? 'horizontal' : 'vertical'}
    >
      <CartesianGrid 
        strokeDasharray={GRID_CONFIG.strokeDasharray}
        stroke={GRID_CONFIG.stroke}
        opacity={GRID_CONFIG.opacity}
      />
      
      <XAxis 
        type={orientation === 'horizontal' ? 'number' : 'category'}
        dataKey={orientation === 'horizontal' ? undefined : 'label'}
        tick={AXIS_CONFIG.tick}
        axisLine={AXIS_CONFIG.axisLine}
        tickLine={false}
        tickFormatter={orientation === 'horizontal' ? formatChartCurrency : undefined}
        angle={orientation === 'vertical' ? -45 : 0}
        textAnchor={orientation === 'vertical' ? 'end' : 'middle'}
        height={orientation === 'vertical' ? 80 : undefined}
      />
      
      <YAxis 
        type={orientation === 'horizontal' ? 'category' : 'number'}
        dataKey={orientation === 'horizontal' ? 'label' : undefined}
        tick={AXIS_CONFIG.tick}
        axisLine={AXIS_CONFIG.axisLine}
        tickLine={false}
        tickFormatter={orientation === 'horizontal' ? undefined : formatChartCurrency}
        width={orientation === 'horizontal' ? 120 : undefined}
      />

      <Tooltip content={<CustomTooltip />} />
      
      <Legend 
        {...LEGEND_CONFIG}
        wrapperStyle={{
          ...LEGEND_CONFIG.wrapperStyle,
          fontSize: '12px'
        }}
      />

      {/* Current Values */}
      <Bar
        dataKey="currentValue"
        fill={colors.current}
        name="Current"
        radius={[...CHART_TYPE_CONFIG.bar.radius] as [number, number, number, number]}
        maxBarSize={CHART_TYPE_CONFIG.bar.maxBarSize}
        onClick={handleBarClick}
        style={{ cursor: onBarClick ? 'pointer' : 'default' }}
      />

      {/* Projected Values */}
      <Bar
        dataKey="projectedValue"
        fill={colors.projected}
        name="Projected"
        radius={[...CHART_TYPE_CONFIG.bar.radius] as [number, number, number, number]}
        maxBarSize={CHART_TYPE_CONFIG.bar.maxBarSize}
        onClick={handleBarClick}
        style={{ cursor: onBarClick ? 'pointer' : 'default' }}
      />

      {/* Target Values (if enabled) */}
      {showTarget && (
        <Bar
          dataKey="targetValue"
          fill={colors.target}
          name="Target"
          radius={[...CHART_TYPE_CONFIG.bar.radius] as [number, number, number, number]}
          maxBarSize={CHART_TYPE_CONFIG.bar.maxBarSize}
          onClick={handleBarClick}
          style={{ cursor: onBarClick ? 'pointer' : 'default' }}
        />
      )}
    </BarChart>
  )

  return (
    <BaseChart
      title={title}
      description={description}
      data={chartData}
      loading={loading}
      error={error}
      className={className}
      showExport={true}
      showRefresh={!!onRefresh}
      onRefresh={onRefresh}
      ariaLabel={`${title} comparing ${chartData.length} categories`}
      testId="comparison-chart"
    >
      {renderChart()}
    </BaseChart>
  )
}
