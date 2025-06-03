/**
 * PDF Generation API Endpoint
 * Handles server-side PDF generation for pension calculations, tax reports, and wizard results
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-config'
import { PDFService, PDFGenerationOptions } from '@/lib/pdf/pdf-service'
import { isSubscriptionActive } from '@/lib/stripe/config'
import { prisma } from '@/lib/prisma'
import { measureAsync } from '@/lib/utils/performance-monitor'

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

    // Check subscription status for PDF generation
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user || !user.subscriptionStatus || !isSubscriptionActive(user.subscriptionStatus as any)) {
      return NextResponse.json(
        { 
          error: 'Premium subscription required for PDF generation',
          upgradeUrl: '/subscribe'
        },
        { status: 403 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { type, data, options = {} } = body

    // Validate PDF type
    const validTypes = ['pension', 'tax', 'wizard', 'combined']
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: `Invalid PDF type. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      )
    }

    // Validate data
    if (!data) {
      return NextResponse.json(
        { error: 'PDF data is required' },
        { status: 400 }
      )
    }

    // Prepare PDF generation options
    const pdfOptions: PDFGenerationOptions = {
      type,
      data,
      userInfo: {
        name: user.name || session.user.name || undefined,
        email: session.user.email,
        generatedAt: new Date()
      },
      branding: {
        organizationName: 'Massachusetts Retirement System',
        disclaimer: 'This is an estimate. Please consult official sources for final calculations.',
        ...options.branding
      }
    }

    // Generate PDF with performance monitoring
    const pdfResult = await measureAsync('pdf-generation', async () => {
      const pdfService = PDFService.getInstance()
      return await pdfService.generatePDF(pdfOptions)
    })

    // Log PDF generation for analytics
    await logPDFGeneration(user.id, type, pdfResult.size)

    // Return PDF as response
    return new NextResponse(pdfResult.buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${pdfResult.filename}"`,
        'Content-Length': pdfResult.size.toString(),
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })

  } catch (error) {
    console.error('PDF generation error:', error)
    
    // Return appropriate error response
    if (error instanceof Error) {
      if (error.message.includes('timeout')) {
        return NextResponse.json(
          { error: 'PDF generation timed out. Please try again.' },
          { status: 408 }
        )
      }
      
      if (error.message.includes('memory')) {
        return NextResponse.json(
          { error: 'PDF generation failed due to memory constraints.' },
          { status: 507 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Failed to generate PDF. Please try again later.' },
      { status: 500 }
    )
  }
}

/**
 * Get PDF generation status and limits
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
    const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM format

    // Get current month's PDF generation count
    const pdfCount = await prisma.pdfGeneration.count({
      where: {
        userId: user.id,
        createdAt: {
          gte: new Date(`${currentMonth}-01`),
          lt: new Date(new Date(`${currentMonth}-01`).setMonth(new Date(`${currentMonth}-01`).getMonth() + 1))
        }
      }
    })

    const limits = {
      monthly: isActive ? -1 : 0, // -1 means unlimited for premium users
      current: pdfCount,
      remaining: isActive ? -1 : Math.max(0, 0 - pdfCount)
    }

    return NextResponse.json({
      canGenerate: isActive,
      subscriptionActive: isActive,
      limits,
      supportedTypes: ['pension', 'tax', 'wizard', 'combined']
    })

  } catch (error) {
    console.error('PDF status check error:', error)
    return NextResponse.json(
      { error: 'Failed to check PDF generation status' },
      { status: 500 }
    )
  }
}

/**
 * Log PDF generation for analytics and usage tracking
 */
async function logPDFGeneration(userId: string, type: string, size: number): Promise<void> {
  try {
    await prisma.pdfGeneration.create({
      data: {
        userId,
        type,
        size,
        createdAt: new Date()
      }
    })
  } catch (error) {
    console.error('Failed to log PDF generation:', error)
    // Don't throw error as this is non-critical
  }
}

/**
 * Validate PDF data based on type
 */
function validatePDFData(type: string, data: any): boolean {
  switch (type) {
    case 'pension':
      return data.monthlyPension !== undefined && data.annualPension !== undefined
    
    case 'tax':
      return data.grossIncome !== undefined && data.totalTax !== undefined
    
    case 'wizard':
      return data.personalInfo !== undefined && data.pensionData !== undefined
    
    case 'combined':
      return data.personalInfo !== undefined && 
             data.pensionData !== undefined && 
             data.socialSecurityData !== undefined
    
    default:
      return false
  }
}
