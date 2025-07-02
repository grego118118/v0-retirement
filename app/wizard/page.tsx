"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Calculator, 
  ArrowRight, 
  ArrowLeft,
  CheckCircle, 
  DollarSign
} from "lucide-react"

interface WizardData {
  currentAge: number
  retirementAge: number
  retirementGroup: string
  yearsOfService: number
  averageSalary: number
  retirementOption: string
}

export default function WizardPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [wizardData, setWizardData] = useState<WizardData>({
    currentAge: 45,
    retirementAge: 60,
    retirementGroup: 'GROUP_1',
    yearsOfService: 20,
    averageSalary: 75000,
    retirementOption: 'A'
  })

  const steps = [
    { title: "Personal Info", description: "Age and retirement timeline" },
    { title: "Employment", description: "Service years and salary details" },
    { title: "Retirement Options", description: "Benefit options and preferences" },
    { title: "Results", description: "Your pension calculation results" }
  ]

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

  const handleCalculate = () => {
    // Redirect to calculator with wizard data
    const params = new URLSearchParams({
      group: wizardData.retirementGroup,
      age: wizardData.retirementAge.toString(),
      yearsOfService: wizardData.yearsOfService.toString(),
      averageSalary: wizardData.averageSalary.toString(),
      retirementOption: wizardData.retirementOption
    })
    router.push(`/calculator?${params.toString()}`)
  }

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="currentAge">Current Age</Label>
              <Input
                id="currentAge"
                type="number"
                value={wizardData.currentAge}
                onChange={(e) => setWizardData({...wizardData, currentAge: parseInt(e.target.value) || 0})}
              />
            </div>
            <div>
              <Label htmlFor="retirementAge">Planned Retirement Age</Label>
              <Input
                id="retirementAge"
                type="number"
                value={wizardData.retirementAge}
                onChange={(e) => setWizardData({...wizardData, retirementAge: parseInt(e.target.value) || 0})}
              />
            </div>
            <div>
              <Label htmlFor="retirementGroup">Retirement Group</Label>
              <Select value={wizardData.retirementGroup} onValueChange={(value) => setWizardData({...wizardData, retirementGroup: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GROUP_1">Group 1 - General Employees</SelectItem>
                  <SelectItem value="GROUP_2">Group 2 - Probation/Court Officers</SelectItem>
                  <SelectItem value="GROUP_3">Group 3 - State Police</SelectItem>
                  <SelectItem value="GROUP_4">Group 4 - Public Safety</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="yearsOfService">Years of Service</Label>
              <Input
                id="yearsOfService"
                type="number"
                value={wizardData.yearsOfService}
                onChange={(e) => setWizardData({...wizardData, yearsOfService: parseInt(e.target.value) || 0})}
              />
            </div>
            <div>
              <Label htmlFor="averageSalary">Average Salary (Highest 3 Years)</Label>
              <Input
                id="averageSalary"
                type="number"
                value={wizardData.averageSalary}
                onChange={(e) => setWizardData({...wizardData, averageSalary: parseInt(e.target.value) || 0})}
              />
            </div>
          </div>
        )
      case 2:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="retirementOption">Retirement Option</Label>
              <Select value={wizardData.retirementOption} onValueChange={(value) => setWizardData({...wizardData, retirementOption: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">Option A - Full Allowance (100%)</SelectItem>
                  <SelectItem value="B">Option B - Annuity Protection</SelectItem>
                  <SelectItem value="C">Option C - Joint & Survivor (66.67%)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Review your information and click "Calculate" to see your pension benefits.
              </AlertDescription>
            </Alert>
          </div>
        )
      case 3:
        return (
          <div className="space-y-4">
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Your wizard data has been prepared. Click "View Results" to see your detailed pension calculation.
              </AlertDescription>
            </Alert>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><strong>Current Age:</strong> {wizardData.currentAge}</div>
              <div><strong>Retirement Age:</strong> {wizardData.retirementAge}</div>
              <div><strong>Group:</strong> {wizardData.retirementGroup}</div>
              <div><strong>Years of Service:</strong> {wizardData.yearsOfService}</div>
              <div><strong>Average Salary:</strong> ${wizardData.averageSalary.toLocaleString()}</div>
              <div><strong>Option:</strong> {wizardData.retirementOption}</div>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">
          Massachusetts Retirement Planning Wizard
        </h1>
        <p className="text-xl text-muted-foreground">
          Step-by-step guidance for calculating your pension benefits
        </p>
      </div>

      {/* Progress */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          {steps.map((step, index) => (
            <div key={index} className={`flex items-center ${index < steps.length - 1 ? 'flex-1' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                index <= currentStep ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {index + 1}
              </div>
              <div className="ml-2 text-sm">
                <div className="font-medium">{step.title}</div>
                <div className="text-gray-500">{step.description}</div>
              </div>
              {index < steps.length - 1 && (
                <div className={`flex-1 h-1 mx-4 ${
                  index < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Step {currentStep + 1}: {steps[currentStep].title}</CardTitle>
          <CardDescription>{steps[currentStep].description}</CardDescription>
        </CardHeader>
        <CardContent>
          {renderStep()}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 0}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>
        
        {currentStep < steps.length - 1 ? (
          <Button onClick={handleNext}>
            Next
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={handleCalculate} className="bg-green-600 hover:bg-green-700">
            <Calculator className="mr-2 h-4 w-4" />
            View Results
          </Button>
        )}
      </div>

      {/* Premium Notice */}
      <Alert className="mt-8">
        <DollarSign className="h-4 w-4" />
        <AlertDescription>
          <strong>Enhanced Features Available:</strong> Upgrade to Premium for advanced Social Security optimization, 
          tax analysis, and comprehensive PDF reports.
        </AlertDescription>
      </Alert>
    </div>
  )
}
