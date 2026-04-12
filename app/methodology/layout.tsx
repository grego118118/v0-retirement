import type { Metadata } from "next"
import { generateSEOMetadata } from "@/components/seo/metadata"
import { BreadcrumbStructuredData } from "@/components/seo/structured-data"

export const metadata: Metadata = generateSEOMetadata({
  title: "Calculation Methodology | How Massachusetts Pension Calculator Works",
  description: "Understand the official MSRB formulas and methodology used by our Massachusetts pension calculator. Transparent calculations based on state retirement board guidelines.",
  path: "/methodology",
  keywords: [
    "Massachusetts pension calculation formula",
    "MSRB calculation methodology",
    "pension benefit formula",
    "retirement calculation explained",
    "Massachusetts pension formula",
    "state employee benefit calculation",
  ],
})

export default function MethodologyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <BreadcrumbStructuredData
        items={[
          { name: "Home", url: "https://www.masspension.com" },
          { name: "Calculation Methodology", url: "https://www.masspension.com/methodology" },
        ]}
      />
      {children}
    </>
  )
}

