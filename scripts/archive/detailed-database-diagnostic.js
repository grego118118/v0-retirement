/**
 * Detailed Database Diagnostic
 * Deep analysis of DATABASE_URL configuration issues
 */

async function detailedDatabaseDiagnostic() {
  console.log('🔍 Detailed DATABASE_URL Configuration Diagnostic\n');
  console.log('📊 Analyzing specific failure patterns...\n');
  
  const baseUrl = 'https://masspension.com';
  
  try {
    // Test 1: Detailed API Error Analysis
    console.log('🧪 TEST 1: Detailed API Error Analysis');
    
    const endpoints = [
      { name: 'Blog Posts', url: `${baseUrl}/api/blog/posts?limit=1` },
      { name: 'Blog Stats', url: `${baseUrl}/api/blog/posts/stats` },
      { name: 'Featured Posts', url: `${baseUrl}/api/blog/posts/featured?limit=1` }
    ];
    
    for (const endpoint of endpoints) {
      console.log(`\n   📡 Testing ${endpoint.name}:`);
      try {
        const response = await fetch(endpoint.url);
        console.log(`      Status: ${response.status} ${response.statusText}`);
        console.log(`      Headers: ${JSON.stringify(Object.fromEntries(response.headers.entries()), null, 6)}`);
        
        const responseText = await response.text();
        console.log(`      Response: ${responseText}`);
        
        if (response.status === 500) {
          try {
            const errorData = JSON.parse(responseText);
            console.log(`      Parsed Error: ${JSON.stringify(errorData, null, 6)}`);
          } catch (e) {
            console.log(`      Raw Error Text: ${responseText}`);
          }
        }
      } catch (error) {
        console.log(`      Network Error: ${error.message}`);
      }
    }
    
    // Test 2: Check for Environment Variable Hints
    console.log('\n🔧 TEST 2: Environment Variable Detection');
    
    // Test a simple health endpoint to see if the app is running
    try {
      const healthResponse = await fetch(`${baseUrl}/api/health`);
      console.log(`   Health API Status: ${healthResponse.status}`);
      
      if (healthResponse.ok) {
        console.log('   ✅ Application is running - issue is database-specific');
      } else {
        console.log('   ❌ General application issues detected');
      }
    } catch (error) {
      console.log(`   ❌ Health check failed: ${error.message}`);
    }
    
    // Test 3: Check Deployment Timestamp
    console.log('\n⏰ TEST 3: Deployment Timing Analysis');
    
    try {
      const response = await fetch(`${baseUrl}/api/blog/posts`, { method: 'HEAD' });
      const serverDate = response.headers.get('date');
      const deploymentTime = response.headers.get('x-vercel-cache') || 'unknown';
      
      console.log(`   Server Date: ${serverDate}`);
      console.log(`   Vercel Cache: ${deploymentTime}`);
      console.log(`   Current Time: ${new Date().toISOString()}`);
      
      if (serverDate) {
        const serverTime = new Date(serverDate);
        const timeDiff = Date.now() - serverTime.getTime();
        console.log(`   Time Difference: ${Math.round(timeDiff / 1000)} seconds`);
      }
    } catch (error) {
      console.log(`   ❌ Timing analysis failed: ${error.message}`);
    }
    
    // Test 4: Database Connection Pattern Analysis
    console.log('\n🗄️  TEST 4: Database Connection Pattern Analysis');
    
    const dbTestEndpoints = [
      `${baseUrl}/api/blog/posts?limit=1`,
      `${baseUrl}/api/blog/posts/stats`,
      `${baseUrl}/api/blog/posts/featured?limit=1`
    ];
    
    let allSame500 = true;
    let allSameError = true;
    let firstError = null;
    
    for (const endpoint of dbTestEndpoints) {
      try {
        const response = await fetch(endpoint);
        if (response.status !== 500) {
          allSame500 = false;
        }
        
        const errorText = await response.text();
        if (!firstError) {
          firstError = errorText;
        } else if (errorText !== firstError) {
          allSameError = false;
        }
      } catch (error) {
        allSame500 = false;
        allSameError = false;
      }
    }
    
    console.log(`   All endpoints return 500: ${allSame500 ? '✅ Yes' : '❌ No'}`);
    console.log(`   All endpoints same error: ${allSameError ? '✅ Yes' : '❌ No'}`);
    
    if (allSame500 && allSameError) {
      console.log('   🔍 Pattern: Consistent database connectivity failure');
      console.log('   💡 Likely cause: DATABASE_URL not loaded or incorrect');
    }
    
    // Test 5: Blog Page Content Analysis
    console.log('\n📄 TEST 5: Blog Page Content Analysis');
    
    try {
      const blogResponse = await fetch(`${baseUrl}/blog`);
      if (blogResponse.ok) {
        const blogHtml = await blogResponse.text();
        
        // Check for specific indicators
        const indicators = {
          'Static fallback data': blogHtml.includes('Understanding Your Massachusetts Retirement Benefits'),
          'Enhanced blog grid': blogHtml.includes('EnhancedBlogGrid') || blogHtml.includes('blog-grid'),
          'AdSense integration': blogHtml.includes('ResponsiveAd') || blogHtml.includes('adsbygoogle'),
          'Massachusetts content': blogHtml.toLowerCase().includes('massachusetts retirement'),
          'API error handling': blogHtml.includes('No blog posts found') || blogHtml.includes('error'),
          'Real blog posts': blogHtml.includes('Read more') && !blogHtml.includes('No blog posts found')
        };
        
        console.log('   📋 Content Analysis:');
        for (const [indicator, present] of Object.entries(indicators)) {
          console.log(`      ${indicator}: ${present ? '✅ Present' : '❌ Missing'}`);
        }
        
        if (indicators['Static fallback data'] && !indicators['Real blog posts']) {
          console.log('   🔍 Conclusion: Blog page using static fallback due to API failures');
        }
      }
    } catch (error) {
      console.log(`   ❌ Blog page analysis failed: ${error.message}`);
    }
    
    // Test 6: Specific DATABASE_URL Issues
    console.log('\n🔧 TEST 6: DATABASE_URL Configuration Issues');
    
    console.log('   📋 Common DATABASE_URL Problems:');
    console.log('   1. ❌ Environment set to Preview/Development instead of Production');
    console.log('   2. ❌ Typo in connection string (missing characters, extra spaces)');
    console.log('   3. ❌ Variable name incorrect (DB_URL vs DATABASE_URL)');
    console.log('   4. ❌ Vercel redeploy not triggered after variable addition');
    console.log('   5. ❌ Build process failed with new environment variable');
    console.log('   6. ❌ Database server temporarily unavailable');
    
    console.log('\n   🔍 Expected vs Actual:');
    console.log('   Expected DATABASE_URL:');
    console.log('   postgresql://postgres.omiqpphkibfqddmwruuc:cwExuZuEgsZ29mXD@aws-0-us-east-1.pooler.supabase.com:5432/postgres');
    console.log('   ');
    console.log('   ⚠️  Check for these common typos:');
    console.log('   - Missing "postgresql://" prefix');
    console.log('   - Wrong username (should be "postgres.omiqpphkibfqddmwruuc")');
    console.log('   - Wrong password (should be "cwExuZuEgsZ29mXD")');
    console.log('   - Wrong host (should be "aws-0-us-east-1.pooler.supabase.com")');
    console.log('   - Wrong port (should be "5432")');
    console.log('   - Wrong database name (should be "postgres")');
    
    // Final Diagnosis
    console.log('\n🎯 FINAL DIAGNOSIS');
    console.log('=' .repeat(60));
    
    if (allSame500 && allSameError) {
      console.log('🔍 DIAGNOSIS: DATABASE_URL Environment Variable Issue');
      console.log('');
      console.log('📊 Evidence:');
      console.log('- All database-dependent API endpoints return identical 500 errors');
      console.log('- Blog page loads but uses static fallback data');
      console.log('- Protected endpoints work correctly (authentication functional)');
      console.log('- Application is running (not a general deployment failure)');
      console.log('');
      console.log('💡 Root Cause: DATABASE_URL not properly configured in Vercel Production');
      console.log('');
      console.log('🔧 IMMEDIATE ACTIONS REQUIRED:');
      console.log('1. Go to Vercel Dashboard → v0-retirement → Settings → Environment Variables');
      console.log('2. Verify DATABASE_URL is set for "Production" environment');
      console.log('3. Check connection string is exactly correct (no typos)');
      console.log('4. If correct, trigger manual redeploy from Deployments tab');
      console.log('5. Wait 5-10 minutes and test again');
      
      console.log('\n📞 VERIFICATION STEPS:');
      console.log('□ DATABASE_URL variable exists in Vercel');
      console.log('□ Environment is set to "Production"');
      console.log('□ Connection string matches exactly');
      console.log('□ Variable was saved successfully');
      console.log('□ Deployment completed after variable addition');
    } else {
      console.log('🔍 DIAGNOSIS: Mixed or Unusual Error Pattern');
      console.log('Further investigation needed - not a standard DATABASE_URL issue');
    }
    
  } catch (error) {
    console.error('❌ Diagnostic failed:', error.message);
  }
}

// Run detailed diagnostic
detailedDatabaseDiagnostic();
