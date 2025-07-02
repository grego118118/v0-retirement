import { prisma } from '@/lib/prisma'
import { StripeService } from '@/lib/stripe/service'
import { isSubscriptionActive, getUserSubscriptionType, type UserSubscriptionType } from '@/lib/stripe/config'

// Simple in-memory store for demo premium users
// In production, this would be in a database
let premiumUsers = new Set<string>([
  'premium@example.com',
  'test@premium.com',
  'grego118@gmail.com' // Added the user's email manually to ensure premium access
])

// Simple in-memory store for canceled users (for demo)
let canceledUsers = new Set<string>()

// Fallback premium users for development (when Stripe is not configured)
const FALLBACK_PREMIUM_USERS = [
  'premium@example.com',
  'test@premium.com',
  'grego118@gmail.com'
]

// Function to add a user to premium (used by checkout)
export function addPremiumUser(email: string) {
  console.log('Adding premium user:', email)
  premiumUsers.add(email)
  // Remove from canceled list if they were previously canceled
  canceledUsers.delete(email)
  console.log('Current premium users:', Array.from(premiumUsers))
}

// Function to remove a user from premium (used by cancellation)
export function removePremiumUser(email: string) {
  console.log('Removing premium user:', email)
  premiumUsers.delete(email)
  canceledUsers.add(email)
  console.log('Current premium users:', Array.from(premiumUsers))
  console.log('Current canceled users:', Array.from(canceledUsers))
}

// Function to check if user is premium
export function isPremiumUser(email: string) {
  const isUserPremium = premiumUsers.has(email) && !canceledUsers.has(email)
  console.log(`Checking if ${email} is premium:`, isUserPremium)
  console.log('All premium users:', Array.from(premiumUsers))
  console.log('All canceled users:', Array.from(canceledUsers))
  return isUserPremium
}

/**
 * Comprehensive function to determine user subscription status
 * This replicates the logic from the subscription status API
 * for use in server-side routes like PDF generation
 */
export async function getUserSubscriptionInfo(userEmail: string): Promise<{
  isPremium: boolean
  userType: UserSubscriptionType
  subscriptionPlan: string
  subscriptionStatus: string
}> {
  console.log(`🔍 getUserSubscriptionInfo: Checking subscription for ${userEmail}`)

  try {
    // Get user from database
    let user = await prisma.user.findUnique({
      where: { email: userEmail }
    })

    if (!user) {
      console.log(`📝 Creating new user for ${userEmail}`)
      user = await prisma.user.create({
        data: {
          email: userEmail,
          name: userEmail.split('@')[0]
        }
      })
    }

    // Check if Stripe is configured and try to get subscription data
    const isStripeConfigured = !!process.env.STRIPE_SECRET_KEY
    let subscriptionData: any = null

    if (isStripeConfigured) {
      try {
        console.log(`🔄 Checking Stripe subscription for ${userEmail}`)
        // First get customer ID, then get customer with subscriptions
        const customerId = await StripeService.createOrGetCustomer(userEmail)
        const customer = await StripeService.getCustomerWithSubscriptions(customerId)

        if (customer && customer.subscriptions.length > 0) {
          const activeSubscription = customer.subscriptions.find(sub =>
            isSubscriptionActive(sub.status)
          ) || customer.subscriptions[0]

          subscriptionData = {
            isPremium: isSubscriptionActive(activeSubscription.status),
            subscriptionStatus: activeSubscription.status,
            subscriptionPlan: activeSubscription.plan,
          }
          console.log(`✅ Found Stripe subscription:`, subscriptionData)
        } else {
          console.log(`❌ No Stripe subscription found for ${userEmail}`)
        }
      } catch (error) {
        console.error('❌ Error fetching Stripe subscription:', error)
        // Will fall back to development mode below
      }
    } else {
      console.log('⚠️ Stripe not configured, using development mode')
    }

    // If no Stripe subscription found, use development/fallback logic
    if (!subscriptionData) {
      console.log(`🔄 Using development subscription logic for ${userEmail}`)

      // Check multiple sources for premium status:
      // 1. Database subscription status (most authoritative)
      // 2. In-memory premium users store (for immediate demo access)
      // 3. Fallback premium users array (for development)
      const inFallbackUsers = FALLBACK_PREMIUM_USERS.includes(userEmail)
      const inMemoryPremium = isPremiumUser(userEmail)
      const dbSubscriptionActive = user?.subscriptionStatus === 'active'

      const isPremium = dbSubscriptionActive || inMemoryPremium || inFallbackUsers

      console.log(`🔍 Development premium check for ${userEmail}:`, {
        inFallbackUsers,
        inMemoryPremium,
        dbSubscriptionActive,
        finalIsPremium: isPremium
      })

      // Use database values if available, otherwise fall back to defaults
      const subscriptionStatus = isPremium ? (user?.subscriptionStatus || 'active') : 'inactive'
      const subscriptionPlan = isPremium ? (user?.subscriptionPlan || 'monthly') : 'free'

      subscriptionData = {
        isPremium,
        subscriptionStatus,
        subscriptionPlan,
      }
    }

    // Determine userType based on subscription data
    let userType: UserSubscriptionType = 'oauth_free'
    if (subscriptionData.isPremium) {
      if (subscriptionData.subscriptionPlan === 'monthly') {
        userType = 'stripe_monthly'
      } else if (subscriptionData.subscriptionPlan === 'annual') {
        userType = 'stripe_annual'
      } else {
        userType = 'oauth_premium' // Grandfathered users
      }
    }

    const result = {
      isPremium: subscriptionData.isPremium,
      userType,
      subscriptionPlan: subscriptionData.subscriptionPlan,
      subscriptionStatus: subscriptionData.subscriptionStatus
    }

    console.log(`✅ Final subscription info for ${userEmail}:`, result)
    return result

  } catch (error) {
    console.error(`❌ Error in getUserSubscriptionInfo for ${userEmail}:`, error)

    // Fallback to free tier on error
    return {
      isPremium: false,
      userType: 'oauth_free',
      subscriptionPlan: 'free',
      subscriptionStatus: 'inactive'
    }
  }
}
