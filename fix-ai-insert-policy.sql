-- Fix AI Analysis History INSERT Policy
-- Run this in your Supabase SQL Editor

-- Add INSERT policy for ai_analysis_history table to allow anonymous inserts
CREATE POLICY "Allow public insert to ai_analysis_history" 
ON ai_analysis_history FOR INSERT 
WITH CHECK (true);

-- Verify the policies
SELECT schemaname, tablename, policyname, cmd 
FROM pg_policies 
WHERE tablename = 'ai_analysis_history';
