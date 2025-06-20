/**
 * Stripe Service Layer
 * Handles all Stripe API interactions
 */

import { stripe, STRIPE_CONFIG, SUBSCRIPTION_PLANS, getSubscriptionPlan, StripeError } from './config'
import type { StripeSubscription, StripeCustomer, SubscriptionPlan } from './config'

export class StripeService {
  /**
   * Create or retrieve a Stripe customer
   */
  static async createOrGetCustomer(email: string, name?: string): Promise<string> {
    if (!stripe) {
      throw new StripeError('Stripe is not configured. Please add STRIPE_SECRET_KEY to environment variables.')
    }

    try {
      // First, try to find existing customer
      const existingCustomers = await stripe.customers.list({
        email,
        limit: 1,
      })

      if (existingCustomers.data.length > 0) {
        return existingCustomers.data[0].id
      }

      // Create new customer
      const customer = await stripe.customers.create({
        email,
        name,
        metadata: {
          source: 'massachusetts_pension_estimator',
          created_at: new Date().toISOString(),
        },
      })

      return customer.id
    } catch (error: any) {
      throw new StripeError(
        `Failed to create or retrieve customer: ${error.message}`,
        error.code,
        error.type
      )
    }
  }

  /**
   * Create a checkout session for subscription
   */
  static async createCheckoutSession(
    customerId: string,
    priceId: string,
    userEmail: string,
    successUrl?: string,
    cancelUrl?: string
  ): Promise<string> {
    if (!stripe) {
      throw new StripeError('Stripe is not configured. Please add STRIPE_SECRET_KEY to environment variables.')
    }

    try {
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: successUrl || STRIPE_CONFIG.successUrl,
        cancel_url: cancelUrl || STRIPE_CONFIG.cancelUrl,
        allow_promotion_codes: true,
        billing_address_collection: 'auto',
        customer_update: {
          address: 'auto',
          name: 'auto',
        },
        metadata: {
          user_email: userEmail,
          plan: getSubscriptionPlan(priceId),
        },
        subscription_data: {
          metadata: {
            user_email: userEmail,
            plan: getSubscriptionPlan(priceId),
          },
        },
      })

      if (!session.url) {
        throw new StripeError('Failed to create checkout session URL')
      }

