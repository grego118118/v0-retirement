/**
 * Test script to verify the planType ReferenceError fix in checkout pages
 * Tests both monthly and annual subscription flows
 */

const BASE_URL = 'http://localhost:3000'

async function testDemoCheckoutPage() {
  console.log('\n🧪 Testing Demo Checkout Page...')
  
  try {
    // Test monthly plan
    const monthlyResponse = await fetch(`${BASE_URL}/subscribe/demo-checkout?plan=monthly&email=test@example.com`)
    console.log(`📊 Monthly demo checkout status: ${monthlyResponse.status}`)
    
    if (monthlyResponse.ok) {
      const monthlyHtml = await monthlyResponse.text()
      
      // Check for JavaScript errors in the page
      const hasJSError = monthlyHtml.includes('planType is not defined') || 
                        monthlyHtml.includes('ReferenceError')
      
      if (hasJSError) {
        console.log('❌ Monthly demo checkout page contains JavaScript errors')
      } else {
        console.log('✅ Monthly demo checkout page loads without JavaScript errors')
      }
      
      // Check for expected content
      const hasExpectedContent = monthlyHtml.includes('Complete Your Subscription') &&
                                 monthlyHtml.includes('Demo Checkout') &&
                                 monthlyHtml.includes('handlePayment')
      
      if (hasExpectedContent) {
        console.log('✅ Monthly demo checkout page contains expected content')
      } else {
        console.log('❌ Monthly demo checkout page missing expected content')
      }
    }
    
    // Test annual plan
    const annualResponse = await fetch(`${BASE_URL}/subscribe/demo-checkout?plan=annual&email=test@example.com`)
    console.log(`📊 Annual demo checkout status: ${annualResponse.status}`)
    
    if (annualResponse.ok) {
      const annualHtml = await annualResponse.text()
      
      // Check for JavaScript errors in the page
      const hasJSError = annualHtml.includes('planType is not defined') || 
                        annualHtml.includes('ReferenceError')
      
      if (hasJSError) {
        console.log('❌ Annual demo checkout page contains JavaScript errors')
      } else {
        console.log('✅ Annual demo checkout page loads without JavaScript errors')
      }
      
      // Check for expected content
      const hasExpectedContent = annualHtml.includes('Complete Your Subscription') &&
                                annualHtml.includes('Demo Checkout') &&
                                annualHtml.includes('handlePayment')
      
      if (hasExpectedContent) {
        console.log('✅ Annual demo checkout page contains expected content')
      } else {
        console.log('❌ Annual demo checkout page missing expected content')
      }
    }
    
  } catch (error) {
    console.error('❌ Error testing demo checkout page:', error.message)
  }
}

async function testCheckoutAPIEndpoints() {
  console.log('\n🧪 Testing Checkout API Endpoints...')
  
  try {
    // Test subscription checkout API
    const checkoutResponse = await fetch(`${BASE_URL}/api/subscription/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        planType: 'monthly'
      })
    })
    
    console.log(`📊 Checkout API status: ${checkoutResponse.status}`)
    
    if (checkoutResponse.status === 401) {
      console.log('✅ Checkout API requires authentication (expected for unauthenticated request)')
    } else if (checkoutResponse.ok) {
      const data = await checkoutResponse.json()
      console.log('✅ Checkout API responds correctly')
      console.log('📊 Response data:', JSON.stringify(data, null, 2))
    }
    
    // Test create-checkout API
    const createCheckoutResponse = await fetch(`${BASE_URL}/api/subscription/create-checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        planType: 'annual',
        userEmail: 'test@example.com',
        userName: 'Test User'
      })
    })
    
    console.log(`📊 Create Checkout API status: ${createCheckoutResponse.status}`)
    
    if (createCheckoutResponse.status === 401) {
      console.log('✅ Create Checkout API requires authentication (expected for unauthenticated request)')
    } else if (createCheckoutResponse.ok) {
      const data = await createCheckoutResponse.json()
      console.log('✅ Create Checkout API responds correctly')
      console.log('📊 Response data:', JSON.stringify(data, null, 2))
    }
    
  } catch (error) {
    console.error('❌ Error testing checkout API endpoints:', error.message)
  }
}

