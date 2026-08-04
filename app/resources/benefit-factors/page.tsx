import Link from "next/link"
import type { Metadata } from "next"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Calculator, ExternalLink } from "lucide-react"
import { generateSEOMetadata } from "@/components/seo/metadata"
import { BreadcrumbStructuredData, FAQStructuredData } from "@/components/seo/structured-data"
import { Breadcrumbs } from "@/components/seo/breadcrumbs"

export const metadata: Metadata = generateSEOMetadata({
  title: "Massachusetts Pension Benefit Factor Chart (Groups 1-4 by Age)",
  description:
    "Official MSRB benefit factor (age factor) chart for Massachusetts state employees. See the exact percentage per year of service for Groups 1, 2, 3 and 4 at every retirement age, for members hired before and after April 2, 2012.",
  path: "/resources/benefit-factors",
  keywords: [
    "Massachusetts benefit factor chart",
    "MA pension age factor",
    "Massachusetts retirement percentage chart",
    "Group 1 benefit factor",
    "Group 2 benefit factor",
    "Group 4 benefit factor",
    "MSRB age factor table",
    "pension multiplier Massachusetts",
  ],
})

// Source: lib/pension-calculations.ts (MSRB-validated). Ages shown as whole-year
// factors; the calculator interpolates for partial ages.
const PRE_2012 = {
  ages: [50, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65],
  GROUP_1: { 55: 1.5, 56: 1.6, 57: 1.7, 58: 1.8, 59: 1.9, 60: 2.0, 61: 2.1, 62: 2.2, 63: 2.3, 64: 2.4, 65: 2.5 },
  GROUP_2: { 55: 2.0, 56: 2.1, 57: 2.2, 58: 2.3, 59: 2.4, 60: 2.5 },
  GROUP_3: { 55: 2.5, 56: 2.5, 57: 2.5, 58: 2.5, 59: 2.5, 60: 2.5 },
  GROUP_4: { 50: 2.0, 51: 2.1, 52: 2.2, 53: 2.3, 54: 2.4, 55: 2.5 },
} as const

const POST_2012 = {
  GROUP_1: { 60: 1.45, 61: 1.6, 62: 1.75, 63: 1.9, 64: 2.05, 65: 2.2, 66: 2.35, 67: 2.5 },
  GROUP_2: { 55: 1.45, 56: 1.6, 57: 1.75, 58: 1.9, 59: 2.05, 60: 2.2, 61: 2.35, 62: 2.5 },
  GROUP_4: { 50: 1.45, 51: 1.6, 52: 1.75, 53: 1.9, 54: 2.05, 55: 2.2, 56: 2.35, 57: 2.5 },
} as const

const FAQS = [
  {
    question: "What is a Massachusetts pension benefit factor?",
    answer:
      "The benefit factor (also called the age factor) is the percentage of your average salary you earn for each year of creditable service. Your annual pension equals Average Salary × Years of Service × Benefit Factor. Factors range from 1.45% to 2.5% depending on your retirement group, your age at retirement, and whether you were hired before or after April 2, 2012.",
  },
  {
    question: "What is the maximum Massachusetts pension?",
    answer:
      "Your pension is capped at 80% of your average highest 3-year salary, no matter how many years you work or how high your benefit factor is.",
  },
  {
    question: "Do benefit factors differ for employees hired after April 2, 2012?",
    answer:
      "Yes. Members hired on or after April 2, 2012 with fewer than 30 years of service use a lower factor schedule that reaches the maximum 2.5% at a higher age. Members hired before that date, or hired after with 30+ years of service, use the original schedule.",
  },
]

