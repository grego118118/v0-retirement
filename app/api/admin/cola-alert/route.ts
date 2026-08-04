import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { emailService } from "@/lib/email/email-service"

export const dynamic = "force-dynamic"
export const maxDuration = 60

const BASE_URL = process.env.NEXTAUTH_URL || "https://www.masspension.com"

/**
 * Segmented send to the "cola-alerts" list — subscribers who opted in on the
 * calculator results screen to be told when the COLA-base legislation moves.
 * Triggered by the bill-watcher agent (or manually), never by site visitors.
 *
 * POST { subject, html, text?, dryRun? } with Authorization: Bearer CRON_SECRET.
 * dryRun returns the recipient count without sending.
 */
export async function POST(request: NextRequest) {
  const auth = request.headers.get("authorization")
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let body: { subject?: string; html?: string; text?: string; dryRun?: boolean }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }
  const { subject, html, text, dryRun = false } = body
  if (!dryRun && (!subject || !html)) {
    return NextResponse.json({ error: "subject and html are required" }, { status: 400 })
  }

  const subscribers = await prisma.newsletterSubscriber.findMany({
    where: { isActive: true, preferences: { has: "cola-alerts" } },
    select: { email: true },
  })

  if (dryRun) {
    return NextResponse.json({ total: subscribers.length, dryRun: true })
  }

  let sent = 0
  const failed: string[] = []
  for (const s of subscribers) {
    const unsubscribe = `${BASE_URL}/api/newsletter/unsubscribe?email=${encodeURIComponent(s.email)}`
    const footer = `<hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;"/><p style="font-size:12px;color:#94a3b8;">You're receiving this because you asked for COLA bill alerts at masspension.com. <a href="${unsubscribe}" style="color:#94a3b8;">Unsubscribe</a></p>`
    const result = await emailService.sendEmail({
      to: s.email,
      subject: subject!,
      html: `${html}${footer}`,
      text: text ? `${text}\n\nUnsubscribe: ${unsubscribe}` : undefined,
    })
    if (result.success) sent++
    else failed.push(s.email)
  }

  console.log(`cola-alert: sent ${sent}/${subscribers.length}${failed.length ? `, failed: ${failed.join(", ")}` : ""}`)
  return NextResponse.json({ total: subscribers.length, sent, failed: failed.length })
}
