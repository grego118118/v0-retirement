import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth/auth-options'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check Stripe configuration status
    const stripeConfig = {
      isConfigured: false,
      hasSecretKey: false,
      hasPublishableKey: false,
      hasWebhookSecret: false,
      configurationStatus: 'incomplete'
    }

    // Check for Stripe environment variables
    if (process.env.STRIPE_SECRET_KEY) {
      stripeConfig.hasSecretKey = true
    }

    if (process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
      stripeConfig.hasPublishableKey = true
    }

    if (process.env.STRIPE_WEBHOOK_SECRET) {
      stripeConfig.hasWebhookSecret = true
    }

    // Determine if Stripe is fully configured
    stripeConfig.isConfigured = stripeConfig.hasSecretKey && 
                               stripeConfig.hasPublishableKey && 
                               stripeConfig.hasWebhookSecret

    if (stripeConfig.isConfigured) {
      stripeConfig.configurationStatus = 'complete'
    } else if (stripeConfig.hasSecretKey || stripeConfig.hasPublishableKey) {
      stripeConfig.configurationStatus = 'partial'
    } else {
      stripeConfig.configurationStatus = 'none'
    }

    return NextResponse.json(stripeConfig)
  } catch (error) {
    console.error('Error checking Stripe configuration:', error)
    return NextResponse.json(
      { 
        error: 'Failed to check configuration',
        isConfigured: false,
        hasSecretKey: false,
        hasPublishableKey: false,
        hasWebhookSecret: false,
        configurationStatus: 'error'
      },
      { status: 500 }
    )
  }
}
