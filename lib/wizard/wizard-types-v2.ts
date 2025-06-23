/**
 * Updated Wizard Types for 4-Step Flow (Phase 1 Implementation)
 * Consolidates 7-step wizard into streamlined 4-step experience
 */

export interface WizardStep {
  id: string
  title: string
  description: string
  isComplete: boolean
  isOptional?: boolean
  validationRules?: ValidationRule[]
}

export interface ValidationRule {
  field: string
  rule: 'required' | 'positive' | 'range' | 'email'
  min?: number
  max?: number
  message: string
}

// Step 1: Essential Information (Consolidates personal-info + pension-details)
export interface EssentialInfoData {
  // Personal Information
  birthYear: number
  currentAge: number
  
  // Core Pension Data
  retirementGroup: '1' | '2' | '3' | '4'
  yearsOfService: number
  averageSalary: number
  
  // Smart Defaults (auto-populated but editable)
  plannedRetirementAge: number
  serviceEntry: 'before_2012' | 'after_2012'
  retirementOption: 'A' | 'B' | 'C'
  beneficiaryAge?: number // Only for Option C
}

// Step 2: Benefits & Income (Streamlined social-security + income-assets)
export interface BenefitsIncomeData {
  // Social Security (simplified)
  socialSecurity: {
    hasSSAStatement: boolean
    fullRetirementBenefit?: number
    estimatedBenefit?: number
    plannedClaimingAge: number
    isMarried: boolean
    spouseFullRetirementBenefit?: number
  }
  
  // Additional Income (optional but encouraged)
  additionalIncome: {
    hasOtherIncome: boolean
    monthlyAmount?: number
    hasRetirementAccounts: boolean
    estimatedValue?: number
  }
}

// Step 3: Goals & Preferences (Simplified preferences)
export interface GoalsPreferencesData {
  // User Goals
  goals: {
    monthlyIncomeTarget: number
    retirementLifestyle: 'modest' | 'comfortable' | 'luxurious'
  }
  
  // Optimization Preferences
  preferences: {
    riskTolerance: 'conservative' | 'moderate' | 'aggressive'
    prioritizeIncome: boolean // vs. legacy/flexibility
  }
  
  // Advanced Options (progressive disclosure)
  advanced?: {
    retirementOption: 'A' | 'B' | 'C'
    beneficiaryAge?: number
    includeAdvancedAnalysis: boolean
  }
}

// Step 4: Results & Action Plan (Enhanced results + review-save)
export interface ResultsActionData {
  summary: {
    totalMonthlyIncome: number
    pensionBenefit: number
    socialSecurityBenefit: number
    additionalIncome: number
    confidenceLevel: number
  }
  
  optimization: {
    recommendedStrategy: OptimizationStrategy
    alternativeScenarios: AlternativeScenario[]
    potentialImprovements: Improvement[]
  }
  
  actionPlan: {
    immediateActions: Action[]
    shortTermActions: Action[]
    longTermActions: Action[]
  }
  
  saveOptions: {
    dashboardIntegration: boolean
    emailSummary: boolean
    scheduleReview: boolean
  }
}

// Supporting interfaces
export interface OptimizationStrategy {
  pensionClaimingAge: number
  socialSecurityClaimingAge: number
  monthlyRetirementIncome: number
  netAfterTaxIncome: number
  totalLifetimeBenefits: number
}

export interface AlternativeScenario {
  name: string
  pensionAge: number
  ssAge: number
  monthlyIncome: number
  lifetimeBenefits: number
  tradeoffs: string[]
}

export interface Improvement {
  title: string
  description: string
  potentialIncrease: number
  difficulty: 'easy' | 'moderate' | 'complex'
}

export interface Action {
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  timeframe: 'immediate' | '6 months' | 'annual'
  url?: string
}

// Combined wizard data for all 4 steps
export interface CombinedCalculationDataV2 {
  essentialInfo: EssentialInfoData
  benefitsIncome: BenefitsIncomeData
  goalsPreferences: GoalsPreferencesData
  resultsAction: ResultsActionData
}

// Updated wizard steps for 4-step flow
export const WIZARD_STEPS_V2: WizardStep[] = [
  {
    id: 'essential-info',
    title: 'Essential Information',
    description: 'Basic personal and pension information to get started',
    isComplete: false,
    validationRules: [
      { field: 'essentialInfo.birthYear', rule: 'required', message: 'Birth year is required' },
      { field: 'essentialInfo.birthYear', rule: 'range', min: 1940, max: 2010, message: 'Please enter a valid birth year' },
      { field: 'essentialInfo.retirementGroup', rule: 'required', message: 'Retirement group is required' },
      { field: 'essentialInfo.yearsOfService', rule: 'positive', message: 'Years of service must be positive' },
      { field: 'essentialInfo.averageSalary', rule: 'positive', message: 'Average salary must be positive' },
      { field: 'essentialInfo.plannedRetirementAge', rule: 'range', min: 45, max: 75, message: 'Retirement age must be between 45 and 75' }
    ]
  },
  {
    id: 'benefits-income',
    title: 'Benefits & Income',
    description: 'Social Security benefits and additional retirement income',
    isComplete: false,
    validationRules: [
      { field: 'benefitsIncome.socialSecurity.plannedClaimingAge', rule: 'range', min: 62, max: 70, message: 'Social Security claiming age must be between 62 and 70' }
    ]
  },
  {
    id: 'goals-preferences',
    title: 'Goals & Preferences',
    description: 'Your retirement goals and optimization preferences',
    isComplete: false,
    validationRules: [
      { field: 'goalsPreferences.goals.monthlyIncomeTarget', rule: 'positive', message: 'Monthly income target must be positive' }
    ]
  },
  {
    id: 'results-action',
    title: 'Results & Action Plan',
    description: 'Your personalized retirement strategy and next steps',
    isComplete: false
  }
]

// Wizard progress interface
export interface WizardProgressV2 {
  stepNumber: number
  totalSteps: number
  percentComplete: number
  estimatedTimeRemaining: number
  canGoBack: boolean
  canGoForward: boolean
  canSave: boolean
  dataQuality: {
    essential: number    // 0-100% completeness
    optional: number     // 0-100% completeness
    overall: number      // 0-100% overall quality
    confidence: number   // 0-100% calculation confidence
  }
}

// Smart defaults and auto-population logic
export interface SmartDefaults {
  retirementAge: number
  serviceEntry: 'before_2012' | 'after_2012'
  retirementOption: 'A'
  socialSecurityAge: number
  riskTolerance: 'moderate'
}

// Data quality assessment
export interface DataQuality {
  overallScore: number
  essential: {
    complete: boolean
    missing: string[]
  }
  optimization: {
    complete: boolean
    missing: string[]
  }
  advanced: {
    complete: boolean
    missing: string[]
  }
  confidenceLevel: number
}

// Validation context for smart validation
export interface ValidationContext {
  currentStep: number
  allData: Partial<CombinedCalculationDataV2>
  userProfile?: any
}

export interface ValidationResult {
  isValid: boolean
  errors: Record<string, string>
  warnings: Record<string, string>
  suggestions?: string[]
}
