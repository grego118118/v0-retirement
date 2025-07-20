/**
 * TypeScript types for AI Blog System
 * Massachusetts Retirement System - Automated Content Generation
 */

export interface BlogPost {
  id: string
  title: string
  slug: string
  content: string
  excerpt?: string
  featured_image_url?: string
  author_id?: string
  published_at?: string
  created_at: string
  updated_at: string
  status: 'draft' | 'published' | 'archived'
  view_count: number
  seo_title?: string
  seo_description?: string
  seo_keywords?: string[]
  
  // AI-specific fields
  is_ai_generated: boolean
  ai_model_used?: string
  ai_generation_prompt?: string
  ai_generation_cost?: number
  content_quality_score?: number
  fact_check_status: 'pending' | 'approved' | 'needs_review' | 'rejected'
  scheduled_publish_at?: string
  auto_generated_tags?: string[]
  internal_links_added: boolean
  seo_optimized: boolean
}

export interface BlogCategory {
  id: string
  name: string
  slug: string
  description?: string
  color: string
  icon?: string
  sort_order: number
  is_ai_topic: boolean
  created_at: string
}

export interface BlogPostCategory {
  id: string
  post_id: string
  category_id: string
  created_at: string
}

export interface AIContentJob {
  id: string
  job_type: 'scheduled_post' | 'topic_research' | 'content_update' | 'seo_optimization'
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
  topic: string
  category_id?: string
  target_publish_date?: string
  ai_model: string
  generation_prompt?: string
  generated_post_id?: string
  error_message?: string
  cost_estimate?: number
  actual_cost?: number
  execution_time_seconds?: number
  created_at: string
  started_at?: string
  completed_at?: string
  created_by?: string
}

export interface ContentReview {
  id: string
  post_id: string
  reviewer_id?: string
  review_status: 'pending' | 'approved' | 'needs_changes' | 'rejected'
  review_notes?: string
  fact_check_completed: boolean
  seo_check_completed: boolean
  content_quality_rating?: number
  suggested_changes?: string
  reviewed_at: string
  created_at: string
}

export interface AIContentTemplate {
  id: string
  name: string
  description?: string
  category_id?: string
  template_type: 'blog_post' | 'newsletter' | 'guide' | 'update'
  system_prompt: string
  user_prompt_template: string
  expected_word_count: number
  seo_focus_keywords?: string[]
  internal_link_targets?: string[]
  is_active: boolean
  usage_count: number
  average_quality_score?: number
  created_at: string
  updated_at: string
}

export interface BlogAnalytics {
  id: string
  post_id: string
  date: string
  page_views: number
  unique_visitors: number
  time_on_page_seconds: number
  bounce_rate?: number
  social_shares: number
  calculator_clicks: number
  adsense_revenue?: number
  created_at: string
}

export interface AIUsageCost {
  id: string
  date: string
  service_provider: 'openai' | 'anthropic' | 'stability' | 'google'
  service_type: 'text_generation' | 'image_generation' | 'fact_checking'
  tokens_used?: number
  api_calls: number
  cost_usd: number
  post_id?: string
  job_id?: string
  created_at: string
}

// Extended types with relations
export interface BlogPostWithCategories extends BlogPost {
  categories: BlogCategory[]
  reviews?: ContentReview[]
  analytics?: BlogAnalytics[]
}

export interface BlogCategoryWithPosts extends BlogCategory {
  posts: BlogPost[]
  post_count: number
}

export interface AIContentJobWithDetails extends AIContentJob {
  category?: BlogCategory
  generated_post?: BlogPost
  cost_breakdown?: AIUsageCost[]
}

// Content generation request types
export interface ContentGenerationRequest {
  topic: {
    title: string
    description?: string
    keywords?: string[]
  }
  category_id: string
  template_id?: string
  target_word_count?: number
  word_count?: number
  target_audience?: string
  content_type?: string
  additional_context?: string
  seo_keywords?: string[]
  target_publish_date?: string
  ai_model?: 'gpt-4' | 'gpt-3.5-turbo' | 'claude-3-opus' | 'claude-3-sonnet' | 'gemini-1.5-pro'
  include_images?: boolean
  auto_publish?: boolean
}

