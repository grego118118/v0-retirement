/**
 * PDF Generation System Tests
 * Massachusetts Retirement System - Comprehensive PDF Report Generation
 * 
 * Tests for PDF service, API endpoints, and React components
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { PDFService } from '@/lib/pdf/pdf-service'
import { prisma } from '@/lib/prisma'

// Mock dependencies
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
    retirementProfile: {
      findUnique: vi.fn(),
    },
    retirementCalculation: {
      findMany: vi.fn(),
    },
    actionItem: {
      findMany: vi.fn(),
    },
    pdfGeneration: {
      create: vi.fn(),
      aggregate: vi.fn(),
      findMany: vi.fn(),
      deleteMany: vi.fn(),
    },
  },
}))

vi.mock('@/components/error-boundary/error-monitoring', () => ({
  monitorAsyncOperation: vi.fn((fn) => fn()),
  recordUserAction: vi.fn(),
}))

describe('PDF Generation System', () => {
  const mockUserId = 'test-user-123'
  const mockUser = {
    id: mockUserId,
    name: 'John Doe',
    email: 'john.doe@example.com',
  }

  const mockProfile = {
    id: 'profile-123',
    dateOfBirth: new Date('1970-01-01'),
    membershipDate: new Date('2000-01-01'),
    retirementGroup: '1',
    currentSalary: 75000,
    averageHighest3Years: 80000,
    plannedRetirementAge: 65,
    retirementOption: 'A',
  }

  const mockCalculations = [
    {
      id: 'calc-1',
      retirementAge: 65,
      yearsOfService: 25,
      averageSalary: 80000,
      monthlyBenefit: 3200,
      annualBenefit: 38400,
      benefitReduction: null,
      socialSecurityData: JSON.stringify({
        monthlyBenefit: 2000,
        fullRetirementAge: 67,
      }),
      createdAt: new Date(),
      isFavorite: true,
    },
    {
      id: 'calc-2',
      retirementAge: 62,
      yearsOfService: 22,
      averageSalary: 75000,
      monthlyBenefit: 2800,
      annualBenefit: 33600,
      benefitReduction: 0.15,
      socialSecurityData: null,
      createdAt: new Date(),
      isFavorite: false,
    },
  ]

  const mockActionItems = [
    {
      id: 'action-1',
      title: 'Complete Your Retirement Profile',
      description: 'Add missing salary information for accurate calculations',
      category: 'profile',
      priority: 'high',
      status: 'pending',
      createdAt: new Date(),
    },
    {
      id: 'action-2',
      title: 'Review Social Security Benefits',
      description: 'Optimize your Social Security claiming strategy',
      category: 'planning',
      priority: 'medium',
      status: 'pending',
      createdAt: new Date(),
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('PDFService', () => {
    describe('generateReportData', () => {
      it('should generate comprehensive PDF report data successfully', async () => {
        // Mock database responses
        vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser)
        vi.mocked(prisma.retirementProfile.findUnique).mockResolvedValue(mockProfile)
        vi.mocked(prisma.retirementCalculation.findMany).mockResolvedValue(mockCalculations)
        vi.mocked(prisma.actionItem.findMany).mockResolvedValue(mockActionItems)
        vi.mocked(prisma.pdfGeneration.create).mockResolvedValue({} as any)

        const result = await PDFService.generateReportData(mockUserId, {
          reportType: 'comprehensive',
          includeCharts: true,
          includeActionItems: true,
          includeSocialSecurity: true,
        })

        expect(result.success).toBe(true)
        expect(result.data).toBeDefined()
        expect(result.data?.user).toEqual({
          id: mockUser.id,
          name: mockUser.name,
          email: mockUser.email,
        })
        expect(result.data?.profile).toBeDefined()
        expect(result.data?.calculations).toHaveLength(2)
        expect(result.data?.actionItems).toHaveLength(2)
        expect(result.data?.chartData).toBeDefined()
        expect(result.generationTime).toBeDefined()
        expect(result.generationTime).toBeLessThan(2000) // Sub-2-second requirement
      })

      it('should generate summary report with limited content', async () => {
        vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser)
        vi.mocked(prisma.retirementProfile.findUnique).mockResolvedValue(mockProfile)
        vi.mocked(prisma.retirementCalculation.findMany).mockResolvedValue(mockCalculations)
        vi.mocked(prisma.actionItem.findMany).mockResolvedValue([])
        vi.mocked(prisma.pdfGeneration.create).mockResolvedValue({} as any)

        const result = await PDFService.generateReportData(mockUserId, {
          reportType: 'summary',
          includeCharts: false,
          includeActionItems: false,
          maxCalculations: 5,
        })

        expect(result.success).toBe(true)
        expect(result.data?.actionItems).toHaveLength(0)
        expect(result.data?.chartData).toBeUndefined()
      })

      it('should handle user not found error', async () => {
        vi.mocked(prisma.user.findUnique).mockResolvedValue(null)

        const result = await PDFService.generateReportData('invalid-user')

        expect(result.success).toBe(false)
        expect(result.error).toBe('User not found')
      })

      it('should handle database errors gracefully', async () => {
        vi.mocked(prisma.user.findUnique).mockRejectedValue(new Error('Database connection failed'))

        const result = await PDFService.generateReportData(mockUserId)

        expect(result.success).toBe(false)
        expect(result.error).toBe('Database connection failed')
      })
    })

    describe('generateChartData', () => {
      it('should generate chart data for calculations with Social Security', async () => {
        const chartData = await (PDFService as any).generateChartData(mockCalculations, mockProfile)

        expect(chartData.benefitProjection).toBeDefined()
        expect(chartData.benefitProjection).toHaveLength(2)
        expect(chartData.incomeComparison).toBeDefined()
        expect(chartData.incomeComparison).toHaveLength(3)
        expect(chartData.incomeBreakdown).toBeDefined()
        expect(chartData.incomeBreakdown).toHaveLength(2)
      })

      it('should handle calculations without Social Security data', async () => {
        const calculationsWithoutSS = mockCalculations.map(calc => ({
          ...calc,
          socialSecurityData: null,
        }))

        const chartData = await (PDFService as any).generateChartData(calculationsWithoutSS, mockProfile)

        expect(chartData.benefitProjection).toBeDefined()
        expect(chartData.incomeComparison).toBeUndefined()
        expect(chartData.incomeBreakdown).toBeUndefined()
      })

      it('should handle empty calculations array', async () => {
        const chartData = await (PDFService as any).generateChartData([], mockProfile)

        expect(Object.keys(chartData)).toHaveLength(0)
      })
    })

    describe('validatePDFRequirements', () => {
      it('should validate user with complete profile and calculations', async () => {
        vi.mocked(prisma.user.findUnique).mockResolvedValue({
          ...mockUser,
          profile: mockProfile,
          calculations: mockCalculations,
        } as any)

        const result = await PDFService.validatePDFRequirements(mockUserId)

        expect(result.canGenerate).toBe(true)
        expect(result.missingRequirements).toHaveLength(0)
        expect(result.warnings).toHaveLength(0)
      })

      it('should identify missing profile requirement', async () => {
        vi.mocked(prisma.user.findUnique).mockResolvedValue({
          ...mockUser,
          profile: null,
          calculations: [],
        } as any)

        const result = await PDFService.validatePDFRequirements(mockUserId)

        expect(result.canGenerate).toBe(false)
        expect(result.missingRequirements).toContain('Retirement profile must be completed')
      })

      it('should identify warnings for incomplete profile', async () => {
        const incompleteProfile = {
          ...mockProfile,
          currentSalary: 0,
          averageHighest3Years: null,
          plannedRetirementAge: null,
        }

        vi.mocked(prisma.user.findUnique).mockResolvedValue({
          ...mockUser,
          profile: incompleteProfile,
          calculations: [],
        } as any)

        const result = await PDFService.validatePDFRequirements(mockUserId)

        expect(result.canGenerate).toBe(true)
        expect(result.warnings).toContain('Current salary not provided - may affect calculation accuracy')
        expect(result.warnings).toContain('Average highest 3 years salary not provided')
        expect(result.warnings).toContain('Planned retirement age not specified')
        expect(result.warnings).toContain('No retirement calculations found - report will have limited content')
      })

      it('should handle user not found', async () => {
        vi.mocked(prisma.user.findUnique).mockResolvedValue(null)

        const result = await PDFService.validatePDFRequirements('invalid-user')

        expect(result.canGenerate).toBe(false)
        expect(result.missingRequirements).toContain('User account not found')
      })
    })

    describe('getPDFStats', () => {
      it('should return PDF generation statistics', async () => {
        const mockStats = {
          _count: { id: 5 },
          _avg: { generationTime: 1200 },
          _max: { createdAt: new Date() },
        }

        const mockRecentGenerations = [
          {
            pdfType: 'comprehensive',
            generationTime: 1100,
            createdAt: new Date(),
            success: true,
          },
          {
            pdfType: 'summary',
            generationTime: 800,
            createdAt: new Date(),
            success: true,
          },
        ]

        vi.mocked(prisma.pdfGeneration.aggregate).mockResolvedValue(mockStats as any)
        vi.mocked(prisma.pdfGeneration.findMany).mockResolvedValue(mockRecentGenerations as any)

        const result = await PDFService.getPDFStats(mockUserId)

        expect(result.totalGenerated).toBe(5)
        expect(result.averageGenerationTime).toBe(1200)
        expect(result.lastGenerated).toBeDefined()
        expect(result.recentGenerations).toHaveLength(2)
      })
    })

    describe('cleanupOldLogs', () => {
      it('should clean up old PDF generation logs', async () => {
        vi.mocked(prisma.pdfGeneration.deleteMany).mockResolvedValue({ count: 10 })

        const result = await PDFService.cleanupOldLogs(30)

        expect(result).toBe(10)
        expect(prisma.pdfGeneration.deleteMany).toHaveBeenCalledWith({
          where: {
            createdAt: { lt: expect.any(Date) },
          },
        })
      })
    })
  })

  describe('Performance Requirements', () => {
    it('should meet sub-2-second generation requirement', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser)
      vi.mocked(prisma.retirementProfile.findUnique).mockResolvedValue(mockProfile)
      vi.mocked(prisma.retirementCalculation.findMany).mockResolvedValue(mockCalculations)
      vi.mocked(prisma.actionItem.findMany).mockResolvedValue(mockActionItems)
      vi.mocked(prisma.pdfGeneration.create).mockResolvedValue({} as any)

      const startTime = Date.now()
      const result = await PDFService.generateReportData(mockUserId)
      const endTime = Date.now()

      expect(result.success).toBe(true)
      expect(endTime - startTime).toBeLessThan(2000)
      expect(result.generationTime).toBeLessThan(2000)
    })

    it('should handle large datasets efficiently', async () => {
      // Create large dataset
      const largeCalculations = Array.from({ length: 50 }, (_, i) => ({
        ...mockCalculations[0],
        id: `calc-${i}`,
        retirementAge: 60 + (i % 10),
      }))

      const largeActionItems = Array.from({ length: 100 }, (_, i) => ({
        ...mockActionItems[0],
        id: `action-${i}`,
        title: `Action Item ${i}`,
      }))

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser)
      vi.mocked(prisma.retirementProfile.findUnique).mockResolvedValue(mockProfile)
      vi.mocked(prisma.retirementCalculation.findMany).mockResolvedValue(largeCalculations)
      vi.mocked(prisma.actionItem.findMany).mockResolvedValue(largeActionItems)
      vi.mocked(prisma.pdfGeneration.create).mockResolvedValue({} as any)

      const result = await PDFService.generateReportData(mockUserId, {
        maxCalculations: 50,
      })

      expect(result.success).toBe(true)
      expect(result.generationTime).toBeLessThan(2000)
      expect(result.data?.calculations).toHaveLength(50)
      expect(result.data?.actionItems).toHaveLength(20) // Limited for PDF space
    })
  })
})
