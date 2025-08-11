-- Check if the new columns exist in investment_clock_positions table
-- Run this in Supabase SQL Editor to verify the table structure

SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'investment_clock_positions' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- If ai_generated, confidence, or reasoning columns are missing, run this:
-- ALTER TABLE investment_clock_positions 
-- ADD COLUMN IF NOT EXISTS ai_generated BOOLEAN DEFAULT FALSE,
-- ADD COLUMN IF NOT EXISTS confidence DECIMAL(5, 2),
-- ADD COLUMN IF NOT EXISTS reasoning TEXT;
