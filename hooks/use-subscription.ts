"use client"

import { useState, useEffect, createContext, useContext } from "react"
import { useSession } from "next-auth/react"

type SubscriptionStatus = 'free' | 'premium' | 'loading'

interface SubscriptionContextType {
  isPremium: boolean
  subscriptionStatus: SubscriptionStatus
  canSaveCalculations: boolean
  maxSavedCalculations: number
  upgradeRequired: (feature: string) => boolean
}

const SubscriptionContext = createContext<SubscriptionContextType | null>(null)

export function useSubscription() {
  const context = useContext(SubscriptionContext)
  if (!context) {
    // Return default values when context is not available
    return {
      isPremium: false,
      subscriptionStatus: 'free' as const,
      canSaveCalculations: true,
      maxSavedCalculations: 3,
      upgradeRequired: (feature: string) => false
    }
  }
  return context
}

export function useSubscriptionStatus() {
  const { data: session } = useSession()
  const [subscriptionData, setSubscriptionData] = useState({
    isPremium: false,
    subscriptionStatus: 'loading' as SubscriptionStatus,
    savedCalculationsCount: 0
  })

  const checkSubscription = async (forceRefresh = false) => {
    if (!session?.user?.email) {
      if (process.env.NODE_ENV === 'development') {
        console.log('useSubscriptionStatus: No session or email')
      }
      setSubscriptionData({
        isPremium: false,
        subscriptionStatus: 'free',
        savedCalculationsCount: 0
      })
      return
    }

    // Enhanced logging for debugging (development only)
    if (process.env.NODE_ENV === 'development' || forceRefresh) {
      console.log(`🔍 useSubscriptionStatus: Checking subscription for: ${session.user.email}${forceRefresh ? ' (FORCE REFRESH)' : ''}`)
    }

    try {
      // Call the subscription status API with timestamp to prevent caching
      const response = await fetch(`/api/subscription/status?t=${Date.now()}&force=${forceRefresh}`, {
        cache: 'no-store', // Ensure we don't get cached response
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
        }
      })

      if (process.env.NODE_ENV === 'development' || forceRefresh) {
        console.log(`📡 Subscription API response: ${response.status} ${response.statusText}`)
      }

      if (response.ok) {
        const data = await response.json()

        if (process.env.NODE_ENV === 'development' || forceRefresh) {
          console.log('📊 Subscription API data:', data)
        }

        const newSubscriptionData = {
          isPremium: Boolean(data.isPremium), // Ensure it's a proper boolean
          subscriptionStatus: (data.isPremium ? 'premium' : 'free') as SubscriptionStatus,
          savedCalculationsCount: data.savedCalculationsCount || 0
        }

        if (process.env.NODE_ENV === 'development' || forceRefresh) {
          console.log('✅ Setting subscription data:', newSubscriptionData)
        }
        setSubscriptionData(newSubscriptionData)

        // Trigger a custom event for other components to listen to
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('subscription-status-updated', {
            detail: newSubscriptionData
          }))
        }
      } else {
        // Default to free if API fails
        if (process.env.NODE_ENV === 'development') {
          console.log(`❌ useSubscriptionStatus: API response not ok (${response.status}), defaulting to free`)
        }
        setSubscriptionData({
          isPremium: false,
          subscriptionStatus: 'free',
          savedCalculationsCount: 0
        })
      }
    } catch (error) {
      console.error('❌ useSubscriptionStatus: Error checking subscription:', error)
      setSubscriptionData({
        isPremium: false,
        subscriptionStatus: 'free',
        savedCalculationsCount: 0
      })
    }
  }

  // Check subscription immediately when hook is called
  useEffect(() => {
    if (session?.user?.email) {
      checkSubscription()
    }
  }, [session?.user?.id]) // Use user ID instead of email to prevent unnecessary re-renders

  useEffect(() => {
    // Listen for subscription updates
    const handleSubscriptionUpdate = () => {
      console.log('Subscription status update triggered')
      checkSubscription()
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('subscription-updated', handleSubscriptionUpdate)
      
      return () => {
        window.removeEventListener('subscription-updated', handleSubscriptionUpdate)
      }
    }
  }, [session])

  const maxSavedCalculations = subscriptionData.isPremium ? Infinity : 3
  const canSaveCalculations = subscriptionData.isPremium || subscriptionData.savedCalculationsCount < maxSavedCalculations

  const upgradeRequired = (feature: string): boolean => {
    const isUpgradeRequired = !subscriptionData.isPremium && [
      'unlimited_saves',
      'pdf_export', 
      'excel_export',
      'advanced_scenarios',
      'comparison_tools',
      'social_security',
      '401k_integration'
    ].includes(feature)
    
    console.log(`upgradeRequired(${feature}): isPremium=${subscriptionData.isPremium}, required=${isUpgradeRequired}`)
    return isUpgradeRequired
  }

  const finalResult = {
    ...subscriptionData,
    canSaveCalculations,
    maxSavedCalculations,
    upgradeRequired,
    // Add a manual refresh function with force option
    refreshStatus: (force = true) => checkSubscription(force)
  }

  // Only log in development mode and reduce frequency
  if (process.env.NODE_ENV === 'development' && Math.random() < 0.1) {
    console.log('useSubscriptionStatus: Status check result:', {
      isPremium: finalResult.isPremium,
      status: finalResult.subscriptionStatus,
      calculationsCount: finalResult.savedCalculationsCount
    })
  }

  return finalResult
} 