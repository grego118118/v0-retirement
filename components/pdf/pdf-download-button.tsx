"use client"

import React, { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Download, 
  FileText, 
  Printer, 
  Settings, 
  AlertTriangle, 
  CheckCircle2,
  Clock,
  TrendingUp
} from 'lucide-react'
import { useSession } from 'next-auth/react'
import { usePDFGeneration, PDFGenerationOptions } from '@/hooks/use-pdf-generation'
import { PDFReport } from './pdf-report'
import { toast } from 'sonner'

interface PDFDownloadButtonProps {
  variant?: 'default' | 'outline' | 'secondary'
  size?: 'sm' | 'default' | 'lg'
  className?: string
  options?: PDFGenerationOptions
  showAdvancedOptions?: boolean
  showStats?: boolean
}

export function PDFDownloadButton({
  variant = 'default',
  size = 'default',
  className = '',
  options = {},
  showAdvancedOptions = false,
  showStats = false,
}: PDFDownloadButtonProps) {
  const { data: session } = useSession()
  const [showOptions, setShowOptions] = useState(false)
  const [currentOptions, setCurrentOptions] = useState<PDFGenerationOptions>(options)
  const [showPreview, setShowPreview] = useState(false)
  const pdfReportRef = useRef<HTMLDivElement>(null)

  const {
    isGenerating,
    isLoadingStats,
    lastResult,
    stats,
    validation,
    generatePDF,
    loadStats,
    generateFilename,
    canGenerate,
    missingRequirements,
    warnings,
    getGenerationTimeStats,
    getPerformanceStatus,
  } = usePDFGeneration()

  // Load stats on mount
  React.useEffect(() => {
    if (session?.user?.id) {
      loadStats()
    }
  }, [session?.user?.id, loadStats])

  const handleGeneratePDF = async () => {
    if (!canGenerate) {
      toast.error('Cannot generate PDF', {
        description: missingRequirements.join(', '),
      })
      return
    }

    try {
      const result = await generatePDF(currentOptions)
      
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

  const getStatusIcon = () => {
    if (!canGenerate) return <AlertTriangle className="h-4 w-4 text-red-500" />
    if (warnings.length > 0) return <AlertTriangle className="h-4 w-4 text-yellow-500" />
    return <CheckCircle2 className="h-4 w-4 text-green-500" />
  }

  const getPerformanceBadge = () => {
    const status = getPerformanceStatus()
    const colors = {
      excellent: 'bg-green-100 text-green-800',
      good: 'bg-blue-100 text-blue-800',
      acceptable: 'bg-yellow-100 text-yellow-800',
      poor: 'bg-red-100 text-red-800',
      unknown: 'bg-gray-100 text-gray-800',
    }

    return (
      <Badge className={colors[status]}>
        <TrendingUp className="h-3 w-3 mr-1" />
        {status}
      </Badge>
    )
  }

  return (
    <div className="space-y-4">
      {/* Main Download Button */}
      <div className="flex items-center gap-2">
        <Button
          onClick={handleGeneratePDF}
          disabled={isGenerating || !canGenerate}
          variant={variant}
          size={size}
          className={`gap-2 ${className}`}
        >
          {isGenerating ? (
            <>
              <Clock className="h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              Download PDF
            </>
          )}
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

        {showAdvancedOptions && (
          <Button
            onClick={() => setShowOptions(!showOptions)}
            variant="outline"
            size={size}
            className="gap-2"
          >
            <Settings className="h-4 w-4" />
            Options
          </Button>
        )}
      </div>

      {/* Status Information */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {getStatusIcon()}
        <span>
          {canGenerate 
            ? `Ready to generate ${currentOptions.reportType || 'comprehensive'} report`
            : 'Cannot generate PDF'
          }
        </span>
        {stats && showStats && getPerformanceBadge()}
      </div>

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
            <div className="text-sm">
              <div className="font-medium text-yellow-800">Warnings:</div>
              <ul className="text-yellow-700 mt-1 space-y-1">
                {warnings.map((warning, index) => (
                  <li key={index}>• {warning}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Missing Requirements */}
      {missingRequirements.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
            <div className="text-sm">
              <div className="font-medium text-red-800">Required:</div>
              <ul className="text-red-700 mt-1 space-y-1">
                {missingRequirements.map((requirement, index) => (
                  <li key={index}>• {requirement}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Advanced Options */}
      {showOptions && showAdvancedOptions && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">PDF Generation Options</CardTitle>
            <CardDescription>
              Customize your PDF report content and format
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Report Type */}
            <div>
              <label className="text-sm font-medium">Report Type</label>
              <select
                value={currentOptions.reportType || 'comprehensive'}
                onChange={(e) => setCurrentOptions(prev => ({
                  ...prev,
                  reportType: e.target.value as any
                }))}
                className="w-full mt-1 p-2 border rounded-md text-sm"
              >
                <option value="comprehensive">Comprehensive Report</option>
                <option value="summary">Summary Report</option>
                <option value="calculations-only">Calculations Only</option>
              </select>
            </div>

            {/* Include Options */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Include in Report</label>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="includeCharts"
                  checked={currentOptions.includeCharts ?? true}
                  onChange={(e) => setCurrentOptions(prev => ({
                    ...prev,
                    includeCharts: e.target.checked
                  }))}
                />
                <label htmlFor="includeCharts" className="text-sm">Charts and Visualizations</label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="includeSocialSecurity"
                  checked={currentOptions.includeSocialSecurity ?? true}
                  onChange={(e) => setCurrentOptions(prev => ({
                    ...prev,
                    includeSocialSecurity: e.target.checked
                  }))}
                />
                <label htmlFor="includeSocialSecurity" className="text-sm">Social Security Analysis</label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="includeActionItems"
                  checked={currentOptions.includeActionItems ?? true}
                  onChange={(e) => setCurrentOptions(prev => ({
                    ...prev,
                    includeActionItems: e.target.checked
                  }))}
                />
                <label htmlFor="includeActionItems" className="text-sm">Action Items & Recommendations</label>
              </div>
            </div>

            {/* Max Calculations */}
            <div>
              <label className="text-sm font-medium">Maximum Calculations</label>
              <input
                type="number"
                min="1"
                max="50"
                value={currentOptions.maxCalculations || 10}
                onChange={(e) => setCurrentOptions(prev => ({
                  ...prev,
                  maxCalculations: parseInt(e.target.value)
                }))}
                className="w-full mt-1 p-2 border rounded-md text-sm"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistics */}
      {stats && showStats && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">PDF Generation Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="font-medium">Total Generated</div>
                <div className="text-muted-foreground">{stats.totalGenerated}</div>
              </div>
              <div>
                <div className="font-medium">Average Time</div>
                <div className="text-muted-foreground">{stats.averageGenerationTime}ms</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* PDF Preview (Hidden, used for printing) */}
      {showPreview && lastResult?.success && lastResult.data && (
        <div className="hidden print:block">
          <PDFReport
            data={lastResult.data}
            reportType={currentOptions.reportType}
            showDownloadButton={false}
            ref={pdfReportRef}
          />
        </div>
      )}
    </div>
  )
}
