/**
 * Test script to verify PDF generation API endpoint
 */

const testPDFAPI = async () => {
  console.log('🧪 Testing PDF Generation API...\n')

  // Test data for pension calculation
  const testData = {
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

  try {
    console.log('🔍 Testing PDF generation API endpoint...')
    
    const response = await fetch('http://localhost:3000/api/pdf/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: testData,
        reportType: 'pension',
        options: {
          includeCharts: true,
          includeCOLAProjections: true
        }
      })
    })

    console.log(`Status: ${response.status}`)
    console.log(`Status Text: ${response.statusText}`)
    console.log('Headers:', Object.fromEntries(response.headers.entries()))

    if (response.status === 401) {
      console.log('✅ API correctly requires authentication')
      const errorData = await response.json()
      console.log('Error response:', errorData)
    } else if (response.status === 403) {
      console.log('✅ API correctly requires premium access')
      const errorData = await response.json()
      console.log('Error response:', errorData)
    } else if (response.status === 200) {
      console.log('✅ API returned success (this would be unexpected without auth)')
      const contentType = response.headers.get('content-type')
      console.log('Content-Type:', contentType)
      
      if (contentType && contentType.includes('application/pdf')) {
        console.log('✅ Response is a PDF file')
        const blob = await response.blob()
        console.log(`PDF size: ${blob.size} bytes`)
      } else {
        const text = await response.text()
        console.log('Response body:', text.substring(0, 200))
      }
    } else {
      console.log(`⚠️ Unexpected status: ${response.status}`)
      const text = await response.text()
      console.log('Response:', text)
    }

  } catch (error) {
    console.error('❌ Error testing PDF API:', error)
  }

  // Test subscription status API
  console.log('\n🔍 Testing subscription status API...')
  try {
    const subResponse = await fetch('http://localhost:3000/api/subscription/status')
    console.log(`Subscription API Status: ${subResponse.status}`)
    
    if (subResponse.status === 401) {
      console.log('✅ Subscription API correctly requires authentication')
    } else {
      const subData = await subResponse.json()
      console.log('Subscription data:', subData)
    }
  } catch (error) {
    console.error('❌ Error testing subscription API:', error)
  }

  console.log('\n📝 Next steps:')
  console.log('1. Sign in as grego118@gmail.com in the browser')
  console.log('2. Navigate to the calculator')
  console.log('3. Generate a pension calculation')
  console.log('4. Look for PDF export buttons in the results')
  console.log('5. Check browser console for any JavaScript errors')
}

testPDFAPI()
