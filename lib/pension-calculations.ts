// Default factors (for members hired BEFORE April 2, 2012, OR those hired ON/AFTER April 2, 2012 with 30+ YOS)
// Based on official Massachusetts Retirement System benefit multiplier chart
const PENSION_FACTORS_DEFAULT = {
  GROUP_1: {
    60: 0.02,   // 2.0% at age 60 (minimum retirement age for Group 1 post-2012)
    61: 0.021,  // 2.1% at age 61
    62: 0.022,  // 2.2% at age 62
    63: 0.023,  // 2.3% at age 63
    64: 0.024,  // 2.4% at age 64
    65: 0.025,  // 2.5% at age 65
    66: 0.025,  // 2.5% at age 66 and older
    67: 0.025,  // 2.5% at age 67 and older (max)
  },
  GROUP_2: {
    55: 0.02,   // 2.0% at age 55 (minimum retirement age for Group 2)
    56: 0.021,  // 2.1% at age 56
    57: 0.022,  // 2.2% at age 57
    58: 0.023,  // 2.3% at age 58
    59: 0.024,  // 2.4% at age 59
    60: 0.025,  // 2.5% at age 60 and older (max)
    61: 0.025,  // 2.5% at age 61 and older
    62: 0.025,  // 2.5% at age 62 and older
    63: 0.025,  // 2.5% at age 63 and older
    64: 0.025,  // 2.5% at age 64 and older
    65: 0.025,  // 2.5% at age 65 and older
    66: 0.025,  // 2.5% at age 66 and older
    67: 0.025,  // 2.5% at age 67 and older
  },
  GROUP_3: {
    // State Police - can retire at any age with 20+ years or age 55 with 20+ years
    // 2.5% per year regardless of age (special provisions for State Police)
    50: 0.025,  // 2.5% at any age with sufficient service
    51: 0.025,  // 2.5% at any age with sufficient service
    52: 0.025,  // 2.5% at any age with sufficient service
    53: 0.025,  // 2.5% at any age with sufficient service
    54: 0.025,  // 2.5% at any age with sufficient service
    55: 0.025,  // 2.5% at age 55 and older
    56: 0.025,  // 2.5% at age 56 and older
    57: 0.025,  // 2.5% at age 57 and older
    58: 0.025,  // 2.5% at age 58 and older
    59: 0.025,  // 2.5% at age 59 and older
    60: 0.025,  // 2.5% at age 60 and older
    61: 0.025,  // 2.5% at age 61 and older
    62: 0.025,  // 2.5% at age 62 and older
    63: 0.025,  // 2.5% at age 63 and older
    64: 0.025,  // 2.5% at age 64 and older
    65: 0.025,  // 2.5% at age 65 and older
    66: 0.025,  // 2.5% at age 66 and older
    67: 0.025,  // 2.5% at age 67 and older
  },
  GROUP_4: {
    50: 0.02,   // 2.0% at age 50 (minimum retirement age for Group 4)
    51: 0.021,  // 2.1% at age 51
    52: 0.022,  // 2.2% at age 52
    53: 0.023,  // 2.3% at age 53
    54: 0.024,  // 2.4% at age 54
    55: 0.025,  // 2.5% at age 55 and older (max)
    56: 0.025,  // 2.5% at age 56 and older
    57: 0.025,  // 2.5% at age 57 and older
    58: 0.025,  // 2.5% at age 58 and older
    59: 0.025,  // 2.5% at age 59 and older
    60: 0.025,  // 2.5% at age 60 and older
    61: 0.025,  // 2.5% at age 61 and older
    62: 0.025,  // 2.5% at age 62 and older
    63: 0.025,  // 2.5% at age 63 and older
    64: 0.025,  // 2.5% at age 64 and older
    65: 0.025,  // 2.5% at age 65 and older
    66: 0.025,  // 2.5% at age 66 and older
    67: 0.025,  // 2.5% at age 67 and older
  },
}

