import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-config'
import { prisma } from '@/lib/prisma'

// Monthly budget limit (in dollars)
const MONTHLY_BUDGET_LIMIT = 200

// Enhanced security for n8n free version
const ALLOWED_IPS = [
  '127.0.0.1',      // localhost
  '::1',            // localhost IPv6
  '10.0.0.0/8',     // Private network
  '172.16.0.0/12',  // Private network
  '192.168.0.0/16', // Private network
]

// Rate limiting (simple in-memory store for development)
const requestCounts = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT = 10 // requests per minute
const RATE_WINDOW = 60 * 1000 // 1 minute

function isAllowedIP(ip: string): boolean {
  // For development, allow localhost
  if (process.env.NODE_ENV === 'development') {
    return true
  }
  
  // In production, implement proper IP checking
  return ALLOWED_IPS.some(allowedIP => {
    if (allowedIP.includes('/')) {
      // CIDR notation - simplified check
      return ip.startsWith(allowedIP.split('/')[0].slice(0, -1))
    }
    return ip === allowedIP
  })
}

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

export async function GET(request: NextRequest) {
  try {
    // Enhanced security checks
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown'
    
    // Check IP allowlist
    if (!isAllowedIP(clientIP)) {
      console.warn(`Blocked request from IP: ${clientIP}`)
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }
    
    // Check rate limiting
    if (!checkRateLimit(clientIP)) {
      console.warn(`Rate limit exceeded for IP: ${clientIP}`)
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
    }
    
    // Check authentication
    const session = await getServerSession(authOptions)
    
    // Check for cron secret (for automated workflows)
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    const isAuthorizedCron = cronSecret && authHeader === `Bearer ${cronSecret}`
    
    // Log authentication attempts for monitoring
    if (!session && !isAuthorizedCron) {
      console.warn(`Unauthorized access attempt from IP: ${clientIP}, Auth header: ${authHeader ? 'present' : 'missing'}`)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get current month start and end dates
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)

    // Query AI cost tracking data
    const costs = await prisma.aiUsageCost.findMany({
      where: {
        createdAt: {
          gte: monthStart,
          lte: monthEnd
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Calculate totals and analytics
    const monthlyTotal = costs.reduce((sum, cost) => sum + Number(cost.costUsd), 0)
    const budgetUtilization = (monthlyTotal / MONTHLY_BUDGET_LIMIT) * 100
    const remainingBudget = Math.max(0, MONTHLY_BUDGET_LIMIT - monthlyTotal)
    
    // Count posts generated this month
    const postsGenerated = await prisma.blogPost.count({
      where: {
        createdAt: {
          gte: monthStart,
          lte: monthEnd
        },
        isAiGenerated: true
      }
    })

    const averageCostPerPost = postsGenerated > 0 ? monthlyTotal / postsGenerated : 0
    const estimatedPostsRemaining = remainingBudget > 0 && averageCostPerPost > 0 
      ? Math.floor(remainingBudget / averageCostPerPost) 
      : 0

    // Group costs by service provider
    const costsByProvider = costs.reduce((acc, cost) => {
      acc[cost.serviceProvider] = (acc[cost.serviceProvider] || 0) + Number(cost.costUsd)
      return acc
    }, {} as Record<string, number>)

    // Group costs by day
    const dailyCosts = costs.reduce((acc, cost) => {
      const day = cost.createdAt.toISOString().split('T')[0]
      acc[day] = (acc[day] || 0) + Number(cost.costUsd)
      return acc
    }, {} as Record<string, number>)

    // Calculate days remaining in month
    const daysRemainingInMonth = monthEnd.getDate() - now.getDate()

    const response = {
      success: true,
      status: 'active',
      budget_limit: MONTHLY_BUDGET_LIMIT,
      monthly_total: Number(monthlyTotal.toFixed(2)),
      budget_utilization: Number(budgetUtilization.toFixed(1)),
      remaining_budget: Number(remainingBudget.toFixed(2)),
      posts_generated: postsGenerated,
      average_cost_per_post: Number(averageCostPerPost.toFixed(2)),
      estimated_posts_remaining: estimatedPostsRemaining,
      days_remaining_in_month: daysRemainingInMonth,
      costs_by_provider: costsByProvider,
      daily_costs: dailyCosts,
      month: {
        year: now.getFullYear(),
        month: now.getMonth() + 1,
        name: now.toLocaleString('default', { month: 'long' })
      },
      timestamp: now.toISOString(),
      request_info: {
        ip: clientIP,
        authenticated_via: session ? 'session' : 'cron_secret'
      }
    }

    // Log successful request for monitoring
    console.log(`Budget API accessed successfully by IP: ${clientIP}`)
    
    return NextResponse.json(response)

  } catch (error) {
    console.error('Budget API Error:', error)

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
      timestamp: new Date().toISOString()
    }

    return NextResponse.json(safeResponse, { status: 500 })
  }
}
