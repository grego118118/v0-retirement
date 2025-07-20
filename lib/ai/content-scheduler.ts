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
        options.aiModel || 'gpt-4-turbo-preview'
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
          aiModel: options.aiModel || 'gpt-4-turbo-preview',
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
          scheduledPublishAt: job.target_publish_date ? new Date(job.target_publish_date) : undefined,
          autoGeneratedTags: generatedPost.auto_generated_tags,
          seoTitle: generatedPost.seo_title,
          seoDescription: generatedPost.seo_description,
          seoKeywords: Array.isArray(generatedPost.seo_keywords)
            ? generatedPost.seo_keywords
            : generatedPost.seo_keywords ? [generatedPost.seo_keywords] : []
        }
      })

      // Calculate actual cost (simplified)
      const actualCost = job.cost_estimate || 0

      // Record usage cost
      await AICostTracker.recordUsage({
        date: new Date().toISOString().split('T')[0],
        service_provider: job.ai_model.startsWith('claude') ? 'anthropic' : 'openai',
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
        const shouldExecute = this.shouldExecuteSchedule(schedule)
        
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
    // This would fetch from database in production
    // For now, return predefined schedules
    return [
      {
        id: 'weekly-pension-guide',
        name: 'Weekly Pension Planning Guide',
        description: 'Weekly comprehensive pension planning content',
        frequency: 'weekly',
        day_of_week: 1, // Monday
        time_of_day: '09:00',
        categories: ['pension-planning', 'benefit-calculations'],
        is_active: true,
        next_execution: this.getNextExecutionTime('weekly', 1, '09:00'),
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
  private static shouldExecuteSchedule(schedule: ContentSchedule): boolean {
    const now = new Date()
    const nextExecution = new Date(schedule.next_execution)
    
    return now >= nextExecution
  }

  /**
   * Execute a content schedule
   */
  private static async executeSchedule(schedule: ContentSchedule): Promise<void> {
    try {
      console.log(`Executing schedule: ${schedule.name}`)

      // Get appropriate topic based on schedule
      let topic
      const currentMonth = new Date().toLocaleString('default', { month: 'long' })
      
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
          aiModel: 'gpt-4-turbo-preview',
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

  /**
   * Get next execution time based on frequency
   */
  private static getNextExecutionTime(
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly',
    dayOfWeek?: number,
    timeOfDay: string = '09:00',
    dayOfMonth?: number
  ): string {
    const now = new Date()
    const [hours, minutes] = timeOfDay.split(':').map(Number)
    
    let nextExecution = new Date()
    nextExecution.setHours(hours, minutes, 0, 0)

    switch (frequency) {
      case 'daily':
        if (nextExecution <= now) {
          nextExecution.setDate(nextExecution.getDate() + 1)
        }
        break

      case 'weekly':
        if (dayOfWeek !== undefined) {
          const daysUntilTarget = (dayOfWeek - nextExecution.getDay() + 7) % 7
          if (daysUntilTarget === 0 && nextExecution <= now) {
            nextExecution.setDate(nextExecution.getDate() + 7)
          } else {
            nextExecution.setDate(nextExecution.getDate() + daysUntilTarget)
          }
        }
        break

      case 'monthly':
        if (dayOfMonth !== undefined) {
          nextExecution.setDate(dayOfMonth)
          if (nextExecution <= now) {
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
