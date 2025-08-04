/**
 * Direct Database Setup for Massachusetts Retirement System Blog
 * Bypass API endpoints and create categories/posts directly in database
 */

const { PrismaClient } = require('@prisma/client')

// Massachusetts Retirement System Categories
const MASSACHUSETTS_CATEGORIES = [
  {
    name: 'Pension Planning',
    slug: 'pension-planning',
    description: 'Comprehensive guides for Massachusetts pension planning and benefit maximization',
    color: '#1E40AF',
    icon: '📊',
    sortOrder: 1,
    isActive: true,
    isAiTopic: true
  },
  {
    name: 'COLA Adjustments',
    slug: 'cola-adjustments',
    description: 'Massachusetts Cost of Living Adjustments, annual increases, and impact analysis',
    color: '#059669',
    icon: '📈',
    sortOrder: 2,
    isActive: true,
    isAiTopic: true
  },
  {
    name: 'Retirement Groups',
    slug: 'retirement-groups',
    description: 'Massachusetts Retirement Groups 1-4: eligibility, benefits, and requirements',
    color: '#DC2626',
    icon: '👥',
    sortOrder: 3,
    isActive: true,
    isAiTopic: true
  },
  {
    name: 'Pension Options',
    slug: 'pension-options',
    description: 'Pension Options A, B, C with reduction calculations and survivor benefits',
    color: '#7C2D12',
    icon: '⚖️',
    sortOrder: 4,
    isActive: true,
    isAiTopic: true
  },
  {
    name: 'Social Security Integration',
    slug: 'social-security-integration',
    description: 'How Social Security works with Massachusetts public employee pensions',
    color: '#4338CA',
    icon: '🏛️',
    sortOrder: 5,
    isActive: true,
    isAiTopic: true
  },
  {
    name: 'Career Planning',
    slug: 'career-planning',
    description: 'Retirement planning strategies for different career stages and life events',
    color: '#9333EA',
    icon: '🎯',
    sortOrder: 6,
    isActive: true,
    isAiTopic: true
  },
  {
    name: 'Benefit Calculations',
    slug: 'benefit-calculations',
    description: 'Understanding Massachusetts pension calculations, formulas, and examples',
    color: '#EA580C',
    icon: '🧮',
    sortOrder: 7,
    isActive: true,
    isAiTopic: true
  },
  {
    name: 'Tax Planning',
    slug: 'tax-planning',
    description: 'Tax implications of Massachusetts retirement benefits and planning strategies',
    color: '#16A34A',
    icon: '💰',
    sortOrder: 8,
    isActive: true,
    isAiTopic: true
  }
]

