"use client"

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'

export interface ActionItem {
  id: string
  userId: string
  title: string
  description: string
  category: string
  priority: 'high' | 'medium' | 'low'
  status: 'pending' | 'completed' | 'in-progress' | 'dismissed'
  actionType: 'navigate' | 'learn' | 'calculate' | 'review'
  actionUrl?: string
  metadata?: Record<string, any>
  createdAt: string
  updatedAt: string
  completedAt?: string
  dismissedAt?: string
  dismissalReason?: string
  expiresAt?: string
}

export interface ActionItemStats {
  total: number
  completed: number
  activeItems: number
  completionRate: number
}

interface UseActionItemsOptions {
  includeCompleted?: boolean
  category?: string[]
  priority?: string[]
}

interface UseActionItemsReturn {
  actionItems: ActionItem[]
  stats: ActionItemStats | null
  isLoading: boolean
  isGenerating: boolean
  error: string | null
  generateActionItems: () => Promise<void>
  completeActionItem: (id: string) => Promise<void>
  dismissActionItem: (id: string, reason?: string) => Promise<void>
  refreshData: () => Promise<void>
}

export function useActionItems(options: UseActionItemsOptions = {}): UseActionItemsReturn {
  const { data: session } = useSession()
  const [actionItems, setActionItems] = useState<ActionItem[]>([])
  const [stats, setStats] = useState<ActionItemStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch action items
  const fetchActionItems = useCallback(async () => {
    if (!session?.user?.id) {
      setIsLoading(false)
      return
    }

    try {
      setError(null)
      const params = new URLSearchParams()
      
      if (options.includeCompleted) {
        params.append('includeCompleted', 'true')
      }
      
      if (options.category?.length) {
        params.append('category', options.category.join(','))
      }
      
      if (options.priority?.length) {
        params.append('priority', options.priority.join(','))
      }

      const response = await fetch(`/api/action-items?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch action items')
      }

      const data = await response.json()
      setActionItems(data.actionItems || [])
      setStats(data.stats || null)
    } catch (err) {
      console.error('Error fetching action items:', err)
      setError(err instanceof Error ? err.message : 'Failed to load action items')
    } finally {
      setIsLoading(false)
    }
  }, [session?.user?.id, options.includeCompleted, options.category, options.priority])

  // Generate new action items
  const generateActionItems = useCallback(async () => {
    if (!session?.user?.id) return

    try {
      setIsGenerating(true)
      setError(null)

      const response = await fetch('/api/action-items/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to generate action items')
      }

      // Refresh the data after generation
      await fetchActionItems()
    } catch (err) {
      console.error('Error generating action items:', err)
      setError(err instanceof Error ? err.message : 'Failed to generate action items')
    } finally {
      setIsGenerating(false)
    }
  }, [session?.user?.id, fetchActionItems])

  // Complete an action item
  const completeActionItem = useCallback(async (id: string) => {
    if (!session?.user?.id) return

    try {
      const response = await fetch(`/api/action-items/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'completed',
          completedAt: new Date().toISOString(),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to complete action item')
      }

      // Update local state
      setActionItems(prev => 
        prev.map(item => 
          item.id === id 
            ? { ...item, status: 'completed' as const, completedAt: new Date().toISOString() }
            : item
        )
      )

      // Refresh stats
      await fetchActionItems()
    } catch (err) {
      console.error('Error completing action item:', err)
      throw err
    }
  }, [session?.user?.id, fetchActionItems])

  // Dismiss an action item
  const dismissActionItem = useCallback(async (id: string, reason?: string) => {
    if (!session?.user?.id) return

    try {
      const response = await fetch(`/api/action-items/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'dismissed',
          dismissedAt: new Date().toISOString(),
          dismissalReason: reason,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to dismiss action item')
      }

      // Update local state
      setActionItems(prev => 
        prev.map(item => 
          item.id === id 
            ? { 
                ...item, 
                status: 'dismissed' as const, 
                dismissedAt: new Date().toISOString(),
                dismissalReason: reason 
              }
            : item
        )
      )

      // Refresh stats
      await fetchActionItems()
    } catch (err) {
      console.error('Error dismissing action item:', err)
      throw err
    }
  }, [session?.user?.id, fetchActionItems])

  // Refresh data
  const refreshData = useCallback(async () => {
    await fetchActionItems()
  }, [fetchActionItems])

  // Initial load
  useEffect(() => {
    fetchActionItems()
  }, [fetchActionItems])

  return {
    actionItems,
    stats,
    isLoading,
    isGenerating,
    error,
    generateActionItems,
    completeActionItem,
    dismissActionItem,
    refreshData,
  }
}
