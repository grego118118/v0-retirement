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
      <body className={inter.className}>
        <SessionProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <div className="flex min-h-screen flex-col">
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
            <Toaster />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
