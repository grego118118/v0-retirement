import type { MetadataRoute } from "next"
import { blogPosts } from "@/lib/blog-data"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://www.masspension.com"
  const lastModified = new Date()

  // Static high-priority pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/calculator`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/ssfa-auditor`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/tax-bomb`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/wizard`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/social-security`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/guides`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.85,
    },
    {
      url: `${baseUrl}/about`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/resources`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/checklist`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.75,
    },
    {
      url: `${baseUrl}/methodology`,
      lastModified,
      changeFrequency: "yearly" as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/benefits`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/financial-literacy`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.65,
    },
    {
      url: `${baseUrl}/webinars`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.65,
    },
    {
      url: `${baseUrl}/events`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified,
      changeFrequency: "yearly" as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified,
      changeFrequency: "yearly" as const,
      priority: 0.4,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified,
      changeFrequency: "yearly" as const,
      priority: 0.4,
    },
    {
      url: `${baseUrl}/accessibility`,
      lastModified,
      changeFrequency: "yearly" as const,
      priority: 0.4,
    },
    {
      url: `${baseUrl}/editorial-policy`,
      lastModified,
      changeFrequency: "yearly" as const,
      priority: 0.4,
    },
  ]

  // Resource sub-pages
  const resourcePages = [
    {
      url: `${baseUrl}/resources/groups`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.75,
    },
    {
      url: `${baseUrl}/resources/cola`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.75,
    },
    {
      url: `${baseUrl}/resources/options`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.75,
    },
    {
      url: `${baseUrl}/resources/wep-gpo`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.75,
    },
  ]

  // Blog index page
  const blogPages = [
    {
      url: `${baseUrl}/blog`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
  ]

  // Utility pages for specific retirement groups
  const utilityPages = [
    {
      url: `${baseUrl}/calculator/group-1`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/calculator/group-2`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/calculator/group-3`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/calculator/group-4`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
  ]

  // Dynamic blog posts - Try DB first, fallback to static
  let blogPostUrls: MetadataRoute.Sitemap = []

  try {
    // Dynamic import to avoid build-time static errors if DB not present
    const { prisma } = await import("@/lib/prisma")
    const dbPosts = await prisma.blogPost.findMany({
      where: { status: 'published' },
      select: { slug: true, publishedAt: true }
    })

    if (dbPosts.length > 0) {
      blogPostUrls = dbPosts.map((post: { slug: string; publishedAt: Date | null }) => ({
        url: `${baseUrl}/blog/${post.slug}`,
        lastModified: post.publishedAt || lastModified,
        changeFrequency: "monthly" as const,
        priority: 0.7,
      }))
    }
  } catch (e) {
    console.warn("Sitemap: Failed to fetch from DB, using static fallback")
  }

  // Fallback to static if DB empty or failed
  if (blogPostUrls.length === 0) {
    blogPostUrls = blogPosts.map((post) => ({
      url: `${baseUrl}/blog/${post.id}`,
      lastModified: post.date ? new Date(post.date) : lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }))
  }

  return [...staticPages, ...resourcePages, ...blogPages, ...blogPostUrls, ...utilityPages]
}
