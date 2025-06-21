"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { useToast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

import {
  User,
  Mail,
  Calendar,
  Building,
  DollarSign,
  Clock,
  Shield,
  Settings,
  Download,
  Trash2,
  Save,
  X,
  Home,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Loader2,
  Eye,
  EyeOff,
  Crown,
  CreditCard
} from "lucide-react"

import { useSubscriptionStatus } from "@/hooks/use-subscription"
import { getSubscriptionDisplayStatus } from "@/lib/stripe/config"

// Form validation schemas
const profileSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  membershipDate: z.string().min(1, "Membership date is required"),
  retirementGroup: z.enum(["1", "2", "3", "4"], {
    required_error: "Please select a retirement group",
  }),
  currentSalary: z.number().min(0, "Salary must be positive"),
  yearsOfService: z.number().min(0, "Years of service must be positive"),
  retirementDate: z.string().optional(),
  retirementOption: z.enum(["A", "B", "C"], {
    required_error: "Please select a retirement option",
  }),
})

const emailSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
})

type ProfileFormData = z.infer<typeof profileSchema>
type EmailFormData = z.infer<typeof emailSchema>

interface ProfileData {
  fullName: string
  retirementDate: string
  dateOfBirth: string
  membershipDate: string
  retirementGroup: string
  currentSalary: number
  yearsOfService: number
  retirementOption: string
}

