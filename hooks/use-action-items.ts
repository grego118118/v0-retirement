"use client"

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { recordUserAction, monitorAsyncOperation } from '@/components/error-boundary/error-monitoring'

// Types
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
  actionData?: Record<string, any>
  triggerCondition?: string
  targetGroup?: string
  targetAgeRange?: string
  targetServiceRange?: string
  relatedCalculationId?: string
  relatedCalculation?: any
  displayOrder: number
  expiresAt?: string
  isSystemGenerated: boolean
  generationReason?: string
  completedAt?: string
  dismissedAt?: string
  dismissalReason?: string
  createdAt: string
  updatedAt: string
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
  byCategory: Record<string, number>
  byPriority: Record<string, number>
  completionRate: number
  activeItems: number
  overallStatus: 'excellent' | 'good' | 'needs-attention' | 'critical'
  activePriorityBreakdown: {
    high: number
    medium: number
    low: number
  }
  insights: {
    hasHighPriorityItems: boolean
    needsAttention: boolean
    isOnTrack: boolean
    recommendedAction: string
  }
  lastUpdated: string
}

export interface UseActionItemsReturn {
  actionItems: ActionItem[]
  stats: ActionItemStats | null
  isLoading: boolean
  isGenerating: boolean
  error: string | null
  
  // Actions
  fetchActionItems: (filters?: ActionItemFilters) => Promise<void>
  generateActionItems: () => Promise<void>
  updateActionItem: (id: string, data: Partial<ActionItem>) => Promise<void>
  completeActionItem: (id: string, data?: Record<string, any>) => Promise<void>
  dismissActionItem: (id: string, reason?: string) => Promise<void>
  reopenActionItem: (id: string) => Promise<void>
  deleteActionItem: (id: string) => Promise<void>
  fetchStats: () => Promise<void>
  cleanupExpired: () => Promise<void>
  
  // Utilities
  getActionItemsByCategory: (category: string) => ActionItem[]
  getActionItemsByPriority: (priority: string) => ActionItem[]
  getActiveActionItems: () => ActionItem[]
  getHighPriorityItems: () => ActionItem[]
  refreshData: () => Promise<void>
}

