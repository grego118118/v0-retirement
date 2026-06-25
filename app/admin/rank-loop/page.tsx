"use client"

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Search, TrendingUp, FileText, Send, Zap, RefreshCw,
  CheckCircle, AlertCircle, Clock, ExternalLink, ArrowRight
} from 'lucide-react'

interface KeywordOpportunity {
  query: string
  impressions: number
  clicks: number
  ctr: number
  position: number
  opportunityScore: number
}

interface PageStat {
  page: string
  impressions: number
  clicks: number
  ctr: number
  position: number
}

interface LoopRunResult {
  keyword: string
  title: string
  slug: string
  qualityScore: number
  published: boolean
  url: string
  indexingSubmitted: boolean
  dbError?: string
}

interface LoopRun {
  ranAt: string
  gscConfigured: boolean
  opportunitiesFound: number
  postsGenerated: number
  results: LoopRunResult[]
  errors: string[]
}

const STAGES = [
  { id: 'work', label: 'Work', icon: FileText, desc: 'Real pension data & calculator usage' },
  { id: 'document', label: 'Document', icon: Search, desc: 'AI identifies keyword gaps' },
  { id: 'ship', label: 'Ship', icon: Send, desc: 'Content auto-published to blog' },
  { id: 'index', label: 'Index', icon: Zap, desc: 'URLs submitted to Google' },
  { id: 'listen', label: 'Listen', icon: TrendingUp, desc: 'GSC data feeds next loop' },
]

