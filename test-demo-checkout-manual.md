# Manual Demo Checkout Test Instructions

## Test Objective
Verify that the demo checkout flow properly updates the billing page to show premium status immediately after completion.

## Pre-Test Setup
1. **Ensure server is running**: `npm run dev`
2. **Open browser**: Navigate to `http://localhost:3000`
3. **Sign in**: Use Google OAuth to authenticate

## Test Steps

### Step 1: Check Initial Billing Status
1. Navigate to: `http://localhost:3000/billing`
2. **Expected**: Should show "Free Account" status
3. **Record**: Take screenshot of current status
4. **Note**: Account type, subscription details, and payment method sections

### Step 2: Access Demo Checkout
1. Navigate to: `http://localhost:3000/subscribe/demo-checkout?plan=monthly`
2. **Expected**: Demo checkout page loads with monthly plan selected
3. **Verify**: Page shows $9.99/month plan details
4. **Check**: "Complete Demo Payment" button is visible

### Step 3: Complete Demo Payment
1. Click "Complete Demo Payment" button
2. **Expected**: 
   - Button shows "Processing Payment..." with spinner
   - Processing takes ~2 seconds
   - Success message appears
   - Automatic redirect to success page after 2 seconds
3. **Monitor**: Browser console for any errors
4. **Check**: Network tab for API calls to `/api/subscription/complete-demo`

### Step 4: Verify Immediate Status Update
1. **Before redirect**: Check if subscription update event is triggered
2. **After redirect**: Navigate back to billing page: `http://localhost:3000/billing`
3. **Expected Changes**:
   - Account type changes from "Free Account" to "Premium Account" 
   - Subscription status shows "Active"
   - Plan shows "Stripe Monthly" or similar
   - Billing type shows "Stripe Subscription"
   - Next payment date is populated
   - Premium features are unlocked

### Step 5: Verify Premium Features
1. Navigate to calculator pages
2. **Check**: Premium features are accessible
3. **Verify**: No upgrade prompts appear
4. **Test**: Save calculations (should be unlimited)

## Expected API Responses

### Demo Checkout Completion
```json
{
  "success": true,
  "message": "Demo subscription activated successfully",
  "user": {
    "email": "user@example.com",
    "subscriptionStatus": "active",
    "subscriptionPlan": "monthly",
    "currentPeriodEnd": "2025-07-15T..."
  }
}
```

### Subscription Status After Demo
```json
{
  "isPremium": true,
  "subscriptionStatus": "active",
  "plan": "stripe_monthly",
  "planName": "Stripe Monthly",
  "billingType": "stripe_subscription",
  "accountType": "premium",
  "accessLevel": "full"
}
```

## Debugging Steps

### If Billing Page Still Shows "Free Account"

1. **Check Browser Console**:
   - Look for JavaScript errors
   - Verify subscription update events are fired
   - Check API response from `/api/subscription/status`

2. **Force Refresh Billing Data**:
   - Hard refresh the billing page (Ctrl+F5)
   - Clear browser cache
   - Try incognito/private browsing mode

3. **Check Network Requests**:
   - Verify `/api/subscription/status` is called with cache-busting timestamp
   - Check response contains updated subscription data
   - Ensure no 401/403 authentication errors

4. **Verify Database Update**:
   - Check server logs for demo completion success
   - Verify cache invalidation was triggered
   - Look for any database update errors

### Common Issues and Solutions

1. **Authentication Issues**:
   - Ensure user is properly signed in
   - Check session validity
   - Try signing out and back in

2. **Caching Issues**:
   - Billing page uses cache-busting timestamps
   - Subscription hook should refresh on visibility change
   - Custom events should trigger data refresh

3. **API Errors**:
   - Check server logs for errors
   - Verify all environment variables are set
   - Ensure database is accessible

## Success Criteria

✅ **Demo checkout completes without errors**
✅ **Billing page immediately shows "Premium Account"**
✅ **Subscription status is "Active"**
✅ **Premium features are unlocked**
✅ **No manual refresh required**

## Failure Investigation

If the test fails:

1. **Check Server Logs**: Look for errors in demo completion or subscription status
2. **Verify Database**: Ensure user record was updated with active subscription
3. **Test API Directly**: Use browser dev tools to call `/api/subscription/status`
4. **Check Event Handling**: Verify subscription update events are properly handled

## Browser Console Commands for Debugging

```javascript
// Check current subscription status
fetch('/api/subscription/status?t=' + Date.now())
  .then(r => r.json())
  .then(console.log)

// Trigger subscription update event
window.dispatchEvent(new CustomEvent('subscription-updated', {
  detail: { status: 'active', plan: 'monthly', source: 'manual-test' }
}))

// Check if billing page event listeners are working
console.log('Event listeners:', window.getEventListeners ? window.getEventListeners(window) : 'Use Chrome DevTools')
```

## Expected Timeline
- **Demo payment processing**: 2 seconds
- **Database update**: < 1 second
- **Cache invalidation**: < 1 second
- **Billing page refresh**: Immediate on navigation
- **Total time to see premium status**: < 5 seconds

This test should demonstrate that the demo checkout flow properly activates premium subscriptions and immediately reflects the status change on the billing page without requiring manual intervention or page refreshes.
