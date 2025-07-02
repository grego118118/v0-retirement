"use client"

import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PDFExportButton } from './pdf-export-button'
import { PensionCalculationData, CombinedCalculationData } from '@/lib/pdf/pdf-generator'
import { SubscriptionDebug } from '@/components/debug/subscription-debug'
import { DetailedPDFDebug } from '@/components/debug/detailed-pdf-debug'
import { FileText, Download } from 'lucide-react'

/**
 * Test component for PDF generation functionality
 * This component provides sample data to test PDF generation
 */
export function PDFTestComponent() {
  // Sample pension calculation data
  const samplePensionData: PensionCalculationData = {
    name: "John Smith",
    employeeId: "EMP123456",
    currentAge: 45,
    plannedRetirementAge: 62,
    retirementGroup: "GROUP_2",
    serviceEntry: "before_2012",
    averageSalary: 75000,
    yearsOfService: 20,
    projectedYearsAtRetirement: 37,
    basePension: 55125,
    benefitFactor: 0.025,
    totalBenefitPercentage: 0.735,
    cappedAt80Percent: false,
    options: {
      A: {
        annual: 55125,
        monthly: 4594,
        description: "Option A: Full Allowance (100%)"
      },
      B: {
        annual: 54574,
        monthly: 4548,
        description: "Option B: Annuity Protection",
        reduction: 0.01
      },
      C: {
        annual: 51241,
        monthly: 4270,
        description: "Option C: Joint & Survivor (66.67%)",
        reduction: 0.0705,
        survivorAnnual: 34161,
        survivorMonthly: 2847,
        beneficiaryAge: 60
      }
    },
    colaProjections: [
      {
        year: 1,
        startingPension: 55125,
        colaIncrease: 390,
        endingPension: 55515,
        monthlyPension: 4626
      },
      {
        year: 2,
        startingPension: 55515,
        colaIncrease: 390,
        endingPension: 55905,
        monthlyPension: 4659
      }
    ],
    isVeteran: true,
    veteranBenefit: 15,
    eligibilityMessage: "Eligible for retirement at age 55 with full benefits",
    calculationDate: new Date()
  }

  // Sample combined calculation data
  const sampleCombinedData: CombinedCalculationData = {
    pensionData: samplePensionData,
    socialSecurityData: {
      estimatedBenefit: 2400,
      fullRetirementAge: 67,
      earlyRetirementReduction: 0.25,
      delayedRetirementCredit: 0.08,
      spousalBenefit: 1200,
      survivorBenefit: 2400,
      colaAdjustments: [2.1, 2.3, 2.0]
    },
    additionalIncome: {
      traditional401k: 250000,
      rothIRA: 150000,
      otherRetirementAccounts: 50000,
      partTimeIncome: 1000,
      rentalIncome: 800
    },
    projectionYears: 25,
    targetMonthlyIncome: 8000,
    riskTolerance: 'moderate'
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Debug Information */}
      <SubscriptionDebug />

      {/* Detailed Debug Analysis */}
      <DetailedPDFDebug />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            PDF Generation Test Component
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Basic Pension PDF Test */}
            <Card className="border-blue-200">
              <CardHeader>
                <CardTitle className="text-lg text-blue-900">Basic Pension Report</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-gray-600">
                  <p><strong>Employee:</strong> {samplePensionData.name}</p>
                  <p><strong>Group:</strong> {samplePensionData.retirementGroup}</p>
                  <p><strong>Years of Service:</strong> {samplePensionData.yearsOfService}</p>
                  <p><strong>Average Salary:</strong> ${samplePensionData.averageSalary.toLocaleString()}</p>
                  <p><strong>Annual Pension:</strong> ${samplePensionData.basePension.toLocaleString()}</p>
                </div>
                
                <PDFExportButton
                  data={samplePensionData}
                  reportType="pension"
                  variant="outline"
                  size="default"
                  options={{
                    includeCharts: true,
                    includeCOLAProjections: true
                  }}
                />
              </CardContent>
            </Card>

            {/* Combined Report PDF Test */}
            <Card className="border-green-200">
              <CardHeader>
                <CardTitle className="text-lg text-green-900">Comprehensive Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-gray-600">
                  <p><strong>Pension:</strong> ${samplePensionData.options.A.monthly.toLocaleString()}/mo</p>
                  <p><strong>Social Security:</strong> ${sampleCombinedData.socialSecurityData?.estimatedBenefit.toLocaleString()}/mo</p>
                  <p><strong>401k Balance:</strong> ${sampleCombinedData.additionalIncome?.traditional401k?.toLocaleString()}</p>
                  <p><strong>Total Monthly:</strong> ${(
                    samplePensionData.options.A.monthly + 
                    (sampleCombinedData.socialSecurityData?.estimatedBenefit || 0) +
                    (sampleCombinedData.additionalIncome?.partTimeIncome || 0) +
                    (sampleCombinedData.additionalIncome?.rentalIncome || 0)
                  ).toLocaleString()}</p>
                </div>
                
                <PDFExportButton
                  data={sampleCombinedData}
                  reportType="combined"
                  variant="default"
                  size="default"
                  options={{
                    includeCharts: true,
                    includeCOLAProjections: true,
                    includeScenarioComparison: true
                  }}
                />
              </CardContent>
            </Card>
          </div>

          {/* Test Instructions */}
          <Card className="bg-amber-50 border-amber-200">
            <CardHeader>
              <CardTitle className="text-amber-800">Testing Instructions</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-amber-700">
              <ol className="list-decimal list-inside space-y-2">
                <li>Ensure you have a premium subscription or are logged in as a premium user</li>
                <li>Click either PDF export button above to test generation</li>
                <li>Verify the PDF downloads automatically with the correct filename</li>
                <li>Check that all data appears correctly in the generated PDF</li>
                <li>Confirm professional formatting and Mass Pension branding</li>
                <li>Test with both server-side and client-side generation</li>
              </ol>
              
              <div className="mt-4 p-3 bg-amber-100 rounded">
                <p className="font-medium">Expected Behavior:</p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>Premium users: PDF generates and downloads</li>
                  <li>Free users: Upgrade prompt appears</li>
                  <li>Generation time: Under 2 seconds</li>
                  <li>File naming: MA_Pension_Report_[User]_[Date].pdf</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  )
}
