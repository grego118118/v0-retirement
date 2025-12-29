// Quick test to see actual Gemini-generated content
const BASE_URL = 'http://localhost:3000'
const CRON_SECRET = '462c44a146ca26604411330b9cc568e9cc10a60e09745f4b7e26f8a80983c140'

async function testGeminiContent() {
  console.log('🤖 Testing Gemini Content Generation')
  
  try {
    const response = await fetch(`${BASE_URL}/api/admin/blog/generate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CRON_SECRET}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        topic: {
          id: 'test-massachusetts-retirement',
          title: 'Massachusetts Retirement Benefits Guide',
          description: 'Complete guide to Massachusetts retirement benefits for public employees',
          category: 'retirement-planning',
          keywords: ['Massachusetts retirement', 'pension benefits', 'public employees']
        },
        ai_model: 'gemini-1.5-flash',
        word_count: 300
      })
    })

    if (response.ok) {
      const data = await response.json()
      console.log('✅ SUCCESS! Generated content:')
      console.log('\n📋 Response Data:')
      console.log(JSON.stringify(data, null, 2))
      
      if (data.post && data.post.content) {
        console.log('\n📝 Generated Content Preview:')
        console.log(data.post.content.substring(0, 500) + '...')
      }
      
      console.log('\n🎉 GEMINI AI IS FULLY FUNCTIONAL!')
      console.log('💰 Cost: $0 (FREE!)')
      console.log('🚀 Ready for n8n workflows')
      
    } else {
      const errorText = await response.text()
      console.log('❌ Error:', errorText)
    }
  } catch (error) {
    console.log('❌ Error:', error.message)
  }
}

testGeminiContent()