function FactorTable({
  caption,
  ages,
  rows,
}: {
  caption: string
  ages: readonly number[]
  rows: { label: string; sub: string; data: Record<number, number | undefined> }[]
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
      <table className="w-full text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="bg-slate-100 dark:bg-slate-800">
            <th className="sticky left-0 bg-slate-100 dark:bg-slate-800 px-4 py-3 text-left font-semibold text-mrs-navy-900 dark:text-white">
              Retirement age
            </th>
            {ages.map((a) => (
              <th key={a} className="px-3 py-3 text-center font-semibold text-mrs-navy-900 dark:text-white">
                {a}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} className="border-t border-slate-200 dark:border-slate-700">
              <th scope="row" className="sticky left-0 bg-white dark:bg-slate-900 px-4 py-3 text-left">
                <span className="font-semibold text-mrs-navy-900 dark:text-white">{row.label}</span>
                <span className="block text-xs text-slate-500 dark:text-slate-400">{row.sub}</span>
              </th>
              {ages.map((a) => (
                <td key={a} className="px-3 py-3 text-center text-slate-700 dark:text-slate-300">
                  {row.data[a] !== undefined ? `${row.data[a]!.toFixed(2)}%` : "—"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function BenefitFactorsPage() {
  return (
    <>
      <BreadcrumbStructuredData
        items={[
          { name: "Home", url: "https://www.masspension.com" },
          { name: "Resources", url: "https://www.masspension.com/resources" },
          { name: "Benefit Factor Chart", url: "https://www.masspension.com/resources/benefit-factors" },
        ]}
      />
      <FAQStructuredData faqs={FAQS} />

      <div className="bg-mrs-navy-900 text-white py-14 md:py-20">
        <div className="container mx-auto px-4 max-w-5xl">
          <Badge className="mb-4 bg-mrs-blue-600/30 text-white border-mrs-blue-400/30">
            <Calculator className="w-3 h-3 mr-1 text-mrs-gold-400" />
            MSRB Reference
          </Badge>
          <h1 className="text-3xl md:text-5xl font-heading font-bold tracking-tight mb-4">
            Massachusetts Pension Benefit Factor Chart
          </h1>
          <p className="text-lg md:text-xl text-blue-100 max-w-3xl leading-relaxed">
            The benefit factor is the percentage you earn per year of service. Your annual pension is{" "}
            <strong className="text-white">Average Salary × Years of Service × Benefit Factor</strong>, capped at 80% of
            your average salary. Below are the exact factors for Groups 1&ndash;4 at every retirement age.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-5xl py-10 md:py-14">
        <Breadcrumbs
          items={[{ label: "Resources", href: "/resources" }, { label: "Benefit Factor Chart" }]}
          className="mb-8"
        />

        {/* Answer-first summary box */}
        <div className="mb-10 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-6">
          <h2 className="text-lg font-bold text-mrs-navy-900 dark:text-white mb-2">Quick answer</h2>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
            Massachusetts pension benefit factors range from <strong>1.45% to 2.5%</strong> per year of service. Every
            group reaches the maximum <strong>2.5%</strong> factor at its full retirement age: Group 1 at 65 (67 if hired
            after April 2, 2012), Group 2 at 60 (62 post-2012), Group 4 at 55 (57 post-2012), and Group 3 (State Police)
            at a flat 2.5%. Your total pension can never exceed <strong>80% of your average salary</strong>.
          </p>
        </div>

        {/* Pre-2012 table */}
        <section className="mb-12">
          <h2 className="text-2xl font-heading font-bold text-mrs-navy-900 dark:text-white mb-2">
            Benefit factors — hired before April 2, 2012
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-5 text-sm">
            Also applies to members hired on or after April 2, 2012 who retire with 30+ years of creditable service.
          </p>
          <FactorTable
            caption="Massachusetts pension benefit factors by group and retirement age, hired before April 2, 2012"
            ages={PRE_2012.ages}
            rows={[
              { label: "Group 1", sub: "General employees", data: PRE_2012.GROUP_1 },
              { label: "Group 2", sub: "Certain public safety / court", data: PRE_2012.GROUP_2 },
              { label: "Group 3", sub: "State Police (flat 2.5%)", data: PRE_2012.GROUP_3 },
              { label: "Group 4", sub: "Police, fire, corrections", data: PRE_2012.GROUP_4 },
            ]}
          />
        </section>

        {/* Post-2012 table */}
        <section className="mb-12">
          <h2 className="text-2xl font-heading font-bold text-mrs-navy-900 dark:text-white mb-2">
            Benefit factors — hired on or after April 2, 2012 (under 30 years of service)
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-5 text-sm">
            The 2012 pension reform pushed the maximum 2.5% factor to a higher age for newer employees.
          </p>
          <FactorTable
            caption="Massachusetts pension benefit factors by group and retirement age, hired on or after April 2, 2012 with under 30 years of service"
            ages={[50, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67]}
            rows={[
              { label: "Group 1", sub: "General employees", data: POST_2012.GROUP_1 },
              { label: "Group 2", sub: "Certain public safety / court", data: POST_2012.GROUP_2 },
              { label: "Group 4", sub: "Police, fire, corrections", data: POST_2012.GROUP_4 },
            ]}
          />
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">
            Group 3 (State Police) retains a flat 2.5% factor. Ages below each group&rsquo;s minimum are not eligible.
          </p>
        </section>

        {/* Options note */}
        <section className="mb-12 grid md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Option A</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-600 dark:text-slate-300">
              Full allowance, no reduction. No survivor benefit after your death.
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Option B</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-600 dark:text-slate-300">
              About a 1% reduction. Returns any remaining contributions to your beneficiary.
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Option C</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-600 dark:text-slate-300">
              Roughly a 7&ndash;15% reduction (based on both ages). Pays 66.67% to your survivor for life.
            </CardContent>
          </Card>
        </section>

        {/* CTA */}
        <div className="rounded-2xl bg-gradient-to-br from-mrs-navy-900 to-mrs-navy-800 text-white p-8 text-center mb-12">
          <h2 className="text-2xl font-heading font-bold mb-3">See your own numbers</h2>
          <p className="text-blue-100 mb-6 max-w-xl mx-auto">
            The free calculator applies these factors, the 80% cap, and COLA automatically — including partial-year age
            factors this chart rounds off.
          </p>
          <Button size="lg" className="bg-gradient-to-r from-mrs-gold-500 to-mrs-gold-600 text-white font-bold hover:from-mrs-gold-400 hover:to-mrs-gold-500" asChild>
            <Link href="/calculator">
              <Calculator className="mr-2 h-5 w-5" />
              Calculate My Pension
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>

        {/* Source citation for E-E-A-T / AEO */}
        <div className="text-sm text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-700 pt-6">
          <p className="mb-2">
            <strong>Source:</strong> Massachusetts State Retirement Board (MSRB) benefit factor schedules under M.G.L. c.
            32. Figures are for estimation; your official benefit is determined by the MSRB at retirement.
          </p>
          <a
            href="https://www.mass.gov/info-details/how-to-calculate-your-estimated-pension-benefits-msrb"
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="inline-flex items-center gap-1 text-mrs-blue-600 hover:underline"
          >
            MSRB: How to calculate your estimated pension benefits
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </>
  )
}
