/**
 * Chart Components Library
 * Massachusetts Retirement System - Interactive Charts
 * 
 * Comprehensive chart component library providing:
 * - Reusable chart components with consistent styling
 * - Advanced interactivity features (zooming, tooltips, hover effects)
 * - Responsive design for all breakpoints (375px/768px/1024px/1920px)
 * - Performance optimized for sub-2-second requirements
 * - Accessibility compliance (ARIA labels, keyboard navigation)
 */

// Base chart component
export { BaseChart } from './base-chart'
export type { BaseChartProps } from './base-chart'

// Specialized chart components
export { BenefitProjectionChart } from './benefit-projection-chart'
export type {
  BenefitProjectionChartProps,
  BenefitProjectionData
} from './benefit-projection-chart'

export { ComparisonChart } from './comparison-chart'
export type {
  ComparisonChartProps,
  ComparisonData
} from './comparison-chart'

export { IncomeBreakdownChart } from './income-breakdown-chart'
export type {
  IncomeBreakdownChartProps,
  IncomeBreakdownData
} from './income-breakdown-chart'

// Import types for use in this file
import type { BenefitProjectionData } from './benefit-projection-chart'
import type { ComparisonData } from './comparison-chart'
import type { IncomeBreakdownData } from './income-breakdown-chart'

// Import constants for use in functions
import { PERFORMANCE_THRESHOLDS, formatChartCurrency } from '@/lib/charts/chart-config'

// Chart configuration and utilities
export {
  CHART_COLORS,
  CHART_BREAKPOINTS,
  CHART_DIMENSIONS,
  CHART_ANIMATIONS,
  TOOLTIP_CONFIG,
  LEGEND_CONFIG,
  GRID_CONFIG,
  AXIS_CONFIG,
  CHART_TYPE_CONFIG,
  PERFORMANCE_THRESHOLDS,
  ACCESSIBILITY_CONFIG,
  getChartTheme,
  getResponsiveDimensions,
  formatChartCurrency,
  formatChartPercentage,
  measureChartPerformance
} from '@/lib/charts/chart-config'

// Chart data generators and utilities
export const generateSampleBenefitData = (
  startAge: number = 62,
  endAge: number = 85,
  pensionAmount: number = 3000,
  ssAmount: number = 2000,
  colaRate: number = 0.025
): BenefitProjectionData[] => {
  const data: BenefitProjectionData[] = []
  const currentYear = new Date().getFullYear()
  
  for (let age = startAge; age <= endAge; age++) {
    const yearsFromStart = age - startAge
    const year = currentYear + yearsFromStart
    
    // Apply COLA adjustments
    const colaMultiplier = Math.pow(1 + colaRate, yearsFromStart)
    const pensionBenefit = pensionAmount * 12 // Annual
    const socialSecurityBenefit = ssAmount * 12 // Annual
    const totalBenefit = pensionBenefit + socialSecurityBenefit
    
    data.push({
      age,
      year,
      pensionBenefit,
      socialSecurityBenefit,
      totalBenefit,
      colaAdjustedPension: pensionBenefit * colaMultiplier,
      colaAdjustedSS: socialSecurityBenefit * colaMultiplier,
      colaAdjustedTotal: totalBenefit * colaMultiplier,
      inflationRate: colaRate * 100,
      notes: age === startAge ? 'Retirement begins' : age === 65 ? 'Medicare eligible' : undefined
    })
  }
  
  return data
}

