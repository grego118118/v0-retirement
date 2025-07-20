"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Area, AreaChart
} from 'recharts'
import { 
  TrendingUp, DollarSign, FileText, Bot, Star, Users, 
  Eye, Clock, Target, AlertCircle, CheckCircle, Zap
} from 'lucide-react'

interface AnalyticsData {
  content_stats: {
    total_posts: number
    ai_generated: number
    published_today: number
    pending_review: number
    average_quality: number
  }
  cost_stats: {
    monthly_total: number
    daily_average: number
    cost_per_post: number
    budget_remaining: number
    budget_utilization: number
  }
  performance_stats: {
    total_views: number
    avg_time_on_page: number
    bounce_rate: number
    calculator_clicks: number
    adsense_revenue: number
  }
  quality_trends: Array<{
    date: string
    quality_score: number
    posts_generated: number
    approval_rate: number
  }>
  cost_breakdown: Array<{
    service: string
    cost: number
    percentage: number
    color: string
  }>
  top_performing_posts: Array<{
    title: string
    views: number
    quality_score: number
    is_ai_generated: boolean
    revenue: number
  }>
}

export default function BlogAnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('30d')

  useEffect(() => {
    loadAnalytics()
  }, [timeRange])

  const loadAnalytics = async () => {
    try {
      setLoading(true)
      
      // Mock data - would fetch from API in production
      const mockData: AnalyticsData = {
        content_stats: {
          total_posts: 45,
          ai_generated: 38,
          published_today: 2,
          pending_review: 3,
          average_quality: 87
        },
        cost_stats: {
          monthly_total: 142.50,
          daily_average: 4.75,
          cost_per_post: 3.75,
          budget_remaining: 57.50,
          budget_utilization: 71.25
        },
        performance_stats: {
          total_views: 12450,
          avg_time_on_page: 245,
          bounce_rate: 32.5,
          calculator_clicks: 890,
          adsense_revenue: 89.25
        },
        quality_trends: [
          { date: '2024-01-01', quality_score: 82, posts_generated: 3, approval_rate: 85 },
          { date: '2024-01-02', quality_score: 85, posts_generated: 2, approval_rate: 90 },
          { date: '2024-01-03', quality_score: 88, posts_generated: 4, approval_rate: 92 },
          { date: '2024-01-04', quality_score: 87, posts_generated: 3, approval_rate: 88 },
          { date: '2024-01-05', quality_score: 90, posts_generated: 2, approval_rate: 95 },
          { date: '2024-01-06', quality_score: 89, posts_generated: 3, approval_rate: 93 },
          { date: '2024-01-07', quality_score: 91, posts_generated: 2, approval_rate: 96 }
        ],
        cost_breakdown: [
          { service: 'OpenAI GPT-4', cost: 89.50, percentage: 62.8, color: '#10B981' },
          { service: 'Anthropic Claude', cost: 35.25, percentage: 24.7, color: '#3B82F6' },
          { service: 'Image Generation', cost: 12.75, percentage: 8.9, color: '#8B5CF6' },
          { service: 'Fact Checking', cost: 5.00, percentage: 3.5, color: '#F59E0B' }
        ],
        top_performing_posts: [
          {
            title: 'Maximizing Your Massachusetts Pension Benefits: Complete Guide',
            views: 2450,
            quality_score: 95,
            is_ai_generated: true,
            revenue: 18.50
          },
          {
            title: '2024 COLA Impact Analysis for Massachusetts Retirees',
            views: 1890,
            quality_score: 92,
            is_ai_generated: true,
            revenue: 14.25
          },
          {
            title: 'Group 4 Public Safety Retirement Benefits Guide',
            views: 1650,
            quality_score: 88,
            is_ai_generated: true,
            revenue: 12.75
          }
        ]
      }

      setAnalytics(mockData)
      setLoading(false)
    } catch (error) {
      console.error('Error loading analytics:', error)
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Loading analytics...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <p className="text-red-600">Failed to load analytics data</p>
          <Button onClick={loadAnalytics} className="mt-4">Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">AI Blog Analytics Dashboard</h1>
        <p className="text-gray-600 mt-2">Monitor content performance, costs, and quality metrics</p>
      </div>

      {/* Time Range Selector */}
      <div className="flex gap-2 mb-6">
        {['7d', '30d', '90d'].map((range) => (
          <Button
            key={range}
            variant={timeRange === range ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeRange(range)}
          >
            {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
          </Button>
        ))}
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.content_stats.total_posts}</div>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-purple-600 border-purple-200 bg-purple-50">
                <Bot className="w-3 h-3 mr-1" />
                {analytics.content_stats.ai_generated} AI
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${analytics.cost_stats.monthly_total}</div>
            <div className="flex items-center gap-2 mt-1">
              <div className="text-xs text-muted-foreground">
                {analytics.cost_stats.budget_utilization}% of budget
              </div>
              <Badge variant={analytics.cost_stats.budget_utilization > 80 ? 'destructive' : 'secondary'}>
                ${analytics.cost_stats.budget_remaining} left
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quality Score</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.content_stats.average_quality}</div>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                <CheckCircle className="w-3 h-3 mr-1" />
                Excellent
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.performance_stats.total_views.toLocaleString()}</div>
            <div className="flex items-center gap-2 mt-1">
              <div className="text-xs text-muted-foreground">
                {analytics.performance_stats.calculator_clicks} calculator clicks
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="performance" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="quality">Quality Trends</TabsTrigger>
          <TabsTrigger value="costs">Cost Analysis</TabsTrigger>
          <TabsTrigger value="content">Content Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Content Performance</CardTitle>
                <CardDescription>Views and engagement over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={analytics.quality_trends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="posts_generated" stackId="1" stroke="#8884d8" fill="#8884d8" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Performing Posts</CardTitle>
                <CardDescription>Highest traffic AI-generated content</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.top_performing_posts.map((post, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm line-clamp-1">{post.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            <Eye className="w-3 h-3 mr-1" />
                            {post.views.toLocaleString()}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            <Star className="w-3 h-3 mr-1" />
                            {post.quality_score}
                          </Badge>
                          {post.is_ai_generated && (
                            <Badge variant="outline" className="text-purple-600 border-purple-200 bg-purple-50 text-xs">
                              <Bot className="w-3 h-3 mr-1" />
                              AI
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-green-600">${post.revenue}</div>
                        <div className="text-xs text-muted-foreground">Revenue</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="quality" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quality Trends</CardTitle>
              <CardDescription>Content quality and approval rates over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={analytics.quality_trends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="quality_score" stroke="#10B981" strokeWidth={2} />
                  <Line type="monotone" dataKey="approval_rate" stroke="#3B82F6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="costs" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Cost Breakdown</CardTitle>
                <CardDescription>AI service costs by provider</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analytics.cost_breakdown}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name} ${percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="cost"
                    >
                      {analytics.cost_breakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cost Efficiency</CardTitle>
                <CardDescription>Cost metrics and optimization</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Cost per Post</span>
                    <span className="text-lg font-bold">${analytics.cost_stats.cost_per_post}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Daily Average</span>
                    <span className="text-lg font-bold">${analytics.cost_stats.daily_average}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Budget Utilization</span>
                    <Badge variant={analytics.cost_stats.budget_utilization > 80 ? 'destructive' : 'secondary'}>
                      {analytics.cost_stats.budget_utilization}%
                    </Badge>
                  </div>
                  <div className="pt-4 border-t">
                    <div className="text-sm text-muted-foreground mb-2">Optimization Suggestions:</div>
                    <ul className="text-sm space-y-1">
                      <li>• Consider using Claude for cost-effective generation</li>
                      <li>• Batch process multiple posts to reduce API calls</li>
                      <li>• Optimize content length for better cost efficiency</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Content Status</CardTitle>
                <CardDescription>Current content pipeline</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Published Today</span>
                    <Badge variant="outline">{analytics.content_stats.published_today}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Pending Review</span>
                    <Badge variant="outline">{analytics.content_stats.pending_review}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">AI Generated</span>
                    <Badge variant="outline" className="text-purple-600 border-purple-200 bg-purple-50">
                      {Math.round((analytics.content_stats.ai_generated / analytics.content_stats.total_posts) * 100)}%
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Engagement Metrics</CardTitle>
                <CardDescription>User interaction data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Avg. Time on Page</span>
                    <span className="font-medium">{Math.floor(analytics.performance_stats.avg_time_on_page / 60)}m {analytics.performance_stats.avg_time_on_page % 60}s</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Bounce Rate</span>
                    <span className="font-medium">{analytics.performance_stats.bounce_rate}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Calculator Clicks</span>
                    <span className="font-medium">{analytics.performance_stats.calculator_clicks}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Impact</CardTitle>
                <CardDescription>AdSense performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">AdSense Revenue</span>
                    <span className="font-medium text-green-600">${analytics.performance_stats.adsense_revenue}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Revenue per View</span>
                    <span className="font-medium">${(analytics.performance_stats.adsense_revenue / analytics.performance_stats.total_views * 1000).toFixed(3)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">ROI</span>
                    <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                      {Math.round((analytics.performance_stats.adsense_revenue / analytics.cost_stats.monthly_total) * 100)}%
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
