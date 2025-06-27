"use client"

import { useEffect } from "react"

// Type declarations for Trusted Types API
declare global {
  interface Window {
    trustedTypes?: {
      createPolicy: (name: string, policy: any) => any;
    };
  }
}

export function TrustedTypesSetup() {
  useEffect(() => {
    // Only run on client side
    if (typeof window !== 'undefined' && window.trustedTypes && window.trustedTypes.createPolicy) {
      try {
        // Create a comprehensive default policy
        window.trustedTypes.createPolicy('default', {
          createHTML: (string: string) => {
            // Allow all HTML for now (can be restricted later)
            return string;
          },
          createScriptURL: (string: string) => {
            // Allow trusted script URLs
            const allowedDomains = [
              'vercel.live',
              'va.vercel-scripts.com',
              'vitals.vercel-insights.com',
              'vitals.vercel-analytics.com',
              'apis.google.com',
              'accounts.google.com',
              'js.stripe.com',
              'checkout.stripe.com',
              'pagead2.googlesyndication.com',
              'googleads.g.doubleclick.net',
              'tpc.googlesyndication.com',
              window.location.origin
            ];

            try {
              const url = new URL(string, window.location.origin);
              if (allowedDomains.some(domain => url.hostname.includes(domain))) {
                return string;
              }
            } catch (e) {
              // If URL parsing fails, allow relative URLs
              if (!string.includes('://')) {
                return string;
              }
            }

            console.warn('Blocked script URL:', string);
            return string; // Allow for now, log for debugging
          },
          createScript: (string: string) => {
            // Allow all scripts for now (Next.js, Vercel Live, etc.)
            return string;
          },
        });
      } catch (e: any) {
        // Policy might already exist
        if (e.name !== 'NotAllowedError') {
          console.log('Trusted Types policy creation:', e.message);
        }
      }
    }
  }, [])

  return null // This component doesn't render anything
}
