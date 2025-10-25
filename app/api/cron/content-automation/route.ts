/**
 * Cron Job API for Content Automation
 * Massachusetts Retirement System - Automated Blog Management
 */

import { NextRequest, NextResponse } from 'next/server'
import { ContentScheduler } from '@/lib/ai/content-scheduler'
import { headers } from 'next/headers'

/**
 * POST /api/cron/content-automation
 * Main cron job endpoint for content automation
 * 
 * This endpoint should be called by:
 * - Vercel Cron Jobs (every hour)
 * - External cron services (GitHub Actions, etc.)
 * - Manual triggers for testing
 */
export async function POST(request: NextRequest) {
  try {
    // Verify cron authorization
    const headersList = await headers()
    const authHeader = headersList.get('authorization')
    const cronSecret = process.env.CRON_SECRET || 'dev-secret'
    
    if (authHeader !== `Bearer ${cronSecret}`) {
      console.warn('Unauthorized cron job attempt')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') || 'all'
    
    console.log(`Starting content automation cron job - Action: ${action}`)
    const startTime = Date.now()

    const results = {
      timestamp: new Date().toISOString(),
      action,
      results: {} as Record<string, any>,
      errors: [] as string[],
      execution_time_ms: 0
    }

    try {
      // Execute based on action parameter
      switch (action) {
        case 'schedule':
          await executeScheduling(results)
          break
          
        case 'process':
          await executeProcessing(results)
          break
          
        case 'publish':
          await executePublishing(results)
          break
          
        case 'all':
        default:
          await executeScheduling(results)
          await executeProcessing(results)
          await executePublishing(results)
          break
      }

      // Get final statistics
      results.results.final_stats = await ContentScheduler.getSchedulingStats()

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      results.errors.push(errorMessage)
      console.error('Cron job error:', error)
    }

    results.execution_time_ms = Date.now() - startTime
    
    console.log(`Content automation completed in ${results.execution_time_ms}ms`)
    console.log('Results:', JSON.stringify(results, null, 2))

    return NextResponse.json(results)

  } catch (error) {
    console.error('Critical cron job error:', error)
    return NextResponse.json(
      { 
        error: 'Cron job failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

/**
 * Execute content scheduling
 */
async function executeScheduling(results: any): Promise<void> {
  try {
    console.log('Executing content scheduling...')
    
    // Auto-schedule content based on predefined schedules
    await ContentScheduler.autoScheduleContent()
    
    results.results.scheduling = {
      status: 'completed',
      message: 'Content scheduling executed successfully'
    }
    
  } catch (error) {
    const errorMessage = `Scheduling error: ${error instanceof Error ? error.message : 'Unknown error'}`
    results.errors.push(errorMessage)
    results.results.scheduling = {
      status: 'failed',
      error: errorMessage
    }
  }
}

/**
 * Execute content processing (generation)
 */
async function executeProcessing(results: any): Promise<void> {
  try {
    console.log('Executing content processing...')
    
    // Process pending content generation jobs
    await ContentScheduler.processPendingJobs()
    
    results.results.processing = {
      status: 'completed',
      message: 'Content processing executed successfully'
    }
    
  } catch (error) {
    const errorMessage = `Processing error: ${error instanceof Error ? error.message : 'Unknown error'}`
    results.errors.push(errorMessage)
    results.results.processing = {
      status: 'failed',
      error: errorMessage
    }
  }
}

/**
 * Execute content publishing
 */
async function executePublishing(results: any): Promise<void> {
  try {
    console.log('Executing content publishing...')
    
    // Publish approved posts that are scheduled
    await ContentScheduler.publishScheduledPosts()
    
    results.results.publishing = {
      status: 'completed',
      message: 'Content publishing executed successfully'
    }
    
  } catch (error) {
    const errorMessage = `Publishing error: ${error instanceof Error ? error.message : 'Unknown error'}`
    results.errors.push(errorMessage)
    results.results.publishing = {
      status: 'failed',
      error: errorMessage
    }
  }
}

/**
 * GET /api/cron/content-automation
 * Get cron job status and statistics
 */
export async function GET(request: NextRequest) {
  try {
    const headersList = await headers()
    const authHeader = headersList.get('authorization')
    const cronSecret = process.env.CRON_SECRET || 'dev-secret'
    
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const stats = await ContentScheduler.getSchedulingStats()
    
    return NextResponse.json({
      status: 'active',
      timestamp: new Date().toISOString(),
      statistics: stats,
      environment: {
        node_env: process.env.NODE_ENV,
        vercel_env: process.env.VERCEL_ENV,
        has_openai_key: !!process.env.OPENAI_API_KEY,
        has_anthropic_key: !!process.env.ANTHROPIC_API_KEY
      }
    })

  } catch (error) {
    console.error('Error getting cron status:', error)
    return NextResponse.json(
      { error: 'Failed to get cron status' },
      { status: 500 }
    )
  }
}
