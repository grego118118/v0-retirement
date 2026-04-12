/**
 * Enhanced Wizard Validation System
 * Provides comprehensive validation for all wizard steps with performance optimization
 */

import { CombinedCalculationData, ValidationRule, WizardStep } from './wizard-types'

export interface ValidationResult {
  isValid: boolean
  errors: Record<string, string>
  warnings: Record<string, string>
}

export interface ValidationContext {
  currentStep: string
  allData: CombinedCalculationData
  previousSteps: string[]
}

/**
 * Validate a specific step with context-aware validation
 */
export function validateWizardStep(
  stepId: string,
  stepData: any,
  context: ValidationContext
): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    errors: {},
    warnings: {}
  }

  switch (stepId) {
    case 'personal-info':
      return validatePersonalInfo(stepData, context)
    case 'pension-details':
      return validatePensionDetails(stepData, context)
    case 'social-security':
      return validateSocialSecurity(stepData, context)
    case 'income-assets':
      return validateIncomeAssets(stepData, context)
    case 'preferences':
      return validatePreferences(stepData, context)
    default:
      return result
  }
}

/**
 * Validate personal information step
 */
function validatePersonalInfo(data: any, context: ValidationContext): ValidationResult {
  const result: ValidationResult = { isValid: true, errors: {}, warnings: {} }
  
  // Birth year validation
  if (!data.birthYear) {
    result.errors.birthYear = 'Birth year is required'
    result.isValid = false
  } else if (data.birthYear < 1940 || data.birthYear > 2010) {
    result.errors.birthYear = 'Please enter a valid birth year (1940-2010)'
    result.isValid = false
  }

  // Current age calculation and validation
  const currentYear = new Date().getFullYear()
  const calculatedAge = currentYear - data.birthYear
  
  if (calculatedAge < 18) {
    result.errors.birthYear = 'You must be at least 18 years old'
    result.isValid = false
  } else if (calculatedAge > 85) {
    result.warnings.birthYear = 'Please verify your birth year'
  }

  // Retirement goal age validation
  if (!data.retirementGoalAge) {
    result.errors.retirementGoalAge = 'Retirement goal age is required'
    result.isValid = false
  } else if (data.retirementGoalAge < 55 || data.retirementGoalAge > 75) {
    result.errors.retirementGoalAge = 'Retirement age must be between 55 and 75'
    result.isValid = false
  } else if (data.retirementGoalAge <= calculatedAge) {
    result.errors.retirementGoalAge = 'Retirement age must be in the future'
    result.isValid = false
  }

  // Life expectancy validation
  if (data.lifeExpectancy && data.lifeExpectancy <= data.retirementGoalAge) {
    result.warnings.lifeExpectancy = 'Life expectancy should be greater than retirement age'
  }

  return result
}

/**
 * Validate pension details step
 */
function validatePensionDetails(data: any, context: ValidationContext): ValidationResult {
  const result: ValidationResult = { isValid: true, errors: {}, warnings: {} }
  
  // Years of service validation
  if (!data.yearsOfService || data.yearsOfService <= 0) {
    result.errors.yearsOfService = 'Years of service must be greater than 0'
    result.isValid = false
  } else if (data.yearsOfService > 50) {
    result.warnings.yearsOfService = 'Please verify years of service (over 50 years)'
  }

  // Average salary validation
  if (!data.averageSalary || data.averageSalary <= 0) {
    result.errors.averageSalary = 'Average salary must be greater than 0'
    result.isValid = false
  } else if (data.averageSalary < 20000) {
    result.warnings.averageSalary = 'Average salary seems low for MA state employee'
  } else if (data.averageSalary > 300000) {
    result.warnings.averageSalary = 'Please verify average salary amount'
  }

  // Retirement group validation
  if (!data.retirementGroup) {
    result.errors.retirementGroup = 'Retirement group is required'
    result.isValid = false
  }

  // Group-specific validations
  if (data.retirementGroup === '3') {
    // Group 3 specific validations
    const currentAge = context.allData.personalInfo.currentAge
    const retirementAge = context.allData.personalInfo.retirementGoalAge
    
    if (retirementAge < 55 && data.yearsOfService < 25) {
      result.errors.retirementAge = 'Group 3 members need 25 years of service to retire before age 55'
      result.isValid = false
    } else if (retirementAge < 55 && data.yearsOfService < 20) {
      result.errors.retirementAge = 'Group 3 members need at least 20 years of service'
      result.isValid = false
    }
  }

  return result
}

/**
 * Validate Social Security step
 */
