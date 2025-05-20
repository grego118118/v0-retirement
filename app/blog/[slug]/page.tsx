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

export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"

interface PageProps {
  params: {
    slug: string
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const post = blogPosts.find((post) => post.id === params.slug)

  if (!post) {
    return generateSEOMetadata({
      title: "Blog Post Not Found",
      description: "The requested blog post could not be found.",
      path: `/blog/${params.slug}`,
    })
  }

  return generateSEOMetadata({
    title: `${post.title} | Massachusetts Pension Estimator`,
    description: post.description,
    path: `/blog/${post.id}`,
    keywords: post.tags,
    openGraph: {
      images: [
        {
          url: post.image,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
  })
}

export default function BlogPostPage({ params }: PageProps) {
  const post = blogPosts.find((post) => post.id === params.slug)

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

            <div className="relative h-[300px] md:h-[400px] mb-8 rounded-lg overflow-hidden">
              <img
                src={post.image || "/placeholder.svg"}
                alt={post.title}
                className="object-cover w-full h-full"
                loading="eager"
                fetchPriority="high"
              />
            </div>

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

          {/* Author Bio */}
          <div className="bg-muted/30 p-6 rounded-lg border mb-12">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">About {post.author}</h3>
                <p className="text-sm text-muted-foreground mb-2">{post.authorTitle}</p>
                <p className="text-sm">
                  {post.author} is a {post.authorTitle.toLowerCase()} with over 15 years of experience helping
                  Massachusetts state employees navigate their pension benefits. They previously worked at the
                  Massachusetts State Retirement Board and now write about retirement planning strategies.
                </p>
              </div>
            </div>
          </div>

          {/* Related Articles */}
          {relatedPosts.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-semibold mb-6">Related Articles</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedPosts.map((relatedPost) => (
                  <div key={relatedPost.id} className="border rounded-lg overflow-hidden h-full flex flex-col">
                    <div className="relative h-40 bg-muted">
                      <img
                        src={relatedPost.image || "/placeholder.svg?height=200&width=400"}
                        alt={relatedPost.title}
                        className="object-cover w-full h-full"
                        loading="lazy"
                      />
                    </div>
                    <div className="p-4 flex flex-col flex-grow">
                      <Badge variant="outline" className="mb-2 w-fit">
                        {relatedPost.category}
                      </Badge>
                      <h3 className="font-semibold mb-2 line-clamp-2">
                        <Link
                          href={`/blog/${relatedPost.id}`}
                          className="hover:text-primary transition-colors no-underline"
                          prefetch={true}
                          scroll={false}
                        >
                          {relatedPost.title}
                        </Link>
                      </h3>
                      <div className="flex items-center text-xs text-muted-foreground mb-2">
                        <CalendarIcon className="mr-1 h-3 w-3" /> {relatedPost.date}
                        <span className="mx-1">•</span>
                        <Clock className="mr-1 h-3 w-3" /> {relatedPost.readTime}
                      </div>
                      <div className="mt-auto pt-2">
                        <Button variant="ghost" size="sm" asChild className="p-0 h-auto">
                          <Link
                            href={`/blog/${relatedPost.id}`}
                            scroll={false}
                            prefetch={true}
                            className="no-underline"
                          >
                            Read article
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Post Navigation */}
          <div className="flex justify-between items-center border-t pt-8 mb-12">
            {post.id !== blogPosts[0].id ? (
              <Button variant="outline" asChild>
                <Link
                  href={`/blog/${blogPosts[blogPosts.findIndex((p) => p.id === post.id) - 1].id}`}
                  className="flex items-center gap-2 no-underline"
                  prefetch={true}
                  scroll={false}
                >
                  <ArrowLeft className="h-4 w-4" /> Previous Post
                </Link>
              </Button>
            ) : (
              <div></div>
            )}

            {post.id !== blogPosts[blogPosts.length - 1].id ? (
              <Button variant="outline" asChild>
                <Link
                  href={`/blog/${blogPosts[blogPosts.findIndex((p) => p.id === post.id) + 1].id}`}
                  className="flex items-center gap-2 no-underline"
                  prefetch={true}
                  scroll={false}
                >
                  Next Post <ArrowLeft className="h-4 w-4 rotate-180" />
                </Link>
              </Button>
            ) : (
              <div></div>
            )}
          </div>

          {/* Newsletter Signup */}
          <div className="bg-primary/5 p-6 rounded-lg border border-primary/10">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">Get More Retirement Planning Tips</h2>
              <p className="text-muted-foreground mb-4 max-w-2xl mx-auto">
                Subscribe to our newsletter to receive the latest retirement planning tips, pension updates, and
                resources for Massachusetts state employees.
              </p>
              <div className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
                <Input placeholder="Your email address" type="email" className="sm:flex-1" />
                <Button>Subscribe</Button>
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
