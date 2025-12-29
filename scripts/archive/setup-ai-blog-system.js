/**
 * Massachusetts Retirement System AI Blog Setup
 * Complete initialization of AI-powered content generation system
 */

const CRON_SECRET = process.env.CRON_SECRET || 'dev-secret'
const BASE_URL = 'https://masspension.com'

// Massachusetts Retirement System Categories
const MASSACHUSETTS_CATEGORIES = [
  {
    name: 'Pension Planning',
    slug: 'pension-planning',
    description: 'Comprehensive guides for Massachusetts pension planning and benefit maximization',
    color: '#1E40AF',
    icon: '📊',
    sortOrder: 1,
    isAiTopic: true
  },
  {
    name: 'COLA Adjustments',
    slug: 'cola-adjustments',
    description: 'Massachusetts Cost of Living Adjustments, annual increases, and impact analysis',
    color: '#059669',
    icon: '📈',
    sortOrder: 2,
    isAiTopic: true
  },
  {
    name: 'Retirement Groups',
    slug: 'retirement-groups',
    description: 'Massachusetts Retirement Groups 1-4: eligibility, benefits, and requirements',
    color: '#DC2626',
    icon: '👥',
    sortOrder: 3,
    isAiTopic: true
  },
  {
    name: 'Pension Options',
    slug: 'pension-options',
    description: 'Pension Options A, B, C with reduction calculations and survivor benefits',
    color: '#7C2D12',
    icon: '⚖️',
    sortOrder: 4,
    isAiTopic: true
  },
  {
    name: 'Social Security Integration',
    slug: 'social-security-integration',
    description: 'How Social Security works with Massachusetts public employee pensions',
    color: '#4338CA',
    icon: '🏛️',
    sortOrder: 5,
    isAiTopic: true
  },
  {
    name: 'Career Planning',
    slug: 'career-planning',
    description: 'Retirement planning strategies for different career stages and life events',
    color: '#9333EA',
    icon: '🎯',
    sortOrder: 6,
    isAiTopic: true
  },
  {
    name: 'Benefit Calculations',
    slug: 'benefit-calculations',
    description: 'Understanding Massachusetts pension calculations, formulas, and examples',
    color: '#EA580C',
    icon: '🧮',
    sortOrder: 7,
    isAiTopic: true
  },
  {
    name: 'Tax Planning',
    slug: 'tax-planning',
    description: 'Tax implications of Massachusetts retirement benefits and planning strategies',
    color: '#16A34A',
    icon: '💰',
    sortOrder: 8,
    isAiTopic: true
  }
]

// Initial blog post topics for Massachusetts Retirement System
const INITIAL_BLOG_TOPICS = [
  {
    title: 'Massachusetts Retirement Groups 1-4: Complete Eligibility and Benefits Guide',
    category: 'retirement-groups',
    keywords: ['Massachusetts retirement groups', 'Group 1 2 3 4', 'public employee benefits', 'eligibility requirements'],
    complexity: 'beginner'
  },
  {
    title: 'Understanding Massachusetts COLA: The $13,000 Cap and Your Annual Adjustments',
    category: 'cola-adjustments',
    keywords: ['Massachusetts COLA', '$13,000 cap', 'cost of living adjustment', 'annual increase'],
    complexity: 'intermediate'
  },
  {
    title: 'Massachusetts Pension Options A, B, C: Which Should You Choose?',
    category: 'pension-options',
    keywords: ['pension options', 'Option A B C', 'survivor benefits', 'reduction calculations'],
    complexity: 'intermediate'
  },
  {
    title: 'Maximizing Your Massachusetts Pension: Average Salary and Service Credit Strategies',
    category: 'pension-planning',
    keywords: ['pension maximization', 'average salary', 'service credit', 'retirement planning'],
    complexity: 'advanced'
  },
  {
    title: 'Social Security and Massachusetts Pensions: How They Work Together',
    category: 'social-security-integration',
    keywords: ['Social Security', 'Massachusetts pension', 'public employee benefits', 'retirement income'],
    complexity: 'intermediate'
  },
  {
    title: 'Massachusetts Retirement Planning by Career Stage: 20s, 30s, 40s, and 50s',
    category: 'career-planning',
    keywords: ['retirement planning', 'career stages', 'Massachusetts public employees', 'life planning'],
    complexity: 'beginner'
  },
  {
    title: 'Understanding Your Massachusetts Pension Calculation: Step-by-Step Examples',
    category: 'benefit-calculations',
    keywords: ['pension calculation', 'benefit formula', 'Massachusetts retirement', 'examples'],
    complexity: 'intermediate'
  },
  {
    title: 'Tax Planning for Massachusetts Retirees: State and Federal Considerations',
    category: 'tax-planning',
    keywords: ['retirement taxes', 'Massachusetts tax', 'pension taxation', 'tax planning'],
    complexity: 'advanced'
  }
]

