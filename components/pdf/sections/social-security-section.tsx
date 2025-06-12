"use client"

import React from 'react'
import { formatDate, formatCurrency } from '@/lib/utils'
import { PrintChart } from '../components/print-chart'

interface SocialSecurityCalculation {
  id: string
  retirementAge: number
  yearsOfService: number
  averageSalary: number
  monthlyBenefit: number
  annualBenefit: number
  socialSecurityData: any
  createdAt: Date
}

interface SocialSecuritySectionProps {
  calculations: SocialSecurityCalculation[]
  chartData?: any[]
}

export function SocialSecuritySection({ calculations, chartData }: SocialSecuritySectionProps) {
  // Get the most recent calculation with Social Security data
  const primaryCalculation = calculations[0]
  const socialSecurityData = JSON.parse(primaryCalculation.socialSecurityData || '{}')

  const calculateCombinedIncome = (pensionBenefit: number, ssBenefit: number) => {
    return pensionBenefit + ssBenefit
  }

  const calculateTotalReplacementRatio = (
    pensionBenefit: number, 
    ssBenefit: number, 
    averageSalary: number
  ) => {
    const totalBenefit = pensionBenefit + ssBenefit
    return (totalBenefit / averageSalary) * 100
  }

  return (
    <section className="report-section page-break-before">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-300 pb-2">
        Social Security Analysis
      </h2>

      {/* Social Security Benefits Overview */}
      <div className="mb-6">
        <h3 className="text-md font-medium text-gray-800 mb-4">Social Security Benefits</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-700">
              {formatCurrency(socialSecurityData.monthlyBenefit || 0)}
            </div>
            <div className="text-sm text-green-600 mt-1">Monthly SS Benefit</div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-700">
              {formatCurrency((socialSecurityData.monthlyBenefit || 0) * 12)}
            </div>
            <div className="text-sm text-blue-600 mt-1">Annual SS Benefit</div>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-700">
              {socialSecurityData.fullRetirementAge || 67}
            </div>
            <div className="text-sm text-purple-600 mt-1">Full Retirement Age</div>
          </div>
        </div>

        {/* Social Security Details */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-800 mb-3">Social Security Details</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Estimated Monthly Benefit:</span>
                <span className="font-medium">{formatCurrency(socialSecurityData.monthlyBenefit || 0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Full Retirement Age:</span>
                <span className="font-medium">{socialSecurityData.fullRetirementAge || 67} years</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Early Retirement Age:</span>
                <span className="font-medium">62 years</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Delayed Retirement Credits:</span>
                <span className="font-medium">8% per year (age 67-70)</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Maximum Benefit Age:</span>
                <span className="font-medium">70 years</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">COLA Adjustments:</span>
                <span className="font-medium">Annual (inflation-based)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Combined Income Analysis */}
      <div className="mb-6">
        <h3 className="text-md font-medium text-gray-800 mb-4">Combined Retirement Income</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Monthly Income Breakdown */}
          <div className="bg-white border rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-800 mb-3">Monthly Income Breakdown</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Massachusetts Pension:</span>
                <span className="text-sm font-medium text-blue-700">
                  {formatCurrency(primaryCalculation.monthlyBenefit)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Social Security:</span>
                <span className="text-sm font-medium text-green-700">
                  {formatCurrency(socialSecurityData.monthlyBenefit || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-t-2 border-gray-300 pt-2">
                <span className="text-sm font-semibold text-gray-800">Total Monthly Income:</span>
                <span className="text-sm font-bold text-purple-700">
                  {formatCurrency(calculateCombinedIncome(
                    primaryCalculation.monthlyBenefit,
                    socialSecurityData.monthlyBenefit || 0
                  ))}
                </span>
              </div>
            </div>
          </div>

          {/* Annual Income Summary */}
          <div className="bg-white border rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-800 mb-3">Annual Income Summary</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Massachusetts Pension:</span>
                <span className="text-sm font-medium text-blue-700">
                  {formatCurrency(primaryCalculation.annualBenefit)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Social Security:</span>
                <span className="text-sm font-medium text-green-700">
                  {formatCurrency((socialSecurityData.monthlyBenefit || 0) * 12)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-t-2 border-gray-300 pt-2">
                <span className="text-sm font-semibold text-gray-800">Total Annual Income:</span>
                <span className="text-sm font-bold text-purple-700">
                  {formatCurrency(calculateCombinedIncome(
                    primaryCalculation.annualBenefit,
                    (socialSecurityData.monthlyBenefit || 0) * 12
                  ))}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Income Replacement Analysis */}
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-blue-800 mb-3">Income Replacement Analysis</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-lg font-bold text-blue-700">
                {((primaryCalculation.annualBenefit / primaryCalculation.averageSalary) * 100).toFixed(1)}%
              </div>
              <div className="text-xs text-blue-600">Pension Replacement</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-700">
                {(((socialSecurityData.monthlyBenefit || 0) * 12 / primaryCalculation.averageSalary) * 100).toFixed(1)}%
              </div>
              <div className="text-xs text-green-600">Social Security Replacement</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-purple-700">
                {calculateTotalReplacementRatio(
                  primaryCalculation.annualBenefit,
                  (socialSecurityData.monthlyBenefit || 0) * 12,
                  primaryCalculation.averageSalary
                ).toFixed(1)}%
              </div>
              <div className="text-xs text-purple-600">Total Replacement</div>
            </div>
          </div>
        </div>
      </div>

      {/* Chart Visualization */}
      {chartData && chartData.length > 0 && (
        <div className="mb-6 page-break-avoid">
          <h3 className="text-md font-medium text-gray-800 mb-3">Income Comparison Chart</h3>
          <div className="bg-white border rounded-lg p-4">
            <PrintChart 
              data={chartData}
              type="bar"
              title="Pension vs Social Security vs Combined Income"
              xAxisKey="category"
              yAxisKey="amount"
              height={300}
            />
          </div>
        </div>
      )}

      {/* Social Security Claiming Strategies */}
      <div className="mb-6">
        <h3 className="text-md font-medium text-gray-800 mb-4">Social Security Claiming Strategies</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Early Claiming */}
          <div className="border rounded-lg p-4">
            <h4 className="text-sm font-semibold text-red-700 mb-2">Early Claiming (Age 62)</h4>
            <div className="space-y-2">
              <div className="text-lg font-bold text-red-600">
                {formatCurrency((socialSecurityData.monthlyBenefit || 0) * 0.75)}
              </div>
              <div className="text-xs text-red-600">Monthly Benefit (25% reduction)</div>
              <div className="text-xs text-gray-600 mt-2">
                Start benefits immediately but with permanent reduction
              </div>
            </div>
          </div>

          {/* Full Retirement Age */}
          <div className="border rounded-lg p-4 bg-green-50">
            <h4 className="text-sm font-semibold text-green-700 mb-2">
              Full Retirement (Age {socialSecurityData.fullRetirementAge || 67})
            </h4>
            <div className="space-y-2">
              <div className="text-lg font-bold text-green-600">
                {formatCurrency(socialSecurityData.monthlyBenefit || 0)}
              </div>
              <div className="text-xs text-green-600">Monthly Benefit (100%)</div>
              <div className="text-xs text-gray-600 mt-2">
                Full benefit amount with no reductions
              </div>
            </div>
          </div>

          {/* Delayed Claiming */}
          <div className="border rounded-lg p-4">
            <h4 className="text-sm font-semibold text-blue-700 mb-2">Delayed Claiming (Age 70)</h4>
            <div className="space-y-2">
              <div className="text-lg font-bold text-blue-600">
                {formatCurrency((socialSecurityData.monthlyBenefit || 0) * 1.32)}
              </div>
              <div className="text-xs text-blue-600">Monthly Benefit (32% increase)</div>
              <div className="text-xs text-gray-600 mt-2">
                Maximum benefit with delayed retirement credits
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Important Considerations */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-yellow-800 mb-2">Important Considerations</h4>
        <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
          <li>Social Security benefits are subject to federal income tax</li>
          <li>Massachusetts does not tax Social Security benefits</li>
          <li>Benefits may be reduced if you continue working before full retirement age</li>
          <li>COLA adjustments are applied annually based on inflation</li>
          <li>Spousal and survivor benefits may be available</li>
          <li>Medicare premiums may be deducted from Social Security benefits</li>
        </ul>
      </div>
    </section>
  )
}
