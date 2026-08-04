import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { emailService } from "@/lib/email/email-service"

export const dynamic = "force-dynamic"

const BASE_URL = process.env.NEXTAUTH_URL || "https://www.masspension.com"

/**
 * Publishes approved drafts whose scheduled slot has arrived. Runs shortly
 * after the weekly slot time (Mondays 14:00 UTC) plus daily as a catch-up.
 * Only posts that passed human review (factCheckStatus 'approved') publish —
 * a scheduled time alone is never enough.
 */
export async function GET(request: NextRequest) {
  const isVercelCron = request.headers.get("x-vercel-cron") === "1"
  const authHeader = request.headers.get("authorization")
  const cronSecret = process.env.CRON_SECRET

  if (!isVercelCron && (!cronSecret || authHeader !== `Bearer ${cronSecret}`)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const now = new Date()
    const due = await prisma.blogPost.findMany({
      where: {
        status: "draft",
        factCheckStatus: "approved",
        scheduledPublishAt: { not: null, lte: now },
      },
      select: { id: true, title: true, slug: true, scheduledPublishAt: true },
    })

    const published: string[] = []
    for (const post of due) {
      await prisma.blogPost.update({
        where: { id: post.id },
        data: {
          status: "published",
          // Honor the slot time so the visible publish date matches the cadence.
          publishedAt: post.scheduledPublishAt || now,
          updatedAt: now,
        },
      })
      published.push(post.slug)
      console.log(`publish-scheduled: published "${post.title}" (${post.slug})`)
    }

    // Confirmation email so the owner knows what went live (best-effort).
    if (published.length > 0) {
      try {
        const ownerEmail = process.env.LEAD_NOTIFICATION_EMAIL || process.env.EMAIL_FROM || "greg@gowebautomations.com"
        await emailService.sendEmail({
          to: ownerEmail,
          subject: `✅ Published: ${due.map((p) => p.title).join(" · ")}`,
          html: `
            <div style="font-family:Arial,sans-serif;max-width:600px;">
              <h2 style="color:#0f172a;">Scheduled post${published.length > 1 ? "s" : ""} now live</h2>
              <ul style="color:#374151;line-height:1.8;">
                ${due.map((p) => `<li><a href="${BASE_URL}/blog/${p.slug}" style="color:#2563eb;">${p.title}</a></li>`).join("")}
              </ul>
            </div>`,
        })
      } catch (e) {
        console.error("publish-scheduled: confirmation email failed", e)
      }
    }

    return NextResponse.json({ ok: true, publishedCount: published.length, published })
  } catch (error) {
    console.error("publish-scheduled error", error)
    return NextResponse.json({ error: "Publish run failed" }, { status: 500 })
  }
}
