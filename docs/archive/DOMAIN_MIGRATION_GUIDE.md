# Domain Migration Guide: www.masspension.com

## 🎯 Migration Overview

Successfully migrated the Massachusetts Pension Estimator application from the old Vercel domain (`v0-mass-retire-new.vercel.app`) to the new production domain `www.masspension.com`.

## ✅ Completed Changes

### 1. Environment Configuration
- **Updated `.env.example`**:
  - `NEXTAUTH_URL` examples updated to use `www.masspension.com`
  - `DOMAIN_NAME` changed from `yourdomain.com` to `www.masspension.com`
  - Added production configuration examples

### 2. Next.js Metadata & Configuration
- **Updated `app/layout.tsx`**:
  - `metadataBase` fallback changed from `v0-mass-retire-new.vercel.app` to `www.masspension.com`

### 3. SEO Metadata & Structured Data
- **Updated `components/seo/metadata.tsx`**:
  - `baseUrl` changed from `mapensionestimator.gov` to `www.masspension.com`
- **Updated `app/sitemap.ts`**:
  - `baseUrl` changed to `www.masspension.com`
- **Updated `app/robots.ts`**:
  - Sitemap URL updated to `www.masspension.com/sitemap.xml`
- **Updated `app/calculator/page.tsx`**:
  - Structured data URL updated to `www.masspension.com/calculator`
- **Updated backup files** (`app_backup/sitemap.ts`, `app_backup/robots.ts`)

### 4. Authentication & OAuth Configuration
- **Updated `docs/oauth-setup.md`**:
  - Google OAuth redirect URIs updated to `www.masspension.com/api/auth/callback/google`
  - GitHub OAuth callback URLs updated to `www.masspension.com/api/auth/callback/github`
  - Homepage URLs updated for production setup

### 5. Documentation & Deployment Guides
- **Updated `DEPLOYMENT.md`**:
  - Production `NEXTAUTH_URL` examples updated to `www.masspension.com`
  - Health check URLs updated
- **Updated `DEVELOPMENT_SETUP.md`**:
  - Added production authentication reference
- **Updated `README-MAIN-BRANCH.md`**:
  - Added production authentication examples
- **Updated `PRISMA_CONNECTION_FIX.md`**:
  - Health check URL updated to `www.masspension.com`
- **Updated `DATABASE_SETUP_GUIDE.md`**:
  - API test URLs updated to `www.masspension.com`
- **Updated `ADSENSE_DEPLOYMENT_GUIDE.md`**:
  - Added domain reference in deployment commit message

### 6. Scripts & Configuration
- **Updated `scripts/deploy.sh`**:
  - Made health check URL configurable via `HEALTH_CHECK_URL` environment variable
- **Updated `scripts/smoke-tests.sh`**:
  - Added production testing comment for `www.masspension.com`

## 🔒 AdSense Integration Compatibility

✅ **Verified Compatible**: The Google AdSense integration is fully compatible with the new domain because:
- Uses environment variables for publisher ID and ad slots
- No hardcoded domain references in ad components
- Scripts load dynamically based on configuration
- Will work seamlessly with `www.masspension.com`

## 🚀 Deployment Checklist

### Pre-Deployment Steps

1. **Update Environment Variables in Production**:
   ```bash
   NEXTAUTH_URL=https://www.masspension.com
   DOMAIN_NAME=www.masspension.com
   ```

2. **Update OAuth Applications**:
   - **Google OAuth**: Add `https://www.masspension.com/api/auth/callback/google` to authorized redirect URIs
   - **GitHub OAuth**: Update authorization callback URL to `https://www.masspension.com/api/auth/callback/github`

3. **DNS Configuration**:
   - Point `www.masspension.com` to your hosting provider
   - Configure SSL certificate for the new domain
   - Set up any necessary redirects from old domain

### Post-Deployment Verification

1. **Test Core Functionality**:
   ```bash
   # Health check
   curl -f https://www.masspension.com/api/health
   
   # Profile API (should return 401, not 500)
   curl https://www.masspension.com/api/profile
   ```

2. **Test Authentication**:
   - Google OAuth login flow
   - GitHub OAuth login flow
   - Session persistence

3. **Test SEO Elements**:
   - Sitemap: `https://www.masspension.com/sitemap.xml`
   - Robots.txt: `https://www.masspension.com/robots.txt`
   - Structured data validation

4. **Test AdSense Integration**:
   - Verify ads display for free users
   - Confirm ads are hidden for premium users
   - Check ad script loading in production

## 📋 Environment Variables Summary

### Required Production Variables
```bash
# Core Application
NODE_ENV=production
NEXTAUTH_URL=https://www.masspension.com
NEXTAUTH_SECRET=your-production-secret
DOMAIN_NAME=www.masspension.com

# Database
DATABASE_URL=your-production-database-url

# OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# AdSense
NEXT_PUBLIC_ADSENSE_PUBLISHER_ID=ca-pub-8456317857596950
NEXT_PUBLIC_ADSENSE_BANNER_SLOT=your-banner-slot-id
NEXT_PUBLIC_ADSENSE_SQUARE_SLOT=your-square-slot-id
NEXT_PUBLIC_ADSENSE_SIDEBAR_SLOT=your-sidebar-slot-id
NEXT_PUBLIC_ADSENSE_RESPONSIVE_SLOT=your-responsive-slot-id

# Optional
STRIPE_SECRET_KEY=your-stripe-secret
SENTRY_DSN=your-sentry-dsn
```

## 🔄 Migration Impact Assessment

### ✅ Zero Impact Areas
- **AdSense Integration**: Fully environment-variable driven
- **Database Connections**: No domain dependencies
- **API Endpoints**: Relative URLs used throughout
- **Component Logic**: No hardcoded domain references
- **Stripe Integration**: Uses `NEXTAUTH_URL` environment variable

### ⚠️ Requires Manual Update
- **OAuth Provider Settings**: Must update redirect URIs in Google/GitHub consoles
- **DNS Configuration**: Point new domain to hosting provider
- **SSL Certificates**: Configure for new domain
- **Environment Variables**: Update in production deployment

### 📊 SEO Considerations
- **Canonical URLs**: Now point to `www.masspension.com`
- **Sitemap**: Updated to new domain
- **Structured Data**: Calculator schema updated
- **Social Media**: OpenGraph URLs updated

## 🎉 Migration Complete

The Massachusetts Pension Estimator application is now fully configured for the `www.masspension.com` domain. All references have been updated while preserving:

- ✅ Complete AdSense integration functionality
- ✅ OAuth authentication flows
- ✅ SEO optimization and structured data
- ✅ All existing features and functionality
- ✅ Development environment compatibility

### Next Steps
1. Deploy the updated code to production
2. Configure DNS and SSL for `www.masspension.com`
3. Update OAuth provider settings
4. Set production environment variables
5. Test all functionality on the new domain
6. Monitor for any issues during the transition

The application is ready for production deployment on the new domain! 🚀
