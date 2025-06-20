import { Suspense } from "react"
import { generateSEOMetadata } from "@/components/seo/metadata"
import Script from "next/script"
import { CombinedCalculationWizard } from "@/components/wizard/combined-calculation-wizard"
import { Skeleton } from "@/components/ui/skeleton"
import { AuthDisabledNotice } from "@/components/auth-disabled-notice"

export const metadata = generateSEOMetadata({
  title: "Combined Retirement Planning Wizard | Massachusetts Retirement Calculator",
  description:
    "Complete 7-step retirement planning wizard combining pension, Social Security, and personal savings calculations for Massachusetts state employees.",
  path: "/calculator/combined",
  keywords: [
    "retirement planning wizard",
    "combined retirement calculator",
    "Massachusetts pension and social security",
    "retirement income planning",
    "comprehensive retirement calculator",
    "state employee retirement planning",
    "MA retirement wizard",
  ],
})

export default function CombinedCalculatorPage() {
  // Structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "FinancialCalculator",
    name: "Massachusetts Combined Retirement Planning Wizard",
    description:
      "Comprehensive 7-step retirement planning wizard for Massachusetts state employees combining pension, Social Security, and personal savings.",
    url: "https://mapensionestimator.gov/calculator/combined",
    category: "Retirement Planning Tool",
    mainEntity: {
      "@type": "FinancialProduct",
      name: "Combined Retirement Planning",
      category: "Retirement Benefits",
    },
  }

  return (
    <>
      <Script id="combined-calculator-structured-data" type="application/ld+json">
        {JSON.stringify(structuredData)}
      </Script>

      <div className="py-8 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold tracking-tighter mb-2">Combined Retirement Planning Wizard</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Complete our comprehensive 7-step wizard to create a detailed retirement plan combining your pension, 
              Social Security benefits, and personal savings for optimal retirement income.
            </p>
          </div>
          <AuthDisabledNotice className="mb-6" />
          <Suspense fallback={<CombinedCalculatorSkeleton />}>
            <CombinedCalculationWizard />
          </Suspense>
        </div>
      </div>
    </>
  )
}

function CombinedCalculatorSkeleton() {
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
