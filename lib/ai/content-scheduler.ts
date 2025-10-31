/**
 * Automated Content Scheduling System
 * Massachusetts Retirement System - Blog Automation
 */

import { AIContentJob, ContentSchedule, BlogPost } from '@/types/ai-blog'
import { GeminiContentGenerator } from './gemini-content-generator'
import { ContentQualityChecker } from './content-quality-checker'
import { AICostTracker } from './ai-service-config'
import { getRandomTopic, getSeasonalTopics, getTopicsByCategory } from './massachusetts-topics'
import { prisma } from '@/lib/prisma'

export class ContentScheduler {
  /**
   * Create a new content generation job
   */
  static async scheduleContentGeneration(
    topic: string,
    categoryId: string,
    targetPublishDate: Date,
    options: {
      aiModel?: string
      wordCount?: number
      seoKeywords?: string[]
      autoPublish?: boolean
      priority?: 'low' | 'medium' | 'high'
    } = {}
  ): Promise<AIContentJob> {
    try {
      // Estimate cost
      const estimatedCost = AICostTracker.estimateContentCost(
        options.wordCount || 1000,
        options.aiModel || 'gemini-1.5-flash'
      )

      // Check budget
      const budgetCheck = await AICostTracker.checkBudget(estimatedCost, 'text_generation')
      if (!budgetCheck.allowed) {
        throw new Error(`Budget exceeded: ${budgetCheck.reason}`)
      }

      // Create job record
      const job = await prisma.aiContentJob.create({
        data: {
          jobType: 'scheduled_post',
          status: 'pending',
          topic,
          categoryId: categoryId,
          targetPublishDate: targetPublishDate,
          aiModel: options.aiModel || 'gemini-1.5-flash',
          generationPrompt: topic,
          costEstimate: estimatedCost,
          createdBy: 'system' // Would be actual user ID in production
        }
      })

      console.log(`Content generation job scheduled: ${job.id}`)

      // Convert Prisma camelCase to interface snake_case
      return {
        id: job.id,
        job_type: job.jobType as any,
        status: job.status,
        topic: job.topic,
        category_id: job.categoryId,
        target_publish_date: job.targetPublishDate?.toISOString(),
        ai_model: job.aiModel,
        generation_prompt: job.generationPrompt,
        generated_post_id: job.generatedPostId,
        error_message: job.errorMessage,
        cost_estimate: job.costEstimate ? Number(job.costEstimate) : undefined,
        actual_cost: job.actualCost ? Number(job.actualCost) : undefined,
        execution_time_seconds: job.executionTimeSeconds,
        created_at: job.createdAt.toISOString(),
        started_at: job.startedAt?.toISOString(),
        completed_at: job.completedAt?.toISOString(),
        created_by: job.createdBy
      } as AIContentJob

    } catch (error) {
      console.error('Failed to schedule content generation:', error)
      throw error
    }
  }

  /**
   * Process pending content generation jobs
   */
  static async processPendingJobs(): Promise<void> {
    try {
      // Get pending jobs
      const pendingJobs = await prisma.aiContentJob.findMany({
        where: {
          status: 'pending',
          targetPublishDate: {
            lte: new Date(Date.now() + 24 * 60 * 60 * 1000) // Next 24 hours
          }
        },
        orderBy: {
          targetPublishDate: 'asc'
        },
        take: 5 // Process max 5 jobs at a time
      })

      console.log(`Processing ${pendingJobs.length} pending content jobs`)

      for (const job of pendingJobs) {
        await this.processContentJob(job)
      }

    } catch (error) {
      console.error('Error processing pending jobs:', error)
    }
  }

