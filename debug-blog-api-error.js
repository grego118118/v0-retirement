/**
 * Debug Blog API Error
 * Get detailed error information from the live blog API
 */

async function debugBlogApiError() {
  console.log('🔍 Debugging Blog API Error on masspension.com\n');
  
  const baseUrl = 'https://masspension.com';
  
  try {
    // Test the blog posts API with detailed error logging
    console.log('📊 Testing Blog Posts API with error details...');
    const response = await fetch(`${baseUrl}/api/blog/posts?limit=1`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`   Status: ${response.status} ${response.statusText}`);
    console.log(`   Headers: ${JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2)}`);
    
    const responseText = await response.text();
    console.log(`   Response Body: ${responseText}`);
    
    if (response.status === 500) {
      try {
        const errorData = JSON.parse(responseText);
        console.log('\n🚨 Parsed Error Details:');
        console.log(`   Error Message: ${errorData.error || 'Unknown error'}`);
        console.log(`   Error Details: ${JSON.stringify(errorData, null, 2)}`);
      } catch (parseError) {
        console.log('\n🚨 Raw Error Response (not JSON):');
        console.log(`   ${responseText}`);
      }
    }
    
    // Test other blog endpoints for comparison
    console.log('\n📈 Testing Blog Stats API...');
    const statsResponse = await fetch(`${baseUrl}/api/blog/posts/stats`);
    console.log(`   Status: ${statsResponse.status}`);
    if (statsResponse.status === 500) {
      const statsError = await statsResponse.text();
      console.log(`   Error: ${statsError}`);
    }
    
    console.log('\n🌟 Testing Featured Posts API...');
    const featuredResponse = await fetch(`${baseUrl}/api/blog/posts/featured`);
    console.log(`   Status: ${featuredResponse.status}`);
    if (featuredResponse.status === 500) {
      const featuredError = await featuredResponse.text();
      console.log(`   Error: ${featuredError}`);
    }
    
    // Test if it's a database connection issue vs table missing issue
    console.log('\n🔧 DIAGNOSIS:');
    if (response.status === 500) {
      console.log('❌ 500 Internal Server Error detected');
      console.log('   Possible causes:');
      console.log('   1. Database connection failure (DATABASE_URL issue)');
      console.log('   2. Missing blog tables in database');
      console.log('   3. Prisma client not generated properly');
      console.log('   4. Environment variables not set in production');
      console.log('   5. Database schema mismatch');
    }
    
    // Test a simple API endpoint to see if the issue is blog-specific
    console.log('\n🧪 Testing Non-Blog API for comparison...');
    try {
      const healthResponse = await fetch(`${baseUrl}/api/health`);
      console.log(`   Health API Status: ${healthResponse.status}`);
      if (healthResponse.ok) {
        console.log('   ✅ Non-blog APIs working - issue is blog-specific');
      } else {
        console.log('   ❌ General API issues detected');
      }
    } catch (error) {
      console.log(`   ❓ Health API test failed: ${error.message}`);
    }
    
  } catch (error) {
    console.error('❌ Error during debugging:', error.message);
    console.log('\n🔧 Network/Connection Issues:');
    console.log('   - Check if masspension.com is accessible');
    console.log('   - Verify API endpoints exist');
    console.log('   - Check for CORS or network restrictions');
  }
}

// Run the debug
debugBlogApiError();
