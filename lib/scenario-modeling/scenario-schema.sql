-- Retirement Scenario Modeling Database Schema Extension
-- Adds tables for storing and managing retirement scenarios

-- Main scenarios table
CREATE TABLE IF NOT EXISTS retirement_scenarios (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    is_baseline BOOLEAN DEFAULT FALSE,
    
    -- Scenario parameters stored as JSON for flexibility
    personal_parameters TEXT NOT NULL, -- JSON
    pension_parameters TEXT NOT NULL, -- JSON
    social_security_parameters TEXT NOT NULL, -- JSON
    financial_parameters TEXT NOT NULL, -- JSON
    tax_parameters TEXT NOT NULL, -- JSON
    cola_parameters TEXT NOT NULL, -- JSON
    
    -- Metadata
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES User(id) ON DELETE CASCADE
);

-- Scenario results table (calculated outcomes)
CREATE TABLE IF NOT EXISTS scenario_results (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    scenario_id TEXT NOT NULL,
    
    -- Core calculations
    pension_monthly_benefit REAL NOT NULL,
    pension_annual_benefit REAL NOT NULL,
    pension_lifetime_benefits REAL NOT NULL,
    pension_benefit_reduction REAL DEFAULT 0,
    pension_survivor_benefit REAL,
    
    ss_monthly_benefit REAL NOT NULL,
    ss_annual_benefit REAL NOT NULL,
    ss_lifetime_benefits REAL NOT NULL,
    ss_spousal_benefit REAL,
    ss_survivor_benefit REAL,
    
    -- Combined income
    total_monthly_income REAL NOT NULL,
    total_annual_income REAL NOT NULL,
    net_after_tax_income REAL NOT NULL,
    replacement_ratio REAL NOT NULL,
    
    -- Tax analysis
    annual_tax_burden REAL NOT NULL,
    effective_tax_rate REAL NOT NULL,
    marginal_tax_rate REAL NOT NULL,
    federal_tax REAL NOT NULL,
    state_tax REAL NOT NULL,
    social_security_tax REAL NOT NULL,
    
    -- Portfolio analysis (optional)
    initial_portfolio_balance REAL,
    final_portfolio_balance REAL,
    total_withdrawals REAL,
    portfolio_longevity REAL,
    probability_of_success REAL,
    
    -- Key metrics
    total_lifetime_income REAL NOT NULL,
    break_even_age REAL,
    risk_score REAL NOT NULL,
    flexibility_score REAL NOT NULL,
    optimization_score REAL NOT NULL,
    
    -- Detailed projections stored as JSON
    yearly_projections TEXT, -- JSON array of yearly data
    
    calculated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (scenario_id) REFERENCES retirement_scenarios(id) ON DELETE CASCADE
);

-- Scenario comparisons table (for saved comparisons)
CREATE TABLE IF NOT EXISTS scenario_comparisons (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    
    -- Scenarios included in this comparison
    scenario_ids TEXT NOT NULL, -- JSON array of scenario IDs
    
    -- Comparison results stored as JSON
    comparison_metrics TEXT NOT NULL, -- JSON
    recommendations TEXT NOT NULL, -- JSON array
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES User(id) ON DELETE CASCADE
);

