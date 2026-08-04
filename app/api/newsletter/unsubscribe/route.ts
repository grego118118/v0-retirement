import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

function page(title: string, message: string, status = 200) {
  return new NextResponse(
    `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title></head>
    <body style="margin:0;font-family:'Segoe UI',Tahoma,sans-serif;background:#f1f5f9;display:flex;align-items:center;justify-content:center;min-height:100vh;">
      <div style="background:#fff;max-width:480px;padding:40px;border-radius:12px;box-shadow:0 1px 3px rgba(0,0,0,0.1);text-align:center;">
        <h1 style="color:#0f172a;font-size:22px;margin:0 0 12px;">${title}</h1>
        <p style="color:#475569;line-height:1.6;">${message}</p>
        <a href="https://www.masspension.com" style="display:inline-block;margin-top:20px;background:#2563eb;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600;">Back to Mass Pension</a>
      </div>
    </body></html>`,
    { status, headers: { "Content-Type": "text/html" } }
  )
}

export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get("email")

  if (!email || !email.includes("@")) {
    return page("Invalid link", "This unsubscribe link is missing a valid email address.", 400)
  }

  try {
    const subscriber = await prisma.newsletterSubscriber.findUnique({ where: { email } })
    if (subscriber) {
      await prisma.newsletterSubscriber.update({
        where: { email },
        data: {
          isActive: false,
          unsubscribedAt: new Date(),
          // Remove nurture tagging so the drip stops immediately.
          preferences: { set: (subscriber.preferences || []).filter((p) => p !== "nurture") },
        },
      })
    }
    return page(
      "You're unsubscribed",
      "You won't receive any more retirement planning emails from us. You can still use the free calculator anytime."
    )
  } catch (error) {
    console.error("unsubscribe error", error)
    return page("Something went wrong", "We couldn't process your request. Please email support@masspension.com and we'll remove you.", 500)
  }
}
