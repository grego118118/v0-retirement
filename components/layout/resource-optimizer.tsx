"use client"

import { useEffect } from 'react'

/**
 * Resource Optimizer Component
 * Handles CSS preloading warnings and optimizes resource loading
 */
export function ResourceOptimizer() {
  useEffect(() => {
    // Handle CSS preload warnings by ensuring proper usage
    const handleCSSPreloads = () => {
      // Find all preloaded CSS links
      const preloadedCSS = document.querySelectorAll('link[rel="preload"][as="style"]')

      preloadedCSS.forEach((link) => {
        const href = link.getAttribute('href')
        if (href) {
          // Check if the CSS is actually being used
          const existingStylesheet = document.querySelector(`link[rel="stylesheet"][href="${href}"]`)

          if (!existingStylesheet) {
            // Convert preload to actual stylesheet if not already loaded
            const stylesheet = document.createElement('link')
            stylesheet.rel = 'stylesheet'
            stylesheet.href = href
            stylesheet.media = 'all' // Ensure it's applied immediately
            stylesheet.onload = () => {
              // Remove the preload link once stylesheet is loaded
              if (link.parentNode) {
                link.parentNode.removeChild(link)
              }
            }
            stylesheet.onerror = () => {
              // Remove preload link even if stylesheet fails to load
              if (link.parentNode) {
                link.parentNode.removeChild(link)
              }
            }
            document.head.appendChild(stylesheet)
          } else {
            // If stylesheet already exists, remove the preload link
            if (link.parentNode) {
              link.parentNode.removeChild(link)
            }
          }
        }
      })
    }

    // Run immediately and after short delays to catch all preloads
    handleCSSPreloads()
    const timer1 = setTimeout(handleCSSPreloads, 100)
    const timer2 = setTimeout(handleCSSPreloads, 500)
    const timer3 = setTimeout(handleCSSPreloads, 1000)

    // Also run on window load to catch any remaining preloads
    const loadHandler = () => {
      setTimeout(handleCSSPreloads, 100)
    }
    window.addEventListener('load', loadHandler)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
      window.removeEventListener('load', loadHandler)
    }
  }, [])

  // Handle Vercel Live feedback script loading
  useEffect(() => {
    // Only load Vercel Live in production and if not already loaded
    if (
      process.env.NODE_ENV === 'production' && 
      typeof window !== 'undefined' && 
      !document.querySelector('script[src*="vercel.live"]')
    ) {
      const script = document.createElement('script')
      script.src = 'https://vercel.live/_next-live/feedback/feedback.js'
      script.async = true
      script.defer = true
      
      // Add error handling
      script.onerror = () => {
        console.log('Vercel Live feedback script failed to load (this is normal in development)')
      }
      
      document.head.appendChild(script)
    }
  }, [])

  return null // This component doesn't render anything
}

export default ResourceOptimizer
