/**
 * Simple Blog Test API
 * Test endpoint to verify blog routing is working
 */

import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/blog/test
 * Simple test endpoint
 */
export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    message: 'Blog API routing is working',
    timestamp: new Date().toISOString(),
    endpoint: '/api/blog/test'
  })
}