  /**
   * Process a single content generation job
   */
  static async processContentJob(job: any): Promise<void> {
    const startTime = Date.now()

    try {
      // Update job status to running
      await prisma.aiContentJob.update({
        where: { id: job.id },
        data: {
          status: 'running',
          startedAt: new Date()
        }
      })

      console.log(`Processing content job: ${job.id} - ${job.topic}`)

      // Generate content
      const contentGenerator = new GeminiContentGenerator()
      const generatedPost = await contentGenerator.generateContent({
        topic: {
          title: job.topic,
          description: `Generated content for ${job.topic}`,
          keywords: []
        },
        category_id: job.categoryId || '',
        ai_model: job.aiModel as any,
        target_publish_date: job.targetPublishDate,
        target_word_count: 1000
      })

      // Assess content quality
      const qualityMetrics = await ContentQualityChecker.assessContentQuality(
        generatedPost.content,
        generatedPost.title
      )

      // Perform fact check
      const factCheckReport = await ContentQualityChecker.performFactCheck(generatedPost.content)

      // Save blog post
      const savedPost = await prisma.blogPost.create({
        data: {
          title: generatedPost.title,
          slug: generatedPost.slug,
          content: generatedPost.content,
          excerpt: generatedPost.excerpt,
          status: 'draft',
          isAiGenerated: true,
          aiModelUsed: job.aiModel,
          aiGenerationPrompt: job.topic,
          contentQualityScore: qualityMetrics.overall_quality,
          factCheckStatus: factCheckReport.overall_accuracy >= 80 ? 'approved' : 'needs_review',
          scheduledPublishAt: job.targetPublishDate ? new Date(job.targetPublishDate) : undefined,
          autoGeneratedTags: generatedPost.auto_generated_tags,
          seoTitle: generatedPost.seo_title,
          seoDescription: generatedPost.seo_description,
          seoKeywords: Array.isArray(generatedPost.seo_keywords)
            ? generatedPost.seo_keywords
            : generatedPost.seo_keywords ? [generatedPost.seo_keywords] : []
        }
      })

      // Calculate actual cost (simplified)
      const actualCost = job.costEstimate || 0

      // Record usage cost
      await AICostTracker.recordUsage({
        date: new Date().toISOString().split('T')[0],
        service_provider: job.aiModel && job.aiModel.toLowerCase().startsWith('claude') ? 'anthropic' : (job.aiModel && job.aiModel.toLowerCase().includes('gemini') ? 'google' : 'openai'),
        service_type: 'text_generation',
        tokens_used: Math.ceil(generatedPost.content.length / 4), // Rough estimate
        api_calls: 1,
        cost_usd: actualCost,
        post_id: savedPost.id,
        job_id: job.id
      })

      // Update job as completed
      await prisma.aiContentJob.update({
        where: { id: job.id },
        data: {
          status: 'completed',
          generatedPostId: savedPost.id,
          actualCost: actualCost,
          executionTimeSeconds: Math.round((Date.now() - startTime) / 1000),
          completedAt: new Date()
        }
      })

      console.log(`Content job completed: ${job.id} - Generated post: ${savedPost.id}`)

    } catch (error) {
      console.error(`Error processing content job ${job.id}:`, error)

      // Update job as failed
      await prisma.aiContentJob.update({
        where: { id: job.id },
        data: {
          status: 'failed',
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
          executionTimeSeconds: Math.round((Date.now() - startTime) / 1000),
          completedAt: new Date()
        }
      })
    }
  }

  /**
   * Auto-schedule content based on predefined schedules
   */
  static async autoScheduleContent(): Promise<void> {
    try {
      const schedules = await this.getActiveSchedules()

      for (const schedule of schedules) {
        const shouldExecute = await this.shouldExecuteSchedule(schedule)

        if (shouldExecute) {
          await this.executeSchedule(schedule)
        }
      }

    } catch (error) {
      console.error('Error in auto-scheduling:', error)
    }
  }

  /**
   * Get active content schedules
   */
  private static async getActiveSchedules(): Promise<ContentSchedule[]> {
    // Enhanced schedules for Massachusetts Retirement System
    return [
      {
        id: 'bi-daily-massachusetts-content',
        name: 'Bi-Daily Massachusetts Retirement Content',
        description: 'Generate 1 new Massachusetts Retirement blog post every 48 hours during business hours',
        frequency: 'daily',
        day_of_week: undefined,
        time_of_day: '10:00', // 10 AM EST
        categories: ['pension-planning', 'cola-adjustments', 'retirement-groups', 'pension-options', 'social-security-integration', 'career-planning', 'benefit-calculations', 'tax-planning'],
        is_active: true,
        next_execution: this.getNextBiDailyExecution(),
        last_execution: undefined
      },
      {
        id: 'monthly-cola-update',
        name: 'Monthly COLA Analysis',
        description: 'Monthly COLA impact analysis and updates',
        frequency: 'monthly',
        day_of_month: 1,
        time_of_day: '10:00',
        categories: ['cola-adjustments'],
        is_active: true,
        next_execution: this.getNextExecutionTime('monthly', undefined, '10:00', 1),
        last_execution: undefined
      },
      {
        id: 'seasonal-retirement-tips',
        name: 'Seasonal Retirement Tips',
        description: 'Seasonal retirement planning content',
        frequency: 'monthly',
        day_of_month: 15,
        time_of_day: '14:00',
        categories: ['retirement-timing', 'financial-planning'],
        is_active: true,
        next_execution: this.getNextExecutionTime('monthly', undefined, '14:00', 15),
        last_execution: undefined
      }
    ]
  }

