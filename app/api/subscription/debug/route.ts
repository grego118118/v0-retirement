import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth/auth-options"
import { prisma } from "@/lib/prisma"
import { getUserSubscriptionType, isUserPremium } from "@/lib/stripe/config"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Get user data from database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        stripeCustomerId: true,
        subscriptionId: true,
        subscriptionStatus: true,
        subscriptionPlan: true,
        currentPeriodEnd: true,
        cancelAtPeriodEnd: true,
        trialEnd: true,
      }
    })

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    // Get all users with subscriptions for debugging
    const allUsersWithSubscriptions = await prisma.user.findMany({
      where: {
        OR: [
          { subscriptionStatus: { not: null } },
          { subscriptionPlan: { not: null } },
          { stripeCustomerId: { not: null } }
        ]
      },
      select: {
        id: true,
        email: true,
        stripeCustomerId: true,
        subscriptionId: true,
        subscriptionStatus: true,
        subscriptionPlan: true,
        currentPeriodEnd: true,
        cancelAtPeriodEnd: true,
        createdAt: true,
      }
    })

    // Determine user subscription type
    const userType = getUserSubscriptionType(user)
    const isPremium = isUserPremium(userType)

    const debugData = {
      currentUser: {
        ...user,
        userType,
        isPremium,
        createdAt: user.createdAt?.toISOString(),
        currentPeriodEnd: user.currentPeriodEnd?.toISOString(),
        trialEnd: user.trialEnd?.toISOString(),
      },
      allUsersWithSubscriptions: allUsersWithSubscriptions.map(u => ({
        ...u,
        userType: getUserSubscriptionType(u),
        isPremium: isUserPremium(getUserSubscriptionType(u)),
        createdAt: u.createdAt?.toISOString(),
        currentPeriodEnd: u.currentPeriodEnd?.toISOString(),
      })),
      subscriptionLogic: {
        hybridModelLaunchDate: '2024-12-01',
        userCreatedAt: user.createdAt?.toISOString(),
        isGrandfathered: user.createdAt && user.createdAt < new Date('2024-12-01'),
        hasActiveSubscription: user.subscriptionStatus === 'active' && user.subscriptionPlan,
        hasStripeCustomer: !!user.stripeCustomerId,
        isRealStripeCustomer: user.stripeCustomerId?.startsWith('cus_'),
        isDemoCustomer: user.stripeCustomerId?.startsWith('demo_'),
      }
    }

    return NextResponse.json(debugData)
  } catch (error) {
    console.error("Error in debug endpoint:", error)
    return NextResponse.json({
      message: "Failed to fetch debug data",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
