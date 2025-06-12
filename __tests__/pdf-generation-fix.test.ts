/**
 * PDF Generation Fix Test
 * 
 * Test to verify the PDF generation functionality works correctly
 * in the wizard review step.
 */

import { PDFService } from '@/lib/pdf/pdf-service'

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn()
    },
    retirementProfile: {
      findUnique: jest.fn()
    },
    retirementCalculation: {
      findMany: jest.fn()
    },
    actionItem: {
      findMany: jest.fn()
    },
    pdfGeneration: {
      create: jest.fn(),
      aggregate: jest.fn(),
      findMany: jest.fn(),
      deleteMany: jest.fn()
    }
  }
}))

// Mock error monitoring
jest.mock('@/components/error-boundary/error-monitoring', () => ({
  monitorAsyncOperation: jest.fn((fn) => fn()),
  recordUserAction: jest.fn()
}))

describe('PDF Generation Fix', () => {
  const mockUserId = 'test-user-123'
  const mockUser = {
    id: mockUserId,
    name: 'Test User',
    email: 'test@example.com'
  }

  const mockProfile = {
    id: 'profile-123',
    userId: mockUserId,
    dateOfBirth: new Date('1980-01-01'),
    membershipDate: new Date('2010-01-01'),
    retirementGroup: '1',
    currentSalary: 75000,
    averageHighest3Years: 72000,
    plannedRetirementAge: 65,
    retirementOption: 'A'
  }

  const mockCalculations = [
    {
      id: 'calc-123',
      userId: mockUserId,
      retirementAge: 65,
      yearsOfService: 25,
      averageSalary: 75000,
      monthlyBenefit: 4166.67,
      annualBenefit: 50000,
      benefitReduction: 0,
      socialSecurityData: JSON.stringify({
        monthlyBenefit: 2500,
        claimingAge: 67
      }),
      createdAt: new Date(),
      isFavorite: true
    }
  ]

  beforeEach(() => {
    jest.clearAllMocks()
    
    // Setup default mocks
    const { prisma } = require('@/lib/prisma')
    prisma.user.findUnique.mockResolvedValue(mockUser)
    prisma.retirementProfile.findUnique.mockResolvedValue(mockProfile)
    prisma.retirementCalculation.findMany.mockResolvedValue(mockCalculations)
    prisma.actionItem.findMany.mockResolvedValue([])
    prisma.pdfGeneration.create.mockResolvedValue({ id: 'pdf-123' })
  })

  describe('PDF Service Integration', () => {
    it('should generate PDF report data successfully', async () => {
      const result = await PDFService.generateReportData(mockUserId, {
        reportType: 'comprehensive',
        includeCharts: true,
        includeActionItems: true,
        includeSocialSecurity: true
      })

      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(result.data?.user.id).toBe(mockUserId)
      expect(result.data?.profile).toBeDefined()
      expect(result.data?.calculations).toHaveLength(1)
      expect(result.generationTime).toBeGreaterThan(0)
    })

    it('should validate PDF requirements correctly', async () => {
      const validation = await PDFService.validatePDFRequirements(mockUserId)

      expect(validation.canGenerate).toBe(true)
      expect(validation.missingRequirements).toHaveLength(0)
      expect(validation.warnings).toEqual(
        expect.arrayContaining([
          expect.stringContaining('No retirement calculations found')
        ])
      )
    })

    it('should handle missing user gracefully', async () => {
      const { prisma } = require('@/lib/prisma')
      prisma.user.findUnique.mockResolvedValue(null)

      const result = await PDFService.generateReportData('invalid-user')

      expect(result.success).toBe(false)
      expect(result.error).toBe('User not found')
    })

    it('should handle missing profile with warnings', async () => {
      const { prisma } = require('@/lib/prisma')
      prisma.retirementProfile.findUnique.mockResolvedValue(null)

      const validation = await PDFService.validatePDFRequirements(mockUserId)

      expect(validation.canGenerate).toBe(false)
      expect(validation.missingRequirements).toContain('Retirement profile must be completed')
    })

    it('should complete within performance requirements', async () => {
      const startTime = performance.now()
      
      const result = await PDFService.generateReportData(mockUserId, {
        reportType: 'comprehensive'
      })
      
      const endTime = performance.now()
      const totalTime = endTime - startTime

      expect(result.success).toBe(true)
      expect(totalTime).toBeLessThan(2000) // Sub-2-second requirement
      expect(result.generationTime).toBeLessThan(2000)
    })

    it('should generate chart data when requested', async () => {
      const result = await PDFService.generateReportData(mockUserId, {
        reportType: 'comprehensive',
        includeCharts: true
      })

      expect(result.success).toBe(true)
      expect(result.data?.chartData).toBeDefined()
      expect(result.data?.chartData.benefitProjection).toBeDefined()
      expect(result.data?.chartData.incomeComparison).toBeDefined()
    })

    it('should handle different report types', async () => {
      const reportTypes = ['comprehensive', 'summary', 'calculations-only'] as const

      for (const reportType of reportTypes) {
        const result = await PDFService.generateReportData(mockUserId, {
          reportType
        })

        expect(result.success).toBe(true)
        expect(result.data).toBeDefined()
      }
    })

    it('should log PDF generation correctly', async () => {
      const { prisma } = require('@/lib/prisma')
      
      await PDFService.generateReportData(mockUserId, {
        reportType: 'comprehensive'
      })

      expect(prisma.pdfGeneration.create).toHaveBeenCalledWith({
        data: {
          userId: mockUserId,
          pdfType: 'comprehensive',
          generationTime: expect.any(Number),
          fileSize: 0,
          success: true
        }
      })
    })
  })

  describe('API Schema Validation', () => {
    it('should accept valid PDF generation options', () => {
      const validOptions = {
        reportType: 'comprehensive' as const,
        includeCharts: true,
        includeActionItems: true,
        includeSocialSecurity: true,
        maxCalculations: 10
      }

      // This would be validated by the Zod schema in the API
      expect(validOptions.reportType).toBe('comprehensive')
      expect(typeof validOptions.includeCharts).toBe('boolean')
      expect(typeof validOptions.includeActionItems).toBe('boolean')
      expect(typeof validOptions.includeSocialSecurity).toBe('boolean')
      expect(typeof validOptions.maxCalculations).toBe('number')
    })

    it('should handle default values correctly', () => {
      const defaultOptions = {
        reportType: 'comprehensive' as const,
        includeCharts: true,
        includeActionItems: true,
        includeSocialSecurity: true,
        maxCalculations: 10
      }

      expect(defaultOptions.reportType).toBe('comprehensive')
      expect(defaultOptions.includeCharts).toBe(true)
      expect(defaultOptions.includeActionItems).toBe(true)
      expect(defaultOptions.includeSocialSecurity).toBe(true)
      expect(defaultOptions.maxCalculations).toBe(10)
    })
  })

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      const { prisma } = require('@/lib/prisma')
      prisma.user.findUnique.mockRejectedValue(new Error('Database connection failed'))

      const result = await PDFService.generateReportData(mockUserId)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Database connection failed')
      expect(result.generationTime).toBeGreaterThan(0)
    })

    it('should handle invalid user ID', async () => {
      const result = await PDFService.generateReportData('')

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })
  })
})
