// Quick deployment test
async function testNow() {
  console.log('🔍 Testing Production Deployment Status\n');
  
  try {
    const response = await fetch('https://masspension.com/test-adsense');
    const html = await response.text();
    
    const adSlots = html.match(/data-ad-slot="([0-9]{10})"/g) || [];
    const realIds = ['9577105485', '1722666190', '8096502851', '3206088503'];
    const placeholderIds = ['1234567890', '2345678901', '3456789012', '4567890123'];
    
    console.log(`📊 Ad Slots Found: ${adSlots.length}`);
    
    let hasReal = false;
    let hasPlaceholder = false;
    
    adSlots.forEach((slot, index) => {
      const match = slot.match(/data-ad-slot="([0-9]{10})"/);
      if (match) {
        const slotId = match[1];
        const isReal = realIds.includes(slotId);
        const isPlaceholder = placeholderIds.includes(slotId);
        
        if (isReal) hasReal = true;
        if (isPlaceholder) hasPlaceholder = true;
        
        let status = '❓ UNKNOWN';
        if (isPlaceholder) status = '❌ PLACEHOLDER';
        if (isReal) status = '✅ REAL';
        
        console.log(`   Slot ${index + 1}: ${slotId} ${status}`);
      }
    });
    
    console.log('\n📋 Deployment Status:');
    if (hasReal && !hasPlaceholder) {
      console.log('🎉 SUCCESS! Real ad unit IDs are now active!');
      console.log('✅ Production deployment completed successfully');
      console.log('✅ Manual ads should now display actual AdSense content');
      console.log('\n🎯 Next Steps:');
      console.log('1. Visit masspension.com to see manual ads');
      console.log('2. Check that ads show real content (not placeholders)');
      console.log('3. Monitor AdSense dashboard for impression increases');
    } else if (hasPlaceholder) {
      console.log('⏳ Still showing placeholder IDs - deployment may still be propagating');
      console.log('   Wait 2-3 more minutes and test again');
    } else {
      console.log('❓ No ad slots detected - checking again...');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testNow();