// Factors for members hired ON OR AFTER April 2, 2012 AND with LESS THAN 30 years of service
// Based on official Massachusetts Retirement System chart for post-2012 hires with <30 years
const PENSION_FACTORS_POST_2012_LT_30YOS = {
  GROUP_1: {
    67: 0.025,   // 2.5% at age 67 and older
    66: 0.0235,  // 2.35% at age 66
    65: 0.022,   // 2.20% at age 65
    64: 0.0205,  // 2.05% at age 64
    63: 0.019,   // 1.90% at age 63
    62: 0.0175,  // 1.75% at age 62
    61: 0.016,   // 1.60% at age 61
    60: 0.0145,  // 1.45% at age 60
    // Ages below 60 are N/A for Group 1 post-2012 <30 YOS
  },
  GROUP_2: {
    67: 0.025,   // 2.5% at age 67 and older
    66: 0.025,   // 2.5% at age 66
    65: 0.025,   // 2.5% at age 65
    64: 0.025,   // 2.5% at age 64
    63: 0.025,   // 2.5% at age 63
    62: 0.025,   // 2.5% at age 62
    61: 0.0235,  // 2.35% at age 61
    60: 0.022,   // 2.20% at age 60
    59: 0.0205,  // 2.05% at age 59
    58: 0.019,   // 1.90% at age 58
    57: 0.0175,  // 1.75% at age 57
    56: 0.016,   // 1.60% at age 56
    55: 0.0145,  // 1.45% at age 55
    // Ages below 55 are N/A for Group 2 post-2012 <30 YOS
  },
  GROUP_3: {
    // Group 3 (State Police) maintains 2.5% regardless of hire date or years of service
    67: 0.025,   // 2.5% at age 67 and older
    66: 0.025,   // 2.5% at age 66
    65: 0.025,   // 2.5% at age 65
    64: 0.025,   // 2.5% at age 64
    63: 0.025,   // 2.5% at age 63
    62: 0.025,   // 2.5% at age 62
    61: 0.025,   // 2.5% at age 61
    60: 0.025,   // 2.5% at age 60
    59: 0.025,   // 2.5% at age 59
    58: 0.025,   // 2.5% at age 58
    57: 0.025,   // 2.5% at age 57
    56: 0.025,   // 2.5% at age 56
    55: 0.025,   // 2.5% at age 55
    54: 0.025,   // 2.5% at age 54
    53: 0.025,   // 2.5% at age 53
    52: 0.025,   // 2.5% at age 52
    51: 0.025,   // 2.5% at age 51
    50: 0.025,   // 2.5% at age 50
    // State Police can retire at any age with 20+ years
  },
  GROUP_4: {
    67: 0.025,   // 2.5% at age 67 and older
    66: 0.025,   // 2.5% at age 66
    65: 0.025,   // 2.5% at age 65
    64: 0.025,   // 2.5% at age 64
    63: 0.025,   // 2.5% at age 63
    62: 0.025,   // 2.5% at age 62
    61: 0.025,   // 2.5% at age 61
    60: 0.025,   // 2.5% at age 60
    59: 0.025,   // 2.5% at age 59
    58: 0.025,   // 2.5% at age 58
    57: 0.025,   // 2.5% at age 57
    56: 0.0235,  // 2.35% at age 56
    55: 0.022,   // 2.20% at age 55
    54: 0.0205,  // 2.05% at age 54
    53: 0.019,   // 1.90% at age 53
    52: 0.0175,  // 1.75% at age 52
    51: 0.016,   // 1.60% at age 51
    50: 0.0145,  // 1.45% at age 50
    // Ages below 50 are N/A for Group 4 post-2012 <30 YOS
  },
}

const MAX_PENSION_PERCENTAGE_OF_SALARY = 0.8
const OPTION_B_REDUCTIONS = { 50: 0.01, 60: 0.03, 70: 0.05 }
const OPTION_C_PERCENTAGES_OF_A = { "55-55": 0.94, "65-55": 0.84, "65-65": 0.89, "70-65": 0.83, "70-70": 0.86 }
const OPTION_C_GENERAL_REDUCTION_APPROX = 0.88
const OPTION_C_SURVIVOR_PERCENTAGE = 2 / 3

