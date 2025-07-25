"use client"

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { generateSEOMetadata } from "@/components/seo/metadata"
import { PricingSection } from "@/components/pricing/pricing-section"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Crown, Calculator, Users, Building, FileText, Download } from "lucide-react"
import Link from "next/link"
import { ResponsiveAd, PremiumAlternative } from "@/components/ads/adsense"
import { AutoAds, SmartAds } from "@/components/ads/auto-ads"

// Feature-specific messaging
const featureMessages = {
  'pdf-reports': {
    badge: 'PDF Reports',
    icon: FileText,
    title: 'Unlock Professional PDF Reports',
    description: 'Generate comprehensive retirement analysis reports with official calculations, projections, and professional formatting.',
    highlight: 'You were trying to access PDF generation - a Premium feature.'
  },
  'wizard': {
    badge: 'Retirement Wizard',
    icon: Calculator,
    title: 'Access the Complete Retirement Wizard',
    description: 'Step-by-step guided analysis combining pension and Social Security benefits with optimization recommendations.',
    highlight: 'You were trying to access the retirement wizard - a Premium feature.'
  },
  'default': {
    badge: 'Flexible Pricing',
    icon: Calculator,
    title: 'Choose Your Perfect Plan',
    description: 'Start free with basic pension calculations, or unlock advanced features with Premium. Enterprise solutions available for organizations.',
    highlight: null
  }
}

const businessFeatures = [
  "White-label pension calculator",
  "Custom branding and domains",
  "Bulk user management",
  "Advanced analytics and reporting",
  "Priority integration support",
  "Dedicated account manager",
  "Custom calculation formulas",
  "API access for integrations"
]

function PricingPageContent() {
  const searchParams = useSearchParams()
  const feature = searchParams.get('feature') || 'default'
  const featureConfig = featureMessages[feature as keyof typeof featureMessages] || featureMessages.default
  const FeatureIcon = featureConfig.icon

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto py-16 px-4">
        {/* Feature-specific highlight banner */}
        {featureConfig.highlight && (
          <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-lg text-center">
            <div className="flex items-center justify-center gap-2 text-amber-800">
              <FeatureIcon className="w-5 h-5" />
              <span className="font-medium">{featureConfig.highlight}</span>
            </div>
          </div>
        )}

        <div className="text-center mb-16">
          <Badge className="mb-4 bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
            <FeatureIcon className="mr-1 h-3 w-3" />
            {featureConfig.badge}
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            {featureConfig.title}
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {featureConfig.description}
          </p>
        </div>

        {/* Main Pricing Section */}
        <PricingSection />

        {/* AdSense Ads for Free Users */}
        <div className="my-16">
          {/* Auto Ads - Primary solution */}
          <AutoAds />

          {/* Smart Ads - Combines Auto + Manual */}
          <SmartAds
            className="flex justify-center mb-8"
            fallbackSlot={process.env.NEXT_PUBLIC_ADSENSE_RESPONSIVE_SLOT}
          />

          {/* Premium Alternative for premium users */}
          <PremiumAlternative />
        </div>

        {/* Enterprise Section */}
        <div className="mt-20">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200">
              <Building className="mr-1 h-3 w-3" />
              Enterprise Solutions
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              Built for Organizations
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Custom solutions for HR departments, unions, financial advisors, and government agencies
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            <Card className="relative">
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-5 w-5 text-indigo-500" />
                  <CardTitle className="text-xl">For HR Departments</CardTitle>
                </div>
                <CardDescription>
                  Help your employees understand their retirement benefits
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-2 text-sm">
                    <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 mt-2 flex-shrink-0"></div>
                    <span>Branded calculator for your employees</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 mt-2 flex-shrink-0"></div>
                    <span>Bulk user management and analytics</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 mt-2 flex-shrink-0"></div>
                    <span>Integration with HR systems</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 mt-2 flex-shrink-0"></div>
                    <span>Custom reporting and insights</span>
                  </li>
                </ul>
                <Button className="w-full" variant="outline" asChild>
                  <Link href="/contact?type=hr">Request Demo</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="relative">
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Building className="h-5 w-5 text-green-500" />
                  <CardTitle className="text-xl">For Financial Advisors</CardTitle>
                </div>
                <CardDescription>
                  Add value for your state employee clients
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-2 text-sm">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
                    <span>White-label solution with your branding</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
                    <span>Client portfolio management</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
                    <span>Advanced scenario modeling tools</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
                    <span>Professional reporting features</span>
                  </li>
                </ul>
                <Button className="w-full" variant="outline" asChild>
                  <Link href="/contact?type=advisor">Get Started</Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card className="max-w-4xl mx-auto mt-8">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Enterprise Features</CardTitle>
              <CardDescription>
                Everything in Premium, plus advanced organization tools
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  {businessFeatures.slice(0, 4).map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-primary"></div>
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
                <div className="space-y-3">
                  {businessFeatures.slice(4).map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-primary"></div>
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="text-center mt-8">
                <Button size="lg" asChild>
                  <Link href="/contact?type=enterprise">
                    Contact Sales Team
                  </Link>
                </Button>
                <p className="text-sm text-muted-foreground mt-2">
                  Custom pricing based on your needs
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <div className="mt-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-muted-foreground">
              Everything you need to know about our pricing
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="space-y-6">
              <div>
                <h3 className="font-medium mb-2">How accurate are the calculations?</h3>
                <p className="text-sm text-muted-foreground">
                  Our calculations use the official Massachusetts retirement system formulas and are updated regularly to reflect current regulations.
                </p>
              </div>
              <div>
                <h3 className="font-medium mb-2">Can I switch plans anytime?</h3>
                <p className="text-sm text-muted-foreground">
                  Yes, you can upgrade or downgrade your plan at any time. Changes take effect at your next billing cycle.
                </p>
              </div>
              <div>
                <h3 className="font-medium mb-2">Is there a setup fee?</h3>
                <p className="text-sm text-muted-foreground">
                  No setup fees for individual or Premium plans. Enterprise solutions may include implementation fees based on complexity.
                </p>
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <h3 className="font-medium mb-2">What happens to my data if I cancel?</h3>
                <p className="text-sm text-muted-foreground">
                  You can export your saved calculations before canceling. We retain data for 30 days in case you want to reactivate.
                </p>
              </div>
              <div>
                <h3 className="font-medium mb-2">Do you offer discounts for groups?</h3>
                <p className="text-sm text-muted-foreground">
                  Yes, we offer volume discounts for groups of 10+ users. Contact our sales team for custom pricing.
                </p>
              </div>
              <div>
                <h3 className="font-medium mb-2">Is support included?</h3>
                <p className="text-sm text-muted-foreground">
                  Email support is included with all plans. Premium users get priority support, and Enterprise customers get dedicated support.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PricingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading pricing information...</p>
        </div>
      </div>
    }>
      <PricingPageContent />
    </Suspense>
  )
}