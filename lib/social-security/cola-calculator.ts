/**
 * Social Security Cost of Living Adjustment (COLA) Calculator
 * Based on historical SSA COLA rates and projections
 */

// Historical COLA rates (last 10 years for reference)
export const HISTORICAL_COLA_RATES = [
  { year: 2024, rate: 3.2 },
  { year: 2023, rate: 8.7 },
  { year: 2022, rate: 5.9 },
  { year: 2021, rate: 1.3 },
  { year: 2020, rate: 1.6 },
  { year: 2019, rate: 2.8 },
  { year: 2018, rate: 2.0 },
  { year: 2017, rate: 0.3 },
  { year: 2016, rate: 0.0 },
  { year: 2015, rate: 1.7 },
]

// Default COLA assumptions for future projections
export const DEFAULT_COLA_ASSUMPTIONS = {
  conservative: 2.0, // Conservative estimate
  moderate: 2.5,     // Moderate estimate (SSA long-term assumption)
  optimistic: 3.0,   // Higher inflation scenario
}

export interface COLAProjection {
  year: number
  adjustedBenefit: number
  cumulativeIncrease: number
  inflationRate: number
}

export interface COLACalculationOptions {
  startingBenefit: number
  startYear: number
  endYear: number
  inflationRate?: number
  inflationScenario?: 'conservative' | 'moderate' | 'optimistic'
}

/**
 * Calculate COLA-adjusted Social Security benefits over time
 */
export function calculateCOLAProjections(options: COLACalculationOptions): COLAProjection[] {
  const {
    startingBenefit,
    startYear,
    endYear,
    inflationRate,
    inflationScenario = 'moderate'
  } = options

  // Use provided rate or scenario default
  const annualInflationRate = inflationRate || DEFAULT_COLA_ASSUMPTIONS[inflationScenario]
  
  const projections: COLAProjection[] = []
  let currentBenefit = startingBenefit
  let cumulativeIncrease = 0

  for (let year = startYear; year <= endYear; year++) {
    if (year > startYear) {
      // Apply COLA adjustment
      const increase = currentBenefit * (annualInflationRate / 100)
      currentBenefit += increase
      cumulativeIncrease += increase
    }

    projections.push({
      year,
      adjustedBenefit: Math.round(currentBenefit),
      cumulativeIncrease: Math.round(cumulativeIncrease),
      inflationRate: annualInflationRate
    })
  }

  return projections
}

/**
 * Calculate purchasing power comparison
 */
export function calculatePurchasingPower(
  futureBenefit: number,
  yearsFromNow: number,
  inflationRate: number = 2.5
): {
  futureValue: number
  todaysPurchasingPower: number
  purchasingPowerLoss: number
} {
  const todaysPurchasingPower = futureBenefit / Math.pow(1 + inflationRate / 100, yearsFromNow)
  const purchasingPowerLoss = futureBenefit - todaysPurchasingPower

  return {
    futureValue: Math.round(futureBenefit),
    todaysPurchasingPower: Math.round(todaysPurchasingPower),
    purchasingPowerLoss: Math.round(purchasingPowerLoss)
  }
}

/**
 * Get average COLA rate from historical data
 */
export function getHistoricalAverageCOLA(years: number = 10): number {
  const recentRates = HISTORICAL_COLA_RATES.slice(0, years)
  const average = recentRates.reduce((sum, item) => sum + item.rate, 0) / recentRates.length
  return Math.round(average * 10) / 10 // Round to 1 decimal place
}

/**
 * Format COLA projection for display
 */
export function formatCOLAProjection(projection: COLAProjection): string {
  return `${projection.year}: $${projection.adjustedBenefit.toLocaleString()} (+$${projection.cumulativeIncrease.toLocaleString()})`
}
