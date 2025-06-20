import { Metadata } from "next"

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
    <div className="dashboard-layout">
      {children}
    </div>
  )
}
