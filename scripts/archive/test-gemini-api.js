// Test Gemini API setup for Massachusetts Retirement System
// Run with: node test-gemini-api.js

const BASE_URL = 'http://localhost:3000'
const CRON_SECRET = '462c44a146ca26604411330b9cc568e9cc10a60e09745f4b7e26f8a80983c140'

async function testGeminiAPI() {
  console.log('🤖 Testing Gemini AI Integration')
  console.log('=' * 50)
  
  try {
    const response = await fetch(`${BASE_URL}/api/admin/blog/generate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CRON_SECRET}`,
        'Content-Type': 'application/json',
        'User-Agent': 'n8n-workflow/1.0 (Massachusetts Retirement System)'
      },
      body: JSON.stringify({
        topic: {
          id: 'gemini-test-retirement-guide',
          title: 'Massachusetts Retirement Benefits: Complete Guide for Public Employees',
          description: 'Comprehensive guide covering Massachusetts retirement benefits, pension calculations, and COLA adjustments for state and municipal employees.',
          category: 'retirement-planning',
          keywords: ['Massachusetts retirement', 'pension benefits', 'public employees', 'COLA', 'retirement planning'],
          target_groups: ['Group 1', 'Group 2', 'Group 3', 'Group 4']
        },
        ai_model: 'gemini-1.5-flash',
        word_count: 500,
        workflow_source: 'gemini_test'
      })
    })

    console.log(`📊 Response Status: ${response.status}`)
    
    if (response.ok) {
      const data = await response.json()
      console.log('✅ GEMINI CONTENT GENERATION SUCCESSFUL!')
      console.log('\n📝 Generated Content:')
      console.log(`- Title: ${data.title}`)
      console.log(`- Word Count: ${data.word_count}`)
      console.log(`- AI Model: ${data.ai_model}`)
      console.log(`- Cost: $${data.cost_estimate || 0} (FREE!)`)
      console.log(`- Quality Score: ${data.quality_score}`)
      
      if (data.content) {
        const preview = data.content.substring(0, 200) + '...'
        console.log(`- Content Preview: ${preview}`)
      }
      
      console.log('\n🎉 GEMINI AI SETUP COMPLETE!')
      console.log('✅ Free content generation working')
      console.log('✅ No OpenAI dependency needed')
      console.log('✅ Ready for n8n workflows')
      
      return true
    } else {
      const errorText = await response.text()
      console.log('❌ CONTENT GENERATION FAILED!')
      console.log(`Error: ${errorText}`)
      
      if (response.status === 500 && errorText.includes('GEMINI_API_KEY')) {
        console.log('\n🔧 SETUP REQUIRED:')
        console.log('1. Get free Gemini API key: https://aistudio.google.com/')
        console.log('2. Add to .env.local: GEMINI_API_KEY=your_key_here')
        console.log('3. Restart development server')
        console.log('4. Run this test again')
      }
      
      return false
    }
  } catch (error) {
    console.log('❌ CONNECTION ERROR!')
    console.log(`Error: ${error.message}`)
    console.log('\n🔧 Troubleshooting:')
    console.log('- Check if server is running on port 3000')
    console.log('- Verify CRON_SECRET is configured')
    console.log('- Ensure Gemini API key is set')
    return false
  }
}

