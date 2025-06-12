"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useState, Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { CreditCard, Lock, ArrowLeft, CheckCircle } from "lucide-react"
import Link from "next/link"

function DemoCheckoutContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  
  const plan = searchParams.get('plan')
  const email = searchParams.get('email')
  
  const planDetails = {
    monthly: {
      name: "Monthly Plan",
      price: "$9.99",
      billing: "per month",
      description: "Cancel anytime"
    },
    annual: {
      name: "Annual Plan", 
      price: "$79",
      billing: "per year",
      description: "Save 34% compared to monthly"
    }
  }
  
  const selectedPlan = planDetails[plan as keyof typeof planDetails]
  
  if (!selectedPlan) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-md">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground mb-4">Invalid plan selected</p>
            <Button asChild>
              <Link href="/subscribe">Back to Pricing</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handlePayment = async () => {
    setIsProcessing(true)
    
    try {
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
        throw new Error('Failed to complete subscription')
      }
      
      const result = await response.json()
      console.log('Premium access granted:', result)
      
      setIsProcessing(false)
      setIsComplete(true)
      
      // Redirect to success page after a delay
      setTimeout(() => {
        router.push('/subscribe/success')
      }, 2000)
      
    } catch (error) {
      console.error('Error completing subscription:', error)
      setIsProcessing(false)
      // Still show success for demo purposes, but log the error
      setIsComplete(true)
      setTimeout(() => {
        router.push('/subscribe/success')
      }, 2000)
    }
  }

  if (isComplete) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-md">
        <Card className="text-center">
          <CardContent className="pt-6">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Payment Successful!</h2>
            <p className="text-muted-foreground mb-4">
              Welcome to Premium! You'll be redirected shortly.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-md">
      <div className="mb-4">
        <Button variant="ghost" asChild>
          <Link href="/subscribe">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Plans
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="text-center">
          <Badge className="mb-2 bg-blue-100 text-blue-800 mx-auto">
            Demo Checkout
          </Badge>
          <CardTitle>Complete Your Subscription</CardTitle>
          <CardDescription>
            This is a demonstration of the checkout process
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Plan Summary */}
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold">{selectedPlan.name}</h3>
                <p className="text-sm text-muted-foreground">{selectedPlan.description}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">{selectedPlan.price}</div>
                <div className="text-sm text-muted-foreground">{selectedPlan.billing}</div>
              </div>
            </div>
          </div>

          <Alert>
            <Lock className="h-4 w-4" />
            <AlertDescription>
              This is a demo environment. No actual payment will be processed.
            </AlertDescription>
          </Alert>

          {/* Demo Payment Form */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email || ""} disabled />
            </div>
            
            <div>
              <Label htmlFor="card">Card Number</Label>
              <Input 
                id="card" 
                placeholder="4242 4242 4242 4242" 
                disabled={isProcessing}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="expiry">Expiry</Label>
                <Input 
                  id="expiry" 
                  placeholder="12/24" 
                  disabled={isProcessing}
                />
              </div>
              <div>
                <Label htmlFor="cvc">CVC</Label>
                <Input 
                  id="cvc" 
                  placeholder="123" 
                  disabled={isProcessing}
                />
              </div>
            </div>
          </div>

          <Button 
            className="w-full" 
            size="lg"
            onClick={handlePayment}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="mr-2 h-4 w-4" />
                Subscribe to {selectedPlan.name}
              </>
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            By subscribing, you agree to our Terms of Service and Privacy Policy.
            30-day money-back guarantee.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default function DemoCheckoutPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto py-8 px-4 max-w-md">
        <Card>
          <CardContent className="pt-6 text-center">
            <p>Loading...</p>
          </CardContent>
        </Card>
      </div>
    }>
      <DemoCheckoutContent />
    </Suspense>
  )
}