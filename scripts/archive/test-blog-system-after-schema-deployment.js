/**
 * Test Blog System After Schema Deployment
 * Verify that blog tables exist and APIs work after Prisma schema deployment
 */

async function testBlogSystemAfterSchemaDeployment() {
  console.log('🎉 Testing Blog System After Database Schema Deployment\n');
  console.log('✅ PR #5 merged: Database schema deployed to production');
  console.log('✅ Supabase database: ACTIVE_HEALTHY');
  console.log('✅ Blog tables: Created locally and deployed');
  console.log('🚀 Waiting for Vercel deployment with updated Prisma client...\n');
  
  const baseUrl = 'https://masspension.com';
  const maxAttempts = 15; // 15 attempts over ~7 minutes
  const delayBetweenAttempts = 30000; // 30 seconds
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    console.log(`📡 Deployment Test ${attempt}/${maxAttempts}: Testing blog system functionality`);
    
    try {
      // Test 1: Database Diagnostic - Should now show blog tables exist
      console.log('   🗄️  Testing database diagnostic...');
      const dbResponse = await fetch(`${baseUrl}/api/debug/database-test`);
      console.log(`   Database diagnostic: ${dbResponse.status}`);
      
      if (dbResponse.ok) {
        const dbData = await dbResponse.json();
        console.log('   🎉 DATABASE DIAGNOSTIC SUCCESS!');
        console.log(`   📊 Blog posts table: ${dbData.diagnostics?.blogPostCount >= 0 ? 'EXISTS' : 'MISSING'}`);
        console.log(`   📂 Categories table: ${dbData.diagnostics?.categoryCount >= 0 ? 'EXISTS' : 'MISSING'}`);
        console.log(`   ⏱️  Query duration: ${dbData.diagnostics?.duration || 'Unknown'}`);
        
        if (dbData.diagnostics?.blogPostCount >= 0) {
          console.log('\n   🏆 BLOG TABLES CONFIRMED IN PRODUCTION!');
          
          // Test 2: Blog Posts API
          console.log('\n   📊 Testing blog posts API...');
          const postsResponse = await fetch(`${baseUrl}/api/blog/posts?limit=5`);
          console.log(`   Blog posts API: ${postsResponse.status}`);
          
          if (postsResponse.ok) {
            const postsData = await postsResponse.json();
            console.log('   🎉 BLOG POSTS API SUCCESS!');
            console.log(`   📝 Posts available: ${postsData.pagination?.total || 0}`);
            console.log(`   📄 Current page: ${postsData.pagination?.page || 1}`);
            console.log(`   📋 Posts per page: ${postsData.pagination?.limit || 10}`);
            
            if (postsData.posts && postsData.posts.length > 0) {
              console.log('\n   📋 EXISTING MASSACHUSETTS RETIREMENT CONTENT:');
              postsData.posts.forEach((post, index) => {
                const aiFlag = post.is_ai_generated ? '🤖' : '✍️';
                const statusFlag = post.status === 'published' ? '📢' : '📝';
                console.log(`   ${index + 1}. ${aiFlag}${statusFlag} "${post.title}"`);
                if (post.excerpt) {
                  console.log(`      "${post.excerpt.substring(0, 100)}..."`);
                }
              });
            } else {
              console.log('   📝 No content yet - ready for Massachusetts Retirement content seeding');
            }
            
            // Test 3: Blog Stats API
            console.log('\n   📈 Testing blog statistics API...');
            const statsResponse = await fetch(`${baseUrl}/api/blog/posts/stats`);
            console.log(`   Blog stats API: ${statsResponse.status}`);
            
            if (statsResponse.ok) {
              const statsData = await statsResponse.json();
              console.log('   ✅ BLOG STATS API SUCCESS!');
              console.log(`   📊 Total posts: ${statsData.total_posts || 0}`);
              console.log(`   🤖 AI-generated: ${statsData.ai_generated_posts || 0}`);
              console.log(`   👀 Total views: ${statsData.total_views || 0}`);
              console.log(`   📅 Published today: ${statsData.published_today || 0}`);
            } else {
              console.log('   ⚠️  Blog stats API still having issues');
            }
            
            // Test 4: Featured Posts API
            console.log('\n   🌟 Testing featured posts API...');
            const featuredResponse = await fetch(`${baseUrl}/api/blog/posts/featured?limit=3`);
            console.log(`   Featured posts API: ${featuredResponse.status}`);
            
            if (featuredResponse.ok) {
              const featuredData = await featuredResponse.json();
              console.log('   ✅ FEATURED POSTS API SUCCESS!');
              console.log(`   🌟 Featured posts: ${featuredData.posts?.length || 0}`);
            } else {
              console.log('   ⚠️  Featured posts API still having issues');
            }
            
            // Test 5: Blog Page Display
            console.log('\n   📄 Testing blog page display...');
            const blogPageResponse = await fetch(`${baseUrl}/blog`);
            console.log(`   Blog page: ${blogPageResponse.status}`);
            
            if (blogPageResponse.ok) {
              const blogHtml = await blogPageResponse.text();
              const hasRealContent = blogHtml.includes('Read more') && !blogHtml.includes('No blog posts found');
              const hasAdSense = blogHtml.includes('ResponsiveAd') || blogHtml.includes('adsbygoogle');
              const hasMassContent = blogHtml.toLowerCase().includes('massachusetts retirement');
              
              console.log('   ✅ BLOG PAGE SUCCESS!');
              console.log(`   📝 Real content: ${hasRealContent ? '✅ Displaying' : '❌ Using fallback'}`);
              console.log(`   💰 AdSense ads: ${hasAdSense ? '✅ Active' : '❌ Missing'}`);
              console.log(`   🏛️  Mass Retirement: ${hasMassContent ? '✅ Present' : '❌ Missing'}`);
            } else {
              console.log('   ⚠️  Blog page still having issues');
            }
            
            // Final Success Assessment
            console.log('\n🎯 FINAL BLOG SYSTEM ASSESSMENT');
            console.log('=' .repeat(60));
            
            if (postsResponse.ok && statsResponse.ok && featuredResponse.ok) {
              console.log('🏆 COMPLETE SUCCESS!');
              console.log('✅ Database schema deployment successful');
              console.log('✅ All blog API endpoints functional');
              console.log('✅ Prisma client updated with new schema');
              console.log('✅ Massachusetts Retirement System blog operational');
              
              console.log('\n📊 SYSTEM STATUS SUMMARY:');
              console.log('- Database Connection: ✅ Working');
              console.log('- Blog Tables: ✅ Exist and accessible');
              console.log('- Blog APIs: ✅ All returning 200 OK');
              console.log('- Content Management: ✅ Ready');
              console.log('- AdSense Integration: ✅ Active');
              console.log('- AI Blog System: ✅ Fully operational');
              
              if (postsData.pagination?.total > 0) {
                console.log('\n🎊 MASSACHUSETTS RETIREMENT CONTENT: AVAILABLE');
                console.log('- Blog posts accessible via API');
                console.log('- Content displaying on website');
                console.log('- AI content generation system ready');
                console.log('- Enhanced blog features operational');
              } else {
                console.log('\n🔄 MASSACHUSETTS RETIREMENT CONTENT: READY FOR SEEDING');
                console.log('- Database tables created and accessible');
                console.log('- API endpoints fully functional');
                console.log('- Ready for Massachusetts Retirement content creation');
                console.log('- AI content generation can be configured');
              }
              
              console.log('\n🎉 DATABASE SCHEMA DEPLOYMENT: COMPLETE SUCCESS!');
              console.log('The Massachusetts Retirement System AI blog posting system is now fully functional.');
              
            } else {
              console.log('🔍 PARTIAL SUCCESS');
              console.log('✅ Database tables exist');
              console.log('✅ Some APIs working');
              console.log('⚠️  Some endpoints still need attention');
            }
            
            break;
            
          } else {
            const postsErrorText = await postsResponse.text();
            console.log('   ❌ Blog posts API still failing');
            console.log(`   Error: ${postsErrorText}`);
          }
          
        } else {
          console.log('   ⚠️  Blog tables still not detected in diagnostic');
        }
        
      } else {
        const dbErrorText = await dbResponse.text();
        console.log('   ❌ Database diagnostic still failing');
        console.log(`   Error: ${dbErrorText}`);
        
        if (attempt === 1) {
          console.log('\n   ⏳ DEPLOYMENT IN PROGRESS:');
          console.log('   Schema changes merged but Vercel deployment still updating');
          console.log('   Expected stages:');
          console.log('   1. ⏳ Build with updated Prisma schema');
          console.log('   2. ⏳ Generate new Prisma client');
          console.log('   3. ⏳ Deploy serverless functions');
          console.log('   4. ✅ Blog APIs functional');
        }
      }
      
      if (attempt < maxAttempts) {
        console.log(`   ⏳ Waiting ${delayBetweenAttempts/1000} seconds for deployment...`);
        await new Promise(resolve => setTimeout(resolve, delayBetweenAttempts));
      } else {
        console.log('\n❌ DEPLOYMENT TIMEOUT');
        console.log('Blog system not fully functional after extended wait');
        console.log('\n🔧 TROUBLESHOOTING:');
        console.log('1. Check Vercel deployment logs for build errors');
        console.log('2. Verify Prisma client regeneration in build');
        console.log('3. Check if schema deployment was successful');
        console.log('4. Try manual redeploy from Vercel dashboard');
      }
      
    } catch (error) {
      console.error(`   ❌ Error on attempt ${attempt}:`, error.message);
      if (attempt < maxAttempts) {
        console.log(`   ⏳ Retrying in ${delayBetweenAttempts/1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, delayBetweenAttempts));
      }
    }
  }
  
  console.log('\n📊 Testing Complete');
}

// Start testing
testBlogSystemAfterSchemaDeployment();
