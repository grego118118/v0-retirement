/**
 * Health Check API Endpoint
 * Comprehensive system health monitoring for production deployment
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { emailService } from '@/lib/email/email-service'

interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  version: string
  environment: string
  uptime: number
  checks: {
    database: HealthCheck
    email: HealthCheck
    memory: HealthCheck
    disk: HealthCheck
  }
  metadata: {
    nodeVersion: string
    platform: string
    arch: string
    pid: number
  }
}

interface HealthCheck {
  status: 'pass' | 'warn' | 'fail'
  responseTime?: number
  message?: string
  details?: Record<string, any>
}

/**
 * Check database connectivity and performance
 */
async function checkDatabase(): Promise<HealthCheck> {
  const startTime = Date.now()
  
  try {
    // Test basic connectivity
    await prisma.$queryRaw`SELECT 1`
    
    // Test a simple query
    const userCount = await prisma.user.count()
    
    const responseTime = Date.now() - startTime
    
    if (responseTime > 1000) {
      return {
        status: 'warn',
        responseTime,
        message: 'Database responding slowly',
        details: { userCount, threshold: '1000ms' }
      }
    }
    
    return {
      status: 'pass',
      responseTime,
      message: 'Database connection healthy',
      details: { userCount }
    }
  } catch (error) {
    return {
      status: 'fail',
      responseTime: Date.now() - startTime,
      message: 'Database connection failed',
      details: { error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }
}

/**
 * Check email service status
 */
async function checkEmail(): Promise<HealthCheck> {
  const startTime = Date.now()
  
  try {
    const isConfigured = emailService.isConfigured()
    const provider = emailService.getProviderName()
    
    const responseTime = Date.now() - startTime
    
    if (!isConfigured) {
      return {
        status: 'warn',
        responseTime,
        message: 'Email service not configured',
        details: { provider: 'none' }
      }
    }
    
    return {
      status: 'pass',
      responseTime,
      message: 'Email service available',
      details: { provider }
    }
  } catch (error) {
    return {
      status: 'fail',
      responseTime: Date.now() - startTime,
      message: 'Email service check failed',
      details: { error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }
}

/**
 * Check memory usage
 */
function checkMemory(): HealthCheck {
  try {
    const memUsage = process.memoryUsage()
    const totalMB = Math.round(memUsage.rss / 1024 / 1024)
    const heapUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024)
    const heapTotalMB = Math.round(memUsage.heapTotal / 1024 / 1024)
    
    // Warn if using more than 512MB
    const memoryThreshold = 512
    
    if (totalMB > memoryThreshold) {
      return {
        status: 'warn',
        message: 'High memory usage detected',
        details: {
          rss: `${totalMB}MB`,
          heapUsed: `${heapUsedMB}MB`,
          heapTotal: `${heapTotalMB}MB`,
          threshold: `${memoryThreshold}MB`
        }
      }
    }
    
    return {
      status: 'pass',
      message: 'Memory usage normal',
      details: {
        rss: `${totalMB}MB`,
        heapUsed: `${heapUsedMB}MB`,
        heapTotal: `${heapTotalMB}MB`
      }
    }
  } catch (error) {
    return {
      status: 'fail',
      message: 'Memory check failed',
      details: { error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }
}

/**
 * Check disk space (simplified for container environments)
 */
function checkDisk(): HealthCheck {
  try {
    // In a container environment, we'll do a basic check
    // In a real deployment, you might want to check actual disk usage
    
    return {
      status: 'pass',
      message: 'Disk space check passed',
      details: { note: 'Container environment - detailed disk check not implemented' }
    }
  } catch (error) {
    return {
      status: 'fail',
      message: 'Disk check failed',
      details: { error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }
}

/**
 * Determine overall health status
 */
function determineOverallStatus(checks: HealthCheckResult['checks']): HealthCheckResult['status'] {
  const statuses = Object.values(checks).map(check => check.status)
  
  if (statuses.includes('fail')) {
    return 'unhealthy'
  }
  
  if (statuses.includes('warn')) {
    return 'degraded'
  }
  
  return 'healthy'
}

/**
 * GET /api/health
 * Returns comprehensive health check information
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const startTime = Date.now()
  
  try {
    // Run all health checks in parallel
    const [database, email, memory, disk] = await Promise.all([
      checkDatabase(),
      checkEmail(),
      Promise.resolve(checkMemory()),
      Promise.resolve(checkDisk())
    ])
    
    const checks = { database, email, memory, disk }
    const overallStatus = determineOverallStatus(checks)
    
    const result: HealthCheckResult = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      checks,
      metadata: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        pid: process.pid
      }
    }
    
    // Set appropriate HTTP status code
    const httpStatus = overallStatus === 'healthy' ? 200 : 
                      overallStatus === 'degraded' ? 200 : 503
    
    return NextResponse.json(result, { 
      status: httpStatus,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  } catch (error) {
    // If the health check itself fails, return a minimal error response
    const errorResult: Partial<HealthCheckResult> = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      checks: {
        database: { status: 'fail', message: 'Health check failed' },
        email: { status: 'fail', message: 'Health check failed' },
        memory: { status: 'fail', message: 'Health check failed' },
        disk: { status: 'fail', message: 'Health check failed' }
      }
    }
    
    return NextResponse.json(errorResult, { 
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  }
}

/**
 * HEAD /api/health
 * Simple health check for load balancers
 */
export async function HEAD(request: NextRequest): Promise<NextResponse> {
  try {
    // Quick database connectivity check
    await prisma.$queryRaw`SELECT 1`
    
    return new NextResponse(null, { status: 200 })
  } catch (error) {
    return new NextResponse(null, { status: 503 })
  }
}
