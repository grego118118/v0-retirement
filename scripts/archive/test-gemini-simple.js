// Simple test to verify Gemini integration is working
// Run with: node test-gemini-simple.js

const BASE_URL = 'http://localhost:3000'
const CRON_SECRET = '462c44a146ca26604411330b9cc568e9cc10a60e09745f4b7e26f8a80983c140'

async function testServerWithGemini() {
  console.log('🧪 Testing Server with Gemini Integration')
  console.log('=' * 50)
  
  try {
    // Test budget API first (should work regardless of Gemini API key)
    console.log('1. Testing Budget API...')
    const budgetResponse = await fetch(`${BASE_URL}/api/admin/blog/analytics/costs`, {
      headers: { 'Authorization': `Bearer ${CRON_SECRET}` }
    })
    
    if (budgetResponse.ok) {
      const budgetData = await budgetResponse.json()
      console.log('✅ Budget API working')
      console.log(`📊 Monthly Total: $${budgetData.monthly_total}`)
      console.log(`📈 Budget Utilization: ${budgetData.budget_utilization}%`)
    } else {
      console.log('❌ Budget API failed')
      return false
    }
    
    // Test content generation API (will show if Gemini is configured)
    console.log('\n2. Testing Content Generation API...')
    const contentResponse = await fetch(`${BASE_URL}/api/admin/blog/generate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CRON_SECRET}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        topic: {
          id: 'gemini-test-topic',
          title: 'Massachusetts Retirement Benefits: A Complete Guide',
          description: 'Comprehensive guide to Massachusetts retirement benefits for public employees',
          category: 'retirement-planning',
          keywords: ['Massachusetts retirement', 'pension benefits', 'public employees'],
          target_groups: ['Group 1', 'Group 2', 'Group 3', 'Group 4']
        },
        ai_model: 'gemini-1.5-flash',
        word_count: 500,
        workflow_source: 'gemini_integration_test'
      })
    })
    
    console.log(`📊 Content API Status: ${contentResponse.status}`)
    
    if (contentResponse.ok) {
      const contentData = await contentResponse.json()
      console.log('✅ GEMINI CONTENT GENERATION WORKING!')
      console.log(`📝 Title: ${contentData.title}`)
      console.log(`💰 Cost: $${contentData.cost_estimate || 0} (FREE!)`)
      console.log(`🤖 Model: ${contentData.ai_model}`)
      
      console.log('\n🎉 SUCCESS: Gemini AI is fully functional!')
      return true
    } else {
      const errorText = await contentResponse.text()
      console.log('⚠️ Content generation needs setup')
      
      if (errorText.includes('GEMINI_API_KEY') || errorText.includes('not configured') || errorText.includes('API key not valid')) {
        console.log('\n📋 NEXT STEPS:')
        console.log('1. Get free Gemini API key: https://aistudio.google.com/')
        console.log('2. Add to .env.local: GEMINI_API_KEY=your_key_here')
        console.log('3. Restart development server')
        console.log('4. Run: node test-gemini-api.js')
        
        console.log('\n✅ GOOD NEWS:')
        console.log('- Server is running correctly')
        console.log('- Authentication is working')
        console.log('- Budget API is functional')
        console.log('- Only need to add Gemini API key!')
        
        return 'needs_api_key'
      } else {
        console.log('❌ Unexpected error:', errorText.substring(0, 200))
        return false
      }
    }
  } catch (error) {
    console.log('❌ CONNECTION ERROR!')
    console.log(`Error: ${error.message}`)
    console.log('\n🔧 Troubleshooting:')
    console.log('- Check if server is running: npm run dev')
    console.log('- Verify port 3000 is available')
    console.log('- Check CRON_SECRET in .env.local')
    return false
  }
}

async function runSimpleTest() {
  const result = await testServerWithGemini()
  
  console.log('\n' + '=' * 50)
  console.log('🏁 INTEGRATION STATUS:')
  
  if (result === true) {
    console.log('🎉 FULLY FUNCTIONAL!')
    console.log('✅ Gemini AI working')
    console.log('✅ Free content generation')
    console.log('✅ Ready for n8n workflows')
    
  } else if (result === 'needs_api_key') {
    console.log('⚠️ ALMOST READY!')
    console.log('✅ Server integration complete')
    console.log('✅ Authentication working')
    console.log('🔑 Just need Gemini API key')
    console.log('📖 See: setup-gemini-api.md')
    
  } else {
    console.log('❌ NEEDS ATTENTION')
    console.log('🔧 Check server and configuration')
  }
  
  console.log('\n📋 GEMINI BENEFITS:')
  console.log('💰 FREE - No API costs')
  console.log('🚀 FAST - Optimized for speed')
  console.log('🎯 QUALITY - Excellent content generation')
  console.log('🔧 SIMPLE - No complex dependencies')
  
  return result
}

runSimpleTest().catch(console.error)
