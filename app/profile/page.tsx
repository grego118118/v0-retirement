"use client"

import dynamic from "next/dynamic"
import React, { useEffect, useState, useRef, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, User, Calculator, Settings, Calendar, DollarSign, Shield, Target, ArrowLeft } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useProfile } from "@/contexts/profile-context"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import {
  calculateQuickPensionEstimate,
  calculateCurrentAge,
  calculateYearsOfService as calculateStandardizedYearsOfService,
  formatPensionCurrency,
  type RetirementGroup
} from "@/lib/standardized-pension-calculator"
import { getBenefitFactor, generateProjectionTable, checkEligibility } from "@/lib/pension-calculations"

// Helper function to get minimum retirement age by group
function getMinimumRetirementAge(group: RetirementGroup): number {
  switch (group) {
    case 'Group 1': return 60  // Post-2012 minimum
    case 'Group 2': return 55  // Minimum retirement age
    case 'Group 3': return 55  // State Police minimum (can retire earlier with 20+ years)
    case 'Group 4': return 50  // Public safety minimum
    default: return 60
  }
}
import ProjectionTable from "@/components/projection-table"

interface ProfileData {
  fullName?: string
  dateOfBirth?: string
  membershipDate?: string
  retirementGroup?: string
  benefitPercentage?: number
  currentSalary?: number
  averageHighest3Years?: number
  yearsOfService?: number
  plannedRetirementAge?: number
  retirementDate?: string
  retirementOption?: string
  hasProfile?: boolean
}

