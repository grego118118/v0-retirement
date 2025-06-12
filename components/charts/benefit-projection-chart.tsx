"use client"

import React, { useMemo } from 'react'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  Brush
} from 'recharts'
import { BaseChart } from './base-chart'
import { 
  CHART_COLORS, 
  TOOLTIP_CONFIG, 
  LEGEND_CONFIG, 
  GRID_CONFIG,
  AXIS_CONFIG,
  CHART_TYPE_CONFIG,
  formatChartCurrency,
  formatChartPercentage
} from '@/lib/charts/chart-config'

export interface BenefitProjectionData {
  age: number
  year: number
  pensionBenefit: number
  socialSecurityBenefit: number
  totalBenefit: number
  colaAdjustedPension?: number
  colaAdjustedSS?: number
  colaAdjustedTotal?: number
  inflationRate?: number
  notes?: string
}

export interface BenefitProjectionChartProps {
  data: BenefitProjectionData[]
  title?: string
  description?: string
  showCOLA?: boolean
  showInflation?: boolean
  chartType?: 'line' | 'area'
  enableZoom?: boolean
  enableBrush?: boolean
  highlightRetirementAge?: number
  className?: string
  loading?: boolean
  error?: string | null
  onRefresh?: () => void
}

export function BenefitProjectionChart({
  data,
  title = "Retirement Benefit Projections",
  description = "Projected pension and Social Security benefits over time",
  showCOLA = true,
  showInflation = false,
  chartType = 'area',
  enableZoom = true,
  enableBrush = false,
  highlightRetirementAge,
  className,
  loading,
  error,
  onRefresh
}: BenefitProjectionChartProps) {

  // Process data for chart display
  const chartData = useMemo(() => {
    return data.map(item => ({
      ...item,
      ageLabel: `Age ${item.age}`,
      yearLabel: item.year.toString(),
      // Format values for display
      pensionDisplay: formatChartCurrency(item.pensionBenefit),
      ssDisplay: formatChartCurrency(item.socialSecurityBenefit),
      totalDisplay: formatChartCurrency(item.totalBenefit),
      colaDisplay: showCOLA && item.colaAdjustedTotal ? formatChartCurrency(item.colaAdjustedTotal) : null,
      inflationDisplay: showInflation && item.inflationRate ? formatChartPercentage(item.inflationRate) : null
    }))
  }, [data, showCOLA, showInflation])

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white dark:bg-slate-800 p-4 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg">
          <p className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
            {data.ageLabel} ({data.yearLabel})
          </p>
          
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4 mb-1">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  {entry.name}:
                </span>
              </div>
              <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                {formatChartCurrency(entry.value)}
              </span>
            </div>
          ))}

          {showInflation && data.inflationRate && (
            <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Inflation Rate: {formatChartPercentage(data.inflationRate)}
              </span>
            </div>
          )}

          {data.notes && (
            <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {data.notes}
              </span>
            </div>
          )}
        </div>
      )
    }
    return null
  }

  // Chart component based on type
  const ChartComponent = chartType === 'area' ? AreaChart : LineChart

  const renderChart = () => (
    <ChartComponent
      data={chartData}
      margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
    >
      <CartesianGrid 
        strokeDasharray={GRID_CONFIG.strokeDasharray}
        stroke={GRID_CONFIG.stroke}
        opacity={GRID_CONFIG.opacity}
      />
      
      <XAxis 
        dataKey="ageLabel"
        tick={AXIS_CONFIG.tick}
        axisLine={AXIS_CONFIG.axisLine}
        tickLine={false}
      />
      
      <YAxis 
        tick={AXIS_CONFIG.tick}
        axisLine={AXIS_CONFIG.axisLine}
        tickLine={false}
        tickFormatter={formatChartCurrency}
      />

      <Tooltip content={<CustomTooltip />} />
      
      <Legend 
        {...LEGEND_CONFIG}
        wrapperStyle={{
          ...LEGEND_CONFIG.wrapperStyle,
          fontSize: '12px'
        }}
      />

      {/* Highlight retirement age if provided */}
      {highlightRetirementAge && (
        <ReferenceLine 
          x={`Age ${highlightRetirementAge}`}
          stroke={CHART_COLORS.warning}
          strokeDasharray="5 5"
          label={{ value: "Retirement", position: "top" }}
        />
      )}

      {/* Pension Benefits */}
      {chartType === 'area' ? (
        <Area
          type="monotone"
          dataKey="pensionBenefit"
          stackId="1"
          stroke={CHART_COLORS.pension}
          fill={CHART_COLORS.pension}
          fillOpacity={CHART_TYPE_CONFIG.area.fillOpacity}
          strokeWidth={CHART_TYPE_CONFIG.area.strokeWidth}
          name="Pension Benefits"
          dot={CHART_TYPE_CONFIG.area.dot}
          activeDot={CHART_TYPE_CONFIG.area.activeDot}
        />
      ) : (
        <Line
          type="monotone"
          dataKey="pensionBenefit"
          stroke={CHART_COLORS.pension}
          strokeWidth={CHART_TYPE_CONFIG.line.strokeWidth}
          name="Pension Benefits"
          dot={CHART_TYPE_CONFIG.line.dot}
          activeDot={CHART_TYPE_CONFIG.line.activeDot}
        />
      )}

      {/* Social Security Benefits */}
      {chartType === 'area' ? (
        <Area
          type="monotone"
          dataKey="socialSecurityBenefit"
          stackId="1"
          stroke={CHART_COLORS.socialSecurity}
          fill={CHART_COLORS.socialSecurity}
          fillOpacity={CHART_TYPE_CONFIG.area.fillOpacity}
          strokeWidth={CHART_TYPE_CONFIG.area.strokeWidth}
          name="Social Security"
          dot={CHART_TYPE_CONFIG.area.dot}
          activeDot={CHART_TYPE_CONFIG.area.activeDot}
        />
      ) : (
        <Line
          type="monotone"
          dataKey="socialSecurityBenefit"
          stroke={CHART_COLORS.socialSecurity}
          strokeWidth={CHART_TYPE_CONFIG.line.strokeWidth}
          name="Social Security"
          dot={CHART_TYPE_CONFIG.line.dot}
          activeDot={CHART_TYPE_CONFIG.line.activeDot}
        />
      )}

      {/* COLA Adjusted Total (if enabled) */}
      {showCOLA && (
        chartType === 'area' ? (
          <Area
            type="monotone"
            dataKey="colaAdjustedTotal"
            stroke={CHART_COLORS.projected}
            fill="none"
            strokeWidth={2}
            strokeDasharray="5 5"
            name="COLA Adjusted Total"
            dot={false}
          />
        ) : (
          <Line
            type="monotone"
            dataKey="colaAdjustedTotal"
            stroke={CHART_COLORS.projected}
            strokeWidth={2}
            strokeDasharray="5 5"
            name="COLA Adjusted Total"
            dot={false}
          />
        )
      )}

      {/* Brush for zooming (if enabled) */}
      {enableBrush && (
        <Brush 
          dataKey="ageLabel" 
          height={30}
          stroke={CHART_COLORS.pension}
          fill={CHART_COLORS.background}
        />
      )}
    </ChartComponent>
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
      ariaLabel={`${title} showing benefit projections from age ${chartData[0]?.age || 'unknown'} to ${chartData[chartData.length - 1]?.age || 'unknown'}`}
      testId="benefit-projection-chart"
    >
      {renderChart()}
    </BaseChart>
  )
}
