import type { Metadata } from "next"

interface SEOMetadataProps {
  title: string
  description: string
  path: string
  keywords?: string[]
  ogImage?: string
}

export function generateSEOMetadata({
  title,
  description,
  path,
  keywords = [],
  ogImage = "/images/og-image.jpg",
}: SEOMetadataProps): Metadata {
  // Remove dependency on NEXT_PUBLIC_BASE_URL
  const baseUrl = "https://mapensionestimator.gov"
  const url = path

  // Default keywords for all pages
  const defaultKeywords = [
    "Massachusetts pension",
    "MA state retirement",
    "pension calculator",
    "retirement planning",
    "state employee benefits",
    "Massachusetts retirement",
    "pension estimator",
    "state pension",
    "retirement calculator",
  ]

  const allKeywords = [...defaultKeywords, ...keywords].join(", ")

  return {
    title,
    description,
    keywords: allKeywords,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: "Massachusetts Pension Estimator",
      locale: "en_US",
      type: "website",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  }
}
