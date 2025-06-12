/**
 * Massachusetts Retirement System - Query Optimization Utilities
 * 
 * Optimized database queries and caching strategies for production performance.
 * Ensures sub-2-second response times for all critical operations.
 */

import { prisma } from '@/lib/prisma'
import { getCacheManager, cacheKeys, cacheTTL } from '@/lib/performance/cache-config'
import { performanceMonitor } from '@/lib/utils/performance-monitor'

// Query timeout for all database operations (1.5 seconds)
const QUERY_TIMEOUT = 1500

/**
 * Optimized user profile retrieval with caching
 */
export async function getOptimizedUserProfile(userId: string) {
  const cache = getCacheManager()
  const cacheKey = cacheKeys.userProfile(userId)
  
  // Try cache first
  const cached = await cache.get(cacheKey)
  if (cached) {
    return cached
  }
  
  const tracker = performanceMonitor.startOperation('getUserProfile')
  
  try {
    const profile = await Promise.race([
      prisma.userProfile.findUnique({
        where: { userId },
        select: {
          userId: true,
          fullName: true,
          dateOfBirth: true,
          membershipDate: true,
          retirementGroup: true,
          currentSalary: true,
          averageHighest3Years: true,
          yearsOfService: true,
          plannedRetirementAge: true,
          retirementOption: true,
          retirementDate: true,
          benefitPercentage: true,
          updatedAt: true
        }
      }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Query timeout')), QUERY_TIMEOUT)
      )
    ]) as any
    
    if (profile) {
      await cache.setWithTTL(cacheKey, profile, 'userProfile')
    }
    
    tracker.end(true)
    return profile
  } catch (error) {
    tracker.end(false, error instanceof Error ? error.message : 'Unknown error')
    throw error
  }
}

/**
 * Optimized retirement calculations retrieval with pagination
 */
export async function getOptimizedUserCalculations(
  userId: string, 
  limit: number = 20, 
  offset: number = 0,
  favoritesOnly: boolean = false
) {
  const cache = getCacheManager()
  const cacheKey = `${cacheKeys.userCalculations(userId)}:${limit}:${offset}:${favoritesOnly}`
  
  // Try cache first
  const cached = await cache.get(cacheKey)
  if (cached) {
    return cached
  }
  
  const tracker = performanceMonitor.startOperation('getUserCalculations')
  
  try {
    const whereClause = {
      userId,
      ...(favoritesOnly && { isFavorite: true })
    }
    
    const [calculations, total] = await Promise.race([
      Promise.all([
        prisma.retirementCalculation.findMany({
          where: whereClause,
          select: {
            id: true,
            name: true,
            retirementGroup: true,
            retirementAge: true,
            yearsOfService: true,
            averageSalary: true,
            monthlyBenefit: true,
            annualBenefit: true,
            isFavorite: true,
            createdAt: true,
            updatedAt: true
          },
          orderBy: [
            { isFavorite: 'desc' },
            { updatedAt: 'desc' }
          ],
          take: limit,
          skip: offset
        }),
        prisma.retirementCalculation.count({
          where: whereClause
        })
      ]),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Query timeout')), QUERY_TIMEOUT)
      )
    ]) as any
    
    const result = { calculations, total }
    await cache.setWithTTL(cacheKey, result, 'userCalculations')
    
    tracker.end(true)
    return result
  } catch (error) {
    tracker.end(false, error instanceof Error ? error.message : 'Unknown error')
    throw error
  }
}

/**
 * Optimized scenario retrieval with results
 */
export async function getOptimizedUserScenarios(userId: string) {
  const cache = getCacheManager()
  const cacheKey = cacheKeys.userScenarios(userId)
  
  // Try cache first
  const cached = await cache.get(cacheKey)
  if (cached) {
    return cached
  }
  
  const tracker = performanceMonitor.startOperation('getUserScenarios')
  
  try {
    const scenarios = await Promise.race([
      prisma.retirementScenario.findMany({
        where: { userId },
        select: {
          id: true,
          name: true,
          description: true,
          isBaseline: true,
          parameters: true,
          createdAt: true,
          updatedAt: true,
          results: {
            select: {
              id: true,
              totalMonthlyIncome: true,
              replacementRatio: true,
              riskScore: true,
              optimizationScore: true,
              calculatedAt: true
            },
            orderBy: { calculatedAt: 'desc' },
            take: 1
          }
        },
        orderBy: [
          { isBaseline: 'desc' },
          { updatedAt: 'desc' }
        ]
      }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Query timeout')), QUERY_TIMEOUT)
      )
    ]) as any
    
    await cache.setWithTTL(cacheKey, scenarios, 'userScenarios')
    
    tracker.end(true)
    return scenarios
  } catch (error) {
    tracker.end(false, error instanceof Error ? error.message : 'Unknown error')
    throw error
  }
}

/**
 * Optimized scenario comparison retrieval
 */
export async function getOptimizedScenarioComparison(scenarioIds: string[]) {
  const cache = getCacheManager()
  const cacheKey = cacheKeys.scenarioComparison(scenarioIds)
  
  // Try cache first
  const cached = await cache.get(cacheKey)
  if (cached) {
    return cached
  }
  
  const tracker = performanceMonitor.startOperation('getScenarioComparison')
  
  try {
    const scenarios = await Promise.race([
      prisma.retirementScenario.findMany({
        where: {
          id: { in: scenarioIds }
        },
        select: {
          id: true,
          name: true,
          description: true,
          parameters: true,
          results: {
            select: {
              totalMonthlyIncome: true,
              pensionResults: true,
              socialSecurityResults: true,
              taxResults: true,
              replacementRatio: true,
              riskScore: true,
              optimizationScore: true,
              calculatedAt: true
            },
            orderBy: { calculatedAt: 'desc' },
            take: 1
          }
        }
      }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Query timeout')), QUERY_TIMEOUT)
      )
    ]) as any
    
    await cache.setWithTTL(cacheKey, scenarios, 'scenarioComparison')
    
    tracker.end(true)
    return scenarios
  } catch (error) {
    tracker.end(false, error instanceof Error ? error.message : 'Unknown error')
    throw error
  }
}

