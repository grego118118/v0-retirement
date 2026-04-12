'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface CombinedRetirementCalculatorProps {
  pensionData?: any
  socialSecurityData?: any
}

export function CombinedRetirementCalculator({
  pensionData,
  socialSecurityData
}: CombinedRetirementCalculatorProps) {
  const [results, setResults] = useState<any>(null)

  const calculateCombined = () => {
    const pensionAmount = pensionData?.monthlyBenefit || 0
    const ssAmount = socialSecurityData?.estimatedBenefit || 0
    const total = pensionAmount + ssAmount

    console.log("🔄 Combined Calculator - Calculating with:", {
      pensionAmount,
      ssAmount,
      total,
      pensionData,
      socialSecurityData
    })

    setResults({
      pension: pensionAmount,
      socialSecurity: ssAmount,
      total: total,
      annual: total * 12
    })
  }

  // Auto-calculate when data changes
  useEffect(() => {
    if (pensionData?.monthlyBenefit || socialSecurityData?.estimatedBenefit) {
      console.log("📊 Combined Calculator - Auto-calculating due to data change")
      calculateCombined()
    }
  }, [pensionData, socialSecurityData])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Combined Retirement Calculator</CardTitle>
        <CardDescription>
          View your total retirement income from pension and Social Security
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Button onClick={calculateCombined}>
            Calculate Combined Benefits
          </Button>
          
          {results && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2">Combined Monthly Income</h3>
              <div className="space-y-2">
                <div>Pension: ${results.pension.toLocaleString()}</div>
                <div>Social Security: ${results.socialSecurity.toLocaleString()}</div>
                <div className="font-bold">Total: ${results.total.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">
                  Annual: ${results.annual.toLocaleString()}
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
