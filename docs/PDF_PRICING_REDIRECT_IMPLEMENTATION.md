# PDF Pricing Redirect Implementation

## Overview

Implemented a user experience improvement where unauthenticated users attempting to access PDF generation features are redirected to the `/pricing` page instead of being prompted to sign in. This creates a better conversion funnel from feature discovery to subscription.

## Problem Solved

**Before**: Unauthenticated users saw generic "Sign In Required" messages
**After**: Unauthenticated users are redirected to pricing page with feature-specific messaging

## Implementation Details

### 1. Server-Side API Enhancement (`/app/api/pdf/generate/route.ts`)

Enhanced the authentication check to provide redirect information:

```typescript
if (!session?.user?.email) {
  console.log(`🔄 PDF Generation: Unauthenticated user attempting PDF generation`)
  return NextResponse.json(
    { 
      error: 'Authentication required',
      redirectTo: '/pricing?feature=pdf-reports',
      message: 'Please sign up to access PDF generation features'
    },
    { status: 401 }
  )
}
```

**Benefits:**
- Provides clear redirect path for client-side handling
- Includes feature context in query parameter
- Maintains proper HTTP status codes

### 2. PDF Generation Hook Updates (`/hooks/use-pdf-generation.ts`)

Added router functionality and redirect logic:

```typescript
// Handle unauthenticated users by redirecting to pricing
if (status === 'unauthenticated') {
  console.log('🔄 PDF Generation: Redirecting unauthenticated user to pricing page')
  router.push('/pricing?feature=pdf-reports')
  return false
}

// Handle server redirect responses
if (response.status === 401 && errorData.redirectTo) {
  console.log('🔄 PDF Generation: Server requested redirect to:', errorData.redirectTo)
  router.push(errorData.redirectTo)
  return false
}
```

**Benefits:**
- Immediate client-side redirect for unauthenticated users
- Handles server-side redirect responses
- Maintains feature context through query parameters

### 3. PDF Export Button Component (`/components/pdf/pdf-export-button.tsx`)

Updated unauthenticated user UI to promote pricing instead of sign-in:

```typescript
// Handle unauthenticated state - redirect to pricing
if (status === 'unauthenticated') {
  const handlePricingRedirect = () => {
    router.push('/pricing?feature=pdf-reports')
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <Button onClick={handlePricingRedirect}>
        <Crown className="w-4 h-4 mr-2 text-amber-500" />
        Generate PDF Report
      </Button>
      <Alert className="border-amber-200 bg-amber-50">
        <span>PDF reports are a Premium feature. Sign up to access professional retirement analysis.</span>
        <Button onClick={handlePricingRedirect}>View Pricing</Button>
      </Alert>
    </div>
  )
}
```

**Benefits:**
- Clear call-to-action for unauthenticated users
- Premium feature messaging instead of authentication messaging
- Consistent visual design with premium branding

### 4. Enhanced Pricing Page (`/app/pricing/page.tsx`)

Made pricing page feature-aware with dynamic messaging:

```typescript
const featureMessages = {
  'pdf-reports': {
    badge: 'PDF Reports',
    icon: FileText,
    title: 'Unlock Professional PDF Reports',
    description: 'Generate comprehensive retirement analysis reports...',
    highlight: 'You were trying to access PDF generation - a Premium feature.'
  },
  // ... other features
}

// Feature-specific highlight banner
{featureConfig.highlight && (
  <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-lg text-center">
    <div className="flex items-center justify-center gap-2 text-amber-800">
      <FeatureIcon className="w-5 h-5" />
      <span className="font-medium">{featureConfig.highlight}</span>
    </div>
  </div>
)}
```

**Benefits:**
- Contextual messaging based on feature attempted
- Clear value proposition for specific features
- Improved conversion potential

## User Journey Flow

### Before (Old Flow)
```
User clicks PDF button (unauthenticated)
    ↓
"Sign In Required" message
    ↓
User clicks "Sign In"
    ↓
Generic sign-in page
    ↓
User may or may not understand premium requirement
```

### After (New Flow)
```
User clicks PDF button (unauthenticated)
    ↓
Automatic redirect to /pricing?feature=pdf-reports
    ↓
Feature-specific pricing page with context
    ↓
"You were trying to access PDF generation - a Premium feature"
    ↓
Clear premium plans and value proposition
    ↓
Higher conversion potential
```

## Query Parameters

The implementation uses query parameters to maintain context:

- `?feature=pdf-reports` - For PDF generation attempts
- `?feature=wizard` - For retirement wizard attempts (extensible)
- No parameter - Default pricing page experience

## Testing Scenarios

1. **Unauthenticated PDF Generation**:
   - Visit any page with PDF export button while logged out
   - Click PDF generation button
   - Should redirect to `/pricing?feature=pdf-reports`
   - Should show feature-specific messaging

2. **Direct API Access**:
   - Make direct POST request to `/api/pdf/generate` without authentication
   - Should receive 401 with `redirectTo` field
   - Client should handle redirect appropriately

3. **Authenticated Users**:
   - Existing behavior unchanged
   - Premium users can generate PDFs
   - Non-premium users see upgrade prompts

## Benefits

1. **Improved Conversion**: Direct path from feature interest to subscription
2. **Better UX**: Clear value proposition instead of generic authentication
3. **Feature Context**: Users understand what they need premium for
4. **Extensible**: Easy to add more feature-specific redirects
5. **SEO Friendly**: Pricing page gets more traffic from feature discovery

## Files Modified

- `/app/api/pdf/generate/route.ts` - Enhanced authentication response
- `/hooks/use-pdf-generation.ts` - Added redirect logic
- `/components/pdf/pdf-export-button.tsx` - Updated unauthenticated UI
- `/app/pricing/page.tsx` - Added feature-aware messaging

## Future Enhancements

1. Add analytics tracking for feature-specific pricing page visits
2. Implement A/B testing for different messaging approaches
3. Add more feature-specific redirect scenarios (wizard, advanced calculations)
4. Consider personalized pricing based on attempted features
