"use client"

import { useEffect } from "react"

export function AdSenseInitializer() {
  useEffect(() => {
    // Only run in production
    if (process.env.NODE_ENV !== 'production') {
      return
    }

    // Initialize adsbygoogle array when the component mounts
    if (typeof window !== 'undefined') {
      window.adsbygoogle = window.adsbygoogle || []
      console.log('AdSense initializer: adsbygoogle array initialized')
      
      // Check if the script is already loaded
      const checkScriptLoaded = () => {
        const script = document.querySelector('#adsense-verification-script')
        if (script) {
          console.log('AdSense script found in DOM')
          
          // Listen for script load events
          script.addEventListener('load', () => {
            console.log('AdSense script loaded successfully from initializer')
            if (typeof window !== 'undefined') {
              window.adsbygoogle = window.adsbygoogle || []
              console.log('AdSense adsbygoogle array ready:', window.adsbygoogle.length)
            }
          })
          
          script.addEventListener('error', (e) => {
            console.error('Failed to load AdSense script from initializer:', e)
          })
        } else {
          // Retry after a short delay if script isn't found yet
          setTimeout(checkScriptLoaded, 100)
        }
      }
      
      checkScriptLoaded()
    }
  }, [])

  return null
}
