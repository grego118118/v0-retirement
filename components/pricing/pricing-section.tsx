"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Check, X, Crown, Loader2, Star } from "lucide-react"
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
    <section className="py-16 bg-muted/30">
      <div className="container px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight mb-4">
            Choose Your Retirement Planning Level
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Start with our free calculator or unlock advanced features to optimize your Massachusetts state pension
          </p>
        </div>

        {/* Current Subscription Alert */}
        {subscriptionData?.isPremium && (
          <Alert className="max-w-2xl mx-auto mb-8 border-green-200 bg-green-50">
            <Crown className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              You currently have a Premium subscription ({subscriptionData.subscriptionPlan}).
              <Link href="/subscription/portal" className="underline ml-1">
                Manage your subscription
              </Link>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Free Plan */}
          <Card className="relative">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl">Free Calculator</CardTitle>
              <CardDescription>Perfect for basic pension planning</CardDescription>
              <div className="text-4xl font-bold mt-4">$0</div>
              <div className="text-muted-foreground">Forever free</div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {features.free.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
                {features.freeLimitations.slice(0, 4).map((feature, index) => (
                  <div key={index} className="flex items-center gap-3 opacity-50">
                    <X className="h-5 w-5 text-red-500 flex-shrink-0" />
                    <span className="text-sm line-through">{feature}</span>
                  </div>
                ))}
              </div>
              <Button
                className="w-full"
                variant="outline"
                disabled={!session}
                asChild
              >
                <Link href="/calculator">
                  {session ? 'Current Plan' : 'Start Free Calculator'}
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Monthly Premium Plan */}
          <Card className="relative">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl flex items-center justify-center gap-2">
                <Crown className="h-5 w-5 text-amber-600" />
                Premium Monthly
              </CardTitle>
              <CardDescription>Full access to all features</CardDescription>
              <div className="text-4xl font-bold mt-4">
                ${SUBSCRIPTION_PLANS.monthly.price}
                <span className="text-lg font-normal text-muted-foreground">/month</span>
              </div>
              <div className="text-muted-foreground">Billed monthly</div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {features.premium.slice(0, 8).map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
                <div className="text-sm text-muted-foreground">+ 4 more features...</div>
              </div>
              <Button
                className="w-full bg-amber-600 hover:bg-amber-700"
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
              <p className="text-xs text-center text-muted-foreground">
                Cancel anytime
              </p>
            </CardContent>
          </Card>

          {/* Annual Premium Plan */}
          <Card className="relative border-2 border-amber-300 shadow-lg">
            <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-amber-500">
              <Star className="mr-1 h-3 w-3" />
              Best Value
            </Badge>
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl flex items-center justify-center gap-2">
                <Crown className="h-5 w-5 text-amber-600" />
                Premium Annual
              </CardTitle>
              <CardDescription>Save 17% with annual billing</CardDescription>
              <div className="text-4xl font-bold mt-4">
                ${SUBSCRIPTION_PLANS.annual.price}
                <span className="text-lg font-normal text-muted-foreground">/year</span>
              </div>
              <div className="text-green-600 font-medium">
                {SUBSCRIPTION_PLANS.annual.savings}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {features.premium.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
              <Button
                className="w-full bg-amber-600 hover:bg-amber-700"
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
              <p className="text-xs text-center text-muted-foreground">
                30-day money-back guarantee
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Enterprise Section */}
        <div className="mt-12 text-center">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>For Organizations</CardTitle>
              <CardDescription>
                HR departments, unions, and financial advisors
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                White-label solutions, bulk licenses, and custom integrations available
              </p>
              <Button variant="outline" asChild>
                <Link href="/contact">Contact Sales</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
} 