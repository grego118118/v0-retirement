// Test Discord webhook independently
// Run with: node test-discord-webhook.js

const DISCORD_WEBHOOKS = {
  'content-review': 'https://discord.com/api/webhooks/1396207186786652290/GJVGuDbZJdxDweZ7ClbXxiE5VcTiVHGtH4kXdTG4gl-cNphF4W84LF9iEOU08wMJEeEq',
  'content-alerts': 'https://discord.com/api/webhooks/1396209486326141059/BwNh_3jFBkv3_B3se7GdbDOmegzfk5P8C6sApMNHReICmaTZiT_IIn02cilQ9QL0yPFq',
  'system-logs': 'https://discord.com/api/webhooks/1396209744640741517/4D-ReB8XliPo2z5HVrBn0lhqjHa2sNl5ZCTSSb12-Hb7lEB820D2nIRV8vNyd_U4gRck'
}

async function testDiscordWebhook(webhookUrl, channelName) {
  try {
    console.log(`🧪 Testing ${channelName} webhook...`)
    
    const payload = {
      content: `🧪 **Test Message from n8n Debug**\n\n✅ Webhook URL is working correctly\n⏰ Time: ${new Date().toLocaleString()}\n🔧 Channel: ${channelName}`
    }

    console.log('📤 Sending payload:', JSON.stringify(payload, null, 2))

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    console.log(`📊 Response Status: ${response.status}`)
    
    if (response.ok) {
      console.log(`✅ ${channelName} webhook working correctly!`)
      return true
    } else {
      const errorText = await response.text()
      console.error(`❌ ${channelName} webhook failed:`, errorText)
      return false
    }

  } catch (error) {
    console.error(`❌ ${channelName} webhook error:`, error.message)
    return false
  }
}

async function testAllWebhooks() {
  console.log('🚀 Testing all Discord webhooks...\n')
  
  for (const [channelName, webhookUrl] of Object.entries(DISCORD_WEBHOOKS)) {
    await testDiscordWebhook(webhookUrl, channelName)
    console.log('') // Empty line between tests
    
    // Wait 1 second between tests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
  
  console.log('🏁 All webhook tests completed!')
}

// Test specific webhook for content generation success
async function testContentGenerationWebhook() {
  console.log('🎯 Testing Content Generation Success Webhook...\n')
  
  const payload = {
    content: `🤖 **AI Content Generated Successfully!**

📝 **Title**: Test Blog Post About Massachusetts Retirement
⭐ **Quality Score**: 87/100
🔍 **Status**: Generated
🎯 **Model**: gpt-4-turbo-preview

📊 **Details**:
- Generated: ${new Date().toLocaleString()}
- Ready for review

🔗 **Review**: https://www.masspension.com/admin/blog/review`
  }

  return await testDiscordWebhook(DISCORD_WEBHOOKS['content-review'], 'content-review')
}

// Run tests
if (process.argv[2] === 'success') {
  testContentGenerationWebhook()
} else {
  testAllWebhooks()
}
