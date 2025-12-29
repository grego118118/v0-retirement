import { Suspense } from "react"
import Link from "next/link"
import { generateSEOMetadata } from "@/components/seo/metadata"
import { CalculatorStructuredData, BreadcrumbStructuredData } from "@/components/seo/structured-data"
import Script from "next/script"
import PensionCalculatorWrapper from "@/components/pension-calculator-wrapper"
import { Skeleton } from "@/components/ui/skeleton"
import { AuthDisabledNotice } from "@/components/auth-disabled-notice"
import { BannerAd, ResponsiveAd, PremiumAlternative } from "@/components/ads/adsense"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ArrowRight, BookOpen, Users, DollarSign, Calculator, TrendingUp, FileText, Clock, Shield } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export const metadata = generateSEOMetadata({
  title: "MA State Pension Calculator 2025 | Free MSRB Tool - Results in 60 Seconds",
  description:
    "Calculate your exact Massachusetts pension in 60 seconds. Free calculator using official MSRB formulas for Groups 1-4. See your monthly benefit, COLA projections & Options A/B/C comparison instantly.",
  path: "/calculator",
  keywords: [
    "Massachusetts pension calculator",
    "MSRB pension calculator",
    "Massachusetts retirement calculator",
    "state employee pension estimator",
    "MA pension calculator 2025",
    "Massachusetts retirement benefits calculator",
    "Group 1 pension calculator",
    "Group 4 pension calculator",
    "state employee retirement calculator",
    "pension COLA calculator Massachusetts",
  ],
})