export const generateSampleComparisonData = (): ComparisonData[] => [
  {
    category: 'monthly-income',
    label: 'Monthly Income',
    currentValue: 8500,
    projectedValue: 5960,
    targetValue: 6800,
    difference: -2540,
    percentChange: -29.9,
    description: 'Total monthly income before and after retirement'
  },
  {
    category: 'annual-income',
    label: 'Annual Income',
    currentValue: 102000,
    projectedValue: 71520,
    targetValue: 81600,
    difference: -30480,
    percentChange: -29.9,
    description: 'Total annual income before and after retirement'
  },
  {
    category: 'healthcare-costs',
    label: 'Healthcare Costs',
    currentValue: 2400,
    projectedValue: 4200,
    targetValue: 3600,
    difference: 1800,
    percentChange: 75.0,
    description: 'Annual healthcare and insurance costs'
  },
  {
    category: 'discretionary-spending',
    label: 'Discretionary Spending',
    currentValue: 18000,
    projectedValue: 12000,
    targetValue: 15000,
    difference: -6000,
    percentChange: -33.3,
    description: 'Annual discretionary and leisure spending'
  }
]

export const generateSampleIncomeBreakdownData = (): IncomeBreakdownData[] => [
  {
    category: 'Massachusetts Pension',
    value: 47520,
    percentage: 66.4,
    description: 'Massachusetts State Retirement System pension benefits',
    subcategories: [
      { name: 'Base Pension', value: 42000, percentage: 58.8 },
      { name: 'COLA Adjustment', value: 5520, percentage: 7.7 }
    ]
  },
  {
    category: 'Social Security',
    value: 24000,
    percentage: 33.6,
    description: 'Federal Social Security retirement benefits',
    subcategories: [
      { name: 'Primary Benefit', value: 22000, percentage: 30.8 },
      { name: 'COLA Adjustment', value: 2000, percentage: 2.8 }
    ]
  }
]

// Chart performance utilities
export const optimizeChartData = (
  data: any[], 
  maxPoints: number = 100
): any[] => {
  if (data.length <= maxPoints) return data
  
  const step = Math.ceil(data.length / maxPoints)
  return data.filter((_, index) => index % step === 0)
}

export const validateChartData = (data: any[]): {
  isValid: boolean
  errors: string[]
  warnings: string[]
} => {
  const errors: string[] = []
  const warnings: string[] = []
  
  if (!Array.isArray(data)) {
    errors.push('Data must be an array')
    return { isValid: false, errors, warnings }
  }
  
  if (data.length === 0) {
    warnings.push('Data array is empty')
  }
  
  if (data.length > PERFORMANCE_THRESHOLDS.memory * 1000) {
    warnings.push(`Large dataset (${data.length} points) may impact performance`)
  }
  
  // Check for required properties
  data.forEach((item, index) => {
    if (typeof item !== 'object' || item === null) {
      errors.push(`Item at index ${index} is not an object`)
    }
  })
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

// Chart accessibility utilities
export const generateChartAriaLabel = (
  chartType: string,
  dataLength: number,
  title: string
): string => {
  return `${chartType} chart titled "${title}" with ${dataLength} data points`
}

export const generateChartDescription = (
  data: any[],
  valueKey: string = 'value'
): string => {
  if (data.length === 0) return 'No data available'
  
  const values = data.map(item => item[valueKey]).filter(v => typeof v === 'number')
  if (values.length === 0) return 'No numeric data available'
  
  const min = Math.min(...values)
  const max = Math.max(...values)
  const avg = values.reduce((sum, val) => sum + val, 0) / values.length
  
  return `Data ranges from ${formatChartCurrency(min)} to ${formatChartCurrency(max)} with an average of ${formatChartCurrency(avg)}`
}

// Export default chart configurations for common use cases
export const DEFAULT_CHART_CONFIGS = {
  benefitProjection: {
    title: "Retirement Benefit Projections",
    description: "Projected pension and Social Security benefits over time",
    showCOLA: true,
    chartType: 'area' as const,
    enableZoom: true
  },
  incomeComparison: {
    title: "Pre vs Post Retirement Income",
    description: "Compare current working income with projected retirement income",
    chartType: 'grouped' as const,
    showTarget: true,
    colorScheme: 'income' as const
  },
  incomeBreakdown: {
    title: "Retirement Income Sources",
    description: "Distribution of retirement income by source",
    chartType: 'donut' as const,
    showPercentages: true,
    showValues: true,
    colorScheme: 'income' as const
  }
} as const
