/**
 * Stripe Webhook Handler
 * Processes Stripe events and updates subscription status
 */

import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe, STRIPE_CONFIG, STRIPE_WEBHOOK_EVENTS, getSubscriptionPlan } from '@/lib/stripe/config'
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
      case STRIPE_WEBHOOK_EVENTS.CUSTOMER_SUBSCRIPTION_CREATED:
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription)
        break

      case STRIPE_WEBHOOK_EVENTS.CUSTOMER_SUBSCRIPTION_UPDATED:
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
        break

      case STRIPE_WEBHOOK_EVENTS.CUSTOMER_SUBSCRIPTION_DELETED:
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break

      case STRIPE_WEBHOOK_EVENTS.INVOICE_PAYMENT_SUCCEEDED:
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice)
        break

      case STRIPE_WEBHOOK_EVENTS.INVOICE_PAYMENT_FAILED:
        await handlePaymentFailed(event.data.object as Stripe.Invoice)
        break

      case STRIPE_WEBHOOK_EVENTS.CUSTOMER_CREATED:
        await handleCustomerCreated(event.data.object as Stripe.Customer)
        break

      case STRIPE_WEBHOOK_EVENTS.CUSTOMER_UPDATED:
        await handleCustomerUpdated(event.data.object as Stripe.Customer)
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

/**
 * Handle subscription created
 */
async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  try {
    const customerId = subscription.customer as string
    const priceId = subscription.items.data[0]?.price.id
    const plan = getSubscriptionPlan(priceId)

    console.log(`Subscription created: ${subscription.id} for customer: ${customerId}`)

    // Find user by Stripe customer ID
    const user = await prisma.user.findFirst({
      where: { stripeCustomerId: customerId }
    })

    if (!user) {
      console.error(`User not found for Stripe customer: ${customerId}`)
      return
    }

    // Update user subscription status
    await prisma.user.update({
      where: { id: user.id },
      data: {
        subscriptionStatus: subscription.status,
        subscriptionPlan: plan,
        subscriptionId: subscription.id,
        currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
      }
    })

    console.log(`Updated user ${user.email} subscription status to ${subscription.status}`)
  } catch (error) {
    console.error('Error handling subscription created:', error)
    throw error
  }
}

/**
 * Handle subscription updated
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  try {
    const customerId = subscription.customer as string
    const priceId = subscription.items.data[0]?.price.id
    const plan = getSubscriptionPlan(priceId)

    console.log(`Subscription updated: ${subscription.id} for customer: ${customerId}`)

    // Find user by Stripe customer ID
    const user = await prisma.user.findFirst({
      where: { stripeCustomerId: customerId }
    })

    if (!user) {
      console.error(`User not found for Stripe customer: ${customerId}`)
      return
    }

    // Update user subscription status
    await prisma.user.update({
      where: { id: user.id },
      data: {
        subscriptionStatus: subscription.status,
        subscriptionPlan: plan,
        subscriptionId: subscription.id,
        currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
      }
    })

    console.log(`Updated user ${user.email} subscription: ${subscription.status}, plan: ${plan}`)
  } catch (error) {
    console.error('Error handling subscription updated:', error)
    throw error
  }
}

/**
 * Handle subscription deleted/canceled
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  try {
    const customerId = subscription.customer as string

    console.log(`Subscription deleted: ${subscription.id} for customer: ${customerId}`)

    // Find user by Stripe customer ID
    const user = await prisma.user.findFirst({
      where: { stripeCustomerId: customerId }
    })

    if (!user) {
      console.error(`User not found for Stripe customer: ${customerId}`)
      return
    }

    // Update user to free plan
    await prisma.user.update({
      where: { id: user.id },
      data: {
        subscriptionStatus: 'canceled',
        subscriptionPlan: 'free',
        subscriptionId: null,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
        trialEnd: null,
      }
    })

    console.log(`User ${user.email} subscription canceled, reverted to free plan`)
  } catch (error) {
    console.error('Error handling subscription deleted:', error)
    throw error
  }
}

/**
 * Handle successful payment
 */
async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  try {
    const customerId = invoice.customer as string
    const subscriptionId = (invoice as any).subscription as string

    console.log(`Payment succeeded for customer: ${customerId}, subscription: ${subscriptionId}`)

    // Find user by Stripe customer ID
    const user = await prisma.user.findFirst({
      where: { stripeCustomerId: customerId }
    })

    if (!user) {
      console.error(`User not found for Stripe customer: ${customerId}`)
      return
    }

    // If subscription was past due, reactivate it
    if (user.subscriptionStatus === 'past_due') {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          subscriptionStatus: 'active',
        }
      })

      console.log(`Reactivated subscription for user ${user.email}`)
    }

    // TODO: Send payment confirmation email
    // TODO: Log payment for analytics
  } catch (error) {
    console.error('Error handling payment succeeded:', error)
    throw error
  }
}

/**
 * Handle failed payment
 */
async function handlePaymentFailed(invoice: Stripe.Invoice) {
  try {
    const customerId = invoice.customer as string
    const subscriptionId = (invoice as any).subscription as string

    console.log(`Payment failed for customer: ${customerId}, subscription: ${subscriptionId}`)

    // Find user by Stripe customer ID
    const user = await prisma.user.findFirst({
      where: { stripeCustomerId: customerId }
    })

    if (!user) {
      console.error(`User not found for Stripe customer: ${customerId}`)
      return
    }

    // Update subscription status to past_due
    await prisma.user.update({
      where: { id: user.id },
      data: {
        subscriptionStatus: 'past_due',
      }
    })

    console.log(`Marked subscription as past due for user ${user.email}`)

    // TODO: Send payment failure notification email
    // TODO: Implement grace period logic
  } catch (error) {
    console.error('Error handling payment failed:', error)
    throw error
  }
}

/**
 * Handle customer created
 */
async function handleCustomerCreated(customer: Stripe.Customer) {
  try {
    console.log(`Customer created: ${customer.id}, email: ${customer.email}`)

    if (!customer.email) {
      console.error('Customer created without email')
      return
    }

    // Find user by email and update with Stripe customer ID
    const user = await prisma.user.findUnique({
      where: { email: customer.email }
    })

    if (user && !user.stripeCustomerId) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          stripeCustomerId: customer.id,
        }
      })

      console.log(`Linked Stripe customer ${customer.id} to user ${user.email}`)
    }
  } catch (error) {
    console.error('Error handling customer created:', error)
    throw error
  }
}

/**
 * Handle customer updated
 */
async function handleCustomerUpdated(customer: Stripe.Customer) {
  try {
    console.log(`Customer updated: ${customer.id}`)

    // Find user by Stripe customer ID
    const user = await prisma.user.findFirst({
      where: { stripeCustomerId: customer.id }
    })

    if (!user) {
      console.log(`User not found for Stripe customer: ${customer.id}`)
      return
    }

    // Update user information if needed
    const updateData: any = {}

    if (customer.name && customer.name !== user.name) {
      updateData.name = customer.name
    }

    if (Object.keys(updateData).length > 0) {
      await prisma.user.update({
        where: { id: user.id },
        data: updateData
      })

      console.log(`Updated user ${user.email} information from Stripe`)
    }
  } catch (error) {
    console.error('Error handling customer updated:', error)
    throw error
  }
}
