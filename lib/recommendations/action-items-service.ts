/**
 * Action Items Service
 * Massachusetts Retirement System - Action Items and Recommendations
 * 
 * Service layer for managing action items in the database,
 * including CRUD operations and recommendation generation.
 */

import { prisma } from '@/lib/prisma'
import { ActionItem, RetirementProfile, RetirementCalculation } from '@prisma/client'
import { recommendationEngine, ActionItemTemplate, RecommendationContext } from './recommendation-engine'
import { monitorAsyncOperation } from '@/components/error-boundary/error-monitoring'

export interface ActionItemWithRelations extends ActionItem {
  relatedCalculation?: RetirementCalculation | null
}

export interface ActionItemCreateData {
  userId: string
  title: string
  description: string
  category: string
  priority: string
  status?: string
  actionType: string
  actionUrl?: string
  actionData?: Record<string, any>
  triggerCondition?: string
  targetGroup?: string
  targetAgeRange?: string
  targetServiceRange?: string
  relatedCalculationId?: string
  displayOrder?: number
  expiresAt?: Date
  isSystemGenerated?: boolean
  generationReason?: string
}

export interface ActionItemUpdateData {
  title?: string
  description?: string
  category?: string
  priority?: string
  status?: string
  actionType?: string
  actionUrl?: string
  actionData?: Record<string, any>
  displayOrder?: number
  completedAt?: Date
  dismissedAt?: Date
  dismissalReason?: string
}

export interface ActionItemFilters {
  status?: string | string[]
  category?: string | string[]
  priority?: string | string[]
  isExpired?: boolean
  includeCompleted?: boolean
  includeDismissed?: boolean
}

export class ActionItemsService {
  /**
   * Get all action items for a user with optional filtering
   */
  static async getUserActionItems(
    userId: string,
    filters: ActionItemFilters = {}
  ): Promise<ActionItemWithRelations[]> {
    return monitorAsyncOperation(async () => {
      const {
        status,
        category,
        priority,
        isExpired,
        includeCompleted = false,
        includeDismissed = false,
      } = filters

      const where: any = { userId }

      // Status filtering
      if (status) {
        if (Array.isArray(status)) {
          where.status = { in: status }
        } else {
          where.status = status
        }
      } else {
        // Default: exclude completed and dismissed unless explicitly included
        const excludeStatuses = []
        if (!includeCompleted) excludeStatuses.push('completed')
        if (!includeDismissed) excludeStatuses.push('dismissed')
        
        if (excludeStatuses.length > 0) {
          where.status = { notIn: excludeStatuses }
        }
      }

      // Category filtering
      if (category) {
        if (Array.isArray(category)) {
          where.category = { in: category }
        } else {
          where.category = category
        }
      }

      // Priority filtering
      if (priority) {
        if (Array.isArray(priority)) {
          where.priority = { in: priority }
        } else {
          where.priority = priority
        }
      }

      // Expiration filtering
      if (isExpired !== undefined) {
        if (isExpired) {
          where.expiresAt = { lt: new Date() }
        } else {
          where.OR = [
            { expiresAt: null },
            { expiresAt: { gte: new Date() } }
          ]
        }
      }

      return await prisma.actionItem.findMany({
        where,
        include: {
          relatedCalculation: true,
        },
        orderBy: [
          { displayOrder: 'asc' },
          { priority: 'desc' },
          { createdAt: 'desc' },
        ],
      })
    }, 'get_user_action_items')
  }

  /**
   * Get a specific action item by ID
   */
  static async getActionItem(id: string, userId: string): Promise<ActionItemWithRelations | null> {
    return monitorAsyncOperation(async () => {
      return await prisma.actionItem.findFirst({
        where: { id, userId },
        include: {
          relatedCalculation: true,
        },
      })
    }, 'get_action_item')
  }

  /**
   * Create a new action item
   */
  static async createActionItem(data: ActionItemCreateData): Promise<ActionItem> {
    return monitorAsyncOperation(async () => {
      const actionData = data.actionData ? JSON.stringify(data.actionData) : null

      return await prisma.actionItem.create({
        data: {
          ...data,
          actionData,
          status: data.status || 'pending',
          displayOrder: data.displayOrder || 0,
          isSystemGenerated: data.isSystemGenerated ?? true,
        },
      })
    }, 'create_action_item')
  }

  /**
   * Update an existing action item
   */
  static async updateActionItem(
    id: string,
    userId: string,
    data: ActionItemUpdateData
  ): Promise<ActionItem | null> {
    return monitorAsyncOperation(async () => {
      const updateData: any = { ...data }

      // Handle JSON serialization
      if (data.actionData) {
        updateData.actionData = JSON.stringify(data.actionData)
      }

      // Set completion/dismissal timestamps
      if (data.status === 'completed' && !data.completedAt) {
        updateData.completedAt = new Date()
      }
      if (data.status === 'dismissed' && !data.dismissedAt) {
        updateData.dismissedAt = new Date()
      }

      return await prisma.actionItem.updateMany({
        where: { id, userId },
        data: updateData,
      }).then(async () => {
        return await prisma.actionItem.findFirst({
          where: { id, userId },
        })
      })
    }, 'update_action_item')
  }

