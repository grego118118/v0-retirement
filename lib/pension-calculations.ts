// Default factors (for members hired BEFORE April 2, 2012, OR those hired ON/AFTER April 2, 2012 with 30+ YOS)
const PENSION_FACTORS_DEFAULT = {
  GROUP_1: {
    55: 0.015,
    56: 0.016,
    57: 0.017,
    58: 0.018,
    59: 0.019,
    60: 0.02,
    61: 0.021,
    62: 0.022,
    63: 0.023,
    64: 0.024,
    65: 0.025,
  },
  GROUP_2: { 55: 0.02, 56: 0.021, 57: 0.022, 58: 0.023, 59: 0.024, 60: 0.025 },
  GROUP_3: { 55: 0.025, 56: 0.025, 57: 0.025, 58: 0.025, 59: 0.025, 60: 0.025 },
  GROUP_4: { 50: 0.02, 51: 0.021, 52: 0.022, 53: 0.023, 54: 0.024, 55: 0.025 },
}

// Factors for members hired ON OR AFTER April 2, 2012 AND with LESS THAN 30 years of service
const PENSION_FACTORS_POST_2012_LT_30YOS = {
  GROUP_1: {
    67: 0.025,
    66: 0.0235,
    65: 0.022,
    64: 0.0205,
    63: 0.019,
    62: 0.0175,
    61: 0.016,
    60: 0.0145,
    // Ages below 60 are N/A (will result in factor 0)
  },
  GROUP_2: {
    67: 0.025,
    66: 0.025,
    65: 0.025,
    64: 0.025,
    63: 0.025,
    62: 0.025,
    61: 0.0235,
    60: 0.022,
    59: 0.0205,
    58: 0.019,
    57: 0.0175,
    56: 0.016,
    55: 0.0145,
    // Ages below 55 are N/A
  },
  GROUP_3: {
    67: 0.025,
    66: 0.025,
    65: 0.025,
    64: 0.025,
    63: 0.025,
    62: 0.025,
    61: 0.025,
    60: 0.025,
    59: 0.025,
    58: 0.025,
    57: 0.025,
    56: 0.025,
    55: 0.025,
    // Ages below 55 are N/A
  },
  GROUP_4: {
    67: 0.025,
    66: 0.025,
    65: 0.025,
    64: 0.025,
    63: 0.025,
    62: 0.025,
    61: 0.025,
    60: 0.025,
    59: 0.025,
    58: 0.025,
    57: 0.025,
    56: 0.0235,
    55: 0.022,
    54: 0.0205,
    53: 0.019,
    52: 0.0175,
    51: 0.016,
    50: 0.0145,
    // Ages below 50 are N/A
  },
}

const MAX_PENSION_PERCENTAGE_OF_SALARY = 0.8

// Option B: Annuity Protection - Age-based reduction factors
const OPTION_B_REDUCTIONS = { 50: 0.01, 60: 0.03, 70: 0.05 }

// Option C: Joint Survivor - Official Massachusetts State Retirement Board reduction factors
// Member Age / Beneficiary Age: Percentage of Option A benefit (exact MSRB values)
const OPTION_C_PERCENTAGES_OF_A = {
  "55-55": 0.9295,  // 7.05% reduction (exact MSRB: $54,747.55 / $58,900 = 0.9295)
  "65-55": 0.84,    // 16% reduction
  "65-65": 0.89,    // 11% reduction
  "70-65": 0.83,    // 17% reduction
  "70-70": 0.86     // 14% reduction
}

// General approximation for Option C when specific age combination not in table
const OPTION_C_GENERAL_REDUCTION_APPROX = 0.88  // 12% reduction

