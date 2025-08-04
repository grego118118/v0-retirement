/**
 * Test Gemini API Key Configuration
 * Massachusetts Retirement System - Environment Variable Verification
 */

const fetch = require('node-fetch');

const BASE_URL = 'https://www.masspension.com';
const CRON_SECRET = '462c44a146ca26604411330b9cc568e9cc10a60e09745f4b7e26f8a80983c140';

async function testGeminiConfiguration() {
  console.log('🔍 Testing Gemini API Key Configuration');
  console.log('🌐 Environment: Production (masspension.com)');
  console.log('=' .repeat(60));
  
  try {
    // Test 1: Check if blog generation endpoint is accessible
    console.log('📡 Test 1: Testing blog generation endpoint accessibility...');
    
    const testResponse = await fetch(`${BASE_URL}/api/admin/blog/generate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CRON_SECRET}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        topic: {
          title: 'Environment Test',
          description: 'Testing API key configuration',
          keywords: ['test']
        },
        ai_model: 'gemini-1.5-flash',
        word_count: 50,
        auto_publish: false
      }),
      timeout: 10000 // 10 second timeout
    });

    console.log(`   📊 Response Status: ${testResponse.status}`);
    
    if (testResponse.status === 200) {
      const data = await testResponse.json();
      console.log('   ✅ Endpoint accessible');
      
      if (data.post?.id?.startsWith('test-')) {
        console.log('   ⚠️  Mock response detected - API key likely missing');
        console.log(`   🔑 Mock ID: ${data.post.id}`);
      } else {
        console.log('   ✅ Real post generated - API key working');
        console.log(`   📝 Post ID: ${data.post?.id}`);
      }
    } else if (testResponse.status === 401) {
      console.log('   ❌ Authentication failed - check CRON_SECRET');
    } else {
      const errorText = await testResponse.text();
      console.log(`   ❌ Error: ${errorText}`);
    }

  } catch (error) {
    if (error.name === 'AbortError' || error.message.includes('timeout')) {
      console.log('   ⏱️  Request timed out - likely API key issue or Gemini API call hanging');
    } else {
      console.log(`   ❌ Network Error: ${error.message}`);
    }
  }

  // Test 2: Check environment variables through debug endpoint
  console.log('\n📊 Test 2: Checking environment configuration...');
  
  try {
    const envResponse = await fetch(`${BASE_URL}/api/debug/env-test`);
    if (envResponse.ok) {
      const envData = await envResponse.json();
      console.log('   ✅ Environment endpoint accessible');
      console.log(`   🌍 Node Environment: ${envData.environment?.nodeEnv}`);
      console.log(`   ☁️  Vercel Environment: ${envData.environment?.vercelEnv}`);
      console.log(`   🔧 Platform: ${envData.environment?.platform}`);
      
      // Check if there are any AI-related configurations
      if (envData.ai) {
        console.log('   🤖 AI Configuration found');
        console.log(`   🔑 API Keys configured: ${Object.keys(envData.ai).length}`);
      } else {
        console.log('   ⚠️  No AI configuration section found');
      }
    }
  } catch (error) {
    console.log(`   ❌ Environment check failed: ${error.message}`);
  }

  // Test 3: Try a minimal generation request
  console.log('\n🧪 Test 3: Minimal generation test...');
  
  try {
    const minimalResponse = await fetch(`${BASE_URL}/api/admin/blog/generate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CRON_SECRET}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        topic: {
          title: 'Test'
        },
        ai_model: 'gemini-1.5-flash',
        word_count: 10
      }),
      timeout: 5000 // 5 second timeout
    });

    console.log(`   📊 Minimal test status: ${minimalResponse.status}`);
    
    if (minimalResponse.ok) {
      const minimalData = await minimalResponse.json();
      console.log('   ✅ Minimal generation successful');
      console.log(`   📝 Generated ID: ${minimalData.post?.id}`);
    }
    
  } catch (error) {
    if (error.name === 'AbortError' || error.message.includes('timeout')) {
      console.log('   ⏱️  Minimal test timed out - confirms API key/connection issue');
    } else {
      console.log(`   ❌ Minimal test error: ${error.message}`);
    }
  }

  console.log('\n📋 DIAGNOSIS SUMMARY:');
  console.log('=' .repeat(60));
  console.log('If requests are timing out: GEMINI_API_KEY likely missing');
  console.log('If getting mock responses: API key present but invalid/expired');
  console.log('If getting real posts: API key working correctly');
  console.log('If 401 errors: CRON_SECRET authentication issue');
}

// Add timeout handling for the entire script
const timeoutPromise = new Promise((_, reject) => {
  setTimeout(() => reject(new Error('Script timeout after 30 seconds')), 30000);
});

Promise.race([testGeminiConfiguration(), timeoutPromise])
  .then(() => {
    console.log('\n🎉 Configuration test completed');
  })
  .catch((error) => {
    console.log(`\n❌ Configuration test failed: ${error.message}`);
  });
