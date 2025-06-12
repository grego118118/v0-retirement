#!/usr/bin/env node

/**
 * OAuth Configuration Test Script
 * 
 * This script tests the OAuth configuration and provides debugging information
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// Load environment variables
function loadEnvFile() {
  const envPath = path.join(process.cwd(), '.env.local');
  
  if (!fs.existsSync(envPath)) {
    console.error('❌ .env.local file not found');
    return {};
  }
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  const env = {};
  
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      env[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
    }
  });
  
  return env;
}

// Test HTTP endpoint
function testEndpoint(url) {
  return new Promise((resolve) => {
    const protocol = url.startsWith('https:') ? https : http;
    
    const req = protocol.get(url, (res) => {
      resolve({
        status: res.statusCode,
        accessible: res.statusCode < 400
      });
    });
    
    req.on('error', () => {
      resolve({
        status: 'ERROR',
        accessible: false
      });
    });
    
    req.setTimeout(5000, () => {
      req.destroy();
      resolve({
        status: 'TIMEOUT',
        accessible: false
      });
    });
  });
}

// Main test function
async function runTests() {
  console.log('🧪 OAuth Configuration Test\n');
  
  // Load environment variables
  const env = loadEnvFile();
  
  console.log('📋 Environment Configuration:');
  console.log(`   NEXTAUTH_URL: ${env.NEXTAUTH_URL || 'NOT SET'}`);
  console.log(`   NEXTAUTH_SECRET: ${env.NEXTAUTH_SECRET ? '✅ SET' : '❌ NOT SET'}`);
  console.log(`   GOOGLE_CLIENT_ID: ${env.GOOGLE_CLIENT_ID ? '✅ SET' : '❌ NOT SET'}`);
  console.log(`   GOOGLE_CLIENT_SECRET: ${env.GOOGLE_CLIENT_SECRET ? '✅ SET' : '❌ NOT SET'}`);
  console.log('');
  
  // Test NextAuth endpoints
  if (env.NEXTAUTH_URL) {
    console.log('🌐 Testing NextAuth Endpoints:');
    
    const endpoints = [
      `${env.NEXTAUTH_URL}/api/auth/providers`,
      `${env.NEXTAUTH_URL}/api/auth/session`,
      `${env.NEXTAUTH_URL}/api/auth/csrf`
    ];
    
    for (const endpoint of endpoints) {
      const result = await testEndpoint(endpoint);
      const status = result.accessible ? '✅' : '❌';
      console.log(`   ${status} ${endpoint} (${result.status})`);
    }
    console.log('');
  }
  
  // Validate OAuth URLs
  console.log('🔗 OAuth URL Validation:');
  
  if (env.NEXTAUTH_URL) {
    const baseUrl = env.NEXTAUTH_URL;
    const googleCallback = `${baseUrl}/api/auth/callback/google`;
    
    console.log(`   Base URL: ${baseUrl}`);
    console.log(`   Google Callback: ${googleCallback}`);
    
    // Check if using IP address
    const url = new URL(baseUrl);
    const isIpAddress = /^\d+\.\d+\.\d+\.\d+$/.test(url.hostname);
    
    if (isIpAddress) {
      console.log('   ⚠️  Using IP address - ensure Google OAuth is configured for this IP');
    } else if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
      console.log('   ✅ Using localhost - standard development configuration');
    }
    
    console.log('');
  }
  
  // Google OAuth Configuration Check
  console.log('🔧 Google OAuth Configuration Requirements:');
  console.log('   Required Authorized JavaScript Origins:');
  
  if (env.NEXTAUTH_URL) {
    console.log(`   - ${env.NEXTAUTH_URL}`);
  }
  console.log('   - http://localhost:3001');
  console.log('   - http://127.0.0.1:3001');
  console.log('');
  
  console.log('   Required Authorized Redirect URIs:');
  if (env.NEXTAUTH_URL) {
    console.log(`   - ${env.NEXTAUTH_URL}/api/auth/callback/google`);
  }
  console.log('   - http://localhost:3001/api/auth/callback/google');
  console.log('   - http://127.0.0.1:3001/api/auth/callback/google');
  console.log('');
  
  // Recommendations
  console.log('💡 Recommendations:');
  
  if (!env.NEXTAUTH_URL) {
    console.log('   ❌ Set NEXTAUTH_URL in .env.local');
  }
  
  if (!env.NEXTAUTH_SECRET) {
    console.log('   ❌ Set NEXTAUTH_SECRET in .env.local');
  }
  
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
    console.log('   ❌ Configure Google OAuth credentials');
  }
  
  if (env.NEXTAUTH_URL && env.NEXTAUTH_URL.includes('3000')) {
    console.log('   ⚠️  NEXTAUTH_URL uses port 3000, but app likely runs on 3001');
  }
  
  console.log('   ✅ Restart development server after configuration changes');
  console.log('   ✅ Clear browser cache/cookies if authentication still fails');
  console.log('');
  
  console.log('🔗 Useful Links:');
  console.log('   Google Cloud Console: https://console.cloud.google.com/');
  console.log('   OAuth Setup Guide: ./docs/oauth-setup.md');
}

if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { loadEnvFile, testEndpoint };
