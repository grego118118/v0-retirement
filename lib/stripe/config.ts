/**
 * Stripe Configuration and Types
 */

import Stripe from 'stripe'

// Initialize Stripe with secret key (only if available)
export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-05-28.basil',
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
    // Use the actual price ID from Stripe Dashboard
    priceId: process.env.STRIPE_MONTHLY_PRICE_ID || 'price_1RUqM6QBHWl7jXHEuGpE9jcX',
    name: 'Premium Monthly',
    price: 9.99,
    interval: 'month' as const,
    features: [
      'Unlimited pension calculations',
      'Advanced Social Security optimization',
      'Combined retirement planning wizard',
      'Tax optimization strategies',
      'Monte Carlo risk analysis',
      'PDF report generation',
      'Priority customer support',
      'Early access to new features'
    ]
  },
  annual: {
    // Use the actual price ID from Stripe Dashboard
    priceId: process.env.STRIPE_ANNUAL_PRICE_ID || 'price_1RZkNFQBHWl7jXHELKksQgBY',
    name: 'Premium Annual',
    price: 99.99,
    interval: 'year' as const,
    savings: 'Save $19.89 (17% off)',
    features: [
      'All monthly features included',
      'Annual savings of $19.89',
      'Extended calculation history',
      'Advanced portfolio analysis',
      'Dedicated account manager',
      'Custom retirement scenarios',
      'Priority feature requests'
    ]
  }
} as const

// Free tier limitations (defined first to avoid hoisting issues)
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

// Premium features configuration (defined before USER_TYPES)
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

// Subscription types for hybrid model
export type UserSubscriptionType =
  | 'oauth_free'        // New OAuth users with free tier
  | 'oauth_premium'     // Existing OAuth users with grandfathered premium
  | 'stripe_monthly'    // Paid monthly subscription
  | 'stripe_annual'     // Paid annual subscription

// User type configuration (now all dependencies are defined above)
export const USER_TYPES = {
  oauth_free: {
    name: 'Free Account',
    description: 'Basic retirement planning tools',
    isPremium: false,
    billingType: 'oauth_authentication',
    features: FREE_TIER_LIMITS.features,
    limits: FREE_TIER_LIMITS
  },
  oauth_premium: {
    name: 'Google OAuth Premium (Legacy)',
    description: 'Grandfathered premium access via Google authentication',
    isPremium: true,
    billingType: 'oauth_authentication',
    features: Object.values(PREMIUM_FEATURES).map(f => f.name),
    limits: null // No limits for grandfathered users
  },
  stripe_monthly: {
    name: 'Premium Monthly',
    description: 'Full premium features with monthly billing',
    isPremium: true,
    billingType: 'stripe_subscription',
    features: SUBSCRIPTION_PLANS.monthly.features,
    limits: null // No limits for paid users
  },
  stripe_annual: {
    name: 'Premium Annual',
    description: 'Full premium features with annual billing',
    isPremium: true,
    billingType: 'stripe_subscription',
    features: SUBSCRIPTION_PLANS.annual.features,
    limits: null // No limits for paid users
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

// Helper functions for hybrid subscription model
export function getUserSubscriptionType(user: {
  subscriptionPlan?: string | null
  stripeCustomerId?: string | null
  subscriptionStatus?: string | null
  createdAt?: Date | string
}): UserSubscriptionType {
  // If user has active subscription (either Stripe or demo)
  if (user.subscriptionStatus === 'active' && user.subscriptionPlan) {
    // Check if it's a real Stripe subscription (customer ID starts with 'cus_')
    if (user.stripeCustomerId && user.stripeCustomerId.startsWith('cus_')) {
      if (user.subscriptionPlan === 'monthly') return 'stripe_monthly'
      if (user.subscriptionPlan === 'annual') return 'stripe_annual'
    }

    // Handle demo subscriptions (customer ID starts with 'demo_' or no customer ID)
    if (!user.stripeCustomerId || user.stripeCustomerId.startsWith('demo_')) {
      if (user.subscriptionPlan === 'monthly') return 'stripe_monthly'
      if (user.subscriptionPlan === 'annual') return 'stripe_annual'
    }

    // Fallback for any other active subscription with customer ID
    if (user.stripeCustomerId) {
      if (user.subscriptionPlan === 'monthly') return 'stripe_monthly'
      if (user.subscriptionPlan === 'annual') return 'stripe_annual'
    }
  }

  // Check if user is grandfathered OAuth premium (created before hybrid model launch)
  // For now, we'll consider all existing users as grandfathered
  // In production, you'd check against a specific date
  const hybridModelLaunchDate = new Date('2026-01-01') // Adjust this date - set to future to grandfather current users
  const userCreatedAt = typeof user.createdAt === 'string' ? new Date(user.createdAt) : user.createdAt

  if (userCreatedAt && userCreatedAt < hybridModelLaunchDate) {
    return 'oauth_premium' // Grandfathered premium access
  }

  // New users default to free tier
  return 'oauth_free'
}

export function isUserPremium(userType: UserSubscriptionType): boolean {
  return USER_TYPES[userType].isPremium
}

export function getUserLimits(userType: UserSubscriptionType) {
  return USER_TYPES[userType].limits
}

export function getUserFeatures(userType: UserSubscriptionType): string[] {
  return [...USER_TYPES[userType].features]
}

export function canAccessFeature(
  userType: UserSubscriptionType,
  feature: keyof typeof PREMIUM_FEATURES,
  currentUsage: number = 0
): PremiumFeatureCheck {
  const isPremium = isUserPremium(userType)
  const featureConfig = PREMIUM_FEATURES[feature]

  if (isPremium) {
    return {
      hasAccess: true,
      isLimitReached: false,
      currentUsage,
      limit: -1, // Unlimited
      upgradeRequired: false,
      feature
    }
  }

  // Free tier checks
  const limit = featureConfig.freeLimit
  const hasAccess = !featureConfig.required || currentUsage < limit
  const isLimitReached = currentUsage >= limit

  return {
    hasAccess,
    isLimitReached,
    currentUsage,
    limit,
    upgradeRequired: !hasAccess,
    feature
  }
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
