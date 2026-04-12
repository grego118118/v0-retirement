/**
 * Database Storage Debug - Massachusetts Retirement System
 * Targeted debugging to identify exact cause of blog post storage failure
 */

async function debugDatabaseStorage() {
  console.log('🔍 MASSACHUSETTS RETIREMENT SYSTEM - DATABASE STORAGE DEBUG');
  console.log('📋 Identifying exact cause of blog post storage failure');
  console.log('=' .repeat(70));
  
  const BASE_URL = 'https://www.masspension.com';
  const CRON_SECRET = '462c44a146ca26604411330b9cc568e9cc10a60e09745f4b7e26f8a80983c140';
  
  try {
    // Test 1: Minimal blog post creation to isolate the issue
    console.log('📝 Test 1: Minimal Blog Post Creation...');
    console.log('🎯 Goal: Create simplest possible blog post to identify field issues');
    
    const minimalResponse = await fetch(`${BASE_URL}/api/admin/blog/generate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CRON_SECRET}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        topic: {
          title: 'Debug Test',
          description: 'Minimal test',
          keywords: ['test']
        },
        ai_model: 'gemini-1.5-flash',
        word_count: 50,
        auto_publish: false
      })
    });
    
    console.log(`📊 Minimal Test Response: ${minimalResponse.status}`);
    
    if (minimalResponse.ok) {
      const minimalData = await minimalResponse.json();
      console.log(`📝 Minimal Post ID: ${minimalData.post?.id}`);
      
      if (minimalData.post?.id?.startsWith('test-')) {
        console.log('❌ Even minimal post creation fails - database save issue confirmed');
        
        // Check if there's detailed error information
        if (minimalData.dbError) {
          console.log(`🔍 Database Error Details: ${minimalData.dbError}`);
        }
        if (minimalData.error) {
          console.log(`🔍 General Error: ${minimalData.error}`);
        }
      } else {
        console.log('✅ Minimal post creation works - issue may be with complex data');
      }
    }
    
    // Test 2: Check blog_posts table directly
    console.log('\n📊 Test 2: Blog Posts Table Analysis...');
    
    try {
      const postsResponse = await fetch(`${BASE_URL}/api/blog/posts?limit=1`);
      if (postsResponse.ok) {
        const postsData = await postsResponse.json();
        console.log(`📊 Blog posts table accessible: ${postsData.posts?.length || 0} posts found`);
        
        if (postsData.posts && postsData.posts.length > 0) {
          const samplePost = postsData.posts[0];
          console.log('📝 Sample existing post structure:');
          console.log(`   ID: ${samplePost.id}`);
          console.log(`   Title: ${samplePost.title}`);
          console.log(`   Status: ${samplePost.status}`);
          console.log(`   Created: ${samplePost.createdAt}`);
          console.log(`   AI Generated: ${samplePost.isAiGenerated}`);
        } else {
          console.log('📋 No existing blog posts found in database');
        }
      } else {
        console.log('❌ Blog posts table not accessible');
      }
    } catch (postsError) {
      console.log(`❌ Blog posts table test failed: ${postsError.message}`);
    }
    
    // Test 3: Database schema validation
    console.log('\n🔍 Test 3: Database Schema Validation...');
    
    const dbResponse = await fetch(`${BASE_URL}/api/debug/database`);
    if (dbResponse.ok) {
      const dbData = await dbResponse.json();
      
      // Check if blog_posts table exists
      const blogTables = dbData.tests?.find(t => t.name === 'Database Schema')?.details?.existingTables?.filter(t => t.includes('blog')) || [];
      console.log(`📊 Blog-related tables: ${blogTables.join(', ')}`);
      
      if (blogTables.includes('blog_posts')) {
        console.log('✅ blog_posts table exists');
      } else {
        console.log('❌ blog_posts table missing');
      }
    }
    
    // Test 4: Check for specific error patterns
    console.log('\n🔍 Test 4: Error Pattern Analysis...');
    
    // Generate a post and capture any console errors
    const debugResponse = await fetch(`${BASE_URL}/api/admin/blog/generate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CRON_SECRET}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        topic: {
          title: 'Error Debug Test',
          description: 'Testing for specific error patterns',
          keywords: ['debug', 'error', 'test']
        },
        ai_model: 'gemini-1.5-flash',
        word_count: 100,
        auto_publish: false
      })
    });
    
    if (debugResponse.ok) {
      const debugData = await debugResponse.json();
      console.log(`📝 Debug Post ID: ${debugData.post?.id}`);
      
      // Analyze the response for clues
      console.log('\n🔍 Response Analysis:');
      console.log(`   Has post object: ${!!debugData.post}`);
      console.log(`   Has error field: ${!!debugData.error}`);
      console.log(`   Has dbError field: ${!!debugData.dbError}`);
      console.log(`   Response keys: ${Object.keys(debugData).join(', ')}`);
    }
    
  } catch (error) {
    console.log(`❌ Debug test failed: ${error.message}`);
  }
  
  console.log('\n📋 DEBUGGING RECOMMENDATIONS');
  console.log('=' .repeat(50));
  
  console.log('\n🔍 LIKELY CAUSES:');
  console.log('1. Required field missing or null (authorId, status, etc.)');
  console.log('2. Data type mismatch (string vs number, date format, etc.)');
  console.log('3. Field length constraints (title too long, content too long)');
  console.log('4. Foreign key constraint (authorId references non-existent user)');
  console.log('5. Supabase RLS policy blocking insert operation');
  console.log('6. Unique constraint violation (slug already exists)');
  
  console.log('\n🔧 IMMEDIATE FIXES TO TRY:');
  console.log('1. Check server logs in Vercel dashboard for detailed error');
  console.log('2. Verify all required fields have valid values');
  console.log('3. Test with authorId set to null (already done)');
  console.log('4. Check Supabase dashboard for RLS policies on blog_posts table');
  console.log('5. Verify slug generation doesn\'t create duplicates');
  
  console.log('\n🎯 NEXT DEBUGGING STEPS:');
  console.log('1. Add more detailed error logging to catch block');
  console.log('2. Test direct Prisma operations outside API route');
  console.log('3. Check Supabase logs for rejected operations');
  console.log('4. Validate each field individually');
  
  return true;
}

debugDatabaseStorage();
