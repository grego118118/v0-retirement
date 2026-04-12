/**
 * Stripe Customer Portal API
 * Creates customer portal sessions for subscription management
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-options'
import { prisma } from '@/lib/prisma'
import { StripeService } from '@/lib/stripe/service'
import { isStripeConfigured, handleStripeDevError } from '@/lib/stripe/development-helper'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userEmail = session.user.email

    console.log(`Creating customer portal session for ${userEmail}`)

    // Check if Stripe is configured
    if (!isStripeConfigured()) {
      console.warn('Stripe portal requested but not configured for development')
      return NextResponse.json(
        {
          error: 'Payment system not configured',
          details: 'Stripe integration is not set up. Add STRIPE_SECRET_KEY to .env.local to enable premium features.',
          redirectTo: '/pricing',
          developmentNote: 'See DEVELOPMENT_SETUP.md for configuration instructions'
        },
        { status: 503 }
      )
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: userEmail }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
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
          redirectTo: '/pricing',
          message: 'Please subscribe to access the customer portal'
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
    console.error('Customer portal session creation failed:', error)

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
        error: 'Failed to create customer portal session',
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
