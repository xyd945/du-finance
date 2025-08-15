import { getSupabaseClient } from './supabase';
import { calculateInvestmentClockPosition } from './investment-clock-calculator';
import {
  EconomicIndicator,
  EconomicIndicatorResponseSchema,
  HistoricalIndicator,
  HistoricalIndicatorResponseSchema,
  InvestmentClockPosition,
  CountryData,
  IndicatorType,
  ApiError,
  FuturePosition,
} from '@/types';

// AI Analysis result type
interface AIAnalysisResult {
  id: number;
  country_code: string;
  country_name: string;
  analysis_date: string;
  growth_trend: number;
  inflation_trend: number;
  quadrant: string;
  confidence: number;
  reasoning: string;
  future_growth_trend?: number;
  future_inflation_trend?: number;
  future_quadrant?: string;
  future_confidence?: number;
  future_time_horizon?: string;
  future_reasoning?: string;
  economic_indicators: EconomicIndicator[];
  created_at: string;
}

/**
 * Fetch economic indicators for a specific country
 */
export async function fetchEconomicIndicators(
  countryCode: string
): Promise<EconomicIndicator[]> {
  try {
    const supabase = getSupabaseClient();
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
    const supabase = getSupabaseClient();
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
 * Fetch latest AI analysis for a country from ai_analysis_history
 */
export async function fetchLatestAIAnalysis(
  countryCode: string
): Promise<AIAnalysisResult | null> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('ai_analysis_history')
      .select('*')
      .eq('country_code', countryCode.toUpperCase())
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
    
        return null; // No AI analysis found
      }
      throw new Error(`Failed to fetch AI analysis: ${error.message}`);
    }



    return data;
  } catch (error) {
    console.error('Error fetching AI analysis:', error);
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
    const supabase = getSupabaseClient();
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

    // Get positions for each country (preferring AI analysis)
    const positions: InvestmentClockPosition[] = [];
    
    for (const country of uniqueCountries) {
      try {
        // First try to get AI analysis
        const aiAnalysis = await fetchLatestAIAnalysis(country.country_code);
        
        if (aiAnalysis) {
          // Use AI analysis if available
          const position: InvestmentClockPosition = {
            id: aiAnalysis.id,
            country_code: aiAnalysis.country_code,
            country_name: aiAnalysis.country_name,
            growth_trend: aiAnalysis.growth_trend,
            inflation_trend: aiAnalysis.inflation_trend,
            quadrant: aiAnalysis.quadrant as 'recovery' | 'overheat' | 'stagflation' | 'recession',
            date: aiAnalysis.analysis_date,
            created_at: aiAnalysis.created_at,
            updated_at: aiAnalysis.created_at,
          };
          positions.push(position);
        } else {
          // Fall back to rule-based calculation
          const position = await fetchInvestmentClockPosition(country.country_code);
          if (position) {
            positions.push(position);
          }
        }
      } catch (error) {
        console.warn(`Failed to get position for ${country.country_code}:`, error);
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
 * Fetch comprehensive country data including position, indicators, historical data, and future position
 */
export async function fetchCountryData(
  countryCode: string
): Promise<CountryData | null> {
  try {
    const [position, indicators, historicalData, aiAnalysis] = await Promise.all([
      fetchInvestmentClockPosition(countryCode),
      fetchEconomicIndicators(countryCode),
      fetchHistoricalIndicators(countryCode),
      fetchLatestAIAnalysis(countryCode),
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

    // Extract future position from AI analysis if available
    let futurePosition: FuturePosition | undefined = undefined;
    

    
    if (aiAnalysis && 
        aiAnalysis.future_growth_trend != null &&
        aiAnalysis.future_inflation_trend != null &&
        aiAnalysis.future_quadrant &&
        aiAnalysis.future_confidence != null &&
        aiAnalysis.future_time_horizon &&
        aiAnalysis.future_reasoning) {
      futurePosition = {
        growth_trend: Number(aiAnalysis.future_growth_trend),
        inflation_trend: Number(aiAnalysis.future_inflation_trend),
        quadrant: aiAnalysis.future_quadrant as 'recovery' | 'overheat' | 'stagflation' | 'recession',
        confidence: Number(aiAnalysis.future_confidence),
        time_horizon: aiAnalysis.future_time_horizon,
        reasoning: aiAnalysis.future_reasoning,
      };
    }

    const result = {
      country_code: countryCode.toUpperCase(),
      country_name: position.country_name,
      position,
      future_position: futurePosition,
      indicators,
      historical_data: groupedHistoricalData,
    };
    

    
    return result;
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
