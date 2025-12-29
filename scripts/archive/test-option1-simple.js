// Simple test for Option 1 authentication
// Run with: node test-option1-simple.js

const BASE_URL = 'http://localhost:3000'
const CRON_SECRET = '462c44a146ca26604411330b9cc568e9cc10a60e09745f4b7e26f8a80983c140'

async function testBudgetAPI() {
  console.log('🔐 Testing Option 1: Hard-coded CRON_SECRET Authentication')
  console.log('=' * 60)
  
  try {
    const response = await fetch(`${BASE_URL}/api/admin/blog/analytics/costs`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${CRON_SECRET}`,
        'Content-Type': 'application/json',
        'User-Agent': 'n8n-workflow/1.0 (Massachusetts Retirement System)'
      }
    })

    console.log(`📊 Response Status: ${response.status}`)
    
    if (response.ok) {
      const data = await response.json()
      console.log('✅ AUTHENTICATION SUCCESSFUL!')
      console.log('\n📋 API Response:')
      console.log(`- Success: ${data.success}`)
      console.log(`- Budget Utilization: ${data.budget_utilization}%`)
      console.log(`- Monthly Total: $${data.monthly_total}`)
      console.log(`- Remaining Budget: $${data.remaining_budget}`)
      console.log(`- Posts Generated: ${data.posts_generated}`)
      
      console.log('\n🎯 OPTION 1 STATUS: ✅ READY FOR N8N!')
      console.log('\n📋 Next Steps:')
      console.log('1. Import workflow: daily-content-generation-option1.json')
      console.log('2. Test manual execution in n8n')
      console.log('3. Verify Discord notifications work')
      console.log('4. Update URLs for production deployment')
      
      return true
    } else {
      const errorText = await response.text()
      console.log('❌ AUTHENTICATION FAILED!')
      console.log(`Error: ${errorText}`)
      
      if (response.status === 401) {
        console.log('\n🔧 Troubleshooting:')
        console.log('- Check CRON_SECRET in .env.local')
        console.log('- Verify server is running')
        console.log('- Ensure auth import fix is applied')
      }
      
      return false
    }
  } catch (error) {
    console.log('❌ CONNECTION ERROR!')
    console.log(`Error: ${error.message}`)
    console.log('\n🔧 Troubleshooting:')
    console.log('- Check if server is running on port 3000')
    console.log('- Verify network connectivity')
    return false
  }
}

async function testDiscordWebhook() {
  console.log('\n📢 Testing Discord Integration...')
  
  try {
    const response = await fetch('https://discord.com/api/webhooks/1396207186786652290/GJVGuDbZJdxDweZ7ClbXxiE5VcTiVHGtH4kXdTG4gl-cNphF4W84LF9iEOU08wMJEeEq', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        content: `✅ **Option 1 Authentication Test**\n\n🔐 Hard-coded CRON_SECRET working correctly\n⏰ Time: ${new Date().toLocaleString()}\n🚀 Ready for n8n workflow import!`
      })
    })

    if (response.ok) {
      console.log('✅ Discord webhook working!')
      return true
    } else {
      console.log('❌ Discord webhook failed')
      return false
    }
  } catch (error) {
    console.log('❌ Discord webhook error:', error.message)
    return false
  }
}

async function runSimpleTest() {
  const budgetTest = await testBudgetAPI()
  const discordTest = await testDiscordWebhook()
  
  console.log('\n' + '=' * 60)
  console.log('🏁 FINAL RESULTS:')
  console.log(`🔐 Budget API Authentication: ${budgetTest ? '✅ PASS' : '❌ FAIL'}`)
  console.log(`📢 Discord Integration: ${discordTest ? '✅ PASS' : '❌ FAIL'}`)
  
  if (budgetTest && discordTest) {
    console.log('\n🎉 OPTION 1 FULLY FUNCTIONAL!')
    console.log('✅ Authentication working')
    console.log('✅ Discord notifications working')
    console.log('✅ Ready for n8n workflow import')
  } else if (budgetTest) {
    console.log('\n⚠️ OPTION 1 PARTIALLY FUNCTIONAL')
    console.log('✅ Authentication working')
    console.log('❌ Discord needs attention')
  } else {
    console.log('\n❌ OPTION 1 NEEDS FIXES')
    console.log('❌ Authentication not working')
  }
  
  return budgetTest && discordTest
}

runSimpleTest().catch(console.error)
