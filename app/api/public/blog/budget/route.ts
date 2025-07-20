import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Monthly budget limit (in dollars)
const MONTHLY_BUDGET_LIMIT = 200

// Simple authentication for n8n free version
const SIMPLE_API_KEY = 'mass-pension-n8n-2024'

// Rate limiting
const requestCounts = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT = 20 // requests per hour
const RATE_WINDOW = 60 * 60 * 1000 // 1 hour

function checkRateLimit(identifier: string): boolean {
  const now = Date.now()
  const record = requestCounts.get(identifier)
  
  if (!record || now > record.resetTime) {
    requestCounts.set(identifier, { count: 1, resetTime: now + RATE_WINDOW })
    return true
  }
  
  if (record.count >= RATE_LIMIT) {
    return false
  }
  
  record.count++
  return true
}

/**
 * GET /api/public/blog/budget
 * Simplified budget endpoint for n8n free version
 * 
 * Authentication options:
 * 1. Query parameter: ?key=mass-pension-n8n-2024
 * 2. Header: X-API-Key: mass-pension-n8n-2024
 * 3. User-Agent: n8n-workflow (for basic identification)
 */
export async function GET(request: NextRequest) {
  try {
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown'
    
    // Check rate limiting
    if (!checkRateLimit(clientIP)) {
      return NextResponse.json({ 
        error: 'Rate limit exceeded',
        retry_after: '1 hour'
      }, { status: 429 })
    }
    
    // Simple authentication check
    const { searchParams } = new URL(request.url)
    const queryKey = searchParams.get('key')
    const headerKey = request.headers.get('x-api-key')
    const userAgent = request.headers.get('user-agent') || ''
    
    const isAuthenticated = 
      queryKey === SIMPLE_API_KEY ||
      headerKey === SIMPLE_API_KEY ||
      userAgent.includes('n8n-workflow')
    
    if (!isAuthenticated) {
      console.warn(`Unauthorized public API access from IP: ${clientIP}`)
      return NextResponse.json({ 
        error: 'Authentication required',
        hint: 'Use ?key=YOUR_API_KEY or X-API-Key header'
      }, { status: 401 })
    }

    // Get current month data
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)

    // Try to query cost data, fallback to defaults if tables don't exist
    let monthlyTotal = 0
    let postsGenerated = 0

    try {
      const costs = await prisma.aiUsageCost.findMany({
        where: {
          createdAt: {
            gte: monthStart,
            lte: monthEnd
          }
        }
      })
      monthlyTotal = costs.reduce((sum, cost) => sum + parseFloat(cost.costUsd.toString()), 0)
    } catch (error) {
      console.log('AiUsageCost table not found, using default values')
      monthlyTotal = 0
    }

    try {
      postsGenerated = await prisma.blogPost.count({
        where: {
          createdAt: {
            gte: monthStart,
            lte: monthEnd
          },
          isAiGenerated: true
        }
      })
    } catch (error) {
      console.log('blogPost table not found, using default values')
      postsGenerated = 0
    }

    const budgetUtilization = (monthlyTotal / MONTHLY_BUDGET_LIMIT) * 100
    const remainingBudget = Math.max(0, MONTHLY_BUDGET_LIMIT - monthlyTotal)
    const averageCostPerPost = postsGenerated > 0 ? monthlyTotal / postsGenerated : 0
    const estimatedPostsRemaining = remainingBudget > 0 && averageCostPerPost > 0
      ? Math.floor(remainingBudget / averageCostPerPost)
      : Math.floor(MONTHLY_BUDGET_LIMIT / 5) // Estimate 5 posts if no data

    const response = {
      success: true,
      status: budgetUtilization < 90 ? 'ok' : 'warning',
      budget_limit: MONTHLY_BUDGET_LIMIT,
      monthly_total: Number(monthlyTotal.toFixed(2)),
      budget_utilization: Number(budgetUtilization.toFixed(1)),
      remaining_budget: Number(remainingBudget.toFixed(2)),
      posts_generated: postsGenerated,
      average_cost_per_post: Number(averageCostPerPost.toFixed(2)),
      estimated_posts_remaining: estimatedPostsRemaining,
      can_generate_content: budgetUtilization < 95,
      month: {
        year: now.getFullYear(),
        month: now.getMonth() + 1,
        name: now.toLocaleString('default', { month: 'long' })
      },
      timestamp: now.toISOString(),
      api_version: 'public-v1'
    }

    console.log(`Public budget API accessed by IP: ${clientIP}`)
    return NextResponse.json(response)

  } catch (error) {
    console.error('Public Budget API Error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch budget data',
      budget_limit: MONTHLY_BUDGET_LIMIT,
      monthly_total: 0,
      budget_utilization: 0,
      remaining_budget: MONTHLY_BUDGET_LIMIT,
      can_generate_content: true,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
