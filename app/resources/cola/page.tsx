import { Metadata } from "next"
import Link from "next/link"
import { BreadcrumbStructuredData, FAQStructuredData } from "@/components/seo/structured-data"
import { Breadcrumbs } from "@/components/seo/breadcrumbs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, BookOpen, Calculator, TrendingUp } from "lucide-react"

export const metadata: Metadata = {
  title: "Massachusetts COLA (Cost of Living Adjustment) Explained",
  description: "Understand Massachusetts COLA rules: 3% on first $13,000 ($390 cap), start time, compounding, and examples.",
}

const faqs = [
  { question: "What is the COLA cap?", answer: "3% applied to the first $13,000 only, capped at $390 per year ($32.50/month)." },
  { question: "When does COLA start?", answer: "The first year after retirement, then annually with compounding." },
]

export default function COLAPage() {
  const breadcrumbs = [
    { name: "Resources", url: "https://www.masspension.com/resources" },
    { name: "COLA", url: "https://www.masspension.com/resources/cola" },
  ]

  return (
    <div className="container py-10">
      <BreadcrumbStructuredData items={breadcrumbs} />
      <FAQStructuredData faqs={faqs} />

      {/* Visual Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: "Resources", href: "/resources" },
          { label: "COLA" }
        ]}
        className="mb-4"
      />

      <h1 className="text-3xl font-bold mb-4">Massachusetts COLA Explained</h1>
      {/* Answer box for AEO */}
      <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
        <strong>Answer:</strong> Massachusetts COLA is 3% applied to only the first $13,000 of your allowance (max $390/year), with annual compounding.
      </div>
      <p className="text-muted-foreground mb-6">COLA is 3% applied to the first $13,000 of your annual allowance only. Maximum increase: $390/year.</p>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b"><th className="text-left py-2">Year</th><th className="text-left py-2">Base Applied</th><th className="text-left py-2">COLA (3%)</th><th className="text-left py-2">New Annual</th></tr>
          </thead>
          <tbody>
            <tr className="border-b"><td className="py-2">Year 1</td><td>$13,000</td><td>$390</td><td>Base + $390</td></tr>
            <tr className="border-b"><td className="py-2">Year 2</td><td>$13,000</td><td>$390</td><td>Prev + $390</td></tr>
          </tbody>
        </table>
      </div>

      {/* Related Blog Posts */}
      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Related Guides
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Link href="/blog/massachusetts-cola-2026-complete-guide" className="group" title="Massachusetts COLA 2026 Complete Guide">
            <Card className="h-full hover:shadow-md transition-shadow hover:border-blue-300">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2 group-hover:text-blue-600">
                  <TrendingUp className="h-4 w-4" />
                  Massachusetts COLA 2026 Complete Guide
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground mb-2">Everything you need to know about the 2026 COLA increase and how it affects your pension</p>
                <span className="text-xs text-blue-600 flex items-center gap-1">Read More <ArrowRight className="h-3 w-3" /></span>
              </CardContent>
            </Card>
          </Link>
          <Link href="/blog/massachusetts-cola-13000-cap-annual-adjustments" className="group" title="Understanding the $13,000 COLA Cap">
            <Card className="h-full hover:shadow-md transition-shadow hover:border-blue-300">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2 group-hover:text-blue-600">
                  <TrendingUp className="h-4 w-4" />
                  Understanding the $13,000 COLA Cap
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground mb-2">Deep dive into how the COLA cap works and its long-term impact on your retirement income</p>
                <span className="text-xs text-blue-600 flex items-center gap-1">Read More <ArrowRight className="h-3 w-3" /></span>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      <div className="mt-8 space-x-2">
        <a href="https://www.mass.gov" target="_blank" rel="noreferrer" className="underline">MSRB Guidance</a>
        <span>•</span>
        <Link href="/resources/groups" className="underline" title="Massachusetts Retirement Groups 1-4">Groups 1–4</Link>
        <span>•</span>
        <Link href="/resources/options" className="underline" title="Massachusetts Pension Options A, B, C">Options A/B/C</Link>
        <span>•</span>
        <Link href="/calculator" className="underline" title="Massachusetts Pension Calculator">
          <span className="inline-flex items-center gap-1"><Calculator className="h-3 w-3" /> Calculate Your Pension</span>
        </Link>
      </div>
    </div>
  )
}

