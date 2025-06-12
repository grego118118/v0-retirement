"use client"

import { useState, useEffect, createContext, useContext, useRef } from "react"
import { useSession } from "next-auth/react"
import { logSubscription, logStateChange, logError } from "@/lib/utils/debug"

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
  const { data: session } = useSession()
  const context = useContext(SubscriptionContext)

  // If user is authenticated, always return premium access
  if (session?.user) {
    return {
      isPremium: true,
      subscriptionStatus: 'premium' as const,
      canSaveCalculations: true,
      maxSavedCalculations: Infinity,
      upgradeRequired: (feature: string) => false
    }
  }

  if (!context) {
    // Return default values when context is not available and user not authenticated
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
  const previousDataRef = useRef(subscriptionData)
  const lastCheckRef = useRef<number>(0)
  const CACHE_DURATION = 30000 // Cache for 30 seconds

  const checkSubscription = async (retryCount = 0) => {
    const now = Date.now()
    const MAX_RETRIES = 3
    const RETRY_DELAY = 1000 // 1 second

    if (!session?.user?.email) {
      const newData = {
        isPremium: false,
        subscriptionStatus: 'free' as SubscriptionStatus,
        savedCalculationsCount: 0
      }

      logStateChange('subscription', previousDataRef.current, newData)
      setSubscriptionData(newData)
      previousDataRef.current = newData
      return
    }

    // For authenticated users, always grant premium access
    const premiumData = {
      isPremium: true,
      subscriptionStatus: 'premium' as SubscriptionStatus,
      savedCalculationsCount: 0 // Not limited for premium users
    }

    if (JSON.stringify(previousDataRef.current) !== JSON.stringify(premiumData)) {
      logStateChange('subscription', previousDataRef.current, premiumData)
      setSubscriptionData(premiumData)
      previousDataRef.current = premiumData
    }
    return

    // No need for API calls - authenticated users get premium access automatically
    logSubscription('Authenticated user granted premium access automatically')
  }

  // Check subscription immediately when hook is called
  useEffect(() => {
    if (session?.user?.email) {
      checkSubscription(0) // Start with retry count 0
    }
  }, [session?.user?.email])

  useEffect(() => {
    // Listen for subscription updates
    const handleSubscriptionUpdate = () => {
      logSubscription('Subscription update event received')
      // Reset cache to force fresh check
      lastCheckRef.current = 0
      checkSubscription(0) // Start with retry count 0
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('subscription-updated', handleSubscriptionUpdate)

      return () => {
        window.removeEventListener('subscription-updated', handleSubscriptionUpdate)
      }
    }
  }, [session])

  const maxSavedCalculations = (session?.user || subscriptionData.isPremium) ? Infinity : 3
  const canSaveCalculations = (session?.user || subscriptionData.isPremium) || subscriptionData.savedCalculationsCount < maxSavedCalculations

  // Memoize upgrade check to reduce logging
  const upgradeRequiredRef = useRef<Map<string, boolean>>(new Map())

  const upgradeRequired = (feature: string): boolean => {
    // Authenticated users never need to upgrade
    if (session?.user) {
      return false
    }

    const cached = upgradeRequiredRef.current.get(feature)
    const isUpgradeRequired = !subscriptionData.isPremium && [
      'unlimited_saves',
      'pdf_export',
      'excel_export',
      'advanced_scenarios',
      'comparison_tools',
      'social_security',
      '401k_integration'
    ].includes(feature)

    // Only log if result changed
    if (cached !== isUpgradeRequired) {
      logSubscription(`Upgrade requirement changed for ${feature}`, {
        isPremium: subscriptionData.isPremium,
        required: isUpgradeRequired
      })
      upgradeRequiredRef.current.set(feature, isUpgradeRequired)
    }

    return isUpgradeRequired
  }

  const finalResult = {
    ...subscriptionData,
    canSaveCalculations,
    maxSavedCalculations,
    upgradeRequired,
    refreshStatus: () => checkSubscription(0) // Reset retry count when manually refreshing
  }

  return finalResult
} 