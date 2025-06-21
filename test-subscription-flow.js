/**
 * Test script to verify subscription flow fix
 * Tests: demo payment completion → status check → premium recognition
 */

const testEmail = 'grego118@gmail.com';
const baseUrl = 'http://localhost:3000';

async function testSubscriptionFlow() {
  console.log('🧪 Testing Subscription Flow Fix...\n');
  
  try {
    // Step 1: Test initial status (should be free/inactive)
    console.log('1️⃣ Checking initial subscription status...');
    const initialStatus = await fetch(`${baseUrl}/api/subscription/status`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (initialStatus.ok) {
      const initialData = await initialStatus.json();
      console.log('Initial status:', {
        isPremium: initialData.isPremium,
        subscriptionStatus: initialData.subscriptionStatus,
        subscriptionPlan: initialData.subscriptionPlan
      });
    } else {
      console.log('❌ Initial status check failed:', initialStatus.status);
    }
    
    // Step 2: Simulate demo payment completion
    console.log('\n2️⃣ Simulating demo payment completion...');
    const demoPayment = await fetch(`${baseUrl}/api/subscription/complete-demo`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ planType: 'monthly' })
    });
    
    if (demoPayment.ok) {
      const paymentData = await demoPayment.json();
      console.log('✅ Demo payment completed:', paymentData);
    } else {
      console.log('❌ Demo payment failed:', demoPayment.status);
      const errorData = await demoPayment.text();
      console.log('Error details:', errorData);
    }
    
    // Step 3: Check status after payment (should be premium/active)
    console.log('\n3️⃣ Checking subscription status after payment...');
    const finalStatus = await fetch(`${baseUrl}/api/subscription/status`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (finalStatus.ok) {
      const finalData = await finalStatus.json();
      console.log('Final status:', {
        isPremium: finalData.isPremium,
        subscriptionStatus: finalData.subscriptionStatus,
        subscriptionPlan: finalData.subscriptionPlan
      });
      
      // Verify the fix worked
      if (finalData.isPremium && finalData.subscriptionStatus === 'active') {
        console.log('\n🎉 SUCCESS: Subscription flow is working correctly!');
        console.log('✅ Premium status properly recognized after demo payment');
      } else {
        console.log('\n❌ FAILURE: Subscription flow still broken');
        console.log('❌ Premium status not recognized after demo payment');
      }
    } else {
      console.log('❌ Final status check failed:', finalStatus.status);
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

// Run the test
testSubscriptionFlow();
