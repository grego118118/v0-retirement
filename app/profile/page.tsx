"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRetirementData } from "@/hooks/use-retirement-data"
import { Loader2, User, Calculator, Star, Trash2, Edit } from "lucide-react"
import { format } from "date-fns"
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

  useEffect(() => {
    if (status === "loading") return
    if (!session) {
      router.push("/auth/signin")
      return
    }

    fetchProfile()
    fetchCalculations()
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
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">My Profile</h1>
        <p className="text-muted-foreground mt-2">
          Manage your retirement information and saved calculations
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="profile">
            <User className="h-4 w-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="calculations">
            <Calculator className="h-4 w-4 mr-2" />
            Saved Calculations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>
                Your basic account details from {session.user.email}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium">Name</p>
                <p className="text-lg">{session.user.name || "Not set"}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-lg">{session.user.email}</p>
              </div>
            </CardContent>
          </Card>

          {profile && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Retirement Profile</CardTitle>
                <CardDescription>
                  Your saved retirement information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">Date of Birth</p>
                    <p className="text-lg">
                      {format(new Date(profile.dateOfBirth), "MMM d, yyyy")}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Membership Date</p>
                    <p className="text-lg">
                      {format(new Date(profile.membershipDate), "MMM d, yyyy")}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Retirement Group</p>
                    <p className="text-lg">Group {profile.retirementGroup}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Current Salary</p>
                    <p className="text-lg">
                      {formatCurrency(profile.currentSalary)}
                    </p>
                  </div>
                </div>
                <Button asChild className="mt-4">
                  <a href="/calculator">Update Profile</a>
                </Button>
              </CardContent>
            </Card>
          )}

          {!profile && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>No Retirement Profile</CardTitle>
                <CardDescription>
                  You haven't created a retirement profile yet
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild>
                  <a href="/calculator">Create Profile</a>
                </Button>
              </CardContent>
            </Card>
          )}
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
