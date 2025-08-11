-- Additional table for tracking AI analysis history
-- Run this after the main database-setup.sql

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
    economic_indicators JSONB NOT NULL, -- Store the indicators used for analysis
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_ai_analysis_country_code ON ai_analysis_history(country_code);
CREATE INDEX idx_ai_analysis_date ON ai_analysis_history(analysis_date);
CREATE INDEX idx_ai_analysis_country_date ON ai_analysis_history(country_code, analysis_date);

-- Enable RLS
ALTER TABLE ai_analysis_history ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Allow public read access to ai_analysis_history" 
ON ai_analysis_history FOR SELECT 
USING (true);

-- Update the investment_clock_positions table structure
ALTER TABLE investment_clock_positions 
ADD COLUMN IF NOT EXISTS ai_generated BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS confidence DECIMAL(5, 2),
ADD COLUMN IF NOT EXISTS reasoning TEXT;

-- Update existing records to mark them as non-AI generated
UPDATE investment_clock_positions 
SET ai_generated = FALSE 
WHERE ai_generated IS NULL;

-- Comments
COMMENT ON TABLE ai_analysis_history IS 'Historical record of AI-generated economic analysis';
COMMENT ON COLUMN ai_analysis_history.confidence IS 'AI confidence level (0-100)';
COMMENT ON COLUMN ai_analysis_history.reasoning IS 'AI explanation for the analysis';
COMMENT ON COLUMN ai_analysis_history.economic_indicators IS 'JSON snapshot of economic indicators used for analysis';
COMMENT ON COLUMN investment_clock_positions.ai_generated IS 'Whether this position was determined by AI';
COMMENT ON COLUMN investment_clock_positions.confidence IS 'AI confidence level if AI-generated';
COMMENT ON COLUMN investment_clock_positions.reasoning IS 'AI reasoning if AI-generated';
