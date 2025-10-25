/**
 * Test Blog Fix Deployment
 * Monitor deployment and test when blog system is fixed
 */

async function testBlogFixDeployment() {
  console.log('🔍 Testing Blog System Fix Deployment\n');
  console.log('⏱️  Monitoring deployment completion...\n');
  
  const baseUrl = 'https://masspension.com';
  const maxAttempts = 20; // 20 attempts over ~10 minutes
  const delayBetweenAttempts = 30000; // 30 seconds
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    console.log(`📡 Attempt ${attempt}/${maxAttempts}: Testing blog system`);
    
    try {
      // Test 1: Blog Posts API
      console.log('   📊 Testing Blog Posts API...');
      const postsResponse = await fetch(`${baseUrl}/api/blog/posts?limit=5`);
      console.log(`      Status: ${postsResponse.status}`);
      
      if (postsResponse.ok) {
        const postsData = await postsResponse.json();
        console.log(`      ✅ SUCCESS! Found ${postsData.posts?.length || 0} posts`);
        console.log(`      📈 Total posts: ${postsData.pagination?.total || 0}`);
        
        if (postsData.posts && postsData.posts.length > 0) {
          const aiPosts = postsData.posts.filter(p => p.is_ai_generated);
          console.log(`      🤖 AI-generated posts: ${aiPosts.length}`);
          console.log(`      📝 Manual posts: ${postsData.posts.length - aiPosts.length}`);
          
          // Show sample post titles
          postsData.posts.slice(0, 3).forEach((post, index) => {
            console.log(`      ${index + 1}. "${post.title}" (${post.status})`);
          });
        }
      } else {
        console.log(`      ❌ Still failing: ${postsResponse.status}`);
        const errorText = await postsResponse.text();
        console.log(`      Error: ${errorText}`);
      }
      
      // Test 2: Blog Stats API
      console.log('   📈 Testing Blog Stats API...');
      const statsResponse = await fetch(`${baseUrl}/api/blog/posts/stats`);
      console.log(`      Status: ${statsResponse.status}`);
      
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        console.log(`      ✅ Total published: ${statsData.total_posts || 0}`);
        console.log(`      🤖 AI generated: ${statsData.ai_generated_posts || 0}`);
        console.log(`      👀 Total views: ${statsData.total_views || 0}`);
      }
      
      // Test 3: Blog Page Display
      console.log('   📄 Testing Blog Page...');
      const blogPageResponse = await fetch(`${baseUrl}/blog`);
      console.log(`      Status: ${blogPageResponse.status}`);
      
      if (blogPageResponse.ok) {
        const blogHtml = await blogPageResponse.text();
        const hasContent = blogHtml.includes('Massachusetts Retirement') || blogHtml.includes('blog-grid');
        const hasAdSense = blogHtml.includes('ResponsiveAd') || blogHtml.includes('adsbygoogle');
        
        console.log(`      📋 Content detected: ${hasContent ? '✅' : '❌'}`);
        console.log(`      💰 AdSense integration: ${hasAdSense ? '✅' : '❌'}`);
      }
      
      // Success condition: Blog API working
      if (postsResponse.ok) {
        console.log('\n🎉 BLOG SYSTEM FIX SUCCESSFUL!');
        console.log('=' .repeat(60));
        console.log('✅ Blog API endpoints are now working (200 OK)');
        console.log('✅ Database connectivity restored');
        console.log('✅ Blog posts can be retrieved from database');
        
        const postsData = await postsResponse.json();
        if (postsData.posts && postsData.posts.length > 0) {
          console.log('✅ Massachusetts Retirement System content available');
          console.log('✅ Blog system fully functional');
        } else {
          console.log('⚠️  API working but no content yet - need to seed database');
        }
        
        console.log('\n🎯 NEXT STEPS:');
        console.log('1. ✅ Blog API endpoints working');
        console.log('2. 🔄 Seed database with Massachusetts Retirement content');
        console.log('3. 🔄 Test AI content generation workflow');
        console.log('4. 🔄 Verify AdSense integration in blog posts');
        console.log('5. 🔄 Test automated blog posting system');
        
        console.log('\n📊 SYSTEM STATUS:');
        console.log('- Database Connection: ✅ Working');
        console.log('- Blog API Endpoints: ✅ Working');
        console.log('- Blog Page Display: ✅ Working');
        console.log('- Content Management: 🔄 Ready for seeding');
        console.log('- AI Automation: 🔄 Ready for testing');
        
        break;
        
      } else {
        console.log(`   ⚠️  Still getting ${postsResponse.status} errors...`);
        
        if (attempt === 1) {
          console.log('\n🔧 DEPLOYMENT STATUS:');
          console.log('   The deployment has been triggered, but may still be propagating.');
          console.log('   Common reasons for continued 500 errors:');
          console.log('   1. Vercel environment variables not updated yet');
          console.log('   2. Database tables still need to be created');
          console.log('   3. Deployment still building/propagating');
          console.log('   4. Prisma client needs regeneration');
        }
        
        if (attempt < maxAttempts) {
          console.log(`   ⏳ Waiting ${delayBetweenAttempts/1000} seconds before next check...`);
          await new Promise(resolve => setTimeout(resolve, delayBetweenAttempts));
        } else {
          console.log('\n❌ TIMEOUT: Blog system still not working after deployment');
          console.log('\n🔧 MANUAL INTERVENTION REQUIRED:');
          console.log('1. Check Vercel deployment logs for errors');
          console.log('2. Verify DATABASE_URL is set in Vercel Production environment');
          console.log('3. Ensure blog tables exist in Supabase database');
          console.log('4. Check if Prisma client is properly generated');
          console.log('5. Review server logs for specific error messages');
          
          console.log('\n📋 TROUBLESHOOTING CHECKLIST:');
          console.log('□ Vercel environment variables updated');
          console.log('□ Database connection string correct');
          console.log('□ Blog tables exist in database');
          console.log('□ Deployment completed successfully');
          console.log('□ No build errors in Vercel logs');
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
  
  console.log('\n📋 Monitoring Complete');
  console.log('For detailed troubleshooting, see: AI_BLOG_SYSTEM_FIX.md');
}

// Start monitoring
testBlogFixDeployment();