// Massachusetts Pension COLA Configuration (FY2025)
export const MA_PENSION_COLA_CONFIG = {
  // Current FY2025 COLA structure
  currentRate: 0.03, // 3% COLA rate for FY2025
  baseAmount: 13000, // COLA applied to first $13,000 of annual retirement allowance
  maxAnnualIncrease: 390, // Maximum annual COLA increase ($13,000 × 3%)
  maxMonthlyIncrease: 32.50, // Maximum monthly COLA increase ($390 ÷ 12)

  // Historical context
  baseAmountHistory: [
    { year: 2025, baseAmount: 13000, rate: 0.03 },
    { year: 2024, baseAmount: 13000, rate: 0.03 },
    { year: 2023, baseAmount: 13000, rate: 0.03 },
    // Base amount has been $13,000 for many years
  ],

  // Policy information
  isGuaranteed: false, // COLA is not guaranteed/automatic
  requiresLegislativeApproval: true, // Subject to annual legislative approval
  specialCommissionReviewing: true, // Special COLA Commission reviewing potential base increases

  // Application rules
  appliesTo: 'first_portion_only', // Only applies to first $13,000 of benefit
  effectiveDate: 'july_1', // Typically effective July 1st each fiscal year
}

export function getBenefitFactor(age: number, group: string, serviceEntry: string, yearsOfService: number): number {
  let factorsToUse

  // Determine which factor table to use
  if (serviceEntry === "after_2012" && yearsOfService < 30) {
    factorsToUse = PENSION_FACTORS_POST_2012_LT_30YOS
  } else {
    factorsToUse = PENSION_FACTORS_DEFAULT
  }

  const groupFactors = factorsToUse[group as keyof typeof factorsToUse]
  if (!groupFactors) return 0 // No factors defined for this group in the selected table

  let determinedFactor = 0
  // Get sorted list of ages for which factors are defined in the chosen table
  const availableAges = Object.keys(groupFactors)
    .map(Number)
    .sort((a, b) => a - b)

  if (availableAges.length === 0) return 0 // No ages defined for this group

  // Check for exact match
  if (groupFactors[age as keyof typeof groupFactors] !== undefined) {
    determinedFactor = groupFactors[age as keyof typeof groupFactors]
  }
  // Check if age is below the minimum defined age for this group in this table
  else if (age < availableAges[0]) {
    determinedFactor = 0 // Treat as N/A
  }
  // Check if age is above the maximum defined age for this group in this table
  else if (age > availableAges[availableAges.length - 1]) {
    // Use the factor for the highest defined age (e.g., "67 or older")
    determinedFactor = groupFactors[availableAges[availableAges.length - 1] as keyof typeof groupFactors]
  }
  // Handle cases where age is between defined points but not an exact match
  else {
    if (factorsToUse === PENSION_FACTORS_POST_2012_LT_30YOS) {
      // For the post-2012 <30 YOS chart, if not an exact match and not above max, it's N/A
      determinedFactor = 0
    } else {
      // For the default chart, find the highest defined age <= the input age
      let applicableAge = null
      for (let i = availableAges.length - 1; i >= 0; i--) {
        if (age >= availableAges[i]) {
          applicableAge = availableAges[i]
          break
        }
      }
      determinedFactor = applicableAge !== null ? groupFactors[applicableAge as keyof typeof groupFactors] : 0
    }
  }

  return determinedFactor
}

