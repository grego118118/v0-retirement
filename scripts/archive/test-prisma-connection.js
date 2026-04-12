/**
 * Test Prisma Database Connection
 * Check if blog tables exist and are accessible
 */

const { PrismaClient } = require('@prisma/client');

async function testPrismaConnection() {
  console.log('🔍 Testing Prisma Database Connection for Blog System\n');
  
  const prisma = new PrismaClient();
  
  try {
    // Test 1: Basic database connection
    console.log('📡 Testing basic database connection...');
    await prisma.$connect();
    console.log('   ✅ Database connection successful');
    
    // Test 2: Check if blog_posts table exists
    console.log('\n📊 Testing blog_posts table...');
    try {
      const postCount = await prisma.blogPost.count();
      console.log(`   ✅ blog_posts table exists with ${postCount} records`);
    } catch (error) {
      console.log(`   ❌ blog_posts table error: ${error.message}`);
    }
    
    // Test 3: Check if blog_categories table exists
    console.log('\n📂 Testing blog_categories table...');
    try {
      const categoryCount = await prisma.blogCategory.count();
      console.log(`   ✅ blog_categories table exists with ${categoryCount} records`);
    } catch (error) {
      console.log(`   ❌ blog_categories table error: ${error.message}`);
    }
    
    // Test 4: Check if blog_post_categories table exists
    console.log('\n🔗 Testing blog_post_categories table...');
    try {
      const relationCount = await prisma.blogPostCategory.count();
      console.log(`   ✅ blog_post_categories table exists with ${relationCount} records`);
    } catch (error) {
      console.log(`   ❌ blog_post_categories table error: ${error.message}`);
    }
    
    // Test 5: Check if ai_content_jobs table exists
    console.log('\n🤖 Testing ai_content_jobs table...');
    try {
      const jobCount = await prisma.aiContentJob.count();
      console.log(`   ✅ ai_content_jobs table exists with ${jobCount} records`);
    } catch (error) {
      console.log(`   ❌ ai_content_jobs table error: ${error.message}`);
    }
    
    // Test 6: Try to create a test blog post
    console.log('\n✏️  Testing blog post creation...');
    try {
      const testPost = await prisma.blogPost.create({
        data: {
          title: 'Test Blog Post - Database Connection',
          slug: `test-connection-${Date.now()}`,
          content: 'This is a test post to verify database connectivity.',
          excerpt: 'Test post for database verification',
          status: 'draft',
          isAiGenerated: false,
          viewCount: 0,
          factCheckStatus: 'pending',
          internalLinksAdded: false,
          seoOptimized: false
        }
      });
      console.log(`   ✅ Test post created successfully: ${testPost.id}`);
      
      // Clean up test post
      await prisma.blogPost.delete({
        where: { id: testPost.id }
      });
      console.log('   🧹 Test post cleaned up');
      
    } catch (error) {
      console.log(`   ❌ Blog post creation failed: ${error.message}`);
    }
    
    // Test 7: Check for existing Massachusetts Retirement content
    console.log('\n🏛️  Checking for Massachusetts Retirement content...');
    try {
      const massRetirementPosts = await prisma.blogPost.findMany({
        where: {
          OR: [
            { title: { contains: 'Massachusetts', mode: 'insensitive' } },
            { title: { contains: 'Retirement', mode: 'insensitive' } },
            { content: { contains: 'Massachusetts Retirement', mode: 'insensitive' } }
          ]
        },
        take: 5
      });
      console.log(`   📝 Found ${massRetirementPosts.length} Massachusetts Retirement related posts`);
      
      if (massRetirementPosts.length > 0) {
        massRetirementPosts.forEach((post, index) => {
          console.log(`   ${index + 1}. "${post.title}" (${post.status}) - ${post.isAiGenerated ? 'AI' : 'Manual'}`);
        });
      }
    } catch (error) {
      console.log(`   ❌ Content search failed: ${error.message}`);
    }
    
    console.log('\n📋 DIAGNOSIS SUMMARY:');
    console.log('=' .repeat(50));
    
    // Final diagnosis
    try {
      const totalPosts = await prisma.blogPost.count();
      const publishedPosts = await prisma.blogPost.count({ where: { status: 'published' } });
      const aiPosts = await prisma.blogPost.count({ where: { isAiGenerated: true } });
      
      console.log(`✅ Database connection: Working`);
      console.log(`📊 Total posts: ${totalPosts}`);
      console.log(`📢 Published posts: ${publishedPosts}`);
      console.log(`🤖 AI-generated posts: ${aiPosts}`);
      
      if (totalPosts === 0) {
        console.log('\n🔧 ISSUE IDENTIFIED: Database is empty');
        console.log('   - Blog tables exist but contain no data');
        console.log('   - AI blog automation may not have run yet');
        console.log('   - Need to seed initial content or run automation');
      } else if (publishedPosts === 0) {
        console.log('\n🔧 ISSUE IDENTIFIED: No published posts');
        console.log('   - Posts exist but none are published');
        console.log('   - Check content review workflow');
        console.log('   - Verify publishing automation');
      } else {
        console.log('\n✅ Blog system appears healthy');
        console.log('   - Database tables exist and contain data');
        console.log('   - Published content available');
      }
      
    } catch (error) {
      console.log('❌ Database connection issues detected');
      console.log(`   Error: ${error.message}`);
    }
    
  } catch (error) {
    console.error('❌ Critical database error:', error.message);
    console.log('\n🔧 TROUBLESHOOTING STEPS:');
    console.log('1. Check DATABASE_URL environment variable');
    console.log('2. Verify Supabase connection is active');
    console.log('3. Run: npx prisma db push');
    console.log('4. Run: npx prisma generate');
    console.log('5. Check Supabase dashboard for table existence');
    
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testPrismaConnection();
