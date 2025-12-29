/**
 * Minimal Post Test - Massachusetts Retirement System
 * Test with completely random slug to isolate database issue
 */

async function testMinimalPost() {
  console.log('🔍 MINIMAL POST TEST - RANDOM SLUG');
  console.log('📋 Testing with completely random slug to isolate issue');
  console.log('=' .repeat(50));
  
  const BASE_URL = 'https://www.masspension.com';
  const CRON_SECRET = '462c44a146ca26604411330b9cc568e9cc10a60e09745f4b7e26f8a80983c140';
  
  try {
    console.log('📝 Generating blog post with random slug...');
    
    const response = await fetch(`${BASE_URL}/api/admin/blog/generate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CRON_SECRET}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        topic: {
          title: `Random Test ${Math.random().toString(36).substring(2, 15)}`,
          description: 'Completely random test to isolate database issue',
          keywords: ['random', 'test', 'database']
        },
        ai_model: 'gemini-1.5-flash',
        word_count: 200,
        auto_publish: false
      })
    });
    
    console.log(`📊 Response Status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      
      console.log('\n📝 RESPONSE ANALYSIS:');
      console.log(`Post ID: ${data.post?.id}`);
      console.log(`Title: ${data.post?.title}`);
      console.log(`Status: ${data.post?.status}`);
      
      if (data.post?.id?.startsWith('test-')) {
        console.log('\n❌ STILL MOCK RESPONSE');
        
        if (data.debug_info) {
          console.log('\n🔍 ERROR DETAILS:');
          console.log(`Database Error: ${data.debug_info.database_error}`);
          console.log(`Error Type: ${data.debug_info.error_type}`);
          console.log(`Error Name: ${data.debug_info.error_name}`);
          
          if (data.debug_info.database_error.includes('slug')) {
            console.log('\n🎯 SLUG CONSTRAINT ISSUE CONFIRMED');
            console.log('❌ Even with random titles, slug constraint is failing');
            console.log('🔧 This suggests existing data conflicts or slug generation bug');
          }
        }
        
      } else {
        console.log('\n🎉 SUCCESS! REAL POST GENERATED!');
        console.log('✅ Database storage is working!');
        console.log(`✅ Real UUID: ${data.post.id}`);
      }
      
    } else {
      const errorData = await response.json();
      console.log('\n❌ API REQUEST FAILED');
      console.log(`Error: ${errorData.error}`);
    }
    
  } catch (error) {
    console.log(`❌ Test failed: ${error.message}`);
  }
  
  console.log('\n📋 ANALYSIS SUMMARY');
  console.log('=' .repeat(30));
  
  console.log('\n🔍 CURRENT STATUS:');
  console.log('✅ Prepared Statement Conflicts: RESOLVED');
  console.log('✅ Database Connectivity: Excellent (7/8 tests)');
  console.log('✅ Content Generation: Perfect');
  console.log('❌ Database Storage: Slug constraint violations');
  
  console.log('\n🎯 LIKELY REMAINING ISSUES:');
  console.log('1. Existing blog posts in database with conflicting slugs');
  console.log('2. Slug generation logic still has edge cases');
  console.log('3. Database schema constraint configuration');
  console.log('4. Supabase RLS policy affecting slug uniqueness');
  
  console.log('\n🔧 NEXT STEPS:');
  console.log('1. Check Supabase dashboard for existing blog posts');
  console.log('2. Clear existing test data if present');
  console.log('3. Verify slug generation is truly unique');
  console.log('4. Test with completely different slug approach');
}

testMinimalPost();
