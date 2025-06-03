/**
 * Tax Implications Calculator for Retirement Income
 * Calculates federal and Massachusetts state taxes on pension and Social Security benefits
 */

export interface TaxCalculationInput {
  pensionIncome: number
  socialSecurityIncome: number
  otherRetirementIncome: number
  filingStatus: 'single' | 'marriedJoint' | 'marriedSeparate' | 'headOfHousehold'
  age: number
  spouseAge?: number
  state: string
}

export interface TaxCalculationResult {
  grossIncome: number
  adjustedGrossIncome: number
  taxableIncome: number
  federalTax: number
  stateTax: number
  totalTax: number
  netIncome: number
  effectiveTaxRate: number
  marginalTaxRate: number
  socialSecurityTaxable: number
  socialSecurityTaxablePercentage: number
  breakdown: TaxBreakdown
  recommendations: TaxRecommendation[]
}

export interface TaxBreakdown {
  federal: {
    standardDeduction: number
    taxableIncome: number
    taxByBracket: Array<{
      rate: number
      income: number
      tax: number
    }>
    totalTax: number
  }
  state: {
    standardDeduction: number
    taxableIncome: number
    tax: number
    exemptions: number
  }
  socialSecurity: {
    totalBenefit: number
    taxableAmount: number
    taxablePercentage: number
  }
}

export interface TaxRecommendation {
  type: 'withdrawal' | 'conversion' | 'timing' | 'deduction'
  title: string
  description: string
  potentialSavings: number
  complexity: 'low' | 'medium' | 'high'
}

// 2024 Federal Tax Brackets
const FEDERAL_TAX_BRACKETS_2024 = {
  single: [
    { min: 0, max: 11600, rate: 0.10 },
    { min: 11600, max: 47150, rate: 0.12 },
    { min: 47150, max: 100525, rate: 0.22 },
    { min: 100525, max: 191950, rate: 0.24 },
    { min: 191950, max: 243725, rate: 0.32 },
    { min: 243725, max: 609350, rate: 0.35 },
    { min: 609350, max: Infinity, rate: 0.37 }
  ],
  marriedJoint: [
    { min: 0, max: 23200, rate: 0.10 },
    { min: 23200, max: 94300, rate: 0.12 },
    { min: 94300, max: 201050, rate: 0.22 },
    { min: 201050, max: 383900, rate: 0.24 },
    { min: 383900, max: 487450, rate: 0.32 },
    { min: 487450, max: 731200, rate: 0.35 },
    { min: 731200, max: Infinity, rate: 0.37 }
  ]
}

// 2024 Standard Deductions
const STANDARD_DEDUCTIONS_2024 = {
  single: 14600,
  marriedJoint: 29200,
  marriedSeparate: 14600,
  headOfHousehold: 21900
}

// Massachusetts Tax Information
const MA_TAX_RATE = 0.05 // 5% flat rate
const MA_STANDARD_DEDUCTION = {
  single: 4400,
  marriedJoint: 8800,
  marriedSeparate: 4400,
  headOfHousehold: 6600
}

const MA_PERSONAL_EXEMPTION = 4400

/**
 * Calculate comprehensive tax implications for retirement income
 */
export function calculateTaxImplications(input: TaxCalculationInput): TaxCalculationResult {
  // Calculate Social Security taxability
  const socialSecurityTaxable = calculateSocialSecurityTaxability(
    input.socialSecurityIncome,
    input.pensionIncome + input.otherRetirementIncome,
    input.filingStatus
  )

  // Calculate federal taxes
  const federalResult = calculateFederalTax(
    input.pensionIncome,
    socialSecurityTaxable.taxableAmount,
    input.otherRetirementIncome,
    input.filingStatus,
    input.age,
    input.spouseAge
  )

  // Calculate Massachusetts state taxes
  const stateResult = calculateMassachusettsTax(
    input.pensionIncome,
    socialSecurityTaxable.taxableAmount,
    input.otherRetirementIncome,
    input.filingStatus,
    input.age
  )

  const grossIncome = input.pensionIncome + input.socialSecurityIncome + input.otherRetirementIncome
  const totalTax = federalResult.totalTax + stateResult.tax
  const netIncome = grossIncome - totalTax
  const effectiveTaxRate = (totalTax / grossIncome) * 100
  
  // Determine marginal tax rate
  const marginalTaxRate = determineMarginalTaxRate(
    federalResult.taxableIncome,
    input.filingStatus
  )

  // Generate tax optimization recommendations
  const recommendations = generateTaxRecommendations(input, federalResult, stateResult)

  return {
    grossIncome,
    adjustedGrossIncome: federalResult.taxableIncome + federalResult.standardDeduction,
    taxableIncome: federalResult.taxableIncome,
    federalTax: federalResult.totalTax,
    stateTax: stateResult.tax,
    totalTax,
    netIncome,
    effectiveTaxRate: Math.round(effectiveTaxRate * 100) / 100,
    marginalTaxRate,
    socialSecurityTaxable: socialSecurityTaxable.taxableAmount,
    socialSecurityTaxablePercentage: socialSecurityTaxable.taxablePercentage,
    breakdown: {
      federal: federalResult,
      state: stateResult,
      socialSecurity: {
        totalBenefit: input.socialSecurityIncome,
        taxableAmount: socialSecurityTaxable.taxableAmount,
        taxablePercentage: socialSecurityTaxable.taxablePercentage
      }
    },
    recommendations
  }
}

