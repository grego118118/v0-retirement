import { Metadata } from "next"
import Link from "next/link"
import { Calculator, BookOpen, Scale, ArrowLeft } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Methodology & Formulas | MassPension.com",
  description: "Exact MSRB formulas, assumptions, and calculation methodology used by the Mass Pension calculator.",
}

export default function MethodologyPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 text-white py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="container mrs-page-wrapper relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Link href="/about" className="inline-flex items-center text-blue-100 hover:text-white mb-6 transition-colors font-medium">
              <ArrowLeft size={16} className="mr-2" /> Back to About
            </Link>
            <Badge className="mb-4 bg-blue-500/20 text-blue-100 border-blue-400/30 flex w-fit mx-auto items-center gap-1">
              <Scale size={14} />
              <span>Transparency First</span>
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 leading-tight">
              Research Methodology & Formulas
            </h1>
            <p className="text-xl text-blue-100 leading-relaxed max-w-2xl mx-auto">
              We believe in showing our work. Here are the exact official formulas and assumptions used to generate your estimates.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="flex-1 bg-slate-50 py-12 md:py-16">
        <div className="container mrs-page-wrapper max-w-4xl mx-auto space-y-8">

          {/* Disclaimer Card */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 md:p-8 flex gap-4">
            <div className="shrink-0 text-amber-600 mt-1">
              <BookOpen size={24} />
            </div>
            <div>
              <h3 className="text-amber-900 font-bold text-lg mb-2">Research Basis</h3>
              <p className="text-amber-800/80 leading-relaxed text-sm">
                This page documents the logic derived from M.G.L. c. 32 and MSRB regulations. While we strive for 100% statutory accuracy, these results are approximations for planning purposes. Official final determinations are always made by the State Retirement Board.
              </p>
            </div>
          </div>

          {/* Core Formula Section */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 md:p-10">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
              <span className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">1</span>
              The Core Pension Formula
            </h2>
            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 mb-6 text-center">
              <p className="text-lg md:text-xl font-mono text-slate-700 font-bold">
                Annual Pension = <span className="text-blue-600">Avg. Salary</span> × <span className="text-indigo-600">Years of Service</span> × <span className="text-purple-600">Benefit Factor</span>
              </p>
            </div>
            <ul className="space-y-4 text-slate-600">
              <li className="flex gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 shrink-0" />
                <span><strong className="text-slate-900">Average Salary:</strong> The average of your highest 36 consecutive months of regular compensation (or highest 5 years for those hired after April 2, 2012).</span>
              </li>
              <li className="flex gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 shrink-0" />
                <span><strong className="text-slate-900">Benefit Factor:</strong> A percentage based on your age at retirement and your Group classification (1, 2, or 4). This typically ranges from 1.5% to 2.5% per year of service.</span>
              </li>
              <li className="flex gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-2 shrink-0" />
                <span><strong className="text-slate-900">The 80% Cap:</strong> Your base pension cannot exceed 80% of your average salary.</span>
              </li>
            </ul>
          </div>

          {/* COLA Section */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 md:p-10">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
              <span className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-bold">2</span>
              Cost of Living Adjustment (COLA)
            </h2>
            <p className="text-slate-600 mb-6 leading-relaxed">
              Massachusetts state retirees typically receive an annual COLA. The current statutory base is often misunderstood.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                <h4 className="font-bold text-slate-900 mb-2">The "$13,000 Base"</h4>
                <p className="text-sm text-slate-500 leading-relaxed">
                  The standard 3% COLA is only applied to the first $13,000 of your annual pension allowance, not the total amount.
                </p>
              </div>
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                <h4 className="font-bold text-slate-900 mb-2">Maximum Annual Increase</h4>
                <p className="text-sm text-slate-500 leading-relaxed">
                  This results in a maximum increase of roughly $390/year (or $32.50/month), compounding annually over time.
                </p>
              </div>
            </div>
          </div>

          {/* Option C Section */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 md:p-10">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
              <span className="w-10 h-10 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center text-sm font-bold">3</span>
              Survivor Options (Rate Factors)
            </h2>
            <p className="text-slate-600 mb-4 leading-relaxed">
              We calculate Option C based on the actuarial tables provided by PERAC. The reduction factor depends on the age difference between you and your beneficiary.
            </p>
            <ul className="space-y-3 text-slate-600 text-sm">
              <li className="flex gap-2 items-center">
                <span className="font-bold text-slate-900">Option A:</span> No survivor benefits suitable (100% payout).
              </li>
              <li className="flex gap-2 items-center">
                <span className="font-bold text-slate-900">Option B:</span> Declining account balance (approx. 1-3% reduction).
              </li>
              <li className="flex gap-2 items-center">
                <span className="font-bold text-slate-900">Option C:</span> Joint and Survivor annuity (~9-12% reduction typ.).
              </li>
            </ul>
          </div>

          {/* CTA */}
          <div className="flex justify-center gap-4 pt-8">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 font-bold" asChild>
              <Link href="/calculator">
                <Calculator className="mr-2 h-5 w-5" />
                Run Calculation
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/resources">
                View All Resources
              </Link>
            </Button>
          </div>

        </div>
      </main>
    </div>
  )
}


