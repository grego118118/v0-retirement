# 🔧 AdSense Environment Variables Verification Guide

## 🚨 Current Issue Status

**Problem**: Live testing shows placeholder ad slot IDs are still active on masspension.com
**Evidence**: Test script detected `4567890123` (placeholder) instead of real ad unit ID
**Impact**: Manual ads continue showing "Advertisement space" placeholders

## 📋 Step-by-Step Verification Process

### Step 1: Verify Vercel Environment Variables

1. **Access Vercel Dashboard**:
   - Go to https://vercel.com/dashboard
   - Navigate to your Massachusetts Retirement System project
   - Click "Settings" → "Environment Variables"

2. **Check Current Variables**:
   Look for these 4 variables and verify they have **real ad unit IDs** (not placeholders):
   ```
   NEXT_PUBLIC_ADSENSE_BANNER_SLOT
   NEXT_PUBLIC_ADSENSE_SQUARE_SLOT  
   NEXT_PUBLIC_ADSENSE_SIDEBAR_SLOT
   NEXT_PUBLIC_ADSENSE_RESPONSIVE_SLOT
   ```

3. **Verify Environment Scope**:
   - Ensure variables are set for **"Production"** environment
   - Check that values are **10-digit numbers** (real ad unit IDs)
   - Confirm they are **NOT** these placeholder values:
     - `1234567890` ❌
     - `2345678901` ❌  
     - `3456789012` ❌
     - `4567890123` ❌

### Step 2: Update Environment Variables (If Needed)

If you see placeholder values, update them with your real AdSense ad unit IDs:

1. **Delete existing placeholder variables**
2. **Add new variables** with real ad unit IDs from your AdSense dashboard
3. **Set environment scope** to "Production"
4. **Save changes**

### Step 3: Force New Deployment

After updating environment variables:

1. **Go to Vercel Deployments tab**
2. **Click "Redeploy"** on the latest deployment
3. **Wait 2-3 minutes** for deployment to complete
4. **Verify deployment status** shows "Ready"

### Step 4: Test Updated Configuration

Run this test to verify the changes:

```bash
# Test the live configuration
node test-live-adsense-config.js
```

**Expected Results After Fix**:
- ✅ Ad Elements Found: 4+ (instead of 1)
- ✅ All slots showing real IDs (not placeholders)
- ✅ No "PLACEHOLDER" warnings

### Step 5: Browser Testing

1. **Visit masspension.com** (not Vercel preview URL)
2. **Open Browser DevTools** → Console
3. **Look for these logs**:
   ```javascript
   // Success indicators:
   "AdSense: Initialized ad element [id] with slot [real-slot-id]"
   "AdSenseManager: Initialization completed successfully"
   
   // Problem indicators:
   "AdSenseManager: Element [id] using placeholder slot [fake-id]"
   "AdSenseManager: Added fallback placeholder for [id]"
   ```

4. **Check ad display**:
   - Manual ads should show actual AdSense content
   - No "Advertisement space" placeholder messages
   - Auto Ads continue working at bottom

## 🔍 Troubleshooting Common Issues

### Issue 1: Environment Variables Not Taking Effect

**Symptoms**: Test still shows placeholder IDs after updating Vercel
**Solutions**:
1. Verify variables are set for "Production" (not Preview/Development)
2. Force redeploy from Vercel dashboard
3. Wait 5-10 minutes for global CDN cache to update
4. Clear browser cache and test again

### Issue 2: AdSense Script Not Loading

**Symptoms**: Test shows "AdSense Script: ❌ Missing"
**Solutions**:
1. Check if you're testing as a premium user (ads hidden for premium)
2. Verify CSP headers allow AdSense domains
3. Check browser console for script loading errors
4. Test in incognito mode to avoid ad blockers

### Issue 3: Real IDs But Still Showing Placeholders

**Symptoms**: Real ad unit IDs detected but placeholders still visible
**Possible Causes**:
1. AdSense account not fully approved
2. Ad units not properly configured in AdSense dashboard
3. Low traffic causing unfilled ad requests
4. Geographic restrictions on ad serving

## 📊 Verification Checklist

- [ ] Vercel environment variables updated with real ad unit IDs
- [ ] Variables set for "Production" environment scope
- [ ] New deployment triggered and completed successfully
- [ ] Test script shows real IDs (not placeholders)
- [ ] Browser console shows successful ad initialization
- [ ] Manual ads display actual content (not placeholder messages)
- [ ] Auto Ads continue working correctly

## 🎯 Expected Results After Fix

### Technical Metrics
- **Ad Elements**: 4+ ad slots detected on pages
- **Fill Rate**: 70-90% (up from current ~30%)
- **Console Errors**: 0 AdSense-related errors
- **Load Time**: Maintained under 2 seconds

### Visual Changes
- **Before**: "Advertisement space - Support our free tools" boxes
- **After**: Actual Google AdSense ads or clean empty spaces
- **Auto Ads**: Continue working (bottom banner)
- **Manual Ads**: Now display real content

### Revenue Impact
- **Current**: Only Auto Ads generating revenue
- **After Fix**: Auto Ads + Manual Ads = 50-100% revenue increase

## 📞 Next Steps

1. **Immediate**: Verify Vercel environment variables are correct
2. **Deploy**: Force new deployment if variables were updated
3. **Test**: Run verification script after deployment completes
4. **Monitor**: Check AdSense dashboard for impression increases
5. **Optimize**: Monitor performance and adjust ad placement if needed

---

**Critical**: The key issue is ensuring real ad unit IDs are properly configured in Vercel's Production environment and that a deployment has been triggered to apply the changes.