/**
 * Calculate Social Security taxability based on provisional income
 */
function calculateSocialSecurityTaxability(
  socialSecurityIncome: number,
  otherIncome: number,
  filingStatus: string
): { taxableAmount: number; taxablePercentage: number } {
  const provisionalIncome = otherIncome + (socialSecurityIncome * 0.5)
  
  // Thresholds for Social Security taxation
  const thresholds = filingStatus === 'marriedJoint' 
    ? { first: 32000, second: 44000 }
    : { first: 25000, second: 34000 }

  let taxablePercentage = 0
  
  if (provisionalIncome <= thresholds.first) {
    taxablePercentage = 0
  } else if (provisionalIncome <= thresholds.second) {
    taxablePercentage = 50
  } else {
    taxablePercentage = 85
  }

  const taxableAmount = (socialSecurityIncome * taxablePercentage) / 100

  return { taxableAmount, taxablePercentage }
}

/**
 * Calculate federal income tax
 */
function calculateFederalTax(
  pensionIncome: number,
  taxableSocialSecurity: number,
  otherIncome: number,
  filingStatus: string,
  age: number,
  spouseAge?: number
) {
  const brackets = filingStatus === 'marriedJoint' 
    ? FEDERAL_TAX_BRACKETS_2024.marriedJoint 
    : FEDERAL_TAX_BRACKETS_2024.single

  const standardDeduction = STANDARD_DEDUCTIONS_2024[filingStatus as keyof typeof STANDARD_DEDUCTIONS_2024]
  
  // Additional standard deduction for seniors (65+)
  let additionalDeduction = 0
  if (age >= 65) additionalDeduction += 1850
  if (filingStatus === 'marriedJoint' && spouseAge && spouseAge >= 65) additionalDeduction += 1850

  const totalDeduction = standardDeduction + additionalDeduction
  const grossIncome = pensionIncome + taxableSocialSecurity + otherIncome
  const taxableIncome = Math.max(0, grossIncome - totalDeduction)

  // Calculate tax by bracket
  const taxByBracket: Array<{ rate: number; income: number; tax: number }> = []
  let totalTax = 0
  let remainingIncome = taxableIncome

  for (const bracket of brackets) {
    if (remainingIncome <= 0) break

    const incomeInBracket = Math.min(remainingIncome, bracket.max - bracket.min)
    const taxInBracket = incomeInBracket * bracket.rate

    taxByBracket.push({
      rate: bracket.rate * 100,
      income: incomeInBracket,
      tax: taxInBracket
    })

    totalTax += taxInBracket
    remainingIncome -= incomeInBracket
  }

  return {
    standardDeduction: totalDeduction,
    taxableIncome,
    taxByBracket,
    totalTax: Math.round(totalTax)
  }
}

/**
 * Calculate Massachusetts state tax
 */
function calculateMassachusettsTax(
  pensionIncome: number,
  taxableSocialSecurity: number,
  otherIncome: number,
  filingStatus: string,
  age: number
) {
  const standardDeduction = MA_STANDARD_DEDUCTION[filingStatus as keyof typeof MA_STANDARD_DEDUCTION]
  const personalExemption = MA_PERSONAL_EXEMPTION
  
  // Massachusetts doesn't tax Social Security benefits
  const grossIncome = pensionIncome + otherIncome
  const taxableIncome = Math.max(0, grossIncome - standardDeduction - personalExemption)
  
  const tax = taxableIncome * MA_TAX_RATE

  return {
    standardDeduction,
    taxableIncome,
    tax: Math.round(tax),
    exemptions: personalExemption
  }
}

