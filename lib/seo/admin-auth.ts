/**
 * Auth helper for SEO / Rank Loop endpoints.
 *
 * Accepts EITHER:
 *  - a Vercel cron invocation (x-vercel-cron header)
 *  - a Bearer CRON_SECRET (manual/scripted trigger)
 *  - a logged-in user with a valid NextAuth JWT cookie
 *
 * Why this is more involved than a single getToken() call:
 *
 * In production the NextAuth session cookie is named
 * `__Secure-next-auth.session-token` (the `__Secure-` prefix is added whenever
 * the cookie is marked secure). getToken() decides which cookie name to look
 * for from its `secureCookie` option, which by default is derived from
 * `process.env.NEXTAUTH_URL?.startsWith("https://") ?? !!process.env.VERCEL`.
 * If NEXTAUTH_URL is set but not https-prefixed, that default resolves to
 * `false`, so getToken looks for the NON-prefixed `next-auth.session-token`
 * cookie, fails to find it, and returns null — even for a perfectly valid
 * session. (getServerSession has the same env-based detection and fails the
 * same way.) The middleware works regardless because withAuth derives the
 * secure flag from the request protocol, not the env.
 *
 * To be robust against env misconfiguration we try BOTH cookie encodings.
 * Each (secureCookie -> cookieName -> decode salt) pairing is internally
 * consistent, so whichever one matches the real cookie will decode and verify
 * it with NEXTAUTH_SECRET; the other simply returns null.
 */

import { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

async function readToken(request: NextRequest, secureCookie: boolean) {
  try {
    return await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
      secureCookie,
    })
  } catch {
    return null
  }
}

export async function isSeoAuthorized(request: NextRequest): Promise<boolean> {
  const isVercelCron = request.headers.get('x-vercel-cron') === '1'
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (isVercelCron) return true
  if (cronSecret && authHeader === `Bearer ${cronSecret}`) return true

  // Try the secure (__Secure- prefixed) cookie first — that's what production
  // uses — then fall back to the non-prefixed cookie used in local/dev.
  const token =
    (await readToken(request, true)) ?? (await readToken(request, false))
  return !!token
}
