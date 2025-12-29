/**
 * Direct Gemini API Test
 * Test Google's Gemini API directly to verify key format and connectivity
 */

// Test with a sample API key format to understand requirements
async function testGeminiAPIFormat() {
  console.log('🔍 Testing Gemini API Key Format and Direct API Call');
  console.log('📋 Google Gemini API Requirements Analysis');
  console.log('=' .repeat(60));
  
  // Expected Gemini API key format based on Google documentation
  console.log('📝 Expected API Key Format:');
  console.log('   - Starts with: AIza (Google API keys typically start with AIza)');
  console.log('   - Length: ~39 characters');
  console.log('   - Pattern: AIza[A-Za-z0-9_-]{35}');
  console.log('   - Example: AIzaSyDaGmWKa4JsXZ-HjGw1w2xleVk7-nGOgUb (sample)');
  
  console.log('\n🌐 Testing Gemini API Endpoint Accessibility...');
  
  // Test 1: Check if the Gemini API endpoint is reachable
  const geminiBaseUrl = 'https://generativelanguage.googleapis.com/v1beta/models';
  
  try {
    console.log('📡 Testing base endpoint accessibility...');
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    const response = await fetch(`${geminiBaseUrl}/gemini-1.5-flash`, {
      method: 'GET',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    console.log(`   ✅ Base endpoint accessible: ${response.status}`);
    
    if (response.status === 403) {
      console.log('   🔑 403 Forbidden - API key required (expected)');
    } else if (response.status === 404) {
      console.log('   ❌ 404 Not Found - Model not found or endpoint changed');
    } else {
      console.log(`   ℹ️  Unexpected status: ${response.status}`);
    }
    
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log('   ⏱️  Timeout - Network connectivity issue');
    } else {
      console.log(`   ❌ Network error: ${error.message}`);
    }
  }
  
  console.log('\n🔧 Common Gemini API Issues:');
  console.log('1. API Key Format Issues:');
  console.log('   - Wrong prefix (should start with AIza)');
  console.log('   - Incorrect length (should be ~39 characters)');
  console.log('   - Invalid characters (only A-Z, a-z, 0-9, _, -)');
  
  console.log('\n2. API Key Permissions:');
  console.log('   - Generative AI API not enabled in Google Cloud');
  console.log('   - API key restrictions (IP, referrer, API restrictions)');
  console.log('   - Quota exceeded or billing not enabled');
  
  console.log('\n3. Model Access Issues:');
  console.log('   - gemini-1.5-flash not available in region');
  console.log('   - Model name incorrect (should be gemini-1.5-flash)');
  console.log('   - API version mismatch (using v1beta)');
  
  console.log('\n4. Network/Infrastructure Issues:');
  console.log('   - Vercel function timeout (30 seconds max)');
  console.log('   - Firewall blocking googleapis.com');
  console.log('   - DNS resolution issues');
  
  console.log('\n📋 Debugging Steps for Production:');
  console.log('1. Verify API key in Vercel Dashboard:');
  console.log('   - Go to Project Settings → Environment Variables');
  console.log('   - Check GEMINI_API_KEY is set for Production');
  console.log('   - Verify key starts with AIza and is ~39 characters');
  
  console.log('\n2. Test API key in Google AI Studio:');
  console.log('   - Go to https://makersuite.google.com/app/apikey');
  console.log('   - Test the key with a simple prompt');
  console.log('   - Verify gemini-1.5-flash model access');
  
  console.log('\n3. Check Google Cloud Console:');
  console.log('   - Verify Generative AI API is enabled');
  console.log('   - Check API key restrictions');
  console.log('   - Review quota and billing status');
  
  console.log('\n4. Test with curl command:');
  console.log('   curl -X POST \\');
  console.log('   "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=YOUR_API_KEY" \\');
  console.log('   -H "Content-Type: application/json" \\');
  console.log('   -d \'{"contents":[{"parts":[{"text":"Hello"}]}]}\'');
  
  console.log('\n🚨 Most Likely Issues Based on Symptoms:');
  console.log('Since the API key was configured on July 19, 2024 but still timing out:');
  console.log('1. ❌ API key format is incorrect (not starting with AIza)');
  console.log('2. ❌ API key has restrictions preventing server-side use');
  console.log('3. ❌ Generative AI API not enabled in Google Cloud project');
  console.log('4. ❌ API key expired or was regenerated');
  console.log('5. ❌ Network/firewall blocking googleapis.com from Vercel');
  
  console.log('\n✅ Immediate Action Items:');
  console.log('1. Double-check API key format in Vercel Dashboard');
  console.log('2. Test API key manually with curl or Postman');
  console.log('3. Verify Google Cloud project has Generative AI API enabled');
  console.log('4. Check for any API key restrictions in Google Cloud Console');
  console.log('5. Consider regenerating the API key if format is wrong');
}

// Test Gemini API request format
function showCorrectRequestFormat() {
  console.log('\n📄 Correct Gemini API Request Format:');
  console.log('=' .repeat(60));
  
  const correctFormat = {
    url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=YOUR_API_KEY',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: {
      contents: [{
        parts: [{
          text: 'Your prompt here'
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1000,
        topP: 0.8,
        topK: 40
      },
      safetySettings: [
        {
          category: 'HARM_CATEGORY_HARASSMENT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE'
        }
      ]
    }
  };
  
  console.log(JSON.stringify(correctFormat, null, 2));
  
  console.log('\n📊 Expected Response Format:');
  const expectedResponse = {
    candidates: [{
      content: {
        parts: [{
          text: 'Generated text response'
        }]
      },
      finishReason: 'STOP',
      index: 0,
      safetyRatings: []
    }],
    promptFeedback: {
      safetyRatings: []
    }
  };
  
  console.log(JSON.stringify(expectedResponse, null, 2));
}

// Run the tests
testGeminiAPIFormat();
showCorrectRequestFormat();
