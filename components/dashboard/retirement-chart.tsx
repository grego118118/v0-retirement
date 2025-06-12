"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRetirementData } from "@/hooks/use-retirement-data"
import { calculatePensionPercentage } from "@/lib/pension-calculations"
import { BenefitProjectionChart, type BenefitProjectionData } from "@/components/charts"

interface ChartData {
  age: number
  yearsOfService: number
  factor: number
  totalPercentage: number
  annualPension: number
  monthlyPension: number
  survivorAnnual: number
  survivorMonthly: number
}

export function RetirementChart() {
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [benefitData, setBenefitData] = useState<BenefitProjectionData[]>([])
  const { calculations } = useRetirementData()

  useEffect(() => {
    // Generate data points from age 55 until we reach 80% or age 65
    const data: ChartData[] = []
    const benefitProjections: BenefitProjectionData[] = []
    let age = 55
    let baseYearsOfService = 30 // Starting YOS at age 55
    const currentYear = new Date().getFullYear()

    while (age <= 59) { // Go up to age 59 as shown in the example
      const yearsOfService = baseYearsOfService + (age - 55)
      const factor = 2.0 + (age - 55) * 0.1 // Increases by 0.1% each year from 2.0%
      const totalPercentage = yearsOfService * factor
      const annualPension = 89300 * (totalPercentage / 100) // Using example salary of 89,300
      const monthlyPension = annualPension / 12
      const survivorAnnual = annualPension * 0.667 // Option C provides 2/3 to survivor
      const survivorMonthly = survivorAnnual / 12

      data.push({
        age,
        yearsOfService,
        factor,
        totalPercentage: Number(totalPercentage.toFixed(1)),
        annualPension: Number(annualPension.toFixed(2)),
        monthlyPension: Number(monthlyPension.toFixed(2)),
        survivorAnnual: Number(survivorAnnual.toFixed(2)),
        survivorMonthly: Number(survivorMonthly.toFixed(2))
      })

      // Create benefit projection data for enhanced chart
      benefitProjections.push({
        age,
        year: currentYear + (age - 55),
        pensionBenefit: annualPension,
        socialSecurityBenefit: 0, // No SS until later
        totalBenefit: annualPension,
        notes: age === 55 ? 'Earliest retirement' : undefined
      })

      age++
    }

    setChartData(data)
    setBenefitData(benefitProjections)
  }, [])

  return (
    <div className="space-y-6">
      {/* Enhanced Interactive Chart */}
      <BenefitProjectionChart
        data={benefitData}
        title="Retirement Benefit Projections by Age"
        description="Annual pension benefits based on retirement age and years of service"
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
                </tr>
              </thead>
              <tbody>
                {chartData.map((row, index) => (
                  <tr
                    key={row.age}
                    className={`border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${
                      index % 2 === 0 ? 'bg-slate-25 dark:bg-slate-900/25' : ''
                    }`}
                  >
                    <td className="py-3 px-2 font-medium text-slate-900 dark:text-slate-100">{row.age}</td>
                    <td className="py-3 px-2 text-slate-700 dark:text-slate-300">{row.yearsOfService.toFixed(1)}</td>
                    <td className="py-3 px-2 text-slate-700 dark:text-slate-300">{row.factor.toFixed(1)}%</td>
                    <td className="py-3 px-2 font-medium text-slate-900 dark:text-slate-100">{row.totalPercentage}%</td>
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