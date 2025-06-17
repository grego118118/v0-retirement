import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe, STRIPE_CONFIG } from '@/lib/stripe/config'
import { prisma } from '@/lib/prisma'
import type Stripe from 'stripe'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const headersList = await headers()
    const signature = headersList.get('stripe-signature')

    if (!signature) {
      console.error('Missing Stripe signature')
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }

    let event: Stripe.Event

    try {
      if (!stripe) {
        throw new Error('Stripe not initialized')
      }
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        STRIPE_CONFIG.webhookSecret
      )
    } catch (error: any) {
      console.error('Webhook signature verification failed:', error.message)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    console.log(`Processing webhook event: ${event.type}`)

    // Handle the event
    switch (event.type) {
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice)
        break

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice)
        break

      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  console.log('🆕 Handling subscription created:', subscription.id)

  try {
    const customerId = subscription.customer as string
    const userEmail = subscription.metadata?.user_email

    console.log('📧 Subscription metadata:', {
      userEmail,
      customerId,
      subscriptionId: subscription.id,
      status: subscription.status
    })

    if (!userEmail) {
      console.error('❌ No user email in subscription metadata - trying to find by customer ID')

      // Fallback: try to find user by customer ID
      const user = await prisma.user.findFirst({
        where: { stripeCustomerId: customerId }
      })

      if (!user) {
        console.error('❌ Cannot find user by customer ID either:', customerId)
        return
      }

      console.log('✅ Found user by customer ID:', user.email)
      // Continue with found user
      await updateUserSubscription(user.id, subscription)
      return
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: userEmail }
    })

    if (!user) {
      console.error('❌ User not found with email:', userEmail)
      return
    }

    await updateUserSubscription(user.id, subscription)
    console.log(`✅ Subscription created for user: ${userEmail}`)
  } catch (error) {
    console.error('❌ Error handling subscription created:', error)
    throw error // Re-throw to ensure webhook fails and retries
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log('🔄 Handling subscription updated:', subscription.id)

  try {
    const customerId = subscription.customer as string

    console.log('🔍 Looking for user with customer ID:', customerId)

    // Find user by customer ID
    const user = await prisma.user.findFirst({
      where: { stripeCustomerId: customerId }
    })

    if (!user) {
      console.error('❌ User not found for customer:', customerId)
      return
    }

    console.log('👤 Found user for subscription update:', user.email)

    // Use the helper function for consistent updates
    await updateUserSubscription(user.id, subscription)

    console.log(`✅ Subscription updated for user: ${user.email}`)
  } catch (error) {
    console.error('❌ Error handling subscription updated:', error)
    throw error // Re-throw to ensure webhook fails and retries
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log('Handling subscription deleted:', subscription.id)
  
  try {
    const customerId = subscription.customer as string
    
    // Find user by customer ID
    const user = await prisma.user.findFirst({
      where: { stripeCustomerId: customerId }
    })

    if (!user) {
      console.error('User not found for customer:', customerId)
      return
    }

    // Update user to remove subscription
    await prisma.user.update({
      where: { id: user.id },
      data: {
        subscriptionId: null,
        subscriptionStatus: 'canceled',
        subscriptionPlan: null,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
        trialEnd: null,
      }
    })

    console.log(`Subscription deleted for user: ${user.email}`)
  } catch (error) {
    console.error('Error handling subscription deleted:', error)
  }
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log('Handling payment succeeded:', invoice.id)

  try {
    const customerId = invoice.customer as string
    const subscriptionId = invoice.subscription as string

    // Find user by customer ID
    const user = await prisma.user.findFirst({
      where: { stripeCustomerId: customerId }
    })

    if (!user) {
      console.error('User not found for customer:', customerId)
      return
    }

    console.log('💳 Payment details:', {
      customerId,
      subscriptionId,
      amount: invoice.amount_paid,
      currency: invoice.currency
    })

    // If we have a subscription ID, get the full subscription details and use helper
    if (subscriptionId && stripe) {
      try {
        console.log('🔍 Fetching subscription details for payment:', subscriptionId)
        const subscription = await stripe.subscriptions.retrieve(subscriptionId)

        console.log('📋 Retrieved subscription for payment:', {
          id: subscription.id,
          status: subscription.status,
          priceId: subscription.items.data[0]?.price.id
        })

        // Use the helper function for consistent updates
        await updateUserSubscription(user.id, subscription)

        console.log(`✅ Payment succeeded and subscription updated for user: ${user.email}`)
      } catch (error) {
        console.error('❌ Error retrieving subscription details for payment:', error)
        // Fallback: just mark as active if we can't get subscription details
        await prisma.user.update({
          where: { id: user.id },
          data: { subscriptionStatus: 'active' }
        })
        console.log(`⚠️ Payment succeeded but used fallback activation for user: ${user.email}`)
      }
    } else {
      // No subscription ID - just mark as active
      await prisma.user.update({
        where: { id: user.id },
        data: { subscriptionStatus: 'active' }
      })
      console.log(`⚠️ Payment succeeded but no subscription ID - marked active for user: ${user.email}`)
    }
  } catch (error) {
    console.error('Error handling payment succeeded:', error)
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  console.log('Handling payment failed:', invoice.id)
  
  try {
    const customerId = invoice.customer as string
    
    // Find user by customer ID
    const user = await prisma.user.findFirst({
      where: { stripeCustomerId: customerId }
    })

    if (!user) {
      console.error('User not found for customer:', customerId)
      return
    }

    // Update subscription status to past_due
    await prisma.user.update({
      where: { id: user.id },
      data: {
        subscriptionStatus: 'past_due'
      }
    })

    console.log(`Payment failed for user: ${user.email}`)
  } catch (error) {
    console.error('Error handling payment failed:', error)
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log('Handling checkout completed:', session.id)

  try {
    const customerId = session.customer as string
    const userEmail = session.customer_details?.email || session.metadata?.user_email

    if (!userEmail) {
      console.error('No user email in checkout session')
      return
    }

    // Find the user
    const user = await prisma.user.findUnique({
      where: { email: userEmail }
    })

    if (!user) {
      console.error('User not found for checkout session:', userEmail)
      return
    }

    // Get subscription details from the checkout session
    if (!stripe) {
      console.error('Stripe not initialized')
      return
    }

    // Retrieve the subscription from the checkout session
    const subscriptionId = session.subscription as string
    if (!subscriptionId) {
      console.error('No subscription ID in checkout session')
      return
    }

    const subscription = await stripe.subscriptions.retrieve(subscriptionId)

    // Determine plan type from price ID
    const priceId = subscription.items.data[0]?.price.id
    let planType = 'monthly'
    if (priceId === process.env.STRIPE_ANNUAL_PRICE_ID) {
      planType = 'annual'
    }

    // Update user with complete subscription information
    await prisma.user.update({
      where: { email: userEmail },
      data: {
        stripeCustomerId: customerId,
        subscriptionId: subscription.id,
        subscriptionStatus: subscription.status, // This should be 'active' for successful payments
        subscriptionPlan: planType,
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
      }
    })

    console.log(`Checkout completed and subscription activated for user: ${userEmail}, status: ${subscription.status}, plan: ${planType}`)

    // Trigger cache invalidation for immediate status update
    try {
      await fetch(`${process.env.NEXTAUTH_URL}/api/subscription/invalidate-cache`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-webhook-source': 'stripe',
        },
        body: JSON.stringify({
          userEmail: userEmail,
          subscriptionId: subscription.id,
          customerId: customerId,
          status: subscription.status,
          plan: planType,
        }),
      })
      console.log(`Cache invalidation triggered for checkout completion: ${userEmail}`)
    } catch (cacheError) {
      console.warn('Failed to invalidate subscription cache:', cacheError)
      // Don't fail the webhook for cache invalidation errors
    }
  } catch (error) {
    console.error('Error handling checkout completed:', error)
  }
}

// Helper function to update user subscription data consistently
async function updateUserSubscription(userId: string, subscription: Stripe.Subscription) {
  try {
    const customerId = subscription.customer as string
    const priceId = subscription.items.data[0]?.price.id

    // Determine plan type using the config function
    let planType = 'monthly'
    if (priceId === process.env.STRIPE_ANNUAL_PRICE_ID) {
      planType = 'annual'
    } else if (priceId === process.env.STRIPE_MONTHLY_PRICE_ID) {
      planType = 'monthly'
    }

    console.log('💾 Updating user subscription:', {
      userId,
      customerId,
      subscriptionId: subscription.id,
      status: subscription.status,
      planType,
      priceId
    })

    // Update user in database with all required fields
    const updateData = {
      stripeCustomerId: customerId,
      subscriptionId: subscription.id,
      subscriptionStatus: subscription.status,
      subscriptionPlan: planType,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
    }

    await prisma.user.update({
      where: { id: userId },
      data: updateData
    })

    console.log('✅ User subscription updated successfully:', {
      userId,
      status: subscription.status,
      plan: planType
    })

  } catch (error) {
    console.error('❌ Error updating user subscription:', error)
    throw error
  }
}
