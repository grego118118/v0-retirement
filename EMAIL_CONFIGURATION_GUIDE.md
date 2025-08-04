# Email Service Configuration Guide
## Massachusetts Retirement System - Resend Email Integration

### 🔧 **Required Environment Variables**

Add these to your Vercel Dashboard → Project Settings → Environment Variables:

#### **1. RESEND_API_KEY**
- **Variable Name**: `RESEND_API_KEY`
- **Value**: Your Resend API key (format: `re_xxxxxxxxxx`)
- **Environment**: Production (and Preview if needed)
- **Get Key From**: [Resend Dashboard](https://resend.com/api-keys)

#### **2. EMAIL_FROM**
- **Variable Name**: `EMAIL_FROM`
- **Value**: `noreply@masspension.com`
- **Environment**: Production (and Preview if needed)
- **Note**: Domain must be verified in Resend

#### **3. CONTENT_REVIEWER_EMAILS** (Already Configured)
- **Variable Name**: `CONTENT_REVIEWER_EMAILS`
- **Value**: Comma-separated email addresses
- **Example**: `reviewer1@example.com,reviewer2@example.com`
- **Status**: ✅ Already added to .env.production

---

### 📧 **Email Notification Workflow**

#### **When Emails Are Sent:**
1. **New Blog Post Generated** → Email to reviewers
2. **Post Approved** → Confirmation email
3. **Post Rejected** → Feedback email with reasons
4. **Scheduled Publication** → Reminder emails

#### **Email Templates:**
- **Subject**: `[Mass Pension] New Blog Post Ready for Review`
- **Content**: Post title, quality metrics, review link
- **Sender**: `noreply@masspension.com`
- **Recipients**: Addresses from `CONTENT_REVIEWER_EMAILS`

---

### 🔍 **Verification Steps**

#### **Step 1: Configure Resend Account**
1. Go to [Resend.com](https://resend.com)
2. Create account or log in
3. Add and verify `masspension.com` domain
4. Generate API key with send permissions

#### **Step 2: Add Environment Variables**
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select Massachusetts Retirement System project
3. Navigate to Settings → Environment Variables
4. Add `RESEND_API_KEY` and `EMAIL_FROM`
5. Redeploy to apply changes

#### **Step 3: Test Email Configuration**
```bash
# Test email service after configuration
node test-email-config.js
```

---

### 🚨 **Common Issues & Solutions**

#### **Issue 1: Domain Not Verified**
- **Error**: `Domain not verified in Resend`
- **Solution**: Add DNS records in domain registrar
- **DNS Records**: TXT and CNAME records from Resend

#### **Issue 2: API Key Invalid**
- **Error**: `Invalid API key`
- **Solution**: Regenerate key in Resend dashboard
- **Check**: Ensure key starts with `re_`

#### **Issue 3: Email Delivery Issues**
- **Error**: Emails not received
- **Solution**: Check spam folder, verify recipient emails
- **Debug**: Check Resend dashboard logs

---

### 📋 **Email Service Integration Points**

#### **Files Using Email Service:**
- `lib/email/email-service.ts` - Core email functionality
- `lib/ai/content-review-workflow.ts` - Review notifications
- `app/api/admin/blog/review/route.ts` - Review API endpoints

#### **Email Templates Location:**
- `components/email/` - React email templates
- `lib/email/templates/` - Email content templates

---

### 🎯 **Expected Results After Configuration**

#### **Successful Configuration Indicators:**
- ✅ Blog generation triggers review emails
- ✅ Reviewers receive notification emails
- ✅ Email service API returns 200 status
- ✅ Resend dashboard shows sent emails

#### **Test Email Content Example:**
```
Subject: [Mass Pension] New Blog Post Ready for Review

A new blog post has been generated and is ready for review:

Title: Massachusetts COLA Benefits: Understanding Your 3% Annual Adjustment
Word Count: 1,247 words
Quality Score: 87/100
SEO Score: 92/100
Fact Check Status: Needs Review

Review the post here: https://masspension.com/admin/blog/review

This is an automated message from the Massachusetts Pension AI Blog System.
```

---

### 🔧 **Manual Configuration Steps**

Since environment variables need to be added through Vercel Dashboard:

1. **Access Vercel Dashboard**
   - Go to https://vercel.com/dashboard
   - Select your Massachusetts Retirement System project

2. **Navigate to Environment Variables**
   - Click Settings tab
   - Click Environment Variables in sidebar

3. **Add RESEND_API_KEY**
   - Name: `RESEND_API_KEY`
   - Value: Your Resend API key
   - Environment: Production

4. **Add EMAIL_FROM**
   - Name: `EMAIL_FROM`
   - Value: `noreply@masspension.com`
   - Environment: Production

5. **Trigger Redeploy**
   - Go to Deployments tab
   - Click "Redeploy" on latest deployment
   - Wait for completion

---

### ✅ **Configuration Checklist**

- [ ] Resend account created
- [ ] `masspension.com` domain verified in Resend
- [ ] API key generated with send permissions
- [ ] `RESEND_API_KEY` added to Vercel environment
- [ ] `EMAIL_FROM` added to Vercel environment
- [ ] `CONTENT_REVIEWER_EMAILS` confirmed in environment
- [ ] Vercel project redeployed
- [ ] Email service tested with blog generation

**Status**: ⚠️ **Manual configuration required through Vercel Dashboard**
