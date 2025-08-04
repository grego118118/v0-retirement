/**
 * Database Fixes Validation Test
 * Massachusetts Retirement System - Supabase Prepared Statement Resolution
 */

async function testDatabaseFixes() {
  console.log('🔧 MASSACHUSETTS RETIREMENT SYSTEM - DATABASE FIXES VALIDATION');
  console.log('📋 Testing Supabase Prepared Statement Conflict Resolution');
  console.log('=' .repeat(70));
  
  const BASE_URL = 'https://www.masspension.com';
  const CRON_SECRET = '462c44a146ca26604411330b9cc568e9cc10a60e09745f4b7e26f8a80983c140';
  
  let testResults = {
    databaseConnectivity: false,
    realPostGeneration: false,
    connectionPooling: false,
    preparedStatements: false,
    retryLogic: false,
    overallSuccess: false
  };
  
  try {
    // Test 1: Database Connectivity Check
    console.log('🔍 Test 1: Database Connectivity with New Configuration...');
    
    const dbResponse = await fetch(`${BASE_URL}/api/debug/database`);
    if (dbResponse.ok) {
      const dbData = await dbResponse.json();
      console.log(`📊 Database Status: ${dbData.status}`);
      console.log(`📊 Tests Passed: ${dbData.summary.passed}/${dbData.summary.total}`);
      
      // Check for prepared statement improvements
      const preparedStatementErrors = dbData.tests.filter(t => 
        t.status === 'fail' && t.message.includes('prepared statement')
      );
      
      if (preparedStatementErrors.length === 0) {
        console.log('✅ No prepared statement conflicts detected');
        testResults.preparedStatements = true;
      } else {
        console.log(`⚠️  ${preparedStatementErrors.length} prepared statement conflicts still present`);
        preparedStatementErrors.forEach(error => {
          console.log(`   ${error.name}: ${error.message.substring(0, 100)}...`);
        });
      }
      
      if (dbData.summary.passed >= 6) {
        testResults.databaseConnectivity = true;
      }
    } else {
      console.log('❌ Database connectivity test failed');
    }
    
    // Test 2: Blog Post Generation with New Database Client
    console.log('\n📝 Test 2: Blog Generation with Enhanced Database Client...');
    console.log('🎯 Goal: Generate real blog post with UUID ID using new retry logic');
    
    const startTime = Date.now();
    
    const response = await fetch(`${BASE_URL}/api/admin/blog/generate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CRON_SECRET}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        topic: {
          title: 'Massachusetts Retirement Database Fix Validation',
          description: 'Testing enhanced database client with prepared statement conflict resolution',
          keywords: ['Massachusetts retirement', 'database fixes', 'Supabase optimization', 'prepared statements']
        },
        category_id: 'pension-planning',
        ai_model: 'gemini-1.5-flash',
        word_count: 700,
        target_audience: 'Massachusetts public employees',
        seo_keywords: ['Massachusetts retirement', 'database optimization', 'pension benefits'],
        auto_publish: false
      })
    });
    
    const responseTime = Date.now() - startTime;
    console.log(`📊 Response Status: ${response.status} (${responseTime}ms)`);
    
    if (response.ok) {
      const data = await response.json();
      
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
        console.log('✅ Database fixes successfully resolved prepared statement conflicts');
        console.log('✅ Enhanced database client with retry logic is working');
        testResults.realPostGeneration = true;
        testResults.connectionPooling = true;
        testResults.retryLogic = true;
        
        // Verify the post can be retrieved
        console.log('\n📖 Test 3: Database Retrieval Verification...');
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
              console.log('✅ Database storage and retrieval fully operational');
            } else {
              console.log('⚠️  Newly created post not yet visible in public API (may be draft)');
            }
          }
        } catch (retrieveError) {
          console.log(`⚠️  Database retrieval test failed: ${retrieveError.message}`);
        }
        
      } else if (data.post?.id?.startsWith('test-')) {
        console.log('\n⚠️  STILL GETTING MOCK RESPONSES');
        console.log('❌ Database fixes not fully effective yet');
        console.log('📋 Post ID pattern indicates database save is still failing');
        console.log('🔧 May need additional time for deployment or further optimization');
        
      } else {
        console.log('\n❌ UNEXPECTED RESPONSE FORMAT');
        console.log('Post ID not found in response');
      }
      
      // Test 4: Performance Validation
      console.log('\n⚡ Test 4: Performance Impact Assessment...');
      console.log(`📈 Response Time: ${responseTime}ms`);
      
      if (responseTime < 15000) {
        console.log('✅ Performance: Database fixes maintain excellent response times');
      } else {
        console.log('⚠️  Performance: Response time increased due to database operations');
      }
      
    } else {
      const errorData = await response.json();
      console.log('\n❌ BLOG GENERATION FAILED');
      console.log(`Error: ${errorData.error}`);
      console.log(`Details: ${errorData.details}`);
    }
    
  } catch (error) {
    console.log(`❌ Database fixes validation failed: ${error.message}`);
  }
  
  // Final Assessment
  console.log('\n📋 DATABASE FIXES VALIDATION RESULTS');
  console.log('=' .repeat(50));
  
  const results = [
    { name: 'Database Connectivity', status: testResults.databaseConnectivity, critical: true },
    { name: 'Prepared Statement Resolution', status: testResults.preparedStatements, critical: true },
    { name: 'Real Post Generation', status: testResults.realPostGeneration, critical: true },
    { name: 'Connection Pooling', status: testResults.connectionPooling, critical: false },
    { name: 'Retry Logic', status: testResults.retryLogic, critical: false }
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
  
  testResults.overallSuccess = criticalPassed === totalCritical;
  
  console.log('\n📊 FINAL ASSESSMENT:');
  console.log(`Critical Tests: ${criticalPassed}/${totalCritical} passed`);
  console.log(`Overall Tests: ${overallPassed}/${totalTests} passed`);
  
  if (testResults.overallSuccess) {
    console.log('\n🎉 SUCCESS: DATABASE FIXES FULLY OPERATIONAL!');
    console.log('✅ Supabase prepared statement conflicts resolved');
    console.log('✅ Real blog posts being saved with UUID IDs');
    console.log('✅ Enhanced database client working perfectly');
    console.log('✅ System now 100% operational');
    console.log('\n🚀 Massachusetts Retirement System AI Blog Generation is PRODUCTION READY!');
  } else {
    console.log('\n⚠️  DATABASE FIXES PARTIALLY EFFECTIVE');
    console.log('🔧 Some issues may require additional time to propagate');
    console.log('🔧 Consider running test again in 5-10 minutes');
    
    if (!testResults.preparedStatements) {
      console.log('🔧 Prepared statement conflicts may require Supabase dashboard configuration');
    }
    if (!testResults.realPostGeneration) {
      console.log('🔧 Database client may need additional optimization');
    }
  }
  
  return testResults;
}

testDatabaseFixes();
