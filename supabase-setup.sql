-- du.finance - Global Investment Clock Database Setup
-- Complete database schema setup for production deployment
-- Run this entire script in your Supabase SQL Editor

-- =============================================================================
-- 1. CORE TABLES
-- =============================================================================

-- Table to store economic indicators for different countries
CREATE TABLE IF NOT EXISTS economic_indicators (
    id BIGSERIAL PRIMARY KEY,
    country_code VARCHAR(3) NOT NULL, -- ISO 3166-1 alpha-3 country code (e.g., 'USA', 'GBR')
    country_name VARCHAR(100) NOT NULL,
    indicator_type VARCHAR(50) NOT NULL, -- 'pmi_composite', 'pmi_manufacturing', 'cpi_yoy', 'core_pce', 'gdp_now'
    value DECIMAL(10, 4) NOT NULL,
    previous_value DECIMAL(10, 4),
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table to store historical data for sparklines
CREATE TABLE IF NOT EXISTS historical_indicators (
    id BIGSERIAL PRIMARY KEY,
    country_code VARCHAR(3) NOT NULL,
    indicator_type VARCHAR(50) NOT NULL,
    value DECIMAL(10, 4) NOT NULL,
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table to store Investment Clock positions (legacy support, now calculated on-the-fly)
CREATE TABLE IF NOT EXISTS investment_clock_positions (
    id BIGSERIAL PRIMARY KEY,
    country_code VARCHAR(3) NOT NULL,
    country_name VARCHAR(100) NOT NULL,
    growth_trend DECIMAL(5, 2) NOT NULL, -- Y-axis: -100 to 100
    inflation_trend DECIMAL(5, 2) NOT NULL, -- X-axis: -100 to 100
    quadrant VARCHAR(20) NOT NULL, -- 'recovery', 'overheat', 'stagflation', 'recession'
    date DATE NOT NULL,
    ai_generated BOOLEAN DEFAULT FALSE,
    confidence DECIMAL(5, 2),
    reasoning TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for AI analysis history (primary source for AI-generated positions)
CREATE TABLE IF NOT EXISTS ai_analysis_history (
    id BIGSERIAL PRIMARY KEY,
    country_code VARCHAR(3) NOT NULL,
    country_name VARCHAR(100) NOT NULL,
    analysis_date DATE NOT NULL,
    growth_trend DECIMAL(5, 2) NOT NULL,
    inflation_trend DECIMAL(5, 2) NOT NULL,
    quadrant VARCHAR(20) NOT NULL,
    confidence DECIMAL(5, 2) NOT NULL,
    reasoning TEXT NOT NULL,
    future_growth_trend DECIMAL(5, 2),
    future_inflation_trend DECIMAL(5, 2),
    future_quadrant VARCHAR(20),
    future_confidence DECIMAL(5, 2),
    future_time_horizon VARCHAR(20),
    future_reasoning TEXT,
    economic_indicators JSONB NOT NULL, -- Store the indicators used for analysis
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- 2. INDEXES FOR PERFORMANCE
-- =============================================================================

-- Economic indicators indexes
CREATE INDEX IF NOT EXISTS idx_economic_indicators_country_code ON economic_indicators(country_code);
CREATE INDEX IF NOT EXISTS idx_economic_indicators_indicator_type ON economic_indicators(indicator_type);
CREATE INDEX IF NOT EXISTS idx_economic_indicators_date ON economic_indicators(date);
CREATE INDEX IF NOT EXISTS idx_economic_indicators_country_indicator ON economic_indicators(country_code, indicator_type);

-- Historical indicators indexes
CREATE INDEX IF NOT EXISTS idx_historical_indicators_country_code ON historical_indicators(country_code);
CREATE INDEX IF NOT EXISTS idx_historical_indicators_indicator_type ON historical_indicators(indicator_type);
CREATE INDEX IF NOT EXISTS idx_historical_indicators_date ON historical_indicators(date);
CREATE INDEX IF NOT EXISTS idx_historical_indicators_country_indicator_date ON historical_indicators(country_code, indicator_type, date);

-- Investment clock positions indexes
CREATE INDEX IF NOT EXISTS idx_investment_clock_country_code ON investment_clock_positions(country_code);
CREATE INDEX IF NOT EXISTS idx_investment_clock_date ON investment_clock_positions(date);

-- AI analysis history indexes
CREATE INDEX IF NOT EXISTS idx_ai_analysis_country_code ON ai_analysis_history(country_code);
CREATE INDEX IF NOT EXISTS idx_ai_analysis_date ON ai_analysis_history(analysis_date);
CREATE INDEX IF NOT EXISTS idx_ai_analysis_country_date ON ai_analysis_history(country_code, analysis_date);

-- =============================================================================
-- 3. CONSTRAINTS
-- =============================================================================

-- Remove duplicates from investment_clock_positions if they exist
DELETE FROM investment_clock_positions 
WHERE id NOT IN (
  SELECT DISTINCT ON (country_code) id 
  FROM investment_clock_positions 
  ORDER BY country_code, created_at DESC
);

-- Add unique constraint for investment_clock_positions
ALTER TABLE investment_clock_positions 
ADD CONSTRAINT IF NOT EXISTS unique_country_code UNIQUE (country_code);

-- =============================================================================
-- 4. ROW LEVEL SECURITY (RLS)
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE economic_indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE historical_indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE investment_clock_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_analysis_history ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Allow public read access to economic_indicators" ON economic_indicators;
DROP POLICY IF EXISTS "Allow public read access to historical_indicators" ON historical_indicators;
DROP POLICY IF EXISTS "Allow public read access to investment_clock_positions" ON investment_clock_positions;
DROP POLICY IF EXISTS "Allow public read access to ai_analysis_history" ON ai_analysis_history;
DROP POLICY IF EXISTS "Allow public insert to ai_analysis_history" ON ai_analysis_history;

-- Create policies for public read access (anonymous users)
CREATE POLICY "Allow public read access to economic_indicators" 
ON economic_indicators FOR SELECT 
USING (true);

CREATE POLICY "Allow public read access to historical_indicators" 
ON historical_indicators FOR SELECT 
USING (true);

CREATE POLICY "Allow public read access to investment_clock_positions" 
ON investment_clock_positions FOR SELECT 
USING (true);

CREATE POLICY "Allow public read access to ai_analysis_history" 
ON ai_analysis_history FOR SELECT 
USING (true);

-- Allow public insert to ai_analysis_history (for AI analysis storage)
CREATE POLICY "Allow public insert to ai_analysis_history" 
ON ai_analysis_history FOR INSERT 
WITH CHECK (true);

-- =============================================================================
-- 5. AUTOMATIC TIMESTAMP UPDATES
-- =============================================================================

-- Function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
DROP TRIGGER IF EXISTS update_economic_indicators_updated_at ON economic_indicators;
DROP TRIGGER IF EXISTS update_investment_clock_positions_updated_at ON investment_clock_positions;

CREATE TRIGGER update_economic_indicators_updated_at 
    BEFORE UPDATE ON economic_indicators 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_investment_clock_positions_updated_at 
    BEFORE UPDATE ON investment_clock_positions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- 6. SAMPLE DATA
-- =============================================================================

-- Insert sample economic indicators for USA (modify as needed)
INSERT INTO economic_indicators (country_code, country_name, indicator_type, value, previous_value, date)
VALUES 
    ('USA', 'United States', 'pmi_composite', 54.2, 53.8, CURRENT_DATE),
    ('USA', 'United States', 'pmi_manufacturing', 52.1, 51.7, CURRENT_DATE),
    ('USA', 'United States', 'cpi_yoy', 3.2, 3.1, CURRENT_DATE),
    ('USA', 'United States', 'core_pce', 2.8, 2.9, CURRENT_DATE),
    ('USA', 'United States', 'gdp_now', 2.1, 2.0, CURRENT_DATE)
ON CONFLICT DO NOTHING;

-- Insert sample historical data for sparklines (last 12 months)
INSERT INTO historical_indicators (country_code, indicator_type, value, date)
SELECT 
    'USA',
    'pmi_composite',
    50 + (random() * 10 - 5), -- Random values between 45-55
    CURRENT_DATE - INTERVAL '1 month' * generate_series(0, 11)
FROM generate_series(0, 11)
ON CONFLICT DO NOTHING;

-- Insert sample Investment Clock position for USA (legacy support)
INSERT INTO investment_clock_positions (country_code, country_name, growth_trend, inflation_trend, quadrant, date, ai_generated)
VALUES ('USA', 'United States', 15.5, 12.3, 'recovery', CURRENT_DATE, FALSE)
ON CONFLICT (country_code) DO NOTHING;

-- =============================================================================
-- 7. DOCUMENTATION COMMENTS
-- =============================================================================

-- Table comments
COMMENT ON TABLE economic_indicators IS 'Stores current economic indicators for different countries';
COMMENT ON TABLE historical_indicators IS 'Stores historical data for creating sparkline charts';
COMMENT ON TABLE investment_clock_positions IS 'Legacy storage for Investment Clock positions (now calculated on-the-fly)';
COMMENT ON TABLE ai_analysis_history IS 'Historical record of AI-generated economic analysis (primary source for AI positions)';

-- Column comments for economic_indicators
COMMENT ON COLUMN economic_indicators.country_code IS 'ISO 3166-1 alpha-3 country code';
COMMENT ON COLUMN economic_indicators.indicator_type IS 'Type of economic indicator: pmi_composite, pmi_manufacturing, cpi_yoy, core_pce, gdp_now';

-- Column comments for investment_clock_positions
COMMENT ON COLUMN investment_clock_positions.growth_trend IS 'Growth trend value (-100 to 100) for Y-axis positioning';
COMMENT ON COLUMN investment_clock_positions.inflation_trend IS 'Inflation trend value (-100 to 100) for X-axis positioning';
COMMENT ON COLUMN investment_clock_positions.quadrant IS 'Investment Clock quadrant: recovery, overheat, stagflation, recession';
COMMENT ON COLUMN investment_clock_positions.ai_generated IS 'Whether this position was determined by AI';
COMMENT ON COLUMN investment_clock_positions.confidence IS 'AI confidence level if AI-generated';
COMMENT ON COLUMN investment_clock_positions.reasoning IS 'AI reasoning if AI-generated';

-- Column comments for ai_analysis_history
COMMENT ON COLUMN ai_analysis_history.growth_trend IS 'Current position growth trend (-100 to 100)';
COMMENT ON COLUMN ai_analysis_history.inflation_trend IS 'Current position inflation trend (-100 to 100)';
COMMENT ON COLUMN ai_analysis_history.quadrant IS 'Current position quadrant: recovery, overheat, stagflation, recession';
COMMENT ON COLUMN ai_analysis_history.confidence IS 'Current position AI confidence level (0-100)';
COMMENT ON COLUMN ai_analysis_history.reasoning IS 'Current position AI explanation for the analysis';
COMMENT ON COLUMN ai_analysis_history.future_growth_trend IS 'Future position growth trend (-100 to 100)';
COMMENT ON COLUMN ai_analysis_history.future_inflation_trend IS 'Future position inflation trend (-100 to 100)';
COMMENT ON COLUMN ai_analysis_history.future_quadrant IS 'Future position quadrant: recovery, overheat, stagflation, recession';
COMMENT ON COLUMN ai_analysis_history.future_confidence IS 'Future position AI confidence level (0-100)';
COMMENT ON COLUMN ai_analysis_history.future_time_horizon IS 'Future position time horizon (e.g., "3-6 months")';
COMMENT ON COLUMN ai_analysis_history.future_reasoning IS 'Future position AI explanation and prediction reasoning';
COMMENT ON COLUMN ai_analysis_history.economic_indicators IS 'JSON snapshot of economic indicators used for analysis';

-- =============================================================================
-- 8. VERIFICATION
-- =============================================================================

-- Verify table structures
SELECT 'economic_indicators' as table_name, COUNT(*) as row_count FROM economic_indicators
UNION ALL
SELECT 'historical_indicators' as table_name, COUNT(*) as row_count FROM historical_indicators
UNION ALL
SELECT 'investment_clock_positions' as table_name, COUNT(*) as row_count FROM investment_clock_positions
UNION ALL
SELECT 'ai_analysis_history' as table_name, COUNT(*) as row_count FROM ai_analysis_history;

-- Verify policies
SELECT schemaname, tablename, policyname, cmd 
FROM pg_policies 
WHERE tablename IN ('economic_indicators', 'historical_indicators', 'investment_clock_positions', 'ai_analysis_history')
ORDER BY tablename, policyname;

-- =============================================================================
-- SETUP COMPLETE
-- =============================================================================

-- Your du.finance Global Investment Clock database is now ready!
-- 
-- Next steps:
-- 1. Update your .env.local with Supabase credentials
-- 2. Add economic data for additional countries as needed
-- 3. Test the AI analysis functionality
-- 4. Deploy your Next.js application to Vercel
--
-- For questions or support, refer to the project documentation.
