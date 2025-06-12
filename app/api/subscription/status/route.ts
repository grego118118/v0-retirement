import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function GET() {
  try {
    console.log("Subscription status GET request started")
    const session = await getServerSession(authOptions)

    console.log("Session in subscription status GET:", {
      hasSession: !!session,
      userId: session?.user?.id,
      userEmail: session?.user?.email
    })

    if (!session?.user?.id) {
      console.error("No session or user ID in subscription status GET")
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // For now, return mock subscription data since we don't have a database set up
    // In a real implementation, this would query the database for subscription status
    const responseData = {
      isPremium: false,
      subscriptionStatus: "free",
      plan: "free",
      trialEndsAt: null,
      subscriptionEndsAt: null,
      features: {
        basicCalculations: true,
        socialSecurityIntegration: false,
        pdfReports: false,
        emailNotifications: false,
        prioritySupport: false
      }
    }

    console.log("Returning subscription status data:", responseData)
    return NextResponse.json(responseData)
  } catch (error) {
    console.error("Error fetching subscription status:", error)
    return NextResponse.json({
      message: "Failed to fetch subscription status",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
