import { generateSEOMetadata } from "@/components/seo/metadata"
import { CalculatorStructuredData } from "@/components/seo/structured-data"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Crown, DollarSign, TrendingUp, Calculator, Check, Users, ExternalLink, Info } from "lucide-react"
import Link from "next/link"
import { SocialSecurityCalculator } from "@/components/social-security/social-security-calculator"
import { PremiumGate } from "@/components/premium/premium-gate"
import { Alert, AlertDescription } from "@/components/ui/alert"

export const metadata = generateSEOMetadata({
  title: "Social Security Integration | Massachusetts Pension Estimator",
  description: "Combine your Massachusetts state pension with official Social Security benefits from SSA.gov for complete retirement income planning.",
  path: "/social-security",
  keywords: [
    "Social Security calculator",
    "Massachusetts pension Social Security",
    "retirement income planning",
    "combined benefits calculator",
    "Social Security timing",
    "SSA.gov benefits",
  ],
})

const benefits = [
  "Use official SSA.gov benefit estimates for maximum accuracy",
  "Calculate combined pension and Social Security income",
  "Income replacement ratio analysis with real data",
  "Optimal claiming strategy recommendations",
  "Scenario comparison tools for different claiming ages",
  "Comprehensive retirement income breakdown and projections"
]

const strategies = [
  {
    title: "Early Claiming (Age 62)",
    description: "Reduced benefits but earlier access to income",
    pros: ["Immediate income", "Guaranteed benefits", "Good if poor health", "Bridge gap to pension"],
    cons: ["25-30% reduction", "Lower lifetime value", "Earnings test applies", "Permanent reduction"]
  },
  {
    title: "Full Retirement Age",
    description: "100% of calculated benefits",
    pros: ["Full benefit amount", "No earnings test", "Break-even point", "Standard claiming age"],
    cons: ["Delayed income", "Opportunity cost", "No delayed credits", "Miss maximum benefits"]
  },
  {
    title: "Delayed Claiming (Age 70)",
    description: "Maximum benefits with delayed retirement credits",
    pros: ["8% annual increase", "Maximum lifetime value", "Inflation protection", "Highest monthly amount"],
    cons: ["Delayed income", "Longevity risk", "Complex planning", "Forgone years of benefits"]
  }
]

const ssaResources = [
  {
    title: "my Social Security Account",
    url: "https://www.ssa.gov/myaccount/",
    description: "Create an account to view your official Social Security Statement with benefit estimates"
  },
  {
    title: "Retirement Estimator",
    url: "https://www.ssa.gov/benefits/retirement/estimator.html",
    description: "Quick estimator tool if you don't have a my Social Security account yet"
  },
  {
    title: "When to Start Receiving Benefits",
    url: "https://www.ssa.gov/benefits/retirement/planner/agereduction.html",
    description: "Official SSA guide on the impact of claiming at different ages"
  },
  {
    title: "Benefit Calculation Examples",
    url: "https://www.ssa.gov/OACT/quickcalc/",
    description: "SSA's quick benefit calculator for rough estimates"
  }
]

