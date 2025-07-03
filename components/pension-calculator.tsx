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
import { ArrowLeft, ArrowRight, Calculator, HelpCircle, Info, Save, Crown, CheckCircle } from "lucide-react"
import { announceToScreenReader, announceFormErrors, announceFormSuccess } from "@/lib/accessibility/aria-live"
import { focusFirstErrorField } from "@/lib/accessibility/focus-management"
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
import { EnhancedPremiumGate } from "@/components/premium/enhanced-premium-gate"
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
import { CalculatorChart } from "@/components/calculator/calculator-chart"


// Helper functions for date format conversion
const convertISOToDateInput = (isoDate: string | null | undefined): string => {
  if (!isoDate) return ""
  try {
    const date = new Date(isoDate)
    if (isNaN(date.getTime())) return ""
    // Convert to YYYY-MM-DD format for HTML date input
    return date.toISOString().split('T')[0]
  } catch (error) {
    console.warn('Error converting ISO date to input format:', error)
    return ""
  }
}

const convertDateInputToISO = (dateInput: string | null | undefined): string => {
  if (!dateInput) return ""
  try {
    // HTML date input gives us YYYY-MM-DD format
    // Convert to ISO string for API
    const date = new Date(dateInput + 'T00:00:00.000Z')
    if (isNaN(date.getTime())) return ""
    return date.toISOString()
  } catch (error) {
    console.warn('Error converting date input to ISO format:', error)
    return ""
  }
}

const steps = [
  { id: "calculator", title: "Pension Calculator" },
  { id: "advanced", title: "Advanced Options" },
  { id: "results", title: "Results" },
]

const STORAGE_KEY = "ma-pension-calculator-data"
const SESSION_STORAGE_KEY = "ma-pension-calculator-session"

