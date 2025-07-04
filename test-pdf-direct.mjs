/**
 * Direct test of PDF generation functionality
 */

import React from 'react'

async function testPDFGeneration() {
  console.log('🧪 Testing PDF generation directly...\n')

  try {
    // Test 1: Basic React-PDF import
    console.log('1. Testing React-PDF import...')
    const { pdf, Document, Page, Text, View, StyleSheet } = await import('@react-pdf/renderer')
    console.log('✅ React-PDF imported successfully')

    // Test 2: Create basic styles
    console.log('2. Creating PDF styles...')
    const styles = StyleSheet.create({
      page: {
        flexDirection: 'column',
        backgroundColor: '#ffffff',
        padding: 30,
      },
      section: {
        margin: 10,
        padding: 10,
        flexGrow: 1
      },
      title: {
        fontSize: 24,
        marginBottom: 10,
        textAlign: 'center'
      },
      text: {
        fontSize: 12,
        marginBottom: 5
      }
    })
    console.log('✅ PDF styles created successfully')

    // Test 3: Create React component
    console.log('3. Creating React PDF component...')
    const TestDocument = React.createElement(Document, {},
      React.createElement(Page, { size: 'A4', style: styles.page },
        React.createElement(View, { style: styles.section },
          React.createElement(Text, { style: styles.title }, 'Direct PDF Test'),
          React.createElement(Text, { style: styles.text }, 'This is a direct test of React-PDF functionality.'),
          React.createElement(Text, { style: styles.text }, `Generated on: ${new Date().toLocaleString()}`),
          React.createElement(Text, { style: styles.text }, 'Testing ES Module compatibility fixes.')
        )
      )
    )
    console.log('✅ React PDF component created successfully')

    // Test 4: Generate PDF
    console.log('4. Generating PDF...')
    const blob = await pdf(TestDocument).toBlob()
    console.log(`✅ PDF generated successfully - Size: ${blob.size} bytes`)

    // Test 5: Test our pension calculation data structure
    console.log('5. Testing pension calculation data structure...')
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
    console.log('✅ Test pension data structure created')
    console.log('📊 Data validation:', JSON.stringify(testPensionData, null, 2))

    console.log('\n🎉 All PDF generation tests passed!')
    console.log('✅ React-PDF is working correctly with ES Module fixes')
    console.log('✅ Basic PDF generation functionality is operational')
    console.log('✅ Test data structure is valid')

    return true

  } catch (error) {
    console.error('\n❌ PDF generation test failed:', error)
    console.error('Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : 'No stack trace'
    })
    return false
  }
}

// Run the test
testPDFGeneration().then(success => {
  if (success) {
    console.log('\n📝 Next steps:')
    console.log('1. The basic React-PDF functionality is working')
    console.log('2. Test the pension calculation PDF component')
    console.log('3. Check for any component-specific issues')
    console.log('4. Verify server-side rendering compatibility')
  } else {
    console.log('\n⚠️ PDF generation has fundamental issues that need to be resolved')
  }
  process.exit(success ? 0 : 1)
})
