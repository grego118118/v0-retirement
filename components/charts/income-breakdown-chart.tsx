"use client"

import React, { useMemo, useState } from 'react'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import { BaseChart } from './base-chart'
import { 
  CHART_COLORS, 
  CHART_TYPE_CONFIG,
  formatChartCurrency,
  formatChartPercentage
} from '@/lib/charts/chart-config'

export interface IncomeBreakdownData {
  category: string
  value: number
  percentage: number
  color?: string
  description?: string
  subcategories?: {
    name: string
    value: number
    percentage: number
  }[]
}

export interface IncomeBreakdownChartProps {
  data: IncomeBreakdownData[]
  title?: string
  description?: string
  chartType?: 'pie' | 'donut'
  showPercentages?: boolean
  showValues?: boolean
  enableHover?: boolean
  enableClick?: boolean
  colorScheme?: 'default' | 'income' | 'custom'
  className?: string
  loading?: boolean
  error?: string | null
  onRefresh?: () => void
  onSegmentClick?: (data: IncomeBreakdownData) => void
}

export function IncomeBreakdownChart({
  data,
  title = "Retirement Income Breakdown",
  description = "Distribution of retirement income sources",
  chartType = 'donut',
  showPercentages = true,
  showValues = true,
  enableHover = true,
  enableClick = false,
  colorScheme = 'income',
  className,
  loading,
  error,
  onRefresh,
  onSegmentClick
}: IncomeBreakdownChartProps) {

  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  // Color scheme selection
  const colors = useMemo(() => {
    switch (colorScheme) {
      case 'income':
        return [
          CHART_COLORS.pension,
          CHART_COLORS.socialSecurity,
          CHART_COLORS.healthcare,
          CHART_COLORS.other,
          CHART_COLORS.current,
          CHART_COLORS.projected
        ]
      case 'custom':
        return data.map(item => item.color || CHART_COLORS.pension)
      default:
        return [
          CHART_COLORS.pension,
          CHART_COLORS.socialSecurity,
          CHART_COLORS.healthcare,
          CHART_COLORS.other,
          CHART_COLORS.warning,
          CHART_COLORS.target
        ]
    }
  }, [colorScheme, data])

  // Process data for chart display
  const chartData = useMemo(() => {
    return data.map((item, index) => ({
      ...item,
      displayValue: formatChartCurrency(item.value),
      displayPercentage: formatChartPercentage(item.percentage),
      color: item.color || colors[index % colors.length],
      // Calculate total for percentage validation
      isValid: item.percentage >= 0 && item.percentage <= 100
    }))
  }, [data, colors])

  // Calculate total value for validation
  const totalValue = useMemo(() => {
    return chartData.reduce((sum, item) => sum + item.value, 0)
  }, [chartData])

  // Custom tooltip component
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white dark:bg-slate-800 p-4 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <div 
              className="w-4 h-4 rounded-full" 
              style={{ backgroundColor: data.color }}
            />
            <p className="font-semibold text-slate-900 dark:text-slate-100">
              {data.category}
            </p>
          </div>
          
          <div className="space-y-1">
            {showValues && (
              <div className="flex justify-between gap-4">
                <span className="text-sm text-slate-600 dark:text-slate-400">Amount:</span>
                <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  {data.displayValue}
                </span>
              </div>
            )}
            
            {showPercentages && (
              <div className="flex justify-between gap-4">
                <span className="text-sm text-slate-600 dark:text-slate-400">Percentage:</span>
                <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  {data.displayPercentage}
                </span>
              </div>
            )}
          </div>

          {data.description && (
            <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-700">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {data.description}
              </span>
            </div>
          )}

          {data.subcategories && data.subcategories.length > 0 && (
            <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-700">
              <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
                Breakdown:
              </p>
              <div className="space-y-1">
                {data.subcategories.map((sub: any, index: number) => (
                  <div key={index} className="flex justify-between gap-2 text-xs">
                    <span className="text-slate-500 dark:text-slate-400">{sub.name}:</span>
                    <span className="text-slate-700 dark:text-slate-300">
                      {formatChartCurrency(sub.value)} ({formatChartPercentage(sub.percentage)})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )
    }
    return null
  }

  // Handle mouse enter for hover effects
  const handleMouseEnter = (data: any, index: number) => {
    if (enableHover) {
      setActiveIndex(index)
    }
  }

  // Handle mouse leave
  const handleMouseLeave = () => {
    if (enableHover) {
      setActiveIndex(null)
    }
  }

  // Handle segment click
  const handleClick = (data: any) => {
    if (enableClick && onSegmentClick) {
      onSegmentClick(data)
    }
  }

  // Custom label function
  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, category }: any) => {
    if (percent < 0.05) return null // Don't show labels for segments < 5%

    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize="12"
        fontWeight="500"
      >
        {showPercentages ? `${(percent * 100).toFixed(0)}%` : category}
      </text>
    )
  }

  // Calculate chart dimensions
  const innerRadius = chartType === 'donut' ? CHART_TYPE_CONFIG.pie.innerRadius : 0
  const outerRadius = CHART_TYPE_CONFIG.pie.outerRadius

  const renderChart = () => (
    <PieChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
      <Pie
        data={chartData}
        cx="50%"
        cy="50%"
        labelLine={false}
        label={renderCustomLabel}
        outerRadius={outerRadius}
        innerRadius={innerRadius}
        paddingAngle={CHART_TYPE_CONFIG.pie.paddingAngle}
        dataKey="value"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        style={{ cursor: enableClick ? 'pointer' : 'default' }}
      >
        {chartData.map((entry, index) => (
          <Cell 
            key={`cell-${index}`} 
            fill={entry.color}
            stroke={activeIndex === index ? '#ffffff' : 'none'}
            strokeWidth={activeIndex === index ? 2 : 0}
            style={{
              filter: activeIndex === index ? 'brightness(1.1)' : 'none',
              transition: 'all 0.2s ease-in-out'
            }}
          />
        ))}
      </Pie>
      
      {enableHover && <Tooltip content={<CustomTooltip />} />}
      
      <Legend 
        verticalAlign="bottom"
        height={36}
        iconType="circle"
        wrapperStyle={{
          fontSize: '12px',
          paddingTop: '16px'
        }}
        formatter={(value, entry: any) => (
          <span style={{ color: entry.color }}>
            {value}
            {showValues && ` (${formatChartCurrency(entry.payload.value)})`}
            {showPercentages && ` - ${formatChartPercentage(entry.payload.percentage)}`}
          </span>
        )}
      />
    </PieChart>
  )

  // Add center text for donut charts
  const CenterText = () => {
    if (chartType !== 'donut') return null
    
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <div className="text-center">
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {formatChartCurrency(totalValue)}
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400">
            Total Income
          </div>
        </div>
      </div>
    )
  }

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
      ariaLabel={`${title} showing ${chartData.length} income categories with total value of ${formatChartCurrency(totalValue)}`}
      testId="income-breakdown-chart"
    >
      <div className="relative">
        {renderChart()}
        <CenterText />
      </div>
    </BaseChart>
  )
}
