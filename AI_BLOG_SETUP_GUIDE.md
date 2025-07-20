# AI Blog System Setup Guide
## Massachusetts Retirement System - Automated Content Generation

This guide provides complete setup instructions for the AI-powered blog system that automatically generates, reviews, and publishes high-quality content about Massachusetts retirement benefits.

## 🎯 **System Overview**

The AI Blog System includes:
- **Automated Content Generation** using OpenAI GPT-4 and Anthropic Claude
- **Content Quality Assessment** with fact-checking and SEO optimization
- **Review and Approval Workflow** for human oversight
- **Automated Scheduling** with cron jobs for regular content publication
- **SEO Enhancement** with internal linking and metadata optimization
- **Cost Management** with budget tracking and model selection

---

## 📋 **Prerequisites**

### Required API Keys
```bash
# Add to your .env.local file
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
STABILITY_API_KEY=your_stability_api_key_here  # Optional for image generation
CRON_SECRET=your_secure_cron_secret_here
```

### Database Setup
1. **Run the database migration:**
```bash
cd v0-retirement
npx prisma db push
```

2. **Seed the database with initial data:**
```bash
npx prisma db seed
```

---

## 🚀 **Installation Steps**

### 1. Install Dependencies
```bash
npm install openai @anthropic-ai/sdk
```

### 2. Database Schema Setup
The system extends your existing blog schema with AI-specific fields. Run the SQL migration:

```sql
-- Execute the contents of database/ai-blog-schema.sql
-- This adds AI-specific tables and columns
```

### 3. Environment Configuration
Add the following environment variables to your `.env.local`:

```bash
# AI Service Configuration
OPENAI_API_KEY=sk-your-openai-key
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key
STABILITY_API_KEY=sk-your-stability-key

# Cron Job Security
CRON_SECRET=your-secure-random-string

# AI Budget Limits (optional)
AI_MONTHLY_BUDGET=200
AI_CONTENT_BUDGET=150
AI_IMAGE_BUDGET=30

# Content Quality Thresholds (optional)
MIN_QUALITY_SCORE=70
AUTO_PUBLISH_THRESHOLD=85
```

### 4. Vercel Cron Configuration
The system includes automated cron jobs. Ensure your `vercel.json` includes:

```json
{
  "crons": [
    {
      "path": "/api/cron/content-automation?action=all",
      "schedule": "0 */6 * * *"
    }
  ]
}
```

---

## 🎛️ **Configuration Options**

### AI Model Selection
Configure which AI models to use in `lib/ai/ai-service-config.ts`:

```typescript
// Recommended configuration for cost vs quality
const RECOMMENDED_MODELS = {
  primary: 'gpt-4-turbo-preview',    // High quality, moderate cost
  fallback: 'claude-3-sonnet',       // Good quality, lower cost
  budget: 'gpt-3.5-turbo'           // Basic quality, lowest cost
}
```

### Content Categories
The system includes predefined Massachusetts retirement categories:
- Pension Planning
- COLA Adjustments  
- Group Classifications (Groups 1-4)
- Social Security Integration
- Retirement Timing
- Benefit Calculations
- Legislative Updates
- Financial Planning

### Quality Control Settings
Adjust quality thresholds in `lib/ai/content-quality-checker.ts`:

```typescript
const QUALITY_THRESHOLDS = {
  minimum_score: 70,        // Minimum acceptable quality
  auto_publish: 85,         // Auto-publish threshold
  expert_review: 90         // High-quality content threshold
}
```

---

## 📅 **Content Scheduling**

### Automated Schedules
The system includes predefined content schedules:

1. **Weekly Pension Guides** (Mondays, 9 AM)
2. **Monthly COLA Analysis** (1st of month, 10 AM)  
3. **Seasonal Retirement Tips** (15th of month, 2 PM)

### Manual Content Generation
Generate content on-demand via the admin interface:

```bash
# Access the admin panel
https://your-domain.com/admin/blog/review
```

### API Endpoints
- `POST /api/admin/blog/generate` - Generate single post
- `POST /api/admin/blog/generate/random` - Generate random topic
- `GET /api/admin/blog/generate/topics` - Get available topics

---

## 🔍 **Quality Control Process**

### 1. Automated Quality Assessment
Every generated post receives:
- **Readability Score** (Flesch Reading Ease)
- **SEO Score** (keyword density, structure)
- **Fact Accuracy Score** (Massachusetts-specific validation)
- **Engagement Potential** (actionable content, examples)
- **Massachusetts Relevance** (local context, terminology)

### 2. Fact-Checking System
Advanced fact-checking validates:
- Group classification rules (Groups 1-4)
- Benefit multipliers and calculations
- COLA rates and application rules
- Maximum benefit percentages
- Common misconceptions

### 3. Human Review Workflow
1. **AI Generation** → Content created with quality assessment
2. **Fact Check** → Automated validation against known facts
3. **Human Review** → Admin approval required for publication
4. **SEO Optimization** → Automatic internal linking and metadata
5. **Publication** → Scheduled or immediate publishing

