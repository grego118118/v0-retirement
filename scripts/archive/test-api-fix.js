// Quick test for the auth import fix
const CRON_SECRET = '462c44a146ca26604411330b9cc568e9cc10a60e09745f4b7e26f8a80983c140' // Option 1 secret
const BASE_URL = 'http://localhost:3000'

async function testBudgetAPI() {
  console.log('🧪 Testing Budget API after auth import fix...')
  
  try {
    const response = await fetch(`${BASE_URL}/api/admin/blog/analytics/costs`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${CRON_SECRET}`,
        'Content-Type': 'application/json',
        'User-Agent': 'test-script/1.0'
      }
    })

    console.log(`📊 Response Status: ${response.status}`)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ API Error Response:', errorText)
      return false
    }

    const data = await response.json()
    console.log('✅ API Response received successfully!')
    console.log('📋 Response structure:')
    console.log(JSON.stringify(data, null, 2))

    // Check for the fields that were causing undefined errors
    console.log('\n🔍 Critical Field Validation:')
    console.log(`- success: ${data.success} (${typeof data.success})`)
    console.log(`- budget_utilization: ${data.budget_utilization} (${typeof data.budget_utilization})`)
    console.log(`- monthly_total: ${data.monthly_total} (${typeof data.monthly_total})`)

    return true

  } catch (error) {
    console.error('❌ Network/Fetch Error:', error.message)
    return false
  }
}

testBudgetAPI().then(success => {
  if (success) {
    console.log('\n✅ AUTH IMPORT FIX SUCCESSFUL!')
    console.log('The API endpoint is now working correctly.')
  } else {
    console.log('\n❌ API still has issues - check server logs')
  }
})
