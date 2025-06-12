"use client"

import React from 'react'
import { formatDate, formatCurrency } from '@/lib/utils'
import { PrintChart } from '../components/print-chart'

interface PensionCalculation {
  id: string
  retirementAge: number
  yearsOfService: number
  averageSalary: number
  monthlyBenefit: number
  annualBenefit: number
  benefitReduction?: number
  socialSecurityData?: any
  createdAt: Date
  isFavorite?: boolean
}

interface PensionCalculationsProps {
  calculations: PensionCalculation[]
  chartData?: any[]
}

export function PensionCalculations({ calculations, chartData }: PensionCalculationsProps) {
  // Sort calculations by creation date, with favorites first
  const sortedCalculations = [...calculations].sort((a, b) => {
    if (a.isFavorite && !b.isFavorite) return -1
    if (!a.isFavorite && b.isFavorite) return 1
    return b.createdAt.getTime() - a.createdAt.getTime()
  })

  const primaryCalculation = sortedCalculations[0]
  const alternativeCalculations = sortedCalculations.slice(1)

  const calculateBenefitMultiplier = (retirementAge: number, yearsOfService: number) => {
    // Simplified multiplier calculation for display
    const baseMultiplier = 0.02 // 2%
    const maxMultiplier = 0.025 // 2.5%
    const ageBonus = Math.min((retirementAge - 55) * 0.001, 0.005)
    return Math.min(baseMultiplier + ageBonus, maxMultiplier)
  }

  const calculateReplacementRatio = (annualBenefit: number, averageSalary: number) => {
    return (annualBenefit / averageSalary) * 100
  }

  return (
    <section className="report-section page-break-before">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-300 pb-2">
        Pension Benefit Calculations
      </h2>

      {/* Primary Calculation */}
      {primaryCalculation && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-md font-medium text-gray-800">
              Primary Calculation
              {primaryCalculation.isFavorite && (
                <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                  ⭐ Favorite
                </span>
              )}
            </h3>
            <span className="text-sm text-gray-600">
              Calculated: {formatDate(primaryCalculation.createdAt)}
            </span>
          </div>

          {/* Key Results */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-700">
                {formatCurrency(primaryCalculation.monthlyBenefit)}
              </div>
              <div className="text-sm text-blue-600 mt-1">Monthly Benefit</div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-700">
                {formatCurrency(primaryCalculation.annualBenefit)}
              </div>
              <div className="text-sm text-green-600 mt-1">Annual Benefit</div>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-700">
                {calculateReplacementRatio(primaryCalculation.annualBenefit, primaryCalculation.averageSalary).toFixed(1)}%
              </div>
              <div className="text-sm text-purple-600 mt-1">Income Replacement</div>
            </div>
          </div>

          {/* Calculation Details */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-800 mb-3">Calculation Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Retirement Age:</span>
                  <span className="font-medium">{primaryCalculation.retirementAge} years</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Years of Service:</span>
                  <span className="font-medium">{primaryCalculation.yearsOfService} years</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Average Salary:</span>
                  <span className="font-medium">{formatCurrency(primaryCalculation.averageSalary)}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Benefit Multiplier:</span>
                  <span className="font-medium">
                    {(calculateBenefitMultiplier(primaryCalculation.retirementAge, primaryCalculation.yearsOfService) * 100).toFixed(2)}%
                  </span>
                </div>
                {primaryCalculation.benefitReduction && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Early Retirement Reduction:</span>
                    <span className="font-medium text-red-600">
                      -{(primaryCalculation.benefitReduction * 100).toFixed(1)}%
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Maximum Benefit (80%):</span>
                  <span className="font-medium">{formatCurrency(primaryCalculation.averageSalary * 0.8)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Calculation Formula */}
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="text-sm font-semibold text-blue-800 mb-2">Calculation Formula</h4>
            <div className="text-sm text-blue-700 space-y-1">
              <div>Annual Benefit = Average Salary × Years of Service × Benefit Multiplier</div>
              <div className="text-xs text-blue-600 mt-2">
                {formatCurrency(primaryCalculation.averageSalary)} × {primaryCalculation.yearsOfService} × {(calculateBenefitMultiplier(primaryCalculation.retirementAge, primaryCalculation.yearsOfService) * 100).toFixed(2)}% = {formatCurrency(primaryCalculation.annualBenefit)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chart Visualization */}
      {chartData && chartData.length > 0 && (
        <div className="mb-6 page-break-avoid">
          <h3 className="text-md font-medium text-gray-800 mb-3">Benefit Projection Chart</h3>
          <div className="bg-white border rounded-lg p-4">
            <PrintChart 
              data={chartData}
              type="line"
              title="Pension Benefits by Retirement Age"
              xAxisKey="age"
              yAxisKey="monthlyBenefit"
              height={300}
            />
          </div>
        </div>
      )}

      {/* Alternative Calculations */}
      {alternativeCalculations.length > 0 && (
        <div className="page-break-avoid">
          <h3 className="text-md font-medium text-gray-800 mb-4">Alternative Scenarios</h3>
          <div className="space-y-4">
            {alternativeCalculations.slice(0, 3).map((calc, index) => (
              <div key={calc.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-gray-700">
                    Scenario {index + 2}: Retire at Age {calc.retirementAge}
                  </h4>
                  <span className="text-xs text-gray-500">
                    {formatDate(calc.createdAt)}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">
                      {formatCurrency(calc.monthlyBenefit)}
                    </div>
                    <div className="text-xs text-gray-600">Monthly</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">
                      {formatCurrency(calc.annualBenefit)}
                    </div>
                    <div className="text-xs text-gray-600">Annual</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">
                      {calc.yearsOfService}
                    </div>
                    <div className="text-xs text-gray-600">Years Service</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">
                      {calculateReplacementRatio(calc.annualBenefit, calc.averageSalary).toFixed(1)}%
                    </div>
                    <div className="text-xs text-gray-600">Replacement</div>
                  </div>
                </div>

                {calc.benefitReduction && (
                  <div className="mt-2 text-xs text-red-600 text-center">
                    Early retirement reduction: -{(calc.benefitReduction * 100).toFixed(1)}%
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Comparison Table */}
      {calculations.length > 1 && (
        <div className="mt-6 page-break-avoid">
          <h3 className="text-md font-medium text-gray-800 mb-3">Scenario Comparison</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-3 py-2 text-left">Retirement Age</th>
                  <th className="border border-gray-300 px-3 py-2 text-right">Years of Service</th>
                  <th className="border border-gray-300 px-3 py-2 text-right">Monthly Benefit</th>
                  <th className="border border-gray-300 px-3 py-2 text-right">Annual Benefit</th>
                  <th className="border border-gray-300 px-3 py-2 text-right">Replacement %</th>
                  <th className="border border-gray-300 px-3 py-2 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {sortedCalculations.slice(0, 5).map((calc) => (
                  <tr key={calc.id} className={calc.isFavorite ? 'bg-yellow-50' : ''}>
                    <td className="border border-gray-300 px-3 py-2 font-medium">
                      {calc.retirementAge}
                      {calc.isFavorite && <span className="ml-1 text-yellow-600">⭐</span>}
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-right">
                      {calc.yearsOfService}
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-right font-medium">
                      {formatCurrency(calc.monthlyBenefit)}
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-right font-medium">
                      {formatCurrency(calc.annualBenefit)}
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-right">
                      {calculateReplacementRatio(calc.annualBenefit, calc.averageSalary).toFixed(1)}%
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-center">
                      {calc.benefitReduction ? (
                        <span className="text-xs text-red-600">Reduced</span>
                      ) : (
                        <span className="text-xs text-green-600">Full</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Important Notes */}
      <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-yellow-800 mb-2">Important Notes</h4>
        <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
          <li>Benefits are calculated based on current Massachusetts Retirement System rules</li>
          <li>Actual benefits may vary based on final average salary and years of service</li>
          <li>Early retirement may result in benefit reductions</li>
          <li>Maximum benefit is capped at 80% of average salary</li>
          <li>COLA adjustments are applied annually based on legislative approval</li>
        </ul>
      </div>
    </section>
  )
}
