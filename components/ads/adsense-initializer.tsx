"use client"

import { useEffect, useState } from "react"
import { useSubscriptionStatus } from "@/hooks/use-subscription"

declare global {
  interface Window {
    adsbygoogle: any[]
  }
}

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

    // Don't load AdSense for premium users
    if (isPremium && subscriptionStatus !== 'loading') {
      console.log('AdSense: Skipping initialization for premium user')
      return
    }

    // Don't load in development
    if (process.env.NODE_ENV === 'development') {
      console.log('AdSense: Skipping initialization in development')
      return
    }

    // Initialize adsbygoogle array when the component mounts
    window.adsbygoogle = window.adsbygoogle || []
    console.log('AdSense initializer: adsbygoogle array initialized')

    // Check if AdSense script is already loaded
    let existingScript = document.querySelector('script[src*="adsbygoogle.js"]')

    if (!existingScript) {
      // Create and load the AdSense script dynamically to avoid hydration issues
      const publisherId = process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID || "ca-pub-8456317857596950"
      const script = document.createElement('script')
      script.async = true
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}`
      script.crossOrigin = 'anonymous'
      script.id = 'adsense-verification-script'

      script.onload = () => {
        console.log('AdSense script loaded successfully from initializer')
        if (typeof window !== 'undefined') {
          window.adsbygoogle = window.adsbygoogle || []
          console.log('AdSense adsbygoogle array ready:', window.adsbygoogle.length)

          // Enable Auto Ads for immediate ad serving
          try {
            window.adsbygoogle.push({
              google_ad_client: publisherId,
              enable_page_level_ads: true,
              overlays: {bottom: true}
            })
            console.log('AdSense Auto Ads enabled')
          } catch (error) {
            console.error('AdSense Auto Ads initialization error:', error)
          }
        }
      }

      script.onerror = (e) => {
        console.error('Failed to load AdSense script from initializer:', e)
      }

      // Append to head to load the script
      document.head.appendChild(script)
      console.log('AdSense script created and added to DOM')
    } else {
      console.log('AdSense script already exists in DOM')
      // Initialize immediately if script already exists
      window.adsbygoogle = window.adsbygoogle || []

      // Enable Auto Ads if script already exists
      try {
        const publisherId = process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID || "ca-pub-8456317857596950"
        window.adsbygoogle.push({
          google_ad_client: publisherId,
          enable_page_level_ads: true,
          overlays: {bottom: true}
        })
        console.log('AdSense Auto Ads enabled (existing script)')
      } catch (error) {
        console.error('AdSense Auto Ads initialization error (existing script):', error)
      }
    }
  }, [isClient, isPremium, subscriptionStatus])

  return null
}
