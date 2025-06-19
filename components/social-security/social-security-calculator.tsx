'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRetirementData } from '@/hooks/use-retirement-data'
import { toast } from 'sonner'

interface SocialSecurityData {
  currentAge: number
  retirementAge: number
  estimatedBenefit: number
}

interface SocialSecurityCalculatorProps {
  onCalculate?: (data: SocialSecurityData) => void
  initialData?: Partial<SocialSecurityData>
}

export function SocialSecurityCalculator({ onCalculate, initialData }: SocialSecurityCalculatorProps) {
  const { data: session } = useSession()
  const { profile: userProfile, saveProfile } = useRetirementData()
  const [data, setData] = useState<SocialSecurityData>({
    currentAge: 45,
    retirementAge: 67,
    estimatedBenefit: 2500
  })
  const [isCalculating, setIsCalculating] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [profileLoaded, setProfileLoaded] = useState(false)

  // Load profile data and calculate current age
  useEffect(() => {
    console.log("Social Security Calculator useEffect triggered:", {
      hasSession: !!session?.user,
      hasProfile: !!userProfile,
      profileData: userProfile
    })

    if (session?.user && userProfile && userProfile.dateOfBirth) {
      console.log("Loading profile data into Social Security calculator:", userProfile)

      // Calculate current age from date of birth
      let calculatedCurrentAge = 45 // fallback
      if (userProfile.dateOfBirth) {
        const birthDate = new Date(userProfile.dateOfBirth)
        const today = new Date()
        const age = today.getFullYear() - birthDate.getFullYear()
        const monthDiff = today.getMonth() - birthDate.getMonth()
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          calculatedCurrentAge = age - 1
        } else {
          calculatedCurrentAge = age
        }

        console.log("Social Security Calculator - Age calculation:", {
          dateOfBirth: userProfile.dateOfBirth,
          birthDate: birthDate.toISOString(),
          today: today.toISOString(),
          age,
          monthDiff,
          calculatedCurrentAge
        })
      }

      // Update data with profile information
      setData(prevData => {
        const newData = {
          currentAge: calculatedCurrentAge,
          retirementAge: userProfile.plannedRetirementAge || 67,
          estimatedBenefit: prevData.estimatedBenefit // Keep user's estimate or default
        }
        console.log("Updating Social Security calculator data:", newData)
        return newData
      })
      setProfileLoaded(true)
    } else {
      console.log("Social Security Calculator - Missing data:", {
        hasSession: !!session?.user,
        hasProfile: !!userProfile,
        hasDateOfBirth: !!(userProfile?.dateOfBirth)
      })
    }
  }, [session?.user, userProfile])

  // Apply initial data if provided
  useEffect(() => {
    if (initialData) {
      setData(prevData => ({
        ...prevData,
        ...initialData
      }))
    }
  }, [initialData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCalculating(true)

    try {
      // Perform Social Security calculations
      const calculationResults = {
        currentAge: data.currentAge,
        retirementAge: data.retirementAge,
        estimatedMonthlyBenefit: data.estimatedBenefit,
        estimatedAnnualBenefit: data.estimatedBenefit * 12,
        yearsUntilRetirement: Math.max(0, data.retirementAge - data.currentAge),
        fullRetirementAge: 67, // This could be calculated based on birth year
        earlyRetirementReduction: data.retirementAge < 67 ? ((67 - data.retirementAge) * 6.67) : 0,
        delayedRetirementCredits: data.retirementAge > 67 ? ((data.retirementAge - 67) * 8) : 0
      }

      setResults(calculationResults)

      // Save to profile if user is logged in
      if (session?.user && saveProfile) {
        try {
          await saveProfile({
            plannedRetirementAge: data.retirementAge,
            // Could add socialSecurityEstimate field to profile
          } as any)
          console.log("Social Security data saved to profile")
        } catch (error) {
          console.error("Error saving Social Security data to profile:", error)
        }
      }

      // Call parent callback
      onCalculate?.(data)

      toast.success("Social Security calculation completed")
    } catch (error) {
      console.error("Error calculating Social Security benefits:", error)
      toast.error("Failed to calculate Social Security benefits")
    } finally {
      setIsCalculating(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Social Security Calculator</CardTitle>
          <CardDescription>
            Estimate your Social Security benefits based on your profile data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="currentAge">Current Age</Label>
              <Input
                id="currentAge"
                type="number"
                value={data.currentAge}
                onChange={(e) => setData(prev => ({ ...prev, currentAge: parseInt(e.target.value) || 0 }))}
                className="mt-1"
              />
              <p className="text-sm text-muted-foreground mt-1">
                {userProfile?.dateOfBirth ? 'Calculated from your date of birth' : 'Enter your current age'}
              </p>
            </div>

            <div>
              <Label htmlFor="retirementAge">Planned Retirement Age</Label>
              <Input
                id="retirementAge"
                type="number"
                value={data.retirementAge}
                onChange={(e) => setData(prev => ({ ...prev, retirementAge: parseInt(e.target.value) || 0 }))}
                className="mt-1"
              />
              <p className="text-sm text-muted-foreground mt-1">
                {userProfile?.plannedRetirementAge ? 'From your retirement profile' : 'When do you plan to claim Social Security?'}
              </p>
            </div>

            <div>
              <Label htmlFor="estimatedBenefit">Estimated Monthly Benefit ($)</Label>
              <Input
                id="estimatedBenefit"
                type="number"
                value={data.estimatedBenefit}
                onChange={(e) => setData(prev => ({ ...prev, estimatedBenefit: parseInt(e.target.value) || 0 }))}
                className="mt-1"
                placeholder="Enter your SSA.gov estimate"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Get your official estimate from <a href="https://www.ssa.gov/myaccount/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">SSA.gov</a>
              </p>
            </div>

            <Button type="submit" disabled={isCalculating} className="w-full">
              {isCalculating ? 'Calculating...' : 'Calculate Social Security Benefits'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Results Section */}
      {results && (
        <Card>
          <CardHeader>
            <CardTitle>Social Security Calculation Results</CardTitle>
            <CardDescription>
              Your estimated Social Security benefits
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Monthly Benefit:</span>
                  <span className="font-semibold">${results.estimatedMonthlyBenefit.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Annual Benefit:</span>
                  <span className="font-semibold">${results.estimatedAnnualBenefit.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Years Until Retirement:</span>
                  <span className="font-semibold">{results.yearsUntilRetirement} years</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Full Retirement Age:</span>
                  <span className="font-semibold">{results.fullRetirementAge}</span>
                </div>
                {results.earlyRetirementReduction > 0 && (
                  <div className="flex justify-between text-orange-600">
                    <span>Early Retirement Reduction:</span>
                    <span className="font-semibold">-{results.earlyRetirementReduction.toFixed(1)}%</span>
                  </div>
                )}
                {results.delayedRetirementCredits > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Delayed Retirement Credits:</span>
                    <span className="font-semibold">+{results.delayedRetirementCredits.toFixed(1)}%</span>
                  </div>
                )}
              </div>
            </div>

            {(results.earlyRetirementReduction > 0 || results.delayedRetirementCredits > 0) && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  {results.earlyRetirementReduction > 0
                    ? `Claiming before your full retirement age (${results.fullRetirementAge}) will reduce your benefits by approximately ${results.earlyRetirementReduction.toFixed(1)}%.`
                    : `Delaying retirement past your full retirement age (${results.fullRetirementAge}) will increase your benefits by approximately ${results.delayedRetirementCredits.toFixed(1)}%.`
                  }
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
