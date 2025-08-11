import { EconomicIndicator, Quadrant } from '@/types';

export interface CalculatedPosition {
  growth_trend: number;
  inflation_trend: number;
  quadrant: Quadrant;
  confidence: number;
  calculation_method: 'rule_based' | 'ai_enhanced';
  components: {
    growth_components: { [key: string]: number };
    inflation_components: { [key: string]: number };
  };
}

/**
 * Calculate growth trend from economic indicators
 * Scale: -100 (severe contraction) to +100 (strong expansion)
 */
export function calculateGrowthTrend(indicators: EconomicIndicator[]): {
  trend: number;
  components: { [key: string]: number };
} {
  const pmiComposite = indicators.find(i => i.indicator_type === 'pmi_composite');
  const pmiManufacturing = indicators.find(i => i.indicator_type === 'pmi_manufacturing');
  const gdpNow = indicators.find(i => i.indicator_type === 'gdp_now');

  let totalTrend = 0;
  let totalWeight = 0;
  const components: { [key: string]: number } = {};

  // PMI Composite (40% weight)
  if (pmiComposite) {
    const pmiLevel = (pmiComposite.value - 50) * 2; // Scale PMI to -100/+100
    let pmiMomentum = 0;
    
    if (pmiComposite.previous_value) {
      pmiMomentum = (pmiComposite.value - pmiComposite.previous_value) * 10;
    }
    
    const pmiTrend = (pmiLevel * 0.7) + (pmiMomentum * 0.3);
    components['PMI Composite'] = pmiTrend;
    totalTrend += pmiTrend * 0.4;
    totalWeight += 0.4;
  }

  // PMI Manufacturing (30% weight)
  if (pmiManufacturing) {
    const pmiLevel = (pmiManufacturing.value - 50) * 2;
    let pmiMomentum = 0;
    
    if (pmiManufacturing.previous_value) {
      pmiMomentum = (pmiManufacturing.value - pmiManufacturing.previous_value) * 10;
    }
    
    const mfgTrend = (pmiLevel * 0.7) + (pmiMomentum * 0.3);
    components['PMI Manufacturing'] = mfgTrend;
    totalTrend += mfgTrend * 0.3;
    totalWeight += 0.3;
  }

  // GDPNow (30% weight)
  if (gdpNow) {
    const gdpLevel = gdpNow.value * 20; // 2% growth = +40 on scale
    let gdpMomentum = 0;
    
    if (gdpNow.previous_value) {
      gdpMomentum = (gdpNow.value - gdpNow.previous_value) * 50;
    }
    
    const gdpTrend = (gdpLevel * 0.8) + (gdpMomentum * 0.2);
    components['GDP Now'] = gdpTrend;
    totalTrend += gdpTrend * 0.3;
    totalWeight += 0.3;
  }

  // Normalize based on available indicators
  const finalTrend = totalWeight > 0 ? totalTrend / totalWeight : 0;
  
  // Clamp to -100/+100 range
  return {
    trend: Math.max(-100, Math.min(100, Math.round(finalTrend))),
    components,
  };
}

/**
 * Calculate inflation trend from economic indicators
 * Scale: -100 (deflation) to +100 (high inflation)
 */
export function calculateInflationTrend(indicators: EconomicIndicator[]): {
  trend: number;
  components: { [key: string]: number };
} {
  const cpiYoy = indicators.find(i => i.indicator_type === 'cpi_yoy');
  const corePce = indicators.find(i => i.indicator_type === 'core_pce');

  let totalTrend = 0;
  let totalWeight = 0;
  const components: { [key: string]: number } = {};

  // CPI Year-over-Year (60% weight)
  if (cpiYoy) {
    const cpiLevel = (cpiYoy.value - 2) * 25; // 2% target, scale to -50/+150 range
    let cpiMomentum = 0;
    
    if (cpiYoy.previous_value) {
      cpiMomentum = (cpiYoy.value - cpiYoy.previous_value) * 100;
    }
    
    const cpiTrend = (cpiLevel * 0.7) + (cpiMomentum * 0.3);
    components['CPI YoY'] = cpiTrend;
    totalTrend += cpiTrend * 0.6;
    totalWeight += 0.6;
  }

  // Core PCE (40% weight)
  if (corePce) {
    const pceLevel = (corePce.value - 2) * 25; // 2% target
    let pceMomentum = 0;
    
    if (corePce.previous_value) {
      pceMomentum = (corePce.value - corePce.previous_value) * 100;
    }
    
    const pceTrend = (pceLevel * 0.7) + (pceMomentum * 0.3);
    components['Core PCE'] = pceTrend;
    totalTrend += pceTrend * 0.4;
    totalWeight += 0.4;
  }

  // Normalize based on available indicators
  const finalTrend = totalWeight > 0 ? totalTrend / totalWeight : 0;
  
  // Clamp to -100/+100 range
  return {
    trend: Math.max(-100, Math.min(100, Math.round(finalTrend))),
    components,
  };
}

