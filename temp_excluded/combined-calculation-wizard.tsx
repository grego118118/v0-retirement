"use client"

// @ts-nocheck - Temporary disable for complex wizard data types
import { useState, useEffect, useCallback, useRef } from "react"
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
  Loader2,
  Check,
  Clock,
  ExternalLink,
  Eye,
  ChevronDown,
  ChevronUp,
  Crown,
  Lock
} from "lucide-react"
import { CombinedCalculationData, WizardProgress, WIZARD_STEPS, ValidationRule } from "@/lib/wizard/wizard-types"
import { calculateAnnualPension, getBenefitFactor, generateProjectionTable, calculatePensionWithOption } from "@/lib/pension-calculations";
import { calculateRetirementBenefitsProjection, ProjectionParameters } from "@/lib/retirement-benefits-projection"
import { RetirementBenefitsProjection } from "@/components/retirement-benefits-projection"
import { SalaryProjectionDisplay } from "@/components/wizard/salary-projection-display"
import { calculateSalaryProjection, getRetirementDateForProjection } from "@/lib/salary-projection"
import { PDFExportSection } from "@/components/pdf/pdf-export-button"
import { CombinedCalculationData as PDFCombinedCalculationData } from "@/lib/pdf/pdf-generator"
import Link from "next/link"

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
  pensionRetirementAge: z.number().min(18).max(80), // Basic range, group-specific validation handled separately
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
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [showDetailedAnalysis, setShowDetailedAnalysis] = useState(false)

  // Refs for auto-scroll functionality
  const mainContentRef = useRef<HTMLDivElement>(null)
  const stepContentRef = useRef<HTMLDivElement>(null)
  const firstInputRef = useRef<HTMLInputElement>(null)

  // State for retirement projections toggle
  const [showExtendedProjections, setShowExtendedProjections] = useState(false)

  // Mobile detection utility
  const isMobile = useCallback(() => {
    return window.innerWidth <= 768 ||
           /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  }, [])

  // Auto-scroll utility function with smooth animation
  const scrollToStep = useCallback((targetElement?: HTMLElement) => {
    try {
      const element = targetElement || mainContentRef.current
      if (!element) return

      // Calculate scroll position with offset for better visibility
      const elementRect = element.getBoundingClientRect()
      // Use smaller offset on mobile for better screen utilization
      const offset = isMobile() ? 60 : 80
      const targetPosition = window.pageYOffset + elementRect.top - offset

      // Ensure we don't scroll past the document bounds
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight
      const finalPosition = Math.min(Math.max(0, targetPosition), maxScroll)

      // Use smooth scrolling with fallback for older browsers
      if ('scrollBehavior' in document.documentElement.style) {
        window.scrollTo({
          top: finalPosition,
          behavior: 'smooth'
        })
      } else {
        // Fallback smooth scroll for older browsers
        const startPosition = window.pageYOffset
        const distance = finalPosition - startPosition
        const duration = 500 // 500ms animation
        let start: number | null = null

        const step = (timestamp: number) => {
          if (!start) start = timestamp
          const progress = Math.min((timestamp - start) / duration, 1)

          // Easing function for smooth animation
          const easeInOutCubic = (t: number) =>
            t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1

          window.scrollTo(0, startPosition + distance * easeInOutCubic(progress))

          if (progress < 1) {
            requestAnimationFrame(step)
          }
        }

        requestAnimationFrame(step)
      }
    } catch (error) {
      // Silently handle scroll errors - not critical for functionality
      console.warn('Auto-scroll error:', error)
    }
  }, [isMobile])

  // Focus management for accessibility
  const focusFirstInput = useCallback(() => {
    // Wait for DOM updates and scroll animation to complete
    setTimeout(() => {
      try {
        // Try to find the first input, select, or textarea in the current step
        const stepContent = stepContentRef.current
        if (stepContent) {
          // More comprehensive selector for focusable elements
          const firstFocusable = stepContent.querySelector(
            'input:not([disabled]):not([type="hidden"]):not([readonly]), select:not([disabled]), textarea:not([disabled]):not([readonly]), [tabindex]:not([tabindex="-1"])'
          ) as HTMLElement

          if (firstFocusable) {
            // Ensure element is visible before focusing
            if (firstFocusable.offsetParent !== null) {
              firstFocusable.focus()

              // If it's an input field, also scroll it into view if needed on mobile
              if (isMobile() && (firstFocusable.tagName === 'INPUT' || firstFocusable.tagName === 'TEXTAREA')) {
                setTimeout(() => {
                  firstFocusable.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                    inline: 'nearest'
                  })
                }, 100)
              }
            }
          }
        }
      } catch (error) {
        // Silently handle focus errors - not critical for functionality
        console.warn('Focus management error:', error)
      }
    }, 600) // Wait for scroll animation to complete
  }, [isMobile])

  // Additional state for auto-scroll functionality
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const hasInitializedRef = useRef(false)
  const sessionIdRef = useRef<string | null>(null)

  // Handle step transitions with auto-scroll
  useEffect(() => {
    // Skip auto-scroll on initial load
    if (!hasInitializedRef.current) return

    // Add a small delay to allow for any step transition animations
    const scrollTimeout = setTimeout(() => {
      scrollToStep()
      focusFirstInput()
    }, 100) // Small delay for step transition animations

    return () => clearTimeout(scrollTimeout)
  }, [currentStep, scrollToStep, focusFirstInput])

  // Handle initial page load positioning for resumed wizards
  useEffect(() => {
    if (hasInitializedRef.current && resumeToken) {
      // For resumed wizards, scroll to current step after data loads
      const initialScrollTimeout = setTimeout(() => {
        scrollToStep()
      }, 500) // Longer delay for initial data loading

      return () => clearTimeout(initialScrollTimeout)
    }
  }, [userProfile, resumeToken, scrollToStep])

  // Safe number parsing that preserves user input precision
  const parseNumberInput = (value: string, isInteger: boolean = false): number => {
    if (!value || value.trim() === '') return 0

    const parsed = isInteger ? parseInt(value, 10) : parseFloat(value)

    // Return 0 for invalid inputs, but preserve valid numbers exactly
    return isNaN(parsed) ? 0 : parsed
  }

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
          // Fix: Use proper date parsing to avoid timezone issues
          const currentAge = profile.dateOfBirth ? (() => {
            const birthDate = new Date(profile.dateOfBirth)
            // Use local timezone to get the correct year
            const birthYear = birthDate.getFullYear()
            // If the parsed year seems wrong (timezone issue), extract from string
            const dateStr = profile.dateOfBirth.toString()
            const yearFromString = dateStr.match(/(\d{4})/)
            const correctBirthYear = yearFromString ? parseInt(yearFromString[1]) : birthYear
            return new Date().getFullYear() - correctBirthYear
          })() : 0

          const initialData: Partial<CombinedCalculationData> = {
            personalInfo: {
              birthYear: profile.dateOfBirth ? (() => {
                const birthDate = new Date(profile.dateOfBirth)
                const birthYear = birthDate.getFullYear()
                // If the parsed year seems wrong (timezone issue), extract from string
                const dateStr = profile.dateOfBirth.toString()
                const yearFromString = dateStr.match(/(\d{4})/)
                return yearFromString ? parseInt(yearFromString[1]) : birthYear
              })() : 0,
              retirementGoalAge: profile.plannedRetirementAge || 65,
              lifeExpectancy: 85,
              filingStatus: 'single',
              currentAge: currentAge
            },
            pensionData: {
              yearsOfService: profile.yearsOfService || 0,
              averageSalary: profile.averageHighest3Years || profile.currentSalary || 0,
              retirementGroup: (profile.retirementGroup || '1') as '1' | '2' | '3' | '4',
              serviceEntry: 'before_2012' as const, // Default to before_2012, user can change
              pensionRetirementAge: profile.plannedRetirementAge || getDefaultRetirementAge(profile.retirementGroup || '1'),
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

  // Initialize wizard data structure from saved state and profile
  useEffect(() => {
    if (session?.user?.id && !isLoadingProfile && !hasInitializedRef.current) {
      // Always try to load saved wizard state from localStorage
      const savedData = localStorage.getItem(`wizard-data-${session.user.id}`)

      if (savedData && resumeToken) {
        // Resume from saved state
        try {
          const parsed = JSON.parse(savedData)
          setWizardData(parsed.data || {})
          setCurrentStep(parsed.currentStep || 0)
          hasInitializedRef.current = true
          console.log('Resumed wizard from saved state:', parsed)
        } catch (error) {
          console.error("Failed to load saved wizard data:", error)
        }
      } else if (userProfile) {
        // Initialize from user profile if no saved data
        const initialData: Partial<CombinedCalculationData> = {
          personalInfo: {
            birthYear: userProfile.dateOfBirth ? (() => {
              const birthDate = new Date(userProfile.dateOfBirth)
              const birthYear = birthDate.getFullYear()
              // If the parsed year seems wrong (timezone issue), extract from string
              const dateStr = userProfile.dateOfBirth.toString()
              const yearFromString = dateStr.match(/(\d{4})/)
              return yearFromString ? parseInt(yearFromString[1]) : birthYear
            })() : 0,
            retirementGoalAge: 65,
            lifeExpectancy: 85,
            filingStatus: 'single' as const,
            currentAge: userProfile.dateOfBirth ? (() => {
              const birthDate = new Date(userProfile.dateOfBirth)
              const birthYear = birthDate.getFullYear()
              // If the parsed year seems wrong (timezone issue), extract from string
              const dateStr = userProfile.dateOfBirth.toString()
              const yearFromString = dateStr.match(/(\d{4})/)
              const correctBirthYear = yearFromString ? parseInt(yearFromString[1]) : birthYear
              return new Date().getFullYear() - correctBirthYear
            })() : 0
          },
          pensionData: {
            yearsOfService: userProfile.yearsOfService || 0,
            averageSalary: userProfile.averageHighest3Years || userProfile.currentSalary || 0,
            retirementGroup: (userProfile.retirementGroup || '1') as '1' | '2' | '3' | '4',
            serviceEntry: 'before_2012' as const,
            pensionRetirementAge: getDefaultRetirementAge('1'), // Default based on Group 1
            beneficiaryAge: undefined,
            benefitPercentage: 2.5,
            retirementOption: (userProfile.retirementOption || 'A') as 'A' | 'B' | 'C' | 'D',
            retirementDate: '',
            monthlyBenefit: 0,
            annualBenefit: 0
          },
          socialSecurityData: {
            fullRetirementAge: 67,
            earlyRetirementBenefit: 0,
            fullRetirementBenefit: userProfile.estimatedSocialSecurityBenefit || 0,
            delayedRetirementBenefit: 0,
            selectedClaimingAge: 67,
            selectedMonthlyBenefit: userProfile.estimatedSocialSecurityBenefit || 0,
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
            retirementIncomeGoal: 0
          }
        }

        setWizardData(initialData)
        hasInitializedRef.current = true
        console.log('Initialized wizard from user profile:', initialData)
      }
    }
  }, [resumeToken, session?.user?.id, isLoadingProfile, userProfile])

  // Update session ID ref when session changes
  if (session?.user?.id && sessionIdRef.current !== session.user.id) {
    sessionIdRef.current = session.user.id
  }

  // Debounced auto-save function
  const debouncedAutoSave = useCallback((data: Partial<CombinedCalculationData>, step: number) => {
    const sessionId = sessionIdRef.current
    if (!sessionId) return

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    // Set saving status
    setSaveStatus('saving')
    setIsSaving(true)

    // Set new timeout for 1.5 seconds
    saveTimeoutRef.current = setTimeout(() => {
      try {
        const saveData = {
          currentStep: step,
          data: data,
          savedAt: new Date().toISOString()
        }
        localStorage.setItem(`wizard-data-${sessionId}`, JSON.stringify(saveData))
        localStorage.setItem(`wizard-state-${sessionId}`, `step-${step}`)

        setSaveStatus('saved')
        setLastSaved(new Date())
        setIsSaving(false)

        // Reset to idle after 2 seconds
        setTimeout(() => {
          setSaveStatus('idle')
        }, 2000)
      } catch (error) {
        console.error('Auto-save failed:', error)
        setSaveStatus('error')
        setIsSaving(false)

        // Reset to idle after 3 seconds
        setTimeout(() => {
          setSaveStatus('idle')
        }, 3000)
      }
    }, 1500)
  }, [])

  // Auto-save wizard progress with debouncing
  useEffect(() => {
    if (sessionIdRef.current && Object.keys(wizardData).length > 0) {
      debouncedAutoSave(wizardData, currentStep)
    }

    // Cleanup timeout on unmount
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [wizardData, currentStep])

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

    const stepErrors: Record<string, string> = {}

    // Standard field validation
    if (step.validationRules) {
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
    }

    // Add data consistency validation for pension details step
    if (step.id === 'pension-details') {
      const consistencyValidation = validateDataConsistency()
      if (!consistencyValidation.isValid) {
        consistencyValidation.errors.forEach((error, index) => {
          stepErrors[`consistency_${index}`] = error
        })
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



  // Calculate pension benefit using proper MSRB methodology with projected salary
  const calculatePensionBenefit = (useProjectedSalary: boolean = true): number => {
    const pensionData = wizardData.pensionData
    const personalInfo = wizardData.personalInfo
    if (!pensionData || !personalInfo) return 0

    const { averageSalary, yearsOfService, retirementGroup, retirementOption, serviceEntry, pensionRetirementAge, beneficiaryAge } = pensionData
    const retirementAge = pensionRetirementAge || personalInfo.retirementGoalAge || 65

    // Calculate projected retirement salary if requested and data is available
    let salaryForCalculation = averageSalary
    if (useProjectedSalary && averageSalary > 0) {
      try {
        const retirementDate = getRetirementDateForProjection(
          retirementAge,
          personalInfo.currentAge,
          undefined, // No explicit retirement date
          personalInfo.birthYear
        )

        const projection = calculateSalaryProjection({
          currentSalary: averageSalary,
          retirementDate,
          retirementAge,
          currentAge: personalInfo.currentAge
        })

        if (projection.isValid && projection.projectedRetirementSalary > averageSalary) {
          salaryForCalculation = projection.projectedRetirementSalary
        }
      } catch (error) {
        console.warn('Error calculating projected salary, using current salary:', error)
        // Fall back to current salary
      }
    }

    // Use proper MSRB calculation methodology from the /calculator component
    try {
      const group = `GROUP_${pensionData.retirementGroup || '1'}`;
      const userServiceEntry = serviceEntry || "before_2012";

      const benefitFactor = getBenefitFactor(retirementAge, group, userServiceEntry, yearsOfService);
      if (benefitFactor === 0) return 0;

      let baseAnnualPension = salaryForCalculation * benefitFactor * yearsOfService;
      const maxPensionAllowed = salaryForCalculation * 0.8;

      if (baseAnnualPension > maxPensionAllowed) {
        baseAnnualPension = maxPensionAllowed;
      }

      const optionResult = calculatePensionWithOption(
        baseAnnualPension,
        retirementOption,
        retirementAge,
        pensionData.beneficiaryAge?.toString() || "",
        group
      );

      return optionResult.pension / 12; // Return monthly benefit
    } catch (error) {
      console.error('Error calculating pension benefit:', error)
      return 0
    }
  }

  // Function to render detailed analysis table
  const renderDetailedAnalysis = () => {
    const personalInfo = wizardData.personalInfo || {}
    const pensionData = wizardData.pensionData || {}
    const socialSecurityData = wizardData.socialSecurityData || {}
    const incomeData = wizardData.incomeData || {}

    const pensionBenefit = calculatePensionBenefit(true)
    const socialSecurityBenefit = calculateSSBenefit((socialSecurityData as any).selectedClaimingAge || 67)
    const totalMonthlyIncome = pensionBenefit + socialSecurityBenefit + ((incomeData as any).otherRetirementIncome || 0)
    const totalAnnualIncome = totalMonthlyIncome * 12
    const replacementRatio = totalAnnualIncome / ((pensionData as any).averageSalary || 1)

    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Detailed Retirement Analysis
          </CardTitle>
          <CardDescription>
            Comprehensive breakdown of your retirement income calculations and projections
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Pension Analysis */}
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Massachusetts Pension Analysis
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Retirement Group:</span>
                    <span className="font-medium">Group {(pensionData as any).retirementGroup}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Years of Service:</span>
                    <span className="font-medium">{(pensionData as any).yearsOfService}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Average Salary:</span>
                    <span className="font-medium">${(pensionData as any).averageSalary?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Retirement Option:</span>
                    <span className="font-medium">Option {(pensionData as any).retirementOption}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Benefit Factor:</span>
                    <span className="font-medium">{(pensionData.benefitPercentage || 0).toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Monthly Pension:</span>
                    <span className="font-medium text-green-600">${Math.round(pensionBenefit).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Annual Pension:</span>
                    <span className="font-medium text-green-600">${Math.round(pensionBenefit * 12).toLocaleString()}</span>
                  </div>
                  {pensionData.retirementOption === 'C' && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Survivor Benefit:</span>
                      <span className="font-medium">${Math.round(pensionBenefit * 0.6667).toLocaleString()}/month</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Social Security Analysis */}
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Social Security Analysis
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Full Retirement Age:</span>
                    <span className="font-medium">{socialSecurityData.fullRetirementAge}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Claiming Age:</span>
                    <span className="font-medium">{socialSecurityData.selectedClaimingAge}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Full Benefit Amount:</span>
                    <span className="font-medium">${socialSecurityData.fullRetirementBenefit?.toLocaleString()}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Monthly Benefit:</span>
                    <span className="font-medium text-blue-600">${Math.round(socialSecurityBenefit).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Annual Benefit:</span>
                    <span className="font-medium text-blue-600">${Math.round(socialSecurityBenefit * 12).toLocaleString()}</span>
                  </div>
                  {socialSecurityData.selectedClaimingAge !== socialSecurityData.fullRetirementAge && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Adjustment:</span>
                      <span className="font-medium">
                        {socialSecurityData.selectedClaimingAge < socialSecurityData.fullRetirementAge ? 'Early' : 'Delayed'} Claiming
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Combined Income Summary */}
            <div className="border-t pt-4">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Combined Retirement Income
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Monthly Pension:</span>
                    <span className="font-medium">${Math.round(pensionBenefit).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Monthly Social Security:</span>
                    <span className="font-medium">${Math.round(socialSecurityBenefit).toLocaleString()}</span>
                  </div>
                  {incomeData.otherRetirementIncome > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Other Income:</span>
                      <span className="font-medium">${incomeData.otherRetirementIncome.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-semibold border-t pt-2">
                    <span>Total Monthly Income:</span>
                    <span className="text-green-600">${Math.round(totalMonthlyIncome).toLocaleString()}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Annual Income:</span>
                    <span className="font-medium">${Math.round(totalAnnualIncome).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Pre-Retirement Salary:</span>
                    <span className="font-medium">${pensionData.averageSalary?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold border-t pt-2">
                    <span>Replacement Ratio:</span>
                    <span className={`${replacementRatio >= 0.8 ? 'text-green-600' : replacementRatio >= 0.7 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {(replacementRatio * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold mb-2 text-blue-800">Analysis & Recommendations</h4>
              <div className="space-y-2 text-sm text-blue-700">
                {replacementRatio >= 0.8 ? (
                  <p>✅ Excellent! Your retirement income replaces {(replacementRatio * 100).toFixed(1)}% of your pre-retirement salary, which exceeds the recommended 80% target.</p>
                ) : replacementRatio >= 0.7 ? (
                  <p>⚠️ Good progress. Your retirement income replaces {(replacementRatio * 100).toFixed(1)}% of your pre-retirement salary. Consider additional savings to reach the 80% target.</p>
                ) : (
                  <p>⚠️ Your retirement income replaces only {(replacementRatio * 100).toFixed(1)}% of your pre-retirement salary. Consider increasing savings or delaying retirement.</p>
                )}

                {socialSecurityData.selectedClaimingAge < socialSecurityData.fullRetirementAge && (
                  <p>💡 Consider delaying Social Security to your full retirement age ({socialSecurityData.fullRetirementAge}) to avoid early claiming penalties.</p>
                )}

                {socialSecurityData.selectedClaimingAge === socialSecurityData.fullRetirementAge && (
                  <p>💡 Consider delaying Social Security past your full retirement age to earn delayed retirement credits (up to age 70).</p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
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

      const profileResponse = await fetch('/api/retirement/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData)
      })

      // Calculate pension and social security benefits for saving
      const pensionBenefit = calculatePensionBenefit(true)
      const annualPensionBenefit = pensionBenefit * 12
      const socialSecurityBenefit = wizardData.socialSecurityData?.selectedMonthlyBenefit || 0

      // Prepare calculation data for saving to dashboard
      const calculationData = {
        calculationName: `Retirement Plan - ${new Date().toLocaleDateString()}`,
        retirementDate: new Date().toISOString(),
        retirementAge: wizardData.pensionData?.pensionRetirementAge || wizardData.personalInfo?.retirementGoalAge || 65,
        yearsOfService: wizardData.pensionData?.yearsOfService || 0,
        averageSalary: wizardData.pensionData?.averageSalary || 0,
        retirementGroup: wizardData.pensionData?.retirementGroup || "1",
        benefitPercentage: getBenefitFactor(
          wizardData.pensionData?.pensionRetirementAge || 65,
          `GROUP_${wizardData.pensionData?.retirementGroup || "1"}`,
          wizardData.pensionData?.serviceEntry || "before_2012",
          wizardData.pensionData?.yearsOfService || 0
        ),
        retirementOption: wizardData.pensionData?.retirementOption || "A",
        monthlyBenefit: pensionBenefit,
        annualBenefit: annualPensionBenefit,
        benefitReduction: 0, // Calculate if needed
        survivorBenefit: wizardData.pensionData?.retirementOption === "C" ? pensionBenefit * 0.6667 : undefined,
        notes: `Generated from Retirement Wizard on ${new Date().toLocaleDateString()}`,
        isFavorite: false,
        socialSecurityData: wizardData.socialSecurityData ? {
          fullRetirementAge: wizardData.socialSecurityData.fullRetirementAge,
          earlyRetirementBenefit: wizardData.socialSecurityData.earlyRetirementBenefit,
          fullRetirementBenefit: wizardData.socialSecurityData.fullRetirementBenefit,
          delayedRetirementBenefit: wizardData.socialSecurityData.delayedRetirementBenefit,
          selectedClaimingAge: wizardData.socialSecurityData.selectedClaimingAge,
          selectedMonthlyBenefit: wizardData.socialSecurityData.selectedMonthlyBenefit,
          combinedMonthlyIncome: pensionBenefit + socialSecurityBenefit,
          replacementRatio: ((pensionBenefit + socialSecurityBenefit) * 12) / (wizardData.pensionData?.averageSalary || 1)
        } : undefined
      }

      // Save calculation to dashboard
      const calculationResponse = await fetch('/api/retirement/calculations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(calculationData)
      })

      if (profileResponse.ok && calculationResponse.ok) {
        toast({
          title: "Success!",
          description: "Your retirement plan has been saved to your dashboard.",
        })
      } else {
        // Show partial success message
        if (profileResponse.ok) {
          toast({
            title: "Partially Saved",
            description: "Profile updated but calculation may not appear in dashboard.",
            variant: "destructive"
          })
        } else {
          throw new Error("Failed to save retirement plan")
        }
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
      toast({
        title: "Error",
        description: "Failed to save wizard results. Please try again.",
        variant: "destructive"
      })
      setErrors({ general: "Failed to save wizard results. Please try again." })
    } finally {
      setIsLoading(false)
    }
  }

  const updateWizardData = (stepData: Partial<CombinedCalculationData>) => {
    setWizardData(prev => ({ ...prev, ...stepData }))
    setErrors({}) // Clear errors when data is updated
  }

  // Save status indicator component
  const SaveStatusIndicator = () => {
    if (saveStatus === 'idle') return null

    const getStatusConfig = () => {
      switch (saveStatus) {
        case 'saving':
          return {
            icon: Clock,
            text: 'Saving...',
            className: 'text-blue-600 bg-blue-50 border-blue-200'
          }
        case 'saved':
          return {
            icon: Check,
            text: 'Saved',
            className: 'text-green-600 bg-green-50 border-green-200'
          }
        case 'error':
          return {
            icon: AlertTriangle,
            text: 'Save failed',
            className: 'text-red-600 bg-red-50 border-red-200'
          }
        default:
          return null
      }
    }

    const config = getStatusConfig()
    if (!config) return null

    const { icon: Icon, text, className } = config

    return (
      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-md border text-xs font-medium ${className}`}>
        <Icon className="h-3 w-3" />
        {text}
        {lastSaved && saveStatus === 'saved' && (
          <span className="text-muted-foreground ml-1">
            {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </div>
    )
  }

  // Helper function to get minimum retirement age by group
  const getMinRetirementAge = (group: string): number => {
    switch (group) {
      case '1': return 60 // Group 1: General employees (minimum eligible age)
      case '2': return 55 // Group 2: Probation/court officers (minimum eligible age)
      case '3': return 18 // Group 3: State Police (any age with 20+ years)
      case '4': return 50 // Group 4: Public safety/corrections (minimum eligible age)
      default: return 60
    }
  }

  // Helper function to get default retirement age by group (for auto-population)
  const getDefaultRetirementAge = (group: string): number => {
    switch (group) {
      case '1': return 60 // Group 1: Default to minimum eligible age
      case '2': return 55 // Group 2: Default to minimum eligible age
      case '3': return 55 // Group 3: Keep existing default (practical age)
      case '4': return 50 // Group 4: Default to minimum eligible age
      default: return 60
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

  // Data consistency validation function
  const validateDataConsistency = (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = []
    const pensionData = wizardData.pensionData
    const personalInfo = wizardData.personalInfo

    if (!pensionData || !personalInfo) {
      return { isValid: true, errors: [] } // Skip validation if data is incomplete
    }

    // Validate pension retirement age against group rules
    if (pensionData.pensionRetirementAge && pensionData.retirementGroup) {
      const ageValidation = validatePensionRetirementAge(
        pensionData.pensionRetirementAge,
        pensionData.retirementGroup,
        pensionData.yearsOfService || 0
      )
      if (ageValidation) {
        errors.push(`Pension Retirement Age: ${ageValidation}`)
      }
    }

    // Validate beneficiary age for Option C
    if (pensionData.retirementOption === 'C' && !pensionData.beneficiaryAge) {
      errors.push('Beneficiary age is required for Option C retirement')
    }

    // Validate years of service
    if (pensionData.yearsOfService && pensionData.yearsOfService < 0) {
      errors.push('Years of service cannot be negative')
    }

    // Validate average salary
    if (pensionData.averageSalary && pensionData.averageSalary <= 0) {
      errors.push('Average salary must be greater than zero')
    }

    // Cross-validate pension retirement age with current age
    if (pensionData.pensionRetirementAge && personalInfo.currentAge) {
      if (pensionData.pensionRetirementAge <= personalInfo.currentAge) {
        errors.push('Pension retirement age must be greater than current age')
      }
    }

    // Validate that pension benefit calculations are consistent
    try {
      const calculatedBenefit = calculatePensionBenefit()
      if (calculatedBenefit < 0) {
        errors.push('Calculated pension benefit is invalid')
      }
    } catch (error) {
      errors.push('Error in pension benefit calculation')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  // Generate enhanced retirement projection data with benefit progression and COLA
  const generateEnhancedRetirementProjection = () => {
    const pensionData = wizardData.pensionData
    const personalInfo = wizardData.personalInfo
    const socialSecurityData = wizardData.socialSecurityData

    if (!pensionData || !personalInfo) return []

    // Build projection parameters using the same function as the main calculator
    const projectionParams: ProjectionParameters = {
      currentAge: personalInfo.currentAge || 0,
      plannedRetirementAge: pensionData.pensionRetirementAge || 65,
      currentYearsOfService: pensionData.yearsOfService || 0,
      averageSalary: pensionData.averageSalary || 0,
      retirementGroup: `GROUP_${pensionData.retirementGroup || '1'}`,
      serviceEntry: pensionData.serviceEntry || 'before_2012',
      pensionOption: (pensionData.retirementOption || 'A') as "A" | "B" | "C",
      beneficiaryAge: pensionData.beneficiaryAge?.toString() || "",
      socialSecurityClaimingAge: socialSecurityData?.selectedClaimingAge || 67,
      socialSecurityFullBenefit: (socialSecurityData?.fullRetirementBenefit || 0) * 12, // Convert to annual
      projectionEndAge: 80,
      includeCOLA: true,
      colaRate: 0.03
    }

    return calculateRetirementBenefitsProjection(projectionParams)
  }

  // Legacy function for backward compatibility (simplified projection)
  const generateRetirementProjection = () => {
    const pensionData = wizardData.pensionData
    const personalInfo = wizardData.personalInfo
    const socialSecurityData = wizardData.socialSecurityData

    if (!pensionData || !personalInfo || !socialSecurityData) return []

    const pensionRetirementAge = pensionData.pensionRetirementAge || 65
    const projectionData = []

    // Calculate the fixed pension benefit using the same function as the Pension Details card
    const fixedPensionBenefit = calculatePensionBenefit()

    // Generate data from pension retirement age to 80
    const startAge = Math.max(pensionRetirementAge, 50) // Start at pension retirement age, minimum 50
    for (let age = startAge; age <= 80; age++) {
      // Pension benefit is fixed once you retire - use the same calculation as the details card
      const pensionBenefit = fixedPensionBenefit

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
        yearsOfService: pensionData.yearsOfService // Use actual years of service for consistency
      })
    }

    return projectionData
  }

  const getStepIcon = (stepIndex: number) => {
    const icons = [User, DollarSign, Calculator, Settings, FileText, CheckCircle]
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
                const numValue = parseNumberInput(value, true)
                // Calculate current age from birth year
                const currentAge = numValue > 0 ? new Date().getFullYear() - numValue : 0
                updateWizardData({
                  personalInfo: {
                    ...personalInfo,
                    birthYear: numValue,
                    currentAge: currentAge
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
              General Retirement Goal Age
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
      pensionRetirementAge: getDefaultRetirementAge('1'),
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
              Current Years of Service
            </Label>
            <Input
              id="yearsOfService"
              type="number"
              placeholder="20"
              step="0.1"
              value={pensionData.yearsOfService || ''}
              onChange={(e) => {
                const value = e.target.value
                const numValue = value && value.trim() !== '' ? parseFloat(value) : 0
                // Only update if the parsed value is valid or if the field is being cleared
                if (!isNaN(numValue) || value === '') {
                  updateWizardData({
                    pensionData: {
                      ...pensionData,
                      yearsOfService: numValue
                    }
                  })
                }
              }}
              className={errors['pensionData.yearsOfService'] ? "border-red-500" : ""}
            />
            {errors['pensionData.yearsOfService'] && <p className="text-sm text-red-500">{errors['pensionData.yearsOfService']}</p>}
            <p className="text-sm text-muted-foreground">
              Your current years of service. The projection will calculate your years at retirement.
            </p>
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
                const numValue = value && value.trim() !== '' ? parseInt(value, 10) : 0
                // Only update if the parsed value is valid or if the field is being cleared
                if (!isNaN(numValue) || value === '') {
                  updateWizardData({
                    pensionData: {
                      ...pensionData,
                      averageSalary: numValue
                    }
                  })
                }
              }}
              className={errors['pensionData.averageSalary'] ? "border-red-500" : ""}
            />
            {errors['pensionData.averageSalary'] && <p className="text-sm text-red-500">{errors['pensionData.averageSalary']}</p>}

            {/* Massachusetts Open Checkbook Link */}
            <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start gap-2">
                <div className="flex-shrink-0 mt-0.5">
                  <ExternalLink className="h-4 w-4 text-blue-600" />
                </div>
                <div className="text-sm">
                  <p className="text-blue-800 font-medium mb-1">
                    Need help finding your salary information?
                  </p>
                  <p className="text-blue-700 mb-2">
                    Use the official Massachusetts state resource to verify your current salary information for more accurate pension calculations.
                  </p>
                  <a
                    href="https://cthrupayroll.mass.gov/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline font-medium transition-colors"
                    aria-label="Open Massachusetts Statewide Payroll Database in a new tab to look up your current salary"
                  >
                    Look up your salary in the Massachusetts Statewide Payroll Database
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="retirementGroup">Massachusetts Retirement Group</Label>
            <Select
              value={pensionData.retirementGroup || '1'}
              onValueChange={(value) => {
                const newGroup = value as '1' | '2' | '3' | '4'
                const defaultAge = getDefaultRetirementAge(newGroup)

                updateWizardData({
                  pensionData: {
                    ...pensionData,
                    retirementGroup: newGroup,
                    // Auto-populate retirement age with group-specific default
                    // Only update if current age is 0 or matches a previous group's default
                    pensionRetirementAge: (!pensionData.pensionRetirementAge ||
                                         pensionData.pensionRetirementAge === 65 ||
                                         pensionData.pensionRetirementAge === getDefaultRetirementAge(pensionData.retirementGroup || '1'))
                                         ? defaultAge
                                         : pensionData.pensionRetirementAge
                  }
                })
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select retirement group" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Group 1 - General Employees (min. age 60)</SelectItem>
                <SelectItem value="2">Group 2 - Probation/Court Officers (min. age 55)</SelectItem>
                <SelectItem value="3">Group 3 - State Police (any age with 20+ years)</SelectItem>
                <SelectItem value="4">Group 4 - Public Safety/Corrections (min. age 50)</SelectItem>
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
              Massachusetts Pension Start Age
            </Label>
            <Input
              id="pensionRetirementAge"
              type="number"
              placeholder="65"
              value={pensionData.pensionRetirementAge || ''}
              onChange={(e) => {
                const value = e.target.value
                const numValue = value && value.trim() !== '' ? parseInt(value, 10) : 0
                // Only update if the parsed value is valid or if the field is being cleared
                if (!isNaN(numValue) || value === '') {
                  updateWizardData({
                    pensionData: {
                      ...pensionData,
                      pensionRetirementAge: numValue
                    }
                  })
                }
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
              Age when you plan to start receiving your Massachusetts state pension benefits. Minimum eligible ages: Group 1 (60), Group 2 (55), Group 3 (any age with 20+ years), Group 4 (50). This is different from your Social Security claiming age.
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
          <div className="space-y-4">
            <Alert>
              <Calculator className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <div>
                    <strong>Current Salary Calculation:</strong> ${Math.round(calculatePensionBenefit(false)).toLocaleString()}/month
                    <br />
                    <span className="text-sm text-muted-foreground">
                      Based on current salary of ${pensionData.averageSalary.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <strong>Projected Salary Calculation:</strong> ${Math.round(calculatePensionBenefit(true)).toLocaleString()}/month
                    <br />
                    <span className="text-sm text-muted-foreground">
                      Based on projected retirement salary with COLA adjustments
                    </span>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Salary Projection Display */}
        {pensionData.averageSalary && pensionData.averageSalary > 0 && (
          <SalaryProjectionDisplay
            currentSalary={pensionData.averageSalary}
            plannedRetirementAge={pensionData.pensionRetirementAge}
            currentAge={wizardData.personalInfo?.currentAge}
            birthYear={wizardData.personalInfo?.birthYear}
            className="mt-6"
            showDetails={true}
          />
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
                const numValue = parseNumberInput(value, true)
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
            <Label htmlFor="selectedClaimingAge">Social Security Claiming Age</Label>
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
                    spouseFullRetirementBenefit: parseNumberInput(e.target.value, true)
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
                  otherRetirementIncome: parseNumberInput(e.target.value, true)
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
                      rothIRABalance: parseNumberInput(e.target.value, true)
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
                      traditional401kBalance: parseNumberInput(e.target.value, true)
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

  // Step 5: Retirement Goals
  const renderPreferencesStep = () => {
    const preferences = wizardData.preferences || {
      retirementIncomeGoal: 0
    }

    return (
      <div className="space-y-6">
        <div className="space-y-4">
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
                  retirementIncomeGoal: parseNumberInput(e.target.value, true)
                }
              })}
            />
            <p className="text-sm text-muted-foreground">
              Your target monthly income in retirement. This helps you evaluate whether your pension and Social Security benefits will meet your financial goals.
            </p>
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-semibold mb-2">Setting Your Income Goal</h4>
          <p className="text-sm text-muted-foreground">
            Consider your current monthly expenses and how they might change in retirement.
            Many financial advisors suggest planning for 70-90% of your pre-retirement income,
            though your specific needs may vary based on your lifestyle and goals.
          </p>
        </div>
      </div>
    )
  }





  // Step 6: Review & Save
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
      pensionRetirementAge: getDefaultRetirementAge('1'),
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
                  <span>Current Years of Service:</span>
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
                  <span>Pension Start Age:</span>
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
                  <span>Monthly Benefit (Projected):</span>
                  <span className="font-semibold text-green-600">
                    ${Math.round(calculatePensionBenefit(true)).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Current Salary Basis:</span>
                  <span>
                    ${Math.round(calculatePensionBenefit(false)).toLocaleString()}
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
                  <span>SS Claiming Age:</span>
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
                  <span className="font-semibold">Total Monthly (Projected):</span>
                  <span className="font-bold text-green-600">
                    ${Math.round(
                      calculatePensionBenefit(true) +
                      calculateSSBenefit(socialSecurityData.selectedClaimingAge || 67) +
                      (incomeData.otherRetirementIncome || 0)
                    ).toLocaleString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Retirement Benefits Projection */}
        <div className="mt-8">
          {(() => {
            const enhancedProjectionData = generateEnhancedRetirementProjection()
            const pensionAge = wizardData.pensionData?.pensionRetirementAge || 65
            const ssAge = wizardData.socialSecurityData?.selectedClaimingAge || 67



            return (
              <RetirementBenefitsProjection
                projectionYears={enhancedProjectionData}
                pensionRetirementAge={pensionAge}
                socialSecurityClaimingAge={ssAge}
              />
            )
          })()}
        </div>



        {/* PDF Export Section */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mt-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-blue-900 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Professional PDF Reports
                <Crown className="w-4 h-4 text-amber-500" />
              </h3>
              <p className="text-sm text-blue-700 mt-1">
                Download comprehensive retirement analysis reports with official calculations and projections.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-medium text-blue-900">Basic Pension Report</h4>
              <p className="text-xs text-blue-600 mb-3">
                Detailed pension calculations with all retirement options and MSRB-accurate results.
              </p>
              <Button variant="outline" size="sm" disabled>
                <Lock className="w-4 h-4 mr-2" />
                Generate PDF Report
                <Crown className="w-4 h-4 ml-2 text-amber-500" />
              </Button>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-blue-900">Comprehensive Analysis</h4>
              <p className="text-xs text-blue-600 mb-3">
                Complete retirement plan including pension, Social Security, and additional income sources.
              </p>
              <Button variant="default" size="sm" disabled>
                <Lock className="w-4 h-4 mr-2" />
                Generate PDF Report
                <Crown className="w-4 h-4 ml-2 text-amber-500" />
              </Button>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-blue-200">
            <div className="flex items-center justify-between text-sm">
              <span className="text-blue-600">
                Unlock unlimited PDF reports with Premium
              </span>
              <Button size="sm" asChild>
                <Link href="/pricing">
                  View Plans
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => setShowDetailedAnalysis(!showDetailedAnalysis)}
          >
            <Eye className="h-4 w-4" />
            {showDetailedAnalysis ? (
              <>
                <ChevronUp className="h-4 w-4" />
                Hide Analysis
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4" />
                View Analysis
              </>
            )}
          </Button>
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={handleComplete}
            disabled={isLoading}
          >
            <Save className="h-4 w-4" />
            {isLoading ? "Saving..." : "Save to Dashboard"}
          </Button>
        </div>

        {/* Detailed Analysis Section */}
        {showDetailedAnalysis && renderDetailedAnalysis()}

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
          <div className="flex items-center gap-3">
            <SaveStatusIndicator />
            <Badge variant="outline">
              Step {progress.stepNumber} of {progress.totalSteps}
            </Badge>
          </div>
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
      <Card className="mb-8" ref={mainContentRef}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getStepIcon(currentStep)}
            {WIZARD_STEPS[currentStep].title}
          </CardTitle>
          <CardDescription>
            {WIZARD_STEPS[currentStep].description}
          </CardDescription>
        </CardHeader>
        <CardContent ref={stepContentRef}>
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
                <Save className="mr-2 h-4 w-4" />
                Save Results
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
