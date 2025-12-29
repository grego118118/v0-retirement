# 🔧 Runtime Environment Issue - Complete Solution Guide

## 📊 Issue Summary
**Problem**: DATABASE_URL works during build but fails in serverless functions at runtime
**Symptoms**: 500 errors on all blog APIs despite successful build with Prisma connection
**Root Cause**: Runtime environment configuration issue in Vercel serverless functions

## 🔍 Step 1: Diagnose Runtime Environment Issue

### A. Check Vercel Function Logs
```bash
# Access Vercel Dashboard
1. Go to https://vercel.com/dashboard
2. Navigate to v0-retirement project
3. Click "Functions" tab
4. Look for recent invocations of blog API functions
5. Click on failed function calls to see detailed logs
```

**Look for these error patterns**:
- `PrismaClientInitializationError`
- `DATABASE_URL is not defined`
- `Connection timeout`
- `ENOTFOUND` or `ECONNREFUSED` errors

### B. Add Runtime Environment Debugging
Create a diagnostic API endpoint to test runtime environment:

```typescript
// pages/api/debug/env-test.ts
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Check if DATABASE_URL is available at runtime
    const databaseUrl = process.env.DATABASE_URL
    
    return res.status(200).json({
      hasDatabase: !!databaseUrl,
      databaseUrlLength: databaseUrl?.length || 0,
      databaseUrlPrefix: databaseUrl?.substring(0, 20) + '...',
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return res.status(500).json({
      error: error.message,
      stack: error.stack
    })
  }
}
```

## 🔍 Step 2: Verify DATABASE_URL Runtime Loading

### A. Test Environment Variable Availability
```bash
# Test the diagnostic endpoint
curl https://masspension.com/api/debug/env-test

# Expected response if working:
{
  "hasDatabase": true,
  "databaseUrlLength": 108,
  "databaseUrlPrefix": "postgresql://postgres...",
  "nodeEnv": "production",
  "vercelEnv": "production"
}
```

### B. Check Vercel Environment Variable Configuration
1. **Verify Variable Scope**:
   - Go to Vercel Dashboard → Settings → Environment Variables
   - Ensure DATABASE_URL is set for "Production" environment
   - Check that it's not limited to specific branches

2. **Validate Connection String Format**:
   ```
   Expected: postgresql://postgres.omiqpphkibfqddmwruuc:cwExuZuEgsZ29mXD@aws-0-us-east-1.pooler.supabase.com:5432/postgres
   ```

## 🔍 Step 3: Fix Prisma Client Initialization Issues

### A. Create Proper Prisma Client Singleton
The issue is likely improper Prisma client initialization in serverless functions.

```typescript
// lib/prisma.ts - Create this file
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: ['query', 'error', 'warn'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

### B. Update Blog API Routes to Use Singleton
```typescript
// app/api/blog/posts/route.ts - Update existing file
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Test database connection first
    await prisma.$connect()
    
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const page = parseInt(searchParams.get('page') || '1')
    const skip = (page - 1) * limit

    const [posts, total] = await Promise.all([
      prisma.blogPost.findMany({
        where: { status: 'published' },
        orderBy: { publishedAt: 'desc' },
        take: limit,
        skip: skip,
        include: {
          categories: {
            include: {
              category: true
            }
          }
        }
      }),
      prisma.blogPost.count({
        where: { status: 'published' }
      })
    ])

    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Blog posts API error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch blog posts',
        details: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
```

## 🔍 Step 4: Resolve Database Connection Pooling Issues

### A. Configure Prisma for Serverless
```typescript
// prisma/schema.prisma - Update connection settings
generator client {
  provider = "prisma-client-js"
  binaryTargets = ["native", "rhel-openssl-3.0.x"]
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  directUrl = env("DIRECT_URL") // Optional: for migrations
}
```

### B. Add Connection Pool Configuration
```typescript
// lib/prisma.ts - Enhanced version
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  },
  // Optimize for serverless
  __internal: {
    engine: {
      closePromise: undefined
    }
  }
})

