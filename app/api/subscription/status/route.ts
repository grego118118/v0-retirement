import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-config'
import { prisma } from '@/lib/prisma'
import { StripeService } from '@/lib/stripe/service'
import { isSubscriptionActive, FREE_TIER_LIMITS } from '@/lib/stripe/config'
import type { SubscriptionStatus, SubscriptionPlan } from '@/lib/stripe/config'

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

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      include: {
        calculations: {
          where: {
            calculationName: {
              not: {
                startsWith: 'Auto-saved'
              }
            }
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

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
            savedCalculationsCount: user.calculations?.length || 0,
            currentPeriodEnd: activeSubscription.currentPeriodEnd.toISOString(),
            cancelAtPeriodEnd: activeSubscription.cancelAtPeriodEnd,
            trialEnd: activeSubscription.trialEnd?.toISOString(),
            customerId: customer.id,
            subscriptionId: activeSubscription.id,
            usageLimits: getUsageLimits(activeSubscription.plan),
            currentUsage: await getCurrentUsage(user.id)
          }
        } else {
          // No active subscription found
          subscriptionData = getFreeUserData(user)
        }
      } catch (error) {
        console.error('Error fetching Stripe subscription:', error)
        // Fallback to development mode
        subscriptionData = getDevelopmentSubscriptionData(userEmail, user)
      }
    } else {
      // Development mode or no Stripe configuration
      subscriptionData = getDevelopmentSubscriptionData(userEmail, user)
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

function getFreeUserData(user: any): SubscriptionResponse {
  return {
    isPremium: false,
    subscriptionStatus: 'inactive',
    subscriptionPlan: 'free',
    savedCalculationsCount: user.calculations?.length || 0,
    usageLimits: getUsageLimits('free'),
    currentUsage: {
      savedCalculations: user.calculations?.length || 0,
      socialSecurityCalculations: 0, // TODO: Track this
      wizardUses: 0, // TODO: Track this
      pdfReports: 0, // TODO: Track this
    }
  }
}

function getDevelopmentSubscriptionData(userEmail: string, user: any): SubscriptionResponse {
  const isPremium = FALLBACK_PREMIUM_USERS.includes(userEmail)

  return {
    isPremium,
    subscriptionStatus: isPremium ? 'active' : 'inactive',
    subscriptionPlan: isPremium ? 'monthly' : 'free',
    savedCalculationsCount: user.calculations?.length || 0,
    usageLimits: getUsageLimits(isPremium ? 'monthly' : 'free'),
    currentUsage: {
      savedCalculations: user.calculations?.length || 0,
      socialSecurityCalculations: 0,
      wizardUses: 0,
      pdfReports: 0,
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
  // TODO: Implement proper usage tracking
  // For now, return basic data
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      calculations: true
    }
  })

  return {
    savedCalculations: user?.calculations?.length || 0,
    socialSecurityCalculations: 0, // TODO: Track SS calculations
    wizardUses: 0, // TODO: Track wizard uses
    pdfReports: 0, // TODO: Track PDF reports
  }
}