import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import "../styles/design-system.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Footer } from "@/components/layout/footer"
import { Header } from "@/components/layout/header"
import { SessionProvider } from "@/components/auth/session-provider"
import { AuthErrorHandler } from "@/components/auth/auth-error-handler"
import { ProfileProvider } from "@/contexts/profile-context"
import Script from "next/script"
import { Toaster } from "@/components/ui/sonner"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    default: "Massachusetts Pension Estimator",
    template: "%s | Massachusetts Pension Estimator",
  },
  description: "Estimate your Massachusetts state employee pension benefits and determine the optimal time to retire.",
  generator: 'v0.dev',
  metadataBase: new URL('http://localhost:3000'),
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Viewport Meta Tag for Responsive Design */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />
        {/* Trusted Types Polyfill */}
        <Script
          src="/trusted-types-polyfill.js"
          strategy="beforeInteractive"
        />
        {/* Trusted Types Policy for Next.js */}
        <Script
          id="trusted-types-policy"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined' && window.trustedTypes && window.trustedTypes.createPolicy) {
                try {
                  window.trustedTypes.createPolicy('default', {
                    createHTML: (string) => string,
                    createScriptURL: (string) => string,
                    createScript: (string) => string,
                  });
                } catch (e) {
                  // Policy might already exist
                  console.log('Trusted Types policy already exists');
                }
              }
            `,
          }}
        />
      </head>
      <body className={`${inter.className} overflow-x-hidden`}>
        <SessionProvider>
          <AuthErrorHandler>
            <ProfileProvider>
              <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                {/* Skip to main content link for keyboard users */}
                <a
                  href="#main-content"
                  className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:shadow-lg"
                  aria-label="Skip to main content"
                >
                  Skip to main content
                </a>

                <div className="flex min-h-screen flex-col max-w-full overflow-x-hidden">
                  <Header />
                  <main
                    id="main-content"
                    className="flex-1 w-full max-w-full overflow-x-hidden"
                    role="main"
                    aria-label="Main content"
                  >
                    {children}
                  </main>
                  <Footer />
                </div>
                <Toaster />

              {/* ARIA live regions for dynamic announcements */}
              <div
                id="aria-live-region"
                aria-live="polite"
                aria-atomic="true"
                className="sr-only"
              />
              <div
                id="aria-live-region-assertive"
                aria-live="assertive"
                aria-atomic="true"
                className="sr-only"
              />
            </ThemeProvider>
          </ProfileProvider>
        </AuthErrorHandler>
        </SessionProvider>
      </body>
    </html>
  )
}
