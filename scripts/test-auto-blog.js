#!/usr/bin/env node
/**
 * Test Script for AI Blog Generation
 * 
 * Usage:
 *   node scripts/test-auto-blog.js [local|production]
 * 
 * Examples:
 *   node scripts/test-auto-blog.js local      # Test localhost:3000
 *   node scripts/test-auto-blog.js production # Test Vercel production
 *   node scripts/test-auto-blog.js            # Defaults to local
 */

const CRON_SECRET = process.env.CRON_SECRET || 'mass-retirement-cron-2024-secure'
const LOCAL_URL = 'http://localhost:3000/api/cron/auto-blog'
const PRODUCTION_URL = process.env.PRODUCTION_URL || 'https://masspension.com/api/cron/auto-blog'

async function testAutoBlog(environment = 'local') {
  const url = environment === 'production' ? PRODUCTION_URL : LOCAL_URL
  
  console.log('🚀 AI Blog Generation Test')
  console.log('=' .repeat(50))
  console.log(`📍 Environment: ${environment}`)
  console.log(`🔗 URL: ${url}`)
  console.log(`🔑 Using CRON_SECRET: ${CRON_SECRET.substring(0, 10)}...`)
  console.log('=' .repeat(50))
  console.log('')
  
  try {
    console.log('⏳ Triggering AI blog generation...')
    const startTime = Date.now()
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${CRON_SECRET}`,
        'Content-Type': 'application/json'
      }
    })
    
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2)
    console.log(`⏱️  Response received in ${elapsed}s`)
    console.log(`📊 Status: ${response.status} ${response.statusText}`)
    console.log('')
    
    const data = await response.json()
    
    if (response.ok) {
      console.log('✅ SUCCESS!')
      console.log('-'.repeat(50))
      console.log('📝 Generated Post Details:')
      console.log(JSON.stringify(data, null, 2))
      
      if (data.post) {
        console.log('')
        console.log('📌 Quick Summary:')
        console.log(`   Title: ${data.post.title}`)
        console.log(`   ID: ${data.post.id}`)
        console.log(`   Status: ${data.post.status}`)
        console.log('')
        console.log('👉 Next Steps:')
        console.log('   1. Review the draft post in your admin panel')
        console.log('   2. Fact-check the AI-generated content')
        console.log('   3. Publish when ready')
      }
    } else {
      console.log('❌ FAILED!')
      console.log('-'.repeat(50))
      console.log('Error Response:')
      console.log(JSON.stringify(data, null, 2))
      
      // Provide helpful troubleshooting
      if (response.status === 401) {
        console.log('')
        console.log('🔧 Troubleshooting:')
        console.log('   - Check CRON_SECRET environment variable')
        console.log('   - Ensure the secret matches between client and server')
      } else if (response.status === 500) {
        console.log('')
        console.log('🔧 Troubleshooting:')
        console.log('   - Check GEMINI_API_KEY is set correctly')
        console.log('   - Check Supabase connection (SUPABASE_SERVICE_ROLE_KEY)')
        console.log('   - Check server logs for detailed error')
      }
    }
    
  } catch (error) {
    console.log('❌ CONNECTION FAILED!')
    console.log('-'.repeat(50))
    console.log(`Error: ${error.message}`)
    console.log('')
    console.log('🔧 Troubleshooting:')
    
    if (environment === 'local') {
      console.log('   - Is the dev server running? Run: npm run dev')
      console.log('   - Is it running on port 3000?')
    } else {
      console.log('   - Is the production URL correct?')
      console.log('   - Is the site deployed and accessible?')
    }
  }
  
  console.log('')
  console.log('=' .repeat(50))
  console.log('Test completed at:', new Date().toISOString())
}

// Parse command line argument
const environment = process.argv[2] || 'local'
if (!['local', 'production'].includes(environment)) {
  console.log('Usage: node scripts/test-auto-blog.js [local|production]')
  process.exit(1)
}

testAutoBlog(environment)

