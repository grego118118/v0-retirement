"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import Script from "next/script"
import { useAuth } from "@/components/auth/auth-context"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, signOut, isLoading } = useAuth()

  // Structured data for organization
  const organizationStructuredData = {
    "@context": "https://schema.org",
    "@type": "GovernmentOrganization",
    name: "Massachusetts Pension Estimator",
    url: "https://mapensionestimator.gov",
    logo: "https://mapensionestimator.gov/images/logo.png",
    sameAs: ["https://www.mass.gov/orgs/massachusetts-state-retirement-board"],
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+1-617-555-1234",
      contactType: "customer service",
      areaServed: "Massachusetts",
      availableLanguage: "English",
    },
  }

  // Structured data for website
  const websiteStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Massachusetts Pension Estimator",
    url: "https://mapensionestimator.gov",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://mapensionestimator.gov/search?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  }

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  return (
    <>
      <Script id="organization-structured-data" type="application/ld+json">
        {JSON.stringify(organizationStructuredData)}
      </Script>
      <Script id="website-structured-data" type="application/ld+json">
        {JSON.stringify(websiteStructuredData)}
      </Script>

      <header className="border-b">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="font-bold text-xl">
            MA Pension Estimator
          </Link>
          <nav className="flex gap-6">
            <Link href="/" className="hover:text-primary">
              Home
            </Link>
            <Link href="/calculator" className="hover:text-primary">
              Calculator
            </Link>
            <Link href="/blog" className="hover:text-primary">
              Blog
            </Link>
            <Link href="/about" className="hover:text-primary">
              About
            </Link>
          </nav>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/auth/signin">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/calculator">Start Calculation</Link>
            </Button>
          </div>
        </div>
      </header>
    </>
  )
}
