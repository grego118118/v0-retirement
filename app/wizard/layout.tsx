import type { Metadata } from "next"
import { generateSEOMetadata } from "@/components/seo/metadata"
import { HowToStructuredData, BreadcrumbStructuredData } from "@/components/seo/structured-data"

export const metadata: Metadata = generateSEOMetadata({
  title: "Retirement Planning Wizard | Massachusetts Pension & Social Security Calculator",
  description: "Step-by-step Massachusetts retirement planning wizard combining pension and Social Security benefits. Get personalized optimization recommendations and tax-efficient strategies.",
  path: "/wizard",
  keywords: [
    "Massachusetts retirement wizard",
    "pension Social Security calculator",
    "retirement planning tool",
    "combined benefits calculator",
    "pension optimization",
    "retirement income maximization",
    "tax-efficient retirement strategy",
  ],
})

export default function WizardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <HowToStructuredData
        title="How to Use the Massachusetts Retirement Planning Wizard"
        description="Complete your personalized retirement analysis in 7 easy steps"
        steps={[
          { name: "Enter Personal Information", text: "Provide your age, retirement timeline, and filing status", url: "https://www.masspension.com/wizard#step-1" },
          { name: "Add Pension Details", text: "Enter your service years, salary, and retirement group", url: "https://www.masspension.com/wizard#step-2" },
          { name: "Input Social Security", text: "Add benefits from your SSA.gov statement", url: "https://www.masspension.com/wizard#step-3" },
          { name: "Review Income Sources", text: "Include additional retirement income and assets", url: "https://www.masspension.com/wizard#step-4" },
          { name: "Set Preferences", text: "Define your goals, risk tolerance, and analysis options", url: "https://www.masspension.com/wizard#step-5" },
          { name: "Optimize Strategy", text: "Review AI-powered recommendations and scenarios", url: "https://www.masspension.com/wizard#step-6" },
          { name: "Save Results", text: "Download reports and save to your dashboard", url: "https://www.masspension.com/wizard#step-7" },
        ]}
      />
      <BreadcrumbStructuredData
        items={[
          { name: "Home", url: "https://www.masspension.com" },
          { name: "Retirement Wizard", url: "https://www.masspension.com/wizard" },
        ]}
      />
      {children}
    </>
  )
}

