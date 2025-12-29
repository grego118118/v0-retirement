// Test script for n8n free version authentication methods
// Run with: node test-n8n-free-authentication.js

const BASE_URL = 'http://localhost:3000'
const CRON_SECRET = '462c44a146ca26604411330b9cc568e9cc10a60e09745f4b7e26f8a80983c140'
const SIMPLE_API_KEY = 'mass-pension-n8n-2024'

async function testMethod1_HardcodedSecret() {
  console.log('🔐 Testing Method 1: Hard-coded CRON_SECRET...')
  
  try {
    const response = await fetch(`${BASE_URL}/api/admin/blog/analytics/costs`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${CRON_SECRET}`,
        'Content-Type': 'application/json',
        'User-Agent': 'n8n-workflow/1.0 (Massachusetts Retirement System)'
      }
    })

    console.log(`📊 Status: ${response.status}`)
    
    if (response.ok) {
      const data = await response.json()
      console.log('✅ Method 1 SUCCESS!')
      console.log(`📈 Budget Utilization: ${data.budget_utilization}%`)
      console.log(`💰 Monthly Total: $${data.monthly_total}`)
      console.log(`📝 Posts Generated: ${data.posts_generated}`)
      return true
    } else {
      const errorText = await response.text()
      console.log('❌ Method 1 FAILED:', errorText)
      return false
    }
  } catch (error) {
    console.log('❌ Method 1 ERROR:', error.message)
    return false
  }
}

async function testMethod2_SimpleEndpoint() {
  console.log('\n🌐 Testing Method 2: Simple Public Endpoint...')
  
  const testCases = [
    {
      name: 'Query Parameter Auth',
      url: `${BASE_URL}/api/public/blog/budget?key=${SIMPLE_API_KEY}`,
      headers: {
        'User-Agent': 'n8n-workflow/1.0'
      }
    },
    {
      name: 'Header Auth',
      url: `${BASE_URL}/api/public/blog/budget`,
      headers: {
        'X-API-Key': SIMPLE_API_KEY,
        'User-Agent': 'n8n-workflow/1.0'
      }
    },
    {
      name: 'User-Agent Auth',
      url: `${BASE_URL}/api/public/blog/budget`,
      headers: {
        'User-Agent': 'n8n-workflow/1.0 (Massachusetts Retirement System)'
      }
    }
  ]

  let successCount = 0
  
  for (const testCase of testCases) {
    try {
      console.log(`\n🧪 Testing: ${testCase.name}`)
      
      const response = await fetch(testCase.url, {
        method: 'GET',
        headers: testCase.headers
      })

      console.log(`📊 Status: ${response.status}`)
      
      if (response.ok) {
        const data = await response.json()
        console.log(`✅ ${testCase.name} SUCCESS!`)
        console.log(`📈 Budget Utilization: ${data.budget_utilization}%`)
        console.log(`🚦 Can Generate Content: ${data.can_generate_content}`)
        successCount++
      } else {
        const errorText = await response.text()
        console.log(`❌ ${testCase.name} FAILED:`, errorText)
      }
    } catch (error) {
      console.log(`❌ ${testCase.name} ERROR:`, error.message)
    }
  }
  
  return successCount > 0
}

async function testRateLimiting() {
  console.log('\n⏱️ Testing Rate Limiting...')
  
  const requests = []
  for (let i = 0; i < 5; i++) {
    requests.push(
      fetch(`${BASE_URL}/api/public/blog/budget?key=${SIMPLE_API_KEY}`, {
        headers: { 'User-Agent': 'rate-limit-test' }
      })
    )
  }
  
  try {
    const responses = await Promise.all(requests)
    const statuses = responses.map(r => r.status)
    
    console.log('📊 Response statuses:', statuses)
    
    if (statuses.every(s => s === 200)) {
      console.log('✅ Rate limiting allows normal usage')
    } else if (statuses.some(s => s === 429)) {
      console.log('⚠️ Rate limiting active (some requests blocked)')
    } else {
      console.log('❓ Unexpected rate limiting behavior')
    }
  } catch (error) {
    console.log('❌ Rate limiting test error:', error.message)
  }
}

async function testN8nWorkflowSimulation() {
  console.log('\n🤖 Testing n8n Workflow Simulation...')
  
  try {
    // Step 1: Check budget (like n8n would)
    console.log('Step 1: Checking budget...')
    const budgetResponse = await fetch(`${BASE_URL}/api/public/blog/budget?key=${SIMPLE_API_KEY}`, {
      headers: {
        'User-Agent': 'n8n-workflow/1.0',
        'X-API-Key': SIMPLE_API_KEY
      }
    })
    
    if (!budgetResponse.ok) {
      console.log('❌ Budget check failed')
      return false
    }
    
    const budgetData = await budgetResponse.json()
    console.log(`✅ Budget check: ${budgetData.budget_utilization}% used`)
    
    // Step 2: Decision logic (like n8n IF node)
    if (!budgetData.can_generate_content) {
      console.log('🚫 Budget limit reached - would skip content generation')
      return true
    }
    
    // Step 3: Generate content (like n8n would)
    console.log('Step 2: Generating content...')
    const contentResponse = await fetch(`${BASE_URL}/api/admin/blog/generate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CRON_SECRET}`,
        'Content-Type': 'application/json',
        'User-Agent': 'n8n-workflow/1.0'
      },
      body: JSON.stringify({
        topic_category: 'retirement_planning',
        target_audience: 'massachusetts_employees',
        workflow_source: 'n8n_test'
      })
    })
    
    console.log(`📊 Content generation status: ${contentResponse.status}`)
    
    if (contentResponse.ok) {
      console.log('✅ Full n8n workflow simulation successful!')
      return true
    } else {
      const errorText = await contentResponse.text()
      console.log('⚠️ Content generation failed:', errorText)
      return false
    }
    
  } catch (error) {
    console.log('❌ Workflow simulation error:', error.message)
    return false
  }
}

async function runAllTests() {
  console.log('🚀 Testing n8n Free Version Authentication Methods')
  console.log('=' * 60)
  
  const results = {
    method1: await testMethod1_HardcodedSecret(),
    method2: await testMethod2_SimpleEndpoint(),
    rateLimiting: await testRateLimiting(),
    workflowSim: await testN8nWorkflowSimulation()
  }
  
  console.log('\n' + '=' * 60)
  console.log('📋 TEST SUMMARY:')
  console.log(`🔐 Method 1 (Hard-coded Secret): ${results.method1 ? '✅ PASS' : '❌ FAIL'}`)
  console.log(`🌐 Method 2 (Simple Endpoint): ${results.method2 ? '✅ PASS' : '❌ FAIL'}`)
  console.log(`⏱️ Rate Limiting: ✅ TESTED`)
  console.log(`🤖 Workflow Simulation: ${results.workflowSim ? '✅ PASS' : '❌ FAIL'}`)
  
  console.log('\n💡 RECOMMENDATIONS:')
  if (results.method1 && results.method2) {
    console.log('✅ Both authentication methods work!')
    console.log('🔐 Use Method 1 for maximum security')
    console.log('🌐 Use Method 2 for easier setup')
  } else if (results.method1) {
    console.log('🔐 Use Method 1 (hard-coded secret) - it\'s working')
  } else if (results.method2) {
    console.log('🌐 Use Method 2 (simple endpoint) - it\'s working')
  } else {
    console.log('❌ Both methods failed - check server and configuration')
  }
  
  console.log('\n🔧 NEXT STEPS:')
  console.log('1. Import the modified workflow: daily-content-generation-free.json')
  console.log('2. Update URLs to match your environment (localhost vs production)')
  console.log('3. Test manual execution in n8n interface')
  console.log('4. Set up Discord webhooks for notifications')
}

// Run tests
runAllTests().catch(console.error)
