"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, CheckCircle, ShieldCheck, Loader2 } from "lucide-react"
import { toast } from "sonner"

const TIMELINE_OPTIONS = [
  { value: "within-1-year", label: "Within 1 year" },
  { value: "1-3-years", label: "1–3 years" },
  { value: "3-5-years", label: "3–5 years" },
  { value: "5-plus-years", label: "5+ years" },
  { value: "already-retired", label: "Already retired" },
]

const SAVINGS_OPTIONS = [
  { value: "under-100k", label: "Under $100k" },
  { value: "100k-250k", label: "$100k – $250k" },
  { value: "250k-500k", label: "$250k – $500k" },
  { value: "500k-1m", label: "$500k – $1M" },
  { value: "over-1m", label: "Over $1M" },
  { value: "prefer-not-to-say", label: "Prefer not to say" },
]

/**
 * Advisor-match lead capture, shown on calculator results pages. Deliberately
 * low-pressure: an expert review offer, not a sales pitch, with a plain-English
 * compensation disclosure.
 */
export function AdvisorLeadCard({ context }: { context?: string }) {
  const [expanded, setExpanded] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [zip, setZip] = useState("")
  const [timeline, setTimeline] = useState("")
  const [savings, setSavings] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !email.includes("@") || !zip || !timeline) {
      toast.error("Please fill in your name, email, ZIP code, and retirement timeline.")
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch("/api/leads/advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, zip, timeline, savings, context }),
      })
      if (res.ok) {
        setDone(true)
      } else {
        const err = await res.json().catch(() => ({}))
        toast.error(err.error || "Couldn't submit right now. Please try again.")
      }
    } catch {
      toast.error("Couldn't submit right now. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <Card className="border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-900/40">
        <CardContent className="flex items-center gap-3 py-6">
          <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
          <div>
            <p className="font-semibold text-green-800 dark:text-green-300">Request received.</p>
            <p className="text-sm text-green-700 dark:text-green-400">
              We&rsquo;ll be in touch within one business day to connect you with an advisor.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-slate-200 dark:border-slate-700">
      <CardContent className="py-6">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600/10 flex-shrink-0">
            <Users className="h-5 w-5 text-emerald-700 dark:text-emerald-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-mrs-navy-900 dark:text-white">
              Want a professional to review your plan?
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
              Get connected with a financial advisor who works with Massachusetts public employees — pension options,
              Social Security timing, and the savings gap. Free, no obligation.
            </p>
            {!expanded && (
              <Button
                onClick={() => setExpanded(true)}
                variant="outline"
                className="mt-4 border-emerald-600/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
              >
                <Users className="mr-2 h-4 w-4" />
                Request a free advisor match
              </Button>
            )}
          </div>
        </div>

        {expanded && (
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="adv-name">Name</Label>
                <Input id="adv-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="adv-email">Email</Label>
                <Input id="adv-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="adv-phone">Phone (optional)</Label>
                <Input id="adv-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(555) 555-5555" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="adv-zip">ZIP code</Label>
                <Input id="adv-zip" inputMode="numeric" value={zip} onChange={(e) => setZip(e.target.value)} placeholder="e.g. 01960" required />
              </div>
              <div className="space-y-1.5">
                <Label>When do you plan to retire?</Label>
                <Select value={timeline} onValueChange={setTimeline}>
                  <SelectTrigger id="adv-timeline">
                    <SelectValue placeholder="Select a timeline" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIMELINE_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Retirement savings (outside your pension)</Label>
                <Select value={savings} onValueChange={setSavings}>
                  <SelectTrigger id="adv-savings">
                    <SelectValue placeholder="Optional" />
                  </SelectTrigger>
                  <SelectContent>
                    {SAVINGS_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button type="submit" disabled={submitting} className="bg-emerald-700 hover:bg-emerald-600 text-white w-full sm:w-auto">
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting…
                </>
              ) : (
                "Request my free match"
              )}
            </Button>

            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-start gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
              <span>
                Your information is only used to connect you with an advisor — never sold to marketers. Mass Pension may
                receive compensation from participating advisors; this never affects your calculator results.
              </span>
            </p>
          </form>
        )}
      </CardContent>
    </Card>
  )
}
