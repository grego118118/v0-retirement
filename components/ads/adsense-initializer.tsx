"use client"

import { useEffect, useState } from "react"

export function AdSenseInitializer() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    // Set client flag to prevent hydration mismatch
    setIsClient(true)
  }, [])

  useEffect(() => {
    // Only run on client side after hydration
    if (!isClient || typeof window === 'undefined') return

    // Initialize adsbygoogle array when the component mounts
    window.adsbygoogle = window.adsbygoogle || []
    console.log('AdSense initializer: adsbygoogle array initialized')

    // Check if AdSense script is already loaded
    let existingScript = document.querySelector('script[src*="adsbygoogle.js"]')

    if (!existingScript) {
      // Create and load the AdSense script dynamically to avoid hydration issues
      const publisherId = "ca-pub-8456317857596950"
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
    }
  }, [isClient])

  return null
}
