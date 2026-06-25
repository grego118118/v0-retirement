import { NextRequest, NextResponse } from 'next/server'
import { isSeoAuthorized } from '@/lib/seo/admin-auth'
import { getKeywordOpportunities, getPagePerformance } from '@/lib/seo/google-search-console'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  if (!await isSeoAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const siteUrl = process.env.GSC_SITE_URL
  if (!siteUrl) {
    return NextResponse.json({
      configured: false,
      message: 'GSC_SITE_URL env var not set',
      opportunities: [],
      pagePerformance: [],
    })
  }

  const daysBack = parseInt(request.nextUrl.searchParams.get('days') || '28', 10)

  try {
    const [opportunities, pagePerformance] = await Promise.all([
      getKeywordOpportunities(siteUrl, daysBack),
      getPagePerformance(siteUrl, daysBack),
    ])

    return NextResponse.json({
      configured: true,
      siteUrl,
      daysBack,
      fetchedAt: new Date().toISOString(),
      opportunities: opportunities.slice(0, 50), // top 50
      pagePerformance: pagePerformance.slice(0, 20),
    })
  } catch (error) {
    return NextResponse.json(
      {
        configured: false,
        error: (error as Error).message,
        opportunities: [],
        pagePerformance: [],
      },
      { status: 500 }
    )
  }
}