  /**
   * Check if a schedule should be executed
   */
  private static async shouldExecuteSchedule(schedule: ContentSchedule): Promise<boolean> {
    const nowET = this.getNowInEastern()

    // Bi-daily: ensure at most once per 48 hours, and only during business hours ET
    if (schedule.id === 'bi-daily-massachusetts-content') {
      const hourET = nowET.getHours()
      if (hourET < 9 || hourET >= 17) return false

      const lastJob = await prisma.aiContentJob.findFirst({
        where: { jobType: 'scheduled_post' },
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true }
      })
      if (!lastJob) return true

      const diffHours = (Date.now() - lastJob.createdAt.getTime()) / 36e5
      return diffHours >= 47.5
    }

    // For other schedules, check Eastern wall-time alignment and avoid duplicates within 20 hours
    const [hStr, mStr] = (schedule.time_of_day || '10:00').split(':')
    const targetHour = Number(hStr)
    const targetMinute = Number(mStr)

    // If frequency is monthly and day matches, allow within the hour window
    if (schedule.frequency === 'monthly') {
      if (schedule.day_of_month && nowET.getDate() !== schedule.day_of_month) return false
      return nowET.getHours() === targetHour && Math.abs(nowET.getMinutes() - targetMinute) < 5
    }

    // Weekly schedules (if any)
    if (schedule.frequency === 'weekly') {
      if (typeof schedule.day_of_week === 'number' && nowET.getDay() !== schedule.day_of_week) return false
      return nowET.getHours() === targetHour && Math.abs(nowET.getMinutes() - targetMinute) < 5
    }

