/**
 * Social Security Spousal Benefits Calculator
 * Based on official SSA rules and regulations
 */

export interface SpouseData {
  fullRetirementAge: number
  primaryInsuranceAmount: number // PIA - benefit at full retirement age
  birthYear: number
  claimingAge?: number
}

export interface SpousalBenefitResult {
  spousalBenefit: number
  ownBenefit: number
  totalBenefit: number
  isEligibleForSpousal: boolean
  optimalStrategy: string
  explanation: string
}

export interface SurvivorBenefitResult {
  survivorBenefit: number
  ageEligible: number
  reductionPercentage: number
  explanation: string
}

export interface CoupleOptimizationResult {
  spouse1Strategy: {
    claimingAge: number
    monthlyBenefit: number
    strategy: string
  }
  spouse2Strategy: {
    claimingAge: number
    monthlyBenefit: number
    strategy: string
  }
  totalLifetimeBenefits: number
  recommendedStrategy: string
  explanation: string
}

/**
 * Calculate spousal Social Security benefits
 */
export function calculateSpousalBenefits(
  higherEarner: SpouseData,
  lowerEarner: SpouseData
): SpousalBenefitResult {
  // Spousal benefit is 50% of higher earner's PIA
  const maxSpousalBenefit = higherEarner.primaryInsuranceAmount * 0.5
  
  // Lower earner's own benefit
  const ownBenefit = lowerEarner.primaryInsuranceAmount
  
  // Determine if eligible for spousal benefits
  const isEligibleForSpousal = maxSpousalBenefit > ownBenefit
  
  // Calculate actual spousal benefit (excess over own benefit)
  const spousalBenefit = isEligibleForSpousal ? 
    maxSpousalBenefit - ownBenefit : 0
  
  // Total benefit is higher of own benefit or spousal benefit
  const totalBenefit = Math.max(ownBenefit, maxSpousalBenefit)
  
  // Determine optimal strategy
  let optimalStrategy = ""
  let explanation = ""
  
  if (isEligibleForSpousal) {
    optimalStrategy = "Claim spousal benefits"
    explanation = `The lower earner should claim spousal benefits of $${Math.round(maxSpousalBenefit)} instead of their own benefit of $${Math.round(ownBenefit)}, resulting in an additional $${Math.round(spousalBenefit)} per month.`
  } else {
    optimalStrategy = "Claim own benefits"
    explanation = `The lower earner's own benefit of $${Math.round(ownBenefit)} is higher than the spousal benefit of $${Math.round(maxSpousalBenefit)}, so they should claim their own benefits.`
  }
  
  return {
    spousalBenefit: Math.round(spousalBenefit),
    ownBenefit: Math.round(ownBenefit),
    totalBenefit: Math.round(totalBenefit),
    isEligibleForSpousal,
    optimalStrategy,
    explanation
  }
}

/**
 * Calculate survivor benefits
 */
export function calculateSurvivorBenefits(
  deceasedSpouse: SpouseData,
  survivingSpouseAge: number
): SurvivorBenefitResult {
  // Survivor gets 100% of deceased spouse's benefit
  const fullSurvivorBenefit = deceasedSpouse.primaryInsuranceAmount
  
  // Earliest age to claim survivor benefits is 60 (50 if disabled)
  const earliestAge = 60
  const fullRetirementAge = deceasedSpouse.fullRetirementAge
  
  // Calculate reduction if claiming before full retirement age
  let reductionPercentage = 0
  let survivorBenefit = fullSurvivorBenefit
  
  if (survivingSpouseAge < fullRetirementAge) {
    // Reduction is 28.5% at age 60, decreasing to 0% at full retirement age
    const monthsEarly = (fullRetirementAge - survivingSpouseAge) * 12
    const maxReductionMonths = (fullRetirementAge - 60) * 12
    reductionPercentage = Math.min(28.5, (monthsEarly / maxReductionMonths) * 28.5)
    survivorBenefit = fullSurvivorBenefit * (1 - reductionPercentage / 100)
  }
  
  const explanation = survivingSpouseAge >= fullRetirementAge ?
    `Full survivor benefit of $${Math.round(fullSurvivorBenefit)} available at full retirement age.` :
    `Survivor benefit reduced by ${reductionPercentage.toFixed(1)}% for claiming at age ${survivingSpouseAge}. Full benefit of $${Math.round(fullSurvivorBenefit)} available at age ${fullRetirementAge}.`
  
  return {
    survivorBenefit: Math.round(survivorBenefit),
    ageEligible: earliestAge,
    reductionPercentage: Math.round(reductionPercentage * 10) / 10,
    explanation
  }
}

