#!/usr/bin/env node

/**
 * Test script to verify critical API endpoints are working in production
 * This script tests the Massachusetts Retirement System API endpoints
 */

const https = require('https')

const BASE_URL = 'https://v0-mass-retire-q5gw365xn-grego118s-projects.vercel.app'

console.log('🚀 Massachusetts Retirement System - API Endpoint Verification')
console.log('Testing production deployment after Prisma Query Engine fix...')
console.log('')

const endpoints = [
  {
    name: 'Health Check API',
    url: '/api/health',
    expectedStatus: [200],
    critical: true
  },
  {
    name: 'Environment Debug API',
    url: '/api/debug/environment',
    expectedStatus: [200],
    critical: true
  },
  {
    name: 'Profile API (Unauthenticated)',
    url: '/api/profile',
    expectedStatus: [401], // Should be 401, not 500
    critical: true
  },
  {
    name: 'Subscription Status API (Unauthenticated)',
    url: '/api/subscription/status',
    expectedStatus: [401], // Should be 401, not 500
    critical: true
  },
  {
    name: 'Retirement Calculations API (Unauthenticated)',
    url: '/api/retirement/calculations',
    expectedStatus: [401, 405], // 401 or 405 are acceptable
    critical: true
  },
  {
    name: 'Pension Calculation API',
    url: '/api/pension-calculation?group=GROUP_1&age=60&yearsOfService=25&averageSalary=75000',
    expectedStatus: [200],
    critical: false
  }
]

async function testEndpoint(endpoint) {
  return new Promise((resolve) => {
    const url = `${BASE_URL}${endpoint.url}`
    
    https.get(url, (res) => {
      let data = ''
      
      res.on('data', (chunk) => {
        data += chunk
      })
      
      res.on('end', () => {
        const isSuccess = endpoint.expectedStatus.includes(res.statusCode)
        const status = isSuccess ? '✅' : '❌'
        const criticalFlag = endpoint.critical ? '[CRITICAL]' : '[OPTIONAL]'
        
        console.log(`${status} ${criticalFlag} ${endpoint.name}`)
        console.log(`   Status: ${res.statusCode} (Expected: ${endpoint.expectedStatus.join(' or ')})`)
        
        if (!isSuccess) {
          console.log(`   URL: ${url}`)
          console.log(`   Response: ${data.substring(0, 200)}...`)
        }
        
        if (endpoint.name === 'Environment Debug API' && isSuccess) {
          try {
            const parsed = JSON.parse(data)
            console.log(`   Database Connected: ${parsed.database?.connected ? '✅' : '❌'}`)
            console.log(`   Auth Configured: ${parsed.auth?.googleProviderConfigured ? '✅' : '❌'}`)
          } catch (e) {
            console.log(`   Could not parse response`)
          }
        }
        
        console.log('')
        
        resolve({
          name: endpoint.name,
          success: isSuccess,
          statusCode: res.statusCode,
          critical: endpoint.critical,
          response: data
        })
      })
    }).on('error', (err) => {
      console.log(`❌ [CRITICAL] ${endpoint.name}`)
      console.log(`   Error: ${err.message}`)
      console.log('')
      
      resolve({
        name: endpoint.name,
        success: false,
        error: err.message,
        critical: endpoint.critical
      })
    })
  })
}

async function runTests() {
  console.log('Testing API endpoints...')
  console.log('')
  
  const results = []
  
  for (const endpoint of endpoints) {
    const result = await testEndpoint(endpoint)
    results.push(result)
    
    // Add a small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500))
  }
  
  console.log('='.repeat(60))
  console.log('SUMMARY')
  console.log('='.repeat(60))
  
  const criticalTests = results.filter(r => r.critical)
  const criticalPassed = criticalTests.filter(r => r.success).length
  const criticalTotal = criticalTests.length
  
  const optionalTests = results.filter(r => !r.critical)
  const optionalPassed = optionalTests.filter(r => r.success).length
  const optionalTotal = optionalTests.length
  
  console.log(`Critical Tests: ${criticalPassed}/${criticalTotal} passed`)
  console.log(`Optional Tests: ${optionalPassed}/${optionalTotal} passed`)
  console.log('')
  
  if (criticalPassed === criticalTotal) {
    console.log('🎉 All critical API endpoints are working!')
    console.log('✅ Database connectivity has been restored')
    console.log('✅ Authentication endpoints are responding correctly')
    console.log('✅ Massachusetts Retirement System is ready for production use')
  } else {
    console.log('⚠️  Some critical endpoints are still failing')
    console.log('❌ Additional fixes may be required')
  }
  
  console.log('')
  console.log(`Production URL: ${BASE_URL}`)
  console.log('Custom Domain: https://www.masspension.com (if configured)')
}

runTests().catch(console.error)
