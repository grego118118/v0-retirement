"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Crown, 
  Check, 
  ArrowLeft,
  User,
  Mail,
  CreditCard,
  Calendar,
  Star,
  Shield,
  Zap,
  Gift
} from "lucide-react"
import { SUBSCRIPTION_PLANS, FREE_TIER_LIMITS } from "@/lib/stripe/config"

export default function SubscriptionSelectPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'monthly' | 'annual'>('free')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Redirect unauthenticated users
  useEffect(() => {
    if (status === "loading") return
    if (!session) {
      router.push("/auth/signin?callbackUrl=/subscription/select")
      return
    }
  }, [session, status, router])

  // Get plan from URL params if provided
  useEffect(() => {
    const plan = searchParams.get('plan')
    if (plan && ['free', 'monthly', 'annual'].includes(plan)) {
      setSelectedPlan(plan as 'free' | 'monthly' | 'annual')
    }
  }, [searchParams])

  const handlePlanSelection = async (plan: 'free' | 'monthly' | 'annual') => {
    if (!session?.user?.email) return

    setLoading(true)
    setError(null)

    try {
      if (plan === 'free') {
        // For free plan, just redirect to dashboard
        router.push('/dashboard?welcome=free')
        return
      }

      // For paid plans, create Stripe checkout session
      const response = await fetch('/api/subscription/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planType: plan,
          userEmail: session.user.email,
          userName: session.user.name
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create checkout session')
      }

      const { checkoutUrl } = await response.json()
      
      // Redirect to Stripe checkout
      window.location.href = checkoutUrl
    } catch (error) {
      console.error('Error creating checkout session:', error)
      setError(error instanceof Error ? error.message : 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-950 dark:via-blue-950/20 dark:to-indigo-950/10 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">Loading...</h2>
          <p className="text-muted-foreground">Please wait while we prepare your subscription options</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-950 dark:via-blue-950/20 dark:to-indigo-950/10">
      <div className="container mx-auto px-4 py-8 lg:py-16 max-w-6xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" size="sm" asChild>
            <Link href="/pricing">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Pricing
            </Link>
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              Choose Your Plan
            </h1>
            <p className="text-muted-foreground mt-1">
              Select the plan that best fits your retirement planning needs
            </p>
          </div>
        </div>

        {/* User Info */}
        <Card className="mb-8 border-0 shadow-lg bg-gradient-to-br from-white to-blue-50/50 dark:from-slate-900 dark:to-blue-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              Welcome, {session.user?.name}!
            </CardTitle>
            <CardDescription className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              {session.user?.email}
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Error Alert */}
        {error && (
          <Alert className="mb-8 border-red-200 bg-red-50 dark:bg-red-950/20">
            <AlertDescription className="text-red-800 dark:text-red-200">
              <strong>Error:</strong> {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Plan Selection */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Free Plan */}
          <Card className={`relative border-2 transition-all duration-200 ${
            selectedPlan === 'free' 
              ? 'border-blue-500 shadow-lg scale-105' 
              : 'border-gray-200 hover:border-gray-300'
          }`}>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 rounded-full bg-gray-100 dark:bg-gray-800">
                <Shield className="h-8 w-8 text-gray-600" />
              </div>
              <CardTitle className="text-xl">Free Account</CardTitle>
              <CardDescription>Basic retirement planning tools</CardDescription>
              <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                $0
                <span className="text-sm font-normal text-muted-foreground">/month</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {FREE_TIER_LIMITS.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
                <div className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span className="text-sm">Up to {FREE_TIER_LIMITS.maxSavedCalculations} saved calculations</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span className="text-sm">{FREE_TIER_LIMITS.maxSocialSecurityCalculations} Social Security calculation</span>
                </div>
              </div>
              <Button 
                className="w-full" 
                variant={selectedPlan === 'free' ? 'default' : 'outline'}
                onClick={() => setSelectedPlan('free')}
                disabled={loading}
              >
                {selectedPlan === 'free' ? 'Selected' : 'Select Free Plan'}
              </Button>
            </CardContent>
          </Card>

          {/* Monthly Plan */}
          <Card className={`relative border-2 transition-all duration-200 ${
            selectedPlan === 'monthly' 
              ? 'border-blue-500 shadow-lg scale-105' 
              : 'border-gray-200 hover:border-gray-300'
          }`}>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 rounded-full bg-blue-100 dark:bg-blue-900">
                <Crown className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-xl">{SUBSCRIPTION_PLANS.monthly.name}</CardTitle>
              <CardDescription>Full access to all premium features</CardDescription>
              <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                ${SUBSCRIPTION_PLANS.monthly.price}
                <span className="text-sm font-normal text-muted-foreground">/month</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {SUBSCRIPTION_PLANS.monthly.features.slice(0, 6).map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
              <Button 
                className="w-full" 
                variant={selectedPlan === 'monthly' ? 'default' : 'outline'}
                onClick={() => setSelectedPlan('monthly')}
                disabled={loading}
              >
                {selectedPlan === 'monthly' ? 'Selected' : 'Select Monthly Plan'}
              </Button>
            </CardContent>
          </Card>

          {/* Annual Plan */}
          <Card className={`relative border-2 transition-all duration-200 ${
            selectedPlan === 'annual' 
              ? 'border-blue-500 shadow-lg scale-105' 
              : 'border-gray-200 hover:border-gray-300'
          }`}>
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-1">
                <Gift className="mr-1 h-3 w-3" />
                Best Value
              </Badge>
            </div>
            <CardHeader className="text-center pt-8">
              <div className="mx-auto mb-4 p-3 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                <Star className="h-8 w-8" />
              </div>
              <CardTitle className="text-xl">{SUBSCRIPTION_PLANS.annual.name}</CardTitle>
              <CardDescription>All premium features with annual savings</CardDescription>
              <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                ${SUBSCRIPTION_PLANS.annual.price}
                <span className="text-sm font-normal text-muted-foreground">/year</span>
              </div>
              <div className="text-sm text-green-600 font-medium">
                {SUBSCRIPTION_PLANS.annual.savings}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {SUBSCRIPTION_PLANS.annual.features.slice(0, 6).map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
              <Button 
                className="w-full" 
                variant={selectedPlan === 'annual' ? 'default' : 'outline'}
                onClick={() => setSelectedPlan('annual')}
                disabled={loading}
              >
                {selectedPlan === 'annual' ? 'Selected' : 'Select Annual Plan'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Continue Button */}
        <div className="text-center">
          <Button 
            size="lg" 
            className="px-8 py-3 text-lg"
            onClick={() => handlePlanSelection(selectedPlan)}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current mr-2"></div>
                Processing...
              </>
            ) : (
              <>
                {selectedPlan === 'free' ? (
                  <>
                    <Shield className="mr-2 h-5 w-5" />
                    Continue with Free Plan
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-5 w-5" />
                    Continue to Payment
                  </>
                )}
              </>
            )}
          </Button>
          
          {selectedPlan !== 'free' && (
            <p className="text-sm text-muted-foreground mt-4">
              You'll be redirected to our secure payment processor to complete your subscription.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
