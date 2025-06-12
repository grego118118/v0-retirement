# Authentication Fix Testing Guide

## 🧪 **Quick Testing Steps**

### **1. Verify Configuration Consistency**
```bash
# Check all auth imports are consistent
grep -r "auth-config" app/api/ lib/
# Expected: No results (all should use auth-options)

grep -r "auth-options" app/api/ lib/
# Expected: All API files should use auth-options
```

### **2. Test Session Debug Endpoint**
```bash
# Start development server
npm run dev

# Test session debug (should work even without authentication)
curl http://localhost:3000/api/auth/session-debug
# Expected: JSON response with session state
```

### **3. Test Authentication Flow**

#### **Step 1: Sign In**
1. Open browser to `http://localhost:3000/auth/signin`
2. Sign in with Google account
3. **Expected**: Redirected to dashboard/profile

#### **Step 2: Check Session**
1. Open browser dev tools → Network tab
2. Navigate to `http://localhost:3000/api/auth/session-debug`
3. **Expected Response**:
```json
{
  "hasSession": true,
  "sessionData": {
    "hasUser": true,
    "userId": "some-uuid",
    "userEmail": "your-email@gmail.com"
  }
}
```

#### **Step 3: Test Profile Form**
1. Navigate to `/profile` page
2. Fill out profile form:
   - **Name**: "Test User"
   - **Retirement Date**: Future date
3. Click "Update Profile"
4. **Expected**: Success toast, no authentication errors

### **4. Monitor Server Logs**
```bash
# Watch for authentication logs
npm run dev | grep -E "(JWT callback|Session callback|Profile POST|Creating user)"

# Expected logs during sign-in:
# "JWT callback: { token: true, user: true, account: true }"
# "Creating new user for Google OAuth: user@gmail.com"
# "JWT: Set user ID from database: uuid"
# "Session: Set user ID: uuid"

# Expected logs during profile update:
# "Profile POST request started"
# "Session in profile POST: { hasSession: true, userId: 'uuid' }"
# "Profile update successful"
```

## ⚠️ **Common Issues & Solutions**

### **Issue**: "No session found" error
**Cause**: Database connection or user creation failure
**Debug**:
1. Check database connection: `npm run db:test`
2. Verify environment variables: `POSTGRES_URL`, `NEXTAUTH_SECRET`
3. Check server logs for database errors

**Solution**:
```bash
# Verify database setup
npm run setup:db

# Check environment variables
echo $NEXTAUTH_SECRET
echo $POSTGRES_URL
```

### **Issue**: "Session missing user ID" error
**Cause**: JWT callback not setting user ID properly
**Debug**:
1. Check server logs for "JWT callback" messages
2. Verify Google OAuth user creation
3. Check database for user record

**Solution**:
```sql
-- Check if user exists in database
SELECT * FROM users WHERE email = 'your-email@gmail.com';

-- If no user, manually create for testing
INSERT INTO users (id, email, created_at, updated_at) 
VALUES (gen_random_uuid(), 'your-email@gmail.com', NOW(), NOW());
```

### **Issue**: Profile form still shows authentication error
**Cause**: Client-side session not updated
**Debug**:
1. Clear browser cookies and session storage
2. Sign out and sign in again
3. Check browser dev tools for session data

**Solution**:
```javascript
// In browser console, check session
fetch('/api/auth/session').then(r => r.json()).then(console.log)

// Expected: { user: { id: "uuid", email: "email@gmail.com" } }
```

## 📊 **Success Indicators**

### **Authentication Working**
- ✅ Google sign-in creates user in database
- ✅ Session debug shows valid user ID
- ✅ Profile form submits without errors
- ✅ Server logs show successful JWT/session callbacks

### **Error Handling Working**
- ✅ Clear error messages for authentication failures
- ✅ Session refresh attempts on 401 errors
- ✅ Sign-in prompts when session invalid
- ✅ Detailed debugging information available

### **Performance Acceptable**
- ✅ Sign-in completes within 3 seconds
- ✅ Profile form submission within 2 seconds
- ✅ Session validation within 500ms
- ✅ Error recovery within 3 seconds

## 🔧 **Emergency Rollback**

If issues persist, temporarily revert to basic JWT:

```typescript
// In lib/auth/auth-options.ts, simplify callbacks:
callbacks: {
  async jwt({ token, user }) {
    if (user) {
      token.id = user.id
    }
    return token
  },
  async session({ session, token }) {
    if (session.user) {
      session.user.id = token.id as string
    }
    return session
  },
}
```

## 🎯 **Final Verification**

### **Complete Test Sequence**
1. **Fresh Browser**: Clear all cookies/storage
2. **Sign In**: Use Google OAuth
3. **Check Session**: Visit `/api/auth/session-debug`
4. **Update Profile**: Submit profile form successfully
5. **Sign Out/In**: Verify persistence across sessions

### **Expected Results**
- No authentication errors in profile form
- Successful profile updates with proper feedback
- Consistent session state across page refreshes
- Clear error messages if authentication fails

The authentication system should now work reliably with the unified configuration and enhanced error handling.
