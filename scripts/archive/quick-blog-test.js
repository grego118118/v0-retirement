// Quick test of blog API status
async function quickBlogTest() {
  console.log('🔍 Quick Blog API Test\n');
  
  try {
    const response = await fetch('https://masspension.com/api/blog/posts?limit=1');
    console.log(`📊 Blog API Status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('🎉 SUCCESS! Blog API is working!');
      console.log(`📝 Posts: ${data.posts?.length || 0}`);
      console.log(`📈 Total: ${data.pagination?.total || 0}`);
      
      if (data.posts && data.posts.length > 0) {
        console.log(`📋 Sample: "${data.posts[0].title}"`);
      }
    } else {
      const errorText = await response.text();
      console.log('❌ Still getting errors');
      console.log(`Error: ${errorText}`);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

quickBlogTest();
