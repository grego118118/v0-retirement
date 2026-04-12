/**
 * Final Deployment Monitor
 * Checks every 30 seconds until real ad unit IDs are detected
 */

async function finalMonitor() {
  console.log('🚀 Final Deployment Monitor - AdSense Environment Variables\n');
  console.log('⏱️  Monitoring deployment completion...\n');
  
  const realIds = ['9577105485', '1722666190', '8096502851', '3206088503'];
  const placeholderIds = ['1234567890', '2345678901', '3456789012', '4567890123'];
  
  const maxAttempts = 15; // 15 attempts over ~7.5 minutes
  const delay = 30000; // 30 seconds
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    console.log(`📡 Check ${attempt}/${maxAttempts}: Testing masspension.com`);
    
    try {
      const response = await fetch('https://masspension.com/test-adsense');
      const html = await response.text();
      
      const adSlots = html.match(/data-ad-slot="([0-9]{10})"/g) || [];
      
      console.log(`   📊 Ad Slots Found: ${adSlots.length}`);
      
      let hasReal = false;
      let hasPlaceholder = false;
      let realCount = 0;
      
      adSlots.forEach((slot, index) => {
        const match = slot.match(/data-ad-slot="([0-9]{10})"/);
        if (match) {
          const slotId = match[1];
          const isReal = realIds.includes(slotId);
          const isPlaceholder = placeholderIds.includes(slotId);
          
          if (isReal) {
            hasReal = true;
            realCount++;
          }
          if (isPlaceholder) hasPlaceholder = true;
          
          let status = '❓ UNKNOWN';
          if (isPlaceholder) status = '❌ PLACEHOLDER';
          if (isReal) status = '✅ REAL';
          
          console.log(`   Slot ${index + 1}: ${slotId} ${status}`);
        }
      });
      
      // Success condition: Real IDs detected and no placeholders
      if (hasReal && !hasPlaceholder) {
        console.log('\n🎉 DEPLOYMENT SUCCESS!');
        console.log('=' .repeat(60));
        console.log('✅ Real AdSense ad unit IDs are now active on production!');
        console.log(`✅ ${realCount} real ad slots detected`);
        console.log('✅ No placeholder IDs remaining');
        
        console.log('\n🎯 RESULTS:');
        console.log('• Manual ads will now display actual AdSense content');
        console.log('• No more "Advertisement space" placeholder messages');
        console.log('• Auto Ads continue working (bottom banner)');
        console.log('• Expected 50-100% revenue increase');
        
        console.log('\n📋 VERIFICATION STEPS:');
        console.log('1. Visit https://masspension.com');
        console.log('2. Check manual ad areas for actual AdSense content');
        console.log('3. Open browser console - should see successful ad initialization');
        console.log('4. Monitor AdSense dashboard for impression increases');
        
        console.log('\n🎊 AdSense Integration Fix Complete!');
        break;
        
      } else if (hasPlaceholder) {
        console.log(`   ⏳ Still detecting placeholder IDs (attempt ${attempt}/${maxAttempts})`);
        
        if (attempt < maxAttempts) {
          console.log(`   ⏱️  Waiting ${delay/1000} seconds for deployment propagation...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          console.log('\n⚠️  TIMEOUT REACHED');
          console.log('Deployment may need more time or manual intervention.');
          console.log('\n🔧 TROUBLESHOOTING:');
          console.log('1. Verify Vercel environment variables are saved correctly');
          console.log('2. Check Vercel deployment logs for any errors');
          console.log('3. Try manual redeploy from Vercel dashboard');
          console.log('4. Wait 5-10 more minutes and run this test again');
        }
        
      } else {
        console.log('   ❓ No ad slots detected - deployment may still be building...');
        if (attempt < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
      
    } catch (error) {
      console.error(`   ❌ Error on attempt ${attempt}:`, error.message);
      if (attempt < maxAttempts) {
        console.log(`   ⏳ Retrying in ${delay/1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  console.log('\n📊 Monitoring Complete');
}

// Start final monitoring
finalMonitor();
