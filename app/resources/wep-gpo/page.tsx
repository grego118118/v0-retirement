import { Metadata } from "next"
import Link from "next/link"
import { BreadcrumbStructuredData, FAQStructuredData } from "@/components/seo/structured-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, BookOpen, Calculator, Shield, TrendingUp } from "lucide-react"

export const metadata: Metadata = {
  title: "WEP/GPO for Massachusetts Employees",
  description: "Understand how WEP and GPO affected Social Security for MA employees and the latest changes.",
}

const faqs = [
  { question: "What was WEP?", answer: "A reduction formula applied to Social Security when receiving a non-covered pension." },
  { question: "What was GPO?", answer: "Reduced spousal/survivor benefits by two-thirds of a government pension." },
]

export default function WepGpoPage() {
  const breadcrumbs = [
    { name: "Resources", url: "https://www.masspension.com/resources" },
    { name: "WEP/GPO", url: "https://www.masspension.com/resources/wep-gpo" },
  ]

  return (
    <div className="container py-10">
      <BreadcrumbStructuredData items={breadcrumbs} />
      <FAQStructuredData faqs={faqs} />

      <h1 className="text-3xl font-bold mb-4">WEP/GPO Overview</h1>
      <p className="text-muted-foreground mb-6">Summary of how WEP/GPO worked and their impact on MA employees, plus links to official resources.</p>
      {/* Answer box for AEO */}
      <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
        <strong>Answer:</strong> WEP/GPO historically reduced certain Social Security benefits for public employees with non-covered pensions; check current federal guidance for status and impacts.
      </div>

      {/* Related Blog Posts */}
      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Related Guides
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Link href="/blog/social-security-fairness-act-what-massachusetts-state-employees-need-to-know" className="group" title="Social Security Fairness Act Guide">
            <Card className="h-full hover:shadow-md transition-shadow hover:border-blue-300">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2 group-hover:text-blue-600">
                  <Shield className="h-4 w-4" />
                  Social Security Fairness Act Guide
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground mb-2">How the elimination of WEP/GPO affects Massachusetts state employees and what to expect</p>
                <span className="text-xs text-blue-600 flex items-center gap-1">Read More <ArrowRight className="h-3 w-3" /></span>
              </CardContent>
            </Card>
          </Link>
          <Link href="/blog/maximizing-your-state-pension-benefits" className="group" title="Maximize Your Pension Benefits">
            <Card className="h-full hover:shadow-md transition-shadow hover:border-blue-300">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2 group-hover:text-blue-600">
                  <TrendingUp className="h-4 w-4" />
                  Maximize Your Pension Benefits
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground mb-2">Strategies to increase your total retirement income including Social Security</p>
                <span className="text-xs text-blue-600 flex items-center gap-1">Read More <ArrowRight className="h-3 w-3" /></span>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      <div className="mt-8 space-x-2">
        <Link href="/social-security" className="underline" title="Social Security Integration Calculator">
          <span className="inline-flex items-center gap-1"><Calculator className="h-3 w-3" /> Social Security Calculator</span>
        </Link>
        <span>•</span>
        <Link href="/resources/cola" className="underline" title="Massachusetts COLA Explained">COLA</Link>
        <span>•</span>
        <Link href="/resources/options" className="underline" title="Massachusetts Pension Options A, B, C">Options A/B/C</Link>
        <span>•</span>
        <Link href="/calculator" className="underline" title="Massachusetts Pension Calculator">Pension Calculator</Link>
      </div>
    </div>
  )
}

