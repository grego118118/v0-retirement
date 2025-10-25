import { Suspense } from "react"
import { generateSEOMetadata } from "@/components/seo/metadata"
import { CalculatorStructuredData } from "@/components/seo/structured-data"
import Script from "next/script"
import PensionCalculatorWrapper from "@/components/pension-calculator-wrapper"
import { Skeleton } from "@/components/ui/skeleton"
import { AuthDisabledNotice } from "@/components/auth-disabled-notice"
import { BannerAd, ResponsiveAd, PremiumAlternative } from "@/components/ads/adsense"

export const metadata = generateSEOMetadata({
  title: "Pension Calculator | Mass Pension",
  description:
    "Calculate your Massachusetts state employee pension benefits with our free calculator. Estimate your retirement income based on age, service years, and salary.",
  path: "/calculator",
  keywords: [
    "pension calculator",
    "retirement calculator",
    "Massachusetts state pension",
    "pension estimator",
    "retirement benefits calculator",
    "state employee retirement",
    "Mass pension calculation",
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
