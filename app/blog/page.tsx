import type { Metadata } from "next"
import { generateSEOMetadata } from "@/components/seo/metadata"
import BlogClientComponent from "./blog-client"
import { BreadcrumbStructuredData } from "@/components/seo/structured-data"

export const metadata: Metadata = generateSEOMetadata({
  title: "Massachusetts Retirement Blog | Pension Tips, COLA Updates & Planning Guides",
  description:
    "Expert Massachusetts retirement articles covering pension Groups 1-4, COLA updates, Social Security Fairness Act, WEP/GPO changes, and benefit maximization strategies for state employees.",
  path: "/blog",
  keywords: [
    "Massachusetts retirement blog",
    "state pension articles",
    "MSRB retirement guides",
    "pension COLA updates",
    "Social Security Fairness Act",
    "WEP GPO Massachusetts",
    "state employee retirement tips",
    "pension maximization strategies",
    "Massachusetts pension news",
    "retirement planning articles",
  ],
})

export default function BlogPage() {
  // Structured data for blog listing
  // Keeping it simple: one-level breadcrumb
  // (Category pages would similarly inject their own breadcrumb)
  // We render this in the client component to ensure JSON-LD is present
  return (
    <>
      {/* BreadcrumbList JSON-LD for /blog */}
      {/* Using the shared component */}
      <BreadcrumbStructuredData items={[{ name: 'Blog', url: 'https://www.masspension.com/blog' }]} />
      <BlogClientComponent />
    </>
  )
}
