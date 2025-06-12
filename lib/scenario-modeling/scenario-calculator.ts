/**
 * Retirement Scenario Calculation Engine
 * 
 * Integrates all existing calculation engines to compute comprehensive scenario results.
 * Builds on pension calculator, Social Security calculations, tax implications, and COLA projections.
 */

import { RetirementScenario, ScenarioResults, YearlyProjection } from './scenario-types'
import { calculateStandardizedPension, PensionCalculationInput, RetirementGroup } from '../standardized-pension-calculator'
import { calculateTaxImplications, TaxCalculationInput } from '../tax/tax-calculator'
import { calculateCOLAProjections } from '../social-security/cola-calculator'
import { calculateSpousalBenefits, calculateSurvivorBenefits } from '../social-security/spousal-benefits'
import { calculateNetSocialSecurityBenefit } from '../social-security/medicare-calculator'

/**
 * Main scenario calculation function
 * Integrates all calculation engines to produce comprehensive results
 */
export async function calculateScenarioResults(scenario: RetirementScenario): Promise<ScenarioResults> {
  const startTime = performance.now()
  
  try {
    // 1. Calculate pension benefits
    const pensionResults = calculatePensionBenefits(scenario)
    
    // 2. Calculate Social Security benefits
    const socialSecurityResults = calculateSocialSecurityBenefits(scenario)
    
    // 3. Calculate combined income and tax implications
    const otherRetirementIncome = scenario.financialParameters.otherRetirementIncome || 0
    const taxResults = calculateTaxImplications({
      pensionIncome: pensionResults.finalAnnualPension,
      socialSecurityIncome: socialSecurityResults.annualBenefit,
      otherRetirementIncome,
      filingStatus: mapFilingStatus(scenario.taxParameters.filingStatus),
      age: scenario.personalParameters.retirementAge,
      state: scenario.taxParameters.stateOfResidence
    })
    
    // 4. Calculate portfolio analysis if applicable
    const portfolioResults = calculatePortfolioAnalysis(scenario)
    
    // 5. Generate year-by-year projections
    const yearlyProjections = generateYearlyProjections(scenario, pensionResults, socialSecurityResults, taxResults)
    
    // 6. Calculate key metrics
    const keyMetrics = calculateKeyMetrics(scenario, pensionResults, socialSecurityResults, taxResults, portfolioResults)
    
    // Ensure calculation completes within performance requirements
    const calculationTime = performance.now() - startTime
    if (calculationTime > 2000) {
      console.warn(`Scenario calculation took ${calculationTime}ms, exceeding 2-second requirement`)
    }
    
    return {
      scenarioId: scenario.id,
      calculatedAt: new Date().toISOString(),
      
      pensionBenefits: {
        monthlyBenefit: pensionResults.finalMonthlyPension,
        annualBenefit: pensionResults.finalAnnualPension,
        lifetimeBenefits: calculateLifetimeBenefits(
          pensionResults.finalAnnualPension,
          scenario.personalParameters.retirementAge,
          scenario.personalParameters.lifeExpectancy,
          scenario.colaParameters.pensionCOLA
        ),
        benefitReduction: pensionResults.optionReduction,
        survivorBenefit: pensionResults.survivorPension
      },
      
      socialSecurityBenefits: {
        monthlyBenefit: socialSecurityResults.monthlyBenefit,
        annualBenefit: socialSecurityResults.annualBenefit,
        lifetimeBenefits: calculateLifetimeBenefits(
          socialSecurityResults.annualBenefit,
          scenario.personalParameters.retirementAge,
          scenario.personalParameters.lifeExpectancy,
          scenario.colaParameters.socialSecurityCOLA
        ),
        spousalBenefit: socialSecurityResults.spousalBenefit,
        survivorBenefit: socialSecurityResults.survivorBenefit
      },
      
      incomeProjections: {
        totalMonthlyIncome: (pensionResults.finalAnnualPension + socialSecurityResults.annualBenefit + otherRetirementIncome) / 12,
        totalAnnualIncome: pensionResults.finalAnnualPension + socialSecurityResults.annualBenefit + otherRetirementIncome,
        netAfterTaxIncome: taxResults.netIncome,
        replacementRatio: calculateReplacementRatio(
          pensionResults.finalAnnualPension + socialSecurityResults.annualBenefit,
          scenario.pensionParameters.averageSalary
        ),
        yearlyProjections
      },
      
      taxAnalysis: {
        annualTaxBurden: taxResults.totalTax,
        effectiveTaxRate: taxResults.effectiveTaxRate / 100,
        marginalTaxRate: taxResults.marginalTaxRate / 100,
        federalTax: taxResults.federalTax,
        stateTax: taxResults.stateTax,
        socialSecurityTax: taxResults.socialSecurityTaxable
      },
      
      portfolioAnalysis: portfolioResults,
      keyMetrics
    }
  } catch (error) {
    console.error('Error calculating scenario results for scenario:', scenario.id, error)
    console.error('Scenario data:', JSON.stringify(scenario, null, 2))

    // Provide more specific error information
    if (error instanceof Error) {
      throw new Error(`Failed to calculate scenario results: ${error.message}`)
    } else {
      throw new Error(`Failed to calculate scenario results: Unknown error occurred`)
    }
  }
}

