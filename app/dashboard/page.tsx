"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Metadata } from "next"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { SavedCalculations } from "@/components/dashboard/saved-calculations"
import { RetirementDataProvider, useRetirementDataContext } from "@/contexts/retirement-data-context"
import { useSubscriptionStatus } from "@/hooks/use-subscription"
import { formatDate, formatCurrency, parseDate } from "@/lib/utils"
import { RetirementCountdown } from "@/components/countdown/retirement-countdown"
import { CalculationsDebug } from "@/components/debug/calculations-debug"
import {
  User,
  Calendar,
  DollarSign,
  TrendingUp,
  Clock,
  Target,
  AlertCircle,
  RefreshCw,
  Crown,
  CheckCircle,
  Zap,
  Calculator
} from "lucide-react"
import { BannerAd, PremiumAlternative } from "@/components/ads/adsense"
import { RetirementChart } from "@/components/dashboard/retirement-chart"

interface UserProfile {
  fullName?: string
  retirementDate?: string
  email?: string
}

interface PensionProjection {
  currentAge: number
  retirementAge: number
  currentPension: number
  projectedPension: number
  yearsOfService: number
  maxBenefit: number
}

interface CalculationStats {
  totalCalculations: number
  lastCalculationDate?: string
  retirementReadiness: 'on-track' | 'needs-attention' | 'excellent'
}