/**
 * Optimize claiming strategy for married couples
 */
export function optimizeCoupleStrategy(
  spouse1: SpouseData,
  spouse2: SpouseData,
  lifeExpectancy1: number = 85,
  lifeExpectancy2: number = 85
): CoupleOptimizationResult {
  // Determine higher and lower earner
  const higherEarner = spouse1.primaryInsuranceAmount > spouse2.primaryInsuranceAmount ? spouse1 : spouse2
  const lowerEarner = spouse1.primaryInsuranceAmount > spouse2.primaryInsuranceAmount ? spouse2 : spouse1
  
  // Calculate benefits at different claiming ages
  const scenarios = []
  
  // Scenario 1: Both claim at full retirement age
  const scenario1 = {
    spouse1Age: spouse1.fullRetirementAge,
    spouse2Age: spouse2.fullRetirementAge,
    spouse1Benefit: spouse1.primaryInsuranceAmount,
    spouse2Benefit: spouse2.primaryInsuranceAmount
  }
  
  // Scenario 2: Higher earner delays to 70, lower earner claims at FRA
  const delayedBenefit = higherEarner.primaryInsuranceAmount * 1.32 // 32% increase for delaying to 70
  const scenario2 = {
    spouse1Age: higherEarner === spouse1 ? 70 : spouse1.fullRetirementAge,
    spouse2Age: lowerEarner === spouse2 ? spouse2.fullRetirementAge : 70,
    spouse1Benefit: higherEarner === spouse1 ? delayedBenefit : spouse1.primaryInsuranceAmount,
    spouse2Benefit: lowerEarner === spouse2 ? spouse2.primaryInsuranceAmount : delayedBenefit
  }
  
  // Calculate lifetime benefits for each scenario
  const calculateLifetimeBenefits = (scenario: any) => {
    const years1 = lifeExpectancy1 - scenario.spouse1Age
    const years2 = lifeExpectancy2 - scenario.spouse2Age
    return (scenario.spouse1Benefit * years1 * 12) + (scenario.spouse2Benefit * years2 * 12)
  }
  
  const lifetime1 = calculateLifetimeBenefits(scenario1)
  const lifetime2 = calculateLifetimeBenefits(scenario2)
  
  const optimalScenario = lifetime2 > lifetime1 ? scenario2 : scenario1
  const recommendedStrategy = lifetime2 > lifetime1 ? 
    "Higher earner should delay to age 70" : 
    "Both should claim at full retirement age"
  
  return {
    spouse1Strategy: {
      claimingAge: optimalScenario.spouse1Age,
      monthlyBenefit: Math.round(optimalScenario.spouse1Benefit),
      strategy: optimalScenario.spouse1Age > spouse1.fullRetirementAge ? "Delay to maximize benefits" : "Claim at full retirement age"
    },
    spouse2Strategy: {
      claimingAge: optimalScenario.spouse2Age,
      monthlyBenefit: Math.round(optimalScenario.spouse2Benefit),
      strategy: optimalScenario.spouse2Age > spouse2.fullRetirementAge ? "Delay to maximize benefits" : "Claim at full retirement age"
    },
    totalLifetimeBenefits: Math.round(Math.max(lifetime1, lifetime2)),
    recommendedStrategy,
    explanation: `Based on life expectancy of ${lifeExpectancy1} and ${lifeExpectancy2}, this strategy maximizes total lifetime benefits by $${Math.round(Math.abs(lifetime2 - lifetime1)).toLocaleString()}.`
  }
}
