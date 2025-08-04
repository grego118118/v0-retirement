/**
 * Simple API Key Test
 * Test if GEMINI_API_KEY is accessible in production
 */

// Use built-in fetch (Node 18+)
async function testApiKey() {
  console.log('🔍 Testing GEMINI_API_KEY Configuration');
  console.log('🌐 Target: https://masspension.com');
  
  const BASE_URL = 'https://masspension.com';
  const CRON_SECRET = '462c44a146ca26604411330b9cc568e9cc10a60e09745f4b7e26f8a80983c140';
  
  try {
    console.log('📡 Sending minimal test request...');
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch(`${BASE_URL}/api/admin/blog/generate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CRON_SECRET}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        topic: {
          title: 'API Key Test',
          description: 'Testing if GEMINI_API_KEY is configured',
          keywords: ['test']
        },
        ai_model: 'gemini-1.5-flash',
        word_count: 50,
        auto_publish: false
      }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    console.log(`📊 Response Status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Request successful');
      
      if (data.error) {
        console.log(`❌ Error in response: ${data.error}`);
        if (data.details) {
          console.log(`🔍 Details: ${data.details}`);
          
          if (data.details.includes('API key not configured')) {
            console.log('🔑 DIAGNOSIS: GEMINI_API_KEY is missing from environment');
          } else if (data.details.includes('API key')) {
            console.log('🔑 DIAGNOSIS: API key issue detected');
          }
        }
      } else if (data.post?.id?.startsWith('test-')) {
        console.log('⚠️  DIAGNOSIS: Mock response - API key likely missing or invalid');
        console.log(`📝 Mock ID: ${data.post.id}`);
      } else if (data.post?.id) {
        console.log('✅ DIAGNOSIS: Real post generated - API key working');
        console.log(`📝 Post ID: ${data.post.id}`);
      }
      
    } else {
      const errorText = await response.text();
      console.log(`❌ HTTP Error: ${errorText}`);
    }
    
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log('⏱️  DIAGNOSIS: Request timed out - likely indicates:');
      console.log('   1. GEMINI_API_KEY is missing (causing hanging API calls)');
      console.log('   2. Gemini API is unreachable');
      console.log('   3. Network connectivity issues');
    } else {
      console.log(`❌ Network Error: ${error.message}`);
    }
  }
  
  console.log('\n📋 RECOMMENDED ACTIONS:');
  console.log('1. Check Vercel Dashboard → Project Settings → Environment Variables');
  console.log('2. Verify GEMINI_API_KEY is set for Production environment');
  console.log('3. Ensure API key has proper permissions for Gemini 1.5 Flash');
  console.log('4. Test with a simple Gemini API call outside the blog system');
}

testApiKey();
