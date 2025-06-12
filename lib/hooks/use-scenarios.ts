import { useState, useEffect, useCallback } from 'react'
import { RetirementScenario, ScenarioResults } from '@/lib/scenario-modeling/scenario-types'
import { toast } from 'sonner'

interface ScenarioWithResults extends RetirementScenario {
  results?: ScenarioResults | null
}

interface UseScenarios {
  scenarios: ScenarioWithResults[]
  loading: boolean
  error: string | null
  pagination: {
    total: number
    limit: number
    offset: number
    hasMore: boolean
  }
  // CRUD operations
  createScenario: (scenarioData: Omit<RetirementScenario, 'id' | 'createdAt' | 'updatedAt'>) => Promise<ScenarioWithResults | null>
  updateScenario: (id: string, updates: Partial<RetirementScenario>) => Promise<ScenarioWithResults | null>
  deleteScenario: (id: string) => Promise<boolean>
  duplicateScenario: (id: string) => Promise<ScenarioWithResults | null>
  setBaseline: (id: string) => Promise<ScenarioWithResults | null>
  recalculateScenario: (id: string) => Promise<ScenarioWithResults | null>
  // Bulk operations
  bulkDelete: (ids: string[]) => Promise<boolean>
  bulkDuplicate: (ids: string[]) => Promise<ScenarioWithResults[]>
  createComparison: (ids: string[], name?: string, description?: string) => Promise<any>
  // Data management
  refreshScenarios: () => Promise<void>
  loadMore: () => Promise<void>
  searchScenarios: (query: string) => Promise<void>
  filterByBaseline: (isBaseline?: boolean) => Promise<void>
}

interface UseScenarioOptions {
  initialLimit?: number
  autoRefresh?: boolean
  refreshInterval?: number
}

