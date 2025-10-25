-- Massachusetts Retirement System - Production Database Optimization
-- PostgreSQL indexes and performance optimizations for production deployment

-- ============================================================================
-- USER AND AUTHENTICATION INDEXES
-- ============================================================================

-- Optimize user lookups by email (most common authentication query)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_email 
ON "User" (email) 
WHERE email IS NOT NULL;

-- Optimize session lookups for NextAuth.js
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_session_user_id 
ON "Session" (user_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_session_expires 
ON "Session" (expires) 
WHERE expires > NOW();

-- Optimize account lookups for OAuth providers
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_account_provider_account 
ON "Account" (provider, provider_account_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_account_user_id 
ON "Account" (user_id);

-- ============================================================================
-- USER PROFILE OPTIMIZATION
-- ============================================================================

-- Primary user profile lookup
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_profile_user_id 
ON "UserProfile" (user_id);

-- Optimize profile queries by retirement group (for analytics)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_profile_retirement_group 
ON "UserProfile" (retirement_group) 
WHERE retirement_group IS NOT NULL;

-- Optimize by planned retirement age (for targeting)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_profile_retirement_age 
ON "UserProfile" (planned_retirement_age) 
WHERE planned_retirement_age IS NOT NULL;

-- ============================================================================
-- RETIREMENT CALCULATIONS OPTIMIZATION
-- ============================================================================

-- Primary calculation lookups by user
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_retirement_calc_user_id 
ON "RetirementCalculation" (user_id);

-- Optimize by creation date for recent calculations
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_retirement_calc_created_at 
ON "RetirementCalculation" (created_at DESC);

-- Optimize favorite calculations lookup
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_retirement_calc_favorite 
ON "RetirementCalculation" (user_id, is_favorite) 
WHERE is_favorite = true;

-- Composite index for user calculations with pagination
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_retirement_calc_user_created 
ON "RetirementCalculation" (user_id, created_at DESC);

-- Optimize by retirement group for analytics
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_retirement_calc_group 
ON "RetirementCalculation" (retirement_group) 
WHERE retirement_group IS NOT NULL;

-- ============================================================================
-- SCENARIO MODELING OPTIMIZATION
-- ============================================================================

-- Primary scenario lookups by user
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_retirement_scenario_user_id 
ON "RetirementScenario" (user_id);

-- Optimize baseline scenario lookup (only one per user)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_retirement_scenario_baseline 
ON "RetirementScenario" (user_id, is_baseline) 
WHERE is_baseline = true;

-- Optimize scenario ordering and pagination
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_retirement_scenario_user_updated 
ON "RetirementScenario" (user_id, updated_at DESC);

-- Optimize scenario name searches
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_retirement_scenario_name 
ON "RetirementScenario" USING gin(to_tsvector('english', name));

-- ============================================================================
-- SCENARIO RESULTS OPTIMIZATION
-- ============================================================================

-- Primary scenario results lookup
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_scenario_result_scenario_id 
ON "ScenarioResult" (scenario_id);

-- Optimize by calculation date for freshness checks
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_scenario_result_calculated_at 
ON "ScenarioResult" (calculated_at DESC);

-- Composite index for scenario results with user context
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_scenario_result_user_scenario 
ON "ScenarioResult" (user_id, scenario_id);

-- ============================================================================
-- SCENARIO COMPARISONS OPTIMIZATION
-- ============================================================================

-- Primary comparison lookups by user
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_scenario_comparison_user_id 
ON "ScenarioComparison" (user_id);

-- Optimize by creation date for recent comparisons
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_scenario_comparison_created_at 
ON "ScenarioComparison" (created_at DESC);

-- Optimize comparison name searches
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_scenario_comparison_name 
ON "ScenarioComparison" USING gin(to_tsvector('english', name));

-- ============================================================================
-- ACTION ITEMS OPTIMIZATION
-- ============================================================================

-- Primary action items lookup by user
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_action_item_user_id 
ON "ActionItem" (user_id);

-- Optimize by status for active items
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_action_item_status 
ON "ActionItem" (user_id, status) 
WHERE status IN ('pending', 'in_progress');

-- Optimize by priority for urgent items
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_action_item_priority 
ON "ActionItem" (user_id, priority, created_at DESC) 
WHERE priority IN ('high', 'urgent');

-- Optimize by due date for upcoming items
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_action_item_due_date 
ON "ActionItem" (user_id, due_date) 
WHERE due_date IS NOT NULL AND due_date >= CURRENT_DATE;

-- ============================================================================
-- VERIFICATION TOKEN CLEANUP OPTIMIZATION
-- ============================================================================

-- Optimize verification token cleanup by expiration
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_verification_token_expires 
ON "VerificationToken" (expires) 
WHERE expires <= NOW();

-- ============================================================================
-- PERFORMANCE MONITORING INDEXES
-- ============================================================================

-- Create partial indexes for performance monitoring
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_retirement_calc_performance 
ON "RetirementCalculation" (created_at, user_id) 
WHERE created_at >= NOW() - INTERVAL '7 days';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_scenario_performance 
ON "RetirementScenario" (updated_at, user_id) 
WHERE updated_at >= NOW() - INTERVAL '7 days';

-- ============================================================================
-- ANALYTICS AND REPORTING INDEXES
-- ============================================================================

-- Optimize for usage analytics (without exposing user data)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_calc_analytics_date 
ON "RetirementCalculation" (DATE(created_at), retirement_group);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_scenario_analytics_date 
ON "RetirementScenario" (DATE(created_at));

-- ============================================================================
-- MAINTENANCE AND CLEANUP INDEXES
-- ============================================================================

-- Optimize for data cleanup operations
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_session_cleanup 
ON "Session" (expires) 
WHERE expires <= NOW();

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_old_calculations 
ON "RetirementCalculation" (created_at) 
WHERE created_at <= NOW() - INTERVAL '2 years';

-- ============================================================================
-- QUERY PERFORMANCE STATISTICS
-- ============================================================================

-- Enable query statistics collection for monitoring
-- (Run these as superuser in production)
-- CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- ============================================================================
-- VACUUM AND ANALYZE RECOMMENDATIONS
-- ============================================================================

-- Run these commands after index creation:
-- VACUUM ANALYZE "User";
-- VACUUM ANALYZE "UserProfile";
-- VACUUM ANALYZE "RetirementCalculation";
-- VACUUM ANALYZE "RetirementScenario";
-- VACUUM ANALYZE "ScenarioResult";
-- VACUUM ANALYZE "ScenarioComparison";
-- VACUUM ANALYZE "ActionItem";
-- VACUUM ANALYZE "Session";
-- VACUUM ANALYZE "Account";

-- ============================================================================
-- INDEX MONITORING QUERIES
-- ============================================================================

-- Monitor index usage (run periodically):
/*
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes 
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;
*/

-- Monitor table sizes:
/*
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
*/
