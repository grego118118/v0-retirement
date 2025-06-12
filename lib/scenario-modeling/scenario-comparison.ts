/**
 * Scenario Comparison Engine
 * 
 * Analyzes and compares multiple retirement scenarios to provide insights and recommendations.
 */

import { 
  RetirementScenario, 
  ScenarioResults, 
  ScenarioComparison, 
  ComparisonMetrics, 
  ComparisonRecommendation 
} from './scenario-types'

/**
 * Compare multiple scenarios and generate comprehensive analysis
 */
export function compareScenarios(
  scenarios: RetirementScenario[],
  results: ScenarioResults[]
): ScenarioComparison {
  if (scenarios.length !== results.length) {
    throw new Error('Scenarios and results arrays must have the same length')
  }
  
  if (scenarios.length < 2) {
    throw new Error('At least 2 scenarios are required for comparison')
  }
  
  const comparisonMetrics = calculateComparisonMetrics(scenarios, results)
  const recommendations = generateComparisonRecommendations(scenarios, results, comparisonMetrics)
  
  return {
    scenarios,
    results,
    comparisonMetrics,
    recommendations
  }
}

/**
 * Calculate comparison metrics across all scenarios
 */
function calculateComparisonMetrics(
  scenarios: RetirementScenario[],
  results: ScenarioResults[]
): ComparisonMetrics {
  // Income comparison
  const incomeComparison = {
    highestMonthlyIncome: findHighest(results, r => r.incomeProjections.totalMonthlyIncome),
    highestLifetimeIncome: findHighest(results, r => r.keyMetrics.totalLifetimeIncome),
    highestReplacementRatio: findHighest(results, r => r.incomeProjections.replacementRatio)
  }
  
  // Risk comparison
  const riskComparison = {
    lowestRisk: findLowest(results, r => r.keyMetrics.riskScore),
    highestRisk: findHighest(results, r => r.keyMetrics.riskScore),
    mostFlexible: findHighest(results, r => r.keyMetrics.flexibilityScore)
  }
  
  // Optimization comparison
  const optimizationComparison = {
    mostOptimized: findHighest(results, r => r.keyMetrics.optimizationScore),
    bestTaxEfficiency: findLowest(results, r => r.taxAnalysis.effectiveTaxRate),
    longestPortfolioLife: findHighest(results, r => r.portfolioAnalysis?.portfolioLongevity || 0)
  }
  
  // Break-even analysis
  const breakEvenAnalysis = calculateBreakEvenAnalysis(scenarios, results)
  
  return {
    incomeComparison,
    riskComparison,
    optimizationComparison,
    breakEvenAnalysis
  }
}

/**
 * Generate recommendations based on scenario comparison
 */
function generateComparisonRecommendations(
  scenarios: RetirementScenario[],
  results: ScenarioResults[],
  metrics: ComparisonMetrics
): ComparisonRecommendation[] {
  const recommendations: ComparisonRecommendation[] = []
  
  // Income optimization recommendations
  const incomeRecommendations = generateIncomeRecommendations(scenarios, results, metrics)
  recommendations.push(...incomeRecommendations)
  
  // Risk management recommendations
  const riskRecommendations = generateRiskRecommendations(scenarios, results, metrics)
  recommendations.push(...riskRecommendations)
  
  // Tax optimization recommendations
  const taxRecommendations = generateTaxRecommendations(scenarios, results, metrics)
  recommendations.push(...taxRecommendations)
  
  // Timing recommendations
  const timingRecommendations = generateTimingRecommendations(scenarios, results, metrics)
  recommendations.push(...timingRecommendations)
  
  // Sort by priority
  return recommendations.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 }
    return priorityOrder[b.priority] - priorityOrder[a.priority]
  })
}

/**
 * Generate income optimization recommendations
 */
