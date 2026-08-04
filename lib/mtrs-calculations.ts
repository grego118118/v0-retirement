/**
 * MTRS (Massachusetts Teachers' Retirement System) calculations.
 *
 * Teachers are Group 1 members under M.G.L. c. 32, so the base benefit reuses
 * the MSRB-validated Group 1 age factors and option math from
 * lib/pension-calculations.ts. The MTRS-specific piece is RetirementPlus (R+):
 * members who participate (mandatory for anyone who joined on/after July 1,
 * 2001; older members had a one-time election) and retire with 30 or more
 * years of creditable service receive an additional 2% of average salary for
 * each full year of service beyond 24. The combined benefit remains capped at
 * 80% of average salary.
 *
 * Source: MTRS, "RetirementPlus" and retirement benefit estimation guidance
 * (mtrs.state.ma.us).
 */

import {
  getBenefitFactor,
  calculatePensionWithOption,
  checkEligibility,
  MAX_PENSION_PERCENTAGE_OF_SALARY,
} from "@/lib/pension-calculations"

export const RETIREMENT_PLUS_MIN_YOS = 30
export const RETIREMENT_PLUS_BONUS_PER_YEAR = 0.02
export const RETIREMENT_PLUS_BONUS_THRESHOLD_YEARS = 24

export interface MTRSInput {
  age: number
  yearsOfService: number
  averageSalary: number
  /** "before_2012" | "after_2012" (hired before/on-or-after April 2, 2012) */
  serviceEntry: string
  /** RetirementPlus participant (default true — mandatory since July 1, 2001) */
  retirementPlus: boolean
  /** "A" | "B" | "C" */
  option: string
  /** Beneficiary age, only relevant for Option C */
  beneficiaryAge?: string
}

export interface MTRSResult {
  eligible: boolean
  eligibilityMessage: string
  baseFactor: number
  basePercentage: number
  retirementPlusPercentage: number
  totalPercentage: number
  cappedAt80: boolean
  baseAnnualPension: number
  annualPension: number
  monthlyPension: number
  survivorAnnualPension: number
  survivorMonthlyPension: number
  optionDescription: string
  optionWarning: string
  retirementPlusApplied: boolean
}

/**
 * The R+ enhancement: 2% per full year of creditable service beyond 24,
 * available only when retiring with 30+ years of creditable service.
 */
export function calculateRetirementPlusBonus(
  retirementPlus: boolean,
  yearsOfService: number
): number {
  if (!retirementPlus || yearsOfService < RETIREMENT_PLUS_MIN_YOS) return 0
  const bonusYears = Math.floor(yearsOfService) - RETIREMENT_PLUS_BONUS_THRESHOLD_YEARS
  return bonusYears > 0 ? bonusYears * RETIREMENT_PLUS_BONUS_PER_YEAR : 0
}

export function calculateMTRSPension(input: MTRSInput): MTRSResult {
  const { age, yearsOfService, averageSalary, serviceEntry, retirementPlus, option } = input

  const eligibility = checkEligibility(age, yearsOfService, "GROUP_1", serviceEntry)

  const baseFactor = getBenefitFactor(age, "GROUP_1", serviceEntry, yearsOfService)
  const basePercentage = baseFactor * yearsOfService
  const retirementPlusPercentage = calculateRetirementPlusBonus(retirementPlus, yearsOfService)

  const uncappedPercentage = basePercentage + retirementPlusPercentage
  const cappedAt80 = uncappedPercentage > MAX_PENSION_PERCENTAGE_OF_SALARY
  const totalPercentage = Math.min(uncappedPercentage, MAX_PENSION_PERCENTAGE_OF_SALARY)

  const baseAnnualPension = averageSalary * totalPercentage

  const optionResult = calculatePensionWithOption(
    baseAnnualPension,
    option,
    age,
    input.beneficiaryAge || "",
    "GROUP_1"
  )

  return {
    eligible: eligibility.eligible,
    eligibilityMessage: eligibility.message,
    baseFactor,
    basePercentage,
    retirementPlusPercentage,
    totalPercentage,
    cappedAt80,
    baseAnnualPension,
    annualPension: optionResult.pension,
    monthlyPension: optionResult.pension / 12,
    survivorAnnualPension: optionResult.survivorPension,
    survivorMonthlyPension: optionResult.survivorPension / 12,
    optionDescription: optionResult.description,
    optionWarning: optionResult.warning,
    retirementPlusApplied: retirementPlusPercentage > 0,
  }
}
