import { NextRequest, NextResponse } from "next/server"
import { StripeService } from "@/lib/stripe/service"
import { ONE_TIME_PRODUCTS } from "@/lib/stripe/config"
import { packReportData } from "@/lib/stripe/report-metadata"

export const dynamic = "force-dynamic"

const BASE_URL = process.env.NEXTAUTH_URL || "https://www.masspension.com"

export async function POST(request: NextRequest) {
  try {
    const { reportData, email } = await request.json()

    if (!ONE_TIME_PRODUCTS.report.priceId) {
      return NextResponse.json(
        { error: "The report product isn't configured yet. Please try again later." },
        { status: 503 }
      )
    }

    // Minimal validation — the report is meaningless without core pension inputs.
    if (
      !reportData ||
      typeof reportData !== "object" ||
      !reportData.averageSalary ||
      !reportData.yearsOfService ||
      !reportData.options
    ) {
      return NextResponse.json(
        { error: "Missing calculation data. Please run a calculation first." },
        { status: 400 }
      )
    }

    const metadata = packReportData(reportData)

    const checkoutUrl = await StripeService.createReportCheckoutSession({
      priceId: ONE_TIME_PRODUCTS.report.priceId,
      email: typeof email === "string" && email.includes("@") ? email : undefined,
      metadata,
      successUrl: `${BASE_URL}/report/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${BASE_URL}/pricing?report=canceled`,
    })

    return NextResponse.json({ checkoutUrl })
  } catch (error: any) {
    console.error("Report checkout failed:", error)
    return NextResponse.json(
      { error: "Couldn't start checkout. Please try again." },
      { status: 500 }
    )
  }
}
