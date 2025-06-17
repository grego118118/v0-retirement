import React, { Suspense } from "react"
import type { Metadata } from "next"
import PensionCalculator from "@/components/pension-calculator"
import Script from "next/script"

export const metadata: Metadata = {
  title: "Pension Calculator | Massachusetts Retirement System",
  description: "Calculate your Massachusetts state employee pension benefits with our comprehensive retirement calculator.",
  keywords: [
    "Massachusetts pension calculator",
    "MA state retirement",
    "pension estimator",
    "state employee retirement",
    "retirement planning",
    "pension benefits",
    "Massachusetts retirement system",
  ],
}

function CalculatorSkeleton() {
  return (
    <div className="space-y-6">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          <div className="h-4 bg-gray-200 rounded w-4/6"></div>
        </div>
      </div>
    </div>
  )
}

export default function CalculatorPage() {
  // Structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Massachusetts Pension Calculator",
    description: "Calculate your Massachusetts state employee pension benefits and determine the optimal time to retire.",
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    audience: {
      "@type": "Audience",
      audienceType: "Massachusetts State Employees",
    },
  }

  return (
    <>
      <Script id="calculator-structured-data" type="application/ld+json">
        {JSON.stringify(structuredData)}
      </Script>

      <div className="min-h-screen" style={{ background: 'var(--mrs-gradient-hero)' }}>
        {/* Enhanced Hero Section for Desktop */}
        <section className="text-white py-12 md:py-16 lg:py-20 xl:py-24 relative overflow-hidden" style={{ background: 'var(--mrs-gradient-hero)' }}>
          {/* Enhanced Background Elements */}
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-white/10 to-transparent"></div>
          <div className="absolute bottom-0 left-0 w-1/4 h-1/2 bg-gradient-to-tr from-white/5 to-transparent"></div>

          <div className="container px-4 md:px-6 lg:px-8 xl:px-12 relative z-10">
            <div className="text-center max-w-6xl mx-auto mrs-fade-in">
              <h1 className="mrs-heading-1 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl mb-6 lg:mb-8">
                Massachusetts Pension
                <span className="block mrs-gradient-text" style={{ background: 'var(--mrs-gradient-gold)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Calculator
                </span>
              </h1>
              <p className="mrs-body-large text-xl md:text-2xl lg:text-3xl xl:text-4xl text-white/90 leading-relaxed mb-8 lg:mb-12 max-w-5xl mx-auto">
                Professional pension estimation tool with advanced planning features for Massachusetts state employees
              </p>
              <div className="flex flex-col sm:flex-row gap-4 lg:gap-6 justify-center items-center">
                <div className="flex items-center gap-2 text-blue-200">
                  <svg className="h-5 w-5 lg:h-6 lg:w-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm lg:text-base">Groups 1-4 Supported</span>
                </div>
                <div className="flex items-center gap-2 text-blue-200">
                  <svg className="h-5 w-5 lg:h-6 lg:w-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm lg:text-base">Advanced Planning Options</span>
                </div>
                <div className="flex items-center gap-2 text-blue-200">
                  <svg className="h-5 w-5 lg:h-6 lg:w-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm lg:text-base">Sub-2s Performance</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced Main Content for Desktop */}
        <div className="mrs-page-wrapper">
          <div className="mrs-content-container py-6 lg:py-8 xl:py-12">
            <Suspense fallback={<CalculatorSkeleton />}>
              <PensionCalculator />
            </Suspense>
          </div>
        </div>
      </div>
    </>
  )
}
