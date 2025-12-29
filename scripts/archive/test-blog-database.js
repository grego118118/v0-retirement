/**
 * Test Blog Database Integration
 * Check current state of AI blog system and database
 */

async function testBlogDatabase() {
  console.log('🔍 Testing Blog Database Integration\n');
  
  const baseUrl = 'https://masspension.com';
  
  try {
    // Test 1: Check blog posts API
    console.log('📊 Testing Blog Posts API...');
    const postsResponse = await fetch(`${baseUrl}/api/blog/posts?limit=10`);
    console.log(`   Status: ${postsResponse.status}`);
    
    if (postsResponse.ok) {
      const postsData = await postsResponse.json();
      console.log(`   ✅ Found ${postsData.posts?.length || 0} published posts`);
      console.log(`   📈 Total posts in database: ${postsData.pagination?.total || 0}`);
      
      if (postsData.posts && postsData.posts.length > 0) {
        const aiPosts = postsData.posts.filter(p => p.is_ai_generated);
        console.log(`   🤖 AI-generated posts: ${aiPosts.length}`);
        console.log(`   📝 Manual posts: ${postsData.posts.length - aiPosts.length}`);
      }
    } else {
      console.log(`   ❌ Blog posts API failed: ${postsResponse.status}`);
    }
    
    // Test 2: Check blog stats API
    console.log('\n📈 Testing Blog Stats API...');
    const statsResponse = await fetch(`${baseUrl}/api/blog/posts/stats`);
    console.log(`   Status: ${statsResponse.status}`);
    
    if (statsResponse.ok) {
      const statsData = await statsResponse.json();
      console.log(`   ✅ Total published posts: ${statsData.total_posts || 0}`);
      console.log(`   🤖 AI-generated posts: ${statsData.ai_generated_posts || 0}`);
      console.log(`   📅 Published today: ${statsData.published_today || 0}`);
      console.log(`   👀 Total views: ${statsData.total_views || 0}`);
      console.log(`   ⭐ Average quality score: ${statsData.avg_quality_score || 'N/A'}`);
    } else {
      console.log(`   ❌ Blog stats API failed: ${statsResponse.status}`);
    }
    
    // Test 3: Check featured posts API
    console.log('\n🌟 Testing Featured Posts API...');
    const featuredResponse = await fetch(`${baseUrl}/api/blog/posts/featured?limit=3`);
    console.log(`   Status: ${featuredResponse.status}`);
    
    if (featuredResponse.ok) {
      const featuredData = await featuredResponse.json();
      console.log(`   ✅ Featured posts available: ${featuredData.posts?.length || 0}`);
    } else {
      console.log(`   ❌ Featured posts API failed: ${featuredResponse.status}`);
    }
    
    // Test 4: Check blog page display
    console.log('\n📄 Testing Blog Page Display...');
    const blogPageResponse = await fetch(`${baseUrl}/blog`);
    console.log(`   Status: ${blogPageResponse.status}`);
    
    if (blogPageResponse.ok) {
      const blogHtml = await blogPageResponse.text();
      const hasEnhancedGrid = blogHtml.includes('EnhancedBlogGrid') || blogHtml.includes('blog-grid');
      const hasAdSense = blogHtml.includes('ResponsiveAd') || blogHtml.includes('adsbygoogle');
      
      console.log(`   ✅ Blog page loads successfully`);
      console.log(`   📋 Enhanced blog grid: ${hasEnhancedGrid ? '✅ Present' : '❌ Missing'}`);
      console.log(`   💰 AdSense integration: ${hasAdSense ? '✅ Present' : '❌ Missing'}`);
    } else {
      console.log(`   ❌ Blog page failed to load: ${blogPageResponse.status}`);
    }
    
    // Test 5: Check automation endpoints
    console.log('\n🤖 Testing Automation Endpoints...');
    
    // Test content generation endpoint (should require auth)
    const generateResponse = await fetch(`${baseUrl}/api/admin/blog/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic: { title: 'Test Topic', description: 'Test', keywords: [] },
        ai_model: 'gemini-1.5-flash'
      })
    });
    console.log(`   Generate API Status: ${generateResponse.status} ${generateResponse.status === 401 ? '(Auth required - ✅)' : ''}`);
    
    // Test cron automation endpoint
    const cronResponse = await fetch(`${baseUrl}/api/cron/content-automation`);
    console.log(`   Cron API Status: ${cronResponse.status} ${cronResponse.status === 401 ? '(Auth required - ✅)' : ''}`);
    
    console.log('\n📋 DIAGNOSIS SUMMARY:');
    console.log('=' .repeat(50));
    
    if (postsResponse.ok) {
      const postsData = await postsResponse.json();
      if (postsData.posts && postsData.posts.length > 0) {
        console.log('✅ Blog system is functional with existing posts');
        console.log('✅ Database integration working');
        console.log('✅ API endpoints responding correctly');
      } else {
        console.log('⚠️  Blog system functional but no posts found');
        console.log('🔧 Issue: Database may be empty or posts not published');
      }
    } else {
      console.log('❌ Blog system has database connectivity issues');
      console.log('🔧 Issue: API endpoints not responding correctly');
    }
    
  } catch (error) {
    console.error('❌ Error testing blog database:', error.message);
    console.log('\n🔧 TROUBLESHOOTING:');
    console.log('1. Check if Supabase database is accessible');
    console.log('2. Verify Prisma schema is deployed');
    console.log('3. Check environment variables for database connection');
    console.log('4. Verify blog tables exist in database');
  }
}

// Run the test
testBlogDatabase();
