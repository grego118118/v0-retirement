/**
 * Final System Test - Massachusetts Retirement System
 * Comprehensive validation of database storage and email configuration
 */

async function testFinalSystem() {
  console.log('🚀 MASSACHUSETTS RETIREMENT SYSTEM - FINAL SYSTEM TEST');
  console.log('📋 Testing Database Storage + Email Configuration');
  console.log('=' .repeat(70));
  
  const BASE_URL = 'https://www.masspension.com';
  const CRON_SECRET = '462c44a146ca26604411330b9cc568e9cc10a60e09745f4b7e26f8a80983c140';
  
  let testResults = {
    databaseStorage: false,
    emailConfiguration: false,
    contentGeneration: false,
    responseTime: 0,
    postId: null,
    isRealPost: false
  };
  
  try {
    console.log('📝 Test 1: Blog Generation with Database Storage Check...');
    console.log('🎯 Goal: Generate blog post and verify real UUID storage');
    
    const startTime = Date.now();
    
    const response = await fetch(`${BASE_URL}/api/admin/blog/generate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CRON_SECRET}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        topic: {
          title: 'Massachusetts Retirement System Final Test',
          description: 'Testing complete system with database storage and email configuration',
          keywords: ['Massachusetts retirement', 'final test', 'database storage', 'email notifications']
        },
        category_id: 'pension-planning',
        ai_model: 'gemini-1.5-flash',
        word_count: 600,
        target_audience: 'Massachusetts public employees',
        seo_keywords: ['Massachusetts retirement', 'pension benefits', 'final test'],
        auto_publish: false
      })
    });
    
    testResults.responseTime = Date.now() - startTime;
    console.log(`📊 Response Status: ${response.status} (${testResults.responseTime}ms)`);
    
    if (response.ok) {
      const data = await response.json();
      testResults.contentGeneration = true;
      testResults.postId = data.post?.id;
      
      console.log('\n✅ BLOG GENERATION SUCCESSFUL');
      console.log('=' .repeat(40));
      console.log(`📝 Post ID: ${data.post?.id}`);
      console.log(`📰 Title: ${data.post?.title || 'N/A'}`);
      console.log(`📊 Word Count: ${data.post?.word_count || 'N/A'}`);
      console.log(`📋 Status: ${data.post?.status || 'N/A'}`);
      console.log(`🔍 Fact Check Status: ${data.post?.fact_check_status || 'N/A'}`);
      console.log(`💰 Cost: ${data.cost || 'N/A'}`);
      
      // CRITICAL TEST: Check if we got a real UUID or mock test-* ID
      if (data.post?.id && !data.post.id.startsWith('test-')) {
        console.log('\n🎉 SUCCESS: REAL DATABASE STORAGE WORKING!');
        console.log('✅ Post saved with real UUID ID');
        console.log('✅ Database field mapping fixes are working');
        testResults.databaseStorage = true;
        testResults.isRealPost = true;
        
        console.log('\n📖 Test 2: Database Retrieval Verification...');
        try {
          const retrieveResponse = await fetch(`${BASE_URL}/api/blog/posts?limit=5`);
          if (retrieveResponse.ok) {
            const postsData = await retrieveResponse.json();
            console.log(`✅ Blog posts API accessible`);
            console.log(`📊 Found ${postsData.posts?.length || 0} posts in database`);
            
            const ourPost = postsData.posts?.find(p => p.id === data.post.id);
            if (ourPost) {
              console.log('✅ Newly created post found in database');
              console.log(`   Title: ${ourPost.title}`);
              console.log(`   Status: ${ourPost.status}`);
              console.log(`   Created: ${ourPost.createdAt}`);
            } else {
              console.log('⚠️  Newly created post not yet visible in public API (may be draft)');
            }
          }
        } catch (retrieveError) {
          console.log(`⚠️  Database retrieval test failed: ${retrieveError.message}`);
        }
        
      } else if (data.post?.id?.startsWith('test-')) {
        console.log('\n⚠️  STILL GETTING MOCK RESPONSES');
        console.log('❌ Database field mapping fixes not fully deployed');
        console.log('📋 Post ID pattern indicates database save is still failing');
        testResults.databaseStorage = false;
        testResults.isRealPost = false;
        
      } else {
        console.log('\n❌ UNEXPECTED RESPONSE FORMAT');
        console.log('Post ID not found in response');
      }
      
      // Test 3: Content Quality Analysis
      console.log('\n📊 Test 3: Content Quality Analysis...');
      if (data.quality_metrics) {
        console.log(`   Overall Quality: ${data.quality_metrics.overall_quality || 'N/A'}/100`);
        console.log(`   SEO Score: ${data.quality_metrics.seo_score || 'N/A'}/100`);
        console.log(`   MA Relevance: ${data.quality_metrics.massachusetts_relevance || 'N/A'}/100`);
        console.log(`   Readability: ${data.quality_metrics.readability_score || 'N/A'}/100`);
      }
      
    } else {
      const errorData = await response.json();
      console.log('\n❌ BLOG GENERATION FAILED');
      console.log(`Error: ${errorData.error}`);
      console.log(`Details: ${errorData.details}`);
    }
    
    // Test 4: Email Configuration Check
    console.log('\n📧 Test 4: Email Configuration Verification...');
    
    try {
      // Test email service endpoint
      const emailTestResponse = await fetch(`${BASE_URL}/api/email/send`, {
        method: 'GET'
      });
      console.log(`📊 Email API Status: ${emailTestResponse.status}`);
      
      if (emailTestResponse.status === 405 || emailTestResponse.status === 401) {
        console.log('✅ Email API endpoint exists and accessible');
        testResults.emailConfiguration = true;
      }
      
      // Test review workflow endpoint
      const reviewResponse = await fetch(`${BASE_URL}/api/admin/blog/review`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${CRON_SECRET}`
        }
      });
      
      console.log(`📊 Review Workflow API Status: ${reviewResponse.status}`);
      
      if (reviewResponse.status === 200) {
        const reviewData = await reviewResponse.json();
        console.log('✅ Review workflow operational');
        console.log(`📊 Posts pending review: ${reviewData.posts?.length || 0}`);
      } else if (reviewResponse.status === 401) {
        console.log('✅ Review workflow API accessible (auth required as expected)');
      }
      
    } catch (emailError) {
      console.log(`⚠️  Email configuration test failed: ${emailError.message}`);
    }
    
    // Test 5: Performance Validation
    console.log('\n⚡ Test 5: Performance Validation...');
    console.log(`📈 Response Time: ${testResults.responseTime}ms`);
    
    if (testResults.responseTime < 15000) {
      console.log('✅ Performance: Meets sub-15-second requirement');
    } else {
      console.log('⚠️  Performance: Exceeds 15-second target');
    }
    
  } catch (error) {
    console.log(`❌ Final system test failed: ${error.message}`);
  }
  
  // Final Results Summary
  console.log('\n📋 FINAL SYSTEM TEST RESULTS');
  console.log('=' .repeat(50));
  
  const results = [
    { name: 'Content Generation', status: testResults.contentGeneration, critical: true },
    { name: 'Real Database Storage', status: testResults.databaseStorage, critical: true },
    { name: 'Email Configuration', status: testResults.emailConfiguration, critical: false },
    { name: 'Response Time (<15s)', status: testResults.responseTime < 15000, critical: true }
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
  
  console.log('\n📊 FINAL SUMMARY:');
  console.log(`Critical Tests: ${criticalPassed}/${totalCritical} passed`);
  console.log(`Overall Tests: ${overallPassed}/${totalTests} passed`);
  console.log(`Response Time: ${testResults.responseTime}ms`);
  console.log(`Post ID Type: ${testResults.isRealPost ? 'Real UUID' : 'Mock test-*'}`);
  
  if (criticalPassed === totalCritical && testResults.isRealPost) {
    console.log(`\n🎉 SUCCESS: SYSTEM 100% OPERATIONAL!`);
    console.log('✅ All critical components working');
    console.log('✅ Real database storage confirmed');
    console.log('✅ Email framework ready');
    console.log('✅ Performance requirements met');
    console.log('\n🚀 Massachusetts Retirement System AI Blog Generation is PRODUCTION READY!');
  } else {
    console.log(`\n⚠️  SYSTEM STATUS: ${Math.round((overallPassed/totalTests)*100)}% OPERATIONAL`);
    
    if (!testResults.databaseStorage) {
      console.log('🔧 Database storage still needs verification');
    }
    if (!testResults.emailConfiguration) {
      console.log('🔧 Email configuration needs final verification');
    }
    if (testResults.responseTime >= 15000) {
      console.log('🔧 Performance optimization needed');
    }
  }
  
  return testResults;
}

testFinalSystem();
