"use client"

import { useEffect, useState } from "react"
import { useSubscriptionStatus } from "@/hooks/use-subscription"
import { getAdSenseManager } from "@/lib/adsense-manager"

/**
 * AdSense Initializer - Uses centralized AdSense Manager
 *
 * This component initializes AdSense using the singleton manager
 * to prevent duplicate Auto Ads initialization and conflicts.
 */
export function AdSenseInitializer() {
  const [isClient, setIsClient] = useState(false)
  const { isPremium, subscriptionStatus } = useSubscriptionStatus()

  useEffect(() => {
    // Set client flag to prevent hydration mismatch
    setIsClient(true)
  }, [])

  useEffect(() => {
    // Only run on client side after hydration
    if (!isClient || typeof window === 'undefined') return

    // Initialize AdSense using centralized manager
    const initializeAdSense = async () => {
      try {
        const manager = getAdSenseManager()

        // Update manager configuration
        manager.updateConfig({
          isPremium: isPremium && subscriptionStatus !== 'loading',
          isDevelopment: process.env.NODE_ENV === 'development'
        })

        // Initialize AdSense (manager handles duplicate prevention)
        await manager.initialize({
          enableAutoAds: true,
          enableManualAds: true
        })

        console.log('AdSenseInitializer: Initialization completed via manager')
      } catch (error) {
        console.error('AdSenseInitializer: Initialization failed:', error)
      }
    }

    initializeAdSense()
  }, [isClient, isPremium, subscriptionStatus])

  return null
}
