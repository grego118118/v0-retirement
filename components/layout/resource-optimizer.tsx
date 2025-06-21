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
            stylesheet.onload = () => {
              // Remove the preload link once stylesheet is loaded
              link.remove()
            }
            document.head.appendChild(stylesheet)
          }
        }
      })
    }

    // Run after a short delay to allow Next.js to finish initial loading
    const timer = setTimeout(handleCSSPreloads, 100)

    // Also run on window load to catch any remaining preloads
    window.addEventListener('load', handleCSSPreloads)

    return () => {
      clearTimeout(timer)
      window.removeEventListener('load', handleCSSPreloads)
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
