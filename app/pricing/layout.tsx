import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Pricing - Massachusetts Retirement System Calculator",
  description: "Unlock advanced retirement planning tools for Massachusetts employees. Premium features include Social Security optimization, tax calculations, and professional PDF reports. Plans starting at $9.99/month.",
  keywords: [
    "Massachusetts retirement calculator pricing",
    "pension calculator premium features",
    "Social Security optimization",
    "retirement planning tools",
    "Massachusetts state employee benefits",
    "pension and Social Security calculator",
    "retirement tax planning",
    "PDF retirement reports"
  ],
  openGraph: {
    title: "Premium Retirement Planning for Massachusetts Employees",
    description: "Maximize your Massachusetts retirement benefits with advanced planning tools, Social Security optimization, and professional analysis. Plans starting at $9.99/month.",
    type: "website",
    url: "/pricing",
    images: [
      {
        url: "/og-pricing.jpg",
        width: 1200,
        height: 630,
        alt: "Massachusetts Retirement System Premium Features"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Premium Retirement Planning for Massachusetts Employees",
    description: "Maximize your Massachusetts retirement benefits with advanced planning tools and Social Security optimization.",
    images: ["/og-pricing.jpg"]
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "/pricing"
  }
}

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {/* Structured Data for Pricing */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            "name": "Massachusetts Retirement System Calculator Premium",
            "description": "Advanced retirement planning tools for Massachusetts state employees including Social Security optimization and tax calculations",
            "brand": {
              "@type": "Brand",
              "name": "MA Pension Estimator"
            },
            "offers": [
              {
                "@type": "Offer",
                "name": "Monthly Premium Plan",
                "price": "9.99",
                "priceCurrency": "USD",
                "priceValidUntil": "2025-12-31",
                "availability": "https://schema.org/InStock",
                "url": "/pricing",
                "description": "Monthly subscription to premium retirement planning features"
              },
              {
                "@type": "Offer",
                "name": "Annual Premium Plan",
                "price": "99.99",
                "priceCurrency": "USD",
                "priceValidUntil": "2025-12-31",
                "availability": "https://schema.org/InStock",
                "url": "/pricing",
                "description": "Annual subscription with 17% savings on premium retirement planning features"
              }
            ],
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.8",
              "reviewCount": "1000"
            }
          })
        }}
      />
      {children}
    </>
  )
}
