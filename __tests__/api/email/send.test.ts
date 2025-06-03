/**
 * Email Send API Tests
 * Tests for the email sending API endpoint
 */

import { NextRequest } from 'next/server'
import { POST, GET } from '@/app/api/email/send/route'

// Mock dependencies
jest.mock('next-auth', () => ({
  getServerSession: jest.fn()
}))

jest.mock('@/lib/email/email-service', () => ({
  emailService: {
    isConfigured: jest.fn().mockReturnValue(true),
    getProviderName: jest.fn().mockReturnValue('resend'),
    sendEmail: jest.fn().mockResolvedValue({
      success: true,
      messageId: 'mock-message-id',
      provider: 'resend',
      timestamp: new Date()
    }),
    sendTemplateEmail: jest.fn().mockResolvedValue({
      success: true,
      messageId: 'mock-template-id',
      provider: 'resend',
      timestamp: new Date()
    })
  }
}))

jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn()
    },
    emailLog: {
      create: jest.fn(),
      count: jest.fn()
    }
  }
}))

jest.mock('@/lib/utils/rate-limit', () => ({
  rateLimit: jest.fn().mockReturnValue({
    check: jest.fn().mockResolvedValue(undefined)
  })
}))

describe('/api/email/send', () => {
  const { getServerSession } = require('next-auth')
  const { prisma } = require('@/lib/prisma')
  const { emailService } = require('@/lib/email/email-service')

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST /api/email/send', () => {
    const mockUser = {
      id: 'user-123',
      name: 'John Doe',
      email: 'john@example.com'
    }

    const mockSession = {
      user: {
        email: 'john@example.com',
        name: 'John Doe'
      }
    }

    it('should send custom email successfully', async () => {
      getServerSession.mockResolvedValue(mockSession)
      prisma.user.findUnique.mockResolvedValue(mockUser)
      prisma.emailLog.create.mockResolvedValue({})

      const request = new NextRequest('http://localhost:3000/api/email/send', {
        method: 'POST',
        body: JSON.stringify({
          to: 'recipient@example.com',
          subject: 'Test Email',
          html: '<h1>Test</h1>',
          text: 'Test content',
          type: 'test'
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.messageId).toBe('mock-message-id')
      expect(data.provider).toBe('resend')
    })

    it('should send template email successfully', async () => {
      getServerSession.mockResolvedValue(mockSession)
      prisma.user.findUnique.mockResolvedValue(mockUser)
      prisma.emailLog.create.mockResolvedValue({})

      const request = new NextRequest('http://localhost:3000/api/email/send', {
        method: 'POST',
        body: JSON.stringify({
          template: 'welcome',
          templateData: {
            name: 'John Doe',
            dashboardUrl: 'https://example.com/dashboard'
          },
          to: 'john@example.com',
          type: 'welcome'
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(emailService.sendTemplateEmail).toHaveBeenCalledWith(
        'welcome',
        'john@example.com',
        expect.objectContaining({
          name: 'John Doe',
          senderName: 'John Doe',
          senderEmail: 'john@example.com'
        })
      )
    })

    it('should return 401 for unauthenticated user', async () => {
      getServerSession.mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/email/send', {
        method: 'POST',
        body: JSON.stringify({
          to: 'test@example.com',
          subject: 'Test',
          text: 'Test'
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Authentication required')
    })

    it('should return 400 for missing recipient', async () => {
      getServerSession.mockResolvedValue(mockSession)
      prisma.user.findUnique.mockResolvedValue(mockUser)

      const request = new NextRequest('http://localhost:3000/api/email/send', {
        method: 'POST',
        body: JSON.stringify({
          subject: 'Test',
          text: 'Test'
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Recipient email address is required')
    })

    it('should return 400 for invalid email address', async () => {
      getServerSession.mockResolvedValue(mockSession)
      prisma.user.findUnique.mockResolvedValue(mockUser)

      const request = new NextRequest('http://localhost:3000/api/email/send', {
        method: 'POST',
        body: JSON.stringify({
          to: 'invalid-email',
          subject: 'Test',
          text: 'Test'
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('Invalid email address')
    })

    it('should return 429 for rate limit exceeded', async () => {
      getServerSession.mockResolvedValue(mockSession)
      
      // Mock rate limit to throw error
      const { rateLimit } = require('@/lib/utils/rate-limit')
      const mockRateLimit = rateLimit()
      mockRateLimit.check.mockRejectedValueOnce(new Error('Rate limit exceeded'))

      const request = new NextRequest('http://localhost:3000/api/email/send', {
        method: 'POST',
        body: JSON.stringify({
          to: 'test@example.com',
          subject: 'Test',
          text: 'Test'
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(429)
      expect(data.error).toBe('Rate limit exceeded. Please try again later.')
    })

    it('should return 503 when email service not configured', async () => {
      getServerSession.mockResolvedValue(mockSession)
      prisma.user.findUnique.mockResolvedValue(mockUser)
      emailService.isConfigured.mockReturnValue(false)

      const request = new NextRequest('http://localhost:3000/api/email/send', {
        method: 'POST',
        body: JSON.stringify({
          to: 'test@example.com',
          subject: 'Test',
          text: 'Test'
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(503)
      expect(data.error).toBe('Email service not configured')
    })

    it('should handle email sending failure', async () => {
      getServerSession.mockResolvedValue(mockSession)
      prisma.user.findUnique.mockResolvedValue(mockUser)
      emailService.sendEmail.mockResolvedValueOnce({
        success: false,
        error: 'SMTP Error',
        provider: 'resend',
        timestamp: new Date()
      })

      const request = new NextRequest('http://localhost:3000/api/email/send', {
        method: 'POST',
        body: JSON.stringify({
          to: 'test@example.com',
          subject: 'Test',
          text: 'Test'
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to send email')
      expect(data.details).toBe('SMTP Error')
    })

    it('should validate custom email requirements', async () => {
      getServerSession.mockResolvedValue(mockSession)
      prisma.user.findUnique.mockResolvedValue(mockUser)

      const request = new NextRequest('http://localhost:3000/api/email/send', {
        method: 'POST',
        body: JSON.stringify({
          to: 'test@example.com'
          // Missing subject and content
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to send email')
    })
  })

  describe('GET /api/email/send', () => {
    const mockUser = {
      id: 'user-123',
      email: 'john@example.com'
    }

    const mockSession = {
      user: {
        email: 'john@example.com'
      }
    }

    it('should return email status successfully', async () => {
      getServerSession.mockResolvedValue(mockSession)
      prisma.user.findUnique.mockResolvedValue(mockUser)
      prisma.emailLog.count.mockResolvedValue(3)

      const request = new NextRequest('http://localhost:3000/api/email/send', {
        method: 'GET'
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.configured).toBe(true)
      expect(data.provider).toBe('resend')
      expect(data.limits.hourly).toBe(10)
      expect(data.limits.current).toBe(3)
      expect(data.limits.remaining).toBe(7)
      expect(data.supportedTemplates).toContain('welcome')
    })

    it('should return 401 for unauthenticated user', async () => {
      getServerSession.mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/email/send', {
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

      const request = new NextRequest('http://localhost:3000/api/email/send', {
        method: 'GET'
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('User not found')
    })
  })

  describe('Performance Requirements', () => {
    it('should complete email sending within 2 seconds', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'john@example.com'
      }

      const mockSession = {
        user: {
          email: 'john@example.com'
        }
      }

      getServerSession.mockResolvedValue(mockSession)
      prisma.user.findUnique.mockResolvedValue(mockUser)
      prisma.emailLog.create.mockResolvedValue({})

      const request = new NextRequest('http://localhost:3000/api/email/send', {
        method: 'POST',
        body: JSON.stringify({
          to: 'test@example.com',
          subject: 'Performance Test',
          text: 'Test content'
        })
      })

      const startTime = Date.now()
      await POST(request)
      const endTime = Date.now()

      expect(endTime - startTime).toBeLessThan(2000) // 2 seconds
    })
  })

  describe('Email Logging', () => {
    it('should log successful email sends', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'john@example.com'
      }

      const mockSession = {
        user: {
          email: 'john@example.com'
        }
      }

      getServerSession.mockResolvedValue(mockSession)
      prisma.user.findUnique.mockResolvedValue(mockUser)
      prisma.emailLog.create.mockResolvedValue({})

      const request = new NextRequest('http://localhost:3000/api/email/send', {
        method: 'POST',
        body: JSON.stringify({
          to: 'test@example.com',
          subject: 'Test',
          text: 'Test',
          type: 'test'
        })
      })

      await POST(request)

      expect(prisma.emailLog.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-123',
          type: 'test',
          recipients: 'test@example.com',
          success: true,
          createdAt: expect.any(Date)
        }
      })
    })

    it('should log failed email sends', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'john@example.com'
      }

      const mockSession = {
        user: {
          email: 'john@example.com'
        }
      }

      getServerSession.mockResolvedValue(mockSession)
      prisma.user.findUnique.mockResolvedValue(mockUser)
      prisma.emailLog.create.mockResolvedValue({})
      emailService.sendEmail.mockResolvedValueOnce({
        success: false,
        error: 'Send failed',
        provider: 'resend',
        timestamp: new Date()
      })

      const request = new NextRequest('http://localhost:3000/api/email/send', {
        method: 'POST',
        body: JSON.stringify({
          to: 'test@example.com',
          subject: 'Test',
          text: 'Test',
          type: 'test'
        })
      })

      await POST(request)

      expect(prisma.emailLog.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-123',
          type: 'test',
          recipients: 'test@example.com',
          success: false,
          createdAt: expect.any(Date)
        }
      })
    })
  })
})
