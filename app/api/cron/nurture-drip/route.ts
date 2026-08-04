import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { emailService } from "@/lib/email/email-service"
import { NURTURE_SEQUENCE, NURTURE_START_DATE } from "@/lib/email/nurture-sequence"

export const dynamic = "force-dynamic"

const MS_PER_DAY = 1000 * 60 * 60 * 24
// Cap per run to stay within serverless execution limits.
const MAX_PER_RUN = 200

/**
 * Nurture drip. Intended to run once daily (Vercel Cron). For each active
 * calculator lead it sends the next due, not-yet-sent email in the sequence,
 * then tags the subscriber so it is never resent.
 *
 * Auth mirrors the existing auto-blog cron: Vercel Cron header or CRON_SECRET.
 */
export async function GET(request: NextRequest) {
  const isVercelCron = request.headers.get("x-vercel-cron") === "1"
  const authHeader = request.headers.get("authorization")
  const cronSecret = process.env.CRON_SECRET

  if (!isVercelCron && (!cronSecret || authHeader !== `Bearer ${cronSecret}`)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (!emailService.isConfigured()) {
    return NextResponse.json({ error: "Email provider not configured" }, { status: 503 })
  }

  const now = Date.now()
  let sent = 0
  let scanned = 0
  const errors: string[] = []

  try {
    const leads = await prisma.newsletterSubscriber.findMany({
      // Start-date guard: never enroll contacts who signed up before go-live.
      where: {
        isActive: true,
        preferences: { has: "nurture" },
        subscribedAt: { gte: NURTURE_START_DATE },
      },
      select: { email: true, subscribedAt: true, preferences: true },
      take: 2000,
    })

    for (const lead of leads) {
      if (sent >= MAX_PER_RUN) break
      scanned++

      const daysSince = Math.floor((now - new Date(lead.subscribedAt).getTime()) / MS_PER_DAY)
      const prefs = lead.preferences || []

      // Earliest email that is due and not yet sent to this lead.
      const next = NURTURE_SEQUENCE.find(
        (email) => email.dayOffset <= daysSince && !prefs.includes(email.tag)
      )
      if (!next) continue

      const html = next.html.replace(/\{\{email\}\}/g, encodeURIComponent(lead.email))
      const result = await emailService.sendEmail({
        to: lead.email,
        subject: next.subject,
        html,
      })

      if (result.success) {
        await prisma.newsletterSubscriber.update({
          where: { email: lead.email },
          data: { preferences: { set: [...prefs, next.tag] } },
        })
        sent++
      } else {
        errors.push(`${lead.email}: ${result.error}`)
      }
    }

    return NextResponse.json({
      ok: true,
      scanned,
      sent,
      errorCount: errors.length,
      errors: errors.slice(0, 10),
    })
  } catch (error) {
    console.error("nurture-drip error", error)
    return NextResponse.json({ error: "Drip run failed" }, { status: 500 })
  }
}
