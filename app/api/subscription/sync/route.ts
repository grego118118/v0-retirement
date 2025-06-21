import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-config'
import { stripe } from '@/lib/stripe/config'
import { prisma } from '@/lib/prisma'

/**
 * Manual Subscription Sync Endpoint
 * Syncs subscription status from Stripe to local database
 */
export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log(`🔄 Manual subscription sync requested for: ${session.user.email}`)

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (!user.stripeCustomerId) {
      return NextResponse.json({ 
        error: 'No Stripe customer ID found',
        message: 'User has not created any subscriptions yet'
      }, { status: 400 })
    }

    console.log(`📋 Syncing subscription for Stripe customer: ${user.stripeCustomerId}`)

    if (!stripe) {
      return NextResponse.json({
        error: 'Stripe not configured',
        message: 'Stripe API is not available'
      }, { status: 500 })
    }

    // Get active subscriptions from Stripe
    const subscriptionsResponse = await stripe.subscriptions.list({
      customer: user.stripeCustomerId,
      status: 'active',
      limit: 10
    })

    const activeSubscriptions = subscriptionsResponse.data
    console.log(`📊 Found ${activeSubscriptions.length} active subscriptions`)

    if (activeSubscriptions.length === 0) {
      // No active subscriptions - update user to free
      await prisma.user.update({
        where: { id: user.id },
        data: {
          subscriptionId: null,
          subscriptionStatus: null,
          subscriptionPlan: null,
          currentPeriodEnd: null,
          cancelAtPeriodEnd: false,
          updatedAt: new Date()
        }
      })

      console.log('✅ User updated to free plan (no active subscriptions)')
      
      return NextResponse.json({
        success: true,
        message: 'No active subscriptions found - user set to free plan',
        isPremium: false,
        subscriptionStatus: 'inactive',
        subscriptionPlan: 'free'
      })
    }

    // Get the most recent active subscription
    const subscription = activeSubscriptions[0]
    const priceId = subscription.items.data[0]?.price?.id

    // Determine subscription plan based on price ID
    let subscriptionPlan = 'free'
    if (priceId === 'price_1RUqM6QBHWl7jXHEuGpE9jcX') {
      subscriptionPlan = 'monthly'
    } else if (priceId === 'price_1RZkNFQBHWl7jXHELKksQgBY') {
      subscriptionPlan = 'annual'
    }

    console.log(`📋 Subscription details:`, {
      id: subscription.id,
      status: subscription.status,
      priceId,
      plan: subscriptionPlan,
      currentPeriodEnd: (subscription as any).current_period_end,
      cancelAtPeriodEnd: subscription.cancel_at_period_end
    })

    // Update user in database
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        subscriptionId: subscription.id,
        subscriptionStatus: subscription.status,
        subscriptionPlan,
        currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        updatedAt: new Date()
      }
    })

    console.log('✅ User subscription status updated successfully')

    return NextResponse.json({
      success: true,
      message: 'Subscription status synced successfully',
      isPremium: ['active', 'trialing'].includes(subscription.status),
      subscriptionStatus: subscription.status,
      subscriptionPlan,
      subscriptionId: subscription.id,
      currentPeriodEnd: (subscription as any).current_period_end,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      syncedAt: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('❌ Subscription sync error:', error)
    return NextResponse.json({
      error: 'Failed to sync subscription status',
      details: error.message
    }, { status: 500 })
  }
}

/**
 * GET endpoint to check sync status
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      hasStripeCustomerId: !!user.stripeCustomerId,
      subscriptionId: user.subscriptionId,
      subscriptionStatus: user.subscriptionStatus,
      subscriptionPlan: user.subscriptionPlan,
      currentPeriodEnd: user.currentPeriodEnd,
      cancelAtPeriodEnd: user.cancelAtPeriodEnd,
      lastUpdated: user.updatedAt
    })

  } catch (error: any) {
    console.error('❌ Subscription sync status error:', error)
    return NextResponse.json({
      error: 'Failed to get sync status',
      details: error.message
    }, { status: 500 })
  }
}