// Option C: Survivor receives exactly 66.67% (two-thirds) of retiree's monthly benefit
const OPTION_C_SURVIVOR_PERCENTAGE = 2 / 3  // 66.67%

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
  let optionDescription = "Option A: Full Allowance (100%)"
  let warningMessage = ""
  let survivorPension = 0

  if (option === "B") {
    // Option B: Annuity Protection - Age-based reduction with interpolation
    // Based on MSRB official results: Age 55 uses 1% reduction (same as age 50)
    let reductionPercent: number

    if (memberAge <= 55) {
      // Ages 50-55: Use 1% reduction (MSRB official)
      reductionPercent = OPTION_B_REDUCTIONS[50]  // 1%
    } else if (memberAge <= 60) {
      // Interpolate between age 55 (1%) and age 60 (3%)
      const ageRange = 60 - 55
      const agePosition = memberAge - 55
      const reductionRange = OPTION_B_REDUCTIONS[60] - OPTION_B_REDUCTIONS[50]
      reductionPercent = OPTION_B_REDUCTIONS[50] + (agePosition / ageRange) * reductionRange
    } else if (memberAge <= 70) {
      // Interpolate between age 60 (3%) and age 70 (5%)
      const ageRange = 70 - 60
      const agePosition = memberAge - 60
      const reductionRange = OPTION_B_REDUCTIONS[70] - OPTION_B_REDUCTIONS[60]
      reductionPercent = OPTION_B_REDUCTIONS[60] + (agePosition / ageRange) * reductionRange
    } else {
      reductionPercent = OPTION_B_REDUCTIONS[70]  // 5%
    }

    finalPension = basePension * (1 - reductionPercent)
    optionDescription = `Option B: Annuity Protection (${(reductionPercent * 100).toFixed(1)}% reduction)`
  } else if (option === "C") {
    const beneficiaryAge = Number.parseInt(beneficiaryAgeStr)
    if (isNaN(beneficiaryAge) || beneficiaryAge <= 0) {
      warningMessage = "Valid Beneficiary Age needed for Option C. Using general approximation."
      finalPension = basePension * OPTION_C_GENERAL_REDUCTION_APPROX
      optionDescription = `Option C: Joint & Survivor (66.67%) - ${((1 - OPTION_C_GENERAL_REDUCTION_APPROX) * 100).toFixed(0)}% reduction (general approx.)`
    } else {
      const roundedMemberAge = Math.round(memberAge)
      const roundedBeneficiaryAge = Math.round(beneficiaryAge)
      const key = `${roundedMemberAge}-${roundedBeneficiaryAge}`
      const specificPercentage = OPTION_C_PERCENTAGES_OF_A[key as keyof typeof OPTION_C_PERCENTAGES_OF_A]

      if (specificPercentage) {
        finalPension = basePension * specificPercentage
        optionDescription = `Option C: Joint & Survivor (66.67%) - ${((1 - specificPercentage) * 100).toFixed(0)}% reduction (ages ${roundedMemberAge}/${roundedBeneficiaryAge})`
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
          const approximatePercentage = OPTION_C_PERCENTAGES_OF_A[foundKey as keyof typeof OPTION_C_PERCENTAGES_OF_A]
          finalPension = basePension * approximatePercentage
          optionDescription = `Option C: Joint & Survivor (66.67%) - ${((1 - approximatePercentage) * 100).toFixed(0)}% reduction (approx. for ages ${roundedMemberAge}/${roundedBeneficiaryAge})`
          warningMessage = `Exact factor for ages ${roundedMemberAge}/${roundedBeneficiaryAge} not available. Using approximation based on member age ${closestMemberAge}. Contact MSRB for official calculation.`
        } else {
          finalPension = basePension * OPTION_C_GENERAL_REDUCTION_APPROX
          optionDescription = `Option C: Joint & Survivor (66.67%) - ${((1 - OPTION_C_GENERAL_REDUCTION_APPROX) * 100).toFixed(0)}% reduction (general approx.)`
          warningMessage = `Exact factor for ages ${roundedMemberAge}/${roundedBeneficiaryAge} not available. Using general approximation. Contact MSRB for official calculation.`
        }
      }
    }

    // Ensure Option C description is properly formatted if not already set
    if (!optionDescription.startsWith("Option C:")) {
      optionDescription = "Option C: Joint & Survivor (66.67%)"
    }

    // Calculate survivor pension: exactly 66.67% (two-thirds) of retiree's monthly benefit
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
 * Calculates the pension percentage using official MSRB benefit factors
 * This uses the proper Massachusetts State Retirement Board methodology
 */
export function calculatePensionPercentage(
  age: number,
  yearsOfService: number,
  group: string = "GROUP_2",
  serviceEntry: string = "before_2012"
): number {
  // Use official MSRB benefit factor methodology
  const benefitFactor = getBenefitFactor(age, group, serviceEntry, yearsOfService)

  if (benefitFactor === 0) {
    return 0 // Not eligible or no factor available
  }

  // Calculate total benefit percentage: Years of Service × Benefit Factor
  let totalPercentage = yearsOfService * benefitFactor * 100 // Convert to percentage

  // Apply 80% maximum cap
  return Math.min(totalPercentage, 80)
}

/**
 * Calculates the estimated annual pension amount using official MSRB methodology
 */
export function calculateAnnualPension(
  averageSalary: number,
  age: number,
  yearsOfService: number,
  option: "A" | "B" | "C" = "A",
  group: string = "GROUP_2",
  serviceEntry: string = "before_2012",
  beneficiaryAge?: string
): number {
  // Step 1: Calculate base pension using official MSRB benefit factors
  const benefitFactor = getBenefitFactor(age, group, serviceEntry, yearsOfService)

  if (benefitFactor === 0) {
    return 0 // Not eligible or no factor available
  }

  // Step 2: Calculate base annual pension: Average Salary × Years of Service × Benefit Factor
  let basePension = averageSalary * yearsOfService * benefitFactor

  // Step 3: Apply 80% maximum cap
  const maxPension = averageSalary * MAX_PENSION_PERCENTAGE_OF_SALARY
  if (basePension > maxPension) {
    basePension = maxPension
  }

  // Step 4: Apply retirement option adjustments using the proper calculatePensionWithOption function
  const optionResult = calculatePensionWithOption(basePension, option, age, beneficiaryAge || "")

  return optionResult.pension
}
