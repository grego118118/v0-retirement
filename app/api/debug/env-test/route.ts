/**
 * Environment Variable Diagnostic Endpoint
 * Tests runtime environment variable availability
 */

import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Check critical environment variables
    const databaseUrl = process.env.DATABASE_URL
    const nodeEnv = process.env.NODE_ENV
    const vercelEnv = process.env.VERCEL_ENV
    const isVercel = !!process.env.VERCEL
    
    // AdSense environment variables (recently fixed)
    const adSenseVars = {
      bannerSlot: process.env.NEXT_PUBLIC_ADSENSE_BANNER_SLOT,
      squareSlot: process.env.NEXT_PUBLIC_ADSENSE_SQUARE_SLOT,
      sidebarSlot: process.env.NEXT_PUBLIC_ADSENSE_SIDEBAR_SLOT,
      responsiveSlot: process.env.NEXT_PUBLIC_ADSENSE_RESPONSIVE_SLOT
    }
    
    console.log('🔍 Environment diagnostic:', {
      hasDatabase: !!databaseUrl,
      nodeEnv,
      vercelEnv,
      isVercel,
      adSenseConfigured: Object.values(adSenseVars).every(v => !!v)
    })
    
    return NextResponse.json({
      success: true,
      environment: {
        nodeEnv,
        vercelEnv,
        isVercel,
        platform: process.platform,
        nodeVersion: process.version
      },
      database: {
        hasUrl: !!databaseUrl,
        urlLength: databaseUrl?.length || 0,
        urlPrefix: databaseUrl ? databaseUrl.substring(0, 20) + '...' : 'Not found',
        urlProtocol: databaseUrl ? databaseUrl.split('://')[0] : 'Unknown'
      },
      adSense: {
        configured: Object.values(adSenseVars).every(v => !!v),
        bannerSlot: adSenseVars.bannerSlot || 'Not set',
        squareSlot: adSenseVars.squareSlot || 'Not set',
        sidebarSlot: adSenseVars.sidebarSlot || 'Not set',
        responsiveSlot: adSenseVars.responsiveSlot || 'Not set'
      },
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ Environment diagnostic failed:', error)
    
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
