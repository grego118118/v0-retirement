/**
 * Smart Auto-Population Logic for Phase 1 Wizard Improvements
 * Provides intelligent field population and suggestions based on user inputs
 */

import { EssentialInfoData } from './wizard-types-v2'

// Eligibility rules for retirement age suggestions
const ELIGIBILITY_RULES = {
  '1': { 
    before_2012: { minAge: 55, minYears: 20, fullBenefitAge: 65 },
    after_2012: { minAge: 60, minYears: 10, fullBenefitAge: 67 }
  },
  '2': { 
    before_2012: { minAge: 55, minYears: 20, fullBenefitAge: 60 },
    after_2012: { minAge: 57, minYears: 10, fullBenefitAge: 62 }
  },
  '3': { 
    any: { minAge: 45, minYears: 20, fullBenefitAge: 55 }
  },
  '4': { 
    before_2012: { minAge: 50, minYears: 20, fullBenefitAge: 55 },
    after_2012: { minAge: 52, minYears: 10, fullBenefitAge: 57 }
  }
} as const

// Salary guidance ranges by group and experience level
const SALARY_RANGES = {
  '1': {
    entry: { min: 35000, max: 50000, typical: 42000 },
    mid: { min: 50000, max: 75000, typical: 62000 },
    senior: { min: 70000, max: 100000, typical: 85000 }
  },
  '2': {
    entry: { min: 45000, max: 65000, typical: 55000 },
    mid: { min: 65000, max: 90000, typical: 77000 },
    senior: { min: 85000, max: 120000, typical: 102000 }
  },
  '3': {
    entry: { min: 55000, max: 75000, typical: 65000 },
    mid: { min: 75000, max: 105000, typical: 90000 },
    senior: { min: 100000, max: 140000, typical: 120000 }
  },
  '4': {
    entry: { min: 50000, max: 70000, typical: 60000 },
    mid: { min: 70000, max: 95000, typical: 82000 },
    senior: { min: 90000, max: 125000, typical: 107000 }
  }
} as const

export interface SalaryGuidance {
  min: number
  max: number
  typical: number
}

/**
 * Calculate suggested retirement age based on group
 * Simplified logic that provides clear, practical minimum retirement ages
 */
export function calculateSuggestedRetirementAge(
  group: '1' | '2' | '3' | '4',
  currentYearsOfService: number,
  serviceEntry: 'before_2012' | 'after_2012'
): number {
  // Simple, clear suggestions based on Massachusetts State Retirement Board rules
  // These are practical minimum retirement ages for each group

  switch (group) {
    case '1':
      // Group 1 (General Employees): Suggest age 60 as minimum retirement age
      return 60

    case '2':
      // Group 2 (Certain Public Safety): Suggest age 55 as minimum retirement age
      return 55

    case '3':
      // Group 3 (State Police): Suggest age 55 (can retire earlier with 20+ years but 55 is practical)
      return 55

    case '4':
      // Group 4 (Public Safety): Suggest age 50 as retirement age
      return 50

    default:
      // Default fallback
      return 60
  }
}

/**
 * Auto-detect service entry period from years of service and current age
 */
export function detectServiceEntry(
  yearsOfService: number,
  currentAge: number
): 'before_2012' | 'after_2012' {
  if (!yearsOfService || !currentAge) return 'before_2012'
  
  const currentYear = new Date().getFullYear()
  const estimatedStartYear = currentYear - yearsOfService
  
  // If estimated start year is 2012 or later, likely after April 2, 2012
  return estimatedStartYear >= 2012 ? 'after_2012' : 'before_2012'
}

/**
 * Get salary guidance based on group and years of service
 */
export function getSalaryGuidance(
  group: '1' | '2' | '3' | '4',
  yearsOfService: number
): SalaryGuidance {
  const ranges = SALARY_RANGES[group]
  if (!ranges) return SALARY_RANGES['1'].mid // Default fallback
  
  // Determine experience level based on years of service
  const experience = yearsOfService < 10 ? 'entry' : yearsOfService < 25 ? 'mid' : 'senior'
  
  return ranges[experience]
}

