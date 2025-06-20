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
  currentAge: number | null
  retirementAge: number | null
  estimatedBenefit: number | null
}

interface SocialSecurityCalculatorProps {
  onCalculate?: (data: SocialSecurityData) => void
  initialData?: Partial<SocialSecurityData>
}

// Storage keys for form persistence
const SOCIAL_SECURITY_STORAGE_KEY = "ma-social-security-calculator-data"
const SOCIAL_SECURITY_SESSION_KEY = "ma-social-security-calculator-session"

export function SocialSecurityCalculator({ onCalculate, initialData }: SocialSecurityCalculatorProps) {
  const { data: session } = useSession()
  const { profile: userProfile, saveProfile } = useRetirementData()
  const [data, setData] = useState<SocialSecurityData>({
    currentAge: null, // Start with null - will be populated from profile or user input
    retirementAge: null, // Start with null - will be populated from profile or user input
    estimatedBenefit: null // Start with null to force user input
  })
  const [isCalculating, setIsCalculating] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [profileLoaded, setProfileLoaded] = useState(false)
  const [formLoaded, setFormLoaded] = useState(false)

  // Load saved form data from localStorage/sessionStorage
  useEffect(() => {
    try {
      // Try session storage first (for current session), then localStorage (for persistence)
      const sessionData = sessionStorage.getItem(SOCIAL_SECURITY_SESSION_KEY)
      const localData = localStorage.getItem(SOCIAL_SECURITY_STORAGE_KEY)

      if (sessionData) {
        const parsedData = JSON.parse(sessionData)
        console.log("✅ Loading Social Security data from session storage:", parsedData)
        setData(parsedData)
      } else if (localData) {
        const parsedData = JSON.parse(localData)
        console.log("✅ Loading Social Security data from local storage:", parsedData)
        setData(parsedData)
      } else {
        console.log("ℹ️ No saved Social Security data found in storage")
      }
      setFormLoaded(true)
    } catch (error) {
      console.error("Failed to load Social Security data from storage:", error)
      setFormLoaded(true)
    }
  }, [])

  // Load profile data and calculate current age (only after form is loaded)
  useEffect(() => {
    if (!formLoaded) return

    console.log("Social Security Calculator profile useEffect triggered:", {
      hasSession: !!session?.user,
      hasProfile: !!userProfile,
      profileData: userProfile,
      formLoaded
    })

    if (session?.user && userProfile && userProfile.dateOfBirth) {
      console.log("Loading profile data into Social Security calculator:", userProfile)

      // Calculate current age from date of birth
      let calculatedCurrentAge = 0 // no fallback - user must provide if not in profile
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

      // Calculate retirement age from retirement date if available
      let calculatedRetirementAge = null
      if (userProfile.retirementDate) {
        const retirementDate = new Date(userProfile.retirementDate)
        const birthDate = new Date(userProfile.dateOfBirth)
        const retirementAge = retirementDate.getFullYear() - birthDate.getFullYear()
        const monthDiff = retirementDate.getMonth() - birthDate.getMonth()
        if (monthDiff < 0 || (monthDiff === 0 && retirementDate.getDate() < birthDate.getDate())) {
          calculatedRetirementAge = retirementAge - 1
        } else {
          calculatedRetirementAge = retirementAge
        }
      }

      // Update data with profile information (only if fields haven't been manually set)
      setData(prevData => {
        const newData = {
          currentAge: prevData.currentAge === null && calculatedCurrentAge > 0 ? calculatedCurrentAge : prevData.currentAge, // Only update if empty and we have calculated age
          retirementAge: prevData.retirementAge === null && calculatedRetirementAge ? calculatedRetirementAge : prevData.retirementAge, // Only update if empty and we have calculated retirement age
          estimatedBenefit: prevData.estimatedBenefit === null && userProfile.estimatedSocialSecurityBenefit ? userProfile.estimatedSocialSecurityBenefit : prevData.estimatedBenefit // Only update if empty and we have profile data
        }
        console.log("🔄 Updating Social Security calculator data from profile:", {
          prevData,
          userProfile: {
            retirementDate: userProfile.retirementDate,
            calculatedRetirementAge,
            estimatedSocialSecurityBenefit: userProfile.estimatedSocialSecurityBenefit
          },
          newData
        })
        saveToStorage(newData)
        return newData
      })
      setProfileLoaded(true)
    } else {
      console.log("Social Security Calculator - Missing profile data:", {
        hasSession: !!session?.user,
        hasProfile: !!userProfile,
        hasDateOfBirth: !!(userProfile?.dateOfBirth)
      })
      setProfileLoaded(true)
    }
  }, [session?.user, userProfile, formLoaded])

  // Apply initial data if provided (only after form is loaded)
  useEffect(() => {
    if (formLoaded && initialData) {
      setData(prevData => {
        const newData = {
          ...prevData,
          ...initialData
        }
        saveToStorage(newData)
        return newData
      })
    }
  }, [initialData, formLoaded])

  // Save form data to storage
  const saveToStorage = (formData: SocialSecurityData) => {
    try {
      // Save to both session storage (for current session) and localStorage (for persistence)
      sessionStorage.setItem(SOCIAL_SECURITY_SESSION_KEY, JSON.stringify(formData))
      localStorage.setItem(SOCIAL_SECURITY_STORAGE_KEY, JSON.stringify(formData))
      console.log("💾 Social Security data saved to storage:", formData)
    } catch (error) {
      console.error("❌ Failed to save Social Security data to storage:", error)
    }
  }

  // Handle form field changes with persistence
  const handleFieldChange = (field: keyof SocialSecurityData, value: number | null) => {
    console.log(`🔄 Field change: ${field} = ${value}`)
    const newData = { ...data, [field]: value }
    setData(newData)
    saveToStorage(newData)
  }

  // Clear saved form data
  const clearSavedData = () => {
    try {
      // Clear both session and local storage
      sessionStorage.removeItem(SOCIAL_SECURITY_SESSION_KEY)
      localStorage.removeItem(SOCIAL_SECURITY_STORAGE_KEY)

      // Reset to default values - user must enter their own data
      const defaultData = {
        currentAge: null, // Start with null - user must enter or will be populated from profile
        retirementAge: null, // Start with null - user must enter or will be populated from profile
        estimatedBenefit: null // Start with null so user must enter their own value
      }
      console.log("🧹 Clearing Social Security data, resetting to:", defaultData)
      setData(defaultData)
      setResults(null)
      toast.success("Form data cleared - enter your estimated monthly benefit")
    } catch (error) {
      console.error("Failed to clear Social Security data:", error)
      toast.error("Failed to clear form data")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCalculating(true)

    try {
      // Debug: Log the current form data before calculation
      console.log("🧮 Starting Social Security calculation with data:", data)

      // Validation
      if (!data.currentAge || data.currentAge <= 0) {
        throw new Error("Please enter a valid current age")
      }

      if (!data.retirementAge || data.retirementAge <= 0) {
        throw new Error("Please enter a valid retirement age")
      }

      if (!data.estimatedBenefit || data.estimatedBenefit <= 0) {
        throw new Error("Please enter a valid estimated monthly benefit amount")
      }

      if (data.retirementAge <= data.currentAge) {
        throw new Error("Retirement age must be greater than current age")
      }

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

      console.log("✅ Social Security calculation results:", calculationResults)
      setResults(calculationResults)

      // Save to profile if user is logged in
      if (session?.user) {
        try {
          // Prepare the data to save - only save estimated benefit to profile
          const saveData = {
            estimatedSocialSecurityBenefit: data.estimatedBenefit,
          }

          console.log("🔄 Saving Social Security data to profile:", saveData)

          // Save estimated benefit to profile using the retirement profile endpoint
          const response = await fetch("/api/retirement/profile", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(saveData),
          })

          if (response.ok) {
            console.log("Social Security data saved to profile")
            toast.success("Social Security data saved to profile")
          } else {
            const errorData = await response.json()
            console.error("Failed to save Social Security data to profile:", errorData)

            // Provide specific error messages based on the error type
            if (errorData.error === "PROFILE_REQUIRED") {
              toast.error("Please complete your retirement profile first before saving Social Security data")
            } else if (errorData.message) {
              toast.error(`Failed to save: ${errorData.message}`)
            } else {
              toast.error("Failed to save Social Security data to profile")
            }
          }
        } catch (error) {
          console.error("Error saving Social Security data to profile:", error)

          // Provide more specific error message
          const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
          toast.error(`Error saving Social Security data: ${errorMessage}`)
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
                value={data.currentAge || ''}
                onChange={(e) => {
                  const value = e.target.value === '' ? null : parseInt(e.target.value) || null
                  handleFieldChange('currentAge', value)
                }}
                className="mt-1"
                placeholder="Enter your current age"
                min="18"
                max="100"
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
                value={data.retirementAge || ''}
                onChange={(e) => {
                  const value = e.target.value === '' ? null : parseInt(e.target.value) || null
                  handleFieldChange('retirementAge', value)
                }}
                className="mt-1"
                placeholder="Enter planned retirement age"
                min="50"
                max="75"
              />
              <p className="text-sm text-muted-foreground mt-1">
                {userProfile?.retirementDate ? 'Calculated from your retirement date' : 'When do you plan to claim Social Security?'}
              </p>
            </div>

            <div>
              <Label htmlFor="estimatedBenefit">Estimated Monthly Benefit ($)</Label>
              <Input
                id="estimatedBenefit"
                type="number"
                value={data.estimatedBenefit || ''}
                onChange={(e) => {
                  const value = e.target.value === '' ? null : parseFloat(e.target.value) || null
                  console.log(`💰 Estimated benefit input: "${e.target.value}" -> ${value}`)
                  handleFieldChange('estimatedBenefit', value)
                }}
                className="mt-1"
                placeholder="Enter your SSA.gov estimate"
                min="0"
                max="10000"
                step="1"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Get your official estimate from <a href="https://www.ssa.gov/myaccount/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">SSA.gov</a>
              </p>
            </div>

            <div className="space-y-2">
              <Button type="submit" disabled={isCalculating} className="w-full">
                {isCalculating ? 'Calculating...' : 'Calculate Social Security Benefits'}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={clearSavedData}
                className="w-full"
              >
                Start New Calculation
              </Button>
            </div>
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
