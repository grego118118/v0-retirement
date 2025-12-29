/**
 * Check Deployment Status and AdSense Configuration
 * 
 * This script helps verify if the latest deployment has the updated
 * environment variables and if AdSense is working correctly.
 */

async function checkDeploymentStatus() {
  console.log('🚀 Checking Deployment Status and AdSense Configuration\n');
  
  const testUrl = 'https://masspension.com/test-adsense';
  const maxRetries = 3;
  const retryDelay = 5000; // 5 seconds
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    console.log(`📡 Attempt ${attempt}/${maxRetries}: Testing ${testUrl}`);
    
    try {
      const response = await fetch(testUrl);
      const html = await response.text();
      
      // Check for deployment timestamp or version info
      const deploymentInfo = html.match(/<!-- Deployed: ([^-]+) -->/);
      if (deploymentInfo) {
        console.log(`📅 Deployment Date: ${deploymentInfo[1]}`);
      }
      
      // Check for ad slot IDs in the page
      const adSlots = html.match(/data-ad-slot="([0-9]{10})"/g) || [];
      const placeholderIds = ['1234567890', '2345678901', '3456789012', '4567890123'];
      
      console.log(`🎯 Ad Slots Found: ${adSlots.length}`);
      
      let hasPlaceholders = false;
      adSlots.forEach((slot, index) => {
        const slotMatch = slot.match(/data-ad-slot="([0-9]{10})"/);
        if (slotMatch) {
          const slotId = slotMatch[1];
          const isPlaceholder = placeholderIds.includes(slotId);
          console.log(`   Slot ${index + 1}: ${slotId} ${isPlaceholder ? '❌ PLACEHOLDER' : '✅ REAL'}`);
          if (isPlaceholder) hasPlaceholders = true;
        }
      });
      
      // Check for AdSense script
      const hasAdSenseScript = html.includes('pagead2.googlesyndication.com');
      console.log(`📜 AdSense Script: ${hasAdSenseScript ? '✅ Loaded' : '❌ Missing'}`);
      
      // Check for placeholder messages
      const hasPlaceholderMessages = html.includes('Advertisement space');
      console.log(`📝 Placeholder Messages: ${hasPlaceholderMessages ? '⚠️  Present' : '✅ None'}`);
      
      if (!hasPlaceholders && adSlots.length > 0) {
        console.log('\n🎉 SUCCESS! Real ad unit IDs detected!');
        console.log('✅ Environment variables have been updated successfully');
        console.log('✅ Deployment is using the new configuration');
        console.log('\n📊 Next Steps:');
        console.log('1. Check browser console for ad initialization logs');
        console.log('2. Verify ads display actual content (not placeholders)');
        console.log('3. Monitor AdSense dashboard for impression increases');
        break;
      } else if (hasPlaceholders) {
        console.log('\n⚠️  Still detecting placeholder IDs...');
        if (attempt < maxRetries) {
          console.log(`⏳ Waiting ${retryDelay/1000} seconds before retry (deployment may still be propagating)`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
        } else {
          console.log('\n🚨 ISSUE PERSISTS:');
          console.log('❌ Placeholder ad slot IDs are still active after multiple attempts');
          console.log('\n🔧 REQUIRED ACTIONS:');
          console.log('1. Verify Vercel environment variables are set correctly');
          console.log('2. Ensure variables are set for "Production" environment');
          console.log('3. Manually trigger a new deployment from Vercel dashboard');
          console.log('4. Wait 5-10 minutes for global CDN cache to update');
          console.log('5. Run this test again');
        }
      } else {
        console.log('\n⚠️  No ad slots detected in page source');
        console.log('This might indicate a different issue with ad rendering');
      }
      
    } catch (error) {
      console.error(`❌ Error on attempt ${attempt}:`, error.message);
      if (attempt < maxRetries) {
        console.log(`⏳ Retrying in ${retryDelay/1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
  }
  
  console.log('\n📋 SUMMARY:');
  console.log('If you\'re still seeing placeholder IDs:');
  console.log('1. Double-check Vercel environment variables');
  console.log('2. Ensure they\'re set for Production (not Preview)');
  console.log('3. Force a new deployment from Vercel dashboard');
  console.log('4. Clear browser cache and test again');
  console.log('\nFor detailed instructions, see: ADSENSE_ENVIRONMENT_VERIFICATION_GUIDE.md');
}

// Run the check
checkDeploymentStatus();
