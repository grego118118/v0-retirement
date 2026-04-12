# Testing and Deployment Guide - Massachusetts Retirement System Subscription Workflow

## 🧪 **Comprehensive Testing Strategy**

### **Phase 1: Local Development Testing**

#### **1.1 Environment Setup**
```bash
# Copy environment variables
cp .env.example .env.local

# Add Stripe test keys
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_MONTHLY_PRICE_ID="price_..."
STRIPE_ANNUAL_PRICE_ID="price_..."

# Start development server
npm run dev
```

#### **1.2 Database Verification**
```bash
# Check existing schema supports subscription fields
npx prisma studio

# Verify User model has:
# - stripeCustomerId
# - subscriptionId  
# - subscriptionStatus
# - subscriptionPlan
# - currentPeriodEnd
# - cancelAtPeriodEnd
# - socialSecurityCalculations
# - wizardUses
# - pdfReports
```

### **Phase 2: User Flow Testing**

#### **2.1 Unauthenticated User Flow**
1. **Visit `/pricing`**
   - ✅ Verify pricing cards display correctly
   - ✅ Check responsive design at 375px, 768px, 1024px, 1920px
   - ✅ Confirm "Get Started Free" redirects to OAuth

2. **Google OAuth Authentication**
   - ✅ Click "Get Started Free" → redirects to `/auth/signin?callbackUrl=/subscription/select`
   - ✅ Complete Google OAuth → redirects to `/subscription/select`
   - ✅ Verify session is established

3. **Subscription Selection**
   - ✅ User email displays correctly
   - ✅ Free plan selection → redirects to `/dashboard?welcome=free`
   - ✅ Paid plan selection → creates Stripe checkout session
   - ✅ Error handling for Stripe configuration issues

#### **2.2 Payment Flow Testing**
1. **Stripe Checkout**
   - ✅ Monthly plan creates correct checkout session ($9.99)
   - ✅ Annual plan creates correct checkout session ($99.99)
   - ✅ Test card: `4242 4242 4242 4242` (success)
   - ✅ Test card: `4000 0000 0000 0002` (decline)

2. **Webhook Processing**
   - ✅ `checkout.session.completed` updates user record
   - ✅ `customer.subscription.created` activates subscription
   - ✅ `invoice.payment_succeeded` confirms payment
   - ✅ Database reflects subscription status changes

3. **Success/Cancel Pages**
   - ✅ Success page displays subscription details
   - ✅ Cancel page explains free tier options
   - ✅ Both pages have proper navigation options

#### **2.3 Subscription Management Testing**
1. **Billing Page**
   - ✅ OAuth free users see free tier information
   - ✅ OAuth premium users see grandfathered status
   - ✅ Stripe users see subscription details
   - ✅ Stripe portal integration works

2. **Feature Access Control**
   - ✅ Free users limited to 3 saved calculations
   - ✅ Free users limited to 1 Social Security calculation
   - ✅ Premium users have unlimited access
   - ✅ Feature gates work correctly

### **Phase 3: Backward Compatibility Testing**

#### **3.1 Existing User Testing**
1. **Create Test Users**
   ```sql
   -- Simulate existing OAuth premium user
   INSERT INTO User (email, createdAt, name) 
   VALUES ('existing@test.com', '2024-11-01', 'Existing User');
   
   -- Simulate new OAuth free user  
   INSERT INTO User (email, createdAt, name)
   VALUES ('new@test.com', '2024-12-15', 'New User');
   ```

2. **Verify User Classification**
   - ✅ Users created before hybrid launch date → `oauth_premium`
   - ✅ Users created after hybrid launch date → `oauth_free`
   - ✅ Users with active Stripe subscription → `stripe_monthly`/`stripe_annual`

3. **Feature Access Verification**
   - ✅ Existing users maintain full premium access
   - ✅ New users get free tier limitations
   - ✅ Paid users get full premium access

### **Phase 4: Integration Testing**

#### **4.1 API Endpoint Testing**
```bash
# Test subscription status API
curl -X GET http://localhost:3000/api/subscription/status \
  -H "Cookie: next-auth.session-token=..."

# Test Stripe configuration API
curl -X GET http://localhost:3000/api/subscription/config \
  -H "Cookie: next-auth.session-token=..."

# Test checkout creation API
curl -X POST http://localhost:3000/api/subscription/create-checkout \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=..." \
  -d '{"planType":"monthly","userEmail":"test@example.com","userName":"Test User"}'
```

#### **4.2 Webhook Testing**
1. **Use Stripe CLI for local testing**
   ```bash
   # Install Stripe CLI
   stripe login
   
   # Forward webhooks to local server
   stripe listen --forward-to localhost:3000/api/subscription/webhook
   
   # Trigger test events
   stripe trigger checkout.session.completed
   stripe trigger customer.subscription.created
   stripe trigger invoice.payment_succeeded
   ```

2. **Verify webhook processing**
   - ✅ Database updates correctly
   - ✅ User subscription status changes
   - ✅ Error handling for invalid webhooks

### **Phase 5: Performance Testing**

#### **5.1 Page Load Testing**
```bash
# Use Lighthouse or similar tools
npm install -g lighthouse

# Test key pages
lighthouse http://localhost:3000/pricing --output=json
lighthouse http://localhost:3000/subscription/select --output=json
lighthouse http://localhost:3000/subscription/success --output=json
lighthouse http://localhost:3000/billing --output=json

# Verify all pages load under 2 seconds
```

#### **5.2 Database Performance**
- ✅ Subscription status queries execute quickly
- ✅ User lookup by email is indexed
- ✅ Feature access checks are efficient

### **Phase 6: Security Testing**

