/**
 * Combined Calculation Wizard Types and Interfaces
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
  rule: 'required' | 'positive' | 'range' | 'email' | 'custom'
  message: string
  min?: number
  max?: number
  customValidator?: (value: any) => boolean
}

export interface WizardState {
  currentStep: number
  steps: WizardStep[]
  data: CombinedCalculationData
  isComplete: boolean
  savedAt?: string
  resumeToken?: string
}

export interface CombinedCalculationData {
  // Personal Information
  personalInfo: {
    birthYear: number
    retirementGoalAge: number
    lifeExpectancy: number
    filingStatus: 'single' | 'married' | 'marriedSeparate'
    currentAge: number
  }
  
  // Pension Data
  pensionData: {
    yearsOfService: number
    averageSalary: number
    retirementGroup: '1' | '2' | '3' | '4'
    serviceEntry: 'before_2012' | 'after_2012'
    pensionRetirementAge: number
    beneficiaryAge?: number
    benefitPercentage: number
    retirementOption: 'A' | 'B' | 'C' | 'D'
    retirementDate: string
    monthlyBenefit: number
    annualBenefit: number
  }
  
  // Social Security Data
  socialSecurityData: {
    fullRetirementAge: number
    earlyRetirementBenefit: number
    fullRetirementBenefit: number
    delayedRetirementBenefit: number
    selectedClaimingAge: number
    selectedMonthlyBenefit: number
    // Spousal data if married
    isMarried: boolean
    spouseFullRetirementBenefit?: number
    spouseFullRetirementAge?: number
    spouseBirthYear?: number
  }
  
  // Income and Tax Data
  incomeData: {
    totalAnnualIncome: number
    otherRetirementIncome: number
    hasRothIRA: boolean
    rothIRABalance: number
    has401k: boolean
    traditional401kBalance: number
    estimatedMedicarePremiums: number
  }
  
  // Goals and Preferences
  preferences: {
    riskTolerance: 'conservative' | 'moderate' | 'aggressive'
    inflationScenario: 'conservative' | 'moderate' | 'optimistic'
    includeTaxOptimization: boolean
    includeMonteCarloAnalysis: boolean
    retirementIncomeGoal: number
  }
}

export interface OptimizationResult {
  recommendedStrategy: {
    pensionClaimingAge: number
    socialSecurityClaimingAge: number
    totalLifetimeBenefits: number
    monthlyRetirementIncome: number
    netAfterTaxIncome: number
  }
  
  alternativeScenarios: Array<{
    name: string
    pensionAge: number
    ssAge: number
    lifetimeBenefits: number
    monthlyIncome: number
    netIncome: number
    tradeoffs: string[]
  }>
  
  breakEvenAnalysis: {
    earlyVsFullRetirement: {
      breakEvenAge: number
      earlyTotalBenefits: number
      fullTotalBenefits: number
    }
    fullVsDelayed: {
      breakEvenAge: number
      fullTotalBenefits: number
      delayedTotalBenefits: number
    }
  }
  
  taxOptimization: {
    currentStrategy: {
      annualTaxBurden: number
      effectiveTaxRate: number
      marginalTaxRate: number
    }
    optimizedStrategy: {
      annualTaxBurden: number
      effectiveTaxRate: number
      marginalTaxRate: number
      recommendations: string[]
    }
    potentialSavings: number
  }
  
  monteCarloResults?: {
    scenarios: number
    successRate: number
    medianOutcome: number
    worstCase: number
    bestCase: number
    confidenceIntervals: {
      percentile10: number
      percentile25: number
      percentile75: number
      percentile90: number
    }
  }
}

export interface WizardProgress {
  stepNumber: number
  totalSteps: number
  percentComplete: number
  estimatedTimeRemaining: number
  canGoBack: boolean
  canGoForward: boolean
  canSave: boolean
}

export const WIZARD_STEPS: WizardStep[] = [
  {
    id: 'personal-info',
    title: 'Personal Information',
    description: 'Basic information about your retirement timeline',
    isComplete: false,
    validationRules: [
      { field: 'personalInfo.birthYear', rule: 'required', message: 'Birth year is required' },
      { field: 'personalInfo.birthYear', rule: 'range', min: 1940, max: 2010, message: 'Please enter a valid birth year' },
      { field: 'personalInfo.retirementGoalAge', rule: 'range', min: 55, max: 75, message: 'Retirement age must be between 55 and 75' }
    ]
  },
  {
    id: 'pension-details',
    title: 'Pension Information',
    description: 'Your Massachusetts pension benefits and service details',
    isComplete: false,
    validationRules: [
      { field: 'pensionData.yearsOfService', rule: 'positive', message: 'Years of service must be positive' },
      { field: 'pensionData.averageSalary', rule: 'positive', message: 'Average salary must be positive' }
    ]
  },
  {
    id: 'social-security',
    title: 'Social Security Benefits',
    description: 'Your Social Security benefit estimates from SSA.gov',
    isComplete: false,
    validationRules: [
      { field: 'socialSecurityData.fullRetirementBenefit', rule: 'positive', message: 'Full retirement benefit is required' }
    ]
  },
  {
    id: 'income-assets',
    title: 'Additional Income & Assets',
    description: 'Other retirement income sources and savings',
    isComplete: false,
    isOptional: true
  },
  {
    id: 'preferences',
    title: 'Goals & Preferences',
    description: 'Your retirement goals and risk preferences',
    isComplete: false
  },
  {
    id: 'optimization',
    title: 'Analysis & Optimization',
    description: 'Review optimized retirement strategy recommendations',
    isComplete: false
  },
  {
    id: 'review-save',
    title: 'Review & Save',
    description: 'Review your complete retirement plan and save results',
    isComplete: false
  }
]