function validateSocialSecurity(data: any, context: ValidationContext): ValidationResult {
  const result: ValidationResult = { isValid: true, errors: {}, warnings: {} }
  
  // Full retirement benefit validation
  if (!data.fullRetirementBenefit || data.fullRetirementBenefit <= 0) {
    result.errors.fullRetirementBenefit = 'Full retirement benefit is required'
    result.isValid = false
  } else if (data.fullRetirementBenefit > 5000) {
    result.warnings.fullRetirementBenefit = 'Social Security benefit seems high - please verify'
  }

  // Early retirement benefit validation
  if (data.earlyRetirementBenefit && data.earlyRetirementBenefit >= data.fullRetirementBenefit) {
    result.errors.earlyRetirementBenefit = 'Early benefit should be less than full benefit'
    result.isValid = false
  }

  // Delayed retirement benefit validation
  if (data.delayedRetirementBenefit && data.delayedRetirementBenefit <= data.fullRetirementBenefit) {
    result.errors.delayedRetirementBenefit = 'Delayed benefit should be greater than full benefit'
    result.isValid = false
  }

  // Claiming age validation
  if (data.selectedClaimingAge < 62 || data.selectedClaimingAge > 70) {
    result.errors.selectedClaimingAge = 'Social Security claiming age must be between 62 and 70'
    result.isValid = false
  }

  // Spousal benefit validation for married couples
  if (data.isMarried) {
    if (!data.spouseFullRetirementBenefit || data.spouseFullRetirementBenefit <= 0) {
      result.errors.spouseFullRetirementBenefit = 'Spouse benefit is required for married couples'
      result.isValid = false
    }
    
    if (!data.spouseBirthYear) {
      result.errors.spouseBirthYear = 'Spouse birth year is required'
      result.isValid = false
    }
  }

  return result
}

/**
 * Validate income and assets step
 */
function validateIncomeAssets(data: any, context: ValidationContext): ValidationResult {
  const result: ValidationResult = { isValid: true, errors: {}, warnings: {} }
  
  // Other retirement income validation
  if (data.otherRetirementIncome < 0) {
    result.errors.otherRetirementIncome = 'Other retirement income cannot be negative'
    result.isValid = false
  }

  // 401k balance validation
  if (data.has401k && (!data.traditional401kBalance || data.traditional401kBalance < 0)) {
    result.errors.traditional401kBalance = '401k balance must be positive if you have a 401k'
    result.isValid = false
  }

  // Roth IRA validation
  if (data.hasRothIRA && (!data.rothIRABalance || data.rothIRABalance < 0)) {
    result.errors.rothIRABalance = 'Roth IRA balance must be positive if you have a Roth IRA'
    result.isValid = false
  }

  // Medicare premiums validation
  if (data.estimatedMedicarePremiums < 0) {
    result.errors.estimatedMedicarePremiums = 'Medicare premiums cannot be negative'
    result.isValid = false
  }

  // Warning for low retirement savings
  const totalSavings = (data.traditional401kBalance || 0) + (data.rothIRABalance || 0)
  const currentAge = context.allData.personalInfo.currentAge
  const recommendedSavings = context.allData.pensionData.averageSalary * Math.max(1, currentAge - 25) * 0.1
  
  if (totalSavings < recommendedSavings * 0.5) {
    result.warnings.totalSavings = 'Consider increasing retirement savings to supplement pension and Social Security'
  }

  return result
}

/**
 * Validate preferences step
 */
function validatePreferences(data: any, context: ValidationContext): ValidationResult {
  const result: ValidationResult = { isValid: true, errors: {}, warnings: {} }
  
  // Retirement income goal validation
  if (!data.retirementIncomeGoal || data.retirementIncomeGoal <= 0) {
    result.errors.retirementIncomeGoal = 'Retirement income goal is required'
    result.isValid = false
  }

  // Risk tolerance validation
  if (!data.riskTolerance) {
    result.errors.riskTolerance = 'Risk tolerance selection is required'
    result.isValid = false
  }

  // Income replacement ratio warning
  const currentSalary = context.allData.pensionData.averageSalary
  const replacementRatio = (data.retirementIncomeGoal * 12) / currentSalary
  
  if (replacementRatio < 0.6) {
    result.warnings.retirementIncomeGoal = 'Consider a higher income goal - experts recommend 60-80% income replacement'
  } else if (replacementRatio > 1.2) {
    result.warnings.retirementIncomeGoal = 'Income goal exceeds current salary - verify this is realistic'
  }

  return result
}

/**
 * Validate entire wizard data for final submission
 */
export function validateCompleteWizard(data: CombinedCalculationData): ValidationResult {
  const result: ValidationResult = { isValid: true, errors: {}, warnings: {} }
  
  // Cross-step validations
  const pensionIncome = data.pensionData.monthlyBenefit * 12
  const ssIncome = data.socialSecurityData.selectedMonthlyBenefit * 12
  const totalRetirementIncome = pensionIncome + ssIncome + data.incomeData.otherRetirementIncome
  
  // Check if retirement income meets goal
  if (totalRetirementIncome < data.preferences.retirementIncomeGoal * 12 * 0.9) {
    result.warnings.incomeShortfall = 'Projected retirement income may not meet your goal'
  }

  // Check retirement timing consistency
  const retirementAge = data.personalInfo.retirementGoalAge
  const ssClaimingAge = data.socialSecurityData.selectedClaimingAge
  
  if (ssClaimingAge < retirementAge) {
    result.warnings.claimingStrategy = 'Consider delaying Social Security to increase benefits'
  }

  return result
}

/**
 * Performance-optimized validation with memoization
 */
const validationCache = new Map<string, ValidationResult>()

export function validateWithCache(
  stepId: string,
  stepData: any,
  context: ValidationContext
): ValidationResult {
  const cacheKey = `${stepId}-${JSON.stringify(stepData)}`
  
  if (validationCache.has(cacheKey)) {
    return validationCache.get(cacheKey)!
  }
  
  const result = validateWizardStep(stepId, stepData, context)
  validationCache.set(cacheKey, result)
  
  // Clear cache if it gets too large
  if (validationCache.size > 100) {
    validationCache.clear()
  }
  
  return result
}
