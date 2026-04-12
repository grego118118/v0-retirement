-- AI Blog System Database Schema for Massachusetts Retirement System
-- Extends existing blog functionality with AI content generation capabilities

-- Blog posts table extensions (if not exists, create base table)
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  featured_image_url TEXT,
  author_id UUID REFERENCES auth.users(id),
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  view_count INTEGER DEFAULT 0,
  seo_title TEXT,
  seo_description TEXT,
  seo_keywords TEXT[]
);

-- Add AI-specific columns to blog_posts
ALTER TABLE blog_posts 
ADD COLUMN IF NOT EXISTS is_ai_generated BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS ai_model_used TEXT,
ADD COLUMN IF NOT EXISTS ai_generation_prompt TEXT,
ADD COLUMN IF NOT EXISTS ai_generation_cost DECIMAL(10,4),
ADD COLUMN IF NOT EXISTS content_quality_score INTEGER CHECK (content_quality_score >= 0 AND content_quality_score <= 100),
ADD COLUMN IF NOT EXISTS fact_check_status TEXT DEFAULT 'pending' CHECK (fact_check_status IN ('pending', 'approved', 'needs_review', 'rejected')),
ADD COLUMN IF NOT EXISTS scheduled_publish_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS auto_generated_tags TEXT[],
ADD COLUMN IF NOT EXISTS internal_links_added BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS seo_optimized BOOLEAN DEFAULT FALSE;

-- Blog categories for Massachusetts retirement topics
CREATE TABLE IF NOT EXISTS blog_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#3B82F6',
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  is_ai_topic BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert Massachusetts-specific blog categories
INSERT INTO blog_categories (name, slug, description, color, icon, is_ai_topic) VALUES
('Pension Planning', 'pension-planning', 'Strategies for maximizing Massachusetts pension benefits', '#059669', '💰', TRUE),
('COLA Adjustments', 'cola-adjustments', 'Cost of Living Adjustment updates and impact analysis', '#DC2626', '📈', TRUE),
('Group Classifications', 'group-classifications', 'Retirement guidance for Groups 1-4 employees', '#7C3AED', '👥', TRUE),
('Social Security Integration', 'social-security', 'Coordinating Massachusetts pensions with Social Security', '#2563EB', '🏛️', TRUE),
('Retirement Timing', 'retirement-timing', 'Optimal retirement age and timing strategies', '#EA580C', '⏰', TRUE),
('Benefit Calculations', 'benefit-calculations', 'Understanding pension calculation methods', '#0891B2', '🧮', TRUE),
('Legislative Updates', 'legislative-updates', 'Massachusetts retirement law changes and updates', '#BE185D', '📜', TRUE),
('Financial Planning', 'financial-planning', 'Comprehensive retirement financial planning', '#16A34A', '📊', TRUE)
ON CONFLICT (slug) DO NOTHING;

-- Blog post categories junction table
CREATE TABLE IF NOT EXISTS blog_post_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
  category_id UUID REFERENCES blog_categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, category_id)
);

-- AI content generation jobs for scheduling and tracking
CREATE TABLE IF NOT EXISTS ai_content_jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_type TEXT NOT NULL CHECK (job_type IN ('scheduled_post', 'topic_research', 'content_update', 'seo_optimization')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
  topic TEXT NOT NULL,
  category_id UUID REFERENCES blog_categories(id),
  target_publish_date TIMESTAMP WITH TIME ZONE,
  ai_model TEXT DEFAULT 'gpt-4',
  generation_prompt TEXT,
  generated_post_id UUID REFERENCES blog_posts(id),
  error_message TEXT,
  cost_estimate DECIMAL(10,4),
  actual_cost DECIMAL(10,4),
  execution_time_seconds INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id)
);

-- Content review workflow
CREATE TABLE IF NOT EXISTS content_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES auth.users(id),
  review_status TEXT NOT NULL CHECK (review_status IN ('pending', 'approved', 'needs_changes', 'rejected')),
  review_notes TEXT,
  fact_check_completed BOOLEAN DEFAULT FALSE,
  seo_check_completed BOOLEAN DEFAULT FALSE,
  content_quality_rating INTEGER CHECK (content_quality_rating >= 1 AND content_quality_rating <= 5),
  suggested_changes TEXT,
  reviewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI content templates for consistent generation
CREATE TABLE IF NOT EXISTS ai_content_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  category_id UUID REFERENCES blog_categories(id),
  template_type TEXT NOT NULL CHECK (template_type IN ('blog_post', 'newsletter', 'guide', 'update')),
  system_prompt TEXT NOT NULL,
  user_prompt_template TEXT NOT NULL,
  expected_word_count INTEGER DEFAULT 1000,
  seo_focus_keywords TEXT[],
  internal_link_targets TEXT[],
  is_active BOOLEAN DEFAULT TRUE,
  usage_count INTEGER DEFAULT 0,
  average_quality_score DECIMAL(3,1),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default content templates