export default function CalculatorPage() {
  return (
    <>
      {/* Enhanced AI-optimized structured data */}
      <CalculatorStructuredData
        pageUrl="https://www.masspension.com/calculator"
        calculatorType="pension"
      />
      <BreadcrumbStructuredData
        items={[
          { name: "Home", url: "https://www.masspension.com" },
          { name: "Pension Calculator", url: "https://www.masspension.com/calculator" },
        ]}
      />

      <div className="py-8 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold tracking-tighter mb-2">Massachusetts Pension Calculator</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Enter your information below to estimate your pension benefits and determine the optimal time to retire.
              Our calculator uses the official Massachusetts retirement system formulas.
            </p>
          </div>
          <AuthDisabledNotice className="mb-6" />

          {/* Top Banner Ad */}
          <div className="mb-8">
            <BannerAd className="flex justify-center" />
          </div>

          <Suspense fallback={<CalculatorSkeleton />}>
            <PensionCalculatorWrapper />
          </Suspense>

          {/* Bottom Responsive Ad */}
          <div className="mt-8">
            <ResponsiveAd className="flex justify-center" />
            <PremiumAlternative />
          </div>

          {/* Group-Specific Calculators for SEO */}
          <div className="mt-12 border-t pt-8">
            <h2 className="text-xl font-semibold mb-4 text-center">Calculate by Retirement Group</h2>
            <p className="text-center text-sm text-muted-foreground mb-6">Get group-specific information and optimized calculations</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Link href="/calculator/group-1" className="group" title="Group 1 Pension Calculator - General Employees">
                <Card className="h-full hover:shadow-md transition-shadow hover:border-blue-300">
                  <CardContent className="pt-4 text-center">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center mx-auto mb-2 font-bold">1</div>
                    <p className="text-sm font-medium group-hover:text-blue-600">Group 1</p>
                    <p className="text-xs text-muted-foreground">Teachers, General</p>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/calculator/group-2" className="group" title="Group 2 Pension Calculator - Probation Officers">
                <Card className="h-full hover:shadow-md transition-shadow hover:border-green-300">
                  <CardContent className="pt-4 text-center">
                    <div className="w-10 h-10 rounded-full bg-green-100 text-green-700 flex items-center justify-center mx-auto mb-2 font-bold">2</div>
                    <p className="text-sm font-medium group-hover:text-green-600">Group 2</p>
                    <p className="text-xs text-muted-foreground">Probation, Court</p>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/calculator/group-3" className="group" title="Group 3 Pension Calculator - State Police">
                <Card className="h-full hover:shadow-md transition-shadow hover:border-red-300">
                  <CardContent className="pt-4 text-center">
                    <div className="w-10 h-10 rounded-full bg-red-100 text-red-700 flex items-center justify-center mx-auto mb-2 font-bold">3</div>
                    <p className="text-sm font-medium group-hover:text-red-600">Group 3</p>
                    <p className="text-xs text-muted-foreground">State Police</p>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/calculator/group-4" className="group" title="Group 4 Pension Calculator - Police & Fire">
                <Card className="h-full hover:shadow-md transition-shadow hover:border-orange-300">
                  <CardContent className="pt-4 text-center">
                    <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center mx-auto mb-2 font-bold">4</div>
                    <p className="text-sm font-medium group-hover:text-orange-600">Group 4</p>
                    <p className="text-xs text-muted-foreground">Police, Fire, Corrections</p>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>

          {/* Related Resources - Internal Linking for SEO */}
          <div className="mt-10">
            <h2 className="text-xl font-semibold mb-6 text-center">Related Resources</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link href="/resources/groups" className="group" title="Massachusetts Retirement Groups 1-4 Explained">
                <Card className="h-full hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2 group-hover:text-blue-600">
                      <Users className="h-4 w-4" />
                      Retirement Groups
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground">Learn about Groups 1-4 and their benefit factors</p>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/resources/cola" className="group" title="Massachusetts COLA Explained">
                <Card className="h-full hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2 group-hover:text-blue-600">
                      <DollarSign className="h-4 w-4" />
                      COLA Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground">Understand cost of living adjustments</p>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/resources/options" className="group" title="Massachusetts Pension Options A, B, C Comparison">
                <Card className="h-full hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2 group-hover:text-blue-600">
                      <Calculator className="h-4 w-4" />
                      Pension Options
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground">Compare Options A, B, and C</p>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/social-security" className="group" title="Social Security Integration Calculator">
                <Card className="h-full hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2 group-hover:text-blue-600">
                      <Shield className="h-4 w-4" />
                      Social Security
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground">WEP/GPO elimination benefits</p>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>

          {/* Featured Guides - Links to specific blog posts */}
          <div className="mt-10">
            <h2 className="text-xl font-semibold mb-6 text-center">Essential Retirement Guides</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link href="/blog/massachusetts-cola-2026-complete-guide" className="group" title="Massachusetts COLA 2026 Complete Guide">
                <Card className="h-full hover:shadow-lg transition-all hover:border-blue-300">
                  <CardHeader>
                    <Badge variant="outline" className="w-fit mb-2 text-xs">COLA</Badge>
                    <CardTitle className="text-base group-hover:text-blue-600 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 flex-shrink-0" />
                      Massachusetts COLA 2026 Guide
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Everything about the 3% COLA on the first $13,000 and how it affects your pension
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <span className="text-sm text-blue-600 flex items-center gap-1 group-hover:gap-2 transition-all">
                      Read Guide <ArrowRight className="h-4 w-4" />
                    </span>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/blog/understanding-massachusetts-pension-options" className="group" title="Understanding Massachusetts Pension Options A, B, C">
                <Card className="h-full hover:shadow-lg transition-all hover:border-blue-300">
                  <CardHeader>
                    <Badge variant="outline" className="w-fit mb-2 text-xs">Options</Badge>
                    <CardTitle className="text-base group-hover:text-blue-600 flex items-center gap-2">
                      <FileText className="h-4 w-4 flex-shrink-0" />
                      Pension Options A, B, C Guide
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Compare survivor benefits and choose the right option for your situation
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <span className="text-sm text-blue-600 flex items-center gap-1 group-hover:gap-2 transition-all">
                      Read Guide <ArrowRight className="h-4 w-4" />
                    </span>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/blog/retirement-planning-for-massachusetts-state-employees" className="group" title="Retirement Planning Timeline for Massachusetts Employees">
                <Card className="h-full hover:shadow-lg transition-all hover:border-blue-300">
                  <CardHeader>
                    <Badge variant="outline" className="w-fit mb-2 text-xs">Planning</Badge>
                    <CardTitle className="text-base group-hover:text-blue-600 flex items-center gap-2">
                      <Clock className="h-4 w-4 flex-shrink-0" />
                      Retirement Planning Timeline
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Year-by-year checklist from 5 years before retirement to your last day
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <span className="text-sm text-blue-600 flex items-center gap-1 group-hover:gap-2 transition-all">
                      Read Guide <ArrowRight className="h-4 w-4" />
                    </span>
                  </CardContent>
                </Card>
              </Link>
            </div>

            <div className="text-center mt-6">
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
                title="View all Massachusetts retirement blog articles"
              >
                <BookOpen className="h-4 w-4" />
                View All Retirement Guides
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

function CalculatorSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
      <Skeleton className="h-40 w-full" />
    </div>
  )
}
