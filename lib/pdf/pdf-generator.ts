/**
 * PDF Generation Utilities for Massachusetts Retirement System Calculator
 * Handles professional PDF report generation with React-PDF
 */

import { pdf } from '@react-pdf/renderer'
import { PensionCalculationReport } from './components/pension-calculation-report'
import { CombinedRetirementReport } from './components/combined-retirement-report'

export interface PensionCalculationData {
  // Personal Information
  name?: string
  employeeId?: string
  currentAge: number
  plannedRetirementAge: number
  retirementGroup: string
  serviceEntry: string
  
  // Calculation Details
  averageSalary: number
  yearsOfService: number
  projectedYearsAtRetirement: number
  
  // Pension Results
  basePension: number
  benefitFactor: number
  totalBenefitPercentage: number
  cappedAt80Percent: boolean
  
  // Retirement Options
  options: {
    A: { annual: number; monthly: number; description: string }
    B: { annual: number; monthly: number; description: string; reduction: number }
    C: { 
      annual: number
      monthly: number
      description: string
      reduction: number
      survivorAnnual: number
      survivorMonthly: number
      beneficiaryAge?: number
    }
  }
  
  // COLA Information
  colaProjections?: {
    year: number
    startingPension: number
    colaIncrease: number
    endingPension: number
    monthlyPension: number
  }[]
  
  // Additional Information
  isVeteran?: boolean
  veteranBenefit?: number
  eligibilityMessage?: string
  calculationDate: Date
}

export interface SocialSecurityData {
  estimatedBenefit: number
  fullRetirementAge: number
  earlyRetirementReduction?: number
  delayedRetirementCredit?: number
  spousalBenefit?: number
  survivorBenefit?: number
  colaAdjustments?: number[]
}

export interface CombinedCalculationData {
  pensionData: PensionCalculationData
  socialSecurityData?: SocialSecurityData
  additionalIncome?: {
    traditional401k?: number
    rothIRA?: number
    otherRetirementAccounts?: number
    partTimeIncome?: number
    rentalIncome?: number
  }
  projectionYears?: number
  targetMonthlyIncome?: number
  riskTolerance?: 'conservative' | 'moderate' | 'aggressive'
}

export interface PDFGenerationOptions {
  includeCharts?: boolean
  includeCOLAProjections?: boolean
  includeScenarioComparison?: boolean
  watermark?: string
  reportType: 'basic' | 'comprehensive' | 'combined'
}

/**
 * Generate a basic pension calculation PDF report
 */
export async function generatePensionCalculationPDF(
  data: PensionCalculationData,
  options: PDFGenerationOptions = { reportType: 'basic' }
): Promise<Blob> {
  try {
    const doc = PensionCalculationReport({ data, options }) as any
    const blob = await pdf(doc).toBlob()
    return blob
  } catch (error) {
    console.error('Error generating pension calculation PDF:', error)
    throw new Error('Failed to generate PDF report')
  }
}

/**
 * Generate a comprehensive combined retirement planning PDF report
 */
export async function generateCombinedRetirementPDF(
  data: CombinedCalculationData,
  options: PDFGenerationOptions = { reportType: 'combined' }
): Promise<Blob> {
  try {
    const doc = CombinedRetirementReport({ data, options }) as any
    const blob = await pdf(doc).toBlob()
    return blob
  } catch (error) {
    console.error('Error generating combined retirement PDF:', error)
    throw new Error('Failed to generate PDF report')
  }
}

/**
 * Download a PDF blob with a given filename
 */
export function downloadPDF(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Generate a filename for the PDF report
 */
export function generatePDFFilename(
  reportType: 'pension' | 'combined',
  userName?: string,
  date: Date = new Date()
): string {
  const dateStr = date.toISOString().split('T')[0] // YYYY-MM-DD format
  const userPart = userName ? `_${userName.replace(/[^a-zA-Z0-9]/g, '_')}` : ''
  
  switch (reportType) {
    case 'pension':
      return `MA_Pension_Report${userPart}_${dateStr}.pdf`
    case 'combined':
      return `MA_Retirement_Analysis${userPart}_${dateStr}.pdf`
    default:
      return `MA_Retirement_Report${userPart}_${dateStr}.pdf`
  }
}

/**
 * Utility function to format currency for PDF display
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Utility function to format percentage for PDF display
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${(value * 100).toFixed(decimals)}%`
}

/**
 * Get retirement group display name
 */
export function getRetirementGroupDisplayName(group: string): string {
  switch (group) {
    case 'GROUP_1':
      return 'Group 1 (General Employees)'
    case 'GROUP_2':
      return 'Group 2 (Probation/Court Officers)'
    case 'GROUP_3':
      return 'Group 3 (State Police)'
    case 'GROUP_4':
      return 'Group 4 (Public Safety/Corrections)'
    default:
      return group
  }
}

/**
 * Get service entry display name
 */
export function getServiceEntryDisplayName(serviceEntry: string): string {
  switch (serviceEntry) {
    case 'before_2012':
      return 'Before April 2, 2012'
    case 'after_2012':
      return 'On or After April 2, 2012'
    default:
      return serviceEntry
  }
}