export default function AccountPage() {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  const { toast } = useToast()

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const [activeTab, setActiveTab] = useState("profile")
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  // Add subscription status hook
  const {
    isPremium,
    subscriptionStatus,
    refreshStatus
  } = useSubscriptionStatus()

  // Form instances
  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: "",
      dateOfBirth: "",
      membershipDate: "",
      retirementGroup: "1",
      currentSalary: 0,
      yearsOfService: 0,
      retirementDate: "",
      retirementOption: "A",
    },
  })

  const emailForm = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: "",
    },
  })

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "loading") return
    if (status === "unauthenticated") {
      router.push("/auth/signin")
      return
    }
  }, [status, router])

  // Load profile data
  useEffect(() => {
    const loadProfileData = async () => {
      if (!session?.user?.id) return

      try {
        setIsLoading(true)
        const response = await fetch("/api/profile")
        
        if (!response.ok) {
          throw new Error("Failed to load profile data")
        }

        const data = await response.json()
        setProfileData(data)

        // Populate forms with existing data
        profileForm.reset({
          fullName: data.fullName || "",
          dateOfBirth: data.dateOfBirth ? data.dateOfBirth.split('T')[0] : "",
          membershipDate: data.membershipDate ? data.membershipDate.split('T')[0] : "",
          retirementGroup: data.retirementGroup || "1",
          currentSalary: data.currentSalary || 0,
          yearsOfService: data.yearsOfService || 0,
          retirementDate: data.retirementDate ? data.retirementDate.split('T')[0] : "",
          retirementOption: data.retirementOption || "A",
        })

        emailForm.reset({
          email: session.user.email || "",
        })

      } catch (error) {
        console.error("Error loading profile:", error)
        toast({
          title: "Error",
          description: "Failed to load profile data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (session?.user?.id) {
      loadProfileData()
    }
  }, [session, profileForm, emailForm, toast])

  // Handle profile form submission
  const onProfileSubmit = async (data: ProfileFormData) => {
    try {
      setIsSaving(true)

      // Validate required fields
      if (!data.fullName || !data.dateOfBirth || !data.membershipDate) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields: Full Name, Date of Birth, and Membership Date.",
          variant: "destructive",
        })
        return
      }

      // Prepare data for API - fix field mapping and remove duplicate
      const profileUpdateData = {
        // Basic profile fields (for User table)
        full_name: data.fullName,
        retirement_date: data.retirementDate || null,

        // Detailed profile fields (for RetirementProfile table)
        dateOfBirth: data.dateOfBirth,
        membershipDate: data.membershipDate,
        retirementGroup: data.retirementGroup,
        currentSalary: data.currentSalary,
        yearsOfService: data.yearsOfService,
        retirementOption: data.retirementOption,

        // Remove duplicate retirementDate field
        // retirementDate is handled by retirement_date above
      }

      console.log("Submitting profile data:", profileUpdateData)

      const response = await fetch("/api/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profileUpdateData),
      })

      console.log("Profile update response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json()
        console.error("Profile update failed:", errorData)
        throw new Error(errorData.message || "Failed to update profile")
      }

      const result = await response.json()
      console.log("Profile update successful:", result)
      
      // Update session if name changed
      if (data.fullName !== session?.user?.name) {
        await update({ name: data.fullName })
      }

      toast({
        title: "Success",
        description: "Profile updated successfully",
      })

      // Reload profile data
      setProfileData(prev => prev ? { ...prev, ...data } : null)

    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Handle email form submission
  const onEmailSubmit = async (data: EmailFormData) => {
    toast({
      title: "Email Update",
      description: "Email updates require re-authentication with Google. This feature will be available soon.",
      variant: "default",
    })
  }

  if (status === "loading" || isLoading) {
    return <AccountSkeleton />
  }

  if (status === "unauthenticated") {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-primary">
            <Home className="h-4 w-4" />
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground font-medium">Account</span>
        </nav>

        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Account Management
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Manage your profile information, account settings, and preferences for the Massachusetts Retirement System.
          </p>
        </div>

        {/* Account Overview Card */}
        <Card className="mb-8 border-primary/20 bg-gradient-to-r from-primary/5 to-blue-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">
                    {session?.user?.name || "User"}
                  </h2>
                  <p className="text-gray-600">{session?.user?.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary">
                      Group {profileData?.retirementGroup || "1"}
                    </Badge>
                    <Badge variant="outline">
                      {profileData?.yearsOfService || 0} years of service
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Subscription Status</p>
                <div className="flex items-center gap-2">
                  {isPremium ? (
                    <>
                      <Crown className="h-4 w-4 text-amber-600" />
                      <span className="text-amber-600 font-medium">Premium</span>
                    </>
                  ) : (
                    <>
                      <User className="h-4 w-4 text-blue-600" />
                      <span className="text-blue-600 font-medium">Free</span>
                    </>
                  )}
                </div>
                {isPremium && (
                  <Link
                    href="/subscription/portal"
                    className="text-xs text-gray-500 hover:text-primary underline mt-1 block"
                  >
                    Manage subscription
                  </Link>
                )}
                {!isPremium && (
                  <Link
                    href="/pricing"
                    className="text-xs text-gray-500 hover:text-primary underline mt-1 block"
                  >
                    Upgrade to Premium
                  </Link>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 h-auto p-1">
            <TabsTrigger value="profile" className="flex flex-col items-center p-3">
              <User className="h-4 w-4 mb-1" />
              <span className="text-xs">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="subscription" className="flex flex-col items-center p-3">
              <Crown className="h-4 w-4 mb-1" />
              <span className="text-xs">Subscription</span>
            </TabsTrigger>
            <TabsTrigger value="email" className="flex flex-col items-center p-3">
              <Mail className="h-4 w-4 mb-1" />
              <span className="text-xs">Email</span>
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex flex-col items-center p-3">
              <Shield className="h-4 w-4 mb-1" />
              <span className="text-xs">Privacy</span>
            </TabsTrigger>
            <TabsTrigger value="data" className="flex flex-col items-center p-3">
              <Download className="h-4 w-4 mb-1" />
              <span className="text-xs">Data</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...profileForm}>
                  <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Personal Information */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                          Personal Information
                        </h3>

                        <FormField
                          control={profileForm.control}
                          name="fullName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Full Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter your full name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={profileForm.control}
                          name="dateOfBirth"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Date of Birth</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={profileForm.control}
                          name="membershipDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>MSERS Membership Date</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormDescription>
                                The date you became a member of the Massachusetts State Retirement System
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={profileForm.control}
                          name="retirementDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Planned Retirement Date (Optional)</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormDescription>
                                Your target retirement date for planning purposes
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Employment Information */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                          Employment Information
                        </h3>

                        <FormField
                          control={profileForm.control}
                          name="retirementGroup"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Retirement Group</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select your retirement group" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="1">Group 1 - General Employees</SelectItem>
                                  <SelectItem value="2">Group 2 - Certain Public Safety</SelectItem>
                                  <SelectItem value="3">Group 3 - State Police</SelectItem>
                                  <SelectItem value="4">Group 4 - Public Safety/Corrections</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormDescription>
                                Your retirement group determines benefit calculations
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={profileForm.control}
                          name="currentSalary"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Current Annual Salary</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="Enter your current salary"
                                  {...field}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={profileForm.control}
                          name="yearsOfService"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Years of Service</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="Enter your years of service"
                                  {...field}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                />
                              </FormControl>
                              <FormDescription>
                                Total creditable service years with Massachusetts
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={profileForm.control}
                          name="retirementOption"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Preferred Retirement Option</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select retirement option" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="A">Option A - Maximum Benefit (No Survivor)</SelectItem>
                                  <SelectItem value="B">Option B - 100% Survivor Benefit</SelectItem>
                                  <SelectItem value="C">Option C - 66⅔% Survivor Benefit</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormDescription>
                                This affects your monthly benefit and survivor benefits
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* Form Actions */}
                    <div className="flex items-center justify-between pt-6 border-t">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          profileForm.reset()
                          toast({
                            title: "Changes Discarded",
                            description: "All unsaved changes have been discarded.",
                          })
                        }}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>

                      <Button type="submit" disabled={isSaving}>
                        {isSaving ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Save Changes
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Subscription Tab */}
          <TabsContent value="subscription" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-amber-600" />
                  Subscription Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Current Status */}
                  <div className="p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-amber-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {isPremium ? (
                          <Crown className="h-8 w-8 text-amber-600" />
                        ) : (
                          <User className="h-8 w-8 text-blue-600" />
                        )}
                        <div>
                          <h3 className="text-lg font-semibold">
                            {isPremium ? 'Premium Account' : 'Free Account'}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {isPremium
                              ? 'You have access to all premium features'
                              : 'Upgrade to unlock premium features'
                            }
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={isPremium ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'}>
                          {isPremium ? 'Premium' : 'Free'}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    {isPremium ? (
                      <>
                        <Button asChild>
                          <Link href="/subscription/portal">
                            <CreditCard className="h-4 w-4 mr-2" />
                            Manage Subscription
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            refreshStatus()
                            toast({
                              title: "Status Refreshed",
                              description: "Your subscription status has been updated.",
                            })
                          }}
                        >
                          Refresh Status
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button asChild>
                          <Link href="/pricing">
                            <Crown className="h-4 w-4 mr-2" />
                            Upgrade to Premium
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            refreshStatus()
                            toast({
                              title: "Status Refreshed",
                              description: "Your subscription status has been updated.",
                            })
                          }}
                        >
                          Refresh Status
                        </Button>
                      </>
                    )}
                  </div>

                  {/* Feature Comparison */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Feature Access</h4>
                    <div className="grid gap-3">
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">Basic Pension Calculator</p>
                          <p className="text-sm text-gray-600">Calculate your retirement benefits</p>
                        </div>
                        <Badge variant="secondary">Included</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">Social Security Integration</p>
                          <p className="text-sm text-gray-600">Combined retirement planning</p>
                        </div>
                        <Badge className={isPremium ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                          {isPremium ? 'Included' : 'Premium Only'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">Unlimited Saved Calculations</p>
                          <p className="text-sm text-gray-600">Save and compare scenarios</p>
                        </div>
                        <Badge className={isPremium ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                          {isPremium ? 'Unlimited' : 'Limited to 3'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">Advanced Planning Tools</p>
                          <p className="text-sm text-gray-600">Comprehensive retirement wizard</p>
                        </div>
                        <Badge className={isPremium ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                          {isPremium ? 'Included' : 'Premium Only'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Email Tab */}
          <TabsContent value="email" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-primary" />
                  Email Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-blue-900 mb-1">Google OAuth Authentication</h4>
                        <p className="text-sm text-blue-800">
                          Your email is managed through Google OAuth. To change your email address,
                          you'll need to update it in your Google account or link a different Google account.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="current-email">Current Email Address</Label>
                      <div className="mt-1 p-3 bg-gray-50 border rounded-md">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-900">{session?.user?.email}</span>
                          <Badge variant="secondary">Verified</Badge>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-900">Email Preferences</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">Retirement Reminders</p>
                            <p className="text-sm text-gray-600">Get notified about important retirement dates</p>
                          </div>
                          <Badge variant="outline">Coming Soon</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">System Updates</p>
                            <p className="text-sm text-gray-600">Receive updates about system changes</p>
                          </div>
                          <Badge variant="outline">Coming Soon</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Tab */}
          <TabsContent value="privacy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Privacy & Security
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Account Security</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">Two-Factor Authentication</p>
                          <p className="text-sm text-gray-600">Managed through your Google account</p>
                        </div>
                        <Badge variant="secondary">Google Managed</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">Login Sessions</p>
                          <p className="text-sm text-gray-600">View and manage active sessions</p>
                        </div>
                        <Badge variant="outline">Coming Soon</Badge>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Data Privacy</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">Profile Visibility</p>
                          <p className="text-sm text-gray-600">Your profile is private and only visible to you</p>
                        </div>
                        <Badge variant="secondary">Private</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">Data Sharing</p>
                          <p className="text-sm text-gray-600">We do not share your personal data with third parties</p>
                        </div>
                        <Badge variant="secondary">Protected</Badge>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900 text-red-600">Danger Zone</h4>
                    <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                      <div className="space-y-3">
                        <div>
                          <h5 className="font-medium text-red-900">Delete Account</h5>
                          <p className="text-sm text-red-800">
                            Permanently delete your account and all associated data. This action cannot be undone.
                          </p>
                        </div>
                        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Account
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete your account
                                and remove all your data from our servers, including:
                                <ul className="list-disc list-inside mt-2 space-y-1">
                                  <li>Profile information</li>
                                  <li>Saved calculations</li>
                                  <li>Account preferences</li>
                                </ul>
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-red-600 hover:bg-red-700"
                                onClick={() => {
                                  toast({
                                    title: "Account Deletion",
                                    description: "Account deletion feature will be available soon. Please contact support for assistance.",
                                    variant: "default",
                                  })
                                  setShowDeleteDialog(false)
                                }}
                              >
                                Delete Account
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Data Tab */}
          <TabsContent value="data" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5 text-primary" />
                  Data Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Export Your Data</h4>
                    <p className="text-sm text-gray-600">
                      Download a copy of your personal data and calculation history.
                    </p>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">Profile Data</p>
                          <p className="text-sm text-gray-600">Personal information and retirement profile</p>
                        </div>
                        <Button variant="outline" size="sm" disabled>
                          <Download className="h-4 w-4 mr-2" />
                          Export JSON
                        </Button>
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">Calculation History</p>
                          <p className="text-sm text-gray-600">All saved pension calculations</p>
                        </div>
                        <Button variant="outline" size="sm" disabled>
                          <Download className="h-4 w-4 mr-2" />
                          Export CSV
                        </Button>
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">Complete Data Package</p>
                          <p className="text-sm text-gray-600">All your data in a single archive</p>
                        </div>
                        <Button variant="outline" size="sm" disabled>
                          <Download className="h-4 w-4 mr-2" />
                          Export ZIP
                        </Button>
                      </div>
                    </div>
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <p className="text-sm text-amber-800">
                        <strong>Note:</strong> Data export functionality is coming soon.
                        You'll be able to download your data in various formats.
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Account Activity</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">Last Login</p>
                          <p className="text-sm text-gray-600">Track your recent account access</p>
                        </div>
                        <Badge variant="outline">Coming Soon</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">Profile Changes</p>
                          <p className="text-sm text-gray-600">History of profile modifications</p>
                        </div>
                        <Badge variant="outline">Coming Soon</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">Calculation History</p>
                          <p className="text-sm text-gray-600">View all your pension calculations</p>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <Link href="/calculator">
                            <Eye className="h-4 w-4 mr-2" />
                            View Calculator
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

// Loading skeleton component
function AccountSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Breadcrumb skeleton */}
        <div className="flex items-center space-x-2 mb-6">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-20" />
        </div>

        {/* Header skeleton */}
        <div className="text-center mb-8">
          <Skeleton className="h-10 w-80 mx-auto mb-4" />
          <Skeleton className="h-6 w-96 mx-auto" />
        </div>

        {/* Overview card skeleton */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Skeleton className="w-16 h-16 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-64" />
                  <div className="flex gap-2">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-24" />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-5 w-16" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs skeleton */}
        <div className="space-y-6">
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>

          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  ))}
                </div>
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-between pt-6">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-32" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
