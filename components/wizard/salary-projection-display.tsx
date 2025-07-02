"use client"

import React, { useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { 
  TrendingUp, 
  DollarSign, 
  Calendar, 
  Info, 
  AlertTriangle,
  Calculator
} from "lucide-react"
import { 
  calculateSalaryProjection, 
  formatSalaryProjection, 
  getRetirementDateForProjection,
  MA_STATE_COLA_RATES,
  type SalaryProjectionParams 
} from "@/lib/salary-projection"

interface SalaryProjectionDisplayProps {
  currentSalary: number
  plannedRetirementAge?: number
  currentAge?: number
  birthYear?: number
  retirementDate?: string | Date
  colaRate?: number
  className?: string
  showDetails?: boolean
}

export function SalaryProjectionDisplay({
  currentSalary,
  plannedRetirementAge,
  currentAge,
  birthYear,
  retirementDate,
  colaRate = MA_STATE_COLA_RATES.DEFAULT,
  className = "",
  showDetails = true
}: SalaryProjectionDisplayProps) {
  
  // Calculate the salary projection
  const projection = useMemo(() => {
    if (!currentSalary || currentSalary <= 0) {
      return null
    }

    // Get retirement date from available data
    const calculatedRetirementDate = getRetirementDateForProjection(
      plannedRetirementAge,
      currentAge,
      retirementDate,
      birthYear
    )

    const params: SalaryProjectionParams = {
      currentSalary,
      retirementDate: calculatedRetirementDate,
      retirementAge: plannedRetirementAge,
      currentAge,
      colaRate
    }

    return calculateSalaryProjection(params)
  }, [currentSalary, plannedRetirementAge, currentAge, birthYear, retirementDate, colaRate])

  const formattedProjection = useMemo(() => {
    return projection ? formatSalaryProjection(projection) : null
  }, [projection])

  // Don't render if no current salary
  if (!currentSalary || currentSalary <= 0) {
    return null
  }

  // Don't render if projection failed
  if (!projection || !formattedProjection) {
    return null
  }

  return (
    <Card className={`bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-green-800">
          <TrendingUp className="h-5 w-5" />
          Salary Projection at Retirement
          <Badge variant="secondary" className="bg-green-100 text-green-700">
            Auto-calculated
          </Badge>
        </CardTitle>
        <CardDescription className="text-green-700">
          Based on Massachusetts state employee COLA adjustments
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {projection.isValid ? (
          <>
            {/* Main Projection Display */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-green-700">
                  <DollarSign className="h-4 w-4" />
                  Current Salary
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {formattedProjection.currentSalaryFormatted}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-green-700">
                  <TrendingUp className="h-4 w-4" />
                  Projected Retirement Salary
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {formattedProjection.projectedSalaryFormatted}
                </div>
                {projection.totalGrowth > 0 && (
                  <div className="text-sm text-green-600 font-medium">
                    +{formattedProjection.growthFormatted} ({projection.totalGrowthPercentage}% growth)
                  </div>
                )}
              </div>
            </div>

            <Separator className="bg-green-200" />

            {/* Summary */}
            <Alert className="border-green-200 bg-green-50">
              <Info className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                {formattedProjection.summaryText}
              </AlertDescription>
            </Alert>

            {/* Detailed Information */}
            {showDetails && projection.yearsToRetirement > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">Years to Retirement</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {formattedProjection.yearsFormatted}
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">Annual COLA Rate</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {formattedProjection.colaRateFormatted}
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">Calculation Method</div>
                  <div className="text-lg font-semibold text-gray-900 capitalize">
                    {projection.projectionMethod.replace('-', ' ')}
                  </div>
                </div>
              </div>
            )}

            {/* COLA Rate Information */}
            {showDetails && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start gap-2">
                  <Calculator className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <div className="font-medium mb-1">About COLA Adjustments</div>
                    <div className="text-blue-700">
                      Massachusetts state employees typically receive annual Cost of Living Adjustments (COLA) 
                      ranging from 2-3%. This projection uses {formattedProjection.colaRateFormatted} based on 
                      historical averages. Actual adjustments may vary based on economic conditions and state budget.
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {projection.errorMessage || 'Unable to calculate salary projection'}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}

/**
 * Compact version for inline display
 */
export function SalaryProjectionCompact({
  currentSalary,
  plannedRetirementAge,
  currentAge,
  birthYear,
  retirementDate,
  colaRate = MA_STATE_COLA_RATES.DEFAULT,
  className = ""
}: SalaryProjectionDisplayProps) {
  
  const projection = useMemo(() => {
    if (!currentSalary || currentSalary <= 0) return null

    const calculatedRetirementDate = getRetirementDateForProjection(
      plannedRetirementAge,
      currentAge,
      retirementDate,
      birthYear
    )

    return calculateSalaryProjection({
      currentSalary,
      retirementDate: calculatedRetirementDate,
      retirementAge: plannedRetirementAge,
      currentAge,
      colaRate
    })
  }, [currentSalary, plannedRetirementAge, currentAge, birthYear, retirementDate, colaRate])

  const formattedProjection = useMemo(() => {
    return projection ? formatSalaryProjection(projection) : null
  }, [projection])

  if (!projection?.isValid || !formattedProjection) {
    return null
  }

  return (
    <div className={`flex items-center gap-2 text-sm ${className}`}>
      <TrendingUp className="h-4 w-4 text-green-600" />
      <span className="text-muted-foreground">Projected at retirement:</span>
      <span className="font-semibold text-green-600">
        {formattedProjection.projectedSalaryFormatted}
      </span>
      {projection.totalGrowth > 0 && (
        <Badge variant="secondary" className="text-xs">
          +{projection.totalGrowthPercentage}%
        </Badge>
      )}
    </div>
  )
}
