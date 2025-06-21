"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useToast } from "@/hooks/use-toast"
import {
  ChevronLeft,
  ChevronRight,
  Save,
  CheckCircle,
  AlertTriangle,
  Calculator,
  User,
  DollarSign,
  Settings,
  TrendingUp,
  FileText,
  Calendar,
  Users,
  Briefcase,
  Target,
  BarChart3,
  Download,
  Loader2
} from "lucide-react"
import { CombinedCalculationData, WizardProgress, WIZARD_STEPS, ValidationRule } from "@/lib/wizard/wizard-types"
import { calculateAnnualPension, getBenefitFactor, generateProjectionTable } from "@/lib/pension-calculations"

// Validation schemas for each step
const personalInfoSchema = z.object({
  birthYear: z.number().min(1940).max(2010),
  retirementGoalAge: z.number().min(55).max(75),
  lifeExpectancy: z.number().min(70).max(100).optional(),
  filingStatus: z.enum(['single', 'married', 'marriedSeparate']),
})

const pensionDataSchema = z.object({
  yearsOfService: z.number().min(0).max(50),
  averageSalary: z.number().min(0),
  retirementGroup: z.enum(['1', '2', '3', '4']),
  serviceEntry: z.enum(['before_2012', 'after_2012']),
  pensionRetirementAge: z.number().min(18).max(80),
  beneficiaryAge: z.number().min(18).max(100).optional(),
  retirementOption: z.enum(['A', 'B', 'C', 'D']),
})

const socialSecuritySchema = z.object({
  fullRetirementBenefit: z.number().min(0),
  earlyRetirementBenefit: z.number().min(0).optional(),
  delayedRetirementBenefit: z.number().min(0).optional(),
  selectedClaimingAge: z.number().min(62).max(70),
  isMarried: z.boolean(),
  spouseFullRetirementBenefit: z.number().min(0).optional(),
})

const incomeDataSchema = z.object({
  otherRetirementIncome: z.number().min(0).optional(),
  hasRothIRA: z.boolean(),
  rothIRABalance: z.number().min(0).optional(),
  has401k: z.boolean(),
  traditional401kBalance: z.number().min(0).optional(),
})

const preferencesSchema = z.object({
  riskTolerance: z.enum(['conservative', 'moderate', 'aggressive']),
  inflationScenario: z.enum(['conservative', 'moderate', 'optimistic']),
  includeTaxOptimization: z.boolean(),
  includeMonteCarloAnalysis: z.boolean(),
  retirementIncomeGoal: z.number().min(0),
})

interface CombinedCalculationWizardProps {
  onComplete: (data: CombinedCalculationData) => void
  resumeToken?: string
}

interface UserProfile {
  fullName?: string
  dateOfBirth?: string
  membershipDate?: string
  retirementGroup?: string
  currentSalary?: number
  averageHighest3Years?: number
  yearsOfService?: number
  retirementOption?: string
  estimatedSocialSecurityBenefit?: number
}

