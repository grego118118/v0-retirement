import { Metadata } from "next"
import { CalculatorStructuredData } from "@/components/seo/structured-data"

export const metadata: Metadata = {
  title: "Retirement Planning Wizard | Massachusetts Pension Estimator",
  description: "Comprehensive retirement planning wizard for Massachusetts state employees. Get personalized pension calculations, Social Security integration, and retirement optimization recommendations.",
  keywords: [
    "Massachusetts retirement wizard",
    "retirement planning tool", 
    "pension calculator wizard",
    "state employee retirement planning",
    "comprehensive retirement analysis",
    "Social Security integration",
    "retirement optimization"
  ],
  openGraph: {
    title: "Massachusetts Retirement Planning Wizard",
    description: "Comprehensive retirement planning tool for Massachusetts state employees with pension and Social Security integration",
    type: "website",
  },
}

export default function WizardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {/* AI-optimized structured data for retirement wizard */}
      <CalculatorStructuredData 
        pageUrl="https://www.masspension.com/wizard" 
        calculatorType="wizard" 
      />
      <div className="wizard-layout">
        {children}
      </div>
    </>
  )
}
