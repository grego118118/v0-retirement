import { Suspense } from "react"
import Link from "next/link"
import { generateSEOMetadata } from "@/components/seo/metadata"
import { CalculatorStructuredData, BreadcrumbStructuredData } from "@/components/seo/structured-data"
import Script from "next/script"
import PensionCalculatorWrapper from "@/components/pension-calculator-wrapper"
import { Skeleton } from "@/components/ui/skeleton"
import { AuthDisabledNotice } from "@/components/auth-disabled-notice"
import { BannerAd, ResponsiveAd, PremiumAlternative } from "@/components/ads/adsense"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, BookOpen, Users, DollarSign, Calculator } from "lucide-react"

export const metadata = generateSEOMetadata({
  title: "Massachusetts Pension Calculator | Free MSRB Retirement Estimator 2025",
  description:
    "Free Massachusetts state employee pension calculator using official MSRB formulas. Calculate your retirement benefits for Groups 1-4, COLA projections, and Options A/B/C. Accurate estimates in seconds.",
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

          {/* Related Resources - Internal Linking for SEO */}
          <div className="mt-12 border-t pt-8">
            <h2 className="text-xl font-semibold mb-6 text-center">Related Resources</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link href="/resources/groups" className="group">
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
              <Link href="/resources/cola" className="group">
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
              <Link href="/resources/options" className="group">
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
              <Link href="/blog" className="group">
                <Card className="h-full hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2 group-hover:text-blue-600">
                      <BookOpen className="h-4 w-4" />
                      Retirement Blog
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground">Tips and guides for retirement planning</p>
                  </CardContent>
                </Card>
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
