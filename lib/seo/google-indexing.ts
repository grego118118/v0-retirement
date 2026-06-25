/**
 * Google Indexing API client
 * Submits URLs for fast indexing after publishing.
 * Requires a service account with the Indexing API scope and the site
 * added as an "owner" in Google Search Console.
 */

import { getGoogleAccessToken, parseServiceAccountJson } from './google-auth'

const INDEXING_API = 'https://indexing.googleapis.com/v3/urlNotifications:publish'
const INDEXING_SCOPE = 'https://www.googleapis.com/auth/indexing'

export interface IndexingResult {
  url: string
  type: 'URL_UPDATED' | 'URL_DELETED'
  notifyTime?: string
  error?: string
}

export async function submitUrlForIndexing(url: string): Promise<IndexingResult> {
  const sa = parseServiceAccountJson('GOOGLE_INDEXING_SERVICE_ACCOUNT_JSON')
  if (!sa) {
    return { url, type: 'URL_UPDATED', error: 'GOOGLE_INDEXING_SERVICE_ACCOUNT_JSON not configured' }
  }

  let token: string
  try {
    token = await getGoogleAccessToken(sa, INDEXING_SCOPE)
  } catch (err) {
    return { url, type: 'URL_UPDATED', error: `Auth failed: ${(err as Error).message}` }
  }

  const response = await fetch(INDEXING_API, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url, type: 'URL_UPDATED' }),
  })

  if (!response.ok) {
    const text = await response.text()
    return { url, type: 'URL_UPDATED', error: `Indexing API error: ${response.status} ${text}` }
  }

  const data = await response.json()
  return {
    url,
    type: 'URL_UPDATED',
    notifyTime: data.urlNotificationMetadata?.latestUpdate?.notifyTime,
  }
}

export async function submitMultipleUrls(urls: string[]): Promise<IndexingResult[]> {
  return Promise.all(urls.map((url) => submitUrlForIndexing(url)))
}
