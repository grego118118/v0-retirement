/**
 * Subscription Status Refresh Utilities
 * Handles subscription status synchronization across the application
 */

export interface SubscriptionStatusData {
  isPremium: boolean
  subscriptionStatus: 'free' | 'premium' | 'loading'
  savedCalculationsCount: number
}

/**
 * Trigger a global subscription status refresh
 * This should be called after successful payment completion
 */
export function triggerSubscriptionRefresh(delay = 1000) {
  console.log('🔄 Triggering global subscription status refresh...')
  
  // Add a small delay to allow webhook processing
  setTimeout(() => {
    if (typeof window !== 'undefined') {
      // Dispatch custom event that subscription hooks listen to
      window.dispatchEvent(new CustomEvent('subscription-updated'))
      
      // Also dispatch a more specific event with timestamp
      window.dispatchEvent(new CustomEvent('force-subscription-refresh', {
        detail: { timestamp: Date.now() }
      }))
      
      console.log('✅ Subscription refresh events dispatched')
    }
  }, delay)
}

/**
 * Force refresh subscription status with retry logic
 */
export async function forceRefreshSubscriptionStatus(maxRetries = 3): Promise<SubscriptionStatusData | null> {
  console.log('🔄 Force refreshing subscription status...')
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`📡 Attempt ${attempt}/${maxRetries}: Fetching subscription status`)
      
      const response = await fetch(`/api/subscription/status?t=${Date.now()}&force=true`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
        }
      })

      if (response.ok) {
        const data = await response.json()
        console.log('✅ Subscription status fetched:', data)
        
        const subscriptionData: SubscriptionStatusData = {
          isPremium: Boolean(data.isPremium),
          subscriptionStatus: data.isPremium ? 'premium' : 'free',
          savedCalculationsCount: data.savedCalculationsCount || 0
        }
        
        // Trigger global refresh event
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('subscription-status-updated', {
            detail: subscriptionData
          }))
        }
        
        return subscriptionData
      } else {
        console.log(`❌ Attempt ${attempt} failed: ${response.status} ${response.statusText}`)
        
        if (attempt < maxRetries) {
          // Wait before retrying (exponential backoff)
          const delay = Math.pow(2, attempt) * 1000
          console.log(`⏳ Waiting ${delay}ms before retry...`)
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }
    } catch (error) {
      console.error(`❌ Attempt ${attempt} error:`, error)
      
      if (attempt < maxRetries) {
        // Wait before retrying
        const delay = Math.pow(2, attempt) * 1000
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }
  
  console.error('❌ All subscription status refresh attempts failed')
  return null
}

/**
 * Check if user should be premium based on email
 * This is a temporary helper for debugging
 */
export function shouldBePremium(email: string): boolean {
  const premiumEmails = [
    'grego118@gmail.com', // Your email
    // Add other premium emails here
  ]
  
  return premiumEmails.includes(email.toLowerCase())
}

/**
 * Debug subscription status for a specific user
 */
export async function debugSubscriptionStatus(email: string) {
  console.log('🔍 Debugging subscription status for:', email)
  console.log('📋 Should be premium:', shouldBePremium(email))
  
  try {
    const response = await fetch(`/api/debug/stripe?t=${Date.now()}`)
    if (response.ok) {
      const debugData = await response.json()
      console.log('🛠️ Stripe debug data:', debugData)
    }
  } catch (error) {
    console.error('❌ Failed to fetch debug data:', error)
  }
  
  // Try to refresh status
  const statusData = await forceRefreshSubscriptionStatus()
  console.log('📊 Final status data:', statusData)
  
  return statusData
}

/**
 * Setup subscription status listeners
 * Call this in your app initialization
 */
export function setupSubscriptionListeners() {
  if (typeof window === 'undefined') return
  
  // Listen for payment success events
  window.addEventListener('stripe-payment-success', () => {
    console.log('💳 Stripe payment success detected, refreshing subscription...')
    triggerSubscriptionRefresh(2000) // Wait 2 seconds for webhook processing
  })
  
  // Listen for manual refresh requests
  window.addEventListener('manual-subscription-refresh', () => {
    console.log('🔄 Manual subscription refresh requested')
    triggerSubscriptionRefresh(0) // Immediate refresh
  })
  
  console.log('👂 Subscription status listeners setup complete')
}
