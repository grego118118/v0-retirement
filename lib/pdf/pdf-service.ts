/**
 * PDF Generation Service
 * Handles creation of PDF reports for pension calculations, tax reports, and wizard results
 */

import { CombinedCalculationData } from '@/lib/wizard/wizard-types'
import { formatCurrency, formatDate } from '@/lib/utils'

// Temporary type definition until tax calculator is implemented
export interface TaxCalculationResult {
  grossIncome: number
  federalTax: number
  stateTax: number
  totalTax: number
  netIncome: number
  effectiveTaxRate: number
  marginalRate: number
  taxableIncome: number
  socialSecurityTaxable: number
  socialSecurityTaxablePercentage: number
  breakdown?: {
    federal?: any
    state?: any
    socialSecurity?: any
  }
  recommendations?: Array<{
    title: string
    description: string
    potentialSavings: number
  }>
}

export interface PDFGenerationOptions {
  type: 'pension' | 'tax' | 'wizard' | 'combined'
  data: any
  userInfo?: {
    name?: string
    email?: string
    generatedAt?: Date
  }
  branding?: {
    logo?: string
    organizationName?: string
    disclaimer?: string
  }
}

export interface PDFResult {
  buffer: Buffer
  filename: string
  size: number
  generatedAt: Date
}

/**
 * Main PDF generation service
 */
export class PDFService {
  private static instance: PDFService
  private browser: any | null = null
  private puppeteer: any | null = null

  private constructor() {}

  static getInstance(): PDFService {
    if (!PDFService.instance) {
      PDFService.instance = new PDFService()
    }
    return PDFService.instance
  }

  /**
   * Validate PDF generation requirements
   */
  static async validatePDFRequirements(userId: string): Promise<{
    canGenerate: boolean
    errors: string[]
    warnings: string[]
  }> {
    const errors: string[] = []
    const warnings: string[] = []

    // Basic validation - in a real implementation, this would check:
    // - User authentication
    // - Premium subscription status
    // - Rate limiting
    // - Data completeness

    if (!userId) {
      errors.push('User authentication required')
    }

    // For now, allow PDF generation for all authenticated users
    // In production, you might want to check subscription status, rate limits, etc.

    return {
      canGenerate: errors.length === 0,
      errors,
      warnings
    }
  }

  /**
   * Generate PDF report data
   */
  static async generateReportData(userId: string, data: any): Promise<{
    success: boolean
    data?: any
    error?: string
    generationTime: number
  }> {
    const startTime = Date.now()

    try {
      // Validate user and data
      if (!userId) {
        return {
          success: false,
          error: 'User ID required',
          generationTime: Date.now() - startTime
        }
      }

      // For now, return mock data
      // In a real implementation, this would:
      // - Fetch user's calculation data
      // - Process and format the data
      // - Generate the PDF content

      const reportData = {
        reportType: data.reportType || 'comprehensive',
        generatedAt: new Date().toISOString(),
        userId,
        content: {
          summary: 'PDF report data generated successfully',
          calculations: [],
          recommendations: []
        }
      }

      return {
        success: true,
        data: reportData,
        generationTime: Date.now() - startTime
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        generationTime: Date.now() - startTime
      }
    }
  }

  /**
   * Get PDF generation statistics for a user
   */
  static async getPDFStats(userId: string): Promise<{
    totalGenerated: number
    lastGenerated?: Date
    monthlyLimit: number
    monthlyUsed: number
    canGenerate: boolean
  }> {
    // For now, return mock statistics
    // In a real implementation, this would query the database

    return {
      totalGenerated: 0,
      lastGenerated: undefined,
      monthlyLimit: 10,
      monthlyUsed: 0,
      canGenerate: true
    }
  }