/**
 * Optimized action items retrieval
 */
export async function getOptimizedUserActionItems(userId: string, activeOnly: boolean = true) {
  const cache = getCacheManager()
  const cacheKey = `action-items:${userId}:${activeOnly}`
  
  // Try cache first (shorter TTL for action items)
  const cached = await cache.get(cacheKey)
  if (cached) {
    return cached
  }
  
  const tracker = performanceMonitor.startOperation('getUserActionItems')
  
  try {
    const whereClause = {
      userId,
      ...(activeOnly && { 
        status: { in: ['pending', 'in_progress'] }
      })
    }
    
    const actionItems = await Promise.race([
      prisma.actionItem.findMany({
        where: whereClause,
        select: {
          id: true,
          title: true,
          description: true,
          priority: true,
          status: true,
          dueDate: true,
          category: true,
          createdAt: true,
          updatedAt: true
        },
        orderBy: [
          { priority: 'desc' },
          { dueDate: 'asc' },
          { createdAt: 'desc' }
        ]
      }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Query timeout')), QUERY_TIMEOUT)
      )
    ]) as any
    
    // Shorter cache for action items (5 minutes)
    await cache.set(cacheKey, actionItems, 300)
    
    tracker.end(true)
    return actionItems
  } catch (error) {
    tracker.end(false, error instanceof Error ? error.message : 'Unknown error')
    throw error
  }
}

/**
 * Batch operation for multiple calculations
 */
export async function batchCreateCalculations(calculations: any[]) {
  const tracker = performanceMonitor.startOperation('batchCreateCalculations')
  
  try {
    const result = await Promise.race([
      prisma.retirementCalculation.createMany({
        data: calculations,
        skipDuplicates: true
      }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Batch operation timeout')), QUERY_TIMEOUT * 2)
      )
    ]) as any
    
    // Invalidate relevant caches
    const cache = getCacheManager()
    const userIds = [...new Set(calculations.map(c => c.userId))]
    
    await Promise.all(
      userIds.map(userId => 
        cache.invalidatePattern(`user:calculations:${userId}*`)
      )
    )
    
    tracker.end(true)
    return result
  } catch (error) {
    tracker.end(false, error instanceof Error ? error.message : 'Unknown error')
    throw error
  }
}

/**
 * Optimized dashboard data retrieval (single query)
 */
export async function getOptimizedDashboardData(userId: string) {
  const cache = getCacheManager()
  const cacheKey = `dashboard:${userId}`
  
  // Try cache first
  const cached = await cache.get(cacheKey)
  if (cached) {
    return cached
  }
  
  const tracker = performanceMonitor.startOperation('getDashboardData')
  
  try {
    // Single query to get all dashboard data
    const [profile, recentCalculations, scenarios, actionItems] = await Promise.race([
      Promise.all([
        getOptimizedUserProfile(userId),
        getOptimizedUserCalculations(userId, 5, 0),
        getOptimizedUserScenarios(userId),
        getOptimizedUserActionItems(userId, true)
      ]),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Dashboard query timeout')), QUERY_TIMEOUT)
      )
    ]) as any
    
    const dashboardData = {
      profile,
      recentCalculations: recentCalculations.calculations,
      scenarios: scenarios.slice(0, 3), // Top 3 scenarios
      actionItems: actionItems.slice(0, 5), // Top 5 action items
      summary: {
        totalCalculations: recentCalculations.total,
        totalScenarios: scenarios.length,
        pendingActions: actionItems.filter((item: any) => item.status === 'pending').length
      }
    }
    
    // Cache for 10 minutes
    await cache.set(cacheKey, dashboardData, 600)
    
    tracker.end(true)
    return dashboardData
  } catch (error) {
    tracker.end(false, error instanceof Error ? error.message : 'Unknown error')
    throw error
  }
}

/**
 * Cache invalidation helper for user data updates
 */
export async function invalidateUserCache(userId: string) {
  const cache = getCacheManager()
  
  await Promise.all([
    cache.invalidatePattern(`user:*:${userId}`),
    cache.invalidatePattern(`dashboard:${userId}`),
    cache.invalidatePattern(`action-items:${userId}*`),
    cache.invalidatePattern(`scenario:*:${userId}*`)
  ])
}

/**
 * Database health check with performance metrics
 */
export async function performDatabaseHealthCheck() {
  const tracker = performanceMonitor.startOperation('databaseHealthCheck')
  
  try {
    const startTime = Date.now()
    
    // Simple query to test database connectivity and performance
    await Promise.race([
      prisma.$queryRaw`SELECT 1 as health_check`,
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Health check timeout')), 5000)
      )
    ])
    
    const responseTime = Date.now() - startTime
    
    tracker.end(true)
    
    return {
      status: 'healthy',
      responseTime,
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    tracker.end(false, error instanceof Error ? error.message : 'Unknown error')
    
    return {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }
  }
}

/**
 * Query performance monitoring decorator
 */
export function withQueryMonitoring<T extends (...args: any[]) => Promise<any>>(
  queryFunction: T,
  operationName: string
): T {
  return (async (...args: any[]) => {
    const tracker = performanceMonitor.startOperation(operationName)
    
    try {
      const result = await queryFunction(...args)
      tracker.end(true)
      return result
    } catch (error) {
      tracker.end(false, error instanceof Error ? error.message : 'Unknown error')
      throw error
    }
  }) as T
}