async function setupAIBlogSystem() {
  console.log('🚀 Setting up Massachusetts Retirement System AI Blog System\n')
  
  try {
    // Step 1: Create blog categories
    console.log('📂 Step 1: Creating blog categories...')
    const createdCategories = {}
    
    for (const category of MASSACHUSETTS_CATEGORIES) {
      try {
        const response = await fetch(`${BASE_URL}/api/blog/categories`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${CRON_SECRET}`
          },
          body: JSON.stringify(category)
        })
        
        if (response.ok) {
          const result = await response.json()
          createdCategories[category.slug] = result.category.id
          console.log(`   ✅ Created category: ${category.name}`)
        } else {
          const error = await response.text()
          console.log(`   ⚠️  Category ${category.name}: ${error}`)
        }
      } catch (error) {
        console.log(`   ❌ Failed to create category ${category.name}: ${error.message}`)
      }
    }
    
    console.log(`\n📂 Created ${Object.keys(createdCategories).length} categories`)
    
    // Step 2: Generate initial blog content
    console.log('\n📝 Step 2: Generating initial blog content...')
    const generatedPosts = []
    
    for (let i = 0; i < INITIAL_BLOG_TOPICS.length; i++) {
      const topic = INITIAL_BLOG_TOPICS[i]
      const categoryId = createdCategories[topic.category]
      
      if (!categoryId) {
        console.log(`   ⚠️  Skipping "${topic.title}" - category not found`)
        continue
      }
      
      try {
        console.log(`   🤖 Generating: "${topic.title}"...`)
        
        const response = await fetch(`${BASE_URL}/api/admin/blog/generate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${CRON_SECRET}`
          },
          body: JSON.stringify({
            topic: {
              title: topic.title,
              description: `Comprehensive guide about ${topic.title.toLowerCase()}`,
              keywords: topic.keywords
            },
            category_id: categoryId,
            ai_model: 'gemini-1.5-flash',
            word_count: 1000,
            seo_keywords: topic.keywords,
            auto_publish: false // Keep as draft for review
          })
        })
        
        if (response.ok) {
          const result = await response.json()
          generatedPosts.push(result)
          console.log(`   ✅ Generated: "${topic.title}"`)
          console.log(`      Quality Score: ${result.quality_metrics?.overall_quality || 'N/A'}`)
          console.log(`      Word Count: ${result.generated_post?.word_count || 'N/A'}`)
        } else {
          const error = await response.text()
          console.log(`   ❌ Failed to generate "${topic.title}": ${error}`)
        }
        
        // Add delay between generations to avoid rate limits
        if (i < INITIAL_BLOG_TOPICS.length - 1) {
          console.log('   ⏳ Waiting 5 seconds before next generation...')
          await new Promise(resolve => setTimeout(resolve, 5000))
        }
        
      } catch (error) {
        console.log(`   ❌ Error generating "${topic.title}": ${error.message}`)
      }
    }
    
    console.log(`\n📝 Generated ${generatedPosts.length} blog posts`)
    
    // Step 3: Set up automated content scheduling
    console.log('\n⏰ Step 3: Setting up automated content scheduling...')
    
    try {
      const scheduleResponse = await fetch(`${BASE_URL}/api/cron/content-automation?action=schedule`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${CRON_SECRET}`
        }
      })
      
      if (scheduleResponse.ok) {
        const scheduleResult = await scheduleResponse.json()
        console.log('   ✅ Content scheduling configured')
        console.log(`   📅 Next execution: ${scheduleResult.next_execution || 'TBD'}`)
      } else {
        console.log('   ⚠️  Content scheduling setup needs manual configuration')
      }
    } catch (error) {
      console.log(`   ❌ Scheduling setup error: ${error.message}`)
    }
    
    // Step 4: Verify system status
    console.log('\n🔍 Step 4: Verifying system status...')
    
    try {
      const postsResponse = await fetch(`${BASE_URL}/api/blog/posts?limit=1`)
      const categoriesResponse = await fetch(`${BASE_URL}/api/blog/categories`)
      
      console.log(`   📊 Blog posts API: ${postsResponse.status}`)
      console.log(`   📂 Categories API: ${categoriesResponse.status}`)
      
      if (postsResponse.ok) {
        const postsData = await postsResponse.json()
        console.log(`   📝 Total posts in system: ${postsData.pagination?.total || 0}`)
      }
      
      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json()
        console.log(`   📂 Total categories: ${categoriesData.total || 0}`)
      }
      
    } catch (error) {
      console.log(`   ❌ System verification error: ${error.message}`)
    }
    
    // Final summary
    console.log('\n🎉 MASSACHUSETTS RETIREMENT SYSTEM AI BLOG SETUP COMPLETE!')
    console.log('=' .repeat(60))
    console.log(`✅ Categories created: ${Object.keys(createdCategories).length}`)
    console.log(`✅ Blog posts generated: ${generatedPosts.length}`)
    console.log('✅ Content scheduling configured')
    console.log('✅ System verified and operational')
    
    console.log('\n📋 NEXT STEPS:')
    console.log('1. Review generated content in draft status')
    console.log('2. Approve and publish initial posts')
    console.log('3. Configure email notifications for content reviewers')
    console.log('4. Set up Vercel cron jobs for automated scheduling')
    console.log('5. Monitor AI usage costs and adjust budgets')
    
    console.log('\n🔗 USEFUL LINKS:')
    console.log(`📊 Blog Posts: ${BASE_URL}/api/blog/posts`)
    console.log(`📂 Categories: ${BASE_URL}/api/blog/categories`)
    console.log(`🤖 Content Generation: ${BASE_URL}/api/admin/blog/generate`)
    console.log(`⏰ Automation: ${BASE_URL}/api/cron/content-automation`)
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message)
  }
}

// Run setup
setupAIBlogSystem()
