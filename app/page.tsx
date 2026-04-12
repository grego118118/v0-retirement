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
  Target,
  BookOpen
} from "lucide-react"
import { generateSEOMetadata } from "@/components/seo/metadata"
import { OrganizationStructuredData, FAQStructuredData, HowToStructuredData, LocalBusinessStructuredData, RETIREMENT_FAQS, PENSION_CALCULATION_STEPS } from "@/components/seo/structured-data"
import { CalculatorSchema, FAQSchema } from "@/components/seo/schema-markup"
import { NewsletterSignup } from "@/components/email/newsletter-signup"
import { ResponsiveAd, PremiumAlternative } from "@/components/ads/adsense"
import { AutoAds } from "@/components/ads/auto-ads"
import { AnimateOnScroll, StaggerChildren, StaggerItem } from "@/components/ui/animate-on-scroll"

export const metadata = generateSEOMetadata({
  title: "Massachusetts Pension Calculator 2026 | Official MSRB Estimator",
  description:
    "Calculate your Massachusetts state pension in 60 seconds. See your exact monthly payout for Groups 1-4, compare Options A/B/C, and master the Tax Bomb using 2026 COLA rates.",
  path: "/",
  keywords: [
    "Massachusetts pension calculator 2026",
    "MSRB pension estimator",
    "MA state retirement calculator",
    "Group 1 vs Group 4 pension",
    "Massachusetts COLA 2026",
    "Option C survivor benefits",
    "social security windfall elimination ma"
  ],
})

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <CalculatorSchema />
      <FAQSchema />
      <OrganizationStructuredData />
      <LocalBusinessStructuredData />
      {/* AEO: FAQ + HowTo structured data for rich answers */}
      <FAQStructuredData faqs={RETIREMENT_FAQS} />
      <HowToStructuredData
        title="How to estimate your Massachusetts state pension"
        description="Follow these steps to estimate your retirement benefits using official MSRB formulas."
        steps={PENSION_CALCULATION_STEPS}
      />

      {/* Hero Section - Conversion Optimized */}
      <section className="bg-mrs-navy-900 text-white py-20 md:py-28 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-slate-900/50"></div>

        <div className="container px-4 md:px-6 relative z-10">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-16 items-center">
            <div className="space-y-6">
              {/* Trust Badge */}
              <div className="flex items-center gap-2">
                <Badge className="bg-mrs-blue-600/30 text-white border-mrs-blue-400/30 backdrop-blur-md shadow-sm">
                  <Shield className="w-3 h-3 mr-1 text-mrs-gold-400" />
                  Massachusetts Retirement Calculator
                </Badge>
              </div>

              {/* Headline */}
              <h1 className="text-4xl font-heading font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                Maximize Your
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-mrs-gold-400 to-mrs-gold-600">
                  Retirement Income
                </span>
              </h1>

              {/* Value Proposition */}
              <p className="text-xl md:text-2xl text-blue-100 leading-relaxed font-sans">
                The only tool that combines your <strong>Massachusetts pension</strong> with <strong>Social Security optimization</strong> to maximize your retirement income by up to <strong className="text-mrs-gold-400">$50,000+ annually</strong>.
              </p>

              {/* Social Proof */}
              <div className="flex items-center gap-4 text-blue-200">
                <div className="flex items-center gap-1">
                  <Shield className="w-4 h-4" />
                  <span className="text-sm">Bank-level security</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calculator className="w-4 h-4" />
                  <span className="text-sm">MSRB-accurate calculations</span>
                </div>
              </div>

              {/* Primary CTAs */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button size="lg" className="bg-gradient-to-r from-mrs-gold-500 to-mrs-gold-600 text-white font-bold hover:from-mrs-gold-400 hover:to-mrs-gold-500 shadow-xl transform hover:scale-105 transition-all duration-200" asChild>
                  <Link href="/pricing">
                    <Crown className="mr-2 h-5 w-5" />
                    Start Premium Analysis
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="border-mrs-blue-600/30 bg-white/95 text-mrs-blue-600 hover:bg-blue-50 hover:text-mrs-navy-800 backdrop-blur-sm shadow-lg" asChild>
                  <Link href="/calculator">
                    Try Free Calculator
                  </Link>
                </Button>
              </div>

              {/* Urgency Element */}
              <Alert className="bg-red-50 border-red-100 text-red-800 bg-white/95 backdrop-blur-md shadow-lg">
                <Timer className="h-4 w-4" />
                <AlertDescription>
                  <strong>Limited Time:</strong> Save 17% on annual plans. Every day you wait costs you potential retirement income.
                </AlertDescription>
              </Alert>
            </div>

            {/* Hero Visual - Income Comparison */}
            <div className="mx-auto lg:mx-0 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-mrs-gold-400/20 to-mrs-gold-600/20 rounded-3xl blur-3xl"></div>
              <div className="relative bg-white/95 backdrop-blur-sm border border-white/20 rounded-3xl shadow-2xl overflow-hidden">
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <Crown className="h-5 w-5 text-mrs-gold-600" />
                      <span className="font-semibold text-mrs-navy-900">Premium Analysis</span>
                    </div>
                    <Badge className="bg-yellow-50 text-yellow-700 border border-yellow-200 font-bold">
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
                      <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-lg p-4 text-center border-2 border-mrs-gold-500">
                        <div className="text-xs text-yellow-800 font-bold mb-1 uppercase tracking-wider">Premium Optimized</div>
                        <div className="text-lg font-bold text-mrs-navy-900">$7,650/mo</div>
                        <div className="text-xs text-green-700 font-bold">+82% more income</div>
                      </div>
                    </div>

                    {/* Features Unlocked */}
                    <div className="bg-gradient-to-r from-mrs-navy-900/5 to-mrs-blue-600/5 rounded-lg p-4">
                      <div className="text-xs font-medium text-gray-700 mb-2">Premium Features Included:</div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs">
                          <CheckCircle className="h-3 w-3 text-mrs-gold-600" />
                          <span className="text-gray-700">Social Security optimization</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <CheckCircle className="h-3 w-3 text-mrs-gold-600" />
                          <span className="text-gray-700">Tax-efficient withdrawal strategy</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <CheckCircle className="h-3 w-3 text-mrs-gold-600" />
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

      {/* AdSense Ads Section for Free Users */}
      <section className="py-8 bg-mrs-navy-800 border-b border-mrs-navy-700">
        <div className="container mx-auto px-4">
          {/* Auto Ads - Primary solution */}
          <AutoAds />

          {/* Manual Ad Fallback */}
          <div className="flex justify-center mb-8">
            <ResponsiveAd className="max-w-4xl" />
          </div>

          {/* Premium Alternative for premium users */}
          <PremiumAlternative />
        </div>
      </section>

      {/* Latest Retirement Guides Section - SEO Internal Linking */}
      <section className="py-16 bg-mrs-navy-900 border-t border-mrs-navy-800">
        <div className="container mx-auto px-4">
          <AnimateOnScroll variant="fade-up">
            <div className="text-center mb-10">
              <Badge className="mb-4 bg-mrs-blue-900/50 text-blue-100 border-mrs-blue-700/50">
                <BookOpen className="w-3 h-3 mr-1" />
                Expert Guides
              </Badge>
              <h2 className="text-3xl font-heading font-bold text-white mb-4">
                Latest Retirement Planning Guides
              </h2>
              <p className="text-lg text-blue-200 max-w-2xl mx-auto">
                Expert insights on Massachusetts pension benefits, COLA adjustments, and retirement optimization strategies.
              </p>
            </div>
          </AnimateOnScroll>

          <StaggerChildren className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* COLA 2026 Guide */}
            <StaggerItem>
            <Link href="/blog/massachusetts-cola-2026-complete-guide" className="group" title="Massachusetts COLA 2026 Complete Guide">
              <Card className="h-full bg-mrs-navy-800 border-mrs-navy-700 hover:shadow-xl transition-all duration-300 hover:border-mrs-gold-500/50 hover:-translate-y-1">
                <CardHeader>
                  <Badge variant="outline" className="w-fit mb-2 text-xs bg-green-900/30 text-green-200 border-green-700/50">COLA Updates</Badge>
                  <CardTitle className="text-lg text-white group-hover:text-mrs-gold-400 transition-colors flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-400 flex-shrink-0" />
                    Massachusetts COLA 2026 Guide
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Everything about the 3% COLA rate, $13,000 cap, and how annual adjustments affect your retirement income.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 flex items-center gap-1">
                      <Clock className="h-3 w-3" /> 10 min read
                    </span>
                    <span className="text-mrs-gold-500 flex items-center gap-1 group-hover:gap-2 transition-all">
                      Read Guide <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
            </StaggerItem>

            {/* Social Security Fairness Act */}
            <StaggerItem>
            <Link href="/blog/social-security-fairness-act-what-massachusetts-state-employees-need-to-know" className="group" title="Social Security Fairness Act Guide">
              <Card className="h-full bg-mrs-navy-800 border-mrs-navy-700 hover:shadow-xl transition-all duration-300 hover:border-mrs-gold-500/50 hover:-translate-y-1">
                <CardHeader>
                  <Badge variant="outline" className="w-fit mb-2 text-xs bg-purple-900/30 text-purple-200 border-purple-700/50">Breaking News</Badge>
                  <CardTitle className="text-lg text-white group-hover:text-mrs-gold-400 transition-colors flex items-center gap-2">
                    <Shield className="h-5 w-5 text-purple-400 flex-shrink-0" />
                    Social Security Fairness Act
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    How the elimination of WEP/GPO increases your Social Security benefits and what to expect.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 flex items-center gap-1">
                      <Clock className="h-3 w-3" /> 8 min read
                    </span>
                    <span className="text-mrs-gold-500 flex items-center gap-1 group-hover:gap-2 transition-all">
                      Read Guide <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
            </StaggerItem>

            {/* Pension Options Guide */}
            <StaggerItem>
            <Link href="/blog/understanding-massachusetts-pension-options" className="group" title="Massachusetts Pension Options A, B, C Guide">
              <Card className="h-full bg-mrs-navy-800 border-mrs-navy-700 hover:shadow-xl transition-all duration-300 hover:border-mrs-gold-500/50 hover:-translate-y-1">
                <CardHeader>
                  <Badge variant="outline" className="w-fit mb-2 text-xs bg-blue-900/30 text-blue-200 border-blue-700/50">Essential</Badge>
                  <CardTitle className="text-lg text-white group-hover:text-mrs-gold-400 transition-colors flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-400 flex-shrink-0" />
                    Pension Options A, B, C
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Complete guide to choosing between maximum benefits, survivor protection, and joint options.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 flex items-center gap-1">
                      <Clock className="h-3 w-3" /> 8 min read
                    </span>
                    <span className="text-mrs-gold-500 flex items-center gap-1 group-hover:gap-2 transition-all">
                      Read Guide <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
            </StaggerItem>
          </StaggerChildren>

          {/* View All Link */}
          <div className="text-center mt-10">
            <Button variant="outline" size="lg" asChild className="group border-mrs-blue-200 text-mrs-blue-700 hover:bg-mrs-blue-50 hover:text-mrs-blue-800 hover:border-mrs-blue-300">
              <Link href="/blog" title="View all Massachusetts retirement planning articles">
                <BookOpen className="mr-2 h-5 w-5" />
                View All Retirement Guides
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Newsletter Signup Section */}
      <section className="py-16 bg-gradient-to-br from-mrs-navy-900 to-mrs-navy-800 text-white">
        <div className="container mx-auto px-4">
          <AnimateOnScroll variant="fade-up">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-heading font-bold text-white mb-4">
                Stay Ahead of Your Retirement
              </h2>
              <p className="text-lg text-blue-100">
                Get exclusive Massachusetts retirement planning insights, COLA updates, and calculator enhancements delivered to your inbox.
              </p>
            </div>
            <NewsletterSignup variant="default" dark={true} className="bg-white/10 border-white/20 text-white placeholder:text-blue-200" />
          </div>
          </AnimateOnScroll>
        </div>
      </section>
    </div>
  );
}
