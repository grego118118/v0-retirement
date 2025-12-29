/**
 * Setup Blog Database
 * Create blog tables and seed initial Massachusetts Retirement content
 */

const { PrismaClient } = require('@prisma/client');

async function setupBlogDatabase() {
  console.log('🚀 Setting up Blog Database for Massachusetts Retirement System\n');
  
  const prisma = new PrismaClient();
  
  try {
    // Test database connection
    console.log('📡 Testing database connection...');
    await prisma.$connect();
    console.log('   ✅ Database connection successful');
    
    // Create blog categories for Massachusetts Retirement topics
    console.log('\n📂 Creating blog categories...');
    
    const categories = [
      {
        id: 'cat-mass-retirement',
        name: 'Massachusetts Retirement System',
        slug: 'massachusetts-retirement',
        description: 'Comprehensive information about the Massachusetts Retirement System, benefits, and eligibility requirements.',
        color: '#1E40AF',
        isActive: true,
        sortOrder: 1,
        isAiTopic: true
      },
      {
        id: 'cat-pension-calc',
        name: 'Pension Calculations',
        slug: 'pension-calculations',
        description: 'How to calculate retirement benefits, multipliers, and pension options A, B, and C.',
        color: '#059669',
        isActive: true,
        sortOrder: 2,
        isAiTopic: true
      },
      {
        id: 'cat-groups',
        name: 'Group Classifications',
        slug: 'group-classifications',
        description: 'Understanding Groups 1-4, eligibility requirements, and minimum retirement ages.',
        color: '#DC2626',
        isActive: true,
        sortOrder: 3,
        isAiTopic: true
      },
      {
        id: 'cat-cola',
        name: 'COLA Benefits',
        slug: 'cola-benefits',
        description: 'Cost of living adjustments, 3% rate on first $13,000, and annual compounding.',
        color: '#7C2D12',
        isActive: true,
        sortOrder: 4,
        isAiTopic: true
      },
      {
        id: 'cat-social-security',
        name: 'Social Security Integration',
        slug: 'social-security',
        description: 'Combining Massachusetts pensions with Social Security benefits for optimal retirement income.',
        color: '#6B21A8',
        isActive: true,
        sortOrder: 5,
        isAiTopic: true
      }
    ];
    
    for (const category of categories) {
      try {
        const existingCategory = await prisma.blogCategory.findUnique({
          where: { slug: category.slug }
        });
        
        if (!existingCategory) {
          await prisma.blogCategory.create({ data: category });
          console.log(`   ✅ Created category: ${category.name}`);
        } else {
          console.log(`   ⚠️  Category already exists: ${category.name}`);
        }
      } catch (error) {
        console.log(`   ❌ Error creating category ${category.name}: ${error.message}`);
      }
    }
    
    // Create sample blog posts
    console.log('\n📝 Creating sample blog posts...');
    
    const samplePosts = [
      {
        title: 'Understanding Massachusetts Retirement System Groups 1-4',
        slug: 'understanding-massachusetts-retirement-groups',
        content: `# Understanding Massachusetts Retirement System Groups 1-4

The Massachusetts Retirement System classifies employees into four distinct groups, each with different eligibility requirements and retirement benefits.

## Group 1: General Employees
- **Minimum Retirement Age**: 60 years
- **Includes**: Most state and municipal employees
- **Benefit Multiplier**: 2.0% at age 60, increasing to 2.5% at age 65

## Group 2: Hazardous Duty
- **Minimum Retirement Age**: 55 years  
- **Includes**: Probation officers, court officers
- **Benefit Multiplier**: 2.0% at age 55, increasing to 2.5% at age 60

## Group 3: State Police
- **Minimum Retirement Age**: Any age with 20+ years of service
- **Includes**: Massachusetts State Police officers
- **Benefit Multiplier**: Flat 2.5% regardless of age

## Group 4: Public Safety
- **Minimum Retirement Age**: 50 years
- **Includes**: Police officers, firefighters, corrections officers
- **Benefit Multiplier**: 2.0% at age 50, increasing to 2.5% at age 55

Understanding your group classification is crucial for retirement planning and calculating your expected benefits.`,
        excerpt: 'Learn about the four Massachusetts Retirement System groups and how your classification affects your retirement benefits and eligibility.',
        status: 'published',
        isAiGenerated: true,
        aiModelUsed: 'gemini-1.5-flash',
        viewCount: 0,
        factCheckStatus: 'approved',
        seoTitle: 'Massachusetts Retirement System Groups 1-4 Explained | Mass Pension',
        seoDescription: 'Complete guide to Massachusetts Retirement System groups 1-4, including eligibility, minimum retirement ages, and benefit multipliers for each classification.',
        seoKeywords: ['massachusetts retirement system', 'retirement groups', 'pension benefits', 'group 1', 'group 2', 'group 3', 'group 4'],
        publishedAt: new Date(),
        internalLinksAdded: false,
        seoOptimized: true
      },
      {
        title: 'How COLA Benefits Work in Massachusetts Retirement System',
        slug: 'cola-benefits-massachusetts-retirement',
        content: `# How COLA Benefits Work in Massachusetts Retirement System

Cost of Living Adjustments (COLA) help protect your Massachusetts retirement benefits from inflation.

## COLA Rate and Cap
- **Annual Rate**: 3% per year
- **Maximum Base**: First $13,000 of annual allowance only
- **Annual Cap**: $390 maximum increase per year

## How COLA Compounds
COLA benefits compound annually, meaning each year's increase is calculated on the previous year's adjusted amount.

### Example Calculation
- Year 1: $30,000 pension → COLA on first $13,000 = $390
- Year 2: $30,390 pension → COLA on first $13,000 = $390  
- Year 3: $30,780 pension → COLA on first $13,000 = $390

## COLA with Pension Options
COLA applies to all pension options:
- **Option A**: Full COLA on reduced benefit
- **Option B**: Full COLA on reduced benefit  
- **Option C**: Full COLA on reduced benefit

The COLA adjustment begins the first year after retirement and continues for life.`,
        excerpt: 'Understand how Cost of Living Adjustments (COLA) work in the Massachusetts Retirement System, including the 3% rate and $390 annual cap.',
        status: 'published',
        isAiGenerated: true,
        aiModelUsed: 'gemini-1.5-flash',
        viewCount: 0,
        factCheckStatus: 'approved',
        seoTitle: 'Massachusetts Retirement COLA Benefits Explained | 3% Annual Increase',
        seoDescription: 'Learn how COLA benefits work in Massachusetts Retirement System with 3% annual rate on first $13,000 and $390 maximum yearly increase.',
        seoKeywords: ['massachusetts cola', 'cost of living adjustment', 'retirement benefits', '3 percent cola', 'pension increase'],
        publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
        internalLinksAdded: false,
        seoOptimized: true
      }
    ];
    
    for (const post of samplePosts) {
      try {
        const existingPost = await prisma.blogPost.findUnique({
          where: { slug: post.slug }
        });
        
        if (!existingPost) {
          const createdPost = await prisma.blogPost.create({ data: post });
          console.log(`   ✅ Created blog post: ${post.title}`);
          
          // Add category relationships
          const categorySlug = post.slug.includes('groups') ? 'group-classifications' : 'cola-benefits';
          const category = await prisma.blogCategory.findUnique({
            where: { slug: categorySlug }
          });
          
          if (category) {
            await prisma.blogPostCategory.create({
              data: {
                postId: createdPost.id,
                categoryId: category.id
              }
            });
            console.log(`   🔗 Linked post to category: ${category.name}`);
          }
        } else {
          console.log(`   ⚠️  Blog post already exists: ${post.title}`);
        }
      } catch (error) {
        console.log(`   ❌ Error creating blog post ${post.title}: ${error.message}`);
      }
    }
    
    // Verify setup
    console.log('\n📊 Verifying blog database setup...');
    const categoryCount = await prisma.blogCategory.count();
    const postCount = await prisma.blogPost.count();
    const publishedCount = await prisma.blogPost.count({ where: { status: 'published' } });
    
    console.log(`   📂 Categories created: ${categoryCount}`);
    console.log(`   📝 Blog posts created: ${postCount}`);
    console.log(`   📢 Published posts: ${publishedCount}`);
    
    console.log('\n🎉 Blog database setup completed successfully!');
    console.log('✅ Massachusetts Retirement System blog content is ready');
    console.log('✅ Categories and sample posts created');
    console.log('✅ Database schema deployed');
    
  } catch (error) {
    console.error('❌ Error setting up blog database:', error.message);
    console.log('\n🔧 TROUBLESHOOTING:');
    console.log('1. Verify DATABASE_URL is set correctly');
    console.log('2. Check Supabase database is accessible');
    console.log('3. Run: npx prisma generate');
    console.log('4. Run: npx prisma db push');
    
  } finally {
    await prisma.$disconnect();
  }
}

// Run the setup
setupBlogDatabase();
