import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth/auth-config"
import { prisma } from "@/lib/prisma"
import { StripeService } from "@/lib/stripe/service"
import { SUBSCRIPTION_PLANS } from "@/lib/stripe/config"

// Force dynamic rendering
export const dynamic = 'force-dynamic'

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

    const userEmail = session.user.email
    const userName = session.user.name || undefined

    // Check if Stripe is configured
    const isStripeConfigured = !!process.env.STRIPE_SECRET_KEY &&
      !process.env.STRIPE_SECRET_KEY.includes('REPLACE')

    if (isStripeConfigured) {
      console.log(`🔄 Creating real Stripe checkout for ${userEmail}, plan: ${planType}`)

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

      // Check if user already has an active subscription
      if (user.subscriptionStatus === 'active') {
        return NextResponse.json(
          { error: 'You already have an active subscription' },
          { status: 400 }
        )
      }

      // Create or get Stripe customer
      let customerId = user.stripeCustomerId

      if (!customerId || customerId.startsWith('demo_')) {
        customerId = await StripeService.createOrGetCustomer(userEmail, userName)

        // Update user with Stripe customer ID
        await prisma.user.update({
          where: { id: user.id },
          data: { stripeCustomerId: customerId }
        })
      }

      // Get the price ID for the selected plan
      const priceId = planType === 'monthly'
        ? SUBSCRIPTION_PLANS.monthly.priceId
        : SUBSCRIPTION_PLANS.annual.priceId

      // Create checkout session
      const checkoutUrl = await StripeService.createCheckoutSession(
        customerId,
        priceId,
        userEmail,
        `${process.env.NEXTAUTH_URL}/subscribe/success?session_id={CHECKOUT_SESSION_ID}`,
        `${process.env.NEXTAUTH_URL}/subscribe?cancelled=true`
      )

      console.log(`✅ Created Stripe checkout session for ${userEmail}`)

      return NextResponse.json({
        checkoutUrl,
        planType,
        isRealStripe: true
      })
    } else {
      // Demo mode - redirect to demo checkout
      console.log(`⚠️ Stripe not configured, using demo checkout for ${userEmail}`)

      const checkoutUrl = `/subscribe/demo-checkout?plan=${planType}&email=${encodeURIComponent(userEmail)}`

      return NextResponse.json({
        checkoutUrl,
        planType,
        isRealStripe: false
      })
    }

  } catch (error: any) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session', details: error.message },
      { status: 500 }
    )
  }
}