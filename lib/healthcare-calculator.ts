/**
 * Massachusetts Healthcare Calculator
 * Provides healthcare cost calculations and HSA benefits for Massachusetts Retirement System
 * Integrates with existing pension/Social Security calculators and maintains sub-2-second performance
 */

// TypeScript interfaces and types
export interface HealthcareCosts {
  preMedicare: {
    monthlyPremium: number
    annualPremium: number
    stateContribution: number
    employeeContribution: number
    planType: string
    deductible: number
    outOfPocketMax: number
  }
  medicare: {
    partB: number
    partBPremium: number
    partD: number
    supplement: number
    supplementalPremium: number
    total: number
    totalMonthlyPremium: number
    irmaaAdjustment: number
  }
  retireeInsurance: {
    eligible: boolean
    monthlyPremium: number
    annualPremium: number
    yearsOfServiceRequired: number
    stateContribution: number
    stateContributionPercent: number
  }
  yearsToMedicare: number
  totalLifetimeCosts: number
}

export interface HSABenefits {
  contributionLimit: number
  totalContribution: number
  employerContribution: number
  employeeContribution: number
  taxSavings: number
  projectedBalance: number
  withdrawalBenefits: {
    medicalExpenses: boolean
    retirementAge: number
    taxFreeWithdrawals: boolean
  }
}

export interface HealthPlan {
  id: string
  name: string
  type: 'HMO' | 'PPO' | 'HDHP' | 'EPO'
  description: string
  monthlyPremium: {
    individual: number
    family: number
  }
  deductible: {
    individual: number
    family: number
  }
  outOfPocketMax: {
    individual: number
    family: number
  }
  copays: {
    primaryCare: number
    specialist: number
    urgentCare: number
    emergencyRoom: number
  }
  coinsurance: number
  hsaEligible: boolean
  network: string
  prescription: {
    generic: number
    brandName: number
    specialty: number
  }
}

// Massachusetts Health Insurance Plans for State Employees and Retirees
export const MA_HEALTH_PLANS: HealthPlan[] = [
  {
    id: 'hmo-premium',
    name: 'Fallon Health HMO Premium',
    type: 'HMO',
    description: 'Comprehensive HMO coverage with lower out-of-pocket costs',
    monthlyPremium: {
      individual: 485.50,
      family: 1214.25
    },
    deductible: {
      individual: 0,
      family: 0
    },
    outOfPocketMax: {
      individual: 2500,
      family: 5000
    },
    copays: {
      primaryCare: 25,
      specialist: 40,
      urgentCare: 50,
      emergencyRoom: 150
    },
    coinsurance: 0.10,
    hsaEligible: false,
    network: 'Fallon Health Network',
    prescription: {
      generic: 10,
      brandName: 30,
      specialty: 75
    }
  },
  {
    id: 'ppo-standard',
    name: 'Blue Cross Blue Shield PPO',
    type: 'PPO',
    description: 'Flexible PPO with in-network and out-of-network coverage',
    monthlyPremium: {
      individual: 520.75,
      family: 1301.88
    },
    deductible: {
      individual: 500,
      family: 1000
    },
    outOfPocketMax: {
      individual: 3000,
      family: 6000
    },
    copays: {
      primaryCare: 30,
      specialist: 50,
      urgentCare: 75,
      emergencyRoom: 200
    },
    coinsurance: 0.20,
    hsaEligible: false,
    network: 'Blue Cross Blue Shield Network',
    prescription: {
      generic: 15,
      brandName: 40,
      specialty: 100
    }
  },
  {
    id: 'hdhp',
    name: 'High Deductible Health Plan with HSA',
    type: 'HDHP',
    description: 'Lower premiums with HSA eligibility for tax-advantaged savings',
    monthlyPremium: {
      individual: 320.25,
      family: 800.63
    },
    deductible: {
      individual: 1600,
      family: 3200
    },
    outOfPocketMax: {
      individual: 8050,
      family: 16100
    },
    copays: {
      primaryCare: 0, // Subject to deductible
      specialist: 0, // Subject to deductible
      urgentCare: 0, // Subject to deductible
      emergencyRoom: 0 // Subject to deductible
    },
    coinsurance: 0.20,
    hsaEligible: true,
    network: 'Tufts Health Plan Network',
    prescription: {
      generic: 0, // Subject to deductible
      brandName: 0, // Subject to deductible
      specialty: 0 // Subject to deductible
    }
  },
  {
    id: 'epo-value',
    name: 'Harvard Pilgrim EPO Value',
    type: 'EPO',
    description: 'Exclusive Provider Organization with moderate costs',
    monthlyPremium: {
      individual: 445.80,
      family: 1114.50
    },
    deductible: {
      individual: 750,
      family: 1500
    },
    outOfPocketMax: {
      individual: 4000,
      family: 8000
    },
    copays: {
      primaryCare: 35,
      specialist: 55,
      urgentCare: 80,
      emergencyRoom: 250
    },
    coinsurance: 0.15,
    hsaEligible: false,
    network: 'Harvard Pilgrim Network',
    prescription: {
      generic: 12,
      brandName: 35,
      specialty: 85
    }
  }
]

