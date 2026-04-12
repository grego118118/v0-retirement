import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Massachusetts Pension Calculator Widget",
  description: "Embeddable pension calculator for Massachusetts public employees",
  robots: "noindex, nofollow",
}

/**
 * Layout for embed routes - just passes children through
 * The actual embed styling is handled by the EmbedWrapper component
 */
export default function EmbedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

