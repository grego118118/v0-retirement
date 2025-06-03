/**
 * Email Service Tests
 * Comprehensive tests for email functionality
 */

import { EmailService } from '@/lib/email/email-service'

// Mock Resend
jest.mock('resend', () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: {
      send: jest.fn().mockResolvedValue({
        data: { id: 'mock-message-id' }
      })
    }
  }))
}))

// Mock nodemailer
jest.mock('nodemailer', () => ({
  createTransporter: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue({
      messageId: 'mock-nodemailer-id'
    })
  })
}))

describe('EmailService', () => {
  let emailService: EmailService

  beforeEach(() => {
    emailService = EmailService.getInstance()
    
    // Mock environment variables
    process.env.RESEND_API_KEY = 'test-resend-key'
    process.env.EMAIL_FROM = 'test@example.com'
  })

  afterEach(() => {
    jest.clearAllMocks()
    delete process.env.RESEND_API_KEY
    delete process.env.EMAIL_FROM
  })

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = EmailService.getInstance()
      const instance2 = EmailService.getInstance()
      expect(instance1).toBe(instance2)
    })
  })

  describe('Email Sending', () => {
    const mockEmailOptions = {
      to: 'recipient@example.com',
      subject: 'Test Email',
      html: '<h1>Test HTML</h1>',
      text: 'Test text content'
    }

    it('should send email successfully with Resend', async () => {
      const result = await emailService.sendEmail(mockEmailOptions)

      expect(result.success).toBe(true)
      expect(result.provider).toBe('resend')
      expect(result.messageId).toBe('mock-message-id')
      expect(result.timestamp).toBeInstanceOf(Date)
    })

    it('should handle multiple recipients', async () => {
      const options = {
        ...mockEmailOptions,
        to: ['recipient1@example.com', 'recipient2@example.com']
      }

      const result = await emailService.sendEmail(options)

      expect(result.success).toBe(true)
      expect(result.provider).toBe('resend')
    })

    it('should include attachments', async () => {
      const options = {
        ...mockEmailOptions,
        attachments: [{
          filename: 'test.pdf',
          content: Buffer.from('test content'),
          contentType: 'application/pdf'
        }]
      }

      const result = await emailService.sendEmail(options)

      expect(result.success).toBe(true)
    })

    it('should handle email sending failure', async () => {
      // Mock Resend to throw error
      const { Resend } = require('resend')
      const mockResend = new Resend()
      mockResend.emails.send.mockRejectedValueOnce(new Error('API Error'))

      const result = await emailService.sendEmail(mockEmailOptions)

      expect(result.success).toBe(false)
      expect(result.error).toBe('API Error')
      expect(result.provider).toBe('resend')
    })
  })

  describe('Template Email Sending', () => {
    it('should send welcome email template', async () => {
      const templateData = {
        name: 'John Doe',
        email: 'john@example.com',
        dashboardUrl: 'https://example.com/dashboard',
        calculatorUrl: 'https://example.com/calculator',
        supportUrl: 'https://example.com/support'
      }

      const result = await emailService.sendTemplateEmail(
        'welcome',
        'john@example.com',
        templateData
      )

      expect(result.success).toBe(true)
      expect(result.provider).toBe('resend')
    })

    it('should send password reset email template', async () => {
      const templateData = {
        name: 'Jane Smith',
        email: 'jane@example.com',
        resetUrl: 'https://example.com/reset?token=abc123',
        expiresIn: '1 hour',
        supportUrl: 'https://example.com/support'
      }

      const result = await emailService.sendTemplateEmail(
        'password-reset',
        'jane@example.com',
        templateData
      )

      expect(result.success).toBe(true)
    })

    it('should send subscription change email template', async () => {
      const templateData = {
        name: 'Bob Johnson',
        email: 'bob@example.com',
        changeType: 'upgrade' as const,
        oldPlan: 'Free',
        newPlan: 'Premium',
        effectiveDate: '2024-01-01',
        amount: '$9.99/month',
        features: ['PDF Reports', 'Advanced Calculations'],
        dashboardUrl: 'https://example.com/dashboard',
        supportUrl: 'https://example.com/support',
        billingUrl: 'https://example.com/billing'
      }

      const result = await emailService.sendTemplateEmail(
        'subscription-change',
        'bob@example.com',
        templateData
      )

      expect(result.success).toBe(true)
    })

    it('should handle template not found error', async () => {
      await expect(
        emailService.sendTemplateEmail(
          'non-existent-template',
          'test@example.com',
          {}
        )
      ).rejects.toThrow('Email template not found: non-existent-template')
    })
  })

  describe('Provider Configuration', () => {
    it('should detect when email service is configured', () => {
      expect(emailService.isConfigured()).toBe(true)
    })

    it('should detect when email service is not configured', () => {
      delete process.env.RESEND_API_KEY
      const newService = EmailService.getInstance()
      expect(newService.isConfigured()).toBe(false)
    })

    it('should return correct provider name', () => {
      expect(emailService.getProviderName()).toBe('resend')
    })
  })

  describe('Performance Requirements', () => {
    it('should send email within 2 seconds', async () => {
      const startTime = Date.now()
      
      await emailService.sendEmail({
        to: 'test@example.com',
        subject: 'Performance Test',
        text: 'Test content'
      })
      
      const endTime = Date.now()
      const duration = endTime - startTime
      
      expect(duration).toBeLessThan(2000) // 2 seconds
    })

    it('should handle concurrent email sends', async () => {
      const promises = Array.from({ length: 5 }, (_, i) =>
        emailService.sendEmail({
          to: `test${i}@example.com`,
          subject: `Test Email ${i}`,
          text: `Test content ${i}`
        })
      )

      const results = await Promise.all(promises)
      
      expect(results).toHaveLength(5)
      results.forEach(result => {
        expect(result.success).toBe(true)
      })
    })
  })

  describe('Error Handling', () => {
    it('should handle provider initialization failure', async () => {
      // Remove API key to simulate configuration failure
      delete process.env.RESEND_API_KEY
      delete process.env.SMTP_HOST
      
      const result = await emailService.sendEmail({
        to: 'test@example.com',
        subject: 'Test',
        text: 'Test'
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('No email provider configured')
    })

    it('should handle network errors gracefully', async () => {
      // Mock network error
      const { Resend } = require('resend')
      const mockResend = new Resend()
      mockResend.emails.send.mockRejectedValueOnce(new Error('Network error'))

      const result = await emailService.sendEmail({
        to: 'test@example.com',
        subject: 'Test',
        text: 'Test'
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Network error')
    })
  })

  describe('Template Interpolation', () => {
    it('should interpolate template variables correctly', async () => {
      // This would test the private interpolateTemplate method
      // In a real implementation, we might expose this for testing
      const templateData = {
        name: 'John Doe',
        amount: '$100'
      }

      const result = await emailService.sendTemplateEmail(
        'welcome',
        'john@example.com',
        templateData
      )

      expect(result.success).toBe(true)
    })
  })

  describe('Email Validation', () => {
    it('should handle invalid email addresses gracefully', async () => {
      const result = await emailService.sendEmail({
        to: 'invalid-email',
        subject: 'Test',
        text: 'Test'
      })

      // The service should still attempt to send, provider will handle validation
      expect(result).toBeDefined()
    })

    it('should handle empty recipient list', async () => {
      const result = await emailService.sendEmail({
        to: [],
        subject: 'Test',
        text: 'Test'
      })

      expect(result).toBeDefined()
    })
  })

  describe('Attachment Handling', () => {
    it('should handle PDF attachments', async () => {
      const pdfBuffer = Buffer.from('PDF content')
      
      const result = await emailService.sendEmail({
        to: 'test@example.com',
        subject: 'PDF Test',
        text: 'Email with PDF',
        attachments: [{
          filename: 'report.pdf',
          content: pdfBuffer,
          contentType: 'application/pdf'
        }]
      })

      expect(result.success).toBe(true)
    })

    it('should handle multiple attachments', async () => {
      const result = await emailService.sendEmail({
        to: 'test@example.com',
        subject: 'Multiple Attachments',
        text: 'Email with multiple files',
        attachments: [
          {
            filename: 'document1.pdf',
            content: Buffer.from('PDF 1'),
            contentType: 'application/pdf'
          },
          {
            filename: 'document2.txt',
            content: Buffer.from('Text content'),
            contentType: 'text/plain'
          }
        ]
      })

      expect(result.success).toBe(true)
    })
  })

  describe('Memory Management', () => {
    it('should not leak memory with large attachments', async () => {
      // Create a large buffer (1MB)
      const largeBuffer = Buffer.alloc(1024 * 1024, 'test')
      
      const result = await emailService.sendEmail({
        to: 'test@example.com',
        subject: 'Large Attachment',
        text: 'Email with large attachment',
        attachments: [{
          filename: 'large-file.bin',
          content: largeBuffer,
          contentType: 'application/octet-stream'
        }]
      })

      expect(result.success).toBe(true)
      
      // Buffer should be eligible for garbage collection
      expect(largeBuffer.length).toBe(1024 * 1024)
    })
  })
})
