import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { emailService } from "@/lib/email/email-service"

// Force dynamic rendering to prevent static generation issues with Prisma
export const dynamic = "force-dynamic"

const BASE_URL = "https://www.masspension.com"

interface ResultsPayload {
  email: string
  name?: string
  calculationType?: "pension" | "social-security" | "combined"
  results?: {
    annualPension?: number
    monthlyPension?: number
    socialSecurityBenefit?: number
    totalMonthlyIncome?: number
    totalAnnualIncome?: number
    retirementAge?: number
    yearsOfService?: number
    group?: string
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ResultsPayload
    const { email, name, calculationType = "pension", results = {} } = body

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "A valid email address is required." }, { status: 400 })
    }

    // Capture / update the lead. Tagging by source + preferences lets the nurture
    // drip target calculator leads without a schema migration.
    try {
      const existing = await prisma.newsletterSubscriber.findUnique({ where: { email } })
      if (!existing) {
        await prisma.newsletterSubscriber.create({
          data: {
            email,
            subscribedAt: new Date(),
            isActive: true,
            source: "calculator-results",
            preferences: ["calculator-results", "nurture"],
          },
        })
      } else if (existing.preferences && !existing.preferences.includes("nurture")) {
        // Re-engage a previously captured contact into the nurture sequence.
        await prisma.newsletterSubscriber.update({
          where: { email },
          data: { isActive: true, preferences: { set: [...existing.preferences, "nurture"] } },
        })
      }
    } catch (dbError) {
      // Don't block sending the user their results if the lead write fails.
      console.error("calculation-results: lead capture failed", dbError)
    }

    // Send the user their results using the existing template.
    const sendResult = await emailService.sendTemplateEmail("calculation-results", email, {
      name: name || "there",
      email,
      calculationType,
      results,
      calculationDate: new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      dashboardUrl: `${BASE_URL}/dashboard`,
      calculatorUrl: `${BASE_URL}/calculator`,
      supportUrl: `${BASE_URL}/contact`,
    })

    if (!sendResult.success) {
      // Lead is captured; surface a soft failure so the user can retry delivery.
      console.error("calculation-results: email send failed", sendResult.error)
      return NextResponse.json(
        { error: "We saved your request but couldn't email it just now. Please try again." },
        { status: 502 }
      )
    }

    return NextResponse.json({ message: "Results emailed successfully." }, { status: 200 })
  } catch (error) {
    console.error("calculation-results: unexpected error", error)
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 })
  }
}
