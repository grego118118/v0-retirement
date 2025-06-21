import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-options'
import { prisma } from '@/lib/prisma'
import { StripeService } from '@/lib/stripe/service'
import { isSubscriptionActive, FREE_TIER_LIMITS } from '@/lib/stripe/config'
import type { SubscriptionStatus, SubscriptionPlan } from '@/lib/stripe/config'
import { isPremiumUser } from '@/lib/subscription-utils'

// Safe date utility to prevent RangeError: Invalid time value
const safeToISOString = (date: Date | null | undefined): string | undefined => {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return undefined;
  }
  try {
    return date.toISOString();
  } catch (error) {
    console.error('Error converting date to ISO string:', error, 'Date value:', date);
    return undefined;
  }
};

// Fallback premium users for development (when Stripe is not configured)
const FALLBACK_PREMIUM_USERS = [
  'premium@example.com',
  'test@premium.com',
  'grego118@gmail.com'
]

interface SubscriptionResponse {
  isPremium: boolean
  subscriptionStatus: SubscriptionStatus | 'inactive'
  subscriptionPlan: SubscriptionPlan
  savedCalculationsCount: number
  currentPeriodEnd?: string
  cancelAtPeriodEnd?: boolean
  trialEnd?: string
  customerId?: string
  subscriptionId?: string
  usageLimits: {
    maxSavedCalculations: number
    maxSocialSecurityCalculations: number
    maxWizardUses: number
    maxPdfReports: number
  }
  currentUsage: {
    savedCalculations: number
    socialSecurityCalculations: number
    wizardUses: number
    pdfReports: number
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userEmail = session.user.email
    console.log('Checking subscription status for:', userEmail)

    // Get user from database, create if doesn't exist
    let user = await prisma.user.findUnique({
      where: { email: userEmail }
    })

    if (!user) {
      console.log('User not found in users table, creating new user:', userEmail)

      // Create user in users table (this should have been done during OAuth but wasn't)
      const userId = session.user.id || 'temp-id' // Use session user ID if available

      try {
        user = await prisma.user.create({
          data: {
            id: userId,
            email: userEmail,
          }
        })

        console.log('Successfully created user:', user)
      } catch (error) {
        console.error('Error creating user:', error)
        // If user creation fails, return fallback data
        const fallbackData = getDevelopmentSubscriptionData(userEmail, { id: userId, email: userEmail }, 0)
        console.log('Returning fallback subscription data due to user creation error:', fallbackData)
        return NextResponse.json(fallbackData)
      }
    }

    // Get user's calculations count
    const calculationsCount = await prisma.retirementCalculation.count({
      where: {
        userId: user.id,
        calculationName: {
          not: {
            startsWith: 'Auto-saved'
          }
        }
      }
    })

    let subscriptionData: SubscriptionResponse

    // Try to get Stripe subscription data
    if (process.env.STRIPE_SECRET_KEY && user.stripeCustomerId) {
      try {
        const customer = await StripeService.getCustomerWithSubscriptions(user.stripeCustomerId)

        if (customer && customer.subscriptions.length > 0) {
          const activeSubscription = customer.subscriptions.find(sub =>
            isSubscriptionActive(sub.status)
          ) || customer.subscriptions[0]

          subscriptionData = {
            isPremium: isSubscriptionActive(activeSubscription.status),
            subscriptionStatus: activeSubscription.status,
            subscriptionPlan: activeSubscription.plan,
            savedCalculationsCount: calculationsCount,
            currentPeriodEnd: safeToISOString(activeSubscription.currentPeriodEnd),
            cancelAtPeriodEnd: activeSubscription.cancelAtPeriodEnd,
            trialEnd: safeToISOString(activeSubscription.trialEnd),
            customerId: customer.id,
            subscriptionId: activeSubscription.id,
            usageLimits: getUsageLimits(activeSubscription.plan),
            currentUsage: await getCurrentUsage(user.id)
          }
        } else {
          // No active subscription found
          subscriptionData = getFreeUserData(user, calculationsCount)
        }
      } catch (error) {
        console.error('Error fetching Stripe subscription:', error)
        // Fallback to development mode
        subscriptionData = getDevelopmentSubscriptionData(userEmail, user, calculationsCount)
      }
    } else {
      // Development mode or no Stripe configuration
      subscriptionData = getDevelopmentSubscriptionData(userEmail, user, calculationsCount)
    }

    console.log('Returning subscription response:', subscriptionData)
    return NextResponse.json(subscriptionData)
  } catch (error) {
    console.error('Error checking subscription status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function getFreeUserData(user: any, calculationsCount: number): SubscriptionResponse {
  return {
    isPremium: false,
    subscriptionStatus: 'inactive',
    subscriptionPlan: 'free',
    savedCalculationsCount: calculationsCount,
    usageLimits: getUsageLimits('free'),
    currentUsage: {
      savedCalculations: calculationsCount,
      socialSecurityCalculations: 0, // TODO: Track this
      wizardUses: 0, // TODO: Track this
      pdfReports: 0, // TODO: Track this
    }
  }
}

function getDevelopmentSubscriptionData(userEmail: string, user: any, calculationsCount: number): SubscriptionResponse {
  // Check multiple sources for premium status:
  // 1. Database subscription status (most authoritative)
  // 2. In-memory premium users store (for immediate demo access)
  // 3. Fallback premium users array (for development)

  const inFallbackUsers = FALLBACK_PREMIUM_USERS.includes(userEmail)
  const inMemoryPremium = isPremiumUser(userEmail)
  const dbSubscriptionActive = user?.subscriptionStatus === 'active'

  const isPremium = dbSubscriptionActive || inMemoryPremium || inFallbackUsers

  console.log(`Checking premium status for ${userEmail}:`)
  console.log(`- Database subscription status: ${user?.subscriptionStatus || 'none'}`)
  console.log(`- Database subscription plan: ${user?.subscriptionPlan || 'none'}`)
  console.log(`- In FALLBACK_PREMIUM_USERS: ${inFallbackUsers}`)
  console.log(`- In in-memory premium store: ${inMemoryPremium}`)
  console.log(`- Final isPremium result: ${isPremium}`)

  // Use database values if available, otherwise fall back to defaults
  const subscriptionStatus = isPremium ? (user?.subscriptionStatus || 'active') : 'inactive'
  const subscriptionPlan = isPremium ? (user?.subscriptionPlan || 'monthly') : 'free'

  return {
    isPremium,
    subscriptionStatus: subscriptionStatus as any,
    subscriptionPlan: subscriptionPlan as any,
    savedCalculationsCount: calculationsCount,
    currentPeriodEnd: safeToISOString(user?.currentPeriodEnd),
    cancelAtPeriodEnd: user?.cancelAtPeriodEnd || false,
    usageLimits: getUsageLimits(subscriptionPlan as any),
    currentUsage: {
      savedCalculations: calculationsCount,
      socialSecurityCalculations: user?.socialSecurityCalculations || 0,
      wizardUses: user?.wizardUses || 0,
      pdfReports: user?.pdfReports || 0,
    }
  }
}

function getUsageLimits(plan: SubscriptionPlan) {
  if (plan === 'free') {
    return {
      maxSavedCalculations: FREE_TIER_LIMITS.maxSavedCalculations,
      maxSocialSecurityCalculations: FREE_TIER_LIMITS.maxSocialSecurityCalculations,
      maxWizardUses: FREE_TIER_LIMITS.maxWizardUses,
      maxPdfReports: FREE_TIER_LIMITS.maxPdfReports,
    }
  }

  // Premium plans have unlimited access
  return {
    maxSavedCalculations: -1, // -1 indicates unlimited
    maxSocialSecurityCalculations: -1,
    maxWizardUses: -1,
    maxPdfReports: -1,
  }
}

async function getCurrentUsage(userId: string) {
  try {
    // Get user's calculations count
    const calculationsCount = await prisma.retirementCalculation.count({
      where: { userId }
    })

    return {
      savedCalculations: calculationsCount,
      socialSecurityCalculations: 0, // TODO: Track SS calculations
      wizardUses: 0, // TODO: Track wizard uses
      pdfReports: 0, // TODO: Track PDF reports
    }
  } catch (error) {
    console.error('Error getting current usage:', error)
    return {
      savedCalculations: 0,
      socialSecurityCalculations: 0,
      wizardUses: 0,
      pdfReports: 0,
    }
  }
}