function generateIncomeRecommendations(
  scenarios: RetirementScenario[],
  results: ScenarioResults[],
  metrics: ComparisonMetrics
): ComparisonRecommendation[] {
  const recommendations: ComparisonRecommendation[] = []
  
  // Highest income scenario recommendation
  const highestIncomeScenario = scenarios.find(s => s.id === metrics.incomeComparison.highestMonthlyIncome.scenarioId)
  const lowestIncomeResult = results.reduce((min, current) => 
    current.incomeProjections.totalMonthlyIncome < min.incomeProjections.totalMonthlyIncome ? current : min
  )
  
  if (highestIncomeScenario) {
    const incomeDifference = metrics.incomeComparison.highestMonthlyIncome.amount - lowestIncomeResult.incomeProjections.totalMonthlyIncome
    
    if (incomeDifference > 500) { // Significant difference
      recommendations.push({
        type: 'income',
        priority: 'high',
        title: 'Maximize Monthly Income',
        description: `The "${highestIncomeScenario.name}" scenario provides $${incomeDifference.toFixed(0)} more per month than your lowest income scenario.`,
        affectedScenarios: [highestIncomeScenario.id, lowestIncomeResult.scenarioId],
        suggestedAction: `Consider adopting the parameters from "${highestIncomeScenario.name}" to maximize your retirement income.`,
        potentialImpact: {
          incomeChange: incomeDifference * 12 // Annual impact
        }
      })
    }
  }
  
  // Replacement ratio recommendation
  const bestReplacementRatio = metrics.incomeComparison.highestReplacementRatio
  if (bestReplacementRatio.ratio < 0.7) { // Less than 70% replacement
    recommendations.push({
      type: 'income',
      priority: 'medium',
      title: 'Improve Income Replacement',
      description: `Your best scenario only replaces ${(bestReplacementRatio.ratio * 100).toFixed(1)}% of your pre-retirement income. Financial experts recommend 70-90%.`,
      affectedScenarios: scenarios.map(s => s.id),
      suggestedAction: 'Consider delaying retirement, increasing savings, or exploring additional income sources.',
      potentialImpact: {
        incomeChange: (0.7 - bestReplacementRatio.ratio) * scenarios[0].pensionParameters.averageSalary
      }
    })
  }
  
  return recommendations
}

/**
 * Generate risk management recommendations
 */
function generateRiskRecommendations(
  scenarios: RetirementScenario[],
  results: ScenarioResults[],
  metrics: ComparisonMetrics
): ComparisonRecommendation[] {
  const recommendations: ComparisonRecommendation[] = []
  
  // High risk scenario warning
  const highRiskScenario = scenarios.find(s => s.id === metrics.riskComparison.highestRisk.scenarioId)
  if (highRiskScenario && metrics.riskComparison.highestRisk.score > 7) {
    recommendations.push({
      type: 'risk',
      priority: 'high',
      title: 'High Risk Scenario Detected',
      description: `The "${highRiskScenario.name}" scenario has a high risk score of ${metrics.riskComparison.highestRisk.score}/10.`,
      affectedScenarios: [highRiskScenario.id],
      suggestedAction: 'Consider more conservative investment allocations or later retirement age to reduce risk.',
      potentialImpact: {
        riskChange: -2
      }
    })
  }
  
  // Flexibility recommendation
  const mostFlexibleScenario = scenarios.find(s => s.id === metrics.riskComparison.mostFlexible.scenarioId)
  if (mostFlexibleScenario && metrics.riskComparison.mostFlexible.score > 7) {
    recommendations.push({
      type: 'risk',
      priority: 'medium',
      title: 'High Flexibility Option',
      description: `The "${mostFlexibleScenario.name}" scenario offers high flexibility with a score of ${metrics.riskComparison.mostFlexible.score}/10.`,
      affectedScenarios: [mostFlexibleScenario.id],
      suggestedAction: 'This scenario provides good options for adjusting your retirement plan if circumstances change.',
      potentialImpact: {
        riskChange: -1
      }
    })
  }
  
  return recommendations
}

/**
 * Generate tax optimization recommendations
 */
