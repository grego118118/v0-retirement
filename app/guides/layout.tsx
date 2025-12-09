import type { Metadata } from "next"
import { generateSEOMetadata } from "@/components/seo/metadata"

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
  return <>{children}</>
}

