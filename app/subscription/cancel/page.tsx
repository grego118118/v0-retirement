"use client"

import { useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  XCircle, 
  ArrowLeft, 
  RefreshCw,
  Mail,
  Shield,
  Crown,
  CheckCircle,
  Info
} from "lucide-react"
import { FREE_TIER_LIMITS } from "@/lib/stripe/config"

export default function SubscriptionCancelPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "loading") return
    if (!session) {
      router.push("/auth/signin?callbackUrl=/subscription/cancel")
      return
    }
  }, [session, status, router])

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-950 dark:via-blue-950/20 dark:to-indigo-950/10 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">Loading...</h2>
          <p className="text-muted-foreground">Please wait</p>
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
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto mb-6 p-4 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white w-20 h-20 flex items-center justify-center">
            <XCircle className="h-10 w-10" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            Payment Cancelled
          </h1>
          <p className="text-xl text-muted-foreground">
            Your subscription payment was not completed
          </p>
        </div>

        {/* Information Alert */}
        <Alert className="mb-8 border-blue-200 bg-blue-50 dark:bg-blue-950/20">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800 dark:text-blue-200">
            <strong>No charges were made.</strong> You can continue using the Massachusetts Retirement System 
            with free tier features or try upgrading again at any time.
          </AlertDescription>
        </Alert>

        {/* Current Status */}
        <Card className="mb-8 border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              Your Current Account
            </CardTitle>
            <CardDescription>
              You still have access to free tier features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Account Type</span>
                  <span className="text-sm text-muted-foreground">Free Account</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Email</span>
                  <span className="text-sm text-muted-foreground">{session.user?.email}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Status</span>
                  <span className="text-sm text-green-600">Active</span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Saved Calculations</span>
                  <span className="text-sm text-muted-foreground">Up to {FREE_TIER_LIMITS.maxSavedCalculations}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Social Security</span>
                  <span className="text-sm text-muted-foreground">{FREE_TIER_LIMITS.maxSocialSecurityCalculations} calculation</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">PDF Reports</span>
                  <span className="text-sm text-muted-foreground">Not available</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Free Features */}
        <Card className="mb-8 border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              What You Can Still Do
            </CardTitle>
            <CardDescription>
              Free tier features available to you
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {FREE_TIER_LIMITS.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upgrade Options */}
        <Card className="mb-8 border-0 shadow-lg bg-gradient-to-br from-white to-blue-50/50 dark:from-slate-900 dark:to-blue-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-blue-600" />
              Ready to Upgrade?
            </CardTitle>
            <CardDescription>
              Get full access to all premium retirement planning features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Premium features include unlimited calculations, advanced Social Security optimization, 
                combined planning wizard, tax strategies, PDF reports, and priority support.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild className="flex-1">
                  <Link href="/subscription/select">
                    <Crown className="mr-2 h-4 w-4" />
                    Try Again
                  </Link>
                </Button>
                <Button variant="outline" asChild className="flex-1">
                  <Link href="/pricing">
                    View Pricing
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Common Issues */}
        <Card className="mb-8 border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Common Payment Issues</CardTitle>
            <CardDescription>
              If you experienced problems during checkout
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-medium mb-1">Payment Method Issues</h4>
                <p className="text-sm text-muted-foreground">
                  Ensure your card has sufficient funds and international payments are enabled.
                </p>
              </div>
              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-medium mb-1">Browser or Network Issues</h4>
                <p className="text-sm text-muted-foreground">
                  Try using a different browser or check your internet connection.
                </p>
              </div>
              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-medium mb-1">Need Help?</h4>
                <p className="text-sm text-muted-foreground">
                  Contact our support team if you continue experiencing issues.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" asChild className="px-8">
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-5 w-5" />
              Go to Dashboard
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild className="px-8">
            <Link href="/subscription/select">
              <RefreshCw className="mr-2 h-5 w-5" />
              Try Again
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild className="px-8">
            <Link href="/contact">
              <Mail className="mr-2 h-5 w-5" />
              Get Help
            </Link>
          </Button>
        </div>

        {/* Support */}
        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground mb-4">
            Questions about pricing or need assistance with your subscription?
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
