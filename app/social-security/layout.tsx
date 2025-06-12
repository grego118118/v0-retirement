import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Social Security Calculator | MA Pension Estimator",
  description: "Optimize your Social Security benefits with our advanced calculator. Includes COLA adjustments, spousal benefits, and tax implications.",
}

export default function SocialSecurityLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