/**
 * Calculate pension benefits using the standardized calculator
 */
function calculatePensionBenefits(scenario: RetirementScenario) {
  const pensionInput: PensionCalculationInput = {
    currentAge: scenario.personalParameters.currentAge,
    yearsOfService: scenario.pensionParameters.yearsOfService,
    retirementGroup: `Group ${scenario.pensionParameters.retirementGroup}` as RetirementGroup,
    serviceEntry: 'after_2012', // Default for new calculations
    currentSalary: scenario.pensionParameters.averageSalary,
    averageHighest3Years: scenario.pensionParameters.averageSalary,
    plannedRetirementAge: scenario.personalParameters.retirementAge,
    retirementOption: scenario.pensionParameters.retirementOption,
    beneficiaryAge: scenario.pensionParameters.beneficiaryAge
  }
  
  return calculateStandardizedPension(pensionInput)
}

/**
 * Calculate Social Security benefits with spousal considerations
 */
function calculateSocialSecurityBenefits(scenario: RetirementScenario) {
  const { socialSecurityParameters } = scenario

  // Base Social Security calculation
  let monthlyBenefit = 0
  let annualBenefit = 0
  let spousalBenefit = 0
  let survivorBenefit = 0

  // Calculate benefit based on claiming age vs full retirement age
  const fullRetirementBenefit = socialSecurityParameters.fullRetirementBenefit
  const claimingAge = socialSecurityParameters.claimingAge
  const fullRetirementAge = socialSecurityParameters.fullRetirementAge

  if (claimingAge === fullRetirementAge) {
    // Full benefit at full retirement age
    monthlyBenefit = fullRetirementBenefit
  } else if (claimingAge < fullRetirementAge) {
    // Early retirement reduction: approximately 6.67% per year before FRA
    const yearsEarly = fullRetirementAge - claimingAge
    const reductionRate = Math.min(yearsEarly * 0.0667, 0.25) // Max 25% reduction
    monthlyBenefit = fullRetirementBenefit * (1 - reductionRate)
  } else {
    // Delayed retirement credits: 8% per year after FRA until age 70
    const yearsDelayed = Math.min(claimingAge - fullRetirementAge, 3) // Max 3 years (age 70)
    const delayedCredits = yearsDelayed * 0.08
    monthlyBenefit = fullRetirementBenefit * (1 + delayedCredits)
  }

  annualBenefit = monthlyBenefit * 12
  
  // Calculate spousal benefits if married
  if (socialSecurityParameters.isMarried && socialSecurityParameters.spouseFullRetirementBenefit) {
    const spousalResults = calculateSpousalBenefits(
      {
        primaryInsuranceAmount: socialSecurityParameters.fullRetirementBenefit,
        fullRetirementAge: socialSecurityParameters.fullRetirementAge,
        claimingAge: socialSecurityParameters.claimingAge
      },
      {
        primaryInsuranceAmount: socialSecurityParameters.spouseFullRetirementBenefit,
        fullRetirementAge: socialSecurityParameters.spouseFullRetirementAge || 67,
        claimingAge: socialSecurityParameters.spouseClaimingAge || 67
      }
    )
    
    spousalBenefit = spousalResults.spousalBenefit
    
    // Calculate survivor benefits
    const survivorResults = calculateSurvivorBenefits(
      {
        primaryInsuranceAmount: Math.max(socialSecurityParameters.fullRetirementBenefit, socialSecurityParameters.spouseFullRetirementBenefit),
        fullRetirementAge: socialSecurityParameters.fullRetirementAge,
        claimingAge: socialSecurityParameters.claimingAge
      },
      scenario.personalParameters.currentAge
    )
    
    survivorBenefit = survivorResults.survivorBenefit
  }
  
  return {
    monthlyBenefit,
    annualBenefit,
    spousalBenefit,
    survivorBenefit
  }
}

