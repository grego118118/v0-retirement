"use client"

import React, { useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Download, FileText, Printer } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { formatDate } from '@/lib/utils'
import { recordUserAction, monitorAsyncOperation } from '@/components/error-boundary/error-monitoring'

// Import report sections
import { ReportHeader } from './sections/report-header'
import { ProfileSummary } from './sections/profile-summary'
import { PensionCalculations } from './sections/pension-calculations'
import { SocialSecuritySection } from './sections/social-security-section'
import { ActionItemsSection } from './sections/action-items-section'
import { ReportFooter } from './sections/report-footer'

// Types for PDF report data
export interface PDFReportData {
  user: {
    id: string
    name?: string
    email: string
  }
  profile?: {
    id: string
    dateOfBirth: Date
    membershipDate: Date
    retirementGroup: string
    currentSalary: number
    averageHighest3Years?: number
    yearsOfService?: number
    plannedRetirementAge?: number
    retirementOption?: string
  }
  calculations: Array<{
    id: string
    retirementAge: number
    yearsOfService: number
    averageSalary: number
    monthlyBenefit: number
    annualBenefit: number
    benefitReduction?: number
    socialSecurityData?: any
    createdAt: Date
    isFavorite?: boolean
  }>
  actionItems: Array<{
    id: string
    title: string
    description: string
    category: string
    priority: string
    status: string
    createdAt: Date
  }>
  chartData?: {
    benefitProjection?: any[]
    incomeComparison?: any[]
    incomeBreakdown?: any[]
  }
}

interface PDFReportProps {
  data: PDFReportData
  reportType?: 'comprehensive' | 'summary' | 'calculations-only'
  showDownloadButton?: boolean
  className?: string
}

