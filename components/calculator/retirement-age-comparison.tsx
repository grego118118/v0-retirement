"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, TrendingUp, Zap, Info } from "lucide-react"
import { motion } from "framer-motion"
import { formatCurrency } from "@/lib/utils"
import {
  EARLY_RETIREMENT_DATA,
  calculateLifetimeValue,
  calculateCrossoverAge,
  type RetirementGroup
} from "@/lib/utils/early-retirement-data"
import { calculatePensionWithOption } from "@/lib/pension-calculations"

interface RetirementAgeComparisonProps {
  currentAge: number
  yearsOfService: number
  averageSalary: number
  group: string
  currentMonthlyPension: number
  serviceEntry?: string
  retirementOption?: string  // 'A', 'B', or 'C'
  beneficiaryAge?: string    // For Option C calculations
}

export function RetirementAgeComparison({
  currentAge,
  yearsOfService,
  averageSalary,
  group,
  currentMonthlyPension,
  serviceEntry = 'before_2012',
  retirementOption = 'A',
  beneficiaryAge = ''
}: RetirementAgeComparisonProps) {
  const groupKey = group as RetirementGroup
  const earlyData = EARLY_RETIREMENT_DATA[groupKey]

  if (!earlyData) return null

  // For Group 3, we don't show early vs later since they always get max multiplier
  const isGroup3 = group === 'GROUP_3'

  // Calculate what pension would be at minimum age vs maximum multiplier age
  const minAge = earlyData.minimumAge ?? currentAge
  const maxAge = earlyData.ageForMaxMultiplier

  // Skip if user is already at or past the max multiplier age
  if (currentAge >= maxAge && !isGroup3) return null

  // Skip if user entered age that's below minimum (shouldn't happen but safety check)
  if (currentAge < minAge && minAge > 0) return null

  // Calculate scenarios - IMPORTANT: Account for additional years of service if waiting
  const minMultiplier = earlyData.multiplierAtMin / 100
  const maxMultiplier = earlyData.multiplierAtMax / 100
  const freedomYears = maxAge - minAge

  // Years of service at each retirement age
  // If current age > minAge, use current YOS for min scenario
  // If waiting to max age, add the additional years
  const yosAtMinAge = yearsOfService
  const yosAtMaxAge = yearsOfService + freedomYears // Gain years while waiting!

  // Calculate base pension at min age vs max age (Option A)
  const basePensionAtMinAge = averageSalary * minMultiplier * yosAtMinAge
  const basePensionAtMaxAge = averageSalary * maxMultiplier * yosAtMaxAge

  // Apply 80% cap to base pension
  const maxAllowed = averageSalary * 0.8
  const cappedMinBase = Math.min(basePensionAtMinAge, maxAllowed)
  const cappedMaxBase = Math.min(basePensionAtMaxAge, maxAllowed)

  // Apply retirement option reduction (A, B, or C) to match user's selection
  // This ensures the comparison card matches the projection table
  const optionResultMin = calculatePensionWithOption(
    cappedMinBase,
    retirementOption,
    minAge,
    beneficiaryAge,
    group
  )
  const optionResultMax = calculatePensionWithOption(
    cappedMaxBase,
    retirementOption,
    maxAge,
    beneficiaryAge,
    group
  )

  const cappedMinPension = optionResultMin.pension
  const cappedMaxPension = optionResultMax.pension

  const monthlyAtMin = cappedMinPension / 12
  const monthlyAtMax = cappedMaxPension / 12

  // Get option label for display
  const optionLabel = retirementOption === 'A' ? 'Option A' :
                      retirementOption === 'B' ? 'Option B' :
                      retirementOption === 'C' ? 'Option C' : 'Option A'

  // Calculate lifetime values
  const lifetimeAtMin = calculateLifetimeValue(monthlyAtMin, minAge)
  const lifetimeAtMax = calculateLifetimeValue(monthlyAtMax, maxAge)

  // Calculate crossover age
  const crossoverAge = calculateCrossoverAge(monthlyAtMin, minAge, monthlyAtMax, maxAge)

  // Calculate "freedom years" - years of payments before max age kicks in
  const freedomPayments = monthlyAtMin * 12 * freedomYears

  // For Group 3, show a different message
  if (isGroup3) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card className="border-2 border-red-200 bg-gradient-to-br from-red-50 to-orange-50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <Badge className="bg-red-100 text-red-800">
                <Zap className="w-3 h-3 mr-1" />
                Group 3 Advantage
              </Badge>
              <span className="text-2xl">🚀</span>
            </div>
            <CardTitle className="text-lg">Maximum Multiplier at ANY Age</CardTitle>
            <CardDescription>
              As a Massachusetts State Police member, you receive the full 2.5% multiplier regardless of retirement age
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-white/80 rounded-lg p-4 border border-red-100">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-red-600" />
                <span className="font-semibold text-red-800">Your Unique Benefit</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Other groups must wait until ages 55-65 to reach the 2.5% maximum multiplier. 
                You get it immediately with 20 years of service at any age—whether you retire at 42 or 62.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <Badge className="bg-blue-100 text-blue-800">
              <Clock className="w-3 h-3 mr-1" />
              Early vs. Later Retirement
            </Badge>
            <span className="text-xl">⚖️</span>
          </div>
          <CardTitle className="text-lg">What If You Retired Earlier or Later?</CardTitle>
          <CardDescription>
            Compare retiring at your minimum eligible age vs. waiting for the maximum multiplier
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Comparison Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Early Retirement Card */}
            <div className="bg-white rounded-lg p-4 border-2 border-emerald-200">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-emerald-100 rounded-full">
                  <Zap className="h-4 w-4 text-emerald-600" />
                </div>
                <div>
                  <p className="font-semibold text-emerald-800">Retire at {minAge}</p>
                  <p className="text-xs text-muted-foreground">Earliest eligible</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Years of Service:</span>
                  <span className="font-medium">{yosAtMinAge.toFixed(1)} yrs</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Multiplier:</span>
                  <span className="font-medium">{earlyData.multiplierAtMin}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Monthly Pension:</span>
                  <span className="font-bold text-emerald-600">{formatCurrency(monthlyAtMin)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Lifetime Value:</span>
                  <span className="font-medium">{formatCurrency(lifetimeAtMin)}</span>
                </div>
                <div className="pt-2 border-t">
                  <p className="text-xs text-emerald-700">
                    ✨ {freedomYears} extra years of freedom
                  </p>
                </div>
              </div>
            </div>

            {/* Later Retirement Card */}
            <div className="bg-white rounded-lg p-4 border-2 border-purple-200">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-purple-100 rounded-full">
                  <TrendingUp className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="font-semibold text-purple-800">Retire at {maxAge}</p>
                  <p className="text-xs text-muted-foreground">Maximum multiplier</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Years of Service:</span>
                  <span className="font-medium">{yosAtMaxAge.toFixed(1)} yrs</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Multiplier:</span>
                  <span className="font-medium">{earlyData.multiplierAtMax}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Monthly Pension:</span>
                  <span className="font-bold text-purple-600">{formatCurrency(monthlyAtMax)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Lifetime Value:</span>
                  <span className="font-medium">{formatCurrency(lifetimeAtMax)}</span>
                </div>
                <div className="pt-2 border-t">
                  <p className="text-xs text-purple-700">
                    📈 +{formatCurrency(monthlyAtMax - monthlyAtMin)}/mo higher
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Option Note */}
          <p className="text-xs text-muted-foreground text-center">
            * Amounts shown reflect your selected {optionLabel}. Values match the Projection Table.
          </p>

          {/* Enhanced Break-Even Analysis */}
          <div className="bg-white/80 rounded-lg p-4 border border-blue-100 space-y-4">
            <div className="flex items-start gap-2">
              <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-blue-800 mb-1">Understanding Your Options</p>
                <p className="text-sm text-muted-foreground mb-3">
                  This is the core trade-off: <strong>retire early</strong> with smaller monthly payments
                  but more years of income, or <strong>wait</strong> for larger monthly payments but fewer total years.
                </p>
              </div>
            </div>

            {/* Monthly Comparison */}
            <div className="bg-gradient-to-r from-emerald-50 to-purple-50 rounded-lg p-3 border border-gray-200">
              <p className="text-sm font-medium text-gray-700 mb-2">💰 Monthly Payment Comparison:</p>
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded font-medium">
                  Age {minAge}: {formatCurrency(monthlyAtMin)}/mo
                </span>
                <span className="text-gray-500">vs</span>
                <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded font-medium">
                  Age {maxAge}: {formatCurrency(monthlyAtMax)}/mo
                </span>
                <span className="text-gray-500 text-xs">
                  (+{formatCurrency(monthlyAtMax - monthlyAtMin)}/mo more)
                </span>
              </div>
            </div>

            {crossoverAge ? (
              <div className="space-y-3">
                {/* Break-Even Definition */}
                <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
                  <p className="text-sm font-medium text-amber-800 mb-1">⚖️ Break-Even Age: {Math.round(crossoverAge)}</p>
                  <p className="text-xs text-amber-700">
                    This is when total lifetime benefits from both strategies become equal.
                    It's the "tipping point" where waiting to retire starts to pay off.
                  </p>
                </div>

                {/* Before vs After Break-Even */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-200">
                    <p className="text-xs font-semibold text-emerald-800 mb-1">
                      📈 Before Age {Math.round(crossoverAge)}:
                    </p>
                    <p className="text-xs text-emerald-700">
                      Early retirement wins! You collect <strong>{formatCurrency(freedomPayments)}</strong> in
                      pension payments during your {freedomYears} extra retirement years that the "waiters" miss out on.
                    </p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                    <p className="text-xs font-semibold text-purple-800 mb-1">
                      📈 After Age {Math.round(crossoverAge)}:
                    </p>
                    <p className="text-xs text-purple-700">
                      Delayed retirement catches up! The higher monthly payments
                      (+{formatCurrency(monthlyAtMax - monthlyAtMin)}/mo) have now made up for the years you waited.
                    </p>
                  </div>
                </div>

                {/* Life Expectancy Context */}
                <div className={`rounded-lg p-3 border ${
                  crossoverAge > 82
                    ? 'bg-emerald-50 border-emerald-200'
                    : crossoverAge > 78
                      ? 'bg-yellow-50 border-yellow-200'
                      : 'bg-purple-50 border-purple-200'
                }`}>
                  <p className="text-sm font-medium mb-1">
                    {crossoverAge > 82 ? '🎯' : crossoverAge > 78 ? '⚠️' : '💡'} Life Expectancy Context
                  </p>
                  <p className="text-xs text-gray-700">
                    {crossoverAge > 85 ? (
                      <>
                        <strong>Early retirement likely provides more total value.</strong> With average life expectancy
                        around 82-85, you'd need to live past {Math.round(crossoverAge)} to benefit from waiting.
                        The extra {freedomYears} years of retirement freedom is probably the better deal.
                      </>
                    ) : crossoverAge > 82 ? (
                      <>
                        <strong>Early retirement has a slight edge.</strong> The break-even age of {Math.round(crossoverAge)} is
                        right around average life expectancy (82-85). Early retirement gives you {freedomYears} more years
                        of freedom and likely similar or better total lifetime value.
                      </>
                    ) : crossoverAge > 78 ? (
                      <>
                        <strong>It's close—consider your personal factors.</strong> Break-even at {Math.round(crossoverAge)} is
                        below average life expectancy. If you're in good health and have longevity in your family,
                        waiting could provide more total value. But {freedomYears} extra years of freedom has real value too.
                      </>
                    ) : (
                      <>
                        <strong>Waiting likely provides more total value.</strong> With a break-even age of {Math.round(crossoverAge)},
                        most people will live long enough to benefit from the higher monthly payments.
                        However, weigh this against the {freedomYears} years of earlier retirement freedom.
                      </>
                    )}
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-200">
                <p className="text-sm font-medium text-emerald-800 mb-1">🎯 Your Situation</p>
                <p className="text-xs text-emerald-700">
                  Retiring at {minAge} provides <strong>{formatCurrency(freedomPayments)}</strong> in
                  payments during your {freedomYears} extra years of retirement freedom—money you'd miss
                  out on if you waited.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