-- Scenario templates table (predefined scenarios)
CREATE TABLE IF NOT EXISTS scenario_templates (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL, -- 'retirement_age', 'benefit_option', 'investment', 'tax', 'custom'
    
    -- Template parameters stored as JSON
    parameters TEXT NOT NULL, -- JSON partial scenario
    
    is_popular BOOLEAN DEFAULT FALSE,
    applicable_groups TEXT NOT NULL, -- JSON array of retirement groups
    display_order INTEGER DEFAULT 0,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Scenario sharing table (for sharing scenarios with advisors/family)
CREATE TABLE IF NOT EXISTS scenario_shares (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    scenario_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    
    share_token TEXT UNIQUE NOT NULL, -- Unique token for accessing shared scenario
    recipient_email TEXT,
    recipient_name TEXT,
    
    -- Access control
    expires_at DATETIME,
    is_active BOOLEAN DEFAULT TRUE,
    view_count INTEGER DEFAULT 0,
    last_viewed_at DATETIME,
    
    -- Permissions
    can_view_details BOOLEAN DEFAULT TRUE,
    can_download_pdf BOOLEAN DEFAULT FALSE,
    can_duplicate BOOLEAN DEFAULT FALSE,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (scenario_id) REFERENCES retirement_scenarios(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES User(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_retirement_scenarios_user_id ON retirement_scenarios(user_id);
CREATE INDEX IF NOT EXISTS idx_retirement_scenarios_created_at ON retirement_scenarios(created_at);
CREATE INDEX IF NOT EXISTS idx_retirement_scenarios_is_baseline ON retirement_scenarios(is_baseline);

CREATE INDEX IF NOT EXISTS idx_scenario_results_scenario_id ON scenario_results(scenario_id);
CREATE INDEX IF NOT EXISTS idx_scenario_results_calculated_at ON scenario_results(calculated_at);

CREATE INDEX IF NOT EXISTS idx_scenario_comparisons_user_id ON scenario_comparisons(user_id);
CREATE INDEX IF NOT EXISTS idx_scenario_comparisons_created_at ON scenario_comparisons(created_at);

CREATE INDEX IF NOT EXISTS idx_scenario_templates_category ON scenario_templates(category);
CREATE INDEX IF NOT EXISTS idx_scenario_templates_is_popular ON scenario_templates(is_popular);
CREATE INDEX IF NOT EXISTS idx_scenario_templates_display_order ON scenario_templates(display_order);

CREATE INDEX IF NOT EXISTS idx_scenario_shares_scenario_id ON scenario_shares(scenario_id);
CREATE INDEX IF NOT EXISTS idx_scenario_shares_share_token ON scenario_shares(share_token);
CREATE INDEX IF NOT EXISTS idx_scenario_shares_user_id ON scenario_shares(user_id);
CREATE INDEX IF NOT EXISTS idx_scenario_shares_expires_at ON scenario_shares(expires_at);

-- Insert default scenario templates
INSERT OR IGNORE INTO scenario_templates (id, name, description, category, parameters, is_popular, applicable_groups, display_order) VALUES
('early_retirement_62', 'Early Retirement at 62', 'Retire as early as possible with reduced benefits', 'retirement_age', 
 '{"personalParameters":{"retirementAge":62},"socialSecurityParameters":{"claimingAge":62}}', 
 TRUE, '["1","2","3","4"]', 1),

('full_retirement_67', 'Full Retirement at 67', 'Retire at full Social Security age with full benefits', 'retirement_age',
 '{"personalParameters":{"retirementAge":67},"socialSecurityParameters":{"claimingAge":67}}',
 TRUE, '["1","2","3","4"]', 2),

('delayed_retirement_70', 'Delayed Retirement at 70', 'Maximize benefits by delaying retirement', 'retirement_age',
 '{"personalParameters":{"retirementAge":70},"socialSecurityParameters":{"claimingAge":70}}',
 TRUE, '["1","2","3","4"]', 3),

('option_a_full', 'Option A - Full Benefits', 'Maximum pension with no survivor benefits', 'benefit_option',
 '{"pensionParameters":{"retirementOption":"A"}}',
 TRUE, '["1","2","3","4"]', 4),

('option_b_survivor', 'Option B - 66% Survivor Benefits', 'Reduced pension with survivor benefits', 'benefit_option',
 '{"pensionParameters":{"retirementOption":"B"}}',
 TRUE, '["1","2","3","4"]', 5),

('option_c_survivor', 'Option C - 50% Survivor Benefits', 'Reduced pension with 50% survivor benefits', 'benefit_option',
 '{"pensionParameters":{"retirementOption":"C"}}',
 TRUE, '["1","2","3","4"]', 6),

('conservative_investment', 'Conservative Investment Strategy', 'Lower risk, stable returns approach', 'investment',
 '{"financialParameters":{"riskTolerance":"conservative","expectedReturnRate":0.04,"withdrawalRate":0.035}}',
 FALSE, '["1","2","3","4"]', 7),

('moderate_investment', 'Moderate Investment Strategy', 'Balanced risk and return approach', 'investment',
 '{"financialParameters":{"riskTolerance":"moderate","expectedReturnRate":0.06,"withdrawalRate":0.04}}',
 TRUE, '["1","2","3","4"]', 8),

('aggressive_investment', 'Aggressive Investment Strategy', 'Higher risk, higher potential returns', 'investment',
 '{"financialParameters":{"riskTolerance":"aggressive","expectedReturnRate":0.08,"withdrawalRate":0.045}}',
 FALSE, '["1","2","3","4"]', 9),

('tax_optimized', 'Tax-Optimized Strategy', 'Minimize tax burden through strategic planning', 'tax',
 '{"taxParameters":{"taxOptimizationStrategy":"advanced","rothConversions":true,"taxLossHarvesting":true}}',
 FALSE, '["1","2","3","4"]', 10);

-- Trigger to update updated_at timestamp
CREATE TRIGGER IF NOT EXISTS update_retirement_scenarios_updated_at 
    AFTER UPDATE ON retirement_scenarios
    FOR EACH ROW
    BEGIN
        UPDATE retirement_scenarios SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

CREATE TRIGGER IF NOT EXISTS update_scenario_comparisons_updated_at 
    AFTER UPDATE ON scenario_comparisons
    FOR EACH ROW
    BEGIN
        UPDATE scenario_comparisons SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

CREATE TRIGGER IF NOT EXISTS update_scenario_templates_updated_at 
    AFTER UPDATE ON scenario_templates
    FOR EACH ROW
    BEGIN
        UPDATE scenario_templates SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;
