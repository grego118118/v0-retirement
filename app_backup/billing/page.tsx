"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { 
  Crown, 
  CreditCard, 
  Download, 
  Calendar, 
  DollarSign, 
  AlertTriangle, 
  CheckCircle,
  RefreshCw,
  ExternalLink,
  Shield
} from "lucide-react"
import { useSubscriptionStatus } from "@/hooks/use-subscription"
import Link from "next/link"
import { format } from "date-fns"

interface BillingHistory {
  id: string
  date: string
  amount: number
  status: 'paid' | 'pending' | 'failed'
  description: string
  invoiceUrl?: string
}

// Mock billing history data
const mockBillingHistory: BillingHistory[] = [
  {
    id: "inv_001",
    date: "2024-01-15",
    amount: 999,
    status: "paid",
    description: "Massachusetts Pension Estimator - Monthly Plan"
  },
  {
    id: "inv_002", 
    date: "2023-12-15",
    amount: 999,
    status: "paid",
    description: "Massachusetts Pension Estimator - Monthly Plan"
  },
  {
    id: "inv_003",
    date: "2023-11-15", 
    amount: 999,
    status: "paid",
    description: "Massachusetts Pension Estimator - Monthly Plan"
  }
]

export default function BillingPage() {
  const { data: session, status } = useSession()
  const { isPremium, subscriptionStatus } = useSubscriptionStatus()
  const router = useRouter()
  const [isCanceling, setIsCanceling] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [billingHistory] = useState<BillingHistory[]>(mockBillingHistory)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  if (status === "loading") {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="text-center">
          <p className="text-muted-foreground">Loading billing information...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const handleCancelSubscription = async () => {
    setIsCanceling(true)
    
    try {
      const response = await fetch('/api/subscription/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to cancel subscription')
      }
      
      const result = await response.json()
      console.log('Subscription canceled:', result)
      
      setShowCancelConfirm(false)
      
      // Trigger subscription status refresh
      const event = new CustomEvent('subscription-updated')
      window.dispatchEvent(event)
      
      // Optionally show a success message
      // You could add a toast notification here
      
    } catch (error) {
      console.error('Error canceling subscription:', error)
      // You could add error handling/toast notification here
    } finally {
      setIsCanceling(false)
    }
  }

  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800">Paid</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Billing & Subscription</h1>
        <p className="text-muted-foreground">
          Manage your subscription, view billing history, and update payment methods.
        </p>
      </div>

      {/* Current Subscription */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-amber-500" />
            Current Subscription
          </CardTitle>
          <CardDescription>Your active subscription details</CardDescription>
        </CardHeader>
        <CardContent>
          {isPremium ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center">
                    <Crown className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Premium Plan</h3>
                    <p className="text-sm text-muted-foreground">Monthly subscription</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">$9.99</div>
                  <div className="text-sm text-muted-foreground">per month</div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Next billing date:</span>
                    <span className="text-sm">{format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), "MMM d, yyyy")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">Status:</span>
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Payment method:</span>
                    <span className="text-sm">•••• •••• •••• 4242</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-medium">Premium Features Included:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Social Security Integration</li>
                    <li>• Unlimited Saved Calculations</li>
                    <li>• Advanced Analysis Tools</li>
                    <li>• PDF Export & Reports</li>
                    <li>• Priority Support</li>
                  </ul>
                </div>
              </div>

              <Separator />

              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="outline">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Update Payment Method
                </Button>
                <Button variant="outline">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Manage Subscription
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowCancelConfirm(true)}
                  className="text-red-600 hover:text-red-700"
                >
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Cancel Subscription
                </Button>
              </div>

              {showCancelConfirm && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-3 mt-2">
                      <p className="font-medium">Are you sure you want to cancel your subscription?</p>
                      <p className="text-sm">
                        You'll lose access to premium features at the end of your billing period ({format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), "MMM d, yyyy")}).
                        You can resubscribe at any time.
                      </p>
                      <div className="flex gap-3">
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={handleCancelSubscription}
                          disabled={isCanceling}
                        >
                          {isCanceling ? (
                            <>
                              <RefreshCw className="mr-2 h-3 w-3 animate-spin" />
                              Canceling...
                            </>
                          ) : (
                            "Yes, Cancel Subscription"
                          )}
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setShowCancelConfirm(false)}
                        >
                          Keep Subscription
                        </Button>
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Active Subscription</h3>
              <p className="text-muted-foreground mb-4">
                You're currently on the free plan. Upgrade to Premium for advanced features.
              </p>
              <Button asChild>
                <Link href="/subscribe">
                  <Crown className="mr-2 h-4 w-4" />
                  Upgrade to Premium
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Billing History */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            Billing History
          </CardTitle>
          <CardDescription>Your recent payments and invoices</CardDescription>
        </CardHeader>
        <CardContent>
          {billingHistory.length > 0 ? (
            <div className="space-y-4">
              {billingHistory.map((bill) => (
                <div key={bill.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-medium">{bill.description}</span>
                      {getStatusBadge(bill.status)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {format(new Date(bill.date), "MMM d, yyyy")} • Invoice #{bill.id}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="font-semibold">{formatPrice(bill.amount)}</div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="h-3 w-3 mr-1" />
                      Receipt
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Billing History</h3>
              <p className="text-muted-foreground">
                Your billing history will appear here once you make your first payment.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Support */}
      <Card>
        <CardHeader>
          <CardTitle>Need Help?</CardTitle>
          <CardDescription>Get support with your subscription or billing</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">Billing Questions</h4>
              <p className="text-sm text-muted-foreground">
                Have questions about your subscription or billing? We're here to help.
              </p>
              <Button variant="outline" size="sm" asChild>
                <Link href="/contact">Contact Support</Link>
              </Button>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">FAQ</h4>
              <p className="text-sm text-muted-foreground">
                Find answers to common questions about subscriptions and billing.
              </p>
              <Button variant="outline" size="sm" asChild>
                <Link href="/faq">View FAQ</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 