/**
 * Google Search Console API client
 * Fetches search analytics data to identify keyword opportunities:
 * queries with impressions but low/zero clicks that we haven't targeted yet.
 */

import { getGoogleAccessToken, parseServiceAccountJson } from './google-auth'

export interface KeywordOpportunity {
  query: string
  impressions: number
  clicks: number
  ctr: number
  position: number
  opportunityScore: number // higher = better opportunity
}

export interface PagePerformance {
  page: string
  impressions: number
  clicks: number
  ctr: number
  position: number
}

const GSC_API = 'https://www.googleapis.com/webmasters/v3'
const GSC_SCOPE = 'https://www.googleapis.com/auth/webmasters.readonly'

async function getAccessToken(): Promise<string> {
  const sa = parseServiceAccountJson('GOOGLE_GSC_SERVICE_ACCOUNT_JSON')
  if (!sa) throw new Error('GOOGLE_GSC_SERVICE_ACCOUNT_JSON env var not configured')
  return getGoogleAccessToken(sa, GSC_SCOPE)
}

export async function getKeywordOpportunities(
  siteUrl: string,
  daysBack = 28
): Promise<KeywordOpportunity[]> {
  const token = await getAccessToken()

  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(endDate.getDate() - daysBack)

  const fmt = (d: Date) => d.toISOString().split('T')[0]

  const body = {
    startDate: fmt(startDate),
    endDate: fmt(endDate),
    dimensions: ['query'],
    rowLimit: 500,
    startRow: 0,
  }

  const encodedSite = encodeURIComponent(siteUrl)
  const response = await fetch(
    `${GSC_API}/sites/${encodedSite}/searchAnalytics/query`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }
  )

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`GSC API error: ${response.status} ${text}`)
  }

  const data = await response.json()
  const rows: any[] = data.rows || []

  return rows
    .filter((row) => row.impressions >= 10) // minimum signal
    .map((row) => {
      const impressions = row.impressions as number
      const clicks = row.clicks as number
      const ctr = row.ctr as number
      const position = row.position as number

      // Opportunity score: high impressions + low CTR + low position rank
      // Scale: impressions weight heavily, position penalty for already-ranking well
      const opportunityScore =
        Math.log(impressions + 1) * 10 +
        (1 - ctr) * 20 +
        Math.min(position, 50) * 0.5

      return {
        query: row.keys[0] as string,
        impressions,
        clicks,
        ctr: Math.round(ctr * 1000) / 10, // as percentage
        position: Math.round(position * 10) / 10,
        opportunityScore: Math.round(opportunityScore * 10) / 10,
      }
    })
    .sort((a, b) => b.opportunityScore - a.opportunityScore)
}

export async function getPagePerformance(
  siteUrl: string,
  daysBack = 28
): Promise<PagePerformance[]> {
  const token = await getAccessToken()

  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(endDate.getDate() - daysBack)

  const fmt = (d: Date) => d.toISOString().split('T')[0]

  const body = {
    startDate: fmt(startDate),
    endDate: fmt(endDate),
    dimensions: ['page'],
    rowLimit: 100,
  }

  const encodedSite = encodeURIComponent(siteUrl)
  const response = await fetch(
    `${GSC_API}/sites/${encodedSite}/searchAnalytics/query`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }
  )

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`GSC API error: ${response.status} ${text}`)
  }

  const data = await response.json()
  const rows: any[] = data.rows || []

  return rows
    .map((row) => ({
      page: row.keys[0] as string,
      impressions: row.impressions as number,
      clicks: row.clicks as number,
      ctr: Math.round((row.ctr as number) * 1000) / 10,
      position: Math.round((row.position as number) * 10) / 10,
    }))
    .sort((a, b) => b.impressions - a.impressions)
}
