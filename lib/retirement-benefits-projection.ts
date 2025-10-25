/**
 * Enhanced Retirement Benefits Projection
 * Provides comprehensive year-by-year breakdown of retirement benefits
 * including pension progression, COLA adjustments, and Social Security integration
 */

import {
  getBenefitFactor,
  calculatePensionWithOption,
  checkEligibility,
  MAX_PENSION_PERCENTAGE_OF_SALARY
} from './pension-calculations'
import { calculateMassachusettsCOLA } from './pension/ma-cola-calculator'

export interface ProjectionYear {
  age: number
  yearsOfService: number
  benefitFactor: number
  basePensionBeforeCap: number
  basePensionAfterCap: number
  cappedAt80Percent: boolean
  pensionWithOption: number
  colaAdjustment: number
  totalPensionAnnual: number
  totalPensionMonthly: number
  socialSecurityAnnual: number
  socialSecurityMonthly: number
  combinedTotalAnnual: number
  combinedTotalMonthly: number
}

export interface ProjectionParameters {
  // Personal Information
  currentAge: number
  plannedRetirementAge: number
  currentYearsOfService: number
  averageSalary: number
  
  // Pension Details
  retirementGroup: string // "GROUP_1", "GROUP_2", etc.
  serviceEntry: string // "before_2012" or "after_2012"
  pensionOption: "A" | "B" | "C"
  beneficiaryAge?: string
  
  // Social Security
  socialSecurityClaimingAge: number
  socialSecurityFullBenefit: number
  
  // Projection Settings
  projectionEndAge?: number // Default: 80
  includeCOLA?: boolean // Default: true
  colaRate?: number // Default: 0.03 (3%)
}

/**
 * Calculate comprehensive retirement benefits projection with year-by-year breakdown
 */
