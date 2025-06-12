/**
 * PDF Service
 * Massachusetts Retirement System - PDF Report Generation
 *
 * Service layer for collecting user data and generating PDF reports
 * with comprehensive retirement planning information using browser-native printing.
 */

import { prisma } from '@/lib/prisma'
import { monitorAsyncOperation } from '@/components/error-boundary/error-monitoring'
import { PDFReportData } from '@/components/pdf/pdf-report'

export interface PDFGenerationOptions {
  reportType?: 'comprehensive' | 'summary' | 'calculations-only'
  includeCharts?: boolean
  includeActionItems?: boolean
  includeSocialSecurity?: boolean
  maxCalculations?: number
}

export interface PDFGenerationResult {
  success: boolean
  data?: PDFReportData
  error?: string
  generationTime?: number
}

export class PDFService {
  /**
   * Generate PDF report data for a user
   */
  static async generateReportData(
    userId: string,
    options: PDFGenerationOptions = {}
  ): Promise<PDFGenerationResult> {
    return monitorAsyncOperation(async () => {
      const startTime = Date.now()

      try {
        const {
          reportType = 'comprehensive',
          includeCharts = true,
          includeActionItems = true,
          includeSocialSecurity = true,
          maxCalculations = 10,
        } = options

        // Fetch user data
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: {
            id: true,
            name: true,
            email: true,
          },
        })

        if (!user) {
          return {
            success: false,
            error: 'User not found',
          }
        }

        // Fetch user profile
        const profile = await prisma.retirementProfile.findUnique({
          where: { userId },
        })

        // Fetch calculations
        const calculations = await prisma.retirementCalculation.findMany({
          where: { userId },
          orderBy: [
            { isFavorite: 'desc' },
            { createdAt: 'desc' },
          ],
          take: maxCalculations,
        })

        // Fetch action items if requested
        let actionItems: any[] = []
        if (includeActionItems && reportType === 'comprehensive') {
          actionItems = await prisma.actionItem.findMany({
            where: {
              userId,
              status: { in: ['pending', 'in-progress', 'completed'] },
            },
            orderBy: [
              { priority: 'desc' },
              { createdAt: 'desc' },
            ],
            take: 20, // Limit for PDF space
          })
        }

        // Generate chart data if requested
        let chartData: any = {}
        if (includeCharts) {
          chartData = await this.generateChartData(calculations, profile)
        }

        // Transform data for PDF report
        const reportData: PDFReportData = {
          user: {
            id: user.id,
            name: user.name || undefined,
            email: user.email,
          },
          profile: profile ? {
            id: profile.id,
            dateOfBirth: profile.dateOfBirth,
            membershipDate: profile.membershipDate,
            retirementGroup: profile.retirementGroup,
            currentSalary: profile.currentSalary || 0,
            averageHighest3Years: profile.averageHighest3Years || undefined,
            plannedRetirementAge: profile.plannedRetirementAge || undefined,
            retirementOption: profile.retirementOption || undefined,
          } : undefined,
          calculations: calculations.map(calc => ({
            id: calc.id,
            retirementAge: calc.retirementAge,
            yearsOfService: calc.yearsOfService,
            averageSalary: calc.averageSalary,
            monthlyBenefit: calc.monthlyBenefit,
            annualBenefit: calc.annualBenefit,
            benefitReduction: calc.benefitReduction || undefined,
            socialSecurityData: calc.socialSecurityData || undefined,
            createdAt: calc.createdAt,
            isFavorite: calc.isFavorite,
          })),
          actionItems: actionItems.map(item => ({
            id: item.id,
            title: item.title,
            description: item.description,
            category: item.category,
            priority: item.priority,
            status: item.status,
            createdAt: item.createdAt,
          })),
          chartData: includeCharts ? chartData : undefined,
        }

        const generationTime = Date.now() - startTime

        // Log PDF generation
        await this.logPDFGeneration(userId, reportType, generationTime)

        return {
          success: true,
          data: reportData,
          generationTime,
        }

      } catch (error) {
        console.error('PDF generation error:', error)

        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          generationTime: Date.now() - startTime,
        }
      }
    }, 'pdf_generation')
  }

  /**
   * Generate chart data for PDF reports
   */
  private static async generateChartData(calculations: any[], profile: any) {
    const chartData: any = {}

    if (calculations.length > 0) {
      // Benefit projection chart data
      chartData.benefitProjection = calculations
        .sort((a, b) => a.retirementAge - b.retirementAge)
        .map(calc => ({
          age: calc.retirementAge,
          monthlyBenefit: calc.monthlyBenefit,
          annualBenefit: calc.annualBenefit,
          yearsOfService: calc.yearsOfService,
        }))

      // Income comparison chart data
      const calculationsWithSS = calculations.filter(calc => calc.socialSecurityData)
      if (calculationsWithSS.length > 0) {
        const primaryCalc = calculationsWithSS[0]
        const ssData = JSON.parse(primaryCalc.socialSecurityData || '{}')

        chartData.incomeComparison = [
          {
            category: 'Pension Only',
            amount: primaryCalc.monthlyBenefit,
            type: 'pension',
          },
          {
            category: 'Social Security Only',
            amount: ssData.monthlyBenefit || 0,
            type: 'social-security',
          },
          {
            category: 'Combined Income',
            amount: primaryCalc.monthlyBenefit + (ssData.monthlyBenefit || 0),
            type: 'combined',
          },
        ]

        // Income breakdown chart data
        chartData.incomeBreakdown = [
          {
            category: 'Massachusetts Pension',
            amount: primaryCalc.monthlyBenefit,
            percentage: (primaryCalc.monthlyBenefit / (primaryCalc.monthlyBenefit + (ssData.monthlyBenefit || 0))) * 100,
          },
          {
            category: 'Social Security',
            amount: ssData.monthlyBenefit || 0,
            percentage: ((ssData.monthlyBenefit || 0) / (primaryCalc.monthlyBenefit + (ssData.monthlyBenefit || 0))) * 100,
          },
        ]
      }
    }

    return chartData
  }

  /**
   * Log PDF generation for analytics
   */
  private static async logPDFGeneration(
    userId: string,
    reportType: string,
    generationTime: number
  ) {
    try {
      await prisma.pdfGeneration.create({
        data: {
          userId,
          pdfType: reportType,
          generationTime,
          fileSize: 0, // Will be updated if we track actual file size
          success: true,
        },
      })
    } catch (error) {
      console.error('Failed to log PDF generation:', error)
    }
  }

  /**
   * Get PDF generation statistics for a user
   */
  static async getPDFStats(userId: string) {
    return monitorAsyncOperation(async () => {
      const stats = await prisma.pdfGeneration.aggregate({
        where: { userId },
        _count: { id: true },
        _avg: { generationTime: true },
        _max: { createdAt: true },
      })

      const recentGenerations = await prisma.pdfGeneration.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          pdfType: true,
          generationTime: true,
          createdAt: true,
          success: true,
        },
      })

      return {
        totalGenerated: stats._count.id || 0,
        averageGenerationTime: stats._avg.generationTime || 0,
        lastGenerated: stats._max.createdAt,
        recentGenerations,
      }
    }, 'pdf_stats')
  }

  /**
   * Validate PDF generation requirements
   */
  static async validatePDFRequirements(userId: string): Promise<{
    canGenerate: boolean
    missingRequirements: string[]
    warnings: string[]
  }> {
    return monitorAsyncOperation(async () => {
      const missingRequirements: string[] = []
      const warnings: string[] = []

      // Check if user exists
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          profile: true,
          calculations: {
            take: 1,
            orderBy: { createdAt: 'desc' },
          },
        },
      })

      if (!user) {
        missingRequirements.push('User account not found')
        return { canGenerate: false, missingRequirements, warnings }
      }

      // Check for profile
      if (!user.profile) {
        missingRequirements.push('Retirement profile must be completed')
      } else {
        // Check profile completeness
        if (!user.profile.currentSalary) {
          warnings.push('Current salary not provided - may affect calculation accuracy')
        }
        if (!user.profile.averageHighest3Years) {
          warnings.push('Average highest 3 years salary not provided')
        }
        if (!user.profile.plannedRetirementAge) {
          warnings.push('Planned retirement age not specified')
        }
      }

      // Check for calculations
      if (user.calculations.length === 0) {
        warnings.push('No retirement calculations found - report will have limited content')
      }

      const canGenerate = missingRequirements.length === 0

      return {
        canGenerate,
        missingRequirements,
        warnings,
      }
    }, 'pdf_validation')
  }

  /**
   * Clean up old PDF generation logs
   */
  static async cleanupOldLogs(daysToKeep: number = 90) {
    return monitorAsyncOperation(async () => {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)

      const result = await prisma.pdfGeneration.deleteMany({
        where: {
          createdAt: { lt: cutoffDate },
        },
      })

      return result.count
    }, 'pdf_cleanup')
  }
}
