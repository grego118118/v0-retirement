"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { 
  Calendar, 
  User, 
  Briefcase, 
  DollarSign, 
  Calculator,
  CheckCircle,
  Lightbulb,
  Target
} from "lucide-react"

interface EssentialInfoData {
  // Personal Information (from Step 1)
  birthYear: number
  currentAge: number

  // Core Pension Data (from Step 2)
  retirementGroup: '1' | '2' | '3' | '4'
  yearsOfService: number
  averageSalary: number

  // Smart Defaults (auto-populated but editable)
  plannedRetirementAge: number
  serviceEntry: 'before_2012' | 'after_2012'
  retirementOption: 'A' | 'B' | 'C'
  beneficiaryAge?: number
}

interface EssentialInformationStepProps {
  data: Partial<EssentialInfoData>
  onChange: (data: Partial<EssentialInfoData>, fieldName?: string) => void
  errors: Record<string, string>
}

// Smart defaults calculation logic - simplified for clear suggestions
const calculateSuggestedRetirementAge = (group: string, yearsOfService: number, serviceEntry: string): number => {
  // Simple, clear suggestions based on Massachusetts State Retirement Board rules
  // These are practical minimum retirement ages for each group

  switch (group) {
    case '1':
      // Group 1 (General Employees): Suggest age 60 as minimum retirement age
      return 60

    case '2':
      // Group 2 (Certain Public Safety): Suggest age 55 as minimum retirement age
      return 55

    case '3':
      // Group 3 (State Police): Suggest age 55 (can retire earlier with 20+ years but 55 is practical)
      return 55

    case '4':
      // Group 4 (Public Safety): Suggest age 50 as retirement age
      return 50

    default:
      // Default fallback
      return 60
  }
}

const detectServiceEntry = (yearsOfService: number, currentAge: number): 'before_2012' | 'after_2012' => {
  if (!yearsOfService || !currentAge) return 'before_2012'
  
  const currentYear = new Date().getFullYear()
  const estimatedStartYear = currentYear - yearsOfService
  return estimatedStartYear >= 2012 ? 'after_2012' : 'before_2012'
}

const getSalaryGuidance = (group: string, yearsOfService: number) => {
  const salaryRanges = {
    '1': {
      entry: { min: 35000, max: 50000, typical: 42000 },
      mid: { min: 50000, max: 75000, typical: 62000 },
      senior: { min: 70000, max: 100000, typical: 85000 }
    },
    '2': {
      entry: { min: 45000, max: 65000, typical: 55000 },
      mid: { min: 65000, max: 90000, typical: 77000 },
      senior: { min: 85000, max: 120000, typical: 102000 }
    },
    '3': {
      entry: { min: 55000, max: 75000, typical: 65000 },
      mid: { min: 75000, max: 105000, typical: 90000 },
      senior: { min: 100000, max: 140000, typical: 120000 }
    },
    '4': {
      entry: { min: 50000, max: 70000, typical: 60000 },
      mid: { min: 70000, max: 95000, typical: 82000 },
      senior: { min: 90000, max: 125000, typical: 107000 }
    }
  }

  const experience = yearsOfService < 10 ? 'entry' : yearsOfService < 25 ? 'mid' : 'senior'
  return salaryRanges[group as keyof typeof salaryRanges]?.[experience] || salaryRanges['1'][experience]
}

// Simple calculation for live preview
const calculateBasicPensionEstimate = (data: Partial<EssentialInfoData>) => {
  if (!data.averageSalary || !data.yearsOfService || !data.retirementGroup) {
    return { monthlyPension: 0, isProjected: false }
  }

  // Calculate projected years if retirement age is provided
  let projectedYears = data.yearsOfService
  let isProjected = false

  if (data.currentAge && data.plannedRetirementAge && data.plannedRetirementAge > data.currentAge) {
    const additionalYears = data.plannedRetirementAge - data.currentAge
    projectedYears = data.yearsOfService + additionalYears
    isProjected = true
  }

  // Use basic 2.2% factor for quick estimate
  const basicFactor = 0.022
  const annualPension = data.averageSalary * projectedYears * basicFactor

  // Apply 80% cap
  const maxPension = data.averageSalary * 0.8
  const cappedPension = Math.min(annualPension, maxPension)

  return {
    monthlyPension: Math.round(cappedPension / 12),
    isProjected
  }
}

