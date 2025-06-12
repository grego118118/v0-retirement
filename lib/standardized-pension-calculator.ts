/**
 * Standardized Massachusetts Retirement System Pension Calculator
 * 
 * This is the single source of truth for all pension calculations across the application.
 * All components should use these functions to ensure consistency and accuracy.
 */

import { 
  getBenefitFactor, 
  checkEligibility, 
  calculatePensionWithOption,
  PENSION_FACTORS_DEFAULT,
  PENSION_FACTORS_POST_2012_LT_30YOS 
} from './pension-calculations'

// Massachusetts Retirement System Group Classifications
export type RetirementGroup = 'Group 1' | 'Group 2' | 'Group 3' | 'Group 4'
export type ServiceEntry = 'before_2012' | 'after_2012'
export type RetirementOption = 'A' | 'B' | 'C'

// Group mapping for internal calculations
const GROUP_MAPPING: Record<RetirementGroup, string> = {
  'Group 1': 'GROUP_1',
  'Group 2': 'GROUP_2', 
  'Group 3': 'GROUP_3',
  'Group 4': 'GROUP_4'
}

// Maximum pension percentage (80% of salary)
const MAX_PENSION_PERCENTAGE = 0.8

export interface PensionCalculationInput {
  // Personal Information
  currentAge: number
  dateOfBirth?: string
  
  // Employment Information
  yearsOfService: number
  membershipDate?: string
  retirementGroup: RetirementGroup
  serviceEntry: ServiceEntry
  
  // Salary Information
  currentSalary: number
  averageHighest3Years?: number
  salary1?: number
  salary2?: number
  salary3?: number
  
  // Retirement Planning
  plannedRetirementAge: number
  retirementOption: RetirementOption
  beneficiaryAge?: number
}

export interface PensionCalculationResult {
  // Eligibility
  eligible: boolean
  eligibilityMessage: string
  
  // Basic Calculation
  benefitFactor: number
  totalBenefitPercentage: number
  averageSalary: number
  
  // Pension Amounts
  baseAnnualPension: number
  baseMonthlyPension: number
  finalAnnualPension: number
  finalMonthlyPension: number
  
  // Option Details
  optionDescription: string
  optionReduction: number
  survivorPension?: number
  
  // Additional Information
  cappedAtMaximum: boolean
  maxPensionAllowed: number
  warningMessage?: string
}

/**
 * Calculate current age from date of birth
 */
export function calculateCurrentAge(dateOfBirth: string): number {
  const today = new Date()
  const birth = new Date(dateOfBirth)
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  
  return age
}

/**
 * Calculate years of service from membership date
 */
export function calculateYearsOfService(membershipDate: string): number {
  const today = new Date()
  const membership = new Date(membershipDate)
  const diffTime = Math.abs(today.getTime() - membership.getTime())
  return Math.floor(diffTime / (1000 * 60 * 60 * 24 * 365.25))
}

/**
 * Calculate average salary from highest 3 years or use provided average
 */
export function calculateAverageSalary(input: PensionCalculationInput): number {
  // If average highest 3 years is provided, use it
  if (input.averageHighest3Years && input.averageHighest3Years > 0) {
    return input.averageHighest3Years
  }
  
  // If individual salary years are provided, calculate average
  if (input.salary1 && input.salary2 && input.salary3) {
    return (input.salary1 + input.salary2 + input.salary3) / 3
  }
  
  // Fallback to current salary
  return input.currentSalary || 0
}

/**
 * Determine service entry date based on membership date
 */
export function determineServiceEntry(membershipDate?: string): ServiceEntry {
  if (!membershipDate) return 'after_2012' // Conservative default
  
  const membership = new Date(membershipDate)
  const cutoffDate = new Date('2012-04-02')
  
  return membership < cutoffDate ? 'before_2012' : 'after_2012'
}

/**
 * Main standardized pension calculation function
 * This is the single source of truth for all pension calculations
 */
