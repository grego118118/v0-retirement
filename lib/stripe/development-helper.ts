/**
 * Stripe Development Helper
 * Utilities for development and testing without full Stripe setup
 */

export interface MockStripeCustomer {
  id: string
  email: string
  name?: string
  subscriptions: MockStripeSubscription[]
  defaultPaymentMethod?: string
}

export interface MockStripeSubscription {
  id: string
  customerId: string
  status: 'active' | 'canceled' | 'past_due' | 'trialing'
  priceId: string
  plan: 'monthly' | 'annual' | 'free'
  currentPeriodStart: Date
  currentPeriodEnd: Date
  cancelAtPeriodEnd: boolean
  trialEnd?: Date
  metadata?: Record<string, string>
}

export interface MockInvoice {
  id: string
  number: string
  status: 'paid' | 'open' | 'draft'
  amountPaid: number
  amountDue: number
  currency: string
  created: Date
  dueDate: Date | null
  pdfUrl: string
  hostedUrl: string
}

/**
 * Check if Stripe is properly configured
 */
export function isStripeConfigured(): boolean {
  return !!(
    process.env.STRIPE_SECRET_KEY &&
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  )
}

/**
 * Get Stripe configuration status
 */
export function getStripeConfigStatus() {
  const hasSecretKey = !!process.env.STRIPE_SECRET_KEY
  const hasPublishableKey = !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  const hasWebhookSecret = !!process.env.STRIPE_WEBHOOK_SECRET
  const hasMonthlyPriceId = !!process.env.STRIPE_MONTHLY_PRICE_ID
  const hasAnnualPriceId = !!process.env.STRIPE_ANNUAL_PRICE_ID

  return {
    isFullyConfigured: hasSecretKey && hasPublishableKey,
    hasSecretKey,
    hasPublishableKey,
    hasWebhookSecret,
    hasMonthlyPriceId,
    hasAnnualPriceId,
    isTestMode: process.env.STRIPE_SECRET_KEY?.startsWith('sk_test_'),
    missingVariables: [
      !hasSecretKey && 'STRIPE_SECRET_KEY',
      !hasPublishableKey && 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
      !hasWebhookSecret && 'STRIPE_WEBHOOK_SECRET',
      !hasMonthlyPriceId && 'STRIPE_MONTHLY_PRICE_ID',
      !hasAnnualPriceId && 'STRIPE_ANNUAL_PRICE_ID',
    ].filter(Boolean)
  }
}

/**
 * Create mock customer data for development
 */
export function createMockCustomer(email: string, name?: string): MockStripeCustomer {
  const customerId = `cus_mock_${Math.random().toString(36).substr(2, 9)}`
  
  return {
    id: customerId,
    email,
    name,
    subscriptions: [],
    defaultPaymentMethod: 'pm_mock_card_visa'
  }
}

/**
 * Create mock subscription for development
 */
export function createMockSubscription(
  customerId: string,
  plan: 'monthly' | 'annual' = 'monthly'
): MockStripeSubscription {
  const subscriptionId = `sub_mock_${Math.random().toString(36).substr(2, 9)}`
  const now = new Date()
  const periodEnd = new Date(now)
  
  if (plan === 'monthly') {
    periodEnd.setMonth(periodEnd.getMonth() + 1)
  } else {
    periodEnd.setFullYear(periodEnd.getFullYear() + 1)
  }

  return {
    id: subscriptionId,
    customerId,
    status: 'active',
    priceId: plan === 'monthly' ? 'price_mock_monthly' : 'price_mock_annual',
    plan,
    currentPeriodStart: now,
    currentPeriodEnd: periodEnd,
    cancelAtPeriodEnd: false,
    metadata: {
      environment: 'development',
      mock: 'true'
    }
  }
}

/**
 * Create mock invoices for development
 */
export function createMockInvoices(customerId: string, count = 3): MockInvoice[] {
  const invoices: MockInvoice[] = []
  
  for (let i = 0; i < count; i++) {
    const created = new Date()
    created.setMonth(created.getMonth() - i)
    
    const dueDate = new Date(created)
    dueDate.setDate(dueDate.getDate() + 7)
    
    invoices.push({
      id: `in_mock_${Math.random().toString(36).substr(2, 9)}`,
      number: `INV-${String(Date.now() - i * 86400000).slice(-6)}`,
      status: 'paid',
      amountPaid: 1999, // $19.99
      amountDue: 0,
      currency: 'usd',
      created,
      dueDate,
      pdfUrl: `https://mock-stripe.com/invoices/invoice_${i}.pdf`,
      hostedUrl: `https://mock-stripe.com/invoices/hosted_${i}`
    })
  }
  
  return invoices
}

/**
 * Development-only mock portal URL
 */
export function createMockPortalUrl(customerId: string): string {
  return `/development/stripe-portal?customer=${customerId}&mock=true`
}

/**
 * Log Stripe configuration status for debugging
 */
export function logStripeStatus() {
  const status = getStripeConfigStatus()
  
  console.log('🔧 Stripe Configuration Status:')
  console.log(`   Fully Configured: ${status.isFullyConfigured ? '✅' : '❌'}`)
  console.log(`   Test Mode: ${status.isTestMode ? '✅' : '❌'}`)
  
  if (status.missingVariables.length > 0) {
    console.log('   Missing Variables:')
    status.missingVariables.forEach(variable => {
      console.log(`     - ${variable}`)
    })
    console.log('   💡 See DEVELOPMENT_SETUP.md for configuration help')
  }
  
  if (!status.isFullyConfigured) {
    console.log('   ⚠️  Stripe features will be disabled')
    console.log('   📝 Add Stripe keys to .env.local to enable premium features')
  }
}

/**
 * Development error handler for Stripe operations
 */
export function handleStripeDevError(error: any, operation: string) {
  if (!isStripeConfigured()) {
    console.warn(`🔧 Stripe ${operation} skipped - not configured for development`)
    return {
      success: false,
      error: 'Stripe not configured',
      message: 'Add Stripe keys to .env.local to enable this feature',
      redirectTo: '/pricing'
    }
  }
  
  console.error(`❌ Stripe ${operation} failed:`, error.message)
  return {
    success: false,
    error: error.message,
    type: error.type || 'stripe_error'
  }
}

/**
 * Initialize development helpers
 */
export function initializeStripeDevelopment() {
  if (process.env.NODE_ENV === 'development') {
    logStripeStatus()
    
    // Add helpful development endpoints
    if (typeof window !== 'undefined') {
      (window as any).stripeDevHelper = {
        getStatus: getStripeConfigStatus,
        createMockCustomer,
        createMockSubscription,
        createMockInvoices,
        isConfigured: isStripeConfigured
      }
      
      console.log('🛠️  Stripe dev helper available at window.stripeDevHelper')
    }
  }
}
