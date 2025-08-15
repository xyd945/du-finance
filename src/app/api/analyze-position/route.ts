import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { fetchEconomicIndicators } from '@/lib/api';
import { storeEnhancedAIAnalysis } from '@/lib/economic-analysis';

export async function POST(request: NextRequest) {
  try {
    const { countryCode, countryName } = await request.json();
    
    if (!countryCode) {
      return NextResponse.json(
        { error: 'Country code is required' },
        { status: 400 }
      );
    }
    
    // Fetch current economic indicators
    const indicators = await fetchEconomicIndicators(countryCode);
    
    if (indicators.length === 0) {
      return NextResponse.json(
        { error: 'No economic indicators found for this country' },
        { status: 404 }
      );
    }
    
    // Use enhanced AI to analyze current and future positions
    const supabase = getSupabaseClient();
    const analysis = await storeEnhancedAIAnalysis(
      supabase,
      countryCode,
      countryName || countryCode,
      indicators
    );
    
    return NextResponse.json({
      success: true,
      analysis,
      message: `Successfully updated ${countryCode} investment clock position with future prediction`,
    });
    
  } catch (error: unknown) {
    console.error('Error in analyze-position API:', error);
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'AI Economic Analysis API',
    usage: 'POST with { countryCode: "USA", countryName: "United States" }',
  });
}
