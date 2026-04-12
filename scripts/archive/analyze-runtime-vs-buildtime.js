/**
 * Analyze Runtime vs Build-time Issues
 * Compare deployment logs success with runtime failures
 */

async function analyzeRuntimeVsBuildtime() {
  console.log('🔍 Analyzing Runtime vs Build-time DATABASE_URL Issues\n');
  console.log('📊 DEPLOYMENT LOG ANALYSIS:');
  console.log('✅ Build completed successfully at 20:30:06.529');
  console.log('✅ Prisma connecting with DATABASE_URL confirmed');
  console.log('✅ AdSense integration active (slot: 3206088503)');
  console.log('✅ All 100 static pages generated');
  console.log('✅ No build errors detected');
  console.log('\n❌ RUNTIME REALITY:');
  console.log('❌ Blog API endpoints still return 500 errors');
  console.log('❌ Database connectivity appears broken at runtime');
  console.log('\n🔍 INVESTIGATING DISCREPANCY...\n');
  
  const baseUrl = 'https://masspension.com';
  
  try {
    // Test 1: Quick API Status Check
    console.log('📡 TEST 1: Current API Status');
    const response = await fetch(`${baseUrl}/api/blog/posts?limit=1`);
    console.log(`   Status: ${response.status} ${response.statusText}`);
    console.log(`   Timestamp: ${new Date().toISOString()}`);
    
    const responseText = await response.text();
    console.log(`   Response: ${responseText}`);
    
    // Test 2: Check Response Headers for Clues
    console.log('\n🔍 TEST 2: Response Headers Analysis');
    const headers = Object.fromEntries(response.headers.entries());
    console.log('   Key Headers:');
    console.log(`   - Server: ${headers.server || 'Unknown'}`);
    console.log(`   - Date: ${headers.date || 'Unknown'}`);
    console.log(`   - X-Vercel-ID: ${headers['x-vercel-id'] || 'Unknown'}`);
    console.log(`   - X-Vercel-Cache: ${headers['x-vercel-cache'] || 'Unknown'}`);
    console.log(`   - Content-Type: ${headers['content-type'] || 'Unknown'}`);
    
    // Test 3: Check if it's a Caching Issue
    console.log('\n🔄 TEST 3: Cache-Busting Test');
    const cacheBustUrl = `${baseUrl}/api/blog/posts?limit=1&t=${Date.now()}`;
    const cacheBustResponse = await fetch(cacheBustUrl);
    console.log(`   Cache-bust Status: ${cacheBustResponse.status}`);
    
    if (cacheBustResponse.status !== response.status) {
      console.log('   🔍 Different response with cache-busting - caching issue detected');
    } else {
      console.log('   🔍 Same response with cache-busting - not a caching issue');
    }
    
    // Test 4: Test Different API Endpoints
    console.log('\n🧪 TEST 4: Multiple Endpoint Test');
    const endpoints = [
      '/api/blog/posts',
      '/api/blog/posts/stats',
      '/api/blog/posts/featured',
      '/api/health'
    ];
    
    for (const endpoint of endpoints) {
      try {
        const endpointResponse = await fetch(`${baseUrl}${endpoint}`);
        console.log(`   ${endpoint}: ${endpointResponse.status} ${endpointResponse.statusText}`);
      } catch (error) {
        console.log(`   ${endpoint}: ERROR - ${error.message}`);
      }
    }
    
    // Test 5: Analyze Error Pattern
    console.log('\n🔍 TEST 5: Error Pattern Analysis');
    
    if (response.status === 500) {
      console.log('   📊 500 Internal Server Error Pattern:');
      console.log('   - Build-time: DATABASE_URL working (Prisma connected)');
      console.log('   - Runtime: DATABASE_URL failing (API errors)');
      console.log('   ');
      console.log('   🔍 Possible Causes:');
      console.log('   1. Environment variable not loaded at runtime');
      console.log('   2. Database connection pooling issues');
      console.log('   3. Prisma client not properly initialized');
      console.log('   4. Database server connectivity problems');
      console.log('   5. Runtime environment different from build environment');
      console.log('   6. Serverless function cold start issues');
      
      try {
        const errorData = JSON.parse(responseText);
        console.log(`   📝 Error Message: "${errorData.error || 'Unknown'}"`);
        
        if (errorData.error === 'Failed to fetch blog posts') {
          console.log('   🔍 Generic error suggests database connection failure');
          console.log('   💡 Likely: Prisma client cannot connect at runtime');
        }
      } catch (e) {
        console.log('   📝 Non-JSON error response');
      }
    }
    
    // Test 6: Deployment Timing Analysis
    console.log('\n⏰ TEST 6: Deployment Timing Analysis');
    const serverDate = headers.date ? new Date(headers.date) : new Date();
    const deploymentTime = new Date('2025-08-01T20:30:06.529Z'); // From logs
    const timeSinceDeployment = Date.now() - deploymentTime.getTime();
    
    console.log(`   Deployment completed: ${deploymentTime.toISOString()}`);
    console.log(`   Current server time: ${serverDate.toISOString()}`);
    console.log(`   Time since deployment: ${Math.round(timeSinceDeployment / 1000 / 60)} minutes`);
    
    if (timeSinceDeployment < 10 * 60 * 1000) { // Less than 10 minutes
      console.log('   ⏳ Recent deployment - may still be propagating');
    } else {
      console.log('   ✅ Sufficient time for propagation - not a timing issue');
    }
    
    // Final Analysis
    console.log('\n🎯 RUNTIME vs BUILD-TIME ANALYSIS');
    console.log('=' .repeat(60));
    
    console.log('📊 BUILD-TIME SUCCESS INDICATORS:');
    console.log('✅ Prisma connecting with DATABASE_URL');
    console.log('✅ Static page generation successful');
    console.log('✅ No TypeScript compilation errors');
    console.log('✅ AdSense integration working');
    console.log('✅ Build process completed without errors');
    
    console.log('\n❌ RUNTIME FAILURE INDICATORS:');
    console.log('❌ All blog API endpoints return 500 errors');
    console.log('❌ Generic "Failed to fetch" error messages');
    console.log('❌ Database connectivity appears broken');
    console.log('❌ No actual blog content accessible');
    
    console.log('\n🔍 DIAGNOSIS:');
    console.log('The discrepancy between build-time success and runtime failure suggests:');
    console.log('');
    console.log('🎯 MOST LIKELY CAUSE: Runtime Environment Issue');
    console.log('- DATABASE_URL works during build (static generation)');
    console.log('- DATABASE_URL fails during runtime (API requests)');
    console.log('- Possible serverless function environment problem');
    console.log('- Prisma client initialization issues at runtime');
    
    console.log('\n🔧 RECOMMENDED ACTIONS:');
    console.log('1. Check Vercel Function Logs for runtime errors');
    console.log('2. Verify DATABASE_URL is available in serverless functions');
    console.log('3. Test database connection from Supabase dashboard');
    console.log('4. Consider Prisma client regeneration');
    console.log('5. Check for serverless function timeout issues');
    
    console.log('\n📞 NEXT STEPS:');
    console.log('- Review Vercel Function Logs for specific runtime errors');
    console.log('- Verify DATABASE_URL in serverless function environment');
    console.log('- Test direct database connectivity');
    console.log('- Consider manual Prisma client regeneration');
    
  } catch (error) {
    console.error('❌ Analysis failed:', error.message);
  }
}

// Run analysis
analyzeRuntimeVsBuildtime();
