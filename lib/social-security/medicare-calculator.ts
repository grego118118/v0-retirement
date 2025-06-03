/**
 * Medicare Premium Calculator for Social Security Integration
 * Based on 2024 Medicare premium rates and income-related adjustments
 */

// 2024 Medicare Part B premium rates
export const MEDICARE_PART_B_2024 = {
  standardPremium: 174.70,
  deductible: 240,
  // Income-Related Monthly Adjustment Amount (IRMAA) brackets
  irmaaThresholds: [
    { minIncome: 0, maxIncome: 103000, premium: 174.70 },
    { minIncome: 103001, maxIncome: 129000, premium: 244.60 },
    { minIncome: 129001, maxIncome: 161000, premium: 349.40 },
    { minIncome: 161001, maxIncome: 193000, premium: 454.20 },
    { minIncome: 193001, maxIncome: 500000, premium: 559.00 },
    { minIncome: 500001, maxIncome: Infinity, premium: 594.00 }
  ]
}

// 2024 Medicare Part D premium IRMAA
export const MEDICARE_PART_D_IRMAA_2024 = [
  { minIncome: 0, maxIncome: 103000, irmaa: 0 },
  { minIncome: 103001, maxIncome: 129000, irmaa: 12.90 },
  { minIncome: 129001, maxIncome: 161000, irmaa: 33.30 },
  { minIncome: 161001, maxIncome: 193000, irmaa: 53.80 },
  { minIncome: 193001, maxIncome: 500000, irmaa: 74.20 },
  { minIncome: 500001, maxIncome: Infinity, irmaa: 81.00 }
]

export interface MedicareCalculationInput {
  annualIncome: number
  filingStatus: 'single' | 'married' | 'marriedSeparate'
  includePartD?: boolean
  partDPremium?: number
}

export interface MedicareCalculationResult {
  partBPremium: number
  partDIRMAA: number
  partDTotalPremium: number
  totalMonthlyPremium: number
  totalAnnualPremium: number
  incomeCategory: string
  netSocialSecurityBenefit: number
  explanation: string
}

/**
 * Calculate Medicare premiums based on income
 */
export function calculateMedicarePremiums(
  input: MedicareCalculationInput,
  socialSecurityBenefit: number
): MedicareCalculationResult {
  const { annualIncome, filingStatus, includePartD = true, partDPremium = 55 } = input
  
  // Adjust income thresholds for married filing jointly (double the single thresholds)
  const incomeMultiplier = filingStatus === 'married' ? 2 : 1
  
  // Find Part B premium bracket
  const partBBracket = MEDICARE_PART_B_2024.irmaaThresholds.find(bracket => 
    annualIncome >= bracket.minIncome && 
    annualIncome <= (bracket.maxIncome === Infinity ? Infinity : bracket.maxIncome * incomeMultiplier)
  ) || MEDICARE_PART_B_2024.irmaaThresholds[0]
  
  // Find Part D IRMAA bracket
  const partDBracket = MEDICARE_PART_D_IRMAA_2024.find(bracket => 
    annualIncome >= bracket.minIncome && 
    annualIncome <= (bracket.maxIncome === Infinity ? Infinity : bracket.maxIncome * incomeMultiplier)
  ) || MEDICARE_PART_D_IRMAA_2024[0]
  
  const partBPremium = partBBracket.premium
  const partDIRMAA = partDBracket.irmaa
  const partDTotalPremium = includePartD ? partDPremium + partDIRMAA : 0
  const totalMonthlyPremium = partBPremium + partDTotalPremium
  const totalAnnualPremium = totalMonthlyPremium * 12
  
  // Calculate net Social Security benefit after Medicare premiums
  const netSocialSecurityBenefit = socialSecurityBenefit - totalMonthlyPremium
  
  // Determine income category for explanation
  let incomeCategory = "Standard"
  if (annualIncome > 103000 * incomeMultiplier) incomeCategory = "High Income (IRMAA applies)"
  if (annualIncome > 500000 * incomeMultiplier) incomeCategory = "Very High Income"
  
  const explanation = generateMedicareExplanation(
    partBPremium,
    partDIRMAA,
    incomeCategory,
    filingStatus,
    annualIncome
  )
  
  return {
    partBPremium: Math.round(partBPremium * 100) / 100,
    partDIRMAA: Math.round(partDIRMAA * 100) / 100,
    partDTotalPremium: Math.round(partDTotalPremium * 100) / 100,
    totalMonthlyPremium: Math.round(totalMonthlyPremium * 100) / 100,
    totalAnnualPremium: Math.round(totalAnnualPremium * 100) / 100,
    incomeCategory,
    netSocialSecurityBenefit: Math.round(netSocialSecurityBenefit * 100) / 100,
    explanation
  }
}

/**
 * Generate explanation text for Medicare premium calculation
 */
function generateMedicareExplanation(
  partBPremium: number,
  partDIRMAA: number,
  incomeCategory: string,
  filingStatus: string,
  annualIncome: number
): string {
  let explanation = `Medicare Part B premium: $${partBPremium.toFixed(2)}/month. `
  
  if (partDIRMAA > 0) {
    explanation += `Due to higher income ($${annualIncome.toLocaleString()}), an additional IRMAA surcharge of $${partDIRMAA.toFixed(2)}/month applies to Part D coverage. `
  }
  
  explanation += `These premiums are typically deducted directly from Social Security benefits.`
  
  return explanation
}

/**
 * Project Medicare premiums with inflation
 */
export function projectMedicarePremiums(
  currentPremium: number,
  years: number,
  inflationRate: number = 4.5 // Medicare premiums typically increase faster than general inflation
): { year: number; premium: number }[] {
  const projections = []
  let premium = currentPremium
  
  for (let year = 0; year <= years; year++) {
    if (year > 0) {
      premium = premium * (1 + inflationRate / 100)
    }
    projections.push({
      year: new Date().getFullYear() + year,
      premium: Math.round(premium * 100) / 100
    })
  }
  
  return projections
}

/**
 * Calculate net Social Security benefit after Medicare deductions
 */
export function calculateNetSocialSecurityBenefit(
  grossSocialSecurityBenefit: number,
  annualIncome: number,
  filingStatus: 'single' | 'married' | 'marriedSeparate' = 'single',
  includePartD: boolean = true
): {
  grossBenefit: number
  medicarePremiums: number
  netBenefit: number
  reductionPercentage: number
} {
  const medicareResult = calculateMedicarePremiums(
    { annualIncome, filingStatus, includePartD },
    grossSocialSecurityBenefit
  )
  
  const medicarePremiums = medicareResult.totalMonthlyPremium
  const netBenefit = grossSocialSecurityBenefit - medicarePremiums
  const reductionPercentage = (medicarePremiums / grossSocialSecurityBenefit) * 100
  
  return {
    grossBenefit: Math.round(grossSocialSecurityBenefit * 100) / 100,
    medicarePremiums: Math.round(medicarePremiums * 100) / 100,
    netBenefit: Math.round(netBenefit * 100) / 100,
    reductionPercentage: Math.round(reductionPercentage * 10) / 10
  }
}
