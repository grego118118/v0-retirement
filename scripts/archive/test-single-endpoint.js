/**
 * Test Single API Endpoint
 * Quick test to verify if blog routing is working
 */

async function testSingleEndpoint() {
  console.log('🧪 Testing Single Blog API Endpoint\n')
  
  const baseUrl = 'https://masspension.com'
  
  try {
    // Test the simple blog test endpoint
    console.log('📂 Testing GET /api/blog/test...')
    const testResponse = await fetch(`${baseUrl}/api/blog/test`)
    console.log(`   Status: ${testResponse.status}`)
    
    if (testResponse.ok) {
      const testData = await testResponse.json()
      console.log('   ✅ Blog routing is working!')
      console.log(`   📊 Response: ${JSON.stringify(testData, null, 2)}`)
    } else {
      const errorText = await testResponse.text()
      console.log(`   ❌ Blog test endpoint failed: ${errorText}`)
    }
    
    // Test categories endpoint
    console.log('\n📂 Testing GET /api/blog/categories...')
    const categoriesResponse = await fetch(`${baseUrl}/api/blog/categories`)
    console.log(`   Status: ${categoriesResponse.status}`)
    
    if (categoriesResponse.ok) {
      const categoriesData = await categoriesResponse.json()
      console.log('   ✅ Categories endpoint working!')
      console.log(`   📊 Categories found: ${categoriesData.total || 0}`)
    } else {
      const errorText = await categoriesResponse.text()
      console.log(`   ❌ Categories endpoint error: ${errorText}`)
    }
    
    // Test posts endpoint
    console.log('\n📝 Testing GET /api/blog/posts...')
    const postsResponse = await fetch(`${baseUrl}/api/blog/posts`)
    console.log(`   Status: ${postsResponse.status}`)
    
    if (postsResponse.ok) {
      const postsData = await postsResponse.json()
      console.log('   ✅ Posts endpoint working!')
      console.log(`   📊 Posts found: ${postsData.pagination?.total || 0}`)
    } else {
      const errorText = await postsResponse.text()
      console.log(`   ❌ Posts endpoint error: ${errorText}`)
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message)
  }
}

// Run test
testSingleEndpoint()
