"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Check, 
  Crown, 
  DollarSign, 
  Calculator, 
  FileText, 
  TrendingUp, 
  Shield, 
  Mail,
  Star,
  ArrowRight,
  Zap
} from "lucide-react"
import { SUBSCRIPTION_PLANS, FREE_TIER_LIMITS } from "@/lib/stripe/config"
import { useSubscription } from "@/hooks/use-subscription"

export default function PricingPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const { isPremium } = useSubscription()
  const [isLoading, setIsLoading] = useState<'monthly' | 'annual' | null>(null)

  // Redirect authenticated users to dashboard
  if (session?.user) {
    router.push('/dashboard')
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-950 dark:via-blue-950/20 dark:to-indigo-950/10 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">Redirecting...</h2>
          <p className="text-muted-foreground">Taking you to your dashboard</p>
        </div>
      </div>
    )
  }

  const handleSubscribe = async (planType: 'monthly' | 'annual') => {
    if (status === 'loading') return

    if (!session) {
      // Redirect to sign in with callback to pricing
      router.push('/auth/signin?callbackUrl=/pricing')
      return
    }

    if (isPremium) {
      // Redirect to customer portal for existing subscribers
      router.push('/subscription/portal')
      return
    }

    setIsLoading(planType)

    try {
      const response = await fetch('/api/subscription/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planType })
      })

      if (!response.ok) {
        throw new Error('Failed to create checkout session')
      }

      const { checkoutUrl } = await response.json()
      window.location.href = checkoutUrl
    } catch (error) {
      console.error('Error creating checkout session:', error)
      alert('Something went wrong. Please try again.')
    } finally {
      setIsLoading(null)
    }
  }

  const premiumFeatures = [
    {
      icon: Calculator,
      title: "Social Security Optimization",
      description: "Advanced algorithms to maximize your Social Security benefits"
    },
    {
      icon: TrendingUp,
      title: "Combined Income Projections",
      description: "Comprehensive pension + Social Security income analysis"
    },
    {
      icon: DollarSign,
      title: "Tax Implications Calculator",
      description: "Federal and Massachusetts state tax optimization strategies"
    },
    {
      icon: FileText,
      title: "Professional PDF Reports",
      description: "Detailed retirement planning reports with charts and analysis"
    },
    {
      icon: Shield,
      title: "Advanced Planning Tools",
      description: "Monte Carlo simulations and risk analysis"
    },
    {
      icon: Mail,
      title: "Email Notifications",
      description: "Alerts for COLA adjustments and important updates"
    }
  ]

  const freeFeatures = [
    "Basic pension calculator",
    "Limited calculation history (3 saved)",
    "Basic retirement projections",
    "Community support"
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-950 dark:via-blue-950/20 dark:to-indigo-950/10">
      <div className="container mx-auto px-4 py-8 lg:py-16">
        {/* Hero Section */}
        <div className="text-center mb-12 lg:mb-16">
          <Badge className="mb-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2">
            <Crown className="mr-2 h-4 w-4" />
            Premium Features
          </Badge>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-slate-900 dark:text-slate-100 mb-4 lg:mb-6">
            Maximize Your Massachusetts
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              Retirement Benefits
            </span>
          </h1>
          <p className="text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Unlock advanced retirement planning tools, Social Security optimization, and professional-grade 
            analysis to secure your financial future with confidence.
          </p>
        </div>

        {/* Social Proof */}
        <div className="text-center mb-12 lg:mb-16">
          <div className="flex items-center justify-center gap-2 mb-4">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
            ))}
            <span className="ml-2 text-sm text-muted-foreground">Trusted by 1,000+ Massachusetts employees</span>
          </div>
          <p className="text-sm text-muted-foreground">
            "This tool helped me optimize my retirement strategy and discover $50,000 in additional benefits!" 
            <span className="font-medium">- Sarah M., State Employee</span>
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto mb-16">
          {/* Free Plan */}
          <Card className="border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-xl font-semibold">Free</CardTitle>
              <CardDescription>Get started with basic calculations</CardDescription>
              <div className="text-3xl font-bold mt-4">
                $0
                <span className="text-lg font-normal text-muted-foreground">/month</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                variant="outline" 
                className="w-full" 
                size="lg"
                asChild
              >
                <Link href="/calculator">
                  Get Started Free
                </Link>
              </Button>
              <div className="space-y-3">
                {freeFeatures.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Monthly Plan */}
          <Card className="border-2 border-blue-200 dark:border-blue-700 bg-gradient-to-br from-white to-blue-50/50 dark:from-slate-900 dark:to-blue-950/20 relative">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-xl font-semibold">Monthly</CardTitle>
              <CardDescription>Perfect for immediate planning needs</CardDescription>
              <div className="text-4xl font-bold mt-4 text-blue-600 dark:text-blue-400">
                ${SUBSCRIPTION_PLANS.monthly.price}
                <span className="text-lg font-normal text-muted-foreground">/month</span>
              </div>
              <div className="text-sm text-muted-foreground">Cancel anytime</div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700" 
                size="lg"
                onClick={() => handleSubscribe('monthly')}
                disabled={isLoading === 'monthly' || status === 'loading'}
              >
                {isLoading === 'monthly' ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : isPremium ? (
                  'Manage Subscription'
                ) : (
                  <>
                    Start Monthly Plan
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
              <div className="space-y-3">
                {SUBSCRIPTION_PLANS.monthly.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <Check className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Annual Plan - Most Popular */}
          <Card className="border-2 border-green-200 dark:border-green-700 bg-gradient-to-br from-white to-green-50/50 dark:from-slate-900 dark:to-green-950/20 relative">
            <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-1">
              <Zap className="mr-1 h-3 w-3" />
              Most Popular
            </Badge>
            <CardHeader className="text-center pb-6 pt-8">
              <CardTitle className="text-xl font-semibold">Annual</CardTitle>
              <CardDescription>Best value for comprehensive planning</CardDescription>
              <div className="text-4xl font-bold mt-4 text-green-600 dark:text-green-400">
                ${SUBSCRIPTION_PLANS.annual.price}
                <span className="text-lg font-normal text-muted-foreground">/year</span>
              </div>
              <div className="text-sm text-green-600 dark:text-green-400 font-medium">
                ${SUBSCRIPTION_PLANS.annual.monthlyEquivalent}/month • {SUBSCRIPTION_PLANS.annual.savings}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700" 
                size="lg"
                onClick={() => handleSubscribe('annual')}
                disabled={isLoading === 'annual' || status === 'loading'}
              >
                {isLoading === 'annual' ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : isPremium ? (
                  'Manage Subscription'
                ) : (
                  <>
                    Start Annual Plan
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
              <div className="space-y-3">
                {SUBSCRIPTION_PLANS.annual.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Premium Features Showcase */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">
              Unlock Advanced Retirement Planning
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Get access to professional-grade tools that help you maximize your Massachusetts retirement benefits
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {premiumFeatures.map((feature, index) => {
              const Icon = feature.icon
              return (
                <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-800/50">
                  <CardHeader className="pb-4">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">
                          {feature.title}
                        </CardTitle>
                        <CardDescription className="text-sm text-muted-foreground leading-relaxed">
                          {feature.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Comparison Table */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">
              Compare Plans
            </h2>
            <p className="text-lg text-muted-foreground">
              See what's included with each plan
            </p>
          </div>

          <Card className="max-w-4xl mx-auto overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 lg:p-6 font-semibold">Features</th>
                    <th className="text-center p-4 lg:p-6 font-semibold">Free</th>
                    <th className="text-center p-4 lg:p-6 font-semibold bg-blue-50 dark:bg-blue-950/20">Premium</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="p-4 lg:p-6 font-medium">Basic Pension Calculator</td>
                    <td className="text-center p-4 lg:p-6">
                      <Check className="h-5 w-5 text-green-500 mx-auto" />
                    </td>
                    <td className="text-center p-4 lg:p-6 bg-blue-50 dark:bg-blue-950/20">
                      <Check className="h-5 w-5 text-green-500 mx-auto" />
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-4 lg:p-6 font-medium">Saved Calculations</td>
                    <td className="text-center p-4 lg:p-6 text-muted-foreground">3 max</td>
                    <td className="text-center p-4 lg:p-6 bg-blue-50 dark:bg-blue-950/20 font-medium">Unlimited</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-4 lg:p-6 font-medium">Social Security Optimization</td>
                    <td className="text-center p-4 lg:p-6 text-muted-foreground">—</td>
                    <td className="text-center p-4 lg:p-6 bg-blue-50 dark:bg-blue-950/20">
                      <Check className="h-5 w-5 text-green-500 mx-auto" />
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-4 lg:p-6 font-medium">Combined Planning Wizard</td>
                    <td className="text-center p-4 lg:p-6 text-muted-foreground">—</td>
                    <td className="text-center p-4 lg:p-6 bg-blue-50 dark:bg-blue-950/20">
                      <Check className="h-5 w-5 text-green-500 mx-auto" />
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-4 lg:p-6 font-medium">Tax Implications Calculator</td>
                    <td className="text-center p-4 lg:p-6 text-muted-foreground">—</td>
                    <td className="text-center p-4 lg:p-6 bg-blue-50 dark:bg-blue-950/20">
                      <Check className="h-5 w-5 text-green-500 mx-auto" />
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-4 lg:p-6 font-medium">PDF Report Generation</td>
                    <td className="text-center p-4 lg:p-6 text-muted-foreground">—</td>
                    <td className="text-center p-4 lg:p-6 bg-blue-50 dark:bg-blue-950/20">
                      <Check className="h-5 w-5 text-green-500 mx-auto" />
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-4 lg:p-6 font-medium">Email Notifications</td>
                    <td className="text-center p-4 lg:p-6 text-muted-foreground">—</td>
                    <td className="text-center p-4 lg:p-6 bg-blue-50 dark:bg-blue-950/20">
                      <Check className="h-5 w-5 text-green-500 mx-auto" />
                    </td>
                  </tr>
                  <tr>
                    <td className="p-4 lg:p-6 font-medium">Customer Support</td>
                    <td className="text-center p-4 lg:p-6 text-muted-foreground">Community</td>
                    <td className="text-center p-4 lg:p-6 bg-blue-50 dark:bg-blue-950/20 font-medium">Priority</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* FAQ Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Can I cancel my subscription anytime?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Yes, you can cancel your subscription at any time. You'll continue to have access to premium
                  features until the end of your current billing period.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Is my data secure?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Absolutely. We use bank-level encryption and security measures to protect your personal and
                  financial information. Your data is never shared with third parties.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What payment methods do you accept?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  We accept all major credit cards (Visa, MasterCard, American Express) and bank transfers
                  through our secure payment processor, Stripe.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Do you offer refunds?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  We offer a 30-day money-back guarantee. If you're not satisfied with our premium features,
                  contact us within 30 days for a full refund.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="max-w-2xl mx-auto bg-gradient-to-br from-blue-50 via-indigo-50/50 to-purple-50/30 dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-purple-950/20 border-0 shadow-xl">
            <CardContent className="pt-8 pb-8">
              <h3 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                Ready to Optimize Your Retirement?
              </h3>
              <p className="text-lg text-muted-foreground mb-6">
                Join thousands of Massachusetts employees who have maximized their retirement benefits
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                  onClick={() => handleSubscribe('annual')}
                  disabled={isLoading !== null}
                >
                  <Crown className="mr-2 h-5 w-5" />
                  Start Premium Plan
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href="/calculator">
                    Try Free Calculator
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
