/**
 * Action Items Service
 * Manages personalized action items and recommendations for Massachusetts Retirement System users
 * Provides CRUD operations and intelligent recommendation generation
 */

import { query } from '@/lib/db/postgres'

// TypeScript interfaces for action items
export interface ActionItem {
  id: string
  userId: string
  title: string
  description: string
  category: 'profile' | 'calculation' | 'planning' | 'optimization' | 'education'
  priority: 'high' | 'medium' | 'low'
  status: 'pending' | 'in-progress' | 'completed' | 'dismissed'
  actionType: 'navigate' | 'calculate' | 'review' | 'contact' | 'learn'
  actionUrl?: string
  actionData?: string // JSON string
  triggerCondition?: string
  targetGroup?: string
  targetAgeRange?: string
  targetServiceRange?: string
  relatedCalculationId?: string
  displayOrder?: number
  expiresAt?: Date
  isSystemGenerated: boolean
  generationReason?: string
  completedAt?: Date
  dismissedAt?: Date
  dismissalReason?: string
  createdAt: Date
  updatedAt: Date
}

export interface ActionItemFilters {
  status?: string | string[]
  category?: string | string[]
  priority?: string | string[]
  isExpired?: boolean
  includeCompleted?: boolean
  includeDismissed?: boolean
}

export interface ActionItemStats {
  total: number
  pending: number
  inProgress: number
  completed: number
  dismissed: number
  expired: number
  highPriority: number
  mediumPriority: number
  lowPriority: number
}

export interface CreateActionItemData {
  userId: string
  title: string
  description: string
  category: ActionItem['category']
  priority: ActionItem['priority']
  actionType: ActionItem['actionType']
  actionUrl?: string
  actionData?: any
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

export interface UpdateActionItemData {
  title?: string
  description?: string
  category?: ActionItem['category']
  priority?: ActionItem['priority']
  status?: ActionItem['status']
  actionType?: ActionItem['actionType']
  actionUrl?: string
  actionData?: any
  displayOrder?: number
  dismissalReason?: string
  completedAt?: Date | null
  dismissedAt?: Date | null
}

/**
 * Action Items Service Class
 * Provides comprehensive action item management for the Massachusetts Retirement System
 */
export class ActionItemsService {
  /**
   * Get action items for a user with optional filtering
   */
  static async getUserActionItems(
    userId: string,
    filters: ActionItemFilters = {}
  ): Promise<ActionItem[]> {
    try {
      let queryText = `
        SELECT * FROM action_items
        WHERE user_id = $1
      `
      const params: any[] = [userId]
      let paramIndex = 2

      // Apply status filter
      if (filters.status) {
        const statuses = Array.isArray(filters.status) ? filters.status : [filters.status]
        const placeholders = statuses.map(() => `$${paramIndex++}`).join(', ')
        queryText += ` AND status IN (${placeholders})`
        params.push(...statuses)
      }

      // Apply category filter
      if (filters.category) {
        const categories = Array.isArray(filters.category) ? filters.category : [filters.category]
        const placeholders = categories.map(() => `$${paramIndex++}`).join(', ')
        queryText += ` AND category IN (${placeholders})`
        params.push(...categories)
      }

      // Apply priority filter
      if (filters.priority) {
        const priorities = Array.isArray(filters.priority) ? filters.priority : [filters.priority]
        const placeholders = priorities.map(() => `$${paramIndex++}`).join(', ')
        queryText += ` AND priority IN (${placeholders})`
        params.push(...priorities)
      }

      // Apply expiration filter
      if (filters.isExpired !== undefined) {
        if (filters.isExpired) {
          queryText += ` AND expires_at IS NOT NULL AND expires_at < NOW()`
        } else {
          queryText += ` AND (expires_at IS NULL OR expires_at >= NOW())`
        }
      }

      // Apply completed filter
      if (!filters.includeCompleted) {
        queryText += ` AND status != 'completed'`
      }

      // Apply dismissed filter
      if (!filters.includeDismissed) {
        queryText += ` AND status != 'dismissed'`
      }

      queryText += ` ORDER BY
        CASE priority
          WHEN 'high' THEN 1
          WHEN 'medium' THEN 2
          WHEN 'low' THEN 3
        END,
        display_order ASC,
        created_at DESC
      `

      const result = await query(queryText, params)
      return result.rows.map(this.mapRowToActionItem)
    } catch (error) {
      console.error('Error fetching user action items:', error)
      throw new Error('Failed to fetch action items')
    }
  }

