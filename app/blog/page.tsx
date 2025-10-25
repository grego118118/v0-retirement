import type { Metadata } from "next"
import { generateSEOMetadata } from "@/components/seo/metadata"
import BlogClientComponent from "./blog-client"
import { BreadcrumbStructuredData } from "@/components/seo/structured-data"

export const metadata: Metadata = generateSEOMetadata({
  title: "Retirement Planning Blog | Massachusetts Pension Estimator",
  description:
    "Expert articles, guides, and resources to help Massachusetts state employees plan for retirement and maximize their pension benefits.",
  path: "/blog",
  keywords: [
    "retirement planning blog",
    "Massachusetts retirement guides",
    "state pension advice",
    "retirement tips",
    "pension maximization strategies",
    "state employee retirement",
    "Social Security Fairness Act",
    "WEP",
    "GPO",
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
