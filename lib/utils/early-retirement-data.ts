/**
 * Early retirement data and scenarios for each Massachusetts retirement group
 * Used to highlight early retirement advantages on landing pages and calculator results
 */

export type RetirementGroup = 'GROUP_1' | 'GROUP_2' | 'GROUP_3' | 'GROUP_4'

export interface EarlyRetirementScenario {
  age: number
  multiplier: number
  label: string
}

export interface EarlyRetirementData {
  group: RetirementGroup
  groupNumber: '1' | '2' | '3' | '4'
  
  // Age requirements
  minimumAge: number | null // null for Group 3 (any age)
  minimumService: number
  ageForMaxMultiplier: number
  
  // Multipliers
  multiplierAtMin: number
  multiplierAtMax: number
  
  // Content
  headline: string
  subheadline: string
  advantage: string
  tradeoff: string | null // null for Group 3 (no tradeoff)
  
  // Key stats for display
  freedomYearsVs65: number | null // null for Group 3 (varies)
  
  // Comparison scenarios
  scenarios: EarlyRetirementScenario[]
  
  // Styling
  accentColor: string
  iconEmoji: string
}

/**
 * Early retirement data for all groups
 */
export const EARLY_RETIREMENT_DATA: Record<RetirementGroup, EarlyRetirementData> = {
  GROUP_1: {
    group: 'GROUP_1',
    groupNumber: '1',
    minimumAge: 60,
    minimumService: 10,
    ageForMaxMultiplier: 65,
    multiplierAtMin: 2.0,
    multiplierAtMax: 2.5,
    headline: "Start Your Next Chapter at 60",
    subheadline: "5 years before traditional retirement",
    advantage: "Retire at 60 with just 10 years of service—gaining 5 years of freedom before traditional retirement age. Use this time for travel, family, or a passion project.",
    tradeoff: "Your multiplier is 2.0% at 60 vs. 2.5% at 65. Each year you wait adds 0.1% to your multiplier.",
    freedomYearsVs65: 5,
    scenarios: [
      { age: 60, multiplier: 2.0, label: 'Earliest' },
      { age: 62, multiplier: 2.2, label: 'Mid-point' },
      { age: 65, multiplier: 2.5, label: 'Maximum' },
    ],
    accentColor: 'blue',
    iconEmoji: '🎯',
  },
  
  GROUP_2: {
    group: 'GROUP_2',
    groupNumber: '2',
    minimumAge: 55,
    minimumService: 10,
    ageForMaxMultiplier: 60,
    multiplierAtMin: 2.0,
    multiplierAtMax: 2.5,
    headline: "A Decade of Freedom",
    subheadline: "Retire 10 years before most Americans",
    advantage: "Probation and court officers can retire at 55—a full decade before traditional retirement. That's 10 years to travel, spend with family, or pursue new opportunities.",
    tradeoff: "Your multiplier is 2.0% at 55 vs. 2.5% at 60. The 5-year wait increases your multiplier by 0.5%.",
    freedomYearsVs65: 10,
    scenarios: [
      { age: 55, multiplier: 2.0, label: 'Earliest' },
      { age: 57, multiplier: 2.2, label: 'Mid-point' },
      { age: 60, multiplier: 2.5, label: 'Maximum' },
    ],
    accentColor: 'emerald',
    iconEmoji: '⏰',
  },
  
  GROUP_3: {
    group: 'GROUP_3',
    groupNumber: '3',
    minimumAge: null, // Any age!
    minimumService: 20,
    ageForMaxMultiplier: 0, // Always max
    multiplierAtMin: 2.5,
    multiplierAtMax: 2.5,
    headline: "Retire at ANY Age",
    subheadline: "The ultimate early retirement benefit",
    advantage: "Massachusetts State Police have a benefit no other group has: retire at ANY age with 20 years of service, with the maximum 2.5% multiplier. A trooper who starts at 22 can retire at 42 with full benefits—decades before anyone else.",
    tradeoff: null, // No tradeoff!
    freedomYearsVs65: null, // Varies based on start age
    scenarios: [
      { age: 42, multiplier: 2.5, label: 'Start at 22' },
      { age: 45, multiplier: 2.5, label: 'Start at 25' },
      { age: 50, multiplier: 2.5, label: 'Start at 30' },
    ],
    accentColor: 'red',
    iconEmoji: '🚀',
  },
  
  GROUP_4: {
    group: 'GROUP_4',
    groupNumber: '4',
    minimumAge: 50,
    minimumService: 10,
    ageForMaxMultiplier: 55,
    multiplierAtMin: 2.0,
    multiplierAtMax: 2.5,
    headline: "Retire Earlier Than Anyone",
    subheadline: "The earliest minimum age in the MA system",
    advantage: "Public safety and corrections officers can retire at 50—the earliest minimum age in the Massachusetts system. That's 15 years before traditional retirement, giving you time for a second career or early freedom.",
    tradeoff: "Your multiplier is 2.0% at 50 vs. 2.5% at 55. Waiting 5 years increases your multiplier by 0.5%.",
    freedomYearsVs65: 15,
    scenarios: [
      { age: 50, multiplier: 2.0, label: 'Earliest' },
      { age: 52, multiplier: 2.2, label: 'Mid-point' },
      { age: 55, multiplier: 2.5, label: 'Maximum' },
    ],
    accentColor: 'amber',
    iconEmoji: '🔥',
  },
}

/**
 * Calculate lifetime pension value for comparison
 * @param monthlyPension Monthly pension amount
 * @param retirementAge Age at retirement
 * @param lifeExpectancy Expected lifespan (default 82)
 */
export function calculateLifetimeValue(
  monthlyPension: number,
  retirementAge: number,
  lifeExpectancy: number = 82
): number {
  const yearsReceiving = Math.max(0, lifeExpectancy - retirementAge)
  return monthlyPension * 12 * yearsReceiving
}

/**
 * Calculate the crossover age where waiting becomes beneficial
 */
export function calculateCrossoverAge(
  earlyMonthly: number,
  earlyAge: number,
  laterMonthly: number,
  laterAge: number,
  lifeExpectancy: number = 82
): number | null {
  // If early monthly is higher or equal, there's no crossover
  if (earlyMonthly >= laterMonthly) return null
  
  const monthlyDifference = laterMonthly - earlyMonthly
  const yearsWaited = laterAge - earlyAge
  const earlyTotalDuringWait = earlyMonthly * 12 * yearsWaited
  
  // Months needed to recoup
  const monthsToRecoup = earlyTotalDuringWait / monthlyDifference
  const yearsToRecoup = monthsToRecoup / 12
  
  const crossoverAge = laterAge + yearsToRecoup
  
  // If crossover is beyond life expectancy, return null
  if (crossoverAge > lifeExpectancy) return null
  
  return Math.round(crossoverAge * 10) / 10
}

/**
 * Get early retirement data for a group
 */
export function getEarlyRetirementData(group: RetirementGroup): EarlyRetirementData {
  return EARLY_RETIREMENT_DATA[group]
}

