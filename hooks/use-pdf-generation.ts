"use client"

import { useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { PDFReportData } from '@/components/pdf/pdf-report'
import { recordUserAction, monitorAsyncOperation } from '@/components/error-boundary/error-monitoring'

export interface PDFGenerationOptions {
  reportType?: 'comprehensive' | 'summary' | 'calculations-only'
  includeCharts?: boolean
  includeActionItems?: boolean
  includeSocialSecurity?: boolean
  maxCalculations?: number
}

export interface PDFGenerationResult {
  success: boolean
  data?: PDFReportData
  error?: string
  generationTime?: number
  warnings?: string[]
  metadata?: {
    reportType: string
    generatedAt: string
    userId: string
  }
}

export interface PDFStats {
  totalGenerated: number
  averageGenerationTime: number
  lastGenerated?: Date
  recentGenerations: Array<{
    pdfType: string
    generationTime: number
    createdAt: Date
    success: boolean
  }>
}

export interface PDFValidation {
  canGenerate: boolean
  missingRequirements: string[]
  warnings: string[]
}

export function usePDFGeneration() {
  const { data: session } = useSession()
  const [isGenerating, setIsGenerating] = useState(false)
  const [isLoadingStats, setIsLoadingStats] = useState(false)
  const [lastResult, setLastResult] = useState<PDFGenerationResult | null>(null)
  const [stats, setStats] = useState<PDFStats | null>(null)
  const [validation, setValidation] = useState<PDFValidation | null>(null)

  // Generate PDF report data
  const generatePDF = useCallback(async (options: PDFGenerationOptions = {}): Promise<PDFGenerationResult> => {
    return monitorAsyncOperation(async () => {
      if (!session?.user?.id) {
        throw new Error('Authentication required')
      }

      setIsGenerating(true)

      try {
        recordUserAction('initiate_pdf_generation', 'pdf-generation', {
          userId: session.user.id,
          options,
        })

        const response = await fetch('/api/pdf/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(options),
        })

        const result: PDFGenerationResult = await response.json()

        if (!response.ok) {
          throw new Error(result.error || 'Failed to generate PDF')
        }

        setLastResult(result)

        // Refresh stats after successful generation
        if (result.success) {
          await loadStats()
        }

        return result

      } catch (error) {
        const errorResult: PDFGenerationResult = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        }

        setLastResult(errorResult)
        return errorResult
      } finally {
        setIsGenerating(false)
      }
    }, 'pdf_generation_hook')
  }, [session?.user?.id])

  // Load PDF generation statistics
  const loadStats = useCallback(async () => {
    return monitorAsyncOperation(async () => {
      if (!session?.user?.id) {
        return
      }

      setIsLoadingStats(true)

      try {
        const response = await fetch('/api/pdf/generate', {
          method: 'GET',
        })

        if (!response.ok) {
          throw new Error('Failed to load PDF statistics')
        }

        const data = await response.json()
        setStats(data.stats)
        setValidation(data.validation)

      } catch (error) {
        console.error('Failed to load PDF stats:', error)
      } finally {
        setIsLoadingStats(false)
      }
    }, 'pdf_stats_loading')
  }, [session?.user?.id])

  // Generate filename for PDF download
  const generateFilename = useCallback((reportType: string = 'comprehensive', userName?: string) => {
    const date = new Date().toISOString().split('T')[0]
    const userPart = userName ? `-${userName.replace(/\s+/g, '-')}` : ''
    const typePart = reportType === 'comprehensive' ? 'Complete' :
                     reportType === 'summary' ? 'Summary' : 'Calculations'

    return `MA-Retirement-${typePart}${userPart}-${date}.pdf`
  }, [])

  // Check if user can generate PDFs
  const canGeneratePDF = useCallback(() => {
    return validation?.canGenerate ?? false
  }, [validation])

  // Get missing requirements for PDF generation
  const getMissingRequirements = useCallback(() => {
    return validation?.missingRequirements ?? []
  }, [validation])

  // Get warnings for PDF generation
  const getWarnings = useCallback(() => {
    return validation?.warnings ?? []
  }, [validation])

  // Get generation time statistics
  const getGenerationTimeStats = useCallback(() => {
    if (!stats) return null

    return {
      average: stats.averageGenerationTime,
      total: stats.totalGenerated,
      lastGenerated: stats.lastGenerated,
      recentAverage: stats.recentGenerations.length > 0
        ? stats.recentGenerations.reduce((sum, gen) => sum + gen.generationTime, 0) / stats.recentGenerations.length
        : 0,
    }
  }, [stats])

  // Check if performance is within acceptable limits (sub-2-second requirement)
  const isPerformanceAcceptable = useCallback(() => {
    const timeStats = getGenerationTimeStats()
    if (!timeStats) return true

    return timeStats.average < 2000 && timeStats.recentAverage < 2000
  }, [getGenerationTimeStats])

  // Get performance status
  const getPerformanceStatus = useCallback(() => {
    const timeStats = getGenerationTimeStats()
    if (!timeStats) return 'unknown'

    const avgTime = timeStats.recentAverage || timeStats.average

    if (avgTime < 1000) return 'excellent'
    if (avgTime < 1500) return 'good'
    if (avgTime < 2000) return 'acceptable'
    return 'poor'
  }, [getGenerationTimeStats])

  // Clear last result
  const clearLastResult = useCallback(() => {
    setLastResult(null)
  }, [])

  // Refresh validation status
  const refreshValidation = useCallback(async () => {
    await loadStats()
  }, [loadStats])

  return {
    // State
    isGenerating,
    isLoadingStats,
    lastResult,
    stats,
    validation,

    // Actions
    generatePDF,
    loadStats,
    clearLastResult,
    refreshValidation,

    // Utilities
    generateFilename,
    canGeneratePDF,
    getMissingRequirements,
    getWarnings,
    getGenerationTimeStats,
    isPerformanceAcceptable,
    getPerformanceStatus,

    // Computed values
    hasStats: !!stats,
    hasValidation: !!validation,
    totalGenerated: stats?.totalGenerated ?? 0,
    canGenerate: validation?.canGenerate ?? false,
    missingRequirements: validation?.missingRequirements ?? [],
    warnings: validation?.warnings ?? [],
  }
}
