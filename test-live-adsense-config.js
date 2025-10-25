/**
 * Test Live AdSense Configuration
 * 
 * This script tests the live website to check if the environment variables
 * have been properly updated with real ad unit IDs.
 */

const https = require('https');

async function testLiveAdSenseConfig() {
  console.log('🔍 Testing Live AdSense Configuration on masspension.com\n');

  try {
    // Test multiple pages to check ad implementation
    const testUrls = [
      'https://masspension.com',
      'https://masspension.com/calculator',
      'https://masspension.com/test-adsense'
    ];

    for (const url of testUrls) {
      console.log(`\n📄 Testing: ${url}`);
      console.log('-'.repeat(60));

      const response = await fetch(url);
      const html = await response.text();

      // Check for AdSense script
      const hasAdSenseScript = html.includes('pagead2.googlesyndication.com/pagead/js/adsbygoogle.js');
      console.log(`AdSense Script: ${hasAdSenseScript ? '✅ Found' : '❌ Missing'}`);

      // Check for ad elements
      const adElements = html.match(/data-ad-slot="([0-9]{10})"/g) || [];
      console.log(`Ad Elements Found: ${adElements.length}`);

      if (adElements.length > 0) {
        const placeholderIds = ['1234567890', '2345678901', '3456789012', '4567890123'];
        let hasPlaceholders = false;

        adElements.forEach((element, index) => {
          const slotMatch = element.match(/data-ad-slot="([0-9]{10})"/);
          if (slotMatch) {
            const slotId = slotMatch[1];
            const isPlaceholder = placeholderIds.includes(slotId);
            console.log(`  Slot ${index + 1}: ${slotId} ${isPlaceholder ? '❌ PLACEHOLDER' : '✅ REAL ID'}`);
            if (isPlaceholder) hasPlaceholders = true;
          }
        });

        if (hasPlaceholders) {
          console.log('  🚨 ISSUE: Placeholder IDs detected!');
        } else {
          console.log('  ✅ All ad slots using real IDs');
        }
      }

      // Check for placeholder messages
      const hasPlaceholderMessages = html.includes('Advertisement space') || html.includes('Support our free tools');
      if (hasPlaceholderMessages) {
        console.log('  ⚠️  Placeholder messages found in HTML');
      }

      // Check for AdSense Manager logs
      const hasManagerLogs = html.includes('AdSenseManager') || html.includes('placeholder slot');
      if (hasManagerLogs) {
        console.log('  📝 AdSense Manager debug info present');
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('🔧 RECOMMENDATIONS:');
    console.log('1. Check browser console on masspension.com for real-time debugging');
    console.log('2. Visit /test-adsense page for detailed ad slot analysis');
    console.log('3. Verify Vercel environment variables are set for Production');
    console.log('4. If still seeing placeholders, wait 5-10 minutes for deployment');
    console.log('5. Clear browser cache and test again');
    
  } catch (error) {
    console.error('\n❌ ERROR testing live configuration:', error.message);
    console.log('\n🔧 TROUBLESHOOTING:');
    console.log('   1. Check if masspension.com is accessible');
    console.log('   2. Verify the test page exists at /test-adsense');
    console.log('   3. Check if deployment completed successfully');
  }
}

// Run the test
testLiveAdSenseConfig();
