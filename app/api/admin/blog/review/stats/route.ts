/**
 * Blog Review Statistics API
 * Massachusetts Retirement System - Review Stats
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-config'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/admin/blog/review/stats
 * Get review statistics
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const stats = await prisma.$transaction(async (tx) => {
      const [
        totalPending,
        totalApproved,
        totalRejected,
        totalNeedsChanges,
        recentReviews
      ] = await Promise.all([
        tx.blogPost.count({
          where: {
            isAiGenerated: true,
            factCheckStatus: 'pending'
          }
        }),
        tx.blogPost.count({
          where: {
            isAiGenerated: true,
            factCheckStatus: 'approved'
          }
        }),
        tx.blogPost.count({
          where: {
            isAiGenerated: true,
            factCheckStatus: 'rejected'
          }
        }),
        tx.blogPost.count({
          where: {
            isAiGenerated: true,
            factCheckStatus: 'needs_review'
          }
        }),
        tx.contentReview.findMany({
          take: 10,
          orderBy: {
            reviewedAt: 'desc'
          },
          include: {
            post: {
              select: {
                title: true,
                slug: true
              }
            }
          }
        })
      ])

      return {
        pending: totalPending,
        approved: totalApproved,
        rejected: totalRejected,
        needs_changes: totalNeedsChanges,
        total: totalPending + totalApproved + totalRejected + totalNeedsChanges,
        recent_reviews: recentReviews
      }
    })

    return NextResponse.json(stats)

  } catch (error) {
    console.error('Error fetching review stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch review statistics' },
      { status: 500 }
    )
  }
}
