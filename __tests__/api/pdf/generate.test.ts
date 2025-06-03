/**
 * PDF Generation API Tests
 * Tests for the PDF generation API endpoint
 */

import { NextRequest } from 'next/server'
import { POST, GET } from '@/app/api/pdf/generate/route'

// Mock dependencies
jest.mock('next-auth', () => ({
  getServerSession: jest.fn()
}))

jest.mock('@/lib/pdf/pdf-service', () => ({
  PDFService: {
    getInstance: jest.fn().mockReturnValue({
      generatePDF: jest.fn().mockResolvedValue({
        buffer: Buffer.from('mock-pdf-content'),
        filename: 'test-report.pdf',
        size: 1024,
        generatedAt: new Date()
      })
    })
  }
}))

jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn()
    },
    pdfGeneration: {
      create: jest.fn(),
      count: jest.fn()
    }
  }
}))

jest.mock('@/lib/stripe/config', () => ({
  isSubscriptionActive: jest.fn()
}))

describe('/api/pdf/generate', () => {
  const { getServerSession } = require('next-auth')
  const { prisma } = require('@/lib/prisma')
  const { isSubscriptionActive } = require('@/lib/stripe/config')

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST /api/pdf/generate', () => {
    const mockUser = {
      id: 'user-123',
      name: 'John Doe',
      email: 'john@example.com',
      subscriptionStatus: 'active'
    }

    const mockSession = {
      user: {
        email: 'john@example.com',
        name: 'John Doe'
      }
    }

    const mockPensionData = {
      monthlyPension: 4000,
      annualPension: 48000,
      details: {
        group: '3',
        averageSalary: 80000,
        yearsOfService: 25
      }
    }

    it('should generate PDF successfully for authenticated premium user', async () => {
      getServerSession.mockResolvedValue(mockSession)
      prisma.user.findUnique.mockResolvedValue(mockUser)
      isSubscriptionActive.mockReturnValue(true)
      prisma.pdfGeneration.create.mockResolvedValue({})

      const request = new NextRequest('http://localhost:3000/api/pdf/generate', {
        method: 'POST',
        body: JSON.stringify({
          type: 'pension',
          data: mockPensionData
        })
      })

      const response = await POST(request)

      expect(response.status).toBe(200)
      expect(response.headers.get('Content-Type')).toBe('application/pdf')
      expect(response.headers.get('Content-Disposition')).toContain('attachment')
    })

    it('should return 401 for unauthenticated user', async () => {
      getServerSession.mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/pdf/generate', {
        method: 'POST',
        body: JSON.stringify({
          type: 'pension',
          data: mockPensionData
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Authentication required')
    })

    it('should return 403 for user without premium subscription', async () => {
      getServerSession.mockResolvedValue(mockSession)
      prisma.user.findUnique.mockResolvedValue({
        ...mockUser,
        subscriptionStatus: 'inactive'
      })
      isSubscriptionActive.mockReturnValue(false)

      const request = new NextRequest('http://localhost:3000/api/pdf/generate', {
        method: 'POST',
        body: JSON.stringify({
          type: 'pension',
          data: mockPensionData
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.error).toBe('Premium subscription required for PDF generation')
      expect(data.upgradeUrl).toBe('/subscribe')
    })

    it('should return 400 for invalid PDF type', async () => {
      getServerSession.mockResolvedValue(mockSession)
      prisma.user.findUnique.mockResolvedValue(mockUser)
      isSubscriptionActive.mockReturnValue(true)

      const request = new NextRequest('http://localhost:3000/api/pdf/generate', {
        method: 'POST',
        body: JSON.stringify({
          type: 'invalid-type',
          data: mockPensionData
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('Invalid PDF type')
    })

    it('should return 400 for missing data', async () => {
      getServerSession.mockResolvedValue(mockSession)
      prisma.user.findUnique.mockResolvedValue(mockUser)
      isSubscriptionActive.mockReturnValue(true)

      const request = new NextRequest('http://localhost:3000/api/pdf/generate', {
        method: 'POST',
        body: JSON.stringify({
          type: 'pension'
          // Missing data field
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('PDF data is required')
    })

    it('should handle PDF generation timeout', async () => {
      getServerSession.mockResolvedValue(mockSession)
      prisma.user.findUnique.mockResolvedValue(mockUser)
      isSubscriptionActive.mockReturnValue(true)

      // Mock PDF service to throw timeout error
      const { PDFService } = require('@/lib/pdf/pdf-service')
      PDFService.getInstance().generatePDF.mockRejectedValue(new Error('timeout'))

      const request = new NextRequest('http://localhost:3000/api/pdf/generate', {
        method: 'POST',
        body: JSON.stringify({
          type: 'pension',
          data: mockPensionData
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(408)
      expect(data.error).toBe('PDF generation timed out. Please try again.')
    })

    it('should handle memory constraints error', async () => {
      getServerSession.mockResolvedValue(mockSession)
      prisma.user.findUnique.mockResolvedValue(mockUser)
      isSubscriptionActive.mockReturnValue(true)

      // Mock PDF service to throw memory error
      const { PDFService } = require('@/lib/pdf/pdf-service')
      PDFService.getInstance().generatePDF.mockRejectedValue(new Error('memory'))

      const request = new NextRequest('http://localhost:3000/api/pdf/generate', {
        method: 'POST',
        body: JSON.stringify({
          type: 'pension',
          data: mockPensionData
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(507)
      expect(data.error).toBe('PDF generation failed due to memory constraints.')
    })

    it('should log PDF generation for analytics', async () => {
      getServerSession.mockResolvedValue(mockSession)
      prisma.user.findUnique.mockResolvedValue(mockUser)
      isSubscriptionActive.mockReturnValue(true)
      prisma.pdfGeneration.create.mockResolvedValue({})

      const request = new NextRequest('http://localhost:3000/api/pdf/generate', {
        method: 'POST',
        body: JSON.stringify({
          type: 'pension',
          data: mockPensionData
        })
      })

      await POST(request)

      expect(prisma.pdfGeneration.create).toHaveBeenCalledWith({
        data: {
          userId: mockUser.id,
          type: 'pension',
          size: 1024
        }
      })
    })
  })

  describe('GET /api/pdf/generate', () => {
    const mockUser = {
      id: 'user-123',
      email: 'john@example.com',
      subscriptionStatus: 'active'
    }

    const mockSession = {
      user: {
        email: 'john@example.com'
      }
    }

    it('should return PDF generation status for premium user', async () => {
      getServerSession.mockResolvedValue(mockSession)
      prisma.user.findUnique.mockResolvedValue(mockUser)
      isSubscriptionActive.mockReturnValue(true)
      prisma.pdfGeneration.count.mockResolvedValue(5)

      const request = new NextRequest('http://localhost:3000/api/pdf/generate', {
        method: 'GET'
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.canGenerate).toBe(true)
      expect(data.subscriptionActive).toBe(true)
      expect(data.limits.monthly).toBe(-1) // Unlimited for premium
      expect(data.limits.current).toBe(5)
      expect(data.limits.remaining).toBe(-1)
      expect(data.supportedTypes).toEqual(['pension', 'tax', 'wizard', 'combined'])
    })

    it('should return PDF generation status for free user', async () => {
      getServerSession.mockResolvedValue(mockSession)
      prisma.user.findUnique.mockResolvedValue({
        ...mockUser,
        subscriptionStatus: 'inactive'
      })
      isSubscriptionActive.mockReturnValue(false)
      prisma.pdfGeneration.count.mockResolvedValue(0)

      const request = new NextRequest('http://localhost:3000/api/pdf/generate', {
        method: 'GET'
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.canGenerate).toBe(false)
      expect(data.subscriptionActive).toBe(false)
      expect(data.limits.monthly).toBe(0)
      expect(data.limits.current).toBe(0)
      expect(data.limits.remaining).toBe(0)
    })

    it('should return 401 for unauthenticated user', async () => {
      getServerSession.mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/pdf/generate', {
        method: 'GET'
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Authentication required')
    })

    it('should return 404 for non-existent user', async () => {
      getServerSession.mockResolvedValue(mockSession)
      prisma.user.findUnique.mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/pdf/generate', {
        method: 'GET'
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('User not found')
    })
  })

  describe('Performance Requirements', () => {
    it('should complete PDF generation within 2 seconds', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'john@example.com',
        subscriptionStatus: 'active'
      }

      const mockSession = {
        user: {
          email: 'john@example.com'
        }
      }

      getServerSession.mockResolvedValue(mockSession)
      prisma.user.findUnique.mockResolvedValue(mockUser)
      isSubscriptionActive.mockReturnValue(true)
      prisma.pdfGeneration.create.mockResolvedValue({})

      const request = new NextRequest('http://localhost:3000/api/pdf/generate', {
        method: 'POST',
        body: JSON.stringify({
          type: 'pension',
          data: {
            monthlyPension: 4000,
            annualPension: 48000
          }
        })
      })

      const startTime = Date.now()
      await POST(request)
      const endTime = Date.now()

      expect(endTime - startTime).toBeLessThan(2000) // 2 seconds
    })
  })
})
