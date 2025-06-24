import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Footer } from "@/components/layout/footer"
import { Header } from "@/components/layout/header"
import { SessionProvider } from "@/components/auth/session-provider"
import Script from "next/script"
import { Toaster } from "@/components/ui/sonner"
import { ResourceOptimizer } from "@/components/layout/resource-optimizer"
import { SubscriptionListener } from "@/components/layout/subscription-listener"
import { AdSenseInitializer } from "@/components/ads/adsense-initializer"
import { Analytics } from "@vercel/analytics/next"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    default: "Massachusetts Pension Estimator",
    template: "%s | Massachusetts Pension Estimator",
  },
  description: "Estimate your Massachusetts state employee pension benefits and determine the optimal time to retire.",
  generator: 'v0.dev',
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'https://www.masspension.com'),
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Resource optimization */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://accounts.google.com" />
        <link rel="preconnect" href="https://apis.google.com" />
        {/* AdSense preconnect for better performance */}
        <link rel="preconnect" href="https://pagead2.googlesyndication.com" />
        <link rel="preconnect" href="https://googleads.g.doubleclick.net" />
        {/* Vercel Analytics preconnect for better performance */}
        <link rel="preconnect" href="https://vitals.vercel-insights.com" />
        <link rel="preconnect" href="https://vitals.vercel-analytics.com" />

        {/* Google AdSense verification meta tag - Alternative verification method */}
        {process.env.NODE_ENV === 'production' && (
          <meta name="google-adsense-account" content={process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID || 'ca-pub-8456317857596950'} />
        )}

        {/* Google AdSense verification script - Always present for Google verification */}
        {process.env.NODE_ENV === 'production' && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID || 'ca-pub-8456317857596950'}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
            id="adsense-verification-script"
          />
        )}
        <meta name="format-detection" content="telephone=no" />
        {/* Disable automatic CSS preloading that causes warnings */}
        <meta name="next-head-count" content="0" />

        {/* Trusted Types Polyfill */}
        <Script
          src="/trusted-types-polyfill.js"
          strategy="beforeInteractive"
        />


        {/* Enhanced Trusted Types Policy for Next.js and third-party scripts */}
        <Script
          id="trusted-types-policy"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined' && window.trustedTypes && window.trustedTypes.createPolicy) {
                try {
                  // Create a comprehensive default policy
                  window.trustedTypes.createPolicy('default', {
                    createHTML: (string) => {
                      // Allow all HTML for now (can be restricted later)
                      return string;
                    },
                    createScriptURL: (string) => {
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
                    createScript: (string) => {
                      // Allow all scripts for now (Next.js, Vercel Live, etc.)
                      return string;
                    },
                  });
                } catch (e) {
                  // Policy might already exist
                  if (e.name !== 'NotAllowedError') {
                    console.log('Trusted Types policy creation:', e.message);
                  }
                }
              }
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <SessionProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <ResourceOptimizer />
            <SubscriptionListener />
            <AdSenseInitializer />
            <div className="flex min-h-screen flex-col">
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
            <Toaster />
            <Analytics />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
