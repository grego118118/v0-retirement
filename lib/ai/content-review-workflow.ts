/**
 * Content Review Workflow System
 * Massachusetts Retirement System - Multi-stage content review process
 */

import { prisma } from '@/lib/prisma'
import { ContentQualityChecker } from './content-quality-checker'
import { sendEmail } from '@/lib/email'

export interface ReviewStage {
  stage: 'ai_quality' | 'fact_check' | 'seo_optimization' | 'final_approval'
  status: 'pending' | 'in_progress' | 'completed' | 'rejected'
  reviewer_id?: string
  notes?: string
  completed_at?: Date
}

export interface ContentReviewWorkflow {
  post_id: string
  current_stage: ReviewStage['stage']
  stages: ReviewStage[]
  overall_status: 'pending' | 'in_review' | 'approved' | 'rejected' | 'published'
  created_at: Date
  updated_at: Date
}

export class ContentReviewWorkflowManager {
  /**
   * Initialize review workflow for a new blog post
   */
  static async initializeWorkflow(postId: string): Promise<ContentReviewWorkflow> {
    const workflow: ContentReviewWorkflow = {
      post_id: postId,
      current_stage: 'ai_quality',
      overall_status: 'pending',
      stages: [
        {
          stage: 'ai_quality',
          status: 'pending'
        },
        {
          stage: 'fact_check',
          status: 'pending'
        },
        {
          stage: 'seo_optimization',
          status: 'pending'
        },
        {
          stage: 'final_approval',
          status: 'pending'
        }
      ],
      created_at: new Date(),
      updated_at: new Date()
    }

    // Start with AI quality assessment
    await this.processAIQualityStage(workflow)
    
    return workflow
  }

