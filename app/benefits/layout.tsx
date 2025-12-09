import type { Metadata } from "next"
import { generateSEOMetadata } from "@/components/seo/metadata"
import { BreadcrumbStructuredData } from "@/components/seo/structured-data"

export const metadata: Metadata = generateSEOMetadata({
  title: "Massachusetts State Employee Benefits | Pension & Retirement Overview",
  description: "Comprehensive guide to Massachusetts state employee benefits including pension plans, health insurance, COLA adjustments, and retirement options A, B, and C.",
  path: "/benefits",
  keywords: [
    "Massachusetts state employee benefits",
    "state employee pension benefits",
    "Massachusetts retirement benefits",
    "state worker benefits",
    "pension options Massachusetts",
    "COLA retirement benefits",
    "Massachusetts public employee benefits",
  ],
})

export default function BenefitsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <BreadcrumbStructuredData
        items={[
          { name: "Home", url: "https://www.masspension.com" },
          { name: "Benefits Overview", url: "https://www.masspension.com/benefits" },
        ]}
      />
      {children}
    </>
  )
}

