import React from "react"
import { generateSEOMetadata } from "@/components/seo/metadata"
import Script from "next/script"
import { HomeContent } from "@/components/home/home-content"

export const metadata = generateSEOMetadata({
  title: "Massachusetts Pension Estimator | Retirement Planning for State Employees",
  description:
    "Calculate your Massachusetts state employee pension benefits and determine the optimal time to retire with our free pension estimator tool.",
  path: "/",
  keywords: [
    "Massachusetts pension calculator",
    "MA state retirement",
    "pension estimator",
    "state employee retirement",
    "retirement planning",
    "pension benefits",
    "Massachusetts retirement system",
  ],
})

export default function Home() {
  // Structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Massachusetts Pension Estimator",
    description:
      "Calculate your Massachusetts state employee pension benefits and determine the optimal time to retire.",
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    audience: {
      "@type": "Audience",
      audienceType: "Massachusetts State Employees",
    },
  };

  return (
    <>
      <Script id="structured-data" type="application/ld+json">
        {JSON.stringify(structuredData)}
      </Script>
      <HomeContent />
    </>
  );
}
