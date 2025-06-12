import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

interface HealthCheck {
  status: 'healthy' | 'unhealthy'
  timestamp: string
  version: string
  environment: string
  checks: {
    database: {
      status: 'healthy' | 'unhealthy'
      responseTime?: number
      error?: string
    }
    memory: {
      status: 'healthy' | 'unhealthy'
      usage: {
        used: number
        total: number
        percentage: number
      }
    }
    uptime: {
      status: 'healthy' | 'unhealthy'
      seconds: number
    }
  }
}

export async function GET(request: NextRequest) {
  const startTime = Date.now()
  
  const healthCheck: HealthCheck = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    checks: {
      database: {
        status: 'healthy'
      },
      memory: {
        status: 'healthy',
        usage: {
          used: 0,
          total: 0,
          percentage: 0
        }
      },
      uptime: {
        status: 'healthy',
        seconds: Math.floor(process.uptime())
      }
    }
  }

  // Database health check
  try {
    const dbStartTime = Date.now()
    await prisma.$queryRaw`SELECT 1`
    const dbResponseTime = Date.now() - dbStartTime
    
    healthCheck.checks.database = {
      status: 'healthy',
      responseTime: dbResponseTime
    }
    
    // If database response time is too slow, mark as unhealthy
    if (dbResponseTime > 5000) {
      healthCheck.checks.database.status = 'unhealthy'
      healthCheck.status = 'unhealthy'
    }
  } catch (error) {
    healthCheck.checks.database = {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Database connection failed'
    }
    healthCheck.status = 'unhealthy'
  }

  // Memory health check
  try {
    const memUsage = process.memoryUsage()
    const totalMemory = memUsage.heapTotal + memUsage.external
    const usedMemory = memUsage.heapUsed
    const memoryPercentage = (usedMemory / totalMemory) * 100

    healthCheck.checks.memory = {
      status: memoryPercentage > 90 ? 'unhealthy' : 'healthy',
      usage: {
        used: Math.round(usedMemory / 1024 / 1024), // MB
        total: Math.round(totalMemory / 1024 / 1024), // MB
        percentage: Math.round(memoryPercentage)
      }
    }

    if (memoryPercentage > 90) {
      healthCheck.status = 'unhealthy'
    }
  } catch (error) {
    healthCheck.checks.memory.status = 'unhealthy'
    healthCheck.status = 'unhealthy'
  }

  // Uptime health check
  const uptimeSeconds = Math.floor(process.uptime())
  healthCheck.checks.uptime = {
    status: uptimeSeconds > 0 ? 'healthy' : 'unhealthy',
    seconds: uptimeSeconds
  }

  // Return appropriate status code
  const statusCode = healthCheck.status === 'healthy' ? 200 : 503
  
  return NextResponse.json(healthCheck, { 
    status: statusCode,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  })
}

// Simple health check for load balancers
export async function HEAD(request: NextRequest) {
  try {
    // Quick database ping
    await prisma.$queryRaw`SELECT 1`
    return new NextResponse(null, { status: 200 })
  } catch (error) {
    return new NextResponse(null, { status: 503 })
  }
}
