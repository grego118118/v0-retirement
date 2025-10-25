/**
 * Stripe Customer Portal API
 * Creates customer portal sessions for subscription management
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-config'
import { prisma } from '@/lib/prisma'
import { StripeService } from '@/lib/stripe/service'
import { isStripeConfigured, handleStripeDevError } from '@/lib/stripe/development-helper'

// Development fallback premium users (when Stripe is not configured)
const FALLBACK_PREMIUM_USERS = [
  'premium@example.com',
  'test@premium.com',
  'grego118@gmail.com'
]

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userEmail = session.user.email

    console.log(`🔄 Creating customer portal session for ${userEmail}`)

    // Check if Stripe is configured
    if (!isStripeConfigured()) {
      console.warn('⚠️ Stripe portal requested but not configured for development')

      // For development fallback users, provide a helpful message
      if (FALLBACK_PREMIUM_USERS.includes(userEmail)) {
        return NextResponse.json(
          {
            error: 'Development Mode - Stripe Not Configured',
            details: 'You are marked as a premium user in development mode, but Stripe is not configured. In production, this would open the Stripe Customer Portal.',
            redirectTo: '/subscription/portal',
            developmentNote: 'Add STRIPE_SECRET_KEY to .env.local to enable actual Stripe integration',
            isDevelopmentMode: true
          },
          { status: 503 }
        )
      } else {
        return NextResponse.json(
          {
            error: 'Payment system not configured',
            details: 'Stripe integration is not set up. Add STRIPE_SECRET_KEY to .env.local to enable premium features.',
            redirectTo: '/subscribe',
            developmentNote: 'See DEVELOPMENT_SETUP.md for configuration instructions'
          },
          { status: 503 }
        )
      }
    }

    // Get user from database, create if doesn't exist
    let user = await prisma.user.findUnique({
      where: { email: userEmail }
    })

    if (!user) {
      console.log(`Creating new user record for ${userEmail}`)
      try {
        user = await prisma.user.create({
          data: {
            email: userEmail,
            name: session.user.name || null,
            image: session.user.image || null,
          }
        })
        console.log(`Created user record for ${userEmail}`)
      } catch (createError: any) {
        console.error('Failed to create user record:', createError)
        return NextResponse.json(
          {
            error: 'Failed to create user account',
            details: createError.message
          },
          { status: 500 }
        )
      }
    }

    // If user doesn't have a Stripe customer ID, create one
    if (!user.stripeCustomerId) {
      console.log(`Creating Stripe customer for ${userEmail}`)
      try {
        const customerId = await StripeService.createOrGetCustomer(userEmail, user.name || undefined)

        // Update user with Stripe customer ID
        await prisma.user.update({
          where: { email: userEmail },
          data: { stripeCustomerId: customerId }
        })

        console.log(`Created Stripe customer ${customerId} for ${userEmail}`)

        // For new customers without subscriptions, redirect to pricing page
        return NextResponse.json({
          error: 'No active subscription found',
          redirectTo: '/subscribe',
          message: 'Please subscribe to access the customer portal',
          details: 'A Stripe customer account was created, but no subscription was found.'
        }, { status: 404 })

      } catch (stripeError: any) {
        console.error('Failed to create Stripe customer:', stripeError)
        return NextResponse.json(
          {
            error: 'Failed to set up customer account',
            details: stripeError.message
          },
          { status: 500 }
        )
      }
    }

    // Create customer portal session
    const portalUrl = await StripeService.createPortalSession(user.stripeCustomerId)

    console.log(`Created customer portal session for ${userEmail}: ${portalUrl}`)

    return NextResponse.json({
      portalUrl,
      customerId: user.stripeCustomerId
    })

  } catch (error: any) {
    console.error('🚨 Customer portal session creation failed:', error)

    // Handle specific Stripe errors
    if (error.name === 'StripeError') {
      console.error('🔴 Stripe-specific error:', {
        message: error.message,
        code: error.code,
        type: error.type
      })

      // Handle specific Stripe portal configuration error
      if (error.message && error.message.includes('No configuration provided')) {
        return NextResponse.json(
          {
            error: 'Stripe Customer Portal not configured',
            details: 'The Stripe Customer Portal requires configuration in the Stripe Dashboard. In development mode, this feature is not fully available.',
            developmentNote: 'Configure the Customer Portal at https://dashboard.stripe.com/test/settings/billing/portal',
            redirectTo: '/subscription/portal',
            isDevelopmentMode: true,
            type: 'stripe_config_error'
          },
          { status: 503 }
        )
      }

      return NextResponse.json(
        {
          error: 'Payment system error',
          details: error.message || 'Stripe service is currently unavailable',
          code: error.code,
          type: error.type || 'stripe_error'
        },
        { status: 502 }
      )
    }

    // Handle database/Prisma errors
    if (error.code === 'P2002' || error.name === 'PrismaClientKnownRequestError') {
      console.error('🔴 Database error:', error.message)
      return NextResponse.json(
        {
          error: 'Database error',
          details: 'Unable to access user data. Please try again.',
          type: 'database_error'
        },
        { status: 500 }
      )
    }

    // Handle authentication errors
    if (error.message && error.message.includes('Unauthorized')) {
      return NextResponse.json(
        {
          error: 'Authentication error',
          details: 'Please sign in again to access the customer portal.',
          type: 'auth_error'
        },
        { status: 401 }
      )
    }

    // Generic error handling
    console.error('🔴 Unexpected error:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    })

    return NextResponse.json(
      {
        error: 'Failed to create customer portal session',
        details: error.message || 'An unexpected error occurred. Please try again.',
        type: 'unknown_error'
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

    const userEmail = session.user.email

    // Check if Stripe is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('Stripe is not configured - missing STRIPE_SECRET_KEY')
      return NextResponse.json(
        {
          error: 'Payment system not configured',
          details: 'Stripe integration is not set up. Please contact support.'
        },
        { status: 503 }
      )
    }

    // Get user subscription information
    const user = await prisma.user.findUnique({
      where: { email: userEmail }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    if (!user.stripeCustomerId) {
      return NextResponse.json(
        {
          error: 'No subscription found for this user',
          redirectTo: '/pricing',
          message: 'Please subscribe to view customer portal data'
        },
        { status: 404 }
      )
    }

    // Get customer data from Stripe
    const customer = await StripeService.getCustomerWithSubscriptions(user.stripeCustomerId)

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found in Stripe' },
        { status: 404 }
      )
    }

    // Get recent invoices
    const invoices = await StripeService.getCustomerInvoices(user.stripeCustomerId, 5)

    return NextResponse.json({
      customer: {
        id: customer.id,
        email: customer.email,
        name: customer.name,
        subscriptions: customer.subscriptions,
        defaultPaymentMethod: customer.defaultPaymentMethod
      },
      invoices
    })

  } catch (error: any) {
    console.error('Error fetching customer portal data:', error)

    // Handle specific Stripe errors
    if (error.name === 'StripeError') {
      return NextResponse.json(
        {
          error: 'Payment system error',
          details: error.message
        },
        { status: 502 }
      )
    }

    return NextResponse.json(
      {
        error: 'Failed to fetch customer data',
        details: error.message
      },
      { status: 500 }
    )
  }
}
