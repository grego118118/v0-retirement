"use client"

import { Suspense, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SavedCalculations } from "@/components/dashboard/saved-calculations"
import { RetirementChart } from "@/components/dashboard/retirement-chart"
import { RetirementCountdown } from "@/components/countdown/retirement-countdown"
import { IncomeVisualization } from "@/components/dashboard/income-visualization"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, Printer, Crown, DollarSign, TrendingUp, Calculator, ArrowRight, Lock, RefreshCw, CheckCircle, Calendar } from "lucide-react"
import { useSubscriptionStatus } from "@/hooks/use-subscription"
import { useRetirementData } from "@/hooks/use-retirement-data"
import { formatCurrency } from "@/lib/utils"
import Link from "next/link"

export default function DashboardPage() {
  const { isPremium, subscriptionStatus } = useSubscriptionStatus()
  const { profile, calculations, fetchProfile, fetchCalculations, loading } = useRetirementData()

  // Calculate retirement date from profile data
  const getRetirementDate = () => {
    // First, try to use the direct retirement date from profile
    if (profile?.retirementDate) {
      try {
        return new Date(profile.retirementDate)
      } catch (error) {
        console.error('Error parsing retirement date:', error)
      }
    }

    // Fallback: calculate from date of birth and planned retirement age
    if (profile?.dateOfBirth) {
      try {
        const birthDate = new Date(profile.dateOfBirth)
        // Use planned retirement age from profile, or default to 65
        const retirementAge = profile.plannedRetirementAge || 65
        const retirementDate = new Date(birthDate)
        retirementDate.setFullYear(birthDate.getFullYear() + retirementAge)

        return retirementDate
      } catch (error) {
        console.error('Error calculating retirement date from birth date:', error)
      }
    }

    return null
  }

  // Get latest calculation data for dashboard metrics
  const getLatestCalculation = () => {
    // Only log when calculations array changes, not on every render
    if (!calculations || calculations.length === 0) {
      // Return default values if no calculations exist
      return {
        monthlyBenefit: 4465,
        annualBenefit: 53580,
        retirementOption: 'A',
        socialSecurityData: null
      }
    }

    // Return the most recent calculation
    const latest = calculations[0]

    return {
      monthlyBenefit: latest.monthlyBenefit,
      annualBenefit: latest.annualBenefit,
      retirementOption: latest.retirementOption,
      socialSecurityData: latest.socialSecurityData
    }
  }

  const refreshData = async () => {
    await Promise.all([fetchProfile(), fetchCalculations()])
  }

  const latestCalc = getLatestCalculation()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Enhanced Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 lg:gap-6 mb-8 lg:mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 lg:gap-4">
            <div>
              <h1 className="dashboard-title text-2xl sm:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl 3xl:text-7xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                Your Retirement Dashboard
              </h1>
              <p className="dashboard-subtitle text-sm lg:text-base xl:text-lg text-muted-foreground mt-1 lg:mt-2 hidden sm:block">
                Massachusetts State Employee Retirement Planning
              </p>
            </div>
            {isPremium && (
              <Badge className="bg-gradient-to-r from-amber-400 to-amber-500 text-amber-900 border-0 shadow-md w-fit lg:px-4 lg:py-2">
                <Crown className="mr-1 h-3 w-3 lg:h-4 lg:w-4 xl:h-5 xl:w-5" />
                <span className="text-sm lg:text-base">Premium</span>
              </Badge>
            )}
          </div>
          <div className="flex flex-wrap gap-2 lg:gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={refreshData}
              disabled={loading}
              className="shadow-sm hover:shadow-md transition-all duration-200 lg:px-4 lg:py-2 xl:px-6 xl:py-3"
            >
              <RefreshCw className={`h-4 w-4 lg:h-5 lg:w-5 xl:h-6 xl:w-6 mr-2 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline button-text text-sm lg:text-base">Refresh</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="shadow-sm hover:shadow-md transition-all duration-200 lg:px-4 lg:py-2 xl:px-6 xl:py-3"
            >
              <Printer className="h-4 w-4 lg:h-5 lg:w-5 xl:h-6 xl:w-6 mr-2" />
              <span className="hidden sm:inline button-text text-sm lg:text-base">Print</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="shadow-sm hover:shadow-md transition-all duration-200 lg:px-4 lg:py-2 xl:px-6 xl:py-3"
            >
              <Download className="h-4 w-4 lg:h-5 lg:w-5 xl:h-6 xl:w-6 mr-2" />
              <span className="hidden sm:inline button-text text-sm lg:text-base">PDF</span>
            </Button>
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

        {/* Enhanced Key Metrics */}
        <div className="grid gap-4 sm:gap-6 lg:gap-8 xl:gap-10 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-8 lg:mb-12">
          <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-gradient-to-br from-white to-green-50/50 dark:from-slate-900 dark:to-green-950/20">
            <CardHeader className="pb-3 lg:pb-4 xl:pb-6 px-4 lg:px-6 xl:px-8 pt-4 lg:pt-6 xl:pt-8">
              <div className="flex items-center justify-between">
                <CardTitle className="card-title text-base lg:text-lg xl:text-xl 2xl:text-2xl font-semibold text-slate-700 dark:text-slate-300">
                  Annual Pension
                </CardTitle>
                <div className="p-2 lg:p-3 xl:p-4 rounded-lg bg-green-100 dark:bg-green-900/30 group-hover:scale-110 transition-transform duration-300">
                  <DollarSign className="h-4 w-4 lg:h-5 lg:w-5 xl:h-6 xl:w-6 2xl:h-7 2xl:w-7 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <CardDescription className="card-description text-xs lg:text-sm xl:text-base">Latest calculation</CardDescription>
            </CardHeader>
            <CardContent className="pt-0 px-4 lg:px-6 xl:px-8 pb-4 lg:pb-6 xl:pb-8">
              <div className="metric-value text-2xl sm:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-bold text-green-600 dark:text-green-400 mb-1 lg:mb-2">
                {formatCurrency(latestCalc.annualBenefit)}
              </div>
              <div className="metric-label text-xs lg:text-sm xl:text-base text-muted-foreground">per year</div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-gradient-to-br from-white to-blue-50/50 dark:from-slate-900 dark:to-blue-950/20">
            <CardHeader className="pb-3 lg:pb-4 xl:pb-6 px-4 lg:px-6 xl:px-8 pt-4 lg:pt-6 xl:pt-8">
              <div className="flex items-center justify-between">
                <CardTitle className="card-title text-base lg:text-lg xl:text-xl 2xl:text-2xl font-semibold text-slate-700 dark:text-slate-300">
                  Monthly Pension
                </CardTitle>
                <div className="p-2 lg:p-3 xl:p-4 rounded-lg bg-blue-100 dark:bg-blue-900/30 group-hover:scale-110 transition-transform duration-300">
                  <Calendar className="h-4 w-4 lg:h-5 lg:w-5 xl:h-6 xl:w-6 2xl:h-7 2xl:w-7 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <CardDescription className="card-description text-xs lg:text-sm xl:text-base">Latest calculation</CardDescription>
            </CardHeader>
            <CardContent className="pt-0 px-4 lg:px-6 xl:px-8 pb-4 lg:pb-6 xl:pb-8">
              <div className="metric-value text-2xl sm:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-bold text-blue-600 dark:text-blue-400 mb-1 lg:mb-2">
                {formatCurrency(latestCalc.monthlyBenefit)}
              </div>
              <div className="metric-label text-xs lg:text-sm xl:text-base text-muted-foreground">per month</div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-gradient-to-br from-white to-purple-50/50 dark:from-slate-900 dark:to-purple-950/20">
            <CardHeader className="pb-3 lg:pb-4 xl:pb-6 px-4 lg:px-6 xl:px-8 pt-4 lg:pt-6 xl:pt-8">
              <div className="flex items-center justify-between">
                <CardTitle className="card-title text-base lg:text-lg xl:text-xl 2xl:text-2xl font-semibold text-slate-700 dark:text-slate-300">
                  Retirement Option
                </CardTitle>
                <div className="p-2 lg:p-3 xl:p-4 rounded-lg bg-purple-100 dark:bg-purple-900/30 group-hover:scale-110 transition-transform duration-300">
                  <CheckCircle className="h-4 w-4 lg:h-5 lg:w-5 xl:h-6 xl:w-6 2xl:h-7 2xl:w-7 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <CardDescription className="card-description text-xs lg:text-sm xl:text-base">Selected plan</CardDescription>
            </CardHeader>
            <CardContent className="pt-0 px-4 lg:px-6 xl:px-8 pb-4 lg:pb-6 xl:pb-8">
              <div className="metric-value text-2xl sm:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-bold text-purple-600 dark:text-purple-400 mb-1 lg:mb-2">
                Option {latestCalc.retirementOption}
              </div>
              <div className="metric-label text-xs lg:text-sm xl:text-base text-muted-foreground">
                {latestCalc.retirementOption === 'A' && 'Maximum Benefit'}
                {latestCalc.retirementOption === 'B' && '100% Survivor'}
                {latestCalc.retirementOption === 'C' && '66.7% Survivor'}
                {latestCalc.retirementOption === 'D' && 'Pop-Up Option'}
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-gradient-to-br from-white to-amber-50/50 dark:from-slate-900 dark:to-amber-950/20">
            <CardHeader className="pb-3 lg:pb-4 xl:pb-6 px-4 lg:px-6 xl:px-8 pt-4 lg:pt-6 xl:pt-8">
              <div className="flex items-center justify-between">
                <CardTitle className="card-title text-base lg:text-lg xl:text-xl 2xl:text-2xl font-semibold text-slate-700 dark:text-slate-300">
                  Total Income
                </CardTitle>
                <div className="p-2 lg:p-3 xl:p-4 rounded-lg bg-amber-100 dark:bg-amber-900/30 group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="h-4 w-4 lg:h-5 lg:w-5 xl:h-6 xl:w-6 2xl:h-7 2xl:w-7 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
              <CardDescription className="card-description text-xs lg:text-sm xl:text-base">With Social Security</CardDescription>
            </CardHeader>
            <CardContent className="pt-0 px-4 lg:px-6 xl:px-8 pb-4 lg:pb-6 xl:pb-8">
              <div className="metric-value text-2xl sm:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-bold text-amber-600 dark:text-amber-400 mb-1 lg:mb-2">
                {formatCurrency(
                  latestCalc.monthlyBenefit +
                  (latestCalc.socialSecurityData?.selectedMonthlyBenefit || 2800)
                )}
              </div>
              <div className="metric-label text-xs lg:text-sm xl:text-base text-muted-foreground">per month</div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Social Security Integration */}
        {isPremium ? (
          <Card className="mb-8 lg:mb-12 border-0 shadow-lg bg-gradient-to-br from-blue-50 via-indigo-50/50 to-purple-50/30 dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-purple-950/20">
            <CardHeader className="pb-4 lg:pb-6 xl:pb-8 px-4 lg:px-6 xl:px-8 pt-4 lg:pt-6 xl:pt-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 lg:gap-4">
                <div>
                  <CardTitle className="card-title flex items-center gap-2 lg:gap-3 text-lg sm:text-xl lg:text-2xl xl:text-3xl">
                    <div className="p-2 lg:p-3 xl:p-4 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md">
                      <DollarSign className="h-5 w-5 lg:h-6 lg:w-6 xl:h-7 xl:w-7" />
                    </div>
                    Complete Retirement Income Analysis
                  </CardTitle>
                  <CardDescription className="card-description mt-2 lg:mt-3 text-sm lg:text-base xl:text-lg leading-relaxed">
                    {latestCalc.socialSecurityData?.selectedMonthlyBenefit
                      ? "Based on your saved combined calculation with actual Social Security benefits"
                      : "Combined Massachusetts pension and estimated Social Security benefits"
                    }
                  </CardDescription>
                </div>
                <div className="flex flex-wrap gap-2 lg:gap-3">
                  <Badge className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0 shadow-sm lg:px-4 lg:py-2">
                    <Crown className="mr-1 h-3 w-3 lg:h-4 lg:w-4" />
                    <span className="text-sm lg:text-base">Premium</span>
                  </Badge>
                  {latestCalc.socialSecurityData?.selectedMonthlyBenefit && (
                    <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 shadow-sm lg:px-4 lg:py-2">
                      <CheckCircle className="mr-1 h-3 w-3 lg:h-4 lg:w-4" />
                      <span className="text-sm lg:text-base">SS Data</span>
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 lg:space-y-8 xl:space-y-10 px-4 lg:px-6 xl:px-8 pb-4 lg:pb-6 xl:pb-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                <div className="group text-center p-4 sm:p-6 lg:p-8 xl:p-10 bg-white dark:bg-slate-900 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-blue-100 dark:border-blue-900/30">
                  <div className="p-3 lg:p-4 xl:p-5 rounded-lg bg-blue-100 dark:bg-blue-900/30 w-fit mx-auto mb-3 lg:mb-4 group-hover:scale-110 transition-transform duration-300">
                    <DollarSign className="h-5 w-5 lg:h-6 lg:w-6 xl:h-7 xl:w-7 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="text-sm lg:text-base xl:text-lg text-muted-foreground mb-2 lg:mb-3">MA State Pension</div>
                  <div className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl 2xl:text-5xl font-bold text-blue-600 dark:text-blue-400 mb-1 lg:mb-2">
                    {formatCurrency(latestCalc.monthlyBenefit)}
                  </div>
                  <div className="text-xs lg:text-sm xl:text-base text-muted-foreground">per month</div>
                </div>

                <div className="group text-center p-4 sm:p-6 lg:p-8 xl:p-10 bg-white dark:bg-slate-900 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-green-100 dark:border-green-900/30">
                  <div className="p-3 lg:p-4 xl:p-5 rounded-lg bg-green-100 dark:bg-green-900/30 w-fit mx-auto mb-3 lg:mb-4 group-hover:scale-110 transition-transform duration-300">
                    <CheckCircle className="h-5 w-5 lg:h-6 lg:w-6 xl:h-7 xl:w-7 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="text-sm lg:text-base xl:text-lg text-muted-foreground mb-2 lg:mb-3">Social Security</div>
                  <div className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl 2xl:text-5xl font-bold text-green-600 dark:text-green-400 mb-1 lg:mb-2">
                    {latestCalc.socialSecurityData?.selectedMonthlyBenefit
                      ? formatCurrency(latestCalc.socialSecurityData.selectedMonthlyBenefit)
                      : "$2,800"
                    }
                  </div>
                  <div className="text-xs lg:text-sm xl:text-base text-muted-foreground">
                    {latestCalc.socialSecurityData?.selectedMonthlyBenefit ? "calculated" : "estimated"} per month
                  </div>
                </div>

                <div className="group text-center p-4 sm:p-6 lg:p-8 xl:p-10 bg-gradient-to-br from-purple-500 to-indigo-600 text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 sm:col-span-2 lg:col-span-1">
                  <div className="p-3 lg:p-4 xl:p-5 rounded-lg bg-white/20 w-fit mx-auto mb-3 lg:mb-4 group-hover:scale-110 transition-transform duration-300">
                    <TrendingUp className="h-5 w-5 lg:h-6 lg:w-6 xl:h-7 xl:w-7" />
                  </div>
                  <div className="text-sm lg:text-base xl:text-lg opacity-90 mb-2 lg:mb-3">Total Monthly Income</div>
                  <div className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl 2xl:text-5xl font-bold mb-1 lg:mb-2">
                    {formatCurrency(
                      latestCalc.monthlyBenefit +
                      (latestCalc.socialSecurityData?.selectedMonthlyBenefit || 2800)
                    )}
                  </div>
                  <div className="text-xs lg:text-sm xl:text-base opacity-90">
                    {latestCalc.socialSecurityData?.replacementRatio
                      ? `${Math.round(latestCalc.socialSecurityData.replacementRatio * 100)}% replacement ratio`
                      : "85% replacement ratio"
                    }
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 lg:gap-4">
                <Button asChild className="flex-1 shadow-sm hover:shadow-md transition-all duration-200 lg:px-6 lg:py-3 xl:px-8 xl:py-4">
                  <Link href="/social-security">
                    <TrendingUp className="mr-2 h-4 w-4 lg:h-5 lg:w-5 xl:h-6 xl:w-6" />
                    <span className="button-text text-sm lg:text-base xl:text-lg">Optimize Social Security Strategy</span>
                  </Link>
                </Button>
                <Button variant="outline" asChild className="flex-1 shadow-sm hover:shadow-md transition-all duration-200 lg:px-6 lg:py-3 xl:px-8 xl:py-4">
                  <Link href="/calculator">
                    <Calculator className="mr-2 h-4 w-4 lg:h-5 lg:w-5 xl:h-6 xl:w-6" />
                    <span className="button-text text-sm lg:text-base xl:text-lg">Update Pension Calculation</span>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-8 border-2 border-dashed border-slate-300 dark:border-slate-600 bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900 dark:to-slate-800/50">
            <CardContent className="pt-6">
              <div className="text-center py-8 sm:py-12">
                <div className="p-4 rounded-full bg-slate-100 dark:bg-slate-800 w-fit mx-auto mb-6">
                  <Lock className="h-8 w-8 sm:h-12 sm:w-12 text-slate-400" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-3">Complete Retirement Income Analysis</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto text-sm sm:text-base leading-relaxed">
                  Combine your Massachusetts pension with Social Security benefits for comprehensive retirement planning.
                </p>
                <Button asChild size="lg" className="shadow-md hover:shadow-lg transition-all duration-200">
                  <Link href="/subscribe">
                    <Crown className="mr-2 h-4 w-4" />
                    Upgrade to Premium
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Enhanced Survivor Benefits */}
        {latestCalc.retirementOption === 'C' && (
          <Card className="mb-8 border-0 shadow-lg bg-gradient-to-br from-purple-50 via-violet-50/50 to-indigo-50/30 dark:from-purple-950/20 dark:via-violet-950/20 dark:to-indigo-950/20">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-violet-600 text-white shadow-md">
                  <CheckCircle className="h-5 w-5" />
                </div>
                Survivor Benefits (Option C)
              </CardTitle>
              <CardDescription className="text-sm leading-relaxed">
                Benefits for your beneficiary at 66.7% of your pension amount
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="group text-center p-4 sm:p-6 bg-white dark:bg-slate-900 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-purple-100 dark:border-purple-900/30">
                  <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/30 w-fit mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                    <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="text-sm text-muted-foreground mb-2">Annual Benefit</div>
                  <div className="text-xl sm:text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                    {formatCurrency(latestCalc.annualBenefit * 0.667)}
                  </div>
                  <div className="text-xs text-muted-foreground">per year</div>
                </div>

                <div className="group text-center p-4 sm:p-6 bg-white dark:bg-slate-900 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-purple-100 dark:border-purple-900/30">
                  <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/30 w-fit mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                    <DollarSign className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="text-sm text-muted-foreground mb-2">Monthly Benefit</div>
                  <div className="text-xl sm:text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                    {formatCurrency(latestCalc.monthlyBenefit * 0.667)}
                  </div>
                  <div className="text-xs text-muted-foreground">per month</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Enhanced Income Analysis */}
        {latestCalc && (
          <div className="mb-8">
            <Suspense fallback={
              <Card className="h-[500px]">
                <CardContent className="p-6">
                  <div className="animate-pulse space-y-4">
                    <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3"></div>
                    <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded"></div>
                  </div>
                </CardContent>
              </Card>
            }>
              <IncomeVisualization calculation={latestCalc} className="shadow-lg border-0" />
            </Suspense>
          </div>
        )}

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
                hasCalculations={calculations.length > 0}
                latestCalculation={latestCalc}
                onRefresh={refreshData}
                isLoading={loading}
              />
            </Suspense>
          </div>

          {/* Main Content */}
          <div className="xl:col-span-8 space-y-6 lg:space-y-8 xl:space-y-10">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-800/50">
              <CardHeader className="pb-4 lg:pb-6 xl:pb-8 px-4 lg:px-6 xl:px-8 pt-4 lg:pt-6 xl:pt-8">
                <CardTitle className="card-title flex items-center gap-2 lg:gap-3 text-lg sm:text-xl lg:text-2xl xl:text-3xl">
                  <div className="p-2 lg:p-3 xl:p-4 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md">
                    <TrendingUp className="h-5 w-5 lg:h-6 lg:w-6 xl:h-7 xl:w-7" />
                  </div>
                  Pension Growth Projection
                </CardTitle>
                <CardDescription className="card-description text-sm lg:text-base xl:text-lg leading-relaxed">
                  From age 55 up to 80% maximum benefit potential
                </CardDescription>
              </CardHeader>
              <CardContent className="px-4 lg:px-6 xl:px-8 pb-4 lg:pb-6 xl:pb-8">
                <Suspense fallback={
                  <div className="h-[400px] lg:h-[500px] xl:h-[600px] animate-pulse bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
                }>
                  <RetirementChart />
                </Suspense>
              </CardContent>
            </Card>

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
                  <div className="space-y-4 lg:space-y-6">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="h-24 lg:h-28 xl:h-32 animate-pulse bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
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