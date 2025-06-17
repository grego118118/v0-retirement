/**
 * Massachusetts COLA Calculator
 * Handles Cost of Living Adjustments for MA state employee pensions
 */

export interface COLACalculation {
  year: number
  baseAmount: number
  colaRate: number
  colaAmount: number
  adjustedAmount: number
}

export interface COLAProjectionItem {
  year: number
  startingPension: number
  colaIncrease: number
  endingPension: number
  monthlyPension: number
}

export interface COLAProjection {
  calculations: COLACalculation[]
  totalIncrease: number
  finalAmount: number
}

export interface COLAScenario {
  name: string
  description: string
  basePension: number
  retirementAge: number
  projectionYears: number
  colaRate: number
  projection: COLAProjection
}

export interface COLAComparison {
  scenarios: COLAScenario[]
  bestScenario: COLAScenario
  differences: {
    totalIncreaseRange: number
    finalAmountRange: number
    averageAnnualDifference: number
  }
  comparison: {
    currentTotal: number
    increasedBaseTotal: number
    increasedRateTotal: number
  }
  summary: string
}

export function calculateEnhancedMAPensionCOLA(
  basePension: number,
  years: number = 20,
  annualCOLARate: number = 0.03
): COLAProjection {
  const calculations: COLACalculation[] = []
  let currentAmount = basePension
  
  for (let year = 1; year <= years; year++) {
    const colaAmount = Math.min(currentAmount * annualCOLARate, 390) // MA COLA cap
    const adjustedAmount = currentAmount + colaAmount
    
    calculations.push({
      year,
      baseAmount: currentAmount,
      colaRate: annualCOLARate,
      colaAmount,
      adjustedAmount
    })
    
    currentAmount = adjustedAmount
  }
  
  return {
    calculations,
    totalIncrease: currentAmount - basePension,
    finalAmount: currentAmount
  }
}

export function calculateEnhancedMAPensionCOLAProjections(
  basePension: number,
  projectionYears: number = 20
): COLAProjectionItem[] {
  const colaResult = calculateEnhancedMAPensionCOLA(basePension, projectionYears)

  return colaResult.calculations.map(calc => ({
    year: calc.year,
    startingPension: calc.baseAmount,
    colaIncrease: calc.colaAmount,
    endingPension: calc.adjustedAmount,
    monthlyPension: calc.adjustedAmount / 12
  }))
}

export function getCOLADisplayInfo(basePension: number = 0) {
  const currentYear = new Date().getFullYear()
  const colaRate = 0.03 // 3% MA COLA rate
  const maxCOLA = 390 // MA COLA cap
  const baseAmount = 13000 // MA COLA base amount

  const annualCOLA = Math.min(basePension * colaRate, maxCOLA)

  return {
    currentYear,
    currentRate: `${colaRate * 100}%`, // Convert to percentage for display
    colaRate: colaRate * 100, // Convert to percentage
    maxCOLA,
    annualCOLA,
    baseAmount: `$${baseAmount.toLocaleString()}`,
    maxAnnualIncrease: `$${maxCOLA}`,
    maxMonthlyIncrease: `$${Math.round(maxCOLA / 12)}`,
    description: `Massachusetts COLA: 3% annually on first $13,000 of pension (max $390/year)`,
    keyFacts: [
      "COLA applies to first $13,000 of annual pension only",
      "Maximum annual increase is $390 ($32.50/month)",
      "Rate is currently 3% but subject to legislative approval",
      "Effective rate decreases as pension amount increases",
      "COLA is compounded annually on adjusted pension amount"
    ],
    warnings: [
      "COLA rates can change based on state budget conditions",
      "Higher pension amounts receive proportionally lower effective COLA rates",
      "Legislative changes could affect future COLA calculations",
      "Economic conditions may influence annual COLA decisions"
    ],
    legislativeContext: [
      "COLA rates are subject to annual legislative approval and may vary based on state budget conditions",
      "The current 3% rate applies only to the first $13,000 of annual pension benefits",
      "Maximum annual COLA increase is capped at $390 per year ($32.50 per month)",
      "Special COLA Commission reviews potential base amount increases periodically",
      "Legislative changes could affect future COLA calculations and benefit structures",
      "Retirees should monitor annual state budget discussions for potential COLA adjustments"
    ]
  }
}

/**
 * Calculates total COLA increases for a specific scenario over multiple years
 * Properly implements Massachusetts COLA rules with base amount and cap limits
 */
function calculateCOLAScenarioTotal(
  basePension: number,
  years: number,
  colaRate: number,
  baseLimit: number,
  annualCap: number
): number {
  if (!basePension || basePension <= 0 || !years || years <= 0) {
    return 0
  }

  let totalCOLA = 0
  let currentPension = basePension

  for (let year = 1; year <= years; year++) {
    // Apply COLA rate only to the portion up to the base limit
    const eligibleAmount = Math.min(currentPension, baseLimit)
    const colaIncrease = Math.min(eligibleAmount * colaRate, annualCap)

    totalCOLA += colaIncrease
    currentPension += colaIncrease
  }

  return totalCOLA
}