function generateTaxRecommendations(
  scenarios: RetirementScenario[],
  results: ScenarioResults[],
  metrics: ComparisonMetrics
): ComparisonRecommendation[] {
  const recommendations: ComparisonRecommendation[] = []
  
  // Tax efficiency recommendation
  const mostEfficientScenario = scenarios.find(s => s.id === metrics.optimizationComparison.bestTaxEfficiency.scenarioId)
  const highestTaxResult = results.reduce((max, current) => 
    current.taxAnalysis.effectiveTaxRate > max.taxAnalysis.effectiveTaxRate ? current : max
  )
  
  if (mostEfficientScenario) {
    const taxSavings = (highestTaxResult.taxAnalysis.effectiveTaxRate - metrics.optimizationComparison.bestTaxEfficiency.effectiveRate) * 
                     highestTaxResult.incomeProjections.totalAnnualIncome
    
    if (taxSavings > 1000) { // Significant tax savings
      recommendations.push({
        type: 'tax',
        priority: 'high',
        title: 'Tax Optimization Opportunity',
        description: `The "${mostEfficientScenario.name}" scenario could save you approximately $${taxSavings.toFixed(0)} annually in taxes.`,
        affectedScenarios: [mostEfficientScenario.id, highestTaxResult.scenarioId],
        suggestedAction: 'Consider implementing tax optimization strategies from the most efficient scenario.',
        potentialImpact: {
          taxSavings: taxSavings
        }
      })
    }
  }
  
  return recommendations
}

/**
 * Generate timing recommendations
 */
function generateTimingRecommendations(
  scenarios: RetirementScenario[],
  results: ScenarioResults[],
  metrics: ComparisonMetrics
): ComparisonRecommendation[] {
  const recommendations: ComparisonRecommendation[] = []
  
  // Early vs normal retirement analysis
  const earlyRetirementScenarios = scenarios.filter(s => s.personalParameters.retirementAge < 65)
  const normalRetirementScenarios = scenarios.filter(s => s.personalParameters.retirementAge >= 65 && s.personalParameters.retirementAge <= 67)
  
  if (earlyRetirementScenarios.length > 0 && normalRetirementScenarios.length > 0) {
    const earlyResults = results.filter(r => earlyRetirementScenarios.some(s => s.id === r.scenarioId))
    const normalResults = results.filter(r => normalRetirementScenarios.some(s => s.id === r.scenarioId))
    
    const avgEarlyIncome = earlyResults.reduce((sum, r) => sum + r.keyMetrics.totalLifetimeIncome, 0) / earlyResults.length
    const avgNormalIncome = normalResults.reduce((sum, r) => sum + r.keyMetrics.totalLifetimeIncome, 0) / normalResults.length
    
    if (avgNormalIncome > avgEarlyIncome) {
      recommendations.push({
        type: 'timing',
        priority: 'medium',
        title: 'Consider Delaying Retirement',
        description: `Waiting until normal retirement age could increase your lifetime income by approximately $${(avgNormalIncome - avgEarlyIncome).toFixed(0)}.`,
        affectedScenarios: [...earlyRetirementScenarios.map(s => s.id), ...normalRetirementScenarios.map(s => s.id)],
        suggestedAction: 'Compare the trade-off between earlier retirement and higher lifetime income.',
        potentialImpact: {
          incomeChange: avgNormalIncome - avgEarlyIncome
        }
      })
    }
  }
  
  return recommendations
}

/**
 * Calculate break-even analysis between scenarios
 */
function calculateBreakEvenAnalysis(
  scenarios: RetirementScenario[],
  results: ScenarioResults[]
): { earlyVsNormal: { breakEvenAge: number; advantage: string }; normalVsDelayed: { breakEvenAge: number; advantage: string } } {
  // Simplified break-even analysis
  // In production, this would be more sophisticated
  
  return {
    earlyVsNormal: {
      breakEvenAge: 75,
      advantage: 'normal'
    },
    normalVsDelayed: {
      breakEvenAge: 80,
      advantage: 'delayed'
    }
  }
}

/**
 * Helper functions for finding min/max values
 */
function findHighest<T>(items: T[], getValue: (item: T) => number): { scenarioId: string; amount: number } {
  let maxItem = items[0]
  let maxValue = getValue(maxItem)
  
  for (const item of items) {
    const value = getValue(item)
    if (value > maxValue) {
      maxValue = value
      maxItem = item
    }
  }
  
  return {
    scenarioId: (maxItem as any).scenarioId,
    amount: maxValue
  }
}

function findLowest<T>(items: T[], getValue: (item: T) => number): { scenarioId: string; amount: number } {
  let minItem = items[0]
  let minValue = getValue(minItem)
  
  for (const item of items) {
    const value = getValue(item)
    if (value < minValue) {
      minValue = value
      minItem = item
    }
  }
  
  return {
    scenarioId: (minItem as any).scenarioId,
    amount: minValue
  }
}
