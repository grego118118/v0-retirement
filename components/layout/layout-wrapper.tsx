"use client"

import { usePathname } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { BackToTop } from "@/components/ui/back-to-top"
import { MobileCTA } from "@/components/layout/mobile-cta"

interface LayoutWrapperProps {
  children: React.ReactNode
}

/**
 * Conditionally renders header/footer based on route
 * Embed routes get a minimal layout without chrome
 */
export function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname()
  const isEmbedRoute = pathname?.startsWith("/embed")

  if (isEmbedRoute) {
    // Minimal layout for embeds - no header, no footer
    return (
      <div className="bg-transparent overflow-hidden">
        {children}
      </div>
    )
  }

  // Full layout for main site
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <BackToTop />
      <MobileCTA />
    </div>
  )
}

