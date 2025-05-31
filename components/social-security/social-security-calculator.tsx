"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Calendar, DollarSign, Info, ExternalLink, Crown, CheckCircle } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface SocialSecurityData {
  earlyRetirementBenefit: string
  fullRetirementBenefit: string
  delayedRetirementBenefit: string
  fullRetirementAge: string
}

interface SocialSecurityBenefit {
  earlyRetirement: {
    age: number
    monthlyBenefit: number
  }
  fullRetirement: {
    age: number
    monthlyBenefit: number
  }
  delayedRetirement: {
    age: number
    monthlyBenefit: number
  }
}

export function SocialSecurityCalculator() {
  const [formData, setFormData] = useState<SocialSecurityData>({
    earlyRetirementBenefit: "",
    fullRetirementBenefit: "",
    delayedRetirementBenefit: "",
    fullRetirementAge: ""
  })

  const [benefits, setBenefits] = useState<SocialSecurityBenefit | null>(null)
  const [showResults, setShowResults] = useState(false)

  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const calculateBenefits = () => {
    const earlyBenefit = parseFloat(formData.earlyRetirementBenefit) || 0
    const fullBenefit = parseFloat(formData.fullRetirementBenefit) || 0
    const delayedBenefit = parseFloat(formData.delayedRetirementBenefit) || 0
    const fullAge = parseInt(formData.fullRetirementAge) || 67

    setBenefits({
      earlyRetirement: {
        age: 62,
        monthlyBenefit: earlyBenefit
      },
      fullRetirement: {
        age: fullAge,
        monthlyBenefit: fullBenefit
      },
      delayedRetirement: {
        age: 70,
        monthlyBenefit: delayedBenefit
      }
    })

    setShowResults(true)
  }

  const isFormValid = () => {
    return formData.fullRetirementBenefit && parseFloat(formData.fullRetirementBenefit) > 0
  }

  const steps = [
    {
      number: 1,
      title: "Visit SSA.gov",
      description: "Go to the official Social Security Administration website"
    },
    {
      number: 2,
      title: "Create/Login to my Social Security",
      description: "Create an account or log into your existing my Social Security account"
    },
    {
      number: 3,
      title: "View Benefit Estimates",
      description: "Navigate to 'View Estimates' or 'Retirement Estimator' section"
    },
    {
      number: 4,
      title: "Get Your Numbers",
      description: "Find your estimated monthly benefits at ages 62, full retirement age, and 70"
    },
    {
      number: 5,
      title: "Enter Below",
      description: "Copy those numbers into the form below for combined analysis"
    }
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-blue-500" />
            <CardTitle>Social Security Benefit Integration</CardTitle>
            <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
              <Crown className="mr-1 h-3 w-3" />
              Premium
            </Badge>
          </div>
          <CardDescription>
            Enter your official Social Security benefit estimates from SSA.gov for accurate retirement planning
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800 dark:text-blue-200">
              <strong>Important:</strong> For the most accurate retirement planning, use your official Social Security benefit estimates from SSA.gov rather than third-party calculators.
            </AlertDescription>
          </Alert>

          {/* Instructions Section */}
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                How to Get Your Official Social Security Estimates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button asChild className="bg-blue-600 hover:bg-blue-700">
                    <a 
                      href="https://www.ssa.gov/benefits/retirement/estimator.html" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                      SSA Retirement Estimator
                    </a>
                  </Button>
                  <Button variant="outline" asChild>
                    <a 
                      href="https://www.ssa.gov/myaccount/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                      my Social Security Account
                    </a>
                  </Button>
                </div>

                <div className="grid md:grid-cols-5 gap-4 mt-6">
                  {steps.map((step) => (
                    <div key={step.number} className="text-center">
                      <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm mx-auto mb-2">
                        {step.number}
                      </div>
                      <h4 className="font-medium text-sm mb-1">{step.title}</h4>
                      <p className="text-xs text-muted-foreground">{step.description}</p>
                    </div>
                  ))}
                </div>

                <Alert className="mt-4">
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <strong>What to look for:</strong> Your Social Security Statement will show estimated monthly benefits at age 62 (early retirement), your full retirement age (66-67 depending on birth year), and age 70 (delayed retirement). These are the numbers you'll enter below.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>

          {/* Input Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Enter Your SSA.gov Benefit Estimates</CardTitle>
              <CardDescription>
                Copy the monthly benefit amounts from your official Social Security Statement
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="fullRetirementAge">Your Full Retirement Age</Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>This is shown on your Social Security Statement (typically 66-67 based on birth year)</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Input
                    id="fullRetirementAge"
                    type="number"
                    placeholder="e.g., 67"
                    value={formData.fullRetirementAge}
                    onChange={(e) => handleInputChange('fullRetirementAge', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="fullRetirementBenefit">Full Retirement Monthly Benefit</Label>
                    <span className="text-red-500">*</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Monthly benefit amount at your full retirement age (required)</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Input
                    id="fullRetirementBenefit"
                    type="number"
                    placeholder="e.g., 2800"
                    value={formData.fullRetirementBenefit}
                    onChange={(e) => handleInputChange('fullRetirementBenefit', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="earlyRetirementBenefit">Early Retirement (Age 62) Monthly Benefit</Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Reduced monthly benefit if you claim at age 62 (optional)</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Input
                    id="earlyRetirementBenefit"
                    type="number"
                    placeholder="e.g., 2100"
                    value={formData.earlyRetirementBenefit}
                    onChange={(e) => handleInputChange('earlyRetirementBenefit', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="delayedRetirementBenefit">Delayed Retirement (Age 70) Monthly Benefit</Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Increased monthly benefit if you delay until age 70 (optional)</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Input
                    id="delayedRetirementBenefit"
                    type="number"
                    placeholder="e.g., 3500"
                    value={formData.delayedRetirementBenefit}
                    onChange={(e) => handleInputChange('delayedRetirementBenefit', e.target.value)}
                  />
                </div>
              </div>

              <div className="text-sm text-muted-foreground">
                <span className="text-red-500">*</span> Required field. Other fields are optional but recommended for complete analysis.
              </div>

              <Button 
                onClick={calculateBenefits}
                disabled={!isFormValid()}
                className="w-full"
              >
                <Calendar className="mr-2 h-4 w-4" />
                Analyze My Social Security Benefits
              </Button>
            </CardContent>
          </Card>

          {/* Results */}
          {showResults && benefits && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-green-500" />
                  Your Social Security Benefits Summary
                </CardTitle>
                <CardDescription>
                  Based on your official SSA.gov estimates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  {/* Early Retirement */}
                  {benefits.earlyRetirement.monthlyBenefit > 0 && (
                    <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <span className="text-orange-600">Early Retirement</span>
                        </CardTitle>
                        <CardDescription>Age 62</CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="text-2xl font-bold text-orange-600 mb-1">
                          ${benefits.earlyRetirement.monthlyBenefit.toFixed(0)}/mo
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Reduced benefits for early claiming
                        </div>
                        <div className="text-sm text-muted-foreground mt-2">
                          Annual: ${(benefits.earlyRetirement.monthlyBenefit * 12).toFixed(0)}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Full Retirement */}
                  <Card className="border-green-200 bg-green-50 dark:bg-green-950/20">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <span className="text-green-600">Full Retirement</span>
                        <Badge variant="secondary" className="text-xs">Primary</Badge>
                      </CardTitle>
                      <CardDescription>Age {benefits.fullRetirement.age}</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="text-2xl font-bold text-green-600 mb-1">
                        ${benefits.fullRetirement.monthlyBenefit.toFixed(0)}/mo
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Full benefit amount
                      </div>
                      <div className="text-sm text-muted-foreground mt-2">
                        Annual: ${(benefits.fullRetirement.monthlyBenefit * 12).toFixed(0)}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Delayed Retirement */}
                  {benefits.delayedRetirement.monthlyBenefit > 0 && (
                    <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <span className="text-blue-600">Delayed Retirement</span>
                        </CardTitle>
                        <CardDescription>Age 70</CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="text-2xl font-bold text-blue-600 mb-1">
                          ${benefits.delayedRetirement.monthlyBenefit.toFixed(0)}/mo
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Maximum benefits with delayed credits
                        </div>
                        <div className="text-sm text-muted-foreground mt-2">
                          Annual: ${(benefits.delayedRetirement.monthlyBenefit * 12).toFixed(0)}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                <Alert className="mt-4 bg-green-50 border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    <strong>Official Data:</strong> These benefits are based on your official Social Security estimates from SSA.gov, ensuring the highest accuracy for your retirement planning.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 