export function useActionItems(initialFilters?: ActionItemFilters): UseActionItemsReturn {
  const { data: session } = useSession()
  const [actionItems, setActionItems] = useState<ActionItem[]>([])
  const [stats, setStats] = useState<ActionItemStats | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch action items
  const fetchActionItems = useCallback(async (filters?: ActionItemFilters) => {
    if (!session?.user?.id) return

    return monitorAsyncOperation(async () => {
      setIsLoading(true)
      setError(null)

      try {
        const params = new URLSearchParams()
        
        if (filters) {
          Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined) {
              if (Array.isArray(value)) {
                params.set(key, value.join(','))
              } else {
                params.set(key, String(value))
              }
            }
          })
        }

        const response = await fetch(`/api/action-items?${params}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch action items')
        }

        const data = await response.json()
        setActionItems(data.actionItems || [])
        
        recordUserAction('fetch_action_items', 'action-items-hook', { 
          count: data.actionItems?.length || 0,
          filters 
        })

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error'
        setError(errorMessage)
        console.error('Error fetching action items:', err)
      } finally {
        setIsLoading(false)
      }
    }, 'fetch_action_items')
  }, [session?.user?.id])

  // Generate action items
  const generateActionItems = useCallback(async () => {
    if (!session?.user?.id) return

    return monitorAsyncOperation(async () => {
      setIsGenerating(true)
      setError(null)

      try {
        const response = await fetch('/api/action-items', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ action: 'generate' }),
        })

        if (!response.ok) {
          throw new Error('Failed to generate action items')
        }

        const data = await response.json()
        setActionItems(prev => [...prev, ...data.actionItems])
        
        recordUserAction('generate_action_items', 'action-items-hook', { 
          generated: data.generated 
        })

        return data

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error'
        setError(errorMessage)
        console.error('Error generating action items:', err)
        throw err
      } finally {
        setIsGenerating(false)
      }
    }, 'generate_action_items')
  }, [session?.user?.id])

  // Update action item
  const updateActionItem = useCallback(async (id: string, data: Partial<ActionItem>) => {
    return monitorAsyncOperation(async () => {
      try {
        const response = await fetch(`/api/action-items/${id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        })

        if (!response.ok) {
          throw new Error('Failed to update action item')
        }

        const result = await response.json()
        
        setActionItems(prev => 
          prev.map(item => item.id === id ? result.actionItem : item)
        )

        recordUserAction('update_action_item', 'action-items-hook', { 
          id, 
          updates: Object.keys(data) 
        })

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error'
        setError(errorMessage)
        console.error('Error updating action item:', err)
        throw err
      }
    }, 'update_action_item')
  }, [])

  // Complete action item
  const completeActionItem = useCallback(async (id: string, data?: Record<string, any>) => {
    return monitorAsyncOperation(async () => {
      try {
        const response = await fetch(`/api/action-items/${id}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ action: 'complete', data }),
        })

        if (!response.ok) {
          throw new Error('Failed to complete action item')
        }

        const result = await response.json()
        
        setActionItems(prev => 
          prev.map(item => item.id === id ? result.actionItem : item)
        )

        recordUserAction('complete_action_item', 'action-items-hook', { id })

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error'
        setError(errorMessage)
        console.error('Error completing action item:', err)
        throw err
      }
    }, 'complete_action_item')
  }, [])

  // Dismiss action item
  const dismissActionItem = useCallback(async (id: string, reason?: string) => {
    return monitorAsyncOperation(async () => {
      try {
        const response = await fetch(`/api/action-items/${id}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ action: 'dismiss', reason }),
        })

        if (!response.ok) {
          throw new Error('Failed to dismiss action item')
        }

        const result = await response.json()
        
        setActionItems(prev => 
          prev.map(item => item.id === id ? result.actionItem : item)
        )

        recordUserAction('dismiss_action_item', 'action-items-hook', { id, reason })

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error'
        setError(errorMessage)
        console.error('Error dismissing action item:', err)
        throw err
      }
    }, 'dismiss_action_item')
  }, [])

  // Reopen action item
  const reopenActionItem = useCallback(async (id: string) => {
    return monitorAsyncOperation(async () => {
      try {
        const response = await fetch(`/api/action-items/${id}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ action: 'reopen' }),
        })

        if (!response.ok) {
          throw new Error('Failed to reopen action item')
        }

        const result = await response.json()
        
        setActionItems(prev => 
          prev.map(item => item.id === id ? result.actionItem : item)
        )

        recordUserAction('reopen_action_item', 'action-items-hook', { id })

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error'
        setError(errorMessage)
        console.error('Error reopening action item:', err)
        throw err
      }
    }, 'reopen_action_item')
  }, [])

  // Delete action item
  const deleteActionItem = useCallback(async (id: string) => {
    return monitorAsyncOperation(async () => {
      try {
        const response = await fetch(`/api/action-items/${id}`, {
          method: 'DELETE',
        })

        if (!response.ok) {
          throw new Error('Failed to delete action item')
        }

        setActionItems(prev => prev.filter(item => item.id !== id))
        
        recordUserAction('delete_action_item', 'action-items-hook', { id })

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error'
        setError(errorMessage)
        console.error('Error deleting action item:', err)
        throw err
      }
    }, 'delete_action_item')
  }, [])

  // Fetch statistics
  const fetchStats = useCallback(async () => {
    if (!session?.user?.id) return

    return monitorAsyncOperation(async () => {
      try {
        const response = await fetch('/api/action-items/stats')
        
        if (!response.ok) {
          throw new Error('Failed to fetch action items statistics')
        }

        const data = await response.json()
        setStats(data.stats)

      } catch (err) {
        console.error('Error fetching action items statistics:', err)
      }
    }, 'fetch_action_items_stats')
  }, [session?.user?.id])

  // Cleanup expired items
  const cleanupExpired = useCallback(async () => {
    return monitorAsyncOperation(async () => {
      try {
        const response = await fetch('/api/action-items?action=cleanup', {
          method: 'DELETE',
        })

        if (!response.ok) {
          throw new Error('Failed to cleanup expired action items')
        }

        const data = await response.json()
        
        // Refresh action items after cleanup
        await fetchActionItems(initialFilters)
        
        recordUserAction('cleanup_expired_action_items', 'action-items-hook', { 
          cleanedCount: data.cleanedCount 
        })

        return data

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error'
        setError(errorMessage)
        console.error('Error cleaning up expired action items:', err)
        throw err
      }
    }, 'cleanup_expired_action_items')
  }, [fetchActionItems, initialFilters])

  // Utility functions
  const getActionItemsByCategory = useCallback((category: string) => {
    return actionItems.filter(item => item.category === category)
  }, [actionItems])

  const getActionItemsByPriority = useCallback((priority: string) => {
    return actionItems.filter(item => item.priority === priority)
  }, [actionItems])

  const getActiveActionItems = useCallback(() => {
    return actionItems.filter(item => 
      item.status === 'pending' || item.status === 'in-progress'
    )
  }, [actionItems])

  const getHighPriorityItems = useCallback(() => {
    return actionItems.filter(item => 
      item.priority === 'high' && 
      (item.status === 'pending' || item.status === 'in-progress')
    )
  }, [actionItems])

  const refreshData = useCallback(async () => {
    await Promise.all([
      fetchActionItems(initialFilters),
      fetchStats(),
    ])
  }, [fetchActionItems, fetchStats, initialFilters])

  // Initial data fetch
  useEffect(() => {
    if (session?.user?.id) {
      refreshData()
    }
  }, [session?.user?.id, refreshData])

  return {
    actionItems,
    stats,
    isLoading,
    isGenerating,
    error,
    
    // Actions
    fetchActionItems,
    generateActionItems,
    updateActionItem,
    completeActionItem,
    dismissActionItem,
    reopenActionItem,
    deleteActionItem,
    fetchStats,
    cleanupExpired,
    
    // Utilities
    getActionItemsByCategory,
    getActionItemsByPriority,
    getActiveActionItems,
    getHighPriorityItems,
    refreshData,
  }
}
