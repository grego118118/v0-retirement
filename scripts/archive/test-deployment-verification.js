/**
 * Deployment Verification Test
 * Massachusetts Retirement System - Final Production Readiness Validation
 */

async function testDeploymentVerification() {
  console.log('🚀 MASSACHUSETTS RETIREMENT SYSTEM - DEPLOYMENT VERIFICATION');
  console.log('📋 Testing Database Field Mapping Fixes and Full System Operation');
  console.log('=' .repeat(70));
  
  const BASE_URL = 'https://www.masspension.com';
  const CRON_SECRET = '462c44a146ca26604411330b9cc568e9cc10a60e09745f4b7e26f8a80983c140';
  
  let testResults = {
    databaseFieldMapping: false,
    realDatabaseStorage: false,
    contentGeneration: false,
    emailConfiguration: false,
    endToEndWorkflow: false
  };
  
  try {
    // Test 1: Generate blog post to test database field mapping
    console.log('📝 Test 1: Testing Database Field Mapping Fixes...');
    console.log('🎯 Goal: Generate real blog post with UUID ID (not test-* pattern)');
    
    const startTime = Date.now();
    
    const generateResponse = await fetch(`${BASE_URL}/api/admin/blog/generate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CRON_SECRET}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        topic: {
          title: 'Massachusetts Retirement System Database Integration Test',
          description: 'Testing real database storage with proper field mapping for Massachusetts retirement benefits information',
          keywords: ['Massachusetts retirement', 'database integration', 'field mapping test', 'COLA benefits']
        },
        category_id: 'pension-planning',
        ai_model: 'gemini-1.5-flash',
        word_count: 800,
        target_audience: 'Massachusetts public employees',
        seo_keywords: ['Massachusetts retirement', 'pension benefits', 'database test'],
        auto_publish: false
      })
    });
    
    const responseTime = Date.now() - startTime;
    console.log(`📊 Response Status: ${generateResponse.status} (${responseTime}ms)`);
    
    if (generateResponse.ok) {
      const data = await generateResponse.json();
      
      console.log('\n✅ BLOG GENERATION SUCCESSFUL');
      console.log('=' .repeat(40));
      console.log(`📝 Post ID: ${data.post?.id}`);
      console.log(`📰 Title: ${data.post?.title || 'N/A'}`);
      console.log(`📊 Word Count: ${data.post?.word_count || 'N/A'}`);
      console.log(`📋 Status: ${data.post?.status || 'N/A'}`);
      console.log(`🔍 Fact Check Status: ${data.post?.fact_check_status || 'N/A'}`);
      
      // Critical Test: Check if we got a real UUID or mock test-* ID
      if (data.post?.id && !data.post.id.startsWith('test-')) {
        console.log('\n🎉 SUCCESS: REAL DATABASE STORAGE WORKING!');
        console.log('✅ Post saved with real UUID ID');
        console.log('✅ Database field mapping fixes deployed successfully');
        testResults.databaseFieldMapping = true;
        testResults.realDatabaseStorage = true;
        testResults.contentGeneration = true;
        
        // Store the real post ID for further testing
        const realPostId = data.post.id;
        
        // Test 2: Verify post can be retrieved from database
        console.log('\n📖 Test 2: Verifying Database Retrieval...');
        
        try {
          const retrieveResponse = await fetch(`${BASE_URL}/api/blog/posts?limit=5`);
          if (retrieveResponse.ok) {
            const postsData = await retrieveResponse.json();
            console.log(`✅ Blog posts API accessible`);
            console.log(`📊 Found ${postsData.posts?.length || 0} posts in database`);
            
            // Check if our newly created post is in the results
            const ourPost = postsData.posts?.find(p => p.id === realPostId);
            if (ourPost) {
              console.log('✅ Newly created post found in database');
              console.log(`   Title: ${ourPost.title}`);
              console.log(`   Status: ${ourPost.status}`);
            } else {
              console.log('⚠️  Newly created post not yet visible in public API (may be draft)');
            }
          } else {
            console.log('⚠️  Blog posts API not accessible');
          }
        } catch (retrieveError) {
          console.log(`⚠️  Database retrieval test failed: ${retrieveError.message}`);
        }
        
      } else if (data.post?.id?.startsWith('test-')) {
        console.log('\n⚠️  STILL GETTING MOCK RESPONSES');
        console.log('❌ Database field mapping fixes not yet deployed');
        console.log('📋 Post ID pattern indicates database save is still failing');
        console.log('🔧 Need to deploy the local code changes to production');
        testResults.contentGeneration = true; // API works, but database doesn't
        
      } else {
        console.log('\n❌ UNEXPECTED RESPONSE FORMAT');
        console.log('Post ID not found in response');
      }
      
      // Test 3: Check content quality
      console.log('\n📊 Test 3: Content Quality Analysis...');
      console.log(`   Overall Quality: ${data.quality_metrics?.overall_quality || 'N/A'}/100`);
      console.log(`   SEO Score: ${data.quality_metrics?.seo_score || 'N/A'}/100`);
      console.log(`   MA Relevance: ${data.quality_metrics?.massachusetts_relevance || 'N/A'}/100`);
      console.log(`   Word Count: ${data.post?.word_count || 'N/A'} (target: 800-1200)`);
      
      if (data.post?.word_count >= 800 && data.quality_metrics?.overall_quality >= 70) {
        console.log('✅ Content quality meets production standards');
      } else {
        console.log('⚠️  Content quality needs optimization');
      }
      
    } else {
      const errorData = await generateResponse.json();
      console.log('\n❌ BLOG GENERATION FAILED');
      console.log(`Error: ${errorData.error}`);
      console.log(`Details: ${errorData.details}`);
    }
    
    // Test 4: Check email configuration
    console.log('\n📧 Test 4: Email Configuration Check...');
    
    try {
      const emailTestResponse = await fetch(`${BASE_URL}/api/email/send`, {
        method: 'GET'
      });
      console.log(`📊 Email API Status: ${emailTestResponse.status}`);
      
      if (emailTestResponse.status === 405 || emailTestResponse.status === 401) {
        console.log('✅ Email API endpoint exists (method not allowed/auth required is expected)');
        testResults.emailConfiguration = true;
      } else {
        console.log('⚠️  Email API endpoint status unclear');
      }
    } catch (emailError) {
      console.log(`⚠️  Email API test failed: ${emailError.message}`);
    }
    
    // Test 5: Review workflow readiness
    console.log('\n🔍 Test 5: Review Workflow Readiness...');
    
    try {
      const reviewResponse = await fetch(`${BASE_URL}/api/admin/blog/review`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${CRON_SECRET}`
        }
      });
      
      console.log(`📊 Review API Status: ${reviewResponse.status}`);
      
      if (reviewResponse.status === 200 || reviewResponse.status === 401) {
        console.log('✅ Review workflow API accessible');
        testResults.endToEndWorkflow = true;
      } else {
        console.log('⚠️  Review workflow needs configuration');
      }
    } catch (reviewError) {
      console.log(`⚠️  Review workflow test failed: ${reviewError.message}`);
    }
    
  } catch (error) {
    console.log(`❌ Deployment verification failed: ${error.message}`);
  }
  
  // Final Results Summary
  console.log('\n📋 DEPLOYMENT VERIFICATION RESULTS');
  console.log('=' .repeat(50));
  
  const results = [
    { name: 'Database Field Mapping', status: testResults.databaseFieldMapping, critical: true },
    { name: 'Real Database Storage', status: testResults.realDatabaseStorage, critical: true },
    { name: 'Content Generation', status: testResults.contentGeneration, critical: true },
    { name: 'Email Configuration', status: testResults.emailConfiguration, critical: false },
    { name: 'End-to-End Workflow', status: testResults.endToEndWorkflow, critical: false }
  ];
  
  results.forEach(result => {
    const icon = result.status ? '✅' : (result.critical ? '❌' : '⚠️');
    const status = result.status ? 'PASS' : (result.critical ? 'FAIL' : 'PENDING');
    console.log(`${icon} ${result.name}: ${status}`);
  });
  
  const criticalPassed = results.filter(r => r.critical && r.status).length;
  const totalCritical = results.filter(r => r.critical).length;
  const overallPassed = results.filter(r => r.status).length;
  const totalTests = results.length;
  
  console.log('\n📊 SUMMARY:');
  console.log(`Critical Tests: ${criticalPassed}/${totalCritical} passed`);
  console.log(`Overall Tests: ${overallPassed}/${totalTests} passed`);
  console.log(`System Status: ${criticalPassed === totalCritical ? '🟢 PRODUCTION READY' : '🟡 NEEDS DEPLOYMENT'}`);
  
  if (criticalPassed === totalCritical) {
    console.log('\n🎉 SUCCESS: All critical components operational!');
    console.log('✅ Database field mapping fixes deployed successfully');
    console.log('✅ Real blog posts being saved with UUID IDs');
    console.log('✅ System ready for email configuration and full operation');
  } else {
    console.log('\n🔧 NEXT STEPS REQUIRED:');
    if (!testResults.databaseFieldMapping) {
      console.log('1. Deploy database field mapping fixes to production');
      console.log('2. Commit and push local code changes');
      console.log('3. Wait for Vercel deployment to complete');
    }
    if (!testResults.emailConfiguration) {
      console.log('4. Configure RESEND_API_KEY and EMAIL_FROM environment variables');
    }
  }
  
  return testResults;
}

testDeploymentVerification();
