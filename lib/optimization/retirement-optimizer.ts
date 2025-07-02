/**
 * Retirement Income Optimization Engine
 * Analyzes optimal claiming strategies for pension and Social Security benefits
 */

import { CombinedCalculationData, OptimizationResult } from '../wizard/wizard-types'
import { measureSync, measureAsync, performanceMonitor } from '../utils/performance-monitor'

export interface OptimizationScenario {
  pensionClaimingAge: number
  socialSecurityClaimingAge: number
  monthlyPensionBenefit: number
  monthlySocialSecurityBenefit: number
  totalMonthlyIncome: number
  lifetimeBenefits: number
  netAfterTaxIncome: number
  score: number
}

export interface BreakEvenAnalysis {
  earlyVsFull: {
    breakEvenAge: number
    earlyBenefits: number
    fullBenefits: number
    recommendation: string
  }
  fullVsDelayed: {
    breakEvenAge: number
    fullBenefits: number
    delayedBenefits: number
    recommendation: string
  }
}

/**
 * Main optimization engine that analyzes all possible claiming strategies
 */
export function optimizeRetirementStrategy(data: CombinedCalculationData): OptimizationResult {
  return measureSync('optimizeRetirementStrategy', () => {
    const scenarios = measureSync('generateAllScenarios', () => generateAllScenarios(data))
    const rankedScenarios = measureSync('rankScenarios', () => rankScenarios(scenarios, data))
    const breakEvenAnalysis = measureSync('calculateBreakEvenPoints', () => calculateBreakEvenPoints(data))

    const recommendedStrategy = rankedScenarios[0]
    const alternativeScenarios = rankedScenarios.slice(1, 4).map(scenario => ({
      name: getScenarioName(scenario),
      pensionAge: scenario.pensionClaimingAge,
      ssAge: scenario.socialSecurityClaimingAge,
      lifetimeBenefits: scenario.lifetimeBenefits,
      monthlyIncome: scenario.totalMonthlyIncome,
      netIncome: scenario.netAfterTaxIncome,
      tradeoffs: getScenarioTradeoffs(scenario, recommendedStrategy)
    }))

    const taxOptimization = measureSync('calculateTaxOptimization', () =>
      calculateTaxOptimization(data, recommendedStrategy)
    )

    const monteCarloResults = (data.preferences as any)?.includeMonteCarloAnalysis ?
      measureSync('runMonteCarloSimulation', () => runMonteCarloSimulation(data, recommendedStrategy)) :
      undefined

    return {
      recommendedStrategy: {
        pensionClaimingAge: recommendedStrategy.pensionClaimingAge,
        socialSecurityClaimingAge: recommendedStrategy.socialSecurityClaimingAge,
        totalLifetimeBenefits: recommendedStrategy.lifetimeBenefits,
        monthlyRetirementIncome: recommendedStrategy.totalMonthlyIncome,
        netAfterTaxIncome: recommendedStrategy.netAfterTaxIncome
      },
      alternativeScenarios,
      breakEvenAnalysis: {
        earlyVsFullRetirement: {
          breakEvenAge: breakEvenAnalysis.earlyVsFull.breakEvenAge,
          earlyTotalBenefits: breakEvenAnalysis.earlyVsFull.earlyBenefits,
          fullTotalBenefits: breakEvenAnalysis.earlyVsFull.fullBenefits
        },
        fullVsDelayed: {
          breakEvenAge: breakEvenAnalysis.fullVsDelayed.breakEvenAge,
          fullTotalBenefits: breakEvenAnalysis.fullVsDelayed.fullBenefits,
          delayedTotalBenefits: breakEvenAnalysis.fullVsDelayed.delayedBenefits
        }
      },
      taxOptimization,
      monteCarloResults
    }
  })
}

/**
 * Generate all possible claiming scenarios
 */
function generateAllScenarios(data: CombinedCalculationData): OptimizationScenario[] {
  const scenarios: OptimizationScenario[] = []
  
  // Pension claiming ages (typically 55-70 for Massachusetts)
  const pensionAges = [55, 60, 62, 65, 67, 70]
  // Social Security claiming ages (62-70)
  const ssAges = [62, 63, 64, 65, 66, 67, 68, 69, 70]
  
  for (const pensionAge of pensionAges) {
    for (const ssAge of ssAges) {
      // Skip invalid combinations (can't claim SS before 62)
      if (ssAge < 62) continue
      
      const scenario = calculateScenario(data, pensionAge, ssAge)
      scenarios.push(scenario)
    }
  }
  
  return scenarios
}

