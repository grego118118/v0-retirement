import type { Metadata } from "next"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, Clock, Search, User, ArrowRight } from "lucide-react"
import { generateSEOMetadata } from "@/components/seo/metadata"
import { blogPosts } from "@/lib/blog-data"

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
  return (
    <div className="container py-8 md:py-12">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Retirement Planning Blog</h1>
        <p className="text-muted-foreground mb-8 max-w-3xl">
          Expert articles, guides, and resources to help Massachusetts state employees plan for retirement and maximize
          their pension benefits.
        </p>

        {/* Search Bar */}
        <div className="relative mb-8">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search articles..." className="pl-10" aria-label="Search articles" />
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2 mb-8">
          <Badge variant="outline" className="bg-primary/10 hover:bg-primary/20 cursor-pointer">
            All Topics
          </Badge>
          <Badge variant="outline" className="hover:bg-primary/20 cursor-pointer">
            Pension Basics
          </Badge>
          <Badge variant="outline" className="hover:bg-primary/20 cursor-pointer">
            Planning
          </Badge>
          <Badge variant="outline" className="hover:bg-primary/20 cursor-pointer">
            Strategies
          </Badge>
          <Badge variant="outline" className="hover:bg-primary/20 cursor-pointer">
            Social Security
          </Badge>
          <Badge variant="outline" className="hover:bg-primary/20 cursor-pointer">
            Healthcare
          </Badge>
          <Badge variant="outline" className="hover:bg-primary/20 cursor-pointer">
            Legal
          </Badge>
        </div>

        {/* Featured Post */}
        <div className="mb-12">
          <Card className="overflow-hidden">
            <div className="grid md:grid-cols-2 gap-0">
              <div className="relative h-48 md:h-full bg-muted">
                <img
                  src="/social-security-fairness-act.jpg"
                  alt="Social Security Fairness Act: What Massachusetts State Employees Need to Know"
                  className="object-cover w-full h-full"
                  loading="eager"
                  fetchPriority="high"
                />
              </div>
              <div className="p-6">
                <Badge className="mb-2">Featured</Badge>
                <h2 className="text-2xl font-bold mb-2">
                  Social Security Fairness Act: What Massachusetts State Employees Need to Know
                </h2>
                <p className="text-muted-foreground mb-4">
                  Learn how the elimination of WEP and GPO provisions will increase Social Security benefits for
                  Massachusetts state employees and retirees.
                </p>
                <div className="flex items-center text-sm text-muted-foreground mb-4">
                  <CalendarIcon className="mr-1 h-3 w-3" /> May 9, 2025
                  <span className="mx-2">•</span>
                  <Clock className="mr-1 h-3 w-3" /> 8 min read
                </div>
                <Button asChild>
                  <Link
                    href="/blog/social-security-fairness-act-what-massachusetts-state-employees-need-to-know"
                    prefetch={true}
                    scroll={false}
                    className="no-underline"
                  >
                    Read Article
                  </Link>
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogPosts.slice(1).map((post) => (
            <Card key={post.id} className="overflow-hidden flex flex-col h-full">
              <div className="relative h-48 bg-muted">
                <img
                  src={post.image || "/placeholder.svg"}
                  alt={post.title}
                  className="object-cover w-full h-full"
                  loading="lazy"
                />
              </div>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="bg-primary/10">
                    {post.category}
                  </Badge>
                </div>
                <CardTitle className="text-xl line-clamp-2">
                  <Link
                    href={`/blog/${post.id}`}
                    className="hover:text-primary transition-colors no-underline"
                    prefetch={true}
                    scroll={false}
                  >
                    {post.title}
                  </Link>
                </CardTitle>
                <CardDescription className="line-clamp-3">{post.description}</CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="flex items-center text-sm text-muted-foreground">
                  <User className="mr-1 h-3 w-3" /> {post.author}
                  <span className="mx-2">•</span>
                  <CalendarIcon className="mr-1 h-3 w-3" /> {post.date}
                  <span className="mx-2">•</span>
                  <Clock className="mr-1 h-3 w-3" /> {post.readTime}
                </div>
              </CardContent>
              <CardFooter className="pt-2 mt-auto">
                <Button variant="ghost" size="sm" asChild className="gap-1 hover:no-underline group">
                  <Link
                    href={`/blog/${post.id}`}
                    className="flex items-center no-underline"
                    prefetch={true}
                    scroll={false}
                  >
                    Read more <span className="sr-only">about {post.title}</span>
                    <ArrowRight className="h-3 w-3 ml-1 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Newsletter Signup */}
        <div className="mt-12 bg-muted/30 p-6 rounded-lg border">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-xl font-semibold mb-2">Stay Updated on Retirement Planning</h2>
            <p className="text-muted-foreground mb-4">
              Subscribe to our newsletter to receive the latest retirement planning tips, pension updates, and resources
              for Massachusetts state employees.
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <Input placeholder="Your email address" type="email" className="sm:flex-1" />
              <Button>Subscribe</Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">We respect your privacy. Unsubscribe at any time.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
