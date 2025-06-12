/**
 * Scenario Modeling Components
 * 
 * Comprehensive suite of components for retirement scenario modeling,
 * comparison, and visualization in the Massachusetts Retirement System.
 */

// Core scenario modeling components
export { ScenarioBuilder } from './scenario-builder'
export { ScenarioList } from './scenario-list'
export { ScenarioCard } from './scenario-card'

// Scenario comparison visualization components
export { ScenarioComparisonTable } from './scenario-comparison-table'
export { ScenarioComparisonCharts } from './scenario-comparison-charts'
export { ScenarioComparisonDashboard } from './scenario-comparison-dashboard'

// Types and interfaces
export type {
  RetirementScenario,
  ScenarioResults,
  ScenarioComparison,
  ComparisonMetrics,
  ComparisonRecommendation,
  YearlyProjection
} from '@/lib/scenario-modeling/scenario-types'

// Utility functions
export { compareScenarios } from '@/lib/scenario-modeling/scenario-comparison'
export { calculateScenario } from '@/lib/scenario-modeling/scenario-calculator'
export { 
  validateScenario,
  generateScenarioId,
  cloneScenario,
  compareScenarios as compareScenarioUtils
} from '@/lib/scenario-modeling/scenario-utils'

// Default configurations for common use cases
export const DEFAULT_SCENARIO_CONFIGS = {
  earlyRetirement: {
    name: 'Early Retirement',
    description: 'Retire early with reduced benefits',
    retirementAge: 62,
    socialSecurityClaimingAge: 62,
    riskTolerance: 'conservative' as const
  },
  standardRetirement: {
    name: 'Standard Retirement',
    description: 'Traditional retirement at full retirement age',
    retirementAge: 65,
    socialSecurityClaimingAge: 67,
    riskTolerance: 'moderate' as const
  },
  delayedRetirement: {
    name: 'Delayed Retirement',
    description: 'Work longer for maximum benefits',
    retirementAge: 67,
    socialSecurityClaimingAge: 70,
    riskTolerance: 'moderate' as const
  },
  conservativeApproach: {
    name: 'Conservative Approach',
    description: 'Low-risk strategy with stable income',
    retirementAge: 65,
    socialSecurityClaimingAge: 67,
    riskTolerance: 'conservative' as const,
    withdrawalRate: 0.035
  },
  aggressiveGrowth: {
    name: 'Aggressive Growth',
    description: 'Higher risk for potentially higher returns',
    retirementAge: 63,
    socialSecurityClaimingAge: 67,
    riskTolerance: 'aggressive' as const,
    withdrawalRate: 0.045
  }
} as const

// Chart configuration presets
export const COMPARISON_CHART_CONFIGS = {
  incomeComparison: {
    title: 'Monthly Income Comparison',
    description: 'Compare monthly retirement income across scenarios',
    chartType: 'bar' as const,
    showTarget: true,
    targetValue: 6000,
    colorScheme: 'income' as const
  },
  lifetimeProjection: {
    title: 'Lifetime Income Projections',
    description: 'Income projections over retirement years',
    chartType: 'line' as const,
    enableZoom: true,
    showCOLA: true,
    colorScheme: 'timeline' as const
  },
  riskAnalysis: {
    title: 'Risk Analysis Comparison',
    description: 'Compare risk, flexibility, and optimization scores',
    chartType: 'radar' as const,
    maxValue: 10,
    colorScheme: 'risk' as const
  },
  taxEfficiency: {
    title: 'Tax Efficiency Analysis',
    description: 'Compare effective tax rates and tax burden',
    chartType: 'bar' as const,
    showTarget: true,
    targetValue: 0.15,
    colorScheme: 'tax' as const
  }
} as const

// Table configuration presets
export const COMPARISON_TABLE_CONFIGS = {
  summary: {
    title: 'Scenario Summary',
    description: 'Key metrics overview',
    columns: ['name', 'monthlyIncome', 'riskScore'],
    compactView: true,
    showOptimalIndicators: true
  },
  detailed: {
    title: 'Detailed Comparison',
    description: 'Comprehensive scenario analysis',
    columns: ['name', 'monthlyIncome', 'lifetimeIncome', 'replacementRatio', 'riskScore', 'taxRate'],
    compactView: false,
    showOptimalIndicators: true
  },
  income: {
    title: 'Income Analysis',
    description: 'Focus on income-related metrics',
    columns: ['name', 'monthlyIncome', 'lifetimeIncome', 'replacementRatio'],
    compactView: false,
    showOptimalIndicators: true
  },
  risk: {
    title: 'Risk Assessment',
    description: 'Focus on risk and flexibility metrics',
    columns: ['name', 'riskScore', 'flexibilityScore', 'optimizationScore'],
    compactView: false,
    showOptimalIndicators: true
  }
} as const

// Performance optimization constants
export const PERFORMANCE_CONFIGS = {
  maxScenariosForRealTimeComparison: 10,
  maxYearsForDetailedProjection: 30,
  chartRenderTimeout: 2000, // 2 seconds max render time
  tablePageSize: 25,
  debounceDelay: 300,
  cacheTimeout: 300000 // 5 minutes
} as const

// Accessibility configurations
export const ACCESSIBILITY_CONFIGS = {
  colorBlindFriendlyPalette: [
    '#1f77b4', // Blue
    '#ff7f0e', // Orange
    '#2ca02c', // Green
    '#d62728', // Red
    '#9467bd', // Purple
    '#8c564b', // Brown
    '#e377c2', // Pink
    '#7f7f7f', // Gray
    '#bcbd22', // Olive
    '#17becf'  // Cyan
  ],
  highContrastMode: {
    enabled: false,
    textColor: '#000000',
    backgroundColor: '#ffffff',
    borderColor: '#000000'
  },
  screenReaderLabels: {
    comparisonTable: 'Retirement scenario comparison table',
    comparisonChart: 'Retirement scenario comparison chart',
    optimalIndicator: 'Optimal scenario for this metric',
    riskBadge: 'Risk level indicator',
    sortButton: 'Sort scenarios by this metric'
  }
} as const

// Export validation schemas
export const VALIDATION_SCHEMAS = {
  minScenariosForComparison: 2,
  maxScenariosForComparison: 20,
  requiredFields: [
    'name',
    'personalParameters.retirementAge',
    'pensionParameters.retirementGroup',
    'socialSecurityParameters.claimingAge'
  ],
  numericRanges: {
    retirementAge: { min: 50, max: 75 },
    riskScore: { min: 1, max: 10 },
    replacementRatio: { min: 0.3, max: 2.0 },
    taxRate: { min: 0, max: 0.5 }
  }
} as const
