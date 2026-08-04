import type { MetadataRoute } from "next"
import { blogPosts } from "@/lib/blog-data"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://www.masspension.com"
  // Stable content-revision date for static pages. Bump this when static pages
  // meaningfully change. Using a fixed date (rather than `new Date()`) keeps
  // <lastmod> honest so search engines don't learn to ignore it.
  const lastModified = new Date("2026-07-01")

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
      url: `${baseUrl}/teachers`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.95,
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
    {
      url: `${baseUrl}/resources/benefit-factors`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.8,
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

  // Blog posts: static posts are always included; DB posts are merged in
  // (deduped by slug). Previously DB posts *replaced* the static list, which
  // silently dropped any post that only exists in lib/blog-data.ts.
  const blogPostUrls: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${baseUrl}/blog/${post.id}`,
    lastModified: post.date ? new Date(post.date) : lastModified,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }))

  try {
    // Dynamic import to avoid build-time static errors if DB not present
    const { prisma } = await import("@/lib/prisma")
    const dbPosts = await prisma.blogPost.findMany({
      where: { status: 'published' },
      select: { slug: true, publishedAt: true }
    })

    const staticIds = new Set(blogPosts.map((post) => post.id))
    for (const post of dbPosts) {
      if (!staticIds.has(post.slug)) {
        blogPostUrls.push({
          url: `${baseUrl}/blog/${post.slug}`,
          lastModified: post.publishedAt || lastModified,
          changeFrequency: "monthly" as const,
          priority: 0.7,
        })
      }
    }
  } catch (e) {
    console.warn("Sitemap: DB unavailable, using static posts only")
  }

  return [...staticPages, ...resourcePages, ...blogPages, ...blogPostUrls, ...utilityPages]
}