/**
 * Compares different COLA scenarios for Massachusetts state employee pensions
 * Helps users understand how retirement timing affects COLA benefits over time
 */
export function compareCOLAScenarios(
  basePension: number | number[],
  projectionYears: number = 20,
  retirementAges: number[] = [60, 62, 65, 67],
  currentAge: number = 45
): COLAComparison {
  const scenarios: COLAScenario[] = []

  // Convert single pension to array for consistent processing
  const pensionAmounts = Array.isArray(basePension) ? basePension : [basePension]

  // Create scenarios for different retirement ages and pension amounts
  pensionAmounts.forEach((pensionAmount, pensionIndex) => {
    retirementAges.forEach((retirementAge, ageIndex) => {
      const yearsToRetirement = Math.max(0, retirementAge - currentAge)
      const actualProjectionYears = Math.max(1, projectionYears - yearsToRetirement)

      const projection = calculateEnhancedMAPensionCOLA(
        pensionAmount,
        actualProjectionYears,
        0.03 // MA COLA rate
      )

      scenarios.push({
        name: `Retire at ${retirementAge}`,
        description: `$${pensionAmount.toLocaleString()} pension, retire at age ${retirementAge}`,
        basePension: pensionAmount,
        retirementAge,
        projectionYears: actualProjectionYears,
        colaRate: 0.03,
        projection
      })
    })
  })

  // Find the best scenario (highest final amount)
  const bestScenario = scenarios.reduce((best, current) =>
    current.projection.finalAmount > best.projection.finalAmount ? current : best
  )

  // Calculate differences between scenarios
  const finalAmounts = scenarios.map(s => s.projection.finalAmount)
  const totalIncreases = scenarios.map(s => s.projection.totalIncrease)

  const finalAmountRange = Math.max(...finalAmounts) - Math.min(...finalAmounts)
  const totalIncreaseRange = Math.max(...totalIncreases) - Math.min(...totalIncreases)
  const averageAnnualDifference = finalAmountRange / projectionYears

  // Calculate comparison scenarios for policy analysis
  const basePensionAmount = pensionAmounts[0] // Use first pension amount for comparison

  // Current COLA structure (3% on first $13,000, max $390/year)
  const currentTotal = calculateCOLAScenarioTotal(basePensionAmount, projectionYears, 0.03, 13000, 390)

  // Increased base scenario (3% on first $20,000, max $600/year)
  const increasedBaseTotal = calculateCOLAScenarioTotal(basePensionAmount, projectionYears, 0.03, 20000, 600)

  // Increased rate scenario (3.5% on first $13,000, max $455/year)
  const increasedRateTotal = calculateCOLAScenarioTotal(basePensionAmount, projectionYears, 0.035, 13000, 455)

  // Generate summary
  const summary = `Retiring later generally provides higher COLA benefits due to larger base pension amounts. ` +
    `The difference between earliest and latest retirement can be $${finalAmountRange.toLocaleString()} ` +
    `over ${projectionYears} years, or about $${Math.round(averageAnnualDifference).toLocaleString()} annually.`

  return {
    scenarios,
    bestScenario,
    differences: {
      totalIncreaseRange,
      finalAmountRange,
      averageAnnualDifference
    },
    comparison: {
      currentTotal,
      increasedBaseTotal,
      increasedRateTotal
    },
    summary
  }
}

/**
 * Analyzes COLA impact across different pension levels
 * Shows how COLA affects various pension amounts
 */
export function analyzeCOLAImpactByPensionLevel() {
  const pensionLevels = [
    { amount: 8000, level: "Low", description: "Entry-level state employee" },
    { amount: 13000, level: "Base", description: "At COLA base limit" },
    { amount: 20000, level: "Medium", description: "Mid-career professional" },
    { amount: 35000, level: "High", description: "Senior administrator" },
    { amount: 50000, level: "Executive", description: "Department head level" }
  ]

  const colaRate = 0.03
  const baseLimit = 13000
  const maxCOLA = 390

  return pensionLevels.map(pension => {
    const eligibleAmount = Math.min(pension.amount, baseLimit)
    const colaIncrease = Math.min(eligibleAmount * colaRate, maxCOLA)
    const effectiveRate = ((colaIncrease / pension.amount) * 100).toFixed(2)
    const isAtMaximum = pension.amount >= baseLimit

    return {
      pensionLevel: pension.level,
      description: pension.description,
      annualPension: pension.amount,
      colaIncrease,
      effectiveRate,
      isAtMaximum
    }
  })
}
