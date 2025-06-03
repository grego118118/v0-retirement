/**
 * PDF Generation Hook
 * Provides functionality for generating and downloading PDF reports
 */

import { useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'

export interface PDFGenerationStatus {
  canGenerate: boolean
  subscriptionActive: boolean
  limits: {
    monthly: number
    current: number
    remaining: number
  }
  supportedTypes: string[]
}

export interface PDFGenerationOptions {
  type: 'pension' | 'tax' | 'wizard' | 'combined'
  data: any
  filename?: string
  branding?: {
    organizationName?: string
    disclaimer?: string
  }
}

export interface PDFGenerationState {
  isGenerating: boolean
  error: string | null
  status: PDFGenerationStatus | null
  lastGenerated: Date | null
}

export function usePDFGeneration() {
  const { data: session } = useSession()
  const [state, setState] = useState<PDFGenerationState>({
    isGenerating: false,
    error: null,
    status: null,
    lastGenerated: null
  })

  /**
   * Check PDF generation status and limits
   */
  const checkStatus = useCallback(async (): Promise<PDFGenerationStatus | null> => {
    if (!session?.user) {
      return null
    }

    try {
      const response = await fetch('/api/pdf/generate', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to check PDF generation status')
      }

      const status = await response.json()
      setState(prev => ({ ...prev, status, error: null }))
      return status
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      setState(prev => ({ ...prev, error: errorMessage }))
      return null
    }
  }, [session])

  /**
   * Generate and download PDF
   */
  const generatePDF = useCallback(async (options: PDFGenerationOptions): Promise<boolean> => {
    if (!session?.user) {
      toast.error('Please sign in to generate PDF reports')
      return false
    }

    setState(prev => ({ ...prev, isGenerating: true, error: null }))

    try {
      // Check status first
      const status = await checkStatus()
      if (!status?.canGenerate) {
        if (!status?.subscriptionActive) {
          toast.error('Premium subscription required for PDF generation', {
            action: {
              label: 'Upgrade',
              onClick: () => window.open('/subscribe', '_blank')
            }
          })
        } else {
          toast.error('PDF generation limit reached for this month')
        }
        setState(prev => ({ ...prev, isGenerating: false }))
        return false
      }

      // Generate PDF
      const response = await fetch('/api/pdf/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(options)
      })

      if (!response.ok) {
        const errorData = await response.json()
        
        if (response.status === 403) {
          toast.error('Premium subscription required for PDF generation', {
            action: {
              label: 'Upgrade',
              onClick: () => window.open('/subscribe', '_blank')
            }
          })
        } else if (response.status === 408) {
          toast.error('PDF generation timed out. Please try again.')
        } else {
          toast.error(errorData.error || 'Failed to generate PDF')
        }
        
        setState(prev => ({ ...prev, isGenerating: false, error: errorData.error }))
        return false
      }

      // Download PDF
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      
      // Get filename from response headers or use provided filename
      const contentDisposition = response.headers.get('Content-Disposition')
      const filename = contentDisposition
        ? contentDisposition.split('filename=')[1]?.replace(/"/g, '')
        : options.filename || `retirement-report-${Date.now()}.pdf`
      
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      setState(prev => ({ 
        ...prev, 
        isGenerating: false, 
        lastGenerated: new Date(),
        error: null 
      }))

      toast.success('PDF report generated successfully!')
      
      // Refresh status to update usage counts
      await checkStatus()
      
      return true
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      setState(prev => ({ ...prev, isGenerating: false, error: errorMessage }))
      toast.error('Failed to generate PDF. Please try again.')
      return false
    }
  }, [session, checkStatus])

  /**
   * Generate pension calculation PDF
   */
  const generatePensionPDF = useCallback(async (pensionData: any): Promise<boolean> => {
    return generatePDF({
      type: 'pension',
      data: pensionData,
      filename: `MA_Pension_Report_${new Date().toISOString().split('T')[0]}.pdf`
    })
  }, [generatePDF])

  /**
   * Generate tax implications PDF
   */
  const generateTaxPDF = useCallback(async (taxData: any): Promise<boolean> => {
    return generatePDF({
      type: 'tax',
      data: taxData,
      filename: `MA_Tax_Report_${new Date().toISOString().split('T')[0]}.pdf`
    })
  }, [generatePDF])

  /**
   * Generate wizard results PDF
   */
  const generateWizardPDF = useCallback(async (wizardData: any): Promise<boolean> => {
    return generatePDF({
      type: 'wizard',
      data: wizardData,
      filename: `MA_Retirement_Plan_${new Date().toISOString().split('T')[0]}.pdf`
    })
  }, [generatePDF])

  /**
   * Generate combined comprehensive PDF
   */
  const generateCombinedPDF = useCallback(async (combinedData: any): Promise<boolean> => {
    return generatePDF({
      type: 'combined',
      data: combinedData,
      filename: `MA_Comprehensive_Report_${new Date().toISOString().split('T')[0]}.pdf`
    })
  }, [generatePDF])

  /**
   * Check if user can generate PDFs
   */
  const canGeneratePDF = useCallback((): boolean => {
    return Boolean(session?.user && state.status?.canGenerate)
  }, [session, state.status])

  /**
   * Get remaining PDF generation count
   */
  const getRemainingCount = useCallback((): number => {
    if (!state.status) return 0
    return state.status.limits.remaining
  }, [state.status])

  /**
   * Check if user needs to upgrade for PDF generation
   */
  const needsUpgrade = useCallback((): boolean => {
    return Boolean(session?.user && !state.status?.subscriptionActive)
  }, [session, state.status])

  return {
    // State
    isGenerating: state.isGenerating,
    error: state.error,
    status: state.status,
    lastGenerated: state.lastGenerated,

    // Actions
    checkStatus,
    generatePDF,
    generatePensionPDF,
    generateTaxPDF,
    generateWizardPDF,
    generateCombinedPDF,

    // Utilities
    canGeneratePDF,
    getRemainingCount,
    needsUpgrade
  }
}
