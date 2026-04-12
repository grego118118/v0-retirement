"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRetirementData } from "@/hooks/use-retirement-data"
import { getBenefitFactor, calculatePensionWithOption } from "@/lib/pension-calculations"
import { calculateMassachusettsCOLA } from "@/lib/pension/ma-cola-calculator"
import { useProfile } from "@/contexts/profile-context"

interface RetirementTableData {
  age: number
  yearsOfService: number
  factor: number
  totalPercentage: number
  basePension: number
  colaAdjustment: number
  totalPensionWithCOLA: number
  annualPension: number
  monthlyPension: number
  survivorAnnual: number
  survivorMonthly: number
  cappedAt80Percent: boolean
}

export function RetirementChart() {
  console.log('🚀 RetirementChart: Component rendering')
  const [tableData, setTableData] = useState<RetirementTableData[]>([])

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
        const groupCode = retirementGroup.startsWith('Group')
          ? retirementGroup.toUpperCase().replace(' ', '_')
          : `GROUP_${retirementGroup}`

        console.log('🔧 RetirementChart: Group conversion:', {
          originalGroup: retirementGroup,
          convertedGroupCode: groupCode,
          currentAge,
          currentYOS,
          averageSalary,
          serviceEntry
        })

        // Generate comprehensive year-by-year data for all eligible retirement ages
        const data: RetirementTableData[] = []
        const currentYear = new Date().getFullYear()

        // Determine starting age based on group
        let startAge = 55
        if (groupCode === 'GROUP_1') startAge = Math.max(60, currentAge) // Group 1 minimum age 60
        else if (groupCode === 'GROUP_2') startAge = Math.max(55, currentAge) // Group 2 minimum age 55
        else if (groupCode === 'GROUP_3') startAge = Math.max(55, currentAge) // Group 3 any age with 20+ years
        else if (groupCode === 'GROUP_4') startAge = Math.max(50, currentAge) // Group 4 minimum age 50

        const MAX_PENSION_PERCENTAGE = 0.8 // 80% cap
        let age = startAge

        // Generate data for ALL eligible ages (not just every 2 years)
        while (age <= 70) {
          const projectedYOS = currentYOS + (age - currentAge)

          // Get benefit factor using actual pension calculation logic
          const benefitFactor = getBenefitFactor(age, groupCode, serviceEntry, projectedYOS)

          console.log(`🎯 RetirementChart: Age ${age} - Benefit factor:`, {
            age,
            groupCode,
            serviceEntry,
            projectedYOS,
            benefitFactor
          })

          if (benefitFactor === 0) {
            console.log(`⚠️ RetirementChart: Skipping age ${age} - benefit factor is 0`)
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

          // Calculate Option C pension with proper reductions
          // Use member age - 2 as default beneficiary age (common scenario)
          const beneficiaryAge = (age - 2).toString()

          // Apply Option C reduction using the same function as the wizard
          const optionCResult = calculatePensionWithOption(
            baseAnnualPension,
            'C',
            age,
            beneficiaryAge
          )

          const finalAnnualPension = optionCResult.pension
          const monthlyPension = finalAnnualPension / 12
          const survivorAnnual = finalAnnualPension * 0.6667 // 66.67% survivor benefit for Option C
          const survivorMonthly = survivorAnnual / 12

          // Calculate COLA adjustments for display
          const yearsInRetirement = Math.max(0, age - currentAge)
          const colaResult = calculateMassachusettsCOLA(finalAnnualPension, yearsInRetirement)
          const colaAdjustment = colaResult.totalIncrease
          const totalPensionWithCOLA = colaResult.finalAmount

          data.push({
            age,
            yearsOfService: projectedYOS,
            factor: benefitFactor * 100, // Convert to percentage for display
            totalPercentage: Number((totalBenefitPercentage * 100).toFixed(1)),
            basePension: Number(finalAnnualPension.toFixed(2)),
            colaAdjustment: Number(colaAdjustment.toFixed(2)),
            totalPensionWithCOLA: Number(totalPensionWithCOLA.toFixed(2)),
            annualPension: Number(finalAnnualPension.toFixed(2)),
            monthlyPension: Number(monthlyPension.toFixed(2)),
            survivorAnnual: Number(survivorAnnual.toFixed(2)),
            survivorMonthly: Number(survivorMonthly.toFixed(2)),
            cappedAt80Percent
          })

          age++ // Increment by 1 to show ALL eligible ages

          // Stop if we've reached 80% cap and it's been applied
          if (cappedAt80Percent && totalBenefitPercentage >= MAX_PENSION_PERCENTAGE) {
            break
          }
        }

        setTableData(data)
      } catch (error) {
        console.error('Error calculating retirement projections:', error)
        // Set empty data on error
        setTableData([])
      }
    }

    // Debounce the calculation to avoid excessive re-renders
    const timeoutId = setTimeout(calculateProjections, 100)
    return () => clearTimeout(timeoutId)
  }, [profile])

  return (
    <div className="space-y-6">
      {/* Comprehensive Year-by-Year Retirement Calculations Table */}
      <Card>
        <CardHeader>
          <CardTitle>Comprehensive Year-by-Year Retirement Calculations</CardTitle>
          <CardDescription>
            Complete breakdown of pension calculations for all eligible retirement ages with Option C (Joint & Survivor 66.67%) reductions applied
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
                {tableData.map((row, index) => (
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