/**
 * Retirement Scenario Modeling Data Types
 * 
 * Comprehensive data structures for modeling and comparing different retirement scenarios.
 * Builds on existing calculation engines and data models.
 */

import { CombinedCalculationData, OptimizationResult } from '../wizard/wizard-types'

/**
 * Core scenario model that captures all user-adjustable parameters
 */
export interface RetirementScenario {
  // Scenario metadata
  id: string
  name: string
  description?: string
  isBaseline: boolean
  createdAt: string
  updatedAt: string
  
  // Personal parameters (can be adjusted per scenario)
  personalParameters: {
    retirementAge: number
    lifeExpectancy: number
    currentAge: number
    birthYear: number
  }
  
  // Pension parameters
  pensionParameters: {
    retirementGroup: '1' | '2' | '3' | '4'
    yearsOfService: number
    averageSalary: number
    retirementOption: 'A' | 'B' | 'C' | 'D'
    beneficiaryAge?: number
    servicePurchases?: ServicePurchase[]
  }
  
  // Social Security parameters
  socialSecurityParameters: {
    claimingAge: number
    fullRetirementAge: number
    fullRetirementBenefit: number
    earlyRetirementBenefit: number
    delayedRetirementBenefit: number
    // Spousal benefits if applicable
    isMarried: boolean
    spouseClaimingAge?: number
    spouseFullRetirementBenefit?: number
    spouseFullRetirementAge?: number
    optimizeSpouseBenefits?: boolean
  }
  
  // Financial parameters
  financialParameters: {
    // Additional retirement income
    otherRetirementIncome: number
    rothIRABalance: number
    traditional401kBalance: number
    traditionalIRABalance: number
    savingsAccountBalance: number
    
    // Investment assumptions
    expectedReturnRate: number
    inflationRate: number
    riskTolerance: 'conservative' | 'moderate' | 'aggressive'
    
    // Withdrawal strategy
    withdrawalStrategy: 'fixed' | 'percentage' | 'dynamic' | 'bucket'
    withdrawalRate: number
    
    // Healthcare costs
    estimatedMedicarePremiums: number
    longTermCareInsurance: boolean
    healthcareCostInflation: number
  }
  
  // Tax parameters
  taxParameters: {
    filingStatus: 'single' | 'marriedJoint' | 'marriedSeparate'
    stateOfResidence: string
    taxOptimizationStrategy: 'none' | 'basic' | 'advanced'
    rothConversions: boolean
    taxLossHarvesting: boolean
  }
  
  // COLA and adjustment parameters
  colaParameters: {
    pensionCOLA: number
    socialSecurityCOLA: number
    colaScenario: 'conservative' | 'moderate' | 'optimistic'
    customCOLASchedule?: COLASchedule[]
  }
}

/**
 * Service purchase for pension calculations
 */
export interface ServicePurchase {
  type: 'military' | 'outOfState' | 'leave' | 'other'
  years: number
  cost: number
  isPaid: boolean
}

/**
 * Custom COLA schedule for advanced scenarios
 */
export interface COLASchedule {
  year: number
  pensionCOLA: number
  socialSecurityCOLA: number
}

/**
 * Calculated results for a scenario
 */
export interface ScenarioResults {
  scenarioId: string
  calculatedAt: string
  
  // Core benefit calculations
  pensionBenefits: {
    monthlyBenefit: number
    annualBenefit: number
    lifetimeBenefits: number
    benefitReduction: number
    survivorBenefit?: number
  }
  
  socialSecurityBenefits: {
    monthlyBenefit: number
    annualBenefit: number
    lifetimeBenefits: number
    spousalBenefit?: number
    survivorBenefit?: number
  }
  
  // Combined income projections
  incomeProjections: {
    totalMonthlyIncome: number
    totalAnnualIncome: number
    netAfterTaxIncome: number
    replacementRatio: number
    
    // Year-by-year projections
    yearlyProjections: YearlyProjection[]
  }
  
  // Tax implications
  taxAnalysis: {
    annualTaxBurden: number
    effectiveTaxRate: number
    marginalTaxRate: number
    federalTax: number
    stateTax: number
    socialSecurityTax: number
  }
  
  // Portfolio analysis (if applicable)
  portfolioAnalysis?: {
    initialBalance: number
    finalBalance: number
    totalWithdrawals: number
    portfolioLongevity: number
    probabilityOfSuccess: number
  }
  
  // Key metrics for comparison
  keyMetrics: {
    totalLifetimeIncome: number
    breakEvenAge: number
    riskScore: number
    flexibilityScore: number
    optimizationScore: number
  }
}

/**
 * Year-by-year income projection
 */
export interface YearlyProjection {
  year: number
  age: number
  pensionIncome: number
  socialSecurityIncome: number
  otherIncome: number
  totalGrossIncome: number
  totalNetIncome: number
  taxes: number
  inflationAdjustment: number
  portfolioBalance?: number
  portfolioWithdrawal?: number
}

/**
 * Scenario comparison data structure
 */
