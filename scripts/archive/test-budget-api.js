// Test script to verify the budget API endpoint works
// Run with: node test-budget-api.js

const CRON_SECRET = process.env.CRON_SECRET || 'your_test_secret'
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'

async function testBudgetAPI() {
  try {
    console.log('🧪 Testing Budget API Endpoint...')
    console.log(`📍 URL: ${BASE_URL}/api/admin/blog/analytics/costs`)
    
    const response = await fetch(`${BASE_URL}/api/admin/blog/analytics/costs`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${CRON_SECRET}`,
        'Content-Type': 'application/json'
      }
    })

    console.log(`📊 Response Status: ${response.status}`)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ API Error:', errorText)
      return
    }

    const data = await response.json()
    console.log('✅ API Response:')
    console.log(JSON.stringify(data, null, 2))

    // Test the specific fields that n8n workflow needs
    console.log('\n🎯 Key Fields for n8n:')
    console.log(`- budget_utilization: ${data.budget_utilization}%`)
    console.log(`- monthly_total: $${data.monthly_total}`)
    console.log(`- status: ${data.status}`)
    console.log(`- success: ${data.success}`)

    // Verify the workflow condition
    if (data.budget_utilization < 90) {
      console.log('✅ Budget check PASSED - Content generation should proceed')
    } else {
      console.log('⚠️ Budget check FAILED - Content generation should be paused')
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

// Run the test
testBudgetAPI()
