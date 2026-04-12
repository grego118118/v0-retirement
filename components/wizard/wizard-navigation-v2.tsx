"use client"

import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { 
  ChevronLeft, 
  ChevronRight, 
  Save, 
  SkipForward,
  CheckCircle,
  Circle,
  Clock,
  Target
} from "lucide-react"
import { WizardProgressV2, WIZARD_STEPS_V2 } from "@/lib/wizard/wizard-types-v2"

interface WizardNavigationV2Props {
  currentStep: number
  progress: WizardProgressV2
  onStepChange: (step: number) => void
  onSave: () => void
  onSkipToResults: () => void
  canSkipToResults: boolean
  isLoading?: boolean
}

export function WizardNavigationV2({
  currentStep,
  progress,
  onStepChange,
  onSave,
  onSkipToResults,
  canSkipToResults,
  isLoading = false
}: WizardNavigationV2Props) {
  const currentStepData = WIZARD_STEPS_V2[currentStep]
  const isLastStep = currentStep === WIZARD_STEPS_V2.length - 1
  const isFirstStep = currentStep === 0
  
  const getStepStatus = (stepIndex: number) => {
    if (stepIndex < currentStep) return 'completed'
    if (stepIndex === currentStep) return 'current'
    return 'upcoming'
  }
  
  const getNextButtonText = () => {
    if (isLastStep) return 'Save to Dashboard'
    if (currentStep === 2) return 'Generate My Plan'
    return 'Continue'
  }
  
  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Step Progress Indicators */}
            <div className="flex items-center justify-between">
              {WIZARD_STEPS_V2.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div className={`
                      flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors
                      ${getStepStatus(index) === 'completed' 
                        ? 'bg-green-500 border-green-500 text-white' 
                        : getStepStatus(index) === 'current'
                        ? 'bg-blue-500 border-blue-500 text-white'
                        : 'bg-gray-100 border-gray-300 text-gray-500'
                      }
                    `}>
                      {getStepStatus(index) === 'completed' ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        <span className="text-sm font-medium">{index + 1}</span>
                      )}
                    </div>
                    <div className="mt-2 text-center">
                      <div className={`text-sm font-medium ${
                        getStepStatus(index) === 'current' ? 'text-blue-600' : 'text-gray-600'
                      }`}>
                        {step.title}
                      </div>
                      <div className="text-xs text-gray-500 max-w-24">
                        {step.description}
                      </div>
                    </div>
                  </div>
                  
                  {/* Connector Line */}
                  {index < WIZARD_STEPS_V2.length - 1 && (
                    <div className={`
                      flex-1 h-0.5 mx-4 transition-colors
                      ${index < currentStep ? 'bg-green-500' : 'bg-gray-300'}
                    `} />
                  )}
                </div>
              ))}
            </div>
            
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Progress</span>
                <span className="font-medium">{progress.percentComplete}% Complete</span>
              </div>
              <Progress
                value={progress.percentComplete}
                className="h-2"
                aria-label={`Wizard progress: ${progress.percentComplete}% complete`}
              />
            </div>
            
            {/* Data Quality Indicators */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-blue-500" />
                  <span>Essential Data: {progress.dataQuality.essential}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <Circle className="h-4 w-4 text-green-500" />
                  <span>Optional Data: {progress.dataQuality.optional}%</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge variant={progress.dataQuality.confidence >= 80 ? 'default' : 'secondary'}>
                  {progress.dataQuality.confidence}% Confidence
                </Badge>
              </div>
            </div>
            
            {/* Time Estimate */}
            {progress.estimatedTimeRemaining > 0 && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                <span>Estimated time remaining: {progress.estimatedTimeRemaining} minutes</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Back Button */}
          <Button
            variant="outline"
            onClick={() => onStepChange(currentStep - 1)}
            disabled={!progress.canGoBack || isLoading}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>
          
          {/* Save Progress Button */}
          <Button
            variant="ghost"
            onClick={onSave}
            disabled={!progress.canSave || isLoading}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            Save Progress
          </Button>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Skip to Results Button (only show if minimum data available) */}
          {canSkipToResults && currentStep < 3 && (
            <Button
              variant="outline"
              onClick={onSkipToResults}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <SkipForward className="h-4 w-4" />
              Skip to Results
            </Button>
          )}
          
          {/* Next/Continue Button */}
          <Button
            onClick={() => {
              if (isLastStep) {
                onSave()
              } else {
                onStepChange(currentStep + 1)
              }
            }}
            disabled={!progress.canGoForward || isLoading}
            className="flex items-center gap-2"
          >
            {getNextButtonText()}
            {!isLastStep && <ChevronRight className="h-4 w-4" />}
          </Button>
        </div>
      </div>
      
      {/* Step-specific Help Text */}
      {currentStepData && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-medium text-sm">{currentStep + 1}</span>
              </div>
              <div>
                <h3 className="font-medium text-blue-900 mb-1">{currentStepData.title}</h3>
                <p className="text-sm text-blue-700">{currentStepData.description}</p>
                
                {/* Step-specific guidance */}
                {currentStep === 0 && (
                  <p className="text-xs text-blue-600 mt-2">
                    💡 We'll auto-fill suggested values based on your inputs to save you time
                  </p>
                )}
                {currentStep === 1 && (
                  <p className="text-xs text-blue-600 mt-2">
                    💡 Social Security information significantly improves your retirement projection accuracy
                  </p>
                )}
                {currentStep === 2 && (
                  <p className="text-xs text-blue-600 mt-2">
                    💡 Your preferences help us optimize your retirement strategy
                  </p>
                )}
                {currentStep === 3 && (
                  <p className="text-xs text-blue-600 mt-2">
                    💡 Review your personalized retirement plan and save it to your dashboard
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
