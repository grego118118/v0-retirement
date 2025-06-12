"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar, DollarSign, Info, ExternalLink, Crown, CheckCircle, Save, Loader2, TrendingUp, Users, Heart, Calculator } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useSession } from "next-auth/react"
import { useRetirementData } from "@/hooks/use-retirement-data"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { calculateCOLAProjections, calculatePurchasingPower, DEFAULT_COLA_ASSUMPTIONS } from "@/lib/social-security/cola-calculator"
import { calculateSpousalBenefits, calculateSurvivorBenefits, optimizeCoupleStrategy } from "@/lib/social-security/spousal-benefits"
import { calculateMedicarePremiums, calculateNetSocialSecurityBenefit } from "@/lib/social-security/medicare-calculator"

interface SocialSecurityData {
  earlyRetirementBenefit: string
  fullRetirementBenefit: string
  delayedRetirementBenefit: string
  fullRetirementAge: string
  // Enhanced fields
  annualIncome: string
  filingStatus: 'single' | 'married' | 'marriedSeparate'
  includeMedicare: boolean
  includeInflation: boolean
  inflationScenario: 'conservative' | 'moderate' | 'optimistic'
  // Spousal data
  isMarried: boolean
  spouseFullRetirementBenefit: string
  spouseFullRetirementAge: string
  spouseBirthYear: string
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
  const { data: session } = useSession()
  const { saveCalculation, fetchCalculations } = useRetirementData()

  const [formData, setFormData] = useState<SocialSecurityData>({
    earlyRetirementBenefit: "",
    fullRetirementBenefit: "",
    delayedRetirementBenefit: "",
    fullRetirementAge: "",
    // Enhanced fields
    annualIncome: "",
    filingStatus: 'single',
    includeMedicare: true,
    includeInflation: true,
    inflationScenario: 'moderate',
    // Spousal data
    isMarried: false,
    spouseFullRetirementBenefit: "",
    spouseFullRetirementAge: "",
    spouseBirthYear: ""
  })

  const [benefits, setBenefits] = useState<SocialSecurityBenefit | null>(null)
  const [showResults, setShowResults] = useState(false)
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [calculationName, setCalculationName] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  // Enhanced calculation results
  const [colaProjections, setCOLAProjections] = useState<any[]>([])
  const [medicareResults, setMedicareResults] = useState<any>(null)
  const [spousalResults, setSpousalResults] = useState<any>(null)
  const [survivorResults, setSurvivorResults] = useState<any>(null)
  const [coupleOptimization, setCoupleOptimization] = useState<any>(null)

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
    const annualIncome = parseFloat(formData.annualIncome) || 0

    // Basic benefits calculation
    const benefitsData = {
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
    }
    setBenefits(benefitsData)

    // COLA projections if inflation is included
    if (formData.includeInflation && fullBenefit > 0) {
      const projections = calculateCOLAProjections({
        startingBenefit: fullBenefit,
        startYear: new Date().getFullYear(),
        endYear: new Date().getFullYear() + 20,
        inflationScenario: formData.inflationScenario
      })
      setCOLAProjections(projections)
    }

    // Medicare calculations if included
    if (formData.includeMedicare && fullBenefit > 0 && annualIncome > 0) {
      const medicare = calculateNetSocialSecurityBenefit(
        fullBenefit,
        annualIncome,
        formData.filingStatus,
        true
      )
      setMedicareResults(medicare)
    }