INSERT INTO ai_content_templates (name, description, category_id, template_type, system_prompt, user_prompt_template, expected_word_count, seo_focus_keywords, internal_link_targets) VALUES
(
  'Massachusetts Pension Guide',
  'Comprehensive guide template for Massachusetts pension topics',
  (SELECT id FROM blog_categories WHERE slug = 'pension-planning'),
  'blog_post',
  'You are an expert on Massachusetts public employee retirement benefits. Write accurate, helpful content that explains complex retirement concepts in simple terms. Always include disclaimers about seeking official guidance.',
  'Write a comprehensive blog post about {topic} for Massachusetts public employees. Include practical examples, current regulations, and actionable advice. Target word count: {word_count}. Focus on SEO keywords: {keywords}.',
  1200,
  ARRAY['Massachusetts pension', 'retirement benefits', 'public employee'],
  ARRAY['/calculator', '/benefits', '/groups']
),
(
  'COLA Update Analysis',
  'Template for Cost of Living Adjustment updates and analysis',
  (SELECT id FROM blog_categories WHERE slug = 'cola-adjustments'),
  'blog_post',
  'You are a financial analyst specializing in Massachusetts public employee benefits. Explain COLA adjustments clearly with specific examples and calculations.',
  'Analyze the latest COLA adjustment for Massachusetts retirees. Explain the {percentage}% adjustment, its impact on different benefit levels, and what retirees can expect. Include specific dollar examples.',
  800,
  ARRAY['COLA adjustment', 'Massachusetts retirement', 'cost of living'],
  ARRAY['/calculator', '/cola-calculator']
),
(
  'Group Classification Guide',
  'Template for explaining different employee group classifications',
  (SELECT id FROM blog_categories WHERE slug = 'group-classifications'),
  'blog_post',
  'You are an expert on Massachusetts retirement system classifications. Explain the differences between Groups 1-4 clearly with specific examples of job classifications and benefit differences.',
  'Create a detailed guide explaining Massachusetts retirement Group {group_number} classification. Include eligibility requirements, benefit calculations, minimum retirement ages, and career examples.',
  1000,
  ARRAY['Group {group_number}', 'Massachusetts retirement groups', 'public safety retirement'],
  ARRAY['/calculator', '/groups', '/benefits']
);

-- Content performance analytics
CREATE TABLE IF NOT EXISTS blog_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  page_views INTEGER DEFAULT 0,
  unique_visitors INTEGER DEFAULT 0,
  time_on_page_seconds INTEGER DEFAULT 0,
  bounce_rate DECIMAL(5,2),
  social_shares INTEGER DEFAULT 0,
  calculator_clicks INTEGER DEFAULT 0,
  adsense_revenue DECIMAL(10,4),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, date)
);

-- AI cost tracking
CREATE TABLE IF NOT EXISTS ai_usage_costs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  service_provider TEXT NOT NULL, -- 'openai', 'anthropic', 'stability'
  service_type TEXT NOT NULL, -- 'text_generation', 'image_generation', 'fact_checking'
  tokens_used INTEGER,
  api_calls INTEGER DEFAULT 0,
  cost_usd DECIMAL(10,4) NOT NULL,
  post_id UUID REFERENCES blog_posts(id),
  job_id UUID REFERENCES ai_content_jobs(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_blog_posts_ai_generated ON blog_posts(is_ai_generated);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_scheduled_publish ON blog_posts(scheduled_publish_at);
CREATE INDEX IF NOT EXISTS idx_ai_content_jobs_status ON ai_content_jobs(status);
CREATE INDEX IF NOT EXISTS idx_ai_content_jobs_target_date ON ai_content_jobs(target_publish_date);
CREATE INDEX IF NOT EXISTS idx_content_reviews_status ON content_reviews(review_status);
CREATE INDEX IF NOT EXISTS idx_blog_analytics_date ON blog_analytics(date);
CREATE INDEX IF NOT EXISTS idx_ai_usage_costs_date ON ai_usage_costs(date);

-- Row Level Security (RLS) policies
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_post_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_content_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_content_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_usage_costs ENABLE ROW LEVEL SECURITY;

-- Public read access for published blog posts
CREATE POLICY "Public can read published blog posts" ON blog_posts
  FOR SELECT USING (status = 'published');

-- Public read access for blog categories
CREATE POLICY "Public can read blog categories" ON blog_categories
  FOR SELECT USING (true);

-- Admin access for content management
CREATE POLICY "Admins can manage all blog content" ON blog_posts
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can manage AI jobs" ON ai_content_jobs
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can manage reviews" ON content_reviews
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Functions for automated tasks
CREATE OR REPLACE FUNCTION update_blog_post_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_blog_post_updated_at();

-- Function to generate blog post slug
CREATE OR REPLACE FUNCTION generate_blog_slug(title TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN lower(regexp_replace(regexp_replace(title, '[^a-zA-Z0-9\s]', '', 'g'), '\s+', '-', 'g'));
END;
$$ LANGUAGE plpgsql;
