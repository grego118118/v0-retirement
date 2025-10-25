"use client"

import React from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { usePDFGeneration } from '@/hooks/use-pdf-generation'
import {
  Download,
  FileText,
  Loader2,
  Crown,
  Lock,
  AlertTriangle
} from 'lucide-react'
import {
  PensionCalculationData,
  PDFGenerationOptions
} from '@/lib/pdf/puppeteer-pdf-generator'

// Combined calculation data interface (for compatibility)
interface CombinedCalculationData {
  pensionData: PensionCalculationData
  socialSecurityData?: any
  additionalIncome?: any
}
import Link from 'next/link'

interface PDFExportButtonProps {
  data: PensionCalculationData | CombinedCalculationData
  reportType: 'pension' | 'combined'
  variant?: 'default' | 'outline' | 'secondary'
  size?: 'sm' | 'default' | 'lg'
  className?: string
  options?: Partial<PDFGenerationOptions>
}

export function PDFExportButton({
  data,
  reportType,
  variant = 'default',
  size = 'default',
  className = '',
  options = {}
}: PDFExportButtonProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const {
    generatePDF,
    isGenerating,
    hasAccess,
    isPremium,
    isLoading
  } = usePDFGeneration()

  const handlePDFGeneration = async () => {
    await generatePDF(data, reportType, options)
  }

  // Handle loading state
  if (isLoading || status === 'loading') {
    return (
      <div className={`space-y-3 ${className}`}>
        <Button
          variant="outline"
          size={size}
          disabled
          className="relative"
        >
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Loading...
        </Button>
      </div>
    )
  }

  // Handle unauthenticated state - redirect to pricing
  if (status === 'unauthenticated') {
    const handlePricingRedirect = () => {
      router.push('/pricing?feature=pdf-reports')
    }

    return (
      <div className={`space-y-3 ${className}`}>
        <Button
          variant="outline"
          size={size}
          onClick={handlePricingRedirect}
          className="relative"
        >
          <Crown className="w-4 h-4 mr-2 text-amber-500" />
          Generate PDF Report
        </Button>

        <Alert className="border-amber-200 bg-amber-50">
          <Crown className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            <div className="flex items-center justify-between">
              <span className="text-sm">
                PDF reports are a Premium feature. Sign up to access professional retirement analysis.
              </span>
              <Button size="sm" onClick={handlePricingRedirect} className="ml-3">
                View Pricing
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  // If user doesn't have access, show upgrade prompt
  if (!hasAccess) {
    return (
      <div className={`space-y-3 ${className}`}>
        <Button
          variant="outline"
          size={size}
          disabled
          className="relative"
        >
          <Lock className="w-4 h-4 mr-2" />
          Generate PDF Report
          <Crown className="w-4 h-4 ml-2 text-amber-500" />
        </Button>

        <Alert className="border-amber-200 bg-amber-50">
          <Crown className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            <div className="flex items-center justify-between">
              <span className="text-sm">
                PDF reports are a Premium feature. Upgrade to download professional retirement reports.
              </span>
              <Button size="sm" asChild className="ml-3">
                <Link href="/pricing">
                  Upgrade Now
                </Link>
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <Button
        variant={variant}
        size={size}
        onClick={handlePDFGeneration}
        disabled={isGenerating}
        className="relative"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Generating PDF...
          </>
        ) : (
          <>
            <Download className="w-4 h-4 mr-2" />
            Generate PDF Report
            {isPremium && <Badge variant="secondary" className="ml-2 text-xs">Premium</Badge>}
          </>
        )}
      </Button>
      
      {!isPremium && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <AlertTriangle className="w-3 h-3" />
          <span>Preview version - upgrade for full features</span>
        </div>
      )}
    </div>
  )
}

interface PDFExportSectionProps {
  pensionData?: PensionCalculationData
  combinedData?: CombinedCalculationData
  className?: string
}

export function PDFExportSection({
  pensionData,
  combinedData,
  className = ''
}: PDFExportSectionProps) {
  const { data: session } = useSession()
  const { isPremium, hasAccess } = usePDFGeneration()

  return (
    <div className={`bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 ${className}`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-blue-900 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Professional PDF Reports
            {isPremium && <Crown className="w-4 h-4 text-amber-500" />}
          </h3>
          <p className="text-sm text-blue-700 mt-1">
            Download comprehensive retirement analysis reports with official calculations and projections.
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {pensionData && (
          <div className="space-y-2">
            <h4 className="font-medium text-blue-900">Basic Pension Report</h4>
            <p className="text-xs text-blue-600 mb-3">
              Detailed pension calculations with all retirement options and MSRB-accurate results.
            </p>
            <PDFExportButton
              data={pensionData}
              reportType="pension"
              variant="outline"
              size="sm"
              options={{ 
                includeCharts: true,
                includeCOLAProjections: true 
              }}
            />
          </div>
        )}

        {combinedData && (
          <div className="space-y-2">
            <h4 className="font-medium text-blue-900">Comprehensive Analysis</h4>
            <p className="text-xs text-blue-600 mb-3">
              Complete retirement plan including pension, Social Security, and additional income sources.
            </p>
            <PDFExportButton
              data={combinedData}
              reportType="combined"
              variant="default"
              size="sm"
              options={{ 
                includeCharts: true,
                includeCOLAProjections: true,
                includeScenarioComparison: true 
              }}
            />
          </div>
        )}
      </div>

      {!hasAccess && (
        <div className="mt-4 pt-4 border-t border-blue-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-blue-600">
              Unlock unlimited PDF reports with Premium
            </span>
            <Button size="sm" asChild>
              <Link href="/pricing">
                View Plans
              </Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
