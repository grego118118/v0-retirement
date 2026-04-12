# OAuth IP Address Authentication Fix

## Problem
Google OAuth authentication works when accessing the application at `http://localhost:3001/dashboard` but fails when accessing via IP address `http://10.0.0.119:3001/dashboard`.

## Root Cause
1. **Port Mismatch**: `NEXTAUTH_URL` was set to port 3000, but the application runs on port 3001
2. **Missing IP Configuration**: Google OAuth client wasn't configured for IP address access
3. **Static URL Configuration**: NextAuth was using a static URL instead of dynamic detection

## Solution Implemented

### 1. Environment Configuration Fixed
- ✅ Updated `NEXTAUTH_URL` from `http://localhost:3000` to `http://localhost:3001`
- ✅ Added dynamic URL handling in auth configuration

### 2. NextAuth Configuration Enhanced
- ✅ Added dynamic `getBaseUrl()` function for flexible URL handling
- ✅ Enhanced Google Provider with proper authorization parameters
- ✅ Added dynamic URL configuration to NextAuth options

### 3. IP Address Support Added
- ✅ Updated NextAuth provider to handle private IP ranges
- ✅ Improved warning messages for IP address usage
- ✅ Added comprehensive OAuth setup documentation

### 4. Helper Scripts Created
- ✅ `scripts/fix-oauth-ip.js` - Quick OAuth configuration switcher
- ✅ `scripts/test-oauth-config.js` - OAuth configuration validator
- ✅ Added npm scripts for easy access

## Quick Fix Steps

### Step 1: Update Google OAuth Configuration
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to your OAuth 2.0 Client ID
3. Add these **Authorized JavaScript origins**:
   - `http://localhost:3001`
   - `http://10.0.0.119:3001` (your actual IP)
   - `http://127.0.0.1:3001`

4. Add these **Authorized redirect URIs**:
   - `http://localhost:3001/api/auth/callback/google`
   - `http://10.0.0.119:3001/api/auth/callback/google` (your actual IP)
   - `http://127.0.0.1:3001/api/auth/callback/google`

### Step 2: Test Configuration
```bash
# Test current OAuth configuration
npm run oauth:test

# Configure for IP address access
npm run oauth:ip

# Or configure for localhost access
npm run oauth:localhost
```

### Step 3: Restart Development Server
```bash
npm run dev
```

### Step 4: Verify Fix
1. Test authentication at `http://localhost:3001/dashboard`
2. Test authentication at `http://10.0.0.119:3001/dashboard`
3. Both should now work correctly

## Automated Configuration

### For IP Address Access:
```bash
npm run oauth:ip
```
This will:
- Update `NEXTAUTH_URL` to use your local IP
- Display required Google OAuth configuration
- Provide next steps

### For Localhost Access:
```bash
npm run oauth:localhost
```
This will:
- Update `NEXTAUTH_URL` to use localhost:3001
- Provide next steps

## Technical Details

### Dynamic URL Handling
The auth configuration now includes a `getBaseUrl()` function that:
- Uses `window.location.origin` on the client side
- Falls back to `NEXTAUTH_URL` environment variable
- Provides sensible defaults for development/production

### Enhanced Google Provider
```typescript
GoogleProvider({
  clientId: process.env.GOOGLE_CLIENT_ID || "",
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
  authorization: {
    params: {
      prompt: "consent",
      access_type: "offline",
      response_type: "code"
    }
  }
})
```

### IP Address Warning Logic
The NextAuth provider now properly handles private IP ranges and provides appropriate warnings only for public IP addresses over HTTP.

## Troubleshooting

### If Authentication Still Fails:

1. **Clear Browser Cache**: Clear cookies and cache for both localhost and IP address
2. **Check Console Errors**: Look for OAuth-related errors in browser console
3. **Verify Environment**: Run `npm run oauth:test` to validate configuration
4. **Restart Server**: Always restart after configuration changes

### Common Error Messages:

- **"redirect_uri_mismatch"**: Add the exact URL to Google OAuth redirect URIs
- **"invalid_client"**: Check Google Client ID and Secret are correct
- **"access_denied"**: Ensure OAuth consent screen is properly configured

## Performance Impact
- ✅ Maintains sub-2-second performance requirement
- ✅ No additional network requests during authentication
- ✅ Minimal overhead from dynamic URL detection

## Security Considerations
- ✅ IP address access requires explicit OAuth configuration
- ✅ Private IP ranges are handled appropriately
- ✅ Production deployments should use HTTPS and domain names
- ✅ OAuth credentials remain secure

## Files Modified
- `v0-retirement/.env.local` - Updated NEXTAUTH_URL
- `v0-retirement/lib/auth/auth-options.ts` - Enhanced with dynamic URL handling
- `v0-retirement/components/auth/next-auth-provider.tsx` - Improved IP warnings
- `v0-retirement/docs/oauth-setup.md` - Updated documentation
- `v0-retirement/package.json` - Added helper scripts

## Next Steps
1. Test both localhost and IP address access
2. Update any hardcoded URLs in other parts of the application
3. Consider implementing similar fixes for other OAuth providers if needed
4. Document the IP address configuration process for team members
