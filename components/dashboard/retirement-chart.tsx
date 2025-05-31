"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { useRetirementData } from "@/hooks/use-retirement-data"
import { calculatePensionPercentage } from "@/lib/pension-calculations"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

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
  const { calculations } = useRetirementData()

  useEffect(() => {
    // Generate data points from age 55 until we reach 80% or age 65
    const data: ChartData[] = []
    let age = 55
    let baseYearsOfService = 30 // Starting YOS at age 55

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
      
      age++
    }

    setChartData(data)
  }, [])

  return (
    <div className="space-y-6">
      <div className="w-full h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="age"
              label={{ value: "Retirement Age", position: "insideBottom", offset: -5 }}
            />
            <YAxis
              label={{
                value: "Annual Pension ($)",
                angle: -90,
                position: "insideLeft",
                offset: 15,
              }}
            />
            <Tooltip
              formatter={(value: number, name: string) => {
                if (name === "Annual Pension") return [`$${value.toLocaleString()}`, name]
                if (name === "Survivor Annual") return [`$${value.toLocaleString()}`, "Survivor Benefit"]
                return [value, name]
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="annualPension"
              name="Annual Pension"
              stroke="#4f46e5"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 8 }}
            />
            <Line
              type="monotone"
              dataKey="survivorAnnual"
              name="Survivor Annual"
              stroke="#9333ea"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2">Ret. Age</th>
              <th className="text-left py-2">Y.O.S.</th>
              <th className="text-left py-2">Factor</th>
              <th className="text-left py-2">Total %</th>
              <th className="text-right py-2">Annual (Opt C)</th>
              <th className="text-right py-2">Monthly (Opt C)</th>
              <th className="text-right py-2">Survivor Annual</th>
              <th className="text-right py-2">Survivor Monthly</th>
            </tr>
          </thead>
          <tbody>
            {chartData.map((row) => (
              <tr key={row.age} className="border-b">
                <td className="py-2">{row.age}</td>
                <td className="py-2">{row.yearsOfService.toFixed(1)}</td>
                <td className="py-2">{row.factor.toFixed(1)}%</td>
                <td className="py-2">{row.totalPercentage}%</td>
                <td className="text-right py-2">${row.annualPension.toLocaleString()}</td>
                <td className="text-right py-2">${row.monthlyPension.toLocaleString()}</td>
                <td className="text-right py-2">${row.survivorAnnual.toLocaleString()}</td>
                <td className="text-right py-2">${row.survivorMonthly.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
} 