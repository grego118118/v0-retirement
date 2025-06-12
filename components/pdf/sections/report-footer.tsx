"use client"

import React from 'react'
import { formatDate } from '@/lib/utils'

interface ReportFooterProps {
  generatedDate: Date
  reportType: 'comprehensive' | 'summary' | 'calculations-only'
  pageCount?: number
}

export function ReportFooter({ generatedDate, reportType, pageCount = 1 }: ReportFooterProps) {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="report-footer mt-8 pt-6 border-t-2 border-gray-300">
      {/* Disclaimer Section */}
      <div className="mb-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-800 mb-2">Important Disclaimer</h3>
        <div className="text-xs text-gray-700 space-y-2 leading-relaxed">
          <p>
            <strong>This report is for informational purposes only and does not constitute official benefit estimates.</strong> 
            The calculations and projections contained in this report are based on current Massachusetts Retirement System 
            rules and the information you have provided. Actual benefits may vary based on:
          </p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>Changes in Massachusetts Retirement System laws and regulations</li>
            <li>Final average salary calculations at the time of retirement</li>
            <li>Actual years of creditable service</li>
            <li>Cost-of-living adjustments (COLA) approved by the legislature</li>
            <li>Social Security Administration benefit calculations and changes</li>
            <li>Federal and state tax law modifications</li>
          </ul>
          <p>
            For official benefit estimates and retirement planning guidance, please contact the Massachusetts 
            Retirement System directly or consult with a qualified financial advisor.
          </p>
        </div>
      </div>

      {/* Data Sources and Methodology */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-blue-800 mb-2">Data Sources</h4>
          <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
            <li>Massachusetts Retirement System benefit formulas</li>
            <li>Current retirement group classifications and multipliers</li>
            <li>Social Security Administration benefit estimates</li>
            <li>User-provided employment and salary information</li>
            <li>Current COLA rates and adjustment factors</li>
          </ul>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-green-800 mb-2">Calculation Methodology</h4>
          <ul className="text-xs text-green-700 space-y-1 list-disc list-inside">
            <li>Benefits calculated using current MRS formulas</li>
            <li>Service credit based on membership date and projections</li>
            <li>Average salary using highest 3 consecutive years</li>
            <li>Early retirement reductions applied when applicable</li>
            <li>Maximum 80% benefit cap enforced</li>
          </ul>
        </div>
      </div>

      {/* Contact Information */}
      <div className="mb-6 bg-white border border-gray-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-gray-800 mb-3">Contact Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-700">
          <div>
            <h5 className="font-medium text-gray-800 mb-1">Massachusetts Retirement System</h5>
            <div className="space-y-1">
              <div>500 Boylston Street, Suite 500</div>
              <div>Boston, MA 02116</div>
              <div>Phone: (617) 367-7770</div>
              <div>Toll Free: 1-800-392-6014</div>
            </div>
          </div>
          <div>
            <h5 className="font-medium text-gray-800 mb-1">Online Resources</h5>
            <div className="space-y-1">
              <div>Website: www.mass.gov/retirement</div>
              <div>Email: retirement@mass.gov</div>
              <div>Member Portal: Available 24/7</div>
              <div>Benefit Calculator: Online tools available</div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Resources */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-800 mb-2">Additional Resources</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-gray-700">
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
            <h5 className="font-medium text-purple-800 mb-1">Retirement Planning</h5>
            <ul className="space-y-1 list-disc list-inside">
              <li>Pre-retirement seminars</li>
              <li>One-on-one counseling</li>
              <li>Benefit estimate requests</li>
              <li>Retirement application assistance</li>
            </ul>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
            <h5 className="font-medium text-orange-800 mb-1">Financial Planning</h5>
            <ul className="space-y-1 list-disc list-inside">
              <li>Social Security optimization</li>
              <li>Tax planning strategies</li>
              <li>Healthcare cost planning</li>
              <li>Estate planning considerations</li>
            </ul>
          </div>
          <div className="bg-teal-50 border border-teal-200 rounded-lg p-3">
            <h5 className="font-medium text-teal-800 mb-1">Legal & Regulatory</h5>
            <ul className="space-y-1 list-disc list-inside">
              <li>MGL Chapter 32 (Retirement Law)</li>
              <li>PERAC regulations</li>
              <li>Federal tax implications</li>
              <li>Disability benefit information</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Report Metadata */}
      <div className="border-t border-gray-300 pt-4">
        <div className="flex flex-col md:flex-row justify-between items-center text-xs text-gray-600">
          <div className="mb-2 md:mb-0">
            <div className="flex items-center gap-4">
              <span>Report Generated: {formatDate(generatedDate)}</span>
              <span>•</span>
              <span>Type: {reportType.charAt(0).toUpperCase() + reportType.slice(1).replace('-', ' ')}</span>
              {pageCount > 1 && (
                <>
                  <span>•</span>
                  <span>Pages: {pageCount}</span>
                </>
              )}
            </div>
          </div>
          <div className="text-center md:text-right">
            <div>Massachusetts Retirement System Planning Tool</div>
            <div>© {currentYear} Commonwealth of Massachusetts</div>
          </div>
        </div>
      </div>

      {/* Version and Technical Information */}
      <div className="mt-4 pt-3 border-t border-gray-200 text-center">
        <div className="text-xs text-gray-500 space-y-1">
          <div>
            This report was generated using the Massachusetts Retirement System Planning Tool v2.0
          </div>
          <div>
            For technical support or questions about this report, please contact the MRS IT Help Desk
          </div>
          <div className="mt-2 text-xs text-gray-400">
            Report ID: RPT-{generatedDate.getTime().toString().slice(-8)} | 
            Generated at: {generatedDate.toLocaleTimeString()}
          </div>
        </div>
      </div>
    </footer>
  )
}