/**
 * Calculate benefits for a specific claiming scenario
 */
function calculateScenario(
  data: CombinedCalculationData, 
  pensionAge: number, 
  ssAge: number
): OptimizationScenario {
  // Calculate pension benefit based on claiming age
  const pensionReductionFactor = calculatePensionReduction(pensionAge, data.pensionData.retirementGroup)
  const monthlyPensionBenefit = data.pensionData.monthlyBenefit * pensionReductionFactor
  
  // Calculate Social Security benefit based on claiming age
  const ssReductionFactor = calculateSSReduction(ssAge, data.socialSecurityData.fullRetirementAge)
  const monthlySocialSecurityBenefit = data.socialSecurityData.fullRetirementBenefit * ssReductionFactor
  
  const totalMonthlyIncome = monthlyPensionBenefit + monthlySocialSecurityBenefit
  
  // Calculate lifetime benefits
  const lifeExpectancy = data.personalInfo.lifeExpectancy
  const pensionYears = Math.max(0, lifeExpectancy - pensionAge)
  const ssYears = Math.max(0, lifeExpectancy - ssAge)
  
  const lifetimeBenefits = 
    (monthlyPensionBenefit * 12 * pensionYears) + 
    (monthlySocialSecurityBenefit * 12 * ssYears)
  
  // Estimate net after-tax income (simplified)
  const netAfterTaxIncome = totalMonthlyIncome * 0.78 // Rough 22% effective tax rate
  
  // Calculate optimization score
  const score = calculateOptimizationScore(
    lifetimeBenefits, 
    totalMonthlyIncome, 
    pensionAge, 
    ssAge, 
    data
  )
  
  return {
    pensionClaimingAge: pensionAge,
    socialSecurityClaimingAge: ssAge,
    monthlyPensionBenefit,
    monthlySocialSecurityBenefit,
    totalMonthlyIncome,
    lifetimeBenefits,
    netAfterTaxIncome,
    score
  }
}

/**
 * Calculate pension reduction factor based on early retirement
 */
function calculatePensionReduction(claimingAge: number, retirementGroup: string): number {
  // Massachusetts pension reduction factors
  let fullRetirementAge: number

  switch (retirementGroup) {
    case '1': // General employees
      fullRetirementAge = 65
      break
    case '2': // Teachers, police, firefighters
      fullRetirementAge = 60
      break
    case '3': // State police
      fullRetirementAge = 55
      break
    default:
      fullRetirementAge = 60
  }

  if (claimingAge >= fullRetirementAge) return 1.0

  // Typical reduction is 6% per year before full retirement
  const yearsEarly = fullRetirementAge - claimingAge
  const reductionPercentage = Math.min(yearsEarly * 0.06, 0.30) // Max 30% reduction

  return 1.0 - reductionPercentage
}

/**
 * Calculate Social Security reduction/increase factor
 */
function calculateSSReduction(claimingAge: number, fullRetirementAge: number): number {
  if (claimingAge === fullRetirementAge) return 1.0
  
  if (claimingAge < fullRetirementAge) {
    // Early retirement reduction
    const monthsEarly = (fullRetirementAge - claimingAge) * 12
    const reductionPercentage = Math.min(monthsEarly * 0.0055, 0.25) // Roughly 6.6% per year, max 25%
    return 1.0 - reductionPercentage
  } else {
    // Delayed retirement credits
    const yearsDelayed = claimingAge - fullRetirementAge
    const increasePercentage = Math.min(yearsDelayed * 0.08, 0.32) // 8% per year, max 32%
    return 1.0 + increasePercentage
  }
}

/**
 * Calculate optimization score for ranking scenarios
 */
function calculateOptimizationScore(
  lifetimeBenefits: number,
  monthlyIncome: number,
  pensionAge: number,
  ssAge: number,
  data: CombinedCalculationData
): number {
  let score = 0
  
  // Weight lifetime benefits (40% of score)
  score += (lifetimeBenefits / 1000000) * 40
  
  // Weight monthly income (30% of score)
  score += (monthlyIncome / 10000) * 30
  
  // Penalty for claiming too early (20% of score)
  const earlyPenalty = Math.max(0, (65 - Math.min(pensionAge, ssAge)) * 2)
  score -= earlyPenalty
  
  // Bonus for meeting income goals (10% of score)
  if (monthlyIncome >= data.preferences.retirementIncomeGoal) {
    score += 10
  }
  
  return score
}

