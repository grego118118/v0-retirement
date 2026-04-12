import type { Metadata } from "next"
import { generateSEOMetadata } from "@/components/seo/metadata"

export const metadata: Metadata = generateSEOMetadata({
  title: "Pricing | Massachusetts Pension Calculator Plans",
  description: "Choose the right plan for your Massachusetts retirement planning. Free basic calculator or Premium with PDF reports, Social Security optimization, and advanced analysis.",
  path: "/pricing",
  keywords: [
    "Massachusetts pension calculator pricing",
    "retirement planning subscription",
    "premium pension analysis",
    "PDF retirement reports",
    "Social Security optimization",
    "retirement calculator plans",
  ],
})

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

