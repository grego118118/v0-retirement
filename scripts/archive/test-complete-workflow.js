/**
 * Complete workflow test for the Massachusetts Retirement System calculator
 * This tests the entire save-to-dashboard workflow with detailed debugging
 */

const BASE_URL = 'http://localhost:3001'

// Mock calculation data that matches the expected format
const mockCalculationData = {
  calculationName: "Test Workflow Calculation",
  retirementDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000 * 5).toISOString(),
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
  notes: "Complete workflow test calculation",
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

async function testCompleteWorkflow() {
  console.log('🚀 Starting Complete Workflow Test')
  console.log('=' .repeat(60))
  
  // Step 1: Check server status
  console.log('\n📡 Step 1: Checking server status...')
  try {
    const healthResponse = await fetch(`${BASE_URL}/`)
    console.log('✅ Server is running:', healthResponse.status === 200)
  } catch (error) {
    console.log('❌ Server not reachable:', error.message)
    return
  }
  
  // Step 2: Check authentication status
  console.log('\n🔐 Step 2: Checking authentication status...')
  try {
    const sessionResponse = await fetch(`${BASE_URL}/api/auth/session`)
    const sessionData = await sessionResponse.json()
    
    console.log('Session response status:', sessionResponse.status)
    console.log('Session data:', sessionData)
    
    if (sessionData && sessionData.user) {
      console.log('✅ User is authenticated:', sessionData.user.email || sessionData.user.name)
      console.log('✅ User ID:', sessionData.user.id)
      
      // Continue with authenticated workflow
      await testAuthenticatedWorkflow(sessionData)
    } else {
      console.log('❌ No authenticated user found')
      console.log('📝 Instructions for manual testing:')
      console.log('   1. Open http://localhost:3001 in your browser')
      console.log('   2. Sign in with Google OAuth')
      console.log('   3. Run this test again')
      console.log('   4. Or test manually by:')
      console.log('      a. Go to the pension calculator')
      console.log('      b. Fill out the form and calculate')
      console.log('      c. Click "Save Results"')
      console.log('      d. Go to the dashboard')
      console.log('      e. Check if the calculation appears')
    }
  } catch (error) {
    console.error('💥 Authentication check failed:', error.message)
  }
}

