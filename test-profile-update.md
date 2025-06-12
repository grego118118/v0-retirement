# Profile Update Testing Guide

## 🧪 **Manual Testing Steps**

### **1. Test Profile Form Submission**
1. Navigate to `/profile` page
2. Click on "Profile" tab
3. Fill in the form:
   - **Full Name**: Enter a valid name (2-100 characters)
   - **Retirement Date**: Select a future date
4. Click "Update Profile" button
5. **Expected**: Success toast notification and form updates

### **2. Test Error Scenarios**

#### **Authentication Error Test**
1. Open browser developer tools
2. Clear session storage/cookies
3. Try to submit profile form
4. **Expected**: "Authentication Error" toast with sign-in prompt

#### **Validation Error Test**
1. Enter single character in name field
2. Try to submit form
3. **Expected**: Form validation error message
4. Select past date for retirement
5. **Expected**: Date validation error message

#### **Network Error Test**
1. Open developer tools → Network tab
2. Set network to "Offline" or block `/api/profile`
3. Try to submit form
4. **Expected**: Network error message with retry guidance

### **3. Test Success Scenarios**

#### **New Profile Creation**
1. Use account without existing profile
2. Fill in complete form
3. Submit form
4. **Expected**: Profile created successfully, countdown updates

#### **Profile Update**
1. Use account with existing profile
2. Modify name or retirement date
3. Submit form
4. **Expected**: Profile updated, changes reflected immediately

#### **Partial Updates**
1. Update only name field (leave date empty)
2. Submit form
3. **Expected**: Name updated, date unchanged
4. Update only date field
5. **Expected**: Date updated, name unchanged

## 🔍 **Debugging Information**

### **Console Logs to Monitor**
```javascript
// Client-side logs
"Profile form submission started"
"Sending profile update request"
"Profile update response"
"Profile updated successfully"

// Server-side logs (check server console)
"Profile POST request started"
"Session in profile POST"
"Profile POST request body"
"Profile update successful"
```

### **Network Tab Verification**
1. Open Developer Tools → Network tab
2. Submit profile form
3. Look for POST request to `/api/profile`
4. **Expected Response**: 200 status with success message

### **Database Verification**
```sql
-- Check if profile was saved
SELECT * FROM users_metadata WHERE id = 'user-id';

-- Verify data format
SELECT 
  full_name,
  retirement_date,
  created_at,
  updated_at
FROM users_metadata 
WHERE id = 'user-id';
```

## ⚠️ **Common Issues & Solutions**

### **Issue**: Form submission hangs
**Solution**: Check network connectivity and server status
**Debug**: Look for console errors and network request status

### **Issue**: "Unauthorized" error
**Solution**: Sign out and sign back in
**Debug**: Check session storage and authentication state

### **Issue**: Validation errors not showing
**Solution**: Check form field names and validation schema
**Debug**: Verify React Hook Form integration

### **Issue**: Database errors
**Solution**: Check database connection and table schema
**Debug**: Review server logs for SQL errors

## 📊 **Success Criteria**

### **Functional Requirements**
- ✅ Profile form submits successfully
- ✅ Data persists in database
- ✅ UI updates reflect changes
- ✅ Error handling works correctly

### **User Experience Requirements**
- ✅ Loading states display properly
- ✅ Error messages are clear and actionable
- ✅ Success feedback is immediate
- ✅ Form validation prevents invalid submissions

### **Technical Requirements**
- ✅ No TypeScript compilation errors
- ✅ Proper error logging for debugging
- ✅ Database operations complete successfully
- ✅ API responses are properly formatted

## 🔧 **Troubleshooting Commands**

### **Check Database Connection**
```bash
# Test database connectivity
npm run db:test

# View database logs
docker logs postgres-container
```

### **Check Server Logs**
```bash
# Development server logs
npm run dev

# Production server logs
pm2 logs retirement-app
```

### **Reset Profile Data**
```sql
-- Clear profile data for testing
DELETE FROM users_metadata WHERE id = 'test-user-id';

-- Reset to clean state
TRUNCATE users_metadata RESTART IDENTITY CASCADE;
```

The profile update functionality should now work reliably with comprehensive error handling and user feedback. All debugging information is available for troubleshooting any remaining issues.