/**
 * Calculate portfolio analysis for retirement savings
 */
function calculatePortfolioAnalysis(scenario: RetirementScenario) {
  const { financialParameters, personalParameters } = scenario

  // Provide defaults for missing financial parameters
  const rothIRABalance = financialParameters.rothIRABalance || 0
  const traditional401kBalance = financialParameters.traditional401kBalance || 0
  const traditionalIRABalance = financialParameters.traditionalIRABalance || 0
  const savingsAccountBalance = financialParameters.savingsAccountBalance || 0
  const expectedReturnRate = financialParameters.expectedReturnRate || 0.07
  const inflationRate = financialParameters.inflationRate || 0.025
  const withdrawalRate = financialParameters.withdrawalRate || 0.04

  const totalPortfolio = rothIRABalance + traditional401kBalance + traditionalIRABalance + savingsAccountBalance

  if (totalPortfolio === 0) {
    return undefined
  }
  
  const retirementYears = personalParameters.lifeExpectancy - personalParameters.retirementAge
  const annualWithdrawal = totalPortfolio * withdrawalRate

  // Simple portfolio longevity calculation
  // More sophisticated Monte Carlo simulation would be implemented in production
  const portfolioLongevity = calculatePortfolioLongevity(
    totalPortfolio,
    annualWithdrawal,
    expectedReturnRate,
    inflationRate
  )
  
  return {
    initialBalance: totalPortfolio,
    finalBalance: Math.max(0, totalPortfolio - (annualWithdrawal * retirementYears)),
    totalWithdrawals: annualWithdrawal * Math.min(retirementYears, portfolioLongevity),
    portfolioLongevity,
    probabilityOfSuccess: portfolioLongevity >= retirementYears ? 0.85 : 0.45 // Simplified calculation
  }
}

/**
 * Generate year-by-year income projections
 */
function generateYearlyProjections(
  scenario: RetirementScenario,
  pensionResults: any,
  socialSecurityResults: any,
  taxResults: any
): YearlyProjection[] {
  const projections: YearlyProjection[] = []
  const startYear = new Date().getFullYear()
  const retirementYear = startYear + (scenario.personalParameters.retirementAge - scenario.personalParameters.currentAge)
  const endYear = startYear + (scenario.personalParameters.lifeExpectancy - scenario.personalParameters.currentAge)
  
  let currentPensionIncome = pensionResults.finalAnnualPension
  let currentSSIncome = socialSecurityResults.annualBenefit
  let portfolioBalance = (scenario.financialParameters.rothIRABalance || 0) +
                        (scenario.financialParameters.traditional401kBalance || 0) +
                        (scenario.financialParameters.traditionalIRABalance || 0) +
                        (scenario.financialParameters.savingsAccountBalance || 0)
  
  for (let year = retirementYear; year < endYear; year++) {
    const age = scenario.personalParameters.retirementAge + (year - retirementYear)
    
    // Apply COLA adjustments
    if (year > retirementYear) {
      currentPensionIncome *= (1 + scenario.colaParameters.pensionCOLA)
      currentSSIncome *= (1 + scenario.colaParameters.socialSecurityCOLA)
    }
    
    // Portfolio withdrawal
    const withdrawalRate = scenario.financialParameters.withdrawalRate || 0.04
    const expectedReturnRate = scenario.financialParameters.expectedReturnRate || 0.07
    const portfolioWithdrawal = portfolioBalance > 0 ?
      Math.min(portfolioBalance * withdrawalRate, portfolioBalance) : 0

    // Update portfolio balance
    if (portfolioBalance > 0) {
      portfolioBalance = portfolioBalance * (1 + expectedReturnRate) - portfolioWithdrawal
      portfolioBalance = Math.max(0, portfolioBalance)
    }
    
    const otherRetirementIncome = scenario.financialParameters.otherRetirementIncome || 0
    const inflationRate = scenario.financialParameters.inflationRate || 0.025
    const totalGrossIncome = currentPensionIncome + currentSSIncome + otherRetirementIncome + portfolioWithdrawal
    const taxes = totalGrossIncome * taxResults.effectiveTaxRate / 100
    const totalNetIncome = totalGrossIncome - taxes

    projections.push({
      year,
      age,
      pensionIncome: Math.round(currentPensionIncome),
      socialSecurityIncome: Math.round(currentSSIncome),
      otherIncome: Math.round(otherRetirementIncome + portfolioWithdrawal),
      totalGrossIncome: Math.round(totalGrossIncome),
      totalNetIncome: Math.round(totalNetIncome),
      taxes: Math.round(taxes),
      inflationAdjustment: Math.pow(1 + inflationRate, year - retirementYear),
      portfolioBalance: Math.round(portfolioBalance),
      portfolioWithdrawal: Math.round(portfolioWithdrawal)
    })
  }
  
  return projections
}

