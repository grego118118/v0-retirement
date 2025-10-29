import { NextResponse } from 'next/server'
import { generatePensionCalculationPDF, PensionCalculationData } from '@/lib/pdf/puppeteer-pdf-generator'

export async function GET() {
  console.log('🧪 Test Pension PDF API endpoint called')
  
  try {
    console.log('🔄 Generating test pension PDF with Puppeteer...')
    
    // Create test pension calculation data
    const testPensionData: PensionCalculationData = {
      // Personal Information
      name: 'John Doe',
      employeeId: 'EMP123456',
      currentAge: 55,
      plannedRetirementAge: 60,
      retirementGroup: 'Group 1',
      serviceEntry: 'before_2012',
      
      // Calculation Details
      averageSalary: 75000,
      yearsOfService: 25,
      projectedYearsAtRetirement: 30,
      
      // Pension Results
      basePension: 45000,
      benefitFactor: 0.025,
      totalBenefitPercentage: 62.5,
      cappedAt80Percent: false,
      
      // Retirement Options
      options: {
        A: { 
          annual: 45000, 
          monthly: 3750, 
          description: 'Option A: Full Allowance (100%)' 
        },
        B: { 
          annual: 44550, 
          monthly: 3712.50, 
          description: 'Option B: Annuity Protection (1% reduction)', 
          reduction: 0.01 
        },
        C: { 
          annual: 41827.50, 
          monthly: 3485.63, 
          description: 'Option C: Joint & Survivor (66.67%)', 
          reduction: 0.0705, 
          survivorAnnual: 27885, 
          survivorMonthly: 2323.75,
          beneficiaryAge: 52
        }
      },
      
      // COLA Information
      colaProjections: [
        {
          year: 1,
          startingPension: 45000,
          colaIncrease: 390,
          endingPension: 45390,
          monthlyPension: 3782.50
        },
        {
          year: 2,
          startingPension: 45390,
          colaIncrease: 390,
          endingPension: 45780,
          monthlyPension: 3815.00
        },
        {
          year: 3,
          startingPension: 45780,
          colaIncrease: 390,
          endingPension: 46170,
          monthlyPension: 3847.50
        },
        {
          year: 4,
          startingPension: 46170,
          colaIncrease: 390,
          endingPension: 46560,
          monthlyPension: 3880.00
        },
        {
          year: 5,
          startingPension: 46560,
          colaIncrease: 390,
          endingPension: 46950,
          monthlyPension: 3912.50
        }
      ],
      
      // Additional Information
      isVeteran: true,
      veteranBenefit: 2500,
      eligibilityMessage: 'Eligible for full retirement benefits at age 60',
      calculationDate: new Date()
    }

    console.log('📊 Generating pension calculation PDF...')
    const buffer = await generatePensionCalculationPDF(testPensionData, {
      reportType: 'basic',
      includeCharts: false,
      includeCOLAProjections: true,
      includeScenarioComparison: false
    })
    
    console.log(`✅ Test pension PDF generated successfully - Size: ${buffer.length} bytes`)
    
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="test-pension-calculation.pdf"',
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })

  } catch (error) {
    console.error('❌ Test pension PDF generation failed:', error)
    
    return NextResponse.json(
      { 
        error: 'Test pension PDF generation failed',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}

export async function POST() {
  return GET() // Same functionality for POST requests
}
