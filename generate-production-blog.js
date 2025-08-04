/**
 * Generate Production-Quality Blog Post
 * Massachusetts Retirement System - Full Content Generation Test
 */

const fetch = require('node-fetch');

const BASE_URL = 'https://www.masspension.com';
const CRON_SECRET = '462c44a146ca26604411330b9cc568e9cc10a60e09745f4b7e26f8a80983c140';

async function generateProductionBlogPost() {
  console.log('🚀 Generating Production-Quality Blog Post');
  console.log('📝 Topic: Massachusetts COLA Benefits and Retirement Planning');
  console.log('🎯 Target: 1200 words with full SEO optimization');
  
  try {
    const response = await fetch(`${BASE_URL}/api/admin/blog/generate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CRON_SECRET}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        topic: {
          title: 'Massachusetts COLA Benefits: Maximizing Your 3% Annual Adjustment for Retirement Security',
          description: 'Comprehensive guide to understanding and maximizing Massachusetts Cost of Living Adjustment (COLA) benefits, including how the 3% annual adjustment works, its impact on different retirement groups, and strategies for long-term financial planning.',
          keywords: [
            'Massachusetts COLA',
            'cost of living adjustment',
            '3% annual adjustment',
            'Massachusetts retirement benefits',
            'pension COLA',
            'retirement income protection',
            'Massachusetts pension system',
            'COLA calculation',
            'retirement planning Massachusetts'
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
          'retirement benefit protection'
        ],
        additional_context: 'Focus on practical examples, include information about all four retirement groups (Group 1, 2, 3, 4), explain the $13,000 cap, provide real-world scenarios with dollar amounts, and include actionable advice for maximizing retirement income.',
        auto_publish: false
      })
    });

    console.log(`📊 Response Status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('\n✅ PRODUCTION BLOG POST GENERATED SUCCESSFULLY!');
      console.log('='.repeat(60));
      console.log(`📝 Post ID: ${data.post?.id}`);
      console.log(`📰 Title: ${data.post?.title || 'Not available'}`);
      console.log(`📊 Word Count: ${data.post?.word_count || 'Not available'}`);
      console.log(`💰 Generation Cost: ${data.post?.cost || 'Free (Gemini)'}`);
      console.log(`📈 Quality Score: ${data.quality_metrics?.overall_quality || 'N/A'}/100`);
      console.log(`🎯 SEO Score: ${data.quality_metrics?.seo_score || 'N/A'}/100`);
      console.log(`📖 Readability Score: ${data.quality_metrics?.readability_score || 'N/A'}/100`);
      console.log(`🏛️ MA Relevance Score: ${data.quality_metrics?.massachusetts_relevance || 'N/A'}/100`);
      console.log(`✅ Fact Check Accuracy: ${data.fact_check_report?.overall_accuracy || 'N/A'}%`);
      console.log(`📋 Status: ${data.post?.status || 'draft'}`);
      console.log(`🔍 Fact Check Status: ${data.post?.fact_check_status || 'needs_review'}`);
      
      if (data.quality_metrics?.improvement_suggestions?.length > 0) {
        console.log('\n💡 Improvement Suggestions:');
        data.quality_metrics.improvement_suggestions.forEach((suggestion, i) => {
          console.log(`   ${i + 1}. ${suggestion}`);
        });
      }
      
      console.log('\n📄 CONTENT PREVIEW:');
      console.log('='.repeat(60));
      if (data.post?.content) {
        // Show first 800 characters of content
        const preview = data.post.content.replace(/<[^>]*>/g, '').substring(0, 800);
        console.log(preview + '...\n');
      }
      
      // Show SEO metadata
      if (data.post?.seo_description) {
        console.log('🔍 SEO Meta Description:');
        console.log(`"${data.post.seo_description}"`);
      }
      
      if (data.post?.seo_keywords?.length > 0) {
        console.log('\n🏷️ SEO Keywords:');
        console.log(data.post.seo_keywords.join(', '));
      }
      
      return data;
    } else {
      const errorText = await response.text();
      console.log('❌ Generation Failed:', errorText);
      return null;
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
    return null;
  }
}

// Run the generation
generateProductionBlogPost().then(result => {
  if (result) {
    console.log('\n🎉 Production blog post generation completed successfully!');
    console.log('📋 Next steps: Review content and approve for publication');
  } else {
    console.log('\n❌ Production blog post generation failed');
  }
});
