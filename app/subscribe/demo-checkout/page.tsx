"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Check, 
  Crown, 
  CreditCard, 
  Shield, 
  ArrowLeft,
  Loader2
} from "lucide-react"
import { SUBSCRIPTION_PLANS } from "@/lib/stripe/config"
import Link from "next/link"

function DemoCheckoutContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  const [isProcessing, setIsProcessing] = useState(false)
  const [isComplete, setIsComplete] = useState(false)

  const plan = searchParams.get('plan') as 'monthly' | 'annual'
  const email = searchParams.get('email')

  useEffect(() => {
    if (!plan || !email || !session) {
      router.push('/pricing')
    }
  }, [plan, email, session, router])

  if (!plan || !email || !session) {
    return null
  }

  const planConfig = SUBSCRIPTION_PLANS[plan]

  const handlePayment = async () => {
    setIsProcessing(true)

    try {
      // Debug logging to verify variables are defined
      console.log('Demo checkout - handlePayment called with plan:', plan)
      console.log('Demo checkout - email:', email)

      if (!plan) {
        throw new Error('Plan type is not defined')
      }

      if (!['monthly', 'annual'].includes(plan)) {
        throw new Error(`Invalid plan type: ${plan}`)
      }

      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Call API to complete the demo subscription and grant premium access
      const response = await fetch('/api/subscription/complete-demo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planType: plan })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(`Failed to complete subscription: ${response.status} - ${errorData.error || 'Unknown error'}`)
      }

      const result = await response.json()
      console.log('Premium access granted:', result)

      // Trigger subscription update event for immediate UI refresh
      if (typeof window !== 'undefined') {
        console.log('Demo checkout - dispatching subscription-updated event with plan:', plan)
        window.dispatchEvent(new CustomEvent('subscription-updated', {
          detail: {
            status: 'active',
            plan: plan, // ✅ Fixed: using 'plan' variable instead of undefined 'planType'
            source: 'demo-checkout'
          }
        }))
      }

      setIsProcessing(false)
      setIsComplete(true)

      // Redirect to success page after a delay
      setTimeout(() => {
        router.push('/subscribe/success')
      }, 2000)

    } catch (error) {
      console.error('Error processing payment:', error)
      setIsProcessing(false)

      // Enhanced error handling
      const errorMessage = error instanceof Error ? error.message : 'Payment processing failed. Please try again.'
      alert(errorMessage)
    }
  }

  if (isComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50/30 to-indigo-50/20 dark:from-green-950/20 dark:via-blue-950/20 dark:to-indigo-950/10 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-6">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-green-600 mb-2">Payment Successful!</h2>
            <p className="text-muted-foreground mb-4">
              Your premium subscription is now active. Redirecting to success page...
            </p>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-950 dark:via-blue-950/20 dark:to-indigo-950/10">
      <div className="container mx-auto px-4 py-8 lg:py-16">
        {/* Header */}
        <div className="text-center mb-8">
          <Badge className="mb-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2">
            <Shield className="mr-2 h-4 w-4" />
            Demo Checkout
          </Badge>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Complete Your Subscription
          </h1>
          <p className="text-muted-foreground">
            This is a demo checkout process for testing purposes
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-blue-600" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{planConfig.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {plan === 'annual' ? 'Billed annually' : 'Billed monthly'}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg">
                      ${planConfig.price}
                      <span className="text-sm font-normal text-muted-foreground">
                        /{plan === 'annual' ? 'year' : 'month'}
                      </span>
                    </div>
                    {plan === 'annual' && (
                      <div className="text-sm text-green-600">
                        Save $19.89 (17% off)
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h4 className="font-medium">Included Features:</h4>
                  {planConfig.features.slice(0, 4).map((feature, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                  {planConfig.features.length > 4 && (
                    <div className="text-sm text-muted-foreground">
                      +{planConfig.features.length - 4} more features
                    </div>
                  )}
                </div>

                <Separator />

                <div className="flex justify-between items-center font-bold">
                  <span>Total</span>
                  <span>${planConfig.price}/{plan === 'annual' ? 'year' : 'month'}</span>
                </div>
              </CardContent>
            </Card>

            {/* Payment Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-blue-600" />
                  Demo Payment
                </CardTitle>
                <CardDescription>
                  This is a simulated payment process for demonstration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Email</label>
                    <div className="mt-1 p-3 bg-slate-100 dark:bg-slate-800 rounded-md">
                      {email}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Demo Card Information</label>
                    <div className="mt-1 p-3 bg-slate-100 dark:bg-slate-800 rounded-md text-sm text-muted-foreground">
                      Card: •••• •••• •••• 4242<br />
                      Exp: 12/25 • CVC: 123
                    </div>
                  </div>
                </div>

                <Button 
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700" 
                  size="lg"
                  onClick={handlePayment}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing Payment...
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Complete Demo Payment
                    </>
                  )}
                </Button>

                <div className="text-center">
                  <Button variant="ghost" asChild>
                    <Link href="/pricing">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back to Pricing
                    </Link>
                  </Button>
                </div>

                <div className="text-xs text-muted-foreground text-center">
                  <Shield className="h-3 w-3 inline mr-1" />
                  This is a demo environment. No real payment will be processed.
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function DemoCheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-950 dark:via-blue-950/20 dark:to-indigo-950/10 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">Loading checkout...</h2>
          <p className="text-muted-foreground">Please wait while we prepare your subscription</p>
        </div>
      </div>
    }>
      <DemoCheckoutContent />
    </Suspense>
  )
}
