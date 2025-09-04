/**
 * Email System Test - Massachusetts Retirement System
 * Comprehensive test of email notification workflow
 */

async function testEmailSystem() {
  console.log('📧 EMAIL SYSTEM TEST - MASSACHUSETTS RETIREMENT SYSTEM');
  console.log('📋 Testing email notification workflow for blog post drafts');
  console.log('=' .repeat(60));
  
  const BASE_URL = 'https://www.masspension.com';
  const CRON_SECRET = '462c44a146ca26604411330b9cc568e9cc10a60e09745f4b7e26f8a80983c140';
  
  try {
    // Test 1: Check environment variables
    console.log('📝 Test 1: Environment Variables Check...');
    
    const envResponse = await fetch(`${BASE_URL}/api/debug/database`);
    if (envResponse.ok) {
      const envData = await envResponse.json();
      console.log('✅ Environment API accessible');
      
      // Check if email-related variables are mentioned
      const envTest = envData.tests?.find(t => t.name === 'Environment Variables');
      if (envTest && envTest.status === 'pass') {
        console.log('✅ Environment variables are set');
      } else {
        console.log('⚠️  Environment variables test failed');
      }
    }
    
    // Test 2: Direct email API test
    console.log('\n📝 Test 2: Direct Email API Test...');
    
    try {
      const emailTestResponse = await fetch(`${BASE_URL}/api/admin/email/send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${CRON_SECRET}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'blog_draft_notification',
          postId: 'test-email-system',
          postTitle: 'Email System Test',
          postExcerpt: 'Testing email notification system for Massachusetts Retirement System',
          reviewUrl: `${BASE_URL}/admin/blog/review/test-email-system`
        })
      });
      
      console.log(`📊 Email API Response: ${emailTestResponse.status}`);
      
      if (emailTestResponse.ok) {
        const emailData = await emailTestResponse.json();
        console.log('✅ Email API is accessible');
        console.log(`📧 Email response:`, emailData);
      } else {
        const emailError = await emailTestResponse.json();
        console.log('❌ Email API failed');
        console.log(`📧 Error details:`, emailError);
      }
      
    } catch (emailError) {
      console.log('❌ Email API test failed:', emailError.message);
    }
    
    // Test 3: Blog generation with email notification
    console.log('\n📝 Test 3: Blog Generation with Email Notification...');
    
    const blogResponse = await fetch(`${BASE_URL}/api/admin/blog/generate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CRON_SECRET}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        topic: {
          title: 'Email Notification Test - Massachusetts Retirement',
          description: 'Testing email notifications for blog post drafts',
          keywords: ['Massachusetts retirement', 'email test', 'notifications']
        },
        ai_model: 'gemini-1.5-flash',
        word_count: 300,
        auto_publish: false, // This should trigger email notification
        send_notification: true // Explicitly request notification
      })
    });
    
    console.log(`📊 Blog Generation Response: ${blogResponse.status}`);
    
    if (blogResponse.ok) {
      const blogData = await blogResponse.json();
      
      console.log('\n📝 BLOG GENERATION ANALYSIS:');
      console.log(`Post ID: ${blogData.post?.id}`);
      console.log(`Title: ${blogData.post?.title}`);
      console.log(`Status: ${blogData.post?.status}`);
      
      // Check if it's a real UUID (success)
      if (blogData.post?.id && !blogData.post.id.startsWith('test-')) {
        console.log('✅ Real blog post generated successfully');
        
        // Check for email notification indicators
        if (blogData.email_sent) {
          console.log('✅ Email notification sent successfully');
          console.log(`📧 Email details:`, blogData.email_details);
        } else if (blogData.email_error) {
          console.log('❌ Email notification failed');
          console.log(`📧 Email error:`, blogData.email_error);
        } else {
          console.log('⚠️  No email notification information in response');
          console.log('🔍 Email may not be triggered or response not updated');
        }
        
        // Check response keys for email-related fields
        console.log('\n📋 Response Keys:', Object.keys(blogData).join(', '));
        
      } else {
        console.log('❌ Mock response generated - database issue persists');
      }
      
    } else {
      const blogError = await blogResponse.json();
      console.log('❌ Blog generation failed');
      console.log(`📧 Error details:`, blogError);
    }
    
    // Test 4: Check email configuration endpoint
    console.log('\n📝 Test 4: Email Configuration Check...');
    
    try {
      const configResponse = await fetch(`${BASE_URL}/api/admin/email/config`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${CRON_SECRET}`
        }
      });
      
      console.log(`📊 Email Config Response: ${configResponse.status}`);
      
      if (configResponse.ok) {
        const configData = await configResponse.json();
        console.log('✅ Email configuration accessible');
        console.log(`📧 Config details:`, configData);
      } else {
        console.log('⚠️  Email configuration endpoint not available');
      }
      
    } catch (configError) {
      console.log('⚠️  Email configuration test failed:', configError.message);
    }
    
  } catch (error) {
    console.log(`❌ Email system test failed: ${error.message}`);
  }
  
  console.log('\n📊 EMAIL SYSTEM DIAGNOSIS');
  console.log('=' .repeat(40));
  
  console.log('\n🔍 COMMON EMAIL ISSUES:');
  console.log('1. RESEND_API_KEY not set or invalid');
  console.log('2. CONTENT_REVIEWER_EMAILS not configured');
  console.log('3. EMAIL_FROM not set (should be noreply@masspension.com)');
  console.log('4. Email sending logic not triggered in blog generation');
  console.log('5. Email API endpoint not implemented or accessible');
  console.log('6. Resend service configuration issues');
  
  console.log('\n🔧 TROUBLESHOOTING STEPS:');
  console.log('1. Verify Vercel environment variables');
  console.log('2. Check email API implementation');
  console.log('3. Test Resend API key validity');
  console.log('4. Verify email addresses in CONTENT_REVIEWER_EMAILS');
  console.log('5. Check blog generation route for email triggers');
  console.log('6. Review email service integration');
  
  console.log('\n📧 EXPECTED EMAIL WORKFLOW:');
  console.log('1. Blog post created with status="draft"');
  console.log('2. Email notification triggered automatically');
  console.log('3. Reviewers receive email with post details');
  console.log('4. Email includes review link and post excerpt');
  console.log('5. Email sent via Resend API to configured addresses');
}

testEmailSystem();
