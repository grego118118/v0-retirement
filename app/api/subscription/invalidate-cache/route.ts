import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth/auth-options"
import { prisma } from "@/lib/prisma"

/**
 * API endpoint to invalidate subscription cache and force session refresh
 * This ensures immediate subscription status updates after webhook processing
 */
export async function POST(request: NextRequest) {
  try {
    // Allow webhook calls without authentication
    const isWebhookCall = request.headers.get('x-webhook-source') === 'stripe'

    if (!isWebhookCall) {
      const session = await getServerSession(authOptions)
      if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }
    }

    // Get user email from request body for webhook calls or session for authenticated calls
    let userEmail: string | null = null

    if (isWebhookCall) {
      const body = await request.json()
      userEmail = body.userEmail
    } else {
      const session = await getServerSession(authOptions)
      userEmail = session?.user?.email || null
    }

    if (!userEmail) {
      return NextResponse.json({ error: "No user email provided" }, { status: 400 })
    }

    console.log(`Cache invalidation requested for user: ${userEmail}`)

    // Force a fresh database query to verify current subscription status
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      select: {
        id: true,
        email: true,
        subscriptionStatus: true,
        subscriptionPlan: true,
        stripeCustomerId: true,
        subscriptionId: true,
        currentPeriodEnd: true,
        cancelAtPeriodEnd: true,
        trialEnd: true,
      }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Log current subscription state for debugging
    console.log(`Current subscription state for ${userEmail}:`, {
      subscriptionStatus: user.subscriptionStatus,
      subscriptionPlan: user.subscriptionPlan,
      stripeCustomerId: user.stripeCustomerId,
      subscriptionId: user.subscriptionId,
    })

    // Trigger a browser event for real-time UI updates
    const response = NextResponse.json({
      success: true,
      message: "Subscription cache invalidated and session refreshed",
      timestamp: new Date().toISOString(),
      userSubscriptionStatus: {
        status: user.subscriptionStatus,
        plan: user.subscriptionPlan,
        customerId: user.stripeCustomerId,
        subscriptionId: user.subscriptionId,
      }
    })

    // Add headers to prevent caching of this response
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    response.headers.set('Surrogate-Control', 'no-store')

    return response
  } catch (error) {
    console.error('Error invalidating subscription cache:', error)
    return NextResponse.json(
      { error: 'Failed to invalidate cache' },
      { status: 500 }
    )
  }
}
