/**
 * Simple test to verify webhook endpoint is accessible
 */

async function testWebhookEndpoint() {
  try {
    console.log('🧪 Testing webhook endpoint accessibility...');
    
    const response = await fetch('http://localhost:3000/api/subscription/webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ test: 'ping' })
    });

    console.log(`📊 Response status: ${response.status}`);
    const responseText = await response.text();
    console.log(`📊 Response body: ${responseText}`);

    if (response.status === 400) {
      console.log('✅ Webhook endpoint is accessible (expected 400 for missing signature)');
    } else {
      console.log(`⚠️  Unexpected response status: ${response.status}`);
    }
  } catch (error) {
    console.error('❌ Error testing webhook endpoint:', error.message);
  }
}

async function testSubscriptionStatusEndpoint() {
  try {
    console.log('\n🧪 Testing subscription status endpoint...');
    
    const response = await fetch('http://localhost:3000/api/subscription/status');
    console.log(`📊 Response status: ${response.status}`);
    
    if (response.status === 401) {
      console.log('✅ Subscription status endpoint is accessible (expected 401 for no auth)');
    } else {
      const responseText = await response.text();
      console.log(`📊 Response body: ${responseText}`);
    }
  } catch (error) {
    console.error('❌ Error testing subscription status endpoint:', error.message);
  }
}

async function testCacheInvalidationEndpoint() {
  try {
    console.log('\n🧪 Testing cache invalidation endpoint...');
    
    const response = await fetch('http://localhost:3000/api/subscription/invalidate-cache', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    console.log(`📊 Response status: ${response.status}`);
    
    if (response.status === 401) {
      console.log('✅ Cache invalidation endpoint is accessible (expected 401 for no auth)');
    } else {
      const responseText = await response.text();
      console.log(`📊 Response body: ${responseText}`);
    }
  } catch (error) {
    console.error('❌ Error testing cache invalidation endpoint:', error.message);
  }
}

async function runEndpointTests() {
  console.log('🚀 Starting endpoint accessibility tests...\n');
  
  await testWebhookEndpoint();
  await testSubscriptionStatusEndpoint();
  await testCacheInvalidationEndpoint();
  
  console.log('\n✨ Endpoint tests completed!');
  console.log('\n📝 Summary:');
  console.log('- Webhook endpoint: /api/subscription/webhook');
  console.log('- Status endpoint: /api/subscription/status');
  console.log('- Cache invalidation: /api/subscription/invalidate-cache');
  console.log('\n🔧 Next steps:');
  console.log('1. Configure Stripe webhook to point to /api/subscription/webhook');
  console.log('2. Test with actual Stripe checkout flow');
  console.log('3. Verify subscription status updates correctly');
}

// Run tests if this script is executed directly
if (require.main === module) {
  runEndpointTests().catch(console.error);
}

module.exports = {
  testWebhookEndpoint,
  testSubscriptionStatusEndpoint,
  testCacheInvalidationEndpoint,
  runEndpointTests
};
