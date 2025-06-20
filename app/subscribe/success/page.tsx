"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Crown, Calculator, FileText, Users, RefreshCw } from "lucide-react"
import Link from "next/link"

const premiumFeatures = [
  {
    icon: Calculator,
    title: "Social Security Integration",
    description: "Combine your pension with Social Security benefits",
    href: "/social-security"
  },
  {
    icon: FileText,
    title: "Unlimited Saved Calculations",
    description: "Save and compare multiple retirement scenarios",
    href: "/calculator"
  },
  {
    icon: Users,
    title: "Advanced Analysis Tools",
    description: "Access comprehensive retirement planning features",
    href: "/calculator"
  }
]

export default function SubscribeSuccessPage() {
  const router = useRouter()

  const refreshSubscriptionStatus = () => {
    // Trigger a subscription status refresh
    const event = new CustomEvent('subscription-updated')
    window.dispatchEvent(event)
  }

  useEffect(() => {
    // Automatically trigger status refresh when page loads
    const timer = setTimeout(() => {
      refreshSubscriptionStatus()
    }, 1000) // Small delay to ensure API calls are ready

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="text-center mb-8">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <Badge className="mb-4 bg-green-100 text-green-800">
          <Crown className="mr-1 h-3 w-3" />
          Premium Activated
        </Badge>
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          Welcome to Premium!
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Thank you for upgrading. You now have access to all premium features and advanced retirement planning tools.
        </p>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={refreshSubscriptionStatus}
          className="mt-4"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh Status
        </Button>
      </div>

      {/* Success Card */}
      <Card className="mb-8 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="text-2xl font-bold text-green-600">
              🎉 Subscription Confirmed
            </div>
            <p className="text-muted-foreground">
              Your premium features are now active. Try the Social Security Integration below!
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild>
                <Link href="/calculator">
                  <Calculator className="mr-2 h-4 w-4" />
                  Start Using Premium Features
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/social-security">
                  <Crown className="mr-2 h-4 w-4" />
                  Try Social Security Integration
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Premium Features */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-center mb-6">
          Your Premium Features Are Ready
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {premiumFeatures.map((feature, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="text-center">
                <feature.icon className="h-12 w-12 text-blue-500 mx-auto mb-2" />
                <CardTitle className="text-lg">{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full" variant="outline">
                  <Link href={feature.href}>Get Started</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Next Steps */}
      <Card>
        <CardHeader>
          <CardTitle>What's Next?</CardTitle>
          <CardDescription>
            Here's how to make the most of your premium subscription
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-sm font-bold">1</span>
                Complete Your Pension Calculation
              </h3>
              <p className="text-sm text-muted-foreground ml-8">
                Use our enhanced calculator with unlimited saves and advanced scenario modeling.
              </p>
            </div>
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-sm font-bold">2</span>
                Add Social Security Benefits
              </h3>
              <p className="text-sm text-muted-foreground ml-8">
                Integrate your Social Security estimates for complete retirement income planning.
              </p>
            </div>
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-sm font-bold">3</span>
                Compare Scenarios
              </h3>
              <p className="text-sm text-muted-foreground ml-8">
                Save multiple calculations and compare different retirement dates and options.
              </p>
            </div>
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-sm font-bold">4</span>
                Export Your Plans
              </h3>
              <p className="text-sm text-muted-foreground ml-8">
                Download PDF reports and share your retirement plan with advisors or family.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Support Information */}
      <div className="mt-8 text-center">
        <p className="text-sm text-muted-foreground mb-4">
          Need help getting started? Our premium support team is here to help.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="outline" asChild>
            <Link href="/contact">Contact Support</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/faq">View FAQ</Link>
          </Button>
        </div>
      </div>
    </div>
  )
} 