export function PDFReport({
  data,
  reportType = 'comprehensive',
  showDownloadButton = true,
  className = '',
}: PDFReportProps) {
  const { data: session } = useSession()
  const reportRef = useRef<HTMLDivElement>(null)

  // Generate filename based on user data and current date
  const generateFilename = useCallback(() => {
    const userName = data.user.name?.replace(/\s+/g, '-') || 'User'
    const date = new Date().toISOString().split('T')[0]
    const reportTypeLabel = reportType === 'comprehensive' ? 'Complete' : 
                           reportType === 'summary' ? 'Summary' : 'Calculations'
    
    return `MA-Retirement-${reportTypeLabel}-${userName}-${date}.pdf`
  }, [data.user.name, reportType])

  // Handle PDF download using browser print functionality
  const handleDownload = useCallback(async () => {
    return monitorAsyncOperation(async () => {
      if (!reportRef.current) return

      recordUserAction('download_pdf_report', 'pdf-report', {
        reportType,
        userId: data.user.id,
        filename: generateFilename(),
      })

      // Add print-specific class to body
      document.body.classList.add('printing')
      
      // Set document title for PDF filename
      const originalTitle = document.title
      document.title = generateFilename().replace('.pdf', '')

      try {
        // Trigger browser print dialog
        window.print()
      } finally {
        // Cleanup
        document.body.classList.remove('printing')
        document.title = originalTitle
      }
    }, 'pdf_download')
  }, [data.user.id, reportType, generateFilename])

  // Handle print functionality
  const handlePrint = useCallback(() => {
    recordUserAction('print_pdf_report', 'pdf-report', {
      reportType,
      userId: data.user.id,
    })

    window.print()
  }, [data.user.id, reportType])

  return (
    <div className={`pdf-report-container ${className}`}>
      {/* Control buttons - hidden in print */}
      {showDownloadButton && (
        <div className="print:hidden mb-6 flex gap-3">
          <Button onClick={handleDownload} className="gap-2">
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
          <Button variant="outline" onClick={handlePrint} className="gap-2">
            <Printer className="h-4 w-4" />
            Print
          </Button>
        </div>
      )}

      {/* PDF Report Content */}
      <div 
        ref={reportRef}
        className="pdf-report-content bg-white text-black min-h-screen"
        data-testid="pdf-report-content"
      >
        {/* Report Header */}
        <ReportHeader 
          reportType={reportType}
          generatedDate={new Date()}
          userName={data.user.name}
        />

        {/* Profile Summary Section */}
        {data.profile && (
          <ProfileSummary 
            profile={data.profile}
            user={data.user}
          />
        )}

        {/* Pension Calculations Section */}
        {data.calculations.length > 0 && (
          <PensionCalculations 
            calculations={data.calculations}
            chartData={data.chartData?.benefitProjection}
          />
        )}

        {/* Social Security Section */}
        {data.calculations.some(calc => calc.socialSecurityData) && (
          <SocialSecuritySection 
            calculations={data.calculations.filter(calc => calc.socialSecurityData)}
            chartData={data.chartData?.incomeComparison}
          />
        )}

        {/* Action Items Section */}
        {reportType === 'comprehensive' && data.actionItems.length > 0 && (
          <ActionItemsSection 
            actionItems={data.actionItems}
          />
        )}

        {/* Report Footer */}
        <ReportFooter 
          generatedDate={new Date()}
          reportType={reportType}
          pageCount={1} // Will be calculated dynamically
        />
      </div>

      {/* Print-specific styles */}
      <style jsx global>{`
        @media print {
          /* Reset all margins and padding for print */
          * {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          /* Page setup */
          @page {
            size: A4;
            margin: 0.75in;
            @top-center {
              content: "Massachusetts Retirement System - Retirement Planning Report";
              font-size: 10pt;
              color: #666;
            }
            @bottom-center {
              content: "Page " counter(page) " of " counter(pages);
              font-size: 10pt;
              color: #666;
            }
          }

          /* Hide non-printable elements */
          .print\\:hidden,
          .no-print,
          nav,
          .sidebar,
          .print-hide {
            display: none !important;
          }

          /* Body styles for print */
          body {
            background: white !important;
            color: black !important;
            font-size: 11pt !important;
            line-height: 1.4 !important;
          }

          /* PDF report container */
          .pdf-report-content {
            background: white !important;
            color: black !important;
            box-shadow: none !important;
            border: none !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            max-width: none !important;
          }

          /* Typography for print */
          h1 { 
            font-size: 18pt !important; 
            margin: 0 0 12pt 0 !important;
            page-break-after: avoid !important;
          }
          h2 { 
            font-size: 14pt !important; 
            margin: 16pt 0 8pt 0 !important;
            page-break-after: avoid !important;
          }
          h3 { 
            font-size: 12pt !important; 
            margin: 12pt 0 6pt 0 !important;
            page-break-after: avoid !important;
          }
          h4 { 
            font-size: 11pt !important; 
            margin: 8pt 0 4pt 0 !important;
            page-break-after: avoid !important;
          }

          /* Paragraph spacing */
          p {
            margin: 0 0 8pt 0 !important;
            orphans: 2;
            widows: 2;
          }

          /* Table styles for print */
          table {
            border-collapse: collapse !important;
            width: 100% !important;
            margin: 8pt 0 !important;
            page-break-inside: avoid !important;
          }

          th, td {
            border: 1px solid #ddd !important;
            padding: 6pt !important;
            text-align: left !important;
            font-size: 10pt !important;
          }

          th {
            background-color: #f5f5f5 !important;
            font-weight: bold !important;
          }

          /* Card styles for print */
          .card {
            border: 1px solid #ddd !important;
            margin: 8pt 0 !important;
            page-break-inside: avoid !important;
            background: white !important;
            box-shadow: none !important;
          }

          .card-header {
            background-color: #f8f9fa !important;
            border-bottom: 1px solid #ddd !important;
            padding: 8pt !important;
          }

          .card-content {
            padding: 8pt !important;
          }

          /* Chart containers for print */
          .chart-container {
            page-break-inside: avoid !important;
            margin: 8pt 0 !important;
          }

          /* Page breaks */
          .page-break-before {
            page-break-before: always !important;
          }

          .page-break-after {
            page-break-after: always !important;
          }

          .page-break-avoid {
            page-break-inside: avoid !important;
          }

          /* Section spacing */
          .report-section {
            margin: 16pt 0 !important;
            page-break-inside: avoid !important;
          }

          /* List styles */
          ul, ol {
            margin: 8pt 0 !important;
            padding-left: 20pt !important;
          }

          li {
            margin: 4pt 0 !important;
          }

          /* Badge and status indicators */
          .badge {
            border: 1px solid #ddd !important;
            padding: 2pt 4pt !important;
            font-size: 9pt !important;
            background: white !important;
            color: black !important;
          }

          /* Ensure proper spacing between sections */
          .report-section + .report-section {
            margin-top: 24pt !important;
          }

          /* Footer positioning */
          .report-footer {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            height: 40pt;
            background: white !important;
            border-top: 1px solid #ddd !important;
            padding: 8pt !important;
            font-size: 9pt !important;
            text-align: center !important;
          }
        }

        /* Screen-only styles */
        @media screen {
          .pdf-report-content {
            max-width: 8.5in;
            margin: 0 auto;
            padding: 1in;
            background: white;
            box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
            min-height: 11in;
          }
        }
      `}</style>
    </div>
  )
}
