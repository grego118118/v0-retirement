import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth/auth-options"
import { addPremiumUser } from "@/lib/subscription-utils"

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

    // In a real implementation, you would integrate with a payment processor like Stripe
    // For now, we'll simulate the checkout process
    
    const prices = {
      monthly: { amount: 999, currency: 'usd', interval: 'month' }, // $9.99
      annual: { amount: 7900, currency: 'usd', interval: 'year' }   // $79.00
    }
    
    const selectedPrice = prices[planType as keyof typeof prices]
    
    // TODO: Replace with actual Stripe checkout session creation
    // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    //   apiVersion: '2023-10-16',
    // })
    
    // const session = await stripe.checkout.sessions.create({
    //   customer_email: session.user.email,
    //   payment_method_types: ['card'],
    //   line_items: [{
    //     price_data: {
    //       currency: selectedPrice.currency,
    //       product_data: {
    //         name: `Massachusetts Pension Estimator - ${planType === 'monthly' ? 'Monthly' : 'Annual'} Plan`,
    //         description: 'Premium retirement planning features',
    //       },
    //       unit_amount: selectedPrice.amount,
    //       recurring: {
    //         interval: selectedPrice.interval,
    //       },
    //     },
    //     quantity: 1,
    //   }],
    //   mode: 'subscription',
    //   success_url: `${process.env.NEXTAUTH_URL}/subscribe/success?session_id={CHECKOUT_SESSION_ID}`,
    //   cancel_url: `${process.env.NEXTAUTH_URL}/subscribe?cancelled=true`,
    //   metadata: {
    //     userId: session.user.id,
    //     planType: planType,
    //   },
    // })
    
    // For demo purposes, return a mock checkout URL
    const checkoutUrl = `/subscribe/demo-checkout?plan=${planType}&email=${encodeURIComponent(session.user.email)}`
    
    return NextResponse.json({
      checkoutUrl,
      planType,
      amount: selectedPrice.amount,
      currency: selectedPrice.currency,
      interval: selectedPrice.interval
    })
    
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
} 