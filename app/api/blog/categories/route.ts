/**
 * Blog Categories API
 * Massachusetts Retirement System - Category Management
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-config'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/blog/categories
 * Get all blog categories
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const includeInactive = searchParams.get('include_inactive') === 'true'
    
    // Check if prisma is available (might be null during build time)
    if (!prisma) {
      return NextResponse.json({
        success: true,
        categories: [],
        total: 0
      })
    }

    const categories = await prisma.blogCategory.findMany({
      where: includeInactive ? {} : { isActive: true },
      orderBy: [
        { sortOrder: 'asc' },
        { name: 'asc' }
      ],
      include: {
        posts: {
          select: {
            id: true
          }
        }
      }
    })

    // Add post counts
    const categoriesWithCounts = categories.map(category => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      color: category.color,
      icon: category.icon,
      sortOrder: category.sortOrder,
      isActive: category.isActive,
      isAiTopic: category.isAiTopic,
      postCount: category.posts.length,
      publishedPostCount: category.posts.length, // Simplified for now
      createdAt: category.createdAt,
      updatedAt: category.updatedAt
    }))

    return NextResponse.json({
      success: true,
      categories: categoriesWithCounts,
      total: categoriesWithCounts.length
    })

  } catch (error) {
    console.error('Categories API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch categories',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/blog/categories
 * Create a new blog category
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      name,
      slug,
      description,
      color,
      icon,
      sortOrder = 0,
      isActive = true,
      isAiTopic = false
    } = body

    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Name and slug are required' },
        { status: 400 }
      )
    }

    // Check if slug already exists
    const existingCategory = await prisma.blogCategory.findUnique({
      where: { slug }
    })

    if (existingCategory) {
      return NextResponse.json(
        { error: 'Category with this slug already exists' },
        { status: 409 }
      )
    }

    const category = await prisma.blogCategory.create({
      data: {
        name,
        slug,
        description,
        color,
        icon,
        sortOrder,
        isActive,
        isAiTopic
      }
    })

    return NextResponse.json({
      success: true,
      category,
      message: 'Category created successfully'
    })

  } catch (error) {
    console.error('Create category error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create category',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/blog/categories
 * Update an existing blog category
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      id,
      name,
      slug,
      description,
      color,
      icon,
      sortOrder,
      isActive,
      isAiTopic
    } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Category ID is required' },
        { status: 400 }
      )
    }

    // Check if category exists
    const existingCategory = await prisma.blogCategory.findUnique({
      where: { id }
    })

    if (!existingCategory) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }

    // Check if new slug conflicts with another category
    if (slug && slug !== existingCategory.slug) {
      const slugConflict = await prisma.blogCategory.findUnique({
        where: { slug }
      })

      if (slugConflict) {
        return NextResponse.json(
          { error: 'Category with this slug already exists' },
          { status: 409 }
        )
      }
    }

    const updatedCategory = await prisma.blogCategory.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(slug && { slug }),
        ...(description !== undefined && { description }),
        ...(color !== undefined && { color }),
        ...(icon !== undefined && { icon }),
        ...(sortOrder !== undefined && { sortOrder }),
        ...(isActive !== undefined && { isActive }),
        ...(isAiTopic !== undefined && { isAiTopic })
      }
    })

    return NextResponse.json({
      success: true,
      category: updatedCategory,
      message: 'Category updated successfully'
    })

  } catch (error) {
    console.error('Update category error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update category',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/blog/categories
 * Delete a blog category
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Category ID is required' },
        { status: 400 }
      )
    }

    // Check if category exists and has posts
    const category = await prisma.blogCategory.findUnique({
      where: { id },
      include: {
        posts: {
          select: { id: true }
        }
      }
    })

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }

    if (category.posts.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete category with existing posts' },
        { status: 409 }
      )
    }

    await prisma.blogCategory.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Category deleted successfully'
    })

  } catch (error) {
    console.error('Delete category error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete category',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
