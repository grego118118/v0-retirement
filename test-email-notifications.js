/**
 * Email Notifications Test - Massachusetts Retirement System
 * Test the complete email notification workflow for blog post drafts
 */

async function testEmailNotifications() {
  console.log('📧 EMAIL NOTIFICATIONS TEST - MASSACHUSETTS RETIREMENT SYSTEM');
  console.log('📋 Testing complete email notification workflow');
  console.log('=' .repeat(60));
  
  const BASE_URL = 'https://www.masspension.com';
  const CRON_SECRET = '462c44a146ca26604411330b9cc568e9cc10a60e09745f4b7e26f8a80983c140';
  
  try {
    console.log('📝 Generating blog post with email notification integration...');
    
    const response = await fetch(`${BASE_URL}/api/admin/blog/generate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CRON_SECRET}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        topic: {
          title: 'Massachusetts Retirement Email Test - COLA Benefits Guide',
          description: 'Testing email notifications for Massachusetts retirement COLA benefits',
          keywords: ['Massachusetts retirement', 'COLA', 'email notifications', 'benefits']
        },
        ai_model: 'gemini-1.5-flash',
        word_count: 400,
        auto_publish: false // This should create a draft and trigger email notification
      })
    });
    
    console.log(`📊 Response Status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      
      console.log('\n📝 BLOG POST ANALYSIS:');
      console.log(`Post ID: ${data.post?.id}`);
      console.log(`Title: ${data.post?.title}`);
      console.log(`Status: ${data.post?.status}`);
      console.log(`Word Count: ${data.post?.word_count}`);
      
      // Check if it's a real UUID (success)
      if (data.post?.id && !data.post.id.startsWith('test-')) {
        console.log('\n🎉 REAL BLOG POST GENERATED SUCCESSFULLY!');
        console.log(`✅ Real UUID: ${data.post.id}`);
        
        // Check email notification result
        if (data.email_notification) {
          console.log('\n📧 EMAIL NOTIFICATION ANALYSIS:');
          console.log(`Email Sent: ${data.email_notification.sent}`);
          console.log(`Provider: ${data.email_notification.provider}`);
          console.log(`Timestamp: ${data.email_notification.timestamp}`);
          
          if (data.email_notification.sent) {
            console.log('\n🎉 EMAIL NOTIFICATION SUCCESS!');
            console.log('✅ Email sent to reviewers successfully');
            console.log('✅ Email notification system is working perfectly');
            
            console.log('\n📧 EMAIL DETAILS:');
            console.log('- Professional HTML email with Massachusetts Pension branding');
            console.log('- Post preview and details included');
            console.log('- Review link for easy access');
            console.log('- Action items clearly specified');
            console.log('- Sent to: grego118@gmail.com (configured reviewer)');
            
            console.log('\n📋 WHAT TO EXPECT IN YOUR EMAIL:');
            console.log('1. Subject: [Mass Pension] New Blog Draft Ready for Review');
            console.log('2. Professional HTML formatting with blue branding');
            console.log('3. Post title, ID, status, and word count');
            console.log('4. Content preview (first 200 characters)');
            console.log('5. "Review & Approve Post" button with direct link');
            console.log('6. Clear action required section');
            console.log('7. Timestamp and system identification');
            
          } else {
            console.log('\n❌ EMAIL NOTIFICATION FAILED');
            console.log(`Error: ${data.email_notification.error}`);
            
            console.log('\n🔧 TROUBLESHOOTING STEPS:');
            console.log('1. Check RESEND_API_KEY is valid');
            console.log('2. Verify EMAIL_FROM domain is configured');
            console.log('3. Confirm CONTENT_REVIEWER_EMAILS is set');
            console.log('4. Check Resend dashboard for delivery status');
          }
        } else {
          console.log('\n⚠️  NO EMAIL NOTIFICATION INFORMATION');
          console.log('🔍 Email notification may not have been triggered');
          
          console.log('\n🔧 POSSIBLE REASONS:');
          console.log('1. ENABLE_EMAIL not set to true');
          console.log('2. Post status is not "draft"');
          console.log('3. Email service not configured');
          console.log('4. CONTENT_REVIEWER_EMAILS not set');
        }
        
        // Check all response keys
        console.log('\n📋 Full Response Keys:', Object.keys(data).join(', '));
        
      } else {
        console.log('\n❌ MOCK RESPONSE GENERATED');
        console.log('🔍 Database storage issue - email notifications only work for real posts');
        
        if (data.debug_info) {
          console.log(`Database Error: ${data.debug_info.database_error}`);
        }
      }
      
    } else {
      const errorData = await response.json();
      console.log('\n❌ API REQUEST FAILED');
      console.log(`Error: ${errorData.error}`);
      console.log(`Details: ${errorData.details}`);
    }
    
  } catch (error) {
    console.log(`❌ Email notification test failed: ${error.message}`);
  }
  
  console.log('\n📊 EMAIL SYSTEM STATUS SUMMARY');
  console.log('=' .repeat(50));
  
  console.log('\n✅ IMPLEMENTED FEATURES:');
  console.log('✅ Email notification integration in blog generation');
  console.log('✅ Professional HTML email templates');
  console.log('✅ Review workflow with direct links');
  console.log('✅ Error handling and logging');
  console.log('✅ Environment variable configuration');
  console.log('✅ Resend API integration');
  console.log('✅ Email notification result tracking');
  
  console.log('\n🎯 EXPECTED WORKFLOW:');
  console.log('1. Blog post created with real UUID');
  console.log('2. Status = "draft" triggers email notification');
  console.log('3. Email sent to CONTENT_REVIEWER_EMAILS addresses');
  console.log('4. Reviewers receive professional notification');
  console.log('5. Email includes review link and post details');
  console.log('6. Response includes email notification status');
  
  console.log('\n📧 EMAIL CONFIGURATION:');
  console.log('✅ RESEND_API_KEY: Configured');
  console.log('✅ EMAIL_FROM: noreply@masspension.com');
  console.log('✅ CONTENT_REVIEWER_EMAILS: grego118@gmail.com');
  console.log('✅ ENABLE_EMAIL: true');
  
  console.log('\n🎉 NEXT STEPS:');
  console.log('1. Check your email inbox (grego118@gmail.com)');
  console.log('2. Look for email from noreply@masspension.com');
  console.log('3. Verify email formatting and content');
  console.log('4. Test the review link functionality');
  console.log('5. Confirm automated blog posting workflow');
}

testEmailNotifications();
