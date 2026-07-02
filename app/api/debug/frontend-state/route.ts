import { NextRequest, NextResponse } from "next/server"
import { blockInProduction } from '@/lib/api/debug-guard'

export async function POST(request: NextRequest) {
  const blocked = blockInProduction()
  if (blocked) return blocked

  try {
    const debugInfo = await request.json()
    
    console.log('🔍 FRONTEND DEBUG INFO:', {
      timestamp: new Date().toISOString(),
      ...debugInfo
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Debug endpoint error:', error)
    return NextResponse.json({ error: 'Debug failed' }, { status: 500 })
  }
}
