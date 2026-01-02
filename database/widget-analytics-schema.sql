-- Widget Analytics Schema
-- Tracks embed widget usage, calculations, and partner metrics

-- Raw events table for detailed analytics
CREATE TABLE IF NOT EXISTS widget_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type VARCHAR(50) NOT NULL, -- widget_load, widget_calculate, widget_cta_click, widget_error
  partner_id VARCHAR(100),
  retirement_group VARCHAR(20),
  theme VARCHAR(20),
  referrer TEXT,
  user_agent TEXT,
  event_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  metadata JSONB DEFAULT '{}',
  ip_hash VARCHAR(64), -- Hashed IP for geo (optional)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_widget_analytics_event_type ON widget_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_widget_analytics_partner_id ON widget_analytics(partner_id);
CREATE INDEX IF NOT EXISTS idx_widget_analytics_event_timestamp ON widget_analytics(event_timestamp);
CREATE INDEX IF NOT EXISTS idx_widget_analytics_partner_date ON widget_analytics(partner_id, event_timestamp);

-- Daily aggregated stats per partner for efficient dashboards
CREATE TABLE IF NOT EXISTS widget_partner_daily_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  partner_id VARCHAR(100) NOT NULL,
  date DATE NOT NULL,
  loads INTEGER DEFAULT 0,
  calculations INTEGER DEFAULT 0,
  cta_clicks INTEGER DEFAULT 0,
  errors INTEGER DEFAULT 0,
  unique_referrers INTEGER DEFAULT 0,
  avg_calculation_pension DECIMAL(12, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(partner_id, date)
);

CREATE INDEX IF NOT EXISTS idx_widget_partner_stats_date ON widget_partner_daily_stats(date);
CREATE INDEX IF NOT EXISTS idx_widget_partner_stats_partner ON widget_partner_daily_stats(partner_id);

-- Function to increment partner daily stats (upsert)
CREATE OR REPLACE FUNCTION increment_widget_partner_stats(
  p_partner_id VARCHAR(100),
  p_date DATE,
  p_loads INTEGER DEFAULT 0,
  p_calculations INTEGER DEFAULT 0,
  p_cta_clicks INTEGER DEFAULT 0
)
RETURNS void AS $$
BEGIN
  INSERT INTO widget_partner_daily_stats (partner_id, date, loads, calculations, cta_clicks)
  VALUES (p_partner_id, p_date, p_loads, p_calculations, p_cta_clicks)
  ON CONFLICT (partner_id, date)
  DO UPDATE SET
    loads = widget_partner_daily_stats.loads + EXCLUDED.loads,
    calculations = widget_partner_daily_stats.calculations + EXCLUDED.calculations,
    cta_clicks = widget_partner_daily_stats.cta_clicks + EXCLUDED.cta_clicks,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Global daily stats (all widgets combined)
CREATE TABLE IF NOT EXISTS widget_global_daily_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  total_loads INTEGER DEFAULT 0,
  total_calculations INTEGER DEFAULT 0,
  total_cta_clicks INTEGER DEFAULT 0,
  total_errors INTEGER DEFAULT 0,
  unique_partners INTEGER DEFAULT 0,
  unique_referrers INTEGER DEFAULT 0,
  group_1_calculations INTEGER DEFAULT 0,
  group_2_calculations INTEGER DEFAULT 0,
  group_3_calculations INTEGER DEFAULT 0,
  group_4_calculations INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security (optional - enable if needed)
-- ALTER TABLE widget_analytics ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE widget_partner_daily_stats ENABLE ROW LEVEL SECURITY;

-- Cleanup old raw events (keep 90 days by default)
-- Run periodically via cron
CREATE OR REPLACE FUNCTION cleanup_old_widget_analytics()
RETURNS void AS $$
BEGIN
  DELETE FROM widget_analytics
  WHERE event_timestamp < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;

-- View for partner dashboard
CREATE OR REPLACE VIEW widget_partner_summary AS
SELECT 
  partner_id,
  SUM(loads) as total_loads,
  SUM(calculations) as total_calculations,
  SUM(cta_clicks) as total_cta_clicks,
  ROUND(SUM(calculations)::DECIMAL / NULLIF(SUM(loads), 0) * 100, 2) as conversion_rate,
  MIN(date) as first_activity,
  MAX(date) as last_activity,
  COUNT(DISTINCT date) as active_days
FROM widget_partner_daily_stats
GROUP BY partner_id;

-- Grant permissions (adjust as needed for your setup)
-- GRANT SELECT, INSERT ON widget_analytics TO authenticated;
-- GRANT SELECT ON widget_partner_daily_stats TO authenticated;
-- GRANT SELECT ON widget_partner_summary TO authenticated;

