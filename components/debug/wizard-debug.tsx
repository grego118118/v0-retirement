"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, Bug, CheckCircle, XCircle, AlertTriangle } from "lucide-react"

interface WizardDebugProps {
  wizardState: any
  optimizationResults: any
  progress: any
  canProgressFromCurrentStep: () => boolean
}

export function WizardDebug({ 
  wizardState, 
  optimizationResults, 
  progress, 
  canProgressFromCurrentStep 
}: WizardDebugProps) {
  const [isOpen, setIsOpen] = useState(false)

  const getStepStatus = (step: any, index: number) => {
    if (step.isComplete) return { icon: CheckCircle, color: "text-green-600", label: "Complete" }
    if (index === wizardState.currentStep) return { icon: AlertTriangle, color: "text-blue-600", label: "Current" }
    if (index < wizardState.currentStep) return { icon: XCircle, color: "text-red-600", label: "Incomplete" }
    return { icon: XCircle, color: "text-gray-400", label: "Pending" }
  }

  const validateCurrentStepData = () => {
    const currentStepData = wizardState.steps[wizardState.currentStep]
    const data = wizardState.data

    switch (currentStepData?.id) {
      case 'personal-info':
        return {
          birthYear: data.personalInfo.birthYear > 0,
          retirementGoalAge: data.personalInfo.retirementGoalAge >= 55,
          overall: data.personalInfo.birthYear > 0 && data.personalInfo.retirementGoalAge >= 55
        }
      
      case 'pension-details':
        return {
          yearsOfService: data.pensionData.yearsOfService > 0,
          averageSalary: data.pensionData.averageSalary > 0,
          retirementGroup: data.pensionData.retirementGroup !== '',
          retirementOption: data.pensionData.retirementOption !== '',
          retirementDate: data.pensionData.retirementDate !== '',
          overall: data.pensionData.yearsOfService > 0 && 
                   data.pensionData.averageSalary > 0 &&
                   data.pensionData.retirementGroup !== '' &&
                   data.pensionData.retirementOption !== '' &&
                   data.pensionData.retirementDate !== ''
        }
      
      case 'social-security':
        return {
          fullRetirementBenefit: data.socialSecurityData.fullRetirementBenefit > 0,
          overall: data.socialSecurityData.fullRetirementBenefit > 0
        }
      
      case 'optimization':
        return {
          optimizationResults: optimizationResults !== null,
          overall: optimizationResults !== null
        }
      
      case 'review-save':
        return {
          optimizationResults: optimizationResults !== null,
          retirementGroup: data.pensionData.retirementGroup !== '',
          retirementOption: data.pensionData.retirementOption !== '',
          yearsOfService: data.pensionData.yearsOfService > 0,
          averageSalary: data.pensionData.averageSalary > 0,
          retirementDate: data.pensionData.retirementDate !== '',
          fullRetirementBenefit: data.socialSecurityData.fullRetirementBenefit > 0,
          overall: optimizationResults !== null &&
                   data.pensionData.retirementGroup !== '' &&
                   data.pensionData.retirementOption !== '' &&
                   data.pensionData.yearsOfService > 0 &&
                   data.pensionData.averageSalary > 0 &&
                   data.pensionData.retirementDate !== '' &&
                   data.socialSecurityData.fullRetirementBenefit > 0
        }
      
      default:
        return { overall: true }
    }
  }

  const stepValidation = validateCurrentStepData()

  return (
    <Card className="border-orange-200 bg-orange-50">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-orange-100">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bug className="h-5 w-5 text-orange-600" />
                Wizard Debug Panel
              </div>
              <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </CardTitle>
            <CardDescription>
              Debug information for wizard state and button enablement
            </CardDescription>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="space-y-6">
            {/* Current Step Info */}
            <div>
              <h4 className="font-medium mb-2">Current Step</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>Step: {wizardState.currentStep + 1} of {wizardState.steps.length}</div>
                <div>ID: {wizardState.steps[wizardState.currentStep]?.id}</div>
                <div>Title: {wizardState.steps[wizardState.currentStep]?.title}</div>
                <div>Can Go Forward: {progress.canGoForward ? '✅' : '❌'}</div>
              </div>
            </div>

            {/* Step Completion Status */}
            <div>
              <h4 className="font-medium mb-2">Step Completion Status</h4>
              <div className="space-y-2">
                {wizardState.steps.map((step: any, index: number) => {
                  const status = getStepStatus(step, index)
                  const StatusIcon = status.icon
                  return (
                    <div key={step.id} className="flex items-center justify-between">
                      <span className="text-sm">{index + 1}. {step.title}</span>
                      <div className="flex items-center gap-2">
                        <StatusIcon className={`h-4 w-4 ${status.color}`} />
                        <Badge variant="outline" className={status.color}>
                          {status.label}
                        </Badge>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Current Step Validation */}
            <div>
              <h4 className="font-medium mb-2">Current Step Validation</h4>
              <div className="space-y-1 text-sm">
                {Object.entries(stepValidation).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                    <span className={value ? 'text-green-600' : 'text-red-600'}>
                      {value ? '✅' : '❌'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Data Values */}
            <div>
              <h4 className="font-medium mb-2">Key Data Values</h4>
              <div className="space-y-1 text-sm">
                <div>Birth Year: {wizardState.data.personalInfo.birthYear}</div>
                <div>Retirement Age: {wizardState.data.personalInfo.retirementGoalAge}</div>
                <div>Years of Service: {wizardState.data.pensionData.yearsOfService}</div>
                <div>Average Salary: {wizardState.data.pensionData.averageSalary}</div>
                <div>Retirement Group: "{wizardState.data.pensionData.retirementGroup}"</div>
                <div>Retirement Option: "{wizardState.data.pensionData.retirementOption}"</div>
                <div>Retirement Date: "{wizardState.data.pensionData.retirementDate}"</div>
                <div>SS Full Benefit: {wizardState.data.socialSecurityData.fullRetirementBenefit}</div>
                <div>Optimization Results: {optimizationResults ? 'Available' : 'None'}</div>
              </div>
            </div>

            {/* Function Results */}
            <div>
              <h4 className="font-medium mb-2">Function Results</h4>
              <div className="space-y-1 text-sm">
                <div>canProgressFromCurrentStep(): {canProgressFromCurrentStep() ? '✅' : '❌'}</div>
                <div>progress.canGoForward: {progress.canGoForward ? '✅' : '❌'}</div>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