// Helper function to get default retirement age by group (for auto-population)
const getDefaultRetirementAge = (group: string): number => {
  switch (group) {
    case 'GROUP_1': return 60 // Group 1: Default to minimum eligible age
    case 'GROUP_2': return 55 // Group 2: Default to minimum eligible age
    case 'GROUP_3': return 55 // Group 3: Keep existing default (practical age)
    case 'GROUP_4': return 50 // Group 4: Default to minimum eligible age
    default: return 60
  }
}

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
    // Advanced options
    servicePurchaseYears: "",
    servicePurchaseCost: "",
    healthcareElection: "",
    taxWithholding: "",
    phaseRetirement: false,
    partTimeYears: "",
    beneficiaryName: "",
    beneficiaryRelationship: "",
    currentAge: "",
    membershipDate: "",
    additionalService: "",
  })

  const [showNotification, setShowNotification] = useState(false)
  const [isFormDirty, setIsFormDirty] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)

  const searchParams = useSearchParams()
  const router = useRouter()
  const [calculationName, setCalculationName] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [savedMessage, setSavedMessage] = useState("")
  const { data: session } = useSession()

  // Use safe hook calls with error handling
  const retirementData = useRetirementData()
  const subscriptionStatus = useSubscriptionStatus()

  // Safely destructure with fallbacks
  const {
    saveCalculation: saveCalculationToDb,
    profile: userProfile,
    fetchProfile,
    saveProfile
  } = retirementData || {}

  const {
    canSaveCalculations = true,
    maxSavedCalculations = 3,
    savedCalculationsCount = 0,
    isPremium = false
  } = subscriptionStatus || {}

  const [errors, setErrors] = useState<string[]>([])
  const [eligibilityWarning, setEligibilityWarning] = useState("")
  const [calculationResult, setCalculationResult] = useState<any>(null)
  const [showResults, setShowResults] = useState(false)
  const [isCalculating, setIsCalculating] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [validationInProgress, setValidationInProgress] = useState(false)

  // Social Security calculation state
  const [socialSecurityResults, setSocialSecurityResults] = useState<any>(null)

  // Handle Social Security calculation results
  const handleSocialSecurityCalculation = (data: any) => {
    console.log("📊 Received Social Security calculation results:", data)
    setSocialSecurityResults(data)
  }

  // Hydration effect
  useEffect(() => {
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    // Prevent hydration issues by checking if we're in the browser
    if (typeof window === 'undefined' || !isHydrated) return

    try {
      // Try session storage first (for current session), then localStorage (for persistence)
      const sessionData = sessionStorage.getItem(SESSION_STORAGE_KEY)
      const localData = localStorage.getItem(STORAGE_KEY)

      if (sessionData) {
        const parsedData = JSON.parse(sessionData)
        // Ensure all values maintain their proper types to prevent controlled/uncontrolled input issues
        const sanitizedData = Object.keys(formData).reduce((acc, key) => {
          const typedKey = key as keyof typeof formData
          if (parsedData[key] !== undefined && parsedData[key] !== null) {
            // Keep boolean values as booleans, convert others to strings
            if (typeof formData[typedKey] === 'boolean') {
              (acc as any)[typedKey] = Boolean(parsedData[key])
            } else {
              (acc as any)[typedKey] = String(parsedData[key])
            }
          } else {
            (acc as any)[typedKey] = formData[typedKey]
          }
          return acc
        }, {} as typeof formData)
        setFormData(sanitizedData)
        setShowNotification(true)
      } else if (localData) {
        const parsedData = JSON.parse(localData)
        // Ensure all values maintain their proper types to prevent controlled/uncontrolled input issues
        const sanitizedData = Object.keys(formData).reduce((acc, key) => {
          const typedKey = key as keyof typeof formData
          if (parsedData[key] !== undefined && parsedData[key] !== null) {
            // Keep boolean values as booleans, convert others to strings
            if (typeof formData[typedKey] === 'boolean') {
              (acc as any)[typedKey] = Boolean(parsedData[key])
            } else {
              (acc as any)[typedKey] = String(parsedData[key])
            }
          } else {
            (acc as any)[typedKey] = formData[typedKey]
          }
          return acc
        }, {} as typeof formData)
        setFormData(sanitizedData)
        setShowNotification(true)
      }
    } catch (error) {
      console.error("Failed to load from storage:", error)
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

  // Load and integrate user profile data
  useEffect(() => {
    if (session?.user && userProfile) {
      console.log("Loading profile data into calculator:", userProfile)

      // Calculate current age from date of birth
      let calculatedCurrentAge = ""
      if (userProfile.dateOfBirth) {
        const birthDate = new Date(userProfile.dateOfBirth)
        const today = new Date()
        const age = today.getFullYear() - birthDate.getFullYear()
        const monthDiff = today.getMonth() - birthDate.getMonth()
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          calculatedCurrentAge = String(age - 1)
        } else {
          calculatedCurrentAge = String(age)
        }
      }

      // Pre-populate form with profile data (only if fields are empty to avoid overwriting user input)
      setFormData(prevData => {
        const updatedData = {
          ...prevData,
          // Only update if current values are empty
          currentAge: prevData.currentAge || calculatedCurrentAge,
          age: prevData.age || "", // Remove plannedRetirementAge reference
          membershipDate: prevData.membershipDate || convertISOToDateInput(userProfile.membershipDate) || "",
          group: prevData.group || (userProfile.retirementGroup ? `GROUP_${userProfile.retirementGroup.replace("Group ", "")}` : ""),
          retirementOption: prevData.retirementOption || userProfile.retirementOption || "A"
        }

        // Save the updated data to storage
        saveToStorage(updatedData)
        return updatedData
      })
    }
  }, [session?.user, userProfile])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    // Ensure value is always a string to prevent controlled/uncontrolled input issues
    const sanitizedValue = value !== undefined && value !== null ? String(value) : ""
    const updatedData = { ...formData, [name]: sanitizedValue }
    setFormData(updatedData)
    setIsFormDirty(true)
    saveToStorage(updatedData)
  }

  const handleSelectChange = (name: string, value: string | boolean) => {
    // Handle boolean values (like checkboxes) differently from string values
    let sanitizedValue: string | boolean
    if (typeof value === 'boolean') {
      sanitizedValue = value
    } else {
      // Ensure string values are never undefined/null
      sanitizedValue = value !== undefined && value !== null ? String(value) : ""
    }

    let updatedData = { ...formData, [name]: sanitizedValue }

    // Auto-populate retirement age when group changes
    if (name === 'group' && typeof value === 'string') {
      const defaultAge = getDefaultRetirementAge(value)
      // Only update age if it's empty or matches a previous group's default
      if (!formData.age ||
          formData.age === '' ||
          formData.age === '65' ||
          formData.age === getDefaultRetirementAge(formData.group || 'GROUP_1').toString()) {
        updatedData = { ...updatedData, age: defaultAge.toString() }
      }
    }

    setFormData(updatedData)
    setIsFormDirty(true)
    saveToStorage(updatedData)
  }

  const handleRadioChange = (value: string) => {
    const updatedData = { ...formData, retirementOption: value }
    setFormData(updatedData)
    setIsFormDirty(true)
    saveToStorage(updatedData)
  }

  const saveToStorage = (data: typeof formData) => {
    try {
      // Save to both session storage (for current session) and localStorage (for persistence)
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(data))
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch (error) {
      console.error("Failed to save to storage:", error)
    }
  }

  const clearSavedData = () => {
    try {
      // Clear both session and local storage
      sessionStorage.removeItem(SESSION_STORAGE_KEY)
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
        // Advanced options
        servicePurchaseYears: "",
        servicePurchaseCost: "",
        healthcareElection: "",
        taxWithholding: "",
        phaseRetirement: false,
        partTimeYears: "",
        beneficiaryName: "",
        beneficiaryRelationship: "",
        currentAge: "",
        membershipDate: "",
        additionalService: "",
      })
      setIsFormDirty(false)
      setShowNotification(false)
    } catch (error) {
      console.error("Failed to clear storage:", error)
    }
  }

  const validateCurrentStep = async () => {
    setValidationInProgress(true)
    const newErrors: string[] = []

    // Add a small delay for better UX
    await new Promise(resolve => setTimeout(resolve, 100))

    if (currentStep === 0) {
      // Validate all required fields for the consolidated form
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

      // Salary validation
      if (!formData.salary1 || isNaN(Number.parseFloat(formData.salary1)) || Number.parseFloat(formData.salary1) < 0)
        newErrors.push("Valid salary for Year 1 is required.")
      if (!formData.salary2 || isNaN(Number.parseFloat(formData.salary2)) || Number.parseFloat(formData.salary2) < 0)
        newErrors.push("Valid salary for Year 2 is required.")
      if (!formData.salary3 || isNaN(Number.parseFloat(formData.salary3)) || Number.parseFloat(formData.salary3) < 0)
        newErrors.push("Valid salary for Year 3 is required.")

      // Retirement option validation
      if (
        formData.retirementOption === "C" &&
        (!formData.beneficiaryAge || isNaN(Number.parseFloat(formData.beneficiaryAge)))
      )
        newErrors.push("Please enter a valid beneficiary age for Option C.")
    } else if (currentStep === 1) {
      // Advanced options validation - mostly optional fields, but validate if provided
      if (formData.servicePurchaseYears && isNaN(Number.parseFloat(formData.servicePurchaseYears)))
        newErrors.push("Service purchase years must be a valid number.")
      if (formData.servicePurchaseCost && isNaN(Number.parseFloat(formData.servicePurchaseCost)))
        newErrors.push("Service purchase cost must be a valid number.")
      if (formData.partTimeYears && isNaN(Number.parseFloat(formData.partTimeYears)))
        newErrors.push("Part-time years must be a valid number.")
      if (formData.currentAge && isNaN(Number.parseFloat(formData.currentAge)))
        newErrors.push("Current age must be a valid number.")
    }

    setErrors(newErrors)
    setValidationInProgress(false)

    // Announce errors to screen readers
    if (newErrors.length > 0) {
      announceFormErrors(newErrors)
      // Focus the first error field after a short delay
      setTimeout(() => {
        focusFirstErrorField()
      }, 100)
    }

    return newErrors.length === 0
  }

  const nextStep = async () => {
    setIsTransitioning(true)
    const isValid = await validateCurrentStep()

    if (isValid) {
      if (currentStep < steps.length - 1) {
        // Add smooth transition delay
        await new Promise(resolve => setTimeout(resolve, 150))
        setCurrentStep(currentStep + 1)
        window.scrollTo({ top: 0, behavior: "smooth" })
      }
    }
    setIsTransitioning(false)
  }

  const prevStep = async () => {
    if (currentStep > 0) {
      setIsTransitioning(true)
      await new Promise(resolve => setTimeout(resolve, 100))
      setCurrentStep(currentStep - 1)
      window.scrollTo({ top: 0, behavior: "smooth" })
      setIsTransitioning(false)
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

      // Save the calculation to the database
      const success = await saveCalculationToDb(calcData)

      if (success) {
        // Also update the user's profile with key calculated values
        try {
          const profileUpdateData = {
            retirementOption: formData.retirementOption,
            retirementGroup: formData.group.replace("GROUP_", ""),
            // Update other relevant profile fields
            yearsOfService: parseFloat(formData.yearsOfService),
            averageHighest3Years: calculationResult.details.averageSalary
          }

          console.log("Updating profile with calculation data:", profileUpdateData)
          await saveProfile(profileUpdateData as any)

          toast.success("Calculation saved and profile updated")
        } catch (profileError) {
          console.error("Error updating profile:", profileError)
          toast.success("Calculation saved (profile update failed)")
        }

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

  const calculatePension = async () => {
    const isValid = await validateCurrentStep()
    if (!isValid) return

    setErrors([])
    setEligibilityWarning("")
    setIsCalculating(true)

    // Optimized calculation with performance monitoring
    const startTime = performance.now()
    const performCalculation = () => {
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
        group,
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
      setCurrentStep(2) // Move to results step
      setIsCalculating(false)

      // Auto-save key calculation values to profile (if user is logged in)
      if (session?.user && saveProfile) {
        const profileUpdateData = {
          retirementOption: formData.retirementOption,
          retirementGroup: formData.group.replace("GROUP_", ""),
          yearsOfService: parseFloat(formData.yearsOfService),
          averageHighest3Years: averageSalary
        }

        console.log("Auto-saving calculation values to profile:", profileUpdateData)
        // Save silently without showing toast notifications (don't await to avoid blocking)
        saveProfile(profileUpdateData as any).catch(error => {
          console.error("Error auto-saving to profile:", error)
          // Don't show error to user for auto-save failures
        })
      }

      // Performance monitoring
      const endTime = performance.now()
      const calculationTime = endTime - startTime
      if (calculationTime > 2000) {
        console.warn(`Calculation took ${calculationTime.toFixed(2)}ms - exceeding 2s target`)
      }
    }

    // Optimized animation with reduced frame count for better performance
    let frameCount = 0
    const animateCalculation = () => {
      frameCount++
      if (frameCount >= 45) { // Reduced to ~0.75 seconds at 60fps for better performance
        performCalculation()
      } else {
        requestAnimationFrame(animateCalculation)
      }
    }
    requestAnimationFrame(animateCalculation)
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-8">
            {/* Consolidated Form Header */}
            <div className="text-center mb-8">
              <h3 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                Complete Your Pension Calculation
              </h3>
              <p className="text-muted-foreground text-sm lg:text-base">
                Fill out all sections below to calculate your Massachusetts retirement benefits
              </p>
            </div>

            {/* Error Display */}
            {errors.length > 0 && (
              <Alert variant="destructive" role="alert" aria-live="assertive">
                <AlertDescription>
                  <div className="space-y-1">
                    <p className="font-medium">Please correct the following errors:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {errors.map((error, index) => (
                        <li key={index} id={`error-${index}`}>{error}</li>
                      ))}
                    </ul>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Eligibility Warning */}
            {eligibilityWarning && (
              <Alert className="bg-yellow-50 border-yellow-200 text-yellow-800" role="alert">
                <AlertDescription>
                  <strong>Eligibility Notice:</strong> {eligibilityWarning}
                </AlertDescription>
              </Alert>
            )}

            {/* Multi-section layout for desktop */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">

              {/* Personal Information Section */}
              <fieldset className="bg-green-50 dark:bg-green-950/20 p-6 rounded-lg border border-green-200 dark:border-green-800">
                <legend className="font-semibold text-green-900 dark:text-green-100 mb-4 flex items-center gap-2">
                  <svg
                    className="h-5 w-5 text-green-600 dark:text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Personal Information
                </legend>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="serviceEntryDate">Service Entry Period:</Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              aria-label="Service entry period help"
                            >
                              <HelpCircle className="h-3 w-3" aria-hidden="true" />
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
                        <SelectValue placeholder="Select period" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="before_2012">Before April 2, 2012</SelectItem>
                        <SelectItem value="after_2012">On or after April 2, 2012</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="age">Age at Retirement:</Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              aria-label="Age at retirement help"
                            >
                              <HelpCircle className="h-3 w-3" aria-hidden="true" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p>Enter your age at the time you plan to retire. Minimum eligible ages: Group 1 (60), Group 2 (55), Group 3 (any age with 20+ years), Group 4 (50). This affects your benefit factor.</p>
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
                      aria-invalid={errors.some(error => error.includes('age')) ? 'true' : 'false'}
                      aria-describedby={errors.some(error => error.includes('age')) ? 'age-error' : undefined}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="yearsOfService">Years of Service:</Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              aria-label="Years of service help"
                            >
                              <HelpCircle className="h-3 w-3" aria-hidden="true" />
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
                      aria-invalid={errors.some(error => error.includes('years of service')) ? 'true' : 'false'}
                      aria-describedby={errors.some(error => error.includes('years of service')) ? 'years-error' : undefined}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="group">Employee Group:</Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              aria-label="Employee group help"
                            >
                              <HelpCircle className="h-3 w-3" aria-hidden="true" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p>
                              Group 1: General employees<br />
                              Group 2: Certain hazardous positions<br />
                              Group 3: State police<br />
                              Group 4: Police officers, firefighters
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <Select value={formData.group || ''} onValueChange={(value) => handleSelectChange("group", value)}>
                      <SelectTrigger id="group">
                        <SelectValue placeholder="Select group" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GROUP_1">Group I (General Employees) - min. age 60</SelectItem>
                        <SelectItem value="GROUP_2">Group II (Probation/Court Officers) - min. age 55</SelectItem>
                        <SelectItem value="GROUP_3">Group III (State Police) - any age with 20+ years</SelectItem>
                        <SelectItem value="GROUP_4">Group IV (Public Safety/Corrections) - min. age 50</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </fieldset>

              {/* Salary Information Section */}
              <fieldset className="bg-purple-50 dark:bg-purple-950/20 p-6 rounded-lg border border-purple-200 dark:border-purple-800">
                <legend className="font-semibold text-purple-900 dark:text-purple-100 mb-4 flex items-center gap-2">
                  <svg
                    className="h-5 w-5 text-purple-600 dark:text-purple-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                  Salary Information
                </legend>

                <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-lg mb-4">
                  <div className="flex items-start gap-2">
                    <Info className="h-4 w-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-purple-800 dark:text-purple-200">
                      <p className="mb-1">Enter your three highest <strong>consecutive</strong> annual rates of regular compensation.</p>
                      <a
                        href="https://cthrupayroll.mass.gov/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-600 dark:text-purple-400 hover:underline font-medium"
                      >
                        Check MA Payroll System →
                      </a>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
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
                    <div className="bg-purple-200 dark:bg-purple-800/30 p-3 rounded-lg border border-purple-300 dark:border-purple-700">
                      <p className="text-sm font-medium text-purple-900 dark:text-purple-100">
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
              </fieldset>

              {/* Retirement Options Section */}
              <fieldset className="bg-orange-50 dark:bg-orange-950/20 p-6 rounded-lg border border-orange-200 dark:border-orange-800 lg:col-span-2 xl:col-span-1">
                <legend className="font-semibold text-orange-900 dark:text-orange-100 mb-4 flex items-center gap-2">
                  <svg
                    className="h-5 w-5 text-orange-600 dark:text-orange-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Retirement Options
                </legend>

                <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-lg mb-4">
                  <div className="flex items-start gap-2">
                    <Info className="h-4 w-4 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-orange-800 dark:text-orange-200">
                      Your retirement option affects your monthly benefit and what happens after your death.
                    </p>
                  </div>
                </div>

                <RadioGroup value={formData.retirementOption} onValueChange={handleRadioChange} className="space-y-3">
                  <div className="border border-orange-200 dark:border-orange-700 rounded-lg p-3 transition-colors hover:bg-orange-100/50 dark:hover:bg-orange-900/20">
                    <div className="flex items-center">
                      <RadioGroupItem value="A" id="optionA" />
                      <Label htmlFor="optionA" className="ml-2 font-medium text-sm">
                        Option A: Full Allowance (100%)
                      </Label>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 ml-6">
                      Full retirement allowance. Payments stop upon death.
                    </p>
                  </div>

                  <div className="border border-orange-200 dark:border-orange-700 rounded-lg p-3 transition-colors hover:bg-orange-100/50 dark:hover:bg-orange-900/20">
                    <div className="flex items-center">
                      <RadioGroupItem value="B" id="optionB" />
                      <Label htmlFor="optionB" className="ml-2 font-medium text-sm">
                        Option B: Annuity Protection
                      </Label>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 ml-6">
                      Reduced allowance (1-5% less based on age). Beneficiary receives remaining accumulated deductions.
                    </p>
                  </div>

                  <div className="border border-orange-200 dark:border-orange-700 rounded-lg p-3 transition-colors hover:bg-orange-100/50 dark:hover:bg-orange-900/20">
                    <div className="flex items-center">
                      <RadioGroupItem value="C" id="optionC" />
                      <Label htmlFor="optionC" className="ml-2 font-medium text-sm">
                        Option C: Joint & Survivor (66.67%)
                      </Label>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 ml-6">
                      Reduced allowance (7-15% less). Beneficiary receives exactly 66.67% of allowance for life.
                    </p>

                    {formData.retirementOption === "C" && (
                      <div className="mt-3 ml-6 space-y-2">
                        <Label htmlFor="beneficiaryAge" className="text-sm">Beneficiary's Age (at your retirement):</Label>
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
              </fieldset>
            </div>

            {/* Calculate Button */}
            <div className="text-center pt-6">
              <Button
                onClick={calculatePension}
                size="lg"
                className="gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200"
                disabled={isCalculating}
              >
                {isCalculating ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
                    <span className="text-base font-medium">Calculating...</span>
                  </>
                ) : (
                  <>
                    <Calculator className="h-5 w-5" />
                    <span className="text-base font-medium">Calculate My Pension</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        )
      case 1:
        return (
          <div className="space-y-6">
            <div className="bg-muted/50 p-4 rounded-lg mb-4">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                <p className="text-sm text-muted-foreground">
                  These advanced options help provide more accurate calculations and planning scenarios. All fields are optional.
                </p>
              </div>
            </div>

            {/* Multi-column layout for desktop */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Service Purchase & Additional Service */}
              <div className="space-y-6">
                <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-3">Service Purchase Options</h4>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="servicePurchaseYears">Additional Service Years to Purchase:</Label>
                      <Input
                        id="servicePurchaseYears"
                        name="servicePurchaseYears"
                        type="number"
                        step="0.1"
                        placeholder="e.g., 2.5"
                        value={formData.servicePurchaseYears}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="servicePurchaseCost">Estimated Purchase Cost ($):</Label>
                      <Input
                        id="servicePurchaseCost"
                        name="servicePurchaseCost"
                        type="number"
                        placeholder="e.g., 25000"
                        value={formData.servicePurchaseCost}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="membershipDate">Membership Start Date:</Label>
                      <Input
                        id="membershipDate"
                        name="membershipDate"
                        type="date"
                        value={formData.membershipDate}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 dark:bg-purple-950/20 p-4 rounded-lg">
                  <h4 className="font-medium text-purple-900 dark:text-purple-100 mb-3">Retirement Planning</h4>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentAge">Current Age:</Label>
                      <Input
                        id="currentAge"
                        name="currentAge"
                        type="number"
                        placeholder="e.g., 55"
                        value={formData.currentAge}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="phaseRetirement"
                        checked={formData.phaseRetirement}
                        onChange={(e) => handleSelectChange("phaseRetirement", e.target.checked)}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor="phaseRetirement" className="text-sm">
                        Considering phased retirement (part-time work)
                      </Label>
                    </div>

                    {formData.phaseRetirement && (
                      <div className="space-y-2 ml-6">
                        <Label htmlFor="partTimeYears">Years of Part-Time Work:</Label>
                        <Input
                          id="partTimeYears"
                          name="partTimeYears"
                          type="number"
                          step="0.5"
                          placeholder="e.g., 3"
                          value={formData.partTimeYears}
                          onChange={handleInputChange}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column - Healthcare & Tax Options */}
              <div className="space-y-6">
                <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg">
                  <h4 className="font-medium text-green-900 dark:text-green-100 mb-3">Healthcare & Benefits</h4>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="healthcareElection">Healthcare Election:</Label>
                      <Select
                        value={formData.healthcareElection}
                        onValueChange={(value) => handleSelectChange("healthcareElection", value)}
                      >
                        <SelectTrigger id="healthcareElection">
                          <SelectValue placeholder="Select healthcare option" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="continue">Continue Current Coverage</SelectItem>
                          <SelectItem value="medicare">Medicare Supplement</SelectItem>
                          <SelectItem value="decline">Decline Coverage</SelectItem>
                          <SelectItem value="spouse">Spouse's Coverage</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="taxWithholding">Federal Tax Withholding (%):</Label>
                      <Select
                        value={formData.taxWithholding}
                        onValueChange={(value) => handleSelectChange("taxWithholding", value)}
                      >
                        <SelectTrigger id="taxWithholding">
                          <SelectValue placeholder="Select withholding percentage" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">0% - No withholding</SelectItem>
                          <SelectItem value="10">10%</SelectItem>
                          <SelectItem value="12">12%</SelectItem>
                          <SelectItem value="15">15%</SelectItem>
                          <SelectItem value="20">20%</SelectItem>
                          <SelectItem value="22">22%</SelectItem>
                          <SelectItem value="25">25%</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="bg-orange-50 dark:bg-orange-950/20 p-4 rounded-lg">
                  <h4 className="font-medium text-orange-900 dark:text-orange-100 mb-3">Beneficiary Information</h4>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="beneficiaryName">Primary Beneficiary Name:</Label>
                      <Input
                        id="beneficiaryName"
                        name="beneficiaryName"
                        type="text"
                        placeholder="e.g., Jane Smith"
                        value={formData.beneficiaryName}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="beneficiaryRelationship">Relationship:</Label>
                      <Select
                        value={formData.beneficiaryRelationship}
                        onValueChange={(value) => handleSelectChange("beneficiaryRelationship", value)}
                      >
                        <SelectTrigger id="beneficiaryRelationship">
                          <SelectValue placeholder="Select relationship" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="spouse">Spouse</SelectItem>
                          <SelectItem value="child">Child</SelectItem>
                          <SelectItem value="parent">Parent</SelectItem>
                          <SelectItem value="sibling">Sibling</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Summary of Advanced Options */}
            {(formData.servicePurchaseYears || formData.healthcareElection || formData.phaseRetirement) && (
              <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                <h4 className="font-medium mb-2">Advanced Options Summary:</h4>
                <div className="text-sm space-y-1">
                  {formData.servicePurchaseYears && (
                    <p>• Service Purchase: {formData.servicePurchaseYears} years</p>
                  )}
                  {formData.healthcareElection && (
                    <p>• Healthcare: {formData.healthcareElection.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</p>
                  )}
                  {formData.phaseRetirement && (
                    <p>• Phased retirement planned for {formData.partTimeYears || 'unspecified'} years</p>
                  )}
                  {formData.taxWithholding && (
                    <p>• Tax withholding: {formData.taxWithholding}%</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )
      case 3:
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
                    Option A: Full Allowance (100%)
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
                  Reduced lifetime allowance (1-5% less based on age). Upon death, beneficiary receives remaining
                  accumulated deductions. Beneficiary can be changed.
                </p>
              </div>

              <div className="border rounded-lg p-4 transition-colors hover:bg-muted/20">
                <div className="flex items-center">
                  <RadioGroupItem value="C" id="optionC" />
                  <Label htmlFor="optionC" className="ml-2 font-medium">
                    Option C: Joint & Survivor (66.67%)
                  </Label>
                </div>
                <p className="text-sm text-muted-foreground mt-2 ml-6">
                  Reduced lifetime allowance (7-15% less based on ages). Upon death, your designated beneficiary receives
                  exactly 66.67% (two-thirds) of your allowance for their life. If beneficiary predeceases, allowance "pops up".
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
      case 2:
        return (
          <div>
            {isCalculating ? (
              <div className="flex flex-col items-center justify-center py-8 sm:py-12">
                <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-primary mb-3 sm:mb-4"></div>
                <p className="text-sm sm:text-base text-muted-foreground">Calculating your pension estimate...</p>
              </div>
            ) : showResults && calculationResult ? (
              <div className="space-y-6 sm:space-y-8">
                {/* Mobile-First Layout: Calculator Form First, Results Below */}
                <div className="lg:hidden">
                  {/* Mobile: Show calculator form first */}
                  <div className="mb-6">
                    <Card className="border-0 shadow-md bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-900/20">
                      <CardContent className="p-4 sm:p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                            Recalculate with Different Values
                          </h3>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentStep(1)}
                            className="text-xs sm:text-sm min-h-[44px] px-3 sm:px-4 touch-manipulation"
                          >
                            <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                            <span className="hidden sm:inline">Edit Values</span>
                            <span className="sm:hidden">Edit</span>
                          </Button>
                        </div>
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          Want to try different scenarios? Go back to modify your inputs and see how they affect your pension.
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Mobile: Results section below */}
                  <PensionResults result={calculationResult} />

                  {/* Mobile: Chart below results */}
                  <div className="mt-6">
                    <CalculatorChart
                      calculationData={{
                        averageSalary: calculationResult.details.averageSalary,
                        group: calculationResult.details.group,
                        age: calculationResult.details.age,
                        yearsOfService: calculationResult.details.yearsOfService,
                        serviceEntry: formData.serviceEntryDate
                      }}
                      className="mb-4 sm:mb-6"
                    />
                  </div>
                </div>

                {/* Desktop Layout: Side-by-side or traditional layout */}
                <div className="hidden lg:block">
                  <PensionResults result={calculationResult} />

                  {/* Interactive Retirement Benefits Chart */}
                  <div className="mt-8">
                    <CalculatorChart
                      calculationData={{
                        averageSalary: calculationResult.details.averageSalary,
                        group: calculationResult.details.group,
                        age: calculationResult.details.age,
                        yearsOfService: calculationResult.details.yearsOfService,
                        serviceEntry: formData.serviceEntryDate
                      }}
                      className="mb-6"
                    />
                  </div>
                </div>

                {/* Mobile: Save Calculation Button */}
                <div className="lg:hidden mt-6 flex flex-col items-center space-y-4">
                  {!session ? (
                    <div className="text-center">
                      <Button disabled className="gap-2 min-h-[44px] px-4 touch-manipulation">
                        <Save className="h-4 w-4" />
                        <span className="text-sm">Save Calculation</span>
                      </Button>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Sign in to save calculations
                      </p>
                    </div>
                  ) : !canSaveCalculations && !isPremium ? (
                    <div className="text-center space-y-3">
                      <div className="relative">
                        <Button disabled className="gap-2 min-h-[44px] px-4 touch-manipulation">
                          <Save className="h-4 w-4" />
                          <span className="text-sm">Save Calculation</span>
                        </Button>
                        <Badge className="absolute -top-2 -right-2 bg-amber-500 hover:bg-amber-600">
                          <Crown className="mr-1 h-3 w-3" />
                          Premium
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground px-4 text-center">
                        You've reached the limit of {maxSavedCalculations} saved calculations for free accounts.
                      </p>
                      <Button size="sm" asChild className="min-h-[44px] touch-manipulation">
                        <Link href="/subscribe">
                          <Crown className="mr-2 h-4 w-4" />
                          <span className="text-sm">Upgrade for Unlimited Saves</span>
                        </Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Button
                        onClick={() => setShowSaveDialog(true)}
                        variant="default"
                        className="gap-2 min-h-[44px] px-4 touch-manipulation"
                      >
                        <Save className="h-4 w-4" />
                        <span className="text-sm">Save Calculation</span>
                      </Button>
                      {!isPremium && (
                        <p className="mt-2 text-sm text-muted-foreground">
                          {savedCalculationsCount}/{maxSavedCalculations} saved calculations used
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Desktop: Save Calculation Button */}
                <div className="hidden lg:flex mt-6 flex-col items-center space-y-4">
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

                {/* Mobile-Optimized Tabs */}
                <div className="mt-6 sm:mt-8">
                  <Tabs defaultValue="projection" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1 h-auto p-1">
                      <TabsTrigger
                        value="projection"
                        className="min-h-[44px] text-xs sm:text-sm px-2 sm:px-3 py-2 touch-manipulation"
                      >
                        <span className="hidden sm:inline">Projection Table</span>
                        <span className="sm:hidden">Projection</span>
                      </TabsTrigger>
                      <TabsTrigger
                        value="details"
                        className="min-h-[44px] text-xs sm:text-sm px-2 sm:px-3 py-2 touch-manipulation"
                      >
                        <span className="hidden sm:inline">Calculation Details</span>
                        <span className="sm:hidden">Details</span>
                      </TabsTrigger>
                      <TabsTrigger
                        value="social-security"
                        className="min-h-[44px] text-xs sm:text-sm px-2 sm:px-3 py-2 col-span-2 sm:col-span-1 touch-manipulation"
                      >
                        <span className="hidden lg:inline">Social Security</span>
                        <span className="lg:hidden">Social Sec.</span>
                      </TabsTrigger>
                      <TabsTrigger
                        value="combined"
                        className="min-h-[44px] text-xs sm:text-sm px-2 sm:px-3 py-2 col-span-2 sm:col-span-1 touch-manipulation"
                      >
                        <span className="hidden lg:inline">Combined Analysis</span>
                        <span className="lg:hidden">Combined</span>
                      </TabsTrigger>

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
                      <EnhancedPremiumGate
                        feature="social_security"
                        title="Social Security Integration"
                        description="Add Social Security benefits to get your complete retirement income picture"
                      >
                        <SocialSecurityCalculator
                          onCalculate={handleSocialSecurityCalculation}
                          initialData={{
                            currentAge: userProfile?.dateOfBirth ?
                              (() => {
                                const birthDate = new Date(userProfile.dateOfBirth)
                                const today = new Date()
                                const age = today.getFullYear() - birthDate.getFullYear()
                                const monthDiff = today.getMonth() - birthDate.getMonth()
                                if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                                  return age - 1
                                } else {
                                  return age
                                }
                              })() : 0,
                            retirementAge: (() => {
                              if (userProfile?.retirementDate && userProfile?.dateOfBirth) {
                                const retirementDate = new Date(userProfile.retirementDate)
                                const birthDate = new Date(userProfile.dateOfBirth)
                                return retirementDate.getFullYear() - birthDate.getFullYear()
                              }
                              return 0
                            })(),
                            estimatedBenefit: userProfile?.estimatedSocialSecurityBenefit || 0
                          }}
                        />
                      </EnhancedPremiumGate>
                    </TabsContent>
                    <TabsContent value="combined" className="pt-4">
                      <EnhancedPremiumGate
                        feature="social_security"
                        title="Combined Income Analysis"
                        description="See your pension and Social Security benefits combined with optimization suggestions"
                      >
                        <CombinedRetirementCalculator
                          pensionData={{
                            monthlyBenefit: calculationResult.monthlyPension,
                            annualBenefit: calculationResult.annualPension,
                            retirementAge: calculationResult.details.age,
                            retirementOption: formData.retirementOption,
                            details: calculationResult.details,
                          }}
                          socialSecurityData={{
                            estimatedBenefit: socialSecurityResults?.estimatedBenefit || 0,
                            fullRetirementAge: 67,
                          }}
                        />
                      </EnhancedPremiumGate>
                    </TabsContent>

                  </Tabs>
                </div>

                {/* Mobile: Start New Calculation Button */}
                <div className="lg:hidden mt-6 sm:mt-8 flex justify-center">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setCurrentStep(0)
                      setShowResults(false)
                      window.scrollTo({ top: 0, behavior: "smooth" })
                    }}
                    className="min-h-[44px] px-4 touch-manipulation"
                  >
                    <span className="text-sm">Start New Calculation</span>
                  </Button>
                </div>

                {/* Desktop: Start New Calculation Button */}
                <div className="hidden lg:flex mt-8 justify-center">
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
              </div>
            ) : (
              <div className="text-center py-8 sm:py-12">
                <Button
                  onClick={calculatePension}
                  size="lg"
                  className="gap-2 min-h-[44px] px-6 touch-manipulation"
                >
                  <Calculator className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="text-sm sm:text-base">Calculate Pension</span>
                </Button>
              </div>
            )}
          </div>
        )
      default:
        return null
    }
  }

  // Calculate derived data for summary
  const getSummaryData = () => {
    const age = formData.age ? parseFloat(formData.age) : null
    const yearsOfService = formData.yearsOfService ? parseFloat(formData.yearsOfService) : null
    const salary1 = formData.salary1 ? parseFloat(formData.salary1) : null
    const salary2 = formData.salary2 ? parseFloat(formData.salary2) : null
    const salary3 = formData.salary3 ? parseFloat(formData.salary3) : null
    const averageSalary = (salary1 && salary2 && salary3) ? (salary1 + salary2 + salary3) / 3 : null

    let benefitFactor = null
    let eligibilityStatus = null
    let projectedMonthlyBenefit = null
    let projectedAnnualBenefit = null

    if (age && yearsOfService && formData.group && formData.serviceEntryDate) {
      try {
        // Check eligibility
        const eligibility = checkEligibility(Math.floor(age), yearsOfService, formData.group, formData.serviceEntryDate)
        eligibilityStatus = eligibility

        if (eligibility.eligible) {
          // Get benefit factor
          benefitFactor = getBenefitFactor(Math.floor(age), formData.group, formData.serviceEntryDate, yearsOfService)

          // Calculate projected benefits if we have salary data
          if (averageSalary && benefitFactor > 0) {
            const totalBenefitPercentage = Math.min(benefitFactor * yearsOfService, 0.8) // 80% cap
            projectedAnnualBenefit = averageSalary * totalBenefitPercentage
            projectedMonthlyBenefit = projectedAnnualBenefit / 12
          }
        }
      } catch (error) {
        console.error('Error calculating summary data:', error)
      }
    }

    return {
      age,
      yearsOfService,
      averageSalary,
      benefitFactor,
      eligibilityStatus,
      projectedMonthlyBenefit,
      projectedAnnualBenefit,
      completionPercentage: calculateCompletionPercentage()
    }
  }

  const calculateCompletionPercentage = () => {
    const fields = [
      formData.serviceEntryDate,
      formData.age,
      formData.yearsOfService,
      formData.group,
      formData.salary1,
      formData.salary2,
      formData.salary3,
      formData.retirementOption
    ]
    const completedFields = fields.filter(field => field && field.toString().trim() !== '').length
    return Math.round((completedFields / fields.length) * 100)
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

  const formatPercentage = (value: number | null) => {
    if (value === null || value === undefined) return 'N/A'
    return `${(value * 100).toFixed(1)}%`
  }

  const summaryData = getSummaryData()

  // Show loading state during hydration
  if (!isHydrated) {
    return (
      <div className="w-full max-w-4xl mx-auto p-4">
        <Card className="shadow-lg">
          <CardContent className="p-8">
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
              <p className="text-muted-foreground">Loading calculator...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <>
      {/* Mobile-First Layout: Calculator Form First */}
      <div className="lg:hidden">
        {/* Mobile: Calculator Form Card - Appears First */}
        <Card className="shadow-lg rounded-xl overflow-hidden mb-6">
          <CardContent className="p-0">
            {/* Mobile Progress bar */}
            <div className="bg-gradient-to-r from-muted/30 to-muted/20 p-4 border-b">
              <div className="flex flex-col gap-3 mb-3">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    Mass Pension Calculator
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Complete all steps to calculate your retirement benefits
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Step {currentStep + 1} of {steps.length}
                  </span>
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">Progress</div>
                    <div className="text-lg font-bold text-primary">
                      {Math.round(((currentStep + 1) / steps.length) * 100)}%
                    </div>
                  </div>
                </div>
              </div>
              <Progress
                value={((currentStep + 1) / steps.length) * 100}
                className="h-2 mb-3"
                aria-label={`Step ${currentStep + 1} of ${steps.length}: ${Math.round(((currentStep + 1) / steps.length) * 100)}% complete`}
              />
              <div className="grid grid-cols-3 gap-1">
                {steps.map((step, index) => (
                  <div
                    key={step.id}
                    className={`text-xs text-center p-2 rounded-lg transition-all duration-200 ${
                      index === currentStep
                        ? "text-primary font-medium bg-primary/10 border border-primary/20"
                        : index < currentStep
                        ? "text-green-600 dark:text-green-400 font-medium bg-green-50 dark:bg-green-950/20"
                        : "text-muted-foreground bg-muted/20"
                    }`}
                  >
                    <div className="flex items-center justify-center gap-1">
                      {index < currentStep && (
                        <CheckCircle className="h-3 w-3" />
                      )}
                      {index === currentStep && (
                        <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                      )}
                      <span>{index + 1}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile Step content */}
            <div className="p-4 min-h-[400px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="h-full"
                >
                  {currentStep === 0 && (
                    <div className="mb-4">
                      <EligibilityInfo />
                    </div>
                  )}
                  <div className="space-y-4">
                    {renderStepContent()}
                  </div>
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
                <Alert className="mt-4 bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-900/30 dark:text-yellow-600">
                  <AlertDescription>{eligibilityWarning}</AlertDescription>
                </Alert>
              )}
            </div>

            {/* Mobile Navigation buttons */}
            {currentStep < 2 && (
              <div className="p-4 bg-gradient-to-r from-muted/20 to-muted/10 border-t flex flex-col gap-3">
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={prevStep}
                    disabled={currentStep === 0 || isTransitioning}
                    className="min-h-[44px] px-4 touch-manipulation"
                  >
                    {isTransitioning ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                    ) : (
                      <ArrowLeft className="mr-2 h-4 w-4" />
                    )}
                    <span className="text-sm">Back</span>
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={clearSavedData}
                    title="Clear saved data"
                    disabled={isTransitioning}
                    className="min-h-[44px] px-3 touch-manipulation"
                  >
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

                <div className="flex gap-3">
                  {currentStep < 1 ? (
                    <Button
                      onClick={nextStep}
                      disabled={isTransitioning || validationInProgress}
                      className="flex-1 min-h-[44px] shadow-lg hover:shadow-xl transition-all duration-200 touch-manipulation"
                    >
                      {isTransitioning || validationInProgress ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                          <span className="text-sm">
                            {validationInProgress ? "Validating..." : "Loading..."}
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="text-sm">Continue</span>
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button
                      onClick={calculatePension}
                      className="flex-1 gap-2 min-h-[44px] bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200 touch-manipulation"
                      disabled={isTransitioning || validationInProgress}
                    >
                      {isTransitioning || validationInProgress ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                          <span className="text-sm">Validating...</span>
                        </>
                      ) : (
                        <>
                          <Calculator className="h-4 w-4" />
                          <span className="text-sm font-medium">Calculate Pension</span>
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Mobile: Data Summary Below Calculator */}
        {summaryData.completionPercentage > 0 && (
          <div className="space-y-4 mb-6">
            {/* Header Card with Progress */}
            <Card className="border-0 shadow-md bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-900/20">
              <CardContent className="p-4">
                <div className="flex flex-col gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                      Calculation Summary
                    </h3>
                    <p className="text-blue-700 dark:text-blue-300 text-sm">
                      Review your inputs and estimated benefits
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                      Form Completion
                    </div>
                    <div className="text-xl font-bold text-blue-900 dark:text-blue-100">
                      {summaryData.completionPercentage}%
                    </div>
                  </div>
                  <Progress
                    value={summaryData.completionPercentage}
                    className="h-2"
                    aria-label={`Form completion progress: ${summaryData.completionPercentage}%`}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Mobile: Quick Actions Bar */}
            <Card className="border-0 shadow-md bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-900/20">
              <CardContent className="p-4">
                <div className="flex flex-col items-center gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                      <CheckCircle className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div className="text-center">
                      <div
                        className="font-medium text-indigo-900 dark:text-indigo-100"
                        role="heading"
                        aria-level={3}
                      >
                        {summaryData.completionPercentage === 100 ? 'Ready to Calculate!' : 'Keep Going!'}
                      </div>
                      <p className="text-sm text-indigo-700 dark:text-indigo-300">
                        {summaryData.completionPercentage === 100
                          ? 'All fields completed - proceed to calculate your pension'
                          : `${8 - Math.round((summaryData.completionPercentage / 100) * 8)} more fields to complete`
                        }
                      </p>
                    </div>
                  </div>
                  {summaryData.completionPercentage === 100 && (
                    <Button
                      onClick={() => setCurrentStep(2)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white min-h-[44px] px-4 touch-manipulation"
                    >
                      <Calculator className="h-4 w-4 mr-2" />
                      <span className="text-sm">Calculate Now</span>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Mobile: Compact Data Summary Grid */}
            <div className="grid grid-cols-1 gap-4">
              {/* Personal Information Card - Mobile */}
              <Card className="border-0 shadow-md bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-900/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-green-100 dark:bg-green-900/30 rounded-lg">
                        <svg className="h-4 w-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <h4 className="font-medium text-green-900 dark:text-green-100">Personal Info</h4>
                    </div>
                    <div className={`w-2.5 h-2.5 rounded-full ${
                      formData.age && formData.yearsOfService && formData.group && formData.serviceEntryDate
                        ? 'bg-green-500' : 'bg-gray-300'
                    }`} title={
                      formData.age && formData.yearsOfService && formData.group && formData.serviceEntryDate
                        ? 'Complete' : 'Incomplete'
                    } />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-green-700 dark:text-green-300">Age:</span>
                      <span className="text-sm font-medium text-green-900 dark:text-green-100">
                        {summaryData.age || 'Not set'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-green-700 dark:text-green-300">Service:</span>
                      <span className="text-sm font-medium text-green-900 dark:text-green-100">
                        {summaryData.yearsOfService || 'Not set'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-green-700 dark:text-green-300">Group:</span>
                      <span className="text-sm font-medium text-green-900 dark:text-green-100">
                        {formData.group ? formData.group.replace('GROUP_', 'Group ') : 'Not selected'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>

      {/* Desktop Layout: Traditional Layout */}
      <div className="hidden lg:block">
        {/* Comprehensive Data Summary Section */}
        <div className="space-y-6 mb-8">
          {/* Header Card with Progress */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-900/20">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-blue-900 dark:text-blue-100 mb-2">
                    Calculation Summary
                  </h2>
                  <p className="text-blue-700 dark:text-blue-300 text-sm">
                    Review your inputs and estimated benefits below
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="text-right">
                    <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                      Form Completion
                    </div>
                    <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                      {summaryData.completionPercentage}%
                    </div>
                  </div>
                  <Progress
                    value={summaryData.completionPercentage}
                    className="w-32 h-2"
                    aria-label={`Form completion progress: ${summaryData.completionPercentage}%`}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions Bar */}
          {summaryData.completionPercentage > 0 && (
            <Card className="border-0 shadow-lg bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-900/20">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                      <div
                        className="font-medium text-indigo-900 dark:text-indigo-100"
                        role="heading"
                        aria-level={3}
                      >
                        {summaryData.completionPercentage === 100 ? 'Ready to Calculate!' : 'Keep Going!'}
                      </div>
                      <p className="text-sm text-indigo-700 dark:text-indigo-300">
                        {summaryData.completionPercentage === 100
                          ? 'All fields completed - proceed to calculate your pension'
                          : `${8 - Math.round((summaryData.completionPercentage / 100) * 8)} more fields to complete`
                        }
                      </p>
                    </div>
                  </div>
                  {summaryData.completionPercentage === 100 && (
                    <Button
                      onClick={() => setCurrentStep(2)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                      <Calculator className="h-4 w-4 mr-2" />
                      Calculate Now
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

        {/* Data Summary Grid - Enhanced for Desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {/* Personal Information Card */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-900/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <svg className="h-5 w-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-green-900 dark:text-green-100">Personal Info</h3>
                </div>
                <div className={`w-3 h-3 rounded-full ${
                  formData.age && formData.yearsOfService && formData.group && formData.serviceEntryDate
                    ? 'bg-green-500' : 'bg-gray-300'
                }`} title={
                  formData.age && formData.yearsOfService && formData.group && formData.serviceEntryDate
                    ? 'Complete' : 'Incomplete'
                } />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-green-700 dark:text-green-300">Retirement Age:</span>
                  <span className="font-medium text-green-900 dark:text-green-100">
                    {summaryData.age || 'Not set'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-green-700 dark:text-green-300">Years of Service:</span>
                  <span className="font-medium text-green-900 dark:text-green-100">
                    {summaryData.yearsOfService || 'Not set'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-green-700 dark:text-green-300">Employee Group:</span>
                  <span className="font-medium text-green-900 dark:text-green-100">
                    {formData.group ? formData.group.replace('GROUP_', 'Group ') : 'Not selected'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-green-700 dark:text-green-300">Service Entry:</span>
                  <span className="font-medium text-green-900 dark:text-green-100">
                    {formData.serviceEntryDate === 'before_2012' ? 'Before 2012' :
                     formData.serviceEntryDate === 'after_2012' ? 'After 2012' : 'Not set'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Employment Data Card */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-900/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <svg className="h-5 w-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-purple-900 dark:text-purple-100">Employment Data</h3>
                </div>
                <div className={`w-3 h-3 rounded-full ${
                  formData.salary1 && formData.salary2 && formData.salary3
                    ? 'bg-green-500' : 'bg-gray-300'
                }`} title={
                  formData.salary1 && formData.salary2 && formData.salary3
                    ? 'Complete' : 'Incomplete'
                } />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-purple-700 dark:text-purple-300">Salary Year 1:</span>
                  <span className="font-medium text-purple-900 dark:text-purple-100">
                    {formatCurrency(formData.salary1 ? parseFloat(formData.salary1) : null)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-purple-700 dark:text-purple-300">Salary Year 2:</span>
                  <span className="font-medium text-purple-900 dark:text-purple-100">
                    {formatCurrency(formData.salary2 ? parseFloat(formData.salary2) : null)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-purple-700 dark:text-purple-300">Salary Year 3:</span>
                  <span className="font-medium text-purple-900 dark:text-purple-100">
                    {formatCurrency(formData.salary3 ? parseFloat(formData.salary3) : null)}
                  </span>
                </div>
                <div className="pt-2 border-t border-purple-200 dark:border-purple-800">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Average Salary:</span>
                    <span className="font-bold text-purple-900 dark:text-purple-100">
                      {formatCurrency(summaryData.averageSalary)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Advanced Options Card */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-950/20 dark:to-cyan-900/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-teal-100 dark:bg-teal-900/30 rounded-lg">
                    <svg className="h-5 w-5 text-teal-600 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-teal-900 dark:text-teal-100">Advanced Options</h3>
                </div>
                <div className={`w-3 h-3 rounded-full ${
                  formData.servicePurchaseYears || formData.healthcareElection || formData.phaseRetirement || formData.beneficiaryName
                    ? 'bg-green-500' : 'bg-gray-300'
                }`} title={
                  formData.servicePurchaseYears || formData.healthcareElection || formData.phaseRetirement || formData.beneficiaryName
                    ? 'Options configured' : 'No options set'
                } />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-teal-700 dark:text-teal-300">Service Purchase:</span>
                  <span className="font-medium text-teal-900 dark:text-teal-100">
                    {formData.servicePurchaseYears ? `${formData.servicePurchaseYears} years` : 'None'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-teal-700 dark:text-teal-300">Healthcare Election:</span>
                  <span className="font-medium text-teal-900 dark:text-teal-100">
                    {formData.healthcareElection ?
                      formData.healthcareElection.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()) :
                      'Not selected'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-teal-700 dark:text-teal-300">Tax Withholding:</span>
                  <span className="font-medium text-teal-900 dark:text-teal-100">
                    {formData.taxWithholding ? `${formData.taxWithholding}%` : 'Not set'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-teal-700 dark:text-teal-300">Phased Retirement:</span>
                  <span className={`font-medium text-sm px-2 py-1 rounded-full ${
                    formData.phaseRetirement
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
                  }`}>
                    {formData.phaseRetirement ? 'Planned' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-teal-700 dark:text-teal-300">Beneficiary:</span>
                  <span className="font-medium text-teal-900 dark:text-teal-100">
                    {formData.beneficiaryName ? 'Set' : 'Not set'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Calculation Results Card */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-900/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                    <Calculator className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <h3 className="font-semibold text-orange-900 dark:text-orange-100">Calculations</h3>
                </div>
                <div className={`w-3 h-3 rounded-full ${
                  summaryData.eligibilityStatus?.eligible && summaryData.projectedAnnualBenefit
                    ? 'bg-green-500' : summaryData.eligibilityStatus?.eligible === false
                    ? 'bg-red-500' : 'bg-gray-300'
                }`} title={
                  summaryData.eligibilityStatus?.eligible && summaryData.projectedAnnualBenefit
                    ? 'Calculations complete' : summaryData.eligibilityStatus?.eligible === false
                    ? 'Not eligible' : 'Pending data'
                } />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-orange-700 dark:text-orange-300">Eligibility Status:</span>
                  <span className={`font-medium text-sm px-2 py-1 rounded-full ${
                    summaryData.eligibilityStatus?.eligible
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                      : summaryData.eligibilityStatus?.eligible === false
                      ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
                  }`}>
                    {summaryData.eligibilityStatus?.eligible ? 'Eligible' :
                     summaryData.eligibilityStatus?.eligible === false ? 'Not Eligible' : 'Unknown'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-orange-700 dark:text-orange-300">Benefit Factor:</span>
                  <span className="font-medium text-orange-900 dark:text-orange-100">
                    {formatPercentage(summaryData.benefitFactor)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-orange-700 dark:text-orange-300">Retirement Option:</span>
                  <span className="font-medium text-orange-900 dark:text-orange-100">
                    Option {formData.retirementOption || 'A'}
                  </span>
                </div>
                <div className="pt-2 border-t border-orange-200 dark:border-orange-800 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-orange-700 dark:text-orange-300">Est. Monthly:</span>
                    <span className="font-bold text-orange-900 dark:text-orange-100">
                      {formatCurrency(summaryData.projectedMonthlyBenefit)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-orange-700 dark:text-orange-300">Est. Annual:</span>
                    <span className="font-bold text-orange-900 dark:text-orange-100">
                      {formatCurrency(summaryData.projectedAnnualBenefit)}
                    </span>
                  </div>
                  {summaryData.projectedAnnualBenefit && summaryData.averageSalary && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-orange-700 dark:text-orange-300">Replacement Ratio:</span>
                      <span className="font-bold text-orange-900 dark:text-orange-100">
                        {((summaryData.projectedAnnualBenefit / summaryData.averageSalary) * 100).toFixed(1)}%
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

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
                  <li>• Maximum benefit cap: 80% of average salary</li>
                  <li>• Benefit factors based on MA retirement system rules</li>
                  <li>• Average salary calculated from highest 3 consecutive years</li>
                  <li>• COLA adjustments not included in base calculations</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-slate-800 dark:text-slate-200 mb-2">Important Notes:</h4>
                <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                  <li>• Estimates are for planning purposes only</li>
                  <li>• Actual benefits may vary based on final service record</li>
                  <li>• Consult official MA retirement system for final calculations</li>
                  <li>• Tax implications not included in estimates</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
        </div>

        {/* Desktop Calculator Form */}
        <Card className="shadow-lg rounded-xl overflow-hidden">
        <CardContent className="p-0">
          {/* Enhanced Progress bar for desktop */}
          <div className="bg-gradient-to-r from-muted/30 to-muted/20 p-4 lg:p-6 xl:p-8 border-b">
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-4">
              <div>
                <h2 className="text-lg lg:text-xl xl:text-2xl font-semibold text-slate-900 dark:text-slate-100">
                  Mass Pension Calculator
                </h2>
                <p className="text-sm lg:text-base text-muted-foreground mt-1">
                  Complete all steps to calculate your retirement benefits
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm lg:text-base text-muted-foreground">
                  Step {currentStep + 1} of {steps.length}
                </span>
                <div className="text-right">
                  <div className="text-xs lg:text-sm text-muted-foreground">Progress</div>
                  <div className="text-lg lg:text-xl font-bold text-primary">
                    {Math.round(((currentStep + 1) / steps.length) * 100)}%
                  </div>
                </div>
              </div>
            </div>
            <Progress
              value={((currentStep + 1) / steps.length) * 100}
              className="h-2 lg:h-3 mb-4"
              aria-label={`Step ${currentStep + 1} of ${steps.length}: ${Math.round(((currentStep + 1) / steps.length) * 100)}% complete`}
            />
            <div className="grid grid-cols-3 gap-1 lg:gap-2">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={`text-xs lg:text-sm text-center p-2 lg:p-3 rounded-lg transition-all duration-200 ${
                    index === currentStep
                      ? "text-primary font-medium bg-primary/10 border border-primary/20"
                      : index < currentStep
                      ? "text-green-600 dark:text-green-400 font-medium bg-green-50 dark:bg-green-950/20"
                      : "text-muted-foreground bg-muted/20"
                  }`}
                >
                  <div className="flex items-center justify-center gap-1 lg:gap-2">
                    {index < currentStep && (
                      <CheckCircle className="h-3 w-3 lg:h-4 lg:w-4" />
                    )}
                    {index === currentStep && (
                      <div className="h-2 w-2 lg:h-3 lg:w-3 rounded-full bg-primary animate-pulse" />
                    )}
                    <span className="hidden sm:inline">{step.title}</span>
                    <span className="sm:hidden">{index + 1}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Enhanced Step content for desktop */}
          <div className="p-6 lg:p-8 xl:p-12 min-h-[600px] lg:min-h-[700px] xl:min-h-[800px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="h-full"
              >
                {currentStep === 0 && (
                  <div className="mb-6 lg:mb-8">
                    <EligibilityInfo />
                  </div>
                )}
                <div className="space-y-6 lg:space-y-8">
                  {renderStepContent()}
                </div>
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

          {/* Enhanced Navigation buttons for desktop */}
          {currentStep < 2 && (
            <div className="p-6 lg:p-8 xl:p-12 bg-gradient-to-r from-muted/20 to-muted/10 border-t flex flex-col sm:flex-row justify-between gap-4">
              <div className="flex gap-3 lg:gap-4">
                <Button
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 0 || isTransitioning}
                  className="lg:px-6 lg:py-3 xl:px-8 xl:py-4"
                >
                  {isTransitioning ? (
                    <div className="animate-spin rounded-full h-4 w-4 lg:h-5 lg:w-5 border-b-2 border-current mr-2"></div>
                  ) : (
                    <ArrowLeft className="mr-2 h-4 w-4 lg:h-5 lg:w-5" />
                  )}
                  <span className="text-sm lg:text-base">Back</span>
                </Button>
                <Button
                  variant="ghost"
                  onClick={clearSavedData}
                  title="Clear saved data"
                  disabled={isTransitioning}
                  className="lg:px-4 lg:py-3 xl:px-6 xl:py-4"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4 lg:h-5 lg:w-5"
                  >
                    <path d="M3 6h18"></path>
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                    <line x1="10" y1="11" x2="10" y2="17"></line>
                    <line x1="14" y1="11" x2="14" y2="17"></line>
                  </svg>
                  <span className="ml-2 hidden lg:inline text-sm lg:text-base">Clear Data</span>
                </Button>
              </div>

              <div className="flex gap-3 lg:gap-4">
                {currentStep < 1 ? (
                  <Button
                    onClick={nextStep}
                    disabled={isTransitioning || validationInProgress}
                    className="lg:px-6 lg:py-3 xl:px-8 xl:py-4 shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    {isTransitioning || validationInProgress ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 lg:h-5 lg:w-5 border-b-2 border-current mr-2"></div>
                        <span className="text-sm lg:text-base">
                          {validationInProgress ? "Validating..." : "Loading..."}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="text-sm lg:text-base">Continue</span>
                        <ArrowRight className="ml-2 h-4 w-4 lg:h-5 lg:w-5" />
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    onClick={calculatePension}
                    className="gap-2 lg:px-6 lg:py-3 xl:px-8 xl:py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200"
                    disabled={isTransitioning || validationInProgress}
                  >
                    {isTransitioning || validationInProgress ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 lg:h-5 lg:w-5 border-b-2 border-current"></div>
                        <span className="text-sm lg:text-base">Validating...</span>
                      </>
                    ) : (
                      <>
                        <Calculator className="h-4 w-4 lg:h-5 lg:w-5" />
                        <span className="text-sm lg:text-base font-medium">Calculate Pension</span>
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          )}
          {showNotification && (
            <ToastNotification
              message="Your previous data has been loaded. Your inputs are automatically saved as you type."
              onClose={() => setShowNotification(false)}
            />
          )}
          {savedMessage && <ToastNotification message={savedMessage} onClose={() => setSavedMessage("")} />}

          {/* Auto-save indicator */}
          {isFormDirty && (
            <div className="fixed bottom-4 right-4 bg-green-100 border border-green-300 text-green-800 px-3 py-2 rounded-lg shadow-lg text-sm flex items-center gap-2 z-50">
              <CheckCircle className="h-4 w-4" />
              Auto-saved
            </div>
          )}
        </CardContent>
      </Card>
      </div>

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
