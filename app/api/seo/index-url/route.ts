import { NextRequest, NextResponse } from 'next/server'
import { isSeoAuthorized } from '@/lib/seo/admin-auth'
import { submitUrlForIndexing, submitMultipleUrls } from '@/lib/seo/google-indexing'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  if (!await isSeoAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()

  if (Array.isArray(body.urls)) {
    const results = await submitMultipleUrls(body.urls)
    return NextResponse.json({ results })
  }

  if (typeof body.url === 'string') {
    const result = await submitUrlForIndexing(body.url)
    return NextResponse.json({ result })
  }

  return NextResponse.json({ error: 'Provide url (string) or urls (array)' }, { status: 400 })
}
