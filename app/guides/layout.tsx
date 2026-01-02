import type { Metadata } from "next"
import { generateSEOMetadata } from "@/components/seo/metadata"
import { BreadcrumbStructuredData, HowToStructuredData } from "@/components/seo/structured-data"

export const metadata: Metadata = generateSEOMetadata({
  title: "Massachusetts Retirement Guide | Complete Pension Planning Resource",
  description: "Comprehensive guide to Massachusetts state employee retirement including pension Groups 1-4, COLA calculations, retirement options A/B/C, and benefit maximization strategies.",
  path: "/guides",
  keywords: [
    "Massachusetts retirement guide",
    "MSRB pension guide",
    "state employee retirement planning",
    "Massachusetts pension Groups 1-4",
    "retirement options explained",
    "COLA calculation guide",
    "pension benefit maximization",
    "Massachusetts state employee benefits",
  ],
})

export default function GuidesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <BreadcrumbStructuredData
        items={[
          { name: "Home", url: "https://www.masspension.com" },
          { name: "Guides", url: "https://www.masspension.com/guides" },
        ]}
      />
      <HowToStructuredData
        title="How to Plan Your Massachusetts State Employee Retirement"
        description="Step-by-step guide to understanding and maximizing your Massachusetts state pension benefits"
        steps={[
          { name: "Determine Your Retirement Group", text: "Identify whether you're in Group 1, 2, 3, or 4 based on your job classification", url: "https://www.masspension.com/resources/groups" },
          { name: "Calculate Your Average Salary", text: "Find the average of your highest 3 consecutive years of salary" },
          { name: "Understand Benefit Factors", text: "Learn the benefit multiplier for your group and retirement age", url: "https://www.masspension.com/calculator" },
          { name: "Choose Your Retirement Option", text: "Compare Options A, B, and C for survivor benefits", url: "https://www.masspension.com/resources/options" },
          { name: "Plan Your Timeline", text: "Create a timeline for retirement preparation starting 5+ years out" },
        ]}
      />
      {children}
    </>
  )
}