  /**
   * Delete an action item
   */
  static async deleteActionItem(id: string, userId: string): Promise<boolean> {
    return monitorAsyncOperation(async () => {
      const result = await prisma.actionItem.deleteMany({
        where: { id, userId },
      })
      return result.count > 0
    }, 'delete_action_item')
  }

  /**
   * Mark action item as completed
   */
  static async completeActionItem(
    id: string,
    userId: string,
    completionData?: Record<string, any>
  ): Promise<ActionItem | null> {
    return this.updateActionItem(id, userId, {
      status: 'completed',
      completedAt: new Date(),
      actionData: completionData,
    })
  }

  /**
   * Dismiss an action item
   */
  static async dismissActionItem(
    id: string,
    userId: string,
    reason?: string
  ): Promise<ActionItem | null> {
    return this.updateActionItem(id, userId, {
      status: 'dismissed',
      dismissedAt: new Date(),
      dismissalReason: reason,
    })
  }

  /**
   * Generate and save new action items for a user
   */
  static async generateActionItems(userId: string): Promise<ActionItem[]> {
    return monitorAsyncOperation(async () => {
      // Get user profile and calculations
      const profile = await prisma.retirementProfile.findUnique({
        where: { userId },
      })

      const calculations = await prisma.retirementCalculation.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      })

      const existingActionItems = await prisma.actionItem.findMany({
        where: { userId },
      })

      // Analyze user data
      const analysis = recommendationEngine.analyzeUser(profile, calculations)

      // Generate recommendations
      const context: RecommendationContext = {
        userId,
        analysis,
        existingActionItems,
        lastGeneratedAt: existingActionItems.length > 0 
          ? new Date(Math.max(...existingActionItems.map(item => item.createdAt.getTime())))
          : undefined,
      }

      const recommendations = recommendationEngine.generateRecommendations(context)

      // Create action items from recommendations
      const createdItems: ActionItem[] = []
      
      for (const recommendation of recommendations) {
        try {
          const actionItem = await this.createActionItem({
            userId,
            title: recommendation.title,
            description: recommendation.description,
            category: recommendation.category,
            priority: recommendation.priority,
            actionType: recommendation.actionType,
            actionUrl: recommendation.actionUrl,
            actionData: recommendation.actionData,
            triggerCondition: recommendation.triggerCondition,
            targetGroup: recommendation.targetGroup,
            targetAgeRange: recommendation.targetAgeRange,
            targetServiceRange: recommendation.targetServiceRange,
            expiresAt: recommendation.expiresInDays 
              ? new Date(Date.now() + recommendation.expiresInDays * 24 * 60 * 60 * 1000)
              : undefined,
            isSystemGenerated: true,
            generationReason: recommendation.generationReason,
            displayOrder: createdItems.length,
          })

          createdItems.push(actionItem)
        } catch (error) {
          console.error(`Failed to create action item: ${recommendation.title}`, error)
        }
      }

      return createdItems
    }, 'generate_action_items')
  }

  /**
   * Clean up expired action items
   */
  static async cleanupExpiredItems(userId?: string): Promise<number> {
    return monitorAsyncOperation(async () => {
      const where: any = {
        expiresAt: { lt: new Date() },
        status: { in: ['pending', 'in-progress'] },
      }

      if (userId) {
        where.userId = userId
      }

      const result = await prisma.actionItem.updateMany({
        where,
        data: {
          status: 'dismissed',
          dismissedAt: new Date(),
          dismissalReason: 'Expired automatically',
        },
      })

      return result.count
    }, 'cleanup_expired_items')
  }

  /**
   * Get action items statistics for a user
   */
  static async getActionItemsStats(userId: string): Promise<{
    total: number
    pending: number
    inProgress: number
    completed: number
    dismissed: number
    byCategory: Record<string, number>
    byPriority: Record<string, number>
  }> {
    return monitorAsyncOperation(async () => {
      const items = await prisma.actionItem.findMany({
        where: { userId },
        select: {
          status: true,
          category: true,
          priority: true,
        },
      })

      const stats = {
        total: items.length,
        pending: 0,
        inProgress: 0,
        completed: 0,
        dismissed: 0,
        byCategory: {} as Record<string, number>,
        byPriority: {} as Record<string, number>,
      }

      items.forEach(item => {
        // Count by status
        switch (item.status) {
          case 'pending':
            stats.pending++
            break
          case 'in-progress':
            stats.inProgress++
            break
          case 'completed':
            stats.completed++
            break
          case 'dismissed':
            stats.dismissed++
            break
        }

        // Count by category
        stats.byCategory[item.category] = (stats.byCategory[item.category] || 0) + 1

        // Count by priority
        stats.byPriority[item.priority] = (stats.byPriority[item.priority] || 0) + 1
      })

      return stats
    }, 'get_action_items_stats')
  }

  /**
   * Bulk update action items
   */
  static async bulkUpdateActionItems(
    userId: string,
    updates: Array<{ id: string; data: ActionItemUpdateData }>
  ): Promise<ActionItem[]> {
    return monitorAsyncOperation(async () => {
      const updatedItems: ActionItem[] = []

      for (const update of updates) {
        const item = await this.updateActionItem(update.id, userId, update.data)
        if (item) {
          updatedItems.push(item)
        }
      }

      return updatedItems
    }, 'bulk_update_action_items')
  }
}
