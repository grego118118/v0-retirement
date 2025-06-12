/**
 * PDF Generation Button Component
 * Massachusetts Retirement System - Browser-native PDF generation
 */

"use client"

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Download,
  FileText,
  Printer,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Clock
} from 'lucide-react'
import { usePDFGeneration, PDFGenerationOptions } from '@/hooks/use-pdf-generation'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import React from 'react'

export interface PDFGenerationButtonProps {
  variant?: 'default' | 'outline' | 'secondary' | 'ghost'
  size?: 'default' | 'sm' | 'lg'
  className?: string
  children?: React.ReactNode
  showStatus?: boolean
  disabled?: boolean
  options?: PDFGenerationOptions
}

export function PDFGenerationButton({
  variant = 'outline',
  size = 'default',
  className,
  children,
  showStatus = true,
  disabled = false,
  options = {}
}: PDFGenerationButtonProps) {
  const { data: session } = useSession()
  const [showPreview, setShowPreview] = useState(false)
  const pdfReportRef = useRef<HTMLDivElement>(null)

  const {
    isGenerating,
    lastResult,
    generatePDF,
    canGenerate,
    missingRequirements,
    warnings,
  } = usePDFGeneration()

  // Load stats on mount
  React.useEffect(() => {
    if (session?.user?.id) {
      // Auto-load validation status
    }
  }, [session?.user?.id])

  const handleGeneratePDF = async () => {
    if (!canGenerate) {
      toast.error('Cannot generate PDF', {
        description: missingRequirements.join(', '),
      })
      return
    }

    try {
      const result = await generatePDF(options)

      if (result.success && result.data) {
        // Show preview first
        setShowPreview(true)

        // Small delay to ensure the preview is rendered
        setTimeout(() => {
          // Trigger browser print
          window.print()
        }, 500)

        toast.success('PDF report generated successfully!', {
          description: `Generated in ${result.generationTime}ms`,
        })
      } else {
        toast.error('Failed to generate PDF', {
          description: result.error,
        })
      }
    } catch (error) {
      toast.error('PDF generation failed', {
        description: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  const handlePrint = () => {
    if (showPreview) {
      window.print()
    } else {
      toast.error('Please generate the PDF first')
    }
  }

  const getButtonContent = () => {
    if (isGenerating) {
      return (
        <>
          <Clock className="h-4 w-4 mr-2 animate-spin" />
          Generating...
        </>
      )
    }

    if (children) {
      return children
    }

    return (
      <>
        <Download className="h-4 w-4 mr-2" />
        Download PDF
      </>
    )
  }

  const isDisabled = disabled || isGenerating || !canGenerate

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Button
          variant={variant}
          size={size}
          className={className}
          onClick={handleGeneratePDF}
          disabled={isDisabled}
        >
          {getButtonContent()}
        </Button>

        {showPreview && (
          <Button
            onClick={handlePrint}
            variant="outline"
            size={size}
            className="gap-2"
          >
            <Printer className="h-4 w-4" />
            Print
          </Button>
        )}
      </div>

      {showStatus && (
        <div className="space-y-2">
          {/* Authentication required notice */}
          {!session?.user && (
            <Alert className="bg-blue-50 border-blue-200 text-blue-800">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <span className="font-medium">Sign In Required:</span> PDF report generation requires authentication.
              </AlertDescription>
            </Alert>
          )}

          {/* Missing requirements */}
          {missingRequirements.length > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <span className="font-medium">Required:</span> {missingRequirements.join(', ')}
              </AlertDescription>
            </Alert>
          )}

          {/* Warnings */}
          {warnings.length > 0 && (
            <Alert className="bg-yellow-50 border-yellow-200 text-yellow-800">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <span className="font-medium">Warnings:</span> {warnings.join(', ')}
              </AlertDescription>
            </Alert>
          )}

          {/* Success status */}
          {canGenerate && (
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span>Ready to generate {options.reportType || 'comprehensive'} report</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/**
 * Specialized PDF button for comprehensive reports
 */
export function ComprehensivePDFButton(props: Omit<PDFGenerationButtonProps, 'options'>) {
  return (
    <PDFGenerationButton
      options={{ reportType: 'comprehensive' }}
      {...props}
    >
      <Download className="h-4 w-4 mr-2" />
      Download Comprehensive Report
    </PDFGenerationButton>
  )
}

/**
 * Specialized PDF button for summary reports
 */
export function SummaryPDFButton(props: Omit<PDFGenerationButtonProps, 'options'>) {
  return (
    <PDFGenerationButton
      options={{ reportType: 'summary' }}
      {...props}
    >
      <Download className="h-4 w-4 mr-2" />
      Download Summary Report
    </PDFGenerationButton>
  )
}

/**
 * Specialized PDF button for calculations only
 */
export function CalculationsPDFButton(props: Omit<PDFGenerationButtonProps, 'options'>) {
  return (
    <PDFGenerationButton
      options={{ reportType: 'calculations-only' }}
      {...props}
    >
      <Download className="h-4 w-4 mr-2" />
      Download Calculations Report
    </PDFGenerationButton>
  )
}

/**
 * Specialized PDF button for pension calculations (legacy compatibility)
 */
export function PensionPDFButton(props: Omit<PDFGenerationButtonProps, 'options'>) {
  return (
    <PDFGenerationButton
      options={{ reportType: 'comprehensive' }}
      {...props}
    >
      <Download className="h-4 w-4 mr-2" />
      Download Pension Report
    </PDFGenerationButton>
  )
}
