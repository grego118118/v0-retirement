import { Input } from "@/components/ui/input"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, Clock, ArrowLeft, Share2, Bookmark, User, Tag } from "lucide-react"
import { blogPosts } from "@/lib/blog-data"
import BlogPostClient from "./page-client"
// Import the TableOfContents component
import { TableOfContents } from "@/components/blog/table-of-contents"
import { WepGpoTimeline } from "@/components/blog/wep-gpo-timeline"
import { generateSEOMetadata } from "@/components/seo/metadata"
import { BlogHeroImage, RelatedPostImage } from "@/components/blog/blog-image"
import { CalculatorCTA } from "@/components/blog/calculator-cta"
import { ResponsiveAd, PremiumAlternative } from "@/components/ads/adsense"

export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"

interface PageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const post = blogPosts.find((post) => post.id === slug)

  if (!post) {
    return generateSEOMetadata({
      title: "Blog Post Not Found",
      description: "The requested blog post could not be found.",
      path: `/blog/${slug}`,
    })
  }

  return generateSEOMetadata({
    title: `${post.title} | Massachusetts Pension Estimator`,
    description: post.description,
    path: `/blog/${post.id}`,
    keywords: post.tags,
  })
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params
  const post = blogPosts.find((post) => post.id === slug)

  if (!post) {
    notFound()
  }

  const relatedPosts = post.relatedPosts ? blogPosts.filter((p) => post.relatedPosts?.includes(p.id)) : []

  // Check if this is the Social Security Fairness Act post
  const isSSFAPost = post.id === "social-security-fairness-act-what-massachusetts-state-employees-need-to-know"

  // Split the content to insert the timeline for the SSFA post
  let contentBefore = post.content
  let contentAfter = ""

  if (isSSFAPost) {
    // Find a good insertion point after the "Implementation Timeline" section
    const insertPoint = post.content.indexOf("<h2>Implementation Progress and What to Expect</h2>")
    if (insertPoint !== -1) {
      contentBefore = post.content.substring(0, insertPoint)
      contentAfter = post.content.substring(insertPoint)
    }
  }

  return (
    <BlogPostClient post={post} relatedPosts={relatedPosts}>
      <div className="container py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <Link
              href="/blog"
              prefetch={true}
              className="text-muted-foreground hover:text-primary flex items-center gap-1 mb-6 transition-colors no-underline"
              scroll={false}
            >
              <ArrowLeft className="h-4 w-4" /> Back to all articles
            </Link>

            <Badge className="mb-4">{post.category}</Badge>

            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">{post.title}</h1>

            <p className="text-xl text-muted-foreground mb-6">{post.description}</p>

            <div className="flex flex-wrap items-center gap-4 mb-8">
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{post.author}</p>
                  <p className="text-sm text-muted-foreground">{post.authorTitle}</p>
                </div>
              </div>

              <div className="flex items-center text-sm text-muted-foreground">
                <CalendarIcon className="mr-1 h-3 w-3" /> {post.date}
                <span className="mx-2">•</span>
                <Clock className="mr-1 h-3 w-3" /> {post.readTime}
              </div>
            </div>

            <BlogHeroImage
              src={post.image || "/images/blog/default-blog-image.svg"}
              alt={post.title}
              title={post.title}
              priority={true}
            />

            <div className="flex justify-between items-center mb-8">
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="flex items-center gap-1">
                    <Tag className="h-3 w-3" /> {tag}
                  </Badge>
                ))}
              </div>

              <div className="flex gap-2">
                <Button variant="ghost" size="icon" title="Share article">
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" title="Bookmark article">
                  <Bookmark className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Compact Calculator CTA */}
          <div className="mb-8">
            <CalculatorCTA variant="compact" />
          </div>

          {/* Wrap the article and table of contents in a flex container */}
          <div className="flex flex-col lg:flex-row">
            {/* Article Content */}
            <article className="blog-content mb-12 flex-grow">
              {/* First part of content */}
              <div dangerouslySetInnerHTML={{ __html: contentBefore }} />

              {/* Insert timeline for SSFA post */}
              {isSSFAPost && <WepGpoTimeline />}

              {/* Rest of content */}
              {contentAfter && <div dangerouslySetInnerHTML={{ __html: contentAfter }} />}
            </article>

            {/* Table of Contents */}
            <TableOfContents />
          </div>

          {/* Calculator CTA */}
          <div className="mb-12">
            <CalculatorCTA variant="default" />
          </div>

          {/* AdSense Ad for Free Users */}
          <div className="mb-12">
            <ResponsiveAd className="flex justify-center" />
            <PremiumAlternative />
          </div>



          {/* Related Articles */}
          {relatedPosts.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-semibold mb-6">Related Articles</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedPosts.map((relatedPost) => (
                  <div key={relatedPost.id} className="border rounded-lg overflow-hidden h-full flex flex-col">
                    <RelatedPostImage
                      src={relatedPost.image || "/images/blog/default-blog-image.svg"}
                      alt={relatedPost.title}
                      title={relatedPost.title}
                    />
                    <div className="p-4 flex flex-col flex-grow">
                      <Badge variant="outline" className="mb-2 w-fit">
                        {relatedPost.category}
                      </Badge>
                      <h3 className="font-semibold mb-2 text-sm leading-tight">
                        <Link
                          href={`/blog/${relatedPost.id}`}
                          className="hover:text-primary transition-colors"
                          prefetch={true}
                        >
                          {relatedPost.title}
                        </Link>
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-2 flex-grow">
                        {relatedPost.description}
                      </p>
                      <div className="flex items-center text-xs text-muted-foreground mt-2 pt-2 border-t">
                        <CalendarIcon className="mr-1 h-3 w-3" /> {relatedPost.date}
                        <span className="mx-2">•</span>
                        <Clock className="mr-1 h-3 w-3" /> {relatedPost.readTime}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Comments Section */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-6">Comments</h2>
            <div className="space-y-6">
              <div className="border rounded-lg p-6 bg-muted/30">
                <p className="text-muted-foreground text-center">
                  Comments are currently disabled. For questions about your Massachusetts state pension, please{" "}
                  <Link href="/contact" className="text-primary hover:underline">
                    contact us
                  </Link>{" "}
                  or use our{" "}
                  <Link href="/calculator" className="text-primary hover:underline">
                    pension calculator
                  </Link>
                  .
                </p>
              </div>
            </div>
          </div>

          {/* Newsletter Signup */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-2">Stay Updated on Massachusetts Pension News</h3>
            <p className="text-muted-foreground mb-4">
              Get the latest updates on Massachusetts state pension benefits, policy changes, and retirement planning
              tips delivered to your inbox.
            </p>
            <div className="flex gap-2">
              <Input type="email" placeholder="Enter your email" className="flex-1" />
              <Button>Subscribe</Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              We respect your privacy. Unsubscribe at any time.
            </p>
          </div>
        </div>
      </div>
    </BlogPostClient>
  )
}

export async function generateStaticParams() {
  return blogPosts.map((post) => ({
    slug: post.id,
  }))
}