/**
 * Determine Investment Clock quadrant based on growth and inflation trends
 */
export function determineQuadrant(growthTrend: number, inflationTrend: number): Quadrant {
  if (growthTrend >= 0 && inflationTrend < 0) {
    return 'recovery'; // Growth up, inflation down
  } else if (growthTrend >= 0 && inflationTrend >= 0) {
    return 'overheat'; // Growth up, inflation up
  } else if (growthTrend < 0 && inflationTrend >= 0) {
    return 'stagflation'; // Growth down, inflation up
  } else {
    return 'recession'; // Growth down, inflation down
  }
}

/**
 * Calculate confidence based on data availability and consistency
 */
export function calculateConfidence(
  indicators: EconomicIndicator[],
  growthComponents: { [key: string]: number },
  inflationComponents: { [key: string]: number }
): number {
  let confidence = 50; // Base confidence

  // Boost confidence based on data availability
  const availableIndicators = indicators.length;
  confidence += Math.min(30, availableIndicators * 6); // +6 per indicator, max +30

  // Boost confidence if we have previous values (momentum calculation)
  const indicatorsWithMomentum = indicators.filter(i => i.previous_value !== null).length;
  confidence += Math.min(20, indicatorsWithMomentum * 4); // +4 per momentum, max +20

  // Check for consistency in growth components
  const growthValues = Object.values(growthComponents);
  if (growthValues.length > 1) {
    const growthConsistency = calculateConsistency(growthValues);
    confidence += growthConsistency * 10; // Up to +10 for consistency
  }

  // Check for consistency in inflation components
  const inflationValues = Object.values(inflationComponents);
  if (inflationValues.length > 1) {
    const inflationConsistency = calculateConsistency(inflationValues);
    confidence += inflationConsistency * 10; // Up to +10 for consistency
  }

  return Math.max(0, Math.min(100, Math.round(confidence)));
}

/**
 * Calculate consistency score for a set of values (0 = inconsistent, 1 = very consistent)
 */
function calculateConsistency(values: number[]): number {
  if (values.length < 2) return 1;
  
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  const standardDeviation = Math.sqrt(variance);
  
  // Convert standard deviation to consistency score (lower std dev = higher consistency)
  // Scale so that std dev of 20 = 0.5 consistency, std dev of 40 = 0 consistency
  return Math.max(0, 1 - (standardDeviation / 40));
}

/**
 * Main function to calculate Investment Clock position from economic indicators
 */
export function calculateInvestmentClockPosition(
  indicators: EconomicIndicator[]
): CalculatedPosition {
  if (indicators.length === 0) {
    throw new Error('No economic indicators available for calculation');
  }

  // Calculate growth and inflation trends
  const growthResult = calculateGrowthTrend(indicators);
  const inflationResult = calculateInflationTrend(indicators);

  // Determine quadrant
  const quadrant = determineQuadrant(growthResult.trend, inflationResult.trend);

  // Calculate confidence
  const confidence = calculateConfidence(
    indicators,
    growthResult.components,
    inflationResult.components
  );

  return {
    growth_trend: growthResult.trend,
    inflation_trend: inflationResult.trend,
    quadrant,
    confidence,
    calculation_method: 'rule_based',
    components: {
      growth_components: growthResult.components,
      inflation_components: inflationResult.components,
    },
  };
}
