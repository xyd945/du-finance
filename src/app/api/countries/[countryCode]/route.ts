import { NextRequest, NextResponse } from 'next/server';
import { fetchEconomicIndicators, fetchHistoricalIndicators, fetchInvestmentClockPosition, fetchLatestAIAnalysis } from '@/lib/api';
import { FuturePosition } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ countryCode: string }> }
) {
  try {
    const { countryCode } = await params;
    
    if (!countryCode) {
      return NextResponse.json(
        { error: 'Country code is required' },
        { status: 400 }
      );
    }

    // Fetch data in parallel
    const [indicators, position, aiAnalysis] = await Promise.all([
      fetchEconomicIndicators(countryCode),
      fetchInvestmentClockPosition(countryCode),
      fetchLatestAIAnalysis(countryCode),
    ]);

    if (indicators.length === 0 || !position) {
      return NextResponse.json(
        { error: 'No data found for this country' },
        { status: 404 }
      );
    }

    // Fetch historical data for each indicator type
    const indicatorTypes = [...new Set(indicators.map(i => i.indicator_type))];
    const historicalPromises = indicatorTypes.map(type => 
      fetchHistoricalIndicators(countryCode, type as 'pmi_composite' | 'pmi_manufacturing' | 'cpi_yoy' | 'core_pce' | 'gdp_now', 12)
    );
    
    const historicalResults = await Promise.all(historicalPromises);
    const historicalData: Record<string, unknown[]> = {};
    
    indicatorTypes.forEach((type, index) => {
      historicalData[type] = historicalResults[index] || [];
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

    const countryData = {
      country_code: countryCode.toUpperCase(),
      country_name: indicators[0]?.country_name || countryCode,
      indicators,
      historical_data: historicalData,
      position,
      future_position: futurePosition,
    };



    return NextResponse.json(countryData);
    
  } catch (error: unknown) {
    console.error('Error fetching country data:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