// Ensure connection is established
prisma.$connect().catch((error) => {
  console.error('Failed to connect to database:', error)
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect()
})
```

### C. Test Supabase Connection Directly
```bash
# Test from Supabase dashboard
1. Go to Supabase Dashboard → Project Settings → Database
2. Test connection with provided connection string
3. Check connection pooler settings
4. Verify database is not paused or suspended
```

## 🔍 Step 5: Implement Code Changes

### A. Create the Diagnostic Endpoint
```typescript
// Create: app/api/debug/database-test/route.ts
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Test 1: Environment variable check
    const hasDbUrl = !!process.env.DATABASE_URL
    const dbUrlLength = process.env.DATABASE_URL?.length || 0
    
    if (!hasDbUrl) {
      return NextResponse.json({
        success: false,
        error: 'DATABASE_URL not found in environment',
        hasDbUrl,
        dbUrlLength
      }, { status: 500 })
    }

    // Test 2: Prisma connection test
    await prisma.$connect()
    
    // Test 3: Simple query test
    const result = await prisma.$queryRaw`SELECT 1 as test`
    
    // Test 4: Blog table test
    const blogCount = await prisma.blogPost.count()
    
    await prisma.$disconnect()
    
    return NextResponse.json({
      success: true,
      hasDbUrl,
      dbUrlLength,
      connectionTest: 'passed',
      queryTest: result,
      blogPostCount: blogCount,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack,
      hasDbUrl: !!process.env.DATABASE_URL,
      dbUrlLength: process.env.DATABASE_URL?.length || 0,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
```

### B. Update Package.json for Prisma
```json
{
  "scripts": {
    "postinstall": "prisma generate",
    "db:generate": "prisma generate",
    "db:push": "prisma db push",
    "db:studio": "prisma studio"
  }
}
```

## 🚀 Step 6: Deployment and Testing

### A. Deploy the Changes
```bash
# 1. Create the files above
# 2. Commit changes
git add .
git commit -m "fix: resolve runtime DATABASE_URL issue in serverless functions

- Add Prisma client singleton for serverless optimization
- Create database connection diagnostic endpoints
- Implement proper connection pooling
- Add enhanced error logging for runtime debugging
- Fix serverless function environment variable loading"

# 3. Push to trigger deployment
git push origin main
```

### B. Test the Fix
```bash
# Test 1: Database diagnostic
curl https://masspension.com/api/debug/database-test

# Test 2: Environment diagnostic  
curl https://masspension.com/api/debug/env-test

# Test 3: Blog API (should now work)
curl https://masspension.com/api/blog/posts?limit=1
```

## 🔍 Step 7: Verification Checklist

### Runtime Environment Verification
- [ ] DATABASE_URL available in serverless functions
- [ ] Prisma client properly initialized
- [ ] Database connection successful
- [ ] Blog API endpoints return 200 OK
- [ ] Error logging shows connection details

### Performance Verification
- [ ] API response times under 2 seconds
- [ ] No connection timeout errors
- [ ] Proper connection pooling working
- [ ] Memory usage optimized for serverless

## 🎯 Expected Results After Fix

### Before Fix
- ❌ Blog APIs return 500 errors
- ❌ Generic "Failed to fetch" messages
- ❌ No database connectivity at runtime
- ❌ Prisma client initialization failures

### After Fix
- ✅ Blog APIs return 200 OK with data
- ✅ Detailed error messages if issues occur
- ✅ Database connectivity working at runtime
- ✅ Prisma client properly initialized
- ✅ Massachusetts Retirement content accessible
- ✅ AdSense integration visible in blog posts

## 📞 Troubleshooting If Issues Persist

1. **Check Vercel Function Logs** for specific runtime errors
2. **Test diagnostic endpoints** to isolate the problem
3. **Verify Supabase database** is accessible and not paused
4. **Check connection string** for any changes or expiration
5. **Consider Prisma client regeneration** with `npx prisma generate`

This comprehensive solution addresses the runtime vs build-time discrepancy by ensuring proper Prisma client initialization and database connectivity in the serverless environment.
