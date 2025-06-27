"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Calculator, 
  TrendingUp, 
  DollarSign, 
  Target,
  AlertCircle,
  CheckCircle
} from "lucide-react"
import { EssentialInfoData } from "@/lib/wizard/wizard-types-v2"
import { 
  calculateBasicPensionEstimate, 
  assessDataQuality,
  validateRetirementAge 
} from "@/lib/wizard/smart-defaults"

interface LiveCalculationPreviewProps {
  data: Partial<EssentialInfoData>
  className?: string
}

interface CalculationPreview {
  monthlyPension: number
  annualPension: number
  confidence: number
  isValid: boolean
  validationMessage?: string
  dataQuality: {
    completeness: number
    confidence: number
    missingCritical: string[]
  }
  projectedYearsAtRetirement?: number
  isProjected?: boolean
}

export function LiveCalculationPreview({ data, className = "" }: LiveCalculationPreviewProps) {
  const [preview, setPreview] = useState<CalculationPreview | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)
  
  useEffect(() => {
    const calculatePreview = async () => {
      // Only calculate if we have minimum required data
      if (!data.retirementGroup || !data.yearsOfService || !data.averageSalary) {
        setPreview(null)
        return
      }
      
      setIsCalculating(true)
      
      // Simulate brief calculation delay for better UX
      await new Promise(resolve => setTimeout(resolve, 300))
      
      const pensionEstimate = calculateBasicPensionEstimate(data)
      const monthlyPension = pensionEstimate.monthlyPension
      const annualPension = monthlyPension * 12
      const dataQuality = assessDataQuality(data)
      
      // Validate retirement age if provided
      let isValid = true
      let validationMessage = undefined

      if (data.plannedRetirementAge && data.retirementGroup && data.yearsOfService && data.serviceEntry) {
        const validation = validateRetirementAge(
          data.plannedRetirementAge,
          data.retirementGroup,
          data.yearsOfService,
          data.serviceEntry,
          data.currentAge
        )
        isValid = validation.isValid
        validationMessage = validation.message
      }
      
      setPreview({
        monthlyPension,
        annualPension,
        confidence: dataQuality.confidence,
        isValid,
        validationMessage,
        dataQuality,
        projectedYearsAtRetirement: pensionEstimate.projectedYearsAtRetirement,
        isProjected: pensionEstimate.isProjected
      })
      
      setIsCalculating(false)
    }
    
    calculatePreview()
  }, [data])
  
  if (!preview && !isCalculating) {
    return (
      <Card className={`bg-gray-50 border-gray-200 ${className}`}>
        <CardContent className="pt-6">
          <div className="text-center text-gray-500">
            <Calculator className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Enter your basic information above to see a live pension estimate</p>
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
            <p className="text-sm text-blue-600">Calculating your pension estimate...</p>
          </div>
        </CardContent>
      </Card>
    )
  }
  
  if (!preview) return null
  
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600'
    if (confidence >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }
  
  const getConfidenceBadgeVariant = (confidence: number) => {
    if (confidence >= 80) return 'default'
    if (confidence >= 60) return 'secondary'
    return 'destructive'
  }
  
  return (
    <Card className={`${preview.isValid ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'} ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className={`flex items-center gap-2 ${preview.isValid ? 'text-green-700' : 'text-yellow-700'}`}>
          {preview.isValid ? (
            <CheckCircle className="h-5 w-5" />
          ) : (
            <AlertCircle className="h-5 w-5" />
          )}
          Live Pension Preview
          <Badge variant={getConfidenceBadgeVariant(preview.confidence)}>
            {preview.confidence}% Confidence
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Main Calculation Display */}
          <div className="text-center">
            <div className={`text-3xl font-bold mb-1 ${preview.isValid ? 'text-green-700' : 'text-yellow-700'}`}>
              ${preview.monthlyPension.toLocaleString()}/month
            </div>
            <div className="text-sm text-muted-foreground">
              ${preview.annualPension.toLocaleString()} annually
            </div>
          </div>
          
          {/* Validation Message */}
          {!preview.isValid && preview.validationMessage && (
            <div className="bg-yellow-100 border border-yellow-300 rounded-md p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-yellow-800">{preview.validationMessage}</p>
              </div>
            </div>
          )}
          
          {/* Data Quality Indicator */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Data Completeness</span>
              <span className={`font-medium ${getConfidenceColor(preview.dataQuality.completeness)}`}>
                {preview.dataQuality.completeness}%
              </span>
            </div>
            <Progress value={preview.dataQuality.completeness} className="h-2" />
          </div>
          
          {/* Missing Data Hints */}
          {preview.dataQuality.missingCritical.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <p className="text-sm text-blue-800 font-medium mb-1">To improve accuracy:</p>
              <ul className="text-sm text-blue-700 space-y-1">
                {preview.dataQuality.missingCritical.map((field, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                    {getFieldDisplayName(field)}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Projection Details */}
          {preview.isProjected && preview.projectedYearsAtRetirement && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <div className="flex items-center gap-2 mb-1">
                <Calculator className="h-4 w-4 text-blue-600" />
                <p className="text-sm text-blue-800 font-medium">Projection Details:</p>
              </div>
              <div className="text-sm text-blue-700 space-y-1">
                <p>• Current years of service: {data.yearsOfService}</p>
                <p>• Projected years at retirement: {preview.projectedYearsAtRetirement}</p>
                <p>• Additional years until retirement: {(preview.projectedYearsAtRetirement - (data.yearsOfService || 0)).toFixed(1)}</p>
              </div>
            </div>
          )}

          {/* Calculation Notes */}
          <div className="text-xs text-muted-foreground space-y-1">
            <p>• This is a basic estimate using simplified calculations</p>
            <p>• Based on {preview.isProjected ? 'projected' : 'current'} years of service</p>
            <p>• Add Social Security information for your complete retirement picture</p>
            <p>• Final calculations will include all applicable factors and options</p>
          </div>
          
          {/* Next Steps Hint */}
          {preview.isValid && preview.confidence >= 60 && (
            <div className="bg-green-100 border border-green-200 rounded-md p-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <p className="text-sm text-green-800 font-medium">
                  Looking good! Continue to the next step for Social Security integration.
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Helper function to convert field names to display names
function getFieldDisplayName(field: string): string {
  const fieldMap: Record<string, string> = {
    'birthYear': 'Birth year',
    'retirementGroup': 'Job category',
    'yearsOfService': 'Years of service',
    'averageSalary': 'Average salary',
    'plannedRetirementAge': 'Planned retirement age',
    'serviceEntry': 'Service entry period'
  }
  
  return fieldMap[field] || field
}

// Enhanced preview with breakdown (for future use)
export function DetailedCalculationPreview({ data, className = "" }: LiveCalculationPreviewProps) {
  const preview = calculateBasicPensionEstimate(data)

  if (!preview || !data.averageSalary || !data.yearsOfService) return null

  // Note: The preview now uses official MSRB calculations from calculateBasicPensionEstimate
  // This ensures consistency with the main calculation logic
  const annualPension = preview.monthlyPension * 12
  const cap = data.averageSalary * 0.8
  const isCapped = annualPension >= cap
  
  return (
    <Card className={`bg-blue-50 border-blue-200 ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-700">
          <Calculator className="h-5 w-5" />
          Calculation Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span>Average Salary:</span>
            <span className="font-medium">${data.averageSalary.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Years of Service:</span>
            <span className="font-medium">{data.yearsOfService}</span>
          </div>
          <div className="flex justify-between">
            <span>Benefit Factor:</span>
            <span className="font-medium">{(basicFactor * 100).toFixed(1)}%</span>
          </div>
          <hr className="border-blue-200" />
          <div className="flex justify-between">
            <span>Annual Pension:</span>
            <span className="font-medium">${Math.round(annualBeforeCap).toLocaleString()}</span>
          </div>
          {isCapped && (
            <>
              <div className="flex justify-between text-yellow-600">
                <span>80% Cap Applied:</span>
                <span className="font-medium">-${Math.round(annualBeforeCap - cap).toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>Final Annual:</span>
                <span>${Math.round(cap).toLocaleString()}</span>
              </div>
            </>
          )}
          <div className="flex justify-between text-lg font-bold text-blue-700 pt-2 border-t border-blue-200">
            <span>Monthly Pension:</span>
            <span>${preview.toLocaleString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
