"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { FileText, ArrowRight, CheckCircle, Calculator } from "lucide-react"
import { track } from "@vercel/analytics"
import { useSubscriptionStatus } from "@/hooks/use-subscription"

const REPORT_FEATURES = [
  "Full pension breakdown for your exact numbers",
  "Options A, B & C with survivor benefits",
  "10-year COLA projection",
  "Professional PDF to keep or share with an advisor",
]

/**
 * Post-article CTA introducing the $39 Complete Retirement Report. The report
 * can only be purchased from the results screen (checkout needs calculation
 * data), so this routes readers through the free calculator first — which is
 * also the honest pitch for a trust-first audience.
 */
export function ReportCTA({ className = "" }: { className?: string }) {
  const { isPremium } = useSubscriptionStatus()
  // Premium already includes everything the report covers — hide the pitch.
  if (isPremium) return null

  return (
    <Card className={`relative overflow-hidden border-mrs-gold-300 dark:border-mrs-gold-500/40 ${className}`}>
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-mrs-gold-400 to-mrs-gold-600" />
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-3">
          <FileText className="h-5 w-5 text-mrs-gold-600" />
          <h3 className="text-xl font-bold text-mrs-navy-900 dark:text-white">
            See these rules applied to your own pension
          </h3>
        </div>

        <p className="text-slate-600 dark:text-slate-300 mb-5">
          Run your numbers in the free calculator — no account needed. If you want the
          full picture, the <strong className="text-mrs-navy-900 dark:text-white">Complete
          Retirement Report</strong> turns your results into a professional PDF for a
          one-time $39, backed by a 30-day money-back guarantee.
        </p>

        <div className="grid sm:grid-cols-2 gap-3 mb-5">
          {REPORT_FEATURES.map((f) => (
            <div
              key={f}
              className="flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2"
            >
              <CheckCircle className="h-3.5 w-3.5 text-mrs-gold-600 flex-shrink-0" />
              <span className="text-sm text-slate-700 dark:text-slate-300">{f}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <Button
            asChild
            size="lg"
            className="bg-gradient-to-r from-mrs-gold-500 to-mrs-gold-600 hover:from-mrs-gold-400 hover:to-mrs-gold-500 text-white font-bold w-full sm:w-auto"
          >
            <Link
              href="/calculator"
              onClick={() => track("report_cta_clicked", { source: "blog_post" })}
              className="flex items-center justify-center gap-2"
            >
              <Calculator className="h-5 w-5" />
              Start with the Free Calculator
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Free calculator · No signup · The report is optional
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