#### **6.1 Authentication Testing**
- ✅ Unauthenticated users cannot access subscription APIs
- ✅ Session validation works correctly
- ✅ CSRF protection is enabled

#### **6.2 Payment Security**
- ✅ Webhook signature verification works
- ✅ No sensitive data in client-side code
- ✅ Stripe keys are properly configured

## 🚀 **Production Deployment Guide**

### **Step 1: Stripe Configuration**

#### **1.1 Create Stripe Products**
1. **Login to Stripe Dashboard** → Products
2. **Create Monthly Product**
   - Name: "Massachusetts Retirement System - Premium Monthly"
   - Price: $9.99 USD
   - Billing: Monthly
   - Copy Price ID → `STRIPE_MONTHLY_PRICE_ID`

3. **Create Annual Product**
   - Name: "Massachusetts Retirement System - Premium Annual"
   - Price: $99.99 USD
   - Billing: Yearly
   - Copy Price ID → `STRIPE_ANNUAL_PRICE_ID`

#### **1.2 Configure Webhooks**
1. **Webhooks** → Add endpoint
2. **URL**: `https://your-domain.com/api/subscription/webhook`
3. **Events to send**:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. **Copy Webhook Secret** → `STRIPE_WEBHOOK_SECRET`

### **Step 2: Environment Configuration**

#### **2.1 Production Environment Variables**
```bash
# Authentication
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="your-production-secret"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Database
DATABASE_URL="your-production-database-url"

# Stripe (Live Keys)
STRIPE_SECRET_KEY="sk_live_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_MONTHLY_PRICE_ID="price_live_monthly"
STRIPE_ANNUAL_PRICE_ID="price_live_annual"
```

#### **2.2 Security Configuration**
```bash
# Additional security headers
SECURITY_HEADERS="true"
CSP_ENABLED="true"
RATE_LIMITING="true"

# Monitoring
SENTRY_DSN="your-sentry-dsn"
LOG_LEVEL="info"
```

### **Step 3: Database Migration**

#### **3.1 Verify Schema**
```bash
# No migration required - existing schema supports all features
npx prisma generate
npx prisma db push
```

#### **3.2 Data Classification**
```sql
-- Optional: Manually classify existing users if needed
UPDATE User 
SET subscriptionPlan = 'oauth_premium' 
WHERE createdAt < '2024-12-01' AND subscriptionPlan IS NULL;

UPDATE User 
SET subscriptionPlan = 'oauth_free' 
WHERE createdAt >= '2024-12-01' AND subscriptionPlan IS NULL;
```

### **Step 4: Deployment Process**

#### **4.1 Build and Deploy**
```bash
# Build application
npm run build

# Deploy to your hosting platform
# (Vercel, Netlify, AWS, etc.)
```

#### **4.2 Post-Deployment Verification**
1. **Health Checks**
   - ✅ Application loads correctly
   - ✅ Database connection works
   - ✅ Authentication functions

2. **Stripe Integration**
   - ✅ Webhook endpoint responds
   - ✅ Test checkout creation
   - ✅ Verify webhook processing

3. **User Flows**
   - ✅ Complete end-to-end user journey
   - ✅ Test payment processing
   - ✅ Verify subscription activation

### **Step 5: Monitoring and Maintenance**

#### **5.1 Monitoring Setup**
```bash
# Application monitoring
- Error tracking (Sentry)
- Performance monitoring
- Database query monitoring
- Stripe webhook monitoring
```

#### **5.2 Regular Maintenance**
- **Weekly**: Review Stripe dashboard for failed payments
- **Monthly**: Analyze subscription metrics and user feedback
- **Quarterly**: Review and update pricing if needed

## 🔧 **Troubleshooting Guide**

### **Common Issues and Solutions**

#### **Issue 1: Webhook Not Processing**
```bash
# Check webhook signature
# Verify STRIPE_WEBHOOK_SECRET is correct
# Check server logs for webhook errors
# Test with Stripe CLI
```

#### **Issue 2: Checkout Session Creation Fails**
```bash
# Verify Stripe keys are correct
# Check price IDs match Stripe dashboard
# Ensure customer creation works
# Review API error messages
```

#### **Issue 3: User Classification Incorrect**
```bash
# Check getUserSubscriptionType logic
# Verify user creation dates
# Review subscription status in database
# Test with different user scenarios
```

#### **Issue 4: Feature Access Problems**
```bash
# Check canAccessFeature function
# Verify usage tracking
# Review premium feature configuration
# Test with different subscription types
```

## ✅ **Pre-Launch Checklist**

### **Technical Verification**
- [ ] All environment variables configured
- [ ] Stripe products and webhooks set up
- [ ] Database schema verified
- [ ] Build completes successfully
- [ ] All tests pass

### **User Experience Verification**
- [ ] Complete user flow tested
- [ ] Payment processing works
- [ ] Subscription management functions
- [ ] Responsive design verified
- [ ] Performance meets requirements

### **Security Verification**
- [ ] Authentication works correctly
- [ ] Webhook signatures verified
- [ ] No sensitive data exposed
- [ ] Rate limiting configured
- [ ] Error handling secure

### **Business Logic Verification**
- [ ] Pricing displays correctly
- [ ] Feature access control works
- [ ] Backward compatibility maintained
- [ ] Billing information accurate
- [ ] Support processes defined

## 🎯 **Success Metrics**

### **Technical Metrics**
- **Page Load Time**: < 2 seconds
- **API Response Time**: < 500ms
- **Error Rate**: < 1%
- **Uptime**: > 99.9%

### **Business Metrics**
- **Conversion Rate**: Free to paid subscriptions
- **Churn Rate**: Monthly subscription cancellations
- **User Satisfaction**: Support ticket volume
- **Revenue**: Monthly recurring revenue growth

**Ready for Production Deployment** ✅