      return session.url
    } catch (error: any) {
      throw new StripeError(
        `Failed to create checkout session: ${error.message}`,
        error.code,
        error.type
      )
    }
  }

  /**
   * Create customer portal session
   */
  static async createPortalSession(customerId: string): Promise<string> {
    if (!stripe) {
      throw new StripeError('Stripe is not configured. Please add STRIPE_SECRET_KEY to environment variables.')
    }

    try {
      const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: STRIPE_CONFIG.customerPortalUrl,
      })

      return session.url
    } catch (error: any) {
      throw new StripeError(
        `Failed to create portal session: ${error.message}`,
        error.code,
        error.type
      )
    }
  }

  /**
   * Get customer with subscriptions
   */
  static async getCustomerWithSubscriptions(customerId: string): Promise<StripeCustomer | null> {
    try {
      if (!stripe) throw new Error('Stripe not initialized')
      const customer = await stripe.customers.retrieve(customerId, {
        expand: ['subscriptions', 'invoice_settings.default_payment_method'],
      })

      if (customer.deleted) {
        return null
      }

      const subscriptions: StripeSubscription[] = customer.subscriptions?.data.map(sub => ({
        id: sub.id,
        customerId: customer.id,
        status: sub.status,
        priceId: sub.items.data[0]?.price.id || '',
        plan: getSubscriptionPlan(sub.items.data[0]?.price.id || ''),
        currentPeriodStart: new Date((sub as any).current_period_start * 1000),
        currentPeriodEnd: new Date((sub as any).current_period_end * 1000),
        cancelAtPeriodEnd: sub.cancel_at_period_end,
        trialEnd: sub.trial_end ? new Date(sub.trial_end * 1000) : undefined,
        metadata: sub.metadata,
      })) || []

      return {
        id: customer.id,
        email: customer.email || '',
        name: customer.name || undefined,
        subscriptions,
        defaultPaymentMethod: customer.invoice_settings?.default_payment_method as string || undefined,
      }
    } catch (error: any) {
      if (error.code === 'resource_missing') {
        return null
      }
      throw new StripeError(
        `Failed to retrieve customer: ${error.message}`,
        error.code,
        error.type
      )
    }
  }

  /**
   * Get subscription by ID
   */
  static async getSubscription(subscriptionId: string): Promise<StripeSubscription | null> {
    try {
      if (!stripe) throw new Error('Stripe not initialized')
      const subscription = await stripe.subscriptions.retrieve(subscriptionId)

      return {
        id: subscription.id,
        customerId: subscription.customer as string,
        status: subscription.status,
        priceId: subscription.items.data[0]?.price.id || '',
        plan: getSubscriptionPlan(subscription.items.data[0]?.price.id || ''),
        currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
        currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : undefined,
        metadata: subscription.metadata,
      }
    } catch (error: any) {
      if (error.code === 'resource_missing') {
        return null
      }
      throw new StripeError(
        `Failed to retrieve subscription: ${error.message}`,
        error.code,
        error.type
      )
    }
  }

  /**
   * Cancel subscription
   */
  static async cancelSubscription(subscriptionId: string, immediately = false): Promise<StripeSubscription> {
    try {
      const subscription = immediately
        ? await stripe!.subscriptions.cancel(subscriptionId)
        : await stripe!.subscriptions.update(subscriptionId, {
            cancel_at_period_end: true,
          })

      return {
        id: subscription.id,
        customerId: subscription.customer as string,
        status: subscription.status,
        priceId: subscription.items.data[0]?.price.id || '',
        plan: getSubscriptionPlan(subscription.items.data[0]?.price.id || ''),
        currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
        currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : undefined,
        metadata: subscription.metadata,
      }
    } catch (error: any) {
      throw new StripeError(
        `Failed to cancel subscription: ${error.message}`,
        error.code,
        error.type
      )
    }
  }

  /**
   * Reactivate subscription
   */
  static async reactivateSubscription(subscriptionId: string): Promise<StripeSubscription> {
    try {
      if (!stripe) throw new Error('Stripe not initialized')
      const subscription = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: false,
      })

      return {
        id: subscription.id,
        customerId: subscription.customer as string,
        status: subscription.status,
        priceId: subscription.items.data[0]?.price.id || '',
        plan: getSubscriptionPlan(subscription.items.data[0]?.price.id || ''),
        currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
        currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : undefined,
        metadata: subscription.metadata,
      }
    } catch (error: any) {
      throw new StripeError(
        `Failed to reactivate subscription: ${error.message}`,
        error.code,
        error.type
      )
    }
  }

  /**
   * Update subscription plan
   */
  static async updateSubscriptionPlan(
    subscriptionId: string,
    newPriceId: string
  ): Promise<StripeSubscription> {
    try {
      if (!stripe) throw new Error('Stripe not initialized')
      const subscription = await stripe.subscriptions.retrieve(subscriptionId)

      const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
        items: [
          {
            id: subscription.items.data[0].id,
            price: newPriceId,
          },
        ],
        proration_behavior: 'create_prorations',
      })

      return {
        id: updatedSubscription.id,
        customerId: updatedSubscription.customer as string,
        status: updatedSubscription.status,
        priceId: updatedSubscription.items.data[0]?.price.id || '',
        plan: getSubscriptionPlan(updatedSubscription.items.data[0]?.price.id || ''),
        currentPeriodStart: new Date((updatedSubscription as any).current_period_start * 1000),
        currentPeriodEnd: new Date((updatedSubscription as any).current_period_end * 1000),
        cancelAtPeriodEnd: updatedSubscription.cancel_at_period_end,
        trialEnd: updatedSubscription.trial_end ? new Date(updatedSubscription.trial_end * 1000) : undefined,
        metadata: updatedSubscription.metadata,
      }
    } catch (error: any) {
      throw new StripeError(
        `Failed to update subscription plan: ${error.message}`,
        error.code,
        error.type
      )
    }
  }

  /**
   * Get upcoming invoice for subscription changes
   */
  static async getUpcomingInvoice(customerId: string, subscriptionId?: string, newPriceId?: string) {
    try {
      const params: any = {
        customer: customerId,
      }

      if (subscriptionId && newPriceId) {
        const subscription = await stripe!.subscriptions.retrieve(subscriptionId)
        params.subscription = subscriptionId
        params.subscription_items = [
          {
            id: subscription.items.data[0].id,
            price: newPriceId,
          },
        ]
      }

      if (!stripe) throw new Error('Stripe not initialized')
      const invoice = await (stripe.invoices as any).retrieveUpcoming(params)
      
      return {
        amountDue: invoice.amount_due / 100, // Convert from cents
        currency: invoice.currency,
        periodStart: new Date(invoice.period_start * 1000),
        periodEnd: new Date(invoice.period_end * 1000),
        lines: invoice.lines.data.map((line: any) => ({
          description: line.description,
          amount: line.amount / 100,
          period: {
            start: new Date(line.period.start * 1000),
            end: new Date(line.period.end * 1000),
          },
        })),
      }
    } catch (error: any) {
      throw new StripeError(
        `Failed to retrieve upcoming invoice: ${error.message}`,
        error.code,
        error.type
      )
    }
  }

  /**
   * List customer invoices
   */
  static async getCustomerInvoices(customerId: string, limit = 10) {
    try {
      if (!stripe) throw new Error('Stripe not initialized')
      const invoices = await stripe.invoices.list({
        customer: customerId,
        limit,
      })

      return invoices.data.map(invoice => ({
        id: invoice.id,
        number: invoice.number,
        status: invoice.status,
        amountPaid: invoice.amount_paid / 100,
        amountDue: invoice.amount_due / 100,
        currency: invoice.currency,
        created: new Date(invoice.created * 1000),
        dueDate: invoice.due_date ? new Date(invoice.due_date * 1000) : null,
        pdfUrl: invoice.invoice_pdf,
        hostedUrl: invoice.hosted_invoice_url,
      }))
    } catch (error: any) {
      throw new StripeError(
        `Failed to retrieve customer invoices: ${error.message}`,
        error.code,
        error.type
      )
    }
  }
}
