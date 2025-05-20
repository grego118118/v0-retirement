import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Footer } from "@/components/layout/footer"
import { SimpleHeader } from "@/components/layout/simple-header"
import { SimpleAuthProvider } from "@/components/auth/simple-auth-context"
import { AuthProvider } from "@/components/auth/auth-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    default: "Massachusetts Pension Estimator",
    template: "%s | Massachusetts Pension Estimator",
  },
  description: "Estimate your Massachusetts state employee pension benefits and determine the optimal time to retire.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <SimpleAuthProvider>
          <AuthProvider>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
              <div className="flex min-h-screen flex-col">
                <SimpleHeader />
                <main className="flex-1">{children}</main>
                <Footer />
              </div>
            </ThemeProvider>
          </AuthProvider>
        </SimpleAuthProvider>
      </body>
    </html>
  )
}
