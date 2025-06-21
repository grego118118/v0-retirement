"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Crown, Lock, Star, ArrowRight, CheckCircle, AlertTriangle, Calendar, CreditCard } from "lucide-react"
import Link from "next/link"
import { PREMIUM_FEATURES, FREE_TIER_LIMITS, getSubscriptionDisplayStatus, SUBSCRIPTION_PLANS } from "@/lib/stripe/config"
import type { SubscriptionStatus, SubscriptionPlan } from "@/lib/stripe/config"

interface PremiumGateProps {
  children: React.ReactNode
  feature: keyof typeof PREMIUM_FEATURES
  title?: string
  description?: string
  showUpgrade?: boolean
  redirectToCheckout?: boolean
}

interface SubscriptionResponse {
  isPremium: boolean
  subscriptionStatus: SubscriptionStatus | 'inactive'
  subscriptionPlan: SubscriptionPlan
  savedCalculationsCount: number
  currentPeriodEnd?: string
  cancelAtPeriodEnd?: boolean
  trialEnd?: string
  customerId?: string
  subscriptionId?: string
  usageLimits: {
    maxSavedCalculations: number
    maxSocialSecurityCalculations: number
    maxWizardUses: number
    maxPdfReports: number
  }
  currentUsage: {
    savedCalculations: number
    socialSecurityCalculations: number
    wizardUses: number
    pdfReports: number
  }
}

