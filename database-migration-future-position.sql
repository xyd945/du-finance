-- Migration to add Future Position fields to ai_analysis_history table
-- Run this in your Supabase SQL Editor

-- Add future position columns to ai_analysis_history table
ALTER TABLE ai_analysis_history ADD COLUMN IF NOT EXISTS future_growth_trend DECIMAL(5, 2);
ALTER TABLE ai_analysis_history ADD COLUMN IF NOT EXISTS future_inflation_trend DECIMAL(5, 2);
ALTER TABLE ai_analysis_history ADD COLUMN IF NOT EXISTS future_quadrant VARCHAR(20);
ALTER TABLE ai_analysis_history ADD COLUMN IF NOT EXISTS future_confidence DECIMAL(5, 2);
ALTER TABLE ai_analysis_history ADD COLUMN IF NOT EXISTS future_time_horizon VARCHAR(20);
ALTER TABLE ai_analysis_history ADD COLUMN IF NOT EXISTS future_reasoning TEXT;

-- Add comments to clarify the fields
COMMENT ON COLUMN ai_analysis_history.growth_trend IS 'Current position growth trend (-100 to 100)';
COMMENT ON COLUMN ai_analysis_history.inflation_trend IS 'Current position inflation trend (-100 to 100)';
COMMENT ON COLUMN ai_analysis_history.quadrant IS 'Current position quadrant (recovery, overheat, stagflation, recession)';
COMMENT ON COLUMN ai_analysis_history.confidence IS 'Current position confidence level (0-100)';
COMMENT ON COLUMN ai_analysis_history.reasoning IS 'Current position AI reasoning';

COMMENT ON COLUMN ai_analysis_history.future_growth_trend IS 'Future position growth trend (-100 to 100)';
COMMENT ON COLUMN ai_analysis_history.future_inflation_trend IS 'Future position inflation trend (-100 to 100)';
COMMENT ON COLUMN ai_analysis_history.future_quadrant IS 'Future position quadrant (recovery, overheat, stagflation, recession)';
COMMENT ON COLUMN ai_analysis_history.future_confidence IS 'Future position confidence level (0-100)';
COMMENT ON COLUMN ai_analysis_history.future_time_horizon IS 'Future position time horizon (e.g., "3-6 months")';
COMMENT ON COLUMN ai_analysis_history.future_reasoning IS 'Future position AI reasoning and prediction explanation';

-- Verify the updated table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'ai_analysis_history' 
ORDER BY ordinal_position;