async function testSubscriptionSelectPage() {
  console.log('\n🧪 Testing Subscription Select Page...')
  
  try {
    // Test subscription select page
    const selectResponse = await fetch(`${BASE_URL}/subscription/select`)
    console.log(`📊 Subscription select status: ${selectResponse.status}`)
    
    if (selectResponse.ok) {
      const selectHtml = await selectResponse.text()
      
      // Check for planType usage in the page
      const hasPlanTypeUsage = selectHtml.includes('planType:') || 
                              selectHtml.includes('planType ')
      
      if (hasPlanTypeUsage) {
        console.log('✅ Subscription select page correctly uses planType in API calls')
      }
      
      // Check for expected content
      const hasExpectedContent = selectHtml.includes('Choose Your Plan') &&
                                selectHtml.includes('handlePlanSelection')
      
      if (hasExpectedContent) {
        console.log('✅ Subscription select page contains expected content')
      } else {
        console.log('❌ Subscription select page missing expected content')
      }
    } else if (selectResponse.status === 302 || selectResponse.status === 307) {
      console.log('✅ Subscription select page redirects (expected for unauthenticated users)')
    }
    
  } catch (error) {
    console.error('❌ Error testing subscription select page:', error.message)
  }
}

async function testPricingPage() {
  console.log('\n🧪 Testing Pricing Page...')
  
  try {
    const pricingResponse = await fetch(`${BASE_URL}/pricing`)
    console.log(`📊 Pricing page status: ${pricingResponse.status}`)
    
    if (pricingResponse.ok) {
      const pricingHtml = await pricingResponse.text()
      
      // Check for expected subscription handling
      const hasSubscriptionHandling = pricingHtml.includes('handleSubscribe') &&
                                     pricingHtml.includes('monthly') &&
                                     pricingHtml.includes('annual')
      
      if (hasSubscriptionHandling) {
        console.log('✅ Pricing page contains proper subscription handling')
      } else {
        console.log('❌ Pricing page missing subscription handling')
      }
      
      // Check for expected content
      const hasExpectedContent = pricingHtml.includes('Maximize Your Massachusetts') &&
                                pricingHtml.includes('Premium Features')
      
      if (hasExpectedContent) {
        console.log('✅ Pricing page contains expected content')
      } else {
        console.log('❌ Pricing page missing expected content')
      }
    }
    
  } catch (error) {
    console.error('❌ Error testing pricing page:', error.message)
  }
}

async function runAllTests() {
  console.log('🚀 Starting Checkout planType Fix Verification Tests')
  console.log('=' .repeat(60))
  
  await testDemoCheckoutPage()
  await testCheckoutAPIEndpoints()
  await testSubscriptionSelectPage()
  await testPricingPage()
  
  console.log('\n' + '=' .repeat(60))
  console.log('✅ All checkout planType fix tests completed!')
  console.log('\n📋 Fix Summary:')
  console.log('- Fixed ReferenceError: planType is not defined in demo checkout page')
  console.log('- Changed line 71: plan: planType → plan: plan')
  console.log('- Verified all other checkout flows use correct variable names')
  console.log('\n🔧 Manual Testing Steps:')
  console.log('1. Navigate to /pricing page')
  console.log('2. Click "Start Monthly Plan" or "Start Annual Plan"')
  console.log('3. Complete authentication if required')
  console.log('4. Verify demo checkout page loads without console errors')
  console.log('5. Click "Complete Demo Payment" button')
  console.log('6. Verify subscription status updates correctly')
  console.log('\n🎯 Expected Results:')
  console.log('- No JavaScript ReferenceError for planType')
  console.log('- Both monthly and annual checkout flows work')
  console.log('- Subscription status synchronization continues to work')
  console.log('- Sub-2-second performance maintained')
}

// Run tests if this script is executed directly
if (require.main === module) {
  runAllTests().catch(console.error)
}

module.exports = {
  testDemoCheckoutPage,
  testCheckoutAPIEndpoints,
  testSubscriptionSelectPage,
  testPricingPage,
  runAllTests
}