async function testAuthenticatedWorkflow(sessionData) {
  console.log('\n🧪 Step 3: Testing authenticated workflow...')
  
  // Test 3a: Fetch existing calculations
  console.log('\n📊 Step 3a: Fetching existing calculations...')
  try {
    const fetchResponse = await fetch(`${BASE_URL}/api/retirement/calculations?limit=20`)
    const fetchData = await fetchResponse.json()
    
    console.log('Fetch response status:', fetchResponse.status)
    console.log('Fetch response data:', fetchData)
    
    if (fetchResponse.ok) {
      console.log('✅ Calculations API working')
      console.log('📋 Current calculations count:', fetchData.calculations?.length || 0)
      
      if (fetchData.calculations && fetchData.calculations.length > 0) {
        console.log('📄 Sample calculation:', {
          id: fetchData.calculations[0].id,
          name: fetchData.calculations[0].calculationName,
          monthlyBenefit: fetchData.calculations[0].monthlyBenefit,
          createdAt: fetchData.calculations[0].createdAt
        })
      }
    } else {
      console.log('❌ Calculations API failed:', fetchData)
    }
  } catch (error) {
    console.error('💥 Fetch calculations error:', error.message)
  }
  
  // Test 3b: Save a new calculation
  console.log('\n💾 Step 3b: Testing save calculation...')
  try {
    const saveResponse = await fetch(`${BASE_URL}/api/retirement/calculations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mockCalculationData)
    })
    
    const saveData = await saveResponse.json()
    
    console.log('Save response status:', saveResponse.status)
    console.log('Save response data:', saveData)
    
    if (saveResponse.ok) {
      console.log('✅ Save calculation successful!')
      console.log('📄 Saved calculation ID:', saveData.id)
      
      // Test 3c: Fetch calculations again to verify save
      console.log('\n🔄 Step 3c: Verifying save by fetching calculations again...')
      const verifyResponse = await fetch(`${BASE_URL}/api/retirement/calculations?limit=20`)
      const verifyData = await verifyResponse.json()
      
      console.log('Verify response status:', verifyResponse.status)
      console.log('Verify calculations count:', verifyData.calculations?.length || 0)
      
      if (verifyData.calculations && verifyData.calculations.length > 0) {
        const latestCalc = verifyData.calculations[0]
        console.log('✅ Latest calculation:', {
          id: latestCalc.id,
          name: latestCalc.calculationName,
          monthlyBenefit: latestCalc.monthlyBenefit,
          createdAt: latestCalc.createdAt
        })
        
        if (latestCalc.calculationName === mockCalculationData.calculationName) {
          console.log('🎉 SUCCESS: Test calculation found in database!')
        } else {
          console.log('⚠️  Test calculation not found as latest')
        }
      }
    } else {
      console.log('❌ Save calculation failed:', saveData)
    }
  } catch (error) {
    console.error('💥 Save calculation error:', error.message)
  }
  
  // Test 3d: Test old calculations endpoint
  console.log('\n🔄 Step 3d: Testing old calculations endpoint...')
  try {
    const oldResponse = await fetch(`${BASE_URL}/api/calculations`)
    const oldData = await oldResponse.json()
    
    console.log('Old endpoint response status:', oldResponse.status)
    console.log('Old endpoint calculations count:', oldData.length || 0)
    
    if (oldResponse.ok && oldData.length > 0) {
      console.log('✅ Old endpoint working with data')
    } else if (oldResponse.ok) {
      console.log('✅ Old endpoint working but no data')
    } else {
      console.log('❌ Old endpoint failed:', oldData)
    }
  } catch (error) {
    console.error('💥 Old endpoint error:', error.message)
  }
}

async function provideDiagnosisAndSolution() {
  console.log('\n' + '='.repeat(60))
  console.log('🔍 DIAGNOSIS AND SOLUTION')
  console.log('='.repeat(60))
  
  console.log('\n📋 COMMON ISSUES AND SOLUTIONS:')
  
  console.log('\n1. 🔐 AUTHENTICATION ISSUE:')
  console.log('   Problem: User not signed in')
  console.log('   Solution: Sign in via Google OAuth at http://localhost:3001/auth/signin')
  console.log('   Expected: Dashboard shows "Sign in to see calculations" message')
  
  console.log('\n2. 📊 NO CALCULATIONS SAVED:')
  console.log('   Problem: User has no saved calculations')
  console.log('   Solution: Create and save a calculation via the pension calculator')
  console.log('   Expected: Dashboard shows "No saved calculations yet" message')
  
  console.log('\n3. 🐛 API ENDPOINT ISSUES:')
  console.log('   Problem: API returning errors or wrong data format')
  console.log('   Solution: Check server logs and database connection')
  console.log('   Expected: API returns 200 status with proper data structure')
  
  console.log('\n4. 🎨 FRONTEND RENDERING ISSUES:')
  console.log('   Problem: Data exists but not displaying on dashboard')
  console.log('   Solution: Check browser console for JavaScript errors')
  console.log('   Expected: useRetirementData hook properly fetches and sets calculations')
  
  console.log('\n📝 MANUAL TESTING STEPS:')
  console.log('1. Open http://localhost:3001 in browser')
  console.log('2. Sign in with Google OAuth')
  console.log('3. Go to Pension Calculator (/calculator)')
  console.log('4. Fill out form with test data:')
  console.log('   - Retirement Group: 1')
  console.log('   - Years of Service: 30')
  console.log('   - Average Salary: $75,000')
  console.log('   - Retirement Age: 65')
  console.log('5. Click "Calculate Benefits"')
  console.log('6. Click "Save Results" button')
  console.log('7. Go to Dashboard (/dashboard)')
  console.log('8. Verify calculation appears in "Saved Calculations" section')
  
  console.log('\n🔧 DEBUGGING TIPS:')
  console.log('- Open browser Developer Tools (F12)')
  console.log('- Check Console tab for JavaScript errors')
  console.log('- Check Network tab for API request/response details')
  console.log('- Look for authentication-related errors')
  console.log('- Verify API responses have correct data structure')
}

// Run the complete workflow test
testCompleteWorkflow()
  .then(() => provideDiagnosisAndSolution())
  .catch(console.error)
