-- Global Investment Clock Database Schema
-- Run this SQL script in your Supabase SQL Editor to create the required tables

-- Table to store economic indicators for different countries
CREATE TABLE economic_indicators (
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

-- Create indexes for better query performance
CREATE INDEX idx_economic_indicators_country_code ON economic_indicators(country_code);
CREATE INDEX idx_economic_indicators_indicator_type ON economic_indicators(indicator_type);
CREATE INDEX idx_economic_indicators_date ON economic_indicators(date);
CREATE INDEX idx_economic_indicators_country_indicator ON economic_indicators(country_code, indicator_type);

-- Table to store historical data for sparklines
CREATE TABLE historical_indicators (
    id BIGSERIAL PRIMARY KEY,
    country_code VARCHAR(3) NOT NULL,
    indicator_type VARCHAR(50) NOT NULL,
    value DECIMAL(10, 4) NOT NULL,
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for historical data
CREATE INDEX idx_historical_indicators_country_code ON historical_indicators(country_code);
CREATE INDEX idx_historical_indicators_indicator_type ON historical_indicators(indicator_type);
CREATE INDEX idx_historical_indicators_date ON historical_indicators(date);
CREATE INDEX idx_historical_indicators_country_indicator_date ON historical_indicators(country_code, indicator_type, date);

-- Table to store Investment Clock positions
CREATE TABLE investment_clock_positions (
    id BIGSERIAL PRIMARY KEY,
    country_code VARCHAR(3) NOT NULL,
    country_name VARCHAR(100) NOT NULL,
    growth_trend DECIMAL(5, 2) NOT NULL, -- Y-axis: -100 to 100
    inflation_trend DECIMAL(5, 2) NOT NULL, -- X-axis: -100 to 100
    quadrant VARCHAR(20) NOT NULL, -- 'recovery', 'overheat', 'stagflation', 'recession'
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for investment clock positions
CREATE INDEX idx_investment_clock_country_code ON investment_clock_positions(country_code);
CREATE INDEX idx_investment_clock_date ON investment_clock_positions(date);

-- Enable Row Level Security (RLS)
ALTER TABLE economic_indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE historical_indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE investment_clock_positions ENABLE ROW LEVEL SECURITY;

-- Create policies to allow public read access (for anonymous users)
CREATE POLICY "Allow public read access to economic_indicators" 
ON economic_indicators FOR SELECT 
USING (true);

CREATE POLICY "Allow public read access to historical_indicators" 
ON historical_indicators FOR SELECT 
USING (true);

CREATE POLICY "Allow public read access to investment_clock_positions" 
ON investment_clock_positions FOR SELECT 
USING (true);

-- Insert sample data for USA (you can modify these values)
INSERT INTO economic_indicators (country_code, country_name, indicator_type, value, previous_value, date)
VALUES 
    ('USA', 'United States', 'pmi_composite', 54.2, 53.8, CURRENT_DATE),
    ('USA', 'United States', 'pmi_manufacturing', 52.1, 51.7, CURRENT_DATE),
    ('USA', 'United States', 'cpi_yoy', 3.2, 3.1, CURRENT_DATE),
    ('USA', 'United States', 'core_pce', 2.8, 2.9, CURRENT_DATE),
    ('USA', 'United States', 'gdp_now', 2.1, 2.0, CURRENT_DATE);

-- Insert sample Investment Clock position for USA
INSERT INTO investment_clock_positions (country_code, country_name, growth_trend, inflation_trend, quadrant, date)
VALUES ('USA', 'United States', 15.5, 12.3, 'recovery', CURRENT_DATE);

-- Insert sample historical data for sparklines (last 12 months)
INSERT INTO historical_indicators (country_code, indicator_type, value, date)
SELECT 
    'USA',
    'pmi_composite',
    50 + (random() * 10 - 5), -- Random values between 45-55
    CURRENT_DATE - INTERVAL '1 month' * generate_series(0, 11)
FROM generate_series(0, 11);

-- Update function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update timestamps
CREATE TRIGGER update_economic_indicators_updated_at 
    BEFORE UPDATE ON economic_indicators 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_investment_clock_positions_updated_at 
    BEFORE UPDATE ON investment_clock_positions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE economic_indicators IS 'Stores current economic indicators for different countries';
COMMENT ON TABLE historical_indicators IS 'Stores historical data for creating sparkline charts';
COMMENT ON TABLE investment_clock_positions IS 'Stores country positions on the Investment Clock chart';

COMMENT ON COLUMN economic_indicators.country_code IS 'ISO 3166-1 alpha-3 country code';
COMMENT ON COLUMN economic_indicators.indicator_type IS 'Type of economic indicator: pmi_composite, pmi_manufacturing, cpi_yoy, core_pce, gdp_now';
COMMENT ON COLUMN investment_clock_positions.growth_trend IS 'Growth trend value (-100 to 100) for Y-axis positioning';
COMMENT ON COLUMN investment_clock_positions.inflation_trend IS 'Inflation trend value (-100 to 100) for X-axis positioning';
COMMENT ON COLUMN investment_clock_positions.quadrant IS 'Investment Clock quadrant: recovery, overheat, stagflation, recession';
