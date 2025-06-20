import React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  ArrowRight,
  Calculator,
  Clock,
  DollarSign,
  TrendingUp,
  Crown,
  CheckCircle,
  Users,
  Shield,
  FileText,
  Zap,
  Star,
  Timer,
  Target
} from "lucide-react"
import { generateSEOMetadata } from "@/components/seo/metadata"
import Script from "next/script"

export const metadata = generateSEOMetadata({
  title: "Massachusetts Pension Estimator | Retirement Planning for State Employees",
  description:
    "Calculate your Massachusetts state employee pension benefits and determine the optimal time to retire with our free pension estimator tool.",
  path: "/",
  keywords: [
    "Massachusetts pension calculator",
    "MA state retirement",
    "pension estimator",
    "state employee retirement",
    "retirement planning",
    "pension benefits",
    "Massachusetts retirement system",
  ],
})

export default function Home() {
  // Structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Massachusetts Pension Estimator",
    description:
      "Calculate your Massachusetts state employee pension benefits and determine the optimal time to retire.",
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
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Script id="structured-data" type="application/ld+json">
        {JSON.stringify(structuredData)}
      </Script>

      {/* Hero Section - Conversion Optimized */}
      <section className="bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 text-white py-20 md:py-28 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-white/10 to-transparent"></div>

        <div className="container px-4 md:px-6 relative z-10">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-16 items-center">
            <div className="space-y-6">
              {/* Trust Badge */}
              <div className="flex items-center gap-2">
                <Badge className="bg-green-500/20 text-green-100 border-green-400/30">
                  <Shield className="w-3 h-3 mr-1" />
                  Trusted by 10,000+ MA Employees
                </Badge>
                <Badge className="bg-amber-500/20 text-amber-100 border-amber-400/30">
                  <Star className="w-3 h-3 mr-1" />
                  #1 MA Pension Tool
                </Badge>
              </div>

              {/* Headline */}
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                Maximize Your
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
                  Retirement Income
                </span>
              </h1>

              {/* Value Proposition */}
              <p className="text-xl md:text-2xl text-blue-100 leading-relaxed">
                The only tool that combines your <strong>Massachusetts pension</strong> with <strong>Social Security optimization</strong> to maximize your retirement income by up to <strong className="text-yellow-400">$50,000+ annually</strong>.
              </p>

              {/* Social Proof */}
              <div className="flex items-center gap-4 text-blue-200">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span className="text-sm">10,000+ users</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm">4.9/5 rating</span>
                </div>
                <div className="flex items-center gap-1">
                  <Shield className="w-4 h-4" />
                  <span className="text-sm">Bank-level security</span>
                </div>
              </div>

              {/* Primary CTAs */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button size="lg" className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold hover:from-yellow-300 hover:to-orange-400 shadow-xl transform hover:scale-105 transition-all duration-200" asChild>
                  <Link href="/pricing">
                    <Crown className="mr-2 h-5 w-5" />
                    Start Premium Analysis
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="border-blue-300 bg-white/95 text-blue-700 hover:bg-blue-50 hover:text-blue-800 backdrop-blur-sm shadow-lg" asChild>
                  <Link href="/calculator">
                    Try Free Calculator
                  </Link>
                </Button>
              </div>

              {/* Urgency Element */}
              <Alert className="bg-red-500/20 border-red-400/30 text-red-100">
                <Timer className="h-4 w-4" />
                <AlertDescription>
                  <strong>Limited Time:</strong> Save 17% on annual plans. Every day you wait costs you potential retirement income.
                </AlertDescription>
              </Alert>
            </div>

            {/* Hero Visual - Income Comparison */}
            <div className="mx-auto lg:mx-0 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-orange-500/20 rounded-3xl blur-3xl"></div>
              <div className="relative bg-white/95 backdrop-blur-sm border border-white/20 rounded-3xl shadow-2xl overflow-hidden">
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <Crown className="h-5 w-5 text-amber-600" />
                      <span className="font-semibold text-gray-900">Premium Analysis</span>
                    </div>
                    <Badge className="bg-green-100 text-green-800">
                      +$52,000/year
                    </Badge>
                  </div>

                  {/* Income Comparison */}
                  <div className="space-y-4">
                    <div className="text-center mb-4">
                      <h3 className="font-bold text-gray-900 text-lg">Your Optimized Retirement Income</h3>
                      <p className="text-sm text-gray-600">vs. Basic Planning</p>
                    </div>

                    {/* Basic vs Premium Comparison */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-100 rounded-lg p-4 text-center">
                        <div className="text-xs text-gray-600 mb-1">Basic Planning</div>
                        <div className="text-lg font-bold text-gray-700">$4,200/mo</div>
                        <div className="text-xs text-red-600">Missing $1,500/mo</div>
                      </div>
                      <div className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg p-4 text-center border-2 border-green-300">
                        <div className="text-xs text-green-700 mb-1">Premium Optimized</div>
                        <div className="text-lg font-bold text-green-800">$7,650/mo</div>
                        <div className="text-xs text-green-600">+82% more income</div>
                      </div>
                    </div>

                    {/* Features Unlocked */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
                      <div className="text-xs font-medium text-gray-700 mb-2">Premium Features Included:</div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs">
                          <CheckCircle className="h-3 w-3 text-green-600" />
                          <span className="text-gray-700">Social Security optimization</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <CheckCircle className="h-3 w-3 text-green-600" />
                          <span className="text-gray-700">Tax-efficient withdrawal strategy</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <CheckCircle className="h-3 w-3 text-green-600" />
                          <span className="text-gray-700">Professional PDF reports</span>
                        </div>
                      </div>
                    </div>

                    {/* CTA Button */}
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium" asChild>
                      <Link href="/pricing">
                        <Target className="mr-2 h-4 w-4" />
                        Get My Analysis
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
