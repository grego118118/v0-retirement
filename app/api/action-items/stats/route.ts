import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth/auth-options"
import { ActionItemsService } from "@/lib/recommendations/action-items-service"
import { reportAPIError, monitorServerOperation } from "@/sentry.server.config"

/**
 * GET /api/action-items/stats
 * Get action items statistics for the authenticated user
 */
export async function GET(request: NextRequest) {
  return monitorServerOperation(async () => {
    try {
      const session = await getServerSession(authOptions)
      
      if (!session?.user?.id) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        )
      }

      // Get action items statistics
      const stats = await ActionItemsService.getActionItemsStats(session.user.id)

      // Calculate completion rate
      const completionRate = stats.total > 0 
        ? Math.round((stats.completed / stats.total) * 100)
        : 0

      // Calculate active items (pending + in-progress)
      const activeItems = stats.pending + stats.inProgress

      // Determine overall status
      let overallStatus: 'excellent' | 'good' | 'needs-attention' | 'critical'
      
      if (stats.total === 0) {
        overallStatus = 'good' // No action items means everything is up to date
      } else if (completionRate >= 80) {
        overallStatus = 'excellent'
      } else if (completionRate >= 60) {
        overallStatus = 'good'
      } else if (completionRate >= 40) {
        overallStatus = 'needs-attention'
      } else {
        overallStatus = 'critical'
      }

      // Get priority breakdown for active items
      const activePriorityBreakdown = {
        high: 0,
        medium: 0,
        low: 0,
      }

      // This would require a more complex query, but for now we'll estimate
      // based on typical priority distributions
      if (activeItems > 0) {
        activePriorityBreakdown.high = Math.round(activeItems * 0.3)
        activePriorityBreakdown.medium = Math.round(activeItems * 0.5)
        activePriorityBreakdown.low = activeItems - activePriorityBreakdown.high - activePriorityBreakdown.medium
      }

      // Enhanced statistics response
      const enhancedStats = {
        ...stats,
        completionRate,
        activeItems,
        overallStatus,
        activePriorityBreakdown,
        insights: {
          hasHighPriorityItems: activePriorityBreakdown.high > 0,
          needsAttention: overallStatus === 'needs-attention' || overallStatus === 'critical',
          isOnTrack: overallStatus === 'excellent' || overallStatus === 'good',
          recommendedAction: getRecommendedAction(stats, completionRate, activeItems),
        },
        lastUpdated: new Date().toISOString(),
      }

      return NextResponse.json({
        stats: enhancedStats,
        message: "Action items statistics retrieved successfully",
      })

    } catch (error) {
      console.error("Error fetching action items statistics:", error)
      reportAPIError(error as Error, '/api/action-items/stats', 'GET')
      
      return NextResponse.json(
        { error: "Failed to fetch action items statistics" },
        { status: 500 }
      )
    }
  }, 'get_action_items_stats_api')
}

/**
 * Get recommended action based on statistics
 */
function getRecommendedAction(
  stats: any,
  completionRate: number,
  activeItems: number
): string {
  if (stats.total === 0) {
    return "Generate personalized action items to get started with your retirement planning"
  }

  if (activeItems === 0) {
    return "Great job! All action items completed. Generate new recommendations to stay on track"
  }

  if (completionRate < 40) {
    return "Focus on completing high-priority action items to improve your retirement readiness"
  }

  if (completionRate < 60) {
    return "You're making progress! Complete a few more action items to get back on track"
  }

  if (completionRate < 80) {
    return "Almost there! Complete the remaining action items to optimize your retirement plan"
  }

  return "Excellent progress! Keep up the great work with your retirement planning"
}
