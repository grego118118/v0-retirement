import { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Methodology & Formulas | Mass Pension",
  description: "Exact MSRB formulas, assumptions, and calculation methodology used by the Mass Pension calculator.",
}

export default function MethodologyPage() {
  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-4">Methodology & Formulas</h1>
      <p className="text-muted-foreground mb-6">This page documents the exact formulas and assumptions used by our calculator, aligned with MSRB rules. Results are estimates for planning; official determinations are made by MSRB.</p>

      <h2 className="text-xl font-semibold mt-6 mb-2">Core Pension Formula</h2>
      <p className="mb-2">Annual Pension = Average Salary × Years of Service × Benefit Factor</p>
      <ul className="list-disc pl-5 space-y-1">
        <li>Benefit Factor ranges ~2.0%–2.5% based on Group and age</li>
        <li>80% maximum cap applied before Option B/C reductions</li>
        <li>Option C survivor benefit ~66.67%; reductions vary by ages</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">COLA</h2>
      <ul className="list-disc pl-5 space-y-1">
        <li>3% applied to first $13,000 of annual allowance only</li>
        <li>Maximum $390 per year ($32.50/mo), compounding annually</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">Service & Eligibility</h2>
      <ul className="list-disc pl-5 space-y-1">
        <li>Groups 1–4 minimum ages: 60, 55, any age w/20 years (Group 3), 50</li>
        <li>Hire-date rules may affect minimum service and pro-rating</li>
      </ul>

      <div className="mt-6 space-x-2">
        <Link href="/calculator" className="underline">Use the Calculator</Link>
        <span>•</span>
        <Link href="/resources/groups" className="underline">Groups 1–4</Link>
        <span>•</span>
        <Link href="/resources/cola" className="underline">COLA Rules</Link>
      </div>
    </div>
  )
}

