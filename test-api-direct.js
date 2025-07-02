/**
 * Direct API Test - Test the exact API response structure
 * This simulates what the frontend should receive
 */

const BASE_URL = 'http://localhost:3001'

async function testAPIDirectly() {
  console.log('🔬 DIRECT API RESPONSE TEST')
  console.log('=' .repeat(50))
  
  try {
    // Test with browser-like headers
    const response = await fetch(`${BASE_URL}/api/retirement/calculations?limit=20`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        // Note: In browser context, cookies would be sent automatically
      },
      credentials: 'include' // This ensures cookies are sent
    })
    
    console.log('Response Status:', response.status)
    console.log('Response Headers:', Object.fromEntries(response.headers.entries()))
    
    if (response.ok) {
      const data = await response.json()
      
      console.log('\n✅ API Response Successful!')
      console.log('Response Structure:')
      console.log('- calculations:', Array.isArray(data.calculations) ? `Array[${data.calculations.length}]` : typeof data.calculations)
      console.log('- total:', data.total)
      console.log('- limit:', data.limit)
      console.log('- offset:', data.offset)
      
      if (data.calculations && data.calculations.length > 0) {
        console.log('\n📄 First Calculation Details:')
        const calc = data.calculations[0]
        console.log('- id:', calc.id)
        console.log('- calculationName:', calc.calculationName)
        console.log('- monthlyBenefit:', calc.monthlyBenefit)
        console.log('- annualBenefit:', calc.annualBenefit)
        console.log('- retirementAge:', calc.retirementAge)
        console.log('- yearsOfService:', calc.yearsOfService)
        console.log('- retirementGroup:', calc.retirementGroup)
        console.log('- retirementOption:', calc.retirementOption)
        console.log('- createdAt:', calc.createdAt)
        console.log('- socialSecurityData:', calc.socialSecurityData ? 'Present' : 'Null')
        console.log('- isFavorite:', calc.isFavorite)
        
        console.log('\n🔍 Complete First Calculation Object:')
        console.log(JSON.stringify(calc, null, 2))
        
        console.log('\n📊 All Calculations Summary:')
        data.calculations.forEach((calc, index) => {
          console.log(`${index + 1}. ${calc.calculationName} - $${calc.monthlyBenefit}/month`)
        })
      } else {
        console.log('\n⚠️  No calculations in response')
      }
      
      // Test what the frontend should receive
      console.log('\n🎭 Frontend Compatibility Test:')
      const frontendData = {
        calculations: data.calculations || [],
        loading: false,
        error: null
      }
      
      console.log('Frontend state would be:', {
        calculationsCount: frontendData.calculations.length,
        loading: frontendData.loading,
        hasError: !!frontendData.error
      })
      
    } else {
      const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }))
      console.log('\n❌ API Response Failed!')
      console.log('Error Data:', errorData)
    }
    
  } catch (error) {
    console.error('\n💥 API Test Failed:', error.message)
  }
}

async function testSessionContext() {
  console.log('\n🔐 SESSION CONTEXT TEST')
  console.log('=' .repeat(50))
  
  try {
    const sessionResponse = await fetch(`${BASE_URL}/api/auth/session`, {
      credentials: 'include'
    })
    
    const sessionData = await sessionResponse.json()
    
    console.log('Session Status:', sessionResponse.status)
    console.log('Session Data:', sessionData)
    
    if (sessionData && sessionData.user) {
      console.log('✅ Session active for:', sessionData.user.email || sessionData.user.name)
      return true
    } else {
      console.log('❌ No active session')
      return false
    }
  } catch (error) {
    console.error('Session test failed:', error.message)
    return false
  }
}

async function runCompleteTest() {
  const hasSession = await testSessionContext()
  
  if (hasSession) {
    await testAPIDirectly()
  } else {
    console.log('\n🔧 SOLUTION: Open http://localhost:3001 in browser and sign in first')
  }
  
  console.log('\n' + '='.repeat(50))
  console.log('🎯 NEXT STEPS:')
  console.log('1. If API returns data: Check frontend React components')
  console.log('2. If API fails: Check authentication/database')
  console.log('3. If data structure wrong: Fix API transformation')
  console.log('4. Check browser console for useRetirementData logs')
}

runCompleteTest().catch(console.error)
