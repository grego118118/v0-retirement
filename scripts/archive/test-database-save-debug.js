/**
 * Database Save Debug Test
 * Massachusetts Retirement System - Detailed Database Error Analysis
 */

async function testDatabaseSaveDebug() {
  console.log('🔍 DATABASE SAVE DEBUG TEST');
  console.log('📋 Analyzing why blog posts are saved as mock responses');
  console.log('=' .repeat(60));
  
  const BASE_URL = 'https://www.masspension.com';
  const CRON_SECRET = '462c44a146ca26604411330b9cc568e9cc10a60e09745f4b7e26f8a80983c140';
  
  try {
    console.log('📝 Generating blog post with minimal data to isolate database issue...');
    
    const response = await fetch(`${BASE_URL}/api/admin/blog/generate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CRON_SECRET}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        topic: {
          title: 'Database Debug Test',
          description: 'Testing database field mapping',
          keywords: ['test']
        },
        ai_model: 'gemini-1.5-flash',
        word_count: 100,
        auto_publish: false
      })
    });
    
    console.log(`📊 Response Status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      
      console.log('\n📝 RESPONSE ANALYSIS:');
      console.log(`Post ID: ${data.post?.id}`);
      console.log(`Title: ${data.post?.title}`);
      console.log(`Status: ${data.post?.status}`);
      console.log(`AI Model: ${data.post?.aiModel || 'N/A'}`);
      console.log(`AI Model Used: ${data.post?.aiModelUsed || 'N/A'}`);
      console.log(`Meta Description: ${data.post?.metaDescription || 'N/A'}`);
      console.log(`SEO Description: ${data.post?.seoDescription || 'N/A'}`);
      
      // Check if it's a mock response
      if (data.post?.id?.startsWith('test-')) {
        console.log('\n❌ MOCK RESPONSE DETECTED');
        console.log('🔍 This indicates database save failed');
        
        // Check for error details in response
        if (data.error) {
          console.log(`📋 Error: ${data.error}`);
        }
        if (data.details) {
          console.log(`📋 Details: ${data.details}`);
        }
        if (data.dbError) {
          console.log(`📋 Database Error: ${data.dbError}`);
        }
        
        console.log('\n🔧 POSSIBLE CAUSES:');
        console.log('1. Field name mismatch in Prisma create operation');
        console.log('2. Required field missing in database schema');
        console.log('3. Data type mismatch (string vs number, etc.)');
        console.log('4. Foreign key constraint violation');
        console.log('5. Database connection timeout');
        console.log('6. Prisma client not properly initialized');
        
      } else {
        console.log('\n✅ REAL POST GENERATED!');
        console.log('🎉 Database field mapping fixes are working');
        
        // Test retrieval
        console.log('\n📖 Testing post retrieval...');
        try {
          const retrieveResponse = await fetch(`${BASE_URL}/api/blog/posts?limit=1`);
          if (retrieveResponse.ok) {
            const postsData = await retrieveResponse.json();
            console.log(`✅ Retrieved ${postsData.posts?.length || 0} posts from database`);
            
            const latestPost = postsData.posts?.[0];
            if (latestPost && latestPost.id === data.post.id) {
              console.log('✅ Newly created post found in database');
            } else {
              console.log('⚠️  Newly created post not yet visible (may be draft)');
            }
          }
        } catch (retrieveError) {
          console.log(`⚠️  Retrieval test failed: ${retrieveError.message}`);
        }
      }
      
      // Test database connectivity separately
      console.log('\n🔍 Testing Database Connectivity...');
      try {
        const dbResponse = await fetch(`${BASE_URL}/api/debug/database`);
        if (dbResponse.ok) {
          const dbData = await dbResponse.json();
          console.log('✅ Database connectivity test passed');
          
          const blogTables = dbData.tests?.find(t => t.name === 'Database Schema')?.details?.existingTables?.filter(t => t.includes('blog')) || [];
          console.log(`📊 Blog tables: ${blogTables.join(', ')}`);
          
          // Check if BlogPost table exists
          if (blogTables.includes('BlogPost')) {
            console.log('✅ BlogPost table exists');
          } else {
            console.log('❌ BlogPost table missing');
          }
        } else {
          console.log('❌ Database connectivity test failed');
        }
      } catch (dbError) {
        console.log(`❌ Database test error: ${dbError.message}`);
      }
      
    } else {
      const errorData = await response.json();
      console.log('\n❌ BLOG GENERATION FAILED');
      console.log(`Error: ${errorData.error}`);
      console.log(`Details: ${errorData.details}`);
    }
    
  } catch (error) {
    console.log(`❌ Test failed: ${error.message}`);
  }
  
  console.log('\n📋 DEBUGGING RECOMMENDATIONS:');
  console.log('=' .repeat(50));
  
  console.log('\n🔍 If still getting mock responses:');
  console.log('1. Check server logs for database errors');
  console.log('2. Verify all Prisma schema fields match code');
  console.log('3. Ensure required fields have default values');
  console.log('4. Test database connection with simple query');
  console.log('5. Check if authorId field is causing issues');
  
  console.log('\n🔧 Field Mapping Checklist:');
  console.log('✅ aiModel vs aiModelUsed - Fixed');
  console.log('✅ metaDescription vs seoDescription - Fixed');
  console.log('⚠️  authorId - Check if this field exists and accepts "system"');
  console.log('⚠️  status - Check if "draft" is valid enum value');
  console.log('⚠️  factCheckStatus - Check if "needs_review" is valid');
  
  console.log('\n🎯 Next Steps:');
  console.log('1. If mock responses persist, check Vercel function logs');
  console.log('2. Consider adding more detailed error logging');
  console.log('3. Test with minimal required fields only');
  console.log('4. Verify Prisma client is properly connected');
}

testDatabaseSaveDebug();