/**
 * Calculate key metrics for scenario comparison
 */
function calculateKeyMetrics(
  scenario: RetirementScenario,
  pensionResults: any,
  socialSecurityResults: any,
  taxResults: any,
  portfolioResults: any
) {
  const otherRetirementIncome = scenario.financialParameters.otherRetirementIncome || 0
  const totalAnnualIncome = pensionResults.finalAnnualPension + socialSecurityResults.annualBenefit + otherRetirementIncome
  const retirementYears = scenario.personalParameters.lifeExpectancy - scenario.personalParameters.retirementAge
  
  return {
    totalLifetimeIncome: Math.round(totalAnnualIncome * retirementYears),
    breakEvenAge: calculateBreakEvenAge(scenario, pensionResults, socialSecurityResults),
    riskScore: calculateRiskScore(scenario),
    flexibilityScore: calculateFlexibilityScore(scenario),
    optimizationScore: calculateOptimizationScore(scenario, pensionResults, socialSecurityResults, taxResults)
  }
}

/**
 * Helper functions for calculations
 */
function calculateLifetimeBenefits(annualBenefit: number, retirementAge: number, lifeExpectancy: number, colaRate: number): number {
  const years = lifeExpectancy - retirementAge
  let total = 0
  let currentBenefit = annualBenefit
  
  for (let i = 0; i < years; i++) {
    total += currentBenefit
    currentBenefit *= (1 + colaRate)
  }
  
  return Math.round(total)
}

function calculateReplacementRatio(retirementIncome: number, preRetirementSalary: number): number {
  return preRetirementSalary > 0 ? (retirementIncome / preRetirementSalary) : 0
}

function calculatePortfolioLongevity(balance: number, withdrawal: number, returnRate: number, inflationRate: number): number {
  const realReturnRate = returnRate - inflationRate
  if (realReturnRate <= 0 || withdrawal >= balance * realReturnRate) {
    return balance / withdrawal
  }
  
  // Simplified calculation - in production would use Monte Carlo simulation
  return Math.log(1 - (withdrawal / (balance * realReturnRate))) / Math.log(1 + realReturnRate) * -1
}

function calculateBreakEvenAge(scenario: RetirementScenario, pensionResults: any, socialSecurityResults: any): number {
  // Simplified break-even calculation between early vs normal retirement
  return scenario.personalParameters.retirementAge + 10 // Placeholder
}

function calculateRiskScore(scenario: RetirementScenario): number {
  let score = 5 // Base score
  
  // Adjust based on risk factors
  if (scenario.financialParameters.riskTolerance === 'aggressive') score += 2
  if (scenario.financialParameters.riskTolerance === 'conservative') score -= 1
  if (scenario.personalParameters.retirementAge < 62) score += 1
  if (scenario.pensionParameters.retirementOption !== 'A') score += 1
  
  return Math.max(1, Math.min(10, score))
}

