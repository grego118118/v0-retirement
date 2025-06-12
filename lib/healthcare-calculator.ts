// Healthcare Benefits Calculator for Massachusetts Retirement System
export interface HealthcarePlan {
  id: string
  name: string
  type: 'HMO' | 'PPO' | 'HDHP'
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
  description: string
}

export interface HealthcareCosts {
  preMedicare: {
    monthlyPremium: number
    annualPremium: number
    stateContribution: number
    employeeContribution: number
    planType: string
    coverageType: 'individual' | 'family'
  }
  medicare: {
    partB: number
    partD: number
    supplement: number
    advantage: number
    total: number
  }
  retireeInsurance: {
    eligible: boolean
    stateContributionPercent: number
    monthlyPremium: number
    annualPremium: number
  }
  yearsToMedicare: number
  totalLifetimeCosts: number
}

// Massachusetts state employee health plans (2024 rates)
export const MA_HEALTH_PLANS: HealthcarePlan[] = [
  {
    id: 'hmo-basic',
    name: 'HMO Basic',
    type: 'HMO',
    monthlyPremium: { individual: 450, family: 1200 },
    deductible: { individual: 500, family: 1000 },
    outOfPocketMax: { individual: 3000, family: 6000 },
    description: 'Lower cost HMO with network restrictions'
  },
  {
    id: 'hmo-premium',
    name: 'HMO Premium',
    type: 'HMO',
    monthlyPremium: { individual: 550, family: 1450 },
    deductible: { individual: 250, family: 500 },
    outOfPocketMax: { individual: 2500, family: 5000 },
    description: 'Enhanced HMO with better coverage'
  },
  {
    id: 'ppo-standard',
    name: 'PPO Standard',
    type: 'PPO',
    monthlyPremium: { individual: 650, family: 1700 },
    deductible: { individual: 750, family: 1500 },
    outOfPocketMax: { individual: 4000, family: 8000 },
    description: 'Flexible PPO with out-of-network coverage'
  },
  {
    id: 'ppo-premium',
    name: 'PPO Premium',
    type: 'PPO',
    monthlyPremium: { individual: 750, family: 1950 },
    deductible: { individual: 500, family: 1000 },
    outOfPocketMax: { individual: 3500, family: 7000 },
    description: 'Premium PPO with comprehensive coverage'
  },
  {
    id: 'hdhp',
    name: 'High Deductible Health Plan',
    type: 'HDHP',
    monthlyPremium: { individual: 350, family: 950 },
    deductible: { individual: 2500, family: 5000 },
    outOfPocketMax: { individual: 5000, family: 10000 },
    description: 'HSA-eligible plan with lower premiums'
  }
]

// Calculate state contribution percentage based on years of service
export function calculateStateContribution(yearsOfService: number): number {
  if (yearsOfService >= 20) return 90
  if (yearsOfService >= 15) return 80
  if (yearsOfService >= 10) return 70
  if (yearsOfService >= 5) return 50
  return 0
}

// Calculate Medicare eligibility and costs
export function calculateMedicareCosts(currentAge: number, income: number = 0): {
  partB: number
  partD: number
  supplement: number
  advantage: number
  total: number
  yearsToEligibility: number
} {
  const yearsToMedicare = Math.max(0, 65 - currentAge)
  
  // Medicare Part B (2024 rates with income adjustments)
  let partB = 174.70 // Standard premium
  if (income > 103000) partB = 244.60
  if (income > 129000) partB = 349.40
  if (income > 161000) partB = 454.20
  if (income > 193000) partB = 559.00
  if (income > 500000) partB = 594.00
  
  // Medicare Part D (prescription drugs)
  const partD = 55.50 // Average premium
  
  // Medigap supplement insurance
  const supplement = 180.00 // Average Plan F/G
  
  // Medicare Advantage alternative
  const advantage = 25.00 // Average MA premium
  
  return {
    partB,
    partD,
    supplement,
    advantage,
    total: partB + partD + supplement,
    yearsToEligibility: yearsToMedicare
  }
}

// Main healthcare calculator function
export function calculateHealthcareCosts(
  currentAge: number,
  yearsOfService: number,
  currentSalary: number,
  retirementAge: number = 65,
  coverageType: 'individual' | 'family' = 'individual',
  selectedPlan: string = 'hmo-premium'
): HealthcareCosts {
  const plan = MA_HEALTH_PLANS.find(p => p.id === selectedPlan) || MA_HEALTH_PLANS[1]
  const stateContributionPercent = calculateStateContribution(yearsOfService)
  const yearsToMedicare = Math.max(0, 65 - retirementAge)
  
  // Pre-Medicare costs (active employee or early retiree)
  const monthlyPremium = plan.monthlyPremium[coverageType]
  const stateContribution = monthlyPremium * (stateContributionPercent / 100)
  const employeeContribution = monthlyPremium - stateContribution
  
  // Medicare costs
  const medicareCosts = calculateMedicareCosts(retirementAge, currentSalary)
  
  // Retiree insurance eligibility
  const retireeEligible = yearsOfService >= 10
  const retireeMonthlyPremium = retireeEligible ? employeeContribution : monthlyPremium
  
  // Calculate lifetime costs (simplified projection)
  const yearsInRetirement = 85 - retirementAge // Assume life expectancy of 85
  const preMedicareCosts = yearsToMedicare * 12 * retireeMonthlyPremium
  const medicareCostsTotal = Math.max(0, yearsInRetirement - yearsToMedicare) * 12 * medicareCosts.total
  const totalLifetimeCosts = preMedicareCosts + medicareCostsTotal
  
  return {
    preMedicare: {
      monthlyPremium,
      annualPremium: monthlyPremium * 12,
      stateContribution,
      employeeContribution,
      planType: plan.name,
      coverageType
    },
    medicare: medicareCosts,
    retireeInsurance: {
      eligible: retireeEligible,
      stateContributionPercent,
      monthlyPremium: retireeMonthlyPremium,
      annualPremium: retireeMonthlyPremium * 12
    },
    yearsToMedicare,
    totalLifetimeCosts
  }
}

// Calculate HSA contribution limits and tax savings
export function calculateHSABenefits(
  currentAge: number,
  currentSalary: number,
  coverageType: 'individual' | 'family' = 'individual'
): {
  contributionLimit: number
  catchUpContribution: number
  totalContribution: number
  taxSavings: number
  projectedBalance: number
} {
  const baseLimit = coverageType === 'individual' ? 4150 : 8300 // 2024 limits
  const catchUpContribution = currentAge >= 55 ? 1000 : 0
  const totalContribution = baseLimit + catchUpContribution
  
  // Estimate tax bracket (simplified)
  const taxRate = currentSalary > 100000 ? 0.32 : currentSalary > 50000 ? 0.22 : 0.12
  const taxSavings = totalContribution * taxRate
  
  // Project balance growth (assuming 6% annual return)
  const yearsToRetirement = Math.max(0, 65 - currentAge)
  const projectedBalance = totalContribution * ((Math.pow(1.06, yearsToRetirement) - 1) / 0.06)
  
  return {
    contributionLimit: baseLimit,
    catchUpContribution,
    totalContribution,
    taxSavings,
    projectedBalance
  }
}

// Format currency for display
export function formatHealthcareCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}
