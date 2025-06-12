"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRetirementData } from "@/hooks/use-retirement-data"
import { Loader2, User, Calculator, Star, Trash2, Edit, Target, Settings, Calendar, DollarSign } from "lucide-react"
import { format } from "date-fns"
import { RetirementCountdown } from "@/components/countdown/retirement-countdown"
import { RetirementGoalForm } from "@/components/profile/retirement-goal-form"
import { ProfileForm } from "@/components/profile/profile-form"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const {
    profile,
    calculations,
    loading,
    fetchProfile,
    fetchCalculations,
    deleteCalculation,
    updateCalculation,
  } = useRetirementData()

  const [activeTab, setActiveTab] = useState("profile")
  const [profileData, setProfileData] = useState<any>(null)
  const [retirementGoals, setRetirementGoals] = useState<any>(null)
  const [profileLoading, setProfileLoading] = useState(false)

  // Fetch basic profile data
  const fetchBasicProfile = async () => {
    try {
      setProfileLoading(true)
      const response = await fetch("/api/profile")
      if (response.ok) {
        const data = await response.json()
        setProfileData(data)
      }
    } catch (error) {
      console.error("Error fetching profile:", error)
    } finally {
      setProfileLoading(false)
    }
  }

  // Fetch retirement goals
  const fetchRetirementGoals = async () => {
    try {
      const response = await fetch("/api/retirement/profile")
      if (response.ok) {
        const data = await response.json()
        setRetirementGoals(data.profile)
      }
    } catch (error) {
      console.error("Error fetching retirement goals:", error)
    }
  }

  useEffect(() => {
    if (status === "loading") return
    if (!session) {
      router.push("/auth/signin")
      return
    }

    fetchProfile()
    fetchCalculations()
    fetchBasicProfile()
    fetchRetirementGoals()
  }, [session, status, router, fetchProfile, fetchCalculations])

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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="container mx-auto py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">My Profile</h1>
        <p className="text-muted-foreground mt-2">
          Manage your retirement information, set your goals, and track your progress
        </p>
      </div>

      {/* Retirement Countdown Section */}
      <div className="mb-8">
        <RetirementCountdown
          retirementDate={profileData?.retirementDate ? new Date(profileData.retirementDate) : null}
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">
            <User className="h-4 w-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="goals">
            <Target className="h-4 w-4 mr-2" />
            Retirement Goals
          </TabsTrigger>
          <TabsTrigger value="calculations">
            <Calculator className="h-4 w-4 mr-2" />
            Saved Calculations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Basic Profile Form */}
            <div>
              <ProfileForm
                initialData={{
                  fullName: profileData?.fullName || session.user.name || "",
                  retirementDate: profileData?.retirementDate || "",
                }}
                onUpdate={() => {
                  fetchBasicProfile()
                }}
              />
            </div>

            {/* Account Information */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Account Information</CardTitle>
                  <CardDescription>
                    Your basic account details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Name</p>
                    <p className="text-lg font-semibold">{session.user.name || "Not set"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Email</p>
                    <p className="text-lg font-semibold">{session.user.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Member Since</p>
                    <p className="text-lg font-semibold">
                      {session.user.createdAt
                        ? format(new Date(session.user.createdAt), "MMM d, yyyy")
                        : "Recently joined"
                      }
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Retirement Profile Summary */}
              {profile && (
                <Card>
                  <CardHeader>
                    <CardTitle>Retirement Profile Summary</CardTitle>
                    <CardDescription>
                      Your Massachusetts Retirement System information
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Date of Birth</p>
                        <p className="text-lg font-semibold">
                          {format(new Date(profile.dateOfBirth), "MMM d, yyyy")}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Membership Date</p>
                        <p className="text-lg font-semibold">
                          {format(new Date(profile.membershipDate), "MMM d, yyyy")}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Retirement Group</p>
                        <p className="text-lg font-semibold">Group {profile.retirementGroup}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Current Salary</p>
                        <p className="text-lg font-semibold">
                          {formatCurrency(profile.currentSalary)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="goals" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Retirement Goal Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Set Your Retirement Goals
                </CardTitle>
                <CardDescription>
                  Configure your retirement preferences and financial targets
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RetirementGoalForm
                  initialData={retirementGoals}
                  onUpdate={() => {
                    fetchRetirementGoals()
                    fetchBasicProfile()
                  }}
                />
              </CardContent>
            </Card>

            {/* Goal Summary */}
            {retirementGoals && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Current Goals Summary
                  </CardTitle>
                  <CardDescription>
                    Your current retirement configuration
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Retirement Group</p>
                      <p className="text-lg font-semibold">Group {retirementGoals.retirementGroup}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Current Salary</p>
                      <p className="text-lg font-semibold">{formatCurrency(retirementGoals.currentSalary)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Planned Retirement Age</p>
                      <p className="text-lg font-semibold">{retirementGoals.plannedRetirementAge || 'Not set'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Retirement Option</p>
                      <p className="text-lg font-semibold">Option {retirementGoals.retirementOption || 'Not selected'}</p>
                    </div>
                  </div>
                  <div className="pt-4 border-t">
                    <Button asChild className="w-full">
                      <a href="/calculator">
                        <Calculator className="mr-2 h-4 w-4" />
                        Calculate My Pension
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {!retirementGoals && (
              <Card>
                <CardHeader>
                  <CardTitle>No Retirement Goals Set</CardTitle>
                  <CardDescription>
                    Set your retirement goals to see personalized recommendations
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center py-8">
                  <div className="space-y-4">
                    <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                      <Target className="h-8 w-8 text-gray-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Ready to Set Your Goals?</h3>
                      <p className="text-muted-foreground mb-4">
                        Configure your retirement preferences to get personalized insights and calculations.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="calculations" className="mt-6">
          {calculations.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>No Saved Calculations</CardTitle>
                <CardDescription>
                  You haven't saved any retirement calculations yet
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild>
                  <a href="/calculator">Create Your First Calculation</a>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {calculations.map((calc) => (
                <Card key={calc.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          {calc.calculationName || "Unnamed Calculation"}
                        </CardTitle>
                        <CardDescription>
                          Created {format(new Date(calc.createdAt!), "MMM d, yyyy")}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            updateCalculation(calc.id!, {
                              isFavorite: !calc.isFavorite,
                            })
                          }
                        >
                          <Star
                            className={`h-4 w-4 ${
                              calc.isFavorite
                                ? "fill-yellow-500 text-yellow-500"
                                : ""
                            }`}
                          />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Calculation</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this calculation? This action
                                cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteCalculation(calc.id!)}
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Retirement Age</p>
                        <p className="font-medium">{calc.retirementAge}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Years of Service</p>
                        <p className="font-medium">{calc.yearsOfService}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Monthly Benefit</p>
                        <p className="font-medium">
                          {formatCurrency(calc.monthlyBenefit)}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Annual Benefit</p>
                        <p className="font-medium">
                          {formatCurrency(calc.annualBenefit)}
                        </p>
                      </div>
                    </div>
                    {calc.notes && (
                      <div className="mt-4">
                        <p className="text-sm text-muted-foreground">Notes</p>
                        <p className="text-sm">{calc.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