function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const { profile, updateProfile, loading, isProfileComplete } = useProfile()
  const [activeTab, setActiveTab] = useState("personal")
  const [formData, setFormData] = useState<ProfileData | null>(null)
  const [saving, setSaving] = useState(false)

  // Add ref for auto-save timeout
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Initialize form data with profile data
  useEffect(() => {
    if (profile) {
      setFormData(profile)
    }
  }, [profile])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current)
      }
    }
  }, [])

  // Calculate derived values from form data
  const calculateAge = useCallback((dateOfBirth: string) => {
    if (!dateOfBirth) return null
    const today = new Date()
    const birth = new Date(dateOfBirth)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }, [])

  const calculateYearsOfService = useCallback((membershipDate: string) => {
    if (!membershipDate) return null
    const today = new Date()
    const membership = new Date(membershipDate)
    const diffTime = Math.abs(today.getTime() - membership.getTime())
    return Math.floor(diffTime / (1000 * 60 * 60 * 24 * 365.25))
  }, [])

  // Get display data (prioritize form data over profile data)
  const displayData = formData || profile

  // Save profile data using context
  const saveProfile = useCallback(async (data: Partial<ProfileData>) => {
    setSaving(true)
    try {
      console.log("🔄 Profile Form: Saving profile data:", data)
      const success = await updateProfile(data)
      if (success) {
        toast({
          title: "Success",
          description: "Profile updated successfully",
        })
        // Update form data to reflect the changes
        setFormData(prev => ({ ...prev, ...data }))
      }
      return success
    } catch (error) {
      console.error("❌ Profile Form: Error saving profile:", error)
      toast({
        title: "Error",
        description: "Failed to save profile",
        variant: "destructive",
      })
      return false
    } finally {
      setSaving(false)
    }
  }, [updateProfile, toast])

  // Update form data when input changes (real-time updates)
  const updateFormData = useCallback((updates: Partial<ProfileData>) => {
    console.log("📝 Profile Form: Updating form data with:", updates)

    // Update local form data immediately for UI responsiveness
    setFormData(prev => {
      const newFormData = { ...(prev || profile || {}), ...updates }
      console.log("📋 Profile Form: New form data:", newFormData)
      return newFormData
    })

    // Also update the ProfileContext immediately for real-time dashboard sync
    updateProfile(updates).then(success => {
      if (success) {
        console.log("✅ Profile Form: Real-time update successful")
      } else {
        console.error("❌ Profile Form: Real-time update failed")
      }
    }).catch(error => {
      console.error("💥 Profile Form: Real-time update error:", error)
    })

    // Clear existing timeout for debounced save
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current)
    }

    // Set new timeout for additional save confirmation (backup)
    autoSaveTimeoutRef.current = setTimeout(async () => {
      try {
        console.log("🔄 Profile Form: Backup save triggered for:", updates)
        const success = await updateProfile(updates)
        if (success) {
          console.log("✅ Profile Form: Backup save successful")
        }
      } catch (error) {
        console.error("❌ Profile Form: Backup save failed:", error)
        // Show user-friendly auto-save error (non-blocking)
        toast({
          title: "Auto-save failed",
          description: "Your changes weren't saved automatically. Please use the Save button.",
          variant: "destructive",
        })
      }
    }, 2000) // 2 second delay for backup save
  }, [profile, updateProfile, toast])

  useEffect(() => {
    if (status === "loading") return
    if (!session) {
      router.push("/auth/signin")
      return
    }
  }, [session, status, router])

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="mrs-page-wrapper">
      <div className="mrs-content-container py-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            Profile Settings
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your personal information and retirement planning details
          </p>
        </div>
        {isProfileComplete && (
          <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            Profile Complete
          </Badge>
        )}
      </div>

      {/* Profile Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5 text-blue-600" />
              Personal Info
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Name</div>
              <div className="font-medium">{session.user?.name || "Not set"}</div>

              {displayData?.dateOfBirth && (
                <>
                  <div className="text-sm text-muted-foreground">Current Age</div>
                  <div className="font-medium">{calculateAge(displayData.dateOfBirth)} years old</div>
                </>
              )}

              <div className="text-sm text-muted-foreground">Years of Service</div>
              <div className="font-medium">
                {displayData?.membershipDate
                  ? calculateYearsOfService(displayData.membershipDate)
                  : displayData?.yearsOfService || 0} years
              </div>

              {displayData?.membershipDate && (
                <>
                  <div className="text-sm text-muted-foreground">Member Since</div>
                  <div className="font-medium">
                    {new Date(displayData.membershipDate).toLocaleDateString()}
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <DollarSign className="h-5 w-5 text-green-600" />
              Employment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Current Salary</div>
              <div className="font-medium">
                {displayData?.currentSalary ? `$${displayData.currentSalary.toLocaleString()}` : "Not set"}
              </div>

              {displayData?.averageHighest3Years && displayData.averageHighest3Years !== displayData.currentSalary && (
                <>
                  <div className="text-sm text-muted-foreground">Avg Highest 3 Years</div>
                  <div className="font-medium">${displayData.averageHighest3Years.toLocaleString()}</div>
                </>
              )}

              <div className="text-sm text-muted-foreground">Retirement Group</div>
              <div className="font-medium">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  displayData?.retirementGroup === "Group 3"
                    ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                    : displayData?.retirementGroup === "Group 2"
                    ? "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
                    : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                }`}>
                  {displayData?.retirementGroup || "Group 1"}
                </span>
              </div>

              {displayData?.retirementGroup && (
                <>
                  <div className="text-sm text-muted-foreground">Benefit Multiplier</div>
                  <div className="font-medium">
                    {(() => {
                      try {
                        if (!displayData.dateOfBirth || !displayData.currentSalary) {
                          return "Complete profile for calculation"
                        }

                        const currentAge = calculateCurrentAge(displayData.dateOfBirth)
                        // Use the saved yearsOfService (should be 30 for this user)
                        const yearsOfService = displayData.yearsOfService || 30

                        // Calculate benefit multiplier based on minimum retirement age and projected YOS
                        const groupKey = displayData.retirementGroup.replace(' ', '_').toUpperCase()
                        const membershipDate = displayData.membershipDate ? new Date(displayData.membershipDate) : new Date()
                        const serviceEntry = membershipDate >= new Date('2012-04-02') ? 'after_2012' : 'before_2012'

                        // Get minimum retirement age for this group
                        const minRetirementAge = getMinimumRetirementAge(displayData.retirementGroup as RetirementGroup)
                        const retirementAge = Math.max(currentAge, minRetirementAge)
                        const yearsOfServiceAtRetirement = yearsOfService + (retirementAge - currentAge)

                        const factor = getBenefitFactor(
                          retirementAge,
                          groupKey,
                          serviceEntry,
                          yearsOfServiceAtRetirement
                        )

                        if (factor > 0) {
                          return `${(factor * 100).toFixed(1)}% per year`
                        } else {
                          // Show when they become eligible
                          if (currentAge < minRetirementAge) {
                            return `Not eligible until age ${minRetirementAge}`
                          } else {
                            return "Not eligible"
                          }
                        }
                      } catch (error) {
                        console.error('Benefit multiplier calculation error:', error)
                        return "Calculation error"
                      }
                    })()}
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Target className="h-5 w-5 text-purple-600" />
              Pension Estimate
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              // Calculate standardized pension estimate
              if (!displayData?.dateOfBirth || !displayData?.currentSalary || !displayData?.membershipDate) {
                return (
                  <div className="text-center py-4">
                    <div className="text-sm text-muted-foreground mb-2">Complete your profile to see pension estimates</div>
                    <div className="text-xs text-muted-foreground">Need: Date of birth, salary, and membership date</div>
                  </div>
                )
              }

              const currentAge = calculateCurrentAge(displayData.dateOfBirth)

              // Use the saved yearsOfService (should be 30 for this user)
              const yearsOfService = displayData.yearsOfService || 30

              const pensionEstimate = calculateQuickPensionEstimate(
                currentAge,
                yearsOfService,
                displayData.averageHighest3Years || displayData.currentSalary,
                (displayData.retirementGroup as RetirementGroup) || 'Group 1',
                displayData.plannedRetirementAge || 65,
                displayData.membershipDate
              )

              return (
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Estimated Annual Pension</div>
                  <div className="font-bold text-lg text-purple-600">
                    {formatPensionCurrency(pensionEstimate.annualPension)}
                  </div>

                  <div className="text-sm text-muted-foreground">Estimated Monthly Pension</div>
                  <div className="font-medium text-purple-600">
                    {formatPensionCurrency(pensionEstimate.monthlyPension)}
                  </div>

                  <div className="text-sm text-muted-foreground">Benefit Multiplier</div>
                  <div className="font-medium">
                    {pensionEstimate.benefitMultiplier.toFixed(2)}% of salary
                  </div>

                  <div className="text-xs text-muted-foreground mt-2 p-2 bg-purple-50 dark:bg-purple-950/20 rounded">
                    Based on {yearsOfService} years of service at retirement age {displayData.plannedRetirementAge || 65}
                  </div>
                </div>
              )
            })()}
          </CardContent>
        </Card>


      </div>

      {/* Profile Form Tabs */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Profile Details</CardTitle>
          <CardDescription>
            Update your information to get accurate retirement calculations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="personal" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Personal
              </TabsTrigger>
              <TabsTrigger value="employment" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Employment
              </TabsTrigger>
              <TabsTrigger value="retirement" className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                Retirement
              </TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Personal Information
                  </CardTitle>
                  <CardDescription>
                    Your basic personal and membership information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={displayData?.dateOfBirth || ""}
                      onChange={(e) => updateFormData({ dateOfBirth: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="membershipDate">Membership Date</Label>
                    <Input
                      id="membershipDate"
                      type="date"
                      value={displayData?.membershipDate || ""}
                      onChange={(e) => updateFormData({ membershipDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="retirementGroup">Retirement Group</Label>
                    <Select
                      value={displayData?.retirementGroup || "Group 1"}
                      onValueChange={(value) => updateFormData({ retirementGroup: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your group" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Group 1">Group 1 - General Employees</SelectItem>
                        <SelectItem value="Group 2">Group 2 - Teachers</SelectItem>
                        <SelectItem value="Group 3">Group 3 - Public Safety</SelectItem>
                        <SelectItem value="Group 4">Group 4 - State Police</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    onClick={() => saveProfile({
                      dateOfBirth: displayData?.dateOfBirth,
                      membershipDate: displayData?.membershipDate,
                      retirementGroup: displayData?.retirementGroup
                    })}
                    disabled={saving}
                    className="w-full"
                  >
                    {saving ? "Saving..." : "Save Personal Information"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="employment" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Employment Information
                  </CardTitle>
                  <CardDescription>
                    Your salary and service information for benefit calculations
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="currentSalary">Current Annual Salary</Label>
                    <Input
                      id="currentSalary"
                      type="number"
                      placeholder="75000"
                      value={displayData?.currentSalary || ""}
                      onChange={(e) => updateFormData({ currentSalary: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="averageHighest3Years">Average Highest 3 Years</Label>
                    <Input
                      id="averageHighest3Years"
                      type="number"
                      placeholder="80000"
                      value={displayData?.averageHighest3Years || ""}
                      onChange={(e) => updateFormData({ averageHighest3Years: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="yearsOfService">Years of Service</Label>
                    <Input
                      id="yearsOfService"
                      type="number"
                      step="0.1"
                      placeholder="15.5"
                      value={displayData?.yearsOfService || ""}
                      onChange={(e) => updateFormData({ yearsOfService: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <Button
                    onClick={() => saveProfile({
                      currentSalary: displayData?.currentSalary,
                      averageHighest3Years: displayData?.averageHighest3Years,
                      yearsOfService: displayData?.yearsOfService
                      // Remove hardcoded benefitPercentage - let the standardized calculator handle it
                    })}
                    disabled={saving}
                    className="w-full"
                  >
                    {saving ? "Saving..." : "Save Employment Information"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="retirement" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Retirement Planning
                  </CardTitle>
                  <CardDescription>
                    Your retirement goals and benefit options
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="plannedRetirementAge">Planned Retirement Age</Label>
                    <Input
                      id="plannedRetirementAge"
                      type="number"
                      min="50"
                      max="80"
                      placeholder="65"
                      value={displayData?.plannedRetirementAge || ""}
                      onChange={(e) => updateFormData({ plannedRetirementAge: parseInt(e.target.value) || 65 })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="plannedRetirementDate">Planned Retirement Date</Label>
                    <Input
                      id="plannedRetirementDate"
                      type="date"
                      value={displayData?.retirementDate || ""}
                      onChange={(e) => updateFormData({ retirementDate: e.target.value })}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Set a specific retirement date to override automatic calculations
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="retirementOption">Retirement Option</Label>
                    <Select
                      value={displayData?.retirementOption || "A"}
                      onValueChange={(value) => updateFormData({ retirementOption: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select option" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A">Option A - Maximum Allowance</SelectItem>
                        <SelectItem value="B">Option B - 100% Joint & Survivor</SelectItem>
                        <SelectItem value="C">Option C - 66.7% Joint & Survivor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    onClick={() => saveProfile({
                      plannedRetirementAge: displayData?.plannedRetirementAge,
                      retirementDate: displayData?.retirementDate,
                      retirementOption: displayData?.retirementOption
                    })}
                    disabled={saving}
                    className="w-full"
                  >
                    {saving ? "Saving..." : "Save Retirement Planning"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Calculate Benefits
            </CardTitle>
            <CardDescription>
              Run pension calculations with your current profile data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/calculator">
                Calculate My Pension
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Planning Tools
            </CardTitle>
            <CardDescription>
              Access retirement planning wizard and tools
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" asChild className="w-full">
              <Link href="/wizard">
                Retirement Wizard
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
      </div>
    </div>
  )
}

// Export as dynamic component to prevent SSR issues
export default dynamic(() => Promise.resolve(ProfilePage), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-[600px]">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
    </div>
  )
})