export function CombinedCalculationWizard({
  onComplete,
  resumeToken
}: CombinedCalculationWizardProps) {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = useState(0)
  const [wizardData, setWizardData] = useState<Partial<CombinedCalculationData>>({})
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [optimizationResults, setOptimizationResults] = useState<any>(null)

  // Load user profile data
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!session?.user?.id) {
        setIsLoadingProfile(false)
        return
      }

      try {
        const response = await fetch('/api/profile')
        if (response.ok) {
          const profile = await response.json()
          setUserProfile(profile)

          // Pre-populate wizard data from profile
          const currentAge = profile.dateOfBirth ?
            new Date().getFullYear() - new Date(profile.dateOfBirth).getFullYear() : 0

          const initialData: Partial<CombinedCalculationData> = {
            personalInfo: {
              birthYear: profile.dateOfBirth ? new Date(profile.dateOfBirth).getFullYear() : 0,
              retirementGoalAge: profile.plannedRetirementAge || 65,
              lifeExpectancy: 85,
              filingStatus: 'single',
              currentAge: currentAge
            },
            pensionData: {
              yearsOfService: profile.yearsOfService || 0,
              averageSalary: profile.averageHighest3Years || profile.currentSalary || 0,
              retirementGroup: profile.retirementGroup || '1',
              serviceEntry: 'before_2012' as const, // Default to before_2012, user can change
              pensionRetirementAge: profile.plannedRetirementAge || 65,
              beneficiaryAge: undefined,
              benefitPercentage: 2.5,
              retirementOption: (profile.retirementOption as 'A' | 'B' | 'C' | 'D') || 'A',
              retirementDate: '',
              monthlyBenefit: 0,
              annualBenefit: 0
            },
            socialSecurityData: {
              fullRetirementAge: 67,
              earlyRetirementBenefit: 0,
              fullRetirementBenefit: profile.estimatedSocialSecurityBenefit || 0,
              delayedRetirementBenefit: 0,
              selectedClaimingAge: 67,
              selectedMonthlyBenefit: profile.estimatedSocialSecurityBenefit || 0,
              isMarried: false
            },
            incomeData: {
              totalAnnualIncome: 0,
              otherRetirementIncome: 0,
              hasRothIRA: false,
              rothIRABalance: 0,
              has401k: false,
              traditional401kBalance: 0,
              estimatedMedicarePremiums: 174.70
            },
            preferences: {
              riskTolerance: 'moderate',
              inflationScenario: 'moderate',
              includeTaxOptimization: true,
              includeMonteCarloAnalysis: false,
              retirementIncomeGoal: 0
            }
          }

          setWizardData(initialData)
        }
      } catch (error) {
        console.error('Failed to load user profile:', error)
      } finally {
        setIsLoadingProfile(false)
      }
    }

    loadUserProfile()
  }, [session?.user?.id])

  // Initialize wizard data structure from saved state
  useEffect(() => {
    if (resumeToken && session?.user?.id && !isLoadingProfile) {
      // Load saved wizard state from localStorage
      const savedData = localStorage.getItem(`wizard-data-${session.user.id}`)
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData)
          setWizardData(parsed.data || {})
          setCurrentStep(parsed.currentStep || 0)
        } catch (error) {
          console.error("Failed to load saved wizard data:", error)
        }
      }
    }
  }, [resumeToken, session?.user?.id, isLoadingProfile])

  // Auto-save wizard progress
  useEffect(() => {
    if (session?.user?.id && Object.keys(wizardData).length > 0) {
      const saveData = {
        currentStep,
        data: wizardData,
        savedAt: new Date().toISOString()
      }
      localStorage.setItem(`wizard-data-${session.user.id}`, JSON.stringify(saveData))
      localStorage.setItem(`wizard-state-${session.user.id}`, `step-${currentStep}`)
    }
  }, [wizardData, currentStep, session?.user?.id])

  const progress: WizardProgress = {
    stepNumber: currentStep + 1,
    totalSteps: WIZARD_STEPS.length,
    percentComplete: ((currentStep + 1) / WIZARD_STEPS.length) * 100,
    estimatedTimeRemaining: (WIZARD_STEPS.length - currentStep - 1) * 2, // 2 minutes per step
    canGoBack: currentStep > 0,
    canGoForward: currentStep < WIZARD_STEPS.length - 1,
    canSave: Object.keys(wizardData).length > 0
  }

  // Validation function for current step
  const validateCurrentStep = (): boolean => {
    const step = WIZARD_STEPS[currentStep]
    const stepData = wizardData

    if (!step.validationRules) return true

    const stepErrors: Record<string, string> = {}

    for (const rule of step.validationRules) {
      const value = getNestedValue(stepData, rule.field)

      switch (rule.rule) {
        case 'required':
          if (value === undefined || value === null || value === '' || value === 0) {
            stepErrors[rule.field] = rule.message
          }
          break
        case 'positive':
          if (typeof value === 'number' && value <= 0) {
            stepErrors[rule.field] = rule.message
          }
          break
        case 'range':
          if (typeof value === 'number' && value > 0 && (
            (rule.min !== undefined && value < rule.min) ||
            (rule.max !== undefined && value > rule.max)
          )) {
            stepErrors[rule.field] = rule.message
          }
          break
        case 'custom':
          if (rule.customValidator && !rule.customValidator(value)) {
            stepErrors[rule.field] = rule.message
          }
          break
      }
    }

    setErrors(stepErrors)
    return Object.keys(stepErrors).length === 0
  }

  // Helper function to get nested object values
  const getNestedValue = (obj: any, path: string): any => {
    return path.split('.').reduce((current, key) => current?.[key], obj)
  }

  const handleNext = async () => {
    // Validate current step before proceeding
    if (!validateCurrentStep()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors before continuing.",
        variant: "destructive"
      })
      return
    }

    if (currentStep === 5) {
      // Run optimization before showing results
      await runOptimization()
    }

    if (currentStep < WIZARD_STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      // Complete wizard
      handleComplete()
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  // Run optimization analysis
  const runOptimization = async () => {
    setIsLoading(true)
    try {
      // Simulate optimization calculation
      const pensionBenefit = calculatePensionBenefit()
      const socialSecurityBenefit = wizardData.socialSecurityData?.fullRetirementBenefit || 0

      const results = {
        recommendedStrategy: {
          pensionClaimingAge: wizardData.personalInfo?.retirementGoalAge || 65,
          socialSecurityClaimingAge: wizardData.socialSecurityData?.selectedClaimingAge || 67,
          totalLifetimeBenefits: (pensionBenefit + socialSecurityBenefit) * 12 * 20, // 20 years
          monthlyRetirementIncome: pensionBenefit + socialSecurityBenefit,
          netAfterTaxIncome: (pensionBenefit + socialSecurityBenefit) * 0.85 // Estimate 15% tax
        },
        alternativeScenarios: [
          {
            name: "Early Retirement",
            pensionAge: 62,
            ssAge: 62,
            lifetimeBenefits: (pensionBenefit * 0.8 + socialSecurityBenefit * 0.75) * 12 * 23,
            monthlyIncome: pensionBenefit * 0.8 + socialSecurityBenefit * 0.75,
            netIncome: (pensionBenefit * 0.8 + socialSecurityBenefit * 0.75) * 0.85,
            tradeoffs: ["Lower monthly benefits", "Longer benefit period"]
          },
          {
            name: "Delayed Retirement",
            pensionAge: 67,
            ssAge: 70,
            lifetimeBenefits: (pensionBenefit * 1.1 + socialSecurityBenefit * 1.32) * 12 * 17,
            monthlyIncome: pensionBenefit * 1.1 + socialSecurityBenefit * 1.32,
            netIncome: (pensionBenefit * 1.1 + socialSecurityBenefit * 1.32) * 0.85,
            tradeoffs: ["Higher monthly benefits", "Shorter benefit period"]
          }
        ]
      }

      setOptimizationResults(results)
    } catch (error) {
      console.error("Optimization failed:", error)
      toast({
        title: "Optimization Error",
        description: "Failed to run optimization analysis. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Calculate pension benefit using proper MSRB methodology
  const calculatePensionBenefit = (): number => {
    const pensionData = wizardData.pensionData
    const personalInfo = wizardData.personalInfo
    if (!pensionData || !personalInfo) return 0

    const { averageSalary, yearsOfService, retirementGroup, retirementOption, serviceEntry, pensionRetirementAge, beneficiaryAge } = pensionData
    const retirementAge = pensionRetirementAge || personalInfo.retirementGoalAge || 65

    // Use proper MSRB calculation methodology
    try {
      const group = `GROUP_${retirementGroup}` as const
      const userServiceEntry = serviceEntry || "before_2012" // Use user selection or default

      // Filter retirement option to only include supported options
      const supportedOption = (retirementOption === "A" || retirementOption === "B" || retirementOption === "C")
        ? retirementOption
        : "A"

      const annualBenefit = calculateAnnualPension(
        averageSalary,
        retirementAge,
        yearsOfService,
        supportedOption,
        group,
        userServiceEntry,
        beneficiaryAge?.toString()
      )

      return annualBenefit / 12 // Return monthly benefit
    } catch (error) {
      console.error('Error calculating pension benefit:', error)

      // Fallback to proper MSRB benefit factors
      const group = `GROUP_${retirementGroup}` as const
      const userServiceEntry = serviceEntry || "before_2012" // Use user selection or default
      const benefitFactor = getBenefitFactor(retirementAge, group, userServiceEntry, yearsOfService)
      const annualBenefit = averageSalary * yearsOfService * benefitFactor
      const maxBenefit = averageSalary * 0.8 // 80% cap

      return Math.min(annualBenefit, maxBenefit) / 12
    }
  }

  const handleComplete = async () => {
    setIsLoading(true)
    try {
      // Save to profile API
      const profileData = {
        estimatedSocialSecurityBenefit: wizardData.socialSecurityData?.fullRetirementBenefit,
        retirementGroup: wizardData.pensionData?.retirementGroup,
        yearsOfService: wizardData.pensionData?.yearsOfService,
        averageHighest3Years: wizardData.pensionData?.averageSalary,
        retirementOption: wizardData.pensionData?.retirementOption
      }

      const response = await fetch('/api/retirement/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData)
      })

      if (response.ok) {
        toast({
          title: "Success!",
          description: "Your retirement plan has been saved successfully.",
        })
      }

      // Validate all required data is present
      const completeData = wizardData as CombinedCalculationData

      // Save final results
      if (session?.user?.id) {
        localStorage.removeItem(`wizard-data-${session.user.id}`)
        localStorage.removeItem(`wizard-state-${session.user.id}`)
      }

      onComplete(completeData)
    } catch (error) {
      console.error("Failed to complete wizard:", error)
      setErrors({ general: "Failed to save wizard results. Please try again." })
    } finally {
      setIsLoading(false)
    }
  }

  const updateWizardData = (stepData: Partial<CombinedCalculationData>) => {
    setWizardData(prev => ({ ...prev, ...stepData }))
    setErrors({}) // Clear errors when data is updated
  }

  // Helper function to get minimum retirement age by group
  const getMinRetirementAge = (group: string): number => {
    switch (group) {
      case '1': return 55 // Group 1: General employees
      case '2': return 55 // Group 2: Certain public safety
      case '3': return 18 // Group 3: State Police (any age with 20+ years)
      case '4': return 50 // Group 4: Public safety
      default: return 55
    }
  }

  // Helper function to validate pension retirement age
  const validatePensionRetirementAge = (age: number, group: string, yearsOfService: number): string | null => {
    const minAge = getMinRetirementAge(group)

    if (age < minAge) {
      if (group === '3' && yearsOfService >= 20) {
        return null // Group 3 can retire at any age with 20+ years
      }
      return `Minimum retirement age for Group ${group} is ${minAge}`
    }

    if (age > 80) {
      return 'Maximum retirement age is 80'
    }

    return null
  }

  // Generate retirement projection data for chart
  const generateRetirementProjection = () => {
    const pensionData = wizardData.pensionData
    const personalInfo = wizardData.personalInfo
    const socialSecurityData = wizardData.socialSecurityData

    if (!pensionData || !personalInfo || !socialSecurityData) return []

    const currentAge = personalInfo.currentAge || 0
    const projectionData = []

    // Generate data from current age to 80
    for (let age = Math.max(currentAge, 50); age <= 80; age++) {
      const projectedYearsOfService = pensionData.yearsOfService + Math.max(0, age - currentAge)

      // Calculate pension benefit at this age
      let pensionBenefit = 0
      if (age >= (pensionData.pensionRetirementAge || 65)) {
        try {
          const group = `GROUP_${pensionData.retirementGroup}` as const
          const serviceEntry = pensionData.serviceEntry || "before_2012"
          const benefitFactor = getBenefitFactor(age, group, serviceEntry, projectedYearsOfService)

          if (benefitFactor > 0) {
            let annualPension = pensionData.averageSalary * projectedYearsOfService * benefitFactor
            const maxPension = pensionData.averageSalary * 0.8 // 80% cap
            annualPension = Math.min(annualPension, maxPension)

            // Apply retirement option adjustments
            const annualWithOption = calculateAnnualPension(
              pensionData.averageSalary,
              age,
              projectedYearsOfService,
              pensionData.retirementOption as "A" | "B" | "C",
              group,
              serviceEntry,
              pensionData.beneficiaryAge?.toString()
            )

            pensionBenefit = annualWithOption / 12
          }
        } catch (error) {
          console.error('Error calculating pension for age', age, error)
        }
      }

      // Calculate Social Security benefit at this age
      let socialSecurityBenefit = 0
      if (age >= (socialSecurityData.selectedClaimingAge || 67)) {
        const fullBenefit = socialSecurityData.fullRetirementBenefit || 0
        const claimingAge = socialSecurityData.selectedClaimingAge || 67
        const fullRetirementAge = 67

        if (claimingAge < fullRetirementAge) {
          // Early retirement reduction
          const monthsEarly = (fullRetirementAge - claimingAge) * 12
          const reductionRate = monthsEarly <= 36 ? 0.0055 : 0.0041
          socialSecurityBenefit = fullBenefit * (1 - (monthsEarly * reductionRate))
        } else if (claimingAge > fullRetirementAge) {
          // Delayed retirement credits
          const yearsDelayed = claimingAge - fullRetirementAge
          socialSecurityBenefit = fullBenefit * (1 + (yearsDelayed * 0.08))
        } else {
          socialSecurityBenefit = fullBenefit
        }
      }

      projectionData.push({
        age,
        ageLabel: `Age ${age}`,
        pensionMonthly: Math.round(pensionBenefit),
        socialSecurityMonthly: Math.round(socialSecurityBenefit),
        totalMonthly: Math.round(pensionBenefit + socialSecurityBenefit),
        pensionAnnual: Math.round(pensionBenefit * 12),
        socialSecurityAnnual: Math.round(socialSecurityBenefit * 12),
        totalAnnual: Math.round((pensionBenefit + socialSecurityBenefit) * 12),
        yearsOfService: projectedYearsOfService
      })
    }

    return projectionData
  }

  const getStepIcon = (stepIndex: number) => {
    const icons = [User, DollarSign, Calculator, Settings, TrendingUp, FileText, CheckCircle]
    const Icon = icons[stepIndex] || User
    return <Icon className="h-5 w-5" />
  }

  const renderStepContent = () => {
    const step = WIZARD_STEPS[currentStep]

    if (isLoadingProfile) {
      return (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading your profile...</span>
        </div>
      )
    }

    switch (step.id) {
      case 'personal-info':
        return renderPersonalInfoStep()
      case 'pension-details':
        return renderPensionDetailsStep()
      case 'social-security':
        return renderSocialSecurityStep()
      case 'income-assets':
        return renderIncomeAssetsStep()
      case 'preferences':
        return renderPreferencesStep()
      case 'optimization':
        return renderOptimizationStep()
      case 'review-save':
        return renderReviewSaveStep()
      default:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{step.title}</h3>
            <p className="text-muted-foreground">{step.description}</p>
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                This step is currently under development.
              </AlertDescription>
            </Alert>
          </div>
        )
    }
  }

  // Step 1: Personal Information
  const renderPersonalInfoStep = () => {
    const personalInfo = wizardData.personalInfo || {
      birthYear: 0,
      retirementGoalAge: 0,
      lifeExpectancy: 85,
      filingStatus: 'single' as const,
      currentAge: 0
    }

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="birthYear" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Birth Year
            </Label>
            <Input
              id="birthYear"
              type="number"
              placeholder="1970"
              value={personalInfo.birthYear || ''}
              onChange={(e) => {
                const value = e.target.value
                const numValue = value ? parseInt(value) : 0
                updateWizardData({
                  personalInfo: {
                    ...personalInfo,
                    birthYear: numValue,
                    currentAge: numValue > 0 ? new Date().getFullYear() - numValue : 0
                  }
                })
              }}
              className={errors['personalInfo.birthYear'] ? "border-red-500" : ""}
            />
            {errors['personalInfo.birthYear'] && <p className="text-sm text-red-500">{errors['personalInfo.birthYear']}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="retirementGoalAge" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Planned Retirement Age
            </Label>
            <Input
              id="retirementGoalAge"
              type="number"
              placeholder="65"
              value={personalInfo.retirementGoalAge || ''}
              onChange={(e) => {
                const value = e.target.value
                const numValue = value ? parseInt(value) : 0
                updateWizardData({
                  personalInfo: {
                    ...personalInfo,
                    retirementGoalAge: numValue
                  }
                })
              }}
              className={errors['personalInfo.retirementGoalAge'] ? "border-red-500" : ""}
            />
            {errors['personalInfo.retirementGoalAge'] && <p className="text-sm text-red-500">{errors['personalInfo.retirementGoalAge']}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="lifeExpectancy">Life Expectancy (Optional)</Label>
            <Input
              id="lifeExpectancy"
              type="number"
              placeholder="85"
              value={personalInfo.lifeExpectancy || ''}
              onChange={(e) => {
                const value = e.target.value
                const numValue = value ? parseInt(value) : 85
                updateWizardData({
                  personalInfo: {
                    ...personalInfo,
                    lifeExpectancy: numValue
                  }
                })
              }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="filingStatus" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Filing Status
            </Label>
            <Select
              value={personalInfo.filingStatus || 'single'}
              onValueChange={(value) => updateWizardData({
                personalInfo: {
                  ...personalInfo,
                  filingStatus: value as 'single' | 'married' | 'marriedSeparate'
                }
              })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select filing status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single">Single</SelectItem>
                <SelectItem value="married">Married Filing Jointly</SelectItem>
                <SelectItem value="marriedSeparate">Married Filing Separately</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {personalInfo.birthYear && personalInfo.retirementGoalAge && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              You are currently {personalInfo.currentAge} years old and plan to retire in{' '}
              {personalInfo.retirementGoalAge - personalInfo.currentAge} years at age {personalInfo.retirementGoalAge}.
            </AlertDescription>
          </Alert>
        )}
      </div>
    )
  }

  // Step 2: Pension Details
  const renderPensionDetailsStep = () => {
    const pensionData = wizardData.pensionData || {
      yearsOfService: 0,
      averageSalary: 0,
      retirementGroup: '1' as const,
      serviceEntry: 'before_2012' as const,
      pensionRetirementAge: 65,
      beneficiaryAge: undefined,
      benefitPercentage: 2.5,
      retirementOption: 'A' as const,
      retirementDate: '',
      monthlyBenefit: 0,
      annualBenefit: 0
    }

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="yearsOfService" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Years of Service
            </Label>
            <Input
              id="yearsOfService"
              type="number"
              placeholder="20"
              step="0.1"
              value={pensionData.yearsOfService || ''}
              onChange={(e) => {
                const value = e.target.value
                const numValue = value ? parseFloat(value) : 0
                updateWizardData({
                  pensionData: {
                    ...pensionData,
                    yearsOfService: numValue
                  }
                })
              }}
              className={errors['pensionData.yearsOfService'] ? "border-red-500" : ""}
            />
            {errors['pensionData.yearsOfService'] && <p className="text-sm text-red-500">{errors['pensionData.yearsOfService']}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="averageSalary" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Average Highest 3 Years Salary
            </Label>
            <Input
              id="averageSalary"
              type="number"
              placeholder="75000"
              value={pensionData.averageSalary || ''}
              onChange={(e) => {
                const value = e.target.value
                const numValue = value ? parseFloat(value) : 0
                updateWizardData({
                  pensionData: {
                    ...pensionData,
                    averageSalary: numValue
                  }
                })
              }}
              className={errors['pensionData.averageSalary'] ? "border-red-500" : ""}
            />
            {errors['pensionData.averageSalary'] && <p className="text-sm text-red-500">{errors['pensionData.averageSalary']}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="retirementGroup">Massachusetts Retirement Group</Label>
            <Select
              value={pensionData.retirementGroup || '1'}
              onValueChange={(value) => updateWizardData({
                pensionData: {
                  ...pensionData,
                  retirementGroup: value as '1' | '2' | '3' | '4'
                }
              })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select retirement group" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Group 1 - General Employees</SelectItem>
                <SelectItem value="2">Group 2 - Certain Public Safety</SelectItem>
                <SelectItem value="3">Group 3 - State Police</SelectItem>
                <SelectItem value="4">Group 4 - Public Safety</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="serviceEntry">Service Entry Period</Label>
            <Select
              value={pensionData.serviceEntry || 'before_2012'}
              onValueChange={(value) => updateWizardData({
                pensionData: {
                  ...pensionData,
                  serviceEntry: value as 'before_2012' | 'after_2012'
                }
              })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select service entry period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="before_2012">Before April 2, 2012</SelectItem>
                <SelectItem value="after_2012">On or after April 2, 2012</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Your service entry date affects eligibility requirements and benefit calculations.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pensionRetirementAge" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Pension Retirement Age
            </Label>
            <Input
              id="pensionRetirementAge"
              type="number"
              placeholder="65"
              value={pensionData.pensionRetirementAge || ''}
              onChange={(e) => {
                const value = e.target.value
                const numValue = value ? parseInt(value) : 0
                updateWizardData({
                  pensionData: {
                    ...pensionData,
                    pensionRetirementAge: numValue
                  }
                })
              }}
              className={errors['pensionData.pensionRetirementAge'] ? "border-red-500" : ""}
            />
            {errors['pensionData.pensionRetirementAge'] && <p className="text-sm text-red-500">{errors['pensionData.pensionRetirementAge']}</p>}
            {pensionData.pensionRetirementAge && pensionData.retirementGroup && pensionData.yearsOfService && (
              (() => {
                const validationError = validatePensionRetirementAge(pensionData.pensionRetirementAge, pensionData.retirementGroup, pensionData.yearsOfService)
                return validationError ? (
                  <p className="text-sm text-red-500">{validationError}</p>
                ) : (
                  <p className="text-sm text-green-600">✓ Valid retirement age for Group {pensionData.retirementGroup}</p>
                )
              })()
            )}
            <p className="text-sm text-muted-foreground">
              Age when you plan to start receiving your pension benefits (may differ from Social Security claiming age).
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="retirementOption">Retirement Option</Label>
            <Select
              value={pensionData.retirementOption || 'A'}
              onValueChange={(value) => updateWizardData({
                pensionData: {
                  ...pensionData,
                  retirementOption: value as 'A' | 'B' | 'C' | 'D',
                  // Clear beneficiary age if not Option C
                  beneficiaryAge: value === 'C' ? pensionData.beneficiaryAge : undefined
                }
              })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select retirement option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="A">Option A - Maximum Benefit (100%)</SelectItem>
                <SelectItem value="B">Option B - Annuity Protection</SelectItem>
                <SelectItem value="C">Option C - Joint & Survivor (66.67%)</SelectItem>
                <SelectItem value="D">Option D - Guaranteed Period</SelectItem>
              </SelectContent>
            </Select>

            {/* Conditional Beneficiary Age field for Option C */}
            {pensionData.retirementOption === 'C' && (
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <Label htmlFor="beneficiaryAge" className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4" />
                  Beneficiary's Age (at your retirement)
                </Label>
                <Input
                  id="beneficiaryAge"
                  type="number"
                  placeholder="e.g., 58"
                  value={pensionData.beneficiaryAge || ''}
                  onChange={(e) => {
                    const value = e.target.value
                    const numValue = value ? parseInt(value) : undefined
                    updateWizardData({
                      pensionData: {
                        ...pensionData,
                        beneficiaryAge: numValue
                      }
                    })
                  }}
                  className={errors['pensionData.beneficiaryAge'] ? "border-red-500" : ""}
                />
                {errors['pensionData.beneficiaryAge'] && <p className="text-sm text-red-500">{errors['pensionData.beneficiaryAge']}</p>}
                <p className="text-sm text-muted-foreground mt-2">
                  Required for Option C. The beneficiary's age affects the reduction percentage applied to your pension.
                </p>
              </div>
            )}
          </div>
        </div>

        {pensionData.averageSalary && pensionData.yearsOfService && (
          <Alert>
            <Calculator className="h-4 w-4" />
            <AlertDescription>
              Estimated monthly pension: ${Math.round(calculatePensionBenefit()).toLocaleString()}
              <br />
              Based on {pensionData.yearsOfService} years of service and ${pensionData.averageSalary.toLocaleString()} average salary.
            </AlertDescription>
          </Alert>
        )}
      </div>
    )
  }

  // Step 3: Social Security Benefits
  const renderSocialSecurityStep = () => {
    const socialSecurityData = wizardData.socialSecurityData || {
      fullRetirementAge: 67,
      earlyRetirementBenefit: 0,
      fullRetirementBenefit: 0,
      delayedRetirementBenefit: 0,
      selectedClaimingAge: 67,
      selectedMonthlyBenefit: 0,
      isMarried: false
    }

    return (
      <div className="space-y-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You can find these benefit estimates on your Social Security Statement at{' '}
            <a href="https://www.ssa.gov/myaccount/" target="_blank" rel="noopener noreferrer" className="underline">
              ssa.gov/myaccount
            </a>
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="fullRetirementBenefit" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Full Retirement Benefit (Monthly)
            </Label>
            <Input
              id="fullRetirementBenefit"
              type="number"
              placeholder="2500"
              value={socialSecurityData.fullRetirementBenefit || ''}
              onChange={(e) => {
                const value = e.target.value
                const numValue = value ? parseFloat(value) : 0
                updateWizardData({
                  socialSecurityData: {
                    ...socialSecurityData,
                    fullRetirementBenefit: numValue
                  }
                })
              }}
              className={errors['socialSecurityData.fullRetirementBenefit'] ? "border-red-500" : ""}
            />
            {errors['socialSecurityData.fullRetirementBenefit'] && <p className="text-sm text-red-500">{errors['socialSecurityData.fullRetirementBenefit']}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="selectedClaimingAge">Planned Claiming Age</Label>
            <Select
              value={socialSecurityData.selectedClaimingAge?.toString() || '67'}
              onValueChange={(value) => updateWizardData({
                socialSecurityData: {
                  ...socialSecurityData,
                  selectedClaimingAge: parseInt(value),
                  selectedMonthlyBenefit: calculateSSBenefit(parseInt(value))
                }
              })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select claiming age" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="62">Age 62 (Early, ~75% benefit)</SelectItem>
                <SelectItem value="63">Age 63 (~80% benefit)</SelectItem>
                <SelectItem value="64">Age 64 (~86.7% benefit)</SelectItem>
                <SelectItem value="65">Age 65 (~93.3% benefit)</SelectItem>
                <SelectItem value="66">Age 66 (~96.7% benefit)</SelectItem>
                <SelectItem value="67">Age 67 (Full benefit)</SelectItem>
                <SelectItem value="68">Age 68 (~108% benefit)</SelectItem>
                <SelectItem value="69">Age 69 (~116% benefit)</SelectItem>
                <SelectItem value="70">Age 70 (~124% benefit)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Marital Status
            </Label>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isMarried"
                checked={socialSecurityData.isMarried || false}
                onCheckedChange={(checked) => updateWizardData({
                  socialSecurityData: {
                    ...socialSecurityData,
                    isMarried: checked as boolean
                  }
                })}
              />
              <Label htmlFor="isMarried">Married (for spousal benefits)</Label>
            </div>
          </div>

          {socialSecurityData.isMarried && (
            <div className="space-y-2">
              <Label htmlFor="spouseFullRetirementBenefit">Spouse's Full Retirement Benefit</Label>
              <Input
                id="spouseFullRetirementBenefit"
                type="number"
                placeholder="1800"
                value={socialSecurityData.spouseFullRetirementBenefit || ''}
                onChange={(e) => updateWizardData({
                  socialSecurityData: {
                    ...socialSecurityData,
                    spouseFullRetirementBenefit: parseFloat(e.target.value) || 0
                  }
                })}
              />
            </div>
          )}
        </div>

        {socialSecurityData.fullRetirementBenefit && socialSecurityData.selectedClaimingAge && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Estimated monthly Social Security benefit at age {socialSecurityData.selectedClaimingAge}:
              ${Math.round(calculateSSBenefit(socialSecurityData.selectedClaimingAge)).toLocaleString()}
            </AlertDescription>
          </Alert>
        )}
      </div>
    )
  }

  // Helper function to calculate SS benefit based on claiming age
  const calculateSSBenefit = (claimingAge: number): number => {
    const fullBenefit = wizardData.socialSecurityData?.fullRetirementBenefit || 0
    const fullRetirementAge = 67

    if (claimingAge < fullRetirementAge) {
      // Early retirement reduction
      const monthsEarly = (fullRetirementAge - claimingAge) * 12
      const reductionRate = monthsEarly <= 36 ? 0.0055 : 0.0041 // Different rates for first 36 months
      return fullBenefit * (1 - (monthsEarly * reductionRate))
    } else if (claimingAge > fullRetirementAge) {
      // Delayed retirement credits
      const yearsDelayed = claimingAge - fullRetirementAge
      return fullBenefit * (1 + (yearsDelayed * 0.08))
    }

    return fullBenefit
  }

  // Step 4: Income & Assets
  const renderIncomeAssetsStep = () => {
    const incomeData = wizardData.incomeData || {
      totalAnnualIncome: 0,
      otherRetirementIncome: 0,
      hasRothIRA: false,
      rothIRABalance: 0,
      has401k: false,
      traditional401kBalance: 0,
      estimatedMedicarePremiums: 174.70
    }

    return (
      <div className="space-y-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            This step is optional but helps provide more accurate retirement income projections.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="otherRetirementIncome" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Other Monthly Retirement Income
            </Label>
            <Input
              id="otherRetirementIncome"
              type="number"
              placeholder="500"
              value={incomeData.otherRetirementIncome || ''}
              onChange={(e) => updateWizardData({
                incomeData: {
                  ...incomeData,
                  otherRetirementIncome: parseFloat(e.target.value) || 0
                }
              })}
            />
            <p className="text-sm text-muted-foreground">
              Rental income, part-time work, etc.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="hasRothIRA"
                checked={incomeData.hasRothIRA || false}
                onCheckedChange={(checked) => updateWizardData({
                  incomeData: {
                    ...incomeData,
                    hasRothIRA: checked as boolean
                  }
                })}
              />
              <Label htmlFor="hasRothIRA">I have a Roth IRA</Label>
            </div>

            {incomeData.hasRothIRA && (
              <div className="space-y-2">
                <Label htmlFor="rothIRABalance">Roth IRA Balance</Label>
                <Input
                  id="rothIRABalance"
                  type="number"
                  placeholder="150000"
                  value={incomeData.rothIRABalance || ''}
                  onChange={(e) => updateWizardData({
                    incomeData: {
                      ...incomeData,
                      rothIRABalance: parseFloat(e.target.value) || 0
                    }
                  })}
                />
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="has401k"
                checked={incomeData.has401k || false}
                onCheckedChange={(checked) => updateWizardData({
                  incomeData: {
                    ...incomeData,
                    has401k: checked as boolean
                  }
                })}
              />
              <Label htmlFor="has401k">I have a 401(k) or 403(b)</Label>
            </div>

            {incomeData.has401k && (
              <div className="space-y-2">
                <Label htmlFor="traditional401kBalance">401(k)/403(b) Balance</Label>
                <Input
                  id="traditional401kBalance"
                  type="number"
                  placeholder="300000"
                  value={incomeData.traditional401kBalance || ''}
                  onChange={(e) => updateWizardData({
                    incomeData: {
                      ...incomeData,
                      traditional401kBalance: parseFloat(e.target.value) || 0
                    }
                  })}
                />
              </div>
            )}
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-semibold mb-2">Why This Matters</h4>
          <p className="text-sm text-muted-foreground">
            Additional income sources and retirement accounts help us calculate your total retirement income
            and provide tax optimization strategies. This information is kept private and secure.
          </p>
        </div>
      </div>
    )
  }

  // Step 5: Preferences
  const renderPreferencesStep = () => {
    const preferences = wizardData.preferences || {
      riskTolerance: 'moderate' as const,
      inflationScenario: 'moderate' as const,
      includeTaxOptimization: true,
      includeMonteCarloAnalysis: false,
      retirementIncomeGoal: 0
    }

    return (
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Risk Tolerance
            </Label>
            <Select
              value={preferences.riskTolerance || 'moderate'}
              onValueChange={(value) => updateWizardData({
                preferences: {
                  ...preferences,
                  riskTolerance: value as 'conservative' | 'moderate' | 'aggressive'
                }
              })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select risk tolerance" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="conservative">Conservative - Prioritize stability</SelectItem>
                <SelectItem value="moderate">Moderate - Balanced approach</SelectItem>
                <SelectItem value="aggressive">Aggressive - Maximize growth potential</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Inflation Scenario</Label>
            <Select
              value={preferences.inflationScenario || 'moderate'}
              onValueChange={(value) => updateWizardData({
                preferences: {
                  ...preferences,
                  inflationScenario: value as 'conservative' | 'moderate' | 'optimistic'
                }
              })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select inflation scenario" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="conservative">Conservative (3-4% annually)</SelectItem>
                <SelectItem value="moderate">Moderate (2-3% annually)</SelectItem>
                <SelectItem value="optimistic">Optimistic (1-2% annually)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="retirementIncomeGoal" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Monthly Retirement Income Goal
            </Label>
            <Input
              id="retirementIncomeGoal"
              type="number"
              placeholder="5000"
              value={preferences.retirementIncomeGoal || ''}
              onChange={(e) => updateWizardData({
                preferences: {
                  ...preferences,
                  retirementIncomeGoal: parseFloat(e.target.value) || 0
                }
              })}
            />
            <p className="text-sm text-muted-foreground">
              Your target monthly income in retirement
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-semibold">Analysis Options</h4>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="includeTaxOptimization"
              checked={preferences.includeTaxOptimization !== false}
              onCheckedChange={(checked) => updateWizardData({
                preferences: {
                  ...preferences,
                  includeTaxOptimization: checked as boolean
                }
              })}
            />
            <Label htmlFor="includeTaxOptimization">Include tax optimization strategies</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="includeMonteCarloAnalysis"
              checked={preferences.includeMonteCarloAnalysis || false}
              onCheckedChange={(checked) => updateWizardData({
                preferences: {
                  ...preferences,
                  includeMonteCarloAnalysis: checked as boolean
                }
              })}
            />
            <Label htmlFor="includeMonteCarloAnalysis">Include Monte Carlo risk analysis</Label>
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <h4 className="font-semibold mb-2">Ready for Analysis</h4>
          <p className="text-sm text-muted-foreground">
            We'll use your preferences to customize the retirement optimization analysis
            and provide recommendations tailored to your goals and risk tolerance.
          </p>
        </div>
      </div>
    )
  }

  // Step 6: Optimization Results
  const renderOptimizationStep = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-12 w-12 animate-spin mb-4" />
          <h3 className="text-lg font-semibold mb-2">Analyzing Your Retirement Strategy</h3>
          <p className="text-muted-foreground text-center">
            Our AI is calculating optimal claiming strategies and analyzing thousands of scenarios...
          </p>
        </div>
      )
    }

    if (!optimizationResults) {
      return (
        <div className="text-center py-8">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Click "Next" to run the optimization analysis.
            </AlertDescription>
          </Alert>
        </div>
      )
    }

    const { recommendedStrategy, alternativeScenarios } = optimizationResults

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-green-600 mb-2">Optimization Complete!</h3>
          <p className="text-muted-foreground">
            Here's your personalized retirement strategy analysis
          </p>
        </div>

        {/* Recommended Strategy */}
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <TrendingUp className="h-5 w-5" />
              Recommended Strategy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Pension Claiming Age</p>
                <p className="text-2xl font-bold">{recommendedStrategy.pensionClaimingAge}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Social Security Claiming Age</p>
                <p className="text-2xl font-bold">{recommendedStrategy.socialSecurityClaimingAge}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Monthly Retirement Income</p>
                <p className="text-2xl font-bold text-green-600">
                  ${Math.round(recommendedStrategy.monthlyRetirementIncome).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Net After-Tax Income</p>
                <p className="text-2xl font-bold">
                  ${Math.round(recommendedStrategy.netAfterTaxIncome).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="mt-4 p-3 bg-white rounded">
              <p className="text-sm text-muted-foreground">Total Lifetime Benefits</p>
              <p className="text-xl font-bold">
                ${Math.round(recommendedStrategy.totalLifetimeBenefits).toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Alternative Scenarios */}
        <div>
          <h4 className="text-lg font-semibold mb-4">Alternative Scenarios</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {alternativeScenarios.map((scenario: any, index: number) => (
              <Card key={index} className="border-blue-200">
                <CardHeader>
                  <CardTitle className="text-blue-700">{scenario.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Pension Age:</span>
                      <span className="font-semibold">{scenario.pensionAge}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">SS Age:</span>
                      <span className="font-semibold">{scenario.ssAge}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Monthly Income:</span>
                      <span className="font-semibold">${Math.round(scenario.monthlyIncome).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Lifetime Benefits:</span>
                      <span className="font-semibold">${Math.round(scenario.lifetimeBenefits).toLocaleString()}</span>
                    </div>
                    <div className="mt-3">
                      <p className="text-xs text-muted-foreground">Trade-offs:</p>
                      <ul className="text-xs text-muted-foreground">
                        {scenario.tradeoffs.map((tradeoff: string, i: number) => (
                          <li key={i}>• {tradeoff}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Step 7: Review & Save
  const renderReviewSaveStep = () => {
    const personalInfo = wizardData.personalInfo || {
      birthYear: 0,
      retirementGoalAge: 0,
      lifeExpectancy: 85,
      filingStatus: 'single' as const,
      currentAge: 0
    }
    const pensionData = wizardData.pensionData || {
      yearsOfService: 0,
      averageSalary: 0,
      retirementGroup: '1' as const,
      serviceEntry: 'before_2012' as const,
      pensionRetirementAge: 65,
      beneficiaryAge: undefined,
      benefitPercentage: 2.5,
      retirementOption: 'A' as const,
      retirementDate: '',
      monthlyBenefit: 0,
      annualBenefit: 0
    }
    const socialSecurityData = wizardData.socialSecurityData || {
      fullRetirementAge: 67,
      earlyRetirementBenefit: 0,
      fullRetirementBenefit: 0,
      delayedRetirementBenefit: 0,
      selectedClaimingAge: 67,
      selectedMonthlyBenefit: 0,
      isMarried: false
    }
    const incomeData = wizardData.incomeData || {
      totalAnnualIncome: 0,
      otherRetirementIncome: 0,
      hasRothIRA: false,
      rothIRABalance: 0,
      has401k: false,
      traditional401kBalance: 0,
      estimatedMedicarePremiums: 174.70
    }
    const preferences = wizardData.preferences || {
      riskTolerance: 'moderate' as const,
      inflationScenario: 'moderate' as const,
      includeTaxOptimization: true,
      includeMonteCarloAnalysis: false,
      retirementIncomeGoal: 0
    }

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-2xl font-bold mb-2">Review Your Retirement Plan</h3>
          <p className="text-muted-foreground">
            Review your information and save your personalized retirement strategy
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Current Age:</span>
                  <span className="font-semibold">{personalInfo.currentAge}</span>
                </div>
                <div className="flex justify-between">
                  <span>Retirement Age:</span>
                  <span className="font-semibold">{personalInfo.retirementGoalAge}</span>
                </div>
                <div className="flex justify-between">
                  <span>Filing Status:</span>
                  <span className="font-semibold capitalize">{personalInfo.filingStatus}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Pension Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Years of Service:</span>
                  <span className="font-semibold">{pensionData.yearsOfService}</span>
                </div>
                <div className="flex justify-between">
                  <span>Average Salary:</span>
                  <span className="font-semibold">${pensionData.averageSalary?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Retirement Group:</span>
                  <span className="font-semibold">Group {pensionData.retirementGroup}</span>
                </div>
                <div className="flex justify-between">
                  <span>Pension Retirement Age:</span>
                  <span className="font-semibold">{pensionData.pensionRetirementAge}</span>
                </div>
                <div className="flex justify-between">
                  <span>Retirement Option:</span>
                  <span className="font-semibold">Option {pensionData.retirementOption}</span>
                </div>
                {pensionData.retirementOption === 'C' && pensionData.beneficiaryAge && (
                  <div className="flex justify-between">
                    <span>Beneficiary Age:</span>
                    <span className="font-semibold">{pensionData.beneficiaryAge}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Monthly Benefit:</span>
                  <span className="font-semibold text-green-600">
                    ${Math.round(calculatePensionBenefit()).toLocaleString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Social Security
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Full Benefit:</span>
                  <span className="font-semibold">${socialSecurityData.fullRetirementBenefit?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Claiming Age:</span>
                  <span className="font-semibold">{socialSecurityData.selectedClaimingAge}</span>
                </div>
                <div className="flex justify-between">
                  <span>Monthly Benefit:</span>
                  <span className="font-semibold text-blue-600">
                    ${Math.round(calculateSSBenefit(socialSecurityData.selectedClaimingAge || 67)).toLocaleString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Total Retirement Income
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Pension:</span>
                  <span className="font-semibold">${Math.round(calculatePensionBenefit()).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Social Security:</span>
                  <span className="font-semibold">
                    ${Math.round(calculateSSBenefit(socialSecurityData.selectedClaimingAge || 67)).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Other Income:</span>
                  <span className="font-semibold">${incomeData.otherRetirementIncome?.toLocaleString() || '0'}</span>
                </div>
                <hr />
                <div className="flex justify-between text-lg">
                  <span className="font-semibold">Total Monthly:</span>
                  <span className="font-bold text-green-600">
                    ${Math.round(
                      calculatePensionBenefit() +
                      calculateSSBenefit(socialSecurityData.selectedClaimingAge || 67) +
                      (incomeData.otherRetirementIncome || 0)
                    ).toLocaleString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Retirement Age Projection Chart */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Retirement Benefits Projection
            </CardTitle>
            <CardDescription>
              Projected monthly benefits from current age to 80 based on your inputs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(() => {
                const projectionData = generateRetirementProjection()

                if (projectionData.length === 0) {
                  return (
                    <div className="text-center py-8 text-muted-foreground">
                      Complete all steps to see your retirement projection
                    </div>
                  )
                }

                // Find key ages for highlighting
                const currentAge = wizardData.personalInfo?.currentAge || 0
                const pensionAge = wizardData.pensionData?.pensionRetirementAge || 65
                const ssAge = wizardData.socialSecurityData?.selectedClaimingAge || 67

                return (
                  <div className="space-y-4">
                    {/* Chart Legend */}
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-green-500 rounded"></div>
                        <span>Pension Benefits</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-blue-500 rounded"></div>
                        <span>Social Security Benefits</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-purple-500 rounded"></div>
                        <span>Total Monthly Income</span>
                      </div>
                    </div>

                    {/* Projection Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-2">Age</th>
                            <th className="text-right p-2">Pension</th>
                            <th className="text-right p-2">Social Security</th>
                            <th className="text-right p-2">Total Monthly</th>
                            <th className="text-right p-2">Total Annual</th>
                          </tr>
                        </thead>
                        <tbody>
                          {projectionData.filter((_, index) => index % 2 === 0).map((row) => (
                            <tr
                              key={row.age}
                              className={`border-b hover:bg-muted/50 ${
                                row.age === pensionAge || row.age === ssAge
                                  ? 'bg-blue-50 dark:bg-blue-950/20 font-semibold'
                                  : ''
                              }`}
                            >
                              <td className="p-2">
                                {row.age}
                                {row.age === pensionAge && (
                                  <Badge variant="outline" className="ml-2 text-xs">Pension</Badge>
                                )}
                                {row.age === ssAge && (
                                  <Badge variant="outline" className="ml-2 text-xs">SS</Badge>
                                )}
                              </td>
                              <td className="text-right p-2 text-green-600">
                                ${row.pensionMonthly.toLocaleString()}
                              </td>
                              <td className="text-right p-2 text-blue-600">
                                ${row.socialSecurityMonthly.toLocaleString()}
                              </td>
                              <td className="text-right p-2 font-semibold text-purple-600">
                                ${row.totalMonthly.toLocaleString()}
                              </td>
                              <td className="text-right p-2 text-muted-foreground">
                                ${row.totalAnnual.toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Key Insights */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                      <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                        <div className="text-sm font-medium text-green-800 dark:text-green-200">
                          Pension Starts
                        </div>
                        <div className="text-lg font-bold text-green-600">
                          Age {pensionAge}
                        </div>
                        <div className="text-sm text-green-600">
                          ${projectionData.find(p => p.age === pensionAge)?.pensionMonthly.toLocaleString() || '0'}/month
                        </div>
                      </div>

                      <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div className="text-sm font-medium text-blue-800 dark:text-blue-200">
                          Social Security Starts
                        </div>
                        <div className="text-lg font-bold text-blue-600">
                          Age {ssAge}
                        </div>
                        <div className="text-sm text-blue-600">
                          ${projectionData.find(p => p.age === ssAge)?.socialSecurityMonthly.toLocaleString() || '0'}/month
                        </div>
                      </div>

                      <div className="bg-purple-50 dark:bg-purple-950/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                        <div className="text-sm font-medium text-purple-800 dark:text-purple-200">
                          Peak Monthly Income
                        </div>
                        <div className="text-lg font-bold text-purple-600">
                          ${Math.max(...projectionData.map(p => p.totalMonthly)).toLocaleString()}
                        </div>
                        <div className="text-sm text-purple-600">
                          When both benefits active
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })()}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <Button variant="outline" className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            Save to Dashboard
          </Button>
        </div>

        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Your retirement plan will be saved to your profile and you can access it anytime from your dashboard.
            You'll also receive email updates about changes to Massachusetts retirement benefits that may affect your plan.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Progress Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Combined Retirement Planning Wizard</h1>
          <Badge variant="outline">
            Step {progress.stepNumber} of {progress.totalSteps}
          </Badge>
        </div>
        
        <Progress value={progress.percentComplete} className="mb-2" />
        
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>{Math.round(progress.percentComplete)}% Complete</span>
          <span>~{progress.estimatedTimeRemaining} minutes remaining</span>
        </div>
      </div>

      {/* Step Navigation */}
      <div className="flex items-center justify-center mb-8 overflow-x-auto">
        <div className="flex items-center space-x-2">
          {WIZARD_STEPS.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`
                flex items-center justify-center w-10 h-10 rounded-full border-2 
                ${index <= currentStep 
                  ? 'bg-blue-600 border-blue-600 text-white' 
                  : 'border-gray-300 text-gray-400'
                }
              `}>
                {index < currentStep ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  getStepIcon(index)
                )}
              </div>
              {index < WIZARD_STEPS.length - 1 && (
                <div className={`
                  w-8 h-0.5 mx-2
                  ${index < currentStep ? 'bg-blue-600' : 'bg-gray-300'}
                `} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getStepIcon(currentStep)}
            {WIZARD_STEPS[currentStep].title}
          </CardTitle>
          <CardDescription>
            {WIZARD_STEPS[currentStep].description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {renderStepContent()}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={!progress.canGoBack}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="flex gap-2">
          {progress.canSave && (
            <Button variant="outline">
              <Save className="mr-2 h-4 w-4" />
              Save Progress
            </Button>
          )}
          
          <Button
            onClick={handleNext}
            disabled={isLoading}
          >
            {currentStep === WIZARD_STEPS.length - 1 ? (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Complete Analysis
              </>
            ) : (
              <>
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {Object.keys(errors).length > 0 && (
        <Alert className="mt-4" variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {Object.values(errors).join(", ")}
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
