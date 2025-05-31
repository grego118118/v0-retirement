"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, X } from "lucide-react"
import Link from "next/link"

const features = {
  free: [
    "Basic pension calculations",
    "3 saved calculations",
    "Retirement age calculator",
    "Basic projection table",
    "Community support",
  ],
  freeLimitations: [
    "Advanced scenario modeling",
    "Unlimited saved calculations", 
    "PDF export",
    "Social Security integration",
    "Priority support",
  ],
  premium: [
    "Everything in Free",
    "Unlimited saved calculations",
    "Advanced scenario modeling",
    "PDF & Excel export",
    "Social Security integration",
    "401k/403b planning tools",
    "Spouse benefit calculator",
    "What-if analysis",
    "Priority email support",
    "Retirement roadmap",
  ]
}

export function PricingSection() {
  return (
    <section className="py-16 bg-muted/30">
      <div className="container px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight mb-4">
            Choose Your Retirement Planning Level
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Start with our free calculator or unlock advanced features to optimize your Massachusetts state pension
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Plan */}
          <Card className="relative">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl">Free Calculator</CardTitle>
              <CardDescription>Perfect for basic pension planning</CardDescription>
              <div className="text-4xl font-bold mt-4">$0</div>
              <div className="text-muted-foreground">Forever free</div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {features.free.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
                {features.freeLimitations.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3 opacity-50">
                    <X className="h-5 w-5 text-red-500 flex-shrink-0" />
                    <span className="text-sm line-through">{feature}</span>
                  </div>
                ))}
              </div>
              <Button className="w-full" variant="outline" asChild>
                <Link href="/calculator">Start Free Calculator</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Premium Plan */}
          <Card className="relative border-primary">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                Most Popular
              </span>
            </div>
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl">Premium Planner</CardTitle>
              <CardDescription>Complete retirement optimization toolkit</CardDescription>
              <div className="text-4xl font-bold mt-4">
                $9.99
                <span className="text-lg font-normal text-muted-foreground">/month</span>
              </div>
              <div className="text-muted-foreground">or $79/year (save 34%)</div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {features.premium.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
              <Button className="w-full" asChild>
                <Link href="/subscribe">Upgrade to Premium</Link>
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                30-day money-back guarantee
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Enterprise Section */}
        <div className="mt-12 text-center">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>For Organizations</CardTitle>
              <CardDescription>
                HR departments, unions, and financial advisors
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                White-label solutions, bulk licenses, and custom integrations available
              </p>
              <Button variant="outline" asChild>
                <Link href="/contact">Contact Sales</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
} 