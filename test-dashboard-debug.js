/**
 * Comprehensive test to debug dashboard calculation display issues
 * This will test authentication, API endpoints, and data flow
 */

const BASE_URL = 'http://localhost:3001'

// Test the authentication flow and API endpoints
async function testAuthenticationFlow() {
  console.log('🔐 Testing Authentication Flow...')
  
  try {
    // Test 1: Check if we can access the dashboard page
    const dashboardResponse = await fetch(`${BASE_URL}/dashboard`)
    console.log('📄 Dashboard page status:', dashboardResponse.status)
    
    // Test 2: Check NextAuth session endpoint
    const sessionResponse = await fetch(`${BASE_URL}/api/auth/session`)
    console.log('🔑 Session endpoint status:', sessionResponse.status)
    
    if (sessionResponse.ok) {
      const sessionData = await sessionResponse.json()
      console.log('👤 Session data:', sessionData)
      return sessionData
    } else {
      console.log('❌ No active session found')
      return null
    }
  } catch (error) {
    console.error('💥 Authentication test error:', error.message)
    return null
  }
}

async function testCalculationsAPI() {
  console.log('🧪 Testing Calculations API Endpoints...')
  
  try {
    // Test the retirement calculations endpoint
    const retirementResponse = await fetch(`${BASE_URL}/api/retirement/calculations?limit=20`)
    console.log('📊 Retirement calculations status:', retirementResponse.status)
    
    if (retirementResponse.ok) {
      const retirementData = await retirementResponse.json()
      console.log('✅ Retirement calculations response:', {
        hasCalculations: !!retirementData.calculations,
        count: retirementData.calculations?.length || 0,
        total: retirementData.total,
        structure: Object.keys(retirementData)
      })
      
      if (retirementData.calculations && retirementData.calculations.length > 0) {
        console.log('📋 Sample calculation:', {
          id: retirementData.calculations[0].id,
          name: retirementData.calculations[0].calculationName,
          monthlyBenefit: retirementData.calculations[0].monthlyBenefit,
          createdAt: retirementData.calculations[0].createdAt
        })
      }
      
      return retirementData
    } else {
      const errorText = await retirementResponse.text()
      console.log('❌ Retirement calculations error:', errorText)
      return null
    }
  } catch (error) {
    console.error('💥 Calculations API test error:', error.message)
    return null
  }
}

async function testOldCalculationsAPI() {
  console.log('🧪 Testing Old Calculations API...')
  
  try {
    const oldResponse = await fetch(`${BASE_URL}/api/calculations`)
    console.log('📊 Old calculations status:', oldResponse.status)
    
    if (oldResponse.ok) {
      const oldData = await oldResponse.json()
      console.log('✅ Old calculations response:', {
        isArray: Array.isArray(oldData),
        count: oldData.length || 0,
        structure: Array.isArray(oldData) ? 'array' : Object.keys(oldData)
      })
      
      if (oldData.length > 0) {
        console.log('📋 Sample old calculation:', {
          id: oldData[0].id,
          name: oldData[0].calculationName,
          monthlyBenefit: oldData[0].monthlyBenefit
        })
      }
      
      return oldData
    } else {
      const errorText = await oldResponse.text()
      console.log('❌ Old calculations error:', errorText)
      return null
    }
  } catch (error) {
    console.error('💥 Old calculations API test error:', error.message)
    return null
  }
}

async function testDatabaseConnection() {
  console.log('🗄️ Testing Database Connection...')
  
  try {
    // Test if we can reach any API endpoint that would indicate database connectivity
    const healthResponse = await fetch(`${BASE_URL}/api/health`)
    
    if (healthResponse.ok) {
      console.log('✅ Health check passed - database likely connected')
      return true
    } else {
      console.log('⚠️ Health check failed, but this might be expected')
      return false
    }
  } catch (error) {
    console.error('💥 Database connection test error:', error.message)
    return false
  }
}

