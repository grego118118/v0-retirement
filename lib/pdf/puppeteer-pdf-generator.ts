/**
 * Puppeteer-based PDF Generation for Massachusetts Retirement System
 * Replaces problematic React-PDF implementation
 */

import puppeteer, { Browser, Page } from 'puppeteer'
import { 
  generatePensionReportHTML, 
  PensionCalculationData, 
  PDFGenerationOptions 
} from './html-templates/pension-report-template'

export interface PuppeteerConfig {
  headless?: boolean
  timeout?: number
  args?: string[]
}

export class PuppeteerPDFGenerator {
  private browser: Browser | null = null
  private config: PuppeteerConfig

  constructor(config: PuppeteerConfig = {}) {
    this.config = {
      headless: true,
      timeout: 60000,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding'
      ],
      ...config
    }
  }

  async initialize(): Promise<void> {
    if (this.browser) {
      return
    }

    console.log('🚀 Initializing Puppeteer browser...')

    try {
      // Configure for Vercel serverless environment
      const isProduction = process.env.NODE_ENV === 'production'
      const isVercel = process.env.VERCEL === '1'

      console.log('🔧 Environment check:', { isProduction, isVercel })

      let launchOptions: any = {
        headless: this.config.headless,
        args: this.config.args,
        timeout: this.config.timeout,
        ignoreDefaultArgs: ['--disable-extensions'],
        defaultViewport: null
      }

      // For Vercel production environment, use chrome-aws-lambda
      if (isProduction && isVercel) {
        console.log('🔧 Configuring for Vercel serverless environment...')

        try {
          // Try to use @sparticuz/chromium for Vercel
          const chromium = await import('@sparticuz/chromium')

          launchOptions = {
            ...launchOptions,
            executablePath: await chromium.default.executablePath(),
            args: [
              ...chromium.default.args,
              '--no-sandbox',
              '--disable-setuid-sandbox',
              '--disable-dev-shm-usage',
              '--disable-accelerated-2d-canvas',
              '--no-first-run',
              '--no-zygote',
              '--disable-gpu',
              '--disable-web-security',
              '--disable-features=VizDisplayCompositor',
              '--disable-background-timer-throttling',
              '--disable-backgrounding-occluded-windows',
              '--disable-renderer-backgrounding'
            ]
          }

          console.log('✅ Using @sparticuz/chromium for Vercel')
        } catch (chromiumError) {
          console.warn('⚠️ Failed to load @sparticuz/chromium, falling back to regular Puppeteer:', chromiumError)

          // Fallback: try to find Chrome in common Vercel paths
          const possiblePaths = [
            '/opt/google/chrome/chrome',
            '/usr/bin/google-chrome-stable',
            '/usr/bin/google-chrome',
            '/usr/bin/chromium-browser',
            '/usr/bin/chromium'
          ]

          for (const path of possiblePaths) {
            try {
              const fs = await import('fs')
              if (fs.existsSync(path)) {
                launchOptions.executablePath = path
                console.log(`✅ Found Chrome at: ${path}`)
                break
              }
            } catch (e) {
              // Continue to next path
            }
          }
        }
      }

      console.log('🚀 Launching browser with options:', {
        executablePath: launchOptions.executablePath || 'default',
        argsCount: launchOptions.args?.length || 0
      })

      this.browser = await puppeteer.launch(launchOptions)

      console.log('✅ Puppeteer browser initialized successfully')
    } catch (error) {
      console.error('❌ Failed to initialize Puppeteer browser:', error)
      throw new Error(`Puppeteer initialization failed: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  async generatePDF(htmlContent: string, options: {
    format?: 'A4' | 'Letter'
    margin?: { top: string; right: string; bottom: string; left: string }
    displayHeaderFooter?: boolean
    headerTemplate?: string
    footerTemplate?: string
    printBackground?: boolean
  } = {}): Promise<Buffer> {
    if (!this.browser) {
      await this.initialize()
    }

    if (!this.browser) {
      throw new Error('Browser not initialized')
    }

    console.log('📄 Generating PDF from HTML content...')
    
    let page: Page | null = null
    
    try {
      page = await this.browser.newPage()

      // Set viewport for consistent rendering
      await page.setViewport({ width: 1200, height: 1600 })

      // Set content with proper encoding and wait for load
      await page.setContent(htmlContent, {
        waitUntil: 'domcontentloaded',
        timeout: this.config.timeout
      })

      // Wait a bit more for any dynamic content
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Generate PDF with specified options
      const pdfBuffer = await page.pdf({
        format: options.format || 'A4',
        margin: options.margin || {
          top: '0.75in',
          right: '0.75in',
          bottom: '0.75in',
          left: '0.75in'
        },
        displayHeaderFooter: options.displayHeaderFooter || false,
        headerTemplate: options.headerTemplate || '',
        footerTemplate: options.footerTemplate || '',
        printBackground: options.printBackground !== false,
        preferCSSPageSize: true,
        timeout: this.config.timeout
      })

      console.log(`✅ PDF generated successfully - Size: ${pdfBuffer.length} bytes`)
      return Buffer.from(pdfBuffer)
      
    } catch (error) {
      console.error('❌ PDF generation failed:', error)
      throw new Error(`PDF generation failed: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      if (page) {
        await page.close()
      }
    }
  }

  async close(): Promise<void> {
    if (this.browser) {
      console.log('🔄 Closing Puppeteer browser...')
      await this.browser.close()
      this.browser = null
      console.log('✅ Puppeteer browser closed')
    }
  }
}

