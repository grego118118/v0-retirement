/**
 * PDF Service Tests
 * Comprehensive tests for PDF generation functionality
 */

import { PDFService } from '@/lib/pdf/pdf-service'

// Mock puppeteer for testing
jest.mock('puppeteer', () => ({
  launch: jest.fn().mockResolvedValue({
    newPage: jest.fn().mockResolvedValue({
      setContent: jest.fn().mockResolvedValue(undefined),
      pdf: jest.fn().mockResolvedValue(Buffer.from('mock-pdf-content')),
      close: jest.fn().mockResolvedValue(undefined)
    }),
    close: jest.fn().mockResolvedValue(undefined)
  })
}))

describe('PDFService', () => {
  let pdfService: PDFService

  beforeEach(() => {
    pdfService = PDFService.getInstance()
  })

  afterEach(async () => {
    await pdfService.cleanup()
  })

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = PDFService.getInstance()
      const instance2 = PDFService.getInstance()
      expect(instance1).toBe(instance2)
    })
  })

  describe('PDF Generation', () => {
    const mockPensionData = {
      monthlyPension: 4000,
      annualPension: 48000,
      selectedOption: 'Option A',
      details: {
        group: '3',
        averageSalary: 80000,
        yearsOfService: 25,
        age: 62,
        basePercentage: 60,
        baseAnnualPension: 48000
      }
    }

    const mockTaxData = {
      grossIncome: 88800,
      totalTax: 15000,
      netIncome: 73800,
      federalTax: 12000,
      stateTax: 3000,
      taxableIncome: 75000,
      socialSecurityTaxable: 24000,
      socialSecurityTaxablePercentage: 85,
      effectiveTaxRate: 16.9,
      marginalTaxRate: 22,
      recommendations: [
        {
          title: 'Tax Optimization',
          description: 'Consider Roth IRA conversions',
          potentialSavings: 2000
        }
      ]
    }

    it('should generate pension PDF successfully', async () => {
      const result = await pdfService.generatePDF({
        type: 'pension',
        data: mockPensionData,
        userInfo: {
          name: 'John Doe',
          email: 'john@example.com',
          generatedAt: new Date()
        }
      })

      expect(result).toBeDefined()
      expect(result.buffer).toBeInstanceOf(Buffer)
      expect(result.filename).toContain('Pension_Report')
      expect(result.size).toBeGreaterThan(0)
      expect(result.generatedAt).toBeInstanceOf(Date)
    })

    it('should generate tax PDF successfully', async () => {
      const result = await pdfService.generatePDF({
        type: 'tax',
        data: mockTaxData,
        userInfo: {
          name: 'Jane Smith',
          email: 'jane@example.com'
        }
      })

      expect(result).toBeDefined()
      expect(result.buffer).toBeInstanceOf(Buffer)
      expect(result.filename).toContain('Tax_Report')
      expect(result.size).toBeGreaterThan(0)
    })

    it('should generate wizard PDF successfully', async () => {
      const mockWizardData = {
        personalInfo: {
          name: 'Test User',
          age: 55,
          retirementAge: 62
        },
        pensionData: mockPensionData,
        socialSecurityData: {
          fullRetirementBenefit: 2400,
          selectedClaimingAge: 67
        }
      }

      const result = await pdfService.generatePDF({
        type: 'wizard',
        data: mockWizardData
      })

      expect(result).toBeDefined()
      expect(result.filename).toContain('Report')
    })

    it('should generate combined PDF successfully', async () => {
      const mockCombinedData = {
        personalInfo: {
          name: 'Test User',
          age: 55,
          retirementAge: 62
        },
        pensionData: mockPensionData,
        socialSecurityData: {
          fullRetirementBenefit: 2400,
          selectedClaimingAge: 67
        },
        taxData: mockTaxData
      }

      const result = await pdfService.generatePDF({
        type: 'combined',
        data: mockCombinedData
      })

      expect(result).toBeDefined()
      expect(result.filename).toContain('Comprehensive_Report')
    })

    it('should throw error for unsupported PDF type', async () => {
      await expect(
        pdfService.generatePDF({
          type: 'unsupported' as any,
          data: {}
        })
      ).rejects.toThrow('Unsupported PDF type: unsupported')
    })
  })

  describe('Performance Requirements', () => {
    it('should generate PDF within 2 seconds', async () => {
      const startTime = Date.now()
      
      await pdfService.generatePDF({
        type: 'pension',
        data: {
          monthlyPension: 4000,
          annualPension: 48000,
          details: { group: '1' }
        }
      })
      
      const endTime = Date.now()
      const duration = endTime - startTime
      
      expect(duration).toBeLessThan(2000) // 2 seconds
    })

    it('should handle multiple concurrent PDF generations', async () => {
      const promises = Array.from({ length: 5 }, (_, i) =>
        pdfService.generatePDF({
          type: 'pension',
          data: {
            monthlyPension: 4000 + i * 100,
            annualPension: 48000 + i * 1200,
            details: { group: '1' }
          }
        })
      )

      const results = await Promise.all(promises)
      
      expect(results).toHaveLength(5)
      results.forEach(result => {
        expect(result.buffer).toBeInstanceOf(Buffer)
        expect(result.size).toBeGreaterThan(0)
      })
    })
  })

  describe('Error Handling', () => {
    it('should handle browser initialization failure', async () => {
      // Mock browser launch failure
      const puppeteer = require('puppeteer')
      puppeteer.launch.mockRejectedValueOnce(new Error('Browser launch failed'))

      await expect(
        pdfService.generatePDF({
          type: 'pension',
          data: { monthlyPension: 4000 }
        })
      ).rejects.toThrow('Browser launch failed')
    })

    it('should handle page creation failure', async () => {
      // Mock page creation failure
      const puppeteer = require('puppeteer')
      const mockBrowser = {
        newPage: jest.fn().mockRejectedValue(new Error('Page creation failed')),
        close: jest.fn()
      }
      puppeteer.launch.mockResolvedValueOnce(mockBrowser)

      await expect(
        pdfService.generatePDF({
          type: 'pension',
          data: { monthlyPension: 4000 }
        })
      ).rejects.toThrow('Page creation failed')
    })
  })

  describe('Filename Generation', () => {
    it('should generate unique filenames with timestamps', async () => {
      const result1 = await pdfService.generatePDF({
        type: 'pension',
        data: { monthlyPension: 4000 }
      })

      // Wait a moment to ensure different timestamp
      await new Promise(resolve => setTimeout(resolve, 10))

      const result2 = await pdfService.generatePDF({
        type: 'tax',
        data: { grossIncome: 50000, totalTax: 5000 }
      })

      expect(result1.filename).not.toBe(result2.filename)
      expect(result1.filename).toContain('Pension_Report')
      expect(result2.filename).toContain('Tax_Report')
    })

    it('should include current date in filename', async () => {
      const result = await pdfService.generatePDF({
        type: 'pension',
        data: { monthlyPension: 4000 }
      })

      const currentDate = new Date().toISOString().split('T')[0]
      expect(result.filename).toContain(currentDate)
    })
  })

  describe('Data Validation', () => {
    it('should handle missing data gracefully', async () => {
      const result = await pdfService.generatePDF({
        type: 'pension',
        data: {} // Empty data
      })

      expect(result).toBeDefined()
      expect(result.buffer).toBeInstanceOf(Buffer)
    })

    it('should handle null/undefined values in data', async () => {
      const result = await pdfService.generatePDF({
        type: 'pension',
        data: {
          monthlyPension: null,
          annualPension: undefined,
          details: null
        }
      })

      expect(result).toBeDefined()
      expect(result.buffer).toBeInstanceOf(Buffer)
    })
  })

  describe('Memory Management', () => {
    it('should cleanup browser resources', async () => {
      const puppeteer = require('puppeteer')
      const mockBrowser = {
        newPage: jest.fn().mockResolvedValue({
          setContent: jest.fn(),
          pdf: jest.fn().mockResolvedValue(Buffer.from('test')),
          close: jest.fn()
        }),
        close: jest.fn()
      }
      puppeteer.launch.mockResolvedValueOnce(mockBrowser)

      await pdfService.generatePDF({
        type: 'pension',
        data: { monthlyPension: 4000 }
      })

      await pdfService.cleanup()

      expect(mockBrowser.close).toHaveBeenCalled()
    })
  })
})
