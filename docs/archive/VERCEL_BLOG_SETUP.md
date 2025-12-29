# Vercel Environment Variables for Blog System

## Required Environment Variables

Add these to Vercel Production environment:

```bash
# Database Connection (CRITICAL)
DATABASE_URL=postgresql://postgres.omiqpphkibfqddmwruuc:cwExuZuEgsZ29mXD@aws-0-us-east-1.pooler.supabase.com:5432/postgres

# AI Content Generation
GEMINI_API_KEY=your_gemini_api_key_here
OPENAI_API_KEY=your_openai_api_key_here

# Blog Automation
CRON_SECRET=your_cron_secret_here
```

## Setup Steps

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add each variable above for "Production" environment
3. Save changes
4. Redeploy the application

## Verification

After deployment, test these endpoints:
- GET /api/blog/posts (should return 200, not 500)
- GET /api/blog/posts/stats (should return blog statistics)
- GET /api/blog/posts/featured (should return featured posts)

If still getting 500 errors, check:
1. DATABASE_URL is exactly as shown above
2. Variables are set for "Production" environment
3. Deployment completed successfully
4. Database tables exist in Supabase
