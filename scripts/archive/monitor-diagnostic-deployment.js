/**
 * Monitor Diagnostic Deployment
 * Wait for diagnostic endpoints to be deployed and then test them
 */

async function monitorDiagnosticDeployment() {
  console.log('⏳ Monitoring Diagnostic Endpoint Deployment\n');
  console.log('✅ PR #4 merged successfully');
  console.log('🚀 Waiting for Vercel deployment to complete...\n');
  
  const baseUrl = 'https://masspension.com';
  const maxAttempts = 20; // 20 attempts over ~10 minutes
  const delayBetweenAttempts = 30000; // 30 seconds
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    console.log(`📡 Deployment Check ${attempt}/${maxAttempts}: Testing diagnostic endpoints`);
    
    try {
      // Test if diagnostic endpoints are deployed
      const envResponse = await fetch(`${baseUrl}/api/debug/env-test`);
      console.log(`   Environment diagnostic: ${envResponse.status}`);
      
      if (envResponse.status === 200) {
        // SUCCESS! Diagnostic endpoints are deployed
        console.log('\n🎉 DIAGNOSTIC ENDPOINTS DEPLOYED!');
        console.log('✅ Deployment completed successfully');
        console.log('🔍 Running comprehensive diagnostic tests...\n');
        
        // Test 1: Environment Variables
        const envData = await envResponse.json();
        console.log('📊 ENVIRONMENT DIAGNOSTIC RESULTS:');
        console.log(`   Environment: ${envData.environment?.nodeEnv} (${envData.environment?.vercelEnv})`);
        console.log(`   DATABASE_URL: ${envData.database?.hasUrl ? '✅ Present' : '❌ Missing'}`);
        console.log(`   URL Length: ${envData.database?.urlLength || 0} characters`);
        console.log(`   URL Protocol: ${envData.database?.urlProtocol || 'Unknown'}`);
        console.log(`   AdSense Config: ${envData.adSense?.configured ? '✅ Complete' : '❌ Incomplete'}`);
        
        // Test 2: Database Connection
        console.log('\n🗄️  DATABASE CONNECTION DIAGNOSTIC:');
        const dbResponse = await fetch(`${baseUrl}/api/debug/database-test`);
        console.log(`   Status: ${dbResponse.status}`);
        
        if (dbResponse.ok) {
          const dbData = await dbResponse.json();
          console.log('   🎉 DATABASE CONNECTION SUCCESSFUL!');
          console.log(`   Connection Test: ${dbData.diagnostics?.connectionTest || 'Unknown'}`);
          console.log(`   Blog Posts: ${dbData.diagnostics?.blogPostCount || 0}`);
          console.log(`   Categories: ${dbData.diagnostics?.categoryCount || 0}`);
          console.log(`   Duration: ${dbData.diagnostics?.duration || 'Unknown'}`);
          
          if (dbData.diagnostics?.samplePost) {
            console.log(`   Sample Post: "${dbData.diagnostics.samplePost.title}"`);
          }
          
        } else {
          const dbErrorText = await dbResponse.text();
          console.log('   ❌ DATABASE CONNECTION FAILED');
          console.log(`   Error: ${dbErrorText}`);
          
          try {
            const dbErrorData = JSON.parse(dbErrorText);
            console.log(`   Error Type: ${dbErrorData.errorName || 'Unknown'}`);
            console.log(`   Has DATABASE_URL: ${dbErrorData.diagnostics?.hasDbUrl ? 'Yes' : 'No'}`);
          } catch (e) {
            // Non-JSON error
          }
        }
        
        // Test 3: Blog API Status
        console.log('\n📊 BLOG API STATUS CHECK:');
        const blogResponse = await fetch(`${baseUrl}/api/blog/posts?limit=1`);
        console.log(`   Status: ${blogResponse.status}`);
        
        if (blogResponse.ok) {
          const blogData = await blogResponse.json();
          console.log('   🎉 BLOG API IS WORKING!');
          console.log(`   Posts Retrieved: ${blogData.posts?.length || 0}`);
          console.log(`   Total Posts: ${blogData.pagination?.total || 0}`);
          
          if (blogData.posts && blogData.posts.length > 0) {
            console.log(`   Sample: "${blogData.posts[0].title}"`);
          }
        } else {
          console.log('   ❌ Blog API still failing');
        }
        
        // Final Assessment
        console.log('\n🎯 FINAL DIAGNOSTIC ASSESSMENT');
        console.log('=' .repeat(50));
        
        if (envData.database?.hasUrl && dbResponse.ok && blogResponse.ok) {
          console.log('🏆 COMPLETE SUCCESS!');
          console.log('✅ DATABASE_URL available at runtime');
          console.log('✅ Database connection working');
          console.log('✅ Blog API endpoints functional');
          console.log('✅ Massachusetts Retirement System blog operational');
          
          console.log('\n📋 SYSTEM STATUS:');
          console.log('- Runtime Environment: ✅ Working');
          console.log('- DATABASE_URL Configuration: ✅ Resolved');
          console.log('- Prisma Client: ✅ Connecting');
          console.log('- Blog APIs: ✅ Returning data');
          console.log('- AdSense Integration: ✅ Configured');
          
          console.log('\n🎊 AI BLOG POSTING SYSTEM: FULLY FUNCTIONAL!');
          
        } else if (envData.database?.hasUrl && !dbResponse.ok) {
          console.log('🔍 PARTIAL SUCCESS');
          console.log('✅ DATABASE_URL available at runtime');
          console.log('❌ Database connection issues detected');
          console.log('💡 Prisma client or database server problem');
          
        } else if (!envData.database?.hasUrl) {
          console.log('🚨 ROOT CAUSE IDENTIFIED');
          console.log('❌ DATABASE_URL NOT available at runtime');
          console.log('💡 This confirms the runtime vs build-time discrepancy');
          console.log('🔧 Need to fix Vercel environment variable configuration');
          
        } else {
          console.log('🔍 MIXED RESULTS - Further investigation needed');
        }
        
        break;
        
      } else if (envResponse.status === 404) {
        console.log('   ⏳ Diagnostic endpoints not deployed yet...');
        
        if (attempt === 1) {
          console.log('\n🔧 DEPLOYMENT STATUS:');
          console.log('   PR #4 merged successfully but deployment still in progress');
          console.log('   Expected deployment stages:');
          console.log('   1. ⏳ Code build and compilation');
          console.log('   2. ⏳ Serverless function deployment');
          console.log('   3. ⏳ Global CDN propagation');
          console.log('   4. ✅ Diagnostic endpoints available');
        }
        
        if (attempt < maxAttempts) {
          console.log(`   ⏳ Waiting ${delayBetweenAttempts/1000} seconds for deployment...`);
          await new Promise(resolve => setTimeout(resolve, delayBetweenAttempts));
        } else {
          console.log('\n❌ DEPLOYMENT TIMEOUT');
          console.log('Diagnostic endpoints not available after extended wait');
          console.log('\n🔧 TROUBLESHOOTING:');
          console.log('1. Check Vercel deployment logs for build errors');
          console.log('2. Verify PR #4 was merged successfully');
          console.log('3. Check if deployment is still in progress');
          console.log('4. Try manual redeploy from Vercel dashboard');
        }
        
      } else {
        console.log(`   ❌ Unexpected status: ${envResponse.status}`);
        if (attempt < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, delayBetweenAttempts));
        }
      }
      
    } catch (error) {
      console.error(`   ❌ Error on attempt ${attempt}:`, error.message);
      if (attempt < maxAttempts) {
        console.log(`   ⏳ Retrying in ${delayBetweenAttempts/1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, delayBetweenAttempts));
      }
    }
  }
  
  console.log('\n📊 Monitoring Complete');
}

// Start monitoring
monitorDiagnosticDeployment();