export default function SocialSecurityPage() {
  return (
    <>
      {/* AI-optimized structured data for Social Security calculator */}
      <CalculatorStructuredData
        pageUrl="https://www.masspension.com/social-security"
        calculatorType="comparison"
      />
      <div className="container mx-auto py-8 px-4">
      <div className="text-center mb-12">
        <Badge className="mb-4 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
          <DollarSign className="mr-1 h-3 w-3" />
          Premium Feature
        </Badge>
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          Social Security Integration
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Get the complete picture of your retirement income by combining your Massachusetts state pension 
          with <strong>official Social Security benefits from SSA.gov</strong> for optimal retirement planning.
        </p>
      </div>

      {/* Important Notice */}
      <Alert className="mb-8 border-blue-200 bg-blue-50 dark:bg-blue-950/20">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800 dark:text-blue-200">
          <strong>Why Use Official SSA.gov Data?</strong> Your actual Social Security benefits depend on your complete earnings history, 
          cost-of-living adjustments, and current law. Only SSA.gov has access to your official records to provide accurate estimates.
        </AlertDescription>
      </Alert>

      {/* Hero Section */}
      <Card className="mb-12 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
        <CardContent className="pt-8">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-2xl font-bold mb-4">Why Integrate Social Security?</h2>
              <p className="text-muted-foreground mb-6">
                Your Massachusetts state pension is just one part of your retirement income. 
                Understanding how it works with Social Security helps you make informed decisions 
                about when to retire and when to claim benefits for maximum lifetime value.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                  <span className="text-sm">Complete income picture</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <span className="text-sm">Optimal timing strategies</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                  <span className="text-sm">Income replacement analysis</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-orange-500"></div>
                  <span className="text-sm">Official SSA.gov accuracy</span>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-lg">
              <div className="text-center mb-4">
                <h3 className="font-semibold text-lg">Example: Combined Monthly Income</h3>
                <p className="text-sm text-muted-foreground">Based on official SSA.gov estimates</p>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-950/30 rounded">
                  <span className="text-sm">MA State Pension</span>
                  <span className="font-bold text-blue-600">$4,465</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-950/30 rounded">
                  <span className="text-sm">Social Security (FRA)</span>
                  <span className="font-bold text-green-600">$2,800</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-purple-50 dark:bg-purple-950/30 rounded border-2 border-purple-200">
                  <span className="font-bold">Total Monthly</span>
                  <span className="font-bold text-purple-600 text-lg">$7,265</span>
                </div>
                <div className="text-center pt-2">
                  <span className="text-sm text-muted-foreground">85% income replacement ratio</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SSA.gov Resources */}
      <Card className="mb-12">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl flex items-center justify-center gap-2">
            <ExternalLink className="h-6 w-6 text-blue-600" />
            Official Social Security Resources
          </CardTitle>
          <CardDescription>
            Get your official benefit estimates directly from the Social Security Administration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {ssaResources.map((resource, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-sm">{resource.title}</h3>
                    <Button size="sm" variant="outline" asChild>
                      <a href={resource.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">{resource.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <Alert className="mt-6 bg-green-50 border-green-200">
            <Check className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>Recommended:</strong> Start with "my Social Security Account" for the most accurate and detailed benefit information based on your actual earnings record.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Social Security Calculator */}
      <div className="mb-12">
        <PremiumGate
          feature="social_security"
          title="Social Security Benefit Integration"
          description="Enter your official SSA.gov benefit estimates and combine them with your pension for comprehensive retirement planning"
          showPreview={false}
        >
          <SocialSecurityCalculator />
        </PremiumGate>
      </div>

      {/* Benefits Section */}
      <Card className="mb-12">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">What You Get with Social Security Integration</CardTitle>
          <CardDescription>
            Comprehensive tools to optimize your retirement income strategy using official data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-start gap-3">
                <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm">{benefit}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Claiming Strategies */}
      <div className="mb-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold tracking-tight mb-4">
            Social Security Claiming Strategies
          </h2>
          <p className="text-lg text-muted-foreground">
            Understanding the impact of different claiming ages on your lifetime benefits
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {strategies.map((strategy, index) => (
            <Card key={index} className="relative">
              <CardHeader>
                <CardTitle className="text-lg">{strategy.title}</CardTitle>
                <CardDescription>{strategy.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-green-600 mb-2">Advantages:</h4>
                    <ul className="space-y-1">
                      {strategy.pros.map((pro, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
                          {pro}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-orange-600 mb-2">Considerations:</h4>
                    <ul className="space-y-1">
                      {strategy.cons.map((con, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-orange-500 mt-2 flex-shrink-0"></div>
                          {con}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Alert className="mt-8 border-amber-200 bg-amber-50 dark:bg-amber-950/20">
          <Info className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800 dark:text-amber-200">
            <strong>Remember:</strong> The optimal claiming strategy depends on your individual circumstances, including health, financial needs, 
            spouse's benefits, and other retirement income sources like your MA state pension.
          </AlertDescription>
        </Alert>
      </div>

      {/* CTA Section */}
      <Card className="text-center bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20">
        <CardContent className="pt-8">
          <Crown className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Ready to Optimize Your Retirement Income?</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Upgrade to Premium to access Social Security integration with official SSA.gov data and get the complete picture 
            of your retirement income potential with maximum accuracy.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" asChild>
              <Link href="/subscribe">
                <Crown className="mr-2 h-4 w-4" />
                Upgrade to Premium
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/calculator">
                <Calculator className="mr-2 h-4 w-4" />
                Try Pension Calculator
              </Link>
            </Button>
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-muted-foreground">
              Don't have your SSA.gov estimates yet? 
              <Button variant="link" className="p-0 h-auto font-normal text-sm ml-1" asChild>
                <a href="https://www.ssa.gov/myaccount/" target="_blank" rel="noopener noreferrer">
                  Get them here first <ExternalLink className="ml-1 h-3 w-3 inline" />
                </a>
              </Button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
    </>
  )
}