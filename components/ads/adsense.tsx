"use client"

import { useEffect, useRef, useState } from "react"
import { useSubscriptionStatus } from "@/hooks/use-subscription"

interface AdSenseProps {
  adSlot: string
  adFormat?: "auto" | "rectangle" | "vertical" | "horizontal"
  adLayout?: string
  adLayoutKey?: string
  style?: React.CSSProperties
  className?: string
  fullWidthResponsive?: boolean
}

declare global {
  interface Window {
    adsbygoogle: any[]
  }
}

export function AdSense({
  adSlot,
  adFormat = "auto",
  adLayout,
  adLayoutKey,
  style = { display: "block" },
  className = "",
  fullWidthResponsive = true
}: AdSenseProps) {
  const { isPremium, subscriptionStatus } = useSubscriptionStatus()
  const adRef = useRef<HTMLDivElement>(null)
  const isAdLoaded = useRef(false)
  const [isClient, setIsClient] = useState(false)
  const publisherId = process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID || "ca-pub-8456317857596950"

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    // Only run on client side after hydration
    if (!isClient || typeof window === 'undefined') return

    // Don't load ads in development mode
    if (process.env.NODE_ENV === 'development') {
      return
    }

    // Don't show ads to confirmed premium users
    // But allow loading during 'loading' state to ensure ads load for free users
    if (isPremium && subscriptionStatus !== 'loading') {
      return
    }

    // Only load ads once per component instance
    if (isAdLoaded.current) {
      return
    }

    try {
      // Wait for the AdSense script to load before initializing ads
      const checkAdSenseReady = () => {
        if (typeof window !== 'undefined' && window.adsbygoogle) {
          // Initialize adsbygoogle array if it doesn't exist
          window.adsbygoogle = window.adsbygoogle || []

          // Check if we're using a placeholder ad slot ID
          const isPlaceholderSlot = /^[0-9]{10}$/.test(adSlot) &&
            ['1234567890', '2345678901', '3456789012', '4567890123'].includes(adSlot)

          if (isPlaceholderSlot) {
            console.warn(`AdSense: Using placeholder ad slot ID "${adSlot}". Please configure real ad unit IDs in Google AdSense dashboard.`)
            console.log('AdSense: Auto Ads should handle ad placement automatically.')
            // Don't push placeholder ads, let Auto Ads handle it
            return
          }

          // Push the ad configuration for real ad slots
          window.adsbygoogle.push({})
          isAdLoaded.current = true
          console.log(`AdSense ad initialized successfully for slot: ${adSlot}`)
        } else {
          // Retry after a short delay if AdSense isn't ready yet
          setTimeout(checkAdSenseReady, 100)
        }
      }

      // Start checking for AdSense readiness
      checkAdSenseReady()
    } catch (error) {
      console.error('AdSense error:', error)
    }
  }, [isClient, isPremium, subscriptionStatus, adSlot])

  // Don't render anything during SSR to prevent hydration mismatch
  if (!isClient) {
    return null
  }

  // Don't render in development
  if (process.env.NODE_ENV === 'development') {
    return (
      <div className={`border-2 border-dashed border-gray-300 p-4 text-center text-gray-500 ${className}`}>
        <p className="text-sm">AdSense Ad Placeholder</p>
        <p className="text-xs">Slot: {adSlot}</p>
        <p className="text-xs">Ads only show in production for free users</p>
      </div>
    )
  }

  // Don't render anything for confirmed premium users
  // But allow rendering during 'loading' state to ensure ads load for free users
  if (isPremium && subscriptionStatus !== 'loading') {
    return null
  }

  console.log('AdSense component rendering:', {
    adSlot,
    publisherId,
    isPremium,
    subscriptionStatus,
    nodeEnv: process.env.NODE_ENV
  })

  return (
    <div className={className} ref={adRef}>
      <ins
        className="adsbygoogle"
        style={style}
        data-ad-client={publisherId}
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-ad-layout={adLayout}
        data-ad-layout-key={adLayoutKey}
        data-full-width-responsive={fullWidthResponsive.toString()}
      />
    </div>
  )
}

// Predefined ad components for common use cases
export function BannerAd({ className = "my-4" }: { className?: string }) {
  return (
    <AdSense
      adSlot={process.env.NEXT_PUBLIC_ADSENSE_BANNER_SLOT || "1234567890"}
      adFormat="horizontal"
      className={className}
      style={{ display: "block", width: "100%", height: "90px" }}
    />
  )
}

export function SquareAd({ className = "my-4" }: { className?: string }) {
  return (
    <AdSense
      adSlot={process.env.NEXT_PUBLIC_ADSENSE_SQUARE_SLOT || "2345678901"}
      adFormat="rectangle"
      className={className}
      style={{ display: "block", width: "300px", height: "250px" }}
    />
  )
}

export function SidebarAd({ className = "my-4" }: { className?: string }) {
  return (
    <AdSense
      adSlot={process.env.NEXT_PUBLIC_ADSENSE_SIDEBAR_SLOT || "3456789012"}
      adFormat="vertical"
      className={className}
      style={{ display: "block", width: "160px", height: "600px" }}
    />
  )
}

export function ResponsiveAd({ className = "my-4" }: { className?: string }) {
  const adSlot = process.env.NEXT_PUBLIC_ADSENSE_RESPONSIVE_SLOT || "4567890123"
  console.log('ResponsiveAd rendering with slot:', adSlot)

  return (
    <AdSense
      adSlot={adSlot}
      adFormat="auto"
      className={className}
      style={{ display: "block", minHeight: "250px", backgroundColor: "#f9f9f9" }}
      fullWidthResponsive={true}
    />
  )
}

// Premium Alternative Component
export function PremiumAlternative({ className = "my-4" }: { className?: string }) {
  const { isPremium, subscriptionStatus } = useSubscriptionStatus()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Don't render anything during SSR
  if (!isClient) {
    return null
  }

  // Only show for premium users
  if (!isPremium || subscriptionStatus === 'loading') {
    return null
  }

  return (
    <div className={`bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-6 text-center ${className}`}>
      <div className="flex items-center justify-center mb-3">
        <div className="bg-purple-100 p-2 rounded-full mr-3">
          <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732L14.146 12.8l-1.179 4.456a1 1 0 01-1.934 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732L9.854 7.2l1.179-4.456A1 1 0 0112 2z" clipRule="evenodd" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-purple-800">Premium Experience</h3>
      </div>
      <p className="text-purple-700 text-sm">
        Enjoy an ad-free experience with your Premium subscription.
        Focus on your retirement planning without distractions.
      </p>
    </div>
  )
}

// Premium user alternative - shows upgrade prompt instead of ads
export function PremiumAlternative({ className = "my-4" }: { className?: string }) {
  const { isPremium } = useSubscriptionStatus()
  
  if (!isPremium) {
    return null
  }

  return (
    <div className={`bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4 text-center ${className}`}>
      <p className="text-sm text-blue-700 font-medium">
        ✨ Thank you for being a Premium subscriber!
      </p>
      <p className="text-xs text-blue-600 mt-1">
        Enjoy an ad-free experience with all premium features.
      </p>
    </div>
  )
}
