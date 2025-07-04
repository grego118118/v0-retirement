import { NextRequest, NextResponse } from 'next/server'
import { generatePDFFromHTML } from '@/lib/pdf/puppeteer-pdf-generator'

export async function GET() {
  console.log('🧪 Test PDF API endpoint called')

  try {
    console.log('🔄 Generating test PDF with Puppeteer...')

    // Create simple HTML content for testing
    const testHTML = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Puppeteer PDF Test</title>
        <style>
            body { font-family: Arial, sans-serif; padding: 40px; }
            .header { color: #1e40af; font-size: 24px; margin-bottom: 20px; }
            .content { line-height: 1.6; }
            .success { color: #059669; font-weight: bold; }
        </style>
    </head>
    <body>
        <div class="header">Massachusetts Retirement System</div>
        <div class="content">
            <h2>PDF Generation Test</h2>
            <p>This is a test PDF generated using <span class="success">Puppeteer</span> instead of React-PDF.</p>
            <p>Generated on: ${new Date().toLocaleString()}</p>
            <p>If you can see this PDF, the Puppeteer implementation is working correctly!</p>

            <h3>Test Features:</h3>
            <ul>
                <li>✅ HTML to PDF conversion</li>
                <li>✅ CSS styling support</li>
                <li>✅ Server-side rendering</li>
                <li>✅ Professional formatting</li>
            </ul>
        </div>
    </body>
    </html>
    `

    console.log('🧪 Generating test PDF for server...')
    const buffer = await generatePDFFromHTML(testHTML)

    console.log(`✅ Test PDF generated successfully - Size: ${buffer.length} bytes`)

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="puppeteer-test.pdf"',
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })

  } catch (error) {
    console.error('❌ Test PDF generation failed:', error)

    return NextResponse.json(
      {
        error: 'Test PDF generation failed',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}

export async function POST() {
  return GET() // Same functionality for POST requests
}
