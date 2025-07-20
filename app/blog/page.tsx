import type { Metadata } from "next"
import { generateSEOMetadata } from "@/components/seo/metadata"
import BlogClientComponent from "./blog-client"

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
  return <BlogClientComponent />
}
