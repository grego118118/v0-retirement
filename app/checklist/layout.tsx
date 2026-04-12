import type { Metadata } from "next"
import { generateSEOMetadata } from "@/components/seo/metadata"
import { HowToStructuredData, BreadcrumbStructuredData } from "@/components/seo/structured-data"

export const metadata: Metadata = generateSEOMetadata({
  title: "Massachusetts Retirement Checklist | Pre-Retirement Planning Steps",
  description: "Complete Massachusetts state employee retirement checklist. Step-by-step guide for preparing your pension application, required documents, and timeline for retiring from state service.",
  path: "/checklist",
  keywords: [
    "Massachusetts retirement checklist",
    "state employee retirement preparation",
    "pension application checklist",
    "MSRB retirement steps",
    "retirement planning checklist",
    "Massachusetts state retirement guide",
    "pension documentation required",
  ],
})

export default function ChecklistLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <HowToStructuredData
        title="How to Prepare for Massachusetts State Retirement"
        description="Follow this checklist to ensure you're fully prepared for your Massachusetts state employee retirement"
        steps={[
          { name: "Verify Service Credits", text: "Review your creditable service years with your retirement board", url: "https://www.masspension.com/checklist#step-1" },
          { name: "Gather Documents", text: "Collect birth certificates, marriage certificates, and beneficiary information", url: "https://www.masspension.com/checklist#step-2" },
          { name: "Calculate Benefits", text: "Use the pension calculator to estimate your retirement income", url: "https://www.masspension.com/checklist#step-3" },
          { name: "Choose Retirement Option", text: "Select Option A, B, or C based on your situation", url: "https://www.masspension.com/checklist#step-4" },
          { name: "Submit Application", text: "File your retirement application 90 days before your planned retirement date", url: "https://www.masspension.com/checklist#step-5" },
        ]}
      />
      <BreadcrumbStructuredData
        items={[
          { name: "Home", url: "https://www.masspension.com" },
          { name: "Retirement Checklist", url: "https://www.masspension.com/checklist" },
        ]}
      />
      {children}
    </>
  )
}

