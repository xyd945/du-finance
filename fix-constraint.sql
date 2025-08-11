-- Fix the investment_clock_positions table to support upsert operations
-- Run this in your Supabase SQL Editor

-- First, add a unique constraint on country_code
ALTER TABLE investment_clock_positions 
ADD CONSTRAINT unique_country_code UNIQUE (country_code);

-- If the above fails because of duplicate entries, run this first:
-- DELETE FROM investment_clock_positions WHERE id NOT IN (
--   SELECT DISTINCT ON (country_code) id 
--   FROM investment_clock_positions 
--   ORDER BY country_code, created_at DESC
-- );

-- Then add the unique constraint:
-- ALTER TABLE investment_clock_positions 
-- ADD CONSTRAINT unique_country_code UNIQUE (country_code);