/**
 * Rank scenarios by optimization score
 */
function rankScenarios(scenarios: OptimizationScenario[], data: CombinedCalculationData): OptimizationScenario[] {
  return scenarios.sort((a, b) => b.score - a.score)
}

/**
 * Calculate break-even analysis
 */
function calculateBreakEvenPoints(data: CombinedCalculationData): BreakEvenAnalysis {
  const fullRetirementAge = data.socialSecurityData.fullRetirementAge
  const fullBenefit = data.socialSecurityData.fullRetirementBenefit
  const earlyBenefit = data.socialSecurityData.earlyRetirementBenefit
  const delayedBenefit = data.socialSecurityData.delayedRetirementBenefit
  
  // Early vs Full retirement break-even
  const earlyVsFullBreakEven = calculateBreakEven(62, earlyBenefit, fullRetirementAge, fullBenefit)
  
  // Full vs Delayed retirement break-even
  const fullVsDelayedBreakEven = calculateBreakEven(fullRetirementAge, fullBenefit, 70, delayedBenefit)
  
  return {
    earlyVsFull: {
      breakEvenAge: earlyVsFullBreakEven,
      earlyBenefits: earlyBenefit * 12 * (85 - 62), // Assume life expectancy 85
      fullBenefits: fullBenefit * 12 * (85 - fullRetirementAge),
      recommendation: earlyVsFullBreakEven > 80 ? "Consider early claiming" : "Wait for full retirement"
    },
    fullVsDelayed: {
      breakEvenAge: fullVsDelayedBreakEven,
      fullBenefits: fullBenefit * 12 * (85 - fullRetirementAge),
      delayedBenefits: delayedBenefit * 12 * (85 - 70),
      recommendation: fullVsDelayedBreakEven < 82 ? "Consider delaying to 70" : "Claim at full retirement"
    }
  }
}

/**
 * Calculate break-even age between two claiming strategies
 */
function calculateBreakEven(
  earlyAge: number, 
  earlyBenefit: number, 
  laterAge: number, 
  laterBenefit: number
): number {
  const monthlyDifference = laterBenefit - earlyBenefit
  const monthsOfEarlyBenefits = (laterAge - earlyAge) * 12
  const totalEarlyAdvantage = earlyBenefit * monthsOfEarlyBenefits
  
  const monthsToBreakEven = totalEarlyAdvantage / monthlyDifference
  const breakEvenAge = laterAge + (monthsToBreakEven / 12)
  
  return Math.round(breakEvenAge * 10) / 10 // Round to 1 decimal place
}

/**
 * Get descriptive name for scenario
 */
function getScenarioName(scenario: OptimizationScenario): string {
  const pensionTiming = scenario.pensionClaimingAge <= 62 ? "Early" : 
                      scenario.pensionClaimingAge >= 67 ? "Delayed" : "Standard"
  const ssTiming = scenario.socialSecurityClaimingAge <= 62 ? "Early" : 
                  scenario.socialSecurityClaimingAge >= 70 ? "Delayed" : "Standard"
  
  return `${pensionTiming} Pension + ${ssTiming} Social Security`
}

/**
 * Get tradeoffs for scenario comparison
 */
function getScenarioTradeoffs(scenario: OptimizationScenario, recommended: OptimizationScenario): string[] {
  const tradeoffs: string[] = []
  
  if (scenario.totalMonthlyIncome < recommended.totalMonthlyIncome) {
    const difference = recommended.totalMonthlyIncome - scenario.totalMonthlyIncome
    tradeoffs.push(`$${Math.round(difference)} less monthly income`)
  }
  
  if (scenario.lifetimeBenefits < recommended.lifetimeBenefits) {
    const difference = recommended.lifetimeBenefits - scenario.lifetimeBenefits
    tradeoffs.push(`$${Math.round(difference)} less lifetime benefits`)
  }
  
  if (scenario.pensionClaimingAge < recommended.pensionClaimingAge) {
    tradeoffs.push("Earlier access to pension benefits")
  }
  
  if (scenario.socialSecurityClaimingAge < recommended.socialSecurityClaimingAge) {
    tradeoffs.push("Earlier access to Social Security")
  }
  
  return tradeoffs
}

/**
 * Calculate tax optimization recommendations
 */
