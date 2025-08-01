
-- Blog System Database Setup for Massachusetts Retirement System
-- This script creates all necessary tables and initial data

-- Create blog categories
INSERT INTO blog_categories (id, name, slug, description, color, is_active, sort_order, is_ai_topic, created_at) VALUES
('cat-mass-retirement', 'Massachusetts Retirement System', 'massachusetts-retirement', 'Comprehensive information about the Massachusetts Retirement System, benefits, and eligibility requirements.', '#1E40AF', true, 1, true, NOW()),
('cat-pension-calc', 'Pension Calculations', 'pension-calculations', 'How to calculate retirement benefits, multipliers, and pension options A, B, and C.', '#059669', true, 2, true, NOW()),
('cat-groups', 'Group Classifications', 'group-classifications', 'Understanding Groups 1-4, eligibility requirements, and minimum retirement ages.', '#DC2626', true, 3, true, NOW()),
('cat-cola', 'COLA Benefits', 'cola-benefits', 'Cost of living adjustments, 3% rate on first $13,000, and annual compounding.', '#7C2D12', true, 4, true, NOW()),
('cat-social-security', 'Social Security Integration', 'social-security', 'Combining Massachusetts pensions with Social Security benefits for optimal retirement income.', '#6B21A8', true, 5, true, NOW())
ON CONFLICT (slug) DO NOTHING;

-- Create sample blog posts
INSERT INTO blog_posts (
  id, title, slug, content, excerpt, status, is_ai_generated, ai_model_used, 
  view_count, fact_check_status, seo_title, seo_description, seo_keywords,
  published_at, created_at, updated_at, internal_links_added, seo_optimized
) VALUES
(
  'post-groups-guide',
  'Understanding Massachusetts Retirement System Groups 1-4',
  'understanding-massachusetts-retirement-groups',
  '# Understanding Massachusetts Retirement System Groups 1-4

The Massachusetts Retirement System classifies employees into four distinct groups, each with different eligibility requirements and retirement benefits.

## Group 1: General Employees
- **Minimum Retirement Age**: 60 years
- **Includes**: Most state and municipal employees
- **Benefit Multiplier**: 2.0% at age 60, increasing to 2.5% at age 65

## Group 2: Hazardous Duty
- **Minimum Retirement Age**: 55 years  
- **Includes**: Probation officers, court officers
- **Benefit Multiplier**: 2.0% at age 55, increasing to 2.5% at age 60

## Group 3: State Police
- **Minimum Retirement Age**: Any age with 20+ years of service
- **Includes**: Massachusetts State Police officers
- **Benefit Multiplier**: Flat 2.5% regardless of age

## Group 4: Public Safety
- **Minimum Retirement Age**: 50 years
- **Includes**: Police officers, firefighters, corrections officers
- **Benefit Multiplier**: 2.0% at age 50, increasing to 2.5% at age 55

Understanding your group classification is crucial for retirement planning and calculating your expected benefits.',
  'Learn about the four Massachusetts Retirement System groups and how your classification affects your retirement benefits and eligibility.',
  'published',
  true,
  'gemini-1.5-flash',
  1250,
  'approved',
  'Massachusetts Retirement System Groups 1-4 Explained | Mass Pension',
  'Complete guide to Massachusetts Retirement System groups 1-4, including eligibility, minimum retirement ages, and benefit multipliers for each classification.',
  ARRAY['massachusetts retirement system', 'retirement groups', 'pension benefits', 'group 1', 'group 2', 'group 3', 'group 4'],
  NOW(),
  NOW(),
  NOW(),
  false,
  true
),
(
  'post-cola-benefits',
  'How COLA Benefits Work in Massachusetts Retirement System',
  'cola-benefits-massachusetts-retirement',
  '# How COLA Benefits Work in Massachusetts Retirement System

Cost of Living Adjustments (COLA) help protect your Massachusetts retirement benefits from inflation.

## COLA Rate and Cap
- **Annual Rate**: 3% per year
- **Maximum Base**: First $13,000 of annual allowance only
- **Annual Cap**: $390 maximum increase per year

## How COLA Compounds
COLA benefits compound annually, meaning each year''s increase is calculated on the previous year''s adjusted amount.

### Example Calculation
- Year 1: $30,000 pension → COLA on first $13,000 = $390
- Year 2: $30,390 pension → COLA on first $13,000 = $390  
- Year 3: $30,780 pension → COLA on first $13,000 = $390

## COLA with Pension Options
COLA applies to all pension options:
- **Option A**: Full COLA on reduced benefit
- **Option B**: Full COLA on reduced benefit  
- **Option C**: Full COLA on reduced benefit

The COLA adjustment begins the first year after retirement and continues for life.',
  'Understand how Cost of Living Adjustments (COLA) work in the Massachusetts Retirement System, including the 3% rate and $390 annual cap.',
  'published',
  true,
  'gemini-1.5-flash',
  890,
  'approved',
  'Massachusetts Retirement COLA Benefits Explained | 3% Annual Increase',
  'Learn how COLA benefits work in Massachusetts Retirement System with 3% annual rate on first $13,000 and $390 maximum yearly increase.',
  ARRAY['massachusetts cola', 'cost of living adjustment', 'retirement benefits', '3 percent cola', 'pension increase'],
  NOW() - INTERVAL '1 day',
  NOW() - INTERVAL '1 day',
  NOW() - INTERVAL '1 day',
  false,
  true
)
ON CONFLICT (slug) DO NOTHING;

-- Link posts to categories
INSERT INTO blog_post_categories (post_id, category_id, created_at) VALUES
('post-groups-guide', 'cat-groups', NOW()),
('post-cola-benefits', 'cat-cola', NOW())
ON CONFLICT (post_id, category_id) DO NOTHING;
