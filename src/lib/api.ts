import { supabase } from './supabase';
import { calculateInvestmentClockPosition } from './investment-clock-calculator';
import {
  EconomicIndicator,
  EconomicIndicatorResponseSchema,
  HistoricalIndicator,
  HistoricalIndicatorResponseSchema,
  InvestmentClockPosition,
  InvestmentClockPositionResponseSchema,
  CountryData,
  IndicatorType,
  ApiError,
} from '@/types';

/**
 * Fetch economic indicators for a specific country
 */
export async function fetchEconomicIndicators(
  countryCode: string
): Promise<EconomicIndicator[]> {
  try {
    const { data, error } = await supabase
      .from('economic_indicators')
      .select('*')
      .eq('country_code', countryCode.toUpperCase())
      .order('date', { ascending: false }); // Get all indicators for the country

    if (error) {
      throw new Error(`Failed to fetch economic indicators: ${error.message}`);
    }

    // Validate response with Zod
    const validatedData = EconomicIndicatorResponseSchema.parse(data || []);
    return validatedData;
  } catch (error) {
    console.error('Error fetching economic indicators:', error);
    throw error;
  }
}

/**
 * Fetch historical data for sparklines
 */
export async function fetchHistoricalIndicators(
  countryCode: string,
  indicatorType?: IndicatorType,
  limit = 12
): Promise<HistoricalIndicator[]> {
  try {
    let query = supabase
      .from('historical_indicators')
      .select('*')
      .eq('country_code', countryCode.toUpperCase())
      .order('date', { ascending: true })
      .limit(limit);

    if (indicatorType) {
      query = query.eq('indicator_type', indicatorType);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(
        `Failed to fetch historical indicators: ${error.message}`
      );
    }

    // Validate response with Zod
    const validatedData = HistoricalIndicatorResponseSchema.parse(data || []);
    return validatedData;
  } catch (error) {
    console.error('Error fetching historical indicators:', error);
    throw error;
  }
}

/**
 * Calculate Investment Clock position for a specific country from economic indicators
 */
export async function fetchInvestmentClockPosition(
  countryCode: string
): Promise<InvestmentClockPosition | null> {
  try {
    // Fetch economic indicators for the country
    const indicators = await fetchEconomicIndicators(countryCode);
    
    if (indicators.length === 0) {
      return null; // No indicators available
    }

    // Calculate position from indicators
    const calculatedPosition = calculateInvestmentClockPosition(indicators);
    
    // Convert to InvestmentClockPosition format
    const position: InvestmentClockPosition = {
      id: 0, // Not needed for calculated positions
      country_code: countryCode.toUpperCase(),
      country_name: indicators[0]?.country_name || countryCode,
      growth_trend: calculatedPosition.growth_trend,
      inflation_trend: calculatedPosition.inflation_trend,
      quadrant: calculatedPosition.quadrant,
      date: new Date().toISOString().split('T')[0], // Today's date
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return position;
  } catch (error) {
    console.error('Error calculating investment clock position:', error);
    throw error;
  }
}

/**
 * Fetch Investment Clock positions for all countries
 */
export async function fetchAllInvestmentClockPositions(): Promise<
  InvestmentClockPosition[]
> {
  try {
    // Get all unique countries with economic indicators
    const { data: countries, error } = await supabase
      .from('economic_indicators')
      .select('country_code, country_name')
      .order('country_code');

    if (error) {
      throw new Error(`Failed to fetch countries: ${error.message}`);
    }

    // Get unique countries
    const uniqueCountries = Array.from(
      new Map(countries?.map(c => [c.country_code, c]) || []).values()
    );

    // Calculate position for each country
    const positions: InvestmentClockPosition[] = [];
    
    for (const country of uniqueCountries) {
      try {
        const position = await fetchInvestmentClockPosition(country.country_code);
        if (position) {
          positions.push(position);
        }
      } catch (error) {
        console.warn(`Failed to calculate position for ${country.country_code}:`, error);
        // Continue with other countries
      }
    }

    return positions;
  } catch (error) {
    console.error('Error calculating all investment clock positions:', error);
    throw error;
  }
}

/**
 * Fetch comprehensive country data including position, indicators, and historical data
 */
export async function fetchCountryData(
  countryCode: string
): Promise<CountryData | null> {
  try {
    const [position, indicators, historicalData] = await Promise.all([
      fetchInvestmentClockPosition(countryCode),
      fetchEconomicIndicators(countryCode),
      fetchHistoricalIndicators(countryCode),
    ]);

    if (!position) {
      return null;
    }

    // Group historical data by indicator type
    const groupedHistoricalData: Record<string, HistoricalIndicator[]> = {};
    historicalData.forEach(item => {
      if (!groupedHistoricalData[item.indicator_type]) {
        groupedHistoricalData[item.indicator_type] = [];
      }
      groupedHistoricalData[item.indicator_type].push(item);
    });

    return {
      country_code: countryCode.toUpperCase(),
      country_name: position.country_name,
      position,
      indicators,
      historical_data: groupedHistoricalData,
    };
  } catch (error) {
    console.error('Error fetching country data:', error);
    throw error;
  }
}

/**
 * Error handler for API responses
 */
export function handleApiError(error: unknown): ApiError {
  if (error instanceof Error) {
    return {
      message: error.message,
      code: 'UNKNOWN_ERROR',
    };
  }

  return {
    message: 'An unknown error occurred',
    code: 'UNKNOWN_ERROR',
    details: error,
  };
}

/**
 * Retry wrapper for API calls
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt === maxRetries) {
        break;
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }

  throw lastError;
}
