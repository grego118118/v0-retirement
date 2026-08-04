import Link from "next/link"
import type { Metadata } from "next"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { GraduationCap, ArrowRight, ExternalLink, Calculator, TrendingUp, FileText } from "lucide-react"
import { generateSEOMetadata } from "@/components/seo/metadata"
import { BreadcrumbStructuredData, FAQStructuredData, CalculatorStructuredData } from "@/components/seo/structured-data"
import { Breadcrumbs } from "@/components/seo/breadcrumbs"
import { RelatedTools } from "@/components/seo/related-tools"
import { MTRSCalculator } from "@/components/mtrs/mtrs-calculator"

export const metadata: Metadata = generateSEOMetadata({
  title: `Massachusetts Teacher Retirement Calculator ${new Date().getFullYear()} | MTRS + RetirementPlus`,
  description:
    "Free MTRS pension calculator for Massachusetts teachers. Estimate your monthly benefit with the RetirementPlus 2% bonus, compare Options A/B/C, and see the 80% cap — using the official Chapter 32 formulas.",
  path: "/teachers",
  keywords: [
    "Massachusetts teacher retirement calculator",
    "MTRS calculator",
    "MTRS pension calculator",
    "Massachusetts teacher pension",
    "RetirementPlus calculator",
    "teacher retirement Massachusetts",
    "MTRS retirement estimate",
    "Massachusetts teachers retirement system",
  ],
})

const TEACHER_FAQS = [
  {
    question: "How is a Massachusetts teacher's pension calculated?",
    answer:
      "MTRS pensions use the Chapter 32 formula: Average of your highest 3 consecutive years' salary × Years of creditable service × Age factor (1.45%–2.5% depending on your age and hire date). RetirementPlus participants who retire with 30+ years of creditable service add 2% for each full year of service beyond 24. The total is capped at 80% of your average salary.",
  },
  {
    question: "What is RetirementPlus for Massachusetts teachers?",
    answer:
      "RetirementPlus (R+) is the enhanced MTRS benefit program effective July 1, 2001. Participation is mandatory for teachers who joined on or after that date (with an 11% contribution rate); earlier members participate only if they elected in during 2001. If you retire with at least 30 years of creditable service, R+ adds 2% of your average salary for each full year of service beyond 24 — for example, 12% extra at 30 years, up to the 80% cap.",
  },
  {
    question: "When can a Massachusetts teacher retire?",
    answer:
      "Teachers who joined before April 2, 2012 can retire at age 55 with 10+ years of creditable service, or at any age with 20+ years. Teachers who joined on or after April 2, 2012 need to be at least 60 with 10+ years of service.",
  },
  {
    question: "What is the maximum MTRS pension?",
    answer:
      "80% of the average of your highest 3 consecutive years of salary. No combination of years, age factor, and RetirementPlus bonus can exceed the 80% cap.",
  },
  {
    question: "Do Massachusetts teachers get Social Security?",
    answer:
      "Massachusetts teachers do not pay into Social Security for their teaching service. However, with the Social Security Fairness Act repealing WEP and GPO, teachers who earned Social Security credits from other jobs (or through a spouse) now receive their full Social Security benefit alongside their MTRS pension.",
  },
]

