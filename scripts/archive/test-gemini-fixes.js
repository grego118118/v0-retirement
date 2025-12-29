/**
 * Test Gemini API Fixes
 * Massachusetts Retirement System - Comprehensive Fix Validation
 */

async function testGeminiFixes() {
  console.log('🔧 Testing Gemini API Fixes');
  console.log('📋 Comprehensive Blog Generation System Validation');
  console.log('=' .repeat(60));
  
  const BASE_URL = 'https://www.masspension.com';
  const CRON_SECRET = '462c44a146ca26604411330b9cc568e9cc10a60e09745f4b7e26f8a80983c140';
  
  console.log('🚀 Applied Fixes:');
  console.log('1. ✅ Enhanced API key validation (format, length, prefix check)');
  console.log('2. ✅ Added 30-second timeout to prevent hanging requests');
  console.log('3. ✅ Improved error logging and debugging information');
  console.log('4. ✅ Added configuration check before content generation');
  console.log('5. ✅ Better error messages for troubleshooting');
  
  console.log('\n📡 Testing Blog Generation with Fixes...');
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 35000); // 35 second timeout
    
    const startTime = Date.now();
    
    const response = await fetch(`${BASE_URL}/api/admin/blog/generate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CRON_SECRET}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        topic: {
          title: 'Massachusetts COLA Benefits: Testing Fixed API Integration',
          description: 'Testing the fixed Gemini API integration with proper timeout and validation',
          keywords: ['Massachusetts COLA', 'API fix test', 'timeout resolution']
        },
        ai_model: 'gemini-1.5-flash',
        word_count: 500,
        seo_keywords: ['Massachusetts COLA', 'API integration', 'blog generation'],
        auto_publish: false
      }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    const responseTime = Date.now() - startTime;
    
    console.log(`📊 Response Status: ${response.status} (${responseTime}ms)`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('\n✅ SUCCESS! Blog generation completed');
      console.log('=' .repeat(40));
      console.log(`📝 Post ID: ${data.post?.id}`);
      console.log(`📊 Word Count: ${data.post?.word_count || 'N/A'}`);
      console.log(`💰 Cost: ${data.post?.cost || 'Free (Gemini)'}`);
      console.log(`📈 Quality Score: ${data.quality_metrics?.overall_quality || 'N/A'}/100`);
      console.log(`🔍 Fact Check Status: ${data.post?.fact_check_status || 'N/A'}`);
      
      // Check if it's a real post or mock response
      if (data.post?.id?.startsWith('test-')) {
        console.log('\n⚠️  MOCK RESPONSE DETECTED');
        console.log('This indicates the API key validation failed or database save failed');
        console.log('Check the error details above for specific issues');
      } else {
        console.log('\n🎉 REAL POST GENERATED!');
        console.log('The API key is working and content was successfully generated');
        console.log('Post has been saved to the database for review');
      }
      
      if (data.error) {
        console.log(`\n❌ Error in response: ${data.error}`);
        if (data.details) {
          console.log(`🔍 Details: ${data.details}`);
        }
      }
      
    } else if (response.status === 500) {
      const errorData = await response.json();
      console.log('\n❌ SERVER ERROR (500)');
      console.log(`Error: ${errorData.error}`);
      console.log(`Details: ${errorData.details}`);
      
      if (errorData.details?.includes('API key not configured')) {
        console.log('\n🔑 DIAGNOSIS: GEMINI_API_KEY is missing from Vercel environment');
      } else if (errorData.details?.includes('format appears invalid')) {
        console.log('\n🔑 DIAGNOSIS: GEMINI_API_KEY format is incorrect');
      } else if (errorData.details?.includes('timed out')) {
        console.log('\n⏱️  DIAGNOSIS: API call timed out - network or API issue');
      }
      
    } else if (response.status === 401) {
      console.log('\n❌ AUTHENTICATION ERROR (401)');
      console.log('CRON_SECRET is incorrect or missing');
      
    } else {
      const errorText = await response.text();
      console.log(`\n❌ HTTP ERROR (${response.status})`);
      console.log(`Response: ${errorText}`);
    }
    
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log('\n⏱️  REQUEST TIMED OUT (35+ seconds)');
      console.log('Even with fixes, the request is still timing out');
      console.log('This suggests a fundamental API key or network issue');
    } else {
      console.log(`\n❌ NETWORK ERROR: ${error.message}`);
    }
  }
  
  console.log('\n📋 NEXT STEPS BASED ON RESULTS:');
  console.log('=' .repeat(60));
  
  console.log('\n✅ If you see "REAL POST GENERATED":');
  console.log('   - The fixes worked! API key is valid and configured correctly');
  console.log('   - Blog generation system is now operational');
  console.log('   - You can enable automated scheduling');
  console.log('   - Set up content reviewer emails');
  
  console.log('\n⚠️  If you see "MOCK RESPONSE DETECTED":');
  console.log('   - API key validation passed but generation failed');
  console.log('   - Check the error details for specific issues');
  console.log('   - May be a database connectivity issue');
  
  console.log('\n❌ If you see "API key not configured":');
  console.log('   - GEMINI_API_KEY is missing from Vercel environment');
  console.log('   - Go to Vercel Dashboard → Project Settings → Environment Variables');
  console.log('   - Add GEMINI_API_KEY with your Google API key');
  
  console.log('\n❌ If you see "format appears invalid":');
  console.log('   - API key format is wrong (should start with AIza)');
  console.log('   - Regenerate API key in Google AI Studio');
  console.log('   - Update GEMINI_API_KEY in Vercel with new key');
  
  console.log('\n⏱️  If request still times out:');
  console.log('   - Network connectivity issue between Vercel and Google APIs');
  console.log('   - API key has restrictions preventing server-side use');
  console.log('   - Google Cloud project has Generative AI API disabled');
  
  console.log('\n🔧 DEPLOYMENT INSTRUCTIONS:');
  console.log('1. Commit the fixes to your repository');
  console.log('2. Push to main branch to trigger Vercel deployment');
  console.log('3. Wait for deployment to complete');
  console.log('4. Run this test again to validate the fixes');
  console.log('5. If successful, configure CONTENT_REVIEWER_EMAILS');
}

// Run the test
testGeminiFixes().then(() => {
  console.log('\n🎉 Gemini API fix validation completed');
}).catch((error) => {
  console.log(`\n❌ Test failed: ${error.message}`);
});