export function EssentialInformationStep({ data, onChange, errors }: EssentialInformationStepProps) {
  const [showSalaryGuidance, setShowSalaryGuidance] = useState(false)

  // CRITICAL DEBUG: Monitor component re-renders and data changes
  console.log('🔄 EssentialInformationStep RENDER:', {
    data,
    showSalaryGuidance,
    timestamp: new Date().toISOString()
  })

  // CRITICAL DEBUG: Check if data contains corrupted values on render
  if (data.yearsOfService && data.yearsOfService !== Math.floor(data.yearsOfService)) {
    console.log('🚨 RENDER CORRUPTION: yearsOfService contains decimal value on render:', data.yearsOfService)
    console.trace('🚨 Stack trace of render corruption:')
  }

  if (data.averageSalary && data.averageSalary !== Math.floor(data.averageSalary)) {
    console.log('🚨 RENDER CORRUPTION: averageSalary contains decimal value on render:', data.averageSalary)
    console.trace('🚨 Stack trace of render corruption:')
  }
  
  // DISABLED: Auto-calculate current age when birth year changes
  // This was causing cascading updates that interfered with user input
  // The smart defaults in the parent component now handle this
  /*
  useEffect(() => {
    if (data.birthYear && data.birthYear > 1940 && data.birthYear < 2010) {
      const currentAge = new Date().getFullYear() - data.birthYear
      if (currentAge !== data.currentAge) {
        handleFieldChange('currentAge', currentAge)
      }
    }
  }, [data.birthYear])
  */

  // DISABLED: Auto-suggest retirement age when group changes
  // This was causing cascading updates that interfered with user input
  // The smart defaults in the parent component now handle this
  /*
  useEffect(() => {
    if (data.retirementGroup && !data.plannedRetirementAge) {
      const suggestedAge = calculateSuggestedRetirementAge(data.retirementGroup, data.yearsOfService || 0, data.serviceEntry || 'before_2012')
      handleFieldChange('plannedRetirementAge', suggestedAge)
    }
  }, [data.retirementGroup])
  */

  // DISABLED: Auto-detect service entry when years of service changes
  // This was causing cascading updates that interfered with user input
  // The smart defaults in the parent component now handle this
  /*
  useEffect(() => {
    if (data.yearsOfService && data.currentAge) {
      const detectedEntry = detectServiceEntry(data.yearsOfService, data.currentAge)
      if (detectedEntry !== data.serviceEntry) {
        handleFieldChange('serviceEntry', detectedEntry)
      }
    }
  }, [data.yearsOfService, data.currentAge])
  */
  
  // CRITICAL DEBUG: Monitor salary guidance calculation
  console.log('🔍 SALARY GUIDANCE CALCULATION:', {
    retirementGroup: data.retirementGroup,
    yearsOfService: data.yearsOfService,
    hasRequiredData: !!(data.retirementGroup && data.yearsOfService)
  })

  const salaryGuidance = data.retirementGroup && data.yearsOfService
    ? getSalaryGuidance(data.retirementGroup, data.yearsOfService)
    : null

  console.log('🔍 SALARY GUIDANCE RESULT:', salaryGuidance)
  
  const handleFieldChange = (field: keyof EssentialInfoData, value: any) => {
    console.log('🎯 Essential Step: Field change:', field, '=', value, typeof value)

    // INTELLIGENT VALIDATION: Only flag clearly invalid values
    if (field === 'averageSalary' && value < 0) {
      console.log('🚨 INVALID INPUT: Negative salary not allowed:', value)
      console.trace('🚨 Stack trace:')
    } else if (field === 'averageSalary' && value > 0) {
      console.log('✅ VALID INPUT: Salary value accepted:', value)
    }

    if (field === 'yearsOfService' && value < 0) {
      console.log('🚨 INVALID INPUT: Negative years of service not allowed:', value)
      console.trace('🚨 Stack trace:')
    } else if (field === 'yearsOfService' && value > 0) {
      console.log('✅ VALID INPUT: Years of service value accepted:', value)
    }

    // CRITICAL FIX: Only pass the specific field being changed, not the entire data object
    onChange({ [field]: value }, field)
  }

  // Safe number parsing that preserves user input precision
  const parseNumberInput = (value: string, isInteger: boolean = false): number => {
    console.log('🔢 parseNumberInput called:', { value, isInteger, type: typeof value })

    if (!value || value.trim() === '') {
      console.log('🔢 Empty value, returning 0')
      return 0
    }

    // INTELLIGENT VALIDATION: Only flag clearly invalid input strings
    if (value && value.trim() !== '' && isNaN(parseFloat(value))) {
      console.log('🚨 INVALID INPUT STRING: Non-numeric value received:', value)
      console.trace('🚨 Stack trace of invalid input:')
    } else if (value && parseFloat(value) < 0) {
      console.log('🚨 INVALID INPUT STRING: Negative value received:', value)
      console.trace('🚨 Stack trace of negative input:')
    } else if (value && value.trim() !== '') {
      console.log('✅ VALID INPUT STRING: Parsing numeric value:', value)
    }

    const parsed = isInteger ? parseInt(value, 10) : parseFloat(value)
    console.log('🔢 Parsed result:', { original: value, parsed, isNaN: isNaN(parsed), type: typeof parsed })

    // PARSING VERIFICATION: Log parsing process for debugging
    console.log('🔢 Parsing details:', {
      input: value,
      isInteger,
      method: isInteger ? 'parseInt' : 'parseFloat',
      result: parsed,
      isValid: !isNaN(parsed)
    })

    // Only flag actual parsing errors, not specific values
    if (isNaN(parsed) && value && value.trim() !== '') {
      console.log('🚨 PARSING ERROR: Failed to parse numeric value:', value)
      console.log('🚨 Using', isInteger ? 'parseInt' : 'parseFloat')
    }

    // Return 0 for invalid inputs, but preserve valid numbers exactly
    const result = isNaN(parsed) ? 0 : parsed
    console.log('🔢 Final parseNumberInput result:', result, typeof result)

    // FINAL VERIFICATION: Only flag actual parsing failures
    if (value && value.trim() !== '' && result === 0 && parseFloat(value) !== 0) {
      console.log('🚨 PARSING FAILURE: Input', value, 'resulted in 0 (likely parsing error)')
      console.trace('🚨 Stack trace of parsing failure:')
    }

    return result
  }
  
  return (
    <div className="space-y-8">
      {/* Welcome Message */}
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Let's Get Started</h2>
        <p className="text-muted-foreground">
          We'll need some basic information to calculate your Massachusetts pension benefits
        </p>
      </div>
      
      {/* Personal Information Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            About You
          </CardTitle>
          <CardDescription>
            Basic personal information for age calculations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="birthYear" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Birth Year
              </Label>
              <Input
                id="birthYear"
                type="number"
                placeholder="1975"
                value={data.birthYear || ''}
                onChange={(e) => handleFieldChange('birthYear', parseNumberInput(e.target.value, true))}
                className={errors['birthYear'] ? "border-red-500" : ""}
              />
              {errors['birthYear'] && <p className="text-sm text-red-500">{errors['birthYear']}</p>}
            </div>
            
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                Current Age
              </Label>
              <div className="flex items-center h-10 px-3 py-2 border border-input bg-muted rounded-md">
                <span className="text-sm font-medium">
                  {data.currentAge ? `${data.currentAge} years old` : 'Enter birth year above'}
                </span>
              </div>
            </div>
          </div>
          
          {data.birthYear && data.currentAge && (
            <Alert className="mt-4">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                You are currently {data.currentAge} years old
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
      
      {/* Core Pension Information Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Your Massachusetts Employment
          </CardTitle>
          <CardDescription>
            Information about your state employment and pension group
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="retirementGroup">Your Job Category</Label>
              <Select
                value={data.retirementGroup || ''}
                onValueChange={(value) => handleFieldChange('retirementGroup', value as '1' | '2' | '3' | '4')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your job category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Group 1 - General Employees</SelectItem>
                  <SelectItem value="2">Group 2 - Certain Public Safety</SelectItem>
                  <SelectItem value="3">Group 3 - State Police</SelectItem>
                  <SelectItem value="4">Group 4 - Public Safety</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Not sure? Check your pay stub or contact HR
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="yearsOfService" className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Current Years of Service
              </Label>
              <Input
                id="yearsOfService"
                type="number"
                placeholder="25.5"
                step="0.1"
                value={data.yearsOfService ? data.yearsOfService.toString() : ''}
                onChange={(e) => {
                  console.log('📊 Years input onChange - RAW VALUE:', e.target.value, typeof e.target.value)

                  // CRITICAL DEBUG: Check if the input field itself is corrupting the value
                  if (e.target.value === '27.9' || e.target.value === '27.8' || e.target.value === '27.7') {
                    console.log('🚨 YEARS CORRUPTION DETECTED AT INPUT FIELD LEVEL!')
                    console.log('🚨 Input field value:', e.target.value)
                    console.log('🚨 This corruption is happening BEFORE our parsing logic!')
                    console.trace('🚨 Stack trace of years input field corruption:')
                  }

                  const rawValue = e.target.value
                  console.log('📊 Raw years input value (before parsing):', rawValue)

                  if (rawValue === '') {
                    console.log('📊 Empty value, setting to 0')
                    handleFieldChange('yearsOfService', 0)
                  } else {
                    const parsedValue = parseNumberInput(rawValue, false)
                    console.log('📊 Parsed years value:', parsedValue)
                    handleFieldChange('yearsOfService', parsedValue)
                  }
                }}
                onFocus={() => {
                  console.log('🎯 FOCUS EVENT: yearsOfService field focused')
                  console.log('🎯 Current data before focus:', data)
                  console.log('🎯 Current yearsOfService before focus:', data.yearsOfService)
                }}
                className={errors['yearsOfService'] ? "border-red-500" : ""}
              />
              {errors['yearsOfService'] && <p className="text-sm text-red-500">{errors['yearsOfService']}</p>}
              <p className="text-sm text-muted-foreground">
                Your current creditable service time as of today (we'll calculate projected years at retirement)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Salary Information Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Salary Information
          </CardTitle>
          <CardDescription>
            Your average highest 3 consecutive years salary
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="averageSalary" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Average Highest 3 Years Salary
              </Label>
              <Input
                id="averageSalary"
                type="number"
                placeholder="75000"
                value={data.averageSalary ? data.averageSalary.toString() : ''}
                onChange={(e) => {
                  console.log('💰 Salary input onChange - RAW VALUE:', e.target.value, typeof e.target.value)
                  console.log('💰 Salary input onChange - TARGET:', e.target)
                  console.log('💰 Salary input onChange - EVENT:', e)

                  // CRITICAL DEBUG: Check if the input field itself is corrupting the value
                  if (e.target.value === '94999' || e.target.value === '27.9') {
                    console.log('🚨 CORRUPTION DETECTED AT INPUT FIELD LEVEL!')
                    console.log('🚨 Input field value:', e.target.value)
                    console.log('🚨 This corruption is happening BEFORE our parsing logic!')
                    console.trace('🚨 Stack trace of input field corruption:')
                  }

                  // CRITICAL FIX: Use the raw string value directly without parsing for now
                  const rawValue = e.target.value
                  console.log('💰 Raw input value (before parsing):', rawValue)

                  // Only parse if we have a value
                  if (rawValue === '') {
                    console.log('💰 Empty value, setting to 0')
                    handleFieldChange('averageSalary', 0)
                  } else {
                    const parsedValue = parseNumberInput(rawValue, false)
                    console.log('💰 Parsed salary value:', parsedValue)
                    handleFieldChange('averageSalary', parsedValue)
                  }
                }}
                className={errors['averageSalary'] ? "border-red-500" : ""}
                onFocus={() => {
                  console.log('🎯 FOCUS EVENT: averageSalary field focused')
                  console.log('🎯 Current data before focus:', data)
                  console.log('🎯 Current averageSalary before focus:', data.averageSalary)
                  console.log('🎯 Setting showSalaryGuidance to true...')
                  setShowSalaryGuidance(true)
                  console.log('🎯 showSalaryGuidance set to true')
                }}
              />
              {errors['averageSalary'] && <p className="text-sm text-red-500">{errors['averageSalary']}</p>}

              {showSalaryGuidance && salaryGuidance && (
                <Alert>
                  <Lightbulb className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-1">
                      <p className="font-medium">Typical salary range for Group {data.retirementGroup}:</p>
                      <p className="text-sm">
                        ${salaryGuidance.min.toLocaleString()} - ${salaryGuidance.max.toLocaleString()}
                        <span className="ml-2 text-muted-foreground">
                          (Typical: ${salaryGuidance.typical.toLocaleString()})
                        </span>
                      </p>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Smart Defaults Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Smart Suggestions
            <Badge variant="secondary">Auto-filled</Badge>
          </CardTitle>
          <CardDescription>
            We've suggested these values based on your information. You can adjust them if needed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="plannedRetirementAge" className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                Suggested Retirement Age
              </Label>
              <Input
                id="plannedRetirementAge"
                type="number"
                value={data.plannedRetirementAge || ''}
                onChange={(e) => handleFieldChange('plannedRetirementAge', parseNumberInput(e.target.value, true))}
                onFocus={() => {
                  console.log('🎯 FOCUS EVENT: plannedRetirementAge field focused')
                  console.log('🎯 Current data before focus:', data)
                  console.log('🎯 Current plannedRetirementAge before focus:', data.plannedRetirementAge)
                }}
                className="bg-blue-50 border-blue-200"
              />
              <p className="text-sm text-muted-foreground">
                Minimum retirement age for your group (you can adjust if needed)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="serviceEntry">When You Started Working</Label>
              <Select
                value={data.serviceEntry || 'before_2012'}
                onValueChange={(value) => handleFieldChange('serviceEntry', value as 'before_2012' | 'after_2012')}
              >
                <SelectTrigger className="bg-blue-50 border-blue-200">
                  <SelectValue placeholder="Select service entry period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="before_2012">Before April 2, 2012</SelectItem>
                  <SelectItem value="after_2012">On or after April 2, 2012</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Auto-detected from your years of service
              </p>
            </div>
          </div>
        </CardContent>
      </Card>


    </div>
  )
}
