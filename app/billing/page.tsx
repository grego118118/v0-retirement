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
  CreditCard,
  Calendar,
  CheckCircle,
  ExternalLink,
  ArrowLeft,
  Shield,
  Mail,
  User,
  Settings,
  AlertCircle,
  DollarSign,
  Receipt,
  Clock,
  Info,
  RefreshCw
} from "lucide-react"

interface SubscriptionData {
  isPremium: boolean
  subscriptionStatus: string
  plan: string
  planName: string
  planDescription: string
  billingType: string
  accountType: string
  accessLevel: string
  subscriptionId?: string | null
  stripeCustomerId?: string | null
  currentPeriodEnd?: string
  cancelAtPeriodEnd?: boolean
  trialEnd?: string
  currentUsage: {
    savedCalculations: number
    socialSecurityCalculations: number
    wizardUses: number
    pdfReports: number
  }
  usageLimits: {
    maxSavedCalculations: number
    maxSocialSecurityCalculations: number
    maxWizardUses: number
    maxPdfReports: number
    features: string[]
  }
  features: {
    basicCalculations: boolean
    socialSecurityIntegration: boolean
    pdfReports: boolean
    emailNotifications: boolean
    prioritySupport: boolean
    combinedCalculations: boolean
    taxImplications: boolean
    advancedPlanning: boolean
    unlimitedSaves: boolean
  }
  paymentMethod?: {
    type: string
    last4?: string
    brand?: string
    expiryMonth?: number
    expiryYear?: number
  }
  billingHistory?: Array<{
    id: string
    date: string
    amount: number
    status: string
    description: string
  }>
}

interface StripeConfigStatus {
  isConfigured: boolean
  hasSecretKey: boolean
  hasPublishableKey: boolean
  hasWebhookSecret: boolean
}

