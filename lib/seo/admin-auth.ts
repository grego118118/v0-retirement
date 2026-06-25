/**
 * Auth helper for SEO / Rank Loop endpoints.
 *
 * Accepts EITHER:
 *  - a Vercel cron invocation (x-vercel-cron header)
 *  - a Bearer CRON_SECRET (manual/scripted trigger)
 *  - a logged-in user with a valid NextAuth JWT cookie
 *
 * Uses getToken() (not getServerSession) because getToken reliably reads the
 * JWT cookie inside App Router route handlers — the same mechanism the
 * middleware uses. getServerSession can return null here despite a valid login.
 */

import { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function isSeoAuthorized(request: NextRequest): Promise<boolean> {
  const isVercelCron = request.headers.get('x-vercel-cron') === '1'
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (isVercelCron) return true
  if (cronSecret && authHeader === `Bearer ${cronSecret}`) return true

  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
  return !!token
}