export interface ScenarioComparison {
  scenarios: RetirementScenario[]
  results: ScenarioResults[]
  comparisonMetrics: ComparisonMetrics
  recommendations: ComparisonRecommendation[]
}

/**
 * Metrics for comparing scenarios
 */
export interface ComparisonMetrics {
  // Income comparison
  incomeComparison: {
    highestMonthlyIncome: { scenarioId: string; amount: number }
    highestLifetimeIncome: { scenarioId: string; amount: number }
    highestReplacementRatio: { scenarioId: string; ratio: number }
  }
  
  // Risk comparison
  riskComparison: {
    lowestRisk: { scenarioId: string; score: number }
    highestRisk: { scenarioId: string; score: number }
    mostFlexible: { scenarioId: string; score: number }
  }
  
  // Optimization comparison
  optimizationComparison: {
    mostOptimized: { scenarioId: string; score: number }
    bestTaxEfficiency: { scenarioId: string; effectiveRate: number }
    longestPortfolioLife: { scenarioId: string; years: number }
  }
  
  // Break-even analysis
  breakEvenAnalysis: {
    earlyVsNormal: { breakEvenAge: number; advantage: string }
    normalVsDelayed: { breakEvenAge: number; advantage: string }
  }
}

/**
 * Recommendations based on scenario comparison
 */
export interface ComparisonRecommendation {
  type: 'income' | 'risk' | 'tax' | 'timing' | 'general'
  priority: 'high' | 'medium' | 'low'
  title: string
  description: string
  affectedScenarios: string[]
  suggestedAction: string
  potentialImpact: {
    incomeChange?: number
    riskChange?: number
    taxSavings?: number
  }
}

/**
 * Scenario modeling configuration
 */
export interface ScenarioModelingConfig {
  maxScenarios: number
  defaultParameters: Partial<RetirementScenario>
  calculationSettings: {
    projectionYears: number
    monteCarloRuns: number
    inflationAssumptions: {
      conservative: number
      moderate: number
      optimistic: number
    }
    returnAssumptions: {
      conservative: number
      moderate: number
      aggressive: number
    }
  }
}

/**
 * Scenario template for common scenarios
 */
export interface ScenarioTemplate {
  id: string
  name: string
  description: string
  category: 'retirement_age' | 'benefit_option' | 'investment' | 'tax' | 'custom'
  parameters: Partial<RetirementScenario>
  isPopular: boolean
  applicableGroups: string[]
}

/**
 * Default scenario templates
 */
export const DEFAULT_SCENARIO_TEMPLATES: ScenarioTemplate[] = [
  {
    id: 'early_retirement_62',
    name: 'Early Retirement at 62',
    description: 'Retire as early as possible with reduced benefits',
    category: 'retirement_age',
    parameters: {
      personalParameters: { retirementAge: 62 },
      socialSecurityParameters: {
        claimingAge: 62,
        estimatedBenefit: 1875 // Reduced benefit for early claiming
      }
    },
    isPopular: true,
    applicableGroups: ['1', '2', '3', '4']
  },
  {
    id: 'full_retirement_67',
    name: 'Full Retirement at 67',
    description: 'Retire at full Social Security age with full benefits',
    category: 'retirement_age',
    parameters: {
      personalParameters: { retirementAge: 67 },
      socialSecurityParameters: {
        claimingAge: 67,
        estimatedBenefit: 2500 // Full benefit at FRA
      }
    },
    isPopular: true,
    applicableGroups: ['1', '2', '3', '4']
  },
  {
    id: 'delayed_retirement_70',
    name: 'Delayed Retirement at 70',
    description: 'Maximize benefits by delaying retirement',
    category: 'retirement_age',
    parameters: {
      personalParameters: { retirementAge: 70 },
      socialSecurityParameters: {
        claimingAge: 70,
        estimatedBenefit: 3100 // Increased benefit for delayed claiming
      }
    },
    isPopular: true,
    applicableGroups: ['1', '2', '3', '4']
  },
  {
    id: 'conservative_investment',
    name: 'Conservative Investment Strategy',
    description: 'Lower risk, stable returns approach',
    category: 'investment',
    parameters: {
      financialParameters: {
        riskTolerance: 'conservative',
        expectedReturnRate: 0.04,
        withdrawalRate: 0.035,
        currentSavings: 75000, // Conservative savings amount
        monthlyContributions: 300 // Conservative monthly contribution
      }
    },
    isPopular: false,
    applicableGroups: ['1', '2', '3', '4']
  },
  {
    id: 'aggressive_investment',
    name: 'Aggressive Investment Strategy',
    description: 'Higher risk, higher potential returns',
    category: 'investment',
    parameters: {
      financialParameters: {
        riskTolerance: 'aggressive',
        expectedReturnRate: 0.08,
        withdrawalRate: 0.045,
        currentSavings: 125000, // Aggressive savings amount
        monthlyContributions: 800 // Aggressive monthly contribution
      }
    },
    isPopular: false,
    applicableGroups: ['1', '2', '3', '4']
  }
]
