/**
 * Monitor Deployment and AdSense Configuration
 * 
 * This script monitors the deployment and tests when the real ad unit IDs become active.
 */

async function monitorDeployment() {
  console.log('🚀 Monitoring Deployment and AdSense Configuration\n');
  console.log('⏱️  Deployment triggered - waiting for completion...\n');
  
  const realIds = ['9577105485', '1722666190', '8096502851', '3206088503'];
  const placeholderIds = ['1234567890', '2345678901', '3456789012', '4567890123'];
  
  const maxAttempts = 20; // 20 attempts over ~10 minutes
  const delayBetweenAttempts = 30000; // 30 seconds
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    console.log(`📡 Attempt ${attempt}/${maxAttempts}: Testing masspension.com`);
    
    try {
      const response = await fetch('https://masspension.com/test-adsense');
      const html = await response.text();
      
      // Extract all ad slot IDs
      const adSlots = html.match(/data-ad-slot="([0-9]{10})"/g) || [];
      
      console.log(`   📊 Ad Slots Found: ${adSlots.length}`);
      
      let hasRealIds = false;
      let hasPlaceholders = false;
      
      adSlots.forEach((slot, index) => {
        const slotMatch = slot.match(/data-ad-slot="([0-9]{10})"/);
        if (slotMatch) {
          const slotId = slotMatch[1];
          const isReal = realIds.includes(slotId);
          const isPlaceholder = placeholderIds.includes(slotId);
          
          let status = '❓ UNKNOWN';
          if (isPlaceholder) {
            status = '❌ PLACEHOLDER';
            hasPlaceholders = true;
          }
          if (isReal) {
            status = '✅ REAL';
            hasRealIds = true;
          }
          
          console.log(`   Slot ${index + 1}: ${slotId} ${status}`);
        }
      });
      
      // Check deployment success
      if (hasRealIds && !hasPlaceholders) {
        console.log('\n🎉 SUCCESS! Deployment completed successfully!');
        console.log('✅ Real ad unit IDs are now active on the live site');
        console.log('✅ Manual ads should now display actual AdSense content');
        
        console.log('\n📋 Next Steps:');
        console.log('1. Visit masspension.com and check manual ad areas');
        console.log('2. Verify ads show actual content (not "Advertisement space")');
        console.log('3. Check browser console for successful ad initialization');
        console.log('4. Monitor AdSense dashboard for impression increases');
        
        console.log('\n🎯 Expected Results:');
        console.log('- Manual ads display real AdSense content');
        console.log('- Auto Ads continue working (bottom banner)');
        console.log('- 50-100% revenue increase expected');
        console.log('- No more placeholder messages');
        
        break;
        
      } else if (hasPlaceholders) {
        console.log(`   ⚠️  Still detecting placeholder IDs...`);
        
        if (attempt === 1) {
          console.log('\n🔧 IMPORTANT: Update Vercel Environment Variables');
          console.log('   The deployment has been triggered, but you still need to:');
          console.log('   1. Go to Vercel Dashboard → Settings → Environment Variables');
          console.log('   2. Update these 4 variables for Production environment:');
          console.log('      NEXT_PUBLIC_ADSENSE_BANNER_SLOT = 9577105485');
          console.log('      NEXT_PUBLIC_ADSENSE_SQUARE_SLOT = 1722666190');
          console.log('      NEXT_PUBLIC_ADSENSE_SIDEBAR_SLOT = 8096502851');
          console.log('      NEXT_PUBLIC_ADSENSE_RESPONSIVE_SLOT = 3206088503');
          console.log('   3. Save the changes');
          console.log('   4. Wait for this script to detect the changes\n');
        }
        
        if (attempt < maxAttempts) {
          console.log(`   ⏳ Waiting ${delayBetweenAttempts/1000} seconds before next check...`);
          await new Promise(resolve => setTimeout(resolve, delayBetweenAttempts));
        } else {
          console.log('\n❌ TIMEOUT: Deployment monitoring completed without detecting real ad unit IDs');
          console.log('\n🔧 Manual Action Required:');
          console.log('1. Verify Vercel environment variables are updated');
          console.log('2. Ensure variables are set for "Production" environment');
          console.log('3. Manually trigger redeploy from Vercel dashboard');
          console.log('4. Run this script again to monitor the new deployment');
        }
        
      } else {
        console.log('   ❓ No ad slots detected - checking again...');
        if (attempt < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, delayBetweenAttempts));
        }
      }
      
    } catch (error) {
      console.error(`   ❌ Error on attempt ${attempt}:`, error.message);
      if (attempt < maxAttempts) {
        console.log(`   ⏳ Retrying in ${delayBetweenAttempts/1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, delayBetweenAttempts));
      }
    }
  }
  
  console.log('\n📋 Monitoring Complete');
  console.log('For detailed troubleshooting, see: VERCEL_DEPLOYMENT_GUIDE.md');
}

// Start monitoring
monitorDeployment();
