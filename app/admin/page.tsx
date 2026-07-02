"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Users, DollarSign, Crown, TrendingUp, AlertCircle,
  RefreshCw, Clock, UserMinus, FileText, BarChart3
} from 'lucide-react'

interface SubscriptionStats {
  generatedAt: string
  users: {
    total: number
    signupsLast7Days: number
    signupsLast30Days: number
  }
  subscriptions: {
    paidActive: number
    activeMonthly: number
    activeAnnual: number
    trialing: number
    canceling: number
    canceled: number
    pastDue: number
  }
  revenue: {
    estimatedMrr: number
    estimatedArr: number
    monthlyPrice: number
    annualPrice: number
  }
  recentSubscribers: Array<{
    email: string
    name: string | null
    plan: string | null
    status: string | null
    isRealStripeCustomer: boolean
    currentPeriodEnd: string | null
    cancelAtPeriodEnd: boolean
    signedUpAt: string
  }>
}

const currency = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })

function statusBadge(sub: SubscriptionStats['recentSubscribers'][number]) {
  if (sub.status === 'past_due') {
    return <Badge className="bg-red-100 text-red-800 border-red-200">Past due</Badge>
  }
  if (sub.cancelAtPeriodEnd) {
    return <Badge className="bg-amber-100 text-amber-800 border-amber-200">Canceling</Badge>
  }
  if (sub.status === 'trialing') {
    return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Trialing</Badge>
  }
  return <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<SubscriptionStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadStats = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/admin/subscriptions/stats')
      if (response.status === 401) {
        setError('unauthorized')
        return
      }
      if (!response.ok) {
        throw new Error(`Request failed (${response.status})`)
      }
      setStats(await response.json())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load stats')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStats()
  }, [])

  if (error === 'unauthorized') {
    return (
      <div className="container mx-auto py-16 px-4 max-w-2xl">
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Admin access required.</strong> Your account doesn&apos;t have the
            admin role. Add your email to the <code>ADMIN_EMAILS</code> environment
            variable (comma-separated) and sign in again.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Paying customers, revenue, and signups at a glance
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/blog/review">
              <FileText className="mr-2 h-4 w-4" />
              Blog Review
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/blog/analytics">
              <BarChart3 className="mr-2 h-4 w-4" />
              Blog Analytics
            </Link>
          </Button>
          <Button variant="outline" size="sm" onClick={loadStats} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {error && error !== 'unauthorized' && (
        <Alert className="mb-6 border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      {loading && !stats ? (
        <div className="text-center py-16 text-muted-foreground">
          <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-3" />
          Loading subscription data...
        </div>
      ) : stats ? (
        <>
          {/* Headline stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2">
                  <Crown className="h-4 w-4 text-mrs-gold-600" />
                  Paying Customers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.subscriptions.paidActive}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.subscriptions.activeMonthly} monthly · {stats.subscriptions.activeAnnual} annual
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  Est. Monthly Revenue
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{currency(stats.revenue.estimatedMrr)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {currency(stats.revenue.estimatedArr)} annualized
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  In Free Trial
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.subscriptions.trialing}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  14-day trials in progress
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2">
                  <UserMinus className="h-4 w-4 text-amber-600" />
                  Churn Risk
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {stats.subscriptions.canceling + stats.subscriptions.pastDue}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.subscriptions.canceling} canceling · {stats.subscriptions.pastDue} past due
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Growth stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Total Users
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.users.total}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  New Signups (7 days)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.users.signupsLast7Days}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  New Signups (30 days)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.users.signupsLast30Days}</div>
              </CardContent>
            </Card>
          </div>

          {/* Subscriber table */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Subscribers</CardTitle>
              <CardDescription>
                Active, trialing, and past-due subscriptions (most recently updated first)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stats.recentSubscribers.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">
                  No paying subscribers yet. When someone completes checkout,
                  they&apos;ll appear here.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-muted-foreground">
                        <th className="py-2 pr-4 font-medium">Customer</th>
                        <th className="py-2 pr-4 font-medium">Plan</th>
                        <th className="py-2 pr-4 font-medium">Status</th>
                        <th className="py-2 pr-4 font-medium">Source</th>
                        <th className="py-2 pr-4 font-medium">Renews / Ends</th>
                        <th className="py-2 font-medium">Signed Up</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recentSubscribers.map((sub) => (
                        <tr key={sub.email} className="border-b last:border-0">
                          <td className="py-3 pr-4">
                            <div className="font-medium">{sub.name || '—'}</div>
                            <div className="text-xs text-muted-foreground">{sub.email}</div>
                          </td>
                          <td className="py-3 pr-4 capitalize">{sub.plan || '—'}</td>
                          <td className="py-3 pr-4">{statusBadge(sub)}</td>
                          <td className="py-3 pr-4">
                            {sub.isRealStripeCustomer ? (
                              <Badge variant="outline" className="text-green-700 border-green-300">Stripe</Badge>
                            ) : (
                              <Badge variant="outline" className="text-slate-500">Demo/Dev</Badge>
                            )}
                          </td>
                          <td className="py-3 pr-4">
                            {sub.currentPeriodEnd
                              ? new Date(sub.currentPeriodEnd).toLocaleDateString()
                              : '—'}
                          </td>
                          <td className="py-3">
                            {new Date(sub.signedUpAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          <p className="text-xs text-muted-foreground mt-4">
            Revenue figures are estimates from plan prices ({currency(stats.revenue.monthlyPrice)}/mo,{' '}
            {currency(stats.revenue.annualPrice)}/yr) and don&apos;t account for promos, refunds, or
            proration — Stripe&apos;s dashboard is the source of truth for actual revenue.
            Rows marked Demo/Dev are development records, not real payments.
            Last updated {new Date(stats.generatedAt).toLocaleTimeString()}.
          </p>
        </>
      ) : null}
    </div>
  )
}