async function testProfileAPI() {
  console.log('👤 Testing Profile API...')
  
  try {
    const profileResponse = await fetch(`${BASE_URL}/api/profile`)
    console.log('📊 Profile API status:', profileResponse.status)
    
    if (profileResponse.ok) {
      const profileData = await profileResponse.json()
      console.log('✅ Profile data received:', {
        hasData: !!profileData,
        structure: Object.keys(profileData)
      })
      return profileData
    } else {
      const errorText = await profileResponse.text()
      console.log('❌ Profile API error:', errorText)
      return null
    }
  } catch (error) {
    console.error('💥 Profile API test error:', error.message)
    return null
  }
}

async function runComprehensiveTest() {
  console.log('🚀 Starting Comprehensive Dashboard Debug Test\n')
  
  // Test 1: Authentication
  console.log('='.repeat(60))
  const sessionData = await testAuthenticationFlow()
  
  // Test 2: Database connection
  console.log('\n' + '='.repeat(60))
  const dbConnected = await testDatabaseConnection()
  
  // Test 3: Profile API
  console.log('\n' + '='.repeat(60))
  const profileData = await testProfileAPI()
  
  // Test 4: Calculations APIs
  console.log('\n' + '='.repeat(60))
  const retirementCalculations = await testCalculationsAPI()
  
  console.log('\n' + '='.repeat(60))
  const oldCalculations = await testOldCalculationsAPI()
  
  // Summary and diagnosis
  console.log('\n' + '='.repeat(60))
  console.log('📊 COMPREHENSIVE TEST SUMMARY')
  console.log('='.repeat(60))
  
  console.log('\n🔍 AUTHENTICATION STATUS:')
  if (sessionData && sessionData.user) {
    console.log('✅ User is authenticated:', sessionData.user.email || sessionData.user.name)
    console.log('✅ Session is active')
  } else {
    console.log('❌ No active user session - this is the main issue!')
    console.log('💡 Users need to sign in to see their calculations')
  }
  
  console.log('\n🗄️ DATABASE STATUS:')
  console.log(dbConnected ? '✅ Database connection working' : '⚠️ Database connection unclear')
  
  console.log('\n📊 API ENDPOINTS STATUS:')
  console.log('Profile API:', profileData ? '✅ Working' : '❌ Failed')
  console.log('Retirement Calculations API:', retirementCalculations ? '✅ Working' : '❌ Failed')
  console.log('Old Calculations API:', oldCalculations ? '✅ Working' : '❌ Failed')
  
  console.log('\n🎯 DIAGNOSIS:')
  if (!sessionData || !sessionData.user) {
    console.log('🔴 PRIMARY ISSUE: No authenticated user session')
    console.log('   → Users must sign in to see their saved calculations')
    console.log('   → Dashboard will show "no calculations" for unauthenticated users')
    console.log('   → This is expected behavior for security')
  } else if (retirementCalculations && retirementCalculations.calculations && retirementCalculations.calculations.length === 0) {
    console.log('🟡 SECONDARY ISSUE: User has no saved calculations')
    console.log('   → User needs to create and save calculations first')
    console.log('   → Check if save functionality is working in calculator')
  } else if (retirementCalculations && retirementCalculations.calculations && retirementCalculations.calculations.length > 0) {
    console.log('🟢 CALCULATIONS FOUND: User has saved calculations')
    console.log('   → Dashboard should display these calculations')
    console.log('   → If not showing, check frontend rendering logic')
  } else {
    console.log('🔴 API ISSUE: Calculations API not working properly')
    console.log('   → Check server logs and database connection')
  }
  
  console.log('\n📋 NEXT STEPS:')
  if (!sessionData || !sessionData.user) {
    console.log('1. 🔑 Sign in to the application')
    console.log('2. 🧮 Create a pension calculation')
    console.log('3. 💾 Save the calculation')
    console.log('4. 📊 Check dashboard for saved calculations')
  } else {
    console.log('1. 🧮 Create a test calculation if none exist')
    console.log('2. 💾 Test the save functionality')
    console.log('3. 🔄 Refresh the dashboard')
    console.log('4. 🐛 Check browser console for errors')
  }
}

// Run the comprehensive test
runComprehensiveTest().catch(console.error)