export default function RankLoopPage() {
  const [opportunities, setOpportunities] = useState<KeywordOpportunity[]>([])
  const [pageStats, setPageStats] = useState<PageStat[]>([])
  const [gscConfigured, setGscConfigured] = useState<boolean | null>(null)
  const [gscError, setGscError] = useState<string | null>(null)
  const [lastRun, setLastRun] = useState<LoopRun | null>(null)
  const [running, setRunning] = useState(false)
  const [loadingGsc, setLoadingGsc] = useState(true)
  const [indexUrl, setIndexUrl] = useState('')
  const [indexResult, setIndexResult] = useState<string | null>(null)
  const [indexing, setIndexing] = useState(false)
  const [activeStage, setActiveStage] = useState(0)

  // Animate stage progression
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStage((s: number) => (s + 1) % STAGES.length)
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  const loadOpportunities = useCallback(async () => {
    setLoadingGsc(true)
    setGscError(null)
    try {
      const res = await fetch('/api/seo/opportunities')
      const data = await res.json()
      setGscConfigured(data.configured)
      if (data.error) setGscError(data.error)
      setOpportunities(data.opportunities || [])
      setPageStats(data.pagePerformance || [])
    } catch {
      setGscError('Failed to fetch GSC data')
      setGscConfigured(false)
    } finally {
      setLoadingGsc(false)
    }
  }, [])

  useEffect(() => { loadOpportunities() }, [loadOpportunities])

  const runLoop = async () => {
    setRunning(true)
    try {
      const res = await fetch('/api/cron/rank-loop', { method: 'POST' })
      const data = await res.json()
      // Normalize: ensure arrays always exist before setting state
      setLastRun({
        ranAt: data.ranAt ?? new Date().toISOString(),
        gscConfigured: data.gscConfigured ?? false,
        opportunitiesFound: data.opportunitiesFound ?? 0,
        postsGenerated: data.postsGenerated ?? 0,
        results: Array.isArray(data.results) ? data.results : [],
        errors: Array.isArray(data.errors)
          ? data.errors
          : [data.error ?? 'Unknown error — check server logs'],
      })
      await loadOpportunities()
    } catch (err) {
      setLastRun({
        ranAt: new Date().toISOString(),
        gscConfigured: false,
        opportunitiesFound: 0,
        postsGenerated: 0,
        results: [],
        errors: [`Network error: ${err instanceof Error ? err.message : String(err)}`],
      })
    } finally {
      setRunning(false)
    }
  }

  const submitIndexUrl = async () => {
    if (!indexUrl.trim()) return
    setIndexing(true)
    setIndexResult(null)
    try {
      const res = await fetch('/api/seo/index-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: indexUrl.trim() }),
      })
      const data = await res.json()
      const result = data.result
      if (!result || result.error) {
        setIndexResult(`Error: ${result?.error ?? 'No response from indexing API'}`)
      } else {
        setIndexResult(`Submitted! Notify time: ${result.notifyTime ?? 'pending'}`)
        setIndexUrl('')
      }
    } catch {
      setIndexResult('Failed to submit URL')
    } finally {
      setIndexing(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Rank Loop Engine</h1>
        <p className="text-gray-500 mt-1">
          Automated SEO: Listen → Generate → Ship → Index → Repeat
        </p>
      </div>

      {/* 5-Stage Loop Visualization */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-lg">The Loop</CardTitle>
          <CardDescription>Five stages running automatically — daily at 9 AM ET</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            {STAGES.map((stage, i) => {
              const Icon = stage.icon
              const isActive = activeStage === i
              return (
                <div key={stage.id} className="flex items-center">
                  <div className={`flex flex-col items-center transition-all duration-500 ${isActive ? 'scale-110' : 'opacity-60'}`}>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-colors duration-500 ${isActive ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-100 text-gray-500'}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className={`text-xs font-semibold ${isActive ? 'text-blue-600' : 'text-gray-500'}`}>
                      {stage.label}
                    </span>
                    <span className="text-xs text-gray-400 text-center max-w-[80px] mt-1 hidden sm:block">
                      {stage.desc}
                    </span>
                  </div>
                  {i < STAGES.length - 1 && (
                    <ArrowRight className={`w-5 h-5 mx-2 mt-[-20px] transition-colors duration-500 ${activeStage > i ? 'text-blue-400' : 'text-gray-200'}`} />
                  )}
                </div>
              )
            })}
          </div>

          <div className="flex gap-3 mt-6">
            <Button onClick={runLoop} disabled={running} className="gap-2">
              {running ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
              {running ? 'Running loop…' : 'Run Loop Now'}
            </Button>
            <Button variant="outline" onClick={loadOpportunities} disabled={loadingGsc} className="gap-2">
              <RefreshCw className={`w-4 h-4 ${loadingGsc ? 'animate-spin' : ''}`} />
              Refresh GSC Data
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Last Run Results */}
      {lastRun && (
        <Card className="mb-8 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Last Loop Run — {new Date(lastRun.ranAt).toLocaleString()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <Stat label="Opportunities Found" value={lastRun.opportunitiesFound} />
              <Stat label="Posts Generated" value={lastRun.postsGenerated} />
              <Stat label="GSC Connected" value={lastRun.gscConfigured ? 'Yes' : 'No'} />
              <Stat label="Errors" value={lastRun.errors.length} />
            </div>
            {(lastRun.results ?? []).map((r) => (
              <div key={r.slug} className="flex items-start gap-3 p-3 bg-white rounded-lg mb-2">
                <CheckCircle className={`w-4 h-4 mt-0.5 ${r.published ? 'text-green-500' : 'text-yellow-500'}`} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{r.title}</p>
                  <p className="text-xs text-gray-500">
                    Keyword: {r.keyword} · Quality: {r.qualityScore}/100 ·{' '}
                    {r.published ? 'Published' : 'Draft'} ·{' '}
                    {r.indexingSubmitted ? 'Indexed' : 'Not indexed'}
                  </p>
                  {r.dbError && <p className="text-xs text-red-500">DB error: {r.dbError}</p>}
                </div>
                {r.published && (
                  <a href={r.url} target="_blank" rel="noopener noreferrer">
                    <Button variant="ghost" size="sm">
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                  </a>
                )}
              </div>
            ))}
            {(lastRun.errors ?? []).map((e, i) => (
              <p key={i} className="text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {e}
              </p>
            ))}
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="opportunities">
        <TabsList className="mb-4">
          <TabsTrigger value="opportunities">Keyword Opportunities</TabsTrigger>
          <TabsTrigger value="pages">Page Performance</TabsTrigger>
          <TabsTrigger value="indexing">URL Indexing</TabsTrigger>
          <TabsTrigger value="setup">Setup Guide</TabsTrigger>
        </TabsList>

        {/* Keyword Opportunities */}
        <TabsContent value="opportunities">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Search className="w-5 h-5" />
                Keyword Opportunities
                {gscConfigured === false && (
                  <Badge variant="outline" className="text-orange-600 border-orange-300">
                    GSC not configured
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                Queries with impressions but low clicks — prime content targets
              </CardDescription>
            </CardHeader>
            <CardContent>
              {gscError && (
                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg mb-4">
                  <AlertCircle className="w-4 h-4" /> {gscError}
                </div>
              )}
              {loadingGsc ? (
                <div className="flex items-center justify-center h-32">
                  <RefreshCw className="w-5 h-5 animate-spin text-gray-400" />
                </div>
              ) : opportunities.length === 0 ? (
                <EmptyState
                  icon={<Search className="w-10 h-10 text-gray-300" />}
                  message={gscConfigured ? 'No opportunities found in the last 28 days.' : 'Configure GSC to see keyword opportunities.'}
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-gray-500">
                        <th className="pb-2 pr-4">Query</th>
                        <th className="pb-2 pr-4 text-right">Impressions</th>
                        <th className="pb-2 pr-4 text-right">Clicks</th>
                        <th className="pb-2 pr-4 text-right">CTR</th>
                        <th className="pb-2 pr-4 text-right">Position</th>
                        <th className="pb-2 text-right">Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {opportunities.map((opp, i) => (
                        <tr key={i} className="border-b hover:bg-gray-50">
                          <td className="py-2 pr-4 font-medium">{opp.query}</td>
                          <td className="py-2 pr-4 text-right">{opp.impressions.toLocaleString()}</td>
                          <td className="py-2 pr-4 text-right">{opp.clicks}</td>
                          <td className="py-2 pr-4 text-right">
                            <span className={opp.ctr < 2 ? 'text-red-500' : opp.ctr < 5 ? 'text-yellow-600' : 'text-green-600'}>
                              {opp.ctr}%
                            </span>
                          </td>
                          <td className="py-2 pr-4 text-right">{opp.position}</td>
                          <td className="py-2 text-right">
                            <Badge variant={opp.opportunityScore > 50 ? 'default' : 'secondary'}>
                              {opp.opportunityScore}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Page Performance */}
        <TabsContent value="pages">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Top Pages (Last 28 Days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingGsc ? (
                <div className="flex items-center justify-center h-32">
                  <RefreshCw className="w-5 h-5 animate-spin text-gray-400" />
                </div>
              ) : pageStats.length === 0 ? (
                <EmptyState
                  icon={<TrendingUp className="w-10 h-10 text-gray-300" />}
                  message="Configure GSC to see page performance."
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-gray-500">
                        <th className="pb-2 pr-4">Page</th>
                        <th className="pb-2 pr-4 text-right">Impressions</th>
                        <th className="pb-2 pr-4 text-right">Clicks</th>
                        <th className="pb-2 pr-4 text-right">CTR</th>
                        <th className="pb-2 text-right">Position</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pageStats.map((p, i) => (
                        <tr key={i} className="border-b hover:bg-gray-50">
                          <td className="py-2 pr-4 font-medium text-xs max-w-[300px] truncate">
                            <a href={p.page} target="_blank" rel="noopener noreferrer" className="hover:underline text-blue-600">
                              {p.page.replace('https://www.masspension.com', '')}
                            </a>
                          </td>
                          <td className="py-2 pr-4 text-right">{p.impressions.toLocaleString()}</td>
                          <td className="py-2 pr-4 text-right">{p.clicks}</td>
                          <td className="py-2 pr-4 text-right">{p.ctr}%</td>
                          <td className="py-2 text-right">{p.position}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* URL Indexing */}
        <TabsContent value="indexing">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Submit URL for Indexing
              </CardTitle>
              <CardDescription>
                Manually submit any URL to Google Indexing API for fast pickup
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={indexUrl}
                  onChange={(e) => setIndexUrl(e.target.value)}
                  placeholder="https://www.masspension.com/blog/your-post-slug"
                  className="flex-1"
                  onKeyDown={(e) => e.key === 'Enter' && submitIndexUrl()}
                />
                <Button onClick={submitIndexUrl} disabled={indexing || !indexUrl.trim()}>
                  {indexing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                  <span className="ml-2">Submit</span>
                </Button>
              </div>
              {indexResult && (
                <div className={`text-sm p-3 rounded-lg flex items-center gap-2 ${indexResult.startsWith('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                  {indexResult.startsWith('Error') ? <AlertCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                  {indexResult}
                </div>
              )}
              <div className="text-xs text-gray-500 space-y-1">
                <p>The loop auto-submits new URLs after publishing. Use this for manual submissions.</p>
                <p>Requires <code>GOOGLE_INDEXING_SERVICE_ACCOUNT_JSON</code> env var.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Setup Guide */}
        <TabsContent value="setup">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Setup Guide</CardTitle>
              <CardDescription>Configure the Rank Loop Engine in three steps</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <SetupStep
                number={1}
                title="Google Search Console Service Account"
                status={gscConfigured ? 'done' : 'pending'}
              >
                <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
                  <li>Go to <strong>Google Cloud Console</strong> → IAM &amp; Admin → Service Accounts</li>
                  <li>Create a new service account (e.g., <code>masspension-seo</code>)</li>
                  <li>Create a JSON key and download it</li>
                  <li>In <strong>Google Search Console</strong> → Settings → Users and permissions → Add user with the service account email (Read permission)</li>
                  <li>Add env var: <code>GOOGLE_GSC_SERVICE_ACCOUNT_JSON={"<paste entire JSON>"}</code></li>
                  <li>Add env var: <code>GSC_SITE_URL=https://www.masspension.com/</code></li>
                </ol>
              </SetupStep>

              <SetupStep
                number={2}
                title="Google Indexing API"
                status="pending"
              >
                <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
                  <li>Enable <strong>Web Search Indexing API</strong> in your Google Cloud project</li>
                  <li>Add the service account as an <strong>Owner</strong> in Google Search Console (required for Indexing API)</li>
                  <li>Add env var: <code>GOOGLE_INDEXING_SERVICE_ACCOUNT_JSON={"<same JSON as above>"}</code></li>
                </ol>
                <p className="text-xs text-gray-500 mt-2">The GSC and Indexing API can use the same service account key if it has both permissions.</p>
              </SetupStep>

              <SetupStep
                number={3}
                title="Verify the cron schedule"
                status="done"
              >
                <p className="text-sm text-gray-600">
                  The loop runs daily at 9 AM ET (<code>0 13 * * *</code>) via Vercel Cron.
                  The route is <code>/api/cron/rank-loop</code>.
                  You can also trigger it manually with the "Run Loop Now" button above.
                </p>
              </SetupStep>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="text-center">
      <p className="text-2xl font-bold text-blue-700">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  )
}

function EmptyState({ icon, message }: { icon: React.ReactNode; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-gray-400">
      {icon}
      <p className="mt-3 text-sm">{message}</p>
    </div>
  )
}

function SetupStep({
  number, title, status, children
}: {
  number: number
  title: string
  status: 'done' | 'pending'
  children: React.ReactNode
}) {
  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${status === 'done' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
          {status === 'done' ? <CheckCircle className="w-4 h-4" /> : number}
        </div>
        <h3 className="font-semibold">{title}</h3>
        <Badge variant={status === 'done' ? 'default' : 'secondary'} className={status === 'done' ? 'bg-green-100 text-green-700' : ''}>
          {status === 'done' ? 'Configured' : 'Needs setup'}
        </Badge>
      </div>
      {children}
    </div>
  )
}
