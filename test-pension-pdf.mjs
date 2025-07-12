/**
 * Test the specific pension calculation PDF component
 */

import React from 'react'

async function testPensionPDFComponent() {
  console.log('🧪 Testing Pension PDF Component...\n')

  try {
    // Test data matching the PensionCalculationData interface
    const testPensionData = {
      currentAge: 55,
      plannedRetirementAge: 60,
      retirementGroup: 'Group 1',
      serviceEntry: 'before_2012',
      averageSalary: 75000,
      yearsOfService: 25,
      projectedYearsAtRetirement: 30,
      basePension: 45000,
      benefitFactor: 0.025,
      totalBenefitPercentage: 62.5,
      cappedAt80Percent: false,
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
          survivorMonthly: 2323.75
        }
      },
      calculationDate: new Date()
    }

    const testOptions = {
      reportType: 'basic',
      includeCharts: true,
      includeCOLAProjections: true
    }

    console.log('1. Testing React-PDF import...')
    const { pdf } = await import('@react-pdf/renderer')
    console.log('✅ React-PDF imported successfully')

    console.log('2. Testing pension PDF component import...')
    const { PensionCalculationReport } = await import('./lib/pdf/components/pension-calculation-report.tsx')
    console.log('✅ PensionCalculationReport imported successfully')

    console.log('3. Creating React element with pension component...')
    const doc = React.createElement(PensionCalculationReport, { 
      data: testPensionData, 
      options: testOptions 
    })
    console.log('✅ React element created successfully')

    console.log('4. Generating PDF with pension component...')
    const blob = await pdf(doc).toBlob()
    console.log(`✅ Pension PDF generated successfully - Size: ${blob.size} bytes`)

    console.log('\n🎉 Pension PDF component test passed!')
    console.log('✅ PensionCalculationReport component is working correctly')
    console.log('✅ Component can render with test data')
    console.log('✅ PDF generation with pension component is operational')

    return true

  } catch (error) {
    console.error('\n❌ Pension PDF component test failed:', error)
    console.error('Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : 'No stack trace'
    })

    // Additional debugging
    if (error instanceof Error) {
      if (error.message.includes('Cannot resolve module')) {
        console.error('🔍 Module resolution issue - check import paths')
      } else if (error.message.includes('React')) {
        console.error('🔍 React-related issue - check component structure')
      } else if (error.message.includes('StyleSheet') || error.message.includes('style')) {
        console.error('🔍 Styling issue - check React-PDF styles')
      } else if (error.message.includes('props') || error.message.includes('data')) {
        console.error('🔍 Props/data issue - check component props structure')
      }
    }

    return false
  }
}

// Test our PDF generator functions
async function testPDFGeneratorFunctions() {
  console.log('\n🧪 Testing PDF Generator Functions...\n')

  try {
    console.log('1. Testing PDF generator import...')
    const { generatePensionCalculationPDF } = await import('./lib/pdf/pdf-generator.ts')
    console.log('✅ PDF generator imported successfully')

    const testPensionData = {
      currentAge: 55,
      plannedRetirementAge: 60,
      retirementGroup: 'Group 1',
      serviceEntry: 'before_2012',
      averageSalary: 75000,
      yearsOfService: 25,
      projectedYearsAtRetirement: 30,
      basePension: 45000,
      benefitFactor: 0.025,
      totalBenefitPercentage: 62.5,
      cappedAt80Percent: false,
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
          survivorMonthly: 2323.75
        }
      },
      calculationDate: new Date()
    }

    console.log('2. Testing generatePensionCalculationPDF function...')
    const blob = await generatePensionCalculationPDF(testPensionData, { reportType: 'basic' })
    console.log(`✅ PDF generator function worked - Size: ${blob.size} bytes`)

    console.log('\n🎉 PDF Generator Functions test passed!')
    return true

  } catch (error) {
    console.error('\n❌ PDF Generator Functions test failed:', error)
    console.error('Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : 'No stack trace'
    })
    return false
  }
}

// Run both tests
async function runAllTests() {
  console.log('🚀 Running comprehensive PDF component tests...\n')
  
  const componentTest = await testPensionPDFComponent()
  const generatorTest = await testPDFGeneratorFunctions()
  
  if (componentTest && generatorTest) {
    console.log('\n✅ All tests passed! PDF generation should work in the server environment.')
  } else {
    console.log('\n❌ Some tests failed. Check the error details above.')
  }
  
  return componentTest && generatorTest
}

runAllTests().then(success => {
  process.exit(success ? 0 : 1)
})