/**
 * Determine marginal tax rate
 */
function determineMarginalTaxRate(taxableIncome: number, filingStatus: string): number {
  const brackets = filingStatus === 'marriedJoint' 
    ? FEDERAL_TAX_BRACKETS_2024.marriedJoint 
    : FEDERAL_TAX_BRACKETS_2024.single

  for (const bracket of brackets) {
    if (taxableIncome <= bracket.max) {
      return bracket.rate * 100
    }
  }

  return 37 // Highest bracket
}

/**
 * Generate tax optimization recommendations
 */
function generateTaxRecommendations(
  input: TaxCalculationInput,
  federalResult: any,
  stateResult: any
): TaxRecommendation[] {
  const recommendations: TaxRecommendation[] = []

  // High tax burden recommendation
  if (federalResult.totalTax + stateResult.tax > input.pensionIncome * 0.25) {
    recommendations.push({
      type: 'withdrawal',
      title: 'Consider Tax-Efficient Withdrawal Strategy',
      description: 'Your effective tax rate is high. Consider spreading withdrawals across multiple years or using Roth accounts.',
      potentialSavings: (federalResult.totalTax + stateResult.tax) * 0.15,
      complexity: 'medium'
    })
  }

  // Social Security taxation recommendation
  if (input.socialSecurityIncome > 0) {
    const provisionalIncome = (input.pensionIncome + input.otherRetirementIncome) + (input.socialSecurityIncome * 0.5)
    const threshold = input.filingStatus === 'marriedJoint' ? 32000 : 25000
    
    if (provisionalIncome > threshold) {
      recommendations.push({
        type: 'timing',
        title: 'Optimize Social Security Claiming Timing',
        description: 'Consider delaying Social Security or reducing other income to minimize taxation of benefits.',
        potentialSavings: input.socialSecurityIncome * 0.85 * 0.22, // Rough estimate
        complexity: 'high'
      })
    }
  }

  // Roth conversion recommendation
  if (federalResult.taxableIncome < 100000) {
    recommendations.push({
      type: 'conversion',
      title: 'Consider Roth IRA Conversions',
      description: 'Your current tax bracket may be lower than in retirement. Consider converting traditional IRA funds to Roth.',
      potentialSavings: 5000, // Estimated
      complexity: 'medium'
    })
  }

  // Charitable deduction recommendation
  if (input.age >= 70.5) {
    recommendations.push({
      type: 'deduction',
      title: 'Qualified Charitable Distribution',
      description: 'Consider making charitable donations directly from your IRA to reduce taxable income.',
      potentialSavings: 2500, // Estimated
      complexity: 'low'
    })
  }

  return recommendations
}

/**
 * Calculate tax-efficient withdrawal strategy
 */
export function calculateOptimalWithdrawalStrategy(
  traditionalIRABalance: number,
  rothIRABalance: number,
  pensionIncome: number,
  socialSecurityIncome: number,
  targetIncome: number,
  filingStatus: string,
  yearsInRetirement: number
): {
  strategy: Array<{
    year: number
    traditionalWithdrawal: number
    rothWithdrawal: number
    totalTax: number
    netIncome: number
  }>
  totalTaxSaved: number
  recommendations: string[]
} {
  // Simplified optimal withdrawal strategy
  const strategy = []
  let totalTaxSaved = 0

  for (let year = 1; year <= yearsInRetirement; year++) {
    // Basic strategy: withdraw from traditional first to fill lower tax brackets
    const neededIncome = targetIncome - pensionIncome - socialSecurityIncome
    const traditionalWithdrawal = Math.min(neededIncome * 0.7, traditionalIRABalance / yearsInRetirement)
    const rothWithdrawal = Math.max(0, neededIncome - traditionalWithdrawal)

    const taxResult = calculateTaxImplications({
      pensionIncome,
      socialSecurityIncome,
      otherRetirementIncome: traditionalWithdrawal,
      filingStatus: filingStatus as any,
      age: 65 + year,
      state: 'MA'
    })

    strategy.push({
      year,
      traditionalWithdrawal,
      rothWithdrawal,
      totalTax: taxResult.totalTax,
      netIncome: taxResult.netIncome
    })
  }

  return {
    strategy,
    totalTaxSaved,
    recommendations: [
      'Withdraw from traditional accounts first to fill lower tax brackets',
      'Use Roth accounts for income above 22% tax bracket',
      'Consider tax-loss harvesting in taxable accounts'
    ]
  }
}
