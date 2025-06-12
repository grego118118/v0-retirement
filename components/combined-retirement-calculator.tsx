"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Save, Crown, DollarSign, TrendingUp, Calculator, CheckCircle, Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useSubscriptionStatus } from "@/hooks/use-subscription"
import { useRetirementData } from "@/hooks/use-retirement-data"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import { formatCurrency } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { TaxImplicationsCalculator } from "@/components/tax-implications-calculator"

interface SocialSecurityData {
  fullRetirementAge: number
  earlyRetirementBenefit: number
  fullRetirementBenefit: number
  delayedRetirementBenefit: number
  selectedClaimingAge: number
  selectedMonthlyBenefit: number
}

interface CombinedCalculatorProps {
  pensionResult?: {
    monthlyPension: number
    annualPension: number
    retirementAge: number
    retirementOption: string
    details: any
  }
  formData?: any
}

export function CombinedRetirementCalculator({ pensionResult, formData }: CombinedCalculatorProps) {
  const { isPremium } = useSubscriptionStatus()
  const { saveCalculation } = useRetirementData()
  const { data: session } = useSession()
  
  const [socialSecurityData, setSocialSecurityData] = useState<SocialSecurityData>({
    fullRetirementAge: 67,
    earlyRetirementBenefit: 0,
    fullRetirementBenefit: 0,
    delayedRetirementBenefit: 0,
    selectedClaimingAge: 67,
    selectedMonthlyBenefit: 0,
  })
  
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [calculationName, setCalculationName] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [combinedResults, setCombinedResults] = useState<any>(null)

  // Calculate combined results when either pension or Social Security data changes
  useEffect(() => {
    if (pensionResult && socialSecurityData.selectedMonthlyBenefit > 0) {
      const pensionMonthly = pensionResult.monthlyPension
      const ssMonthly = socialSecurityData.selectedMonthlyBenefit
      const combinedMonthly = pensionMonthly + ssMonthly
      const combinedAnnual = combinedMonthly * 12
      
      // Calculate replacement ratio (assuming current salary from form data)
      const currentSalary = formData?.averageSalary || pensionResult.details?.averageSalary || 0
      const replacementRatio = currentSalary > 0 ? (combinedAnnual / currentSalary) : 0
      
      setCombinedResults({
        pensionMonthly,
        socialSecurityMonthly: ssMonthly,
        combinedMonthly,
        combinedAnnual,
        replacementRatio,
        currentSalary
      })
    }
  }, [pensionResult, socialSecurityData, formData])

  const handleSocialSecurityChange = (field: string, value: string) => {
    const numValue = parseFloat(value) || 0
    setSocialSecurityData(prev => {
      const updated = { ...prev, [field]: numValue }
      
      // Auto-select the monthly benefit based on claiming age
      if (field === 'selectedClaimingAge') {
        let selectedBenefit = 0
        if (numValue === 62) {
          selectedBenefit = updated.earlyRetirementBenefit
        } else if (numValue === updated.fullRetirementAge) {
          selectedBenefit = updated.fullRetirementBenefit
        } else if (numValue === 70) {
          selectedBenefit = updated.delayedRetirementBenefit
        } else {
          // Linear interpolation for ages between defined points
          if (numValue < updated.fullRetirementAge) {
            const ratio = (numValue - 62) / (updated.fullRetirementAge - 62)
            selectedBenefit = updated.earlyRetirementBenefit + 
              (updated.fullRetirementBenefit - updated.earlyRetirementBenefit) * ratio
          } else {
            const ratio = (numValue - updated.fullRetirementAge) / (70 - updated.fullRetirementAge)
            selectedBenefit = updated.fullRetirementBenefit + 
              (updated.delayedRetirementBenefit - updated.fullRetirementBenefit) * ratio
          }
        }
        updated.selectedMonthlyBenefit = Math.round(selectedBenefit)
      }
      
      return updated
    })
  }

  const saveCombinedCalculation = async () => {
    if (!session) {
      toast.error("Please sign in to save calculations")
      return
    }

    if (!pensionResult || !combinedResults) {
      toast.error("No calculation data to save")
      return
    }

    setIsSaving(true)
    try {
      const calcData = {
        calculationName: calculationName || `Combined Calculation ${new Date().toLocaleDateString()}`,
        retirementDate: new Date(
          new Date().getFullYear() + Math.max(0, pensionResult.retirementAge - new Date().getFullYear() + 20),
          0, 1
        ).toISOString(),
        retirementAge: pensionResult.retirementAge,
        yearsOfService: parseFloat(formData?.yearsOfService || "0"),
        averageSalary: pensionResult.details?.averageSalary || 0,
        retirementGroup: (formData?.group || "1").replace("GROUP_", ""),
        benefitPercentage: (pensionResult.details?.basePercentage || 0) / 100,
        retirementOption: pensionResult.retirementOption,
        monthlyBenefit: pensionResult.monthlyPension,
        annualBenefit: pensionResult.annualPension,
        benefitReduction: pensionResult.details?.cappedBase ? 
          (1 - (pensionResult.annualPension / pensionResult.details?.baseAnnualPension)) : undefined,
        survivorBenefit: pensionResult.details?.survivorAnnualPension || 0,
        notes: `Combined calculation with Social Security. SS claiming age: ${socialSecurityData.selectedClaimingAge}`,
        socialSecurityData: {
          fullRetirementAge: socialSecurityData.fullRetirementAge,
          earlyRetirementBenefit: socialSecurityData.earlyRetirementBenefit,
          fullRetirementBenefit: socialSecurityData.fullRetirementBenefit,
          delayedRetirementBenefit: socialSecurityData.delayedRetirementBenefit,
          selectedClaimingAge: socialSecurityData.selectedClaimingAge,
          selectedMonthlyBenefit: socialSecurityData.selectedMonthlyBenefit,
          combinedMonthlyIncome: combinedResults.combinedMonthly,
          replacementRatio: combinedResults.replacementRatio,
        }
      }

      console.log('Attempting to save combined calculation:', calcData)

      const success = await saveCalculation(calcData)
      if (success) {
        toast.success("Combined calculation saved successfully!")
        setShowSaveDialog(false)
        setCalculationName("")
        
        // Refresh the page to show updated data on dashboard
        window.location.reload()
      }
    } catch (error) {
      console.error("Error saving calculation:", error)
      toast.error("Failed to save calculation")
    } finally {
      setIsSaving(false)
    }
  }

  if (!isPremium) {
    return (
      <Card className="border-dashed border-2">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <Crown className="h-12 w-12 text-amber-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Premium Feature</h3>
            <p className="text-muted-foreground mb-4 max-w-md mx-auto">
              Upgrade to Premium to combine your Massachusetts pension with Social Security benefits for comprehensive retirement planning.
            </p>
            <Button>
              <Crown className="mr-2 h-4 w-4" />
              Upgrade to Premium
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-500" />
            <CardTitle>Combined Retirement Income Calculator</CardTitle>
            <Badge className="bg-amber-100 text-amber-800">
              <Crown className="mr-1 h-3 w-3" />
              Premium
            </Badge>
          </div>
          <CardDescription>
            Add your Social Security benefits to see your complete retirement income picture
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs defaultValue="social-security" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="social-security">Social Security Setup</TabsTrigger>
              <TabsTrigger value="combined-results">Combined Results</TabsTrigger>
              <TabsTrigger value="tax-implications">Tax Implications</TabsTrigger>
            </TabsList>
            
            <TabsContent value="social-security" className="space-y-4">
              <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800 dark:text-blue-200">
                  <strong>Get Official Estimates:</strong> Visit{" "}
                  <a 
                    href="https://www.ssa.gov/benefits/retirement/estimator.html" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="underline hover:text-blue-900"
                  >
                    SSA.gov
                  </a>{" "}
                  for your official Social Security benefit estimates, then enter them below.
                </AlertDescription>
              </Alert>

              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">📋 Quick Steps:</h4>
                <ol className="text-sm space-y-1 list-decimal list-inside text-muted-foreground">
                  <li>Enter your Social Security benefit amounts from SSA.gov</li>
                  <li>Set your preferred claiming age (62-70)</li>
                  <li>Review the combined income preview</li>
                  <li>Save your combined calculation</li>
                </ol>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullRetirementAge">Full Retirement Age</Label>
                  <Input
                    id="fullRetirementAge"
                    type="number"
                    placeholder="e.g., 67"
                    value={socialSecurityData.fullRetirementAge || ""}
                    onChange={(e) => handleSocialSecurityChange('fullRetirementAge', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fullRetirementBenefit">Full Retirement Monthly Benefit</Label>
                  <Input
                    id="fullRetirementBenefit"
                    type="number"
                    placeholder="e.g., 2800"
                    value={socialSecurityData.fullRetirementBenefit || ""}
                    onChange={(e) => handleSocialSecurityChange('fullRetirementBenefit', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="earlyRetirementBenefit">Early Retirement (Age 62) Benefit</Label>
                  <Input
                    id="earlyRetirementBenefit"
                    type="number"
                    placeholder="e.g., 2100"
                    value={socialSecurityData.earlyRetirementBenefit || ""}
                    onChange={(e) => handleSocialSecurityChange('earlyRetirementBenefit', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="delayedRetirementBenefit">Delayed Retirement (Age 70) Benefit</Label>
                  <Input
                    id="delayedRetirementBenefit"
                    type="number"
                    placeholder="e.g., 3500"
                    value={socialSecurityData.delayedRetirementBenefit || ""}
                    onChange={(e) => handleSocialSecurityChange('delayedRetirementBenefit', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="selectedClaimingAge">Preferred Claiming Age</Label>
                  <Input
                    id="selectedClaimingAge"
                    type="number"
                    min="62"
                    max="70"
                    placeholder="e.g., 67"
                    value={socialSecurityData.selectedClaimingAge || ""}
                    onChange={(e) => handleSocialSecurityChange('selectedClaimingAge', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="selectedMonthlyBenefit">Monthly Benefit at Claiming Age</Label>
                  <Input
                    id="selectedMonthlyBenefit"
                    type="number"
                    placeholder="Auto-calculated"
                    value={socialSecurityData.selectedMonthlyBenefit || ""}
                    onChange={(e) => handleSocialSecurityChange('selectedMonthlyBenefit', e.target.value)}
                  />
                </div>
              </div>

              {/* Save button for Social Security tab */}
              {socialSecurityData.selectedMonthlyBenefit > 0 && pensionResult && (
                <>
                  <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-950/20 dark:to-green-950/20 rounded-lg">
                    <h4 className="font-medium mb-3">Combined Income Preview</h4>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-sm text-muted-foreground">MA Pension</div>
                        <div className="text-lg font-bold text-blue-600">
                          {formatCurrency(pensionResult.monthlyPension)}
                        </div>
                        <div className="text-xs text-muted-foreground">per month</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Social Security</div>
                        <div className="text-lg font-bold text-green-600">
                          {formatCurrency(socialSecurityData.selectedMonthlyBenefit)}
                        </div>
                        <div className="text-xs text-muted-foreground">per month</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Total Income</div>
                        <div className="text-lg font-bold text-purple-600">
                          {formatCurrency(pensionResult.monthlyPension + socialSecurityData.selectedMonthlyBenefit)}
                        </div>
                        <div className="text-xs text-muted-foreground">per month</div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Ready to Save</h4>
                        <p className="text-sm text-muted-foreground">
                          Your combined retirement calculation is ready to be saved.
                        </p>
                      </div>
                      <Button onClick={() => setShowSaveDialog(true)} className="gap-2">
                        <Save className="h-4 w-4" />
                        Save Combined Calculation
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </TabsContent>

            <TabsContent value="combined-results" className="space-y-4">
              {combinedResults ? (
                <div className="space-y-6">
                  <div className="grid md:grid-cols-3 gap-4">
                    <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg text-blue-700 dark:text-blue-300">
                          MA State Pension
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-blue-600">
                          {formatCurrency(combinedResults.pensionMonthly)}/mo
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatCurrency(combinedResults.pensionMonthly * 12)}/year
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-green-200 bg-green-50 dark:bg-green-950/20">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg text-green-700 dark:text-green-300">
                          Social Security
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                          {formatCurrency(combinedResults.socialSecurityMonthly)}/mo
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatCurrency(combinedResults.socialSecurityMonthly * 12)}/year
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-purple-200 bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">
                          Total Monthly Income
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {formatCurrency(combinedResults.combinedMonthly)}/mo
                        </div>
                        <div className="text-sm opacity-90">
                          {formatCurrency(combinedResults.combinedAnnual)}/year
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>Income Replacement Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <div className="text-sm text-muted-foreground mb-1">Current/Pre-Retirement Salary</div>
                          <div className="text-xl font-bold">{formatCurrency(combinedResults.currentSalary)}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground mb-1">Replacement Ratio</div>
                          <div className="text-xl font-bold text-green-600">
                            {Math.round(combinedResults.replacementRatio * 100)}%
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4 p-4 bg-muted rounded-lg">
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-medium">Income Replacement Progress</span>
                          <span className="text-sm text-muted-foreground">
                            {Math.round(combinedResults.replacementRatio * 100)}% of pre-retirement income
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                          <div
                            className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-1000"
                            style={{ width: `${Math.min(100, combinedResults.replacementRatio * 100)}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                          <span>0%</span>
                          <span className="font-medium">Target: 70-80%</span>
                          <span>100%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="flex justify-end">
                    <Button onClick={() => setShowSaveDialog(true)}>
                      <Save className="mr-2 h-4 w-4" />
                      Save Combined Calculation
                    </Button>
                  </div>
                </div>
              ) : (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Complete the Social Security setup to see your combined retirement income analysis.
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>

            <TabsContent value="tax-implications" className="space-y-4">
              <TaxImplicationsCalculator
                initialPensionIncome={pensionResult?.annualPension || 0}
                initialSocialSecurity={socialSecurityData.selectedMonthlyBenefit * 12 || 0}
                className="mt-4"
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Combined Calculation</DialogTitle>
            <DialogDescription>
              Give your combined retirement calculation a name for easy reference.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="calculationName">Calculation Name</Label>
              <Input
                id="calculationName"
                placeholder="e.g., My Combined Retirement Plan"
                value={calculationName}
                onChange={(e) => setCalculationName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
              Cancel
            </Button>
            <Button onClick={saveCombinedCalculation} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Calculation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 