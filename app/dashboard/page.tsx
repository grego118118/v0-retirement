"use client"

import { Suspense, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SavedCalculations } from "@/components/dashboard/saved-calculations"
import { RetirementChart } from "@/components/dashboard/retirement-chart"
import { RetirementCountdown } from "@/components/countdown/retirement-countdown"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, Printer, Crown, DollarSign, TrendingUp, Calculator, ArrowRight, Lock, RefreshCw, CheckCircle } from "lucide-react"
import { useSubscriptionStatus } from "@/hooks/use-subscription"
import { useRetirementData } from "@/hooks/use-retirement-data"
import { formatCurrency } from "@/lib/utils"
import Link from "next/link"

export default function DashboardPage() {
  const { isPremium, subscriptionStatus } = useSubscriptionStatus()
  const { profile, calculations, fetchProfile, fetchCalculations, loading } = useRetirementData()

  // Calculate retirement date from profile data
  const getRetirementDate = () => {
    if (!profile?.dateOfBirth) return null
    
    try {
      const birthDate = new Date(profile.dateOfBirth)
      // Use planned retirement age from profile, or default to 65
      const retirementAge = profile.plannedRetirementAge || 65
      const retirementDate = new Date(birthDate)
      retirementDate.setFullYear(birthDate.getFullYear() + retirementAge)
      
      return retirementDate
    } catch (error) {
      console.error('Error calculating retirement date:', error)
      return null
    }
  }

  // Get latest calculation data for dashboard metrics
  const getLatestCalculation = () => {
    console.log('Dashboard getLatestCalculation - calculations:', calculations)
    
    if (!calculations || calculations.length === 0) {
      console.log('No calculations found, returning default values')
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
    console.log('Latest calculation:', latest)
    console.log('Latest calculation socialSecurityData:', latest.socialSecurityData)
    
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
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight">Your Retirement Dashboard</h1>
          {isPremium && (
            <Badge className="bg-amber-100 text-amber-800">
              <Crown className="mr-1 h-3 w-3" />
              Premium
            </Badge>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={refreshData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </div>

      {/* Retirement Countdown */}
      <div className="mb-8">
        <Suspense fallback={<Skeleton className="h-64 w-full" />}>
          <RetirementCountdown retirementDate={getRetirementDate()} />
        </Suspense>
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Annual Pension</CardTitle>
            <CardDescription>Latest calculation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{formatCurrency(latestCalc.annualBenefit)}</div>
            <div className="text-sm text-muted-foreground">per year</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Monthly Pension</CardTitle>
            <CardDescription>Latest calculation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{formatCurrency(latestCalc.monthlyBenefit)}</div>
            <div className="text-sm text-muted-foreground">per month</div>
          </CardContent>
        </Card>
      </div>

      {/* Social Security Integration - Premium Only */}
      {isPremium ? (
        <Card className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-blue-600" />
              Complete Retirement Income Analysis
              <Badge className="bg-blue-100 text-blue-800">
                <Crown className="mr-1 h-3 w-3" />
                Premium
              </Badge>
              {latestCalc.socialSecurityData?.selectedMonthlyBenefit && (
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle className="mr-1 h-3 w-3" />
                  Includes SS Data
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              {latestCalc.socialSecurityData?.selectedMonthlyBenefit 
                ? "Based on your saved combined calculation with actual Social Security benefits"
                : "Combined Massachusetts pension and estimated Social Security benefits"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <div className="text-center p-4 bg-white dark:bg-gray-900 rounded-lg shadow-sm">
                <div className="text-sm text-muted-foreground mb-1">MA State Pension</div>
                <div className="text-2xl font-bold text-blue-600">{formatCurrency(latestCalc.monthlyBenefit)}</div>
                <div className="text-xs text-muted-foreground">per month</div>
              </div>
              <div className="text-center p-4 bg-white dark:bg-gray-900 rounded-lg shadow-sm">
                <div className="text-sm text-muted-foreground mb-1">Social Security</div>
                <div className="text-2xl font-bold text-green-600">
                  {latestCalc.socialSecurityData?.selectedMonthlyBenefit 
                    ? formatCurrency(latestCalc.socialSecurityData.selectedMonthlyBenefit)
                    : "$2,800"
                  }
                </div>
                <div className="text-xs text-muted-foreground">
                  {latestCalc.socialSecurityData?.selectedMonthlyBenefit ? "calculated" : "estimated"} per month
                </div>
              </div>
              <div className="text-center p-4 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg">
                <div className="text-sm opacity-90 mb-1">Total Monthly Income</div>
                <div className="text-2xl font-bold">
                  {formatCurrency(
                    latestCalc.monthlyBenefit + 
                    (latestCalc.socialSecurityData?.selectedMonthlyBenefit || 2800)
                  )}
                </div>
                <div className="text-xs opacity-90">
                  {latestCalc.socialSecurityData?.replacementRatio 
                    ? `${Math.round(latestCalc.socialSecurityData.replacementRatio * 100)}% replacement ratio`
                    : "85% replacement ratio"
                  }
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild>
                <Link href="/social-security">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Optimize Social Security Strategy
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/calculator">
                  <Calculator className="mr-2 h-4 w-4" />
                  Update Pension Calculation
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="mb-8 border-dashed border-2">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Lock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Complete Retirement Income Analysis</h3>
              <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                Combine your Massachusetts pension with Social Security benefits for comprehensive retirement planning.
              </p>
              <Button asChild>
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

      {/* Show survivor benefits only for Option C */}
      {latestCalc.retirementOption === 'C' && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Survivor Benefits (Option C)</CardTitle>
            <CardDescription>Benefits for your beneficiary</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Annual Benefit</div>
                <div className="text-2xl font-bold text-purple-600">{formatCurrency(latestCalc.annualBenefit * 0.667)}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Monthly Benefit</div>
                <div className="text-2xl font-bold text-purple-600">{formatCurrency(latestCalc.monthlyBenefit * 0.667)}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Pension Growth Projection</CardTitle>
            <CardDescription>From age 55 up to 80% maximum</CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
              <RetirementChart />
            </Suspense>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Saved Calculations</CardTitle>
            <CardDescription>Your previous pension estimates</CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
              <SavedCalculations />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 