    // Spousal benefits if married
    if (formData.isMarried && formData.spouseFullRetirementBenefit) {
      const spouseBenefit = parseFloat(formData.spouseFullRetirementBenefit) || 0
      const spouseAge = parseInt(formData.spouseFullRetirementAge) || 67
      const spouseBirthYear = parseInt(formData.spouseBirthYear) || 1957

      if (spouseBenefit > 0) {
        const spousal = calculateSpousalBenefits(
          {
            fullRetirementAge: fullAge,
            primaryInsuranceAmount: fullBenefit,
            birthYear: 1957 // Default, could be made configurable
          },
          {
            fullRetirementAge: spouseAge,
            primaryInsuranceAmount: spouseBenefit,
            birthYear: spouseBirthYear
          }
        )
        setSpousalResults(spousal)

        // Couple optimization
        const optimization = optimizeCoupleStrategy(
          {
            fullRetirementAge: fullAge,
            primaryInsuranceAmount: fullBenefit,
            birthYear: 1957
          },
          {
            fullRetirementAge: spouseAge,
            primaryInsuranceAmount: spouseBenefit,
            birthYear: spouseBirthYear
          }
        )
        setCoupleOptimization(optimization)

        // Survivor benefits
        const survivor = calculateSurvivorBenefits(
          {
            fullRetirementAge: fullAge,
            primaryInsuranceAmount: fullBenefit,
            birthYear: 1957
          },
          62 // Assuming survivor is 62 for calculation
        )
        setSurvivorResults(survivor)
      }
    }