/**
 * Calculate current age from birth year
 */
export function calculateCurrentAge(birthYear: number): number {
  if (!birthYear || birthYear < 1940 || birthYear > 2010) return 0
  
  return new Date().getFullYear() - birthYear
}

/**
 * Validate retirement age against group eligibility rules
 * Note: currentYearsOfService should be CURRENT years (as of today)
 * This function calculates projected years at retirement for validation
 */
export function validateRetirementAge(
  plannedRetirementAge: number,
  group: '1' | '2' | '3' | '4',
  currentYearsOfService: number,
  serviceEntry: 'before_2012' | 'after_2012',
  currentAge?: number
): { isValid: boolean; message?: string } {
  const rules = ELIGIBILITY_RULES[group]
  if (!rules) return { isValid: false, message: 'Invalid retirement group' }

  const groupRules = 'any' in rules ? rules.any : rules[serviceEntry]
  if (!groupRules) return { isValid: false, message: 'Invalid service entry period' }

  // Check minimum age
  if (plannedRetirementAge < groupRules.minAge) {
    return {
      isValid: false,
      message: `Minimum retirement age for Group ${group} is ${groupRules.minAge}`
    }
  }

  // Check maximum reasonable age
  if (plannedRetirementAge > 75) {
    return {
      isValid: false,
      message: 'Retirement age cannot exceed 75'
    }
  }

  // Calculate projected years of service at retirement (if current age is provided)
  let projectedYearsAtRetirement = currentYearsOfService
  if (currentAge && plannedRetirementAge > currentAge) {
    const additionalYears = plannedRetirementAge - currentAge
    projectedYearsAtRetirement = currentYearsOfService + additionalYears
  }

  // Check minimum years of service at retirement
  if (projectedYearsAtRetirement < groupRules.minYears) {
    const yearsNeeded = groupRules.minYears - projectedYearsAtRetirement
    return {
      isValid: false,
      message: `You'll need ${yearsNeeded.toFixed(1)} more years of service to retire at age ${plannedRetirementAge} (minimum ${groupRules.minYears} years required for Group ${group})`
    }
  }

  return { isValid: true }
}

/**
 * Generate smart defaults for essential information
 */
export function generateSmartDefaults(
  partialData: Partial<EssentialInfoData>,
  userModifiedFields: Set<string> = new Set()
): Partial<EssentialInfoData> {
  const defaults: Partial<EssentialInfoData> = {}

  // Auto-calculate current age from birth year (only if user hasn't explicitly set currentAge)
  if (partialData.birthYear && !userModifiedFields.has('currentAge')) {
    defaults.currentAge = calculateCurrentAge(partialData.birthYear)
  }

  // Auto-detect service entry from years of service and age (only if user hasn't explicitly set serviceEntry)
  if (partialData.yearsOfService && partialData.currentAge && !userModifiedFields.has('serviceEntry')) {
    defaults.serviceEntry = detectServiceEntry(partialData.yearsOfService, partialData.currentAge)
  }

  // Auto-suggest retirement age based on group, service, and entry (only if not already set and user hasn't explicitly set it)
  if (partialData.retirementGroup && partialData.yearsOfService && defaults.serviceEntry && !partialData.plannedRetirementAge && !userModifiedFields.has('plannedRetirementAge')) {
    defaults.plannedRetirementAge = calculateSuggestedRetirementAge(
      partialData.retirementGroup,
      partialData.yearsOfService,
      defaults.serviceEntry
    )
  }

  // Default to Option A (maximum benefit) unless user specifies otherwise (only if user hasn't explicitly set it)
  if (!partialData.retirementOption && !userModifiedFields.has('retirementOption')) {
    defaults.retirementOption = 'A'
  }

  return defaults
}

/**
 * Get contextual help text for fields
 */
