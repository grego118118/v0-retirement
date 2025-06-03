/**
 * PDF Sharing Email API Endpoint
 * Handles sharing PDF reports via email with attachments
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-config'
import { emailService } from '@/lib/email/email-service'
import { PDFService } from '@/lib/pdf/pdf-service'
import { prisma } from '@/lib/prisma'
import { isSubscriptionActive } from '@/lib/stripe/config'
import { measureAsync } from '@/lib/utils/performance-monitor'
import { rateLimit } from '@/lib/utils/rate-limit'

// Rate limiting: 5 PDF shares per hour per user
const pdfShareRateLimit = rateLimit({
  interval: 60 * 60 * 1000, // 1 hour
  uniqueTokenPerInterval: 500,
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
      await pdfShareRateLimit.check(5, session.user.email) // 5 shares per hour
    } catch {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { 
      recipients, 
      message, 
      pdfData, 
      pdfType,
      reportTitle 
    } = body

    // Validate required fields
    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json(
        { error: 'At least one recipient email is required' },
        { status: 400 }
      )
    }

    if (!pdfData || !pdfType) {
      return NextResponse.json(
        { error: 'PDF data and type are required' },
        { status: 400 }
      )
    }

    // Validate email addresses
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
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

    // Check subscription status for PDF sharing
    if (!user.subscriptionStatus || !isSubscriptionActive(user.subscriptionStatus as any)) {
      return NextResponse.json(
        { 
          error: 'Premium subscription required for PDF sharing',
          upgradeUrl: '/subscribe'
        },
        { status: 403 }
      )
    }

    // Check if email service is configured
    if (!emailService.isConfigured()) {
      return NextResponse.json(
        { error: 'Email service not configured' },
        { status: 503 }
      )
    }

    // Generate PDF and send emails with performance monitoring
    const result = await measureAsync('pdf-share-email', async () => {
      // Generate PDF
      const pdfService = PDFService.getInstance()
      const pdfResult = await pdfService.generatePDF({
        type: pdfType,
        data: pdfData,
        userInfo: {
          name: user.name || session.user.name || undefined,
          email: session.user.email || undefined,
          generatedAt: new Date()
        }
      })

      // Prepare email data
      const emailData = {
        senderName: user.name || session.user.name || 'User',
        senderEmail: session.user.email,
        message: message || '',
        reportType: pdfType,
        reportTitle: reportTitle || `${pdfType.charAt(0).toUpperCase() + pdfType.slice(1)} Report`,
        generatedDate: new Date().toLocaleDateString(),
        calculatorUrl: `${process.env.NEXTAUTH_URL}/calculator`,
        supportUrl: `${process.env.NEXTAUTH_URL}/contact`
      }

      // Send emails to all recipients
      const emailResults = []
      
      for (const recipient of recipients) {
        try {
          const emailResult = await emailService.sendTemplateEmail(
            'pdf-share',
            recipient,
            {
              ...emailData,
              recipientName: recipient.split('@')[0] // Simple name extraction
            },
            {
              attachments: [{
                filename: pdfResult.filename,
                content: pdfResult.buffer,
                contentType: 'application/pdf'
              }]
            }
          )
          
          emailResults.push({
            recipient,
            success: emailResult.success,
            messageId: emailResult.messageId,
            error: emailResult.error
          })
        } catch (error) {
          emailResults.push({
            recipient,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          })
        }
      }

      return {
        pdfGenerated: true,
        pdfSize: pdfResult.size,
        emailResults
      }
    })

    // Log PDF share
    await logPDFShare(user.id, pdfType, recipients, result.emailResults)

    // Check if any emails were successful
    const successfulEmails = result.emailResults.filter(r => r.success)
    const failedEmails = result.emailResults.filter(r => !r.success)

    if (successfulEmails.length === 0) {
      return NextResponse.json(
        { 
          error: 'Failed to send emails to any recipients',
          details: failedEmails.map(e => ({ recipient: e.recipient, error: e.error }))
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      pdfGenerated: result.pdfGenerated,
      pdfSize: result.pdfSize,
      emailsSent: successfulEmails.length,
      totalRecipients: recipients.length,
      successfulEmails: successfulEmails.map(e => ({
        recipient: e.recipient,
        messageId: e.messageId
      })),
      failedEmails: failedEmails.length > 0 ? failedEmails.map(e => ({
        recipient: e.recipient,
        error: e.error
      })) : undefined
    })

  } catch (error) {
    console.error('PDF share email error:', error)
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Get PDF sharing status and limits
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

    const isActive = user.subscriptionStatus ? isSubscriptionActive(user.subscriptionStatus as any) : false
    
    // Get current hour's share count
    const currentHour = new Date()
    currentHour.setMinutes(0, 0, 0)
    
    const shareCount = await prisma.pdfShare.count({
      where: {
        userId: user.id,
        createdAt: {
          gte: currentHour
        }
      }
    })

    return NextResponse.json({
      canShare: isActive && emailService.isConfigured(),
      subscriptionActive: isActive,
      emailConfigured: emailService.isConfigured(),
      limits: {
        hourly: isActive ? 5 : 0,
        current: shareCount,
        remaining: isActive ? Math.max(0, 5 - shareCount) : 0
      },
      supportedTypes: ['pension', 'tax', 'wizard', 'combined']
    })

  } catch (error) {
    console.error('PDF share status check error:', error)
    return NextResponse.json(
      { error: 'Failed to check PDF share status' },
      { status: 500 }
    )
  }
}

/**
 * Log PDF share for analytics and usage tracking
 */
async function logPDFShare(
  userId: string, 
  pdfType: string, 
  recipients: string[], 
  emailResults: any[]
): Promise<void> {
  try {
    const successfulShares = emailResults.filter(r => r.success).length
    
    await prisma.pdfShare.create({
      data: {
        userId,
        pdfType,
        recipients: recipients.join(','),
        recipientCount: recipients.length,
        successfulShares,
        createdAt: new Date()
      }
    })
  } catch (error) {
    console.error('Failed to log PDF share:', error)
    // Don't throw error as this is non-critical
  }
}
