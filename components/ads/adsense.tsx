"use client"

import { useEffect, useRef } from "react"
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
  const publisherId = process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID || "ca-pub-8456317857596950"

  useEffect(() => {
    // Don't show ads to premium users
    if (isPremium) {
      return
    }

    // Don't load ads in development mode
    if (process.env.NODE_ENV === 'development') {
      return
    }

    // Only load ads once per component instance
    if (isAdLoaded.current) {
      return
    }

    try {
      // Initialize adsbygoogle array if it doesn't exist
      if (typeof window !== 'undefined') {
        window.adsbygoogle = window.adsbygoogle || []
        
        // Push the ad configuration
        window.adsbygoogle.push({})
        isAdLoaded.current = true
      }
    } catch (error) {
      console.error('AdSense error:', error)
    }
  }, [isPremium, subscriptionStatus])

  // Don't render anything for premium users
  if (isPremium) {
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
  return (
    <AdSense
      adSlot={process.env.NEXT_PUBLIC_ADSENSE_RESPONSIVE_SLOT || "4567890123"}
      adFormat="auto"
      className={className}
      style={{ display: "block" }}
      fullWidthResponsive={true}
    />
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
