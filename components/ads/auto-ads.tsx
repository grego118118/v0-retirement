"use client"

import { useEffect, useState } from "react"
import { useSubscriptionStatus } from "@/hooks/use-subscription"

declare global {
  interface Window {
    adsbygoogle: any[]
  }
}

/**
 * Google AdSense Auto Ads Component
 * 
 * This component enables Google AdSense Auto Ads, which automatically
 * place ads on the page without requiring specific ad unit IDs.
 * This is ideal for getting ads running quickly while waiting for
 * manual ad units to be created and approved.
 */
export function AutoAds() {
  const { isPremium, subscriptionStatus } = useSubscriptionStatus()
  const [isClient, setIsClient] = useState(false)
  const [autoAdsEnabled, setAutoAdsEnabled] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    // Only run on client side after hydration
    if (!isClient || typeof window === 'undefined') return

    // Don't enable for premium users
    if (isPremium && subscriptionStatus !== 'loading') {
      console.log('AutoAds: Skipping for premium user')
      return
    }

    // Don't enable in development
    if (process.env.NODE_ENV === 'development') {
      console.log('AutoAds: Skipping in development')
      return
    }

    // Don't enable if already enabled
    if (autoAdsEnabled) {
      return
    }

    // Use centralized manager to enable Auto Ads
    const enableAutoAds = async () => {
      try {
        const { getAdSenseManager } = await import('@/lib/adsense-manager')
        const manager = getAdSenseManager()

        // Update manager configuration
        manager.updateConfig({
          isPremium: isPremium && subscriptionStatus !== 'loading',
          isDevelopment: process.env.NODE_ENV === 'development'
        })

        // Initialize Auto Ads via manager (prevents duplicates)
        await manager.initialize({
          enableAutoAds: true,
          enableManualAds: false
        })

        setAutoAdsEnabled(true)
        console.log('AutoAds: Successfully enabled via centralized manager')
      } catch (error) {
        console.error('AutoAds: Failed to enable Auto Ads:', error)
      }
    }

    // Start the process
    enableAutoAds()
  }, [isClient, isPremium, subscriptionStatus, autoAdsEnabled])

  // This component doesn't render anything visible
  return null
}

/**
 * AdSense Auto Ads Placeholder Component
 * 
 * This component creates a placeholder area where Auto Ads might appear.
 * It's useful for layout purposes and provides visual feedback in development.
 */
export function AutoAdsPlaceholder({ 
  className = "my-4",
  minHeight = "250px" 
}: { 
  className?: string
  minHeight?: string 
}) {
  const { isPremium, subscriptionStatus } = useSubscriptionStatus()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Don't render anything during SSR
  if (!isClient) {
    return null
  }

  // Don't render in development - show placeholder instead
  if (process.env.NODE_ENV === 'development') {
    return (
      <div className={`border-2 border-dashed border-blue-300 p-4 text-center text-blue-600 ${className}`}>
        <p className="text-sm font-medium">Auto Ads Placeholder</p>
        <p className="text-xs">Auto Ads will appear here in production for free users</p>
        <p className="text-xs mt-1">Publisher: {process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID || "ca-pub-8456317857596950"}</p>
      </div>
    )
  }

  // Don't render for premium users
  if (isPremium && subscriptionStatus !== 'loading') {
    return null
  }

  // Create a placeholder area for Auto Ads
  return (
    <div 
      className={`auto-ads-placeholder ${className}`}
      style={{ minHeight }}
      data-auto-ads="true"
    >
      {/* Auto Ads will be inserted here by Google */}
    </div>
  )
}

/**
 * Enhanced Auto Ads with Manual Fallback
 * 
 * This component tries Auto Ads first, then falls back to manual ad units
 * if Auto Ads don't appear within a reasonable time.
 */
export function SmartAds({ 
  className = "my-4",
  fallbackSlot,
  timeout = 10000 
}: { 
  className?: string
  fallbackSlot?: string
  timeout?: number 
}) {
  const { isPremium, subscriptionStatus } = useSubscriptionStatus()
  const [isClient, setIsClient] = useState(false)
  const [showFallback, setShowFallback] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient || isPremium || process.env.NODE_ENV === 'development') {
      return
    }

    // Set a timeout to show fallback if Auto Ads don't appear
    const timer = setTimeout(() => {
      setShowFallback(true)
      console.log('SmartAds: Auto Ads timeout, showing fallback')
    }, timeout)

    return () => clearTimeout(timer)
  }, [isClient, isPremium, timeout])

  // Don't render anything during SSR
  if (!isClient) {
    return null
  }

  // Don't render in development
  if (process.env.NODE_ENV === 'development') {
    return (
      <div className={`border-2 border-dashed border-green-300 p-4 text-center text-green-600 ${className}`}>
        <p className="text-sm font-medium">Smart Ads Placeholder</p>
        <p className="text-xs">Auto Ads + Manual Fallback in production</p>
      </div>
    )
  }

  // Don't render for premium users
  if (isPremium && subscriptionStatus !== 'loading') {
    return null
  }

  return (
    <div className={className}>
      {/* Auto Ads placeholder */}
      <AutoAdsPlaceholder className="mb-2" />
      
      {/* Manual fallback if provided and timeout reached */}
      {showFallback && fallbackSlot && (
        <div className="mt-4">
          <div 
            className="manual-ad-fallback"
            data-fallback-slot={fallbackSlot}
          >
            {/* Manual ad would go here */}
            <div className="text-center text-xs text-gray-500 p-2">
              Fallback ad space
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
