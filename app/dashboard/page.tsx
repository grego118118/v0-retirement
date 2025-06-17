"use client"

import { Suspense, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SavedCalculations } from "@/components/dashboard/saved-calculations"
import { RetirementCountdown } from "@/components/countdown/retirement-countdown"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { HealthcareBenefits } from "@/components/dashboard/healthcare-benefits"

import {
  calculateQuickPensionEstimate,
  calculateCurrentAge,
  calculateYearsOfService as calculateStandardizedYearsOfService,
  formatPensionCurrency,
  type RetirementGroup
} from "@/lib/standardized-pension-calculator"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, Printer, Crown, DollarSign, Calculator, ArrowRight, Lock, RefreshCw, CheckCircle, Calendar, Shield, AlertCircle, User } from "lucide-react"
import { useSubscriptionStatus } from "@/hooks/use-subscription"
import { useRetirementData } from "@/hooks/use-retirement-data"
import { useProfile } from "@/contexts/profile-context"
import { formatCurrency } from "@/lib/utils"
import Link from "next/link"

export default function DashboardPage() {
  const router = useRouter()
  const { isPremium, subscriptionStatus } = useSubscriptionStatus()
  const { profile, loading: profileLoading } = useProfile()
  const { calculations, fetchCalculations, loading: calculationsLoading } = useRetirementData()

  const loading = profileLoading || calculationsLoading

  useEffect(() => {
    // Fetch calculations on component mount
    const loadData = async () => {
      try {
        await fetchCalculations()
      } catch (error) {
        console.error('Error loading dashboard data:', error)
      }
    }

    loadData()
  }, [fetchCalculations])

  // Calculate retirement date based on profile
  const getRetirementDate = () => {
    // Priority 1: Use user-selected planned retirement date if available
    if (profile?.retirementDate) {
      // Always use the profile retirement date if it exists
      // Parse the date string as YYYY-MM-DD format
      const plannedDate = new Date(profile.retirementDate + 'T00:00:00')
      // Validate that the date is in the future
      if (plannedDate > new Date()) {
        return plannedDate
      }
    }

    // Priority 2: Calculate based on profile data if available
    if (profile?.dateOfBirth && profile?.plannedRetirementAge) {
      const birthDate = new Date(profile.dateOfBirth)
      const retirementYear = birthDate.getFullYear() + profile.plannedRetirementAge
      const retirementDate = new Date(retirementYear, 0, 1) // January 1st of retirement year
      return retirementDate
    }

    // Priority 3: Calculate based on years of service if available
    if (profile?.dateOfBirth && profile?.yearsOfService) {
      const birthDate = new Date(profile.dateOfBirth)
      const currentDate = new Date()
      const currentAge = currentDate.getFullYear() - birthDate.getFullYear()

      // Calculate retirement eligibility (simplified)
      const retirementAge = Math.max(55, 65 - profile.yearsOfService)
      const yearsToRetirement = Math.max(0, retirementAge - currentAge)

      const retirementDate = new Date()
      retirementDate.setFullYear(retirementDate.getFullYear() + yearsToRetirement)

      return retirementDate
    }

    // Priority 4: Default fallback if no profile data
    const defaultDate = new Date()
    defaultDate.setFullYear(defaultDate.getFullYear() + 5)
    return defaultDate
  }

  // Get latest calculation data for dashboard metrics
  const getLatestCalculation = () => {
    if (!calculations || calculations.length === 0) {
      // Return null for no calculations - we'll handle this in the UI
      return null
    }

    return calculations[0]
  }

  // Generate personalized action items based on user data
  const getPersonalizedActionItems = () => {
    const items = []

    if (!profile?.hasProfile) {
      items.push({
        title: 'Complete Your Profile',
        description: 'Add your employment details to get accurate calculations',
        priority: 'high',
        action: '/profile'
      })
    }

    if (!calculations || calculations.length === 0) {
      items.push({
        title: 'Run Your First Calculation',
        description: 'Calculate your pension benefits to see your retirement outlook',
        priority: 'high',
        action: '/calculator'
      })
    }

    if (profile?.currentSalary && profile?.yearsOfService && profile?.yearsOfService < 20) {
      items.push({
        title: 'Explore Service Purchase Options',
        description: 'Consider purchasing additional creditable service',
        priority: 'medium',
        action: '/service-purchase'
      })
    }

    if (calculations && calculations.length > 0 && !calculations[0]?.socialSecurityData) {
      items.push({
        title: 'Add Social Security Analysis',
        description: 'Include Social Security in your retirement planning',
        priority: 'medium',
        action: '/social-security'
      })
    }

    return items
  }



  const refreshData = async () => {
    await fetchCalculations()
  }

  const latestCalc = getLatestCalculation()

  return (
    <div className="min-h-screen mrs-page-wrapper" style={{ background: 'var(--mrs-gradient-hero)' }}>
      <div className="mrs-content-container py-6 lg:py-8 xl:py-12">
        {/* Enhanced Header with Professional Design */}
        <div className="mrs-fade-in flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 lg:gap-6 mb-8 lg:mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 lg:gap-4">
            <div>
              <h1 className="mrs-heading-1 text-2xl sm:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-bold tracking-tight">
                Your Retirement Dashboard
              </h1>
              <p className="mrs-body-large text-white/80 mt-1 lg:mt-2">
                Track your Massachusetts pension benefits and retirement planning progress
              </p>
            </div>
            <div className="mrs-badge-success flex items-center gap-2 px-4 py-2 rounded-full shadow-lg backdrop-blur-sm bg-white/10 border border-white/20">
              <Crown className="h-4 w-4 text-yellow-300" />
              <span className="text-white font-medium">Premium Access</span>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 lg:gap-3">
            <button
              onClick={refreshData}
              disabled={loading}
              className="mrs-btn-secondary"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Data</span>
            </button>

            <button className="mrs-btn-primary">
              <Download className="mr-2 h-4 w-4" />
              <span>Export Report</span>
            </button>
          </div>
        </div>

        {/* Retirement Countdown */}
        <div className="mb-8">
          <Suspense fallback={
            <Card className="h-64">
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="h-16 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          }>
            <RetirementCountdown retirementDate={getRetirementDate()} />
          </Suspense>
        </div>

        {/* Enhanced Key Metrics Cards - Horizontal Stacking */}
        <div className="flex flex-col sm:flex-row gap-4 lg:gap-6 xl:gap-8 mb-8 lg:mb-12">
          {(() => {
            // Calculate standardized pension estimate for dashboard cards
            let pensionEstimate = null
            let dataSource = 'No data'

            if (profile?.dateOfBirth && profile?.currentSalary) {
              const currentAge = calculateCurrentAge(profile.dateOfBirth)

              // Prioritize saved yearsOfService over calculated value
              const yearsOfService = profile.yearsOfService ||
                (profile.membershipDate ? calculateStandardizedYearsOfService(profile.membershipDate) : 0)

              pensionEstimate = calculateQuickPensionEstimate(
                currentAge,
                yearsOfService,
                profile.averageHighest3Years || profile.currentSalary,
                (profile.retirementGroup as RetirementGroup) || 'Group 1',
                profile.plannedRetirementAge || 65,
                profile.membershipDate
              )
              dataSource = 'Profile estimate'
            } else if (latestCalc) {
              pensionEstimate = {
                annualPension: latestCalc.annualBenefit,
                monthlyPension: latestCalc.monthlyBenefit,
                benefitPercentage: latestCalc.benefitPercentage || 0
              }
              dataSource = 'Latest calculation'
            }

            return (
              <>
                <div className="mrs-card mrs-slide-up flex-1 min-w-0 min-h-[140px] lg:min-h-[160px] xl:min-h-[180px]" style={{ background: 'var(--mrs-gradient-surface)' }}>
                  <div className="p-4 lg:p-6 xl:p-8">
                    {/* Horizontal Layout: Icon beside text */}
                    <div className="flex items-start gap-3 lg:gap-4 xl:gap-6 mb-4">
                      <div className="p-3 rounded-xl shadow-lg flex-shrink-0" style={{ background: 'var(--mrs-gradient-accent)' }}>
                        <DollarSign className="h-5 w-5 lg:h-6 lg:w-6 xl:h-7 xl:w-7 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="mrs-heading-3 text-sm lg:text-base xl:text-lg mb-1">
                          Annual Pension
                        </h3>
                        <p className="mrs-body text-xs lg:text-sm opacity-70">
                          {dataSource}
                        </p>
                      </div>
                    </div>
                    <div className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold mb-1" style={{ color: 'var(--mrs-green-600)' }}>
                      {pensionEstimate ? formatPensionCurrency(pensionEstimate.annualPension) : '--'}
                    </div>
                    <div className="mrs-body text-xs lg:text-sm opacity-70">
                      {pensionEstimate ? 'per year' : 'Complete profile to see estimates'}
                    </div>
                  </div>
                </div>

                <div className="mrs-card mrs-slide-up flex-1 min-w-0 min-h-[140px] lg:min-h-[160px] xl:min-h-[180px]" style={{ background: 'var(--mrs-gradient-surface)' }}>
                  <div className="p-4 lg:p-6 xl:p-8">
                    {/* Horizontal Layout: Icon beside text */}
                    <div className="flex items-start gap-3 lg:gap-4 xl:gap-6 mb-4">
                      <div className="p-3 rounded-xl shadow-lg flex-shrink-0" style={{ background: 'var(--mrs-gradient-primary)' }}>
                        <Calendar className="h-5 w-5 lg:h-6 lg:w-6 xl:h-7 xl:w-7 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="mrs-heading-3 text-sm lg:text-base xl:text-lg mb-1">
                          Monthly Pension
                        </h3>
                        <p className="mrs-body text-xs lg:text-sm opacity-70">
                          {dataSource}
                        </p>
                      </div>
                    </div>
                    <div className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold mb-1" style={{ color: 'var(--mrs-blue-600)' }}>
                      {pensionEstimate ? formatPensionCurrency(pensionEstimate.monthlyPension) : '--'}
                    </div>
                    <div className="mrs-body text-xs lg:text-sm opacity-70">
                      {pensionEstimate ? 'per month' : 'Complete profile to see estimates'}
                    </div>
                  </div>
                </div>
              </>
            )
          })()}
        </div>

        {/* Comprehensive Healthcare Benefits */}
        <div className="mb-8 lg:mb-12">
          <Suspense fallback={
            <Card className="h-[600px] border-0 shadow-lg bg-gradient-to-br from-rose-50 via-pink-50/50 to-purple-50/30 dark:from-rose-950/20 dark:via-pink-950/20 dark:to-purple-950/20">
              <CardContent className="p-6 lg:p-8">
                <div className="animate-pulse space-y-4">
                  <div className="h-6 lg:h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="h-20 lg:h-24 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
                    ))}
                  </div>
                  <div className="h-40 lg:h-48 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
                </div>
              </CardContent>
            </Card>
          }>
            <HealthcareBenefits profile={profile || undefined} />
          </Suspense>
        </div>

        {/* Enhanced Main Layout Grid */}
        <div className="grid gap-6 lg:gap-8 xl:gap-10 2xl:gap-12 xl:grid-cols-12">
          {/* Quick Actions Sidebar */}
          <div className="xl:col-span-4">
            <Suspense fallback={
              <Card className="h-[600px] lg:h-[700px] xl:h-[800px]">
                <CardContent className="p-6 lg:p-8 xl:p-10">
                  <div className="animate-pulse space-y-4 lg:space-y-6">
                    <div className="h-6 lg:h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                    <div className="space-y-3 lg:space-y-4">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="h-16 lg:h-20 xl:h-24 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            }>
              <QuickActions
                hasCalculations={calculations && calculations.length > 0}
                latestCalculation={latestCalc}
                onRefresh={refreshData}
                isLoading={loading}
                pensionProjection={(() => {
                  if (!profile?.currentSalary || !profile?.dateOfBirth || !profile?.membershipDate) return undefined

                  const currentAge = calculateCurrentAge(profile.dateOfBirth)
                  const yearsOfService = calculateStandardizedYearsOfService(profile.membershipDate)
                  const retirementAge = profile.plannedRetirementAge || 65

                  // Prioritize saved yearsOfService over calculated value
                  const currentYearsOfService = profile.yearsOfService ||
                    (profile.membershipDate ? calculateStandardizedYearsOfService(profile.membershipDate) : 0)

                  // Current pension estimate
                  const currentPension = calculateQuickPensionEstimate(
                    currentAge,
                    currentYearsOfService,
                    profile.averageHighest3Years || profile.currentSalary,
                    (profile.retirementGroup as RetirementGroup) || 'Group 1',
                    currentAge, // Current age for current pension
                    profile.membershipDate
                  )

                  // Projected pension at retirement
                  const projectedYearsOfService = currentYearsOfService + (retirementAge - currentAge)
                  const projectedPension = calculateQuickPensionEstimate(
                    retirementAge,
                    projectedYearsOfService,
                    profile.averageHighest3Years || profile.currentSalary,
                    (profile.retirementGroup as RetirementGroup) || 'Group 1',
                    retirementAge,
                    profile.membershipDate
                  )

                  return {
                    currentAge,
                    retirementAge,
                    currentPension: currentPension.annualPension,
                    projectedPension: projectedPension.annualPension,
                    yearsOfService,
                    maxBenefit: Math.round((profile.averageHighest3Years || profile.currentSalary) * 0.8)
                  }
                })()}
                calculationStats={{
                  totalCalculations: calculations?.length || 0,
                  lastCalculationDate: calculations && calculations.length > 0 ? calculations[0].createdAt : undefined,
                  retirementReadiness: calculations && calculations.length > 0 ? 'on-track' : 'needs-attention'
                }}
              />
            </Suspense>
          </div>

          {/* Main Content */}
          <div className="xl:col-span-8 space-y-6 lg:space-y-8 xl:space-y-10">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-800/50">
              <CardHeader className="pb-4 lg:pb-6 xl:pb-8 px-4 lg:px-6 xl:px-8 pt-4 lg:pt-6 xl:pt-8">
                <CardTitle className="card-title flex items-center gap-2 lg:gap-3 text-lg sm:text-xl lg:text-2xl xl:text-3xl">
                  <div className="p-2 lg:p-3 xl:p-4 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md">
                    <Calculator className="h-5 w-5 lg:h-6 lg:w-6 xl:h-7 xl:w-7" />
                  </div>
                  Saved Calculations
                </CardTitle>
                <CardDescription className="card-description text-sm lg:text-base xl:text-lg leading-relaxed">
                  Your retirement analysis history and saved scenarios
                </CardDescription>
              </CardHeader>
              <CardContent className="px-4 lg:px-6 xl:px-8 pb-4 lg:pb-6 xl:pb-8">
                <Suspense fallback={
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="h-32 lg:h-40 xl:h-48 animate-pulse bg-slate-100 dark:bg-slate-800 rounded-lg"></div>
                    ))}
                  </div>
                }>
                  <SavedCalculations />
                </Suspense>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
