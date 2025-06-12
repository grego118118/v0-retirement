#!/usr/bin/env node

/**
 * OAuth IP Address Fix Script
 * 
 * This script helps configure OAuth settings for IP address access
 * Run this when you need to switch between localhost and IP address access
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

// Get local IP addresses
function getLocalIpAddresses() {
  const interfaces = os.networkInterfaces();
  const addresses = [];
  
  for (const name of Object.keys(interfaces)) {
    for (const interface of interfaces[name]) {
      if (interface.family === 'IPv4' && !interface.internal) {
        addresses.push(interface.address);
      }
    }
  }
  
  return addresses;
}

// Update .env.local file
function updateEnvFile(baseUrl) {
  const envPath = path.join(process.cwd(), '.env.local');
  
  if (!fs.existsSync(envPath)) {
    console.error('❌ .env.local file not found');
    return false;
  }
  
  let envContent = fs.readFileSync(envPath, 'utf8');
  
  // Update NEXTAUTH_URL
  envContent = envContent.replace(
    /NEXTAUTH_URL=.*/,
    `NEXTAUTH_URL=${baseUrl}`
  );
  
  fs.writeFileSync(envPath, envContent);
  console.log(`✅ Updated NEXTAUTH_URL to: ${baseUrl}`);
  return true;
}

// Main function
function main() {
  console.log('🔧 OAuth IP Address Configuration Tool\n');
  
  const args = process.argv.slice(2);
  const command = args[0];
  
  if (command === 'localhost') {
    updateEnvFile('http://localhost:3001');
    console.log('\n📝 Next steps:');
    console.log('1. Restart your development server: npm run dev');
    console.log('2. Access your app at: http://localhost:3001');
    
  } else if (command === 'ip') {
    const ipAddresses = getLocalIpAddresses();
    
    if (ipAddresses.length === 0) {
      console.error('❌ No local IP addresses found');
      return;
    }
    
    console.log('🌐 Available IP addresses:');
    ipAddresses.forEach((ip, index) => {
      console.log(`${index + 1}. ${ip}`);
    });
    
    const selectedIp = args[1] || ipAddresses[0];
    const baseUrl = `http://${selectedIp}:3001`;
    
    updateEnvFile(baseUrl);
    
    console.log('\n📝 Next steps:');
    console.log('1. Update Google OAuth configuration:');
    console.log('   - Go to: https://console.cloud.google.com/');
    console.log('   - Add to Authorized JavaScript origins:', baseUrl);
    console.log('   - Add to Authorized redirect URIs:', `${baseUrl}/api/auth/callback/google`);
    console.log('2. Restart your development server: npm run dev');
    console.log(`3. Access your app at: ${baseUrl}`);
    
  } else {
    console.log('Usage:');
    console.log('  node scripts/fix-oauth-ip.js localhost    # Configure for localhost access');
    console.log('  node scripts/fix-oauth-ip.js ip          # Configure for IP address access');
    console.log('  node scripts/fix-oauth-ip.js ip 10.0.0.119  # Configure for specific IP');
    console.log('\nCurrent local IP addresses:');
    getLocalIpAddresses().forEach(ip => console.log(`  - ${ip}`));
  }
}

if (require.main === module) {
  main();
}

module.exports = { getLocalIpAddresses, updateEnvFile };