---

## 💰 **Cost Management**

### Budget Monitoring
The system tracks costs across:
- **Text Generation** (OpenAI/Anthropic API calls)
- **Image Generation** (Stability AI/DALL-E)
- **Fact-Checking** (Additional API calls)

### Cost Optimization
- **Model Selection** based on remaining budget
- **Content Length** optimization for cost efficiency
- **Batch Processing** to reduce API calls
- **Rate Limiting** to prevent overuse

### Monthly Budget Limits
```typescript
const MONTHLY_BUDGETS = {
  total: $200,           // Total monthly budget
  content: $150,         // Content generation
  images: $30,           // Image generation  
  fact_checking: $20     // Fact-checking and review
}
```

---

## 🔧 **Administration**

### Admin Dashboard
Access the admin interface at `/admin/blog/review` to:
- Review pending AI-generated posts
- Approve/reject content for publication
- Monitor content quality scores
- Track AI usage costs
- Manage content schedules

### Content Review Process
1. **View Pending Posts** - See all AI-generated content awaiting review
2. **Quality Assessment** - Review automated quality scores and metrics
3. **Content Preview** - Read full content with metadata and SEO analysis
4. **Approval Decision** - Approve, request changes, or reject
5. **Publication** - Schedule or immediately publish approved content

### Monitoring and Analytics
- **Content Performance** - Track views, engagement, AdSense revenue
- **AI Cost Tracking** - Monitor monthly spending across services
- **Quality Trends** - Analyze content quality over time
- **Fact-Check Reports** - Review accuracy validation results

---

## 🚨 **Troubleshooting**

### Common Issues

**1. API Key Errors**
```bash
Error: OpenAI API key not found
Solution: Verify OPENAI_API_KEY in .env.local
```

**2. Database Connection Issues**
```bash
Error: Table 'ai_content_jobs' doesn't exist
Solution: Run database migration: npx prisma db push
```

**3. Cron Job Failures**
```bash
Error: Unauthorized cron job attempt
Solution: Verify CRON_SECRET matches in environment and requests
```

**4. Budget Exceeded Errors**
```bash
Error: Monthly budget limit exceeded
Solution: Check cost tracking in admin dashboard, adjust budgets if needed
```

### Debug Mode
Enable detailed logging by setting:
```bash
DEBUG_AI_BLOG=true
```

---

## 📈 **Performance Optimization**

### Content Generation Speed
- Use **GPT-3.5 Turbo** for faster, lower-cost generation
- Implement **batch processing** for multiple posts
- **Cache** frequently used prompts and templates

### SEO Enhancement
- **Automatic internal linking** to calculator tools
- **Schema markup** generation for better search visibility
- **Featured snippet optimization** with FAQ sections

### AdSense Integration
- **Strategic ad placement** between blog sections
- **Premium user exclusion** from ad display
- **Performance tracking** for ad revenue optimization

---

## 🔄 **Maintenance**

### Regular Tasks
1. **Weekly**: Review content quality trends and adjust thresholds
2. **Monthly**: Analyze AI costs and optimize model selection  
3. **Quarterly**: Update fact-checking database with regulation changes
4. **Annually**: Review and update content templates and topics

### Content Updates
- **Regulation Changes**: Update fact-checking rules when Massachusetts laws change
- **New Topics**: Add seasonal or trending retirement topics
- **Template Optimization**: Refine prompts based on content performance

### System Health Checks
- **API Rate Limits**: Monitor usage against provider limits
- **Database Performance**: Optimize queries for large content volumes
- **Cron Job Monitoring**: Ensure scheduled tasks execute successfully

---

## 📞 **Support**

For technical support or questions about the AI Blog System:

1. **Check Logs**: Review application logs for error details
2. **Admin Dashboard**: Use built-in monitoring and analytics
3. **API Documentation**: Reference endpoint documentation for integration
4. **Cost Tracking**: Monitor usage and costs in real-time

---

## 🎉 **Success Metrics**

Track these KPIs to measure system success:

### Content Quality
- **Average Quality Score**: Target 85+
- **Fact-Check Accuracy**: Target 95+
- **Human Approval Rate**: Target 80+

### SEO Performance  
- **Organic Traffic Growth**: Month-over-month increase
- **Search Rankings**: Track keyword positions
- **Internal Link Clicks**: Measure engagement with calculator tools

### Cost Efficiency
- **Cost per Article**: Target under $0.10 per 1000 words
- **Budget Utilization**: Stay within monthly limits
- **ROI**: AdSense revenue vs AI costs

### User Engagement
- **Time on Page**: Measure content engagement
- **Calculator Conversions**: Track clicks to tools
- **Return Visitors**: Measure content value

---

**🚀 Your AI-powered Massachusetts Retirement System blog is now ready to generate high-quality, fact-checked content automatically!**
