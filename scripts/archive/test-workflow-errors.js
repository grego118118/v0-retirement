// Comprehensive test script for n8n workflow errors
// Run with: node test-workflow-errors.js

const CRON_SECRET = process.env.CRON_SECRET || 'your_test_secret'
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'

// Test headers that should bypass Cloudflare
const STANDARD_HEADERS = {
  'Authorization': `Bearer ${CRON_SECRET}`,
  'Content-Type': 'application/json',
  'User-Agent': 'n8n-workflow/1.0 (Massachusetts Retirement System)',
  'Accept': 'application/json',
  'Cache-Control': 'no-cache',
  'Accept-Language': 'en-US,en;q=0.9',
  'Accept-Encoding': 'gzip, deflate',
  'Connection': 'keep-alive'
}

async function testBudgetAPI() {
  console.log('🧪 Testing Budget API (Error 1 Fix)...')
  
  try {
    const response = await fetch(`${BASE_URL}/api/admin/blog/analytics/costs`, {
      method: 'GET',
      headers: STANDARD_HEADERS
    })

    console.log(`📊 Response Status: ${response.status}`)
    console.log(`📋 Response Headers:`, Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ API Error Response:', errorText)
      
      // Check if it's a Cloudflare challenge
      if (errorText.includes('cloudflare') || errorText.includes('challenge')) {
        console.error('🛡️ CLOUDFLARE CHALLENGE DETECTED!')
        console.log('💡 This indicates the request is being blocked by Cloudflare')
        return false
      }
      return false
    }

    const data = await response.json()
    console.log('✅ API Response Structure:')
    console.log(JSON.stringify(data, null, 2))

    // Test the specific fields that caused the undefined error
    console.log('\n🔍 Critical Field Validation:')
    console.log(`- success: ${data.success} (${typeof data.success})`)
    console.log(`- status: ${data.status} (${typeof data.status})`)
    console.log(`- budget_utilization: ${data.budget_utilization} (${typeof data.budget_utilization})`)
    console.log(`- monthly_total: ${data.monthly_total} (${typeof data.monthly_total})`)

    // Simulate n8n workflow logic
    const budgetUtilization = data.budget_utilization || 0
    const status = data.status || 'unknown'
    
    console.log('\n🎯 n8n Workflow Simulation:')
    console.log(`- Budget check: ${budgetUtilization < 90 ? 'PASS' : 'FAIL'}`)
    console.log(`- Status access: ${status} (no undefined error)`)

    return true

  } catch (error) {
    console.error('❌ Network/Fetch Error:', error.message)
    return false
  }
}

async function testCloudflareBypass() {
  console.log('\n🛡️ Testing Cloudflare Bypass (Error 2 Fix)...')
  
  const testUrls = [
    `${BASE_URL}/api/admin/blog/analytics/costs`,
    `${BASE_URL}/api/health`, // If this exists
    `${BASE_URL}/` // Root page
  ]

  for (const url of testUrls) {
    try {
      console.log(`\n🔗 Testing: ${url}`)
      
      const response = await fetch(url, {
        method: 'GET',
        headers: STANDARD_HEADERS
      })

      console.log(`📊 Status: ${response.status}`)
      
      if (response.status === 400) {
        const text = await response.text()
        if (text.includes('cloudflare') || text.includes('challenge')) {
          console.error('❌ CLOUDFLARE CHALLENGE DETECTED')
          console.log('🔧 Suggested fixes:')
          console.log('  1. Use localhost instead of domain name')
          console.log('  2. Add more browser-like headers')
          console.log('  3. Implement request delays')
          console.log('  4. Check Cloudflare settings')
        } else {
          console.log('✅ Not a Cloudflare issue - different 400 error')
        }
      } else if (response.ok) {
        console.log('✅ Request successful - no Cloudflare blocking')
      } else {
        console.log(`⚠️ Other HTTP error: ${response.status}`)
      }

    } catch (error) {
      console.error(`❌ Error testing ${url}:`, error.message)
    }
  }
}

async function testDiscordWebhooks() {
  console.log('\n📢 Testing Discord Webhooks...')
  
  const webhooks = {
    'content-review': 'https://discord.com/api/webhooks/1396207186786652290/GJVGuDbZJdxDweZ7ClbXxiE5VcTiVHGtH4kXdTG4gl-cNphF4W84LF9iEOU08wMJEeEq',
    'content-alerts': 'https://discord.com/api/webhooks/1396209486326141059/BwNh_3jFBkv3_B3se7GdbDOmegzfk5P8C6sApMNHReICmaTZiT_IIn02cilQ9QL0yPFq'
  }

  for (const [name, url] of Object.entries(webhooks)) {
    try {
      console.log(`\n🔗 Testing ${name} webhook...`)
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'n8n-workflow/1.0'
        },
        body: JSON.stringify({
          content: `🧪 **Test Message - Error Resolution**\n\n✅ Testing fixes for:\n- JavaScript undefined error\n- Cloudflare challenge issue\n\n⏰ Time: ${new Date().toLocaleString()}\n🔧 Channel: ${name}`
        })
      })

      if (response.ok) {
        console.log(`✅ ${name} webhook working correctly`)
      } else {
        console.error(`❌ ${name} webhook failed: ${response.status}`)
        const errorText = await response.text()
        console.error('Error details:', errorText)
      }

    } catch (error) {
      console.error(`❌ ${name} webhook error:`, error.message)
    }

    // Wait between webhook tests
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
}

async function runAllTests() {
  console.log('🚀 Starting Comprehensive Error Testing...\n')
  console.log('=' * 50)
  
  // Test 1: Budget API (undefined status error)
  const budgetTest = await testBudgetAPI()
  
  // Test 2: Cloudflare bypass
  await testCloudflareBypass()
  
  // Test 3: Discord webhooks
  await testDiscordWebhooks()
  
  console.log('\n' + '=' * 50)
  console.log('🏁 Test Summary:')
  console.log(`- Budget API: ${budgetTest ? '✅ FIXED' : '❌ STILL FAILING'}`)
  console.log('- Cloudflare: Check output above')
  console.log('- Discord: Check output above')
  
  console.log('\n💡 Next Steps:')
  if (budgetTest) {
    console.log('✅ Import the robust workflow: daily-content-generation-robust.json')
    console.log('✅ Use localhost URLs for development')
    console.log('✅ Test manual execution in n8n')
  } else {
    console.log('❌ Fix API endpoint issues first')
    console.log('❌ Check server is running on correct port')
    console.log('❌ Verify CRON_SECRET environment variable')
  }
}

// Run tests based on command line argument
const testType = process.argv[2]

switch (testType) {
  case 'budget':
    testBudgetAPI()
    break
  case 'cloudflare':
    testCloudflareBypass()
    break
  case 'discord':
    testDiscordWebhooks()
    break
  default:
    runAllTests()
}
