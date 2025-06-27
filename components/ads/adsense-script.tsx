"use client"

import { useEffect, useState } from "react"
import Script from "next/script"
import { useSubscriptionStatus } from "@/hooks/use-subscription"

export function AdSenseScript() {
  const { isPremium, subscriptionStatus } = useSubscriptionStatus()
  const [isClient, setIsClient] = useState(false)
  const publisherId = process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID || "ca-pub-8456317857596950"

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Don't render anything during SSR to prevent hydration mismatch
  if (!isClient) {
    return null
  }

  // Don't load AdSense script in development
  if (process.env.NODE_ENV === 'development') {
    return null
  }

  // Don't load AdSense script for confirmed premium users
  // But allow loading during 'loading' state to ensure script loads for free users
  if (isPremium && subscriptionStatus !== 'loading') {
    return null
  }

  return (
    <Script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
      onLoad={() => {
        console.log('AdSense script loaded successfully')
      }}
      onError={(e) => {
        console.error('Failed to load AdSense script:', e)
      }}
    />
  )
}

// Alternative component that loads the script only when needed
export function AdSenseScriptLoader() {
  const { isPremium, subscriptionStatus } = useSubscriptionStatus()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    // Only run on client side after hydration
    if (!isClient || typeof window === 'undefined') return

    // Don't load in development
    if (process.env.NODE_ENV === 'development') {
      return
    }

    // Don't load for confirmed premium users
    // But allow loading during 'loading' state to ensure script loads for free users
    if (isPremium && subscriptionStatus !== 'loading') {
      return
    }

    // Check if script is already loaded
    if (document.querySelector('script[src*="adsbygoogle.js"]')) {
      return
    }

    // Create and load the AdSense script
    const publisherId = process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID || "ca-pub-8456317857596950"
    const script = document.createElement('script')
    script.async = true
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}`
    script.crossOrigin = 'anonymous'

    script.onload = () => {
      console.log('AdSense script loaded dynamically')
    }

    script.onerror = () => {
      console.error('Failed to load AdSense script dynamically')
    }

    document.head.appendChild(script)

    // Cleanup function
    return () => {
      const existingScript = document.querySelector('script[src*="adsbygoogle.js"]')
      if (existingScript) {
        existingScript.remove()
      }
    }
  }, [isClient, isPremium, subscriptionStatus])

  return null
}