export function calculateRetirementBenefitsProjection(
  params: ProjectionParameters
): ProjectionYear[] {
  const {
    currentAge,
    plannedRetirementAge,
    currentYearsOfService,
    averageSalary,
    retirementGroup,
    serviceEntry,
    pensionOption,
    beneficiaryAge = "",
    socialSecurityClaimingAge,
    socialSecurityFullBenefit,
    projectionEndAge = 80,
    includeCOLA = true,
    colaRate = 0.03
  } = params

  const projectionYears: ProjectionYear[] = []
  
  // Validate minimum retirement age by group
  const minRetirementAges: Record<string, number> = {
    GROUP_1: 60,
    GROUP_2: 55,
    GROUP_3: 55, // State Police - special rules
    GROUP_4: 50
  }
  
  const minAge = minRetirementAges[retirementGroup] || 55
  const startAge = Math.max(plannedRetirementAge, minAge)
  
  // Calculate years until retirement
  const yearsUntilRetirement = Math.max(0, plannedRetirementAge - currentAge)
  
  // Track cumulative COLA for compounding
  let cumulativeCOLA = 0
  
  for (let age = startAge; age <= projectionEndAge; age++) {
    // Calculate years of service at this age
    // For chart display consistency: Use current years of service as baseline for all calculations
    // This ensures the chart shows projections based on user's actual entered years of service
    const yearsOfService = currentYearsOfService + Math.max(0, age - currentAge)
    
    // Check eligibility
    const eligibility = checkEligibility(age, yearsOfService, retirementGroup, serviceEntry)
    if (!eligibility.eligible) {
      continue
    }
    
    // Get benefit factor for this age and group
    const benefitFactor = getBenefitFactor(age, retirementGroup, serviceEntry, yearsOfService)
    if (benefitFactor === 0) {
      continue
    }
    
    // Calculate base pension before 80% cap
    const basePensionBeforeCap = averageSalary * yearsOfService * benefitFactor
    
    // Apply 80% cap
    const maxPension = averageSalary * MAX_PENSION_PERCENTAGE_OF_SALARY
    const basePensionAfterCap = Math.min(basePensionBeforeCap, maxPension)
    const cappedAt80Percent = basePensionBeforeCap > maxPension
    
    // Apply pension option (A, B, C) reductions
    const optionResult = calculatePensionWithOption(
      basePensionAfterCap,
      pensionOption,
      age,
      beneficiaryAge,
      retirementGroup
    )
    const pensionWithOption = optionResult.pension
    
    // Calculate COLA adjustments using Massachusetts COLA rules
    let colaAdjustment = 0
    let totalPensionAnnual = pensionWithOption

    if (includeCOLA && age >= plannedRetirementAge) {
      // Calculate years since retirement for COLA application
      const yearsInRetirement = age - plannedRetirementAge

      if (yearsInRetirement > 0) {
        // Apply Massachusetts COLA: 3% on first $13,000, max $390/year
        const colaResult = calculateMassachusettsCOLA(pensionWithOption, yearsInRetirement)
        colaAdjustment = colaResult.totalIncrease
        totalPensionAnnual = colaResult.finalAmount
      }
    }

    const totalPensionMonthly = totalPensionAnnual / 12
    
    // Calculate Social Security benefits
    let socialSecurityAnnual = 0
    let socialSecurityMonthly = 0
    
    if (age >= socialSecurityClaimingAge) {
      const fullRetirementAge = 67
      
      if (socialSecurityClaimingAge < fullRetirementAge) {
        // Early retirement reduction
        const monthsEarly = (fullRetirementAge - socialSecurityClaimingAge) * 12
        const reductionRate = monthsEarly <= 36 ? 0.0055 : 0.0041
        socialSecurityAnnual = socialSecurityFullBenefit * (1 - (monthsEarly * reductionRate))
      } else if (socialSecurityClaimingAge > fullRetirementAge) {
        // Delayed retirement credits
        const yearsDelayed = socialSecurityClaimingAge - fullRetirementAge
        socialSecurityAnnual = socialSecurityFullBenefit * (1 + (yearsDelayed * 0.08))
      } else {
        // Full retirement age
        socialSecurityAnnual = socialSecurityFullBenefit
      }
      
      socialSecurityMonthly = socialSecurityAnnual / 12
    }
    
    // Calculate combined totals
    const combinedTotalAnnual = totalPensionAnnual + socialSecurityAnnual
    const combinedTotalMonthly = combinedTotalAnnual / 12
    
    projectionYears.push({
      age,
      yearsOfService,
      benefitFactor,
      basePensionBeforeCap,
      basePensionAfterCap,
      cappedAt80Percent,
      pensionWithOption,
      colaAdjustment,
      totalPensionAnnual,
      totalPensionMonthly,
      socialSecurityAnnual,
      socialSecurityMonthly,
      combinedTotalAnnual,
      combinedTotalMonthly
    })
    
    // Stop if we've reached the 80% cap and it won't increase further
    if (cappedAt80Percent && benefitFactor >= 0.025) {
      // If we're at max benefit factor and capped, no point continuing
      // unless we want to show COLA progression
      if (!includeCOLA || age >= projectionEndAge - 5) {
        break
      }
    }
  }
  
  return projectionYears
}

/**
 * Get projection summary statistics
 */
export function getProjectionSummary(projectionYears: ProjectionYear[]) {
  if (projectionYears.length === 0) {
    return null
  }
  
  const firstYear = projectionYears[0]
  const lastYear = projectionYears[projectionYears.length - 1]
  const peakMonthlyIncome = Math.max(...projectionYears.map(y => y.combinedTotalMonthly))
  const totalCOLABenefit = lastYear.colaAdjustment
  const yearsWithSocialSecurity = projectionYears.filter(y => y.socialSecurityAnnual > 0).length
  
  return {
    startAge: firstYear.age,
    endAge: lastYear.age,
    totalProjectionYears: projectionYears.length,
    initialMonthlyPension: firstYear.totalPensionMonthly,
    finalMonthlyPension: lastYear.totalPensionMonthly,
    peakMonthlyIncome,
    totalCOLABenefit,
    yearsWithSocialSecurity,
    cappedAt80Percent: projectionYears.some(y => y.cappedAt80Percent)
  }
}
