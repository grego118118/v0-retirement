import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-config'
import { stripe } from '@/lib/stripe/config'

/**
 * Stripe Price Discovery Endpoint
 * Lists all available prices in the connected Stripe account
 * CRITICAL: Use this to find correct price IDs for subscription configuration
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only allow admin users to access this sensitive endpoint
    const isAdmin = session.user.email === 'grego118@gmail.com'
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    if (!stripe) {
      return NextResponse.json({ 
        error: 'Stripe not configured',
        message: 'STRIPE_SECRET_KEY environment variable is missing'
      }, { status: 500 })
    }

    console.log('🔍 Fetching all available Stripe prices...')

    // Get all prices from Stripe
    const prices = await stripe.prices.list({
      limit: 100,
      expand: ['data.product']
    })

    console.log(`📊 Found ${prices.data.length} prices in Stripe account`)

    // Format prices for easy analysis
    const formattedPrices = prices.data.map(price => ({
      id: price.id,
      active: price.active,
      currency: price.currency,
      unit_amount: price.unit_amount,
      unit_amount_decimal: price.unit_amount_decimal,
      recurring: price.recurring ? {
        interval: price.recurring.interval,
        interval_count: price.recurring.interval_count,
        usage_type: price.recurring.usage_type
      } : null,
      product: {
        id: (price.product as any)?.id,
        name: (price.product as any)?.name,
        description: (price.product as any)?.description,
        active: (price.product as any)?.active
      },
      created: new Date(price.created * 1000).toISOString(),
      metadata: price.metadata
    }))

    // Filter for subscription prices (recurring)
    const subscriptionPrices = formattedPrices.filter(price => price.recurring && price.active)
    
    // Group by interval for easy identification
    const monthlyPrices = subscriptionPrices.filter(p => p.recurring?.interval === 'month')
    const yearlyPrices = subscriptionPrices.filter(p => p.recurring?.interval === 'year')

    console.log(`📋 Active subscription prices: ${subscriptionPrices.length} total`)
    console.log(`📅 Monthly prices: ${monthlyPrices.length}`)
    console.log(`📅 Yearly prices: ${yearlyPrices.length}`)

    // Current configuration for comparison
    const currentConfig = {
      monthly: {
        configured: process.env.STRIPE_MONTHLY_PRICE_ID || 'price_1RUqM6QBHWl7jXHEuGpE9jcX',
        fallback: 'price_1RUqM6QBHWl7jXHEuGpE9jcX'
      },
      annual: {
        configured: process.env.STRIPE_ANNUAL_PRICE_ID || 'price_1RZkNFQBHWl7jXHELKksQgBY',
        fallback: 'price_1RZkNFQBHWl7jXHELKksQgBY'
      }
    }

    // Check if current configured prices exist
    const monthlyExists = formattedPrices.find(p => p.id === currentConfig.monthly.configured)
    const annualExists = formattedPrices.find(p => p.id === currentConfig.annual.configured)

    const analysis = {
      total_prices: prices.data.length,
      active_subscription_prices: subscriptionPrices.length,
      monthly_prices: monthlyPrices.length,
      yearly_prices: yearlyPrices.length,
      current_configuration: currentConfig,
      configuration_status: {
        monthly_price_exists: !!monthlyExists,
        annual_price_exists: !!annualExists,
        monthly_price_details: monthlyExists || null,
        annual_price_details: annualExists || null
      },
      recommended_prices: {
        monthly: monthlyPrices.length > 0 ? monthlyPrices[0] : null,
        yearly: yearlyPrices.length > 0 ? yearlyPrices[0] : null
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Stripe prices retrieved successfully',
      analysis,
      all_prices: formattedPrices,
      subscription_prices: subscriptionPrices,
      monthly_prices: monthlyPrices,
      yearly_prices: yearlyPrices,
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('❌ Stripe price discovery error:', error)
    return NextResponse.json({
      error: 'Failed to retrieve Stripe prices',
      details: error.message,
      code: error.code,
      type: error.type
    }, { status: 500 })
  }
}

/**
 * POST endpoint to create new subscription prices if needed
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email || session.user.email !== 'grego118@gmail.com') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!stripe) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 })
    }

    const { action, productName = 'Massachusetts Retirement System Premium' } = await request.json()

    if (action === 'create_prices') {
      console.log('🔧 Creating new subscription prices...')

      // First, create or get the product
      let product
      try {
        const products = await stripe.products.list({ limit: 10 })
        product = products.data.find(p => p.name.includes('Massachusetts Retirement') || p.name.includes('Premium'))
        
        if (!product) {
          product = await stripe.products.create({
            name: productName,
            description: 'Premium subscription for Massachusetts Retirement System calculator',
            metadata: {
              app: 'massachusetts_retirement_system',
              created_by: 'api_debug_endpoint'
            }
          })
          console.log('✅ Created new product:', product.id)
        } else {
          console.log('✅ Using existing product:', product.id)
        }
      } catch (error: any) {
        console.error('❌ Product creation error:', error)
        throw error
      }

      // Create monthly price
      const monthlyPrice = await stripe.prices.create({
        product: product.id,
        unit_amount: 999, // $9.99
        currency: 'usd',
        recurring: {
          interval: 'month'
        },
        metadata: {
          plan: 'monthly',
          app: 'massachusetts_retirement_system'
        }
      })

      // Create annual price
      const annualPrice = await stripe.prices.create({
        product: product.id,
        unit_amount: 9999, // $99.99
        currency: 'usd',
        recurring: {
          interval: 'year'
        },
        metadata: {
          plan: 'annual',
          app: 'massachusetts_retirement_system'
        }
      })

      console.log('✅ Created monthly price:', monthlyPrice.id)
      console.log('✅ Created annual price:', annualPrice.id)

      return NextResponse.json({
        success: true,
        message: 'Subscription prices created successfully',
        product: {
          id: product.id,
          name: product.name
        },
        prices: {
          monthly: {
            id: monthlyPrice.id,
            amount: monthlyPrice.unit_amount,
            currency: monthlyPrice.currency
          },
          annual: {
            id: annualPrice.id,
            amount: annualPrice.unit_amount,
            currency: annualPrice.currency
          }
        },
        next_steps: [
          `Update STRIPE_MONTHLY_PRICE_ID to: ${monthlyPrice.id}`,
          `Update STRIPE_ANNUAL_PRICE_ID to: ${annualPrice.id}`,
          'Update lib/stripe/config.ts fallback values',
          'Test checkout flow'
        ]
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  } catch (error: any) {
    console.error('❌ Price creation error:', error)
    return NextResponse.json({
      error: 'Failed to create prices',
      details: error.message
    }, { status: 500 })
  }
}