async function testBudgetAPI() {
  console.log('\n💰 Testing Budget API...')
  
  try {
    const response = await fetch(`${BASE_URL}/api/admin/blog/analytics/costs`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${CRON_SECRET}`,
        'Content-Type': 'application/json'
      }
    })

    if (response.ok) {
      const data = await response.json()
      console.log('✅ Budget API working')
      console.log(`📊 Monthly Total: $${data.monthly_total} (Gemini = $0!)`)
      console.log(`📈 Budget Utilization: ${data.budget_utilization}%`)
      return true
    } else {
      console.log('❌ Budget API failed')
      return false
    }
  } catch (error) {
    console.log('❌ Budget API error:', error.message)
    return false
  }
}

async function testCompleteWorkflow() {
  console.log('\n🤖 Testing Complete n8n Workflow Simulation...')
  
  try {
    // Step 1: Check budget
    const budgetResponse = await fetch(`${BASE_URL}/api/admin/blog/analytics/costs`, {
      headers: { 'Authorization': `Bearer ${CRON_SECRET}` }
    })
    
    if (!budgetResponse.ok) {
      console.log('❌ Budget check failed')
      return false
    }
    
    const budgetData = await budgetResponse.json()
    console.log(`✅ Budget check: ${budgetData.budget_utilization}% used`)
    
    // Step 2: Generate content if budget allows
    if (budgetData.budget_utilization < 90) {
      console.log('✅ Budget allows content generation')
      
      const contentResponse = await fetch(`${BASE_URL}/api/admin/blog/generate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${CRON_SECRET}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          topic: {
            id: 'gemini-test-cola-analysis',
            title: 'Massachusetts COLA Analysis: 2024 Cost of Living Adjustments',
            description: 'Weekly analysis of Massachusetts retirement system COLA adjustments and their impact on retiree benefits.',
            category: 'cola-analysis',
            keywords: ['Massachusetts COLA', 'cost of living adjustment', 'retirement benefits', 'pension increase'],
            target_groups: ['Group 1', 'Group 2', 'Group 3', 'Group 4']
          },
          ai_model: 'gemini-1.5-flash',
          word_count: 600,
          workflow_source: 'n8n_gemini_test'
        })
      })
      
      if (contentResponse.ok) {
        const contentData = await contentResponse.json()
        console.log('✅ Content generation successful')
        console.log(`📝 Generated: ${contentData.title}`)
        console.log(`💰 Cost: $${contentData.cost_estimate || 0} (FREE!)`)
        return true
      } else {
        console.log('❌ Content generation failed')
        return false
      }
    } else {
      console.log('⚠️ Budget limit reached - would skip generation (correct behavior)')
      return true
    }
  } catch (error) {
    console.log('❌ Workflow simulation error:', error.message)
    return false
  }
}

async function runGeminiTests() {
  const results = {
    gemini: await testGeminiAPI(),
    budget: await testBudgetAPI(),
    workflow: await testCompleteWorkflow()
  }
  
  console.log('\n' + '=' * 50)
  console.log('🏁 GEMINI INTEGRATION TEST RESULTS:')
  console.log(`🤖 Gemini Content Generation: ${results.gemini ? '✅ PASS' : '❌ FAIL'}`)
  console.log(`💰 Budget API: ${results.budget ? '✅ PASS' : '❌ FAIL'}`)
  console.log(`🔄 Workflow Simulation: ${results.workflow ? '✅ PASS' : '❌ FAIL'}`)
  
  const allPass = Object.values(results).every(result => result)
  
  if (allPass) {
    console.log('\n🎉 GEMINI SETUP COMPLETE!')
    console.log('✅ Free AI content generation working')
    console.log('✅ No expensive API costs')
    console.log('✅ Ready for Massachusetts Retirement content')
    console.log('✅ Compatible with n8n workflows')
    
    console.log('\n📋 Next Steps:')
    console.log('1. Import n8n workflows (Option 1 files)')
    console.log('2. Test manual execution in n8n')
    console.log('3. Set up automated scheduling')
    console.log('4. Generate unlimited free content!')
  } else {
    console.log('\n❌ SETUP NEEDS ATTENTION')
    
    if (!results.gemini) {
      console.log('🔧 Fix Gemini API setup:')
      console.log('   - Get API key: https://aistudio.google.com/')
      console.log('   - Add to .env.local: GEMINI_API_KEY=your_key')
      console.log('   - Restart server')
    }
    
    if (!results.budget) {
      console.log('🔧 Fix Budget API:')
      console.log('   - Check CRON_SECRET configuration')
      console.log('   - Verify server is running')
    }
  }
  
  return allPass
}

// Run the tests
runGeminiTests().catch(console.error)