export function useScenarios(options: UseScenarioOptions = {}): UseScenarios {
  const {
    initialLimit = 20,
    autoRefresh = false,
    refreshInterval = 30000 // 30 seconds
  } = options

  const [scenarios, setScenarios] = useState<ScenarioWithResults[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    total: 0,
    limit: initialLimit,
    offset: 0,
    hasMore: false
  })
  const [filters, setFilters] = useState<{
    search?: string
    isBaseline?: boolean
  }>({})

  // Fetch scenarios from API
  const fetchScenarios = useCallback(async (
    offset = 0,
    limit = initialLimit,
    append = false
  ) => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString()
      })

      if (filters.search) {
        params.append('search', filters.search)
      }
      if (filters.isBaseline !== undefined) {
        params.append('isBaseline', filters.isBaseline.toString())
      }

      const response = await fetch(`/api/scenarios?${params}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch scenarios: ${response.statusText}`)
      }

      const data = await response.json()

      if (append) {
        setScenarios(prev => [...prev, ...data.scenarios])
      } else {
        setScenarios(data.scenarios)
      }

      setPagination(data.pagination)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch scenarios'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [filters, initialLimit])

  // Initial load
  useEffect(() => {
    fetchScenarios()
  }, [fetchScenarios])

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      fetchScenarios(0, pagination.limit)
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, fetchScenarios, pagination.limit])

  // Create scenario
  const createScenario = useCallback(async (
    scenarioData: Omit<RetirementScenario, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<ScenarioWithResults | null> => {
    try {
      const response = await fetch('/api/scenarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scenarioData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create scenario')
      }

      const data = await response.json()
      
      // Add to local state
      setScenarios(prev => [data.scenario, ...prev])
      setPagination(prev => ({ ...prev, total: prev.total + 1 }))
      
      toast.success(data.message || 'Scenario created successfully')
      return data.scenario
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create scenario'
      setError(errorMessage)
      toast.error(errorMessage)
      return null
    }
  }, [])

  // Update scenario
  const updateScenario = useCallback(async (
    id: string,
    updates: Partial<RetirementScenario>
  ): Promise<ScenarioWithResults | null> => {
    try {
      const response = await fetch(`/api/scenarios/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update scenario')
      }

      const data = await response.json()
      
      // Update local state
      setScenarios(prev => prev.map(s => s.id === id ? data.scenario : s))
      
      toast.success(data.message || 'Scenario updated successfully')
      return data.scenario
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update scenario'
      setError(errorMessage)
      toast.error(errorMessage)
      return null
    }
  }, [])

  // Delete scenario
  const deleteScenario = useCallback(async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/scenarios/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete scenario')
      }

      const data = await response.json()
      
      // Remove from local state
      setScenarios(prev => prev.filter(s => s.id !== id))
      setPagination(prev => ({ ...prev, total: prev.total - 1 }))
      
      toast.success(data.message || 'Scenario deleted successfully')
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete scenario'
      setError(errorMessage)
      toast.error(errorMessage)
      return false
    }
  }, [])

  // Duplicate scenario
  const duplicateScenario = useCallback(async (id: string): Promise<ScenarioWithResults | null> => {
    try {
      const response = await fetch(`/api/scenarios/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'duplicate' })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to duplicate scenario')
      }

      const data = await response.json()
      
      // Add to local state
      setScenarios(prev => [data.scenario, ...prev])
      setPagination(prev => ({ ...prev, total: prev.total + 1 }))
      
      toast.success(data.message || 'Scenario duplicated successfully')
      return data.scenario
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to duplicate scenario'
      setError(errorMessage)
      toast.error(errorMessage)
      return null
    }
  }, [])

  // Set baseline
  const setBaseline = useCallback(async (id: string): Promise<ScenarioWithResults | null> => {
    try {
      const response = await fetch(`/api/scenarios/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'set_baseline' })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to set baseline')
      }

      const data = await response.json()
      
      // Update local state - unset other baselines and set this one
      setScenarios(prev => prev.map(s => ({
        ...s,
        isBaseline: s.id === id
      })))
      
      toast.success(data.message || 'Baseline set successfully')
      return data.scenario
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to set baseline'
      setError(errorMessage)
      toast.error(errorMessage)
      return null
    }
  }, [])

  // Recalculate scenario
  const recalculateScenario = useCallback(async (id: string): Promise<ScenarioWithResults | null> => {
    try {
      const response = await fetch(`/api/scenarios/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'recalculate' })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to recalculate scenario')
      }

      const data = await response.json()
      
      // Update local state
      setScenarios(prev => prev.map(s => s.id === id ? data.scenario : s))
      
      toast.success(data.message || 'Scenario recalculated successfully')
      return data.scenario
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to recalculate scenario'
      setError(errorMessage)
      toast.error(errorMessage)
      return null
    }
  }, [])

  // Bulk delete
  const bulkDelete = useCallback(async (ids: string[]): Promise<boolean> => {
    try {
      const response = await fetch('/api/scenarios/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', scenarioIds: ids })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete scenarios')
      }

      const data = await response.json()
      
      // Remove from local state
      setScenarios(prev => prev.filter(s => !ids.includes(s.id)))
      setPagination(prev => ({ ...prev, total: prev.total - data.deletedCount }))
      
      toast.success(data.message || `Deleted ${data.deletedCount} scenarios`)
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete scenarios'
      setError(errorMessage)
      toast.error(errorMessage)
      return false
    }
  }, [])

  // Bulk duplicate
  const bulkDuplicate = useCallback(async (ids: string[]): Promise<ScenarioWithResults[]> => {
    try {
      const response = await fetch('/api/scenarios/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'duplicate', scenarioIds: ids })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to duplicate scenarios')
      }

      const data = await response.json()
      
      // Add to local state
      setScenarios(prev => [...data.duplicatedScenarios, ...prev])
      setPagination(prev => ({ ...prev, total: prev.total + data.duplicatedCount }))
      
      toast.success(data.message || `Duplicated ${data.duplicatedCount} scenarios`)
      return data.duplicatedScenarios
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to duplicate scenarios'
      setError(errorMessage)
      toast.error(errorMessage)
      return []
    }
  }, [])

  // Create comparison
  const createComparison = useCallback(async (
    ids: string[],
    name?: string,
    description?: string
  ): Promise<any> => {
    try {
      const response = await fetch('/api/scenarios/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'compare',
          scenarioIds: ids,
          options: { comparisonName: name, comparisonDescription: description }
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create comparison')
      }

      const data = await response.json()
      
      toast.success(data.message || 'Comparison created successfully')
      return data.comparison
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create comparison'
      setError(errorMessage)
      toast.error(errorMessage)
      return null
    }
  }, [])

  // Refresh scenarios
  const refreshScenarios = useCallback(async () => {
    await fetchScenarios(0, pagination.limit)
  }, [fetchScenarios, pagination.limit])

  // Load more scenarios
  const loadMore = useCallback(async () => {
    if (!pagination.hasMore || loading) return
    await fetchScenarios(pagination.offset + pagination.limit, pagination.limit, true)
  }, [fetchScenarios, pagination, loading])

  // Search scenarios
  const searchScenarios = useCallback(async (query: string) => {
    setFilters(prev => ({ ...prev, search: query }))
  }, [])

  // Filter by baseline
  const filterByBaseline = useCallback(async (isBaseline?: boolean) => {
    setFilters(prev => ({ ...prev, isBaseline }))
  }, [])

  return {
    scenarios,
    loading,
    error,
    pagination,
    createScenario,
    updateScenario,
    deleteScenario,
    duplicateScenario,
    setBaseline,
    recalculateScenario,
    bulkDelete,
    bulkDuplicate,
    createComparison,
    refreshScenarios,
    loadMore,
    searchScenarios,
    filterByBaseline
  }
}
