import { Metadata } from "next"
import { BreadcrumbStructuredData, FAQStructuredData } from "@/components/seo/structured-data"

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

      <div className="mt-8 space-x-2">
        <a href="/social-security" className="underline">Social Security Calculator</a>
        <span>•</span>
        <a href="/resources/cola" className="underline">COLA</a>
        <span>•</span>
        <a href="/resources/options" className="underline">Options A/B/C</a>
      </div>
    </div>
  )
}

