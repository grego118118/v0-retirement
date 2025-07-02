"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Check, Crown, Star, CreditCard, Info } from "lucide-react"
import Link from "next/link"

const premiumFeatures = [
  "Unlimited saved calculations",
  "PDF & Excel export",
  "Advanced scenario modeling",
  "Retirement date comparison tools",
  "Social Security integration",
  "401k/403b planning tools",
  "Priority email support",
  "Personalized retirement roadmap",
  "What-if analysis tools",
  "Spouse benefit calculator"
]

const testimonials = [
  {
    name: "Sarah M.",
    role: "MA State Teacher",
    quote: "The Premium features helped me optimize my retirement date and maximize my benefits!"
  },
  {
    name: "John D.",
    role: "Highway Department",
    quote: "Being able to compare different scenarios side-by-side was invaluable for my retirement planning."
  },
  {
    name: "Maria L.",
    role: "Public Health",
    quote: "The Social Security integration gave me the complete picture I needed for my retirement decision."
  }
]

export default function SubscribePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState<string | null>(null)

  const handleSubscribe = async (planType: 'monthly' | 'annual') => {
    if (status === 'loading') return

    if (!session) {
      // Redirect to sign in
      router.push('/auth/signin?callbackUrl=/subscribe')
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
      router.push(checkoutUrl)
    } catch (error) {
      console.error('Error creating checkout session:', error)
      alert('Something went wrong. Please try again.')
    } finally {
      setIsLoading(null)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="text-center mb-12">
        <Badge className="mb-4 bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
          <Crown className="mr-1 h-3 w-3" />
          Premium Upgrade
        </Badge>
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          Unlock Advanced Retirement Planning
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Get unlimited access to premium features and take control of your Massachusetts state pension planning
        </p>
      </div>

      {!session && status !== 'loading' && (
        <Alert className="mb-8 max-w-4xl mx-auto">
          <Info className="h-4 w-4" />
          <AlertDescription>
            You'll need to sign in before subscribing. Don't worry - we'll bring you back here after signing in.
          </AlertDescription>
        </Alert>
      )}

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
        <Card>
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl">Monthly</CardTitle>
            <CardDescription>Perfect for immediate planning needs</CardDescription>
            <div className="text-4xl font-bold mt-4">
              $9.99
              <span className="text-lg font-normal text-muted-foreground">/month</span>
            </div>
            <div className="text-muted-foreground">Cancel anytime</div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              className="w-full" 
              size="lg"
              onClick={() => handleSubscribe('monthly')}
              disabled={isLoading === 'monthly' || status === 'loading'}
            >
              {isLoading === 'monthly' ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Start Monthly Plan
                </>
              )}
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              30-day money-back guarantee
            </p>
          </CardContent>
        </Card>

        <Card className="relative border-primary">
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <Badge className="bg-primary text-primary-foreground">
              <Star className="mr-1 h-3 w-3" />
              Best Value - Save 34%
            </Badge>
          </div>
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl">Annual</CardTitle>
            <CardDescription>Best value for long-term planning</CardDescription>
            <div className="text-4xl font-bold mt-4">
              $79
              <span className="text-lg font-normal text-muted-foreground">/year</span>
            </div>
            <div className="text-muted-foreground">
              <span className="line-through">$119.88</span> - Save $40.88
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              className="w-full" 
              size="lg"
              onClick={() => handleSubscribe('annual')}
              disabled={isLoading === 'annual' || status === 'loading'}
            >
              {isLoading === 'annual' ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Start Annual Plan
                </>
              )}
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              30-day money-back guarantee
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Features List */}
      <Card className="max-w-4xl mx-auto mb-16">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Everything in Premium</CardTitle>
          <CardDescription>
            All the tools you need for comprehensive retirement planning
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {premiumFeatures.map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Testimonials */}
      <div className="max-w-6xl mx-auto mb-16">
        <h2 className="text-3xl font-bold text-center mb-8">
          What Our Premium Users Say
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground mb-4">
                  "{testimonial.quote}"
                </p>
                <div>
                  <div className="font-medium text-sm">{testimonial.name}</div>
                  <div className="text-xs text-muted-foreground">{testimonial.role}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Can I cancel anytime?</h4>
            <p className="text-sm text-muted-foreground">
              Yes, you can cancel your subscription at any time. Your access will continue until the end of your billing period.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-2">Do you offer refunds?</h4>
            <p className="text-sm text-muted-foreground">
              We offer a 30-day money-back guarantee. If you're not satisfied, contact us for a full refund.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-2">What payment methods do you accept?</h4>
            <p className="text-sm text-muted-foreground">
              We accept all major credit cards (Visa, MasterCard, American Express) and PayPal through our secure payment processor.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-2">Is my data secure?</h4>
            <p className="text-sm text-muted-foreground">
              Yes, all your data is encrypted and stored securely. We never share your personal information with third parties.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 