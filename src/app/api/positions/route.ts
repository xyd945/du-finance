import { NextResponse } from 'next/server';
import { fetchAllInvestmentClockPositions } from '@/lib/api';

export async function GET() {
  try {
    const positions = await fetchAllInvestmentClockPositions();
    return NextResponse.json(positions);
  } catch (error: unknown) {
    console.error('Error fetching positions:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
