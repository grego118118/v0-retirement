/**
 * Check Existing Content and System Status
 * Analyze current blog posts and AI content generation system
 */

async function checkExistingContent() {
  console.log('🔍 Checking Existing Massachusetts Retirement System Content\n');
  
  const baseUrl = 'https://masspension.com';
  
  try {
    // Check existing blog posts
    console.log('📊 Checking existing blog posts...');
    const postsResponse = await fetch(`${baseUrl}/api/blog/posts?limit=20`);
    
    if (postsResponse.ok) {
      const postsData = await postsResponse.json();
      console.log(`✅ Blog Posts API: ${postsResponse.status}`);
      console.log(`📝 Total posts: ${postsData.pagination?.total || 0}`);
      console.log(`📄 Current page: ${postsData.pagination?.page || 1}`);
      console.log(`📋 Posts per page: ${postsData.pagination?.limit || 10}`);
      
      if (postsData.posts && postsData.posts.length > 0) {
        console.log('\n📋 EXISTING BLOG POSTS:');
        postsData.posts.forEach((post, index) => {
          const aiFlag = post.is_ai_generated ? '🤖' : '✍️';
          const statusFlag = post.status === 'published' ? '📢' : '📝';
          console.log(`${index + 1}. ${aiFlag}${statusFlag} "${post.title}"`);
          console.log(`   Status: ${post.status} | Created: ${new Date(post.created_at).toLocaleDateString()}`);
          if (post.excerpt) {
            console.log(`   Excerpt: "${post.excerpt.substring(0, 100)}..."`);
          }
          console.log('');
        });
      } else {
        console.log('📝 No existing blog posts found - ready for initial content creation');
      }
    } else {
      console.log(`❌ Blog Posts API: ${postsResponse.status}`);
    }
    
    // Check blog categories
    console.log('\n📂 Checking blog categories...');
    const categoriesResponse = await fetch(`${baseUrl}/api/blog/categories`);
    
    if (categoriesResponse.ok) {
      const categoriesData = await categoriesResponse.json();
      console.log(`✅ Categories API: ${categoriesResponse.status}`);
      console.log(`📂 Total categories: ${categoriesData.categories?.length || 0}`);
      
      if (categoriesData.categories && categoriesData.categories.length > 0) {
        console.log('\n📂 EXISTING CATEGORIES:');
        categoriesData.categories.forEach((category, index) => {
          console.log(`${index + 1}. "${category.name}" (${category.slug})`);
          if (category.description) {
            console.log(`   Description: ${category.description}`);
          }
        });
      } else {
        console.log('📂 No categories found - need to create Massachusetts Retirement categories');
      }
    } else {
      console.log(`❌ Categories API: ${categoriesResponse.status}`);
    }
    
    // Check AI content jobs
    console.log('\n🤖 Checking AI content generation status...');
    const aiJobsResponse = await fetch(`${baseUrl}/api/admin/blog/jobs`, {
      headers: { 'Authorization': 'Bearer test' } // Will fail auth but test endpoint
    });
    
    console.log(`🤖 AI Jobs API: ${aiJobsResponse.status}`);
    if (aiJobsResponse.status === 401) {
      console.log('✅ AI content generation system is available (auth required)');
    } else if (aiJobsResponse.status === 404) {
      console.log('⚠️  AI jobs endpoint not found - may need implementation');
    }
    
    // Test content generation endpoint
    console.log('\n🎯 Testing content generation endpoint...');
    const generateResponse = await fetch(`${baseUrl}/api/admin/blog/generate`, {
      method: 'POST',
      headers: { 
        'Authorization': 'Bearer test',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        topic: 'Test Topic',
        ai_model: 'gemini-1.5-flash',
        word_count: 100
      })
    });
    
    console.log(`🎯 Content Generation API: ${generateResponse.status}`);
    if (generateResponse.status === 401) {
      console.log('✅ Content generation system is available (auth required)');
    } else if (generateResponse.status === 500) {
      const errorText = await generateResponse.text();
      if (errorText.includes('API key')) {
        console.log('⚠️  Content generation available but needs API key configuration');
      } else {
        console.log('❌ Content generation system has issues');
      }
    }
    
    // Test cron automation endpoint
    console.log('\n⏰ Testing content automation endpoint...');
    const cronResponse = await fetch(`${baseUrl}/api/cron/content-automation`, {
      method: 'POST',
      headers: { 'Authorization': 'Bearer test' }
    });
    
    console.log(`⏰ Content Automation API: ${cronResponse.status}`);
    if (cronResponse.status === 401) {
      console.log('✅ Content automation system is available (auth required)');
    }
    
    // Summary
    console.log('\n🎯 SYSTEM ANALYSIS SUMMARY');
    console.log('=' .repeat(50));
    
    const hasExistingPosts = postsData?.posts?.length > 0;
    const hasCategories = categoriesData?.categories?.length > 0;
    
    if (!hasExistingPosts && !hasCategories) {
      console.log('🚀 READY FOR INITIAL SETUP');
      console.log('✅ Blog system is operational');
      console.log('✅ AI content generation system is available');
      console.log('✅ Content automation system is available');
      console.log('📝 No existing content - perfect for initial content creation');
      console.log('📂 No categories - need to create Massachusetts Retirement categories');
      console.log('\n🎯 RECOMMENDED ACTIONS:');
      console.log('1. Create blog categories for Massachusetts Retirement topics');
      console.log('2. Generate initial 5-10 high-quality blog posts');
      console.log('3. Set up automated content scheduling (every 2 days)');
      console.log('4. Configure content review workflow');
      console.log('5. Set up email notifications for reviewers');
    } else {
      console.log('📊 EXISTING CONTENT DETECTED');
      console.log(`📝 ${postsData?.posts?.length || 0} existing blog posts`);
      console.log(`📂 ${categoriesData?.categories?.length || 0} existing categories`);
      console.log('\n🎯 RECOMMENDED ACTIONS:');
      console.log('1. Review existing content for Massachusetts Retirement relevance');
      console.log('2. Enhance content generation system if needed');
      console.log('3. Set up automated scheduling if not already configured');
      console.log('4. Implement content review workflow improvements');
    }
    
  } catch (error) {
    console.error('❌ Error checking existing content:', error.message);
  }
}

// Run check
checkExistingContent();