export interface ContentGenerationResponse {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string
  meta_description: string
  keywords: string[]
  word_count: number
  reading_time: number
  ai_model: string
  generation_time: string
  cost_estimate: number
  quality_score: number
  seo_optimized: boolean
  fact_checked: boolean
  status: 'queued' | 'processing' | 'completed' | 'failed'
  auto_generated_tags: string[]
  seo_title: string
  seo_description: string
  seo_keywords: string
}

// Massachusetts-specific content types
export interface MassachusettsRetirementTopic {
  id: string
  title: string
  description: string
  category: string
  keywords: string[]
  target_groups: ('Group 1' | 'Group 2' | 'Group 3' | 'Group 4')[]
  complexity_level: 'beginner' | 'intermediate' | 'advanced'
  seasonal_relevance?: string[]
  related_calculators: string[]
  official_sources: string[]
}

// Content quality metrics
export interface ContentQualityMetrics {
  readability_score: number
  seo_score: number
  fact_accuracy_score: number
  engagement_potential: number
  massachusetts_relevance: number
  overall_quality: number
  improvement_suggestions: string[]
}

// AI service configuration
export interface AIServiceConfig {
  provider: 'openai' | 'anthropic' | 'stability' | 'google'
  model: string
  api_key: string
  max_tokens?: number
  temperature?: number
  cost_per_token?: number
  rate_limit?: {
    requests_per_minute: number
    tokens_per_minute: number
  }
}

// Content scheduling types
export interface ContentSchedule {
  id: string
  name: string
  description?: string
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly'
  day_of_week?: number
  day_of_month?: number
  time_of_day: string
  categories: string[]
  is_active: boolean
  next_execution: string
  last_execution?: string
}

// Blog management dashboard types
export interface BlogDashboardStats {
  total_posts: number
  ai_generated_posts: number
  pending_reviews: number
  scheduled_posts: number
  monthly_views: number
  monthly_adsense_revenue: number
  ai_costs_this_month: number
  top_performing_posts: BlogPost[]
  recent_ai_jobs: AIContentJob[]
}

// Content approval workflow
export interface ApprovalWorkflow {
  post_id: string
  current_step: 'ai_generation' | 'fact_check' | 'seo_review' | 'content_review' | 'final_approval'
  steps_completed: string[]
  assigned_reviewers: string[]
  deadline?: string
  priority: 'low' | 'medium' | 'high'
  notes: string[]
}

// SEO optimization types
export interface SEOOptimization {
  target_keywords: string[]
  meta_title: string
  meta_description: string
  internal_links: {
    anchor_text: string
    target_url: string
    context: string
  }[]
  external_links: {
    anchor_text: string
    target_url: string
    domain: string
  }[]
  readability_improvements: string[]
  keyword_density: Record<string, number>
}

// Image generation types
export interface ImageGenerationRequest {
  prompt: string
  style: 'professional' | 'infographic' | 'illustration' | 'photo'
  dimensions: '1024x1024' | '1792x1024' | '1024x1792'
  post_id?: string
  alt_text: string
}

export interface GeneratedImage {
  id: string
  url: string
  alt_text: string
  prompt_used: string
  style: string
  dimensions: string
  cost: number
  created_at: string
}

// Error handling types
export interface AIServiceError {
  code: string
  message: string
  details?: Record<string, any>
  retry_after?: number
  cost_incurred?: number
}

// Fact-checking types
export interface FactCheckResult {
  claim: string
  verification_status: 'verified' | 'disputed' | 'unverified' | 'false'
  sources: string[]
  confidence_score: number
  notes?: string
}

export interface FactCheckReport {
  post_id: string
  claims_checked: FactCheckResult[]
  overall_accuracy: number
  flagged_content: string[]
  recommended_changes: string[]
  checked_at: string
  checker_id?: string
}
