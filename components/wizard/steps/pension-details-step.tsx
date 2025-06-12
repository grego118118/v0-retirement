"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SimpleSelect } from "@/components/ui/simple-select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Building, DollarSign, Calendar, Info, Calculator } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { logPension, logStateChange, isDebugEnabled } from "@/lib/utils/debug"

interface PensionData {
  yearsOfService: number
  averageSalary: number
  retirementGroup: '1' | '2' | '3' | '4' | ''
  benefitPercentage: number
  retirementOption: 'A' | 'B' | 'C' | 'D' | ''
  retirementDate: string
  monthlyBenefit: number
  annualBenefit: number
}

interface PensionDetailsStepProps {
  data: PensionData
  onComplete: (data: { pensionData: PensionData }) => void
}

export function PensionDetailsStep({ data, onComplete }: PensionDetailsStepProps) {
  const [formData, setFormData] = useState<PensionData>(data)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [calculatedBenefit, setCalculatedBenefit] = useState<number>(0)
  const previousFormDataRef = useRef<PensionData>(data)
  const renderCountRef = useRef(0)

  // Only log on meaningful changes, not every render
  renderCountRef.current++
  if (isDebugEnabled('pension') && renderCountRef.current % 10 === 1) {
    logPension('Component rendered', {
      renderCount: renderCountRef.current,
      hasErrors: Object.keys(errors).length > 0,
      calculatedBenefit
    })
  }

  // Calculate pension benefit when relevant fields change
  useEffect(() => {
    if (formData.yearsOfService > 0 && formData.averageSalary > 0 && formData.benefitPercentage > 0) {
      const annualBenefit = (formData.averageSalary * formData.yearsOfService * formData.benefitPercentage) / 100
      const monthlyBenefit = annualBenefit / 12
      
      setCalculatedBenefit(monthlyBenefit)
      setFormData(prev => ({
        ...prev,
        monthlyBenefit,
        annualBenefit
      }))
    }
  }, [formData.yearsOfService, formData.averageSalary, formData.benefitPercentage])

  // Validate and trigger completion when data changes
  useEffect(() => {
    const newErrors = validateForm(formData)
    setErrors(newErrors)

    if (Object.keys(newErrors).length === 0 && formData.monthlyBenefit > 0) {
      onComplete({ pensionData: formData })
    }
  }, [formData.yearsOfService, formData.averageSalary, formData.retirementGroup, formData.benefitPercentage, formData.retirementOption, formData.retirementDate, formData.monthlyBenefit, formData.annualBenefit])

  const handleInputChange = (field: keyof PensionData, value: string | number) => {
    setFormData(prev => {
      // Keep retirement group and option as strings, convert others to numbers if numeric
      let processedValue: string | number = value
      if (typeof value === 'string') {
        if (field === 'retirementGroup' || field === 'retirementOption' || field === 'retirementDate') {
          // Keep these fields as strings
          processedValue = value
        } else if (!isNaN(Number(value)) && value !== '') {
          // Convert numeric strings to numbers for other fields
          processedValue = Number(value)
        } else {
          // Keep as string if not numeric
          processedValue = value
        }
      }

      const newData = {
        ...prev,
        [field]: processedValue
      }

      // Only log significant changes
      if (JSON.stringify(previousFormDataRef.current) !== JSON.stringify(newData)) {
        logStateChange('pension', previousFormDataRef.current, newData)
        previousFormDataRef.current = newData
      }

      return newData
    })
  }

  const validateForm = (data: PensionData): Record<string, string> => {
    const errors: Record<string, string> = {}

    if (!data.yearsOfService || data.yearsOfService <= 0) {
      errors.yearsOfService = 'Years of service must be greater than 0'
    }

    if (data.yearsOfService > 50) {
      errors.yearsOfService = 'Years of service cannot exceed 50'
    }

    if (!data.averageSalary || data.averageSalary <= 0) {
      errors.averageSalary = 'Average salary must be greater than 0'
    }

    if (data.averageSalary > 500000) {
      errors.averageSalary = 'Please verify salary amount (seems unusually high)'
    }

    if (!data.retirementGroup || data.retirementGroup === '') {
      errors.retirementGroup = 'Please select your retirement group'
    }

    if (!data.retirementOption || data.retirementOption === '') {
      errors.retirementOption = 'Please select a retirement option'
    }

    if (!data.retirementDate) {
      errors.retirementDate = 'Retirement date is required'
    }

    return errors
  }

  const getBenefitPercentage = (retirementGroup: string, yearsOfService: number, age: number = 65): number => {
    // Use standardized Massachusetts pension benefit calculation
    // This is a simplified version - the actual calculation should use the standardized calculator
    switch (retirementGroup) {
      case '1': // Group 1 - General employees
        if (age >= 65) return 2.5
        if (age >= 60) return 2.0 + (age - 60) * 0.1 // Graduated from 2.0% to 2.5%
        return 0 // Not eligible before age 60 for post-2012 hires
      case '2': // Group 2 - Teachers, certain public safety
        if (age >= 60) return 2.5
        if (age >= 55) return 2.0 + (age - 55) * 0.1 // Graduated from 2.0% to 2.5%
        return 0 // Not eligible before age 55
      case '3': // Group 3 - State Police
        return 2.5 // Always 2.5% regardless of age (special provisions)
      case '4': // Group 4 - Public safety, corrections
        if (age >= 55) return 2.5
        if (age >= 50) return 2.0 + (age - 50) * 0.1 // Graduated from 2.0% to 2.5%
        return 0 // Not eligible before age 50
      case '':
        return 0 // Return 0 for empty selection
      default:
        return 2.0
    }
  }

  const getRetirementGroupDescription = (group: string): string => {
    switch (group) {
      case '1': return 'General employees, most state and local workers'
      case '2': return 'Teachers, police officers, firefighters'
      case '3': return 'State police and certain hazardous duty positions'
      case '4': return 'Police officers and firefighters'
      case '': return ''
      default: return ''
    }
  }

  const getRetirementOptionDescription = (option: string): string => {
    switch (option) {
      case 'A': return 'Maximum benefit, no survivor benefit'
      case 'B': return 'Reduced benefit with 100% survivor benefit'
      case 'C': return 'Reduced benefit with 66⅔% survivor benefit'
      case 'D': return 'Reduced benefit with 50% survivor benefit'
      case '': return ''
      default: return ''
    }
  }

  // Auto-calculate benefit percentage based on group and years
  useEffect(() => {
    if (formData.retirementGroup && formData.retirementGroup !== '' && formData.yearsOfService > 0) {
      const suggestedPercentage = getBenefitPercentage(formData.retirementGroup, formData.yearsOfService)
      if (formData.benefitPercentage === 0) {
        setFormData(prev => ({ ...prev, benefitPercentage: suggestedPercentage }))
      }
    }
  }, [formData.retirementGroup, formData.yearsOfService])

  return (
    <div className="space-y-6">
      {/* Introduction */}
      <Alert>
        <Building className="h-4 w-4" />
        <AlertDescription>
          Enter your Massachusetts pension details. We'll calculate your estimated monthly benefit based on the state's pension formula.
        </AlertDescription>
      </Alert>

      <div className="grid md:grid-cols-2 gap-6 overflow-visible">
        {/* Service Information */}
        <Card className="overflow-visible">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Service Information
            </CardTitle>
            <CardDescription>
              Your employment history and retirement timeline
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 overflow-visible">
            <div className="space-y-2">
              <Label htmlFor="yearsOfService">Years of Creditable Service</Label>
              <Input
                id="yearsOfService"
                type="number"
                placeholder="e.g., 25"
                value={formData.yearsOfService || ''}
                onChange={(e) => handleInputChange('yearsOfService', e.target.value)}
                className={errors.yearsOfService ? 'border-red-500' : ''}
              />
              {errors.yearsOfService && (
                <p className="text-sm text-red-500">{errors.yearsOfService}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="retirementGroup">Retirement Group</Label>
              <SimpleSelect
                value={formData.retirementGroup || ''}
                onValueChange={(value: string) => handleInputChange('retirementGroup', value)}
                placeholder="Select your retirement group"
                options={[
                  { value: "1", label: "Group 1 - General Employees" },
                  { value: "2", label: "Group 2 - Teachers/Public Safety" },
                  { value: "3", label: "Group 3 - State Police" },
                  { value: "4", label: "Group 4 - Police/Firefighters" }
                ]}
                className={errors.retirementGroup ? 'border-red-500' : ''}
              />
              {errors.retirementGroup && (
                <p className="text-sm text-red-500">{errors.retirementGroup}</p>
              )}
              <p className="text-sm text-muted-foreground">
                {formData.retirementGroup ? getRetirementGroupDescription(formData.retirementGroup) : 'Please select your retirement group to see description'}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="retirementDate">Planned Retirement Date</Label>
              <Input
                id="retirementDate"
                type="date"
                value={formData.retirementDate}
                onChange={(e) => handleInputChange('retirementDate', e.target.value)}
                className={errors.retirementDate ? 'border-red-500' : ''}
              />
              {errors.retirementDate && (
                <p className="text-sm text-red-500">{errors.retirementDate}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Salary and Benefits */}
        <Card className="overflow-visible">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              Salary and Benefits
            </CardTitle>
            <CardDescription>
              Salary information for benefit calculation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 overflow-visible">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="averageSalary">Average Salary (Highest 3 Years)</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Average of your highest 3 consecutive years of salary</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Input
                id="averageSalary"
                type="number"
                placeholder="e.g., 75000"
                value={formData.averageSalary || ''}
                onChange={(e) => handleInputChange('averageSalary', e.target.value)}
                className={errors.averageSalary ? 'border-red-500' : ''}
              />
              {errors.averageSalary && (
                <p className="text-sm text-red-500">{errors.averageSalary}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="benefitPercentage">Benefit Percentage</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Percentage multiplier based on your retirement group and years of service</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="flex gap-2">
                <Input
                  id="benefitPercentage"
                  type="number"
                  step="0.1"
                  placeholder="e.g., 2.5"
                  value={formData.benefitPercentage || ''}
                  onChange={(e) => handleInputChange('benefitPercentage', e.target.value)}
                />
                <span className="flex items-center text-sm text-muted-foreground">%</span>
              </div>
              {formData.retirementGroup && formData.retirementGroup !== '' && formData.yearsOfService > 0 && (
                <p className="text-sm text-muted-foreground">
                  Suggested: {getBenefitPercentage(formData.retirementGroup, formData.yearsOfService)}%
                  (based on Group {formData.retirementGroup}, {formData.yearsOfService} years)
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="retirementOption">Retirement Option</Label>
              <SimpleSelect
                value={formData.retirementOption || ''}
                onValueChange={(value: string) => handleInputChange('retirementOption', value)}
                placeholder="Select retirement option"
                options={[
                  { value: "A", label: "Option A - Maximum Benefit" },
                  { value: "B", label: "Option B - 100% Survivor" },
                  { value: "C", label: "Option C - 66⅔% Survivor" },
                  { value: "D", label: "Option D - 50% Survivor" }
                ]}
                className={errors.retirementOption ? 'border-red-500' : ''}
              />
              {errors.retirementOption && (
                <p className="text-sm text-red-500">{errors.retirementOption}</p>
              )}
              <p className="text-sm text-muted-foreground">
                {formData.retirementOption ? getRetirementOptionDescription(formData.retirementOption) : 'Please select a retirement option to see description'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Calculated Benefit */}
      {calculatedBenefit > 0 && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-green-600" />
              Estimated Pension Benefit
            </CardTitle>
            <CardDescription>
              Based on Massachusetts pension formula
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  ${Math.round(formData.monthlyBenefit).toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Monthly Benefit</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  ${Math.round(formData.annualBenefit).toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Annual Benefit</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {Math.round((formData.annualBenefit / formData.averageSalary) * 100)}%
                </div>
                <div className="text-sm text-muted-foreground">Replacement Ratio</div>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-white rounded border">
              <h4 className="font-medium mb-2">Calculation Formula:</h4>
              <p className="text-sm text-muted-foreground">
                ${formData.averageSalary?.toLocaleString()} × {formData.yearsOfService} years × {formData.benefitPercentage}% = 
                ${Math.round(formData.annualBenefit).toLocaleString()} annually
              </p>
            </div>

            {Object.keys(errors).length === 0 && (
              <div className="mt-4">
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Pension Information Complete
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
