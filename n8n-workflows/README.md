# n8n Workflows for Massachusetts Retirement AI Blog System

This directory contains n8n workflow configurations that integrate with the existing AI blog system to provide visual workflow management, better error handling, and enhanced automation capabilities.

## 🎯 **Workflow Overview**

### **1. Daily Content Generation** (`daily-content-generation.json`)
**Purpose**: Automated daily content generation with quality gates and budget controls

**Schedule**: Monday-Friday at 9:00 AM  
**Features**:
- Budget checking before generation
- Quality score evaluation (85+ for auto-publish)
- SEO optimization integration
- Slack notifications for all outcomes
- Error handling with retry logic

**Flow**:
```
Schedule → Budget Check → Generate Content → Quality Gate → SEO Optimize → Auto-Publish Decision → Notifications
```

### **2. Weekly COLA Analysis** (`weekly-cola-analysis.json`)
**Purpose**: Specialized weekly COLA content with seasonal topic selection

**Schedule**: Mondays at 10:00 AM  
**Features**:
- Seasonal topic selection
- COLA-specific content templates
- Enhanced metadata tracking
- Time-sensitive content prioritization

**Flow**:
```
Schedule → Get COLA Topics → Select Topic → Generate Content → Quality Check → SEO Optimize → Review Notification
```

### **3. Content Review Automation** (`content-review-automation.json`)
**Purpose**: Webhook-driven review workflow automation

**Trigger**: Webhook from admin review interface  
**Features**:
- Intelligent publish scheduling
- Social media scheduling suggestions
- Automatic regeneration for "needs changes"
- Comprehensive notification system

**Flow**:
```
Webhook → Review Filter → Approval Decision → [Approve: Schedule Publish] / [Reject: Notify] / [Changes: Regenerate]
```

---

## 🚀 **Setup Instructions**

### **1. Install n8n**

**Self-hosted (Recommended for cost control):**
```bash
# Using Docker
docker run -it --rm --name n8n -p 5678:5678 -v ~/.n8n:/home/node/.n8n n8nio/n8n

# Using npm
npm install n8n -g
n8n start
```