// Sample blog posts for Massachusetts Retirement System
const SAMPLE_BLOG_POSTS = [
  {
    title: 'Massachusetts Retirement Groups 1-4: Complete Eligibility and Benefits Guide',
    slug: 'massachusetts-retirement-groups-1-4-complete-guide',
    content: `# Massachusetts Retirement Groups 1-4: Complete Eligibility and Benefits Guide

Understanding your Massachusetts Retirement Group is crucial for planning your public service career and retirement. The Massachusetts Retirement System classifies all public employees into four distinct groups, each with specific eligibility requirements, minimum retirement ages, and benefit calculations.

## Group 1: General Employees

Group 1 includes most Massachusetts public employees, including teachers, municipal workers, and state employees in non-hazardous positions.

**Eligibility Requirements:**
- Minimum retirement age: 60
- Minimum service requirement: 10 years
- Full benefits available at age 65 with 10 years of service

**Benefit Calculation:**
- Benefit percentage increases from 2.0% at age 60 to 2.5% at age 65
- Maximum benefit cap: 80% of average salary

## Group 2: Hazardous Duty Employees

Group 2 covers probation officers, court officers, and certain other positions involving public safety.

**Eligibility Requirements:**
- Minimum retirement age: 55
- Minimum service requirement: 10 years
- Full benefits available at age 60 with 10 years of service

**Benefit Calculation:**
- Benefit percentage increases from 2.0% at age 55 to 2.5% at age 60
- Maximum benefit cap: 80% of average salary

## Group 3: State Police

Group 3 is exclusively for Massachusetts State Police officers.

**Eligibility Requirements:**
- No minimum retirement age with 20+ years of service
- Mandatory retirement at age 65
- Special provisions for disability retirement

**Benefit Calculation:**
- Flat 2.5% benefit percentage regardless of age
- Maximum benefit cap: 80% of average salary

## Group 4: Public Safety and Corrections

Group 4 includes local police officers, firefighters, and corrections officers.

**Eligibility Requirements:**
- Minimum retirement age: 50
- Minimum service requirement: 10 years
- Full benefits available at age 55 with 10 years of service

**Benefit Calculation:**
- Benefit percentage increases from 2.0% at age 50 to 2.5% at age 55
- Maximum benefit cap: 80% of average salary

## Planning Your Massachusetts Retirement

Understanding your group classification helps you:
- Plan your retirement timeline
- Maximize your benefit percentage
- Make informed career decisions
- Understand your pension options

For personalized calculations and planning, use the Massachusetts Pension Calculator at masspension.com.

*Disclaimer: This information is for educational purposes only. For official benefit calculations, consult the Massachusetts Retirement Board.*`,
    excerpt: 'Complete guide to Massachusetts Retirement Groups 1-4, including eligibility requirements, minimum retirement ages, and benefit calculations for all public employees.',
    status: 'draft',
    isAiGenerated: true,
    aiModelUsed: 'gemini-1.5-flash',
    seoKeywords: ['Massachusetts retirement groups', 'Group 1 2 3 4', 'public employee benefits', 'eligibility requirements'],
    seoTitle: 'Massachusetts Retirement Groups 1-4: Complete Eligibility Guide',
    seoDescription: 'Complete guide to Massachusetts Retirement Groups 1-4 eligibility, benefits, and requirements for public employees, teachers, police, and firefighters.',
    categorySlug: 'retirement-groups'
  },
  {
    title: 'Understanding Massachusetts COLA: The $13,000 Cap and Your Annual Adjustments',
    slug: 'massachusetts-cola-13000-cap-annual-adjustments',
    content: `# Understanding Massachusetts COLA: The $13,000 Cap and Your Annual Adjustments

The Massachusetts Cost of Living Adjustment (COLA) is a crucial component of your retirement benefits, but it comes with a unique cap that many retirees don't fully understand. Here's everything you need to know about how COLA affects your Massachusetts pension.

## What is Massachusetts COLA?

The Massachusetts COLA provides annual increases to help your pension keep pace with inflation. Unlike many other states, Massachusetts has a fixed 3% annual COLA rate.

## The $13,000 Cap Explained

The most important aspect of Massachusetts COLA is the $13,000 cap:

- **COLA Rate**: 3% annually
- **Applied To**: Only the first $13,000 of your annual pension
- **Maximum Annual Increase**: $390 ($13,000 × 3%)
- **Timing**: Begins the first year after retirement

## How COLA Calculations Work

### Example 1: Pension Under $13,000
- Annual pension: $10,000
- COLA increase: $10,000 × 3% = $300
- New annual pension: $10,300

### Example 2: Pension Over $13,000
- Annual pension: $25,000
- COLA increase: $13,000 × 3% = $390 (capped)
- New annual pension: $25,390

## COLA with Pension Options

COLA applies to all pension options:

**Option A (Single Life)**
- Full COLA on base pension amount

**Option B (Life with Guarantee)**
- COLA applies to reduced pension amount

**Option C (Joint and Survivor)**
- COLA applies to both member and survivor benefits

## Long-Term Impact

Over time, the $13,000 cap significantly affects higher pension amounts:

**Year 1**: $390 increase
**Year 5**: $1,950 cumulative increase
**Year 10**: $3,900 cumulative increase
**Year 20**: $7,800 cumulative increase

## Planning Strategies

1. **Understand the Real Impact**: Higher pensions lose purchasing power over time
2. **Consider Supplemental Savings**: 401(k), 403(b), or IRA contributions
3. **Factor COLA into Retirement Planning**: Use realistic projections
4. **Review Annually**: Track your COLA increases

## COLA and Social Security

Massachusetts COLA is separate from Social Security COLA:
- Social Security has its own annual adjustment
- Both can be received simultaneously
- Combined benefits help maintain purchasing power

For detailed COLA projections and retirement planning, visit masspension.com.

*Disclaimer: This information is for educational purposes only. For official COLA calculations, consult the Massachusetts Retirement Board.*`,
    excerpt: 'Comprehensive explanation of Massachusetts COLA with the $13,000 cap, including calculations, examples, and long-term impact on your retirement benefits.',
    status: 'draft',
    isAiGenerated: true,
    aiModelUsed: 'gemini-1.5-flash',
    seoKeywords: ['Massachusetts COLA', '$13,000 cap', 'cost of living adjustment', 'annual increase'],
    seoTitle: 'Massachusetts COLA: $13,000 Cap and Annual Adjustments Explained',
    seoDescription: 'Complete guide to Massachusetts COLA with $13,000 cap, including calculations, examples, and impact on your retirement benefits.',
    categorySlug: 'cola-adjustments'
  }
]

