import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-config'
import { submitUrlForIndexing, submitMultipleUrls } from '@/lib/seo/google-indexing'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!session?.user && authHeader !== `Bearer ${cronSecret}`) {
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