  /**
   * Get a specific action item by ID
   */
  static async getActionItem(id: string, userId: string): Promise<ActionItem | null> {
    try {
      const result = await query(
        'SELECT * FROM action_items WHERE id = $1 AND user_id = $2',
        [id, userId]
      )
      return result.rows[0] ? this.mapRowToActionItem(result.rows[0]) : null
    } catch (error) {
      console.error('Error fetching action item:', error)
      throw new Error('Failed to fetch action item')
    }
  }

  /**
   * Create a new action item
   */
  static async createActionItem(data: CreateActionItemData): Promise<ActionItem> {
    try {
      const id = this.generateId()
      const now = new Date().toISOString()

      await query(`
        INSERT INTO action_items (
          id, user_id, title, description, category, priority, status,
          action_type, action_url, action_data, trigger_condition,
          target_group, target_age_range, target_service_range,
          related_calculation_id, display_order, expires_at,
          is_system_generated, generation_reason, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
      `, [
        id, data.userId, data.title, data.description, data.category,
        data.priority, 'pending', data.actionType, data.actionUrl,
        data.actionData ? JSON.stringify(data.actionData) : null,
        data.triggerCondition, data.targetGroup, data.targetAgeRange,
        data.targetServiceRange, data.relatedCalculationId, data.displayOrder,
        data.expiresAt?.toISOString(), data.isSystemGenerated || false,
        data.generationReason, now, now
      ])

      const actionItem = await this.getActionItem(id, data.userId)
      if (!actionItem) {
        throw new Error('Failed to create action item')
      }

      return actionItem
    } catch (error) {
      console.error('Error creating action item:', error)
      throw new Error('Failed to create action item')
    }
  }

  /**
   * Update an existing action item
   */
  static async updateActionItem(
    id: string,
    userId: string,
    data: UpdateActionItemData
  ): Promise<ActionItem | null> {
    try {
      const updates: string[] = []
      const params: any[] = []
      let paramIndex = 1

      // Build dynamic update query
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined) {
          const columnName = this.camelToSnake(key)
          updates.push(`${columnName} = $${paramIndex++}`)

          if (key === 'actionData' && value !== null) {
            params.push(JSON.stringify(value))
          } else {
            params.push(value)
          }
        }
      })

      if (updates.length === 0) {
        return await this.getActionItem(id, userId)
      }

      updates.push(`updated_at = $${paramIndex++}`)
      params.push(new Date().toISOString())
      params.push(id, userId)

      await query(
        `UPDATE action_items SET ${updates.join(', ')} WHERE id = $${paramIndex++} AND user_id = $${paramIndex++}`,
        params
      )