function DashboardContent() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { isPremium } = useSubscriptionStatus()
  const { calculations, loading: calculationsLoading, fetchCalculations } = useRetirementDataContext()
  
  const [userProfile, setUserProfile] = useState<UserProfile>({})
  const [profileLoading, setProfileLoading] = useState(true)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("overview")

  // Redirect to signin if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  // Fetch user profile data
  useEffect(() => {
    const fetchProfile = async () => {
      if (!session?.user?.id) return

      try {
        setProfileLoading(true)
        const response = await fetch('/api/profile')

        if (!response.ok) {
          throw new Error('Failed to fetch profile')
        }

        const data = await response.json()
        setUserProfile(data)
      } catch (error) {
        console.error('Error fetching profile:', error)
        setProfileError('Failed to load profile data')
      } finally {
        setProfileLoading(false)
      }
    }

    if (session?.user?.id) {
      fetchProfile()
    }
  }, [session?.user?.id]) // Only depend on user ID to prevent excessive re-renders

  // Handle URL tab parameter
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const tab = urlParams.get('tab')
    if (tab && ['overview', 'calculations', 'profile'].includes(tab)) {
      setActiveTab(tab)
    }
  }, [])

  // Loading state
  if (status === "loading" || profileLoading) {
    return <DashboardSkeleton />
  }

  // Not authenticated
  if (status === "unauthenticated") {
    return null // Will redirect
  }

  // Calculate dashboard metrics
  const latestCalculation = calculations?.[0]
  const hasCalculations = calculations && calculations.length > 0

  // Debug calculations state
  console.log("Dashboard: calculations state:", {
    calculations: calculations,
    calculationsLength: calculations?.length,
    hasCalculations: hasCalculations,
    calculationsLoading: calculationsLoading,
    sessionStatus: status,
    sessionUser: session?.user?.email
  })
  
  // Mock pension projection data (replace with real data from API)
  const pensionProjection: PensionProjection = {
    currentAge: 45,
    retirementAge: 65,
    currentPension: 45000,
    projectedPension: latestCalculation?.monthlyBenefit ? latestCalculation.monthlyBenefit * 12 : 72000,
    yearsOfService: 20,
    maxBenefit: 90000
  }

  const calculationStats: CalculationStats = {
    totalCalculations: calculations?.length || 0,
    lastCalculationDate: latestCalculation?.createdAt,
    retirementReadiness: hasCalculations ? 'on-track' : 'needs-attention'
  }

  // Robust retirement date calculation with multiple fallback strategies
  const getRetirementDate = (): Date | null => {
    try {
      // Priority 1: Use user-selected planned retirement date if available and valid
      if (userProfile.retirementDate) {
        const plannedDate = parseDate(userProfile.retirementDate)
        if (plannedDate && plannedDate > new Date()) {
          return plannedDate
        }
      }

      // Priority 2: Calculate based on latest calculation data if available
      if (latestCalculation?.retirementDate) {
        const calculatedDate = parseDate(latestCalculation.retirementDate)
        if (calculatedDate && calculatedDate > new Date()) {
          return calculatedDate
        }
      }

      // Priority 3: Default fallback - 5 years from current date
      const defaultDate = new Date()
      defaultDate.setFullYear(defaultDate.getFullYear() + 5)
      return defaultDate
    } catch (error) {
      console.warn('Error calculating retirement date:', error)
      // Emergency fallback
      const fallbackDate = new Date()
      fallbackDate.setFullYear(fallbackDate.getFullYear() + 5)
      return fallbackDate
    }
  }

  const retirementDate = getRetirementDate()
  const daysUntilRetirement = retirementDate
    ? Math.ceil((retirementDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null

  const handleRefresh = async () => {
    await fetchCalculations()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
        <style jsx>{`
          .dashboard-card {
            overflow: hidden;
          }
          .dashboard-card * {
            word-wrap: break-word;
            overflow-wrap: break-word;
          }
          .text-truncate-2 {
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
        `}</style>
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome back, {userProfile.fullName || session?.user?.name || 'User'}
              </h1>
              <p className="text-gray-600">
                Your Massachusetts retirement planning dashboard
              </p>
            </div>
            
            {isPremium && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-amber-100 to-yellow-100 border border-amber-200 rounded-full">
                <Crown className="h-4 w-4 text-amber-600" />
                <span className="text-sm font-medium text-amber-700">Premium Member</span>
              </div>
            )}
          </div>
        </div>

        {/* Primary Stats Section - Simplified 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Main Retirement Info Card */}
          <Card className="bg-white/90 backdrop-blur-sm border-blue-200 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                Retirement Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Target Retirement Date</p>
                  <p className="text-xl font-bold text-gray-900 truncate">
                    {userProfile.retirementDate ? formatDate(userProfile.retirementDate) : 'Not set'}
                  </p>
                  {daysUntilRetirement && (
                    <p className="text-sm text-gray-600 mt-1 truncate">
                      {daysUntilRetirement > 0 ? `${daysUntilRetirement} days to go` : 'Retirement eligible'}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Readiness Status</p>
                  <div className="flex items-center gap-2">
                    {calculationStats.retirementReadiness === 'excellent' && (
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    )}
                    {calculationStats.retirementReadiness === 'on-track' && (
                      <Clock className="h-5 w-5 text-blue-500 flex-shrink-0" />
                    )}
                    {calculationStats.retirementReadiness === 'needs-attention' && (
                      <AlertCircle className="h-5 w-5 text-orange-500 flex-shrink-0" />
                    )}
                    <span className="text-lg font-semibold text-gray-900 capitalize truncate">
                      {calculationStats.retirementReadiness.replace('-', ' ')}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Financial Projections Card */}
          <Card className="bg-white/90 backdrop-blur-sm border-green-200 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
                Financial Projections
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Monthly Pension</p>
                  <p className="text-2xl font-bold text-gray-900 truncate">
                    {formatCurrency(pensionProjection.projectedPension / 12)}
                  </p>
                  <p className="text-sm text-gray-600 mt-1 truncate">
                    Based on latest calculation
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Total Calculations</p>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-purple-500 flex-shrink-0" />
                    <span className="text-2xl font-bold text-gray-900">
                      {calculationStats.totalCalculations}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1 truncate">
                    {calculationStats.lastCalculationDate
                      ? `Last: ${formatDate(calculationStats.lastCalculationDate)}`
                      : 'No calculations yet'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Error Display */}
        {profileError && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {profileError}
              <Button
                variant="outline"
                size="sm"
                className="ml-2"
                onClick={handleRefresh}
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Main Dashboard Content - Simplified Layout */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <TabsList className="grid grid-cols-3 w-full sm:w-auto h-auto">
              <TabsTrigger value="overview" className="px-4 sm:px-6 py-3 text-sm sm:text-base min-h-[44px]">Overview</TabsTrigger>
              <TabsTrigger value="calculations" className="px-4 sm:px-6 py-3 text-sm sm:text-base min-h-[44px]">
                <span className="hidden sm:inline">Calculations</span>
                <span className="sm:hidden">Calc</span>
              </TabsTrigger>
              <TabsTrigger value="profile" className="px-4 sm:px-6 py-3 text-sm sm:text-base min-h-[44px]">Profile</TabsTrigger>
            </TabsList>

            {/* Quick Refresh Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={calculationsLoading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${calculationsLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          <TabsContent value="overview" className="space-y-8">
            {/* Retirement Countdown - Full Width Feature */}
            <RetirementCountdown
              retirementDate={retirementDate}
              className="mb-8"
            />

            {/* Retirement Benefit Projection Chart - Full Width Feature */}
            <div className="mb-8">
              <RetirementChart />
            </div>

            {/* Two-Column Layout for Better Organization */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              {/* Quick Actions - Now More Compact */}
              <div className="xl:col-span-1">
                <Card className="bg-white/90 backdrop-blur-sm shadow-lg h-fit">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Zap className="h-5 w-5 text-blue-600" />
                      </div>
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button
                      onClick={() => router.push('/wizard')}
                      className="w-full justify-start h-12 text-left"
                      size="lg"
                    >
                      <div className="flex items-center gap-3 w-full">
                        <Target className="h-5 w-5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">New Analysis</p>
                          <p className="text-xs opacity-90 truncate">Complete retirement plan</p>
                        </div>
                      </div>
                    </Button>

                    <Button
                      onClick={() => router.push('/calculator')}
                      variant="outline"
                      className="w-full justify-start h-12 text-left"
                      size="lg"
                    >
                      <div className="flex items-center gap-3 w-full">
                        <Calculator className="h-5 w-5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">Quick Calculator</p>
                          <p className="text-xs text-gray-600 truncate">Basic pension estimate</p>
                        </div>
                      </div>
                    </Button>

                    {!isPremium && (
                      <Button
                        onClick={() => router.push('/pricing')}
                        variant="outline"
                        className="w-full justify-start h-12 text-left border-amber-200 hover:bg-amber-50"
                        size="lg"
                      >
                        <div className="flex items-center gap-3 w-full">
                          <Crown className="h-5 w-5 flex-shrink-0 text-amber-600" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">Upgrade to Premium</p>
                            <p className="text-xs text-gray-600 truncate">Unlock advanced features</p>
                          </div>
                        </div>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Main Content Area - More Space */}
              <div className="xl:col-span-2 space-y-6">
                {hasCalculations ? (
                  <SavedCalculations />
                ) : (
                  <Card className="bg-white/90 backdrop-blur-sm shadow-lg">
                    <CardHeader className="pb-6">
                      <CardTitle className="text-xl font-semibold text-gray-900">Get Started with Your Retirement Planning</CardTitle>
                      <CardDescription className="text-base">
                        Create your first calculation to see personalized retirement projections and start planning your future.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-12">
                        <div className="p-4 bg-blue-50 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                          <Target className="h-10 w-10 text-blue-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">
                          Ready to Plan Your Retirement?
                        </h3>
                        <p className="text-gray-600 mb-8 max-w-md mx-auto">
                          Our comprehensive analysis will help you understand your Massachusetts pension benefits and plan for a secure retirement.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                          <Button onClick={() => router.push('/wizard')} size="lg" className="px-8">
                            <Target className="mr-2 h-5 w-5" />
                            Start Retirement Analysis
                          </Button>
                          <Button onClick={() => router.push('/calculator')} variant="outline" size="lg" className="px-8">
                            <Calculator className="mr-2 h-5 w-5" />
                            Quick Calculator
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            {/* AdSense Ad for Free Users */}
            {!isPremium && (
              <div className="mt-8">
                <BannerAd className="flex justify-center" />
              </div>
            )}

            {/* Premium Alternative for Premium Users */}
            {isPremium && (
              <div className="mt-8">
                <PremiumAlternative />
              </div>
            )}
          </TabsContent>

          <TabsContent value="calculations" className="space-y-8">
            <SavedCalculations />
          </TabsContent>

          <TabsContent value="profile" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Account Information */}
              <Card className="bg-white/90 backdrop-blur-sm shadow-lg">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    Account Information
                  </CardTitle>
                  <CardDescription>
                    Your personal account details and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600 block mb-1">Full Name</label>
                      <p className="text-base font-medium text-gray-900 truncate">
                        {userProfile.fullName || 'Not set'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 block mb-1">Email Address</label>
                      <p className="text-base font-medium text-gray-900 truncate">
                        {session?.user?.email}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 block mb-1">Planned Retirement Date</label>
                      <p className="text-base font-medium text-gray-900 truncate">
                        {userProfile.retirementDate ? formatDate(userProfile.retirementDate) : 'Not set'}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <Button
                      onClick={() => router.push('/profile')}
                      variant="outline"
                      className="w-full sm:w-auto"
                    >
                      <User className="mr-2 h-4 w-4" />
                      Edit Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Subscription & Features */}
              <Card className="bg-white/90 backdrop-blur-sm shadow-lg">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-3">
                    <div className="p-2 bg-amber-100 rounded-lg">
                      <Crown className="h-5 w-5 text-amber-600" />
                    </div>
                    Subscription & Features
                  </CardTitle>
                  <CardDescription>
                    Manage your subscription and access premium features
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600 block mb-1">Current Plan</label>
                      <div className="flex items-center gap-2">
                        {isPremium ? (
                          <>
                            <Crown className="h-5 w-5 text-amber-500 flex-shrink-0" />
                            <span className="text-base font-medium text-gray-900">Premium</span>
                          </>
                        ) : (
                          <>
                            <User className="h-5 w-5 text-gray-500 flex-shrink-0" />
                            <span className="text-base font-medium text-gray-900">Free</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-600 block mb-2">Available Features</label>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <span className="text-gray-700">Basic pension calculator</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <span className="text-gray-700">Save up to 3 calculations</span>
                        </div>
                        {isPremium && (
                          <>
                            <div className="flex items-center gap-2 text-sm">
                              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                              <span className="text-gray-700">Unlimited calculations</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                              <span className="text-gray-700">Advanced analytics</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                              <span className="text-gray-700">PDF reports</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    {isPremium ? (
                      <Button
                        onClick={() => router.push('/billing')}
                        variant="outline"
                        className="w-full sm:w-auto"
                      >
                        <Crown className="mr-2 h-4 w-4" />
                        Manage Subscription
                      </Button>
                    ) : (
                      <Button
                        onClick={() => router.push('/pricing')}
                        className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                      >
                        <Crown className="mr-2 h-4 w-4" />
                        Upgrade to Premium
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

// Loading skeleton component
function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
        {/* Header Skeleton */}
        <div className="mb-8">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>

        {/* Primary Stats Skeleton - 2 Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {Array.from({ length: 2 }).map((_, i) => (
            <Card key={i} className="bg-white/90 shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-9 w-9 rounded-lg" />
                  <Skeleton className="h-6 w-32" />
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-6 w-32 mb-1" />
                    <Skeleton className="h-3 w-28" />
                  </div>
                  <div>
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-6 w-32 mb-1" />
                    <Skeleton className="h-3 w-28" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs Skeleton */}
        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <Skeleton className="h-10 w-72" />
            <Skeleton className="h-9 w-24" />
          </div>

          {/* Content Skeleton */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <Skeleton className="h-80" />
            <div className="xl:col-span-2">
              <Skeleton className="h-96" />
            </div>
          </div>
        </div>
      </div>
      <CalculationsDebug />
    </div>
  )
}

export default function DashboardPage() {
  return (
    <RetirementDataProvider>
      <DashboardContent />
    </RetirementDataProvider>
  )
}
