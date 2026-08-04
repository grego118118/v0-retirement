export const maxDuration = 30

import { NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/stripe/config"
import { unpackReportData } from "@/lib/stripe/report-metadata"
import {
  generatePensionCalculationPDF,
  PensionCalculationData,
} from "@/lib/pdf/puppeteer-pdf-generator"

export const dynamic = "force-dynamic"

/**
 * Delivers the paid report PDF. Access is gated by verifying the Stripe Checkout
 * Session is actually paid — the session id alone is not enough, and only a paid
 * report session carries the calculation metadata needed to regenerate.
 */
export async function GET(request: NextRequest) {
  try {
    const sessionId = request.nextUrl.searchParams.get("session_id")
    if (!sessionId) {
      return NextResponse.json({ error: "Missing session_id" }, { status: 400 })
    }

    if (!stripe) {
      return NextResponse.json({ error: "Payments are not configured." }, { status: 503 })
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (session.payment_status !== "paid") {
      return NextResponse.json(
        { error: "This order hasn't been paid yet." },
        { status: 402 }
      )
    }

    const reportData = unpackReportData<PensionCalculationData>(
      session.metadata as Record<string, string> | null
    )
    if (!reportData) {
      return NextResponse.json(
        { error: "We couldn't find the report data for this order. Please contact support." },
        { status: 404 }
      )
    }

    if (!reportData.calculationDate) {
      reportData.calculationDate = new Date()
    }

    const pdfBuffer = await generatePensionCalculationPDF(reportData, {
      reportType: "comprehensive",
      includeCharts: true,
      includeCOLAProjections: Array.isArray(reportData.colaProjections) && reportData.colaProjections.length > 0,
      includeScenarioComparison: true,
    })

    const filename = `MA_Retirement_Report_${new Date().toISOString().split("T")[0]}.pdf`

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": pdfBuffer.length.toString(),
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    })
  } catch (error: any) {
    console.error("Report download failed:", error)
    return NextResponse.json(
      { error: "We couldn't generate your report. Please try again or contact support." },
      { status: 500 }
    )
  }
}
