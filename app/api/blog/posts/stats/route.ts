/**
 * Blog Statistics API
 * Massachusetts Retirement System - Blog Stats
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/blog/posts/stats
 * Get blog statistics
 */
export async function GET(request: NextRequest) {
  try {
    const [
      totalPosts,
      aiGeneratedPosts,
      publishedToday,
      totalViews,
      avgQualityScore
    ] = await Promise.all([
      prisma.blogPost.count({
        where: { status: 'published' }
      }),
      prisma.blogPost.count({
        where: { 
          status: 'published',
          isAiGenerated: true 
        }
      }),
      prisma.blogPost.count({
        where: {
          status: 'published',
          publishedAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      }),
      prisma.blogPost.aggregate({
        where: { status: 'published' },
        _sum: { viewCount: true }
      }),
      prisma.blogPost.aggregate({
        where: { 
          status: 'published',
          contentQualityScore: { not: null }
        },
        _avg: { contentQualityScore: true }
      })
    ])

    return NextResponse.json({
      total_posts: totalPosts,
      ai_generated_posts: aiGeneratedPosts,
      ai_percentage: totalPosts > 0 ? Math.round((aiGeneratedPosts / totalPosts) * 100) : 0,
      published_today: publishedToday,
      total_views: totalViews._sum.viewCount || 0,
      average_quality_score: avgQualityScore._avg.contentQualityScore 
        ? Math.round(avgQualityScore._avg.contentQualityScore) 
        : null
    })

  } catch (error) {
    console.error('Error fetching blog stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch blog statistics' },
      { status: 500 }
    )
  }
}
