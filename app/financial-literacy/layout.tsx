import type { Metadata } from "next"
import { generateSEOMetadata } from "@/components/seo/metadata"
import { BreadcrumbStructuredData } from "@/components/seo/structured-data"

export const metadata: Metadata = generateSEOMetadata({
  title: "Financial Literacy for Massachusetts State Employees | Retirement Education",
  description: "Build financial literacy for retirement success. Learn budgeting, debt management, investment basics, and retirement planning strategies for Massachusetts state employees.",
  path: "/financial-literacy",
  keywords: [
    "financial literacy Massachusetts",
    "state employee financial education",
    "retirement financial planning",
    "budgeting for retirement",
    "investment basics",
    "debt management retirement",
    "Massachusetts employee education",
    "financial wellness",
  ],
})

export default function FinancialLiteracyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <BreadcrumbStructuredData
        items={[
          { name: "Home", url: "https://www.masspension.com" },
          { name: "Financial Literacy", url: "https://www.masspension.com/financial-literacy" },
        ]}
      />
      {children}
    </>
  )
}

