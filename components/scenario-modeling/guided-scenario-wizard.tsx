"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle, 
  Info, 
  User, 
  Calculator,
  DollarSign,
  Calendar,
  Target,
  TrendingUp
} from 'lucide-react'
import { useProfile } from '@/contexts/profile-context'
import { RetirementScenario } from '@/lib/scenario-modeling/scenario-types'
import { useScenarios } from '@/lib/hooks/use-scenarios'
import { toast } from 'sonner'

interface GuidedScenarioWizardProps {
  onComplete?: (scenario: RetirementScenario) => void
  onCancel?: () => void
  className?: string
}

interface WizardStep {
  id: string
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  isComplete: boolean
  isActive: boolean
}

export function GuidedScenarioWizard({ 
  onComplete, 
  onCancel,
  className 
}: GuidedScenarioWizardProps) {
  const { profile } = useProfile()
  const { createScenario } = useScenarios()
  
  const [currentStep, setCurrentStep] = useState(0)
  const [isCreating, setIsCreating] = useState(false)
  
  // Scenario data state
  const [scenarioData, setScenarioData] = useState({
    name: '',
    description: '',
    retirementAge: profile?.plannedRetirementAge || 65,
    socialSecurityClaimingAge: 67,
    riskTolerance: 'moderate' as 'conservative' | 'moderate' | 'aggressive',
    additionalSavings: 0,
    monthlyContributions: 0
  })

  const steps: WizardStep[] = [
    {
      id: 'basic',
      title: 'Basic Information',
      description: 'Name and describe your scenario',
      icon: User,
      isComplete: scenarioData.name.length > 0,
      isActive: currentStep === 0
    },
    {
      id: 'retirement',
      title: 'Retirement Planning',
      description: 'Set your retirement age and goals',
      icon: Calendar,
      isComplete: scenarioData.retirementAge > 0,
      isActive: currentStep === 1
    },
    {
      id: 'social-security',
      title: 'Social Security',
      description: 'Choose your claiming strategy',
      icon: TrendingUp,
      isComplete: scenarioData.socialSecurityClaimingAge > 0,
      isActive: currentStep === 2
    },
    {
      id: 'savings',
      title: 'Additional Savings',
      description: 'Include other retirement savings',
      icon: DollarSign,
      isComplete: true, // Optional step
      isActive: currentStep === 3
    },
    {
      id: 'review',
      title: 'Review & Create',
      description: 'Confirm your scenario details',
      icon: CheckCircle,
      isComplete: false,
      isActive: currentStep === 4
    }
  ]

  const progress = ((currentStep + 1) / steps.length) * 100

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleCreateScenario = async () => {
    if (!profile) {
      toast.error('Profile data is required to create a scenario')
      return
    }

    setIsCreating(true)
    
    try {
      // Build scenario from profile and wizard data
      const newScenario: Omit<RetirementScenario, 'id' | 'createdAt' | 'updatedAt'> = {
        name: scenarioData.name,
        description: scenarioData.description,
        isBaseline: false,
        personalParameters: {
          retirementAge: scenarioData.retirementAge,
          lifeExpectancy: 85, // Default
          currentAge: profile.dateOfBirth ? 
            new Date().getFullYear() - new Date(profile.dateOfBirth).getFullYear() : 45,
          birthYear: profile.dateOfBirth ? 
            new Date(profile.dateOfBirth).getFullYear() : 1979
        },
        pensionParameters: {
          retirementGroup: profile.retirementGroup || '1',
          yearsOfService: profile.yearsOfService || 0,
          averageSalary: profile.averageHighest3Years || profile.currentSalary || 0,
          retirementOption: 'A',
          servicePurchases: []
        },
        socialSecurityParameters: {
          claimingAge: scenarioData.socialSecurityClaimingAge,
          fullRetirementAge: 67,
          estimatedBenefit: 2500, // Default estimate
          spousalBenefit: 0
        },
        financialParameters: {
          currentSavings: scenarioData.additionalSavings,
          monthlyContributions: scenarioData.monthlyContributions,
          expectedReturnRate: scenarioData.riskTolerance === 'conservative' ? 0.05 : 
                             scenarioData.riskTolerance === 'moderate' ? 0.07 : 0.09,
          riskTolerance: scenarioData.riskTolerance,
          withdrawalRate: 0.04,
          otherRetirementIncome: 0
        },
        taxParameters: {
          filingStatus: 'single',
          stateOfResidence: 'MA',
          taxOptimizationStrategy: 'basic',
          rothConversions: false,
          taxLossHarvesting: false
        },
        colaParameters: {
          pensionCOLA: 0.03,
          socialSecurityCOLA: 0.025,
          colaScenario: 'moderate'
        }
      }

      const createdScenario = await createScenario(newScenario)
      
      if (createdScenario) {
        toast.success('Scenario created successfully!')
        onComplete?.(createdScenario)
      }
    } catch (error) {
      console.error('Error creating scenario:', error)
      toast.error('Failed to create scenario')
    } finally {
      setIsCreating(false)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Basic Information
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="scenario-name">Scenario Name *</Label>
              <Input
                id="scenario-name"
                value={scenarioData.name}
                onChange={(e) => setScenarioData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Early Retirement at 62"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="scenario-description">Description</Label>
              <Input
                id="scenario-description"
                value={scenarioData.description}
                onChange={(e) => setScenarioData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe your retirement strategy..."
                className="mt-1"
              />
            </div>

            {profile && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  This scenario will use your profile data: {profile.retirementGroup} retirement group, 
                  {profile.yearsOfService || 0} years of service, and ${profile.currentSalary?.toLocaleString() || 'N/A'} current salary.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )

      case 1: // Retirement Planning
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="retirement-age">Planned Retirement Age *</Label>
              <Select
                value={scenarioData.retirementAge.toString()}
                onValueChange={(value) => setScenarioData(prev => ({ 
                  ...prev, 
                  retirementAge: parseInt(value) 
                }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 16 }, (_, i) => i + 55).map(age => (
                    <SelectItem key={age} value={age.toString()}>
                      {age} years old
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium text-sm">Current Age</h4>
                <p className="text-2xl font-bold text-blue-600">
                  {profile?.dateOfBirth ? 
                    new Date().getFullYear() - new Date(profile.dateOfBirth).getFullYear() : 'N/A'}
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium text-sm">Years to Retirement</h4>
                <p className="text-2xl font-bold text-green-600">
                  {profile?.dateOfBirth ? 
                    Math.max(0, scenarioData.retirementAge - (new Date().getFullYear() - new Date(profile.dateOfBirth).getFullYear())) : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        )

      case 2: // Social Security
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="ss-claiming-age">Social Security Claiming Age *</Label>
              <Select
                value={scenarioData.socialSecurityClaimingAge.toString()}
                onValueChange={(value) => setScenarioData(prev => ({ 
                  ...prev, 
                  socialSecurityClaimingAge: parseInt(value) 
                }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="62">62 (Early, reduced benefits)</SelectItem>
                  <SelectItem value="67">67 (Full retirement age)</SelectItem>
                  <SelectItem value="70">70 (Delayed, increased benefits)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg text-center">
                <Badge variant="secondary" className="mb-2">Age 62</Badge>
                <p className="text-sm text-gray-600">~75% of full benefit</p>
              </div>
              <div className="p-4 border rounded-lg text-center">
                <Badge variant="default" className="mb-2">Age 67</Badge>
                <p className="text-sm text-gray-600">100% of full benefit</p>
              </div>
              <div className="p-4 border rounded-lg text-center">
                <Badge variant="outline" className="mb-2">Age 70</Badge>
                <p className="text-sm text-gray-600">~132% of full benefit</p>
              </div>
            </div>
          </div>
        )

      case 3: // Additional Savings
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="additional-savings">Current Additional Savings</Label>
              <Input
                id="additional-savings"
                type="number"
                value={scenarioData.additionalSavings}
                onChange={(e) => setScenarioData(prev => ({ 
                  ...prev, 
                  additionalSavings: parseFloat(e.target.value) || 0 
                }))}
                placeholder="0"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="monthly-contributions">Monthly Contributions</Label>
              <Input
                id="monthly-contributions"
                type="number"
                value={scenarioData.monthlyContributions}
                onChange={(e) => setScenarioData(prev => ({ 
                  ...prev, 
                  monthlyContributions: parseFloat(e.target.value) || 0 
                }))}
                placeholder="0"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="risk-tolerance">Risk Tolerance</Label>
              <Select
                value={scenarioData.riskTolerance}
                onValueChange={(value: 'conservative' | 'moderate' | 'aggressive') => 
                  setScenarioData(prev => ({ ...prev, riskTolerance: value }))
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="conservative">Conservative (5% return)</SelectItem>
                  <SelectItem value="moderate">Moderate (7% return)</SelectItem>
                  <SelectItem value="aggressive">Aggressive (9% return)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )

      case 4: // Review
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium text-sm text-gray-600">Scenario Name</h4>
                <p className="font-semibold">{scenarioData.name}</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium text-sm text-gray-600">Retirement Age</h4>
                <p className="font-semibold">{scenarioData.retirementAge}</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium text-sm text-gray-600">SS Claiming Age</h4>
                <p className="font-semibold">{scenarioData.socialSecurityClaimingAge}</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium text-sm text-gray-600">Risk Tolerance</h4>
                <p className="font-semibold capitalize">{scenarioData.riskTolerance}</p>
              </div>
            </div>

            {scenarioData.description && (
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium text-sm text-gray-600 mb-2">Description</h4>
                <p>{scenarioData.description}</p>
              </div>
            )}

            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Ready to create your scenario! This will calculate your projected pension, 
                Social Security, and total retirement income based on your parameters.
              </AlertDescription>
            </Alert>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className={`max-w-4xl mx-auto ${className}`}>
      {/* Progress Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Create Retirement Scenario</h2>
          <Badge variant="outline">{currentStep + 1} of {steps.length}</Badge>
        </div>
        
        <Progress value={progress} className="mb-4" />
        
        <div className="flex items-center space-x-4 overflow-x-auto pb-2">
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <div
                key={step.id}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg whitespace-nowrap ${
                  step.isActive 
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                    : step.isComplete
                    ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                    : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="text-sm font-medium">{step.title}</span>
                {step.isComplete && <CheckCircle className="h-3 w-3" />}
              </div>
            )
          })}
        </div>
      </div>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {React.createElement(steps[currentStep].icon, { className: "h-5 w-5" })}
            {steps[currentStep].title}
          </CardTitle>
          <CardDescription>
            {steps[currentStep].description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {renderStepContent()}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <Button
          variant="outline"
          onClick={currentStep === 0 ? onCancel : handlePrevious}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          {currentStep === 0 ? 'Cancel' : 'Previous'}
        </Button>

        {currentStep === steps.length - 1 ? (
          <Button
            onClick={handleCreateScenario}
            disabled={isCreating || !scenarioData.name}
            className="flex items-center gap-2"
          >
            {isCreating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Creating...
              </>
            ) : (
              <>
                <Target className="h-4 w-4" />
                Create Scenario
              </>
            )}
          </Button>
        ) : (
          <Button
            onClick={handleNext}
            disabled={currentStep === 0 && !scenarioData.name}
            className="flex items-center gap-2"
          >
            Next
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
