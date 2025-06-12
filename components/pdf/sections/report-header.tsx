"use client"

import React from 'react'
import { formatDate } from '@/lib/utils'

interface ReportHeaderProps {
  reportType: 'comprehensive' | 'summary' | 'calculations-only'
  generatedDate: Date
  userName?: string
}

export function ReportHeader({ reportType, generatedDate, userName }: ReportHeaderProps) {
  const getReportTitle = () => {
    switch (reportType) {
      case 'comprehensive':
        return 'Comprehensive Retirement Planning Report'
      case 'summary':
        return 'Retirement Planning Summary'
      case 'calculations-only':
        return 'Pension Calculations Report'
      default:
        return 'Retirement Planning Report'
    }
  }

  const getReportDescription = () => {
    switch (reportType) {
      case 'comprehensive':
        return 'Complete analysis of your Massachusetts retirement benefits, including pension calculations, Social Security projections, and personalized recommendations.'
      case 'summary':
        return 'Executive summary of your retirement planning status and key benefit projections.'
      case 'calculations-only':
        return 'Detailed pension benefit calculations and projections based on your current service and salary information.'
      default:
        return 'Analysis of your Massachusetts retirement benefits and planning recommendations.'
    }
  }

  return (
    <header className="report-header page-break-avoid mb-8">
      {/* Massachusetts Retirement System Branding */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-blue-600">
        <div className="flex items-center gap-4">
          {/* MRS Logo Placeholder */}
          <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
            MRS
          </div>
          <div>
            <h1 className="text-2xl font-bold text-blue-900 mb-1">
              Massachusetts Retirement System
            </h1>
            <p className="text-sm text-gray-600">
              Retirement Planning & Benefits Analysis
            </p>
          </div>
        </div>
        
        {/* Report Metadata */}
        <div className="text-right text-sm text-gray-600">
          <div className="mb-1">
            <strong>Generated:</strong> {formatDate(generatedDate)}
          </div>
          <div className="mb-1">
            <strong>Report ID:</strong> RPT-{generatedDate.getTime().toString().slice(-8)}
          </div>
          {userName && (
            <div>
              <strong>Prepared for:</strong> {userName}
            </div>
          )}
        </div>
      </div>

      {/* Report Title and Description */}
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          {getReportTitle()}
        </h2>
        <p className="text-sm text-gray-700 max-w-4xl mx-auto leading-relaxed">
          {getReportDescription()}
        </p>
      </div>

      {/* Important Notice */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-yellow-800 text-sm font-bold">!</span>
          </div>
          <div className="text-sm">
            <h4 className="font-semibold text-yellow-800 mb-1">Important Notice</h4>
            <p className="text-yellow-700 leading-relaxed">
              This report provides estimates based on current Massachusetts Retirement System rules and your 
              provided information. Actual benefits may vary based on future legislative changes, final 
              average salary calculations, and other factors. For official benefit estimates, please contact 
              the Massachusetts Retirement System directly.
            </p>
          </div>
        </div>
      </div>

      {/* Report Contents Overview */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-3">Report Contents</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
            <span className="text-blue-800">Personal Profile Summary</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
            <span className="text-blue-800">Pension Benefit Calculations</span>
          </div>
          {reportType === 'comprehensive' && (
            <>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <span className="text-blue-800">Social Security Analysis</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <span className="text-blue-800">Personalized Recommendations</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <span className="text-blue-800">Income Projections & Charts</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <span className="text-blue-800">Action Items & Next Steps</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Contact Information */}
      <div className="mt-6 text-center text-xs text-gray-500 border-t pt-4">
        <p className="mb-1">
          <strong>Massachusetts Retirement System</strong> | 
          500 Boylston Street, Suite 500, Boston, MA 02116
        </p>
        <p>
          Phone: (617) 367-7770 | Website: www.mass.gov/retirement | 
          Email: retirement@mass.gov
        </p>
      </div>
    </header>
  )
}
