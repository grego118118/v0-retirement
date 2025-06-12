# Authentication Fixes Testing Guide

## 🧪 **Testing Steps**

### **1. Test Session Debug Endpoint**
```bash
# Check session state
curl http://localhost:3000/api/auth/session-debug

# Expected response includes:
# - hasSession: true/false
# - sessionData with user info
# - headers information
# - authOptions validation
```

### **2. Test Profile Form Authentication**

#### **Valid Session Test**
1. Sign in to the application
2. Navigate to `/profile` page
3. Fill out profile form
4. Submit form
5. **Expected**: Success message and profile updates

#### **Session Expiry Test**
1. Sign in to the application
2. Wait for session to expire (or manually clear cookies)
3. Try to submit profile form
4. **Expected**: Session refresh attempt, then sign-in prompt

#### **No Session Test**
1. Ensure you're not signed in
2. Navigate to `/profile` page
3. Try to submit profile form
4. **Expected**: "Authentication Required" message with sign-in button

### **3. Test Session Recovery**

#### **Refresh Session Test**
1. Sign in and navigate to profile
2. Open browser dev tools → Application → Cookies
3. Delete NextAuth session cookies
4. Try to submit profile form
5. Click "Refresh Session" button
6. **Expected**: Session restored or sign-in prompt

#### **Automatic Retry Test**
1. Sign in and fill out profile form
2. Clear session cookies while form is filled
3. Submit form
4. **Expected**: Automatic session refresh attempt, then retry

## 🔍 **Debug Information to Monitor**

### **Browser Console Logs**
```javascript
// Look for these client-side logs:
"Session status changed: { status: 'authenticated', session: true, userId: 'user-id' }"
"Profile form submission started"
"Sending profile update request"
"Received 401, attempting session refresh..."
"Session refreshed"
```

### **Server Console Logs**
```javascript
// Look for these server-side logs:
"Profile POST request started"
"Session in profile POST: { hasSession: true, userId: 'user-id' }"
"Request headers: { cookie: 'present', authorization: 'missing' }"
"Profile update successful"
```

### **Network Tab Verification**
1. Open Developer Tools → Network tab
2. Submit profile form
3. Look for:
   - POST request to `/api/profile`
   - Response status (200 for success, 401 for auth error)
   - Request headers include cookies
   - Response includes success/error message

## ⚠️ **Common Issues & Solutions**

### **Issue**: "Session is loading" never resolves
**Debug Steps**:
1. Check `/api/auth/session-debug` endpoint
2. Verify SessionProvider in layout.tsx
3. Check NEXTAUTH_SECRET environment variable
4. Review browser console for NextAuth errors

### **Issue**: "No session found" despite being signed in
**Debug Steps**:
1. Check browser cookies for NextAuth tokens
2. Verify auth options configuration
3. Check server logs for session parsing errors
4. Test with `/api/auth/session-debug`

### **Issue**: Form submission hangs
**Debug Steps**:
1. Check network tab for failed requests
2. Review server logs for API errors
3. Verify database connection
4. Check for CORS issues

### **Issue**: Session refresh doesn't work
**Debug Steps**:
1. Verify `update` function from useSession
2. Check NextAuth configuration
3. Review session callback implementation
4. Test manual sign-in flow

## 📊 **Success Criteria**

### **Authentication Flow**
- ✅ Valid sessions allow profile updates
- ✅ Invalid sessions trigger recovery mechanisms
- ✅ Session refresh works automatically
- ✅ Manual sign-in option available

### **User Experience**
- ✅ Clear loading states during session operations
- ✅ Helpful error messages with recovery options
- ✅ Session status visible to user
- ✅ Smooth recovery from authentication issues

### **Error Handling**
- ✅ 401 errors trigger session refresh
- ✅ Failed refresh prompts for sign-in
- ✅ Network errors show appropriate messages
- ✅ All error states have recovery options

## 🔧 **Environment Verification**

### **Required Environment Variables**
```bash
# Check these are set:
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
POSTGRES_URL=your-database-url
```

### **Database Connection**
```sql
-- Verify users table exists
SELECT * FROM users LIMIT 1;

-- Verify users_metadata table exists
SELECT * FROM users_metadata LIMIT 1;

-- Check for user session data
SELECT id, email FROM users WHERE email = 'your-test-email@example.com';
```

## 🚀 **Performance Testing**

### **Session Load Time**
- Session should load within 1-2 seconds
- Profile form should be interactive immediately after session loads
- Session refresh should complete within 3 seconds

### **Error Recovery Time**
- Authentication errors should be detected within 1 second
- Session refresh should attempt within 2 seconds
- User should see recovery options within 3 seconds

The authentication fixes provide comprehensive error handling and recovery mechanisms. All testing scenarios should now pass with clear user feedback and automatic recovery options.
