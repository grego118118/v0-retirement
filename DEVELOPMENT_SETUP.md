# Development Setup Guide

This guide will help you set up the Massachusetts Retirement System application for local development.

## Quick Start (Minimal Setup)

For basic development without premium features:

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd v0-retirement
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env.local
   ```

3. **Database Setup**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:3000` with basic pension calculation features.

## Full Setup (All Features)

### 1. Environment Configuration

Edit `.env.local` with your configuration:

```env
# Required for authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here

# OAuth providers (at least one required)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Optional: Stripe for premium features
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

# Optional: Disable debug messages
NEXTAUTH_DEBUG=false
```

### 2. OAuth Setup

#### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add `http://localhost:3000/api/auth/callback/google` to authorized redirect URIs

#### GitHub OAuth
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create a new OAuth App
3. Set Authorization callback URL to `http://localhost:3000/api/auth/callback/github`

### 3. Stripe Setup (Optional)

For subscription features:

1. Create a [Stripe account](https://dashboard.stripe.com/)
2. Get your test API keys from the dashboard
3. Create two products:
   - Monthly subscription ($19.99/month)
   - Annual subscription ($199.99/year)
4. Copy the price IDs to your environment file

### 4. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Create/update database schema
npx prisma db push

# Optional: View database in Prisma Studio
npx prisma studio
```

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Type checking
npm run type-check

# Linting
npm run lint

# Database operations
npx prisma studio          # Database GUI
npx prisma db push         # Update schema
npx prisma generate        # Generate client
```

## Troubleshooting

### Stripe Portal 404 Errors

If you see 404 errors for `/api/stripe/portal`:

1. **Check Stripe Configuration**
   - Ensure `STRIPE_SECRET_KEY` is set in `.env.local`
   - Verify the key starts with `sk_test_` for development

2. **Check Database**
   - User must be authenticated
   - User record must exist in database

3. **Expected Behavior**
   - Without Stripe keys: Returns 503 "Payment system not configured"
   - Without subscription: Returns 404 with redirect to pricing page
   - With subscription: Creates portal session successfully

### NextAuth Debug Messages

To disable debug messages in development:
```env
NEXTAUTH_DEBUG=false
```

### Performance Issues

Development compilation is slower due to:
- TypeScript checking
- Sentry integration
- Large dependency tree

Production builds are optimized and much faster.

### Database Issues

If you encounter database errors:
```bash
# Reset database
rm prisma/dev.db
npx prisma db push
```

## Feature Flags

Control which features are available:

```env
# Disable premium features for development
ENABLE_PREMIUM_FEATURES=false

# Disable Stripe integration
# STRIPE_SECRET_KEY=

# Enable debug logging
DEBUG_CALCULATIONS=true
```

## Production Deployment

See `DEPLOYMENT.md` for production deployment instructions.

## Getting Help

1. Check the console for error messages
2. Verify environment variables are set correctly
3. Ensure database is properly initialized
4. Check that OAuth providers are configured correctly

For Stripe-related issues, the application will gracefully degrade and show appropriate error messages to guide you through the setup process.