function calculateTaxOptimization(data: CombinedCalculationData, scenario: OptimizationScenario) {
  // This will be implemented in the tax calculator
  return {
    currentStrategy: {
      annualTaxBurden: scenario.totalMonthlyIncome * 12 * 0.22,
      effectiveTaxRate: 22,
      marginalTaxRate: 24
    },
    optimizedStrategy: {
      annualTaxBurden: scenario.totalMonthlyIncome * 12 * 0.18,
      effectiveTaxRate: 18,
      marginalTaxRate: 22,
      recommendations: ["Consider Roth conversions", "Optimize withdrawal timing"]
    },
    potentialSavings: scenario.totalMonthlyIncome * 12 * 0.04
  }
}

/**
 * Enhanced Monte Carlo simulation for comprehensive scenario analysis
 */
function runMonteCarloSimulation(data: CombinedCalculationData, scenario: OptimizationScenario) {
  const scenarios = 10000 // Increased for better accuracy
  const results: number[] = []
  const yearlyResults: number[][] = []
  const retirementYears = data.personalInfo.lifeExpectancy - data.personalInfo.retirementGoalAge

  // Economic scenario parameters (use defaults if preferences not available)
  const inflationParams = getInflationParameters((data.preferences as any)?.inflationScenario || 'moderate')
  const marketParams = getMarketParameters((data.preferences as any)?.riskTolerance || 'moderate')

  for (let i = 0; i < scenarios; i++) {
    const yearlyIncome: number[] = []
    let cumulativeInflation = 1.0

    for (let year = 0; year < retirementYears; year++) {
      // Generate correlated random variables for economic factors
      const inflationRate = generateInflationRate(inflationParams, year)
      const marketReturn = generateMarketReturn(marketParams, inflationRate)
      const healthcareCostInflation = generateHealthcareCostInflation(year)

      cumulativeInflation *= (1 + inflationRate)

      // Calculate income components with different inflation adjustments
      const pensionIncome = scenario.monthlyPensionBenefit * 12 * getCOLAMultiplier(year, data.pensionData.retirementGroup)
      const ssIncome = scenario.monthlySocialSecurityBenefit * 12 * (1 + 0.025) ** year // SS COLA
      const otherIncome = data.incomeData.otherRetirementIncome * cumulativeInflation

      // Apply market volatility to investment income
      const investmentIncome = calculateInvestmentIncome(data, marketReturn, year)

      // Calculate healthcare costs with accelerated inflation
      const healthcareCosts = data.incomeData.estimatedMedicarePremiums * healthcareCostInflation

      const totalIncome = pensionIncome + ssIncome + otherIncome + investmentIncome - healthcareCosts
      yearlyIncome.push(totalIncome)
    }

    yearlyResults.push(yearlyIncome)

    // Calculate present value of lifetime income
    const presentValue = yearlyIncome.reduce((pv, income, year) => {
      return pv + income / Math.pow(1.03, year) // 3% discount rate
    }, 0)

    results.push(presentValue)
  }

  results.sort((a, b) => a - b)

  // Calculate additional statistics
  const mean = results.reduce((sum, val) => sum + val, 0) / scenarios
  const variance = results.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / scenarios
  const standardDeviation = Math.sqrt(variance)

  return {
    scenarios,
    successRate: results.filter(r => r >= data.preferences.retirementIncomeGoal * 12 * retirementYears * 0.8).length / scenarios * 100,
    medianOutcome: results[Math.floor(scenarios / 2)],
    meanOutcome: mean,
    standardDeviation,
    worstCase: results[Math.floor(scenarios * 0.05)],
    bestCase: results[Math.floor(scenarios * 0.95)],
    confidenceIntervals: {
      percentile5: results[Math.floor(scenarios * 0.05)],
      percentile10: results[Math.floor(scenarios * 0.1)],
      percentile25: results[Math.floor(scenarios * 0.25)],
      percentile75: results[Math.floor(scenarios * 0.75)],
      percentile90: results[Math.floor(scenarios * 0.9)],
      percentile95: results[Math.floor(scenarios * 0.95)]
    },
    yearlyProjections: calculateYearlyProjections(yearlyResults),
    riskMetrics: {
      probabilityOfShortfall: (results.filter(r => r < data.preferences.retirementIncomeGoal * 12 * retirementYears * 0.8).length / scenarios) * 100,
      expectedShortfall: calculateExpectedShortfall(results, data.preferences.retirementIncomeGoal * 12 * retirementYears * 0.8),
      valueAtRisk95: results[Math.floor(scenarios * 0.05)],
      sharpeRatio: calculateSharpeRatio(results, 0.03) // 3% risk-free rate
    }
  }
}

