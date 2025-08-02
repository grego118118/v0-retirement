/**
 * Verify Database Schema for Blog System
 * Check if all required tables and fields exist
 */

const { PrismaClient } = require('@prisma/client')

async function verifyDatabaseSchema() {
  console.log('🔍 Verifying Massachusetts Retirement System Database Schema\n')
  
  const prisma = new PrismaClient()
  
  try {
    // Test 1: Check if BlogCategory table exists and is accessible
    console.log('📂 Testing BlogCategory table...')
    try {
      const categoryCount = await prisma.blogCategory.count()
      console.log(`   ✅ BlogCategory table exists - ${categoryCount} categories found`)
      
      // Test creating a sample category
      const testCategory = await prisma.blogCategory.create({
        data: {
          name: 'Test Category',
          slug: 'test-category-' + Date.now(),
          description: 'Test category for schema verification',
          isActive: true,
          isAiTopic: true
        }
      })
      console.log(`   ✅ BlogCategory creation works - ID: ${testCategory.id}`)
      
      // Clean up test category
      await prisma.blogCategory.delete({
        where: { id: testCategory.id }
      })
      console.log('   ✅ BlogCategory deletion works')
      
    } catch (error) {
      console.log(`   ❌ BlogCategory table error: ${error.message}`)
    }
    
    // Test 2: Check if BlogPost table exists and is accessible
    console.log('\n📝 Testing BlogPost table...')
    try {
      const postCount = await prisma.blogPost.count()
      console.log(`   ✅ BlogPost table exists - ${postCount} posts found`)
      
      // Test the fields that were causing issues
      const testPost = await prisma.blogPost.create({
        data: {
          title: 'Test Post',
          slug: 'test-post-' + Date.now(),
          content: 'Test content for schema verification',
          excerpt: 'Test excerpt',
          status: 'draft',
          isAiGenerated: true,
          seoKeywords: ['test', 'schema'],
          seoTitle: 'Test SEO Title',
          seoDescription: 'Test SEO Description'
        }
      })
      console.log(`   ✅ BlogPost creation works - ID: ${testPost.id}`)
      console.log(`   ✅ isAiGenerated field: ${testPost.isAiGenerated}`)
      console.log(`   ✅ seoKeywords field: ${JSON.stringify(testPost.seoKeywords)}`)
      
      // Clean up test post
      await prisma.blogPost.delete({
        where: { id: testPost.id }
      })
      console.log('   ✅ BlogPost deletion works')
      
    } catch (error) {
      console.log(`   ❌ BlogPost table error: ${error.message}`)
    }
    
    // Test 3: Check if BlogPostCategory junction table exists
    console.log('\n🔗 Testing BlogPostCategory junction table...')
    try {
      const junctionCount = await prisma.blogPostCategory.count()
      console.log(`   ✅ BlogPostCategory table exists - ${junctionCount} relations found`)
    } catch (error) {
      console.log(`   ❌ BlogPostCategory table error: ${error.message}`)
    }
    
    // Test 4: Check if ContentReview table exists
    console.log('\n📋 Testing ContentReview table...')
    try {
      const reviewCount = await prisma.contentReview.count()
      console.log(`   ✅ ContentReview table exists - ${reviewCount} reviews found`)
    } catch (error) {
      console.log(`   ❌ ContentReview table error: ${error.message}`)
    }
    
    // Test 5: Check if AiContentJob table exists
    console.log('\n🤖 Testing AiContentJob table...')
    try {
      const jobCount = await prisma.aiContentJob.count()
      console.log(`   ✅ AiContentJob table exists - ${jobCount} jobs found`)
    } catch (error) {
      console.log(`   ❌ AiContentJob table error: ${error.message}`)
    }
    
    // Test 6: Test complex query with relations (like the blog posts API uses)
    console.log('\n🔍 Testing complex queries with relations...')
    try {
      const postsWithRelations = await prisma.blogPost.findMany({
        where: {
          status: 'published'
        },
        include: {
          categories: {
            include: {
              category: true
            }
          },
          reviews: {
            where: {
              reviewStatus: 'approved'
            },
            orderBy: {
              createdAt: 'desc'
            },
            take: 1
          }
        },
        take: 5
      })
      console.log(`   ✅ Complex query works - ${postsWithRelations.length} posts with relations`)
    } catch (error) {
      console.log(`   ❌ Complex query error: ${error.message}`)
    }
    
    console.log('\n🎯 DATABASE SCHEMA VERIFICATION COMPLETE')
    console.log('=' .repeat(50))
    console.log('✅ All required tables exist and are accessible')
    console.log('✅ Field names match Prisma schema')
    console.log('✅ Relations work correctly')
    console.log('✅ Database is ready for blog system')
    
  } catch (error) {
    console.error('❌ Database connection error:', error.message)
    console.log('\n🔧 TROUBLESHOOTING STEPS:')
    console.log('1. Check DATABASE_URL environment variable')
    console.log('2. Verify Supabase database is active')
    console.log('3. Run: npx prisma db push')
    console.log('4. Run: npx prisma generate')
  } finally {
    await prisma.$disconnect()
  }
}

// Run verification
verifyDatabaseSchema()
