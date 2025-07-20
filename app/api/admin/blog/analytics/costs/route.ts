import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-config'
import { prisma } from '@/lib/prisma'

// Monthly budget limit (in dollars)
const MONTHLY_BUDGET_LIMIT = 200

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    
    // Check for cron secret (for automated workflows)
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    const isAuthorizedCron = cronSecret && authHeader === `Bearer ${cronSecret}`
    
    if (!session && !isAuthorizedCron) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get current month start and end dates
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)

    // Get AI blog posts from current month
    // For now, return empty array if table doesn't exist yet
    let monthlyPosts: any[] = []

    try {
      monthlyPosts = await prisma.blogPost.findMany({
        where: {
          createdAt: {
            gte: monthStart,
            lte: monthEnd
          },
          isAiGenerated: true
        },
        select: {
          id: true,
          aiModelUsed: true,
          aiGenerationCost: true,
          content: true,
          createdAt: true
        }
      })
    } catch (error) {
      console.log('Blog posts table not yet created, returning empty data')
      // Continue with empty array
    }

    // Calculate costs by model
    const costsByModel: Record<string, { count: number; totalCost: number }> = {}
    let totalMonthlyCost = 0

    monthlyPosts.forEach(post => {
      const model = post.aiModelUsed || 'unknown'
      const cost = post.aiGenerationCost ? parseFloat(post.aiGenerationCost.toString()) : 0

      if (!costsByModel[model]) {
        costsByModel[model] = { count: 0, totalCost: 0 }
      }

      costsByModel[model].count++
      costsByModel[model].totalCost += cost
      totalMonthlyCost += cost
    })

    // Calculate budget utilization percentage
    const budgetUtilization = Math.round((totalMonthlyCost / MONTHLY_BUDGET_LIMIT) * 100)

    // Get daily costs for the current month
    const dailyCosts: Record<string, number> = {}
    monthlyPosts.forEach(post => {
      const day = post.createdAt.toISOString().split('T')[0] // YYYY-MM-DD format
      const cost = post.aiGenerationCost ? parseFloat(post.aiGenerationCost.toString()) : 0
      dailyCosts[day] = (dailyCosts[day] || 0) + cost
    })

    // Calculate average cost per post
    const averageCostPerPost = monthlyPosts.length > 0 
      ? totalMonthlyCost / monthlyPosts.length 
      : 0

    // Estimate remaining budget and posts possible
    const remainingBudget = Math.max(0, MONTHLY_BUDGET_LIMIT - totalMonthlyCost)
    const estimatedPostsRemaining = averageCostPerPost > 0 
      ? Math.floor(remainingBudget / averageCostPerPost)
      : 0

    // Get days remaining in month
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
    const daysRemaining = daysInMonth - now.getDate() + 1

    const response = {
      success: true,
      budget_limit: MONTHLY_BUDGET_LIMIT,
      monthly_total: Math.round(totalMonthlyCost * 100) / 100, // Round to 2 decimal places
      budget_utilization: budgetUtilization,
      remaining_budget: Math.round(remainingBudget * 100) / 100,
      posts_generated: monthlyPosts.length,
      average_cost_per_post: Math.round(averageCostPerPost * 100) / 100,
      estimated_posts_remaining: estimatedPostsRemaining,
      days_remaining_in_month: daysRemaining,
      costs_by_model: costsByModel,
      daily_costs: dailyCosts,
      month: {
        year: now.getFullYear(),
        month: now.getMonth() + 1,
        name: now.toLocaleString('default', { month: 'long' })
      },
      status: budgetUtilization >= 90 ? 'warning' : 'ok',
      recommendations: generateRecommendations(budgetUtilization, averageCostPerPost, daysRemaining)
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Error fetching cost analytics:', error)

    // Always return a valid response structure for n8n workflow
    const safeResponse = {
      success: false,
      error: 'Failed to fetch cost analytics',
      error_details: error instanceof Error ? error.message : 'Unknown error',

      // Required fields for n8n workflow (with safe defaults)
      budget_limit: MONTHLY_BUDGET_LIMIT,
      monthly_total: 0,
      budget_utilization: 0,
      remaining_budget: MONTHLY_BUDGET_LIMIT,
      posts_generated: 0,
      average_cost_per_post: 0,
      estimated_posts_remaining: 0,
      days_remaining_in_month: new Date().getDate(),
      costs_by_model: {},
      daily_costs: {},
      month: {
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
        name: new Date().toLocaleString('default', { month: 'long' })
      },
      status: 'error', // This is the field causing the undefined error
      recommendations: ['API error occurred - check server logs']
    }

    return NextResponse.json(safeResponse, { status: 200 }) // Return 200 to prevent n8n error handling
  }
}

function generateRecommendations(
  budgetUtilization: number, 
  averageCost: number, 
  daysRemaining: number
): string[] {
  const recommendations: string[] = []

  if (budgetUtilization >= 90) {
    recommendations.push('Budget nearly exhausted - consider pausing automated generation')
    recommendations.push('Review and optimize AI model selection for cost efficiency')
  } else if (budgetUtilization >= 75) {
    recommendations.push('Budget utilization high - monitor spending closely')
    recommendations.push('Consider using more cost-effective AI models')
  }

  if (averageCost > 5) {
    recommendations.push('Average cost per post is high - optimize prompts and word counts')
  }

  if (daysRemaining > 10 && budgetUtilization < 50) {
    recommendations.push('Budget utilization low - consider increasing content generation frequency')
  }

  if (recommendations.length === 0) {
    recommendations.push('Budget utilization is healthy - continue current generation schedule')
  }

  return recommendations
}