    setShowResults(true)
  }

  const isFormValid = () => {
    return formData.fullRetirementBenefit && parseFloat(formData.fullRetirementBenefit) > 0
  }

  const handleSaveCalculation = async () => {
    if (!session?.user) {
      toast.error("You must be logged in to save calculations")
      return
    }

    if (!benefits) {
      toast.error("Please calculate benefits first")
      return
    }

    setIsSaving(true)
    try {
      // Create a Social Security-only calculation
      const socialSecurityCalculation = {
        calculationName: calculationName || `Social Security Analysis - ${new Date().toLocaleDateString()}`,
        retirementDate: new Date(new Date().getFullYear() + 5, 5, 15).toISOString(), // Default 5 years from now
        retirementAge: benefits.fullRetirement.age,
        yearsOfService: 0, // Not applicable for SS-only calculation
        averageSalary: 0, // Not applicable for SS-only calculation
        retirementGroup: "1" as const,
        benefitPercentage: 0,
        retirementOption: "A" as const,
        monthlyBenefit: 0, // No pension benefit in SS-only calculation
        annualBenefit: 0,
        notes: `Social Security benefits analysis. Full retirement age: ${benefits.fullRetirement.age}`,
        socialSecurityData: {
          fullRetirementAge: benefits.fullRetirement.age,
          earlyRetirementBenefit: benefits.earlyRetirement.monthlyBenefit,
          fullRetirementBenefit: benefits.fullRetirement.monthlyBenefit,
          delayedRetirementBenefit: benefits.delayedRetirement.monthlyBenefit,
          selectedClaimingAge: benefits.fullRetirement.age,
          selectedMonthlyBenefit: benefits.fullRetirement.monthlyBenefit,
          combinedMonthlyIncome: benefits.fullRetirement.monthlyBenefit, // SS only
          replacementRatio: 0.4, // Typical SS replacement ratio
        }
      }

      const success = await saveCalculation(socialSecurityCalculation)
      if (success) {
        toast.success("Social Security analysis saved successfully!")
        setShowSaveDialog(false)
        setCalculationName("")
        // Refresh calculations to show the new one
        fetchCalculations()
      }
    } catch (error) {
      console.error("Error saving calculation:", error)
      toast.error("Failed to save calculation")
    } finally {
      setIsSaving(false)
    }
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

  // Calculate derived data for summary
  const getSummaryData = () => {
    const earlyBenefit = formData.earlyRetirementBenefit ? parseFloat(formData.earlyRetirementBenefit) : null
    const fullBenefit = formData.fullRetirementBenefit ? parseFloat(formData.fullRetirementBenefit) : null
    const delayedBenefit = formData.delayedRetirementBenefit ? parseFloat(formData.delayedRetirementBenefit) : null
    const fullAge = formData.fullRetirementAge ? parseInt(formData.fullRetirementAge) : null
    const annualIncome = formData.annualIncome ? parseFloat(formData.annualIncome) : null
    const spouseBenefit = formData.spouseFullRetirementBenefit ? parseFloat(formData.spouseFullRetirementBenefit) : null

    // Calculate optimal claiming strategy
    let optimalStrategy = null
    if (fullBenefit && delayedBenefit && earlyBenefit) {
      const strategies = [
        { age: 62, benefit: earlyBenefit, label: 'Early Retirement' },
        { age: fullAge || 67, benefit: fullBenefit, label: 'Full Retirement' },
        { age: 70, benefit: delayedBenefit, label: 'Delayed Retirement' }
      ]
      optimalStrategy = strategies.reduce((best, current) =>
        current.benefit > best.benefit ? current : best
      )
    }

    return {
      earlyBenefit,
      fullBenefit,
      delayedBenefit,
      fullAge,
      annualIncome,
      spouseBenefit,
      optimalStrategy,
      completionPercentage: calculateCompletionPercentage(),
      hasCalculatedResults: showResults && benefits !== null
    }
  }

  const calculateCompletionPercentage = () => {
    const basicFields = [
      formData.fullRetirementAge,
      formData.fullRetirementBenefit,
      formData.earlyRetirementBenefit,
      formData.delayedRetirementBenefit
    ]

    const advancedFields = [
      formData.annualIncome,
      formData.filingStatus
    ]

    const spousalFields = formData.isMarried ? [
      formData.spouseFullRetirementBenefit,
      formData.spouseFullRetirementAge,
      formData.spouseBirthYear
    ] : []

    const allFields = [...basicFields, ...advancedFields, ...spousalFields]
    const completedFields = allFields.filter(field => field && field.toString().trim() !== '').length
    return Math.round((completedFields / allFields.length) * 100)
  }

  const formatCurrency = (amount: number | null) => {
    if (amount === null || amount === undefined) return 'N/A'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatAge = (age: number | null) => {
    if (age === null || age === undefined) return 'N/A'
    return `${age} years`
  }

  const summaryData = getSummaryData()

  return (
    <div className="space-y-6">
      {/* Comprehensive Data Summary Section */}
      <div className="space-y-6 mb-8">
        {/* Header Card with Progress */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-900/20">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-green-900 dark:text-green-100 mb-2">
                  Social Security Summary
                </h2>
                <p className="text-green-700 dark:text-green-300 text-sm">
                  Review your Social Security inputs and benefit estimates below
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="text-right">
                  <div className="text-sm text-green-600 dark:text-green-400 font-medium">
                    Form Completion
                  </div>
                  <div className="text-2xl font-bold text-green-900 dark:text-green-100">
                    {summaryData.completionPercentage}%
                  </div>
                </div>
                <div className="w-32 h-2 bg-green-200 dark:bg-green-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-600 dark:bg-green-400 transition-all duration-300"
                    style={{ width: `${summaryData.completionPercentage}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions Bar */}
        {summaryData.completionPercentage > 0 && (
          <Card className="border-0 shadow-lg bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-900/20">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="font-medium text-emerald-900 dark:text-emerald-100">
                      {summaryData.completionPercentage === 100 ? 'Ready to Calculate!' : 'Keep Going!'}
                    </h4>
                    <p className="text-sm text-emerald-700 dark:text-emerald-300">
                      {summaryData.completionPercentage === 100
                        ? 'All fields completed - proceed to calculate your Social Security benefits'
                        : `Continue filling out the form to complete your analysis`
                      }
                    </p>
                  </div>
                </div>
                {summaryData.completionPercentage >= 25 && (
                  <Button
                    onClick={calculateBenefits}
                    disabled={!isFormValid()}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    <Calculator className="h-4 w-4 mr-2" />
                    Calculate Benefits
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Data Summary Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Basic Benefits Card */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-900/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="font-semibold text-green-900 dark:text-green-100">Basic Benefits</h3>
                </div>
                <div className={`w-3 h-3 rounded-full ${
                  summaryData.fullBenefit && summaryData.fullAge
                    ? 'bg-green-500' : 'bg-gray-300'
                }`} title={
                  summaryData.fullBenefit && summaryData.fullAge
                    ? 'Complete' : 'Incomplete'
                } />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-green-700 dark:text-green-300">Full Retirement Age:</span>
                  <span className="font-medium text-green-900 dark:text-green-100">
                    {formatAge(summaryData.fullAge)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-green-700 dark:text-green-300">Early (Age 62):</span>
                  <span className="font-medium text-green-900 dark:text-green-100">
                    {formatCurrency(summaryData.earlyBenefit)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-green-700 dark:text-green-300">Full Retirement:</span>
                  <span className="font-medium text-green-900 dark:text-green-100">
                    {formatCurrency(summaryData.fullBenefit)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-green-700 dark:text-green-300">Delayed (Age 70):</span>
                  <span className="font-medium text-green-900 dark:text-green-100">
                    {formatCurrency(summaryData.delayedBenefit)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Advanced Options Card */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-900/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100">Advanced Options</h3>
                </div>
                <div className={`w-3 h-3 rounded-full ${
                  formData.annualIncome && formData.filingStatus
                    ? 'bg-green-500' : 'bg-gray-300'
                }`} title={
                  formData.annualIncome && formData.filingStatus
                    ? 'Complete' : 'Incomplete'
                } />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-blue-700 dark:text-blue-300">Annual Income:</span>
                  <span className="font-medium text-blue-900 dark:text-blue-100">
                    {formatCurrency(summaryData.annualIncome)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-blue-700 dark:text-blue-300">Filing Status:</span>
                  <span className="font-medium text-blue-900 dark:text-blue-100">
                    {formData.filingStatus === 'single' ? 'Single' :
                     formData.filingStatus === 'married' ? 'Married Filing Jointly' :
                     formData.filingStatus === 'marriedSeparate' ? 'Married Filing Separately' : 'Not set'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-blue-700 dark:text-blue-300">COLA Adjustments:</span>
                  <span className={`font-medium text-sm px-2 py-1 rounded-full ${
                    formData.includeInflation
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
                  }`}>
                    {formData.includeInflation ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-blue-700 dark:text-blue-300">Inflation Scenario:</span>
                  <span className="font-medium text-blue-900 dark:text-blue-100">
                    {formData.includeInflation ?
                      (formData.inflationScenario === 'conservative' ? 'Conservative (2.0%)' :
                       formData.inflationScenario === 'moderate' ? 'Moderate (2.5%)' :
                       formData.inflationScenario === 'optimistic' ? 'Higher (3.0%)' : 'Not set') : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-blue-700 dark:text-blue-300">Medicare Premiums:</span>
                  <span className={`font-medium text-sm px-2 py-1 rounded-full ${
                    formData.includeMedicare
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
                  }`}>
                    {formData.includeMedicare ? 'Included' : 'Not Included'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Spousal Benefits Card */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-900/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <Heart className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="font-semibold text-purple-900 dark:text-purple-100">Spousal Benefits</h3>
                </div>
                <div className={`w-3 h-3 rounded-full ${
                  !formData.isMarried ? 'bg-gray-300' :
                  formData.isMarried && summaryData.spouseBenefit && formData.spouseFullRetirementAge
                    ? 'bg-green-500' : 'bg-orange-400'
                }`} title={
                  !formData.isMarried ? 'Not applicable' :
                  formData.isMarried && summaryData.spouseBenefit && formData.spouseFullRetirementAge
                    ? 'Complete' : 'Incomplete'
                } />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-purple-700 dark:text-purple-300">Marital Status:</span>
                  <span className={`font-medium text-sm px-2 py-1 rounded-full ${
                    formData.isMarried
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
                  }`}>
                    {formData.isMarried ? 'Married' : 'Single'}
                  </span>
                </div>
                {formData.isMarried ? (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-purple-700 dark:text-purple-300">Spouse's Benefit:</span>
                      <span className="font-medium text-purple-900 dark:text-purple-100">
                        {formatCurrency(summaryData.spouseBenefit)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-purple-700 dark:text-purple-300">Spouse's FRA:</span>
                      <span className="font-medium text-purple-900 dark:text-purple-100">
                        {formatAge(formData.spouseFullRetirementAge ? parseInt(formData.spouseFullRetirementAge) : null)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-purple-700 dark:text-purple-300">Spouse Birth Year:</span>
                      <span className="font-medium text-purple-900 dark:text-purple-100">
                        {formData.spouseBirthYear || 'Not set'}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-purple-600 dark:text-purple-400">
                      Enable spousal benefits analysis by checking "I am married" in the Spousal Benefits tab
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Calculation Results Card - Only show if calculations have been performed */}
        {summaryData.hasCalculatedResults && (
          <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-900/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                    <Calculator className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <h3 className="font-semibold text-orange-900 dark:text-orange-100">Calculation Results</h3>
                </div>
                <div className="w-3 h-3 rounded-full bg-green-500" title="Calculations complete" />
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-medium text-orange-800 dark:text-orange-200 mb-2">Optimal Strategy:</h4>
                  {summaryData.optimalStrategy && (
                    <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-orange-700 dark:text-orange-300">
                          {summaryData.optimalStrategy.label}
                        </span>
                        <span className="text-sm text-orange-600 dark:text-orange-400">
                          Age {summaryData.optimalStrategy.age}
                        </span>
                      </div>
                      <div className="text-lg font-bold text-orange-900 dark:text-orange-100">
                        {formatCurrency(summaryData.optimalStrategy.benefit)}/month
                      </div>
                    </div>
                  )}
                  {medicareResults && (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-orange-700 dark:text-orange-300">Medicare Premium:</span>
                        <span className="font-medium text-orange-900 dark:text-orange-100">
                          {formatCurrency(medicareResults.medicarePremium)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-orange-700 dark:text-orange-300">Net SS Benefit:</span>
                        <span className="font-medium text-orange-900 dark:text-orange-100">
                          {formatCurrency(medicareResults.netBenefit)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="space-y-3">
                  <h4 className="font-medium text-orange-800 dark:text-orange-200 mb-2">Additional Analysis:</h4>
                  {colaProjections.length > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-orange-700 dark:text-orange-300">COLA Projections:</span>
                      <span className="font-medium text-orange-900 dark:text-orange-100">
                        {colaProjections.length} years calculated
                      </span>
                    </div>
                  )}
                  {spousalResults && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-orange-700 dark:text-orange-300">Spousal Analysis:</span>
                      <span className="font-medium text-orange-900 dark:text-orange-100">
                        Available
                      </span>
                    </div>
                  )}
                  {coupleOptimization && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-orange-700 dark:text-orange-300">Couple Strategy:</span>
                      <span className="font-medium text-orange-900 dark:text-orange-100">
                        Optimized
                      </span>
                    </div>
                  )}
                  {survivorResults && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-orange-700 dark:text-orange-300">Survivor Benefits:</span>
                      <span className="font-medium text-orange-900 dark:text-orange-100">
                        Calculated
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Methodology & Assumptions Card */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-950/20 dark:to-gray-900/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-slate-100 dark:bg-slate-900/30 rounded-lg">
                <Info className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">Calculation Methodology</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-slate-800 dark:text-slate-200 mb-2">Key Assumptions:</h4>
                <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                  <li>• Benefits based on official SSA estimates from your account</li>
                  <li>• COLA adjustments use historical averages (2.0%-3.0% annually)</li>
                  <li>• Medicare Part B premium: $174.70/month (2024 rate)</li>
                  <li>• Tax calculations use current federal and MA state rates</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-slate-800 dark:text-slate-200 mb-2">Important Notes:</h4>
                <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                  <li>• Estimates are for planning purposes only</li>
                  <li>• Actual benefits may vary based on future policy changes</li>
                  <li>• Consult SSA.gov for official benefit calculations</li>
                  <li>• Consider professional financial advice for complex situations</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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

          {/* Enhanced Input Form with Tabs */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Enhanced Social Security Analysis</CardTitle>
              <CardDescription>
                Complete analysis including inflation adjustments, Medicare premiums, and spousal benefits
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="basic">Basic Benefits</TabsTrigger>
                  <TabsTrigger value="advanced">Advanced Options</TabsTrigger>
                  <TabsTrigger value="spousal">Spousal Benefits</TabsTrigger>
                  <TabsTrigger value="medicare">Medicare & Income</TabsTrigger>
                </TabsList>

                {/* Basic Benefits Tab */}
                <TabsContent value="basic" className="space-y-4">
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
                </TabsContent>

                {/* Advanced Options Tab */}
                <TabsContent value="advanced" className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="includeInflation"
                        checked={formData.includeInflation}
                        onCheckedChange={(checked) =>
                          setFormData(prev => ({ ...prev, includeInflation: checked as boolean }))
                        }
                      />
                      <Label htmlFor="includeInflation" className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Include inflation adjustments (COLA)
                      </Label>
                    </div>

                    {formData.includeInflation && (
                      <div className="space-y-2 ml-6">
                        <Label htmlFor="inflationScenario">Inflation Scenario</Label>
                        <Select
                          value={formData.inflationScenario}
                          onValueChange={(value: 'conservative' | 'moderate' | 'optimistic') =>
                            setFormData(prev => ({ ...prev, inflationScenario: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="conservative">Conservative (2.0% annually)</SelectItem>
                            <SelectItem value="moderate">Moderate (2.5% annually)</SelectItem>
                            <SelectItem value="optimistic">Higher Inflation (3.0% annually)</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-sm text-muted-foreground">
                          Historical average COLA is 2.5%. Choose conservative for lower estimates, optimistic for higher inflation scenarios.
                        </p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* Spousal Benefits Tab */}
                <TabsContent value="spousal" className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="isMarried"
                        checked={formData.isMarried}
                        onCheckedChange={(checked) =>
                          setFormData(prev => ({ ...prev, isMarried: checked as boolean }))
                        }
                      />
                      <Label htmlFor="isMarried" className="flex items-center gap-2">
                        <Heart className="h-4 w-4" />
                        I am married (include spousal benefits analysis)
                      </Label>
                    </div>

                    {formData.isMarried && (
                      <div className="space-y-4 ml-6">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="spouseFullRetirementBenefit">Spouse's Full Retirement Benefit</Label>
                            <Input
                              id="spouseFullRetirementBenefit"
                              type="number"
                              placeholder="e.g., 1800"
                              value={formData.spouseFullRetirementBenefit}
                              onChange={(e) => handleInputChange('spouseFullRetirementBenefit', e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="spouseFullRetirementAge">Spouse's Full Retirement Age</Label>
                            <Input
                              id="spouseFullRetirementAge"
                              type="number"
                              placeholder="e.g., 67"
                              value={formData.spouseFullRetirementAge}
                              onChange={(e) => handleInputChange('spouseFullRetirementAge', e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="spouseBirthYear">Spouse's Birth Year</Label>
                            <Input
                              id="spouseBirthYear"
                              type="number"
                              placeholder="e.g., 1957"
                              value={formData.spouseBirthYear}
                              onChange={(e) => handleInputChange('spouseBirthYear', e.target.value)}
                            />
                          </div>
                        </div>
                        <Alert>
                          <Users className="h-4 w-4" />
                          <AlertDescription>
                            Spousal benefits allow the lower-earning spouse to receive up to 50% of the higher earner's benefit. We'll calculate the optimal claiming strategy for both spouses.
                          </AlertDescription>
                        </Alert>
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* Medicare & Income Tab */}
                <TabsContent value="medicare" className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="includeMedicare"
                        checked={formData.includeMedicare}
                        onCheckedChange={(checked) =>
                          setFormData(prev => ({ ...prev, includeMedicare: checked as boolean }))
                        }
                      />
                      <Label htmlFor="includeMedicare" className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Include Medicare premium deductions
                      </Label>
                    </div>

                    {formData.includeMedicare && (
                      <div className="space-y-4 ml-6">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="annualIncome">Total Annual Retirement Income</Label>
                            <Input
                              id="annualIncome"
                              type="number"
                              placeholder="e.g., 85000"
                              value={formData.annualIncome}
                              onChange={(e) => handleInputChange('annualIncome', e.target.value)}
                            />
                            <p className="text-sm text-muted-foreground">
                              Include pension, Social Security, and other retirement income
                            </p>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="filingStatus">Tax Filing Status</Label>
                            <Select
                              value={formData.filingStatus}
                              onValueChange={(value: 'single' | 'married' | 'marriedSeparate') =>
                                setFormData(prev => ({ ...prev, filingStatus: value }))
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="single">Single</SelectItem>
                                <SelectItem value="married">Married Filing Jointly</SelectItem>
                                <SelectItem value="marriedSeparate">Married Filing Separately</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <Alert>
                          <Info className="h-4 w-4" />
                          <AlertDescription>
                            Medicare Part B premiums are income-adjusted. Higher income retirees pay additional IRMAA surcharges. Standard 2024 premium is $174.70/month.
                          </AlertDescription>
                        </Alert>
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* Calculate Button */}
                <div className="mt-6 pt-4 border-t">
                  <div className="text-sm text-muted-foreground mb-4">
                    <span className="text-red-500">*</span> Required field. Other fields are optional but recommended for complete analysis.
                  </div>
                  <Button
                    onClick={calculateBenefits}
                    disabled={!isFormValid()}
                    className="w-full"
                    size="lg"
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    Analyze My Enhanced Social Security Benefits
                  </Button>
                </div>
              </Tabs>
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

                {/* Enhanced Results Sections */}
                <div className="mt-6 space-y-6">
                  {/* COLA Projections */}
                  {colaProjections.length > 0 && (
                    <Card className="border-purple-200 bg-purple-50 dark:bg-purple-950/20">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <TrendingUp className="h-5 w-5 text-purple-600" />
                          Inflation-Adjusted Benefits (COLA)
                        </CardTitle>
                        <CardDescription>
                          Your benefits adjusted for Cost of Living increases over time
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid md:grid-cols-3 gap-4">
                          <div className="text-center">
                            <div className="text-sm text-muted-foreground">5 Years</div>
                            <div className="text-xl font-bold text-purple-600">
                              ${colaProjections[5]?.adjustedBenefit.toLocaleString() || 'N/A'}
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm text-muted-foreground">10 Years</div>
                            <div className="text-xl font-bold text-purple-600">
                              ${colaProjections[10]?.adjustedBenefit.toLocaleString() || 'N/A'}
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm text-muted-foreground">20 Years</div>
                            <div className="text-xl font-bold text-purple-600">
                              ${colaProjections[19]?.adjustedBenefit.toLocaleString() || 'N/A'}
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-4">
                          Based on {formData.inflationScenario} inflation scenario ({DEFAULT_COLA_ASSUMPTIONS[formData.inflationScenario]}% annually)
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  {/* Medicare Deductions */}
                  {medicareResults && (
                    <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <DollarSign className="h-5 w-5 text-red-600" />
                          Medicare Premium Impact
                        </CardTitle>
                        <CardDescription>
                          Net Social Security benefit after Medicare deductions
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid md:grid-cols-3 gap-4">
                          <div className="text-center">
                            <div className="text-sm text-muted-foreground">Gross SS Benefit</div>
                            <div className="text-xl font-bold text-green-600">
                              ${medicareResults.grossBenefit.toFixed(0)}
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm text-muted-foreground">Medicare Premiums</div>
                            <div className="text-xl font-bold text-red-600">
                              -${medicareResults.medicarePremiums.toFixed(0)}
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm text-muted-foreground">Net Benefit</div>
                            <div className="text-xl font-bold text-blue-600">
                              ${medicareResults.netBenefit.toFixed(0)}
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-4">
                          Medicare premiums reduce your Social Security by {medicareResults.reductionPercentage.toFixed(1)}%
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  {/* Spousal Benefits */}
                  {spousalResults && (
                    <Card className="border-pink-200 bg-pink-50 dark:bg-pink-950/20">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Heart className="h-5 w-5 text-pink-600" />
                          Spousal Benefits Analysis
                        </CardTitle>
                        <CardDescription>
                          Optimal claiming strategy for married couples
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="text-center p-4 bg-white dark:bg-gray-900 rounded-lg">
                              <div className="text-sm text-muted-foreground">Lower Earner's Own Benefit</div>
                              <div className="text-xl font-bold text-blue-600">
                                ${spousalResults.ownBenefit.toLocaleString()}
                              </div>
                            </div>
                            <div className="text-center p-4 bg-white dark:bg-gray-900 rounded-lg">
                              <div className="text-sm text-muted-foreground">Optimal Total Benefit</div>
                              <div className="text-xl font-bold text-green-600">
                                ${spousalResults.totalBenefit.toLocaleString()}
                              </div>
                            </div>
                          </div>
                          <Alert>
                            <Users className="h-4 w-4" />
                            <AlertDescription>
                              <strong>Recommendation:</strong> {spousalResults.explanation}
                            </AlertDescription>
                          </Alert>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Couple Optimization */}
                  {coupleOptimization && (
                    <Card className="border-indigo-200 bg-indigo-50 dark:bg-indigo-950/20">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Users className="h-5 w-5 text-indigo-600" />
                          Couple Optimization Strategy
                        </CardTitle>
                        <CardDescription>
                          Maximize lifetime benefits for both spouses
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="p-4 bg-white dark:bg-gray-900 rounded-lg">
                              <h4 className="font-semibold mb-2">Spouse 1 Strategy</h4>
                              <div className="text-sm text-muted-foreground">Claim at age {coupleOptimization.spouse1Strategy.claimingAge}</div>
                              <div className="text-lg font-bold text-blue-600">
                                ${coupleOptimization.spouse1Strategy.monthlyBenefit.toLocaleString()}/month
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {coupleOptimization.spouse1Strategy.strategy}
                              </div>
                            </div>
                            <div className="p-4 bg-white dark:bg-gray-900 rounded-lg">
                              <h4 className="font-semibold mb-2">Spouse 2 Strategy</h4>
                              <div className="text-sm text-muted-foreground">Claim at age {coupleOptimization.spouse2Strategy.claimingAge}</div>
                              <div className="text-lg font-bold text-green-600">
                                ${coupleOptimization.spouse2Strategy.monthlyBenefit.toLocaleString()}/month
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {coupleOptimization.spouse2Strategy.strategy}
                              </div>
                            </div>
                          </div>
                          <Alert>
                            <CheckCircle className="h-4 w-4" />
                            <AlertDescription>
                              <strong>Optimal Strategy:</strong> {coupleOptimization.explanation}
                            </AlertDescription>
                          </Alert>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Save Button */}
                {session?.user && (
                  <div className="mt-6 pt-4 border-t">
                    <Button
                      onClick={() => setShowSaveDialog(true)}
                      className="w-full"
                      variant="outline"
                    >
                      <Save className="mr-2 h-4 w-4" />
                      Save Social Security Analysis
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Save Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Social Security Analysis</DialogTitle>
            <DialogDescription>
              Save your Social Security benefits analysis to view later and combine with pension calculations.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="calculationName">Calculation Name</Label>
              <Input
                id="calculationName"
                placeholder="e.g., My Social Security Analysis"
                value={calculationName}
                onChange={(e) => setCalculationName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveCalculation} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Analysis
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}