export default function BillingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null)
  const [stripeConfig, setStripeConfig] = useState<StripeConfigStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [portalLoading, setPortalLoading] = useState(false)
  const [upgradeLoading, setUpgradeLoading] = useState<string | null>(null)
  const [syncLoading, setSyncLoading] = useState(false)
  const [urlMessage, setUrlMessage] = useState<string | null>(null)
  const [syncMessage, setSyncMessage] = useState<string | null>(null)

  // Handle URL parameters
  useEffect(() => {
    const message = searchParams.get('message')
    if (message) {
      setUrlMessage(message)
    }
  }, [searchParams])

  // Redirect non-authenticated users to sign in
  useEffect(() => {
    if (status === "loading") return
    if (!session) {
      router.push("/auth/signin?callbackUrl=/billing")
      return
    }
  }, [session, status, router])

  // Fetch subscription data and Stripe configuration
  useEffect(() => {
    if (!session?.user) return

    const fetchBillingData = async () => {
      try {
        // Fetch subscription status with cache-busting timestamp
        const subscriptionResponse = await fetch(`/api/subscription/status?t=${Date.now()}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
          }
        })
        if (subscriptionResponse.ok) {
          const data = await subscriptionResponse.json()
          console.log('Billing page: Fetched subscription data:', data)
          setSubscriptionData(data)
        } else {
          console.error('Failed to fetch subscription status')
        }

        // Check Stripe configuration
        const stripeResponse = await fetch('/api/subscription/config')
        if (stripeResponse.ok) {
          const stripeData = await stripeResponse.json()
          setStripeConfig(stripeData)
        } else {
          setStripeConfig({
            isConfigured: false,
            hasSecretKey: false,
            hasPublishableKey: false,
            hasWebhookSecret: false
          })
        }
      } catch (error) {
        console.error('Failed to fetch billing data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchBillingData()
  }, [session])

  // Listen for subscription updates and page visibility changes
  useEffect(() => {
    const handleSubscriptionUpdate = () => {
      console.log('Billing page: Subscription update event received')
      if (session?.user) {
        // Re-fetch billing data when subscription is updated
        setLoading(true)
        const fetchBillingData = async () => {
          try {
            // Add extra cache-busting parameters and headers
            const subscriptionResponse = await fetch(`/api/subscription/status?t=${Date.now()}&refresh=true`, {
              cache: 'no-store',
              headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0',
              }
            })
            if (subscriptionResponse.ok) {
              const data = await subscriptionResponse.json()
              console.log('Billing page: Updated subscription data:', data)
              setSubscriptionData(data)

              // Show success message if subscription became active
              if (data.subscriptionStatus === 'active' && data.isPremium) {
                console.log('Subscription successfully activated!')
                // You could add a toast notification here
              }
            } else {
              console.error('Failed to fetch updated subscription status:', subscriptionResponse.status)
            }
          } catch (error) {
            console.error('Failed to refresh billing data:', error)
          } finally {
            setLoading(false)
          }
        }
        fetchBillingData()
      }
    }

    const handleVisibilityChange = () => {
      if (!document.hidden && session?.user) {
        console.log('Billing page: Page became visible, refreshing data')
        handleSubscriptionUpdate()
      }
    }

    // Listen for custom subscription update events
    window.addEventListener('subscription-updated', handleSubscriptionUpdate)

    // Listen for page visibility changes (when user returns from demo checkout)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.removeEventListener('subscription-updated', handleSubscriptionUpdate)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [session])

  const handleUpgrade = async (plan: 'monthly' | 'annual') => {
    setUpgradeLoading(plan)
    try {
      // Create checkout session using existing API
      const response = await fetch('/api/subscription/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planType: plan
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.checkoutUrl) {
          window.location.href = data.checkoutUrl
        } else {
          throw new Error('No checkout URL provided')
        }
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create checkout session')
      }
    } catch (error) {
      console.error('Error creating checkout session:', error)
      alert(`Unable to start upgrade process. ${error instanceof Error ? error.message : 'Please try again later.'}`)
    } finally {
      setUpgradeLoading(null)
    }
  }

  const handleCustomerPortal = async () => {
    setPortalLoading(true)
    try {
      const response = await fetch('/api/subscription/portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        if (data.url) {
          window.open(data.url, '_blank')
        } else if (data.redirect) {
          router.push(data.redirect)
        } else {
          throw new Error('No redirect URL provided')
        }
      } else {
        const error = await response.json()
        throw new Error(error.message || 'Failed to access billing portal')
      }
    } catch (error) {
      console.error('Error accessing customer portal:', error)
      alert(`Unable to access billing portal. ${error instanceof Error ? error.message : 'Please try again later.'}`)
    } finally {
      setPortalLoading(false)
    }
  }

  const handleSyncSubscription = async () => {
    setSyncLoading(true)
    setSyncMessage(null)
    try {
      console.log('🔄 Starting subscription sync...')
      const response = await fetch('/api/subscription/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (response.ok && data.success) {
        console.log('✅ Subscription sync successful:', data)
        setSyncMessage(`✅ ${data.message}`)

        // Refresh subscription data after successful sync
        setLoading(true)
        const subscriptionResponse = await fetch(`/api/subscription/status?t=${Date.now()}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
          }
        })

        if (subscriptionResponse.ok) {
          const updatedData = await subscriptionResponse.json()
          console.log('📊 Updated subscription data after sync:', updatedData)
          setSubscriptionData(updatedData)
        }
      } else {
        console.error('❌ Subscription sync failed:', data)
        setSyncMessage(`❌ ${data.message || 'Failed to sync subscription status'}`)
      }
    } catch (error) {
      console.error('❌ Error syncing subscription:', error)
      setSyncMessage(`❌ Unable to sync subscription status. ${error instanceof Error ? error.message : 'Please try again later.'}`)
    } finally {
      setSyncLoading(false)
      setLoading(false)
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-950 dark:via-blue-950/20 dark:to-indigo-950/10 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">Loading billing information...</h2>
          <p className="text-muted-foreground">Please wait while we fetch your account details</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-950 dark:via-blue-950/20 dark:to-indigo-950/10 mrs-page-wrapper">
      <div className="mrs-content-container py-8 lg:py-16 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              Billing & Account
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your subscription and billing information
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSyncSubscription}
              disabled={syncLoading || loading}
            >
              {syncLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Sync Status
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setLoading(true)
                window.location.reload()
              }}
              disabled={loading || syncLoading}
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Refresh Page
            </Button>
          </div>
        </div>

        {/* Sync Message Alert */}
        {syncMessage && (
          <div className="mb-6">
            <Alert className={`${
              syncMessage.startsWith('✅')
                ? 'border-green-200 bg-green-50 dark:bg-green-950/20'
                : 'border-red-200 bg-red-50 dark:bg-red-950/20'
            }`}>
              {syncMessage.startsWith('✅') ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription className={`${
                syncMessage.startsWith('✅')
                  ? 'text-green-800 dark:text-green-200'
                  : 'text-red-800 dark:text-red-200'
              }`}>
                {syncMessage}
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* URL Message Alerts */}
        {urlMessage && (
          <div className="mb-8">
            {urlMessage === 'stripe_not_configured' && (
              <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800 dark:text-blue-200">
                  <strong>Stripe Configuration Notice:</strong> Stripe billing portal is not configured.
                  Your premium access is managed through Google OAuth authentication. No additional billing required.
                </AlertDescription>
              </Alert>
            )}
            {urlMessage === 'oauth_premium' && (
              <Alert className="border-green-200 bg-green-50 dark:bg-green-950/20">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800 dark:text-green-200">
                  <strong>OAuth Premium Access:</strong> Your premium access is managed through Google authentication.
                  No additional billing required.
                </AlertDescription>
              </Alert>
            )}
            {urlMessage === 'upgrade_available' && (
              <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
                <Crown className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800 dark:text-amber-200">
                  <strong>Upgrade Available:</strong> You're currently on the free tier.
                  Upgrade to premium for unlimited access to all features including Social Security optimization and PDF reports.
                </AlertDescription>
              </Alert>
            )}
            {urlMessage === 'stripe_error' && (
              <Alert className="border-red-200 bg-red-50 dark:bg-red-950/20">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800 dark:text-red-200">
                  <strong>Billing System Error:</strong> There was a temporary issue accessing the billing portal.
                  Please try again in a few moments or contact support if the issue persists.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* Account Status Card */}
        <Card className="mb-8 border-0 shadow-lg bg-gradient-to-br from-white to-blue-50/50 dark:from-slate-900 dark:to-blue-950/20">
          <CardHeader className="pb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-xl text-white shadow-lg ${
                  subscriptionData?.isPremium
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600'
                    : 'bg-gradient-to-r from-gray-500 to-slate-600'
                }`}>
                  {subscriptionData?.isPremium ? <Crown className="h-6 w-6" /> : <User className="h-6 w-6" />}
                </div>
                <div>
                  <CardTitle className="text-xl">
                    {subscriptionData?.isPremium ? 'Premium Account' : 'Free Account'}
                  </CardTitle>
                  <CardDescription>
                    Massachusetts Retirement System - {subscriptionData?.planDescription || 'Basic retirement planning tools'}
                  </CardDescription>
                </div>
              </div>
              <Badge className={`px-4 py-2 ${
                subscriptionData?.subscriptionStatus === 'active' || subscriptionData?.isPremium
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                  : subscriptionData?.subscriptionStatus === 'free'
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                  : 'bg-gradient-to-r from-gray-500 to-slate-600 text-white'
              }`}>
                {subscriptionData?.subscriptionStatus === 'active' || subscriptionData?.isPremium ? (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Active
                  </>
                ) : subscriptionData?.subscriptionStatus === 'free' ? (
                  <>
                    <User className="mr-2 h-4 w-4" />
                    Free Tier
                  </>
                ) : (
                  <>
                    <Clock className="mr-2 h-4 w-4" />
                    {subscriptionData?.subscriptionStatus || 'Unknown'}
                  </>
                )}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{session.user?.name}</div>
                    <div className="text-sm text-muted-foreground">{session.user?.email}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{subscriptionData?.planName || 'Free Account'}</div>
                    <div className="text-sm text-muted-foreground">
                      {subscriptionData?.billingType === 'oauth_authentication'
                        ? 'Authenticated via Google Sign-In'
                        : 'Stripe Subscription'}
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">Account Type</div>
                    <div className="text-sm text-muted-foreground">
                      {subscriptionData?.accountType === 'free' ? 'Free Tier' : 'Premium - Full Access'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {subscriptionData?.isPremium ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-amber-500" />
                  )}
                  <div>
                    <div className="font-medium">Status</div>
                    <div className={`text-sm ${
                      subscriptionData?.isPremium ? 'text-green-600' : 'text-amber-600'
                    }`}>
                      {subscriptionData?.isPremium ? 'All features unlocked' : 'Limited features available'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Billing Information Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Subscription Details */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-blue-600" />
                Subscription Details
              </CardTitle>
              <CardDescription>
                Current plan and subscription information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Plan</span>
                <Badge variant="secondary" className={`${
                  subscriptionData?.isPremium
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                }`}>
                  {subscriptionData?.planName || 'Free Account'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Status</span>
                <Badge className={`${
                  subscriptionData?.subscriptionStatus === 'active' || subscriptionData?.isPremium
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : subscriptionData?.subscriptionStatus === 'free'
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                }`}>
                  {subscriptionData?.subscriptionStatus === 'active' || subscriptionData?.isPremium
                    ? 'Active'
                    : subscriptionData?.subscriptionStatus === 'free'
                    ? 'Free Tier'
                    : 'Inactive'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Billing Type</span>
                <span className="text-sm text-muted-foreground">
                  {subscriptionData?.billingType === 'oauth_authentication' ? 'OAuth Authentication' : 'Stripe Subscription'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Next Payment</span>
                <span className="text-sm text-muted-foreground">
                  {subscriptionData?.currentPeriodEnd
                    ? new Date(subscriptionData.currentPeriodEnd).toLocaleDateString()
                    : subscriptionData?.billingType === 'oauth_authentication'
                    ? 'N/A (OAuth)'
                    : 'N/A'}
                </span>
              </div>
              {subscriptionData?.subscriptionStatus === 'free' && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Usage</span>
                  <span className="text-sm text-muted-foreground">
                    {subscriptionData.currentUsage.savedCalculations}/{subscriptionData.usageLimits.maxSavedCalculations} calculations
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-blue-600" />
                Payment Method
              </CardTitle>
              <CardDescription>
                Current payment method on file
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {subscriptionData?.paymentMethod ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Type</span>
                    <span className="text-sm text-muted-foreground capitalize">
                      {subscriptionData.paymentMethod.type}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Card</span>
                    <span className="text-sm text-muted-foreground">
                      •••• •••• •••• {subscriptionData.paymentMethod.last4}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Expires</span>
                    <span className="text-sm text-muted-foreground">
                      {subscriptionData.paymentMethod.expiryMonth}/{subscriptionData.paymentMethod.expiryYear}
                    </span>
                  </div>
                </>
              ) : (
                <div className="text-center py-4">
                  <Shield className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No payment method required
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Premium access via Google OAuth
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Billing History */}
        <Card className="mb-8 border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-blue-600" />
              Billing History
            </CardTitle>
            <CardDescription>
              Recent billing transactions and invoices
            </CardDescription>
          </CardHeader>
          <CardContent>
            {subscriptionData?.billingHistory && subscriptionData.billingHistory.length > 0 ? (
              <div className="space-y-4">
                {subscriptionData.billingHistory.map((transaction, index) => (
                  <div key={transaction.id || index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900">
                        <DollarSign className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium">{transaction.description}</div>
                        <div className="text-sm text-muted-foreground">{transaction.date}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">${(transaction.amount / 100).toFixed(2)}</div>
                      <Badge variant={transaction.status === 'paid' ? 'default' : 'secondary'} className="text-xs">
                        {transaction.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium mb-2">No billing history</h3>
                <p className="text-sm text-muted-foreground">
                  {subscriptionData?.billingType === 'oauth_authentication'
                    ? 'Your premium access is provided through Google OAuth authentication. No billing transactions required.'
                    : 'No billing transactions found for your account.'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Premium Features */}
        <Card className="mb-8 border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-blue-600" />
              Your Premium Features
            </CardTitle>
            <CardDescription>
              All features are included with your Google OAuth authentication
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                "Social Security Optimization",
                "Combined Income Projections", 
                "Tax Implications Calculator",
                "Professional PDF Reports",
                "Advanced Planning Tools",
                "Email Notifications",
                "Unlimited Saved Calculations",
                "Priority Customer Support"
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Subscription Upgrade (for free tier users) */}
        {subscriptionData?.subscriptionStatus === 'free' && !subscriptionData?.isPremium && (
          <Card className="mb-8 border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-blue-600" />
                Upgrade to Premium
              </CardTitle>
              <CardDescription>
                Unlock all features with a premium subscription
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Monthly Plan */}
                <div className="p-6 bg-white dark:bg-slate-900 rounded-lg border-2 border-blue-200 dark:border-blue-800">
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-semibold">Monthly Plan</h3>
                    <div className="text-3xl font-bold text-blue-600 mt-2">$9.99</div>
                    <div className="text-sm text-muted-foreground">per month</div>
                  </div>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Unlimited saved calculations
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Social Security optimization
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      PDF report generation
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Email notifications
                    </li>
                  </ul>
                  <Button
                    className="w-full mt-4"
                    variant="outline"
                    onClick={() => handleUpgrade('monthly')}
                    disabled={upgradeLoading !== null}
                  >
                    {upgradeLoading === 'monthly' ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                        Processing...
                      </>
                    ) : (
                      'Choose Monthly'
                    )}
                  </Button>
                </div>

                {/* Annual Plan */}
                <div className="p-6 bg-white dark:bg-slate-900 rounded-lg border-2 border-green-200 dark:border-green-800 relative">
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-green-500 text-white">Best Value</Badge>
                  </div>
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-semibold">Annual Plan</h3>
                    <div className="text-3xl font-bold text-green-600 mt-2">$99.99</div>
                    <div className="text-sm text-muted-foreground">per year</div>
                    <div className="text-xs text-green-600 font-medium">Save $19.89</div>
                  </div>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Everything in Monthly
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Priority support
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Advanced tax planning
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      2 months free
                    </li>
                  </ul>
                  <Button
                    className="w-full mt-4 bg-green-600 hover:bg-green-700"
                    onClick={() => handleUpgrade('annual')}
                    disabled={upgradeLoading !== null}
                  >
                    {upgradeLoading === 'annual' ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                        Processing...
                      </>
                    ) : (
                      'Choose Annual'
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Billing Management */}
        <Card className="mb-8 border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-blue-600" />
              Billing Management
            </CardTitle>
            <CardDescription>
              Manage your payment methods and billing information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Stripe Configuration Status */}
            {stripeConfig && (
              <div className={`p-4 rounded-lg ${
                stripeConfig.isConfigured
                  ? 'bg-green-50 dark:bg-green-950/20'
                  : 'bg-blue-50 dark:bg-blue-950/20'
              }`}>
                <div className="flex items-start gap-3">
                  {stripeConfig.isConfigured ? (
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  ) : (
                    <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                  )}
                  <div>
                    <h4 className={`font-medium ${
                      stripeConfig.isConfigured
                        ? 'text-green-900 dark:text-green-100'
                        : 'text-blue-900 dark:text-blue-100'
                    }`}>
                      {stripeConfig.isConfigured ? 'Stripe Billing Configured' : 'Google OAuth Premium Access'}
                    </h4>
                    <p className={`text-sm mt-1 ${
                      stripeConfig.isConfigured
                        ? 'text-green-700 dark:text-green-300'
                        : 'text-blue-700 dark:text-blue-300'
                    }`}>
                      {stripeConfig.isConfigured
                        ? 'Full Stripe billing portal is available for payment method management.'
                        : 'Your premium access is provided through Google authentication. No additional billing required.'}
                    </p>
                    {!stripeConfig.isConfigured && (
                      <div className="mt-2 text-xs text-blue-600 dark:text-blue-400">
                        <p>Missing Stripe configuration:</p>
                        <ul className="list-disc list-inside mt-1 space-y-1">
                          {!stripeConfig.hasSecretKey && <li>Secret Key</li>}
                          {!stripeConfig.hasPublishableKey && <li>Publishable Key</li>}
                          {!stripeConfig.hasWebhookSecret && <li>Webhook Secret</li>}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <Separator />

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={handleCustomerPortal}
                disabled={portalLoading}
                className="flex-1"
                variant={stripeConfig?.isConfigured ? "default" : "outline"}
              >
                {portalLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                    Loading...
                  </>
                ) : (
                  <>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    {stripeConfig?.isConfigured ? 'Manage Billing (Stripe Portal)' : 'Access Billing Portal'}
                  </>
                )}
              </Button>
              <Button variant="outline" asChild className="flex-1">
                <Link href="/profile">
                  <User className="mr-2 h-4 w-4" />
                  Account Settings
                </Link>
              </Button>
            </div>

            {!stripeConfig?.isConfigured && (
              <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800 dark:text-amber-200">
                  <strong>Note:</strong> The billing portal will create a Stripe customer account for subscription management.
                  Your current free tier access will be maintained.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Support */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-blue-600" />
              Need Help?
            </CardTitle>
            <CardDescription>
              Get support for your Massachusetts Retirement System account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                If you have questions about your account, billing, or need technical support, 
                we're here to help.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button variant="outline" asChild>
                  <Link href="/contact">
                    <Mail className="mr-2 h-4 w-4" />
                    Contact Support
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/faq">
                    Help Center
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
