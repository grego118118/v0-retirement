"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  ChevronLeft, 
  ChevronRight, 
  Save, 
  CheckCircle, 
  Clock, 
  Calculator,
  TrendingUp,
  DollarSign,
  Users,
  FileText
} from "lucide-react"
import { useSession } from "next-auth/react"
import { useRetirementData } from "@/hooks/use-retirement-data"
import { toast } from "sonner"

// Import wizard steps
import { PersonalInfoStep } from "./steps/personal-info-step"
import { PensionDetailsStep } from "./steps/pension-details-step"
import { SocialSecurityStep } from "./steps/social-security-step"
import { IncomeAssetsStep } from "./steps/income-assets-step"
import { PreferencesStep } from "./steps/preferences-step"
import { OptimizationStep } from "./steps/optimization-step"
import { ReviewSaveStep } from "./steps/review-save-step"

// Import types and utilities
import { WizardState, CombinedCalculationData, WIZARD_STEPS, WizardProgress } from "@/lib/wizard/wizard-types"
import { optimizeRetirementStrategy } from "@/lib/optimization/retirement-optimizer"
import { calculateTaxImplications } from "@/lib/tax/tax-calculator"

interface CombinedCalculationWizardProps {
  onComplete?: (data: CombinedCalculationData) => void
  initialData?: Partial<CombinedCalculationData>
  resumeToken?: string
}

