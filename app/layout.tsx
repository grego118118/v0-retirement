import type React from "react"
import type { Metadata, Viewport } from "next"
import { Lexend, Source_Sans_3 } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { LayoutWrapper } from "@/components/layout/layout-wrapper"
import { SessionProvider } from "@/components/auth/session-provider"
import { ProfileProvider } from "@/contexts/profile-context"
import Script from "next/script"
import { Toaster } from "@/components/ui/sonner"
import { ResourceOptimizer } from "@/components/layout/resource-optimizer"
import { SubscriptionListener } from "@/components/layout/subscription-listener"
import { AdSenseInitializer } from "@/components/ads/adsense-initializer"
import { TrustedTypesSetup } from "@/components/layout/trusted-types-setup"
import { Analytics } from "@vercel/analytics/next"
import { FloatingChatbot } from "@/components/pension-chatbot/FloatingChatbot"
import { GoogleAnalytics } from "@/components/layout/google-analytics"

const lexend = Lexend({
  subsets: ["latin"],
  variable: "--font-lexend",
  display: "swap",
})

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-source-sans",
  display: "swap",
})

// Viewport configuration - separate export as required by Next.js 14+
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export const metadata: Metadata = {
  title: {
    default: "Mass Pension - Massachusetts Retirement Calculator",
    template: "%s | Mass Pension",
  },
  description: "Calculate your Massachusetts state employee pension benefits with official MSRB formulas. Comprehensive retirement planning for Groups 1-4 with COLA projections.",
  generator: 'v0.dev',
  metadataBase: new URL('https://www.masspension.com'),
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
  },
  openGraph: {
    title: 'Mass Pension - Massachusetts Retirement Calculator',
    description: 'Calculate your Massachusetts state employee pension benefits with official MSRB formulas.',
    url: 'https://www.masspension.com',
    siteName: 'Mass Pension',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Mass Pension - Massachusetts Retirement Calculator',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mass Pension - Massachusetts Retirement Calculator',
    description: 'Calculate your Massachusetts state employee pension benefits with official MSRB formulas.',
    images: ['/images/og-image.jpg'],
  },
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
        <meta name="google-adsense-account" content="ca-pub-8456317857596950" />
        <meta name="format-detection" content="telephone=no" />
        {/* Disable automatic CSS preloading that causes warnings */}
        <meta name="next-head-count" content="0" />

        {/* Trusted Types Polyfill */}
        <Script
          src="/trusted-types-polyfill.js"
          strategy="beforeInteractive"
        />
      </head>
      <body className={`${lexend.variable} ${sourceSans.variable} font-sans`}>
        <SessionProvider>
          <ProfileProvider>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
              <ResourceOptimizer />
              <SubscriptionListener />
              <AdSenseInitializer />
              <TrustedTypesSetup />
              <LayoutWrapper>
                {children}
              </LayoutWrapper>
              <Toaster />
              <FloatingChatbot />
              <Analytics />
              <GoogleAnalytics />
            </ThemeProvider>
          </ProfileProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
