import { Metadata } from "next"
import { CalculatorStructuredData } from "@/components/seo/structured-data"

export const metadata: Metadata = {
  title: "Dashboard | Massachusetts Pension Estimator",
  description: "Your personal retirement planning dashboard for Massachusetts state employees. View calculations, track progress, and manage your retirement planning.",
  keywords: [
    "Massachusetts retirement dashboard",
    "pension calculator dashboard", 
    "retirement planning",
    "state employee benefits",
    "pension projections"
  ],
  openGraph: {
    title: "Massachusetts Retirement Dashboard",
    description: "Personal retirement planning dashboard for Massachusetts state employees",
    type: "website",
  },
  robots: {
    index: false, // Dashboard should not be indexed
    follow: false,
  },
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {/* AI-optimized structured data for dashboard */}
      <CalculatorStructuredData
        pageUrl="https://www.masspension.com/dashboard"
        calculatorType="pension"
      />
      <div className="dashboard-layout">
        {children}
      </div>
    </>
  )
}
