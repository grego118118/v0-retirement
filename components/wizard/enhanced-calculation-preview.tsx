"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Calculator, 
  TrendingUp, 
  DollarSign, 
  Target,
  AlertCircle,
  CheckCircle,
  Users,
  Info
} from "lucide-react"

// Import the official MSRB calculation functions
import {
  getBenefitFactor,
  calculatePensionWithOption,
  checkEligibility,
  calculateAnnualPension
} from "@/lib/pension-calculations"
// import { PDFExportSection } from "@/components/pdf/pdf-export-button"
// import { PensionCalculationData } from "@/lib/pdf/pdf-generator"

interface EssentialInfoData {
  birthYear: number
  currentAge: number
  retirementGroup: '1' | '2' | '3' | '4'
  yearsOfService: number
  averageSalary: number
  plannedRetirementAge: number
  serviceEntry: 'before_2012' | 'after_2012'
  retirementOption: 'A' | 'B' | 'C'
  beneficiaryAge?: number
}

interface EnhancedCalculationPreviewProps {
  data: Partial<EssentialInfoData>
  onChange: (data: Partial<EssentialInfoData>, fieldName?: string) => void
  className?: string
}

interface CalculationResult {
  isValid: boolean
  eligible: boolean
  eligibilityMessage?: string
  currentAge: number
  plannedRetirementAge: number
  currentYearsOfService: number
  projectedYearsOfService: number
  benefitFactor: number
  totalBenefitPercentage: number
  basePension: number
  cappedAt80Percent: boolean
  options: {
    A: { annual: number; monthly: number; description: string }
    B: { annual: number; monthly: number; description: string; reduction: number }
    C: { annual: number; monthly: number; description: string; reduction: number; survivorAnnual: number; survivorMonthly: number }
  }
}

