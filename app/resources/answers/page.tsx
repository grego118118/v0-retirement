import { Metadata } from "next"
import Link from "next/link"
import { BreadcrumbStructuredData, FAQStructuredData } from "@/components/seo/structured-data"

export const metadata: Metadata = {
  title: "Massachusetts Retirement Answers (Q&A Index)",
  description: "Short, factual answers for MA pension: groups, COLA, options A/B/C, service credit, and WEP/GPO.",
}

const qas = [
  { question: "Minimum age for Group 1?", answer: "Age 60." },
  { question: "Group 2 minimum age?", answer: "Age 55." },
  { question: "Group 4 minimum age?", answer: "Age 50." },
  { question: "COLA rate?", answer: "3% on first $13,000 ($390 cap)." },
]

export default function AnswersIndexPage() {
  const breadcrumbs = [
    { name: "Resources", url: "https://www.masspension.com/resources" },
    { name: "Answers", url: "https://www.masspension.com/resources/answers" },
  ]

  return (
    <div className="container py-10">
      <BreadcrumbStructuredData items={breadcrumbs} />
      <FAQStructuredData faqs={qas} />

      <h1 className="text-3xl font-bold mb-4">Massachusetts Retirement Answers</h1>
      <p className="text-muted-foreground mb-6">Quick, accurate answers with links to detailed guides.</p>

      <ul className="list-disc pl-5 space-y-2">
        <li><Link href="/resources/groups" className="underline">Groups 1–4</Link></li>
        <li><Link href="/resources/cola" className="underline">COLA Rules</Link></li>
        <li><Link href="/resources/options" className="underline">Options A/B/C</Link></li>
        <li><Link href="/resources/wep-gpo" className="underline">WEP/GPO Overview</Link></li>
      </ul>
    </div>
  )
}

