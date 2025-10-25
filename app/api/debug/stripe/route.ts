import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-config'
import { SUBSCRIPTION_PLANS, STRIPE_CONFIG, stripe } from '@/lib/stripe/config'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only show debug info in development or for admin users
    const isDev = process.env.NODE_ENV === 'development'
    const isAdmin = session.user.email === 'grego118@gmail.com' // Your admin email
    
    if (!isDev && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get user data from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    let stripeCustomerData = null
    let stripeSubscriptions = null

    if (user?.stripeCustomerId && stripe) {
      try {
        // Get customer data from Stripe
        stripeCustomerData = await stripe.customers.retrieve(user.stripeCustomerId)

        // Get subscriptions for this customer
        const subscriptionsResponse = await stripe.subscriptions.list({
          customer: user.stripeCustomerId,
          limit: 10
        })
        stripeSubscriptions = subscriptionsResponse.data
      } catch (error: any) {
        console.error('Error fetching Stripe data:', error)
        stripeCustomerData = { error: error.message }
        stripeSubscriptions = { error: error.message }
      }
    } else if (user?.stripeCustomerId && !stripe) {
      stripeCustomerData = { error: 'Stripe not configured' }
      stripeSubscriptions = { error: 'Stripe not configured' }
    }

    const debugInfo = {
      environment: process.env.NODE_ENV,
      userInfo: {
        email: session.user.email,
        databaseUserId: user?.id,
        stripeCustomerId: user?.stripeCustomerId,
        subscriptionId: user?.subscriptionId,
        subscriptionStatus: user?.subscriptionStatus,
        subscriptionPlan: user?.subscriptionPlan,
        currentPeriodEnd: user?.currentPeriodEnd,
        cancelAtPeriodEnd: user?.cancelAtPeriodEnd,
      },
      stripeCustomerData,
      stripeSubscriptions: stripeSubscriptions && Array.isArray(stripeSubscriptions) ? stripeSubscriptions.map((sub: any) => ({
        id: sub.id,
        status: sub.status,
        current_period_end: sub.current_period_end,
        current_period_start: sub.current_period_start,
        cancel_at_period_end: sub.cancel_at_period_end,
        items: sub.items.data.map((item: any) => ({
          price_id: item.price.id,
          product_id: item.price.product,
          amount: item.price.unit_amount,
          currency: item.price.currency,
          interval: item.price.recurring?.interval
        }))
      })) : stripeSubscriptions,
      stripeConfigured: {
        hasSecretKey: !!process.env.STRIPE_SECRET_KEY,
        hasPublishableKey: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
        hasWebhookSecret: !!process.env.STRIPE_WEBHOOK_SECRET,
        hasMonthlyPriceId: !!process.env.STRIPE_MONTHLY_PRICE_ID,
        hasAnnualPriceId: !!process.env.STRIPE_ANNUAL_PRICE_ID,
      },
      subscriptionPlans: {
        monthly: {
          priceId: SUBSCRIPTION_PLANS.monthly.priceId,
          name: SUBSCRIPTION_PLANS.monthly.name,
          price: SUBSCRIPTION_PLANS.monthly.price,
        },
        annual: {
          priceId: SUBSCRIPTION_PLANS.annual.priceId,
          name: SUBSCRIPTION_PLANS.annual.name,
          price: SUBSCRIPTION_PLANS.annual.price,
        }
      },
      stripeConfig: {
        publishableKey: STRIPE_CONFIG.publishableKey ? 'Set' : 'Missing',
        webhookSecret: STRIPE_CONFIG.webhookSecret ? 'Set' : 'Missing',
        successUrl: STRIPE_CONFIG.successUrl,
        cancelUrl: STRIPE_CONFIG.cancelUrl,
        customerPortalUrl: STRIPE_CONFIG.customerPortalUrl,
      },
      environmentVariables: {
        NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'Not set',
        NODE_ENV: process.env.NODE_ENV,
        // Don't expose actual keys, just their presence
        STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY ? `${process.env.STRIPE_SECRET_KEY.substring(0, 8)}...` : 'Not set',
        NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? `${process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.substring(0, 8)}...` : 'Not set',
        STRIPE_MONTHLY_PRICE_ID: process.env.STRIPE_MONTHLY_PRICE_ID || 'Not set',
        STRIPE_ANNUAL_PRICE_ID: process.env.STRIPE_ANNUAL_PRICE_ID || 'Not set',
      }
    }

    return NextResponse.json(debugInfo)
  } catch (error: any) {
    console.error('Stripe debug error:', error)
    return NextResponse.json({
      error: 'Failed to get debug info',
      details: error.message
    }, { status: 500 })
  }
}
