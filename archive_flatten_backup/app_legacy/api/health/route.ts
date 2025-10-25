import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

interface HealthCheck {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  checks: {
    database: boolean;
    responseTime: number;
    connectionPool?: {
      active: number;
      idle: number;
      total: number;
    };
  };
  version: string;
  uptime: number;
}

export async function GET() {
  const startTime = Date.now();
  
  const checks = {
    database: false,
    responseTime: 0,
    connectionPool: {
      active: 0,
      idle: 0,
      total: 0,
    },
  };

  try {
    // Test database connection with timeout
    const dbStart = Date.now();
    
    await Promise.race([
      prisma.$queryRaw`SELECT 1 as health_check`,
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database timeout')), 5000)
      )
    ]);
    
    checks.database = true;
    checks.responseTime = Date.now() - dbStart;

    // Try to get connection pool information (if available)
    try {
      const poolInfo = await prisma.$queryRaw`
        SELECT 
          count(*) FILTER (WHERE state = 'active') as active_connections,
          count(*) FILTER (WHERE state = 'idle') as idle_connections,
          count(*) as total_connections
        FROM pg_stat_activity 
        WHERE datname = current_database()
      ` as any[];

      if (poolInfo && poolInfo[0]) {
        checks.connectionPool = {
          active: parseInt(poolInfo[0].active_connections) || 0,
          idle: parseInt(poolInfo[0].idle_connections) || 0,
          total: parseInt(poolInfo[0].total_connections) || 0,
        };
      }
    } catch (poolError) {
      // Connection pool info is optional, don't fail health check
      console.warn('Could not retrieve connection pool info:', poolError);
    }

  } catch (error) {
    console.error('Database health check failed:', error);
    checks.responseTime = Date.now() - startTime;
  }

  // Determine overall health status
  let status: 'healthy' | 'degraded' | 'unhealthy';
  
  if (!checks.database) {
    status = 'unhealthy';
  } else if (checks.responseTime > 2000) {
    status = 'degraded';
  } else {
    status = 'healthy';
  }

  const healthCheck: HealthCheck = {
    status,
    timestamp: new Date().toISOString(),
    checks,
    version: process.env.VERCEL_GIT_COMMIT_SHA || 'unknown',
    uptime: process.uptime(),
  };

  // Return appropriate HTTP status code
  const httpStatus = status === 'healthy' ? 200 : status === 'degraded' ? 200 : 503;

  return NextResponse.json(healthCheck, { 
    status: httpStatus,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
  });
}

// Add a simple HEAD endpoint for load balancer health checks
export async function HEAD() {
  try {
    // Quick database ping
    await Promise.race([
      prisma.$queryRaw`SELECT 1`,
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 2000)
      )
    ]);
    
    return new NextResponse(null, { status: 200 });
  } catch (error) {
    return new NextResponse(null, { status: 503 });
  }
}
