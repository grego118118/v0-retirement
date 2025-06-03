"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, ArrowRight, Calculator, HelpCircle, Info, Save, Crown } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import {
  calculatePensionWithOption,
  checkEligibility,
  getBenefitFactor,
  generateProjectionTable,
} from "@/lib/pension-calculations"
import EligibilityInfo from "./eligibility-info"
import PensionResults from "./pension-results"
import ProjectionTable from "./projection-table"
import { Progress } from "@/components/ui/progress"
import { motion, AnimatePresence } from "framer-motion"
import { ToastNotification } from "@/components/ui/toast-notification"
import { useSearchParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useRetirementData } from "@/hooks/use-retirement-data"
import { useSubscriptionStatus } from "@/hooks/use-subscription"
import { PremiumGate } from "@/components/premium/premium-gate"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import Link from "next/link"
import { SocialSecurityCalculator } from "@/components/social-security/social-security-calculator"
import { CombinedRetirementCalculator } from "@/components/combined-retirement-calculator"

const steps = [
  { id: "personal", title: "Personal Info" },
  { id: "salary", title: "Salary Info" },
  { id: "options", title: "Retirement Options" },
  { id: "results", title: "Results" },
]

const STORAGE_KEY = "ma-pension-calculator-data"

export default function PensionCalculator() {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState({
    serviceEntryDate: "",
    age: "",
    yearsOfService: "",
    group: "",
    salary1: "",
    salary2: "",
    salary3: "",
    retirementOption: "A",
    beneficiaryAge: "",
  })

  const [showNotification, setShowNotification] = useState(false)

  const searchParams = useSearchParams()
  const router = useRouter()
  const [calculationName, setCalculationName] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [savedMessage, setSavedMessage] = useState("")
  const { data: session } = useSession()
  const { saveCalculation: saveCalculationToDb } = useRetirementData()
  
  // Move subscription status hook to top level
  const { canSaveCalculations, maxSavedCalculations, savedCalculationsCount, isPremium } = useSubscriptionStatus()

  const [errors, setErrors] = useState<string[]>([])
  const [eligibilityWarning, setEligibilityWarning] = useState("")
  const [calculationResult, setCalculationResult] = useState<any>(null)
  const [showResults, setShowResults] = useState(false)
  const [isCalculating, setIsCalculating] = useState(false)

  useEffect(() => {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY)
      if (savedData) {
        const parsedData = JSON.parse(savedData)
        setFormData(parsedData)
        setShowNotification(true)
      }
    } catch (error) {
      console.error("Failed to load from localStorage:", error)
    }
  }, [])

  useEffect(() => {
    const calculationId = searchParams.get("id")
    if (calculationId && session) {
      // This would normally load a saved calculation, but we've disabled authentication
      // So we'll just show a message that this feature is disabled
      setSavedMessage("Saved calculations are currently disabled.")
    }
  }, [session, searchParams])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    const updatedData = { ...formData, [name]: value }
    setFormData(updatedData)
    saveToLocalStorage(updatedData)
  }

  const handleSelectChange = (name: string, value: string) => {
    const updatedData = { ...formData, [name]: value }
    setFormData(updatedData)
    saveToLocalStorage(updatedData)
  }

  const handleRadioChange = (value: string) => {
    const updatedData = { ...formData, retirementOption: value }
    setFormData(updatedData)
    saveToLocalStorage(updatedData)
  }

  const saveToLocalStorage = (data: typeof formData) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch (error) {
      console.error("Failed to save to localStorage:", error)
    }
  }

  const clearSavedData = () => {
    try {
      localStorage.removeItem(STORAGE_KEY)
      setFormData({
        serviceEntryDate: "",
        age: "",
        yearsOfService: "",
        group: "",
        salary1: "",
        salary2: "",
        salary3: "",
        retirementOption: "A",
        beneficiaryAge: "",
      })
    } catch (error) {
      console.error("Failed to clear localStorage:", error)
    }
  }

  const validateCurrentStep = () => {
    const newErrors: string[] = []

    if (currentStep === 0) {
      if (!formData.serviceEntryDate) newErrors.push("Please select your service entry period.")
      if (!formData.age || isNaN(Number.parseFloat(formData.age)) || Number.parseFloat(formData.age) <= 0)
        newErrors.push("Valid age at retirement is required.")
      if (
        !formData.yearsOfService ||
        isNaN(Number.parseFloat(formData.yearsOfService)) ||
        Number.parseFloat(formData.yearsOfService) < 0
      )
        newErrors.push("Valid years of service are required.")
      if (!formData.group) newErrors.push("Your employee group must be selected.")
    } else if (currentStep === 1) {
      if (!formData.salary1 || isNaN(Number.parseFloat(formData.salary1)) || Number.parseFloat(formData.salary1) < 0)
        newErrors.push("Valid salary for Year 1 is required.")
      if (!formData.salary2 || isNaN(Number.parseFloat(formData.salary2)) || Number.parseFloat(formData.salary2) < 0)
        newErrors.push("Valid salary for Year 2 is required.")
      if (!formData.salary3 || isNaN(Number.parseFloat(formData.salary3)) || Number.parseFloat(formData.salary3) < 0)
        newErrors.push("Valid salary for Year 3 is required.")
    } else if (currentStep === 2) {
      if (
        formData.retirementOption === "C" &&
        (!formData.beneficiaryAge || isNaN(Number.parseFloat(formData.beneficiaryAge)))
      )
        newErrors.push("Please enter a valid beneficiary age for Option C.")
    }

    setErrors(newErrors)
    return newErrors.length === 0
  }

  const nextStep = () => {
    if (validateCurrentStep()) {
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1)
        window.scrollTo({ top: 0, behavior: "smooth" })
      }
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const saveCalculation = async () => {
    if (!session) {
      toast.error("Please sign in to save calculations")
      setShowSaveDialog(false)
      return
    }

    if (!calculationResult) {
      toast.error("No calculation to save")
      return
    }

    setIsSaving(true)
    try {
      const calcData = {
        calculationName: calculationName || `Calculation ${new Date().toLocaleDateString()}`,
        retirementDate: new Date(
          new Date().getFullYear() + (parseInt(formData.age) - new Date().getFullYear() + 
          new Date(new Date().getFullYear(), 0, 1).getFullYear() - 
          new Date().getFullYear()),
          0,
          1
        ).toISOString(),
        retirementAge: parseInt(formData.age),
        yearsOfService: parseFloat(formData.yearsOfService),
        averageSalary: calculationResult.details.averageSalary,
        retirementGroup: formData.group.replace("GROUP_", ""),
        benefitPercentage: calculationResult.details.basePercentage / 100,
        retirementOption: formData.retirementOption,
        monthlyBenefit: calculationResult.monthlyPension,
        annualBenefit: calculationResult.annualPension,
        benefitReduction: calculationResult.details.cappedBase ? 
          (1 - (calculationResult.annualPension / calculationResult.details.baseAnnualPension)) * 100 : 
          undefined,
        survivorBenefit: calculationResult.survivorAnnualPension,
        notes: `Service entry: ${formData.serviceEntryDate}, Beneficiary age: ${formData.beneficiaryAge || 'N/A'}`,
      }

      const success = await saveCalculationToDb(calcData)
      if (success) {
        toast.success("Calculation saved successfully")
        setShowSaveDialog(false)
        setCalculationName("")
      }
    } catch (error) {
      console.error("Error saving calculation:", error)
      toast.error("Failed to save calculation")
    } finally {
      setIsSaving(false)
    }
  }

  const calculatePension = () => {
    if (!validateCurrentStep()) return

    setErrors([])
    setEligibilityWarning("")
    setIsCalculating(true)

    // Simulate calculation delay for better UX
    setTimeout(() => {
      const enteredAge = Number.parseFloat(formData.age)
      const enteredYOS = Number.parseFloat(formData.yearsOfService)
      const group = formData.group
      const serviceEntry = formData.serviceEntryDate

      // Check eligibility
      const eligibility = checkEligibility(Math.floor(enteredAge), enteredYOS, group, serviceEntry)
      if (!eligibility.eligible) {
        setEligibilityWarning(eligibility.message)
        setIsCalculating(false)
        return
      }

      // Calculate average salary
      const salary1 = Number.parseFloat(formData.salary1)
      const salary2 = Number.parseFloat(formData.salary2)
      const salary3 = Number.parseFloat(formData.salary3)
      const averageSalary = (salary1 + salary2 + salary3) / 3

      // Get benefit factor
      const benefitFactorMain = getBenefitFactor(Math.floor(enteredAge), group, serviceEntry, enteredYOS)
      if (benefitFactorMain === 0) {
        setErrors([
          `No base benefit factor for age ${Math.floor(enteredAge)} in ${group} under the applicable rules (service entry/YOS).`,
        ])
        setIsCalculating(false)
        return
      }

      // Calculate base pension
      const MAX_PENSION_PERCENTAGE_OF_SALARY = 0.8
      let totalBenefitPercentageBase = benefitFactorMain * enteredYOS
      let baseAnnualPension = averageSalary * totalBenefitPercentageBase
      const maxPensionAllowedBase = averageSalary * MAX_PENSION_PERCENTAGE_OF_SALARY
      let cappedBase = false

      if (baseAnnualPension > maxPensionAllowedBase) {
        baseAnnualPension = maxPensionAllowedBase
        cappedBase = true
        totalBenefitPercentageBase = MAX_PENSION_PERCENTAGE_OF_SALARY
      }

      if (baseAnnualPension < 0) baseAnnualPension = 0

      // Apply retirement option
      const optionResult = calculatePensionWithOption(
        baseAnnualPension,
        formData.retirementOption,
        enteredAge,
        formData.beneficiaryAge,
      )

      const finalAnnualPension = optionResult.pension
      const finalMonthlyPension = finalAnnualPension / 12

      // Generate projection data
      const projectionData = generateProjectionTable(
        group,
        enteredAge,
        enteredYOS,
        averageSalary,
        formData.retirementOption,
        formData.beneficiaryAge,
        serviceEntry,
      )

      // Set results
      setCalculationResult({
        selectedOption: optionResult.description,
        optionWarning: optionResult.warning,
        annualPension: finalAnnualPension,
        monthlyPension: finalMonthlyPension,
        survivorAnnualPension: optionResult.survivorPension,
        survivorMonthlyPension: optionResult.survivorPension / 12,
        details: {
          averageSalary,
          group,
          age: enteredAge,
          yearsOfService: enteredYOS,
          basePercentage: totalBenefitPercentageBase * 100,
          baseAnnualPension,
          cappedBase,
        },
        projectionData,
      })

      setShowResults(true)
      setCurrentStep(3) // Move to results step
      setIsCalculating(false)
    }, 1500)
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="serviceEntryDate">When did you enter service?</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <HelpCircle className="h-4 w-4" />
                        <span className="sr-only">Help</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>Your service entry date affects eligibility requirements and benefit calculations.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Select
                value={formData.serviceEntryDate}
                onValueChange={(value) => handleSelectChange("serviceEntryDate", value)}
              >
                <SelectTrigger id="serviceEntryDate">
                  <SelectValue placeholder="Select service entry period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="before_2012">Before April 2, 2012</SelectItem>
                  <SelectItem value="after_2012">On or after April 2, 2012</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="age">Your Age at Retirement:</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <HelpCircle className="h-4 w-4" />
                        <span className="sr-only">Help</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>Enter your age at the time you plan to retire. This affects your benefit factor.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Input
                id="age"
                name="age"
                type="number"
                placeholder="e.g., 60"
                value={formData.age}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="yearsOfService">Years of Creditable Service (at retirement):</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <HelpCircle className="h-4 w-4" />
                        <span className="sr-only">Help</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>Total years of service credit you'll have at retirement. Includes purchased service credit.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Input
                id="yearsOfService"
                name="yearsOfService"
                type="number"
                placeholder="e.g., 30"
                value={formData.yearsOfService}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="group">Your Employee Group:</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <HelpCircle className="h-4 w-4" />
                        <span className="sr-only">Help</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>
                        Group 1: General employees
                        <br />
                        Group 2: Certain hazardous positions
                        <br />
                        Group 3: State police
                        <br />
                        Group 4: Police officers, firefighters
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Select value={formData.group} onValueChange={(value) => handleSelectChange("group", value)}>
                <SelectTrigger id="group">
                  <SelectValue placeholder="Select your group" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GROUP_1">Group I (General Employees)</SelectItem>
                  <SelectItem value="GROUP_2">Group II (Certain Hazardous Positions)</SelectItem>
                  <SelectItem value="GROUP_3">Group III (State Police)</SelectItem>
                  <SelectItem value="GROUP_4">Group IV (Police Officers and Firefighters)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )
      case 1:
        return (
          <div className="space-y-6">
            <div className="bg-muted/50 p-4 rounded-lg mb-4">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Enter your three highest <strong>consecutive</strong> annual rates of regular compensation. Exclude
                    bonuses, overtime, severance pay, etc.
                  </p>
                  <p className="text-sm">
                    <strong>Need help finding your salary history?</strong>
                    <br />
                    <a 
                      href="https://cthrupayroll.mass.gov/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline font-medium"
                    >
                      Visit the Massachusetts State Payroll System →
                    </a>
                    <br />
                    <span className="text-muted-foreground">
                      Massachusetts state employees can look up their base pay for the past 3 years
                    </span>
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="salary1">Highest Salary - Year 1 ($):</Label>
              <Input
                id="salary1"
                name="salary1"
                type="number"
                placeholder="e.g., 70000"
                value={formData.salary1}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="salary2">Highest Salary - Year 2 ($):</Label>
              <Input
                id="salary2"
                name="salary2"
                type="number"
                placeholder="e.g., 72000"
                value={formData.salary2}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="salary3">Highest Salary - Year 3 ($):</Label>
              <Input
                id="salary3"
                name="salary3"
                type="number"
                placeholder="e.g., 74000"
                value={formData.salary3}
                onChange={handleInputChange}
              />
            </div>

            {formData.salary1 && formData.salary2 && formData.salary3 && (
              <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                <p className="text-sm font-medium">
                  Average Salary: $
                  {(
                    (Number.parseFloat(formData.salary1) +
                      Number.parseFloat(formData.salary2) +
                      Number.parseFloat(formData.salary3)) /
                    3
                  ).toFixed(2)}
                </p>
              </div>
            )}
          </div>
        )
      case 2:
        return (
          <div className="space-y-6">
            <div className="bg-muted/50 p-4 rounded-lg mb-4">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                <p className="text-sm text-muted-foreground">
                  Your retirement option selection affects your monthly benefit amount and what happens to your pension
                  after your death.
                </p>
              </div>
            </div>

            <RadioGroup value={formData.retirementOption} onValueChange={handleRadioChange} className="space-y-4">
              <div className="border rounded-lg p-4 transition-colors hover:bg-muted/20">
                <div className="flex items-center">
                  <RadioGroupItem value="A" id="optionA" />
                  <Label htmlFor="optionA" className="ml-2 font-medium">
                    Option A: Full Allowance
                  </Label>
                </div>
                <p className="text-sm text-muted-foreground mt-2 ml-6">
                  Provides your full retirement allowance. Payments stop upon your death.
                </p>
              </div>

              <div className="border rounded-lg p-4 transition-colors hover:bg-muted/20">
                <div className="flex items-center">
                  <RadioGroupItem value="B" id="optionB" />
                  <Label htmlFor="optionB" className="ml-2 font-medium">
                    Option B: Annuity Protection
                  </Label>
                </div>
                <p className="text-sm text-muted-foreground mt-2 ml-6">
                  Slightly reduced lifetime allowance (approx. 1-5% less). Upon death, beneficiary receives remaining
                  accumulated deductions. Beneficiary can be changed.
                </p>
              </div>

              <div className="border rounded-lg p-4 transition-colors hover:bg-muted/20">
                <div className="flex items-center">
                  <RadioGroupItem value="C" id="optionC" />
                  <Label htmlFor="optionC" className="ml-2 font-medium">
                    Option C: Joint Survivor
                  </Label>
                </div>
                <p className="text-sm text-muted-foreground mt-2 ml-6">
                  Reduced lifetime allowance (approx. 7-15%+ less). Upon death, your designated beneficiary receives
                  2/3rds of your allowance for their life. If beneficiary predeceases, allowance "pops up".
                </p>

                {formData.retirementOption === "C" && (
                  <div className="mt-4 ml-6 space-y-2">
                    <Label htmlFor="beneficiaryAge">Beneficiary's Age (at your retirement):</Label>
                    <Input
                      id="beneficiaryAge"
                      name="beneficiaryAge"
                      type="number"
                      placeholder="e.g., 58"
                      className="max-w-xs"
                      value={formData.beneficiaryAge}
                      onChange={handleInputChange}
                    />
                  </div>
                )}
              </div>
            </RadioGroup>
          </div>
        )
      case 3:
        return (
          <div>
            {isCalculating ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                <p className="text-muted-foreground">Calculating your pension estimate...</p>
              </div>
            ) : showResults && calculationResult ? (
              <>
                <PensionResults result={calculationResult} />
                
                {/* Save Calculation Button */}
                <div className="mt-6 flex flex-col items-center space-y-4">
                  {!session ? (
                    <div className="text-center">
                      <Button disabled className="gap-2">
                        <Save className="h-4 w-4" />
                        Save Calculation
                      </Button>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Sign in to save calculations
                      </p>
                    </div>
                  ) : !canSaveCalculations && !isPremium ? (
                    <div className="text-center space-y-3">
                      <div className="relative">
                        <Button disabled className="gap-2">
                          <Save className="h-4 w-4" />
                          Save Calculation
                        </Button>
                        <Badge className="absolute -top-2 -right-2 bg-amber-500 hover:bg-amber-600">
                          <Crown className="mr-1 h-3 w-3" />
                          Premium
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        You've reached the limit of {maxSavedCalculations} saved calculations for free accounts.
                      </p>
                      <Button size="sm" asChild>
                        <Link href="/subscribe">
                          <Crown className="mr-2 h-4 w-4" />
                          Upgrade for Unlimited Saves
                        </Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Button
                        onClick={() => setShowSaveDialog(true)}
                        variant="default"
                        className="gap-2"
                      >
                        <Save className="h-4 w-4" />
                        Save Calculation
                      </Button>
                      {!isPremium && (
                        <p className="mt-2 text-sm text-muted-foreground">
                          {savedCalculationsCount}/{maxSavedCalculations} saved calculations used
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-8">
                  <Tabs defaultValue="projection" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="projection">Projection Table</TabsTrigger>
                      <TabsTrigger value="details">Calculation Details</TabsTrigger>
                      <TabsTrigger value="social-security">Social Security</TabsTrigger>
                      <TabsTrigger value="combined">Combined Analysis</TabsTrigger>
                    </TabsList>
                    <TabsContent value="projection" className="pt-4">
                      {calculationResult.projectionData && calculationResult.projectionData.rows.length > 0 ? (
                        <ProjectionTable data={calculationResult.projectionData} option={formData.retirementOption} />
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-muted-foreground">No projection data available for your inputs.</p>
                        </div>
                      )}
                    </TabsContent>
                    <TabsContent value="details" className="pt-4">
                      <Card>
                        <CardContent className="pt-6">
                          <h3 className="text-lg font-medium mb-4">Calculation Details</h3>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div className="text-muted-foreground">Average Salary:</div>
                              <div className="font-medium">${calculationResult.details.averageSalary.toFixed(2)}</div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div className="text-muted-foreground">Employee Group:</div>
                              <div className="font-medium">{calculationResult.details.group}</div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div className="text-muted-foreground">Age at Retirement:</div>
                              <div className="font-medium">{calculationResult.details.age}</div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div className="text-muted-foreground">Years of Service:</div>
                              <div className="font-medium">{calculationResult.details.yearsOfService}</div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div className="text-muted-foreground">Base Benefit Percentage:</div>
                              <div className="font-medium">
                                {calculationResult.details.basePercentage.toFixed(1)}%
                                {calculationResult.details.cappedBase && " (Capped at 80%)"}
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div className="text-muted-foreground">Base Annual Pension (Option A):</div>
                              <div className="font-medium">
                                ${calculationResult.details.baseAnnualPension.toFixed(2)}
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div className="text-muted-foreground">Selected Option:</div>
                              <div className="font-medium">{calculationResult.selectedOption}</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                    <TabsContent value="social-security" className="pt-4">
                      <PremiumGate
                        feature="social_security"
                        title="Social Security Integration"
                        description="Add Social Security benefits to get your complete retirement income picture"
                      >
                        <SocialSecurityCalculator />
                      </PremiumGate>
                    </TabsContent>
                    <TabsContent value="combined" className="pt-4">
                      <PremiumGate
                        feature="social_security"
                        title="Combined Income Analysis"
                        description="See your pension and Social Security benefits combined with optimization suggestions"
                      >
                        <CombinedRetirementCalculator
                          pensionResult={{
                            monthlyPension: calculationResult.monthlyPension,
                            annualPension: calculationResult.annualPension,
                            retirementAge: calculationResult.details.age,
                            retirementOption: formData.retirementOption,
                            details: calculationResult.details,
                          }}
                          formData={{
                            ...formData,
                            averageSalary: calculationResult.details.averageSalary
                          }}
                        />
                      </PremiumGate>
                    </TabsContent>
                  </Tabs>
                </div>

                <div className="mt-8 flex justify-center">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setCurrentStep(0)
                      setShowResults(false)
                      window.scrollTo({ top: 0, behavior: "smooth" })
                    }}
                  >
                    Start New Calculation
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <Button onClick={calculatePension} size="lg" className="gap-2">
                  <Calculator className="h-5 w-5" />
                  Calculate Pension
                </Button>
              </div>
            )}
          </div>
        )
      default:
        return null
    }
  }

  return (
    <>
      <Card className="shadow-lg rounded-xl overflow-hidden">
        <CardContent className="p-0">
          {/* Progress bar */}
          <div className="bg-muted/30 p-4 border-b">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold">Pension Estimator</h2>
              <span className="text-sm text-muted-foreground">
                Step {currentStep + 1} of {steps.length}
              </span>
            </div>
            <Progress value={((currentStep + 1) / steps.length) * 100} className="h-2" />
            <div className="grid grid-cols-4 gap-1 mt-2">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={`text-xs text-center ${
                    index === currentStep ? "text-primary font-medium" : "text-muted-foreground"
                  }`}
                >
                  {step.title}
                </div>
              ))}
            </div>
          </div>

          {/* Step content */}
          <div className="p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {currentStep === 0 && <EligibilityInfo />}
                {renderStepContent()}
              </motion.div>
            </AnimatePresence>

            {errors.length > 0 && (
              <div className="mt-4">
                {errors.map((error, index) => (
                  <Alert variant="destructive" key={index} className="mb-2">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                ))}
              </div>
            )}

            {eligibilityWarning && (
              <Alert className="mt-6 bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-900/30 dark:text-yellow-600">
                <AlertDescription>{eligibilityWarning}</AlertDescription>
              </Alert>
            )}
          </div>

          {/* Navigation buttons */}
          {currentStep < 3 && (
            <div className="p-6 bg-muted/20 border-t flex justify-between">
              <div className="flex gap-2">
                <Button variant="outline" onClick={prevStep} disabled={currentStep === 0}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <Button variant="ghost" size="icon" onClick={clearSavedData} title="Clear saved data">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                  >
                    <path d="M3 6h18"></path>
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                    <line x1="10" y1="11" x2="10" y2="17"></line>
                    <line x1="14" y1="11" x2="14" y2="17"></line>
                  </svg>
                </Button>
              </div>
              {currentStep < 2 ? (
                <Button onClick={nextStep}>
                  Next <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={calculatePension} className="gap-2">
                  <Calculator className="h-4 w-4" /> Calculate
                </Button>
              )}
            </div>
          )}
          {showNotification && (
            <ToastNotification
              message="Your previous data has been loaded. Your inputs will be automatically saved as you type."
              onClose={() => setShowNotification(false)}
            />
          )}
          {savedMessage && <ToastNotification message={savedMessage} onClose={() => setSavedMessage("")} />}
        </CardContent>
      </Card>

      {/* Save Calculation Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Calculation</DialogTitle>
            <DialogDescription>
              Give your calculation a name to easily find it later.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="calculationName">Calculation Name</Label>
              <Input
                id="calculationName"
                placeholder="e.g., Retirement at 65 with Option A"
                value={calculationName}
                onChange={(e) => setCalculationName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
              Cancel
            </Button>
            <Button onClick={saveCalculation} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