async function setupBlogDirectDatabase() {
  console.log('🗄️  Setting up Massachusetts Retirement System Blog via Direct Database Access\n')
  
  const prisma = new PrismaClient()
  
  try {
    // Step 1: Create blog categories
    console.log('📂 Step 1: Creating blog categories directly in database...')
    const createdCategories = {}
    
    for (const category of MASSACHUSETTS_CATEGORIES) {
      try {
        // Check if category already exists
        const existingCategory = await prisma.blogCategory.findUnique({
          where: { slug: category.slug }
        })
        
        if (existingCategory) {
          console.log(`   ✅ Category "${category.name}" already exists`)
          createdCategories[category.slug] = existingCategory.id
        } else {
          const createdCategory = await prisma.blogCategory.create({
            data: category
          })
          createdCategories[category.slug] = createdCategory.id
          console.log(`   ✅ Created category: ${category.name}`)
        }
      } catch (error) {
        console.log(`   ❌ Failed to create category ${category.name}: ${error.message}`)
      }
    }
    
    console.log(`\n📂 Total categories available: ${Object.keys(createdCategories).length}`)
    
    // Step 2: Create sample blog posts
    console.log('\n📝 Step 2: Creating sample blog posts...')
    const createdPosts = []
    
    for (const post of SAMPLE_BLOG_POSTS) {
      const categoryId = createdCategories[post.categorySlug]
      
      if (!categoryId) {
        console.log(`   ⚠️  Skipping "${post.title}" - category not found`)
        continue
      }
      
      try {
        // Check if post already exists
        const existingPost = await prisma.blogPost.findUnique({
          where: { slug: post.slug }
        })
        
        if (existingPost) {
          console.log(`   ✅ Post "${post.title}" already exists`)
          createdPosts.push(existingPost)
        } else {
          const { categorySlug, ...postData } = post
          const createdPost = await prisma.blogPost.create({
            data: postData
          })
          
          // Create category relationship
          await prisma.blogPostCategory.create({
            data: {
              postId: createdPost.id,
              categoryId: categoryId
            }
          })
          
          createdPosts.push(createdPost)
          console.log(`   ✅ Created post: "${post.title}"`)
        }
      } catch (error) {
        console.log(`   ❌ Failed to create post "${post.title}": ${error.message}`)
      }
    }
    
    console.log(`\n📝 Total posts created: ${createdPosts.length}`)
    
    // Step 3: Verify setup
    console.log('\n🔍 Step 3: Verifying database setup...')
    
    const totalCategories = await prisma.blogCategory.count()
    const totalPosts = await prisma.blogPost.count()
    const totalRelations = await prisma.blogPostCategory.count()
    
    console.log(`   📂 Total categories in database: ${totalCategories}`)
    console.log(`   📝 Total posts in database: ${totalPosts}`)
    console.log(`   🔗 Total category relations: ${totalRelations}`)
    
    console.log('\n🎉 MASSACHUSETTS RETIREMENT SYSTEM BLOG SETUP COMPLETE!')
    console.log('=' .repeat(60))
    console.log(`✅ Categories created: ${Object.keys(createdCategories).length}`)
    console.log(`✅ Blog posts created: ${createdPosts.length}`)
    console.log('✅ Database setup successful')
    console.log('✅ Ready for content generation')
    
    console.log('\n📋 NEXT STEPS:')
    console.log('1. Test API endpoints: node test-api-endpoints.js')
    console.log('2. Verify categories API: GET /api/blog/categories')
    console.log('3. Verify posts API: GET /api/blog/posts')
    console.log('4. Configure AI content generation')
    console.log('5. Set up automated scheduling')
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

// Run setup
setupBlogDirectDatabase()
