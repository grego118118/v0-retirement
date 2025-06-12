/**
 * Stripe Configuration and Types
 */

import Stripe from 'stripe'

// Initialize Stripe with secret key (only if available)
export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-12-18.acacia',
      typescript: true,
    })
  : null

// Stripe configuration
export const STRIPE_CONFIG = {
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
  successUrl: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/subscription/success`,
  cancelUrl: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/subscription/cancel`,
  customerPortalUrl: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/subscription/portal`,
}

// Subscription Plans
export const SUBSCRIPTION_PLANS = {
  monthly: {
    priceId: process.env.STRIPE_MONTHLY_PRICE_ID || 'price_monthly_placeholder',
    name: 'Premium Monthly',
    price: 9.99,
    interval: 'month' as const,
    features: [
      'Unlimited pension calculations',
      'Advanced Social Security optimization',
      'Combined retirement planning wizard',
      'Tax implications calculator',
      'Professional PDF report generation',
      'Advanced retirement planning tools',
      'Priority customer support',
      'Email notifications and alerts'
    ]
  },
  annual: {
    priceId: process.env.STRIPE_ANNUAL_PRICE_ID || 'price_annual_placeholder',
    name: 'Premium Annual',
    price: 99.99,
    interval: 'year' as const,
    monthlyEquivalent: 8.33,
    savings: 'Save $19.89 (17% off)',
    features: [
      'All monthly features included',
      'Annual savings of $19.89',
      'Extended calculation history',
      'Advanced portfolio analysis',
      'Priority feature requests',
      'Custom retirement scenarios',
      'Dedicated account support'
    ]
  }
} as const

// Free tier limitations
export const FREE_TIER_LIMITS = {
  maxSavedCalculations: 3,
  maxSocialSecurityCalculations: 1,
  maxWizardUses: 0, // No wizard access for free users
  maxPdfReports: 0,
  features: [
    'Basic pension calculator',
    'Limited calculation history',
    'Basic retirement projections',
    'Community support'
  ]
} as const

// Premium features configuration
export const PREMIUM_FEATURES = {
  social_security: {
    name: 'Social Security Calculator',
    description: 'Advanced Social Security benefit optimization with spousal benefits and COLA adjustments',
    required: true,
    freeLimit: 1,
    premiumUnlimited: true
  },
  combined_wizard: {
    name: 'Combined Calculation Wizard',
    description: 'Step-by-step guided analysis of pension and Social Security benefits with optimization',
    required: true,
    freeLimit: 0,
    premiumUnlimited: true
  },
  advanced_optimization: {
    name: 'Advanced Optimization',
    description: 'AI-powered retirement strategy optimization with Monte Carlo analysis',
    required: true,
    freeLimit: 0,
    premiumUnlimited: true
  },
  pdf_reports: {
    name: 'PDF Report Generation',
    description: 'Comprehensive retirement planning reports with detailed analysis',
    required: true,
    freeLimit: 0,
    premiumUnlimited: true
  },
  unlimited_calculations: {
    name: 'Unlimited Saved Calculations',
    description: 'Save and manage unlimited retirement calculations',
    required: false,
    freeLimit: 3,
    premiumUnlimited: true
  },
  tax_optimization: {
    name: 'Tax Optimization Strategies',
    description: 'Advanced tax planning and withdrawal strategies',
    required: true,
    freeLimit: 0,
    premiumUnlimited: true
  }
} as const

// Subscription status types
export type SubscriptionStatus = 
  | 'active'
  | 'canceled'
  | 'incomplete'
  | 'incomplete_expired'
  | 'past_due'
  | 'trialing'
  | 'unpaid'
  | 'paused'

export type SubscriptionPlan = 'monthly' | 'annual' | 'free'

export interface StripeSubscription {
  id: string
  customerId: string
  status: SubscriptionStatus
  priceId: string
  plan: SubscriptionPlan
  currentPeriodStart: Date
  currentPeriodEnd: Date
  cancelAtPeriodEnd: boolean
  trialEnd?: Date
  metadata?: Record<string, string>
}

export interface StripeCustomer {
  id: string
  email: string
  name?: string
  subscriptions: StripeSubscription[]
  defaultPaymentMethod?: string
  invoiceSettings?: {
    defaultPaymentMethod?: string
  }
}

export interface PaymentIntent {
  id: string
  amount: number
  currency: string
  status: string
  clientSecret: string
}

export interface SubscriptionUsage {
  savedCalculations: number
  socialSecurityCalculations: number
  wizardUses: number
  pdfReports: number
  lastResetDate: Date
}

export interface PremiumFeatureCheck {
  hasAccess: boolean
  isLimitReached: boolean
  currentUsage: number
  limit: number
  upgradeRequired: boolean
  feature: keyof typeof PREMIUM_FEATURES
}

// Webhook event types
export const STRIPE_WEBHOOK_EVENTS = {
  CUSTOMER_SUBSCRIPTION_CREATED: 'customer.subscription.created',
  CUSTOMER_SUBSCRIPTION_UPDATED: 'customer.subscription.updated',
  CUSTOMER_SUBSCRIPTION_DELETED: 'customer.subscription.deleted',
  INVOICE_PAYMENT_SUCCEEDED: 'invoice.payment_succeeded',
  INVOICE_PAYMENT_FAILED: 'invoice.payment_failed',
  CUSTOMER_CREATED: 'customer.created',
  CUSTOMER_UPDATED: 'customer.updated',
  PAYMENT_METHOD_ATTACHED: 'payment_method.attached',
} as const

// Error types
export class StripeError extends Error {
  constructor(
    message: string,
    public code?: string,
    public type?: string,
    public statusCode?: number
  ) {
    super(message)
    this.name = 'StripeError'
  }
}

export class SubscriptionError extends Error {
  constructor(
    message: string,
    public subscriptionId?: string,
    public customerId?: string
  ) {
    super(message)
    this.name = 'SubscriptionError'
  }
}

// Utility functions
export function getSubscriptionPlan(priceId: string): SubscriptionPlan {
  if (priceId === SUBSCRIPTION_PLANS.monthly.priceId) return 'monthly'
  if (priceId === SUBSCRIPTION_PLANS.annual.priceId) return 'annual'
  return 'free'
}

export function isSubscriptionActive(status: SubscriptionStatus): boolean {
  return ['active', 'trialing'].includes(status)
}

export function isSubscriptionCanceling(subscription: StripeSubscription): boolean {
  return subscription.cancelAtPeriodEnd && isSubscriptionActive(subscription.status)
}

export function getSubscriptionDisplayStatus(subscription: StripeSubscription): string {
  if (isSubscriptionCanceling(subscription)) {
    return `Canceling (ends ${subscription.currentPeriodEnd.toLocaleDateString()})`
  }
  
  switch (subscription.status) {
    case 'active':
      return 'Active'
    case 'trialing':
      return `Trial (ends ${subscription.trialEnd?.toLocaleDateString() || 'soon'})`
    case 'past_due':
      return 'Payment Past Due'
    case 'canceled':
      return 'Canceled'
    case 'incomplete':
      return 'Payment Required'
    case 'unpaid':
      return 'Unpaid'
    default:
      return 'Unknown'
  }
}

export function calculateProration(
  currentPlan: SubscriptionPlan,
  newPlan: SubscriptionPlan,
  daysRemaining: number
): number {
  if (currentPlan === newPlan) return 0
  
  const currentPrice = currentPlan === 'monthly' ? SUBSCRIPTION_PLANS.monthly.price : SUBSCRIPTION_PLANS.annual.price
  const newPrice = newPlan === 'monthly' ? SUBSCRIPTION_PLANS.monthly.price : SUBSCRIPTION_PLANS.annual.price
  
  const dailyCurrentRate = currentPlan === 'monthly' ? currentPrice / 30 : currentPrice / 365
  const dailyNewRate = newPlan === 'monthly' ? newPrice / 30 : newPrice / 365
  
  const refund = dailyCurrentRate * daysRemaining
  const charge = dailyNewRate * daysRemaining
  
  return Math.max(0, charge - refund)
}

// Grace period configuration
export const GRACE_PERIOD_DAYS = 3
export const TRIAL_PERIOD_DAYS = 14

export function isInGracePeriod(subscription: StripeSubscription): boolean {
  if (subscription.status !== 'past_due') return false
  
  const gracePeriodEnd = new Date(subscription.currentPeriodEnd)
  gracePeriodEnd.setDate(gracePeriodEnd.getDate() + GRACE_PERIOD_DAYS)
  
  return new Date() <= gracePeriodEnd
}