export function calculatePensionWithOption(
  basePension: number,
  option: string,
  memberAge: number,
  beneficiaryAgeStr: string,
) {
  let finalPension = basePension
  let optionDescription = "Option A: Full Allowance"
  let warningMessage = ""
  let survivorPension = 0

  if (option === "B") {
    let reductionPercent = OPTION_B_REDUCTIONS[70]
    if (memberAge <= 50) reductionPercent = OPTION_B_REDUCTIONS[50]
    else if (memberAge <= 60) reductionPercent = OPTION_B_REDUCTIONS[60]
    finalPension = basePension * (1 - reductionPercent)
    optionDescription = `Option B: Annuity Protection (approx. ${(reductionPercent * 100).toFixed(0)}% less)`
  } else if (option === "C") {
    const beneficiaryAge = Number.parseInt(beneficiaryAgeStr)
    if (isNaN(beneficiaryAge) || beneficiaryAge <= 0) {
      warningMessage = "Valid Beneficiary Age needed for Option C. Using general approximation."
      finalPension = basePension * OPTION_C_GENERAL_REDUCTION_APPROX
    } else {
      const roundedMemberAge = Math.round(memberAge)
      const roundedBeneficiaryAge = Math.round(beneficiaryAge)
      const key = `${roundedMemberAge}-${roundedBeneficiaryAge}`
      const specificPercentage = OPTION_C_PERCENTAGES_OF_A[key as keyof typeof OPTION_C_PERCENTAGES_OF_A]

      if (specificPercentage) {
        finalPension = basePension * specificPercentage
        optionDescription = `Option C: Joint Survivor (approx. ${((1 - specificPercentage) * 100).toFixed(0)}% less for ages ${roundedMemberAge}/${roundedBeneficiaryAge})`
      } else {
        let closestMemberAge: number | null = null
        let minDiff = Number.POSITIVE_INFINITY

        Object.keys(OPTION_C_PERCENTAGES_OF_A).forEach((k) => {
          const mAge = Number.parseInt(k.split("-")[0])
          if (Math.abs(mAge - roundedMemberAge) < minDiff) {
            minDiff = Math.abs(mAge - roundedMemberAge)
            closestMemberAge = mAge
          }
        })

        const foundKey = Object.keys(OPTION_C_PERCENTAGES_OF_A).find((k) => k.startsWith(closestMemberAge + "-"))

        if (foundKey) {
          finalPension = basePension * OPTION_C_PERCENTAGES_OF_A[foundKey as keyof typeof OPTION_C_PERCENTAGES_OF_A]
          warningMessage = `Factor for Member Age ${roundedMemberAge}/${roundedBeneficiaryAge} not in table. Approx. based on Member Age ${closestMemberAge} (${((1 - OPTION_C_PERCENTAGES_OF_A[foundKey as keyof typeof OPTION_C_PERCENTAGES_OF_A]) * 100).toFixed(0)}% less). Official calculation needed.`
        } else {
          finalPension = basePension * OPTION_C_GENERAL_REDUCTION_APPROX
          warningMessage = `Factor for Member Age ${roundedMemberAge}/${roundedBeneficiaryAge} not in table. General approx. (${((1 - OPTION_C_GENERAL_REDUCTION_APPROX) * 100).toFixed(0)}% less). Official calculation needed.`
        }
      }
    }

    if (!optionDescription.startsWith("Option C:")) {
      optionDescription = "Option C: Joint Survivor"
    }

    survivorPension = finalPension * OPTION_C_SURVIVOR_PERCENTAGE
  }

  return {
    pension: finalPension,
    description: optionDescription,
    warning: warningMessage,
    survivorPension: survivorPension,
  }
}

export function checkEligibility(age: number, yos: number, group: string, serviceEntry: string) {
  if (serviceEntry === "before_2012") {
    if (yos >= 20) return { eligible: true, message: "" }
    if (age >= 55 && yos >= 10) return { eligible: true, message: "" }
    return {
      eligible: false,
      message: "Not eligible: For service before 04/02/2012, requires 20+ YOS or Age 55+ with 10+ YOS.",
    }
  } else if (serviceEntry === "after_2012") {
    if (yos < 10) {
      return {
        eligible: false,
        message: "Not eligible: Requires min 10 YOS for service on/after 04/02/2012.",
      }
    }
    if (group === "GROUP_1" && age < 60) {
      return {
        eligible: false,
        message: "Not eligible: Group 1 requires min age 60 for service on/after 04/02/2012.",
      }
    }
    if (group === "GROUP_2" && age < 55) {
      return {
        eligible: false,
        message: "Not eligible: Group 2 requires min age 55 for service on/after 04/02/2012.",
      }
    }
    if (group === "GROUP_3" && age < 55) {
      return {
        eligible: false,
        message: "Not eligible: Group 3 requires min age 55 for service on/after 04/02/2012.",
      }
    }
    if (group === "GROUP_4" && age < 50) {
      return {
        eligible: false,
        message: "Not eligible: Group 4 requires min age 50 for service on/after 04/02/2012.",
      }
    }
    return { eligible: true, message: "" }
  }

  return { eligible: false, message: "Service entry period not selected." }
}

