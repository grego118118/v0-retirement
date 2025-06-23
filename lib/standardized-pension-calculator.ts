/**
 * Standardized Pension Calculator
 * Provides consistent pension calculation utilities across the Massachusetts Retirement System application
 * Integrates with existing pension calculation logic and maintains sub-2-second performance
 */

import { getBenefitFactor, checkEligibility } from './pension-calculations'

// TypeScript interfaces and types
export type RetirementGroup = 'Group 1' | 'Group 2' | 'Group 3' | 'Group 4'

export interface QuickPensionEstimate {
  annualPension: number
  monthlyPension: number
  benefitMultiplier: number
  yearsOfService: number
  currentAge: number
  retirementAge: number
  eligible: boolean
  eligibilityMessage?: string
  cappedAt80Percent: boolean
}

/**
 * Calculates current age from birth date
 * @param dateOfBirth - Birth date as string (ISO format) or Date object
 * @returns Current age in years (rounded down)
 */
export function calculateCurrentAge(dateOfBirth: string | Date): number {
  if (!dateOfBirth) return 0
  
  try {
    const birthDate = typeof dateOfBirth === 'string' ? new Date(dateOfBirth) : dateOfBirth
    
    // Validate date
    if (isNaN(birthDate.getTime())) {
      console.warn('Invalid birth date provided to calculateCurrentAge:', dateOfBirth)
      return 0
    }
    
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    
    // Adjust age if birthday hasn't occurred this year
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    
    return Math.max(0, age) // Ensure non-negative age
  } catch (error) {
    console.error('Error calculating current age:', error)
    return 0
  }
}

/**
 * Calculates years of service from membership date
 * @param membershipDate - Date when member started service (string or Date)
 * @returns Years of service (with decimal precision)
 */
export function calculateYearsOfService(membershipDate: string | Date): number {
  if (!membershipDate) return 0
  
  try {
    const startDate = typeof membershipDate === 'string' ? new Date(membershipDate) : membershipDate
    
    // Validate date
    if (isNaN(startDate.getTime())) {
      console.warn('Invalid membership date provided to calculateYearsOfService:', membershipDate)
      return 0
    }
    
    const today = new Date()
    const diffTime = today.getTime() - startDate.getTime()
    const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365.25) // Account for leap years
    
    return Math.max(0, Math.round(diffYears * 100) / 100) // Round to 2 decimal places, ensure non-negative
  } catch (error) {
    console.error('Error calculating years of service:', error)
    return 0
  }
}

/**
 * Calculates quick pension estimate for dashboard display
 * Integrates with existing Massachusetts Retirement System calculation logic
 * @param currentAge - Current age of the member
 * @param yearsOfService - Years of creditable service
 * @param averageSalary - Average highest 3 years salary or current salary
 * @param retirementGroup - Retirement group classification
 * @param retirementAge - Planned retirement age
 * @param membershipDate - Date of membership (for service entry determination)
 * @returns Quick pension estimate with key metrics
 */
export function calculateQuickPensionEstimate(
  currentAge: number,
  yearsOfService: number,
  averageSalary: number,
  retirementGroup: RetirementGroup,
  retirementAge: number,
  membershipDate?: string | Date
): QuickPensionEstimate {
  // Input validation
  if (!currentAge || !yearsOfService || !averageSalary || !retirementAge) {
    return {
      annualPension: 0,
      monthlyPension: 0,
      benefitMultiplier: 0,
      yearsOfService: yearsOfService || 0,
      currentAge: currentAge || 0,
      retirementAge: retirementAge || 65,
      eligible: false,
      eligibilityMessage: 'Missing required information for pension calculation',
      cappedAt80Percent: false
    }
  }

  try {
    // Convert retirement group to format expected by existing functions
    const groupKey = retirementGroup.replace(' ', '_').toUpperCase()
    
    // Determine service entry period for benefit factor calculation
    let serviceEntry = 'before_2012'
    if (membershipDate) {
      const memberDate = typeof membershipDate === 'string' ? new Date(membershipDate) : membershipDate
      if (!isNaN(memberDate.getTime()) && memberDate >= new Date('2012-04-02')) {
        serviceEntry = 'after_2012'
      }
    }

    // Calculate projected years of service at retirement
    const projectedYearsOfService = yearsOfService + Math.max(0, retirementAge - currentAge)

    // Check eligibility using existing function
    const eligibility = checkEligibility(
      Math.floor(retirementAge), 
      projectedYearsOfService, 
      groupKey, 
      serviceEntry
    )

    // Get benefit factor using existing function
    const benefitMultiplier = getBenefitFactor(
      Math.floor(retirementAge),
      groupKey,
      serviceEntry,
      projectedYearsOfService
    )

    // Calculate pension using Massachusetts formula
    const MAX_PENSION_PERCENTAGE = 0.8 // 80% cap
    let totalBenefitPercentage = benefitMultiplier * projectedYearsOfService
    let annualPension = averageSalary * totalBenefitPercentage
    const maxPensionAllowed = averageSalary * MAX_PENSION_PERCENTAGE
    
    // Apply 80% cap
    const cappedAt80Percent = annualPension > maxPensionAllowed
    if (cappedAt80Percent) {
      annualPension = maxPensionAllowed
      totalBenefitPercentage = MAX_PENSION_PERCENTAGE
    }

    // Ensure non-negative pension
    annualPension = Math.max(0, annualPension)
    const monthlyPension = annualPension / 12

    return {
      annualPension: Math.round(annualPension),
      monthlyPension: Math.round(monthlyPension),
      benefitMultiplier: Math.round(benefitMultiplier * 10000) / 10000, // Round to 4 decimal places
      yearsOfService: projectedYearsOfService,
      currentAge,
      retirementAge,
      eligible: eligibility.eligible,
      eligibilityMessage: eligibility.message,
      cappedAt80Percent
    }
  } catch (error) {
    console.error('Error in calculateQuickPensionEstimate:', error)
    return {
      annualPension: 0,
      monthlyPension: 0,
      benefitMultiplier: 0,
      yearsOfService: yearsOfService || 0,
      currentAge: currentAge || 0,
      retirementAge: retirementAge || 65,
      eligible: false,
      eligibilityMessage: 'Error calculating pension estimate',
      cappedAt80Percent: false
    }
  }
}

