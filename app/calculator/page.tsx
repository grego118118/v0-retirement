import { Suspense } from "react"
import { generateSEOMetadata } from "@/components/seo/metadata"
import Script from "next/script"
import PensionCalculatorWrapper from "@/components/pension-calculator-wrapper"
import { Skeleton } from "@/components/ui/skeleton"

export const metadata = generateSEOMetadata({
  title: "Pension Calculator | Massachusetts Pension Estimator",
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
    "MA pension calculation",
  ],
})

export default function CalculatorPage() {
  // Structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "FinancialCalculator",
    name: "Massachusetts State Pension Calculator",
    description:
      "Calculate your Massachusetts state employee pension benefits and determine the optimal time to retire.",
    url: "https://mapensionestimator.gov/calculator",
    category: "Retirement Calculator",
    mainEntity: {
      "@type": "FinancialProduct",
      name: "Massachusetts State Pension",
      category: "Retirement Benefits",
    },
  }

  return (
    <>
      <Script id="calculator-structured-data" type="application/ld+json">
        {JSON.stringify(structuredData)}
      </Script>

      <div className="py-8 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold tracking-tighter mb-2">Massachusetts Pension Calculator</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Enter your information below to estimate your pension benefits and determine the optimal time to retire.
              Our calculator uses the official Massachusetts retirement system formulas.
            </p>
          </div>
          <Suspense fallback={<CalculatorSkeleton />}>
            <PensionCalculatorWrapper />
          </Suspense>
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
