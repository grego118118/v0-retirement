/**
 * PDF Generation Button Component
 * Provides a reusable button for generating PDF reports with premium gating
 */

"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Download, 
  FileText, 
  Crown, 
  Loader2, 
  AlertTriangle,
  CheckCircle 
} from 'lucide-react'
import { usePDFGeneration } from '@/hooks/use-pdf-generation'
import { useSubscriptionStatus } from '@/hooks/use-subscription'
import Link from 'next/link'

export interface PDFGenerationButtonProps {
  type: 'pension' | 'tax' | 'wizard' | 'combined'
  data: any
  variant?: 'default' | 'outline' | 'secondary' | 'ghost'
  size?: 'default' | 'sm' | 'lg'
  className?: string
  children?: React.ReactNode
  showStatus?: boolean
  disabled?: boolean
}

export function PDFGenerationButton({
  type,
  data,
  variant = 'outline',
  size = 'default',
  className,
  children,
  showStatus = true,
  disabled = false
}: PDFGenerationButtonProps) {
  const { upgradeRequired } = useSubscriptionStatus()
  const {
    isGenerating,
    error,
    status,
    generatePDF,
    checkStatus,
    canGeneratePDF,
    needsUpgrade,
    getRemainingCount
  } = usePDFGeneration()

  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    checkStatus()
  }, [checkStatus])

  if (!mounted) {
    return (
      <Button variant={variant} size={size} className={className} disabled>
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        Loading...
      </Button>
    )
  }

  const handleGeneratePDF = async () => {
    if (!data) {
      console.error('No data provided for PDF generation')
      return
    }

    await generatePDF({
      type,
      data
    })
  }

  const isPremiumRequired = upgradeRequired('pdf_reports') || needsUpgrade()
  const isDisabled = disabled || isGenerating || !data || (isPremiumRequired && !canGeneratePDF())

  const getButtonContent = () => {
    if (isGenerating) {
      return (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Generating PDF...
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

  const getTypeLabel = () => {
    switch (type) {
      case 'pension':
        return 'Pension Calculation'
      case 'tax':
        return 'Tax Implications'
      case 'wizard':
        return 'Retirement Plan'
      case 'combined':
        return 'Comprehensive Report'
      default:
        return 'Report'
    }
  }

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

        {isPremiumRequired && (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Crown className="h-3 w-3" />
            Premium
          </Badge>
        )}
      </div>

      {showStatus && (
        <div className="space-y-2">
          {/* Premium upgrade notice */}
          {isPremiumRequired && (
            <Alert className="bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-900/20 dark:border-amber-900/30 dark:text-amber-600">
              <Crown className="h-4 w-4" />
              <AlertDescription>
                <span className="font-medium">Premium Feature:</span> PDF report generation is available with a Premium subscription.{" "}
                <Link href="/subscribe" className="underline font-medium hover:text-amber-900">
                  Upgrade now
                </Link>
              </AlertDescription>
            </Alert>
          )}

          {/* Error message */}
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <span className="font-medium">Error:</span> {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Success message with usage info */}
          {!isPremiumRequired && status && (
            <div className="text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span>
                  {getTypeLabel()} PDF Report
                  {status.limits.monthly === -1 
                    ? ' (Unlimited)' 
                    : ` (${getRemainingCount()} remaining this month)`
                  }
                </span>
              </div>
            </div>
          )}

          {/* Data validation warning */}
          {!data && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Complete the calculation to generate a PDF report.
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}
    </div>
  )
}

/**
 * Specialized PDF button for pension calculations
 */
export function PensionPDFButton({ 
  pensionData, 
  ...props 
}: Omit<PDFGenerationButtonProps, 'type' | 'data'> & { pensionData: any }) {
  return (
    <PDFGenerationButton
      type="pension"
      data={pensionData}
      {...props}
    >
      <Download className="h-4 w-4 mr-2" />
      Download Pension Report
    </PDFGenerationButton>
  )
}

/**
 * Specialized PDF button for tax calculations
 */
export function TaxPDFButton({ 
  taxData, 
  ...props 
}: Omit<PDFGenerationButtonProps, 'type' | 'data'> & { taxData: any }) {
  return (
    <PDFGenerationButton
      type="tax"
      data={taxData}
      {...props}
    >
      <Download className="h-4 w-4 mr-2" />
      Download Tax Report
    </PDFGenerationButton>
  )
}

/**
 * Specialized PDF button for wizard results
 */
export function WizardPDFButton({ 
  wizardData, 
  ...props 
}: Omit<PDFGenerationButtonProps, 'type' | 'data'> & { wizardData: any }) {
  return (
    <PDFGenerationButton
      type="wizard"
      data={wizardData}
      {...props}
    >
      <Download className="h-4 w-4 mr-2" />
      Download Retirement Plan
    </PDFGenerationButton>
  )
}

/**
 * Specialized PDF button for combined reports
 */
export function CombinedPDFButton({ 
  combinedData, 
  ...props 
}: Omit<PDFGenerationButtonProps, 'type' | 'data'> & { combinedData: any }) {
  return (
    <PDFGenerationButton
      type="combined"
      data={combinedData}
      {...props}
    >
      <Download className="h-4 w-4 mr-2" />
      Download Comprehensive Report
    </PDFGenerationButton>
  )
}
