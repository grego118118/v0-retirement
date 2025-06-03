/**
 * Interactive Tax Planning Component
 * Provides real-time tax calculations and optimization strategies
 */

"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Calculator, 
  DollarSign, 
  TrendingDown, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Info
} from "lucide-react"
import { calculateTaxImplications, TaxCalculationInput } from "@/lib/tax/tax-calculator"
import { formatCurrency } from "@/lib/utils"

interface InteractiveTaxPlannerProps {
  initialData?: Partial<TaxCalculationInput>
  onTaxCalculationChange?: (result: any) => void
}

export function InteractiveTaxPlanner({ 
  initialData, 
  onTaxCalculationChange 
}: InteractiveTaxPlannerProps) {
  const [taxInput, setTaxInput] = useState<TaxCalculationInput>({
    pensionIncome: initialData?.pensionIncome || 48000,
    socialSecurityIncome: initialData?.socialSecurityIncome || 28800,
    otherRetirementIncome: initialData?.otherRetirementIncome || 12000,
    filingStatus: initialData?.filingStatus || 'single',
    age: initialData?.age || 65,
    spouseAge: initialData?.spouseAge,
    state: 'MA'
  })

  const [showOptimizations, setShowOptimizations] = useState(false)
  const [selectedOptimization, setSelectedOptimization] = useState<string>()

  // Calculate tax implications in real-time
  const taxResult = useMemo(() => {
    try {
      return calculateTaxImplications(taxInput)
    } catch (error) {
      console.error('Tax calculation error:', error)
      return null
    }
  }, [taxInput])

  // Notify parent component of changes
  useEffect(() => {
    if (taxResult && onTaxCalculationChange) {
      onTaxCalculationChange(taxResult)
    }
  }, [taxResult, onTaxCalculationChange])

  const handleInputChange = (field: keyof TaxCalculationInput, value: any) => {
    setTaxInput(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const getTaxEfficiencyRating = (effectiveRate: number) => {
    if (effectiveRate < 10) return { rating: 'Excellent', color: 'text-green-600', icon: CheckCircle }
    if (effectiveRate < 15) return { rating: 'Good', color: 'text-blue-600', icon: Info }
    if (effectiveRate < 20) return { rating: 'Fair', color: 'text-yellow-600', icon: AlertTriangle }
    return { rating: 'Needs Optimization', color: 'text-red-600', icon: AlertTriangle }
  }

  if (!taxResult) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Calculating taxes...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  const efficiencyRating = getTaxEfficiencyRating(taxResult.effectiveTaxRate)
  const Icon = efficiencyRating.icon

  return (
    <div className="space-y-6">
      {/* Tax Input Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Tax Planning Calculator
          </CardTitle>
          <CardDescription>
            Adjust your retirement income sources to see real-time tax implications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="pensionIncome">Annual Pension Income</Label>
                <Input
                  id="pensionIncome"
                  type="number"
                  value={taxInput.pensionIncome}
                  onChange={(e) => handleInputChange('pensionIncome', Number(e.target.value))}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="socialSecurityIncome">Annual Social Security Income</Label>
                <Input
                  id="socialSecurityIncome"
                  type="number"
                  value={taxInput.socialSecurityIncome}
                  onChange={(e) => handleInputChange('socialSecurityIncome', Number(e.target.value))}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="otherRetirementIncome">Other Retirement Income</Label>
                <Input
                  id="otherRetirementIncome"
                  type="number"
                  value={taxInput.otherRetirementIncome}
                  onChange={(e) => handleInputChange('otherRetirementIncome', Number(e.target.value))}
                  className="mt-1"
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="filingStatus">Filing Status</Label>
                <Select 
                  value={taxInput.filingStatus} 
                  onValueChange={(value) => handleInputChange('filingStatus', value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Single</SelectItem>
                    <SelectItem value="marriedJoint">Married Filing Jointly</SelectItem>
                    <SelectItem value="marriedSeparate">Married Filing Separately</SelectItem>
                    <SelectItem value="headOfHousehold">Head of Household</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="age">Your Age</Label>
                <Slider
                  value={[taxInput.age]}
                  onValueChange={(value) => handleInputChange('age', value[0])}
                  min={50}
                  max={85}
                  step={1}
                  className="mt-2"
                />
                <div className="text-sm text-muted-foreground mt-1">
                  Age: {taxInput.age}
                </div>
              </div>
              
              {(taxInput.filingStatus === 'marriedJoint' || taxInput.filingStatus === 'marriedSeparate') && (
                <div>
                  <Label htmlFor="spouseAge">Spouse Age</Label>
                  <Slider
                    value={[taxInput.spouseAge || 65]}
                    onValueChange={(value) => handleInputChange('spouseAge', value[0])}
                    min={50}
                    max={85}
                    step={1}
                    className="mt-2"
                  />
                  <div className="text-sm text-muted-foreground mt-1">
                    Spouse Age: {taxInput.spouseAge || 65}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tax Results Dashboard */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Gross Income</p>
                <p className="text-2xl font-bold">{formatCurrency(taxResult.grossIncome)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Tax</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(taxResult.totalTax)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Net Income</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(taxResult.netIncome)}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tax Efficiency Rating */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Icon className={`h-5 w-5 ${efficiencyRating.color}`} />
              <span className="font-medium">Tax Efficiency Rating</span>
            </div>
            <Badge variant={efficiencyRating.rating === 'Excellent' ? 'default' : 'secondary'}>
              {efficiencyRating.rating}
            </Badge>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Effective Tax Rate</span>
              <span className={efficiencyRating.color}>{taxResult.effectiveTaxRate.toFixed(1)}%</span>
            </div>
            <Progress value={taxResult.effectiveTaxRate} className="h-2" />
          </div>
          
          <div className="mt-4 text-sm text-muted-foreground">
            Your effective tax rate is {taxResult.effectiveTaxRate.toFixed(1)}%. 
            {taxResult.effectiveTaxRate > 15 && " Consider tax optimization strategies below."}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Tax Breakdown */}
      <Tabs defaultValue="breakdown" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="breakdown">Tax Breakdown</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
          <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
        </TabsList>
        
        <TabsContent value="breakdown" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Detailed Tax Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Federal Taxes</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Taxable Income:</span>
                        <span>{formatCurrency(taxResult.taxableIncome)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Federal Tax:</span>
                        <span className="text-red-600">{formatCurrency(taxResult.federalTax)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Marginal Rate:</span>
                        <span>{taxResult.marginalTaxRate}%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-3">Massachusetts State</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>State Tax:</span>
                        <span className="text-red-600">{formatCurrency(taxResult.stateTax)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>SS Taxable:</span>
                        <span>{formatCurrency(taxResult.socialSecurityTaxable)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>SS Taxable %:</span>
                        <span>{taxResult.socialSecurityTaxablePercentage}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="optimization" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tax Optimization Strategies</CardTitle>
              <CardDescription>
                Personalized recommendations to reduce your tax burden
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {taxResult.recommendations.map((rec, index) => (
                  <Alert key={index}>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="font-medium">{rec.title}</div>
                      <div className="text-sm mt-1">{rec.description}</div>
                      {rec.potentialSavings > 0 && (
                        <div className="text-sm text-green-600 mt-1">
                          Potential savings: {formatCurrency(rec.potentialSavings)}
                        </div>
                      )}
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="scenarios" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tax Scenarios</CardTitle>
              <CardDescription>
                Compare different income distribution strategies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Scenario comparison coming soon...</p>
                <p className="text-sm">Compare different withdrawal strategies and timing</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
