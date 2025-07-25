import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-options'
import {
  generatePensionCalculationPDF,
  generateCombinedRetirementPDF,
  PensionCalculationData,
  CombinedCalculationData,
  PDFGenerationOptions
} from '@/lib/pdf/pdf-generator'
import { canAccessFeature, isUserPremium } from '@/lib/stripe/config'
import { getUserSubscriptionInfo } from '@/lib/subscription-utils'

export async function POST(request: NextRequest) {
  try {
    // Get user session
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      console.log(`🔄 PDF Generation: Unauthenticated user attempting PDF generation`)
      return NextResponse.json(
        {
          error: 'Authentication required',
          redirectTo: '/pricing?feature=pdf-reports',
          message: 'Please sign up to access PDF generation features'
        },
        { status: 401 }
      )
    }

    console.log(`🔄 PDF Generation: Starting for user ${session.user.email}`)

    // Get comprehensive subscription information
    const subscriptionInfo = await getUserSubscriptionInfo(session.user.email)
    console.log(`📊 PDF Generation: Subscription info:`, subscriptionInfo)

    // Check premium access using the proper userType
    const featureCheck = canAccessFeature(subscriptionInfo.userType, 'pdf_reports', 0)
    console.log(`🔍 PDF Generation: Feature check result:`, featureCheck)

    if (!featureCheck.hasAccess) {
      console.log(`❌ PDF Generation: Access denied for ${session.user.email}`, {
        userType: subscriptionInfo.userType,
        isPremium: subscriptionInfo.isPremium,
        featureCheck
      })
      return NextResponse.json(
        { error: 'Premium subscription required for PDF generation' },
        { status: 403 }
      )
    }

    console.log(`✅ PDF Generation: Access granted for ${session.user.email}`)

    // Parse request body
    const body = await request.json()
    const { reportType, data, options = {} } = body

    if (!reportType || !data) {
      return NextResponse.json(
        { error: 'Missing required fields: reportType and data' },
        { status: 400 }
      )
    }

    // Validate report type
    if (!['pension', 'combined'].includes(reportType)) {
      return NextResponse.json(
        { error: 'Invalid report type. Must be "pension" or "combined"' },
        { status: 400 }
      )
    }

    // Set PDF options
    const isPremium = subscriptionInfo.isPremium
    const pdfOptions: PDFGenerationOptions = {
      reportType: reportType === 'pension' ? 'basic' : 'combined',
      includeCharts: true,
      includeCOLAProjections: true,
      includeScenarioComparison: reportType === 'combined',
      watermark: isPremium ? undefined : 'PREMIUM PREVIEW',
      ...options
    }

    console.log(`📄 PDF Generation: PDF options:`, pdfOptions)

    // Generate PDF based on type
    let pdfBuffer: Buffer

    if (reportType === 'pension') {
      const pensionData = data as PensionCalculationData
      
      // Validate pension data
      if (!pensionData.averageSalary || !pensionData.yearsOfService) {
        return NextResponse.json(
          { error: 'Invalid pension data: missing required fields' },
          { status: 400 }
        )
      }

      const blob = await generatePensionCalculationPDF(pensionData, pdfOptions)
      pdfBuffer = Buffer.from(await blob.arrayBuffer())
      
    } else {
      const combinedData = data as CombinedCalculationData
      
      // Validate combined data
      if (!combinedData.pensionData?.averageSalary) {
        return NextResponse.json(
          { error: 'Invalid combined data: missing pension information' },
          { status: 400 }
        )
      }

      const blob = await generateCombinedRetirementPDF(combinedData, pdfOptions)
      pdfBuffer = Buffer.from(await blob.arrayBuffer())
    }

    // Generate filename
    const userName = session.user.name || 'User'
    const dateStr = new Date().toISOString().split('T')[0]
    const filename = reportType === 'pension' 
      ? `MA_Pension_Report_${userName.replace(/[^a-zA-Z0-9]/g, '_')}_${dateStr}.pdf`
      : `MA_Retirement_Analysis_${userName.replace(/[^a-zA-Z0-9]/g, '_')}_${dateStr}.pdf`

    // Log PDF generation for analytics
    console.log(`✅ PDF Generation: Successfully generated ${reportType} report for user ${session.user.email}`, {
      filename,
      bufferSize: pdfBuffer.length,
      userType: subscriptionInfo.userType,
      isPremium: subscriptionInfo.isPremium
    })

    // Return PDF as response
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBuffer.length.toString(),
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })

  } catch (error) {
    console.error('❌ PDF Generation: Error occurred:', error)

    // Return appropriate error response
    if (error instanceof Error) {
      console.error('❌ PDF Generation: Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      })
      return NextResponse.json(
        { error: `PDF generation failed: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error during PDF generation' },
      { status: 500 }
    )
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
