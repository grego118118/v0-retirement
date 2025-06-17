import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth/auth-options"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const { planType } = await request.json()
    
    if (!planType || !['monthly', 'annual'].includes(planType)) {
      return NextResponse.json({ error: "Invalid plan type" }, { status: 400 })
    }

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    // Generate a demo customer ID for tracking
    const demoCustomerId = `demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const demoSubscriptionId = `demo_sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: session.user.email,
          name: session.user.name || '',
          subscriptionStatus: 'active',
          subscriptionPlan: planType,
          stripeCustomerId: demoCustomerId, // Demo customer ID for tracking
          subscriptionId: demoSubscriptionId, // Demo subscription ID
          currentPeriodEnd: new Date(Date.now() + (planType === 'annual' ? 365 : 30) * 24 * 60 * 60 * 1000),
          cancelAtPeriodEnd: false,
        }
      })
    } else {
      // Update existing user with premium subscription
      user = await prisma.user.update({
        where: { email: session.user.email },
        data: {
          subscriptionStatus: 'active',
          subscriptionPlan: planType,
          stripeCustomerId: demoCustomerId, // Demo customer ID for tracking
          subscriptionId: demoSubscriptionId, // Demo subscription ID
          currentPeriodEnd: new Date(Date.now() + (planType === 'annual' ? 365 : 30) * 24 * 60 * 60 * 1000),
          cancelAtPeriodEnd: false,
        }
      })
    }

    console.log(`Demo subscription activated for ${session.user.email}: ${planType} plan`)
    console.log("Demo subscription details:", {
      userId: user.id,
      email: user.email,
      subscriptionStatus: user.subscriptionStatus,
      subscriptionPlan: user.subscriptionPlan,
      stripeCustomerId: user.stripeCustomerId,
      subscriptionId: user.subscriptionId,
      currentPeriodEnd: user.currentPeriodEnd
    })

    // Trigger cache invalidation for immediate status update
    try {
      await fetch(`${process.env.NEXTAUTH_URL}/api/subscription/invalidate-cache`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      console.log('Cache invalidation triggered for demo subscription')
    } catch (cacheError) {
      console.warn('Failed to invalidate subscription cache:', cacheError)
      // Don't fail the demo completion for cache invalidation errors
    }

    return NextResponse.json({
      success: true,
      message: 'Demo subscription activated successfully',
      user: {
        email: user.email,
        subscriptionStatus: user.subscriptionStatus,
        subscriptionPlan: user.subscriptionPlan,
        currentPeriodEnd: user.currentPeriodEnd,
      }
    })

  } catch (error) {
    console.error('Error completing demo subscription:', error)
    return NextResponse.json(
      { error: 'Failed to complete demo subscription' },
      { status: 500 }
    )
  }
}