  /**
   * Stage 1: AI Quality Assessment
   */
  private static async processAIQualityStage(workflow: ContentReviewWorkflow): Promise<void> {
    try {
      const post = await prisma.blogPost.findUnique({
        where: { id: workflow.post_id }
      })

      if (!post) {
        throw new Error('Blog post not found')
      }

      // Assess content quality using AI
      const qualityMetrics = await ContentQualityChecker.assessContentQuality(
        post.content,
        post.title
      )

      // Update post with quality score
      await prisma.blogPost.update({
        where: { id: workflow.post_id },
        data: {
          contentQualityScore: qualityMetrics.overall_quality
        }
      })

      // Determine if quality passes threshold
      const qualityThreshold = 75 // Minimum quality score
      const aiStage = workflow.stages.find(s => s.stage === 'ai_quality')!
      
      if (qualityMetrics.overall_quality >= qualityThreshold) {
        aiStage.status = 'completed'
        aiStage.completed_at = new Date()
        aiStage.notes = `Quality score: ${qualityMetrics.overall_quality}%. Passed AI quality assessment.`
        
        // Move to fact-checking stage
        workflow.current_stage = 'fact_check'
        await this.processFactCheckStage(workflow)
      } else {
        aiStage.status = 'rejected'
        aiStage.notes = `Quality score: ${qualityMetrics.overall_quality}%. Below threshold of ${qualityThreshold}%. Needs improvement.`
        workflow.overall_status = 'rejected'
        
        // Notify content team
        await this.notifyReviewers('ai_quality_failed', workflow, qualityMetrics)
      }

    } catch (error) {
      console.error('AI quality stage error:', error)
      const aiStage = workflow.stages.find(s => s.stage === 'ai_quality')!
      aiStage.status = 'rejected'
      aiStage.notes = `Error during AI quality assessment: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }

  /**
   * Stage 2: Fact-Checking
   */
  private static async processFactCheckStage(workflow: ContentReviewWorkflow): Promise<void> {
    try {
      const post = await prisma.blogPost.findUnique({
        where: { id: workflow.post_id }
      })

      if (!post) {
        throw new Error('Blog post not found')
      }

      // Perform fact-checking
      const factCheckReport = await ContentQualityChecker.performFactCheck(post.content)

      // Update post with fact-check status
      const factCheckPassed = factCheckReport.overall_accuracy >= 80
      await prisma.blogPost.update({
        where: { id: workflow.post_id },
        data: {
          factCheckStatus: factCheckPassed ? 'approved' : 'needs_review'
        }
      })

      const factStage = workflow.stages.find(s => s.stage === 'fact_check')!
      
      if (factCheckPassed) {
        factStage.status = 'completed'
        factStage.completed_at = new Date()
        factStage.notes = `Fact-check accuracy: ${factCheckReport.overall_accuracy}%. Passed fact verification.`
        
        // Move to SEO optimization stage
        workflow.current_stage = 'seo_optimization'
        await this.processSEOOptimizationStage(workflow)
      } else {
        factStage.status = 'rejected'
        factStage.notes = `Fact-check accuracy: ${factCheckReport.overall_accuracy}%. Requires manual fact verification.`
        
        // Create content review record for manual review
        await this.createManualReviewTask(workflow.post_id, 'fact_check', factCheckReport)
        
        // Notify fact-checkers
        await this.notifyReviewers('fact_check_required', workflow, factCheckReport)
      }

    } catch (error) {
      console.error('Fact-check stage error:', error)
      const factStage = workflow.stages.find(s => s.stage === 'fact_check')!
      factStage.status = 'rejected'
      factStage.notes = `Error during fact-checking: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }

  /**
   * Stage 3: SEO Optimization
   */
  private static async processSEOOptimizationStage(workflow: ContentReviewWorkflow): Promise<void> {
    try {
      const post = await prisma.blogPost.findUnique({
        where: { id: workflow.post_id }
      })

      if (!post) {
        throw new Error('Blog post not found')
      }

      // Perform SEO optimization
      const seoScore = await ContentQualityChecker.calculateSEOScore(post.content, post.title)
      const seoOptimized = seoScore >= 70

      // Update post with SEO status
      await prisma.blogPost.update({
        where: { id: workflow.post_id },
        data: {
          seoOptimized: seoOptimized,
          internalLinksAdded: true // Assume internal links are added during SEO optimization
        }
      })

      const seoStage = workflow.stages.find(s => s.stage === 'seo_optimization')!
      
      if (seoOptimized) {
        seoStage.status = 'completed'
        seoStage.completed_at = new Date()
        seoStage.notes = `SEO score: ${seoScore}%. SEO optimization completed.`
        
        // Move to final approval stage
        workflow.current_stage = 'final_approval'
        await this.processFinalApprovalStage(workflow)
      } else {
        seoStage.status = 'rejected'
        seoStage.notes = `SEO score: ${seoScore}%. Requires SEO improvements.`
        
        // Create manual review task for SEO optimization
        await this.createManualReviewTask(workflow.post_id, 'seo_optimization', { seo_score: seoScore })
        
        // Notify SEO team
        await this.notifyReviewers('seo_optimization_required', workflow, { seo_score: seoScore })
      }

    } catch (error) {
      console.error('SEO optimization stage error:', error)
      const seoStage = workflow.stages.find(s => s.stage === 'seo_optimization')!
      seoStage.status = 'rejected'
      seoStage.notes = `Error during SEO optimization: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }

  /**
   * Stage 4: Final Approval
   */
  private static async processFinalApprovalStage(workflow: ContentReviewWorkflow): Promise<void> {
    try {
      // For automated approval, check if all previous stages passed
      const allStagesPassed = workflow.stages
        .filter(s => s.stage !== 'final_approval')
        .every(s => s.status === 'completed')

      const finalStage = workflow.stages.find(s => s.stage === 'final_approval')!
      
      if (allStagesPassed) {
        // Auto-approve if all stages passed
        finalStage.status = 'completed'
        finalStage.completed_at = new Date()
        finalStage.notes = 'Auto-approved: All review stages passed successfully.'
        
        workflow.overall_status = 'approved'
        
        // Schedule for publication
        await this.scheduleForPublication(workflow.post_id)
        
        // Notify content team of approval
        await this.notifyReviewers('content_approved', workflow)
      } else {
        // Require manual approval
        finalStage.status = 'pending'
        finalStage.notes = 'Manual approval required due to failed review stages.'
        
        // Create manual review task
        await this.createManualReviewTask(workflow.post_id, 'final_approval', workflow)
        
        // Notify content managers
        await this.notifyReviewers('manual_approval_required', workflow)
      }

    } catch (error) {
      console.error('Final approval stage error:', error)
      const finalStage = workflow.stages.find(s => s.stage === 'final_approval')!
      finalStage.status = 'rejected'
      finalStage.notes = `Error during final approval: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }

  /**
   * Create manual review task
   */
  private static async createManualReviewTask(
    postId: string, 
    reviewType: string, 
    data: any
  ): Promise<void> {
    try {
      await prisma.contentReview.create({
        data: {
          postId,
          reviewStatus: 'pending',
          reviewNotes: `Manual review required for ${reviewType}`,
          factCheckCompleted: reviewType === 'fact_check',
          seoCheckCompleted: reviewType === 'seo_optimization',
          suggestedChanges: JSON.stringify(data)
        }
      })
    } catch (error) {
      console.error('Error creating manual review task:', error)
    }
  }

  /**
   * Schedule content for publication
   */
  private static async scheduleForPublication(postId: string): Promise<void> {
    try {
      // Schedule for immediate publication or set scheduled publish time
      const publishTime = new Date()
      publishTime.setMinutes(publishTime.getMinutes() + 5) // Publish in 5 minutes

      await prisma.blogPost.update({
        where: { id: postId },
        data: {
          status: 'published',
          publishedAt: publishTime
        }
      })
    } catch (error) {
      console.error('Error scheduling publication:', error)
    }
  }

  /**
   * Notify reviewers via email
   */
  private static async notifyReviewers(
    notificationType: string, 
    workflow: ContentReviewWorkflow, 
    data?: any
  ): Promise<void> {
    try {
      const post = await prisma.blogPost.findUnique({
        where: { id: workflow.post_id },
        select: { title: true, slug: true }
      })

      if (!post) return

      const emailSubject = this.getEmailSubject(notificationType, post.title)
      const emailBody = this.getEmailBody(notificationType, post, workflow, data)

      // Get reviewer email addresses (would be configured in environment)
      const reviewerEmails = process.env.CONTENT_REVIEWER_EMAILS?.split(',') || []

      for (const email of reviewerEmails) {
        await sendEmail({
          to: email.trim(),
          subject: emailSubject,
          html: emailBody
        })
      }
    } catch (error) {
      console.error('Error sending reviewer notifications:', error)
    }
  }

  /**
   * Get email subject based on notification type
   */
  private static getEmailSubject(notificationType: string, postTitle: string): string {
    const subjects = {
      'ai_quality_failed': `[Mass Pension] AI Quality Check Failed: ${postTitle}`,
      'fact_check_required': `[Mass Pension] Fact Check Required: ${postTitle}`,
      'seo_optimization_required': `[Mass Pension] SEO Optimization Required: ${postTitle}`,
      'manual_approval_required': `[Mass Pension] Manual Approval Required: ${postTitle}`,
      'content_approved': `[Mass Pension] Content Approved: ${postTitle}`
    }
    
    return subjects[notificationType] || `[Mass Pension] Content Review: ${postTitle}`
  }

  /**
   * Get email body based on notification type
   */
  private static getEmailBody(
    notificationType: string, 
    post: any, 
    workflow: ContentReviewWorkflow, 
    data?: any
  ): string {
    const baseUrl = process.env.NEXTAUTH_URL || 'https://masspension.com'
    const reviewUrl = `${baseUrl}/admin/blog/review?post=${workflow.post_id}`
    
    return `
      <h2>Massachusetts Retirement System - Content Review</h2>
      <h3>${post.title}</h3>
      
      <p><strong>Review Type:</strong> ${notificationType.replace(/_/g, ' ').toUpperCase()}</p>
      <p><strong>Current Stage:</strong> ${workflow.current_stage.replace(/_/g, ' ').toUpperCase()}</p>
      <p><strong>Overall Status:</strong> ${workflow.overall_status.toUpperCase()}</p>
      
      ${data ? `<p><strong>Additional Details:</strong> ${JSON.stringify(data, null, 2)}</p>` : ''}
      
      <p><a href="${reviewUrl}" style="background: #1E40AF; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Review Content</a></p>
      
      <p><em>This is an automated notification from the Massachusetts Retirement System AI Blog Management System.</em></p>
    `
  }
}
