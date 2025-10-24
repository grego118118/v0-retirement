import { Metadata } from "next"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BreadcrumbStructuredData, FAQStructuredData } from "@/components/seo/structured-data"

export const metadata: Metadata = {
  title: "Massachusetts Pension Groups (1–4) Explained",
  description: "Understand Massachusetts retirement groups, minimum ages, and benefit multipliers for Groups 1–4 with clear tables and examples.",
}

const faqs = [
  { question: "What is Group 1?", answer: "General employees. Minimum retirement age 60 with standard multipliers." },
  { question: "What is Group 2?", answer: "Certain public safety and court roles. Minimum retirement age 55." },
  { question: "What is Group 3?", answer: "Massachusetts State Police. Eligible at any age with 20+ years of service." },
  { question: "What is Group 4?", answer: "Public safety and corrections. Minimum retirement age 50." },
]

export default function GroupsPage() {
  const breadcrumbs = [
    { name: "Resources", url: "https://www.masspension.com/resources" },
    { name: "Groups 1–4", url: "https://www.masspension.com/resources/groups" },
  ]

  return (
    <div className="container py-10">
      <BreadcrumbStructuredData items={breadcrumbs} />
      <FAQStructuredData faqs={faqs} />

      <h1 className="text-3xl font-bold mb-4">Massachusetts Pension Groups (1–4) Explained</h1>
      <p className="text-muted-foreground mb-6">Minimum retirement ages and multipliers vary by group. The 80% cap applies before Option B/C reductions.</p>

      <div className="grid gap-6 md:grid-cols-2">
      {/* Answer box for AEO */}
      <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
        <strong>Answer:</strong> Group eligibility and multipliers differ: Group 1 (age 60, 2.0–2.5%), Group 2 (age 55, 2.0–2.5%), Group 3 (State Police, 2.5% at 20+ years), Group 4 (age 50, 2.0–2.5%).
      </div>
        <Card>
          <CardHeader><CardTitle>Group 1</CardTitle></CardHeader>
          <CardContent>
            <p>General employees. Minimum retirement age 60.</p>
            <ul className="list-disc pl-5">
              <li>Multiplier: 2.0% at 60 to 2.5% at 65</li>
              <li>80% cap applies</li>
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Group 2</CardTitle></CardHeader>
          <CardContent>
            <p>Probation/court officers and similar roles. Minimum age 55.</p>
            <ul className="list-disc pl-5">
              <li>Multiplier: 2.0% at 55 to 2.5% at 60</li>
              <li>80% cap applies</li>
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Group 3</CardTitle></CardHeader>
          <CardContent>
            <p>State Police. Eligible at any age with 20+ years.</p>
            <ul className="list-disc pl-5">
              <li>Flat multiplier: 2.5%</li>
              <li>80% cap applies</li>
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Group 4</CardTitle></CardHeader>
          <CardContent>
            <p>Public safety/corrections. Minimum age 50.</p>
            <ul className="list-disc pl-5">
              <li>Multiplier: 2.0% at 50 to 2.5% at 55</li>
              <li>80% cap applies</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 space-x-2">
        <Badge variant="outline">Interlinking</Badge>
        <Link href="/resources/cola" className="underline">COLA Rules</Link>
        <span>•</span>
        <Link href="/resources/options" className="underline">Options A/B/C</Link>
        <span>•</span>
        <Link href="/calculator" className="underline">Try the Calculator</Link>
      </div>
    </div>
  )
}

