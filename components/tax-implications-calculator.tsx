"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Calculator, DollarSign, TrendingDown, TrendingUp, Info, FileText } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { 
  calculateRetirementTaxes, 
  calculateSocialSecurityTax,
  FEDERAL_TAX_BRACKETS_2024,
  STANDARD_DEDUCTIONS_2024,
  MA_TAX_RATE,
  type TaxCalculationResult 
} from "@/lib/tax-calculations"

interface TaxCalculatorProps {
  initialPensionIncome?: number;
  initialSocialSecurity?: number;
  className?: string;
}

export function TaxImplicationsCalculator({ 
  initialPensionIncome = 0, 
  initialSocialSecurity = 0,
  className = ""
}: TaxCalculatorProps) {
  const [formData, setFormData] = useState({
    pensionIncome: initialPensionIncome.toString(),
    socialSecurityBenefit: initialSocialSecurity.toString(),
    otherIncome: "",
    filingStatus: "single" as keyof typeof FEDERAL_TAX_BRACKETS_2024,
    age65OrOlder: false
  })

  const [results, setResults] = useState<TaxCalculationResult | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)

  // Auto-calculate when inputs change
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.pensionIncome || formData.socialSecurityBenefit || formData.otherIncome) {
        calculateTaxes()
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [formData])

  const calculateTaxes = async () => {
    setIsCalculating(true)
    
    try {
      const pensionIncome = parseFloat(formData.pensionIncome) || 0
      const socialSecurityBenefit = parseFloat(formData.socialSecurityBenefit) || 0
      const otherIncome = parseFloat(formData.otherIncome) || 0

      const taxResults = calculateRetirementTaxes(
        pensionIncome,
        socialSecurityBenefit,
        otherIncome,
        formData.filingStatus,
        formData.age65OrOlder
      )

      setResults(taxResults)
    } catch (error) {
      console.error('Tax calculation error:', error)
    } finally {
      setIsCalculating(false)
    }
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatPercentage = (rate: number) => {
    return `${(rate * 100).toFixed(1)}%`
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          Tax Implications Calculator
        </h2>
        <p className="text-muted-foreground">
          Calculate federal and Massachusetts state taxes on your retirement income
        </p>
      </div>

      {/* Input Form */}
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-900/20">
          <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
            <Calculator className="h-5 w-5" />
            Income Information
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Pension Income */}
            <div className="space-y-2">
              <Label htmlFor="pensionIncome">Annual Pension Income ($)</Label>
              <Input
                id="pensionIncome"
                type="number"
                placeholder="e.g., 60000"
                value={formData.pensionIncome}
                onChange={(e) => handleInputChange('pensionIncome', e.target.value)}
              />
            </div>

            {/* Social Security */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="socialSecurityBenefit">Annual Social Security ($)</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Social Security may be partially taxable based on your total income</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Input
                id="socialSecurityBenefit"
                type="number"
                placeholder="e.g., 25000"
                value={formData.socialSecurityBenefit}
                onChange={(e) => handleInputChange('socialSecurityBenefit', e.target.value)}
              />
            </div>

            {/* Other Income */}
            <div className="space-y-2">
              <Label htmlFor="otherIncome">Other Annual Income ($)</Label>
              <Input
                id="otherIncome"
                type="number"
                placeholder="e.g., 10000"
                value={formData.otherIncome}
                onChange={(e) => handleInputChange('otherIncome', e.target.value)}
              />
            </div>

            {/* Filing Status */}
            <div className="space-y-2">
              <Label htmlFor="filingStatus">Filing Status</Label>
              <Select
                value={formData.filingStatus}
                onValueChange={(value) => handleInputChange('filingStatus', value)}
              >
                <SelectTrigger id="filingStatus">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">Single</SelectItem>
                  <SelectItem value="marriedFilingJointly">Married Filing Jointly</SelectItem>
                  <SelectItem value="marriedFilingSeparately">Married Filing Separately</SelectItem>
                  <SelectItem value="headOfHousehold">Head of Household</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Age 65+ */}
            <div className="space-y-2">
              <Label>Age Status</Label>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="age65OrOlder"
                  checked={formData.age65OrOlder}
                  onChange={(e) => handleInputChange('age65OrOlder', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="age65OrOlder" className="text-sm">
                  Age 65 or older (additional exemption)
                </Label>
              </div>
            </div>

            {/* Calculate Button */}
            <div className="flex items-end">
              <Button
                onClick={calculateTaxes}
                className="w-full"
                disabled={isCalculating}
              >
                {isCalculating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                    Calculating...
                  </>
                ) : (
                  <>
                    <Calculator className="h-4 w-4 mr-2" />
                    Calculate Taxes
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {results && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-700 dark:text-green-300">Gross Income</p>
                    <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                      {formatCurrency(results.grossIncome)}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/20 dark:to-rose-900/20 border-red-200 dark:border-red-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-red-700 dark:text-red-300">Total Taxes</p>
                    <p className="text-2xl font-bold text-red-900 dark:text-red-100">
                      {formatCurrency(results.totalTax)}
                    </p>
                  </div>
                  <TrendingDown className="h-8 w-8 text-red-600 dark:text-red-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-700 dark:text-blue-300">Net Income</p>
                    <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                      {formatCurrency(results.netIncome)}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-900/20 border-purple-200 dark:border-purple-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-700 dark:text-purple-300">Effective Rate</p>
                    <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                      {formatPercentage(results.effectiveRate)}
                    </p>
                  </div>
                  <FileText className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Breakdown */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Tax Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="summary" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="summary">Summary</TabsTrigger>
                  <TabsTrigger value="federal">Federal Details</TabsTrigger>
                  <TabsTrigger value="state">Massachusetts Details</TabsTrigger>
                </TabsList>

                <TabsContent value="summary" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-semibold">Tax Summary</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Federal Tax:</span>
                          <span className="font-medium">{formatCurrency(results.federalTax)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Massachusetts Tax:</span>
                          <span className="font-medium">{formatCurrency(results.stateTax)}</span>
                        </div>
                        <div className="flex justify-between border-t pt-2">
                          <span className="font-semibold">Total Tax:</span>
                          <span className="font-bold">{formatCurrency(results.totalTax)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-semibold">Tax Rates</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Effective Rate:</span>
                          <Badge variant="secondary">{formatPercentage(results.effectiveRate)}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Marginal Rate:</span>
                          <Badge variant="outline">{formatPercentage(results.marginalRate)}</Badge>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Tax Burden</span>
                          <span>{formatPercentage(results.effectiveRate)}</span>
                        </div>
                        <Progress value={results.effectiveRate * 100} className="h-2" />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="federal" className="space-y-4">
                  <div className="space-y-4">
                    <h4 className="font-semibold">Federal Tax Calculation</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Standard Deduction ({formData.filingStatus}):</span>
                        <span>{formatCurrency(STANDARD_DEDUCTIONS_2024[formData.filingStatus])}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Effective Rate:</span>
                        <span>{formatPercentage(results.breakdown.federal.effectiveRate)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Marginal Rate:</span>
                        <span>{formatPercentage(results.breakdown.federal.marginalRate)}</span>
                      </div>
                    </div>

                    {results.breakdown.federal.brackets.length > 0 && (
                      <div className="space-y-2">
                        <h5 className="font-medium">Tax Brackets Applied:</h5>
                        {results.breakdown.federal.brackets.map((bracket, index) => (
                          <div key={index} className="flex justify-between text-sm bg-muted/50 p-2 rounded">
                            <span>{formatPercentage(bracket.rate)} on {formatCurrency(bracket.income)}</span>
                            <span>{formatCurrency(bracket.tax)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="state" className="space-y-4">
                  <div className="space-y-4">
                    <h4 className="font-semibold">Massachusetts Tax Calculation</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Tax Rate:</span>
                        <span>{formatPercentage(MA_TAX_RATE)} (flat rate)</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Personal Exemption:</span>
                        <span>$4,400 {formData.age65OrOlder ? '+ $700 (age 65+)' : ''}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Social Security:</span>
                        <span>Not taxable in MA</span>
                      </div>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
                      <h5 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Massachusetts Tax Benefits</h5>
                      <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                        <li>• Social Security benefits are not taxed</li>
                        <li>• Government pensions may be exempt</li>
                        <li>• Additional exemption for age 65+</li>
                        <li>• Senior Circuit Breaker credit available</li>
                      </ul>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
