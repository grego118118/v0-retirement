import { Metadata } from "next"
import Link from "next/link"
import { BreadcrumbStructuredData, FAQStructuredData } from "@/components/seo/structured-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, BookOpen, Calculator, FileText, Clock } from "lucide-react"

export const metadata: Metadata = {
  title: "Massachusetts Pension Options A/B/C Compared",
  description: "Compare Options A, B, and C: reductions, survivor benefits, and when each makes sense.",
}

const faqs = [
  { question: "Option A?", answer: "100% benefit, no survivor benefit." },
  { question: "Option B?", answer: "Slightly reduced (about 1–5%) with return of contributions if you pass away before getting equivalent." },
  { question: "Option C?", answer: "Reduced benefit with 66.67% survivor benefit; reduction varies by ages." },
]

export default function OptionsPage() {
  const breadcrumbs = [
    { name: "Resources", url: "https://www.masspension.com/resources" },
    { name: "Options", url: "https://www.masspension.com/resources/options" },
  ]

  return (
    <div className="container py-10">
      <BreadcrumbStructuredData items={breadcrumbs} />
      <FAQStructuredData faqs={faqs} />

      <h1 className="text-3xl font-bold mb-4">Options A/B/C</h1>
      {/* Answer box for AEO */}
      <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
        <strong>Answer:</strong> Option A pays the most but no survivor; Option B is slightly reduced; Option C provides a 66.67% survivor benefit with a larger reduction.
      </div>
      <p className="text-muted-foreground mb-6">Option A: highest monthly, no survivor. Option B: small reduction. Option C: survivor protection with higher reduction.</p>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b"><th className="text-left py-2">Option</th><th className="text-left py-2">Reduction</th><th className="text-left py-2">Survivor Benefit</th></tr>
          </thead>
          <tbody>
            <tr className="border-b"><td className="py-2">A</td><td>0%</td><td>None</td></tr>
            <tr className="border-b"><td className="py-2">B</td><td>~1–5%</td><td>Contributions returned</td></tr>
            <tr className="border-b"><td className="py-2">C</td><td>~7–15%+</td><td>66.67% to beneficiary</td></tr>
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
          <Link href="/blog/understanding-massachusetts-pension-options" className="group" title="Understanding Massachusetts Pension Options A, B, C">
            <Card className="h-full hover:shadow-md transition-shadow hover:border-blue-300">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2 group-hover:text-blue-600">
                  <FileText className="h-4 w-4" />
                  Complete Guide to Options A, B, C
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground mb-2">Detailed comparison of survivor benefits and how to choose the right option for your situation</p>
                <span className="text-xs text-blue-600 flex items-center gap-1">Read More <ArrowRight className="h-3 w-3" /></span>
              </CardContent>
            </Card>
          </Link>
          <Link href="/blog/retirement-planning-for-massachusetts-state-employees" className="group" title="Retirement Planning Timeline">
            <Card className="h-full hover:shadow-md transition-shadow hover:border-blue-300">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2 group-hover:text-blue-600">
                  <Clock className="h-4 w-4" />
                  Retirement Planning Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground mb-2">Year-by-year checklist including when to make your option selection</p>
                <span className="text-xs text-blue-600 flex items-center gap-1">Read More <ArrowRight className="h-3 w-3" /></span>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      <div className="mt-8 space-x-2">
        <Link href="/resources/groups" className="underline" title="Massachusetts Retirement Groups 1-4">Groups 1–4</Link>
        <span>•</span>
        <Link href="/resources/cola" className="underline" title="Massachusetts COLA Explained">COLA Rules</Link>
        <span>•</span>
        <Link href="/calculator" className="underline" title="Massachusetts Pension Calculator">
          <span className="inline-flex items-center gap-1"><Calculator className="h-3 w-3" /> Calculate Your Pension</span>
        </Link>
      </div>
    </div>
  )
}

