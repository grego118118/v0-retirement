# 🎯 Google AdSense Setup Guide - Massachusetts Retirement System

## 🚨 Current Issue: Placeholder Ad Unit IDs

**Problem**: The website is using placeholder ad slot IDs instead of real Google AdSense ad unit IDs, which prevents ads from displaying.

**Solution**: Create real ad units in Google AdSense dashboard and update environment variables.

---

## 📋 Quick Fix: Auto Ads (Immediate Solution)

✅ **IMPLEMENTED**: Auto Ads have been enabled and should start showing ads immediately if your AdSense account is approved.

Auto Ads automatically place ads on your website without requiring specific ad unit IDs. This is the fastest way to get ads running.

### How Auto Ads Work:
- Automatically analyze your page content
- Place ads in optimal locations
- No manual ad unit creation required
- Revenue starts immediately (if account approved)

---

## 🔧 Complete Setup: Manual Ad Units (Recommended)

### Step 1: Access Google AdSense Dashboard
1. Go to [Google AdSense](https://www.google.com/adsense/)
2. Sign in with the account associated with publisher ID: `pub-8456317857596950`
3. Navigate to "Ads" → "By ad unit"

### Step 2: Create Ad Units
Create these 4 ad units for optimal coverage:

#### 1. Responsive Display Ad
- **Name**: "Mass Pension - Responsive"
- **Type**: Display ad
- **Size**: Responsive
- **Copy the Ad Unit ID** (format: 1234567890)

#### 2. Banner Ad (728x90)
- **Name**: "Mass Pension - Banner"
- **Type**: Display ad  
- **Size**: 728x90 (Leaderboard)
- **Copy the Ad Unit ID**

#### 3. Square Ad (300x250)
- **Name**: "Mass Pension - Square"
- **Type**: Display ad
- **Size**: 300x250 (Medium Rectangle)
- **Copy the Ad Unit ID**

#### 4. Sidebar Ad (160x600)
- **Name**: "Mass Pension - Sidebar"
- **Type**: Display ad
- **Size**: 160x600 (Wide Skyscraper)
- **Copy the Ad Unit ID**

### Step 3: Update Environment Variables
Add these to your Vercel environment variables:

```bash
# Google AdSense Configuration
NEXT_PUBLIC_ADSENSE_PUBLISHER_ID=ca-pub-8456317857596950

# Replace with your real ad unit IDs from Step 2
NEXT_PUBLIC_ADSENSE_RESPONSIVE_SLOT=YOUR_RESPONSIVE_AD_UNIT_ID
NEXT_PUBLIC_ADSENSE_BANNER_SLOT=YOUR_BANNER_AD_UNIT_ID
NEXT_PUBLIC_ADSENSE_SQUARE_SLOT=YOUR_SQUARE_AD_UNIT_ID
NEXT_PUBLIC_ADSENSE_SIDEBAR_SLOT=YOUR_SIDEBAR_AD_UNIT_ID
```

### Step 4: Deploy Changes
After updating environment variables in Vercel:
1. Trigger a new deployment
2. Test ads on masspension.com
3. Monitor AdSense dashboard for impressions

---

## 🔍 Troubleshooting

### Issue: "No ads displaying"
**Possible Causes:**
1. **Account not approved**: Check AdSense dashboard for approval status
2. **Placeholder ad units**: Using fake IDs like "4567890123"
3. **Policy violations**: Review AdSense policies
4. **Low traffic**: AdSense may not serve ads to low-traffic sites initially

**Solutions:**
1. ✅ Auto Ads (already implemented) - should work if account approved
2. Create real ad units (follow steps above)
3. Wait for account approval (can take 24-48 hours)
4. Increase website traffic

### Issue: "AdSense account under review"
- **Timeline**: 24-48 hours for new accounts
- **Requirements**: Quality content, privacy policy, terms of service
- **Status**: Check AdSense dashboard for updates

### Issue: "Policy violations"
**Common issues:**
- Missing privacy policy ✅ (we have this)
- Missing terms of service ✅ (we have this)
- Insufficient content ✅ (we have quality content)
- Invalid traffic patterns

---

## 📊 Current Implementation Status

### ✅ Completed
- [x] AdSense script loading correctly
- [x] CSP headers allow AdSense domains
- [x] ads.txt file properly configured
- [x] Premium user filtering (ads only for free users)
- [x] Auto Ads implementation (immediate solution)
- [x] Enhanced error handling and logging
- [x] Development/production environment handling

### 🔄 Needs Action
- [ ] Create real ad units in AdSense dashboard
- [ ] Update environment variables with real ad unit IDs
- [ ] Verify AdSense account approval status
- [ ] Monitor ad performance and revenue

---

## 🎯 Expected Results

### With Auto Ads (Current):
- Ads should appear automatically if account approved
- No manual configuration required
- Revenue starts immediately

### With Manual Ad Units (Recommended):
- More control over ad placement
- Better optimization opportunities
- Higher potential revenue
- Consistent ad sizes and positions

---

## 📞 Support

### AdSense Account Issues:
- [Google AdSense Help Center](https://support.google.com/adsense/)
- [AdSense Community Forum](https://support.google.com/adsense/community)

### Technical Implementation:
- Check browser console for AdSense errors
- Use `/test-adsense` page for debugging
- Monitor Vercel deployment logs

---

## 🚀 Next Steps

1. **Immediate**: Auto Ads should start working if account approved
2. **Short-term**: Create manual ad units for better control
3. **Long-term**: Optimize ad placement based on performance data

**Priority**: Check AdSense account approval status first - this is likely the main blocker.
