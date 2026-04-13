"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Check, X, Crown, Loader2, Star, Shield, Lock, Award } from "lucide-react"
import Link from "next/link"
import { SUBSCRIPTION_PLANS } from "@/lib/stripe/config"

interface SubscriptionData {
  isPremium: boolean
  subscriptionPlan: string
  subscriptionStatus: string
}

const features = {
  free: [
    "Basic pension calculations",
    "3 saved calculations",
    "Retirement age calculator",
    "Basic projection table",
    "Community support",
  ],
  freeLimitations: [
    "Advanced scenario modeling",
    "Unlimited saved calculations",
    "PDF export",
    "Social Security integration",
    "Combined calculation wizard",
    "Tax optimization strategies",
    "Monte Carlo analysis",
    "Priority support",
  ],
  premium: [
    "Everything in Free",
    "Unlimited saved calculations",
    "Advanced Social Security optimization",
    "Combined retirement planning wizard",
    "Tax optimization strategies",
    "Monte Carlo risk analysis",
    "Professional PDF reports",
    "Spousal benefit calculations",
    "COLA inflation adjustments",
    "Medicare premium deductions",
    "Priority customer support",
    "Early access to new features",
  ]
}

export function PricingSection() {
  const { data: session, status } = useSession()
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null)

  useEffect(() => {
    async function fetchSubscriptionData() {
      if (status === "loading") return

      try {
        const response = await fetch('/api/subscription/status')
        if (response.ok) {
          const data = await response.json()
          setSubscriptionData(data)
        }
      } catch (error) {
        console.error('Failed to fetch subscription data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSubscriptionData()
  }, [status])

  const handleUpgrade = async (plan: 'monthly' | 'annual') => {
    if (!session?.user?.email) {
      window.location.href = '/auth/signin'
      return
    }

    setCheckoutLoading(plan)

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: plan === 'monthly'
            ? SUBSCRIPTION_PLANS.monthly.priceId
            : SUBSCRIPTION_PLANS.annual.priceId,
          successUrl: `${window.location.origin}/subscription/success`,
          cancelUrl: window.location.href,
        }),
      })

      if (response.ok) {
        const { checkoutUrl } = await response.json()
        window.location.href = checkoutUrl
      } else {
        throw new Error('Failed to create checkout session')
      }
    } catch (error) {
      console.error('Checkout error:', error)
      alert('Failed to start checkout process. Please try again.')
    } finally {
      setCheckoutLoading(null)
    }
  }

  return (
    <section className="py-12">
      <div className="container lg:px-0">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-white mb-4">
            Choose Your Retirement Planning Level
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-lg max-w-2xl mx-auto">
            Start with our free calculator or unlock advanced features to optimize your Massachusetts state pension
          </p>
        </div>

        {/* Current Subscription Alert */}
        {subscriptionData?.isPremium && (
          <Alert className="max-w-2xl mx-auto mb-12 border-blue-200 bg-blue-50 shadow-sm">
            <Crown className="h-5 w-5 text-blue-600" />
            <AlertDescription className="text-blue-800 font-medium">
              You currently have a Premium subscription ({subscriptionData.subscriptionPlan}).
              <Link href="/subscription/portal" className="underline ml-2 hover:text-blue-900 transition-colors">
                Manage your subscription
              </Link>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Free Plan */}
          <Card className="relative bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow flex flex-col">
            <CardHeader className="text-center pb-6 border-b border-slate-50 dark:border-slate-700">
              <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">Free Calculator</CardTitle>
              <CardDescription className="text-slate-500 dark:text-slate-400">Perfect for basic pension planning</CardDescription>
              <div className="text-5xl font-bold text-slate-900 dark:text-white mt-6">$0</div>
              <div className="text-slate-400 dark:text-slate-500 text-sm mt-1 uppercase tracking-widest font-bold">Forever free</div>
            </CardHeader>
            <CardContent className="space-y-6 pt-8 flex-grow">
              <div className="space-y-4">
                {features.free.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">{feature}</span>
                  </div>
                ))}
                {features.freeLimitations.slice(0, 4).map((feature, index) => (
                  <div key={index} className="flex items-center gap-3 opacity-40">
                    <X className="h-5 w-5 text-slate-300 flex-shrink-0" />
                    <span className="text-sm text-slate-400 dark:text-slate-500 line-through">{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
            <div className="p-6 pt-0">
              <Button
                className="w-full h-12 font-bold"
                variant="outline"
                disabled={!session}
                asChild
              >
                <Link href="/calculator">
                  {session ? 'Current Plan' : 'Start Free Calculator'}
                </Link>
              </Button>
            </div>
          </Card>

          {/* Monthly Premium Plan */}
          <Card className="relative bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow flex flex-col overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1 bg-mrs-navy-800"></div>
            <CardHeader className="text-center pb-6 border-b border-slate-50 dark:border-slate-700">
              <CardTitle className="text-2xl font-heading font-bold text-mrs-navy-900 dark:text-white flex items-center justify-center gap-2">
                <Crown className="h-5 w-5 text-mrs-navy-700 dark:text-slate-400" />
                Premium Monthly
              </CardTitle>
              <CardDescription className="text-slate-500 dark:text-slate-400">Full access to all features</CardDescription>
              <div className="text-5xl font-heading font-bold text-mrs-navy-900 dark:text-white mt-6">
                ${SUBSCRIPTION_PLANS.monthly.price}
                <span className="text-lg font-sans font-normal text-slate-400 dark:text-slate-500 ml-1">/mo</span>
              </div>
              <div className="text-slate-400 dark:text-slate-500 text-sm mt-1 uppercase tracking-widest font-bold">Billed monthly</div>
            </CardHeader>
            <CardContent className="space-y-6 pt-8 flex-grow">
              <div className="space-y-4">
                {features.premium.slice(0, 8).map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-mrs-blue-600 flex-shrink-0" />
                    <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">{feature}</span>
                  </div>
                ))}
                <div className="text-xs text-center text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-700/50 py-2 rounded-lg font-bold uppercase tracking-tighter italic">
                  + 4 additional premium features
                </div>
              </div>
            </CardContent>
            <div className="p-6 pt-0">
              <Button
                className="w-full h-12 bg-mrs-navy-800 hover:bg-mrs-navy-900 text-white font-bold shadow-lg shadow-mrs-navy-900/10"
                onClick={() => handleUpgrade('monthly')}
                disabled={checkoutLoading === 'monthly' || subscriptionData?.isPremium}
              >
                {checkoutLoading === 'monthly' ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : subscriptionData?.isPremium ? (
                  'Current Plan'
                ) : (
                  'Choose Monthly'
                )}
              </Button>
              <p className="text-xs text-center text-slate-400 mt-4 font-medium uppercase tracking-widest">
                Cancel anytime
              </p>
            </div>
          </Card>

          {/* Annual Premium Plan */}
          <Card className="relative bg-white dark:bg-slate-800 border-mrs-gold-400/30 shadow-xl flex flex-col overflow-hidden ring-2 ring-mrs-gold-400/20 scale-[1.02] hover:scale-[1.04] transition-transform duration-200">
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-mrs-gold-500 to-mrs-gold-600"></div>
            <Badge className="absolute top-4 right-4 bg-gradient-to-r from-mrs-gold-400 to-mrs-gold-600 text-white font-bold border-none shadow-sm">
              <Star className="mr-1 h-3 w-3 fill-current" />
              BEST VALUE
            </Badge>
            <CardHeader className="text-center pb-6 border-b border-slate-50 dark:border-slate-700 pt-10">
              <CardTitle className="text-2xl font-heading font-bold text-mrs-navy-900 dark:text-white flex items-center justify-center gap-2">
                <Crown className="h-5 w-5 text-mrs-gold-600" />
                Premium Annual
              </CardTitle>
              <CardDescription className="text-slate-500 dark:text-slate-400">Save 17% with annual billing</CardDescription>
              <div className="text-5xl font-heading font-bold text-mrs-navy-900 dark:text-white mt-6">
                ${SUBSCRIPTION_PLANS.annual.price}
                <span className="text-lg font-sans font-normal text-slate-400 dark:text-slate-500 ml-1">/yr</span>
              </div>
              <div className="text-mrs-gold-600 font-bold text-sm mt-2 flex items-center justify-center gap-1 bg-mrs-gold-50 dark:bg-mrs-gold-500/10 py-1 px-3 rounded-full w-fit mx-auto border border-mrs-gold-200 dark:border-mrs-gold-500/30">
                <Check className="w-3 h-3" />
                {SUBSCRIPTION_PLANS.annual.savings}
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-8 flex-grow">
              <div className="space-y-4">
                {features.premium.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-mrs-gold-600 flex-shrink-0" />
                    <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
            <div className="p-6 pt-0">
              <Button
                className="w-full h-12 bg-gradient-to-r from-mrs-gold-500 to-mrs-gold-600 hover:from-mrs-gold-400 hover:to-mrs-gold-500 text-white font-bold shadow-lg shadow-mrs-gold-600/20"
                onClick={() => handleUpgrade('annual')}
                disabled={checkoutLoading === 'annual' || subscriptionData?.isPremium}
              >
                {checkoutLoading === 'annual' ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : subscriptionData?.isPremium ? (
                  'Current Plan'
                ) : (
                  'Choose Annual'
                )}
              </Button>
              <p className="text-[10px] text-center text-slate-400 mt-4 font-bold uppercase tracking-widest">
                30-day money-back guarantee
              </p>
            </div>
          </Card>
        </div>

        {/* Trust Badges */}
        <div className="flex flex-wrap items-center justify-center gap-6 mt-12 text-sm text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-green-600" />
            <span>Bank-Level Security</span>
          </div>
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-blue-600" />
            <span>No Data Stored</span>
          </div>
          <div className="flex items-center gap-2">
            <Award className="h-4 w-4 text-mrs-gold-600" />
            <span>MSRB-Accurate Formulas</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-600" />
            <span>Cancel Anytime</span>
          </div>
        </div>

        {/* Enterprise Section */}
        <div className="mt-20">
          <div className="max-w-4xl mx-auto bg-slate-100 dark:bg-slate-800 rounded-3xl p-8 md:p-12 border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">For Organizations</h3>
              <p className="text-slate-600 dark:text-slate-300">
                HR departments, unions, and financial advisors. White-label solutions, bulk licenses, and custom integrations available.
              </p>
            </div>
            <Button variant="outline" size="lg" className="border-slate-300 font-bold bg-white shrink-0 h-14 px-8" asChild>
              <Link href="/contact">Contact Sales Team</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )

} 