export function generateProjectionTable(
  groupToProject: string,
  projectionStartAgeForm: number,
  baseEnteredYOSForm: number,
  averageSalary: number,
  selectedOption: string,
  beneficiaryAgeStr: string,
  serviceEntry: string,
) {
  const rows = []
  const groupMaxAgeLimits: Record<string, number> = {
    GROUP_1: 70,
    GROUP_2: 68,
    GROUP_3: 68,
    GROUP_4: 65,
  }
  const maxIterations = 30

  for (let yearOffset = 0; yearOffset < maxIterations; yearOffset++) {
    const currentProjAgeFloat = projectionStartAgeForm + yearOffset
    const currentProjAgeInt = Math.floor(currentProjAgeFloat)
    const currentProjectedYOS = baseEnteredYOSForm + yearOffset

    if (currentProjectedYOS < 0) continue
    if (currentProjAgeInt > groupMaxAgeLimits[groupToProject]) break

    const projEligibility = checkEligibility(currentProjAgeInt, currentProjectedYOS, groupToProject, serviceEntry)

    if (!projEligibility.eligible) continue

    const benefitFactorProjBase = getBenefitFactor(currentProjAgeInt, groupToProject, serviceEntry, currentProjectedYOS)

    if (benefitFactorProjBase === 0) continue

    let totalBenefitPercentageProjBase = benefitFactorProjBase * currentProjectedYOS
    let baseAnnualPensionProj = averageSalary * totalBenefitPercentageProjBase
    const maxPensionAllowedProj = averageSalary * MAX_PENSION_PERCENTAGE_OF_SALARY

    if (baseAnnualPensionProj > maxPensionAllowedProj) {
      baseAnnualPensionProj = maxPensionAllowedProj
      totalBenefitPercentageProjBase = MAX_PENSION_PERCENTAGE_OF_SALARY
    }

    if (baseAnnualPensionProj < 0) baseAnnualPensionProj = 0

    const projOptionResult = calculatePensionWithOption(
      baseAnnualPensionProj,
      selectedOption,
      currentProjAgeFloat,
      beneficiaryAgeStr,
    )

    const finalProjectedAnnualPension = projOptionResult.pension
    const finalProjectedMonthlyPension = finalProjectedAnnualPension / 12

    const survivorAnnual = selectedOption === "C" ? projOptionResult.survivorPension : "N/A"
    const survivorMonthly = selectedOption === "C" ? projOptionResult.survivorPension / 12 : "N/A"

    rows.push({
      age: currentProjAgeFloat,
      yearsOfService: currentProjectedYOS,
      factor: benefitFactorProjBase,
      totalBenefitPercentage: totalBenefitPercentageProjBase,
      annualPension: finalProjectedAnnualPension,
      monthlyPension: finalProjectedMonthlyPension,
      survivorAnnual,
      survivorMonthly,
    })

    if (totalBenefitPercentageProjBase >= MAX_PENSION_PERCENTAGE_OF_SALARY) break
  }

  return {
    rows,
    title: `${groupToProject.replace("_", " ")} Pension Projection (From Age ${projectionStartAgeForm} up to 80% Max)`,
  }
}

/**
 * Calculates the pension percentage based on age and years of service
 * This is a simplified version - you'll want to replace this with the actual MA state pension formula
 */
export function calculatePensionPercentage(age: number, yearsOfService: number): number {
  // Base percentage calculation
  let percentage = yearsOfService * 2.5 // 2.5% per year of service

  // Age factor adjustment
  if (age < 60) {
    // Reduce percentage for early retirement
    percentage *= (1 - (60 - age) * 0.01)
  } else if (age > 65) {
    // Increase percentage for delayed retirement
    percentage *= (1 + (age - 65) * 0.01)
  }

  // Cap at 80%
  return Math.min(percentage, 80)
}

/**
 * Calculates the estimated annual pension amount
 */
export function calculateAnnualPension(
  averageSalary: number,
  age: number,
  yearsOfService: number,
  option: "A" | "B" | "C" = "A"
): number {
  let percentage = calculatePensionPercentage(age, yearsOfService)
  
  // Apply option reduction factors
  switch (option) {
    case "B":
      percentage *= 0.91 // 9% reduction for Option B
      break
    case "C":
      percentage *= 0.86 // 14% reduction for Option C
      break
  }

  return (averageSalary * percentage) / 100
}

/**
 * Calculate Massachusetts Pension COLA adjustment for a given year
 * @param annualPension - The annual pension amount
 * @param colaRate - The COLA rate for the year (defaults to current FY2025 rate)
 * @param baseAmount - The base amount COLA applies to (defaults to current $13,000)
 * @returns Object with COLA calculation details
 */
