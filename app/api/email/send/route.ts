/**
 * Email Sending API Endpoint
 * Handles server-side email sending with authentication and rate limiting
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-options'
import { emailService } from '@/lib/email/email-service'
import { prisma } from '@/lib/prisma'
import { measureAsync } from '@/lib/utils/performance-monitor'
import { rateLimit } from '@/lib/utils/rate-limit'

// Rate limiting: 10 emails per hour per user
const emailRateLimit = rateLimit({
  interval: 60 * 60 * 1000, // 1 hour
  uniqueTokenPerInterval: 500, // Max 500 unique users per hour
})

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Rate limiting
    try {
      await emailRateLimit.check(10, session.user.email) // 10 emails per hour
    } catch {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { 
      template, 
      templateData, 
      to, 
      subject, 
      html, 
      text, 
      attachments,
      type = 'general'
    } = body

    // Validate required fields
    if (!to) {
      return NextResponse.json(
        { error: 'Recipient email address is required' },
        { status: 400 }
      )
    }

    // Validate email addresses
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const recipients = Array.isArray(to) ? to : [to]
    
    for (const email of recipients) {
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { error: `Invalid email address: ${email}` },
          { status: 400 }
        )
      }
    }

    // Get user information
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if email service is configured
    if (!emailService.isConfigured()) {
      return NextResponse.json(
        { error: 'Email service not configured' },
        { status: 503 }
      )
    }

    // Send email with performance monitoring
    const result = await measureAsync('email-send', async () => {
      if (template && templateData) {
        // Send template email
        return await emailService.sendTemplateEmail(
          template,
          to,
          {
            ...templateData,
            senderName: user.name || session.user.name || 'User',
            senderEmail: session.user.email
          }
        )
      } else {
        // Send custom email
        if (!subject || (!html && !text)) {
          throw new Error('Subject and content (html or text) are required for custom emails')
        }

        return await emailService.sendEmail({
          to,
          subject,
          html,
          text,
          attachments
        })
      }
    })

    // Log email send attempt
    await logEmailSend(user.id, type, recipients, result.success)

    if (result.success) {
      return NextResponse.json({
        success: true,
        messageId: result.messageId,
        provider: result.provider,
        timestamp: result.timestamp
      })
    } else {
      return NextResponse.json(
        { 
          error: 'Failed to send email',
          details: result.error 
        },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Email send error:', error)
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Get email sending status and limits
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Get current hour's email count
    const currentHour = new Date()
    currentHour.setMinutes(0, 0, 0)
    
    const emailCount = await prisma.emailLog.count({
      where: {
        userId: user.id,
        createdAt: {
          gte: currentHour
        }
      }
    })

    const isConfigured = emailService.isConfigured()
    const provider = emailService.getProviderName()

    return NextResponse.json({
      configured: isConfigured,
      provider,
      limits: {
        hourly: 10,
        current: emailCount,
        remaining: Math.max(0, 10 - emailCount)
      },
      supportedTemplates: [
        'welcome',
        'password-reset',
        'subscription-change',
        'pdf-share',
        'calculation-results',
        'system-maintenance'
      ]
    })

  } catch (error) {
    console.error('Email status check error:', error)
    return NextResponse.json(
      { error: 'Failed to check email status' },
      { status: 500 }
    )
  }
}

/**
 * Log email send attempt for analytics and rate limiting
 */
async function logEmailSend(
  userId: string, 
  type: string, 
  recipients: string[], 
  success: boolean
): Promise<void> {
  try {
    await prisma.emailLog.create({
      data: {
        userId,
        type,
        recipients: recipients.join(','),
        success,
        createdAt: new Date()
      }
    })
  } catch (error) {
    console.error('Failed to log email send:', error)
    // Don't throw error as this is non-critical
  }
}
