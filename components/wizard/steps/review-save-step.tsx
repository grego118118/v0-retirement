"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  FileText, 
  Save, 
  CheckCircle, 
  DollarSign, 
  Calendar, 
  TrendingUp,
  Shield,
  Building,
  Download
} from "lucide-react"
import { CombinedCalculationData, OptimizationResult } from "@/lib/wizard/wizard-types"

interface ReviewSaveStepProps {
  data: CombinedCalculationData
  results: OptimizationResult | null
  onComplete: () => void
  isSaving: boolean
}

export function ReviewSaveStep({ data, results, onComplete, isSaving }: ReviewSaveStepProps) {
  const [calculationName, setCalculationName] = useState(
    `Combined Analysis - ${new Date().toLocaleDateString()}`
  )
  const [notes, setNotes] = useState('')

  const handleSave = () => {
    onComplete()
  }

  const generatePDFReport = () => {
    // This would generate a PDF report of the analysis
    console.log('Generating PDF report...')
  }

  return (
    <div className="space-y-6">
      <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertDescription>
          Review your complete retirement analysis below. You can save this calculation and generate a detailed report.
        </AlertDescription>
      </Alert>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Building className="h-5 w-5 text-blue-600" />
              <span className="font-medium">Pension</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">
              ${Math.round(data.pensionData.monthlyBenefit).toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">
              Monthly at age {data.personalInfo.retirementGoalAge}
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-5 w-5 text-green-600" />
              <span className="font-medium">Social Security</span>
            </div>
            <div className="text-2xl font-bold text-green-600">
              ${Math.round(data.socialSecurityData.selectedMonthlyBenefit).toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">
              Monthly at age {data.socialSecurityData.selectedClaimingAge}
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-5 w-5 text-purple-600" />
              <span className="font-medium">Total Income</span>
            </div>
            <div className="text-2xl font-bold text-purple-600">
              ${Math.round(data.pensionData.monthlyBenefit + data.socialSecurityData.selectedMonthlyBenefit).toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">
              Combined monthly income
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Review */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Personal & Pension Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Personal & Pension Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium">Personal Information</h4>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span>Current Age:</span>
                  <span>{data.personalInfo.currentAge}</span>
                </div>
                <div className="flex justify-between">
                  <span>Retirement Age:</span>
                  <span>{data.personalInfo.retirementGoalAge}</span>
                </div>
                <div className="flex justify-between">
                  <span>Filing Status:</span>
                  <span className="capitalize">{data.personalInfo.filingStatus}</span>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <h4 className="font-medium">Pension Details</h4>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span>Years of Service:</span>
                  <span>{data.pensionData.yearsOfService}</span>
                </div>
                <div className="flex justify-between">
                  <span>Average Salary:</span>
                  <span>${data.pensionData.averageSalary.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Retirement Group:</span>
                  <span>Group {data.pensionData.retirementGroup}</span>
                </div>
                <div className="flex justify-between">
                  <span>Benefit Option:</span>
                  <span>Option {data.pensionData.retirementOption}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Social Security & Optimization */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Social Security & Optimization
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium">Social Security Strategy</h4>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span>Full Retirement Age:</span>
                  <span>{data.socialSecurityData.fullRetirementAge}</span>
                </div>
                <div className="flex justify-between">
                  <span>Claiming Age:</span>
                  <span>{data.socialSecurityData.selectedClaimingAge}</span>
                </div>
                <div className="flex justify-between">
                  <span>Monthly Benefit:</span>
                  <span>${data.socialSecurityData.selectedMonthlyBenefit.toLocaleString()}</span>
                </div>
                {data.socialSecurityData.isMarried && (
                  <div className="flex justify-between">
                    <span>Spousal Benefits:</span>
                    <span>Included</span>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {results && (
              <div className="space-y-2">
                <h4 className="font-medium">Optimization Results</h4>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span>Recommended Pension Age:</span>
                    <span>{results.recommendedStrategy.pensionClaimingAge}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Recommended SS Age:</span>
                    <span>{results.recommendedStrategy.socialSecurityClaimingAge}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Lifetime Benefits:</span>
                    <span>${Math.round(results.recommendedStrategy.totalLifetimeBenefits).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Net Monthly Income:</span>
                    <span>${Math.round(results.recommendedStrategy.netAfterTaxIncome).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Goal Achievement */}
      {data.preferences.retirementIncomeGoal > 0 && (
        <Card className={`border-2 ${
          (data.pensionData.monthlyBenefit + data.socialSecurityData.selectedMonthlyBenefit) >= data.preferences.retirementIncomeGoal
            ? 'border-green-200 bg-green-50' : 'border-orange-200 bg-orange-50'
        }`}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Retirement Income Goal</h4>
                <p className="text-sm text-muted-foreground">
                  Target: ${data.preferences.retirementIncomeGoal.toLocaleString()}/month
                </p>
              </div>
              <div className="text-right">
                <div className={`text-2xl font-bold ${
                  (data.pensionData.monthlyBenefit + data.socialSecurityData.selectedMonthlyBenefit) >= data.preferences.retirementIncomeGoal
                    ? 'text-green-600' : 'text-orange-600'
                }`}>
                  {(data.pensionData.monthlyBenefit + data.socialSecurityData.selectedMonthlyBenefit) >= data.preferences.retirementIncomeGoal
                    ? '✓ Goal Achieved' : '⚠ Below Goal'
                  }
                </div>
                <div className="text-sm text-muted-foreground">
                  Current: ${Math.round(data.pensionData.monthlyBenefit + data.socialSecurityData.selectedMonthlyBenefit).toLocaleString()}/month
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Save Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Save className="h-5 w-5 text-blue-600" />
            Save Your Analysis
          </CardTitle>
          <CardDescription>
            Save this calculation to your dashboard and generate reports
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="calculationName">Calculation Name</Label>
            <Input
              id="calculationName"
              value={calculationName}
              onChange={(e) => setCalculationName(e.target.value)}
              placeholder="e.g., My Retirement Plan 2024"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about this analysis..."
              rows={3}
            />
          </div>

          <div className="flex gap-4">
            <Button
              onClick={handleSave}
              disabled={isSaving || !calculationName.trim()}
              className="flex-1"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Analysis
                </>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={generatePDFReport}
              disabled={isSaving}
            >
              <Download className="mr-2 h-4 w-4" />
              Generate PDF
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Features Summary */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle>Analysis Features Included</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Calculations Performed:</h4>
              <ul className="text-sm space-y-1">
                <li>✓ Pension benefit optimization</li>
                <li>✓ Social Security claiming strategy</li>
                <li>✓ Combined income analysis</li>
                <li>✓ Break-even calculations</li>
                <li>✓ Inflation adjustments (COLA)</li>
                <li>✓ Medicare premium impact</li>
                {data.socialSecurityData.isMarried && <li>✓ Spousal benefits optimization</li>}
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Advanced Features:</h4>
              <ul className="text-sm space-y-1">
                {data.preferences.includeTaxOptimization && <li>✓ Tax optimization strategies</li>}
                {data.preferences.includeMonteCarloAnalysis && <li>✓ Monte Carlo risk analysis</li>}
                <li>✓ Lifetime benefit projections</li>
                <li>✓ Multiple scenario comparisons</li>
                <li>✓ Replacement ratio analysis</li>
                <li>✓ Comprehensive reporting</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
