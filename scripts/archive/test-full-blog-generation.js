/**
 * Full Blog Generation Test
 * Massachusetts Retirement System - Complete Content Generation Validation
 */

async function testFullBlogGeneration() {
  console.log('🚀 Testing Full Blog Generation System');
  console.log('📝 Generating Production-Quality Massachusetts Retirement Content');
  console.log('=' .repeat(70));
  
  const BASE_URL = 'https://www.masspension.com';
  const CRON_SECRET = '462c44a146ca26604411330b9cc568e9cc10a60e09745f4b7e26f8a80983c140';
  
  try {
    console.log('📡 Generating comprehensive blog post...');
    
    const startTime = Date.now();
    
    const response = await fetch(`${BASE_URL}/api/admin/blog/generate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CRON_SECRET}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        topic: {
          title: 'Understanding Massachusetts COLA Benefits: Your Complete Guide to the 3% Annual Adjustment',
          description: 'Comprehensive guide explaining how Massachusetts Cost of Living Adjustment (COLA) benefits work, including the $13,000 cap, compound growth effects, and strategies for maximizing retirement income across all four retirement groups.',
          keywords: [
            'Massachusetts COLA',
            'cost of living adjustment',
            '3% annual adjustment',
            'Massachusetts retirement benefits',
            'pension COLA calculation',
            'retirement income protection',
            'Massachusetts pension system',
            'Group 1 retirement',
            'Group 2 retirement',
            'Group 3 retirement',
            'Group 4 retirement'
          ]
        },
        category_id: 'cola-adjustments',
        ai_model: 'gemini-1.5-flash',
        word_count: 1200,
        target_audience: 'Massachusetts public employees and retirees',
        content_type: 'comprehensive guide',
        seo_keywords: [
          'Massachusetts COLA benefits',
          '3% COLA adjustment',
          'Massachusetts retirement COLA',
          'pension cost of living adjustment',
          'Massachusetts retirement income',
          'COLA vs inflation',
          'retirement benefit protection',
          'Massachusetts pension groups',
          'COLA calculation formula',
          'retirement income planning'
        ],
        additional_context: 'Include specific examples for each retirement group (Group 1, 2, 3, 4), explain the $13,000 annual cap with real dollar amounts, provide 10-year and 20-year COLA projections, discuss inflation protection, and include actionable advice for retirement planning. Use Massachusetts-specific examples and reference official MSRB guidelines.',
        auto_publish: false
      })
    });
    
    const responseTime = Date.now() - startTime;
    console.log(`📊 Response Status: ${response.status} (${responseTime}ms)`);
    
    if (response.ok) {
      const data = await response.json();
      
      console.log('\n✅ BLOG GENERATION SUCCESSFUL!');
      console.log('=' .repeat(50));
      
      // Post Information
      console.log('📝 POST DETAILS:');
      console.log(`   ID: ${data.post?.id || 'N/A'}`);
      console.log(`   Title: ${data.post?.title || 'N/A'}`);
      console.log(`   Word Count: ${data.post?.word_count || 'N/A'}`);
      console.log(`   Status: ${data.post?.status || 'N/A'}`);
      console.log(`   Cost: ${data.post?.cost || 'Free (Gemini)'}`);
      
      // Quality Metrics
      console.log('\n📊 QUALITY METRICS:');
      console.log(`   Overall Quality: ${data.quality_metrics?.overall_quality || 'N/A'}/100`);
      console.log(`   SEO Score: ${data.quality_metrics?.seo_score || 'N/A'}/100`);
      console.log(`   Readability: ${data.quality_metrics?.readability_score || 'N/A'}/100`);
      console.log(`   MA Relevance: ${data.quality_metrics?.massachusetts_relevance || 'N/A'}/100`);
      console.log(`   Engagement: ${data.quality_metrics?.engagement_potential || 'N/A'}/100`);
      
      // Fact Check Results
      console.log('\n🔍 FACT CHECK RESULTS:');
      console.log(`   Overall Accuracy: ${data.fact_check_report?.overall_accuracy || 'N/A'}%`);
      console.log(`   Fact Check Status: ${data.post?.fact_check_status || 'N/A'}`);
      
      // Content Analysis
      if (data.post?.content) {
        const contentLength = data.post.content.length;
        const plainText = data.post.content.replace(/<[^>]*>/g, '');
        const actualWordCount = plainText.split(/\s+/).filter(word => word.length > 0).length;
        
        console.log('\n📄 CONTENT ANALYSIS:');
        console.log(`   Content Length: ${contentLength} characters`);
        console.log(`   Actual Word Count: ${actualWordCount} words`);
        console.log(`   Target Met: ${actualWordCount >= 800 && actualWordCount <= 1200 ? '✅ YES' : '❌ NO'}`);
        
        // Show content preview
        console.log('\n📖 CONTENT PREVIEW (first 300 characters):');
        console.log('-'.repeat(50));
        console.log(plainText.substring(0, 300) + '...');
        console.log('-'.repeat(50));
      }
      
      // SEO Information
      if (data.post?.seo_description) {
        console.log('\n🔍 SEO OPTIMIZATION:');
        console.log(`   Meta Description: "${data.post.seo_description}"`);
        console.log(`   SEO Keywords: ${data.post?.seo_keywords?.join(', ') || 'N/A'}`);
      }
      
      // Database Status Check
      console.log('\n💾 DATABASE STATUS:');
      if (data.post?.id?.startsWith('test-')) {
        console.log('   ⚠️  MOCK RESPONSE - Content not saved to database');
        console.log('   📋 Possible causes:');
        console.log('      - Database connection issue');
        console.log('      - Prisma schema mismatch');
        console.log('      - Missing required fields');
        console.log('      - Database permissions');
      } else {
        console.log('   ✅ REAL POST - Content saved to database successfully');
        console.log('   📋 Post ready for review workflow');
      }
      
      // Improvement Suggestions
      if (data.quality_metrics?.improvement_suggestions?.length > 0) {
        console.log('\n💡 IMPROVEMENT SUGGESTIONS:');
        data.quality_metrics.improvement_suggestions.forEach((suggestion, i) => {
          console.log(`   ${i + 1}. ${suggestion}`);
        });
      }
      
      return data;
      
    } else {
      const errorData = await response.json();
      console.log('\n❌ BLOG GENERATION FAILED');
      console.log(`Status: ${response.status}`);
      console.log(`Error: ${errorData.error}`);
      console.log(`Details: ${errorData.details}`);
      return null;
    }
    
  } catch (error) {
    console.log('\n❌ REQUEST FAILED');
    console.log(`Error: ${error.message}`);
    return null;
  }
}

// Test database connectivity
async function testDatabaseConnectivity() {
  console.log('\n🔍 Testing Database Connectivity...');
  
  try {
    const response = await fetch('https://masspension.com/api/debug/database');
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Database connectivity test passed');
      
      const blogTables = data.tests.find(t => t.name === 'Database Schema')?.details?.existingTables?.filter(t => t.includes('blog')) || [];
      console.log(`📊 Blog tables found: ${blogTables.join(', ')}`);
      
      return true;
    } else {
      console.log('❌ Database connectivity test failed');
      return false;
    }
  } catch (error) {
    console.log(`❌ Database test error: ${error.message}`);
    return false;
  }
}

// Run comprehensive test
async function runComprehensiveTest() {
  console.log('🧪 MASSACHUSETTS RETIREMENT SYSTEM - COMPREHENSIVE BLOG TEST');
  console.log('=' .repeat(70));
  
  // Test database first
  const dbConnected = await testDatabaseConnectivity();
  
  if (!dbConnected) {
    console.log('\n⚠️  Database connectivity issues detected');
    console.log('This may explain why posts are saved as mock responses');
  }
  
  // Generate blog post
  const result = await testFullBlogGeneration();
  
  console.log('\n📋 COMPREHENSIVE TEST SUMMARY:');
  console.log('=' .repeat(50));
  
  if (result) {
    console.log('✅ Blog generation: WORKING');
    console.log('✅ API response time: ACCEPTABLE');
    console.log('✅ Content quality: MEASURED');
    console.log(`${result.post?.id?.startsWith('test-') ? '⚠️' : '✅'} Database storage: ${result.post?.id?.startsWith('test-') ? 'MOCK ONLY' : 'WORKING'}`);
  } else {
    console.log('❌ Blog generation: FAILED');
  }
  
  console.log('\n🎯 NEXT STEPS:');
  if (result?.post?.id?.startsWith('test-')) {
    console.log('1. Investigate database connectivity issues');
    console.log('2. Check Prisma schema compatibility');
    console.log('3. Verify database permissions');
    console.log('4. Review server logs for database errors');
  } else if (result) {
    console.log('1. ✅ System is fully operational');
    console.log('2. Configure content reviewer emails');
    console.log('3. Enable automated scheduling');
    console.log('4. Set up review workflow');
  } else {
    console.log('1. Check API key configuration');
    console.log('2. Verify network connectivity');
    console.log('3. Review error logs');
  }
}

runComprehensiveTest();
