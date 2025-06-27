import type { Metadata } from "next"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, FileText, Search, BookOpen, Calculator, DollarSign, Building, Calendar } from "lucide-react"

export const metadata: Metadata = {
  title: "Resources | Massachusetts Pension Estimator",
  description: "Helpful resources and links for Massachusetts state employees planning their retirement.",
}

interface ResourceItemProps {
  title: string
  description: string
  link: string
  badge?: string
}

function ResourceItem({ title, description, link, badge }: ResourceItemProps) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{title}</CardTitle>
          {badge && (
            <Badge
              variant="outline"
              className="bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"
            >
              {badge}
            </Badge>
          )}
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardFooter>
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-primary hover:underline flex items-center gap-1"
        >
          Visit resource <ExternalLink className="h-3 w-3" />
        </a>
      </CardFooter>
    </Card>
  )
}

export default function ResourcesPage() {
  return (
    <div className="container py-12">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Retirement Resources</h1>
        <p className="text-muted-foreground mb-8 max-w-3xl">
          Access valuable information, tools, and official resources to help you plan for retirement as a Massachusetts
          state employee.
        </p>

        {/* Search Bar */}
        <div className="relative mb-8">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search resources..." className="pl-10" aria-label="Search resources" />
          <p className="text-xs text-muted-foreground mt-2">
            Search for specific topics like "social security", "healthcare", or "retirement board"
          </p>
        </div>

        {/* Featured Resources */}
        <div className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Featured Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-950/50 dark:to-background border-indigo-100 dark:border-indigo-900/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5 text-indigo-600" />
                  MA State Retirement Board
                </CardTitle>
                <CardDescription>Official information about your Massachusetts state pension benefits</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  The Massachusetts State Retirement Board administers the retirement system for state employees and
                  provides official information about your benefits.
                </p>
              </CardContent>
              <CardFooter>
                <a
                  href="https://www.mass.gov/orgs/massachusetts-state-retirement-board"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:underline flex items-center gap-1"
                >
                  Visit official website <ExternalLink className="h-3 w-3" />
                </a>
              </CardFooter>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/50 dark:to-background border-blue-100 dark:border-blue-900/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-blue-600" />
                  Social Security Administration
                </CardTitle>
                <CardDescription>
                  Information about Social Security benefits and how they work with your pension
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Learn about Social Security benefits, the Windfall Elimination Provision (WEP), and Government Pension
                  Offset (GPO) that may affect your benefits.
                </p>
              </CardContent>
              <CardFooter>
                <a
                  href="https://www.ssa.gov/benefits/retirement/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline flex items-center gap-1"
                >
                  Visit official website <ExternalLink className="h-3 w-3" />
                </a>
              </CardFooter>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-white dark:from-green-950/50 dark:to-background border-green-100 dark:border-green-900/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-green-600" />
                  Pension Calculator
                </CardTitle>
                <CardDescription>Use our pension calculator to estimate your retirement benefits</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Our calculator helps you estimate your pension benefits based on your age, years of service, and
                  salary history.
                </p>
              </CardContent>
              <CardFooter>
                <Link href="/calculator" className="text-green-600 hover:underline flex items-center gap-1">
                  Go to calculator
                </Link>
              </CardFooter>
            </Card>
          </div>
        </div>

        {/* Tabbed Resources */}
        <Tabs defaultValue="official" className="w-full">
          <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full mb-6 h-auto p-1">
            <TabsTrigger value="official" className="text-xs sm:text-sm px-2 sm:px-3 py-2">
              <span className="hidden sm:inline">Official Resources</span>
              <span className="sm:hidden">Official</span>
            </TabsTrigger>
            <TabsTrigger value="planning" className="text-xs sm:text-sm px-2 sm:px-3 py-2">
              <span className="hidden sm:inline">Retirement Planning</span>
              <span className="sm:hidden">Planning</span>
            </TabsTrigger>
            <TabsTrigger value="financial" className="text-xs sm:text-sm px-2 sm:px-3 py-2">
              <span className="hidden sm:inline">Financial Resources</span>
              <span className="sm:hidden">Financial</span>
            </TabsTrigger>
            <TabsTrigger value="education" className="text-xs sm:text-sm px-2 sm:px-3 py-2">
              <span className="hidden sm:inline">Educational Materials</span>
              <span className="sm:hidden">Education</span>
            </TabsTrigger>
          </TabsList>

          {/* Official Resources Tab */}
          <TabsContent value="official" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ResourceItem
                title="Massachusetts State Retirement Board"
                description="The official source for information about your state pension benefits, forms, and services."
                link="https://www.mass.gov/orgs/massachusetts-state-retirement-board"
                badge="Official"
              />
              <ResourceItem
                title="State Retirement Guide"
                description="Comprehensive guide to the Massachusetts state retirement system, benefits, and eligibility requirements."
                link="https://www.mass.gov/retirement-information-for-active-members-msrb"
                badge="Official"
              />
              <ResourceItem
                title="Mass Retirees Association"
                description="Advocacy organization representing the interests of public retirees in Massachusetts."
                link="https://massretirees.com/"
              />
              <ResourceItem
                title="Group Insurance Commission (GIC)"
                description="Information about health insurance and other benefits for state employees and retirees."
                link="https://www.mass.gov/orgs/group-insurance-commission"
                badge="Official"
              />
              <ResourceItem
                title="Massachusetts Deferred Compensation SMART Plan"
                description="Information about the state's 457(b) deferred compensation plan for public employees."
                link="https://www.mass.gov/smart-plan-for-public-employees"
                badge="Official"
              />
              <ResourceItem
                title="Public Employee Retirement Administration Commission (PERAC)"
                description="Oversight agency for the Massachusetts public pension systems."
                link="https://www.mass.gov/orgs/public-employee-retirement-administration-commission"
                badge="Official"
              />
            </div>
          </TabsContent>

          {/* Retirement Planning Tab */}
          <TabsContent value="planning" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ResourceItem
                title="Social Security Administration"
                description="Information about Social Security benefits, including how they may be affected by your government pension."
                link="https://www.ssa.gov/benefits/retirement/"
                badge="Federal"
              />
              <ResourceItem
                title="Windfall Elimination Provision (WEP)"
                description="Information about how your Social Security benefits may be reduced if you receive a pension from work not covered by Social Security."
                link="https://www.ssa.gov/policy/docs/program-explainers/windfall-elimination-provision.html"
                badge="Federal"
              />
              <ResourceItem
                title="Government Pension Offset (GPO)"
                description="Information about how your Social Security spousal or survivor benefits may be affected by your government pension."
                link="https://www.ssa.gov/policy/docs/program-explainers/government-pension-offset.html"
                badge="Federal"
              />
              <ResourceItem
                title="Medicare Information"
                description="Learn about Medicare eligibility, enrollment, and coverage options for retirees."
                link="https://www.medicare.gov/"
                badge="Federal"
              />
              <ResourceItem
                title="Retirement Planning Checklist"
                description="A comprehensive checklist to help you prepare for retirement as a Massachusetts state employee."
                link="https://www.mass.gov/info-details/pre-retirement-checklist"
                badge="Official"
              />
              <ResourceItem
                title="Retirement Board Forms"
                description="Access all the forms you need for retirement application and related processes."
                link="https://www.mass.gov/info-details/all-forms-msrb"
                badge="Official"
              />
            </div>
          </TabsContent>

          {/* Financial Resources Tab */}
          <TabsContent value="financial" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ResourceItem
                title="Consumer Financial Protection Bureau - Retirement"
                description="Tools and resources to help you plan for a secure retirement."
                link="https://www.consumerfinance.gov/consumer-tools/retirement/"
                badge="Federal"
              />
              <ResourceItem
                title="MyMoney.gov"
                description="Financial literacy and education resources from the federal government."
                link="https://www.mymoney.gov/"
                badge="Federal"
              />
              <ResourceItem
                title="Office of State Treasurer - Financial Education"
                description="Financial education resources from the Massachusetts State Treasurer's Office."
                link="https://www.mass.gov/info-details/financial-education-innovation-fund-grant"
                badge="Official"
              />
              <ResourceItem
                title="Massachusetts Office of Consumer Affairs"
                description="Consumer protection resources and information for seniors and retirees."
                link="https://www.mass.gov/orgs/office-of-consumer-affairs-and-business-regulation"
                badge="Official"
              />
              <ResourceItem
                title="AARP Retirement Calculator"
                description="Tool to help you determine if you're saving enough for retirement."
                link="https://www.aarp.org/money/retirement/retirement-calculator/"
              />
              <ResourceItem
                title="Investor.gov"
                description="SEC's resource for investor education, including retirement planning."
                link="https://www.sec.gov/resources-investors"
                badge="Federal"
              />
            </div>
          </TabsContent>

          {/* Educational Materials Tab */}
          <TabsContent value="education" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ResourceItem
                title="Understanding Your Retirement Benefits"
                description="Comprehensive guide to Massachusetts state retirement benefits and options."
                link="https://www.mass.gov/doc/msers-retirement-benefit-guide-0/download"
                badge="Guide"
              />
              <ResourceItem
                title="Retirement Option Selection Guide"
                description="Detailed information about retirement options A, B, and C and how to choose."
                link="https://www.mass.gov/doc/retirement-option-selection-form/download"
                badge="Guide"
              />
              <ResourceItem
                title="Creditable Service Guide"
                description="Information about what counts as creditable service and how to purchase additional service."
                link="https://www.mass.gov/info-details/creditable-service-for-retirement-msrb"
                badge="Guide"
              />
              <ResourceItem
                title="Retirement Board Seminars"
                description="Information about upcoming retirement planning seminars for state employees."
                link="https://www.mass.gov/orgs/massachusetts-state-retirement-board/events"
                badge="Events"
              />
              <ResourceItem
                title="Retirement Board Videos"
                description="Educational videos about the Massachusetts state retirement system."
                link="https://www.mass.gov/msrbs-educational-video-library"
                badge="Videos"
              />
              <ResourceItem
                title="Frequently Asked Questions"
                description="Answers to common questions about state retirement benefits."
                link="/faq"
              />
            </div>
          </TabsContent>
        </Tabs>

        {/* Additional Resources Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-semibold mb-4">Additional Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Publications & Newsletters
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li>
                    <a
                      href="https://www.mass.gov/lists/massachusetts-state-retirement-board-newsletters"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline flex items-center gap-1"
                    >
                      State Retirement Board Newsletters <ExternalLink className="h-3 w-3" />
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://massretirees.com/publications"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline flex items-center gap-1"
                    >
                      Mass Retirees Publications <ExternalLink className="h-3 w-3" />
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://www.mass.gov/lists/gic-benefit-decision-guides"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline flex items-center gap-1"
                    >
                      GIC Benefit Decision Guides <ExternalLink className="h-3 w-3" />
                    </a>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Events & Webinars
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li>
                    <a
                      href="https://www.mass.gov/orgs/massachusetts-state-retirement-board/events"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline flex items-center gap-1"
                    >
                      Retirement Board Seminars <ExternalLink className="h-3 w-3" />
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://www.mass.gov/info-details/gic-health-fairs"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline flex items-center gap-1"
                    >
                      GIC Health Fairs <ExternalLink className="h-3 w-3" />
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://massretirees.com/events"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline flex items-center gap-1"
                    >
                      Mass Retirees Events <ExternalLink className="h-3 w-3" />
                    </a>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  Learning Center
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li>
                    <a
                      href="https://www.mass.gov/guides/retirement-planning-for-massachusetts-state-employees"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline flex items-center gap-1"
                    >
                      Retirement Planning Guide <ExternalLink className="h-3 w-3" />
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://www.mass.gov/service-details/retirement-benefit-estimation"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline flex items-center gap-1"
                    >
                      Official Benefit Estimation <ExternalLink className="h-3 w-3" />
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://www.mass.gov/info-details/retirement-planning-resources"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline flex items-center gap-1"
                    >
                      Planning Resources <ExternalLink className="h-3 w-3" />
                    </a>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Contact Section */}
        <div className="mt-12 bg-muted/30 p-6 rounded-lg border">
          <h2 className="text-xl font-semibold mb-4">Need More Information?</h2>
          <p className="text-muted-foreground mb-4">
            If you can't find what you're looking for or need personalized assistance, our support team is here to help.
          </p>
          <Button asChild>
            <Link href="/contact">Contact Support</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
