/**
 * Comprehensive Dashboard Investigation Test
 * Tests the complete data flow from database → API → frontend → dashboard
 */

const BASE_URL = 'http://localhost:3001'

async function investigateDashboardIssue() {
  console.log('🔍 COMPREHENSIVE DASHBOARD INVESTIGATION')
  console.log('=' .repeat(70))
  
  // Step 1: Test server and authentication
  console.log('\n📡 Step 1: Testing server and authentication...')
  try {
    const healthResponse = await fetch(`${BASE_URL}/`)
    console.log('✅ Server running:', healthResponse.status === 200)
    
    const sessionResponse = await fetch(`${BASE_URL}/api/auth/session`)
    const sessionData = await sessionResponse.json()
    
    console.log('Session status:', sessionResponse.status)
    console.log('Session data:', sessionData)
    
    if (!sessionData || !sessionData.user) {
      console.log('❌ No authenticated session found')
      console.log('🔧 SOLUTION: Sign in at http://localhost:3001/auth/signin')
      return
    }
    
    console.log('✅ User authenticated:', sessionData.user.email || sessionData.user.name)
    
    // Continue with authenticated tests
    await testAuthenticatedFlow(sessionData)
    
  } catch (error) {
    console.error('💥 Server/Auth test failed:', error.message)
  }
}

async function testAuthenticatedFlow(sessionData) {
  console.log('\n🧪 Step 2: Testing authenticated API flow...')
  
  // Test 2a: Direct API call to retirement calculations
  console.log('\n📊 Step 2a: Testing /api/retirement/calculations...')
  try {
    const calcResponse = await fetch(`${BASE_URL}/api/retirement/calculations?limit=20`)
    const calcData = await calcResponse.json()
    
    console.log('API Response Status:', calcResponse.status)
    console.log('API Response Headers:', Object.fromEntries(calcResponse.headers.entries()))
    
    if (calcResponse.ok) {
      console.log('✅ API call successful')
      console.log('Response structure:', {
        hasCalculations: !!calcData.calculations,
        calculationsCount: calcData.calculations?.length || 0,
        total: calcData.total,
        limit: calcData.limit,
        offset: calcData.offset
      })
      
      if (calcData.calculations && calcData.calculations.length > 0) {
        console.log('📄 Sample calculation:', {
          id: calcData.calculations[0].id,
          name: calcData.calculations[0].calculationName,
          monthlyBenefit: calcData.calculations[0].monthlyBenefit,
          createdAt: calcData.calculations[0].createdAt,
          hasSSData: !!calcData.calculations[0].socialSecurityData
        })
        
        // Test the exact data structure
        await testDataStructure(calcData.calculations[0])
      } else {
        console.log('⚠️  No calculations found in API response')
      }
    } else {
      console.log('❌ API call failed:', calcData)
    }
  } catch (error) {
    console.error('💥 API test failed:', error.message)
  }
  
  // Test 2b: Test old calculations endpoint for comparison
  console.log('\n📊 Step 2b: Testing /api/calculations (old endpoint)...')
  try {
    const oldResponse = await fetch(`${BASE_URL}/api/calculations`)
    const oldData = await oldResponse.json()
    
    console.log('Old API Status:', oldResponse.status)
    if (oldResponse.ok) {
      console.log('Old API calculations count:', oldData.length || 0)
    } else {
      console.log('Old API error:', oldData)
    }
  } catch (error) {
    console.error('Old API test failed:', error.message)
  }
  
  // Test 2c: Test subscription status
  console.log('\n💳 Step 2c: Testing subscription status...')
  try {
    const subResponse = await fetch(`${BASE_URL}/api/subscription/status`)
    const subData = await subResponse.json()
    
    console.log('Subscription Status:', subResponse.status)
    if (subResponse.ok) {
      console.log('Subscription data:', {
        isPremium: subData.isPremium,
        savedCalculationsCount: subData.savedCalculationsCount,
        currentUsage: subData.currentUsage
      })
    }
  } catch (error) {
    console.error('Subscription test failed:', error.message)
  }
}

