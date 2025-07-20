"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CalendarIcon, Clock, User, ArrowRight, Bot, Sparkles, TrendingUp, Star } from 'lucide-react'
import { ResponsiveBlogImage } from './blog-image'
import { ResponsiveAd, PremiumAlternative } from '@/components/ads/adsense'
import { BlogPost } from '../../types/ai-blog'
import { blogPosts } from '@/lib/blog-data'

interface EnhancedBlogGridProps {
  posts?: BlogPost[]
  selectedCategory?: string
  searchQuery?: string
  showAIGenerated?: boolean
}

export function EnhancedBlogGrid({ 
  posts = [], 
  selectedCategory = 'all',
  searchQuery = '',
  showAIGenerated = true 
}: EnhancedBlogGridProps) {
  const [displayPosts, setDisplayPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadBlogPosts()
  }, [selectedCategory, searchQuery, showAIGenerated])

  const loadBlogPosts = async () => {
    try {
      setLoading(true)
      
      // Convert static blog data to BlogPost format and apply filters
      let filteredPosts = blogPosts.map(post => ({
        id: post.id,
        title: post.title,
        slug: post.id, // Use id as slug for routing consistency
        content: post.content,
        excerpt: post.description,
        featured_image_url: post.image || '/images/blog/default-blog-image.svg',
        status: 'published' as const,
        published_at: new Date(post.date).toISOString(),
        created_at: new Date(post.date).toISOString(),
        updated_at: new Date(post.date).toISOString(),
        view_count: Math.floor(Math.random() * 2000) + 500, // Mock view count
        is_ai_generated: false, // Static posts are not AI generated
        fact_check_status: 'approved' as const,
        seo_optimized: true,
        internal_links_added: true,
        seo_title: post.title,
        seo_description: post.description,
        seo_keywords: post.tags
      }))

      // Apply category filter
      if (selectedCategory && selectedCategory !== 'all') {
        filteredPosts = filteredPosts.filter(post => {
          const originalPost = blogPosts.find(bp => bp.id === post.id)
          return originalPost?.category === selectedCategory
        })
      }

      // Apply search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        filteredPosts = filteredPosts.filter(post =>
          post.title.toLowerCase().includes(query) ||
          post.excerpt?.toLowerCase().includes(query) ||
          post.seo_keywords?.some(keyword => keyword.toLowerCase().includes(query))
        )
      }

      // For now, we'll show all posts since they're not AI generated
      // In the future, this would filter based on showAIGenerated
      
      setDisplayPosts(filteredPosts)
      setError(null)
    } catch (err) {
      setError('Failed to load blog posts')
      console.error('Error loading blog posts:', err)
    } finally {
      setLoading(false)
    }
  }

  const getQualityBadge = (score?: number) => {
    if (!score) return null
    
    if (score >= 90) {
      return <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
        <Star className="w-3 h-3 mr-1" />
        Excellent
      </Badge>
    } else if (score >= 80) {
      return <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">
        <TrendingUp className="w-3 h-3 mr-1" />
        High Quality
      </Badge>
    }
    return null
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="overflow-hidden animate-pulse">
            <div className="h-48 bg-gray-200"></div>
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-6 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </CardHeader>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={loadBlogPosts} variant="outline">
          Try Again
        </Button>
      </div>
    )
  }

  if (displayPosts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">No blog posts found matching your criteria.</p>
        <Button onClick={() => {
          setDisplayPosts([])
          loadBlogPosts()
        }} variant="outline">
          Reset Filters
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Blog Posts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayPosts.map((post, index) => (
          <Card key={post.id} className="overflow-hidden flex flex-col h-full hover:shadow-lg transition-shadow">
            <ResponsiveBlogImage
              src={post.featured_image_url || "/images/blog/default-blog-image.svg"}
              alt={post.title}
              aspectRatio="16/9"
              priority={index < 3}
            />
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                {post.is_ai_generated && (
                  <Badge variant="outline" className="text-purple-600 border-purple-200 bg-purple-50">
                    <Bot className="w-3 h-3 mr-1" />
                    AI Generated
                  </Badge>
                )}
                {getQualityBadge(post.content_quality_score)}
              </div>
              <CardTitle className="text-lg leading-tight line-clamp-2 mb-2">
                {post.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                {post.excerpt}
              </p>
              <div className="flex items-center text-xs text-muted-foreground mb-2">
                <CalendarIcon className="mr-1 h-3 w-3" />
                {formatDate(post.published_at || post.created_at)}
                <span className="mx-2">•</span>
                <Clock className="mr-1 h-3 w-3" />
                {Math.ceil((post.content?.length || 1000) / 200)} min read
                <span className="mx-2">•</span>
                <User className="mr-1 h-3 w-3" />
                {post.view_count} views
              </div>
            </CardContent>
            <CardFooter className="pt-2 mt-auto">
              <Button variant="ghost" size="sm" asChild className="gap-1 hover:no-underline group">
                <Link
                  href={`/blog/${post.slug}`}
                  className="flex items-center no-underline"
                  prefetch={true}
                >
                  Read more <span className="sr-only">about {post.title}</span>
                  <ArrowRight className="h-3 w-3 ml-1 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* AdSense Ad Placement (every 6 posts) */}
      {displayPosts.length > 6 && (
        <div className="flex justify-center my-8">
          <ResponsiveAd className="max-w-2xl" />
          <PremiumAlternative />
        </div>
      )}

      {/* Load More Button (for future pagination) */}
      {displayPosts.length >= 20 && (
        <div className="text-center">
          <Button variant="outline" size="lg">
            Load More Articles
          </Button>
        </div>
      )}
    </div>
  )
}
