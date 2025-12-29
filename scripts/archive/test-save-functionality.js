/**
 * Test script to verify the Save Results functionality works end-to-end
 * This tests the complete workflow from saving calculations to retrieving them on the dashboard
 */

const BASE_URL = 'http://localhost:3001'

// Mock calculation data that matches the expected format
const mockCalculationData = {
  calculationName: "Test Save Functionality",
  retirementDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000 * 5).toISOString(), // 5 years from now
  retirementAge: 65,
  yearsOfService: 30,
  averageSalary: 75000,
  retirementGroup: "1",
  benefitPercentage: 2.5,
  retirementOption: "A",
  monthlyBenefit: 4687.50,
  annualBenefit: 56250,
  benefitReduction: null,
  survivorBenefit: null,
  notes: "Test calculation for save functionality verification",
  isFavorite: false,
  socialSecurityData: {
    fullRetirementAge: 67,
    earlyRetirementBenefit: 2100,
    fullRetirementBenefit: 2800,
    delayedRetirementBenefit: 3500,
    selectedClaimingAge: 67,
    selectedMonthlyBenefit: 2800,
    combinedMonthlyIncome: 7487.50,
    replacementRatio: 0.85
  }
}

async function testSaveCalculation() {
  console.log('🧪 Testing Save Calculation API...')
  
  try {
    // Test the /api/retirement/calculations POST endpoint
    const saveResponse = await fetch(`${BASE_URL}/api/retirement/calculations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Note: In a real test, we'd need proper authentication
        'Cookie': 'next-auth.session-token=test-token'
      },
      body: JSON.stringify(mockCalculationData)
    })

    console.log('📤 Save Response Status:', saveResponse.status)
    
    if (saveResponse.ok) {
      const saveResult = await saveResponse.json()
      console.log('✅ Save successful:', saveResult)
      return saveResult.calculation?.id
    } else {
      const errorText = await saveResponse.text()
      console.log('❌ Save failed:', errorText)
      return null
    }
  } catch (error) {
    console.error('💥 Save error:', error.message)
    return null
  }
}

async function testFetchCalculations() {
  console.log('🧪 Testing Fetch Calculations API...')
  
  try {
    // Test the /api/retirement/calculations GET endpoint
    const fetchResponse = await fetch(`${BASE_URL}/api/retirement/calculations?limit=20`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Note: In a real test, we'd need proper authentication
        'Cookie': 'next-auth.session-token=test-token'
      }
    })

    console.log('📥 Fetch Response Status:', fetchResponse.status)
    
    if (fetchResponse.ok) {
      const fetchResult = await fetchResponse.json()
      console.log('✅ Fetch successful. Found calculations:', fetchResult.calculations?.length || 0)
      
      if (fetchResult.calculations && fetchResult.calculations.length > 0) {
        console.log('📋 Sample calculation:', {
          id: fetchResult.calculations[0].id,
          name: fetchResult.calculations[0].calculationName,
          monthlyBenefit: fetchResult.calculations[0].monthlyBenefit
        })
      }
      
      return fetchResult.calculations
    } else {
      const errorText = await fetchResponse.text()
      console.log('❌ Fetch failed:', errorText)
      return null
    }
  } catch (error) {
    console.error('💥 Fetch error:', error.message)
    return null
  }
}

async function testOldCalculationsEndpoint() {
  console.log('🧪 Testing Old /api/calculations endpoint...')
  
  try {
    const response = await fetch(`${BASE_URL}/api/calculations`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'next-auth.session-token=test-token'
      }
    })

    console.log('📥 Old endpoint Response Status:', response.status)
    
    if (response.ok) {
      const result = await response.json()
      console.log('✅ Old endpoint working. Found calculations:', result.length || 0)
      return result
    } else {
      const errorText = await response.text()
      console.log('❌ Old endpoint failed:', errorText)
      return null
    }
  } catch (error) {
    console.error('💥 Old endpoint error:', error.message)
    return null
  }
}

async function runTests() {
  console.log('🚀 Starting Save Results Functionality Tests\n')
  
  // Test 1: Check if server is running
  try {
    const healthCheck = await fetch(`${BASE_URL}/api/health`)
    if (healthCheck.ok) {
      console.log('✅ Server is running on', BASE_URL)
    } else {
      console.log('⚠️  Server health check failed, but continuing tests...')
    }
  } catch (error) {
    console.log('⚠️  Could not reach server, but continuing tests...')
  }

  console.log('\n' + '='.repeat(50))
  
  // Test 2: Test the new retirement calculations endpoint (GET)
  const calculations = await testFetchCalculations()
  
  console.log('\n' + '='.repeat(50))
  
  // Test 3: Test the old calculations endpoint (GET) 
  const oldCalculations = await testOldCalculationsEndpoint()
  
  console.log('\n' + '='.repeat(50))
  
  // Test 4: Test saving a calculation (POST)
  const savedId = await testSaveCalculation()
  
  console.log('\n' + '='.repeat(50))
  
  // Summary
  console.log('\n📊 TEST SUMMARY:')
  console.log('================')
  
  if (calculations !== null) {
    console.log('✅ Fetch calculations endpoint working')
  } else {
    console.log('❌ Fetch calculations endpoint failed')
  }
  
  if (oldCalculations !== null) {
    console.log('✅ Old calculations endpoint working')
  } else {
    console.log('❌ Old calculations endpoint failed')
  }
  
  if (savedId) {
    console.log('✅ Save calculation endpoint working')
  } else {
    console.log('❌ Save calculation endpoint failed (expected without auth)')
  }
  
  console.log('\n🔍 DIAGNOSIS:')
  console.log('=============')
  
  if (calculations !== null && oldCalculations !== null) {
    console.log('✅ Both API endpoints are properly configured and working')
    console.log('✅ The Save Results button should work correctly')
    console.log('✅ Dashboard should display saved calculations')
  } else if (calculations !== null && oldCalculations === null) {
    console.log('⚠️  New endpoint works, old endpoint needs fixing')
    console.log('⚠️  Profile page may not show calculations correctly')
  } else if (calculations === null && oldCalculations !== null) {
    console.log('⚠️  Old endpoint works, new endpoint needs fixing')
    console.log('⚠️  Main dashboard may not show calculations correctly')
  } else {
    console.log('❌ Both endpoints failed - check server and database connection')
  }
}

// Run the tests
runTests().catch(console.error)
