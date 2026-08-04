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
import { SUBSCRIPTION_PLANS } from "@/lib/stripe/config"
import Link from "next/link"
import { format } from "date-fns"
import { BillingFAQ } from "@/components/billing/billing-faq"

// Shape of invoices returned by GET /api/stripe/portal (StripeService.getCustomerInvoices);
// dates arrive as ISO strings after JSON serialization, amounts already in dollars.
interface InvoiceRow {
  id: string
  number: string | null
  status: string
  amountPaid: number
  created: string
  pdfUrl?: string | null
  hostedUrl?: string | null
}

// Subset of /api/subscription/status used for the subscription card
interface BillingDetails {
  subscriptionPlan: 'monthly' | 'annual' | 'free'
  subscriptionStatus: string
  currentPeriodEnd?: string
  cancelAtPeriodEnd?: boolean
}

export default function BillingPage() {
  const { data: session, status } = useSession()
  const { isPremium, subscriptionStatus } = useSubscriptionStatus()
  const router = useRouter()
  const [isCanceling, setIsCanceling] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [billingDetails, setBillingDetails] = useState<BillingDetails | null>(null)
  const [invoices, setInvoices] = useState<InvoiceRow[]>([])
  const [historyLoading, setHistoryLoading] = useState(true)
  const [isNavigating, setIsNavigating] = useState(false)
  const [portalLoading, setPortalLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  // Load real subscription details and invoice history. Re-runs when a
  // cancel/portal action dispatches 'subscription-updated'.
  useEffect(() => {
    if (!session?.user?.email) return
    let cancelled = false

    async function loadBillingData() {
      try {
        const res = await fetch('/api/subscription/status', { cache: 'no-store' })
        if (res.ok) {
          const data = await res.json()
          if (!cancelled) {
            setBillingDetails({
              subscriptionPlan: data.subscriptionPlan,
              subscriptionStatus: data.subscriptionStatus,
              currentPeriodEnd: data.currentPeriodEnd,
              cancelAtPeriodEnd: data.cancelAtPeriodEnd,
            })
          }
        }
      } catch (error) {
        console.error('Failed to load subscription details:', error)
      }

      try {
        // Returns real Stripe invoices; 404/503 (no customer / Stripe not
        // configured) falls through to the empty history state.
        const res = await fetch('/api/stripe/portal')
        if (res.ok) {
          const data = await res.json()
          if (!cancelled) {
            setInvoices(Array.isArray(data.invoices) ? data.invoices : [])
          }
        }
      } catch (error) {
        console.error('Failed to load billing history:', error)
      } finally {
        if (!cancelled) setHistoryLoading(false)
      }
    }

    loadBillingData()
    window.addEventListener('subscription-updated', loadBillingData)
    return () => {
      cancelled = true
      window.removeEventListener('subscription-updated', loadBillingData)
    }
  }, [session?.user?.email])

  // Auto-dismiss success messages after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [successMessage])

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

  const handleUpdatePaymentMethod = async () => {
    setPortalLoading(true)
    setErrorMessage(null)
    setSuccessMessage(null)

    try {
      // Check if user has an active subscription
      if (!isPremium) {
        // Navigate to subscription page for non-premium users
        setSuccessMessage('Redirecting to subscription page...')
        router.push('/subscribe')
        return
      }

      // For premium users, open Stripe customer portal
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
      })

      if (response.ok) {
        const { portalUrl } = await response.json()
        setSuccessMessage('Opening payment portal...')
        window.open(portalUrl, '_blank')
      } else {
        // Fallback to subscription portal page
        setSuccessMessage('Redirecting to subscription management...')
        router.push('/subscription/portal')
      }
    } catch (error) {
      console.error('Error opening payment portal:', error)
      setErrorMessage('Unable to open payment portal. Redirecting to subscription management...')
      // Fallback to subscription portal page
      setTimeout(() => {
        router.push('/subscription/portal')
      }, 2000)
    } finally {
      setPortalLoading(false)
    }
  }

  const handleManageSubscription = () => {
    setIsNavigating(true)
    setErrorMessage(null)
    setSuccessMessage(null)

    try {
      // Navigate to subscription portal page
      setSuccessMessage('Redirecting to subscription management...')
      router.push('/subscription/portal')
    } catch (error) {
      console.error('Error navigating to subscription portal:', error)
      setErrorMessage('Unable to navigate to subscription management. Please try again.')
      setIsNavigating(false)
    }
  }

  // Stripe invoice statuses: paid, open, void, uncollectible, draft
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800">Paid</Badge>
      case 'open':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case 'uncollectible':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>
      default:
        return <Badge variant="outline" className="capitalize">{status}</Badge>
    }
  }

  const activePlan =
    billingDetails?.subscriptionPlan === 'annual' ? SUBSCRIPTION_PLANS.annual : SUBSCRIPTION_PLANS.monthly
  const planIntervalLabel = activePlan.interval === 'year' ? 'Annual' : 'Monthly'
  const periodEndDate = billingDetails?.currentPeriodEnd ? new Date(billingDetails.currentPeriodEnd) : null
  const validPeriodEnd = periodEndDate && !isNaN(periodEndDate.getTime()) ? periodEndDate : null
  const subStatus = billingDetails?.subscriptionStatus || 'active'

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Billing & Subscription</h1>
        <p className="text-muted-foreground">
          Manage your subscription, view billing history, and update payment methods.
        </p>
      </div>

      {/* Error and Success Messages */}
      {errorMessage && (
        <Alert className="mb-6 border-red-200 bg-red-50 text-red-800">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {errorMessage}
            <Button
              variant="ghost"
              size="sm"
              className="ml-2 h-auto p-0 text-red-800 hover:text-red-900"
              onClick={() => setErrorMessage(null)}
            >
              Dismiss
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {successMessage && (
        <Alert className="mb-6 border-green-200 bg-green-50 text-green-800">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            {successMessage}
            <Button
              variant="ghost"
              size="sm"
              className="ml-2 h-auto p-0 text-green-800 hover:text-green-900"
              onClick={() => setSuccessMessage(null)}
            >
              Dismiss
            </Button>
          </AlertDescription>
        </Alert>
      )}

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
                    <h3 className="font-semibold">{activePlan.name}</h3>
                    <p className="text-sm text-muted-foreground">{planIntervalLabel} subscription</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">${activePlan.price}</div>
                  <div className="text-sm text-muted-foreground">per {activePlan.interval}</div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  {validPeriodEnd && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">
                        {billingDetails?.cancelAtPeriodEnd ? 'Access ends:' : 'Next billing date:'}
                      </span>
                      <span className="text-sm">{format(validPeriodEnd, "MMM d, yyyy")}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">Status:</span>
                    {billingDetails?.cancelAtPeriodEnd ? (
                      <Badge className="bg-amber-100 text-amber-800">Cancels at period end</Badge>
                    ) : (
                      <Badge
                        className={
                          subStatus === 'active' || subStatus === 'trialing'
                            ? 'bg-green-100 text-green-800 capitalize'
                            : 'bg-yellow-100 text-yellow-800 capitalize'
                        }
                      >
                        {subStatus.replace(/_/g, ' ')}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Payment method:</span>
                    <span className="text-sm text-muted-foreground">Managed securely by Stripe</span>
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
                <Button
                  variant="outline"
                  onClick={handleUpdatePaymentMethod}
                  disabled={portalLoading || isNavigating}
                >
                  {portalLoading ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Opening Portal...
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Update Payment Method
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleManageSubscription}
                  disabled={portalLoading || isNavigating}
                >
                  {isNavigating ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Manage Subscription
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowCancelConfirm(true)}
                  className="text-red-600 hover:text-red-700"
                  disabled={portalLoading || isNavigating}
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
                        You'll lose access to premium features at the end of your billing period
                        {validPeriodEnd ? ` (${format(validPeriodEnd, "MMM d, yyyy")})` : ''}.
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
          {historyLoading ? (
            <div className="text-center py-8">
              <RefreshCw className="h-6 w-6 text-muted-foreground mx-auto mb-3 animate-spin" />
              <p className="text-muted-foreground text-sm">Loading billing history...</p>
            </div>
          ) : invoices.length > 0 ? (
            <div className="space-y-4">
              {invoices.map((inv) => (
                <div key={inv.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-medium">MassPension Premium</span>
                      {getStatusBadge(inv.status)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {format(new Date(inv.created), "MMM d, yyyy")}
                      {inv.number ? ` • Invoice ${inv.number}` : ''}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="font-semibold">${inv.amountPaid.toFixed(2)}</div>
                    </div>
                    {(inv.hostedUrl || inv.pdfUrl) && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={inv.hostedUrl || inv.pdfUrl || undefined} target="_blank" rel="noopener noreferrer">
                          <Download className="h-3 w-3 mr-1" />
                          Receipt
                        </a>
                      </Button>
                    )}
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

      {/* FAQ Section */}
      <BillingFAQ />
    </div>
  )
} 