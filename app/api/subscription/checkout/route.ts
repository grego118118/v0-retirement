import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth/auth-options"
import { stripe, SUBSCRIPTION_PLANS, STRIPE_CONFIG } from "@/lib/stripe/config"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const { planType } = await request.json()
    
    if (!planType || !['monthly', 'annual'].includes(planType)) {
      return NextResponse.json({ error: "Invalid plan type" }, { status: 400 })
    }

    // Get the plan configuration
    const plan = SUBSCRIPTION_PLANS[planType as keyof typeof SUBSCRIPTION_PLANS]
    
    if (!plan) {
      return NextResponse.json({ error: "Invalid plan configuration" }, { status: 400 })
    }

    // For demo/development mode, return mock checkout URL
    if (!stripe || !process.env.STRIPE_SECRET_KEY) {
      console.log('Stripe not configured, using demo mode')
      const checkoutUrl = `/subscribe/demo-checkout?plan=${planType}&email=${encodeURIComponent(session.user.email)}`
      
      return NextResponse.json({
        checkoutUrl,
        planType,
        amount: plan.price * 100, // Convert to cents
        currency: 'usd',
        interval: plan.interval
      })
    }

    try {
      // Create Stripe checkout session
      const checkoutSession = await stripe.checkout.sessions.create({
        customer_email: session.user.email,
        payment_method_types: ['card'],
        line_items: [{
          price: plan.priceId,
          quantity: 1,
        }],
        mode: 'subscription',
        success_url: STRIPE_CONFIG.successUrl + `?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: STRIPE_CONFIG.cancelUrl + `?cancelled=true`,
        metadata: {
          userId: session.user.id || session.user.email,
          planType: planType,
          userEmail: session.user.email,
        },
        subscription_data: {
          metadata: {
            userId: session.user.id || session.user.email,
            planType: planType,
            userEmail: session.user.email,
          }
        },
        allow_promotion_codes: true,
        billing_address_collection: 'auto',
        tax_id_collection: {
          enabled: true,
        },
      })

      return NextResponse.json({
        checkoutUrl: checkoutSession.url,
        sessionId: checkoutSession.id,
        planType,
        amount: plan.price * 100,
        currency: 'usd',
        interval: plan.interval
      })

    } catch (stripeError: any) {
      console.error('Stripe checkout session creation failed:', stripeError)
      
      // Fallback to demo mode if Stripe fails
      const checkoutUrl = `/subscribe/demo-checkout?plan=${planType}&email=${encodeURIComponent(session.user.email)}`
      
      return NextResponse.json({
        checkoutUrl,
        planType,
        amount: plan.price * 100,
        currency: 'usd',
        interval: plan.interval,
        fallback: true
      })
    }
    
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