async function testDataStructure(calculation) {
  console.log('\n🔬 Step 3: Testing data structure compatibility...')
  
  // Check if the calculation has all required fields for frontend
  const requiredFields = [
    'id', 'calculationName', 'monthlyBenefit', 'annualBenefit',
    'retirementAge', 'yearsOfService', 'retirementGroup', 'retirementOption'
  ]
  
  const missingFields = requiredFields.filter(field => !(field in calculation))
  
  if (missingFields.length === 0) {
    console.log('✅ All required fields present')
  } else {
    console.log('❌ Missing required fields:', missingFields)
  }
  
  // Check data types
  console.log('📋 Data type analysis:', {
    id: typeof calculation.id,
    calculationName: typeof calculation.calculationName,
    monthlyBenefit: typeof calculation.monthlyBenefit,
    createdAt: typeof calculation.createdAt,
    socialSecurityData: typeof calculation.socialSecurityData
  })
  
  // Test JSON parsing of socialSecurityData
  if (calculation.socialSecurityData) {
    try {
      if (typeof calculation.socialSecurityData === 'string') {
        const parsed = JSON.parse(calculation.socialSecurityData)
        console.log('✅ Social Security data parsed successfully')
      } else {
        console.log('✅ Social Security data already parsed')
      }
    } catch (error) {
      console.log('❌ Social Security data parse error:', error.message)
    }
  }
}

async function testFrontendSimulation() {
  console.log('\n🎭 Step 4: Simulating frontend data flow...')
  
  // Simulate what the useRetirementData hook does
  try {
    console.log('Simulating useRetirementData fetch...')
    
    const response = await fetch(`${BASE_URL}/api/retirement/calculations?limit=20`)
    const data = await response.json()
    
    if (response.ok && data.calculations) {
      console.log('✅ Frontend simulation successful')
      console.log('Data that would be set in React state:', {
        calculationsLength: data.calculations.length,
        firstCalculation: data.calculations[0] ? {
          id: data.calculations[0].id,
          name: data.calculations[0].calculationName
        } : null
      })
      
      // Test what SavedCalculations component would receive
      const transformedData = data.calculations.map(calc => ({
        id: calc.id,
        calculationName: calc.calculationName,
        monthlyBenefit: calc.monthlyBenefit,
        retirementAge: calc.retirementAge,
        createdAt: calc.createdAt
      }))
      
      console.log('✅ Data transformation successful')
      console.log('Transformed data sample:', transformedData[0] || 'No data')
      
    } else {
      console.log('❌ Frontend simulation failed:', data)
    }
  } catch (error) {
    console.error('💥 Frontend simulation error:', error.message)
  }
}

async function provideDiagnosis() {
  console.log('\n' + '='.repeat(70))
  console.log('🏥 DIAGNOSIS AND RECOMMENDATIONS')
  console.log('='.repeat(70))
  
  console.log('\n📋 INVESTIGATION CHECKLIST:')
  console.log('1. ✅ Server running and accessible')
  console.log('2. ❓ User authentication status')
  console.log('3. ❓ API endpoint returning data')
  console.log('4. ❓ Data structure compatibility')
  console.log('5. ❓ Frontend data transformation')
  
  console.log('\n🔧 NEXT STEPS BASED ON RESULTS:')
  console.log('- If no auth: Sign in and retry')
  console.log('- If no API data: Check database connection')
  console.log('- If API works but dashboard empty: Frontend issue')
  console.log('- If data structure wrong: Fix transformation')
  
  console.log('\n🎯 MANUAL VERIFICATION STEPS:')
  console.log('1. Open http://localhost:3001/dashboard in browser')
  console.log('2. Open Developer Tools (F12)')
  console.log('3. Check Console tab for errors/logs')
  console.log('4. Check Network tab for API calls')
  console.log('5. Look for useRetirementData debugging logs')
  
  console.log('\n📱 BROWSER CONSOLE DEBUGGING:')
  console.log('Look for these console messages:')
  console.log('- "fetchCalculations: Starting fetch"')
  console.log('- "fetchCalculations: Response received"')
  console.log('- "fetchCalculations: Setting calculations state"')
  console.log('- Any error messages from the hook')
}

// Run the investigation
investigateDashboardIssue()
  .then(() => testFrontendSimulation())
  .then(() => provideDiagnosis())
  .catch(console.error)
