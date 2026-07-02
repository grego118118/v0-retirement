import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth/auth-config"
import { prisma } from "@/lib/prisma"
import { StripeService } from "@/lib/stripe/service"
import { isPremiumUser, removePremiumUser } from "@/lib/subscription-utils"

// Force dynamic rendering to prevent static generation issues with Prisma
export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const userEmail = session.user.email

    const user = await prisma.user.findUnique({
      where: { email: userEmail }
    })

    // Premium status must come from persisted subscription state, not the
    // in-memory dev helper (which always reports false in production).
    const hasDbSubscription =
      user?.subscriptionStatus === 'active' || user?.subscriptionStatus === 'trialing'
    const hasDevPremium = isPremiumUser(userEmail) // dev/demo only; always false in prod

    if (!hasDbSubscription && !hasDevPremium) {
      return NextResponse.json({
        error: "No active subscription found"
      }, { status: 400 })
    }

    // Real Stripe subscription: cancel at period end so the customer keeps
    // the access they already paid for.
    const hasRealStripeSubscription =
      !!process.env.STRIPE_SECRET_KEY &&
      !!user?.subscriptionId &&
      !!user?.stripeCustomerId?.startsWith('cus_')

    if (hasRealStripeSubscription) {
      const canceled = await StripeService.cancelSubscription(user!.subscriptionId!)

      await prisma.user.update({
        where: { id: user!.id },
        data: { cancelAtPeriodEnd: true }
      })

      const accessEndsAt =
        canceled.currentPeriodEnd instanceof Date && !isNaN(canceled.currentPeriodEnd.getTime())
          ? canceled.currentPeriodEnd.toISOString()
          : undefined

      return NextResponse.json({
        success: true,
        message: "Subscription canceled. You keep premium access until the end of your current billing period.",
        cancelationDate: new Date().toISOString(),
        accessEndsAt
      })
    }

    // Dev/demo subscription (no real Stripe record): cancel immediately.
    removePremiumUser(userEmail)

    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          subscriptionStatus: 'canceled',
          cancelAtPeriodEnd: false
        }
      })
    }

    return NextResponse.json({
      success: true,
      message: "Subscription canceled successfully",
      cancelationDate: new Date().toISOString(),
      accessEndsAt: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error canceling subscription:', error)
    return NextResponse.json(
      { error: 'Failed to cancel subscription' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Use POST to cancel subscription"
  }, { status: 405 })
}