export function EnhancedPremiumGate({ 
  children, 
  feature, 
  title, 
  description,
  showUpgrade = true,
  redirectToCheckout = false
}: PremiumGateProps) {
  const { data: session, status } = useSession()
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [checkoutLoading, setCheckoutLoading] = useState(false)

  const featureConfig = PREMIUM_FEATURES[feature]

  useEffect(() => {
    async function checkSubscription() {
      if (status === "loading") return
      
      try {
        const response = await fetch('/api/subscription/status')
        if (response.ok) {
          const data = await response.json()
          setSubscriptionData(data)
          console.log(`EnhancedPremiumGate [${feature}]: isPremium=${data.isPremium}, subscriptionStatus=${data.subscriptionStatus}`)
        }
      } catch (error) {
        console.error('Failed to check subscription status:', error)
        // Default to free user on error
        setSubscriptionData({
          isPremium: false,
          subscriptionStatus: 'inactive',
          subscriptionPlan: 'free',
          savedCalculationsCount: 0,
          usageLimits: {
            maxSavedCalculations: FREE_TIER_LIMITS.maxSavedCalculations,
            maxSocialSecurityCalculations: FREE_TIER_LIMITS.maxSocialSecurityCalculations,
            maxWizardUses: FREE_TIER_LIMITS.maxWizardUses,
            maxPdfReports: FREE_TIER_LIMITS.maxPdfReports,
          },
          currentUsage: {
            savedCalculations: 0,
            socialSecurityCalculations: 0,
            wizardUses: 0,
            pdfReports: 0,
          }
        })
      } finally {
        setLoading(false)
      }
    }

    checkSubscription()
  }, [status, feature])

  const handleUpgradeClick = async (plan: 'monthly' | 'annual') => {
    if (!session?.user?.email) {
      window.location.href = '/auth/signin'
      return
    }

    setCheckoutLoading(true)
    
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
      setCheckoutLoading(false)
    }
  }

  // Show loading state
  if (loading || status === "loading") {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Show login prompt if not authenticated
  if (!session) {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Sign In Required
          </CardTitle>
          <CardDescription>
            Please sign in to access this feature.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/auth/signin">
            <Button className="w-full">
              Sign In
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  if (!subscriptionData) {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Unable to Load Subscription Status
          </CardTitle>
          <CardDescription>
            Please try refreshing the page or contact support if the issue persists.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => window.location.reload()} className="w-full">
            Refresh Page
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Authenticated users always get premium access
  if (session?.user) {
    return <>{children}</>
  }

  // Check if feature requires premium and user doesn't have it
  const upgradeRequired = featureConfig.required && !subscriptionData.isPremium

  // Check usage limits for free users
  const isLimitReached = checkUsageLimit(feature, subscriptionData)

  // Show premium content if user has access and hasn't reached limits
  if (!upgradeRequired && !isLimitReached) {
    return <>{children}</>
  }

  // Show upgrade prompt if showUpgrade is true
  if (showUpgrade) {
    return (
      <Card className="max-w-3xl mx-auto border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-6 w-6 text-amber-600" />
            {title || featureConfig.name}
            <Badge className="bg-amber-100 text-amber-800">
              Premium
            </Badge>
          </CardTitle>
          <CardDescription>
            {description || featureConfig.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isLimitReached && (
            <Alert className="border-orange-200 bg-orange-50">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <AlertDescription>
                You've reached the free tier limit for this feature. 
                {getUsageLimitMessage(feature, subscriptionData)}
              </AlertDescription>
            </Alert>
          )}

          {subscriptionData.subscriptionStatus === 'past_due' && (
            <Alert className="border-red-200 bg-red-50">
              <CreditCard className="h-4 w-4 text-red-600" />
              <AlertDescription>
                Your subscription payment is past due. Please update your payment method to continue using premium features.
              </AlertDescription>
            </Alert>
          )}

          {subscriptionData.cancelAtPeriodEnd && (
            <Alert className="border-blue-200 bg-blue-50">
              <Calendar className="h-4 w-4 text-blue-600" />
              <AlertDescription>
                Your subscription will end on {subscriptionData.currentPeriodEnd ? new Date(subscriptionData.currentPeriodEnd).toLocaleDateString() : 'the current period end'}. 
                Reactivate to continue using premium features.
              </AlertDescription>
            </Alert>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3 text-lg">Premium Features Include:</h4>
              <ul className="text-sm space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                  Advanced Social Security optimization with spousal benefits
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                  Combined retirement planning wizard
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                  Unlimited saved calculations and scenarios
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                  Professional PDF report generation
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                  Advanced tax optimization strategies
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                  Monte Carlo risk analysis
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                  Priority customer support
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-lg">Your Current Status:</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Plan:</span>
                  <Badge variant="outline" className="capitalize">
                    {subscriptionData.subscriptionPlan}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className={subscriptionData.isPremium ? 'text-green-600' : 'text-orange-600'}>
                    {subscriptionData.isPremium ? 'Premium Access' : 'Limited Access'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Saved Calculations:</span>
                  <span>
                    {subscriptionData.currentUsage.savedCalculations}/
                    {subscriptionData.usageLimits.maxSavedCalculations === -1 ? '∞' : subscriptionData.usageLimits.maxSavedCalculations}
                  </span>
                </div>
                {subscriptionData.currentPeriodEnd && (
                  <div className="flex justify-between">
                    <span>
                      {subscriptionData.cancelAtPeriodEnd ? 'Ends:' : 'Renews:'}
                    </span>
                    <span>{new Date(subscriptionData.currentPeriodEnd).toLocaleDateString()}</span>
                  </div>
                )}
                {subscriptionData.trialEnd && (
                  <div className="flex justify-between">
                    <span>Trial Ends:</span>
                    <span>{new Date(subscriptionData.trialEnd).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="text-center p-4 border rounded-lg bg-white">
                <h5 className="font-semibold mb-2">Monthly Plan</h5>
                <div className="text-2xl font-bold text-blue-600 mb-1">$19.99</div>
                <div className="text-sm text-gray-600 mb-3">per month</div>
                <Button 
                  onClick={() => handleUpgradeClick('monthly')}
                  disabled={checkoutLoading}
                  className="w-full"
                  variant="outline"
                >
                  {checkoutLoading ? 'Loading...' : 'Choose Monthly'}
                </Button>
              </div>
              <div className="text-center p-4 border-2 border-amber-300 rounded-lg bg-white relative">
                <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-amber-500">
                  Best Value
                </Badge>
                <h5 className="font-semibold mb-2">Annual Plan</h5>
                <div className="text-2xl font-bold text-amber-600 mb-1">$199.99</div>
                <div className="text-sm text-gray-600 mb-1">per year</div>
                <div className="text-xs text-green-600 font-medium mb-3">Save $39.89 (17% off)</div>
                <Button 
                  onClick={() => handleUpgradeClick('annual')}
                  disabled={checkoutLoading}
                  className="w-full bg-amber-600 hover:bg-amber-700"
                >
                  {checkoutLoading ? 'Loading...' : 'Choose Annual'}
                </Button>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            {subscriptionData.customerId && (
              <Link href="/subscription/portal" className="flex-1">
                <Button variant="outline" className="w-full">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Manage Subscription
                </Button>
              </Link>
            )}
            <Link href="/pricing" className="flex-1">
              <Button variant="outline" className="w-full">
                View All Features
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Don't show anything if showUpgrade is false
  return null
}

function checkUsageLimit(feature: keyof typeof PREMIUM_FEATURES, data: SubscriptionResponse): boolean {
  if (data.isPremium) return false // Premium users have no limits

  switch (feature) {
    case 'social_security':
      return data.currentUsage.socialSecurityCalculations >= data.usageLimits.maxSocialSecurityCalculations
    case 'combined_wizard':
      return data.currentUsage.wizardUses >= data.usageLimits.maxWizardUses
    case 'pdf_reports':
      return data.currentUsage.pdfReports >= data.usageLimits.maxPdfReports
    case 'unlimited_calculations':
      return data.currentUsage.savedCalculations >= data.usageLimits.maxSavedCalculations
    default:
      return false
  }
}

function getUsageLimitMessage(feature: keyof typeof PREMIUM_FEATURES, data: SubscriptionResponse): string {
  switch (feature) {
    case 'social_security':
      return ` You can use the Social Security calculator ${data.usageLimits.maxSocialSecurityCalculations} time${data.usageLimits.maxSocialSecurityCalculations !== 1 ? 's' : ''} on the free plan.`
    case 'combined_wizard':
      return ' The Combined Calculation Wizard is only available to premium subscribers.'
    case 'pdf_reports':
      return ' PDF report generation is only available to premium subscribers.'
    case 'unlimited_calculations':
      return ` You can save up to ${data.usageLimits.maxSavedCalculations} calculations on the free plan.`
    default:
      return ' This feature requires a premium subscription.'
  }
}