// Healthcare cost constants
const MEDICARE_PART_B_PREMIUM_2024 = 174.70
const MEDICARE_ELIGIBILITY_AGE = 65
const RETIREE_INSURANCE_MIN_YEARS = 10
const STATE_CONTRIBUTION_PERCENTAGE = 0.75 // State pays 75% for eligible retirees
const HEALTHCARE_INFLATION_RATE = 0.05 // 5% annual healthcare inflation
const HSA_CONTRIBUTION_LIMITS_2024 = {
  individual: 4150,
  family: 8300,
  catchUp: 1000 // Age 55+
}

/**
 * Calculates comprehensive healthcare costs for Massachusetts state employee retirees
 * @param currentAge - Current age of the retiree
 * @param yearsOfService - Years of state service
 * @param currentSalary - Current annual salary
 * @param retirementAge - Planned retirement age
 * @param coverageType - Individual or family coverage
 * @param selectedPlanId - Selected health plan ID
 * @returns Comprehensive healthcare cost analysis
 */
export function calculateHealthcareCosts(
  currentAge: number,
  yearsOfService: number,
  currentSalary: number,
  retirementAge: number,
  coverageType: 'individual' | 'family',
  selectedPlanId: string
): HealthcareCosts {
  // Find selected plan
  const selectedPlan = MA_HEALTH_PLANS.find(plan => plan.id === selectedPlanId)
  if (!selectedPlan) {
    throw new Error(`Health plan not found: ${selectedPlanId}`)
  }

  // Calculate years to Medicare eligibility
  const yearsToMedicare = Math.max(0, MEDICARE_ELIGIBILITY_AGE - retirementAge)
  
  // Determine retiree insurance eligibility
  const retireeInsuranceEligible = yearsOfService >= RETIREE_INSURANCE_MIN_YEARS
  
  // Calculate monthly premiums
  const monthlyPremium = selectedPlan.monthlyPremium[coverageType]
  const stateContribution = retireeInsuranceEligible ? monthlyPremium * STATE_CONTRIBUTION_PERCENTAGE : 0
  const employeeContribution = monthlyPremium - stateContribution

  // Calculate Medicare costs (for age 65+)
  const medicarePremium = calculateMedicarePremium(currentSalary)
  
  // Project lifetime healthcare costs
  const preMedicareYears = yearsToMedicare
  const preMedicareCosts = preMedicareYears * monthlyPremium * 12
  const medicareYears = 20 // Estimate 20 years on Medicare
  const medicareCosts = medicareYears * medicarePremium.totalPremium * 12
  const totalLifetimeCosts = preMedicareCosts + medicareCosts

  return {
    preMedicare: {
      monthlyPremium,
      annualPremium: monthlyPremium * 12,
      stateContribution,
      employeeContribution,
      planType: selectedPlan.name,
      deductible: selectedPlan.deductible[coverageType],
      outOfPocketMax: selectedPlan.outOfPocketMax[coverageType]
    },
    medicare: {
      partB: MEDICARE_PART_B_PREMIUM_2024,
      partBPremium: MEDICARE_PART_B_PREMIUM_2024,
      partD: 35, // Estimated Medicare Part D premium
      supplement: 150, // Estimated Medigap premium
      supplementalPremium: 150,
      total: medicarePremium.totalPremium + 35 + 150, // Part B + Part D + Supplement
      totalMonthlyPremium: medicarePremium.totalPremium,
      irmaaAdjustment: medicarePremium.irmaaAdjustment
    },
    retireeInsurance: {
      eligible: retireeInsuranceEligible,
      monthlyPremium: employeeContribution,
      annualPremium: employeeContribution * 12,
      yearsOfServiceRequired: RETIREE_INSURANCE_MIN_YEARS,
      stateContribution,
      stateContributionPercent: retireeInsuranceEligible ? STATE_CONTRIBUTION_PERCENTAGE * 100 : 0
    },
    yearsToMedicare,
    totalLifetimeCosts
  }
}

/**
 * Calculates Medicare Part B premium including IRMAA adjustments
 * @param income - Annual income for IRMAA calculation
 * @returns Medicare premium breakdown
 */
function calculateMedicarePremium(income: number) {
  let irmaaAdjustment = 0
  
  // 2024 IRMAA thresholds for Medicare Part B
  if (income > 103000 && income <= 129000) {
    irmaaAdjustment = 69.90
  } else if (income > 129000 && income <= 161000) {
    irmaaAdjustment = 174.70
  } else if (income > 161000 && income <= 193000) {
    irmaaAdjustment = 279.50
  } else if (income > 193000) {
    irmaaAdjustment = 384.30
  }

  return {
    partB: MEDICARE_PART_B_PREMIUM_2024,
    irmaaAdjustment,
    totalPremium: MEDICARE_PART_B_PREMIUM_2024 + irmaaAdjustment
  }
}

