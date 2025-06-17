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
import "../blog.css"

export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"

interface PageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const post = blogPosts.find((p) => p.id === slug)

  if (!post) {
    return {
      title: "Post Not Found",
    }
  }

  return generateSEOMetadata({
    title: post.title,
    description: post.description,
    path: `/blog/${post.id}`,
    keywords: post.tags,
    ogImage: post.image || "/images/blog/default-blog-image.svg",
  })
}

export default async function BlogPost({ params }: PageProps) {
  const { slug } = await params
  const post = blogPosts.find((p) => p.id === slug)

  if (!post) {
    notFound()
  }

  // Get related posts (same category, excluding current post)
  const relatedPosts = blogPosts
    .filter((p) => p.category === post.category && p.id !== post.id)
    .slice(0, 3)

  // Check if this is the SSFA post to insert timeline
  const isSSFAPost = post.id === "social-security-fairness-act-what-massachusetts-state-employees-need-to-know"

  // Split content for timeline insertion
  let contentBefore = post.content
  let contentAfter = ""

  if (isSSFAPost) {
    const timelineMarker = "<!-- TIMELINE_INSERTION_POINT -->"
    const parts = post.content.split(timelineMarker)
    contentBefore = parts[0] || post.content
    contentAfter = parts[1] || ""
  }

  return (
    <BlogPostClient post={post} relatedPosts={relatedPosts}>
      <div className="mrs-page-wrapper">
        <div className="mrs-content-container py-8 md:py-12">
          <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <Link
              href="/blog"
              prefetch={true}
              className="text-muted-foreground hover:text-primary flex items-center gap-1 mb-8 transition-colors no-underline"
              scroll={false}
            >
              <ArrowLeft className="h-4 w-4" /> Back to all articles
            </Link>

            <div className="max-w-4xl mx-auto">
              <Badge className="mb-6">{post.category}</Badge>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 leading-tight">{post.title}</h1>

              <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed">{post.description}</p>

              <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground mb-8">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span className="font-medium">{post.author}</span>
                  <span className="text-xs">•</span>
                  <span className="text-xs">{post.authorTitle}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  <span>{new Date(post.date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{post.readTime}</span>
                </div>
              </div>

              <div className="relative h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] mb-12 rounded-xl overflow-hidden shadow-2xl">
                <BlogHeroImage
                  src={post.image || "/images/blog/default-blog-image.svg"}
                  alt={`${post.title} - ${post.description}`}
                  title={post.title}
                  priority={true}
                />
              </div>

              <div className="flex justify-between items-center mb-12">
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="flex items-center gap-1 px-3 py-1">
                      <Tag className="h-3 w-3" /> {tag}
                    </Badge>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" title="Share article" className="h-10 w-10">
                    <Share2 className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon" title="Bookmark article" className="h-10 w-10">
                    <Bookmark className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Wrap the article and table of contents in a flex container */}
          <div className="flex flex-col lg:flex-row gap-12">
            {/* Article Content */}
            <article className="blog-content mb-16 flex-grow min-w-0">
              {/* First part of content */}
              <div dangerouslySetInnerHTML={{ __html: contentBefore }} />

              {/* Insert timeline for SSFA post */}
              {isSSFAPost && (
                <div className="my-12">
                  <WepGpoTimeline />
                </div>
              )}

              {/* Rest of content */}
              {contentAfter && <div dangerouslySetInnerHTML={{ __html: contentAfter }} />}
            </article>

            {/* Table of Contents - Hidden on mobile, sticky on desktop */}
            <aside className="hidden lg:block lg:w-80 flex-shrink-0">
              <div className="sticky top-24">
                <TableOfContents />
              </div>
            </aside>
          </div>

          {/* Author Bio */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-muted/30 to-muted/10 p-8 rounded-xl mb-16 border border-border/50">
              <div className="flex items-start gap-6">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="h-10 w-10 text-primary" />
                </div>
                <div className="flex-grow">
                  <h3 className="font-bold text-xl mb-2">{post.author}</h3>
                  <p className="text-muted-foreground mb-4 font-medium">{post.authorTitle}</p>
                  <p className="text-base leading-relaxed">
                    Expert in Massachusetts retirement planning with over 10 years of experience helping state employees
                    optimize their pension and Social Security benefits. Specializes in complex benefit calculations and
                    retirement income optimization strategies.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Related Articles */}
          {relatedPosts.length > 0 && (
            <div className="max-w-6xl mx-auto mb-16">
              <h2 className="text-3xl font-bold mb-8 text-center">Related Articles</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {relatedPosts.map((relatedPost) => (
                  <div key={relatedPost.id} className="border border-border/50 rounded-xl overflow-hidden h-full flex flex-col hover:shadow-lg transition-all duration-300 hover:border-primary/20">
                    <RelatedPostImage
                      src={relatedPost.image || "/images/blog/default-blog-image.svg"}
                      alt={relatedPost.title}
                      title={relatedPost.title}
                    />
                    <div className="p-6 flex flex-col flex-grow">
                      <Badge variant="outline" className="mb-3 w-fit">
                        {relatedPost.category}
                      </Badge>
                      <h3 className="font-bold mb-3 text-lg leading-tight">
                        <Link
                          href={`/blog/${relatedPost.id}`}
                          className="hover:text-primary transition-colors no-underline"
                          prefetch={true}
                          scroll={false}
                        >
                          {relatedPost.title}
                        </Link>
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4 flex-grow line-clamp-3 leading-relaxed">
                        {relatedPost.description}
                      </p>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <CalendarIcon className="h-4 w-4" />
                          {new Date(relatedPost.date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {relatedPost.readTime}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Newsletter Signup */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 rounded-xl p-8 text-center">
              <h3 className="text-2xl font-bold mb-4">Stay Updated on Massachusetts Pension News</h3>
              <p className="text-muted-foreground mb-6 text-lg leading-relaxed max-w-2xl mx-auto">
                Get the latest updates on Massachusetts state pension benefits, policy changes, and retirement planning
                tips delivered to your inbox.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 h-12 text-base"
                />
                <Button className="h-12 px-8 text-base font-semibold">Subscribe</Button>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                We respect your privacy. Unsubscribe at any time.
              </p>
            </div>
          </div>
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
