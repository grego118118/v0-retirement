"use client"

import { useEffect } from 'react'
import { setupSubscriptionListeners } from '@/lib/subscription-refresh'

/**
 * Subscription Listener Component
 * Sets up global subscription status event listeners
 */
export function SubscriptionListener() {
  useEffect(() => {
    // Setup subscription listeners on app initialization
    setupSubscriptionListeners()
    
    // Listen for successful Stripe payments
    const handleStripeSuccess = (event: CustomEvent) => {
      console.log('💳 Stripe payment success detected in layout')
      // Trigger subscription refresh after payment
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('subscription-updated'))
        }
      }, 2000) // Wait 2 seconds for webhook processing
    }

    // Listen for manual refresh requests
    const handleManualRefresh = () => {
      console.log('🔄 Manual subscription refresh requested in layout')
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('subscription-updated'))
      }
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('stripe-payment-success', handleStripeSuccess as EventListener)
      window.addEventListener('manual-subscription-refresh', handleManualRefresh)
      
      return () => {
        window.removeEventListener('stripe-payment-success', handleStripeSuccess as EventListener)
        window.removeEventListener('manual-subscription-refresh', handleManualRefresh)
      }
    }
  }, [])

  return null // This component doesn't render anything
}

export default SubscriptionListener