// Singleton instance for reuse
let pdfGenerator: PuppeteerPDFGenerator | null = null

export async function generatePDFFromHTML(
  htmlContent: string,
  options: {
    format?: 'A4' | 'Letter'
    margin?: { top: string; right: string; bottom: string; left: string }
    displayHeaderFooter?: boolean
    headerTemplate?: string
    footerTemplate?: string
    printBackground?: boolean
  } = {}
): Promise<Buffer> {
  console.log('🔄 Starting PDF generation from HTML...')

  // Create a new browser instance for each PDF generation to avoid connection issues
  let browser: Browser | null = null
  let page: Page | null = null

  try {
    console.log('🚀 Launching Puppeteer browser...')
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-web-security'
      ],
      timeout: 30000
    })

    console.log('✅ Browser launched successfully')
    page = await browser.newPage()

    // Set viewport for consistent rendering
    await page.setViewport({ width: 1200, height: 1600 })

    // Set content and wait for it to load
    await page.setContent(htmlContent, {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    })

    console.log('📄 Generating PDF...')

    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: options.format || 'A4',
      margin: options.margin || {
        top: '0.75in',
        right: '0.75in',
        bottom: '0.75in',
        left: '0.75in'
      },
      displayHeaderFooter: options.displayHeaderFooter || false,
      headerTemplate: options.headerTemplate || '',
      footerTemplate: options.footerTemplate || '',
      printBackground: options.printBackground !== false,
      preferCSSPageSize: true
    })

    console.log(`✅ PDF generated successfully - Size: ${pdfBuffer.length} bytes`)
    return Buffer.from(pdfBuffer)

  } catch (error) {
    console.error('❌ PDF generation error:', error)
    throw new Error(`PDF generation failed: ${error instanceof Error ? error.message : String(error)}`)
  } finally {
    // Clean up resources
    if (page) {
      try {
        await page.close()
      } catch (e) {
        console.warn('Warning: Failed to close page:', e)
      }
    }
    if (browser) {
      try {
        await browser.close()
      } catch (e) {
        console.warn('Warning: Failed to close browser:', e)
      }
    }
  }
}

export async function generatePensionCalculationPDF(
  data: PensionCalculationData,
  options: PDFGenerationOptions = {}
): Promise<Buffer> {
  console.log('📊 Generating pension calculation PDF...')
  console.log('📋 Pension data:', {
    name: data.name,
    retirementAge: data.plannedRetirementAge,
    basePension: data.basePension,
    optionsCount: Object.keys(data.options).length
  })
  
  try {
    // Generate HTML content from template
    const htmlContent = generatePensionReportHTML(data, options)
    console.log('✅ HTML template generated successfully')
    
    // Convert HTML to PDF
    const pdfBuffer = await generatePDFFromHTML(htmlContent, {
      format: 'A4',
      printBackground: true,
      displayHeaderFooter: false,
      margin: {
        top: '0.75in',
        right: '0.75in',
        bottom: '0.75in',
        left: '0.75in'
      }
    })
    
    console.log('✅ Pension calculation PDF generated successfully')
    return pdfBuffer
    
  } catch (error) {
    console.error('❌ Pension PDF generation failed:', error)
    throw new Error(`Failed to generate pension calculation PDF: ${error instanceof Error ? error.message : String(error)}`)
  }
}

// Cleanup function for graceful shutdown
export async function closePDFGenerator(): Promise<void> {
  if (pdfGenerator) {
    await pdfGenerator.close()
    pdfGenerator = null
  }
}

// Export types for compatibility
export type { PensionCalculationData, PDFGenerationOptions }
