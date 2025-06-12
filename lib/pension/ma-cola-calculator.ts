/**
 * Massachusetts Pension Cost-of-Living Adjustment (COLA) Calculator
 * Updated for FY2025 COLA structure and ongoing policy discussions
 */

import { 
  MA_PENSION_COLA_CONFIG, 
  calculateMAPensionCOLA, 
  calculateMAPensionCOLAProjections,
  getMAPensionCOLAInfo 
} from '../pension-calculations'

export interface MAPensionCOLAResult {
  originalPension: number
  colaEligibleAmount: number
  colaIncrease: number
  adjustedPension: number
  maxPossibleIncrease: number
  isAtMaximum: boolean
  monthlyIncrease: number
  effectiveRate: number // Actual COLA rate as percentage of total pension
}

export interface MAPensionCOLAProjection {
  year: number
  startingPension: number
  colaIncrease: number
  endingPension: number
  cumulativeIncrease: number
  isAtMaximum: boolean
  monthlyPension: number
  monthlyIncrease: number
}

/**
 * Enhanced MA Pension COLA calculation with additional metrics
 */
export function calculateEnhancedMAPensionCOLA(
  annualPension: number,
  colaRate: number = MA_PENSION_COLA_CONFIG.currentRate,
  baseAmount: number = MA_PENSION_COLA_CONFIG.baseAmount
): MAPensionCOLAResult {
  const basicResult = calculateMAPensionCOLA(annualPension, colaRate, baseAmount)
  
  // Calculate additional metrics
  const monthlyIncrease = basicResult.colaIncrease / 12
  const effectiveRate = annualPension > 0 ? (basicResult.colaIncrease / annualPension) * 100 : 0

  return {
    ...basicResult,
    monthlyIncrease: Math.round(monthlyIncrease * 100) / 100, // Round to cents
    effectiveRate: Math.round(effectiveRate * 10) / 10 // Round to 1 decimal place
  }
}

/**
 * Enhanced MA Pension COLA projections with monthly calculations
 */
export function calculateEnhancedMAPensionCOLAProjections(
  initialPension: number,
  years: number,
  assumedColaRate: number = MA_PENSION_COLA_CONFIG.currentRate,
  baseAmount: number = MA_PENSION_COLA_CONFIG.baseAmount
): MAPensionCOLAProjection[] {
  const basicProjections = calculateMAPensionCOLAProjections(
    initialPension, 
    years, 
    assumedColaRate, 
    baseAmount
  )

  return basicProjections.map(projection => ({
    ...projection,
    monthlyPension: Math.round((projection.endingPension / 12) * 100) / 100,
    monthlyIncrease: Math.round((projection.colaIncrease / 12) * 100) / 100
  }))
}

/**
 * Compare different COLA scenarios
 */
export function compareCOLAScenarios(
  annualPension: number,
  years: number = 20
): {
  currentStructure: MAPensionCOLAProjection[]
  ifBaseIncreased: MAPensionCOLAProjection[]
  ifRateIncreased: MAPensionCOLAProjection[]
  comparison: {
    currentTotal: number
    increasedBaseTotal: number
    increasedRateTotal: number
    baseDifference: number
    rateDifference: number
  }
} {
  // Current structure (3% on first $13,000)
  const currentStructure = calculateEnhancedMAPensionCOLAProjections(
    annualPension, 
    years, 
    0.03, 
    13000
  )

  // Scenario: Increased base to $20,000 (keeping 3% rate)
  const ifBaseIncreased = calculateEnhancedMAPensionCOLAProjections(
    annualPension, 
    years, 
    0.03, 
    20000
  )

  // Scenario: Increased rate to 3.5% (keeping $13,000 base)
  const ifRateIncreased = calculateEnhancedMAPensionCOLAProjections(
    annualPension, 
    years, 
    0.035, 
    13000
  )

  // Calculate totals
  const currentTotal = currentStructure[years - 1]?.endingPension || 0
  const increasedBaseTotal = ifBaseIncreased[years - 1]?.endingPension || 0
  const increasedRateTotal = ifRateIncreased[years - 1]?.endingPension || 0

  return {
    currentStructure,
    ifBaseIncreased,
    ifRateIncreased,
    comparison: {
      currentTotal,
      increasedBaseTotal,
      increasedRateTotal,
      baseDifference: increasedBaseTotal - currentTotal,
      rateDifference: increasedRateTotal - currentTotal
    }
  }
}

/**
 * Get COLA impact analysis for different pension amounts
 */
export function analyzeCOLAImpactByPensionLevel(): Array<{
  pensionLevel: string
  annualPension: number
  colaIncrease: number
  effectiveRate: number
  isAtMaximum: boolean
  description: string
}> {
  const pensionLevels = [
    { level: 'Low', amount: 8000, description: 'Below COLA base amount' },
    { level: 'Base', amount: 13000, description: 'Exactly at COLA base amount' },
    { level: 'Medium', amount: 25000, description: 'Moderate pension above base' },
    { level: 'High', amount: 50000, description: 'Higher pension well above base' },
    { level: 'Maximum', amount: 80000, description: 'Near maximum pension (80% cap)' }
  ]

  return pensionLevels.map(({ level, amount, description }) => {
    const result = calculateEnhancedMAPensionCOLA(amount)
    return {
      pensionLevel: level,
      annualPension: amount,
      colaIncrease: result.colaIncrease,
      effectiveRate: result.effectiveRate,
      isAtMaximum: result.isAtMaximum,
      description
    }
  })
}

/**
 * Get comprehensive COLA information for UI display
 */
export function getCOLADisplayInfo() {
  const basicInfo = getMAPensionCOLAInfo()
  
  return {
    ...basicInfo,
    config: MA_PENSION_COLA_CONFIG,
    examples: analyzeCOLAImpactByPensionLevel(),
    keyFacts: [
      `Current COLA rate: ${basicInfo.currentRate} for FY2025`,
      `COLA base amount: ${basicInfo.baseAmount} (unchanged for many years)`,
      `Maximum annual increase: ${basicInfo.maxAnnualIncrease}`,
      `Maximum monthly increase: ${basicInfo.maxMonthlyIncrease}`,
      'COLA only applies to first portion of pension benefit',
      'Higher pensions receive lower effective COLA rates'
    ],
    legislativeContext: [
      'COLA requires annual legislative approval - not automatic',
      'Special COLA Commission reviewing potential base amount increases',
      'Base amount of $13,000 has not increased in many years',
      'Some proposals suggest increasing base to $15,000 or $20,000',
      'Any changes would require legislative action and budget approval'
    ]
  }
}

// Export the configuration for use in other components
export { MA_PENSION_COLA_CONFIG }
