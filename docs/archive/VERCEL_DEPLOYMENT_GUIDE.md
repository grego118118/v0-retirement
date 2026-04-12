# 🚀 Vercel Production Deployment Guide - AdSense Fix

## 📊 Current Status
- ✅ **Local Environment**: Updated with real ad unit IDs
- ❌ **Production**: Still using placeholder ID `4567890123`
- 🎯 **Goal**: Deploy real ad unit IDs to production

## 🔧 Step 1: Update Vercel Environment Variables

### Access Vercel Dashboard
1. Go to https://vercel.com/dashboard
2. Find your Massachusetts Retirement System project
3. Click on the project name
4. Navigate to **Settings** → **Environment Variables**

### Update These 4 Variables

Replace the existing variables with these real ad unit IDs:

```bash
# Variable Name: NEXT_PUBLIC_ADSENSE_BANNER_SLOT
# Environment: Production
# Value: 9577105485

# Variable Name: NEXT_PUBLIC_ADSENSE_SQUARE_SLOT  
# Environment: Production
# Value: 1722666190

# Variable Name: NEXT_PUBLIC_ADSENSE_SIDEBAR_SLOT
# Environment: Production
# Value: 8096502851

# Variable Name: NEXT_PUBLIC_ADSENSE_RESPONSIVE_SLOT
# Environment: Production  
# Value: 3206088503
```

### How to Update Each Variable:
1. **Find the existing variable** (e.g., `NEXT_PUBLIC_ADSENSE_BANNER_SLOT`)
2. **Click the "..." menu** → **Edit**
3. **Update the value** with the real ad unit ID
4. **Ensure Environment is set to "Production"**
5. **Save the changes**
6. **Repeat for all 4 variables**

## 🚀 Step 2: Trigger Production Deployment

### Option A: Automatic Deployment (Recommended)
1. Make a small change to trigger deployment
2. Commit and push the change
3. Vercel will automatically deploy

### Option B: Manual Redeploy
1. Go to **Deployments** tab in Vercel
2. Find the latest deployment
3. Click **"..."** → **"Redeploy"**
4. Wait for completion (2-3 minutes)

## 📋 Step 3: Verification Process

After deployment completes, run this test:

```bash
node quick-adsense-test.js
```

**Expected Results After Fix**:
```
📊 Ad Slots Found: 4+
   Slot 1: 9577105485 ✅ REAL
   Slot 2: 1722666190 ✅ REAL  
   Slot 3: 8096502851 ✅ REAL
   Slot 4: 3206088503 ✅ REAL

📋 Status Summary:
✅ SUCCESS: Real ad unit IDs detected!
🎉 Environment variables have been updated successfully
```

## ⏱️ Timeline Expectations

- **Environment Variable Update**: Immediate
- **Deployment Trigger**: 30 seconds
- **Build & Deploy**: 2-3 minutes
- **Global CDN Propagation**: 2-5 minutes
- **Total Time**: 5-10 minutes

## 🔍 Troubleshooting

### If Still Seeing Placeholder IDs:
1. **Double-check** environment variables are set for "Production"
2. **Wait 5 more minutes** for CDN propagation
3. **Clear browser cache** and test again
4. **Check deployment logs** for any errors

### If Deployment Fails:
1. **Check build logs** in Vercel dashboard
2. **Verify** no syntax errors in code
3. **Try manual redeploy** from Vercel dashboard

## 🎯 Success Indicators

You'll know it worked when:
- ✅ Test shows real ad unit IDs (not placeholders)
- ✅ Manual ads display actual content
- ✅ Browser console shows successful ad initialization
- ✅ No "Advertisement space" placeholder messages

---

## 🔄 Deployment Status

**Environment Variables**: ✅ Updated in Vercel Production
**Real Ad Unit IDs**: 9577105485, 1722666190, 8096502851, 3206088503
**Status**: Triggering production deployment now

**Next**: Monitoring deployment completion and testing real ad unit activation.