export function getFieldHelpText(
  field: keyof EssentialInfoData,
  context: Partial<EssentialInfoData>
): string {
  switch (field) {
    case 'birthYear':
      return 'Enter your birth year for age calculations'

    case 'retirementGroup':
      return 'Check your pay stub or contact HR if unsure about your group'

    case 'yearsOfService':
      return 'Enter your current creditable service time as of today. Include all creditable service, military time, and purchased service. We\'ll calculate your projected years at retirement automatically.'

    case 'averageSalary':
      if (context.retirementGroup && context.yearsOfService) {
        const guidance = getSalaryGuidance(context.retirementGroup, context.yearsOfService)
        return `Typical range for your experience level: $${guidance.min.toLocaleString()} - $${guidance.max.toLocaleString()}`
      }
      return 'Average of your highest 3 consecutive years of salary (used for pension calculation)'

    case 'plannedRetirementAge':
      if (context.retirementGroup) {
        const rules = ELIGIBILITY_RULES[context.retirementGroup]
        const groupRules = 'any' in rules ? rules.any : rules.before_2012
        return `Minimum retirement age for Group ${context.retirementGroup}: ${groupRules.minAge}. We'll verify you'll have enough service years by this age.`
      }
      return 'Age when you plan to start receiving pension benefits'

    case 'serviceEntry':
      return 'This affects your benefit calculation factors and eligibility requirements'

    default:
      return ''
  }
}

/**
 * Calculate basic pension estimate for live preview
 * Note: Uses CURRENT years of service and projects to retirement age
 */
export function calculateBasicPensionEstimate(data: Partial<EssentialInfoData>): {
  monthlyPension: number
  projectedYearsAtRetirement: number
  isProjected: boolean
} {
  if (!data.averageSalary || !data.yearsOfService || !data.retirementGroup) {
    return { monthlyPension: 0, projectedYearsAtRetirement: 0, isProjected: false }
  }

  // Calculate projected years of service at retirement
  let projectedYears = data.yearsOfService
  let isProjected = false

  if (data.currentAge && data.plannedRetirementAge && data.plannedRetirementAge > data.currentAge) {
    const additionalYears = data.plannedRetirementAge - data.currentAge
    projectedYears = data.yearsOfService + additionalYears
    isProjected = true
  }

  // Use basic 2.2% factor for quick estimate (actual calculation uses complex factor tables)
  const basicFactor = 0.022
  const annualPension = data.averageSalary * projectedYears * basicFactor

  // Apply 80% cap
  const maxPension = data.averageSalary * 0.8
  const cappedPension = Math.min(annualPension, maxPension)

  return {
    monthlyPension: Math.round(cappedPension / 12),
    projectedYearsAtRetirement: Math.round(projectedYears * 10) / 10, // Round to 1 decimal
    isProjected
  }
}

/**
 * Assess data quality and completeness
 */
export function assessDataQuality(data: Partial<EssentialInfoData>): {
  completeness: number
  confidence: number
  missingCritical: string[]
  missingOptional: string[]
} {
  const criticalFields = ['birthYear', 'retirementGroup', 'yearsOfService', 'averageSalary']
  const optionalFields = ['plannedRetirementAge', 'serviceEntry', 'retirementOption']
  
  const missingCritical = criticalFields.filter(field => !data[field as keyof EssentialInfoData])
  const missingOptional = optionalFields.filter(field => !data[field as keyof EssentialInfoData])
  
  const completeness = ((criticalFields.length - missingCritical.length) / criticalFields.length) * 100
  
  // Confidence based on data quality and validation
  let confidence = completeness
  if (data.retirementGroup && data.yearsOfService && data.plannedRetirementAge) {
    const validation = validateRetirementAge(
      data.plannedRetirementAge,
      data.retirementGroup,
      data.yearsOfService,
      data.serviceEntry || 'before_2012'
    )
    if (!validation.isValid) {
      confidence -= 20
    }
  }
  
  return {
    completeness: Math.round(completeness),
    confidence: Math.round(Math.max(0, confidence)),
    missingCritical,
    missingOptional
  }
}
