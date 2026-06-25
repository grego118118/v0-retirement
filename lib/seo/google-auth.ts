/**
 * Google Service Account JWT helper
 * Signs JWTs for Google API OAuth2 using a service account private key.
 * Uses node:crypto (RSA-SHA256) — no external dependencies needed.
 */

import { createSign } from 'node:crypto'

export interface GoogleServiceAccount {
  client_email: string
  private_key: string
}

function base64url(input: string | Buffer): string {
  const buf = typeof input === 'string' ? Buffer.from(input) : input
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function createJWT(serviceAccount: GoogleServiceAccount, scope: string): string {
  const now = Math.floor(Date.now() / 1000)
  const header = { alg: 'RS256', typ: 'JWT' }
  const claims = {
    iss: serviceAccount.client_email,
    scope,
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  }

  const headerB64 = base64url(JSON.stringify(header))
  const claimsB64 = base64url(JSON.stringify(claims))
  const signingInput = `${headerB64}.${claimsB64}`

  const sign = createSign('RSA-SHA256')
  sign.update(signingInput)
  const signature = sign.sign(serviceAccount.private_key, 'base64url')

  return `${signingInput}.${signature}`
}

export async function getGoogleAccessToken(
  serviceAccount: GoogleServiceAccount,
  scope: string
): Promise<string> {
  const jwt = createJWT(serviceAccount, scope)

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Google OAuth token exchange failed: ${response.status} ${text}`)
  }

  const data = await response.json()
  return data.access_token as string
}

export function parseServiceAccountJson(envVar: string): GoogleServiceAccount | null {
  const raw = process.env[envVar]
  if (!raw) return null
  try {
    return JSON.parse(raw) as GoogleServiceAccount
  } catch {
    return null
  }
}
