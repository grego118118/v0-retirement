/**
 * Massachusetts State Employee Salary Projection with COLA Adjustments
 * 
 * This module calculates projected retirement salary based on current salary
 * and Massachusetts state employee Cost of Living Adjustments (COLA) rates.
 */

export interface SalaryProjectionParams {
  currentSalary: number
  currentDate?: Date
  retirementDate?: Date | string | null
  retirementAge?: number
  currentAge?: number
  colaRate?: number
}

export interface SalaryProjectionResult {
  currentSalary: number
  projectedRetirementSalary: number
  yearsToRetirement: number
  totalGrowth: number
  totalGrowthPercentage: number
  colaRateUsed: number
  projectionMethod: 'date-based' | 'age-based' | 'default'
  isValid: boolean
  errorMessage?: string
}

/**
 * Massachusetts State Employee COLA Rates
 * Based on historical data and typical state employee adjustments
 */
export const MA_STATE_COLA_RATES = {
  CONSERVATIVE: 0.02,   // 2% - Conservative estimate
  TYPICAL: 0.025,       // 2.5% - Typical Massachusetts state employee COLA
  OPTIMISTIC: 0.03,     // 3% - Higher end of typical range
  DEFAULT: 0.025        // Default rate to use
} as const

/**
 * Calculates projected retirement salary with COLA adjustments
 */
export function calculateSalaryProjection(params: SalaryProjectionParams): SalaryProjectionResult {
  const {
    currentSalary,
    currentDate = new Date(),
    retirementDate,
    retirementAge,
    currentAge,
    colaRate = MA_STATE_COLA_RATES.DEFAULT
  } = params

  // Validation
  if (!currentSalary || currentSalary <= 0) {
    return {
      currentSalary: 0,
      projectedRetirementSalary: 0,
      yearsToRetirement: 0,
      totalGrowth: 0,
      totalGrowthPercentage: 0,
      colaRateUsed: colaRate,
      projectionMethod: 'default',
      isValid: false,
      errorMessage: 'Current salary must be greater than 0'
    }
  }

  // Validate COLA rate
  if (colaRate < 0 || colaRate > 0.1) {
    return {
      currentSalary,
      projectedRetirementSalary: currentSalary,
      yearsToRetirement: 0,
      totalGrowth: 0,
      totalGrowthPercentage: 0,
      colaRateUsed: MA_STATE_COLA_RATES.DEFAULT,
      projectionMethod: 'default',
      isValid: false,
      errorMessage: 'COLA rate must be between 0% and 10%'
    }
  }

  let yearsToRetirement = 0
  let projectionMethod: 'date-based' | 'age-based' | 'default' = 'default'

  // Method 1: Calculate based on retirement date
  if (retirementDate && retirementDate !== null) {
    try {
      const retirementDateObj = typeof retirementDate === 'string'
        ? new Date(retirementDate)
        : retirementDate

      if (!isNaN(retirementDateObj.getTime())) {
        const timeDiff = retirementDateObj.getTime() - currentDate.getTime()
        yearsToRetirement = Math.max(0, timeDiff / (1000 * 60 * 60 * 24 * 365.25))
        projectionMethod = 'date-based'
      }
    } catch (error) {
      console.warn('Error parsing retirement date:', error)
    }
  }

  // Method 2: Calculate based on age difference (fallback)
  if (yearsToRetirement === 0 && retirementAge && currentAge) {
    if (retirementAge > currentAge) {
      yearsToRetirement = retirementAge - currentAge
      projectionMethod = 'age-based'
    }
  }

  // Method 3: Default assumption (fallback)
  if (yearsToRetirement === 0) {
    yearsToRetirement = 10 // Default 10 years if no other data available
    projectionMethod = 'default'
  }

  // Handle edge cases
  if (yearsToRetirement < 0) {
    return {
      currentSalary,
      projectedRetirementSalary: currentSalary,
      yearsToRetirement: 0,
      totalGrowth: 0,
      totalGrowthPercentage: 0,
      colaRateUsed: colaRate,
      projectionMethod,
      isValid: false,
      errorMessage: 'Retirement date is in the past'
    }
  }

  // Calculate compound growth: Future Value = Present Value × (1 + rate)^years
  const growthFactor = Math.pow(1 + colaRate, yearsToRetirement)
  const projectedRetirementSalary = Math.round(currentSalary * growthFactor)
  const totalGrowth = projectedRetirementSalary - currentSalary
  const totalGrowthPercentage = ((projectedRetirementSalary / currentSalary) - 1) * 100

  return {
    currentSalary,
    projectedRetirementSalary,
    yearsToRetirement: Math.round(yearsToRetirement * 10) / 10, // Round to 1 decimal
    totalGrowth,
    totalGrowthPercentage: Math.round(totalGrowthPercentage * 10) / 10, // Round to 1 decimal
    colaRateUsed: colaRate,
    projectionMethod,
    isValid: true
  }
}

/**
 * Formats salary projection for display
 */
export function formatSalaryProjection(projection: SalaryProjectionResult): {
  currentSalaryFormatted: string
  projectedSalaryFormatted: string
  growthFormatted: string
  yearsFormatted: string
  colaRateFormatted: string
  summaryText: string
} {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  })

  const percentFormatter = new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  })

  const currentSalaryFormatted = formatter.format(projection.currentSalary)
  const projectedSalaryFormatted = formatter.format(projection.projectedRetirementSalary)
  const growthFormatted = formatter.format(projection.totalGrowth)
  const yearsFormatted = `${projection.yearsToRetirement} years`
  const colaRateFormatted = percentFormatter.format(projection.colaRateUsed)

  let summaryText = ''
  if (projection.isValid) {
    if (projection.yearsToRetirement > 0) {
      summaryText = `With ${colaRateFormatted} annual COLA increases over ${projection.yearsToRetirement} years, your salary is projected to grow from ${currentSalaryFormatted} to ${projectedSalaryFormatted}.`
    } else {
      summaryText = `You are at or past retirement age. Current salary: ${currentSalaryFormatted}`
    }
  } else {
    summaryText = projection.errorMessage || 'Unable to calculate projection'
  }

  return {
    currentSalaryFormatted,
    projectedSalaryFormatted,
    growthFormatted,
    yearsFormatted,
    colaRateFormatted,
    summaryText
  }
}

/**
 * Gets retirement date from various sources with fallbacks
 */
export function getRetirementDateForProjection(
  plannedRetirementAge?: number,
  currentAge?: number,
  retirementDate?: string | Date | null,
  birthYear?: number
): Date | null {
  // Method 1: Use explicit retirement date
  if (retirementDate && retirementDate !== null) {
    try {
      const date = typeof retirementDate === 'string' ? new Date(retirementDate) : retirementDate
      if (!isNaN(date.getTime()) && date > new Date()) {
        return date
      }
    } catch (error) {
      console.warn('Error parsing retirement date:', error)
    }
  }

  // Method 2: Calculate from planned retirement age and current age
  if (plannedRetirementAge && currentAge && plannedRetirementAge > currentAge) {
    const yearsToRetirement = plannedRetirementAge - currentAge
    const retirementDate = new Date()
    retirementDate.setFullYear(retirementDate.getFullYear() + yearsToRetirement)
    return retirementDate
  }

  // Method 3: Calculate from birth year and planned retirement age
  if (plannedRetirementAge && birthYear) {
    const retirementYear = birthYear + plannedRetirementAge
    const currentYear = new Date().getFullYear()
    if (retirementYear > currentYear) {
      return new Date(retirementYear, 0, 1) // January 1st of retirement year
    }
  }

  return null
}