export default function TeachersPage() {
  return (
    <>
      <CalculatorStructuredData
        pageUrl="https://www.masspension.com/teachers"
        calculatorType="pension"
      />
      <BreadcrumbStructuredData
        items={[
          { name: "Home", url: "https://www.masspension.com" },
          { name: "Teacher Retirement Calculator", url: "https://www.masspension.com/teachers" },
        ]}
      />
      <FAQStructuredData faqs={TEACHER_FAQS} />

      {/* Hero */}
      <div className="bg-mrs-navy-900 text-white py-14 md:py-20">
        <div className="container mx-auto px-4 max-w-5xl">
          <Badge className="mb-4 bg-mrs-blue-600/30 text-white border-mrs-blue-400/30">
            <GraduationCap className="w-3 h-3 mr-1 text-mrs-gold-400" />
            For MTRS Members
          </Badge>
          <h1 className="text-3xl md:text-5xl font-heading font-bold tracking-tight mb-4">
            Massachusetts Teacher Retirement Calculator
          </h1>
          <p className="text-lg md:text-xl text-blue-100 max-w-3xl leading-relaxed">
            Estimate your <strong className="text-white">MTRS pension</strong> in 60 seconds — including the{" "}
            <strong className="text-white">RetirementPlus 2% bonus</strong>, Options A/B/C, and the 80% cap. Free, no
            login required.
          </p>
          <p className="text-xs text-blue-300/80 mt-4 max-w-2xl">
            Independent planning tool. Not affiliated with the Massachusetts Teachers&rsquo; Retirement System (MTRS) or
            the Commonwealth of Massachusetts. Estimates only — your official benefit is determined by the MTRS at
            retirement.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-5xl py-10 md:py-14">
        <Breadcrumbs items={[{ label: "Teacher Retirement Calculator" }]} className="mb-8" />

        {/* Answer-first summary for AEO */}
        <div className="mb-10 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-6">
          <h2 className="text-lg font-bold text-mrs-navy-900 dark:text-white mb-2">How your teacher pension works</h2>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
            Your MTRS pension = <strong>average highest 3-year salary × years of creditable service × age factor</strong>{" "}
            (1.45%&ndash;2.5%). If you&rsquo;re a <strong>RetirementPlus</strong> participant retiring with 30+ years,
            add <strong>2% for every full year beyond 24</strong>. The total is capped at <strong>80%</strong> of your
            average salary. Example: age 60, 32 years, $85,000 salary → 64% base + 16% R+ = 80% cap ={" "}
            <strong>$68,000/year</strong>.
          </p>
        </div>

        {/* The calculator */}
        <MTRSCalculator />

        {/* Educational content */}
        <section className="mt-16 grid md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-mrs-gold-600" /> RetirementPlus
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-600 dark:text-slate-300">
              Mandatory for teachers who joined on/after July 1, 2001 (11% contribution). Retire with 30+ years and earn
              +2% per year of service beyond 24 — that&rsquo;s +12% at 30 years.
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Calculator className="h-4 w-4 text-mrs-gold-600" /> Eligibility
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-600 dark:text-slate-300">
              Joined before April 2, 2012: retire at 55 with 10+ years, or any age with 20+ years. Joined on/after April
              2, 2012: age 60 with 10+ years.
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4 text-mrs-gold-600" /> Social Security
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-600 dark:text-slate-300">
              Teaching service isn&rsquo;t covered by Social Security, but the WEP/GPO repeal means credits from other
              work now pay in full.{" "}
              <Link href="/social-security" className="text-mrs-blue-600 hover:underline">
                Check your Social Security benefit
              </Link>
              .
            </CardContent>
          </Card>
        </section>

        {/* FAQ (visible copy mirrors the schema) */}
        <section className="mt-16">
          <h2 className="text-2xl font-heading font-bold text-mrs-navy-900 dark:text-white mb-6">
            Massachusetts teacher retirement FAQ
          </h2>
          <div className="space-y-6">
            {TEACHER_FAQS.map((faq) => (
              <div key={faq.question}>
                <h3 className="font-semibold text-mrs-navy-900 dark:text-white mb-1.5">{faq.question}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Cross-links */}
        <section className="mt-16 rounded-2xl bg-gradient-to-br from-mrs-navy-900 to-mrs-navy-800 text-white p-8 text-center">
          <h2 className="text-2xl font-heading font-bold mb-3">State or municipal employee instead?</h2>
          <p className="text-blue-100 mb-6 max-w-xl mx-auto">
            If you&rsquo;re in the state retirement system (Groups 1&ndash;4) rather than MTRS, use the state calculator —
            it applies your group&rsquo;s factors and eligibility rules.
          </p>
          <Button size="lg" className="bg-gradient-to-r from-mrs-gold-500 to-mrs-gold-600 hover:from-mrs-gold-400 hover:to-mrs-gold-500 text-white font-bold" asChild>
            <Link href="/calculator">
              <Calculator className="mr-2 h-5 w-5" />
              State Employee Calculator
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </section>

        {/* Source citation */}
        <div className="mt-12 text-sm text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-700 pt-6">
          <p className="mb-2">
            <strong>Sources:</strong> Massachusetts Teachers&rsquo; Retirement System benefit and RetirementPlus
            guidance under M.G.L. c. 32. Figures are estimates; your official benefit is calculated by the MTRS at
            retirement.
          </p>
          <a
            href="https://mtrs.state.ma.us/members/retirement-benefit-estimator/"
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="inline-flex items-center gap-1 text-mrs-blue-600 hover:underline"
          >
            MTRS: Retirement benefit estimators
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>

        <RelatedTools currentSlug="teachers" />
      </div>
    </>
  )
}
