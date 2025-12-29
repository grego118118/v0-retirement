/**
 * Simple Debug Test
 * Basic test to see response structure
 */

async function testSimpleDebug() {
  console.log('🔍 SIMPLE DEBUG TEST');
  
  const BASE_URL = 'https://www.masspension.com';
  const CRON_SECRET = '462c44a146ca26604411330b9cc568e9cc10a60e09745f4b7e26f8a80983c140';
  
  try {
    const response = await fetch(`${BASE_URL}/api/admin/blog/generate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CRON_SECRET}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        topic: {
          title: 'Simple Debug',
          description: 'Simple test',
          keywords: ['test']
        },
        ai_model: 'gemini-1.5-flash',
        word_count: 100,
        auto_publish: false
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      
      console.log('📝 Full Response:');
      console.log(JSON.stringify(data, null, 2));
      
    } else {
      console.log('❌ Failed:', response.status);
    }
    
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
}

testSimpleDebug();