      return await this.getActionItem(id, userId)
    } catch (error) {
      console.error('Error updating action item:', error)
      throw new Error('Failed to update action item')
    }
  }

  /**
   * Complete an action item
   */
  static async completeActionItem(
    id: string,
    userId: string,
    completionData?: any
  ): Promise<ActionItem | null> {
    return await this.updateActionItem(id, userId, {
      status: 'completed',
      completedAt: new Date(),
      actionData: completionData
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
    return await this.updateActionItem(id, userId, {
      status: 'dismissed',
      dismissedAt: new Date(),
      dismissalReason: reason
    })
  }

  /**
   * Delete an action item
   */
  static async deleteActionItem(id: string, userId: string): Promise<boolean> {
    try {
      const result = await query(
        'DELETE FROM action_items WHERE id = $1 AND user_id = $2',
        [id, userId]
      )
      return (result.rowCount || 0) > 0
    } catch (error) {
      console.error('Error deleting action item:', error)
      throw new Error('Failed to delete action item')
    }
  }

  /**
   * Get action items statistics for a user
   */
  static async getActionItemsStats(userId: string): Promise<ActionItemStats> {
    try {
      const result = await query(`
        SELECT
          COUNT(*) as total,
          SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
          SUM(CASE WHEN status = 'in-progress' THEN 1 ELSE 0 END) as "inProgress",
          SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
          SUM(CASE WHEN status = 'dismissed' THEN 1 ELSE 0 END) as dismissed,
          SUM(CASE WHEN expires_at IS NOT NULL AND expires_at < NOW() THEN 1 ELSE 0 END) as expired,
          SUM(CASE WHEN priority = 'high' THEN 1 ELSE 0 END) as "highPriority",
          SUM(CASE WHEN priority = 'medium' THEN 1 ELSE 0 END) as "mediumPriority",
          SUM(CASE WHEN priority = 'low' THEN 1 ELSE 0 END) as "lowPriority"
        FROM action_items
        WHERE user_id = $1
      `, [userId])

      const stats = result.rows[0]

      return {
        total: parseInt(stats?.total) || 0,
        pending: parseInt(stats?.pending) || 0,
        inProgress: parseInt(stats?.inProgress) || 0,
        completed: parseInt(stats?.completed) || 0,
        dismissed: parseInt(stats?.dismissed) || 0,
        expired: parseInt(stats?.expired) || 0,
        highPriority: parseInt(stats?.highPriority) || 0,
        mediumPriority: parseInt(stats?.mediumPriority) || 0,
        lowPriority: parseInt(stats?.lowPriority) || 0,
      }
    } catch (error) {
      console.error('Error fetching action items stats:', error)
      throw new Error('Failed to fetch action items statistics')
    }
  }

  /**
   * Generate personalized action items for a user
   */
  static async generateActionItems(userId: string): Promise<ActionItem[]> {
    try {
      // This is a simplified implementation
      // In a real system, this would analyze user data and generate personalized recommendations
      
      const defaultActionItems: CreateActionItemData[] = [
        {
          userId,
          title: 'Complete Your Retirement Profile',
          description: 'Ensure all your personal information is up to date for accurate calculations',
          category: 'profile',
          priority: 'high',
          actionType: 'navigate',
          actionUrl: '/profile',
          isSystemGenerated: true,
          generationReason: 'Profile completion check',
          displayOrder: 1
        },
        {
          userId,
          title: 'Review Your Pension Calculation',
          description: 'Verify your pension benefits calculation with current salary and service years',
          category: 'calculation',
          priority: 'high',
          actionType: 'calculate',
          actionUrl: '/calculator',
          isSystemGenerated: true,
          generationReason: 'Pension calculation review',
          displayOrder: 2
        },
        {
          userId,
          title: 'Explore Social Security Benefits',
          description: 'Learn about Social Security integration with your Massachusetts pension',
          category: 'planning',
          priority: 'medium',
          actionType: 'learn',
          actionUrl: '/social-security',
          isSystemGenerated: true,
          generationReason: 'Social Security education',
          displayOrder: 3
        }
      ]

      const createdItems: ActionItem[] = []
      
      for (const itemData of defaultActionItems) {
        try {
          const item = await this.createActionItem(itemData)
          createdItems.push(item)
        } catch (error) {
          console.warn('Failed to create action item:', itemData.title, error)
        }
      }

      return createdItems
    } catch (error) {
      console.error('Error generating action items:', error)
      throw new Error('Failed to generate action items')
    }
  }

  /**
   * Clean up expired action items
   */
  static async cleanupExpiredItems(userId: string): Promise<number> {
    try {
      const result = await query(`
        DELETE FROM action_items
        WHERE user_id = $1
        AND expires_at IS NOT NULL
        AND expires_at < NOW()
        AND status NOT IN ('completed', 'dismissed')
      `, [userId])

      return result.rowCount || 0
    } catch (error) {
      console.error('Error cleaning up expired action items:', error)
      throw new Error('Failed to cleanup expired action items')
    }
  }

  // Helper methods
  private static mapRowToActionItem(row: any): ActionItem {
    return {
      id: row.id,
      userId: row.user_id,
      title: row.title,
      description: row.description,
      category: row.category,
      priority: row.priority,
      status: row.status,
      actionType: row.action_type,
      actionUrl: row.action_url,
      actionData: row.action_data,
      triggerCondition: row.trigger_condition,
      targetGroup: row.target_group,
      targetAgeRange: row.target_age_range,
      targetServiceRange: row.target_service_range,
      relatedCalculationId: row.related_calculation_id,
      displayOrder: row.display_order,
      expiresAt: row.expires_at ? new Date(row.expires_at) : undefined,
      isSystemGenerated: Boolean(row.is_system_generated),
      generationReason: row.generation_reason,
      completedAt: row.completed_at ? new Date(row.completed_at) : undefined,
      dismissedAt: row.dismissed_at ? new Date(row.dismissed_at) : undefined,
      dismissalReason: row.dismissal_reason,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    }
  }

  private static camelToSnake(str: string): string {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
  }

  private static generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36)
  }
}