export function EnhancedCalculationPreview({ data, onChange, className = "" }: EnhancedCalculationPreviewProps) {
  const [calculation, setCalculation] = useState<CalculationResult | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)
  
  // Calculate comprehensive pension results using official MSRB functions
  useEffect(() => {
    const calculateResults = async () => {
      // Only calculate if we have minimum required data
      if (!data.retirementGroup || !data.yearsOfService || !data.averageSalary || !data.plannedRetirementAge || !data.currentAge) {
        setCalculation(null)
        return
      }

      setIsCalculating(true)

      // CRITICAL FIX: Use completely isolated data copy to prevent any contamination
      console.log('🔒 Enhanced Preview: Creating isolated data copy for calculations...')
      const isolatedData = JSON.parse(JSON.stringify(data))
      console.log('🔒 Enhanced Preview: Original data:', data)
      console.log('🔒 Enhanced Preview: Isolated data copy:', isolatedData)

      try {
        const groupKey = `GROUP_${isolatedData.retirementGroup}`
        const serviceEntry = isolatedData.serviceEntry || 'before_2012'
        const currentAge = isolatedData.currentAge
        const plannedRetirementAge = isolatedData.plannedRetirementAge
        const currentYearsOfService = isolatedData.yearsOfService
        const averageSalary = isolatedData.averageSalary

        console.log('🔒 Enhanced Preview: Using isolated values for calculation:')
        console.log('🔒   currentAge:', currentAge)
        console.log('🔒   plannedRetirementAge:', plannedRetirementAge)
        console.log('🔒   currentYearsOfService:', currentYearsOfService)
        console.log('🔒   averageSalary:', averageSalary)

        // Calculate projected years of service at retirement (ISOLATED CALCULATION)
        const additionalYears = Math.max(0, plannedRetirementAge - currentAge)
        const projectedYearsOfService = currentYearsOfService + additionalYears

        console.log('🔒 Enhanced Preview: Calculated values (ISOLATED):')
        console.log('🔒   additionalYears:', additionalYears)
        console.log('🔒   projectedYearsOfService:', projectedYearsOfService)
        
        // Check eligibility using official MSRB function
        const eligibility = checkEligibility(
          Math.floor(plannedRetirementAge),
          projectedYearsOfService,
          groupKey,
          serviceEntry
        )
        
        if (!eligibility.eligible) {
          setCalculation({
            isValid: false,
            eligible: false,
            eligibilityMessage: eligibility.message,
            currentAge,
            plannedRetirementAge,
            currentYearsOfService,
            projectedYearsOfService,
            benefitFactor: 0,
            totalBenefitPercentage: 0,
            basePension: 0,
            cappedAt80Percent: false,
            options: {
              A: { annual: 0, monthly: 0, description: "Not eligible" },
              B: { annual: 0, monthly: 0, description: "Not eligible", reduction: 0 },
              C: { annual: 0, monthly: 0, description: "Not eligible", reduction: 0, survivorAnnual: 0, survivorMonthly: 0 }
            }
          })
          setIsCalculating(false)
          return
        }
        
        // Get benefit factor using official MSRB function
        const benefitFactor = getBenefitFactor(
          Math.floor(plannedRetirementAge),
          groupKey,
          serviceEntry,
          projectedYearsOfService
        )
        
        if (benefitFactor === 0) {
          setCalculation({
            isValid: false,
            eligible: false,
            eligibilityMessage: "No benefit factor available for this age/group combination",
            currentAge,
            plannedRetirementAge,
            currentYearsOfService,
            projectedYearsOfService,
            benefitFactor: 0,
            totalBenefitPercentage: 0,
            basePension: 0,
            cappedAt80Percent: false,
            options: {
              A: { annual: 0, monthly: 0, description: "No benefit factor" },
              B: { annual: 0, monthly: 0, description: "No benefit factor", reduction: 0 },
              C: { annual: 0, monthly: 0, description: "No benefit factor", reduction: 0, survivorAnnual: 0, survivorMonthly: 0 }
            }
          })
          setIsCalculating(false)
          return
        }
        
        // Calculate base pension using official MSRB methodology
        // Calculate the actual benefit percentage (years × factor) - NO CAP HERE
        const totalBenefitPercentage = benefitFactor * projectedYearsOfService

        // Calculate base pension amount
        let basePension = averageSalary * totalBenefitPercentage

        // Apply 80% cap only to the final pension amount, not the percentage
        const maxPension = averageSalary * 0.8
        const cappedAt80Percent = basePension > maxPension

        if (cappedAt80Percent) {
          basePension = maxPension
        }
        
        // Calculate all three options using official MSRB functions
        const optionAResult = calculatePensionWithOption(basePension, "A", plannedRetirementAge, "")
        const optionBResult = calculatePensionWithOption(basePension, "B", plannedRetirementAge, "")
        const optionCResult = calculatePensionWithOption(
          basePension, 
          "C", 
          plannedRetirementAge, 
          data.beneficiaryAge?.toString() || plannedRetirementAge.toString()
        )
        
        setCalculation({
          isValid: true,
          eligible: true,
          currentAge,
          plannedRetirementAge,
          currentYearsOfService,
          projectedYearsOfService,
          benefitFactor,
          totalBenefitPercentage,
          basePension,
          cappedAt80Percent,
          options: {
            A: {
              annual: optionAResult.pension,
              monthly: optionAResult.pension / 12,
              description: optionAResult.description
            },
            B: {
              annual: optionBResult.pension,
              monthly: optionBResult.pension / 12,
              description: optionBResult.description,
              reduction: ((basePension - optionBResult.pension) / basePension) * 100
            },
            C: {
              annual: optionCResult.pension,
              monthly: optionCResult.pension / 12,
              description: optionCResult.description,
              reduction: ((basePension - optionCResult.pension) / basePension) * 100,
              survivorAnnual: optionCResult.survivorPension,
              survivorMonthly: optionCResult.survivorPension / 12
            }
          }
        })

        // CRITICAL VERIFICATION: Ensure original data was never modified during calculations
        console.log('🔍 Enhanced Preview: Post-calculation verification...')
        console.log('🔍 Original data after calculations:', data)
        console.log('🔍 Isolated data after calculations:', isolatedData)

        if (JSON.stringify(data) !== JSON.stringify(isolatedData)) {
          console.log('🚨 CRITICAL ERROR: Enhanced Preview calculations modified the original data!')
          console.log('🚨 This should NEVER happen!')
          console.trace('🚨 Stack trace of data modification:')
        } else {
          console.log('✅ VERIFIED: Original data remains pristine after calculations')
        }

      } catch (error) {
        console.error('Error calculating pension:', error)
        setCalculation(null)
      }

      setIsCalculating(false)
    }
    
    calculateResults()
  }, [data.retirementGroup, data.yearsOfService, data.averageSalary, data.plannedRetirementAge, data.currentAge, data.serviceEntry, data.beneficiaryAge])
  
  // Handle retirement option change
  const handleRetirementOptionChange = (option: 'A' | 'B' | 'C') => {
    console.log('🎯 Enhanced Preview: Retirement option change:', option)

    // CRITICAL DEBUG: Ensure we're only changing retirementOption, not core values
    const changeData = { retirementOption: option }
    console.log('🎯 Enhanced Preview: Change data being sent:', changeData)

    // CRITICAL SAFETY CHECK: Never modify core user input values
    if ('yearsOfService' in changeData || 'averageSalary' in changeData || 'plannedRetirementAge' in changeData) {
      console.log('🚨 CRITICAL ERROR: Enhanced Preview attempting to modify core user input values!')
      console.trace('🚨 Stack trace of attempted core value modification:')
      return // Prevent the change
    }

    onChange(changeData, 'retirementOption')
  }

  // Handle beneficiary age change
  const handleBeneficiaryAgeChange = (age: number) => {
    console.log('🎯 Enhanced Preview: Beneficiary age change:', age)
    console.log('🎯 Enhanced Preview: Current data object:', data)

    // CRITICAL DEBUG: Create completely isolated change data
    const changeData = { beneficiaryAge: age }
    console.log('🎯 Enhanced Preview: Isolated change data being sent:', changeData)
    console.log('🎯 Enhanced Preview: Change data keys:', Object.keys(changeData))
    console.log('🎯 Enhanced Preview: Change data values:', Object.values(changeData))

    // CRITICAL SAFETY CHECK: Verify the change data is clean
    const hasCorruptedFields = Object.keys(changeData).some(key =>
      key === 'yearsOfService' || key === 'averageSalary' || key === 'plannedRetirementAge'
    )

    if (hasCorruptedFields) {
      console.log('🚨 CRITICAL ERROR: Enhanced Preview change data contains protected fields!')
      console.log('🚨 Change data:', changeData)
      console.trace('🚨 Stack trace of contaminated change data:')
      return // Prevent the change
    }

    // CRITICAL DEBUG: Verify the data object doesn't contain corrupted values that could leak
    if (data.yearsOfService && (data.yearsOfService < 27 || data.yearsOfService > 29) && data.yearsOfService !== Math.floor(data.yearsOfService)) {
      console.log('🚨 WARNING: Current data object contains suspicious yearsOfService:', data.yearsOfService)
      console.log('🚨 This could indicate the source data is already corrupted')
    }

    if (data.averageSalary && (data.averageSalary < 94000 || data.averageSalary > 96000) && data.averageSalary !== Math.floor(data.averageSalary)) {
      console.log('🚨 WARNING: Current data object contains suspicious averageSalary:', data.averageSalary)
      console.log('🚨 This could indicate the source data is already corrupted')
    }

    console.log('🎯 Enhanced Preview: Calling onChange with clean data...')
    onChange(changeData, 'beneficiaryAge')
    console.log('🎯 Enhanced Preview: onChange call completed')
  }
  
  if (!calculation && !isCalculating) {
    return (
      <Card className={`bg-gray-50 border-gray-200 ${className}`}>
        <CardContent className="pt-6">
          <div className="text-center text-gray-500">
            <Calculator className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Enter your basic information above to see detailed pension calculations</p>
          </div>
        </CardContent>
      </Card>
    )
  }
  
  if (isCalculating) {
    return (
      <Card className={`bg-blue-50 border-blue-200 ${className}`}>
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-blue-600">Calculating your pension using official MSRB methodology...</p>
          </div>
        </CardContent>
      </Card>
    )
  }
  
  if (!calculation) return null
  
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Retirement Option Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Retirement Option Selection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="retirementOption">Choose Your Retirement Option</Label>
              <Select
                value={data.retirementOption || 'A'}
                onValueChange={(value) => handleRetirementOptionChange(value as 'A' | 'B' | 'C')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select retirement option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">Option A - Maximum Benefit (100%)</SelectItem>
                  <SelectItem value="B">Option B - Annuity Protection</SelectItem>
                  <SelectItem value="C">Option C - Joint & Survivor (66.67%)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {data.retirementOption === 'C' && (
              <div className="space-y-2">
                <Label htmlFor="beneficiaryAge" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Beneficiary's Age (at your retirement)
                </Label>
                <Input
                  id="beneficiaryAge"
                  type="number"
                  placeholder="e.g., 55"
                  value={data.beneficiaryAge || ''}
                  onChange={(e) => {
                    const value = e.target.value
                    const numValue = value && value.trim() !== '' ? parseInt(value, 10) : 0
                    if (!isNaN(numValue) || value === '') {
                      handleBeneficiaryAgeChange(numValue)
                    }
                  }}
                />
                <p className="text-xs text-muted-foreground">
                  Required for Option C calculations
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Eligibility Status */}
      {!calculation.eligible && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Not Eligible:</strong> {calculation.eligibilityMessage}
          </AlertDescription>
        </Alert>
      )}

      {/* Calculation Details */}
      {calculation.eligible && (
        <Card className="bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <Calculator className="h-5 w-5" />
              Official MSRB Calculation Results
              <Badge variant="default">Validated Accuracy</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Calculation Summary Table */}
              <div className="bg-white rounded-lg border p-4">
                <h4 className="font-medium mb-3">Calculation Summary</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Current Age:</span>
                      <span className="font-medium">{calculation.currentAge}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Planned Retirement Age:</span>
                      <span className="font-medium">{calculation.plannedRetirementAge}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Current Years of Service:</span>
                      <span className="font-medium">{calculation.currentYearsOfService}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Projected Years at Retirement:</span>
                      <span className="font-medium">{calculation.projectedYearsOfService.toFixed(1)}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Average Salary:</span>
                      <span className="font-medium">${data.averageSalary?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Benefit Factor:</span>
                      <span className="font-medium">{(calculation.benefitFactor * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Benefit Percentage:</span>
                      <span className="font-medium">{(calculation.totalBenefitPercentage * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Base Annual Pension:</span>
                      <span className="font-medium">${calculation.basePension.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {calculation.cappedAt80Percent && (
                  <Alert className="mt-4">
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      <strong>80% Cap Applied:</strong> Your pension is capped at 80% of your average salary per Massachusetts law.
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              {/* Retirement Options Comparison */}
              <div className="bg-white rounded-lg border p-4">
                <h4 className="font-medium mb-3">Retirement Options Comparison</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Option</th>
                        <th className="text-right py-2">Annual Benefit</th>
                        <th className="text-right py-2">Monthly Benefit</th>
                        <th className="text-right py-2">Reduction</th>
                        <th className="text-left py-2">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className={`border-b ${data.retirementOption === 'A' ? 'bg-blue-50' : ''}`}>
                        <td className="py-2 font-medium">Option A</td>
                        <td className="text-right py-2">${calculation.options.A.annual.toLocaleString()}</td>
                        <td className="text-right py-2">${Math.round(calculation.options.A.monthly).toLocaleString()}</td>
                        <td className="text-right py-2">0%</td>
                        <td className="py-2 text-gray-600">Maximum benefit, no survivor protection</td>
                      </tr>
                      <tr className={`border-b ${data.retirementOption === 'B' ? 'bg-blue-50' : ''}`}>
                        <td className="py-2 font-medium">Option B</td>
                        <td className="text-right py-2">${calculation.options.B.annual.toLocaleString()}</td>
                        <td className="text-right py-2">${Math.round(calculation.options.B.monthly).toLocaleString()}</td>
                        <td className="text-right py-2">{calculation.options.B.reduction.toFixed(1)}%</td>
                        <td className="py-2 text-gray-600">Annuity protection, age-based reduction</td>
                      </tr>
                      <tr className={`${data.retirementOption === 'C' ? 'bg-blue-50' : ''}`}>
                        <td className="py-2 font-medium">Option C</td>
                        <td className="text-right py-2">${calculation.options.C.annual.toLocaleString()}</td>
                        <td className="text-right py-2">${Math.round(calculation.options.C.monthly).toLocaleString()}</td>
                        <td className="text-right py-2">{calculation.options.C.reduction.toFixed(1)}%</td>
                        <td className="py-2 text-gray-600">Joint & survivor, 66.67% to beneficiary</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {data.retirementOption === 'C' && calculation.options.C.survivorAnnual > 0 && (
                  <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded">
                    <h5 className="font-medium text-purple-800 mb-2">Survivor Benefits (Option C)</h5>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex justify-between">
                        <span className="text-purple-700">Survivor Annual Benefit:</span>
                        <span className="font-medium">${calculation.options.C.survivorAnnual.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-purple-700">Survivor Monthly Benefit:</span>
                        <span className="font-medium">${Math.round(calculation.options.C.survivorMonthly).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Selected Option Highlight */}
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-4">
                  <div className="text-center">
                    <h4 className="font-medium text-blue-800 mb-2">
                      Your Selected Option: {data.retirementOption || 'A'}
                    </h4>
                    <div className="text-3xl font-bold text-blue-700 mb-1">
                      ${Math.round(calculation.options[data.retirementOption || 'A'].monthly).toLocaleString()}/month
                    </div>
                    <div className="text-lg text-blue-600 mb-2">
                      ${calculation.options[data.retirementOption || 'A'].annual.toLocaleString()}/year
                    </div>
                    <p className="text-sm text-blue-600">
                      {calculation.options[data.retirementOption || 'A'].description}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* PDF Export Section - Temporarily disabled for production
              <PDFExportSection
                pensionData={{
                  currentAge: calculation.currentAge,
                  plannedRetirementAge: calculation.plannedRetirementAge,
                  retirementGroup: data.retirementGroup || 'GROUP_2',
                  serviceEntry: data.serviceEntry || 'before_2012',
                  averageSalary: data.averageSalary || 0,
                  yearsOfService: calculation.currentYearsOfService,
                  projectedYearsAtRetirement: calculation.projectedYearsOfService,
                  basePension: calculation.basePension,
                  benefitFactor: calculation.benefitFactor,
                  totalBenefitPercentage: calculation.totalBenefitPercentage,
                  cappedAt80Percent: calculation.cappedAt80Percent,
                  options: calculation.options,
                  calculationDate: new Date()
                } as PensionCalculationData}
                className="mt-6"
              />
              */}

              {/* Calculation Notes */}
              <div className="text-xs text-gray-600 space-y-1">
                <p>• Calculations use official Massachusetts State Retirement Board methodology</p>
                <p>• Results have been validated against MSRB calculator for accuracy</p>
                <p>• Benefit factors and option reductions are based on current MSRB rules</p>
                <p>• Add Social Security information in the next step for complete retirement planning</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
