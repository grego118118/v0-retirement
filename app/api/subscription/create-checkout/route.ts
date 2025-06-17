import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth/auth-options'
import { StripeService } from '@/lib/stripe/service'
import { SUBSCRIPTION_PLANS } from '@/lib/stripe/config'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { planType, userEmail, userName } = await request.json()

    // Validate plan type
    if (!planType || !['monthly', 'annual'].includes(planType)) {
      return NextResponse.json(
        { error: 'Invalid plan type. Must be "monthly" or "annual"' },
        { status: 400 }
      )
    }

    // Validate email matches session
    if (userEmail !== session.user.email) {
      return NextResponse.json(
        { error: 'Email mismatch' },
        { status: 400 }
      )
    }

    // Get plan configuration
    const plan = SUBSCRIPTION_PLANS[planType as keyof typeof SUBSCRIPTION_PLANS]
    if (!plan) {
      return NextResponse.json(
        { error: 'Plan configuration not found' },
        { status: 400 }
      )
    }

    try {
      // Create or get Stripe customer
      const customerId = await StripeService.createOrGetCustomer(
        userEmail,
        userName || undefined
      )

      // Create checkout session
      const checkoutUrl = await StripeService.createCheckoutSession(
        customerId,
        plan.priceId,
        userEmail,
        `${process.env.NEXTAUTH_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
        `${process.env.NEXTAUTH_URL}/subscription/cancel`
      )

      return NextResponse.json({
        checkoutUrl,
        customerId,
        planType,
        planName: plan.name,
        price: plan.price
      })

    } catch (stripeError: any) {
      console.error('Stripe error:', stripeError)
      
      // Handle specific Stripe errors
      if (stripeError.message?.includes('not configured')) {
        return NextResponse.json(
          { 
            error: 'Payment processing is not configured. Please contact support.',
            code: 'STRIPE_NOT_CONFIGURED'
          },
          { status: 503 }
        )
      }

      return NextResponse.json(
        { 
          error: 'Failed to create checkout session. Please try again.',
          code: 'CHECKOUT_CREATION_FAILED'
        },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Checkout creation error:', error)
    return NextResponse.json(
      { 
        error: 'An unexpected error occurred. Please try again.',
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    )
  }
}