    // Default: daily at time_of_day in ET
    return nowET.getHours() === targetHour && Math.abs(nowET.getMinutes() - targetMinute) < 5
  }

  /**
   * Execute a content schedule
   */
  private static async executeSchedule(schedule: ContentSchedule): Promise<void> {
    try {
      console.log(`Executing schedule: ${schedule.name}`)

      // Get appropriate topic based on schedule
      let topic
      const currentMonth = new Date().toLocaleString('en-US', { month: 'long', timeZone: 'America/New_York' })

      if (schedule.categories.includes('cola-adjustments')) {
        // COLA-specific content
        topic = getRandomTopic({ category: 'cola-adjustments' })
      } else if (schedule.categories.includes('pension-planning')) {
        // Check for seasonal topics first
        const seasonalTopics = getSeasonalTopics(currentMonth)
        if (seasonalTopics.length > 0) {
          topic = seasonalTopics[Math.floor(Math.random() * seasonalTopics.length)]
        } else {
          topic = getRandomTopic({ category: 'pension-planning' })
        }
      } else {
        // Random topic from specified categories
        const category = schedule.categories[Math.floor(Math.random() * schedule.categories.length)]
        topic = getRandomTopic({ category })
      }

      // Calculate target publish date (2-3 days from now for review)
      const targetPublishDate = new Date()
      targetPublishDate.setDate(targetPublishDate.getDate() + 2)

      // Schedule the content generation
      await this.scheduleContentGeneration(
        topic.title,
        topic.category,
        targetPublishDate,
        {
          aiModel: 'gemini-1.5-flash',
          wordCount: 1200,
          seoKeywords: topic.keywords,
          autoPublish: false // Always require review
        }
      )

      // Update schedule's next execution time
      const nextExecution = this.calculateNextExecution(schedule)
      console.log(`Next execution for ${schedule.name}: ${nextExecution}`)

    } catch (error) {
      console.error(`Error executing schedule ${schedule.name}:`, error)
    }
  }

  /**
   * Calculate next execution time for a schedule
   */
  private static calculateNextExecution(schedule: ContentSchedule): string {
    return this.getNextExecutionTime(
      schedule.frequency,
      schedule.day_of_week,
      schedule.time_of_day,
      schedule.day_of_month
    )
  }

  // Timezone helpers for America/New_York without extra deps
  private static getDateInTimeZone(date: Date, timeZone: string): Date {
    const dtf = new Intl.DateTimeFormat('en-US', {
      timeZone,
      hour12: false,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
    const parts = dtf.formatToParts(date)
    const map: Record<string, string> = {}
    for (const p of parts) {
      if (p.type !== 'literal') map[p.type] = p.value
    }
    const asUTC = Date.UTC(
      Number(map.year),
      Number(map.month) - 1,
      Number(map.day),
      Number(map.hour),
      Number(map.minute),
      Number(map.second)
    )
    const offset = asUTC - date.getTime()
    return new Date(date.getTime() + offset)
  }

  private static getNowInEastern(): Date {
    return this.getDateInTimeZone(new Date(), 'America/New_York')
  }


  /**
   * Get next bi-daily execution time (every 48 hours during business hours)
   */
  private static getNextBiDailyExecution(): string {
    const nowET = this.getNowInEastern()
    const businessHours = { start: 9, end: 17 } // 9 AM - 5 PM Eastern

    // Start from Eastern now, set to 10:00 ET
    let nextExecution = new Date(nowET.getTime())
    nextExecution.setHours(10, 0, 0, 0)

    // If current time is after business hours in ET, move to next business day
    if (nowET.getHours() >= businessHours.end) {
      nextExecution.setDate(nextExecution.getDate() + 1)
    }

    // Skip weekends (ET)
    const dayOfWeek = nextExecution.getDay()
    if (dayOfWeek === 0) { // Sunday
      nextExecution.setDate(nextExecution.getDate() + 1)
    } else if (dayOfWeek === 6) { // Saturday
      nextExecution.setDate(nextExecution.getDate() + 2)
    }

    // Add 48 hours to land two days later during business hours (ET)
    nextExecution.setHours(nextExecution.getHours() + 48)

    return nextExecution.toISOString()
  }

  /**
   * Get next execution time based on frequency
   */
  private static getNextExecutionTime(
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly',
    dayOfWeek?: number,
    timeOfDay: string = '09:00',
    dayOfMonth?: number
  ): string {
    const nowET = this.getNowInEastern()
    const [hours, minutes] = timeOfDay.split(':').map(Number)

    // Anchor to Eastern
    let nextExecution = new Date(nowET.getTime())
    nextExecution.setHours(hours, minutes, 0, 0)

    switch (frequency) {
      case 'daily':
        if (nextExecution <= nowET) {
          nextExecution.setDate(nextExecution.getDate() + 1)
        }
        break

      case 'weekly':
        if (dayOfWeek !== undefined) {
          const daysUntilTarget = (dayOfWeek - nextExecution.getDay() + 7) % 7
          if (daysUntilTarget === 0 && nextExecution <= nowET) {
            nextExecution.setDate(nextExecution.getDate() + 7)
          } else {
            nextExecution.setDate(nextExecution.getDate() + daysUntilTarget)
          }
        }
        break

      case 'monthly':
        if (dayOfMonth !== undefined) {
          nextExecution.setDate(dayOfMonth)
          if (nextExecution <= nowET) {
            nextExecution.setMonth(nextExecution.getMonth() + 1)
          }
        }
        break

      case 'quarterly':
        const currentQuarter = Math.floor(nextExecution.getMonth() / 3)
        const nextQuarterMonth = (currentQuarter + 1) * 3
        nextExecution.setMonth(nextQuarterMonth)
        nextExecution.setDate(1)
        break
    }

    return nextExecution.toISOString()
  }

  /**
   * Publish approved posts that are scheduled for publication
   */
  static async publishScheduledPosts(): Promise<void> {
    try {
      const now = new Date()

      // Find posts scheduled for publication
      const scheduledPosts = await prisma.blogPost.findMany({
        where: {
          status: 'draft',
          factCheckStatus: 'approved',
          scheduledPublishAt: {
            lte: now
          }
        }
      })

      console.log(`Publishing ${scheduledPosts.length} scheduled posts`)

      for (const post of scheduledPosts) {
        await this.publishPost(post.id)
      }

    } catch (error) {
      console.error('Error publishing scheduled posts:', error)
    }
  }

  /**
   * Publish a single post
   */
  private static async publishPost(postId: string): Promise<void> {
    try {
      await prisma.blogPost.update({
        where: { id: postId },
        data: {
          status: 'published',
          publishedAt: new Date()
        }
      })

      console.log(`Published post: ${postId}`)

    } catch (error) {
      console.error(`Error publishing post ${postId}:`, error)
    }
  }

  /**
   * Get scheduling statistics
   */
  static async getSchedulingStats(): Promise<{
    pending_jobs: number
    completed_jobs_today: number
    failed_jobs_today: number
    scheduled_posts: number
    published_posts_today: number
  }> {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const [
      pendingJobs,
      completedJobsToday,
      failedJobsToday,
      scheduledPosts,
      publishedPostsToday
    ] = await Promise.all([
      prisma.aiContentJob.count({
        where: { status: 'pending' }
      }),
      prisma.aiContentJob.count({
        where: {
          status: 'completed',
          completedAt: {
            gte: today,
            lt: tomorrow
          }
        }
      }),
      prisma.aiContentJob.count({
        where: {
          status: 'failed',
          completedAt: {
            gte: today,
            lt: tomorrow
          }
        }
      }),
      prisma.blogPost.count({
        where: {
          status: 'draft',
          scheduledPublishAt: {
            gte: new Date()
          }
        }
      }),
      prisma.blogPost.count({
        where: {
          status: 'published',
          publishedAt: {
            gte: today,
            lt: tomorrow
          }
        }
      })
    ])

    return {
      pending_jobs: pendingJobs,
      completed_jobs_today: completedJobsToday,
      failed_jobs_today: failedJobsToday,
      scheduled_posts: scheduledPosts,
      published_posts_today: publishedPostsToday
    }
  }
}