export function calculateStandardizedPension(input: PensionCalculationInput): PensionCalculationResult {
  // Validate input
  if (!input.currentAge || !input.yearsOfService || !input.retirementGroup) {
    return {
      eligible: false,
      eligibilityMessage: 'Missing required information for pension calculation',
      benefitFactor: 0,
      totalBenefitPercentage: 0,
      averageSalary: 0,
      baseAnnualPension: 0,
      baseMonthlyPension: 0,
      finalAnnualPension: 0,
      finalMonthlyPension: 0,
      optionDescription: 'Option A: Full Allowance',
      optionReduction: 0,
      cappedAtMaximum: false,
      maxPensionAllowed: 0
    }
  }

  // Calculate derived values
  const retirementAge = input.plannedRetirementAge || input.currentAge
  const averageSalary = calculateAverageSalary(input)
  const serviceEntry = input.serviceEntry || determineServiceEntry(input.membershipDate)
  const internalGroup = GROUP_MAPPING[input.retirementGroup]
  
  // Check eligibility using the official calculation
  const eligibility = checkEligibility(
    Math.floor(retirementAge),
    input.yearsOfService,
    internalGroup,
    serviceEntry
  )
  
  if (!eligibility.eligible) {
    return {
      eligible: false,
      eligibilityMessage: eligibility.message,
      benefitFactor: 0,
      totalBenefitPercentage: 0,
      averageSalary,
      baseAnnualPension: 0,
      baseMonthlyPension: 0,
      finalAnnualPension: 0,
      finalMonthlyPension: 0,
      optionDescription: 'Option A: Full Allowance',
      optionReduction: 0,
      cappedAtMaximum: false,
      maxPensionAllowed: 0
    }
  }
  
  // Get benefit factor using the official calculation
  const benefitFactor = getBenefitFactor(
    Math.floor(retirementAge),
    internalGroup,
    serviceEntry,
    input.yearsOfService
  )
  
  if (benefitFactor === 0) {
    return {
      eligible: false,
      eligibilityMessage: `No benefit factor available for age ${Math.floor(retirementAge)} in ${input.retirementGroup}`,
      benefitFactor: 0,
      totalBenefitPercentage: 0,
      averageSalary,
      baseAnnualPension: 0,
      baseMonthlyPension: 0,
      finalAnnualPension: 0,
      finalMonthlyPension: 0,
      optionDescription: 'Option A: Full Allowance',
      optionReduction: 0,
      cappedAtMaximum: false,
      maxPensionAllowed: 0
    }
  }
  
  // Calculate base pension
  let totalBenefitPercentage = benefitFactor * input.yearsOfService
  let baseAnnualPension = averageSalary * totalBenefitPercentage
  const maxPensionAllowed = averageSalary * MAX_PENSION_PERCENTAGE
  let cappedAtMaximum = false
  
  // Apply maximum pension cap
  if (baseAnnualPension > maxPensionAllowed) {
    baseAnnualPension = maxPensionAllowed
    cappedAtMaximum = true
    totalBenefitPercentage = MAX_PENSION_PERCENTAGE
  }
  
  // Ensure non-negative pension
  if (baseAnnualPension < 0) baseAnnualPension = 0
  
  // Apply retirement option using the official calculation
  const optionResult = calculatePensionWithOption(
    baseAnnualPension,
    input.retirementOption,
    retirementAge,
    input.beneficiaryAge?.toString() || '65'
  )
  
  const finalAnnualPension = optionResult.pension
  const finalMonthlyPension = finalAnnualPension / 12
  const baseMonthlyPension = baseAnnualPension / 12
  
  // Calculate option reduction percentage
  const optionReduction = baseAnnualPension > 0 
    ? ((baseAnnualPension - finalAnnualPension) / baseAnnualPension) * 100 
    : 0
  
  return {
    eligible: true,
    eligibilityMessage: 'Eligible for retirement benefits',
    benefitFactor,
    totalBenefitPercentage,
    averageSalary,
    baseAnnualPension,
    baseMonthlyPension,
    finalAnnualPension,
    finalMonthlyPension,
    optionDescription: optionResult.description,
    optionReduction,
    survivorPension: optionResult.survivorPension,
    cappedAtMaximum,
    maxPensionAllowed,
    warningMessage: optionResult.warning
  }
}

/**
 * Quick pension estimate for dashboard cards and overview displays
 * Uses current profile data to provide immediate estimates
 */
export function calculateQuickPensionEstimate(
  currentAge: number,
  yearsOfService: number,
  currentSalary: number,
  retirementGroup: RetirementGroup = 'Group 1',
  plannedRetirementAge: number = 65,
  membershipDate?: string
): {
  annualPension: number
  monthlyPension: number
  benefitPercentage: number
} {
  const input: PensionCalculationInput = {
    currentAge,
    yearsOfService,
    currentSalary,
    retirementGroup,
    plannedRetirementAge,
    retirementOption: 'A',
    serviceEntry: determineServiceEntry(membershipDate)
  }
  
  const result = calculateStandardizedPension(input)
  
  return {
    annualPension: result.finalAnnualPension,
    monthlyPension: result.finalMonthlyPension,
    benefitPercentage: result.totalBenefitPercentage * 100
  }
}

/**
 * Format currency for display
 */
export function formatPensionCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

/**
 * Format percentage for display
 */
export function formatPensionPercentage(percentage: number): string {
  return `${(percentage * 100).toFixed(2)}%`
}
