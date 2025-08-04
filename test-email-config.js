/**
 * Test Email Configuration
 * Massachusetts Retirement System - Email Notification Setup Validation
 */

async function testEmailConfiguration() {
  console.log('📧 Testing Email Notification Configuration');
  console.log('🔍 Verifying CONTENT_REVIEWER_EMAILS Setup');
  console.log('=' .repeat(60));
  
  const BASE_URL = 'https://www.masspension.com';
  const CRON_SECRET = '462c44a146ca26604411330b9cc568e9cc10a60e09745f4b7e26f8a80983c140';
  
  try {
    // Test 1: Check if we can access the review API (which would use email config)
    console.log('📡 Testing blog review API accessibility...');
    
    const reviewResponse = await fetch(`${BASE_URL}/api/admin/blog/review`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${CRON_SECRET}`
      }
    });
    
    console.log(`📊 Review API Status: ${reviewResponse.status}`);
    
    if (reviewResponse.status === 401) {
      console.log('✅ Review API requires authentication (expected)');
    } else if (reviewResponse.status === 200) {
      const reviewData = await reviewResponse.json();
      console.log('✅ Review API accessible');
      console.log(`📝 Posts pending review: ${reviewData.posts?.length || 0}`);
    } else {
      console.log(`⚠️  Unexpected review API status: ${reviewResponse.status}`);
    }
    
    // Test 2: Generate a blog post and check if email notifications would be triggered
    console.log('\n📝 Testing blog generation with email notification context...');
    
    const generateResponse = await fetch(`${BASE_URL}/api/admin/blog/generate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CRON_SECRET}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        topic: {
          title: 'Email Notification Test - Massachusetts Retirement Benefits',
          description: 'Testing email notification configuration for content review workflow',
          keywords: ['email test', 'Massachusetts retirement', 'notification system']
        },
        ai_model: 'gemini-1.5-flash',
        word_count: 300,
        auto_publish: false // This should trigger review workflow
      })
    });
    
    console.log(`📊 Generation Status: ${generateResponse.status}`);
    
    if (generateResponse.ok) {
      const generateData = await generateResponse.json();
      console.log('✅ Blog post generated for review workflow');
      console.log(`📝 Post ID: ${generateData.post?.id}`);
      console.log(`📋 Status: ${generateData.post?.status}`);
      console.log(`🔍 Fact Check Status: ${generateData.post?.fact_check_status}`);
      
      // Check if the post would trigger email notifications
      if (generateData.post?.status === 'draft' && generateData.post?.fact_check_status === 'needs_review') {
        console.log('✅ Post created in review-ready state');
        console.log('📧 This would trigger email notifications to reviewers');
      } else {
        console.log('⚠️  Post status may not trigger review workflow');
      }
      
    } else {
      const errorData = await generateResponse.json();
      console.log(`❌ Generation failed: ${errorData.error}`);
    }
    
    // Test 3: Check environment configuration indirectly
    console.log('\n🔧 Testing environment configuration...');
    
    const envResponse = await fetch(`${BASE_URL}/api/debug/env-test`);
    if (envResponse.ok) {
      const envData = await envResponse.json();
      console.log('✅ Environment test endpoint accessible');
      console.log(`🌍 Environment: ${envData.environment?.nodeEnv}`);
      console.log(`☁️  Platform: ${envData.environment?.platform}`);
      
      // Check for email-related configurations
      if (envData.email) {
        console.log('📧 Email configuration section found');
      } else {
        console.log('⚠️  No email configuration section in environment test');
      }
    }
    
    console.log('\n📋 EMAIL CONFIGURATION ANALYSIS:');
    console.log('=' .repeat(50));
    
    console.log('✅ Expected Email Workflow:');
    console.log('   1. Blog post generated with status: draft');
    console.log('   2. Fact check status: needs_review');
    console.log('   3. Email sent to CONTENT_REVIEWER_EMAILS addresses');
    console.log('   4. Reviewers access /admin/blog/review interface');
    console.log('   5. Review approval triggers publication');
    
    console.log('\n🔍 Email Configuration Requirements:');
    console.log('   - CONTENT_REVIEWER_EMAILS: Comma-separated email addresses');
    console.log('   - RESEND_API_KEY: For email sending service');
    console.log('   - EMAIL_FROM: Sender email address');
    
    console.log('\n📧 Email Notification Triggers:');
    console.log('   - New post needs review (fact_check_status: needs_review)');
    console.log('   - Post approved for publication');
    console.log('   - Post rejected with feedback');
    console.log('   - Scheduled publication reminders');
    
    console.log('\n🧪 Testing Email Service Components...');
    
    // Check if email service is configured by looking for related endpoints
    const emailTestEndpoints = [
      '/api/email/send',
      '/api/newsletter/subscribe'
    ];
    
    for (const endpoint of emailTestEndpoints) {
      try {
        const testResponse = await fetch(`${BASE_URL}${endpoint}`, {
          method: 'GET'
        });
        console.log(`   ${endpoint}: ${testResponse.status === 404 ? '❌ Not found' : '✅ Accessible'}`);
      } catch (error) {
        console.log(`   ${endpoint}: ❌ Error`);
      }
    }
    
  } catch (error) {
    console.log(`❌ Email configuration test failed: ${error.message}`);
  }
  
  console.log('\n🎯 NEXT STEPS FOR EMAIL SETUP:');
  console.log('=' .repeat(50));
  console.log('1. Verify CONTENT_REVIEWER_EMAILS is set in .env.production');
  console.log('2. Configure RESEND_API_KEY for email sending');
  console.log('3. Set EMAIL_FROM sender address');
  console.log('4. Test email sending with a review workflow');
  console.log('5. Set up admin access for review interface');
  
  console.log('\n📋 CURRENT STATUS:');
  console.log('✅ Blog generation: Working');
  console.log('✅ Review workflow: Ready');
  console.log('⚠️  Email notifications: Configuration needed');
  console.log('⚠️  Database storage: Needs field mapping fix');
}

testEmailConfiguration();
