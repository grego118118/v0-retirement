"use client"

import { useEffect } from "react"

export function AdSenseInitializer() {
  useEffect(() => {
    // Initialize adsbygoogle array when the component mounts
    if (typeof window !== 'undefined') {
      window.adsbygoogle = window.adsbygoogle || []
      console.log('AdSense initializer: adsbygoogle array initialized')

      // Check if the script is already loaded
      const checkScriptLoaded = () => {
        const scriptElement = document.querySelector('#adsense-verification-script') ||
                             document.querySelector('script[src*="adsbygoogle"]')

        if (scriptElement) {
          // Type check and assertion to HTMLScriptElement for proper TypeScript typing
          if (scriptElement instanceof HTMLScriptElement) {
            const script = scriptElement
            console.log('AdSense script found in DOM:', script.src || 'no src')

            // Check if script is already loaded by checking if adsbygoogle exists
            if (typeof window !== 'undefined' && window.adsbygoogle && window.adsbygoogle.loaded) {
              console.log('AdSense script already loaded')
              window.adsbygoogle = window.adsbygoogle || []
              console.log('AdSense adsbygoogle array ready:', window.adsbygoogle.length)
            } else {
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

              // Also initialize immediately in case the script loads before event listeners
              if (typeof window !== 'undefined') {
                window.adsbygoogle = window.adsbygoogle || []
                console.log('AdSense adsbygoogle array initialized immediately')
              }
            }
          } else {
            console.log('Found element but it is not a script element:', scriptElement.tagName)
          }
        } else {
          // Retry after a short delay if script isn't found yet
          console.log('AdSense script not found, retrying...')
          setTimeout(checkScriptLoaded, 100)
        }
      }

      checkScriptLoaded()
    }
  }, [])

  return null
}
