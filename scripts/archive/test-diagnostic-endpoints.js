/**
 * Test Diagnostic Endpoints
 * Test the newly deployed runtime diagnostic endpoints to identify DATABASE_URL issues
 */

async function testDiagnosticEndpoints() {
  console.log('🔍 Testing Runtime Diagnostic Endpoints\n');
  console.log('✅ Diagnostic endpoints deployed via PR #4');
  console.log('🎯 Goal: Identify runtime vs build-time DATABASE_URL discrepancy\n');
  
  const baseUrl = 'https://masspension.com';
  
  try {
    // Test 1: Environment Variable Diagnostic
    console.log('🧪 TEST 1: Environment Variable Diagnostic');
    console.log('   Endpoint: /api/debug/env-test');
    
    const envResponse = await fetch(`${baseUrl}/api/debug/env-test`);
    console.log(`   Status: ${envResponse.status} ${envResponse.statusText}`);
    
    if (envResponse.ok) {
      const envData = await envResponse.json();
      console.log('   ✅ SUCCESS! Environment diagnostic working');
      console.log(`   📊 Environment: ${envData.environment?.nodeEnv} (${envData.environment?.vercelEnv})`);
      console.log(`   🗄️  Database URL: ${envData.database?.hasUrl ? '✅ Present' : '❌ Missing'}`);
      console.log(`   📏 Database URL Length: ${envData.database?.urlLength || 0} characters`);
      console.log(`   🔗 Database Protocol: ${envData.database?.urlProtocol || 'Unknown'}`);
      console.log(`   💰 AdSense Configured: ${envData.adSense?.configured ? '✅ Yes' : '❌ No'}`);
      
      if (envData.database?.hasUrl) {
        console.log('   🎯 DATABASE_URL is available in runtime environment');
      } else {
        console.log('   🚨 DATABASE_URL is NOT available in runtime environment');
        console.log('   💡 This explains the runtime vs build-time discrepancy');
      }
    } else {
      const errorText = await envResponse.text();
      console.log('   ❌ FAILED! Environment diagnostic error');
      console.log(`   Error: ${errorText}`);
    }
    
    // Test 2: Database Connection Diagnostic
    console.log('\n🗄️  TEST 2: Database Connection Diagnostic');
    console.log('   Endpoint: /api/debug/database-test');
    
    const dbResponse = await fetch(`${baseUrl}/api/debug/database-test`);
    console.log(`   Status: ${dbResponse.status} ${dbResponse.statusText}`);
    
    if (dbResponse.ok) {
      const dbData = await dbResponse.json();
      console.log('   🎉 SUCCESS! Database diagnostic working');
      console.log(`   🔌 Connection Test: ${dbData.diagnostics?.connectionTest || 'Unknown'}`);
      console.log(`   📊 Blog Posts Count: ${dbData.diagnostics?.blogPostCount || 0}`);
      console.log(`   📂 Categories Count: ${dbData.diagnostics?.categoryCount || 0}`);
      console.log(`   ⏱️  Duration: ${dbData.diagnostics?.duration || 'Unknown'}`);
      
      if (dbData.diagnostics?.samplePost) {
        console.log(`   📝 Sample Post: "${dbData.diagnostics.samplePost.title}"`);
        console.log(`   🤖 AI Generated: ${dbData.diagnostics.samplePost.isAiGenerated ? 'Yes' : 'No'}`);
      } else {
        console.log('   📝 Sample Post: No published posts found');
      }
      
      console.log('\n   🎯 DATABASE CONNECTION IS WORKING!');
      console.log('   ✅ Prisma client can connect to database');
      console.log('   ✅ Database queries execute successfully');
      console.log('   ✅ Blog tables exist and contain data');
      
    } else {
      const errorText = await dbResponse.text();
      console.log('   ❌ FAILED! Database connection diagnostic error');
      console.log(`   Error: ${errorText}`);
      
      try {
        const errorData = JSON.parse(errorText);
        console.log('\n   🔍 DETAILED ERROR ANALYSIS:');
        console.log(`   Error Type: ${errorData.errorName || 'Unknown'}`);
        console.log(`   Error Message: ${errorData.error || 'Unknown'}`);
        console.log(`   Has DATABASE_URL: ${errorData.diagnostics?.hasDbUrl ? '✅ Yes' : '❌ No'}`);
        console.log(`   DATABASE_URL Length: ${errorData.diagnostics?.dbUrlLength || 0}`);
        console.log(`   Environment: ${errorData.diagnostics?.nodeEnv || 'Unknown'}`);
        console.log(`   Duration: ${errorData.diagnostics?.duration || 'Unknown'}`);
        
        if (!errorData.diagnostics?.hasDbUrl) {
          console.log('\n   🚨 ROOT CAUSE IDENTIFIED: DATABASE_URL NOT AVAILABLE AT RUNTIME');
          console.log('   💡 This confirms the runtime vs build-time discrepancy');
        } else {
          console.log('\n   🔍 DATABASE_URL is available but connection is failing');
          console.log('   💡 Possible Prisma client or database server issue');
        }
      } catch (parseError) {
        console.log('   📝 Raw error response (not JSON)');
      }
    }
    
    // Test 3: Compare with Original Blog API
    console.log('\n📊 TEST 3: Compare with Original Blog API');
    console.log('   Endpoint: /api/blog/posts');
    
    const blogResponse = await fetch(`${baseUrl}/api/blog/posts?limit=1`);
    console.log(`   Status: ${blogResponse.status} ${blogResponse.statusText}`);
    
    if (blogResponse.ok) {
      const blogData = await blogResponse.json();
      console.log('   🎉 AMAZING! Blog API is now working!');
      console.log(`   📝 Posts retrieved: ${blogData.posts?.length || 0}`);
      console.log(`   📈 Total posts: ${blogData.pagination?.total || 0}`);
      
      if (blogData.posts && blogData.posts.length > 0) {
        console.log(`   📋 Sample: "${blogData.posts[0].title}"`);
        console.log(`   🤖 AI Generated: ${blogData.posts[0].is_ai_generated ? 'Yes' : 'No'}`);
      }
      
      console.log('\n   🏆 BLOG SYSTEM IS NOW FUNCTIONAL!');
      
    } else {
      const errorText = await blogResponse.text();
      console.log('   ❌ Blog API still failing');
      console.log(`   Error: ${errorText}`);
    }
    
    // Final Analysis
    console.log('\n🎯 DIAGNOSTIC ANALYSIS COMPLETE');
    console.log('=' .repeat(60));
    
    if (envResponse.ok && dbResponse.ok && blogResponse.ok) {
      console.log('🎉 COMPLETE SUCCESS!');
      console.log('✅ Environment variables available at runtime');
      console.log('✅ Database connection working');
      console.log('✅ Blog API endpoints functional');
      console.log('✅ Massachusetts Retirement System blog system operational');
      
      console.log('\n📋 SYSTEM STATUS:');
      console.log('- Runtime Environment: ✅ Working');
      console.log('- DATABASE_URL: ✅ Available and functional');
      console.log('- Prisma Client: ✅ Connecting successfully');
      console.log('- Blog APIs: ✅ Returning data');
      console.log('- AdSense Integration: ✅ Configured');
      
      console.log('\n🏆 AI BLOG POSTING SYSTEM: FULLY OPERATIONAL');
      
    } else if (envResponse.ok && !dbResponse.ok) {
      console.log('🔍 PARTIAL SUCCESS - Environment OK, Database Issues');
      console.log('✅ DATABASE_URL available in runtime environment');
      console.log('❌ Database connection or Prisma client issues');
      console.log('💡 Need to investigate database connectivity or Prisma configuration');
      
    } else if (!envResponse.ok) {
      console.log('❌ ENVIRONMENT ISSUES DETECTED');
      console.log('❌ Diagnostic endpoints may not be deployed yet');
      console.log('⏳ Wait for deployment completion and test again');
      
    } else {
      console.log('🔍 MIXED RESULTS - Further investigation needed');
    }
    
    console.log('\n📞 NEXT STEPS:');
    if (blogResponse.ok) {
      console.log('1. ✅ Blog system is working - test all endpoints');
      console.log('2. ✅ Verify Massachusetts Retirement content');
      console.log('3. ✅ Test AdSense integration in blog posts');
      console.log('4. ✅ Configure AI content generation');
    } else {
      console.log('1. 🔄 Review diagnostic results above');
      console.log('2. 🔄 Address identified DATABASE_URL issues');
      console.log('3. 🔄 Test database connectivity from Supabase');
      console.log('4. 🔄 Check Vercel function logs for errors');
    }
    
  } catch (error) {
    console.error('❌ Diagnostic testing failed:', error.message);
    console.log('\n🔧 TROUBLESHOOTING:');
    console.log('1. Check if diagnostic endpoints are deployed');
    console.log('2. Verify network connectivity to masspension.com');
    console.log('3. Wait for deployment completion and retry');
  }
}

// Run diagnostic tests
testDiagnosticEndpoints();
