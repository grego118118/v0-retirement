import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth/auth-options"
import { PDFService } from "@/lib/pdf/pdf-service"
import { recordUserAction, monitorAsyncOperation } from "@/components/error-boundary/error-monitoring"
import { z } from "zod"

// Schema for validating PDF generation request
const pdfGenerationSchema = z.object({
  reportType: z.enum(['comprehensive', 'summary', 'calculations-only']).optional().default('comprehensive'),
  includeCharts: z.boolean().optional().default(true),
  includeActionItems: z.boolean().optional().default(true),
  includeSocialSecurity: z.boolean().optional().default(true),
  maxCalculations: z.number().min(1).max(50).optional().default(10),
})

export async function POST(request: NextRequest) {
  return monitorAsyncOperation(async () => {
    try {
      // Check authentication
      const session = await getServerSession(authOptions)
      if (!session?.user?.id) {
        return NextResponse.json(
          { error: "Authentication required" },
          { status: 401 }
        )
      }

      // Parse and validate request body
      const body = await request.json()
      const validatedData = pdfGenerationSchema.parse(body)

      // Record user action
      recordUserAction('generate_pdf_report', 'pdf-generation', {
        userId: session.user.id,
        reportType: validatedData.reportType,
        includeCharts: validatedData.includeCharts,
        includeActionItems: validatedData.includeActionItems,
        includeSocialSecurity: validatedData.includeSocialSecurity,
      })

      // Validate PDF generation requirements
      const validation = await PDFService.validatePDFRequirements(session.user.id)
      
      if (!validation.canGenerate) {
        return NextResponse.json(
          { 
            error: "PDF generation requirements not met",
            missingRequirements: validation.missingRequirements,
            warnings: validation.warnings,
          },
          { status: 400 }
        )
      }

      // Generate PDF report data
      const result = await PDFService.generateReportData(session.user.id, validatedData)

      if (!result.success) {
        return NextResponse.json(
          { 
            error: result.error || "Failed to generate PDF report data",
            generationTime: result.generationTime,
          },
          { status: 500 }
        )
      }

      // Return PDF data for client-side rendering
      return NextResponse.json({
        success: true,
        data: result.data,
        generationTime: result.generationTime,
        warnings: validation.warnings,
        metadata: {
          reportType: validatedData.reportType,
          generatedAt: new Date().toISOString(),
          userId: session.user.id,
        },
      })

    } catch (error) {
      console.error('PDF generation API error:', error)
      
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { 
            error: "Invalid request data",
            details: error.errors,
          },
          { status: 400 }
        )
      }

      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      )
    }
  }, 'pdf_generation_api')
}

export async function GET(request: NextRequest) {
  return monitorAsyncOperation(async () => {
    try {
      // Check authentication
      const session = await getServerSession(authOptions)
      if (!session?.user?.id) {
        return NextResponse.json(
          { error: "Authentication required" },
          { status: 401 }
        )
      }

      // Get PDF generation statistics
      const stats = await PDFService.getPDFStats(session.user.id)
      
      // Get validation status
      const validation = await PDFService.validatePDFRequirements(session.user.id)

      return NextResponse.json({
        stats,
        validation,
        supportedReportTypes: ['comprehensive', 'summary', 'calculations-only'],
        maxCalculations: 50,
      })

    } catch (error) {
      console.error('PDF stats API error:', error)
      
      return NextResponse.json(
        { error: "Failed to retrieve PDF statistics" },
        { status: 500 }
      )
    }
  }, 'pdf_stats_api')
}
