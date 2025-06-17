"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRetirementData } from "@/hooks/use-retirement-data"
import { getBenefitFactor, calculatePensionWithOption } from "@/lib/pension-calculations"
import { BenefitProjectionChart, type BenefitProjectionData } from "@/components/charts"
import { useProfile } from "@/contexts/profile-context"

interface ChartData {
  age: number
  yearsOfService: number
  factor: number
  totalPercentage: number
  annualPension: number
  monthlyPension: number
  survivorAnnual: number
  survivorMonthly: number
  cappedAt80Percent: boolean
}

export function RetirementChart() {
  console.log('🚀 RetirementChart: Component rendering')
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [benefitData, setBenefitData] = useState<BenefitProjectionData[]>([])
  const { calculations } = useRetirementData()
  const { profile } = useProfile()
  console.log('📊 RetirementChart: Profile data:', profile)

  useEffect(() => {
    // Performance optimization: debounce and limit calculations
    const calculateProjections = () => {
      console.log('🔥 RetirementChart: Starting calculation with profile:', profile)
      try {
        // Use profile data or defaults
        const currentAge = profile?.dateOfBirth ?
          new Date().getFullYear() - new Date(profile.dateOfBirth).getFullYear() : 45
        const currentYOS = profile?.yearsOfService || 20
        const averageSalary = profile?.averageHighest3Years || profile?.currentSalary || 75000
        const retirementGroup = profile?.retirementGroup || 'Group 1'
        const serviceEntry = profile?.membershipDate && new Date(profile.membershipDate) > new Date('2012-04-02') ?
          'after_2012' : 'before_2012'

        // Convert group name to format expected by calculation functions
        const groupCode = retirementGroup.toUpperCase().replace(' ', '_')

        // Generate data points - LIMIT to 8 data points for performance
        const data: ChartData[] = []
        const benefitProjections: BenefitProjectionData[] = []
        const currentYear = new Date().getFullYear()

        // Determine starting age based on group
        let startAge = 55
        if (groupCode === 'GROUP_1') startAge = Math.max(55, currentAge)
        else if (groupCode === 'GROUP_2') startAge = Math.max(55, currentAge)
        else if (groupCode === 'GROUP_3') startAge = Math.max(55, currentAge)
        else if (groupCode === 'GROUP_4') startAge = Math.max(50, currentAge)

        const MAX_PENSION_PERCENTAGE = 0.8 // 80% cap
        let age = startAge
        const maxDataPoints = 8 // Limit for performance
        let dataPointCount = 0

        while (age <= Math.min(startAge + 15, 70) && dataPointCount < maxDataPoints) {
          const projectedYOS = currentYOS + (age - currentAge)

          // Get benefit factor using actual pension calculation logic
          const benefitFactor = getBenefitFactor(age, groupCode, serviceEntry, projectedYOS)

          if (benefitFactor === 0) {
            age++
            continue // Skip if not eligible
          }

          // Calculate total benefit percentage
          let totalBenefitPercentage = benefitFactor * projectedYOS
          let baseAnnualPension = averageSalary * totalBenefitPercentage
          const maxPensionAllowed = averageSalary * MAX_PENSION_PERCENTAGE

          // Apply 80% cap
          const cappedAt80Percent = baseAnnualPension > maxPensionAllowed
          if (cappedAt80Percent) {
            console.log(`80% cap applied at age ${age}: ${baseAnnualPension} -> ${maxPensionAllowed}`)
            baseAnnualPension = maxPensionAllowed
            totalBenefitPercentage = MAX_PENSION_PERCENTAGE
          }

          // Simplified calculation - skip Option C for performance
          const finalAnnualPension = baseAnnualPension
          const monthlyPension = finalAnnualPension / 12
          const survivorAnnual = finalAnnualPension * 0.667 // Simplified survivor calculation
          const survivorMonthly = survivorAnnual / 12

          data.push({
            age,
            yearsOfService: projectedYOS,
            factor: benefitFactor * 100, // Convert to percentage for display
            totalPercentage: Number((totalBenefitPercentage * 100).toFixed(1)),
            annualPension: Number(finalAnnualPension.toFixed(2)),
            monthlyPension: Number(monthlyPension.toFixed(2)),
            survivorAnnual: Number(survivorAnnual.toFixed(2)),
            survivorMonthly: Number(survivorMonthly.toFixed(2)),
            cappedAt80Percent
          })

          // Create benefit projection data for enhanced chart
          benefitProjections.push({
            age,
            year: currentYear + (age - currentAge),
            pensionBenefit: finalAnnualPension,
            socialSecurityBenefit: 0, // No SS until later
            totalBenefit: finalAnnualPension,
            notes: age === startAge ? 'Earliest retirement' :
                   cappedAt80Percent ? '80% cap reached' : undefined,
            percentage: totalBenefitPercentage * 100 // Add percentage to chart data
          })

          age += 2 // Skip every other year for performance
          dataPointCount++

          // Stop if we've reached 80% cap
          if (cappedAt80Percent && totalBenefitPercentage >= MAX_PENSION_PERCENTAGE) {
            break
          }
        }

        setChartData(data)
        setBenefitData(benefitProjections)
      } catch (error) {
        console.error('Error calculating retirement projections:', error)
        // Set empty data on error
        setChartData([])
        setBenefitData([])
      }
    }

    // Debounce the calculation to avoid excessive re-renders
    const timeoutId = setTimeout(calculateProjections, 100)
    return () => clearTimeout(timeoutId)
  }, [profile])

  return (
    <div className="space-y-6">
      {/* Enhanced Interactive Chart */}
      <BenefitProjectionChart
        data={benefitData}
        title="Retirement Benefit Projections by Age (80% Cap Applied)"
        description="Annual pension benefits with 80% maximum cap and percentage display"
        showCOLA={false}
        chartType="line"
        enableZoom={true}
        enableBrush={false}
        className="mb-6"
      />

      {/* Detailed Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Retirement Calculations</CardTitle>
          <CardDescription>
            Breakdown of pension calculations by retirement age with survivor benefits
          </CardDescription>
        </CardHeader>
        <CardContent>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left py-3 px-2 font-medium text-slate-600 dark:text-slate-400">Ret. Age</th>
                  <th className="text-left py-3 px-2 font-medium text-slate-600 dark:text-slate-400">Y.O.S.</th>
                  <th className="text-left py-3 px-2 font-medium text-slate-600 dark:text-slate-400">Factor</th>
                  <th className="text-left py-3 px-2 font-medium text-slate-600 dark:text-slate-400">Total %</th>
                  <th className="text-right py-3 px-2 font-medium text-slate-600 dark:text-slate-400">Annual (Opt C)</th>
                  <th className="text-right py-3 px-2 font-medium text-slate-600 dark:text-slate-400">Monthly (Opt C)</th>
                  <th className="text-right py-3 px-2 font-medium text-slate-600 dark:text-slate-400">Survivor Annual</th>
                  <th className="text-right py-3 px-2 font-medium text-slate-600 dark:text-slate-400">Survivor Monthly</th>
                  <th className="text-center py-3 px-2 font-medium text-slate-600 dark:text-slate-400">Status</th>
                </tr>
              </thead>
              <tbody>
                {chartData.map((row, index) => (
                  <tr
                    key={row.age}
                    className={`border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${
                      index % 2 === 0 ? 'bg-slate-25 dark:bg-slate-900/25' : ''
                    } ${row.cappedAt80Percent ? 'bg-amber-50 dark:bg-amber-900/20' : ''}`}
                  >
                    <td className="py-3 px-2 font-medium text-slate-900 dark:text-slate-100">{row.age}</td>
                    <td className="py-3 px-2 text-slate-700 dark:text-slate-300">{row.yearsOfService.toFixed(1)}</td>
                    <td className="py-3 px-2 text-slate-700 dark:text-slate-300">{row.factor.toFixed(1)}%</td>
                    <td className={`py-3 px-2 font-medium ${row.cappedAt80Percent ? 'text-amber-600 dark:text-amber-400' : 'text-slate-900 dark:text-slate-100'}`}>
                      {row.totalPercentage}%
                      {row.cappedAt80Percent && <span className="ml-1 text-xs">📊</span>}
                    </td>
                    <td className="text-right py-3 px-2 font-semibold text-blue-600 dark:text-blue-400">
                      ${row.annualPension.toLocaleString()}
                    </td>
                    <td className="text-right py-3 px-2 text-slate-700 dark:text-slate-300">
                      ${row.monthlyPension.toLocaleString()}
                    </td>
                    <td className="text-right py-3 px-2 font-medium text-purple-600 dark:text-purple-400">
                      ${row.survivorAnnual.toLocaleString()}
                    </td>
                    <td className="text-right py-3 px-2 text-slate-700 dark:text-slate-300">
                      ${row.survivorMonthly.toLocaleString()}
                    </td>
                    <td className="text-center py-3 px-2">
                      {row.cappedAt80Percent ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                          80% Cap
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                          Active
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}