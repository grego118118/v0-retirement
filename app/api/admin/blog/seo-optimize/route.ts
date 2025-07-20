/**
 * SEO Optimization API
 * Massachusetts Retirement System - Blog SEO Enhancement
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-config'
import { SEOOptimizer } from '@/lib/ai/seo-optimizer'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/admin/blog/seo-optimize
 * Optimize a blog post for SEO
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { post_id, target_keywords = [] } = body

    if (!post_id) {
      return NextResponse.json(
        { error: 'Post ID is required' },
        { status: 400 }
      )
    }

    // Get the blog post
    const post = await prisma.blogPost.findUnique({
      where: { id: post_id }
    })

    if (!post) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      )
    }

    console.log(`Optimizing SEO for post: ${post.title}`)

    // Optimize the content
    const optimization = await SEOOptimizer.optimizeContent(
      post.content,
      post.title,
      target_keywords
    )

    // Update the blog post with optimized content and SEO data
    const updatedPost = await prisma.blogPost.update({
      where: { id: post_id },
      data: {
        content: optimization.optimized_content,
        seoTitle: optimization.seo_optimization.meta_title,
        seoDescription: optimization.seo_optimization.meta_description,
        seoKeywords: optimization.seo_optimization.target_keywords,
        internalLinksAdded: true,
        seo_optimized: true,
        updated_at: new Date()
      }
    })

    console.log(`SEO optimization completed for post: ${post_id}`)

    return NextResponse.json({
      success: true,
      post: {
        id: updatedPost.id,
        title: updatedPost.title,
        seo_title: updatedPost.seoTitle,
        seo_description: updatedPost.seoDescription,
        seo_keywords: updatedPost.seoKeywords,
        internal_links_added: updatedPost.internalLinksAdded,
        seo_optimized: updatedPost.seoOptimized
      },
      optimization_details: {
        improvements_made: optimization.improvements_made,
        internal_links: optimization.seo_optimization.internal_links.length,
        external_links: optimization.seo_optimization.external_links.length,
        keyword_density: optimization.seo_optimization.keyword_density,
        readability_improvements: optimization.seo_optimization.readability_improvements
      },
      message: `SEO optimization completed with ${optimization.improvements_made.length} improvements`
    })

  } catch (error) {
    console.error('SEO optimization error:', error)
    return NextResponse.json(
      { 
        error: 'SEO optimization failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}



/**
 * GET /api/admin/blog/seo-optimize/analysis
 * Analyze SEO performance of blog posts
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const postId = searchParams.get('post_id')

    if (postId) {
      // Analyze specific post
      const post = await prisma.blogPost.findUnique({
        where: { id: postId }
      })

      if (!post) {
        return NextResponse.json(
          { error: 'Post not found' },
          { status: 404 }
        )
      }

      // Generate SEO analysis
      const analysis = await analyzeSEOPerformance(post)

      return NextResponse.json({
        post: {
          id: post.id,
          title: post.title,
          seo_optimized: post.seoOptimized,
          internal_links_added: post.internalLinksAdded
        },
        analysis
      })

    } else {
      // Get overall SEO statistics
      const stats = await getSEOStatistics()
      return NextResponse.json(stats)
    }

  } catch (error) {
    console.error('SEO analysis error:', error)
    return NextResponse.json(
      { error: 'SEO analysis failed' },
      { status: 500 }
    )
  }

/**
 * Analyze SEO performance of a specific post
 */
async function analyzeSEOPerformance(post: any) {
    const analysis = {
      seo_score: 0,
      issues: [] as string[],
      recommendations: [] as string[],
      keyword_analysis: {},
      structure_analysis: {},
      link_analysis: {}
    }

    // Title analysis
    if (!post.seo_title || post.seo_title.length < 30) {
      analysis.issues.push('SEO title is too short')
      analysis.recommendations.push('Create a descriptive SEO title (30-60 characters)')
    } else if (post.seo_title.length > 60) {
      analysis.issues.push('SEO title is too long')
      analysis.recommendations.push('Shorten SEO title to under 60 characters')
    } else {
      analysis.seo_score += 20
    }

    // Description analysis
    if (!post.seo_description || post.seo_description.length < 120) {
      analysis.issues.push('SEO description is too short')
      analysis.recommendations.push('Create a compelling meta description (120-160 characters)')
    } else if (post.seo_description.length > 160) {
      analysis.issues.push('SEO description is too long')
      analysis.recommendations.push('Shorten meta description to under 160 characters')
    } else {
      analysis.seo_score += 20
    }

    // Keywords analysis
    if (!post.seo_keywords || post.seo_keywords.length === 0) {
      analysis.issues.push('No SEO keywords defined')
      analysis.recommendations.push('Add relevant SEO keywords')
    } else {
      analysis.seo_score += 15
    }

    // Content structure analysis
    const hasHeadings = post.content.includes('##')
    const hasLists = post.content.includes('- ') || post.content.includes('* ')
    const wordCount = post.content.split(/\s+/).length

    if (!hasHeadings) {
      analysis.issues.push('No subheadings found')
      analysis.recommendations.push('Add H2 and H3 headings to improve structure')
    } else {
      analysis.seo_score += 15
    }

    if (!hasLists) {
      analysis.recommendations.push('Consider adding bullet points or numbered lists')
    } else {
      analysis.seo_score += 10
    }

    if (wordCount < 500) {
      analysis.issues.push('Content is too short')
      analysis.recommendations.push('Expand content to at least 500 words')
    } else if (wordCount > 2000) {
      analysis.recommendations.push('Consider breaking long content into multiple posts')
    } else {
      analysis.seo_score += 20
    }

    // Internal linking analysis
    if (!post.internal_links_added) {
      analysis.issues.push('No internal links added')
      analysis.recommendations.push('Add internal links to related content and tools')
    }

    return analysis
  }

/**
 * Get overall SEO statistics
 */
async function getSEOStatistics() {
    const [
      totalPosts,
      optimizedPosts,
      postsWithInternalLinks,
      postsWithSEOTitles,
      postsWithSEODescriptions,
      postsWithKeywords
    ] = await Promise.all([
      prisma.blogPost.count(),
      prisma.blogPost.count({ where: { seoOptimized: true } }),
      prisma.blogPost.count({ where: { internalLinksAdded: true } }),
      prisma.blogPost.count({ where: { seoTitle: { not: null } } }),
      prisma.blogPost.count({ where: { seoDescription: { not: null } } }),
      prisma.blogPost.count({ where: { seoKeywords: { isEmpty: false } } })
    ])

    const optimizationRate = totalPosts > 0 ? (optimizedPosts / totalPosts) * 100 : 0

    return {
      total_posts: totalPosts,
      seo_optimized: optimizedPosts,
      optimization_rate: Math.round(optimizationRate),
      internal_links_coverage: Math.round((postsWithInternalLinks / totalPosts) * 100),
      seo_titles_coverage: Math.round((postsWithSEOTitles / totalPosts) * 100),
      seo_descriptions_coverage: Math.round((postsWithSEODescriptions / totalPosts) * 100),
      keywords_coverage: Math.round((postsWithKeywords / totalPosts) * 100),
      recommendations: [
        optimizationRate < 50 ? 'Focus on optimizing more posts for SEO' : null,
        (postsWithInternalLinks / totalPosts) < 0.7 ? 'Add more internal links to improve site structure' : null,
        (postsWithSEOTitles / totalPosts) < 0.8 ? 'Ensure all posts have optimized SEO titles' : null
      ].filter(Boolean)
    }
  }
}
