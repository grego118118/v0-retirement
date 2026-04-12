/**
 * Test script for Stripe webhook functionality
 * This script simulates webhook events to test subscription status updates
 */

const crypto = require('crypto');

// Mock webhook events for testing
const mockEvents = {
  checkoutCompleted: {
    id: 'evt_test_webhook',
    object: 'event',
    api_version: '2025-05-28.basil',
    created: Math.floor(Date.now() / 1000),
    data: {
      object: {
        id: 'cs_test_checkout_session',
        object: 'checkout.session',
        customer: 'cus_test_customer',
        customer_details: {
          email: 'test@example.com'
        },
        subscription: 'sub_test_subscription',
        metadata: {
          user_email: 'test@example.com'
        }
      }
    },
    livemode: false,
    pending_webhooks: 1,
    request: {
      id: 'req_test_request',
      idempotency_key: null
    },
    type: 'checkout.session.completed'
  },
  
  subscriptionCreated: {
    id: 'evt_test_webhook_2',
    object: 'event',
    api_version: '2025-05-28.basil',
    created: Math.floor(Date.now() / 1000),
    data: {
      object: {
        id: 'sub_test_subscription',
        object: 'subscription',
        customer: 'cus_test_customer',
        status: 'active',
        current_period_end: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60), // 30 days from now
        cancel_at_period_end: false,
        trial_end: null,
        items: {
          data: [{
            price: {
              id: process.env.STRIPE_MONTHLY_PRICE_ID || 'price_test_monthly'
            }
          }]
        },
        metadata: {
          user_email: 'test@example.com'
        }
      }
    },
    livemode: false,
    pending_webhooks: 1,
    request: {
      id: 'req_test_request_2',
      idempotency_key: null
    },
    type: 'customer.subscription.created'
  },

  paymentSucceeded: {
    id: 'evt_test_webhook_3',
    object: 'event',
    api_version: '2025-05-28.basil',
    created: Math.floor(Date.now() / 1000),
    data: {
      object: {
        id: 'in_test_invoice',
        object: 'invoice',
        customer: 'cus_test_customer',
        subscription: 'sub_test_subscription',
        status: 'paid'
      }
    },
    livemode: false,
    pending_webhooks: 1,
    request: {
      id: 'req_test_request_3',
      idempotency_key: null
    },
    type: 'invoice.payment_succeeded'
  }
};

// Function to create webhook signature (for testing with actual Stripe webhook secret)
function createWebhookSignature(payload, secret) {
  const timestamp = Math.floor(Date.now() / 1000);
  const signedPayload = `${timestamp}.${payload}`;
  const signature = crypto
    .createHmac('sha256', secret)
    .update(signedPayload, 'utf8')
    .digest('hex');
  
  return `t=${timestamp},v1=${signature}`;
}

// Test function to send webhook events
async function testWebhook(eventType, webhookUrl = 'http://localhost:3000/api/subscription/webhook') {
  const event = mockEvents[eventType];
  if (!event) {
    console.error(`Unknown event type: ${eventType}`);
    return;
  }

  const payload = JSON.stringify(event);
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test_secret';
  const signature = createWebhookSignature(payload, webhookSecret);

  try {
    console.log(`\n🧪 Testing ${event.type} webhook...`);
    console.log(`📧 User email: ${event.data.object.customer_details?.email || event.data.object.metadata?.user_email}`);
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': signature,
      },
      body: payload,
    });

    const responseText = await response.text();
    
    if (response.ok) {
      console.log(`✅ Webhook processed successfully`);
      console.log(`📊 Response:`, responseText);
    } else {
      console.error(`❌ Webhook failed with status ${response.status}`);
      console.error(`📊 Response:`, responseText);
    }
  } catch (error) {
    console.error(`❌ Error sending webhook:`, error.message);
  }
}

// Test subscription status API
async function testSubscriptionStatus(userEmail = 'test@example.com') {
  try {
    console.log(`\n🔍 Testing subscription status for: ${userEmail}`);
    
    const response = await fetch(`http://localhost:3000/api/subscription/status?t=${Date.now()}`, {
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
      }
    });

    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Subscription status retrieved:`);
      console.log(`📊 Status:`, JSON.stringify(data, null, 2));
    } else {
      console.error(`❌ Failed to get subscription status: ${response.status}`);
      const errorText = await response.text();
      console.error(`📊 Error:`, errorText);
    }
  } catch (error) {
    console.error(`❌ Error checking subscription status:`, error.message);
  }
}

// Main test function
async function runTests() {
  console.log('🚀 Starting Stripe webhook tests...\n');
  
  // Test the complete flow
  console.log('📋 Testing complete subscription flow:');
  
  // 1. Test checkout completion
  await testWebhook('checkoutCompleted');
  await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
  
  // 2. Test subscription creation
  await testWebhook('subscriptionCreated');
  await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
  
  // 3. Test payment success
  await testWebhook('paymentSucceeded');
  await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
  
  // 4. Check final subscription status
  await testSubscriptionStatus();
  
  console.log('\n✨ Test completed!');
  console.log('\n📝 Next steps:');
  console.log('1. Check your database to verify user subscription status was updated');
  console.log('2. Test the billing page to confirm premium status is displayed');
  console.log('3. Test premium features to ensure they are unlocked');
}

// Run tests if this script is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = {
  testWebhook,
  testSubscriptionStatus,
  runTests,
  mockEvents
};
