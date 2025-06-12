import type React from "react"
import "../globals.css"
import "./blog.css"
import type { Metadata } from "next"
import { generateSEOMetadata } from "@/components/seo/metadata"

export const metadata: Metadata = generateSEOMetadata({
  title: "Blog | Massachusetts Pension Estimator",
  description: "Expert articles and resources to help Massachusetts state employees plan for retirement.",
  path: "/blog",
})

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <section>{children}</section>
}
