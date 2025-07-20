"use client"

import { useState, useEffect } from 'react'
import { BlogPost, ContentReview, BlogCategory } from '@/types/ai-blog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AlertCircle, CheckCircle, Clock, Edit, Eye, Star, TrendingUp } from 'lucide-react'

/**
 * Admin Blog Review Dashboard
 * Massachusetts Retirement System - AI Content Review
 */
export default function BlogReviewPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null)
  const [reviewNotes, setReviewNotes] = useState('')
  const [reviewStatus, setReviewStatus] = useState<'pending' | 'approved' | 'needs_changes' | 'rejected'>('pending')
  const [qualityRating, setQualityRating] = useState<number>(3)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPendingPosts()
  }, [])

  const loadPendingPosts = async () => {
    try {
      // This would fetch from your API
      const mockPosts: BlogPost[] = [
        {
          id: '1',
          title: 'Maximizing Your Massachusetts Pension Benefits: A Complete Strategy Guide',
          slug: 'maximizing-massachusetts-pension-benefits',
          content: `# Maximizing Your Massachusetts Pension Benefits: A Complete Strategy Guide

Planning for retirement as a Massachusetts public employee requires understanding the unique benefits and opportunities available through the state's retirement system. This comprehensive guide will help you develop strategies to maximize your pension benefits and secure your financial future.

## Understanding Your Massachusetts Pension Foundation

The Massachusetts Retirement System provides defined benefit pensions for public employees across the state. Your pension calculation depends on three key factors:

- **Average Salary**: Based on your highest 3 consecutive years of earnings
- **Years of Service**: Total creditable service in the Massachusetts system  
- **Benefit Multiplier**: Percentage that increases with age and group classification

### Group Classifications and Their Impact

Massachusetts public employees are classified into four groups, each with different benefit structures:

**Group 1 (General Employees)**
- Includes teachers, clerks, administrative staff
- Minimum retirement age: 60
- Benefit multiplier: 2.0% at age 60, increasing to 2.5% at age 65

**Group 2 (Probation and Court Officers)**
- Minimum retirement age: 55
- Benefit multiplier: 2.0% at age 55, increasing to 2.5% at age 60

**Group 3 (State Police)**
- Can retire at any age with 20+ years of service
- Flat 2.5% benefit multiplier

**Group 4 (Public Safety)**
- Includes police, firefighters, corrections officers
- Minimum retirement age: 50
- Benefit multiplier: 2.0% at age 50, increasing to 2.5% at age 55

## Strategic Planning for Maximum Benefits

### 1. Optimize Your Average Salary Calculation

Your pension is calculated using your highest 3 consecutive years of earnings. Consider these strategies:

- **Time promotions strategically** to maximize your final years
- **Understand overtime inclusion** - some overtime counts toward your average
- **Consider working additional years** if salary increases significantly
- **Review sick leave and vacation payouts** that may count toward average salary

### 2. Maximize Your Service Credit

Every year of service credit directly impacts your pension amount:

- **Purchase military service credit** if you served in the armed forces
- **Buy back previous public service** from other Massachusetts positions
- **Understand sick leave credit** - unused sick leave can add to service time
- **Consider working part-time** in retirement-eligible positions to build credit

### 3. Strategic Retirement Timing

The timing of your retirement significantly affects your lifetime benefits:

- **Understand benefit multiplier increases** - waiting can increase your multiplier
- **Consider Social Security coordination** - timing affects both benefits
- **Evaluate health insurance options** - coverage changes at different ages
- **Plan for COLA timing** - Cost of Living Adjustments begin after retirement

## COLA Benefits and Long-Term Planning

Massachusetts provides a 3% annual Cost of Living Adjustment (COLA) on the first $13,000 of your annual pension benefit. This means:

- **Maximum annual COLA**: $390 per year
- **Compound growth**: COLA compounds annually for inflation protection
- **Immediate benefit**: Begins the first year after retirement

### COLA Impact Example

If you retire with a $40,000 annual pension:
- Year 1: $40,000 + $390 COLA = $40,390
- Year 2: $40,390 + $390 COLA = $40,780
- Year 10: Approximately $43,900 (with compounding)

## Pension Options: Choosing Wisely

Massachusetts offers three pension options:

**Option A (Straight Life)**
- 100% of calculated benefit
- No survivor benefit
- Best for single individuals or those with other survivor income

**Option B (Joint and Survivor)**
- Reduced benefit (1-5% reduction based on ages)
- 66.67% survivor benefit for beneficiary
- Good balance of current income and survivor protection

**Option C (Joint and Survivor)**
- Larger reduction in current benefit
- 100% survivor benefit for beneficiary
- Best when survivor needs full income protection

## Advanced Strategies

### Working After Retirement

Massachusetts allows limited post-retirement employment:
- **Earnings limit**: $30,000 annually without benefit suspension
- **Different rules by position**: Some positions have different limits
- **Timing considerations**: Wait periods may apply

### Social Security Coordination

Most Massachusetts public employees are eligible for Social Security:
- **Windfall Elimination Provision (WEP)**: May reduce Social Security benefits
- **Government Pension Offset (GPO)**: Affects spousal Social Security benefits
- **Strategic timing**: Coordinate both benefits for maximum lifetime income

### Tax Planning

Massachusetts pension benefits have specific tax implications:
- **State tax exemption**: Massachusetts doesn't tax pension benefits for residents
- **Federal taxation**: Pension benefits are federally taxable
- **Withholding strategies**: Plan for federal tax obligations

## Common Mistakes to Avoid

1. **Retiring too early**: Missing out on higher multipliers
2. **Not maximizing final salary**: Poor timing of career moves
3. **Ignoring service credit opportunities**: Missing military or sick leave credit
4. **Poor pension option choice**: Not considering survivor needs
5. **Inadequate tax planning**: Unexpected tax burdens in retirement

## Action Steps for Maximizing Benefits

1. **Request a pension estimate** from your retirement board
2. **Review your service record** for accuracy and missing credit
3. **Plan career moves strategically** to maximize final average salary
4. **Consider professional financial planning** for comprehensive retirement strategy
5. **Stay informed about law changes** that might affect your benefits

## Conclusion

Maximizing your Massachusetts pension benefits requires strategic planning throughout your career. By understanding the system's rules, timing your decisions carefully, and avoiding common mistakes, you can significantly increase your retirement security.

Remember that pension planning is just one part of comprehensive retirement planning. Consider working with a financial advisor familiar with Massachusetts public employee benefits to develop a complete strategy.

---

*This information is for educational purposes only and should not be considered official retirement advice. For official benefit estimates and guidance, contact your local retirement board or the Massachusetts State Retirement Board.*

**Ready to calculate your benefits?** Use our [Massachusetts Pension Calculator](/calculator) to estimate your retirement benefits based on your specific situation.`,
          excerpt: 'Planning for retirement as a Massachusetts public employee requires understanding the unique benefits and opportunities available through the state\'s retirement system...',
          status: 'draft',
          viewCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isAiGenerated: true,
          aiModelUsed: 'gpt-4-turbo-preview',
          aiGenerationPrompt: 'Maximizing Massachusetts pension benefits',
          contentQualityScore: 85,
          factCheckStatus: 'pending',
          scheduledPublishAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          autoGeneratedTags: ['Group 1', 'Group 2', 'Group 3', 'Group 4', 'COLA', 'Pension'],
          internalLinksAdded: false,
          seoOptimized: false,
          seoTitle: 'Maximizing Your Massachusetts Pension Benefits: Complete Guide',
          seoDescription: 'Learn strategies to maximize your Massachusetts pension benefits including timing, service credit, and pension options.',
          seoKeywords: ['Massachusetts pension', 'retirement benefits', 'public employee', 'pension maximization']
        }
      ]
      setPosts(mockPosts)
      setLoading(false)
    } catch (error) {
      console.error('Failed to load posts:', error)
      setLoading(false)
    }
  }

  const handleReview = async (postId: string, status: string, notes: string, rating: number) => {
    try {
      // This would submit to your API
      console.log('Submitting review:', { postId, status, notes, rating })
      
      // Update local state
      setPosts(posts.filter(p => p.id !== postId))
      setSelectedPost(null)
      setReviewNotes('')
      setReviewStatus('pending')
      setQualityRating(3)
    } catch (error) {
      console.error('Failed to submit review:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'approved': return 'bg-green-100 text-green-800'
      case 'needs_changes': return 'bg-orange-100 text-orange-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />
      case 'approved': return <CheckCircle className="w-4 h-4" />
      case 'needs_changes': return <AlertCircle className="w-4 h-4" />
      case 'rejected': return <AlertCircle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Loading posts for review...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">AI Content Review Dashboard</h1>
        <p className="text-gray-600 mt-2">Review and approve AI-generated blog posts for Massachusetts Retirement System</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Posts List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Pending Review ({posts.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedPost?.id === post.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedPost(post)}
                >
                  <h3 className="font-medium text-sm mb-2 line-clamp-2">{post.title}</h3>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={getStatusColor(post.factCheckStatus)}>
                      {getStatusIcon(post.factCheckStatus)}
                      <span className="ml-1 capitalize">{post.factCheckStatus}</span>
                    </Badge>
                    {post.contentQualityScore && (
                      <Badge variant="outline" className="text-xs">
                        <Star className="w-3 h-3 mr-1" />
                        {post.contentQualityScore}/100
                      </Badge>
                    )}
                  </div>

                  <div className="text-xs text-gray-500 space-y-1">
                    <div>Model: {post.aiModelUsed}</div>
                    <div>Created: {new Date(post.createdAt).toLocaleDateString()}</div>
                    {post.scheduledPublishAt && (
                      <div>Scheduled: {new Date(post.scheduledPublishAt).toLocaleDateString()}</div>
                    )}
                  </div>

                  {post.autoGeneratedTags && post.autoGeneratedTags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {post.autoGeneratedTags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {post.autoGeneratedTags.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{post.autoGeneratedTags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {posts.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
                  <p>No posts pending review</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Content Review */}
        <div className="lg:col-span-2">
          {selectedPost ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Review: {selectedPost.title}</span>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(selectedPost.factCheckStatus)}>
                      {getStatusIcon(selectedPost.factCheckStatus)}
                      <span className="ml-1 capitalize">{selectedPost.factCheckStatus}</span>
                    </Badge>
                    {selectedPost.contentQualityScore && (
                      <Badge variant="outline">
                        <TrendingUp className="w-4 h-4 mr-1" />
                        Quality: {selectedPost.contentQualityScore}/100
                      </Badge>
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="content" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="content">Content</TabsTrigger>
                    <TabsTrigger value="metadata">Metadata</TabsTrigger>
                    <TabsTrigger value="seo">SEO</TabsTrigger>
                    <TabsTrigger value="review">Review</TabsTrigger>
                  </TabsList>

                  <TabsContent value="content" className="space-y-4">
                    <div className="prose max-w-none">
                      <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
                        <pre className="whitespace-pre-wrap text-sm">{selectedPost.content}</pre>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="metadata" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">AI Model</label>
                        <p className="text-sm text-gray-600">{selectedPost.aiModelUsed}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Generation Prompt</label>
                        <p className="text-sm text-gray-600">{selectedPost.aiGenerationPrompt}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Word Count</label>
                        <p className="text-sm text-gray-600">{selectedPost.content.split(/\s+/).length} words</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Scheduled Publish</label>
                        <p className="text-sm text-gray-600">
                          {selectedPost.scheduledPublishAt
                            ? new Date(selectedPost.scheduledPublishAt).toLocaleString()
                            : 'Not scheduled'
                          }
                        </p>
                      </div>
                    </div>

                    {selectedPost.autoGeneratedTags && (
                      <div>
                        <label className="text-sm font-medium">Auto-Generated Tags</label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {selectedPost.autoGeneratedTags.map((tag) => (
                            <Badge key={tag} variant="secondary">{tag}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="seo" className="space-y-4">
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">SEO Title</label>
                        <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                          {selectedPost.seo_title || 'Not set'}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">SEO Description</label>
                        <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                          {selectedPost.seo_description || 'Not set'}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">SEO Keywords</label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {selectedPost.seo_keywords?.map((keyword) => (
                            <Badge key={keyword} variant="outline">{keyword}</Badge>
                          )) || <span className="text-sm text-gray-500">No keywords set</span>}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">Internal Links Added</label>
                          <p className="text-sm text-gray-600">
                            {selectedPost.internal_links_added ? 'Yes' : 'No'}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium">SEO Optimized</label>
                          <p className="text-sm text-gray-600">
                            {selectedPost.seoOptimized ? 'Yes' : 'No'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="review" className="space-y-4">
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Review Status</label>
                        <Select value={reviewStatus} onValueChange={(value: any) => setReviewStatus(value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="approved">Approve for Publishing</SelectItem>
                            <SelectItem value="needs_changes">Needs Changes</SelectItem>
                            <SelectItem value="rejected">Reject</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">Quality Rating (1-5)</label>
                        <Select value={qualityRating.toString()} onValueChange={(value) => setQualityRating(parseInt(value))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 - Poor</SelectItem>
                            <SelectItem value="2">2 - Below Average</SelectItem>
                            <SelectItem value="3">3 - Average</SelectItem>
                            <SelectItem value="4">4 - Good</SelectItem>
                            <SelectItem value="5">5 - Excellent</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">Review Notes</label>
                        <Textarea
                          value={reviewNotes}
                          onChange={(e) => setReviewNotes(e.target.value)}
                          placeholder="Add notes about content quality, accuracy, or needed changes..."
                          rows={4}
                        />
                      </div>

                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleReview(selectedPost.id, reviewStatus, reviewNotes, qualityRating)}
                          className="flex-1"
                        >
                          Submit Review
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setSelectedPost(null)
                            setReviewNotes('')
                            setReviewStatus('pending')
                            setQualityRating(3)
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center text-gray-500">
                  <Edit className="w-12 h-12 mx-auto mb-4" />
                  <p>Select a post from the list to review</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
