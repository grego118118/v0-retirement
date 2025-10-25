/**
 * Blog Categories API
 * Massachusetts Retirement System - Blog Categories
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/blog/posts/categories
 * Get blog categories with post counts
 */
export async function GET(request: NextRequest) {
  try {
    const categories = await prisma.blogCategory.findMany({
      include: {
        posts: {
          include: {
            post: {
              select: {
                status: true
              }
            }
          }
        }
      },
      orderBy: {
        sortOrder: 'asc'
      }
    })

    const formattedCategories = categories.map(category => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      color: category.color,
      icon: category.icon,
      sort_order: category.sortOrder,
      is_ai_topic: category.isAiTopic,
      created_at: category.createdAt,
      post_count: category.posts?.filter(pc => pc.post.status === 'published').length || 0
    }))

    return NextResponse.json({
      categories: formattedCategories
    })

  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}