/**
 * Get inflation parameters based on scenario
 */
function getInflationParameters(scenario: string) {
  switch (scenario) {
    case 'conservative':
      return { mean: 0.035, volatility: 0.015, persistence: 0.7 }
    case 'moderate':
      return { mean: 0.025, volatility: 0.012, persistence: 0.6 }
    case 'optimistic':
      return { mean: 0.020, volatility: 0.010, persistence: 0.5 }
    default:
      return { mean: 0.025, volatility: 0.012, persistence: 0.6 }
  }
}

/**
 * Get market parameters based on risk tolerance
 */
function getMarketParameters(riskTolerance: string) {
  switch (riskTolerance) {
    case 'conservative':
      return { mean: 0.05, volatility: 0.08, correlation: 0.3 }
    case 'moderate':
      return { mean: 0.07, volatility: 0.12, correlation: 0.4 }
    case 'aggressive':
      return { mean: 0.09, volatility: 0.16, correlation: 0.5 }
    default:
      return { mean: 0.07, volatility: 0.12, correlation: 0.4 }
  }
}

/**
 * Generate inflation rate using AR(1) model
 */
function generateInflationRate(params: any, year: number) {
  const shock = (Math.random() - 0.5) * 2 * params.volatility
  const prevInflation = year === 0 ? params.mean : params.mean
  return params.persistence * prevInflation + (1 - params.persistence) * params.mean + shock
}

/**
 * Generate market return correlated with inflation
 */
function generateMarketReturn(params: any, inflationRate: number) {
  const independentShock = (Math.random() - 0.5) * 2 * params.volatility * Math.sqrt(1 - params.correlation ** 2)
  const correlatedShock = params.correlation * inflationRate * params.volatility
  return params.mean + independentShock + correlatedShock
}

/**
 * Generate healthcare cost inflation (typically higher than general inflation)
 */
function generateHealthcareCostInflation(year: number) {
  const baseInflation = 0.04 // 4% base healthcare inflation
  const volatility = 0.02
  const shock = (Math.random() - 0.5) * 2 * volatility
  return Math.pow(1 + baseInflation + shock, year)
}

/**
 * Calculate COLA multiplier for pension based on group
 */
function getCOLAMultiplier(year: number, group: string) {
  // Massachusetts pension COLA varies by group
  const colaRate = group === '3' ? 0.03 : 0.025 // Group 3 gets slightly higher COLA
  return Math.pow(1 + colaRate, year)
}

/**
 * Calculate investment income with market volatility
 */
function calculateInvestmentIncome(data: CombinedCalculationData, marketReturn: number, year: number) {
  const totalSavings = (data.incomeData.traditional401kBalance || 0) + (data.incomeData.rothIRABalance || 0)
  const withdrawalRate = 0.04 // 4% withdrawal rule
  const portfolioValue = totalSavings * Math.pow(1 + marketReturn, year)
  return portfolioValue * withdrawalRate
}

/**
 * Calculate yearly projections from Monte Carlo results
 */
function calculateYearlyProjections(yearlyResults: number[][]) {
  const years = yearlyResults[0].length
  const projections = []

  for (let year = 0; year < years; year++) {
    const yearValues = yearlyResults.map(result => result[year]).sort((a, b) => a - b)
    projections.push({
      year: year + 1,
      median: yearValues[Math.floor(yearValues.length / 2)],
      percentile10: yearValues[Math.floor(yearValues.length * 0.1)],
      percentile25: yearValues[Math.floor(yearValues.length * 0.25)],
      percentile75: yearValues[Math.floor(yearValues.length * 0.75)],
      percentile90: yearValues[Math.floor(yearValues.length * 0.9)]
    })
  }

  return projections
}

/**
 * Calculate expected shortfall (conditional value at risk)
 */
function calculateExpectedShortfall(results: number[], threshold: number) {
  const shortfalls = results.filter(r => r < threshold)
  if (shortfalls.length === 0) return 0
  return shortfalls.reduce((sum, val) => sum + (threshold - val), 0) / shortfalls.length
}

/**
 * Calculate Sharpe ratio for risk-adjusted returns
 */
function calculateSharpeRatio(results: number[], riskFreeRate: number) {
  const mean = results.reduce((sum, val) => sum + val, 0) / results.length
  const variance = results.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / results.length
  const standardDeviation = Math.sqrt(variance)
  return (mean - riskFreeRate) / standardDeviation
}
