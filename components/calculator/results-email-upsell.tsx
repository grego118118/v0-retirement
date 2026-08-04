"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { track } from "@vercel/analytics"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mail, CheckCircle, Lock, Crown, ArrowRight, ShieldCheck, FileText, Loader2, Download } from "lucide-react"
import { toast } from "sonner"
import { useSubscriptionStatus } from "@/hooks/use-subscription"
import { AdvisorLeadCard } from "./advisor-lead-card"

export interface ResultsUpsellData {
  annualPension: number
  monthlyPension: number
  averageSalary: number
  group: string
  age: number
  yearsOfService: number
  selectedOption: string
}

// Full pension calculation payload passed straight through to the report
// checkout API (kept as a loose shape here to avoid importing server-only
// PDF modules into the client bundle).
export type ReportData = Record<string, unknown>

const REPORT_PRICE = 39

/**
 * Email-my-results lead capture. Low-friction: one field, sends the user their
 * numbers and adds them to the nurture sequence. This is the primary lead magnet
 * on the results screen — the moment of highest engagement.
 */
function ResultsEmailCapture({ data }: { data: ResultsUpsellData }) {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSent, setIsSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address")
      return
    }
    setIsLoading(true)
    try {
      const res = await fetch("/api/email/calculation-results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          calculationType: "pension",
          results: {
            annualPension: data.annualPension,
            monthlyPension: data.monthlyPension,
            group: data.group,
            retirementAge: data.age,
            yearsOfService: data.yearsOfService,
          },
        }),
      })
      if (res.ok) {
        setIsSent(true)
        track("email_captured", { source: "results" })
        toast.success("Sent! Check your inbox for your pension estimate.")
      } else {
        const err = await res.json().catch(() => ({}))
        toast.error(err.error || "Couldn't send right now. Please try again.")
      }
    } catch {
      toast.error("Couldn't send right now. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (isSent) {
    return (
      <Card className="border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-900/40">
        <CardContent className="flex items-center gap-3 py-6">
          <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
          <div>
            <p className="font-semibold text-green-800 dark:text-green-300">Your estimate is on its way.</p>
            <p className="text-sm text-green-700 dark:text-green-400">
              We&rsquo;ll also send occasional Massachusetts retirement tips. Unsubscribe anytime.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-mrs-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-800/60 dark:border-slate-700">
      <CardContent className="py-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-mrs-blue-600/10 flex-shrink-0">
            <Mail className="h-5 w-5 text-mrs-blue-600" />
          </div>
          <div>
            <h3 className="font-bold text-mrs-navy-900 dark:text-white">Email me this estimate</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Get a copy of your pension numbers plus a free retirement planning checklist.
            </p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
          <Input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            required
            className="flex-1 bg-white dark:bg-slate-900"
            suppressHydrationWarning
          />
          <Button type="submit" disabled={isLoading} className="bg-mrs-blue-600 hover:bg-mrs-blue-700 text-white" suppressHydrationWarning>
            {isLoading ? "Sending..." : "Email My Results"}
          </Button>
        </form>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-1">
          <ShieldCheck className="h-3 w-3" /> No spam. We never share your email. Unsubscribe anytime.
        </p>
      </CardContent>
    </Card>
  )
}

/**
 * Report + Premium upsell shown to non-premium users at the point of highest
 * intent. Leads with the one-time report (matches the "pay once" mindset of
 * people near retirement) and offers the subscription as a secondary path.
 * Uses one honest, real computed teaser — no fabricated dollar figures.
 */
function ReportUpsell({ data, reportData }: { data: ResultsUpsellData; reportData?: ReportData }) {
  const [buying, setBuying] = useState(false)
  const replacementRatio =
    data.averageSalary > 0 ? Math.round((data.annualPension / data.averageSalary) * 100) : null

  const buyReport = async () => {
    if (!reportData) {
      // Shouldn't happen from the results screen, but fail safe to pricing.
      window.location.href = "/pricing"
      return
    }
    setBuying(true)
    track("report_checkout_started")
    try {
      const res = await fetch("/api/report/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportData }),
      })
      const json = await res.json().catch(() => ({}))
      if (res.ok && json.checkoutUrl) {
        window.location.href = json.checkoutUrl
      } else {
        toast.error(json.error || "Couldn't start checkout. Please try again.")
        setBuying(false)
      }
    } catch {
      toast.error("Couldn't start checkout. Please try again.")
      setBuying(false)
    }
  }

  return (
    <Card className="relative overflow-hidden border-mrs-gold-300 dark:border-mrs-gold-500/40">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-mrs-gold-400 to-mrs-gold-600" />
      <CardContent className="py-6">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="h-5 w-5 text-mrs-gold-600" />
          <h3 className="font-bold text-mrs-navy-900 dark:text-white">Get your Complete Retirement Report</h3>
        </div>

        {/* Honest, real teaser */}
        {replacementRatio !== null && (
          <div className="mb-5 rounded-xl bg-slate-50 dark:bg-slate-800/60 p-4 border border-slate-100 dark:border-slate-700">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Your estimated pension replaces about{" "}
              <strong className="text-mrs-navy-900 dark:text-white">{replacementRatio}% of your salary</strong>. Most
              retirees need 70&ndash;85% of pre-retirement income. The full report lays out your options and where the
              gaps are — a professional PDF you can keep or take to an advisor.
            </p>
          </div>
        )}

        {/* What's in the report */}
        <div className="grid sm:grid-cols-2 gap-3 mb-5">
          {[
            "Full pension breakdown for your numbers",
            "Options A, B & C with survivor benefits",
            "10-year COLA projection",
            "Professional PDF to keep or share",
          ].map((f) => (
            <div key={f} className="flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2">
              <CheckCircle className="h-3.5 w-3.5 text-mrs-gold-600 flex-shrink-0" />
              <span className="text-sm text-slate-700 dark:text-slate-300">{f}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <Button
            onClick={buyReport}
            disabled={buying}
            className="bg-gradient-to-r from-mrs-gold-500 to-mrs-gold-600 hover:from-mrs-gold-400 hover:to-mrs-gold-500 text-white font-bold w-full sm:w-auto"
          >
            {buying ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Starting checkout…
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Get My Report — ${REPORT_PRICE} one-time
              </>
            )}
          </Button>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            One-time payment · 30-day money-back guarantee
          </span>
        </div>

        {/* Secondary: subscription path */}
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
          <Link
            href="/pricing"
            onClick={() => track("upgrade_clicked", { source: "results_report_card" })}
            className="text-sm text-mrs-blue-600 hover:underline inline-flex items-center gap-1"
          >
            <Crown className="h-3.5 w-3.5" />
            Prefer ongoing access &amp; updates? See Premium plans from $6.99/mo
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

export function ResultsUpsellSection({
  data,
  reportData,
}: {
  data: ResultsUpsellData
  reportData?: ReportData
}) {
  const { isPremium, subscriptionStatus } = useSubscriptionStatus()
  const showUpsell = !isPremium && subscriptionStatus !== "loading"

  // Results screen reached = a completed calculation. Fired once per mount.
  useEffect(() => {
    track("calculator_completed", { group: data.group })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="mt-10 space-y-4 print:hidden">
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="text-xs">Next steps</Badge>
        <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
      </div>
      <ResultsEmailCapture data={data} />
      {showUpsell && <ReportUpsell data={data} reportData={reportData} />}
      <AdvisorLeadCard
        context={`Pension estimate: ${Math.round(data.annualPension)}/yr · ${data.group} · age ${data.age} · ${data.yearsOfService} YOS`}
      />
    </div>
  )
}
