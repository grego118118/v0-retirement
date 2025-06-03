/**
 * Stripe Checkout API
 * Creates checkout sessions for subscription purchases
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-config'
import { prisma } from '@/lib/prisma'
import { StripeService } from '@/lib/stripe/service'
import { SUBSCRIPTION_PLANS } from '@/lib/stripe/config'

interface CheckoutRequest {
  priceId: string
  successUrl?: string
  cancelUrl?: string
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { priceId, successUrl, cancelUrl }: CheckoutRequest = await request.json()

    if (!priceId) {
      return NextResponse.json({ error: 'Price ID is required' }, { status: 400 })
    }

    // Validate price ID
    const validPriceIds = [
      SUBSCRIPTION_PLANS.monthly.priceId,
      SUBSCRIPTION_PLANS.annual.priceId
    ]

    if (!validPriceIds.includes(priceId)) {
      return NextResponse.json({ error: 'Invalid price ID' }, { status: 400 })
    }

    const userEmail = session.user.email
    const userName = session.user.name || undefined

    console.log(`Creating checkout session for ${userEmail}, priceId: ${priceId}`)

    // Get or create user in database
    let user = await prisma.user.findUnique({
      where: { email: userEmail }
    })

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: userEmail,
          name: userName,
        }
      })
    }

    // Create or get Stripe customer
    let customerId = user.stripeCustomerId

    if (!customerId) {
      customerId = await StripeService.createOrGetCustomer(userEmail, userName)
      
      // Update user with Stripe customer ID
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customerId }
      })
    }

    // Check if user already has an active subscription
    if (user.subscriptionStatus === 'active') {
      return NextResponse.json(
        { error: 'User already has an active subscription' },
        { status: 400 }
      )
    }

    // Create checkout session
    const checkoutUrl = await StripeService.createCheckoutSession(
      customerId,
      priceId,
      userEmail,
      successUrl,
      cancelUrl
    )

    console.log(`Created checkout session for ${userEmail}: ${checkoutUrl}`)

    return NextResponse.json({ 
      checkoutUrl,
      customerId,
      priceId
    })

  } catch (error: any) {
    console.error('Checkout session creation failed:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to create checkout session',
        details: error.message 
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Return available subscription plans
    return NextResponse.json({
      plans: {
        monthly: {
          priceId: SUBSCRIPTION_PLANS.monthly.priceId,
          name: SUBSCRIPTION_PLANS.monthly.name,
          price: SUBSCRIPTION_PLANS.monthly.price,
          interval: SUBSCRIPTION_PLANS.monthly.interval,
          features: SUBSCRIPTION_PLANS.monthly.features
        },
        annual: {
          priceId: SUBSCRIPTION_PLANS.annual.priceId,
          name: SUBSCRIPTION_PLANS.annual.name,
          price: SUBSCRIPTION_PLANS.annual.price,
          interval: SUBSCRIPTION_PLANS.annual.interval,
          savings: SUBSCRIPTION_PLANS.annual.savings,
          features: SUBSCRIPTION_PLANS.annual.features
        }
      }
    })

  } catch (error: any) {
    console.error('Error fetching subscription plans:', error)
    
    return NextResponse.json(
      { error: 'Failed to fetch subscription plans' },
      { status: 500 }
    )
  }
}
