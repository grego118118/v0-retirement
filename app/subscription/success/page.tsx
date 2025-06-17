"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  CheckCircle, 
  Crown, 
  ArrowRight,
  Mail,
  CreditCard,
  Calendar,
  Gift,
  Star,
  Shield
} from "lucide-react"

interface SubscriptionData {
  isPremium: boolean
  planName: string
  subscriptionStatus: string
  currentPeriodEnd?: string
}

export default function SubscriptionSuccessPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const sessionId = searchParams.get('session_id')

  useEffect(() => {
    if (status === "loading") return
    if (!session) {
      router.push("/auth/signin?callbackUrl=/subscription/success")
      return
    }

    // Fetch updated subscription status
    const fetchSubscriptionStatus = async () => {
      try {
        const response = await fetch('/api/subscription/status')
        if (response.ok) {
          const data = await response.json()
          setSubscriptionData(data)
        } else {
          setError('Failed to fetch subscription status')
        }
      } catch (error) {
        console.error('Error fetching subscription status:', error)
        setError('An error occurred while fetching your subscription details')
      } finally {
        setLoading(false)
      }
    }

    // Add a small delay to allow webhook processing
    const timer = setTimeout(fetchSubscriptionStatus, 2000)
    return () => clearTimeout(timer)
  }, [session, status, router])

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-950 dark:via-blue-950/20 dark:to-indigo-950/10 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">Processing your subscription...</h2>
          <p className="text-muted-foreground">Please wait while we activate your premium features</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-950 dark:via-blue-950/20 dark:to-indigo-950/10">
      <div className="container mx-auto px-4 py-8 lg:py-16 max-w-4xl">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="mx-auto mb-6 p-4 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-white w-20 h-20 flex items-center justify-center">
            <CheckCircle className="h-10 w-10" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            Welcome to Premium!
          </h1>
          <p className="text-xl text-muted-foreground">
            Your subscription has been successfully activated
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert className="mb-8 border-red-200 bg-red-50 dark:bg-red-950/20">
            <AlertDescription className="text-red-800 dark:text-red-200">
              <strong>Error:</strong> {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Subscription Details */}
        {subscriptionData && (
          <Card className="mb-8 border-0 shadow-lg bg-gradient-to-br from-white to-green-50/50 dark:from-slate-900 dark:to-green-950/20">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                <Crown className="h-8 w-8" />
              </div>
              <CardTitle className="text-2xl">Subscription Activated</CardTitle>
              <CardDescription>
                You now have full access to all premium features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Plan</span>
                    <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      {subscriptionData.planName}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Status</span>
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      <CheckCircle className="mr-1 h-3 w-3" />
                      {subscriptionData.subscriptionStatus}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Account</span>
                    <span className="text-sm text-muted-foreground">{session.user?.email}</span>
                  </div>
                </div>
                <div className="space-y-4">
                  {subscriptionData.currentPeriodEnd && (
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Next Billing</span>
                      <span className="text-sm text-muted-foreground">
                        {new Date(subscriptionData.currentPeriodEnd).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {sessionId && (
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Session ID</span>
                      <span className="text-xs text-muted-foreground font-mono">
                        {sessionId.slice(0, 20)}...
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Premium Features */}
        <Card className="mb-8 border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              Your Premium Features
            </CardTitle>
            <CardDescription>
              Everything you need for comprehensive retirement planning
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                "Unlimited pension calculations",
                "Advanced Social Security optimization",
                "Combined retirement planning wizard",
                "Tax optimization strategies",
                "Monte Carlo risk analysis",
                "PDF report generation",
                "Priority customer support",
                "Early access to new features"
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card className="mb-8 border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowRight className="h-5 w-5 text-blue-600" />
              What's Next?
            </CardTitle>
            <CardDescription>
              Get started with your premium Massachusetts Retirement System account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <Shield className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <h4 className="font-medium mb-1">Complete Your Profile</h4>
                <p className="text-sm text-muted-foreground">Add your retirement details for personalized calculations</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <CreditCard className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <h4 className="font-medium mb-1">Explore Premium Tools</h4>
                <p className="text-sm text-muted-foreground">Try the combined calculation wizard and advanced features</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <Mail className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <h4 className="font-medium mb-1">Manage Your Account</h4>
                <p className="text-sm text-muted-foreground">Update billing information and preferences</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" asChild className="px-8">
            <Link href="/dashboard">
              <ArrowRight className="mr-2 h-5 w-5" />
              Go to Dashboard
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild className="px-8">
            <Link href="/profile">
              <Shield className="mr-2 h-5 w-5" />
              Complete Profile
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild className="px-8">
            <Link href="/billing">
              <CreditCard className="mr-2 h-5 w-5" />
              Manage Billing
            </Link>
          </Button>
        </div>

        {/* Support */}
        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground mb-4">
            Need help getting started? Our support team is here to assist you.
          </p>
          <Button variant="outline" asChild>
            <Link href="/contact">
              <Mail className="mr-2 h-4 w-4" />
              Contact Support
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
