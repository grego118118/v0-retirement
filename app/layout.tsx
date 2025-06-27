import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Footer } from "@/components/layout/footer"
import { Header } from "@/components/layout/header"
import { SessionProvider } from "@/components/auth/session-provider"
import { ProfileProvider } from "@/contexts/profile-context"
import Script from "next/script"
import { Toaster } from "@/components/ui/sonner"
import { ResourceOptimizer } from "@/components/layout/resource-optimizer"
import { SubscriptionListener } from "@/components/layout/subscription-listener"
import { AdSenseInitializer } from "@/components/ads/adsense-initializer"
import { TrustedTypesSetup } from "@/components/layout/trusted-types-setup"
import { Analytics } from "@vercel/analytics/next"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    default: "Mass Pension - Massachusetts Retirement Calculator",
    template: "%s | Mass Pension",
  },
  description: "Calculate your Massachusetts state employee pension benefits with official MSRB formulas. Comprehensive retirement planning for Groups 1-4 with COLA projections.",
  generator: 'v0.dev',
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'https://www.masspension.com'),
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
        url: '/images/og-image.svg',
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
    images: ['/images/og-image.svg'],
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
      <body className={inter.className}>
        <SessionProvider>
          <ProfileProvider>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <ResourceOptimizer />
            <SubscriptionListener />
            <AdSenseInitializer />
            <TrustedTypesSetup />
            <div className="flex min-h-screen flex-col">
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
            <Toaster />
            <Analytics />
          </ThemeProvider>
          </ProfileProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
