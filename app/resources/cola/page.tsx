import { Metadata } from "next"
import { BreadcrumbStructuredData, FAQStructuredData } from "@/components/seo/structured-data"

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

      <div className="mt-8 space-x-2">
        <a href="https://www.mass.gov" target="_blank" rel="noreferrer" className="underline">MSRB Guidance</a>
        <span>•</span>
        <a href="/resources/groups" className="underline">Groups 1–4</a>
        <span>•</span>
        <a href="/resources/options" className="underline">Options A/B/C</a>
      </div>
    </div>
  )
}

