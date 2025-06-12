"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  CreditCard, 
  Crown, 
  Calendar, 
  FileText, 
  ExternalLink,
  AlertTriangle,
  CheckCircle,
  Loader2,
  ArrowLeft
} from "lucide-react"
import Link from "next/link"
import { getSubscriptionDisplayStatus } from "@/lib/stripe/config"

interface SubscriptionData {
  isPremium: boolean
  subscriptionStatus: string
  subscriptionPlan: string
  currentPeriodEnd?: string
  cancelAtPeriodEnd?: boolean
  trialEnd?: string
  customerId?: string
  subscriptionId?: string
}

interface Invoice {
  id: string
  number: string
  status: string
  amountPaid: number
  currency: string
  created: string
  pdfUrl?: string
  hostedUrl?: string
}

export default function SubscriptionPortalPage() {
  const { data: session, status } = useSession()
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [portalLoading, setPortalLoading] = useState(false)

  useEffect(() => {
    async function fetchData() {
      if (status === "loading") return

      try {
        // Fetch subscription status
        const statusResponse = await fetch('/api/subscription/status')
        if (statusResponse.ok) {
          const statusData = await statusResponse.json()
          setSubscriptionData(statusData)
        }

        // Fetch customer portal data (invoices, etc.)
        const portalResponse = await fetch('/api/stripe/portal')
        if (portalResponse.ok) {
          const portalData = await portalResponse.json()
          setInvoices(portalData.invoices || [])
        }
      } catch (error) {
        console.error('Failed to fetch subscription data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [status])

  const handleOpenPortal = async () => {
    setPortalLoading(true)
    
    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
      })

      if (response.ok) {
        const { portalUrl } = await response.json()
        window.open(portalUrl, '_blank')
      } else {
        throw new Error('Failed to create portal session')
      }
    } catch (error) {
      console.error('Portal error:', error)
      alert('Failed to open customer portal. Please try again.')
    } finally {
      setPortalLoading(false)
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading subscription details...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>
              Please sign in to view your subscription details.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/auth/signin">
              <Button className="w-full">Sign In</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!subscriptionData?.isPremium) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  No Active Subscription
                </CardTitle>
                <CardDescription>
                  You don't currently have an active premium subscription.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">
                  To access the subscription portal and manage billing, you need an active premium subscription.
                </p>
                <div className="flex gap-3">
                  <Link href="/pricing" className="flex-1">
                    <Button className="w-full">
                      <Crown className="mr-2 h-4 w-4" />
                      View Pricing
                    </Button>
                  </Link>
                  <Link href="/dashboard">
                    <Button variant="outline" className="flex-1">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back to Dashboard
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link href="/dashboard" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Subscription Management
            </h1>
            <p className="text-gray-600">
              Manage your subscription, billing, and payment information.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Subscription Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-amber-600" />
                  Current Subscription
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Plan:</span>
                    <Badge className="bg-amber-100 text-amber-800 capitalize">
                      Premium {subscriptionData.subscriptionPlan}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Status:</span>
                    <Badge className={
                      subscriptionData.subscriptionStatus === 'active' 
                        ? 'bg-green-100 text-green-800'
                        : subscriptionData.subscriptionStatus === 'past_due'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }>
                      {getSubscriptionDisplayStatus({
                        status: subscriptionData.subscriptionStatus as any,
                        cancelAtPeriodEnd: subscriptionData.cancelAtPeriodEnd || false,
                        currentPeriodEnd: subscriptionData.currentPeriodEnd ? new Date(subscriptionData.currentPeriodEnd) : new Date(),
                        trialEnd: subscriptionData.trialEnd ? new Date(subscriptionData.trialEnd) : undefined,
                      } as any)}
                    </Badge>
                  </div>
                  {subscriptionData.currentPeriodEnd && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">
                        {subscriptionData.cancelAtPeriodEnd ? 'Ends:' : 'Renews:'}
                      </span>
                      <span className="text-sm">
                        {new Date(subscriptionData.currentPeriodEnd).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {subscriptionData.trialEnd && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Trial Ends:</span>
                      <span className="text-sm">
                        {new Date(subscriptionData.trialEnd).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                {subscriptionData.cancelAtPeriodEnd && (
                  <Alert className="border-orange-200 bg-orange-50">
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                    <AlertDescription className="text-orange-800">
                      Your subscription will end on {subscriptionData.currentPeriodEnd ? new Date(subscriptionData.currentPeriodEnd).toLocaleDateString() : 'the current period end'}. 
                      You can reactivate it anytime before then.
                    </AlertDescription>
                  </Alert>
                )}

                <Button 
                  onClick={handleOpenPortal}
                  disabled={portalLoading}
                  className="w-full"
                >
                  {portalLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Opening Portal...
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Manage Billing & Payment
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
                <p className="text-xs text-gray-600 text-center">
                  Opens Stripe Customer Portal in a new tab
                </p>
              </CardContent>
            </Card>

            {/* Recent Invoices */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  Recent Invoices
                </CardTitle>
                <CardDescription>
                  Your billing history and receipts
                </CardDescription>
              </CardHeader>
              <CardContent>
                {invoices.length > 0 ? (
                  <div className="space-y-3">
                    {invoices.slice(0, 5).map((invoice) => (
                      <div key={invoice.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium text-sm">
                            Invoice #{invoice.number || invoice.id.slice(-8)}
                          </div>
                          <div className="text-xs text-gray-600">
                            {new Date(invoice.created).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-sm">
                            ${invoice.amountPaid.toFixed(2)}
                          </div>
                          <Badge 
                            variant={invoice.status === 'paid' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {invoice.status}
                          </Badge>
                        </div>
                        {invoice.pdfUrl && (
                          <Button size="sm" variant="outline" asChild>
                            <a href={invoice.pdfUrl} target="_blank" rel="noopener noreferrer">
                              <FileText className="h-3 w-3" />
                            </a>
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No invoices found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common subscription management tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <Button variant="outline" onClick={handleOpenPortal} disabled={portalLoading}>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Update Payment Method
                </Button>
                <Button variant="outline" onClick={handleOpenPortal} disabled={portalLoading}>
                  <Calendar className="mr-2 h-4 w-4" />
                  Change Plan
                </Button>
                <Button variant="outline" onClick={handleOpenPortal} disabled={portalLoading}>
                  <FileText className="mr-2 h-4 w-4" />
                  Download Invoices
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Support */}
          <Alert className="mt-8">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Need help?</strong> As a Premium subscriber, you have access to priority support. 
              Contact us at{" "}
              <a href="mailto:support@mapensionestimator.com" className="underline">
                support@mapensionestimator.com
              </a>{" "}
              or through our{" "}
              <Link href="/help" className="underline">
                help center
              </Link>
              .
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  )
}