**Cloud (Easier setup):**
- Sign up at [n8n.cloud](https://n8n.cloud)
- Import workflows directly

### **2. Environment Variables**

Set these in your n8n environment:
```bash
CRON_SECRET=your_secure_cron_secret
MASSPENSION_BASE_URL=https://www.masspension.com
SLACK_BOT_TOKEN=xoxb-your-slack-bot-token
```

### **3. Import Workflows**

1. **Access n8n interface** (http://localhost:5678)
2. **Import each workflow**:
   - Click "Import from File"
   - Select the JSON file
   - Configure credentials
   - Activate the workflow

### **4. Configure Credentials**

**Discord Integration (Recommended - Free):**
1. Create Discord server for notifications
2. Create channels: `#content-review`, `#content-alerts`, `#system-logs`
3. Get webhook URLs for each channel (Channel Settings → Integrations → Webhooks)
4. Webhooks are already configured in the workflows with your URLs

**HTTP Authentication:**
1. Create "Header Auth" credential
2. Set header name: `Authorization`
3. Set header value: `Bearer YOUR_CRON_SECRET`

---

## 🔧 **Workflow Configuration**

### **Customizing Schedules**

**Daily Content Generation:**
```json
"cronExpression": "0 9 * * 1-5"  // 9 AM, Monday-Friday
```

**Weekly COLA Analysis:**
```json
"cronExpression": "0 10 * * 1"   // 10 AM, Mondays
```

### **Quality Thresholds**

Adjust quality gates in workflow conditions:
```json
{
  "leftValue": "={{$json.post.quality_score}}",
  "rightValue": 85,  // Change this threshold
  "operator": "gte"
}
```

### **Budget Controls**

Modify budget checking logic:
```json
{
  "leftValue": "={{$json.budget_utilization}}",
  "rightValue": 90,  // 90% budget utilization limit
  "operator": "lt"
}
```

### **Discord Channels**

Your Discord webhooks are pre-configured:
- **#content-review**: Review requests and quality issues
- **#content-alerts**: Success/failure notifications and budget alerts
- **#system-logs**: System events and monitoring

---

## 📊 **Monitoring and Analytics**

### **Workflow Execution Logs**
- View in n8n interface: Executions tab
- Filter by workflow, status, date range
- Debug failed executions with detailed logs

### **Discord Notifications**
- **#content-review**: Review requests, quality issues
- **#content-alerts**: Success/failure notifications, budget alerts
- **#system-logs**: System events and monitoring

### **Integration with Existing Analytics**
- Workflows call existing analytics endpoints
- Track workflow-specific metrics
- Monitor cost and performance trends

---

## 🔄 **Workflow Integration Points**

### **Existing API Endpoints Used**
```
POST /api/admin/blog/generate/random     - Content generation
POST /api/admin/blog/seo-optimize        - SEO optimization  
POST /api/admin/blog/review              - Review submission
GET  /api/admin/blog/generate/topics     - Topic selection
GET  /api/admin/blog/analytics/costs     - Budget checking
```

### **Webhook Integration**
The review automation workflow provides a webhook endpoint:
```
POST https://your-n8n-instance.com/webhook/content-review-webhook
```

Add this to your admin review interface to trigger automated workflows.

---

## 🎯 **Benefits of n8n Integration**

### **Visual Workflow Management**
- **Easy modifications**: Drag-and-drop workflow changes
- **Clear process visualization**: See entire content pipeline
- **Better debugging**: Visual execution logs and error tracking

### **Enhanced Error Handling**
- **Automatic retries**: Built-in retry logic with exponential backoff
- **Error branches**: Handle different failure scenarios
- **Comprehensive notifications**: Slack alerts for all outcomes

### **Flexible Scheduling**
- **Complex triggers**: Time-based, webhook-based, event-driven
- **Conditional execution**: Different workflows based on conditions
- **Manual triggers**: Easy one-off content generation

### **Better Monitoring**
- **Execution history**: Complete audit trail of workflow runs
- **Performance metrics**: Track workflow execution times
- **Cost tracking**: Monitor AI service usage across workflows

---

## 🚨 **Troubleshooting**

### **Common Issues**

**1. Webhook Not Triggering**
```bash
# Check webhook URL in admin interface
# Verify CORS settings in n8n
# Test with curl:
curl -X POST https://your-n8n.com/webhook/content-review-webhook \
  -H "Content-Type: application/json" \
  -d '{"action": "test"}'
```

**2. API Authentication Errors**
```bash
# Verify CRON_SECRET matches between n8n and your app
# Check Authorization header format: "Bearer YOUR_SECRET"
# Test API endpoints directly
```

**3. Slack Notifications Not Working**
```bash
# Verify Slack bot token and permissions
# Check channel names (include # prefix)
# Test Slack credentials in n8n
```

**4. Workflow Execution Failures**
```bash
# Check n8n execution logs
# Verify all required environment variables
# Test individual nodes manually
```

### **Debug Mode**
Enable detailed logging in workflow settings:
```json
{
  "settings": {
    "saveManualExecutions": true,
    "saveExecutionProgress": true
  }
}
```

---

## 📈 **Performance Optimization**

### **Workflow Efficiency**
- **Parallel execution**: Use parallel branches where possible
- **Conditional logic**: Skip unnecessary steps with IF nodes
- **Error handling**: Prevent workflow failures from stopping execution

### **Cost Management**
- **Budget gates**: Check costs before expensive operations
- **Model selection**: Use cost-effective AI models when appropriate
- **Batch processing**: Group multiple operations together

### **Monitoring**
- **Execution time tracking**: Monitor workflow performance
- **Success rate monitoring**: Track approval rates and quality scores
- **Cost per workflow**: Calculate ROI for automated content

---

## 🔮 **Future Enhancements**

### **Planned Workflow Additions**
1. **Social Media Automation**: Auto-post to LinkedIn/Twitter
2. **Newsletter Integration**: Include high-quality posts in weekly newsletter
3. **SEO Monitoring**: Track keyword rankings and organic traffic
4. **A/B Testing**: Test different AI models and prompts
5. **Content Refresh**: Update old posts with new information

### **Advanced Features**
- **Machine learning integration**: Predict content performance
- **Dynamic scheduling**: Adjust timing based on engagement data
- **Multi-language support**: Generate content in Spanish
- **Video content**: Integrate with video generation APIs

---

**🎉 Your n8n workflows are now ready to provide visual, robust automation for the Massachusetts Retirement AI blog system!**

The combination of custom Massachusetts-specific logic with n8n's workflow management gives you the best of both worlds - powerful automation with easy visual management and monitoring.
