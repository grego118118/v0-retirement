/**
 * Email Service
 * Handles email sending with multiple provider support (Resend, SendGrid, Nodemailer)
 */

import { Resend } from 'resend'
import nodemailer from 'nodemailer'
import { measureAsync } from '@/lib/utils/performance-monitor'

export interface EmailOptions {
  to: string | string[]
  subject: string
  html?: string
  text?: string
  from?: string
  replyTo?: string
  attachments?: EmailAttachment[]
  template?: string
  templateData?: Record<string, any>
}

export interface EmailAttachment {
  filename: string
  content: Buffer | string
  contentType?: string
  cid?: string // For inline attachments
}

export interface EmailResult {
  success: boolean
  messageId?: string
  error?: string
  provider: string
  timestamp: Date
}

export interface EmailProvider {
  name: string
  sendEmail(options: EmailOptions): Promise<EmailResult>
  isConfigured(): boolean
}

/**
 * Resend Email Provider
 */
class ResendProvider implements EmailProvider {
  name = 'resend'
  private client: Resend | null = null

  constructor() {
    if (process.env.RESEND_API_KEY) {
      this.client = new Resend(process.env.RESEND_API_KEY)
    }
  }

  isConfigured(): boolean {
    return Boolean(process.env.RESEND_API_KEY && this.client)
  }

  async sendEmail(options: EmailOptions): Promise<EmailResult> {
    if (!this.client) {
      return {
        success: false,
        error: 'Resend client not configured',
        provider: this.name,
        timestamp: new Date()
      }
    }

    try {
      const result = await this.client.emails.send({
        from: options.from || process.env.EMAIL_FROM || 'noreply@maretirement.com',
        to: Array.isArray(options.to) ? options.to : [options.to],
        subject: options.subject,
        html: options.html,
        text: options.text || options.subject,
        replyTo: options.replyTo,
        attachments: options.attachments?.map(att => ({
          filename: att.filename,
          content: att.content,
          content_type: att.contentType
        }))
      })

      return {
        success: true,
        messageId: result.data?.id,
        provider: this.name,
        timestamp: new Date()
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        provider: this.name,
        timestamp: new Date()
      }
    }
  }
}

/**
 * Nodemailer SMTP Provider (fallback)
 */
class NodemailerProvider implements EmailProvider {
  name = 'nodemailer'
  private transporter: nodemailer.Transporter | null = null

  constructor() {
    if (this.isConfigured()) {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD
        }
      })
    }
  }

  isConfigured(): boolean {
    return Boolean(
      process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASSWORD
    )
  }

  async sendEmail(options: EmailOptions): Promise<EmailResult> {
    if (!this.transporter) {
      return {
        success: false,
        error: 'SMTP transporter not configured',
        provider: this.name,
        timestamp: new Date()
      }
    }

    try {
      const result = await this.transporter.sendMail({
        from: options.from || process.env.EMAIL_FROM || 'noreply@maretirement.com',
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
        replyTo: options.replyTo,
        attachments: options.attachments?.map(att => ({
          filename: att.filename,
          content: att.content,
          contentType: att.contentType,
          cid: att.cid
        }))
      })

      return {
        success: true,
        messageId: result.messageId,
        provider: this.name,
        timestamp: new Date()
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        provider: this.name,
        timestamp: new Date()
      }
    }
  }
}

/**
 * Main Email Service with provider fallback
 */
export class EmailService {
  private static instance: EmailService
  private providers: EmailProvider[]
  private primaryProvider: EmailProvider | null = null

  private constructor() {
    this.providers = [
      new ResendProvider(),
      new NodemailerProvider()
    ]

    // Set primary provider to the first configured one
    this.primaryProvider = this.providers.find(p => p.isConfigured()) || null
  }

  static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService()
    }
    return EmailService.instance
  }

  /**
   * Send email with automatic provider fallback
   */
  async sendEmail(options: EmailOptions): Promise<EmailResult> {
    return measureAsync('email-send', async () => {
      if (!this.primaryProvider) {
        return {
          success: false,
          error: 'No email provider configured',
          provider: 'none',
          timestamp: new Date()
        }
      }

      // Try primary provider first
      let result = await this.primaryProvider.sendEmail(options)
      
      if (result.success) {
        await this.logEmailSent(options, result)
        return result
      }

      // Try fallback providers
      for (const provider of this.providers) {
        if (provider === this.primaryProvider || !provider.isConfigured()) {
          continue
        }

        console.warn(`Primary provider ${this.primaryProvider.name} failed, trying ${provider.name}`)
        result = await provider.sendEmail(options)
        
        if (result.success) {
          await this.logEmailSent(options, result)
          return result
        }
      }

      // All providers failed
      console.error('All email providers failed:', result.error)
      await this.logEmailError(options, result)
      return result
    })
  }

  /**
   * Send email with template
   */
  async sendTemplateEmail(
    templateName: string,
    to: string | string[],
    templateData: Record<string, any>,
    options: Partial<EmailOptions> = {}
  ): Promise<EmailResult> {
    const template = await this.getEmailTemplate(templateName, templateData)
    
    return this.sendEmail({
      to,
      subject: template.subject,
      html: template.html,
      text: template.text,
      ...options
    })
  }

  /**
   * Get email template with data interpolation
   */
  private async getEmailTemplate(
    templateName: string,
    data: Record<string, any>
  ): Promise<{ subject: string; html: string; text: string }> {
    // Import template dynamically
    try {
      const templateModule = await import(`@/lib/email/templates/${templateName}`)
      const template = templateModule.default || templateModule
      
      if (typeof template === 'function') {
        return template(data)
      }
      
      // Static template with interpolation
      return {
        subject: this.interpolateTemplate(template.subject, data),
        html: this.interpolateTemplate(template.html, data),
        text: this.interpolateTemplate(template.text, data)
      }
    } catch (error) {
      console.error(`Failed to load email template: ${templateName}`, error)
      throw new Error(`Email template not found: ${templateName}`)
    }
  }

  /**
   * Simple template interpolation
   */
  private interpolateTemplate(template: string, data: Record<string, any>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return data[key] || match
    })
  }

  /**
   * Check if email service is configured
   */
  isConfigured(): boolean {
    return this.primaryProvider !== null
  }

  /**
   * Get configured provider name
   */
  getProviderName(): string {
    return this.primaryProvider?.name || 'none'
  }

  /**
   * Log successful email send
   */
  private async logEmailSent(options: EmailOptions, result: EmailResult): Promise<void> {
    try {
      // Log to database or analytics service
      console.log('Email sent successfully:', {
        to: options.to,
        subject: options.subject,
        provider: result.provider,
        messageId: result.messageId
      })
    } catch (error) {
      console.error('Failed to log email send:', error)
    }
  }

  /**
   * Log email error
   */
  private async logEmailError(options: EmailOptions, result: EmailResult): Promise<void> {
    try {
      console.error('Email send failed:', {
        to: options.to,
        subject: options.subject,
        provider: result.provider,
        error: result.error
      })
    } catch (error) {
      console.error('Failed to log email error:', error)
    }
  }
}

// Export singleton instance
export const emailService = EmailService.getInstance()
