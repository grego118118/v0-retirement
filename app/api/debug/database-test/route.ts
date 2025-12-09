/**
 * Database Connection Diagnostic Endpoint
 * Tests runtime DATABASE_URL and Prisma connectivity
 */

import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

// Force dynamic rendering to prevent static generation issues with Prisma
export const dynamic = 'force-dynamic'

export async function GET() {
  const startTime = Date.now()
  
  try {
    console.log('🔍 Starting database diagnostic test...')
    
    // Test 1: Environment variable check
    const hasDbUrl = !!process.env.DATABASE_URL
    const dbUrlLength = process.env.DATABASE_URL?.length || 0
    const dbUrlPrefix = process.env.DATABASE_URL?.substring(0, 25) + '...' || 'Not found'
    
    console.log(`📊 Environment check: hasDbUrl=${hasDbUrl}, length=${dbUrlLength}`)
    
    if (!hasDbUrl) {
      return NextResponse.json({
        success: false,
        error: 'DATABASE_URL not found in runtime environment',
        diagnostics: {
          hasDbUrl,
          dbUrlLength,
          nodeEnv: process.env.NODE_ENV,
          vercelEnv: process.env.VERCEL_ENV,
          isVercel: !!process.env.VERCEL,
          timestamp: new Date().toISOString()
        }
      }, { status: 500 })
    }

    // Test 2: Prisma connection test
    console.log('🔌 Testing Prisma connection...')
    await prisma.$connect()
    console.log('✅ Prisma connection successful')
    
    // Test 3: Simple query test
    console.log('🧪 Testing simple database query...')
    const result = await prisma.$queryRaw`SELECT 1 as test, NOW() as current_time`
    console.log('✅ Simple query successful:', result)
    
    // Test 4: Blog table existence test
    console.log('📊 Testing blog_posts table...')
    const blogCount = await prisma.blogPost.count()
    console.log(`✅ Blog posts count: ${blogCount}`)
    
    // Test 5: Blog categories test
    console.log('📂 Testing blog_categories table...')
    const categoryCount = await prisma.blogCategory.count()
    console.log(`✅ Blog categories count: ${categoryCount}`)
    
    // Test 6: Sample blog post retrieval
    console.log('📝 Testing blog post retrieval...')
    const samplePost = await prisma.blogPost.findFirst({
      where: { status: 'published' },
      select: {
        id: true,
        title: true,
        status: true,
        isAiGenerated: true,
        publishedAt: true
      }
    })
    console.log('✅ Sample post retrieved:', samplePost?.title || 'No published posts found')
    
    await prisma.$disconnect()
    
    const endTime = Date.now()
    const duration = endTime - startTime
    
    console.log(`🎉 Database diagnostic completed successfully in ${duration}ms`)
    
    return NextResponse.json({
      success: true,
      message: 'Database connectivity test passed',
      diagnostics: {
        hasDbUrl,
        dbUrlLength,
        dbUrlPrefix,
        nodeEnv: process.env.NODE_ENV,
        vercelEnv: process.env.VERCEL_ENV,
        isVercel: !!process.env.VERCEL,
        connectionTest: 'passed',
        queryTest: result,
        blogPostCount: blogCount,
        categoryCount: categoryCount,
        samplePost: samplePost,
        duration: `${duration}ms`,
        timestamp: new Date().toISOString()
      }
    })
    
  } catch (error) {
    const endTime = Date.now()
    const duration = endTime - startTime
    
    console.error('❌ Database diagnostic failed:', error)
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    })
    
    return NextResponse.json({
      success: false,
      error: error.message,
      errorName: error.name,
      diagnostics: {
        hasDbUrl: !!process.env.DATABASE_URL,
        dbUrlLength: process.env.DATABASE_URL?.length || 0,
        dbUrlPrefix: process.env.DATABASE_URL?.substring(0, 25) + '...' || 'Not found',
        nodeEnv: process.env.NODE_ENV,
        vercelEnv: process.env.VERCEL_ENV,
        isVercel: !!process.env.VERCEL,
        duration: `${duration}ms`,
        timestamp: new Date().toISOString(),
        errorStack: error.stack
      }
    }, { status: 500 })
  }
}
