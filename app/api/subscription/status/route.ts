import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth/auth-options"
import { prisma } from "@/lib/prisma"
import {
  getUserSubscriptionType,
  isUserPremium,
  getUserFeatures,
  getUserLimits,
  USER_TYPES,
  FREE_TIER_LIMITS
} from "@/lib/stripe/config"

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
        socialSecurityCalculations: true,
        wizardUses: true,
        pdfReports: true,
        calculations: {
          select: { id: true }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    // Determine user subscription type using hybrid model
    const userType = getUserSubscriptionType(user)
    const isPremium = isUserPremium(userType)
    const userConfig = USER_TYPES[userType]
    const userLimits = getUserLimits(userType)

    // Debug logging for subscription type determination
    console.log("Subscription status debug:", {
      userId: user.id,
      email: user.email,
      subscriptionStatus: user.subscriptionStatus,
      subscriptionPlan: user.subscriptionPlan,
      stripeCustomerId: user.stripeCustomerId,
      subscriptionId: user.subscriptionId,
      userType,
      isPremium,
      userConfigName: userConfig.name
    })

    // Calculate current usage
    const currentUsage = {
      savedCalculations: user.calculations.length,
      socialSecurityCalculations: user.socialSecurityCalculations,
      wizardUses: user.wizardUses,
      pdfReports: user.pdfReports
    }

    // Build response data based on user type
    const responseData = {
      isPremium,
      subscriptionStatus: isPremium ? "active" : "free",
      plan: userType,
      planName: userConfig.name,
      planDescription: userConfig.description,
      billingType: userConfig.billingType,
      accountType: isPremium ? "premium" : "free",
      accessLevel: isPremium ? "full" : "limited",

      // Subscription details (for Stripe users)
      subscriptionId: user.subscriptionId,
      stripeCustomerId: user.stripeCustomerId,
      currentPeriodEnd: user.currentPeriodEnd?.toISOString(),
      cancelAtPeriodEnd: user.cancelAtPeriodEnd,
      trialEnd: user.trialEnd?.toISOString(),

      // Usage and limits
      currentUsage,
      usageLimits: userLimits || {
        maxSavedCalculations: -1, // Unlimited for premium
        maxSocialSecurityCalculations: -1,
        maxWizardUses: -1,
        maxPdfReports: -1
      },

      // Feature access
      features: {
        basicCalculations: true, // Available to all users
        socialSecurityIntegration: isPremium || currentUsage.socialSecurityCalculations < (userLimits?.maxSocialSecurityCalculations || 1),
        pdfReports: isPremium || currentUsage.pdfReports < (userLimits?.maxPdfReports || 0),
        emailNotifications: isPremium,
        prioritySupport: isPremium,
        combinedCalculations: isPremium || currentUsage.wizardUses < (userLimits?.maxWizardUses || 0),
        taxImplications: isPremium,
        advancedPlanning: isPremium,
        unlimitedSaves: isPremium || currentUsage.savedCalculations < (userLimits?.maxSavedCalculations || 3)
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
