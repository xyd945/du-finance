-- Complete AI Analysis Database Fix
-- Run this entire script in your Supabase SQL Editor

-- Step 1: Add the missing columns first
ALTER TABLE investment_clock_positions 
ADD COLUMN IF NOT EXISTS ai_generated BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS confidence DECIMAL(5, 2),
ADD COLUMN IF NOT EXISTS reasoning TEXT;

-- Step 2: Check for duplicate entries before adding unique constraint
-- This will show you if there are duplicates
SELECT country_code, COUNT(*) as duplicate_count 
FROM investment_clock_positions 
GROUP BY country_code 
HAVING COUNT(*) > 1;

-- Step 3: If duplicates exist, remove them (keeping the most recent)
DELETE FROM investment_clock_positions 
WHERE id NOT IN (
  SELECT DISTINCT ON (country_code) id 
  FROM investment_clock_positions 
  ORDER BY country_code, created_at DESC
);

-- Step 4: Add unique constraint on country_code
ALTER TABLE investment_clock_positions 
ADD CONSTRAINT unique_country_code UNIQUE (country_code);

-- Step 5: Create the AI analysis history table
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
    economic_indicators JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 6: Create indexes for the history table
CREATE INDEX IF NOT EXISTS idx_ai_analysis_country_code ON ai_analysis_history(country_code);
CREATE INDEX IF NOT EXISTS idx_ai_analysis_date ON ai_analysis_history(analysis_date);
CREATE INDEX IF NOT EXISTS idx_ai_analysis_country_date ON ai_analysis_history(country_code, analysis_date);

-- Step 7: Enable RLS on history table
ALTER TABLE ai_analysis_history ENABLE ROW LEVEL SECURITY;

-- Step 8: Create policy for public read access
DROP POLICY IF EXISTS "Allow public read access to ai_analysis_history" ON ai_analysis_history;
CREATE POLICY "Allow public read access to ai_analysis_history" 
ON ai_analysis_history FOR SELECT 
USING (true);

-- Step 9: Update existing records to mark them as non-AI generated
UPDATE investment_clock_positions 
SET ai_generated = FALSE 
WHERE ai_generated IS NULL;

-- Step 10: Add comments for documentation
COMMENT ON TABLE ai_analysis_history IS 'Historical record of AI-generated economic analysis';
COMMENT ON COLUMN ai_analysis_history.confidence IS 'AI confidence level (0-100)';
COMMENT ON COLUMN ai_analysis_history.reasoning IS 'AI explanation for the analysis';
COMMENT ON COLUMN ai_analysis_history.economic_indicators IS 'JSON snapshot of economic indicators used for analysis';
COMMENT ON COLUMN investment_clock_positions.ai_generated IS 'Whether this position was determined by AI';
COMMENT ON COLUMN investment_clock_positions.confidence IS 'AI confidence level if AI-generated';
COMMENT ON COLUMN investment_clock_positions.reasoning IS 'AI reasoning if AI-generated';

-- Verification: Show the updated table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'investment_clock_positions' 
AND table_schema = 'public'
ORDER BY ordinal_position;
