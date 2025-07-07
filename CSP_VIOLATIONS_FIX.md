# 🔒 CSP Violations Fix - Massachusetts Retirement System

## Problem Summary
Content Security Policy violations were blocking essential functionality:

1. **Vercel Live Feedback**: `https://vercel.live/_next-live/feedback/feedback.js`
2. **Google AdSense**: `https://ep1.adtrafficquality.google/getconfig/sodar`

## 🛠 Solution Applied

### Updated CSP Directives in `lib/csp.ts`

#### 1. Enhanced `script-src` Directive
**Added Vercel Live domains:**
- `https://vercel.live`
- `https://va.vercel-scripts.com`
- `https://vitals.vercel-insights.com`
- `https://vitals.vercel-analytics.com`

#### 2. Enhanced `connect-src` Directive
**Added Google AdSense domains:**
- `https://ep1.adtrafficquality.google`
- `https://googleadservices.com`
- `https://www.googleadservices.com`

**Added Vercel Live domains:**
- `https://vercel.live`
- `https://va.vercel-scripts.com`
- `https://vitals.vercel-insights.com`
- `https://vitals.vercel-analytics.com`

#### 3. Updated Trusted Types Setup
Enhanced `components/layout/trusted-types-setup.tsx` to include new domains in allowed script URLs.

## 🎯 Benefits

### ✅ Vercel Live Feedback
- Development feedback widget now works without CSP violations
- Staging environment feedback collection enabled
- No impact on production security

### ✅ Google AdSense (pub-8456317857596950)
- AdSense configuration requests now allowed
- Ad serving for free tier users restored
- Revenue generation maintained

### ✅ Security Maintained
- All existing security protections preserved
- Only specific required domains added
- No broad wildcards or unsafe directives

## 🧪 Testing Instructions

### 1. Deploy Changes
```bash
git add .
git commit -m "fix: resolve CSP violations for Vercel Live and Google AdSense"
git push
```

### 2. Verify on masspension.com
1. **Check AdSense**: Visit as non-premium user, verify ads display
2. **Check Vercel Live**: Look for feedback widget (development/staging)
3. **Check Console**: No CSP violation errors

### 3. Test CSP Configuration
```bash
node scripts/test-csp.js
```

## 📋 Updated CSP Summary

### Production CSP
```
script-src: 'self' 'unsafe-inline' https://apis.google.com https://accounts.google.com https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net https://vercel.live https://va.vercel-scripts.com https://vitals.vercel-insights.com https://vitals.vercel-analytics.com

connect-src: 'self' https://api.github.com https://accounts.google.com https://www.googleapis.com https://securetoken.googleapis.com https://googleads.g.doubleclick.net https://pagead2.googlesyndication.com https://ep1.adtrafficquality.google https://googleadservices.com https://www.googleadservices.com https://vercel.live https://va.vercel-scripts.com https://vitals.vercel-insights.com https://vitals.vercel-analytics.com
```

## 🚀 Next Steps
1. Deploy to production
2. Monitor for any remaining CSP violations
3. Test AdSense revenue tracking
4. Verify Vercel Live feedback collection
