import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { emailService } from "@/lib/email/email-service"

export const dynamic = "force-dynamic"

/**
 * Advisor-match lead capture. Stores the contact (no schema migration — email
 * goes into NewsletterSubscriber tagged `advisor-lead`) and emails the full
 * lead details to the site owner for referral/matching. Owning the lead now
 * means an affiliate/partner network can be plugged in later without changing
 * the front end.
 */

const TIMELINES = ["within-1-year", "1-3-years", "3-5-years", "5-plus-years", "already-retired"]
const SAVINGS_RANGES = ["under-100k", "100k-250k", "250k-500k", "500k-1m", "over-1m", "prefer-not-to-say"]

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const name = typeof body.name === "string" ? body.name.trim().slice(0, 120) : ""
    const email = typeof body.email === "string" ? body.email.trim().slice(0, 200) : ""
    const phone = typeof body.phone === "string" ? body.phone.trim().slice(0, 40) : ""
    const zip = typeof body.zip === "string" ? body.zip.trim().slice(0, 10) : ""
    const timeline = TIMELINES.includes(body.timeline) ? body.timeline : ""
    const savings = SAVINGS_RANGES.includes(body.savings) ? body.savings : ""
    const context = typeof body.context === "string" ? body.context.slice(0, 500) : ""

    if (!name || !email || !email.includes("@") || !zip || !timeline) {
      return NextResponse.json(
        { error: "Please fill in your name, email, ZIP code, and retirement timeline." },
        { status: 400 }
      )
    }

    // Capture the contact for follow-up.
    try {
      const existing = await prisma.newsletterSubscriber.findUnique({ where: { email } })
      if (!existing) {
        await prisma.newsletterSubscriber.create({
          data: { email, isActive: true, source: "advisor-lead", preferences: ["advisor-lead"] },
        })
      } else if (!existing.preferences?.includes("advisor-lead")) {
        await prisma.newsletterSubscriber.update({
          where: { email },
          data: { preferences: { set: [...(existing.preferences || []), "advisor-lead"] } },
        })
      }
    } catch (dbError) {
      console.error("advisor-lead: subscriber capture failed", dbError)
    }

    // Notify the owner with the full lead.
    const ownerEmail = process.env.LEAD_NOTIFICATION_EMAIL || process.env.EMAIL_FROM || "greg@gowebautomations.com"
    const html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;">
        <h2 style="color:#0f172a;">New advisor-match lead</h2>
        <table style="border-collapse:collapse;font-size:14px;">
          <tr><td style="padding:6px 16px 6px 0;color:#6b7280;">Name</td><td style="padding:6px 0;"><strong>${name}</strong></td></tr>
          <tr><td style="padding:6px 16px 6px 0;color:#6b7280;">Email</td><td style="padding:6px 0;">${email}</td></tr>
          <tr><td style="padding:6px 16px 6px 0;color:#6b7280;">Phone</td><td style="padding:6px 0;">${phone || "—"}</td></tr>
          <tr><td style="padding:6px 16px 6px 0;color:#6b7280;">ZIP</td><td style="padding:6px 0;">${zip}</td></tr>
          <tr><td style="padding:6px 16px 6px 0;color:#6b7280;">Timeline</td><td style="padding:6px 0;">${timeline}</td></tr>
          <tr><td style="padding:6px 16px 6px 0;color:#6b7280;">Savings range</td><td style="padding:6px 0;">${savings || "—"}</td></tr>
          <tr><td style="padding:6px 16px 6px 0;color:#6b7280;">Calc context</td><td style="padding:6px 0;">${context || "—"}</td></tr>
        </table>
        <p style="font-size:12px;color:#9ca3af;margin-top:16px;">Submitted from the calculator results page on masspension.com.</p>
      </div>`

    const result = await emailService.sendEmail({
      to: ownerEmail,
      subject: `Advisor lead: ${name} (${timeline.replace(/-/g, " ")})`,
      html,
      replyTo: email,
    })

    if (!result.success) {
      // Contact is captured in the DB either way; log and still confirm to the user.
      console.error("advisor-lead: owner notification failed", result.error)
    }

    return NextResponse.json({ message: "Thanks — we'll be in touch within one business day." })
  } catch (error) {
    console.error("advisor-lead: unexpected error", error)
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 })
  }
}