export function CombinedCalculationWizard({ 
  onComplete, 
  initialData,
  resumeToken 
}: CombinedCalculationWizardProps) {
  const { data: session } = useSession()
  const { saveCalculation } = useRetirementData()

  // Wizard state management
  const [wizardState, setWizardState] = useState<WizardState>({
    currentStep: 0,
    steps: [...WIZARD_STEPS],
    data: initializeWizardData(initialData),
    isComplete: false,
    savedAt: undefined,
    resumeToken
  })

  const [isCalculating, setIsCalculating] = useState(false)
  const [optimizationResults, setOptimizationResults] = useState<any>(null)
  const [isSaving, setIsSaving] = useState(false)

  // Calculate wizard progress
  const progress: WizardProgress = {
    stepNumber: wizardState.currentStep + 1,
    totalSteps: wizardState.steps.length,
    percentComplete: ((wizardState.currentStep + 1) / wizardState.steps.length) * 100,
    estimatedTimeRemaining: Math.max(0, (wizardState.steps.length - wizardState.currentStep - 1) * 2),
    canGoBack: wizardState.currentStep > 0,
    canGoForward: wizardState.steps[wizardState.currentStep]?.isComplete || false,
    canSave: wizardState.currentStep > 0
  }

  // Load saved wizard state on mount
  useEffect(() => {
    if (resumeToken) {
      loadWizardState(resumeToken)
    }
  }, [resumeToken])

  // Auto-save wizard state periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (wizardState.currentStep > 0 && session?.user) {
        saveWizardState()
      }
    }, 30000) // Auto-save every 30 seconds

    return () => clearInterval(interval)
  }, [wizardState, session])

  const handleStepComplete = useCallback((stepData: any) => {
    setWizardState(prev => {
      const newSteps = [...prev.steps]
      newSteps[prev.currentStep].isComplete = true

      return {
        ...prev,
        steps: newSteps,
        data: {
          ...prev.data,
          ...stepData
        }
      }
    })
  }, [])

  const currentStep = wizardState.steps[wizardState.currentStep]

  const handleNext = async () => {
    if (wizardState.currentStep === wizardState.steps.length - 2) {
      // Before final step, run optimization
      await runOptimization()
    }

    setWizardState(prev => ({
      ...prev,
      currentStep: Math.min(prev.currentStep + 1, prev.steps.length - 1)
    }))
  }

  const handlePrevious = () => {
    setWizardState(prev => ({
      ...prev,
      currentStep: Math.max(prev.currentStep - 1, 0)
    }))
  }

  const handleJumpToStep = (stepIndex: number) => {
    if (stepIndex <= wizardState.currentStep || wizardState.steps[stepIndex - 1]?.isComplete) {
      setWizardState(prev => ({
        ...prev,
        currentStep: stepIndex
      }))
    }
  }

  const runOptimization = async () => {
    setIsCalculating(true)
    try {
      // Run optimization analysis
      const results = optimizeRetirementStrategy(wizardState.data)
      setOptimizationResults(results)
      
      // Mark optimization step as complete
      setWizardState(prev => {
        const newSteps = [...prev.steps]
        const optimizationStepIndex = newSteps.findIndex(step => step.id === 'optimization')
        if (optimizationStepIndex >= 0) {
          newSteps[optimizationStepIndex].isComplete = true
        }
        return { ...prev, steps: newSteps }
      })
    } catch (error) {
      console.error('Optimization failed:', error)
      toast.error('Failed to run optimization analysis')
    } finally {
      setIsCalculating(false)
    }
  }

  const saveWizardState = async () => {
    if (!session?.user) return

    try {
      const stateToSave = {
        ...wizardState,
        savedAt: new Date().toISOString()
      }
      
      // Save to localStorage for now (could be enhanced to save to database)
      localStorage.setItem(`wizard-state-${session.user.id}`, JSON.stringify(stateToSave))
    } catch (error) {
      console.error('Failed to save wizard state:', error)
    }
  }

  const loadWizardState = async (token: string) => {
    try {
      const savedState = localStorage.getItem(`wizard-state-${session?.user?.id}`)
      if (savedState) {
        const parsedState = JSON.parse(savedState)
        setWizardState(parsedState)
      }
    } catch (error) {
      console.error('Failed to load wizard state:', error)
    }
  }

  const handleSaveAndExit = async () => {
    setIsSaving(true)
    try {
      await saveWizardState()
      toast.success('Progress saved! You can resume later.')
      onComplete?.(wizardState.data)
    } catch (error) {
      toast.error('Failed to save progress')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCompleteWizard = async () => {
    setIsSaving(true)
    try {
      // Create final calculation object
      const finalCalculation = {
        calculationName: `Combined Analysis - ${new Date().toLocaleDateString()}`,
        retirementDate: wizardState.data.pensionData.retirementDate,
        retirementAge: wizardState.data.personalInfo.retirementGoalAge,
        yearsOfService: wizardState.data.pensionData.yearsOfService,
        averageSalary: wizardState.data.pensionData.averageSalary,
        retirementGroup: wizardState.data.pensionData.retirementGroup,
        benefitPercentage: wizardState.data.pensionData.benefitPercentage,
        retirementOption: wizardState.data.pensionData.retirementOption,
        monthlyBenefit: wizardState.data.pensionData.monthlyBenefit,
        annualBenefit: wizardState.data.pensionData.annualBenefit,
        notes: `Comprehensive retirement analysis with optimization`,
        socialSecurityData: {
          fullRetirementAge: wizardState.data.socialSecurityData.fullRetirementAge,
          earlyRetirementBenefit: wizardState.data.socialSecurityData.earlyRetirementBenefit,
          fullRetirementBenefit: wizardState.data.socialSecurityData.fullRetirementBenefit,
          delayedRetirementBenefit: wizardState.data.socialSecurityData.delayedRetirementBenefit,
          selectedClaimingAge: wizardState.data.socialSecurityData.selectedClaimingAge,
          selectedMonthlyBenefit: wizardState.data.socialSecurityData.selectedMonthlyBenefit,
          combinedMonthlyIncome: wizardState.data.pensionData.monthlyBenefit + wizardState.data.socialSecurityData.selectedMonthlyBenefit,
          replacementRatio: ((wizardState.data.pensionData.monthlyBenefit + wizardState.data.socialSecurityData.selectedMonthlyBenefit) * 12) / wizardState.data.pensionData.averageSalary,
        },
        optimizationResults,
        wizardData: wizardState.data
      }

      const success = await saveCalculation(finalCalculation)
      if (success) {
        toast.success('Complete retirement analysis saved!')
        setWizardState(prev => ({ ...prev, isComplete: true }))
        onComplete?.(wizardState.data)
      }
    } catch (error) {
      console.error('Failed to save final calculation:', error)
      toast.error('Failed to save calculation')
    } finally {
      setIsSaving(false)
    }
  }

  function renderCurrentStep() {
    switch (currentStep?.id) {
      case 'personal-info':
        return (
          <PersonalInfoStep
            data={wizardState.data.personalInfo}
            onComplete={handleStepComplete}
          />
        )
      case 'pension-details':
        return (
          <PensionDetailsStep
            data={wizardState.data.pensionData}
            onComplete={handleStepComplete}
          />
        )
      case 'social-security':
        return (
          <SocialSecurityStep
            data={wizardState.data.socialSecurityData}
            onComplete={handleStepComplete}
          />
        )
      case 'income-assets':
        return (
          <IncomeAssetsStep
            data={wizardState.data.incomeData}
            onComplete={handleStepComplete}
          />
        )
      case 'preferences':
        return (
          <PreferencesStep
            data={wizardState.data.preferences}
            onComplete={handleStepComplete}
          />
        )
      case 'optimization':
        return (
          <OptimizationStep
            data={wizardState.data}
            results={optimizationResults}
            isCalculating={isCalculating}
            onComplete={handleStepComplete}
          />
        )
      case 'review-save':
        return (
          <ReviewSaveStep
            data={wizardState.data}
            results={optimizationResults}
            onComplete={handleCompleteWizard}
            isSaving={isSaving}
          />
        )
      default:
        return <div>Step not found</div>
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-6 w-6 text-blue-600" />
                Combined Retirement Planning Wizard
              </CardTitle>
              <CardDescription>
                Step-by-step analysis of your pension and Social Security benefits
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                Step {progress.stepNumber} of {progress.totalSteps}
              </Badge>
              {progress.estimatedTimeRemaining > 0 && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  ~{progress.estimatedTimeRemaining} min
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{currentStep?.title}</span>
                <span>{Math.round(progress.percentComplete)}% complete</span>
              </div>
              <Progress value={progress.percentComplete} className="h-2" />
            </div>

            {/* Step Navigation */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {wizardState.steps.map((step, index) => (
                  <button
                    key={step.id}
                    onClick={() => handleJumpToStep(index)}
                    disabled={index > wizardState.currentStep && !step.isComplete}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
                      index === wizardState.currentStep
                        ? 'bg-blue-600 text-white'
                        : step.isComplete
                        ? 'bg-green-600 text-white'
                        : index < wizardState.currentStep
                        ? 'bg-gray-300 text-gray-600 hover:bg-gray-400'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {step.isComplete ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      index + 1
                    )}
                  </button>
                ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleSaveAndExit}
                disabled={isSaving || wizardState.currentStep === 0}
              >
                <Save className="mr-2 h-4 w-4" />
                Save & Exit
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Step Content */}
      <Card>
        <CardHeader>
          <CardTitle>{currentStep?.title}</CardTitle>
          <CardDescription>{currentStep?.description}</CardDescription>
        </CardHeader>
        <CardContent>
          {renderCurrentStep()}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={!progress.canGoBack}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>

        <div className="flex gap-2">
          {wizardState.currentStep === wizardState.steps.length - 1 ? (
            <Button
              onClick={handleCompleteWizard}
              disabled={!progress.canGoForward || isSaving}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Complete Analysis
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={!progress.canGoForward || isCalculating}
            >
              {isCalculating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Calculating...
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

function initializeWizardData(initialData?: Partial<CombinedCalculationData>): CombinedCalculationData {
  return {
    personalInfo: {
      birthYear: new Date().getFullYear() - 55,
      retirementGoalAge: 65,
      lifeExpectancy: 85,
      filingStatus: 'single',
      currentAge: 55,
      ...initialData?.personalInfo
    },
    pensionData: {
      yearsOfService: 0,
      averageSalary: 0,
      retirementGroup: '1',
      benefitPercentage: 0,
      retirementOption: 'A',
      retirementDate: '',
      monthlyBenefit: 0,
      annualBenefit: 0,
      ...initialData?.pensionData
    },
    socialSecurityData: {
      fullRetirementAge: 67,
      earlyRetirementBenefit: 0,
      fullRetirementBenefit: 0,
      delayedRetirementBenefit: 0,
      selectedClaimingAge: 67,
      selectedMonthlyBenefit: 0,
      isMarried: false,
      ...initialData?.socialSecurityData
    },
    incomeData: {
      totalAnnualIncome: 0,
      otherRetirementIncome: 0,
      hasRothIRA: false,
      rothIRABalance: 0,
      has401k: false,
      traditional401kBalance: 0,
      estimatedMedicarePremiums: 174.70,
      ...initialData?.incomeData
    },
    preferences: {
      riskTolerance: 'moderate',
      inflationScenario: 'moderate',
      includeTaxOptimization: true,
      includeMonteCarloAnalysis: false,
      retirementIncomeGoal: 0,
      ...initialData?.preferences
    }
  }
}