export function calculateMAPensionCOLA(
  annualPension: number,
  colaRate: number = MA_PENSION_COLA_CONFIG.currentRate,
  baseAmount: number = MA_PENSION_COLA_CONFIG.baseAmount
): {
  originalPension: number
  colaEligibleAmount: number
  colaIncrease: number
  adjustedPension: number
  maxPossibleIncrease: number
  isAtMaximum: boolean
} {
  // Ensure inputs are valid
  if (annualPension < 0) annualPension = 0
  if (colaRate < 0) colaRate = 0
  if (baseAmount < 0) baseAmount = 0

  // Calculate COLA eligible amount (first $13,000 or pension amount, whichever is less)
  const colaEligibleAmount = Math.min(annualPension, baseAmount)

  // Calculate COLA increase
  const colaIncrease = colaEligibleAmount * colaRate

  // Calculate maximum possible increase for this base amount and rate
  const maxPossibleIncrease = baseAmount * colaRate

  // Determine if at maximum
  const isAtMaximum = colaIncrease >= maxPossibleIncrease

  // Calculate adjusted pension
  const adjustedPension = annualPension + colaIncrease

  return {
    originalPension: Math.round(annualPension),
    colaEligibleAmount: Math.round(colaEligibleAmount),
    colaIncrease: Math.round(colaIncrease),
    adjustedPension: Math.round(adjustedPension),
    maxPossibleIncrease: Math.round(maxPossibleIncrease),
    isAtMaximum
  }
}

/**
 * Calculate COLA projections over multiple years for MA pension
 * @param initialPension - Starting annual pension amount
 * @param years - Number of years to project
 * @param assumedColaRate - Assumed annual COLA rate (defaults to current rate)
 * @param baseAmount - COLA base amount (defaults to current $13,000)
 * @returns Array of yearly COLA projections
 */
export function calculateMAPensionCOLAProjections(
  initialPension: number,
  years: number,
  assumedColaRate: number = MA_PENSION_COLA_CONFIG.currentRate,
  baseAmount: number = MA_PENSION_COLA_CONFIG.baseAmount
): Array<{
  year: number
  startingPension: number
  colaIncrease: number
  endingPension: number
  cumulativeIncrease: number
  isAtMaximum: boolean
}> {
  const projections = []
  let currentPension = initialPension
  let cumulativeIncrease = 0

  for (let year = 1; year <= years; year++) {
    const colaResult = calculateMAPensionCOLA(currentPension, assumedColaRate, baseAmount)

    cumulativeIncrease += colaResult.colaIncrease
    currentPension = colaResult.adjustedPension

    projections.push({
      year,
      startingPension: colaResult.originalPension,
      colaIncrease: colaResult.colaIncrease,
      endingPension: colaResult.adjustedPension,
      cumulativeIncrease: Math.round(cumulativeIncrease),
      isAtMaximum: colaResult.isAtMaximum
    })
  }

  return projections
}

/**
 * Get COLA information and warnings for display
 * @returns Object with COLA policy information and user warnings
 */
export function getMAPensionCOLAInfo(): {
  currentRate: string
  baseAmount: string
  maxAnnualIncrease: string
  maxMonthlyIncrease: string
  warnings: string[]
  policyNotes: string[]
} {
  const config = MA_PENSION_COLA_CONFIG

  return {
    currentRate: `${(config.currentRate * 100).toFixed(1)}%`,
    baseAmount: `$${config.baseAmount.toLocaleString()}`,
    maxAnnualIncrease: `$${config.maxAnnualIncrease.toLocaleString()}`,
    maxMonthlyIncrease: `$${config.maxMonthlyIncrease.toFixed(2)}`,
    warnings: [
      'COLA is not guaranteed and is subject to annual legislative approval',
      'COLA only applies to the first $13,000 of your annual retirement allowance',
      'Actual COLA rates may vary from year to year based on economic conditions',
      'These projections are estimates and should not be considered guaranteed benefits'
    ],
    policyNotes: [
      'The COLA base amount of $13,000 has remained unchanged for many years',
      'A Special COLA Commission is currently reviewing potential increases to the base amount',
      'COLA adjustments typically become effective on July 1st of each fiscal year',
      'Massachusetts pension COLA structure differs from Social Security COLA calculations'
    ]
  }
}
