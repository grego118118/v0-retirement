"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Settings, Target, TrendingUp, Calculator } from "lucide-react"

interface PreferencesData {
  riskTolerance: 'conservative' | 'moderate' | 'aggressive'
  inflationScenario: 'conservative' | 'moderate' | 'optimistic'
  includeTaxOptimization: boolean
  includeMonteCarloAnalysis: boolean
  retirementIncomeGoal: number
}

interface PreferencesStepProps {
  data: PreferencesData
  onComplete: (data: { preferences: PreferencesData }) => void
}

export function PreferencesStep({ data, onComplete }: PreferencesStepProps) {
  const [formData, setFormData] = useState<PreferencesData>(data)

  useEffect(() => {
    onComplete({ preferences: formData })
  }, [formData.riskTolerance, formData.inflationScenario, formData.includeTaxOptimization, formData.includeMonteCarloAnalysis, formData.retirementIncomeGoal])

  const handleInputChange = (field: keyof PreferencesData, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: typeof value === 'string' ? (isNaN(Number(value)) ? value : Number(value)) : value
    }))
  }

  const getRiskToleranceDescription = (risk: string): string => {
    switch (risk) {
      case 'conservative': return 'Prioritize capital preservation and steady income'
      case 'moderate': return 'Balance growth potential with reasonable risk'
      case 'aggressive': return 'Maximize growth potential, accept higher volatility'
      default: return ''
    }
  }

  const getInflationDescription = (scenario: string): string => {
    switch (scenario) {
      case 'conservative': return '2.0% annual inflation (lower estimates)'
      case 'moderate': return '2.5% annual inflation (historical average)'
      case 'optimistic': return '3.0% annual inflation (higher estimates)'
      default: return ''
    }
  }

  return (
    <div className="space-y-6">
      <Alert>
        <Settings className="h-4 w-4" />
        <AlertDescription>
          Set your preferences for the retirement analysis. These settings will influence our optimization recommendations.
        </AlertDescription>
      </Alert>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-green-600" />
              Retirement Goals
            </CardTitle>
            <CardDescription>Your target income and risk preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="retirementIncomeGoal">Monthly Retirement Income Goal</Label>
              <Input
                id="retirementIncomeGoal"
                type="number"
                placeholder="e.g., 6000"
                value={formData.retirementIncomeGoal || ''}
                onChange={(e) => handleInputChange('retirementIncomeGoal', e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                Your target monthly income in retirement (including all sources)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="riskTolerance">Risk Tolerance</Label>
              <Select
                value={formData.riskTolerance}
                onValueChange={(value: 'conservative' | 'moderate' | 'aggressive') => 
                  handleInputChange('riskTolerance', value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="conservative">Conservative</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="aggressive">Aggressive</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                {getRiskToleranceDescription(formData.riskTolerance)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Analysis Preferences
            </CardTitle>
            <CardDescription>Customize your retirement analysis</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="inflationScenario">Inflation Scenario</Label>
              <Select
                value={formData.inflationScenario}
                onValueChange={(value: 'conservative' | 'moderate' | 'optimistic') => 
                  handleInputChange('inflationScenario', value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="conservative">Conservative (2.0%)</SelectItem>
                  <SelectItem value="moderate">Moderate (2.5%)</SelectItem>
                  <SelectItem value="optimistic">Higher Inflation (3.0%)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                {getInflationDescription(formData.inflationScenario)}
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="includeTaxOptimization"
                  checked={formData.includeTaxOptimization}
                  onCheckedChange={(checked) => handleInputChange('includeTaxOptimization', checked as boolean)}
                />
                <Label htmlFor="includeTaxOptimization">Include tax optimization analysis</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="includeMonteCarloAnalysis"
                  checked={formData.includeMonteCarloAnalysis}
                  onCheckedChange={(checked) => handleInputChange('includeMonteCarloAnalysis', checked as boolean)}
                />
                <Label htmlFor="includeMonteCarloAnalysis">Include Monte Carlo simulation</Label>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analysis Preview */}
      <Card className="border-purple-200 bg-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-purple-600" />
            Analysis Preview
          </CardTitle>
          <CardDescription>What will be included in your retirement analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Included Analysis:</h4>
              <ul className="text-sm space-y-1">
                <li>✓ Optimal claiming age recommendations</li>
                <li>✓ Break-even analysis</li>
                <li>✓ Lifetime benefit projections</li>
                <li>✓ Inflation-adjusted benefits</li>
                <li>✓ Medicare premium impact</li>
                {formData.includeTaxOptimization && <li>✓ Tax optimization strategies</li>}
                {formData.includeMonteCarloAnalysis && <li>✓ Monte Carlo risk analysis</li>}
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Your Settings:</h4>
              <ul className="text-sm space-y-1">
                <li>Risk Tolerance: {formData.riskTolerance}</li>
                <li>Inflation: {formData.inflationScenario} scenario</li>
                {formData.retirementIncomeGoal > 0 && (
                  <li>Income Goal: ${formData.retirementIncomeGoal.toLocaleString()}/month</li>
                )}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-6">
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Preferences Set - Ready for Analysis
          </Badge>
        </CardContent>
      </Card>
    </div>
  )
}
