/**
 * Scenario Modeling Utility Functions
 * 
 * Helper functions for creating, validating, and manipulating retirement scenarios.
 */

import { RetirementScenario, ScenarioResults, DEFAULT_SCENARIO_TEMPLATES } from './scenario-types'
import { CombinedCalculationData } from '../wizard/wizard-types'

/**
 * Generate a unique scenario ID
 */
export function generateScenarioId(): string {
  return `scenario_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Create a default scenario from user profile data
 */
export function createDefaultScenario(
  name: string,
  profileData: Partial<CombinedCalculationData>
): RetirementScenario {
  const now = new Date().toISOString()
  
  return {
    id: generateScenarioId(),
    name,
    description: 'Default scenario based on your current profile',
    isBaseline: true,
    createdAt: now,
    updatedAt: now,
    
    personalParameters: {
      retirementAge: profileData.personalInfo?.retirementGoalAge || 67,
      lifeExpectancy: profileData.personalInfo?.lifeExpectancy || 85,
      currentAge: profileData.personalInfo?.currentAge || 45,
      birthYear: profileData.personalInfo?.birthYear || new Date().getFullYear() - 45
    },
    
    pensionParameters: {
      retirementGroup: (profileData.pensionData?.retirementGroup as '1' | '2' | '3' | '4') || '1',
      yearsOfService: profileData.pensionData?.yearsOfService || 20,
      averageSalary: profileData.pensionData?.averageSalary || 75000,
      retirementOption: (profileData.pensionData?.retirementOption as 'A' | 'B' | 'C' | 'D') || 'A',
      servicePurchases: []
    },
    
    socialSecurityParameters: {
      claimingAge: profileData.socialSecurityData?.selectedClaimingAge || 67,
      fullRetirementAge: profileData.socialSecurityData?.fullRetirementAge || 67,
      fullRetirementBenefit: profileData.socialSecurityData?.fullRetirementBenefit || 2500,
      earlyRetirementBenefit: profileData.socialSecurityData?.earlyRetirementBenefit || 1875,
      delayedRetirementBenefit: profileData.socialSecurityData?.delayedRetirementBenefit || 3300,
      isMarried: profileData.socialSecurityData?.isMarried || false,
      optimizeSpouseBenefits: false
    },
    
    financialParameters: {
      otherRetirementIncome: profileData.incomeData?.otherRetirementIncome || 0,
      rothIRABalance: profileData.incomeData?.rothIRABalance || 0,
      traditional401kBalance: profileData.incomeData?.traditional401kBalance || 0,
      traditionalIRABalance: 0,
      savingsAccountBalance: 0,
      expectedReturnRate: 0.06,
      inflationRate: 0.025,
      riskTolerance: profileData.preferences?.riskTolerance || 'moderate',
      withdrawalStrategy: 'percentage',
      withdrawalRate: 0.04,
      estimatedMedicarePremiums: profileData.incomeData?.estimatedMedicarePremiums || 174.70,
      longTermCareInsurance: false,
      healthcareCostInflation: 0.05
    },
    
    taxParameters: {
      filingStatus: profileData.personalInfo?.filingStatus || 'single',
      stateOfResidence: 'MA',
      taxOptimizationStrategy: profileData.preferences?.includeTaxOptimization ? 'basic' : 'none',
      rothConversions: false,
      taxLossHarvesting: false
    },
    
    colaParameters: {
      pensionCOLA: 0.03,
      socialSecurityCOLA: 0.025,
      colaScenario: profileData.preferences?.inflationScenario || 'moderate'
    }
  }
}

/**
 * Create a scenario from a template
 */
export function createScenarioFromTemplate(
  templateId: string,
  baseName: string,
  baseScenario: RetirementScenario
): RetirementScenario {
  const template = DEFAULT_SCENARIO_TEMPLATES.find(t => t.id === templateId)
  if (!template) {
    throw new Error(`Template ${templateId} not found`)
  }
  
  const now = new Date().toISOString()
  
  // Deep clone the base scenario
  const newScenario: RetirementScenario = JSON.parse(JSON.stringify(baseScenario))
  
  // Update metadata
  newScenario.id = generateScenarioId()
  newScenario.name = `${baseName} - ${template.name}`
  newScenario.description = template.description
  newScenario.isBaseline = false
  newScenario.createdAt = now
  newScenario.updatedAt = now
  
  // Apply template parameters with deep merge to preserve required fields
  if (template.parameters.personalParameters) {
    newScenario.personalParameters = {
      ...newScenario.personalParameters,
      ...template.parameters.personalParameters
    }
  }

  if (template.parameters.pensionParameters) {
    newScenario.pensionParameters = {
      ...newScenario.pensionParameters,
      ...template.parameters.pensionParameters
    }
  }

  if (template.parameters.socialSecurityParameters) {
    newScenario.socialSecurityParameters = {
      ...newScenario.socialSecurityParameters,
      ...template.parameters.socialSecurityParameters
    }
  }

  if (template.parameters.financialParameters) {
    newScenario.financialParameters = {
      ...newScenario.financialParameters,
      ...template.parameters.financialParameters
    }
  }

  if (template.parameters.taxParameters) {
    newScenario.taxParameters = {
      ...newScenario.taxParameters,
      ...template.parameters.taxParameters
    }
  }

  if (template.parameters.colaParameters) {
    newScenario.colaParameters = {
      ...newScenario.colaParameters,
      ...template.parameters.colaParameters
    }
  }
  
  return newScenario
}

/**
 * Duplicate a scenario with modifications
 */
export function duplicateScenario(
  originalScenario: RetirementScenario,
  newName: string,
  modifications?: Partial<RetirementScenario>
): RetirementScenario {
  const now = new Date().toISOString()
  
  const duplicatedScenario: RetirementScenario = {
    ...JSON.parse(JSON.stringify(originalScenario)),
    id: generateScenarioId(),
    name: newName,
    isBaseline: false,
    createdAt: now,
    updatedAt: now,
    ...modifications
  }
  
  return duplicatedScenario
}

/**
 * Validate scenario parameters
 */
export function validateScenario(scenario: RetirementScenario): {
  isValid: boolean
  errors: string[]
  warnings: string[]
} {
  const errors: string[] = []
  const warnings: string[] = []
  
  // Validate personal parameters
  const { personalParameters } = scenario
  if (personalParameters.retirementAge < 55 || personalParameters.retirementAge > 75) {
    errors.push('Retirement age must be between 55 and 75')
  }
  
  if (personalParameters.lifeExpectancy < personalParameters.retirementAge) {
    errors.push('Life expectancy must be greater than retirement age')
  }
  
  if (personalParameters.currentAge >= personalParameters.retirementAge) {
    warnings.push('Current age is at or past retirement age')
  }
  
  // Validate pension parameters
  const { pensionParameters } = scenario
  if (pensionParameters.yearsOfService < 0 || pensionParameters.yearsOfService > 50) {
    errors.push('Years of service must be between 0 and 50')
  }
  
  if (pensionParameters.averageSalary <= 0) {
    errors.push('Average salary must be positive')
  }
  
  if (pensionParameters.yearsOfService < 10) {
    warnings.push('Less than 10 years of service may not qualify for full benefits')
  }
  
  // Validate Social Security parameters
  const { socialSecurityParameters } = scenario
  if (socialSecurityParameters.claimingAge < 62 || socialSecurityParameters.claimingAge > 70) {
    errors.push('Social Security claiming age must be between 62 and 70')
  }
  
  if (socialSecurityParameters.fullRetirementBenefit <= 0) {
    errors.push('Full retirement benefit must be positive')
  }
  
  // Validate financial parameters
  const { financialParameters } = scenario
  if (financialParameters.expectedReturnRate < 0 || financialParameters.expectedReturnRate > 0.15) {
    warnings.push('Expected return rate seems unusually high or low')
  }
  
  if (financialParameters.withdrawalRate < 0.02 || financialParameters.withdrawalRate > 0.08) {
    warnings.push('Withdrawal rate outside typical range (2%-8%)')
  }
  
  // Validate COLA parameters
  const { colaParameters } = scenario
  if (colaParameters.pensionCOLA < 0 || colaParameters.pensionCOLA > 0.1) {
    warnings.push('Pension COLA rate seems unusually high or low')
  }
  
  if (colaParameters.socialSecurityCOLA < 0 || colaParameters.socialSecurityCOLA > 0.1) {
    warnings.push('Social Security COLA rate seems unusually high or low')
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

/**
 * Compare two scenarios and highlight differences
 */
export function compareScenarios(
  scenario1: RetirementScenario,
  scenario2: RetirementScenario
): {
  differences: Array<{
    category: string
    parameter: string
    scenario1Value: any
    scenario2Value: any
  }>
  summary: string
} {
  const differences: Array<{
    category: string
    parameter: string
    scenario1Value: any
    scenario2Value: any
  }> = []
  
  // Compare personal parameters
  Object.entries(scenario1.personalParameters).forEach(([key, value]) => {
    if (value !== scenario2.personalParameters[key as keyof typeof scenario2.personalParameters]) {
      differences.push({
        category: 'Personal',
        parameter: key,
        scenario1Value: value,
        scenario2Value: scenario2.personalParameters[key as keyof typeof scenario2.personalParameters]
      })
    }
  })
  
  // Compare pension parameters
  Object.entries(scenario1.pensionParameters).forEach(([key, value]) => {
    if (JSON.stringify(value) !== JSON.stringify(scenario2.pensionParameters[key as keyof typeof scenario2.pensionParameters])) {
      differences.push({
        category: 'Pension',
        parameter: key,
        scenario1Value: value,
        scenario2Value: scenario2.pensionParameters[key as keyof typeof scenario2.pensionParameters]
      })
    }
  })
  
  // Compare Social Security parameters
  Object.entries(scenario1.socialSecurityParameters).forEach(([key, value]) => {
    if (JSON.stringify(value) !== JSON.stringify(scenario2.socialSecurityParameters[key as keyof typeof scenario2.socialSecurityParameters])) {
      differences.push({
        category: 'Social Security',
        parameter: key,
        scenario1Value: value,
        scenario2Value: scenario2.socialSecurityParameters[key as keyof typeof scenario2.socialSecurityParameters]
      })
    }
  })
  
  // Generate summary
  const majorDifferences = differences.filter(d => 
    ['retirementAge', 'claimingAge', 'retirementOption', 'riskTolerance'].includes(d.parameter)
  )
  
  let summary = `Found ${differences.length} differences between scenarios.`
  if (majorDifferences.length > 0) {
    summary += ` Key differences: ${majorDifferences.map(d => d.parameter).join(', ')}.`
  }
  
  return { differences, summary }
}

/**
 * Calculate scenario complexity score (for UI prioritization)
 */
export function calculateScenarioComplexity(scenario: RetirementScenario): number {
  let complexity = 0
  
  // Base complexity
  complexity += 1
  
  // Add complexity for non-default values
  if (scenario.pensionParameters.retirementOption !== 'A') complexity += 1
  if (scenario.socialSecurityParameters.isMarried) complexity += 1
  if (scenario.financialParameters.riskTolerance !== 'moderate') complexity += 1
  if (scenario.taxParameters.taxOptimizationStrategy !== 'none') complexity += 1
  if (scenario.financialParameters.rothIRABalance > 0) complexity += 1
  if (scenario.financialParameters.traditional401kBalance > 0) complexity += 1
  if (scenario.pensionParameters.servicePurchases && scenario.pensionParameters.servicePurchases.length > 0) complexity += 2
  if (scenario.colaParameters.customCOLASchedule && scenario.colaParameters.customCOLASchedule.length > 0) complexity += 2
  
  return Math.min(complexity, 10) // Cap at 10
}
