import { NextRequest, NextResponse } from 'next/server';
import { fetchEconomicIndicators } from '@/lib/api';

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

    const indicators = await fetchEconomicIndicators(countryCode);
    return NextResponse.json(indicators);
    
  } catch (error: unknown) {
    console.error('Error fetching indicators:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
