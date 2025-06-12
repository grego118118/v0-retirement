"use client"

import React from 'react'
import { formatCurrency } from '@/lib/utils'

interface PrintChartProps {
  data: any[]
  type: 'line' | 'bar' | 'pie'
  title: string
  xAxisKey: string
  yAxisKey: string
  height?: number
  showLegend?: boolean
  showValues?: boolean
}

export function PrintChart({
  data,
  type,
  title,
  xAxisKey,
  yAxisKey,
  height = 300,
  showLegend = true,
  showValues = true,
}: PrintChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="chart-container border rounded-lg p-4 text-center" style={{ height }}>
        <div className="flex items-center justify-center h-full text-gray-500">
          <div>
            <div className="text-lg mb-2">📊</div>
            <div className="text-sm">No chart data available</div>
          </div>
        </div>
      </div>
    )
  }

  // Find min and max values for scaling
  const values = data.map(item => typeof item[yAxisKey] === 'number' ? item[yAxisKey] : 0)
  const minValue = Math.min(...values)
  const maxValue = Math.max(...values)
  const valueRange = maxValue - minValue

  // Generate chart based on type
  const renderLineChart = () => {
    const chartHeight = height - 80 // Account for title and labels
    const chartWidth = 100 // Percentage width
    const pointWidth = chartWidth / (data.length - 1)

    return (
      <div className="chart-container">
        <h4 className="text-sm font-medium text-gray-800 mb-4 text-center">{title}</h4>
        
        {/* Chart Area */}
        <div className="relative bg-gray-50 border rounded" style={{ height: chartHeight }}>
          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between text-xs text-gray-600 py-2">
            <span>{formatCurrency(maxValue)}</span>
            <span>{formatCurrency((maxValue + minValue) / 2)}</span>
            <span>{formatCurrency(minValue)}</span>
          </div>

          {/* Chart content */}
          <div className="ml-12 mr-4 h-full relative">
            {/* Grid lines */}
            <div className="absolute inset-0">
              {[0, 25, 50, 75, 100].map(percent => (
                <div
                  key={percent}
                  className="absolute w-full border-t border-gray-200"
                  style={{ top: `${percent}%` }}
                />
              ))}
            </div>

            {/* Data points and line */}
            <svg className="absolute inset-0 w-full h-full">
              {/* Line path */}
              <path
                d={data.map((item, index) => {
                  const x = (index / (data.length - 1)) * 100
                  const y = 100 - ((item[yAxisKey] - minValue) / valueRange) * 100
                  return `${index === 0 ? 'M' : 'L'} ${x}% ${y}%`
                }).join(' ')}
                stroke="#3b82f6"
                strokeWidth="2"
                fill="none"
                vectorEffect="non-scaling-stroke"
              />
              
              {/* Data points */}
              {data.map((item, index) => {
                const x = (index / (data.length - 1)) * 100
                const y = 100 - ((item[yAxisKey] - minValue) / valueRange) * 100
                return (
                  <circle
                    key={index}
                    cx={`${x}%`}
                    cy={`${y}%`}
                    r="3"
                    fill="#3b82f6"
                    stroke="white"
                    strokeWidth="1"
                  />
                )
              })}
            </svg>

            {/* Value labels */}
            {showValues && (
              <div className="absolute inset-0">
                {data.map((item, index) => {
                  const x = (index / (data.length - 1)) * 100
                  const y = 100 - ((item[yAxisKey] - minValue) / valueRange) * 100
                  return (
                    <div
                      key={index}
                      className="absolute text-xs bg-white px-1 rounded shadow-sm transform -translate-x-1/2 -translate-y-full"
                      style={{ left: `${x}%`, top: `${y}%`, marginTop: '-8px' }}
                    >
                      {formatCurrency(item[yAxisKey])}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* X-axis labels */}
          <div className="absolute bottom-0 left-12 right-4 flex justify-between text-xs text-gray-600 mt-2">
            {data.map((item, index) => (
              <span key={index} className="transform -rotate-45 origin-top-left">
                {item[xAxisKey]}
              </span>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const renderBarChart = () => {
    const chartHeight = height - 80
    const barWidth = 80 / data.length // Percentage width per bar

    return (
      <div className="chart-container">
        <h4 className="text-sm font-medium text-gray-800 mb-4 text-center">{title}</h4>
        
        <div className="relative bg-gray-50 border rounded" style={{ height: chartHeight }}>
          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between text-xs text-gray-600 py-2">
            <span>{formatCurrency(maxValue)}</span>
            <span>{formatCurrency((maxValue + minValue) / 2)}</span>
            <span>{formatCurrency(minValue)}</span>
          </div>

          {/* Chart content */}
          <div className="ml-12 mr-4 h-full relative flex items-end justify-around pb-8">
            {data.map((item, index) => {
              const barHeight = ((item[yAxisKey] - minValue) / valueRange) * 100
              const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']
              const color = colors[index % colors.length]

              return (
                <div key={index} className="flex flex-col items-center" style={{ width: `${barWidth}%` }}>
                  {/* Value label */}
                  {showValues && (
                    <div className="text-xs mb-1 text-gray-700">
                      {formatCurrency(item[yAxisKey])}
                    </div>
                  )}
                  
                  {/* Bar */}
                  <div
                    className="w-full rounded-t"
                    style={{
                      height: `${barHeight}%`,
                      backgroundColor: color,
                      minHeight: '4px'
                    }}
                  />
                  
                  {/* X-axis label */}
                  <div className="text-xs text-gray-600 mt-2 text-center transform -rotate-45 origin-center">
                    {item[xAxisKey]}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  const renderPieChart = () => {
    const total = values.reduce((sum, value) => sum + value, 0)
    let currentAngle = 0

    return (
      <div className="chart-container">
        <h4 className="text-sm font-medium text-gray-800 mb-4 text-center">{title}</h4>
        
        <div className="flex items-center justify-center">
          <div className="relative" style={{ width: height * 0.6, height: height * 0.6 }}>
            <svg className="w-full h-full transform -rotate-90">
              {data.map((item, index) => {
                const value = item[yAxisKey]
                const percentage = (value / total) * 100
                const angle = (value / total) * 360
                const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']
                const color = colors[index % colors.length]

                const startAngle = currentAngle
                const endAngle = currentAngle + angle
                currentAngle += angle

                // Calculate path for pie slice
                const radius = 45
                const centerX = 50
                const centerY = 50
                
                const x1 = centerX + radius * Math.cos((startAngle * Math.PI) / 180)
                const y1 = centerY + radius * Math.sin((startAngle * Math.PI) / 180)
                const x2 = centerX + radius * Math.cos((endAngle * Math.PI) / 180)
                const y2 = centerY + radius * Math.sin((endAngle * Math.PI) / 180)
                
                const largeArcFlag = angle > 180 ? 1 : 0
                
                const pathData = [
                  `M ${centerX} ${centerY}`,
                  `L ${x1} ${y1}`,
                  `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                  'Z'
                ].join(' ')

                return (
                  <path
                    key={index}
                    d={pathData}
                    fill={color}
                    stroke="white"
                    strokeWidth="1"
                  />
                )
              })}
            </svg>
          </div>

          {/* Legend */}
          {showLegend && (
            <div className="ml-6 space-y-2">
              {data.map((item, index) => {
                const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']
                const color = colors[index % colors.length]
                const percentage = ((item[yAxisKey] / total) * 100).toFixed(1)

                return (
                  <div key={index} className="flex items-center gap-2 text-xs">
                    <div
                      className="w-3 h-3 rounded"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-gray-700">
                      {item[xAxisKey]}: {formatCurrency(item[yAxisKey])} ({percentage}%)
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    )
  }

  // Render appropriate chart type
  switch (type) {
    case 'line':
      return renderLineChart()
    case 'bar':
      return renderBarChart()
    case 'pie':
      return renderPieChart()
    default:
      return renderBarChart()
  }
}
