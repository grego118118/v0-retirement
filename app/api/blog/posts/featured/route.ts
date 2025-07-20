/**
 * Featured Blog Posts API
 * Massachusetts Retirement System - Featured Posts
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/blog/posts/featured
 * Get featured blog posts
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '6')

    // Get top performing posts based on view count and quality score
    const featuredPosts = await prisma.blogPost.findMany({
      where: {
        status: 'published',
        publishedAt: {
          not: null
        }
      },
      include: {
        author: {
          select: {
            name: true,
            email: true
          }
        },
        categories: {
          include: {
            category: true
          }
        }
      },
      orderBy: [
        { viewCount: 'desc' },
        { contentQualityScore: 'desc' },
        { publishedAt: 'desc' }
      ],
      take: limit
    })

    const formattedPosts = featuredPosts.map(post => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      featured_image_url: post.featuredImageUrl,
      published_at: post.publishedAt,
      view_count: post.viewCount,
      reading_time: Math.ceil(post.content.split(' ').length / 200), // Calculate reading time from content
      content_quality_score: post.contentQualityScore,
      author: post.author,
      categories: post.categories.map(pc => pc.category)
    }))

    return NextResponse.json({
      featured_posts: formattedPosts,
      total: featuredPosts.length
    })

  } catch (error) {
    console.error('Error fetching featured posts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch featured posts' },
      { status: 500 }
    )
  }
}
