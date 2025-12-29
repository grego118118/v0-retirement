/**
 * Database Error Capture Test
 * Get exact database error details from enhanced debugging
 */

async function testDatabaseError() {
  console.log('🔍 DATABASE ERROR CAPTURE TEST');
  console.log('📋 Getting exact database error details');
  console.log('=' .repeat(50));
  
  const BASE_URL = 'https://www.masspension.com';
  const CRON_SECRET = '462c44a146ca26604411330b9cc568e9cc10a60e09745f4b7e26f8a80983c140';
  
  try {
    console.log('📝 Generating blog post with enhanced error debugging...');
    
    const response = await fetch(`${BASE_URL}/api/admin/blog/generate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CRON_SECRET}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        topic: {
          title: 'Database Error Debug Test',
          description: 'Testing enhanced error debugging',
          keywords: ['debug', 'database', 'error']
        },
        ai_model: 'gemini-1.5-flash',
        word_count: 200,
        auto_publish: false
      })
    });
    
    console.log(`📊 Response Status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      
      console.log('\n📝 RESPONSE ANALYSIS:');
      console.log(`Post ID: ${data.post?.id}`);
      console.log(`Title: ${data.post?.title || 'N/A'}`);
      console.log(`Status: ${data.post?.status || 'N/A'}`);
      
      // Check for debug information
      if (data.debug_info) {
        console.log('\n🔍 DATABASE ERROR DETAILS:');
        console.log(`Database Error: ${data.debug_info.database_error}`);
        console.log(`Error Type: ${data.debug_info.error_type}`);
        console.log(`Error Name: ${data.debug_info.error_name}`);
        console.log(`Note: ${data.debug_info.note}`);
        
        // Analyze the error
        const errorMsg = data.debug_info.database_error;
        
        if (errorMsg.includes('violates')) {
          console.log('\n🎯 CONSTRAINT VIOLATION DETECTED');
          if (errorMsg.includes('foreign key')) {
            console.log('❌ Foreign key constraint violation');
          }
          if (errorMsg.includes('unique')) {
            console.log('❌ Unique constraint violation');
          }
          if (errorMsg.includes('not null')) {
            console.log('❌ Not null constraint violation');
          }
        }
        
        if (errorMsg.includes('permission') || errorMsg.includes('denied')) {
          console.log('\n🎯 PERMISSION ISSUE DETECTED');
          console.log('❌ Database permission or RLS policy blocking insert');
        }
        
        if (errorMsg.includes('type') || errorMsg.includes('invalid')) {
          console.log('\n🎯 DATA TYPE ISSUE DETECTED');
          console.log('❌ Data type mismatch or invalid value');
        }
        
      } else {
        console.log('\n⚠️  No debug information found - may be a real post or different error');
      }
      
      // Check all response keys
      console.log('\n📋 Response Keys:', Object.keys(data).join(', '));
      
    } else {
      const errorData = await response.json();
      console.log('\n❌ API REQUEST FAILED');
      console.log(`Error: ${errorData.error}`);
      console.log(`Details: ${errorData.details}`);
    }
    
  } catch (error) {
    console.log(`❌ Test failed: ${error.message}`);
  }
}

testDatabaseError();
