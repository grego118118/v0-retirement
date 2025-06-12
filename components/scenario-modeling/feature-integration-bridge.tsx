"use client"

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Calculator, 
  TrendingUp, 
  BarChart3, 
  ArrowRight,
  ExternalLink,
  Zap,
  Target,
  Info
} from 'lucide-react'
import { RetirementScenario } from '@/lib/scenario-modeling/scenario-types'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'

interface FeatureIntegrationBridgeProps {
  scenario?: RetirementScenario
  onNavigateToCalculator?: (scenarioData: any) => void
  onNavigateToSocialSecurity?: (scenarioData: any) => void
  onNavigateToTaxCalculator?: (scenarioData: any) => void
  className?: string
}

export function FeatureIntegrationBridge({
  scenario,
  onNavigateToCalculator,
  onNavigateToSocialSecurity,
  onNavigateToTaxCalculator,
  className
}: FeatureIntegrationBridgeProps) {
  
  const handleCalculatorIntegration = () => {
    if (!scenario) return
    
    const calculatorData = {
      serviceEntryDate: scenario.pensionParameters.yearsOfService > 20 ? "BEFORE_APRIL_2_2012" : "AFTER_APRIL_2_2012",
      age: scenario.personalParameters.retirementAge.toString(),
      yearsOfService: scenario.pensionParameters.yearsOfService.toString(),
      group: `GROUP_${scenario.pensionParameters.retirementGroup}`,
      salary1: scenario.pensionParameters.averageSalary.toString(),
      salary2: scenario.pensionParameters.averageSalary.toString(),
      salary3: scenario.pensionParameters.averageSalary.toString(),
      retirementOption: scenario.pensionParameters.retirementOption,
      beneficiaryAge: scenario.pensionParameters.beneficiaryAge?.toString() || "",
      currentAge: scenario.personalParameters.currentAge.toString(),
      membershipDate: new Date().toISOString().split('T')[0], // Default to today
      additionalService: ""
    }
    
    // Store data in sessionStorage for calculator to pick up
    sessionStorage.setItem('scenario-calculator-data', JSON.stringify(calculatorData))
    
    onNavigateToCalculator?.(calculatorData)
  }

  const handleSocialSecurityIntegration = () => {
    if (!scenario) return
    
    const ssData = {
      claimingAge: scenario.socialSecurityParameters.claimingAge,
      fullRetirementAge: scenario.socialSecurityParameters.fullRetirementAge,
      estimatedBenefit: scenario.socialSecurityParameters.estimatedBenefit,
      spousalBenefit: scenario.socialSecurityParameters.spousalBenefit,
      currentAge: scenario.personalParameters.currentAge,
      retirementAge: scenario.personalParameters.retirementAge
    }
    
    sessionStorage.setItem('scenario-ss-data', JSON.stringify(ssData))
    
    onNavigateToSocialSecurity?.(ssData)
  }

  const handleTaxCalculatorIntegration = () => {
    if (!scenario) return
    
    const taxData = {
      pensionIncome: scenario.results?.pensionResults.annualBenefit || 0,
      socialSecurityIncome: scenario.results?.socialSecurityResults.annualBenefit || 0,
      otherIncome: scenario.financialParameters.otherRetirementIncome,
      filingStatus: scenario.taxParameters.filingStatus,
      stateOfResidence: scenario.taxParameters.stateOfResidence,
      retirementAge: scenario.personalParameters.retirementAge
    }
    
    sessionStorage.setItem('scenario-tax-data', JSON.stringify(taxData))
    
    onNavigateToTaxCalculator?.(taxData)
  }

  if (!scenario) {
    return (
      <Card className={className}>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Target className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Scenario Selected
          </h3>
          <p className="text-gray-600 text-center">
            Select a scenario to see integration options with other retirement planning tools.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
          <Zap className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Feature Integration</h3>
          <p className="text-sm text-gray-600">
            Use scenario data with other retirement planning tools
          </p>
        </div>
      </div>

      {/* Scenario Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="h-4 w-4" />
            {scenario.name}
            {scenario.isBaseline && (
              <Badge variant="secondary" className="text-xs">Baseline</Badge>
            )}
          </CardTitle>
          {scenario.description && (
            <CardDescription className="text-sm">
              {scenario.description}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600">Retirement Age</p>
              <p className="font-semibold">{scenario.personalParameters.retirementAge}</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600">Years of Service</p>
              <p className="font-semibold">{scenario.pensionParameters.yearsOfService}</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600">SS Claiming Age</p>
              <p className="font-semibold">{scenario.socialSecurityParameters.claimingAge}</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600">Risk Tolerance</p>
              <p className="font-semibold capitalize">{scenario.financialParameters.riskTolerance}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Integration Options */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Pension Calculator Integration */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Calculator className="h-4 w-4 text-blue-600" />
              Pension Calculator
            </CardTitle>
            <CardDescription className="text-xs">
              Refine pension calculations with scenario parameters
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              <div className="text-sm">
                <p className="text-gray-600">Will pre-fill:</p>
                <ul className="text-xs text-gray-500 mt-1 space-y-1">
                  <li>• Retirement age: {scenario.personalParameters.retirementAge}</li>
                  <li>• Years of service: {scenario.pensionParameters.yearsOfService}</li>
                  <li>• Average salary: {formatCurrency(scenario.pensionParameters.averageSalary)}</li>
                  <li>• Retirement option: {scenario.pensionParameters.retirementOption}</li>
                </ul>
              </div>
              
              <Link href="/calculator">
                <Button 
                  size="sm" 
                  className="w-full"
                  onClick={handleCalculatorIntegration}
                >
                  Open Calculator
                  <ExternalLink className="h-3 w-3 ml-2" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Social Security Integration */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              Social Security
            </CardTitle>
            <CardDescription className="text-xs">
              Optimize Social Security claiming strategy
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              <div className="text-sm">
                <p className="text-gray-600">Will pre-fill:</p>
                <ul className="text-xs text-gray-500 mt-1 space-y-1">
                  <li>• Claiming age: {scenario.socialSecurityParameters.claimingAge}</li>
                  <li>• Current age: {scenario.personalParameters.currentAge}</li>
                  <li>• Estimated benefit: {formatCurrency(scenario.socialSecurityParameters.estimatedBenefit)}</li>
                  <li>• Retirement timeline</li>
                </ul>
              </div>
              
              <Link href="/social-security">
                <Button 
                  size="sm" 
                  variant="outline"
                  className="w-full"
                  onClick={handleSocialSecurityIntegration}
                >
                  Optimize SS
                  <ExternalLink className="h-3 w-3 ml-2" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Tax Calculator Integration */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-purple-600" />
              Tax Calculator
            </CardTitle>
            <CardDescription className="text-xs">
              Analyze tax implications of retirement income
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              <div className="text-sm">
                <p className="text-gray-600">Will pre-fill:</p>
                <ul className="text-xs text-gray-500 mt-1 space-y-1">
                  <li>• Pension income: {scenario.results ? formatCurrency(scenario.results.pensionResults.annualBenefit) : 'TBD'}</li>
                  <li>• SS income: {scenario.results ? formatCurrency(scenario.results.socialSecurityResults.annualBenefit) : 'TBD'}</li>
                  <li>• Filing status: {scenario.taxParameters.filingStatus.replace('_', ' ')}</li>
                  <li>• State: {scenario.taxParameters.stateOfResidence}</li>
                </ul>
              </div>
              
              <Link href="/tax-calculator">
                <Button 
                  size="sm" 
                  variant="outline"
                  className="w-full"
                  onClick={handleTaxCalculatorIntegration}
                >
                  Calculate Taxes
                  <ExternalLink className="h-3 w-3 ml-2" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Results Summary */}
      {scenario.results && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Scenario Results Summary
            </CardTitle>
            <CardDescription>
              Key metrics from this scenario's calculations
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Monthly Income</p>
                <p className="text-lg font-bold text-green-600">
                  {formatCurrency(scenario.results.totalMonthlyIncome)}
                </p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Replacement Ratio</p>
                <p className="text-lg font-bold text-blue-600">
                  {(scenario.results.replacementRatio * 100).toFixed(1)}%
                </p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Risk Score</p>
                <p className="text-lg font-bold text-orange-600">
                  {scenario.results.riskScore.toFixed(1)}/10
                </p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Optimization Score</p>
                <p className="text-lg font-bold text-purple-600">
                  {scenario.results.optimizationScore.toFixed(1)}/10
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Integration Tips */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Pro Tip:</strong> Use these integrations to refine your scenario parameters. 
          Changes made in other calculators can be brought back to update your scenario for more accurate projections.
        </AlertDescription>
      </Alert>
    </div>
  )
}
