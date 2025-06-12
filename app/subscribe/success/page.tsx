"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Check, 
  Crown, 
  Calculator, 
  FileText, 
  TrendingUp, 
  DollarSign,
  ArrowRight,
  Sparkles
} from "lucide-react"

function SubscriptionSuccessContent() {
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(true)
  const sessionId = searchParams.get('session_id')

  useEffect(() => {
    // Trigger subscription status refresh
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('subscription-updated'))
    }
    
    // Set loading to false after a brief delay
    setTimeout(() => setIsLoading(false), 1000)
  }, [])

  const premiumFeatures = [
    {
      icon: Calculator,
      title: "Social Security Optimization",
      description: "Maximize your Social Security benefits with advanced algorithms",
      href: "/social-security"
    },
    {
      icon: TrendingUp,
      title: "Combined Planning Wizard",
      description: "Comprehensive pension + Social Security income projections",
      href: "/wizard"
    },
    {
      icon: DollarSign,
      title: "Tax Implications Calculator",
      description: "Federal and Massachusetts state tax optimization strategies",
      href: "/calculator"
    },
    {
      icon: FileText,
      title: "Professional PDF Reports",
      description: "Detailed retirement planning reports with charts and analysis",
      href: "/dashboard"
    }
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50/30 to-indigo-50/20 dark:from-green-950/20 dark:via-blue-950/20 dark:to-indigo-950/10 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-6">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold mb-2">Activating Your Premium Features...</h2>
            <p className="text-muted-foreground">Please wait while we set up your account</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50/30 to-indigo-50/20 dark:from-green-950/20 dark:via-blue-950/20 dark:to-indigo-950/10">
      <div className="container mx-auto px-4 py-8 lg:py-16">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="text-6xl mb-4">🎉</div>
          <Badge className="mb-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2">
            <Crown className="mr-2 h-4 w-4" />
            Premium Activated
          </Badge>
          <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            Welcome to Premium!
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Your subscription is now active. You have access to all premium features to maximize your Massachusetts retirement benefits.
          </p>
        </div>

        {/* Success Card */}
        <Card className="mb-8 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 max-w-2xl mx-auto">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="text-2xl font-bold text-green-600">
                <Sparkles className="inline mr-2 h-6 w-6" />
                Subscription Confirmed
              </div>
              <p className="text-muted-foreground">
                Your premium features are now active. Start exploring the advanced tools below!
              </p>
              {sessionId && (
                <div className="text-xs text-muted-foreground">
                  Session ID: {sessionId}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Premium Features */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">
              Start Using Your Premium Features
            </h2>
            <p className="text-lg text-muted-foreground">
              Click on any feature below to get started
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 lg:gap-8 max-w-4xl mx-auto">
            {premiumFeatures.map((feature, index) => {
              const Icon = feature.icon
              return (
                <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-800/50 cursor-pointer">
                  <Link href={feature.href}>
                    <CardHeader className="pb-4">
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                          <Icon className="h-6 w-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2 group-hover:text-blue-600 transition-colors">
                            {feature.title}
                          </CardTitle>
                          <CardDescription className="text-sm text-muted-foreground leading-relaxed">
                            {feature.description}
                          </CardDescription>
                        </div>
                        <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-blue-600 transition-colors flex-shrink-0 mt-1" />
                      </div>
                    </CardHeader>
                  </Link>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="text-center">
          <Card className="max-w-2xl mx-auto bg-gradient-to-br from-blue-50 via-indigo-50/50 to-purple-50/30 dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-purple-950/20 border-0 shadow-xl">
            <CardContent className="pt-8 pb-8">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                What would you like to do first?
              </h3>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                  asChild
                >
                  <Link href="/social-security">
                    <Crown className="mr-2 h-5 w-5" />
                    Try Social Security Optimization
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href="/dashboard">
                    <Calculator className="mr-2 h-5 w-5" />
                    Go to Dashboard
                  </Link>
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                Need help getting started? Check out our <Link href="/resources" className="text-blue-600 hover:underline">resources page</Link> or <Link href="/contact" className="text-blue-600 hover:underline">contact support</Link>.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function SubscriptionSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50/30 to-indigo-50/20 dark:from-green-950/20 dark:via-blue-950/20 dark:to-indigo-950/10 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">Loading success page...</h2>
          <p className="text-muted-foreground">Please wait while we confirm your subscription</p>
        </div>
      </div>
    }>
      <SubscriptionSuccessContent />
    </Suspense>
  )
}