function calculateFlexibilityScore(scenario: RetirementScenario): number {
  let score = 5 // Base score

  // Higher portfolio balance = more flexibility
  const totalPortfolio = (scenario.financialParameters.rothIRABalance || 0) +
                        (scenario.financialParameters.traditional401kBalance || 0) +
                        (scenario.financialParameters.traditionalIRABalance || 0) +
                        (scenario.financialParameters.savingsAccountBalance || 0)
  if (totalPortfolio > 200000) score += 1
  if (totalPortfolio > 500000) score += 1
  if (totalPortfolio > 1000000) score += 1

  // Multiple income sources = more flexibility
  if ((scenario.financialParameters.otherRetirementIncome || 0) > 0) score += 1
  if (scenario.socialSecurityParameters.isMarried) score += 1

  // Risk tolerance affects flexibility
  if (scenario.financialParameters.riskTolerance === 'aggressive') score += 1

  return Math.max(1, Math.min(10, score))
}

function calculateOptimizationScore(scenario: RetirementScenario, pensionResults: any, socialSecurityResults: any, taxResults: any): number {
  let score = 5 // Base score
  
  // Tax optimization
  if (scenario.taxParameters.taxOptimizationStrategy === 'advanced') score += 2
  if (scenario.taxParameters.rothConversions) score += 1
  
  // Claiming strategy optimization
  if (scenario.socialSecurityParameters.claimingAge === scenario.socialSecurityParameters.fullRetirementAge) score += 1
  if (scenario.socialSecurityParameters.claimingAge > scenario.socialSecurityParameters.fullRetirementAge) score += 1
  
  // Effective tax rate
  if (taxResults.effectiveTaxRate < 15) score += 1
  if (taxResults.effectiveTaxRate > 25) score -= 1
  
  return Math.max(1, Math.min(10, score))
}

function mapFilingStatus(status: string): 'single' | 'marriedJoint' | 'marriedSeparate' | 'headOfHousehold' {
  switch (status) {
    case 'marriedJoint': return 'marriedJoint'
    case 'marriedSeparate': return 'marriedSeparate'
    case 'headOfHousehold': return 'headOfHousehold'
    default: return 'single'
  }
}

/**
 * Batch calculate multiple scenarios for comparison
 * Optimized for performance with parallel processing
 */
export async function calculateMultipleScenarios(scenarios: RetirementScenario[]): Promise<ScenarioResults[]> {
  const startTime = performance.now()

  // Limit concurrent calculations to prevent performance issues
  const maxConcurrent = 4
  const results: ScenarioResults[] = []

  for (let i = 0; i < scenarios.length; i += maxConcurrent) {
    const batch = scenarios.slice(i, i + maxConcurrent)
    const batchPromises = batch.map(scenario => calculateScenarioResults(scenario))

    try {
      const batchResults = await Promise.allSettled(batchPromises)
      for (let i = 0; i < batchResults.length; i++) {
        const result = batchResults[i]
        if (result.status === 'fulfilled') {
          results.push(result.value)
        } else {
          console.error(`Failed to calculate scenario ${batch[i].id}:`, result.reason)
          results.push(createErrorResult(batch[i]))
        }
      }
    } catch (error) {
      console.error('Error in batch calculation:', error)
      // Fallback: add error results for all scenarios in batch
      for (const scenario of batch) {
        results.push(createErrorResult(scenario))
      }
    }
  }

  const totalTime = performance.now() - startTime
  console.log(`Calculated ${scenarios.length} scenarios in ${totalTime}ms (${(totalTime / scenarios.length).toFixed(1)}ms per scenario)`)

  return results
}

/**
 * Create error result placeholder for failed calculations
 */
function createErrorResult(scenario: RetirementScenario): ScenarioResults {
  return {
    scenarioId: scenario.id,
    calculatedAt: new Date().toISOString(),
    pensionBenefits: {
      monthlyBenefit: 0,
      annualBenefit: 0,
      lifetimeBenefits: 0,
      benefitReduction: 0
    },
    socialSecurityBenefits: {
      monthlyBenefit: 0,
      annualBenefit: 0,
      lifetimeBenefits: 0
    },
    incomeProjections: {
      totalMonthlyIncome: 0,
      totalAnnualIncome: 0,
      netAfterTaxIncome: 0,
      replacementRatio: 0,
      yearlyProjections: []
    },
    taxAnalysis: {
      annualTaxBurden: 0,
      effectiveTaxRate: 0,
      marginalTaxRate: 0,
      federalTax: 0,
      stateTax: 0,
      socialSecurityTax: 0
    },
    keyMetrics: {
      totalLifetimeIncome: 0,
      breakEvenAge: 0,
      riskScore: 5,
      flexibilityScore: 5,
      optimizationScore: 5
    }
  }
}