/**
 * Formats currency for pension display
 * Consistent with existing formatCurrency utility but optimized for pension amounts
 * @param amount - Amount to format
 * @returns Formatted currency string
 */
export function formatPensionCurrency(amount: number | undefined | null): string {
  // Handle undefined, null, or NaN values
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '$0'
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Gets minimum retirement age by group for validation
 * @param group - Retirement group
 * @returns Minimum retirement age for the group
 */
export function getMinimumRetirementAge(group: RetirementGroup): number {
  switch (group) {
    case 'Group 1': return 60  // Post-2012 minimum
    case 'Group 2': return 55  // Minimum retirement age
    case 'Group 3': return 55  // State Police minimum (can retire earlier with 20+ years)
    case 'Group 4': return 50  // Public safety minimum
    default: return 60
  }
}

/**
 * Validates retirement group string and converts to proper type
 * @param group - Group string to validate
 * @returns Valid RetirementGroup or default
 */
export function validateRetirementGroup(group: string | undefined): RetirementGroup {
  if (!group) return 'Group 1'

  const normalizedGroup = group.trim()
  if (['Group 1', 'Group 2', 'Group 3', 'Group 4'].includes(normalizedGroup)) {
    return normalizedGroup as RetirementGroup
  }

  // Handle numeric formats
  if (['1', '2', '3', '4'].includes(normalizedGroup)) {
    return `Group ${normalizedGroup}` as RetirementGroup
  }

  console.warn('Invalid retirement group provided:', group, 'defaulting to Group 1')
  return 'Group 1'
}

/**
 * Standardized pension calculation interface for comparison tool
 */
export interface StandardizedPensionInput {
  retirementGroup: string
  retirementAge: number
  yearsOfService: number
  averageSalary: number
  membershipDate: string
  retirementOption: 'A' | 'B' | 'C'
  beneficiaryAge?: number
}

export interface StandardizedPensionResult {
  annualBenefit: number
  monthlyBenefit: number
  benefitFactor: number
  eligible: boolean
  eligibilityMessage?: string
}

/**
 * Calculate standardized pension for comparison with existing calculator
 */
export function calculateStandardizedPension(input: StandardizedPensionInput): StandardizedPensionResult {
  const {
    retirementGroup,
    retirementAge,
    yearsOfService,
    averageSalary,
    membershipDate,
    retirementOption,
    beneficiaryAge
  } = input

  try {
    // Convert group format
    const groupKey = retirementGroup.replace(' ', '_').toUpperCase()

    // Determine service entry
    const memberDate = new Date(membershipDate)
    const serviceEntry = memberDate >= new Date('2012-04-02') ? 'after_2012' : 'before_2012'

    // Check eligibility
    const eligibility = checkEligibility(retirementAge, yearsOfService, groupKey, serviceEntry)

    if (!eligibility.eligible) {
      return {
        annualBenefit: 0,
        monthlyBenefit: 0,
        benefitFactor: 0,
        eligible: false,
        eligibilityMessage: eligibility.message
      }
    }

    // Get benefit factor
    const benefitFactor = getBenefitFactor(retirementAge, groupKey, serviceEntry, yearsOfService)

    // Calculate base pension
    let annualBenefit = averageSalary * yearsOfService * benefitFactor

    // Apply 80% cap
    const maxBenefit = averageSalary * 0.8
    if (annualBenefit > maxBenefit) {
      annualBenefit = maxBenefit
    }

    // Apply retirement option adjustments (simplified for comparison)
    if (retirementOption === 'B') {
      // Age-based reduction for Option B
      let reductionPercent = 0.01 // 1% base reduction
      if (retirementAge >= 60 && retirementAge < 70) {
        reductionPercent = 0.01 + ((retirementAge - 50) / 20) * 0.04 // Interpolate between 1% and 5%
      } else if (retirementAge >= 70) {
        reductionPercent = 0.05 // 5% max reduction
      }
      annualBenefit = annualBenefit * (1 - reductionPercent)
    } else if (retirementOption === 'C' && beneficiaryAge) {
      // Simplified Option C reduction (would need full lookup table for exact match)
      const reductionPercent = 0.10 // Approximate 10% reduction
      annualBenefit = annualBenefit * (1 - reductionPercent)
    }

    return {
      annualBenefit: Math.round(annualBenefit),
      monthlyBenefit: Math.round(annualBenefit / 12),
      benefitFactor,
      eligible: true
    }
  } catch (error) {
    console.error('Error in calculateStandardizedPension:', error)
    return {
      annualBenefit: 0,
      monthlyBenefit: 0,
      benefitFactor: 0,
      eligible: false,
      eligibilityMessage: 'Calculation error'
    }
  }
}
