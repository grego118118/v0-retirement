"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useSession } from "next-auth/react"
import { Crown, Lock, TrendingUp, Calculator, DollarSign, Calendar } from "lucide-react"
import Link from "next/link"
import { SocialSecurityCalculator } from "@/components/social-security/social-security-calculator"

export default function SocialSecurityPage() {
  const { data: session } = useSession()
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 text-white py-12 md:py-16 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-white/10 to-transparent"></div>

        <div className="container px-4 md:px-6 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="mb-6">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl text-center">
                Social Security
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
                  Calculator
                </span>
              </h1>
              {session && (
                <div className="flex justify-center mt-4">
                  <Badge className="bg-green-500/20 text-green-100 border-green-400/30 px-3 lg:px-4 py-1 lg:py-2 text-sm lg:text-base">
                    <Crown className="mr-1 lg:mr-2 h-3 w-3 lg:h-4 lg:w-4" />
                    Premium Access
                  </Badge>
                </div>
              )}
            </div>
            <p className="text-xl md:text-2xl text-blue-100 leading-relaxed max-w-3xl mx-auto">
              Calculate your Social Security benefits with COLA adjustments, spousal benefits, and tax optimization strategies.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">

        {/* Premium Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-12">
          <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-gradient-to-br from-white to-green-50/50 dark:from-slate-900 dark:to-green-950/20">
            <CardHeader className="pb-3 lg:pb-4 xl:pb-6 px-4 lg:px-6 xl:px-8 pt-4 lg:pt-6 xl:pt-8">
              <CardTitle className="flex items-center gap-3 lg:gap-4 text-lg lg:text-xl xl:text-2xl">
                <div className="p-2 lg:p-3 xl:p-4 rounded-lg bg-green-100 dark:bg-green-900/30 group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="h-5 w-5 lg:h-6 lg:w-6 xl:h-7 xl:w-7 text-green-600 dark:text-green-400" />
                </div>
                COLA Adjustments
              </CardTitle>
              <CardDescription className="text-sm lg:text-base xl:text-lg">
                Automatic cost-of-living adjustments with 2-3% annual inflation modeling
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-gradient-to-br from-white to-blue-50/50 dark:from-slate-900 dark:to-blue-950/20">
            <CardHeader className="pb-3 lg:pb-4 xl:pb-6 px-4 lg:px-6 xl:px-8 pt-4 lg:pt-6 xl:pt-8">
              <CardTitle className="flex items-center gap-3 lg:gap-4 text-lg lg:text-xl xl:text-2xl">
                <div className="p-2 lg:p-3 xl:p-4 rounded-lg bg-blue-100 dark:bg-blue-900/30 group-hover:scale-110 transition-transform duration-300">
                  <DollarSign className="h-5 w-5 lg:h-6 lg:w-6 xl:h-7 xl:w-7 text-blue-600 dark:text-blue-400" />
                </div>
                Spousal Benefits
              </CardTitle>
              <CardDescription className="text-sm lg:text-base xl:text-lg">
                Calculate spousal benefits up to 50% of higher earner's benefit amount
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-gradient-to-br from-white to-purple-50/50 dark:from-slate-900 dark:to-purple-950/20">
            <CardHeader className="pb-3 lg:pb-4 xl:pb-6 px-4 lg:px-6 xl:px-8 pt-4 lg:pt-6 xl:pt-8">
              <CardTitle className="flex items-center gap-3 lg:gap-4 text-lg lg:text-xl xl:text-2xl">
                <div className="p-2 lg:p-3 xl:p-4 rounded-lg bg-purple-100 dark:bg-purple-900/30 group-hover:scale-110 transition-transform duration-300">
                  <Calculator className="h-5 w-5 lg:h-6 lg:w-6 xl:h-7 xl:w-7 text-purple-600 dark:text-purple-400" />
                </div>
                Tax Implications
              </CardTitle>
              <CardDescription className="text-sm lg:text-base xl:text-lg">
                Federal and Massachusetts state tax calculations on Social Security income
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-gradient-to-br from-white to-orange-50/50 dark:from-slate-900 dark:to-orange-950/20">
            <CardHeader className="pb-3 lg:pb-4 xl:pb-6 px-4 lg:px-6 xl:px-8 pt-4 lg:pt-6 xl:pt-8">
              <CardTitle className="flex items-center gap-3 lg:gap-4 text-lg lg:text-xl xl:text-2xl">
                <div className="p-2 lg:p-3 xl:p-4 rounded-lg bg-orange-100 dark:bg-orange-900/30 group-hover:scale-110 transition-transform duration-300">
                  <Calendar className="h-5 w-5 lg:h-6 lg:w-6 xl:h-7 xl:w-7 text-orange-600 dark:text-orange-400" />
                </div>
                Claiming Strategies
              </CardTitle>
              <CardDescription className="text-sm lg:text-base xl:text-lg">
                Optimize when to claim benefits for maximum lifetime income
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-gradient-to-br from-white to-red-50/50 dark:from-slate-900 dark:to-red-950/20">
            <CardHeader className="pb-3 lg:pb-4 xl:pb-6 px-4 lg:px-6 xl:px-8 pt-4 lg:pt-6 xl:pt-8">
              <CardTitle className="flex items-center gap-3 lg:gap-4 text-lg lg:text-xl xl:text-2xl">
                <div className="p-2 lg:p-3 xl:p-4 rounded-lg bg-red-100 dark:bg-red-900/30 group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="h-5 w-5 lg:h-6 lg:w-6 xl:h-7 xl:w-7 text-red-600 dark:text-red-400" />
                </div>
                Medicare Deductions
              </CardTitle>
              <CardDescription className="text-sm lg:text-base xl:text-lg">
                Account for Medicare premiums ($174.70/month) in benefit calculations
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-gradient-to-br from-white to-indigo-50/50 dark:from-slate-900 dark:to-indigo-950/20">
            <CardHeader className="pb-3 lg:pb-4 xl:pb-6 px-4 lg:px-6 xl:px-8 pt-4 lg:pt-6 xl:pt-8">
              <CardTitle className="flex items-center gap-3 lg:gap-4 text-lg lg:text-xl xl:text-2xl">
                <div className="p-2 lg:p-3 xl:p-4 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 group-hover:scale-110 transition-transform duration-300">
                  <Calculator className="h-5 w-5 lg:h-6 lg:w-6 xl:h-7 xl:w-7 text-indigo-600 dark:text-indigo-400" />
                </div>
                Combined Analysis
              </CardTitle>
              <CardDescription className="text-sm lg:text-base xl:text-lg">
                Integrate with MA pension calculations for complete retirement planning
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Sign In Section - Only show for non-authenticated users */}
        {!session && (
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 via-indigo-50/50 to-purple-50/30 dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-purple-950/20">
            <CardHeader className="text-center pb-4 lg:pb-6 xl:pb-8 px-4 lg:px-6 xl:px-8 pt-4 lg:pt-6 xl:pt-8">
              <CardTitle className="flex items-center justify-center gap-3 lg:gap-4 text-2xl lg:text-3xl xl:text-4xl text-slate-800 dark:text-slate-200">
                <div className="p-2 lg:p-3 xl:p-4 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md">
                  <Lock className="h-6 w-6 lg:h-7 lg:w-7 xl:h-8 xl:w-8" />
                </div>
                Access Social Security Calculator
              </CardTitle>
              <CardDescription className="text-lg lg:text-xl xl:text-2xl">
                Sign in to access advanced Social Security optimization tools and maximize your retirement income
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center px-4 lg:px-6 xl:px-8 pb-4 lg:pb-6 xl:pb-8">
              <div className="mb-6 lg:mb-8">
                <div className="text-2xl lg:text-3xl xl:text-4xl font-bold mb-2 lg:mb-3 text-slate-800 dark:text-slate-200">Free with Account</div>
                <div className="text-muted-foreground text-sm lg:text-base xl:text-lg">All premium features included</div>
              </div>
              <Button size="lg" asChild className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200 h-12 lg:h-14 px-6 lg:px-8 text-sm lg:text-base">
                <Link href="/auth/signin">
                  <Crown className="mr-2 h-4 w-4 lg:h-5 lg:w-5" />
                  Sign In to Access
                </Link>
              </Button>
              <p className="text-sm lg:text-base text-muted-foreground mt-4 lg:mt-6">
                Free account • No subscription required
              </p>
            </CardContent>
          </Card>
        )}

        {/* Calculator Access Section - Only show for authenticated users */}
        {session && (
          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 via-emerald-50/50 to-teal-50/30 dark:from-green-950/20 dark:via-emerald-950/20 dark:to-teal-950/20">
            <CardHeader className="text-center pb-4 lg:pb-6 xl:pb-8 px-4 lg:px-6 xl:px-8 pt-4 lg:pt-6 xl:pt-8">
              <CardTitle className="flex items-center justify-center gap-3 lg:gap-4 text-2xl lg:text-3xl xl:text-4xl text-slate-800 dark:text-slate-200">
                <div className="p-2 lg:p-3 xl:p-4 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md">
                  <Calculator className="h-6 w-6 lg:h-7 lg:w-7 xl:h-8 xl:w-8" />
                </div>
                Social Security Calculator Ready
              </CardTitle>
              <CardDescription className="text-lg lg:text-xl xl:text-2xl">
                Start optimizing your Social Security benefits with our advanced calculator tools
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center px-4 lg:px-6 xl:px-8 pb-4 lg:pb-6 xl:pb-8">
              <div className="mb-6 lg:mb-8">
                <div className="text-2xl lg:text-3xl xl:text-4xl font-bold mb-2 lg:mb-3 text-green-700 dark:text-green-400">Premium Access Active</div>
                <div className="text-muted-foreground text-sm lg:text-base xl:text-lg">All features unlocked and ready to use</div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" asChild className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-200 h-12 lg:h-14 px-6 lg:px-8 text-sm lg:text-base">
                  <Link href="/social-security#calculator">
                    <Calculator className="mr-2 h-4 w-4 lg:h-5 lg:w-5" />
                    Start Calculator
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="h-12 lg:h-14 px-6 lg:px-8 text-sm lg:text-base">
                  <Link href="/wizard">
                    <TrendingUp className="mr-2 h-4 w-4 lg:h-5 lg:w-5" />
                    Combined Analysis
                  </Link>
                </Button>
              </div>
              <p className="text-sm lg:text-base text-muted-foreground mt-4 lg:mt-6">
                Access all Social Security optimization features • No limits
              </p>
            </CardContent>
          </Card>
        )}

        {/* Social Security Calculator - Only show for authenticated users */}
        {session && (
          <div id="calculator" className="mt-12">
            <SocialSecurityCalculator />
          </div>
        )}
      </div>
    </div>
  )
}