/**
 * Calculates Health Savings Account benefits for HDHP participants
 * @param currentAge - Current age for catch-up contribution eligibility
 * @param currentSalary - Current annual salary for tax savings calculation
 * @param coverageType - Individual or family coverage for contribution limits
 * @returns HSA benefits analysis
 */
export function calculateHSABenefits(
  currentAge: number,
  currentSalary: number,
  coverageType: 'individual' | 'family'
): HSABenefits {
  // Determine contribution limits
  const baseLimit = HSA_CONTRIBUTION_LIMITS_2024[coverageType]
  const catchUpEligible = currentAge >= 55
  const catchUpAmount = catchUpEligible ? HSA_CONTRIBUTION_LIMITS_2024.catchUp : 0
  const totalContribution = baseLimit + catchUpAmount

  // Estimate employer contribution (typically 50% up to $1000)
  const employerContribution = Math.min(totalContribution * 0.5, 1000)
  const employeeContribution = totalContribution - employerContribution

  // Calculate tax savings (federal + state)
  const federalTaxRate = calculateFederalTaxRate(currentSalary)
  const stateTaxRate = 0.05 // Massachusetts flat rate
  const totalTaxRate = federalTaxRate + stateTaxRate
  const taxSavings = totalContribution * totalTaxRate

  // Project HSA balance growth (assuming 6% annual return)
  const yearsToRetirement = Math.max(0, 65 - currentAge)
  const annualReturn = 0.06
  const projectedBalance = calculateHSAProjection(totalContribution, yearsToRetirement, annualReturn)

  return {
    contributionLimit: baseLimit,
    totalContribution,
    employerContribution,
    employeeContribution,
    taxSavings,
    projectedBalance,
    withdrawalBenefits: {
      medicalExpenses: true,
      retirementAge: 65,
      taxFreeWithdrawals: true
    }
  }
}

/**
 * Calculates federal tax rate based on income
 * @param income - Annual income
 * @returns Estimated federal tax rate
 */
function calculateFederalTaxRate(income: number): number {
  // Simplified federal tax brackets for 2024 (single filer)
  if (income <= 11000) return 0.10
  if (income <= 44725) return 0.12
  if (income <= 95375) return 0.22
  if (income <= 182050) return 0.24
  if (income <= 231250) return 0.32
  if (income <= 578125) return 0.35
  return 0.37
}

/**
 * Projects HSA balance growth over time
 * @param annualContribution - Annual HSA contribution
 * @param years - Years until retirement
 * @param returnRate - Expected annual return rate
 * @returns Projected HSA balance
 */
function calculateHSAProjection(
  annualContribution: number,
  years: number,
  returnRate: number
): number {
  if (years <= 0) return 0

  // Future value of annuity formula
  const futureValue = annualContribution * (((1 + returnRate) ** years - 1) / returnRate)
  return futureValue
}

/**
 * Formats currency values for healthcare display
 * Consistent with existing formatCurrency utility but optimized for healthcare amounts
 * @param amount - Amount to format
 * @returns Formatted currency string
 */
export function formatHealthcareCurrency(amount: number | undefined | null): string {
  // Handle undefined, null, or NaN values
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '$0'
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Calculates healthcare cost inflation adjustments
 * @param baseCost - Base healthcare cost
 * @param years - Number of years to project
 * @param inflationRate - Annual healthcare inflation rate (default 5%)
 * @returns Inflation-adjusted cost
 */
export function calculateHealthcareInflation(
  baseCost: number,
  years: number,
  inflationRate: number = HEALTHCARE_INFLATION_RATE
): number {
  return baseCost * Math.pow(1 + inflationRate, years)
}

/**
 * Determines eligibility for Massachusetts retiree health insurance
 * @param yearsOfService - Years of state service
 * @param retirementAge - Age at retirement
 * @returns Eligibility status and requirements
 */
export function checkRetireeInsuranceEligibility(
  yearsOfService: number,
  retirementAge: number
): {
  eligible: boolean
  message: string
  yearsNeeded?: number
} {
  if (yearsOfService >= RETIREE_INSURANCE_MIN_YEARS) {
    return {
      eligible: true,
      message: 'Eligible for Massachusetts retiree health insurance with state contribution'
    }
  }

  const yearsNeeded = RETIREE_INSURANCE_MIN_YEARS - yearsOfService
  return {
    eligible: false,
    message: `Need ${yearsNeeded} more years of service for retiree health insurance eligibility`,
    yearsNeeded
  }
}