  /**
   * Initialize the PDF service with browser instance
   */
  async initialize(): Promise<void> {
    if (!this.browser) {
      // Dynamically import puppeteer to avoid server-side build issues
      if (!this.puppeteer) {
        this.puppeteer = await import('puppeteer')
      }

      this.browser = await this.puppeteer.default.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--single-process',
          '--disable-gpu'
        ]
      })
    }
  }

  /**
   * Generate PDF from HTML content
   */
  async generatePDF(options: PDFGenerationOptions): Promise<PDFResult> {
    await this.initialize()

    if (!this.browser) {
      throw new Error('Failed to initialize PDF browser')
    }

    const page = await this.browser.newPage()
    
    try {
      // Generate HTML content based on type
      const htmlContent = await this.generateHTMLContent(options)
      
      // Set content and wait for it to load
      await page.setContent(htmlContent, { 
        waitUntil: 'networkidle0',
        timeout: 30000 
      })

      // Generate PDF
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '1in',
          right: '0.75in',
          bottom: '1in',
          left: '0.75in'
        },
        displayHeaderFooter: true,
        headerTemplate: this.getHeaderTemplate(options),
        footerTemplate: this.getFooterTemplate(options)
      })

      const filename = this.generateFilename(options)
      
      return {
        buffer: Buffer.from(pdfBuffer),
        filename,
        size: pdfBuffer.length,
        generatedAt: new Date()
      }
    } finally {
      await page.close()
    }
  }

  /**
   * Generate HTML content based on PDF type
   */
  private async generateHTMLContent(options: PDFGenerationOptions): Promise<string> {
    const baseStyles = this.getBaseStyles()
    
    switch (options.type) {
      case 'pension':
        return this.generatePensionReportHTML(options.data, baseStyles, options.userInfo)
      case 'tax':
        return this.generateTaxReportHTML(options.data, baseStyles, options.userInfo)
      case 'wizard':
        return this.generateWizardReportHTML(options.data, baseStyles, options.userInfo)
      case 'combined':
        return this.generateCombinedReportHTML(options.data, baseStyles, options.userInfo)
      default:
        throw new Error(`Unsupported PDF type: ${options.type}`)
    }
  }

  /**
   * Generate pension calculation report HTML
   */
  private generatePensionReportHTML(data: any, styles: string, userInfo?: any): string {
    const currentDate = formatDate(new Date())
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Massachusetts Pension Calculation Report</title>
          ${styles}
        </head>
        <body>
          <div class="report-container">
            <div class="header">
              <div class="logo">
                <h1>Massachusetts Retirement System</h1>
                <h2>Pension Calculation Report</h2>
              </div>
              <div class="report-info">
                <p><strong>Generated:</strong> ${currentDate}</p>
                ${userInfo?.name ? `<p><strong>Prepared for:</strong> ${userInfo.name}</p>` : ''}
              </div>
            </div>

            <div class="summary-section">
              <h3>Pension Summary</h3>
              <div class="summary-grid">
                <div class="summary-item">
                  <label>Monthly Pension Benefit:</label>
                  <span class="value">${formatCurrency(data.monthlyPension || 0)}</span>
                </div>
                <div class="summary-item">
                  <label>Annual Pension Benefit:</label>
                  <span class="value">${formatCurrency(data.annualPension || 0)}</span>
                </div>
                <div class="summary-item">
                  <label>Retirement Option:</label>
                  <span class="value">${data.selectedOption || 'Option A'}</span>
                </div>
                <div class="summary-item">
                  <label>Retirement Group:</label>
                  <span class="value">Group ${data.details?.group || '1'}</span>
                </div>
              </div>
            </div>

            <div class="details-section">
              <h3>Calculation Details</h3>
              <table class="details-table">
                <tr>
                  <td>Average Salary (3 highest years):</td>
                  <td>${formatCurrency(data.details?.averageSalary || 0)}</td>
                </tr>
                <tr>
                  <td>Years of Service:</td>
                  <td>${data.details?.yearsOfService || 0} years</td>
                </tr>
                <tr>
                  <td>Age at Retirement:</td>
                  <td>${data.details?.age || 0} years</td>
                </tr>
                <tr>
                  <td>Benefit Percentage:</td>
                  <td>${data.details?.basePercentage || 0}%</td>
                </tr>
                <tr>
                  <td>Base Annual Pension:</td>
                  <td>${formatCurrency(data.details?.baseAnnualPension || 0)}</td>
                </tr>
              </table>
            </div>

            ${data.survivorAnnualPension ? `
              <div class="survivor-section">
                <h3>Survivor Benefits</h3>
                <div class="summary-grid">
                  <div class="summary-item">
                    <label>Survivor Monthly Benefit:</label>
                    <span class="value">${formatCurrency(data.survivorMonthlyPension)}</span>
                  </div>
                  <div class="summary-item">
                    <label>Survivor Annual Benefit:</label>
                    <span class="value">${formatCurrency(data.survivorAnnualPension)}</span>
                  </div>
                </div>
              </div>
            ` : ''}

            <div class="disclaimer-section">
              <h3>Important Disclaimer</h3>
              <p>This calculation is an estimate based on current Massachusetts Retirement System rules and the information provided. Actual benefits may vary based on final salary calculations, service credit verification, and changes to retirement laws. Please consult with the Massachusetts State Retirement Board for official benefit calculations.</p>
              <p><strong>Generated by:</strong> Massachusetts Pension Estimator Tool</p>
              <p><strong>Report Date:</strong> ${currentDate}</p>
            </div>
          </div>
        </body>
      </html>
    `
  }

  /**
   * Generate tax implications report HTML
   */
  private generateTaxReportHTML(data: TaxCalculationResult, styles: string, userInfo?: any): string {
    const currentDate = formatDate(new Date())
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Tax Implications Report</title>
          ${styles}
        </head>
        <body>
          <div class="report-container">
            <div class="header">
              <div class="logo">
                <h1>Massachusetts Retirement System</h1>
                <h2>Tax Implications Report</h2>
              </div>
              <div class="report-info">
                <p><strong>Generated:</strong> ${currentDate}</p>
                ${userInfo?.name ? `<p><strong>Prepared for:</strong> ${userInfo.name}</p>` : ''}
              </div>
            </div>

            <div class="summary-section">
              <h3>Tax Summary</h3>
              <div class="summary-grid">
                <div class="summary-item">
                  <label>Gross Income:</label>
                  <span class="value">${formatCurrency(data.grossIncome)}</span>
                </div>
                <div class="summary-item">
                  <label>Total Tax:</label>
                  <span class="value tax-amount">${formatCurrency(data.totalTax)}</span>
                </div>
                <div class="summary-item">
                  <label>Net Income:</label>
                  <span class="value">${formatCurrency(data.netIncome)}</span>
                </div>
                <div class="summary-item">
                  <label>Effective Tax Rate:</label>
                  <span class="value">${data.effectiveTaxRate.toFixed(1)}%</span>
                </div>
              </div>
            </div>

            <div class="details-section">
              <h3>Tax Breakdown</h3>
              <table class="details-table">
                <tr>
                  <td>Federal Income Tax:</td>
                  <td>${formatCurrency(data.federalTax)}</td>
                </tr>
                <tr>
                  <td>Massachusetts State Tax:</td>
                  <td>${formatCurrency(data.stateTax)}</td>
                </tr>
                <tr>
                  <td>Taxable Income:</td>
                  <td>${formatCurrency(data.taxableIncome)}</td>
                </tr>
                <tr>
                  <td>Social Security Taxable:</td>
                  <td>${formatCurrency(data.socialSecurityTaxable)}</td>
                </tr>
                <tr>
                  <td>SS Taxable Percentage:</td>
                  <td>${data.socialSecurityTaxablePercentage}%</td>
                </tr>
              </table>
            </div>

            ${data.recommendations && data.recommendations.length > 0 ? `
              <div class="recommendations-section">
                <h3>Tax Optimization Recommendations</h3>
                <ul class="recommendations-list">
                  ${data.recommendations.map(rec => `
                    <li>
                      <strong>${rec.title}:</strong> ${rec.description}
                      ${rec.potentialSavings > 0 ? `<br><em>Potential savings: ${formatCurrency(rec.potentialSavings)}</em>` : ''}
                    </li>
                  `).join('')}
                </ul>
              </div>
            ` : ''}

            <div class="disclaimer-section">
              <h3>Important Tax Disclaimer</h3>
              <p>This tax calculation is an estimate based on current federal and Massachusetts state tax laws. Actual tax liability may vary based on additional income sources, deductions, credits, and changes to tax laws. Please consult with a qualified tax professional for personalized tax advice.</p>
              <p><strong>Generated by:</strong> Massachusetts Pension Estimator Tool</p>
              <p><strong>Report Date:</strong> ${currentDate}</p>
            </div>
          </div>
        </body>
      </html>
    `
  }

  /**
   * Generate wizard results report HTML
   */
  private generateWizardReportHTML(data: CombinedCalculationData, styles: string, userInfo?: any): string {
    // Implementation for wizard report will be added in the next chunk
    return this.generateCombinedReportHTML(data, styles, userInfo)
  }

  /**
   * Generate combined comprehensive report HTML
   */
  private generateCombinedReportHTML(data: CombinedCalculationData, styles: string, userInfo?: any): string {
    // Implementation for combined report will be added in the next chunk
    const currentDate = formatDate(new Date())
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Comprehensive Retirement Planning Report</title>
          ${styles}
        </head>
        <body>
          <div class="report-container">
            <div class="header">
              <div class="logo">
                <h1>Massachusetts Retirement System</h1>
                <h2>Comprehensive Retirement Planning Report</h2>
              </div>
              <div class="report-info">
                <p><strong>Generated:</strong> ${currentDate}</p>
                ${userInfo?.name ? `<p><strong>Prepared for:</strong> ${userInfo.name}</p>` : ''}
              </div>
            </div>
            <!-- Content will be expanded in next implementation -->
          </div>
        </body>
      </html>
    `
  }

  /**
   * Generate filename for PDF
   */
  private generateFilename(options: PDFGenerationOptions): string {
    const timestamp = new Date().toISOString().split('T')[0]
    const type = options.type.charAt(0).toUpperCase() + options.type.slice(1)
    return `MA_Retirement_${type}_Report_${timestamp}.pdf`
  }

  /**
   * Get base CSS styles for PDF
   */
  private getBaseStyles(): string {
    return `
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Arial', sans-serif;
          font-size: 12px;
          line-height: 1.4;
          color: #333;
        }
        
        .report-container {
          max-width: 100%;
          margin: 0 auto;
          padding: 20px;
        }
        
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 2px solid #1e40af;
        }
        
        .logo h1 {
          font-size: 18px;
          color: #1e40af;
          margin-bottom: 5px;
        }
        
        .logo h2 {
          font-size: 14px;
          color: #64748b;
          font-weight: normal;
        }
        
        .report-info {
          text-align: right;
          font-size: 11px;
          color: #64748b;
        }
        
        .summary-section, .details-section, .survivor-section, .recommendations-section, .disclaimer-section {
          margin-bottom: 25px;
        }
        
        h3 {
          font-size: 14px;
          color: #1e40af;
          margin-bottom: 15px;
          padding-bottom: 5px;
          border-bottom: 1px solid #e2e8f0;
        }
        
        .summary-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
          margin-bottom: 20px;
        }
        
        .summary-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px;
          background-color: #f8fafc;
          border-radius: 4px;
        }
        
        .summary-item label {
          font-weight: 600;
          color: #475569;
        }
        
        .summary-item .value {
          font-weight: 700;
          color: #1e40af;
        }
        
        .tax-amount {
          color: #dc2626 !important;
        }
        
        .details-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        
        .details-table td {
          padding: 8px 12px;
          border-bottom: 1px solid #e2e8f0;
        }
        
        .details-table td:first-child {
          font-weight: 600;
          color: #475569;
          width: 60%;
        }
        
        .details-table td:last-child {
          text-align: right;
          font-weight: 600;
          color: #1e40af;
        }
        
        .recommendations-list {
          list-style: none;
          padding-left: 0;
        }
        
        .recommendations-list li {
          margin-bottom: 10px;
          padding: 10px;
          background-color: #fef3c7;
          border-left: 4px solid #f59e0b;
          border-radius: 4px;
        }
        
        .disclaimer-section {
          background-color: #f1f5f9;
          padding: 20px;
          border-radius: 8px;
          border-left: 4px solid #64748b;
        }
        
        .disclaimer-section p {
          margin-bottom: 10px;
          font-size: 11px;
          line-height: 1.5;
        }
        
        @media print {
          .report-container {
            padding: 0;
          }
          
          .header {
            margin-bottom: 20px;
          }
        }
      </style>
    `
  }

  /**
   * Get header template for PDF
   */
  private getHeaderTemplate(options: PDFGenerationOptions): string {
    return `
      <div style="font-size: 10px; padding: 10px; width: 100%; text-align: center; color: #64748b;">
        Massachusetts Retirement System - ${options.type.charAt(0).toUpperCase() + options.type.slice(1)} Report
      </div>
    `
  }

  /**
   * Get footer template for PDF
   */
  private getFooterTemplate(options: PDFGenerationOptions): string {
    return `
      <div style="font-size: 10px; padding: 10px; width: 100%; display: flex; justify-content: space-between; color: #64748b;">
        <span>Generated by Massachusetts Pension Estimator</span>
        <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
      </div>
    `
  }

  /**
   * Clean up resources
   */
  async cleanup(): Promise<void> {
    if (this.browser) {
      await this.browser.close()
      this.browser = null
    }
  }
}
