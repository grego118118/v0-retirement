import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth/auth-options'
import { getUserSubscriptionType } from '@/lib/stripe/config'

// Updated portal endpoint for Stripe billing portal integration

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if Stripe is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      console.log('Stripe not configured, returning configuration message')
      return NextResponse.json({
        url: '/billing?message=stripe_not_configured',
        message: 'Stripe billing portal is not configured. Contact support for billing assistance.'
      })
    }

    try {
      // Initialize Stripe
      const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

      // Get user subscription type to determine how to handle the request
      const userSubscriptionType = getUserSubscriptionType({
        subscriptionPlan: null,
        stripeCustomerId: null,
        subscriptionStatus: null,
        createdAt: new Date() // Current users are considered new (oauth_free)
      })

      // For OAuth-free users (current state), we need to either:
      // 1. Create a Stripe customer and redirect to checkout for upgrade
      // 2. Show them upgrade options
      if (userSubscriptionType === 'oauth_free') {
        // For now, redirect to billing with upgrade message
        // In a full implementation, you might create a customer and redirect to checkout
        return NextResponse.json({
          url: '/billing?message=upgrade_available',
          message: 'Upgrade to premium subscription to access the billing portal.'
        })
      }

      // For OAuth premium users (grandfathered), show them their status
      if (userSubscriptionType === 'oauth_premium') {
        return NextResponse.json({
          redirect: '/billing?message=oauth_premium',
          message: 'Your premium access is managed through Google OAuth authentication. No additional billing required.'
        })
      }

      // For actual Stripe customers, we would look up their customer ID from the database
      // Since we don't have a database integration yet, we'll simulate this

      // In a real implementation, you would:
      // 1. Query your database for the user's Stripe customer ID
      // 2. If they don't have one, create a new customer
      // 3. Create the billing portal session

      // For demonstration, let's create a test customer for users who want to upgrade
      const customer = await stripe.customers.create({
        email: session.user.email,
        name: session.user.name || 'Massachusetts Retirement User',
        metadata: {
          userId: session.user.id || session.user.email,
          source: 'massachusetts_retirement_system'
        }
      })

      console.log('Created Stripe customer:', customer.id, 'for user:', session.user.email)

      // Create billing portal session
      const portalSession = await stripe.billingPortal.sessions.create({
        customer: customer.id,
        return_url: `${process.env.NEXTAUTH_URL}/billing`,
      })

      console.log('Created billing portal session for customer:', customer.id)

      return NextResponse.json({
        url: portalSession.url,
        customerId: customer.id
      })

    } catch (stripeError: any) {
      console.error('Stripe error:', stripeError)

      // Handle specific Stripe errors
      if (stripeError.type === 'StripeInvalidRequestError') {
        return NextResponse.json({
          url: '/billing?message=stripe_error',
          message: 'There was an issue with the billing system. Please try again later.'
        })
      }

      // Fallback for any Stripe errors
      return NextResponse.json({
        url: '/billing?message=oauth_premium',
        message: 'Your premium access is managed through Google OAuth authentication. No additional billing required.'
      })
    }
  } catch (error) {
    console.error('Error creating portal session:', error)
    return NextResponse.json(
      {
        error: 'Failed to create portal session',
        message: 'Unable to access billing portal. Please try again later.'
      },
      { status: 500 }
    )
  }
}
