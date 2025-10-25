// Quick test to check current AdSense status
async function quickTest() {
  console.log('🔍 Quick AdSense Status Check\n');
  
  try {
    const response = await fetch('https://masspension.com/test-adsense');
    const html = await response.text();
    
    // Look for ad slot IDs
    const adSlots = html.match(/data-ad-slot="([0-9]{10})"/g) || [];
    const placeholderIds = ['1234567890', '2345678901', '3456789012', '4567890123'];
    const realIds = ['9577105485', '1722666190', '8096502851', '3206088503'];
    
    console.log(`📊 Ad Slots Found: ${adSlots.length}`);
    
    adSlots.forEach((slot, index) => {
      const slotMatch = slot.match(/data-ad-slot="([0-9]{10})"/);
      if (slotMatch) {
        const slotId = slotMatch[1];
        const isPlaceholder = placeholderIds.includes(slotId);
        const isReal = realIds.includes(slotId);
        
        let status = '❓ UNKNOWN';
        if (isPlaceholder) status = '❌ PLACEHOLDER';
        if (isReal) status = '✅ REAL';
        
        console.log(`   Slot ${index + 1}: ${slotId} ${status}`);
      }
    });
    
    const hasPlaceholders = adSlots.some(slot => {
      const match = slot.match(/data-ad-slot="([0-9]{10})"/);
      return match && placeholderIds.includes(match[1]);
    });
    
    const hasRealIds = adSlots.some(slot => {
      const match = slot.match(/data-ad-slot="([0-9]{10})"/);
      return match && realIds.includes(match[1]);
    });
    
    console.log('\n📋 Status Summary:');
    if (hasRealIds) {
      console.log('✅ SUCCESS: Real ad unit IDs detected!');
      console.log('🎉 Environment variables have been updated successfully');
    } else if (hasPlaceholders) {
      console.log('⚠️  ISSUE: Still using placeholder IDs');
      console.log('🔧 Need to update Vercel Production environment variables');
    } else {
      console.log('❓ No ad slots detected or different IDs in use');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

quickTest();
