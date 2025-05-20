import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, Calculator, Clock, DollarSign, HelpCircle, TrendingUp } from "lucide-react"
import { generateSEOMetadata } from "@/components/seo/metadata"
import Script from "next/script"

export const metadata = generateSEOMetadata({
  title: "Massachusetts Pension Estimator | Retirement Planning for State Employees",
  description:
    "Calculate your Massachusetts state employee pension benefits and determine the optimal time to retire with our free pension estimator tool.",
  path: "/",
  keywords: [
    "Massachusetts pension calculator",
    "MA state retirement",
    "pension estimator",
    "state employee retirement",
    "retirement planning",
    "pension benefits",
    "Massachusetts retirement system",
  ],
})

export default function Home() {
  // Structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Massachusetts Pension Estimator",
    description:
      "Calculate your Massachusetts state employee pension benefits and determine the optimal time to retire.",
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    audience: {
      "@type": "Audience",
      audienceType: "Massachusetts State Employees",
    },
  }

  return (
    <>
      <Script id="structured-data" type="application/ld+json">
        {JSON.stringify(structuredData)}
      </Script>

      <div className="flex flex-col min-h-screen">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-indigo-50 to-white dark:from-indigo-950 dark:to-background py-16 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="space-y-4">
                <div className="inline-block rounded-lg bg-indigo-100 dark:bg-indigo-900 px-3 py-1 text-sm text-indigo-700 dark:text-indigo-300">
                  Massachusetts State Employees
                </div>
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Plan Your Retirement with Confidence
                </h1>
                <p className="text-muted-foreground md:text-xl">
                  Our pension estimator helps Massachusetts state employees calculate benefits and identify the optimal
                  time to retire based on your specific circumstances.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button size="lg" asChild>
                    <Link href="/calculator">
                      Start Calculating <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link href="/about">Learn More</Link>
                  </Button>
                </div>
              </div>
              <div className="mx-auto lg:mx-0 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-3xl blur-3xl opacity-20"></div>
                <div className="relative bg-white dark:bg-gray-900 border rounded-3xl shadow-xl overflow-hidden">
                  <div className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="h-2.5 w-24 bg-indigo-100 dark:bg-indigo-800 rounded"></div>
                        <div className="h-6 w-6 rounded-full bg-indigo-500"></div>
                      </div>
                      <div className="h-4 w-3/4 bg-gray-100 dark:bg-gray-800 rounded"></div>
                      <div className="h-4 w-1/2 bg-gray-100 dark:bg-gray-800 rounded"></div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="h-20 bg-indigo-50 dark:bg-indigo-900/50 rounded-lg flex items-center justify-center">
                          <div className="h-8 w-8 rounded-full bg-indigo-200 dark:bg-indigo-700 flex items-center justify-center">
                            <DollarSign className="h-4 w-4 text-indigo-600 dark:text-indigo-300" />
                          </div>
                        </div>
                        <div className="h-20 bg-indigo-50 dark:bg-indigo-900/50 rounded-lg flex items-center justify-center">
                          <div className="h-8 w-8 rounded-full bg-indigo-200 dark:bg-indigo-700 flex items-center justify-center">
                            <Clock className="h-4 w-4 text-indigo-600 dark:text-indigo-300" />
                          </div>
                        </div>
                      </div>
                      <div className="h-32 bg-gray-100 dark:bg-gray-800 rounded-lg flex flex-col items-center justify-center p-4">
                        <div className="h-4 w-full bg-indigo-100 dark:bg-indigo-800/50 rounded mb-2"></div>
                        <div className="h-4 w-3/4 bg-indigo-100 dark:bg-indigo-800/50 rounded mb-2"></div>
                        <div className="h-4 w-1/2 bg-indigo-100 dark:bg-indigo-800/50 rounded"></div>
                        <div className="mt-4 h-6 w-24 bg-indigo-500 rounded-md"></div>
                      </div>
                      <div className="h-10 w-32 bg-indigo-500 rounded-lg mx-auto flex items-center justify-center">
                        <div className="h-4 w-4 rounded-full bg-white mr-2"></div>
                        <div className="h-2 w-16 bg-white/80 rounded"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-12 md:py-16" id="features">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold tracking-tighter">Why Use Our Pension Estimator?</h2>
              <p className="text-muted-foreground mt-2 md:text-lg">
                Make informed decisions about your retirement with our comprehensive tools
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="transition-all hover:shadow-lg">
                <CardHeader className="pb-2">
                  <Calculator className="h-10 w-10 text-indigo-500 mb-2" />
                  <CardTitle>Accurate Calculations</CardTitle>
                  <CardDescription>
                    Our calculator uses the official Massachusetts retirement system formulas and factors
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Get precise estimates based on your age, years of service, group classification, and salary history.
                  </p>
                </CardContent>
              </Card>
              <Card className="transition-all hover:shadow-lg">
                <CardHeader className="pb-2">
                  <TrendingUp className="h-10 w-10 text-indigo-500 mb-2" />
                  <CardTitle>Retirement Projections</CardTitle>
                  <CardDescription>See how your pension grows with additional years of service</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Our projection tables help you identify the optimal retirement age to maximize your benefits.
                  </p>
                </CardContent>
              </Card>
              <Card className="transition-all hover:shadow-lg">
                <CardHeader className="pb-2">
                  <Clock className="h-10 w-10 text-indigo-500 mb-2" />
                  <CardTitle>Retirement Options</CardTitle>
                  <CardDescription>
                    Compare different retirement options and their impact on your benefits
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Understand the differences between Option A, B, and C and how they affect your pension and survivor
                    benefits.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 md:py-16 bg-indigo-50 dark:bg-indigo-950/30">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center text-center max-w-3xl mx-auto space-y-4">
              <DollarSign className="h-12 w-12 text-indigo-500" />
              <h2 className="text-3xl font-bold tracking-tighter">Ready to Plan Your Retirement?</h2>
              <p className="text-muted-foreground md:text-lg">
                Use our pension calculator to estimate your benefits and determine the best time to retire based on your
                specific circumstances.
              </p>
              <Button size="lg" className="mt-4" asChild>
                <Link href="/calculator">
                  Start Your Calculation <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* FAQ Preview Section */}
        <section className="py-12 md:py-16" id="faq-preview">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold tracking-tighter">Frequently Asked Questions</h2>
              <p className="text-muted-foreground mt-2 md:text-lg">
                Find answers to common questions about Massachusetts state pensions
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <HelpCircle className="h-5 w-5 mr-2 text-indigo-500" />
                    How is my pension calculated?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Your pension is based on your age, years of service, group classification, and the average of your
                    highest three consecutive years of regular compensation.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <HelpCircle className="h-5 w-5 mr-2 text-indigo-500" />
                    What are the different retirement options?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Massachusetts offers three retirement options: Option A (maximum allowance), Option B (annuity
                    protection), and Option C (joint survivor allowance).
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <HelpCircle className="h-5 w-5 mr-2 text-indigo-500" />
                    When am I eligible to retire?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Eligibility depends on when you entered service, your age, years of service, and group
                    classification. Our calculator helps determine your eligibility.
                  </p>
                </CardContent>
              </Card>
            </div>
            <div className="text-center mt-8">
              <Button variant="outline" asChild>
                <Link href="/faq">View All FAQs</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Latest Articles Section */}
        <section className="py-12 md:py-16 bg-muted/30">
          <div className="container px-4 md:px-6">
            <div className="flex justify-between items-center mb-10">
              <div>
                <h2 className="text-3xl font-bold tracking-tighter">Latest Retirement Articles</h2>
                <p className="text-muted-foreground mt-2">
                  Expert advice and insights for Massachusetts state employees
                </p>
              </div>
              <Button variant="outline" asChild>
                <Link href="/blog">View All Articles</Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="overflow-hidden">
                <div className="relative h-48 bg-muted">
                  <img
                    src="/placeholder.svg?height=200&width=400"
                    alt="Understanding Your Massachusetts Pension Options"
                    className="object-cover w-full h-full"
                  />
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl">
                    <Link
                      href="/blog/understanding-massachusetts-pension-options"
                      className="hover:text-primary transition-colors"
                    >
                      Understanding Your Massachusetts Pension Options
                    </Link>
                  </CardTitle>
                  <CardDescription>
                    Learn about the three pension options available to Massachusetts state employees.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="mr-1 h-3 w-3" /> 8 min read
                  </div>
                </CardContent>
              </Card>
              <Card className="overflow-hidden">
                <div className="relative h-48 bg-muted">
                  <img
                    src="/placeholder.svg?height=200&width=400"
                    alt="Retirement Planning Timeline"
                    className="object-cover w-full h-full"
                  />
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl">
                    <Link
                      href="/blog/retirement-planning-for-massachusetts-state-employees"
                      className="hover:text-primary transition-colors"
                    >
                      Retirement Planning Timeline
                    </Link>
                  </CardTitle>
                  <CardDescription>
                    A year-by-year guide to help state employees prepare for retirement.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="mr-1 h-3 w-3" /> 10 min read
                  </div>
                </CardContent>
              </Card>
              <Card className="overflow-hidden">
                <div className="relative h-48 bg-muted">
                  <img
                    src="/placeholder.svg?height=200&width=400"
                    alt="Maximizing Your State Pension Benefits"
                    className="object-cover w-full h-full"
                  />
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl">
                    <Link
                      href="/blog/maximizing-your-state-pension-benefits"
                      className="hover:text-primary transition-colors"
                    >
                      Maximizing Your State Pension Benefits
                    </Link>
                  </CardTitle>
                  <CardDescription>Discover proven strategies to increase your pension benefits.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="mr-1 h-3 w-3" /> 7 min read
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
