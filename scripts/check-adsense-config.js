#!/usr/bin/env node

/**
 * AdSense Configuration Checker
 * 
 * This script checks the current AdSense configuration and identifies
 * placeholder ad slot IDs that prevent manual ads from displaying.
 */

const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  reset: '\x1b[0m',
  bright: '\x1b[1m'
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkAdSenseConfig() {
  log('cyan', '\n🔍 AdSense Configuration Checker\n');
  
  // Check environment files
  const envFiles = [
    '.env.production',
    '.env.local',
    '.env'
  ];

  let foundConfig = false;
  const placeholderIds = ['1234567890', '2345678901', '3456789012', '4567890123'];
  const issues = [];
  const config = {};

  for (const envFile of envFiles) {
    const envPath = path.join(process.cwd(), envFile);
    if (fs.existsSync(envPath)) {
      log('blue', `📄 Checking ${envFile}...`);
      foundConfig = true;
      
      const content = fs.readFileSync(envPath, 'utf8');
      const lines = content.split('\n');
      
      for (const line of lines) {
        if (line.startsWith('NEXT_PUBLIC_ADSENSE_')) {
          const [key, value] = line.split('=');
          if (value) {
            config[key] = value;
            
            // Check for placeholder IDs
            if (placeholderIds.includes(value)) {
              issues.push({
                file: envFile,
                key,
                value,
                type: 'placeholder'
              });
            }
          }
        }
      }
    }
  }

  if (!foundConfig) {
    log('red', '❌ No environment files found!');
    return;
  }

  // Display current configuration
  log('bright', '\n📋 Current AdSense Configuration:');
  console.log('');
  
  Object.entries(config).forEach(([key, value]) => {
    const isPlaceholder = placeholderIds.includes(value);
    const color = isPlaceholder ? 'red' : 'green';
    const status = isPlaceholder ? '❌ PLACEHOLDER' : '✅ REAL ID';
    
    log(color, `  ${key}: ${value} ${status}`);
  });

  // Display issues
  if (issues.length > 0) {
    log('red', '\n🚨 ISSUES DETECTED:');
    console.log('');
    
    issues.forEach(issue => {
      log('red', `  ❌ ${issue.key} in ${issue.file} is using placeholder ID: ${issue.value}`);
    });

    log('yellow', '\n⚠️  IMPACT:');
    log('yellow', '   Manual ad components will show "Advertisement space" placeholders');
    log('yellow', '   instead of actual Google AdSense ads.');
    
    log('cyan', '\n🔧 SOLUTION:');
    log('cyan', '   1. Access Google AdSense dashboard');
    log('cyan', '   2. Create real ad units for each type');
    log('cyan', '   3. Update environment variables with real ad unit IDs');
    log('cyan', '   4. Redeploy the application');
    
    log('blue', '\n📖 For detailed instructions, see: ADSENSE_PLACEHOLDER_FIX.md');
    
  } else {
    log('green', '\n✅ All ad slot IDs appear to be real (not placeholders)');
    log('green', '   If ads still aren\'t showing, check:');
    log('green', '   - AdSense account approval status');
    log('green', '   - Ad unit configuration in AdSense dashboard');
    log('green', '   - Browser console for errors');
  }

  // Check for Auto Ads configuration
  log('bright', '\n🤖 Auto Ads Configuration:');
  const publisherId = config['NEXT_PUBLIC_ADSENSE_PUBLISHER_ID'];
  if (publisherId) {
    log('green', `  ✅ Publisher ID: ${publisherId}`);
    log('blue', '     Auto Ads should work with just the publisher ID');
  } else {
    log('red', '  ❌ No publisher ID found');
  }

  // Check ads.txt file
  log('bright', '\n📄 ads.txt File Check:');
  const adsTxtPath = path.join(process.cwd(), 'public', 'ads.txt');
  if (fs.existsSync(adsTxtPath)) {
    const adsTxtContent = fs.readFileSync(adsTxtPath, 'utf8');
    if (adsTxtContent.includes(publisherId)) {
      log('green', '  ✅ ads.txt file exists and contains correct publisher ID');
    } else {
      log('yellow', '  ⚠️  ads.txt file exists but may not contain correct publisher ID');
    }
  } else {
    log('red', '  ❌ ads.txt file not found in public/ directory');
  }

  console.log('');
}

// Run the checker
checkAdSenseConfig();
