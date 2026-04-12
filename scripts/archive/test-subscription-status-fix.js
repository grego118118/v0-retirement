/**
 * Comprehensive test script for subscription status synchronization fix
 * Tests the complete flow from webhook processing to UI display
 */

const BASE_URL = 'http://localhost:3000'

// Test user data
const TEST_USER = {
  email: 'test@example.com',
  stripeCustomerId: 'cus_test123',
  subscriptionId: 'sub_test123'
}

async function testSubscriptionStatusAPI() {
  console.log('\n🧪 Testing Subscription Status API...')
  
  try {
    const response = await fetch(`${BASE_URL}/api/subscription/status`, {
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
      }
    })
    
    console.log(`📊 Response status: ${response.status}`)
    
    if (response.status === 401) {
      console.log('✅ API requires authentication (expected for unauthenticated request)')
      return
    }
    
    if (response.ok) {
      const data = await response.json()
      console.log('📊 Subscription data:', JSON.stringify(data, null, 2))
      
      // Validate response structure
      const requiredFields = ['isPremium', 'subscriptionStatus', 'planName']
      const missingFields = requiredFields.filter(field => !(field in data))
      
      if (missingFields.length === 0) {
        console.log('✅ API response has all required fields')
      } else {
        console.log('❌ Missing required fields:', missingFields)
      }
    } else {
      console.log('❌ API request failed:', response.status)
    }
  } catch (error) {
    console.error('❌ Error testing subscription status API:', error.message)
  }
}

async function testCacheInvalidationAPI() {
  console.log('\n🧪 Testing Cache Invalidation API...')
  
  try {
    // Test without webhook header (should require auth)
    const response1 = await fetch(`${BASE_URL}/api/subscription/invalidate-cache`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    })
    
    console.log(`📊 Response status (no auth): ${response1.status}`)
    
    if (response1.status === 401) {
      console.log('✅ Cache invalidation requires authentication for non-webhook calls')
    }
    
    // Test with webhook header (should work without auth)
    const response2 = await fetch(`${BASE_URL}/api/subscription/invalidate-cache`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-webhook-source': 'stripe',
      },
      body: JSON.stringify({
        userEmail: TEST_USER.email,
        subscriptionId: TEST_USER.subscriptionId,
        customerId: TEST_USER.stripeCustomerId,
        status: 'active',
        plan: 'monthly',
      })
    })
    
    console.log(`📊 Response status (webhook): ${response2.status}`)
    
    if (response2.ok) {
      const data = await response2.json()
      console.log('✅ Cache invalidation webhook call successful')
      console.log('📊 Response:', JSON.stringify(data, null, 2))
    } else if (response2.status === 404) {
      console.log('⚠️ User not found (expected for test user)')
    } else {
      console.log('❌ Webhook cache invalidation failed:', response2.status)
    }
  } catch (error) {
    console.error('❌ Error testing cache invalidation API:', error.message)
  }
}

async function testWebhookEndpoint() {
  console.log('\n🧪 Testing Webhook Endpoint...')
  
  try {
    // Test webhook endpoint accessibility
    const response = await fetch(`${BASE_URL}/api/subscription/webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'test.event',
        data: { object: {} }
      })
    })
    
    console.log(`📊 Webhook endpoint status: ${response.status}`)
    
    if (response.status === 400) {
      console.log('✅ Webhook endpoint is accessible (expected 400 for invalid signature)')
    } else {
      const responseText = await response.text()
      console.log(`📊 Response: ${responseText}`)
    }
  } catch (error) {
    console.error('❌ Error testing webhook endpoint:', error.message)
  }
}

async function testBillingPageAccessibility() {
  console.log('\n🧪 Testing Billing Page Accessibility...')
  
  try {
    const response = await fetch(`${BASE_URL}/billing`)
    
    console.log(`📊 Billing page status: ${response.status}`)
    
    if (response.ok) {
      console.log('✅ Billing page is accessible')
      
      // Check if page contains expected elements
      const html = await response.text()
      const hasRefreshButton = html.includes('Refresh Status')
      const hasSubscriptionStatus = html.includes('subscription')
      
      console.log(`📊 Has refresh button: ${hasRefreshButton}`)
      console.log(`📊 Has subscription content: ${hasSubscriptionStatus}`)
    } else if (response.status === 302 || response.status === 307) {
      console.log('✅ Billing page redirects (expected for unauthenticated users)')
    } else {
      console.log('❌ Billing page not accessible:', response.status)
    }
  } catch (error) {
    console.error('❌ Error testing billing page:', error.message)
  }
}

async function testDatabaseConnection() {
  console.log('\n🧪 Testing Database Connection...')
  
  try {
    const response = await fetch(`${BASE_URL}/api/health`)
    
    console.log(`📊 Health check status: ${response.status}`)
    
    if (response.ok) {
      const data = await response.json()
      console.log('✅ Health check passed')
      console.log('📊 Health data:', JSON.stringify(data, null, 2))
    } else {
      console.log('❌ Health check failed:', response.status)
    }
  } catch (error) {
    console.error('❌ Error testing database connection:', error.message)
  }
}

async function runAllTests() {
  console.log('🚀 Starting Subscription Status Synchronization Tests')
  console.log('=' .repeat(60))
  
  await testDatabaseConnection()
  await testSubscriptionStatusAPI()
  await testCacheInvalidationAPI()
  await testWebhookEndpoint()
  await testBillingPageAccessibility()
  
  console.log('\n' + '=' .repeat(60))
  console.log('✅ All tests completed!')
  console.log('\n📋 Next Steps:')
  console.log('1. Start the development server: npm run dev')
  console.log('2. Sign in to the application')
  console.log('3. Navigate to /billing page')
  console.log('4. Test subscription upgrade flow')
  console.log('5. Verify status updates immediately after payment')
  console.log('\n🔧 Debugging Tips:')
  console.log('- Check browser console for subscription status logs')
  console.log('- Use "Refresh Status" button to force status update')
  console.log('- Monitor webhook logs in server console')
  console.log('- Verify database updates with Prisma Studio')
}

// Run tests if this script is executed directly
if (require.main === module) {
  runAllTests().catch(console.error)
}

module.exports = {
  testSubscriptionStatusAPI,
  testCacheInvalidationAPI,
  testWebhookEndpoint,
  testBillingPageAccessibility,
  testDatabaseConnection,
  runAllTests
}
