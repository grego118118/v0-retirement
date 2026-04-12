# 🔧 Retirement Group Selection Debugging Guide

## Current Status
The Massachusetts Retirement System calculator's retirement group dropdown has been enhanced with multiple fixes and debugging capabilities.

## 🚀 **Quick Test URLs**
1. **Debug Page**: http://localhost:3000/debug-select
2. **Wizard**: http://localhost:3000/wizard
3. **Legacy Calculator**: http://localhost:3000/calculator

## 🔍 **Debugging Steps**

### Step 1: Test the Debug Page
1. Navigate to http://localhost:3000/debug-select
2. Open browser developer tools (F12)
3. Check the Console tab for logs
4. Try clicking on both dropdown triggers
5. Verify if dropdown content appears
6. Test manual buttons if dropdowns don't work

### Step 2: Test the Wizard
1. Go to http://localhost:3000/wizard
2. Click "Start New Analysis"
3. Fill in personal information and proceed
4. On pension details step, check console for logs:
   - `PensionDetailsStep render - formData:`
   - `PensionDetailsStep - handleInputChange:`

### Step 3: Browser Console Debugging
Look for these specific issues in the console:
- **JavaScript Errors**: Any red error messages
- **Radix UI Warnings**: Issues with Select component
- **State Updates**: Check if `handleInputChange` is called
- **CSS Conflicts**: Z-index or positioning issues

## 🛠 **Applied Fixes**

### 1. **Enhanced Select Components**
- Added explicit z-index: `className="z-[100]"`
- Set position: `position="popper"`
- Added side offset: `sideOffset={4}`
- Added overflow-visible to containers

### 2. **Improved Form Handling**
- Fixed TypeScript types to allow empty strings
- Enhanced validation with proper error messages
- Added comprehensive debugging logs

### 3. **Container Fixes**
- Added `overflow-visible` to Card components
- Fixed grid container overflow issues
- Ensured proper portal rendering

## 🎯 **Expected Behavior**

### ✅ **Working Correctly:**
- Placeholder text shows: "Select your retirement group"
- Dropdown opens when clicked
- All 4 options are visible and selectable
- Selection updates the description text
- Console shows state change logs
- Form validation works properly

### ❌ **Common Issues:**
- **Dropdown doesn't open**: Z-index or CSS conflict
- **Options not visible**: Portal rendering issue
- **Selection doesn't register**: Event handler problem
- **No placeholder text**: SelectValue configuration issue

## 🔧 **Troubleshooting**

### Issue: Dropdown doesn't open
**Solution**: Check for CSS conflicts, ensure z-index is high enough

### Issue: Options not visible
**Solution**: Verify SelectContent is rendering in portal, check overflow settings

### Issue: Selection doesn't work
**Solution**: Check console for handleInputChange logs, verify event handlers

### Issue: TypeScript errors
**Solution**: Ensure types allow empty strings, check union types

## 📊 **Debug Information**

### Console Logs to Look For:
```
DebugSelectTest render - selectedGroup: "" selectedOption: ""
PensionDetailsStep render - formData: {retirementGroup: "", ...}
PensionDetailsStep - handleInputChange: retirementGroup "1"
Group changed to: 1
```

### Browser DevTools Inspection:
1. Inspect the SelectTrigger element
2. Check if SelectContent appears in DOM when clicked
3. Verify z-index values in computed styles
4. Look for any CSS overflow: hidden on parent containers

## 🚨 **Emergency Fallback**

If dropdowns still don't work, you can test with manual buttons on the debug page:
1. Go to http://localhost:3000/debug-select
2. Use the "Set Group 1", "Set Group 2" buttons
3. Verify state updates work programmatically
4. This isolates UI vs logic issues

## 📝 **Reporting Issues**

When reporting issues, please include:
1. Browser and version
2. Console error messages
3. Screenshots of the dropdown behavior
4. Results from the debug page test
5. Whether manual buttons work on debug page

## 🎉 **Success Criteria**

The fix is successful when:
- ✅ Placeholder text is visible
- ✅ Dropdown opens on click
- ✅ All 4 retirement groups are selectable
- ✅ Selection updates description text
- ✅ Form validation works
- ✅ Console shows proper state updates
- ✅ No JavaScript errors in console
