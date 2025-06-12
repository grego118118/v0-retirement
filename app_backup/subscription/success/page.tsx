"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  CheckCircle, 
  Crown, 
  ArrowRight, 
  Calendar, 
  CreditCard,
  FileText,
  Calculator,
  TrendingUp
} from "lucide-react"
import Link from "next/link"

export default function SubscriptionSuccessPage() {
  const { data: session } = useSession()
  const [subscriptionData, setSubscriptionData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchSubscriptionData() {
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

    // Add a small delay to allow webhook processing
    const timer = setTimeout(fetchSubscriptionData, 2000)
    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Confirming your subscription...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome to Premium!
            </h1>
            <p className="text-lg text-gray-600">
              Your subscription has been successfully activated. You now have access to all premium features.
            </p>
          </div>

          {/* Subscription Details */}
          {subscriptionData && (
            <Card className="mb-8 border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-amber-600" />
                  Subscription Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Plan:</span>
                      <Badge className="bg-amber-100 text-amber-800 capitalize">
                        Premium {subscriptionData.subscriptionPlan}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Status:</span>
                      <Badge className="bg-green-100 text-green-800">
                        Active
                      </Badge>
                    </div>
                    {subscriptionData.currentPeriodEnd && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Next billing:</span>
                        <span className="text-sm">
                          {new Date(subscriptionData.currentPeriodEnd).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm">
                      <strong>Email:</strong> {session?.user?.email}
                    </div>
                    <div className="text-sm">
                      <strong>Customer ID:</strong> {subscriptionData.customerId?.slice(-8) || 'N/A'}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* What's Next */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>What's Next?</CardTitle>
              <CardDescription>
                Here's what you can do now with your Premium subscription
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Calculator className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium">Advanced Calculator</h4>
                      <p className="text-sm text-gray-600">
                        Access unlimited pension calculations with advanced scenarios
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <TrendingUp className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium">Combined Wizard</h4>
                      <p className="text-sm text-gray-600">
                        Step-by-step retirement planning with Social Security optimization
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-purple-600 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium">PDF Reports</h4>
                      <p className="text-sm text-gray-600">
                        Generate professional retirement planning reports
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CreditCard className="h-5 w-5 text-orange-600 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium">Tax Optimization</h4>
                      <p className="text-sm text-gray-600">
                        Advanced tax planning and withdrawal strategies
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <Link href="/wizard">
              <Button className="w-full h-16 flex flex-col items-center justify-center gap-2">
                <TrendingUp className="h-5 w-5" />
                <span>Start Wizard</span>
              </Button>
            </Link>
            <Link href="/calculator">
              <Button variant="outline" className="w-full h-16 flex flex-col items-center justify-center gap-2">
                <Calculator className="h-5 w-5" />
                <span>Use Calculator</span>
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" className="w-full h-16 flex flex-col items-center justify-center gap-2">
                <ArrowRight className="h-5 w-5" />
                <span>Go to Dashboard</span>
              </Button>
            </Link>
          </div>

          {/* Support Information */}
          <Alert>
            <Calendar className="h-4 w-4" />
            <AlertDescription>
              <strong>Need help getting started?</strong> Check out our{" "}
              <Link href="/help" className="underline">
                help center
              </Link>{" "}
              or contact our priority support team. As a Premium subscriber, you'll receive 
              priority assistance with any questions.
            </AlertDescription>
          </Alert>

          {/* Manage Subscription */}
          <div className="text-center mt-8">
            <p className="text-sm text-gray-600 mb-4">
              Need to manage your subscription or billing information?
            </p>
            <Link href="/subscription/portal">
              <Button variant="outline">
                <CreditCard className="mr-2 h-4 w-4" />
                Manage Subscription
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
