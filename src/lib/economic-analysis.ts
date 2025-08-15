import { geminiModel } from './gemini';
import { EconomicIndicator, Quadrant, EnhancedAIAnalysis, IndicatorType } from '@/types';
import { z } from 'zod';
import type { SupabaseClient } from '@supabase/supabase-js';
import { fetchHistoricalIndicators } from './api';

// Schema for AI response validation (Current Position)
const AIAnalysisSchema = z.object({
  growth_trend: z.number().min(-100).max(100),
  inflation_trend: z.number().min(-100).max(100),
  quadrant: z.enum(['recovery', 'overheat', 'stagflation', 'recession']),
  confidence: z.number().min(0).max(100),
  reasoning: z.string(),
});

// Schema for Enhanced AI response validation (Current + Future)
const EnhancedAIAnalysisSchema = z.object({
  current_position: AIAnalysisSchema,
  future_position: z.object({
    growth_trend: z.number().min(-100).max(100),
    inflation_trend: z.number().min(-100).max(100),
    quadrant: z.enum(['recovery', 'overheat', 'stagflation', 'recession']),
    confidence: z.number().min(0).max(100),
    time_horizon: z.string(),
    reasoning: z.string(),
  }),
});

export type AIAnalysis = z.infer<typeof AIAnalysisSchema>;

/**
 * Fetch historical data for trend analysis
 */
async function fetchHistoricalData(countryCode: string): Promise<{ [key: string]: unknown[] }> {
  try {
    const indicators: IndicatorType[] = ['pmi_composite', 'pmi_manufacturing', 'cpi_yoy', 'core_pce', 'gdp_now'];
    const historicalData: { [key: string]: unknown[] } = {};
    
    for (const indicator of indicators) {
      try {
        const data = await fetchHistoricalIndicators(
          countryCode, 
          indicator,
          12 // Last 12 months
        );
        historicalData[indicator] = data;
      } catch (error) {
        console.warn(`Could not fetch historical data for ${indicator}:`, error);
        historicalData[indicator] = [];
      }
    }
    
    return historicalData;
  } catch (error) {
    console.warn('Error fetching historical data:', error);
    return {};
  }
}

/**
 * Format historical data for AI prompt
 */
function formatHistoricalData(historicalData: { [key: string]: unknown[] }): string {
  if (!historicalData || Object.keys(historicalData).length === 0) {
    return "Historical data not available";
  }

  const formatted = Object.entries(historicalData).map(([indicator, data]) => {
    if (!data || data.length === 0) {
      return `• ${indicator.toUpperCase()}: No historical data available`;
    }
    
    const recent = (data as Array<{ value: number }>).slice(-6); // Last 6 months
    const trend = calculateTrend(recent.map(d => d.value));
    const latest = recent[recent.length - 1]?.value;
    const oldest = recent[0]?.value;
    
    let direction = '';
    if (latest && oldest) {
      const change = ((latest - oldest) / oldest * 100);
      direction = change > 0 ? '↗' : change < 0 ? '↘' : '→';
    }
    
    return `• ${indicator.toUpperCase()}: Trend ${trend} ${direction} (Latest: ${latest})`;
  });

  return formatted.join('\n');
}

/**
 * Calculate trend direction from historical values
 */
function calculateTrend(values: number[]): string {
  if (values.length < 2) return 'insufficient data';
  
  let increases = 0;
  let decreases = 0;
  
  for (let i = 1; i < values.length; i++) {
    if (values[i] > values[i-1]) increases++;
    else if (values[i] < values[i-1]) decreases++;
  }
  
  if (increases > decreases) return 'rising';
  if (decreases > increases) return 'falling';
  return 'stable';
}

/**
 * Enhanced analysis including future position prediction
 */
export async function analyzeEconomicPositionEnhanced(
  indicators: EconomicIndicator[],
  countryCode: string,
  countryName: string
): Promise<EnhancedAIAnalysis> {
  if (!geminiModel) {
    throw new Error('Gemini AI is not configured. Please set GEMINI_API_KEY.');
  }

  // Fetch historical data for trend analysis
  const historicalData = await fetchHistoricalData(countryCode);

  // Prepare economic data for analysis
  const economicData = indicators.map(indicator => ({
    indicator: indicator.indicator_type,
    current_value: indicator.value,
    previous_value: indicator.previous_value,
    change: indicator.previous_value 
      ? ((indicator.value - indicator.previous_value) / indicator.previous_value * 100).toFixed(2)
      : 'N/A',
    date: indicator.date,
  }));

  const prompt = `
You are an expert macroeconomic analyst specializing in the Merrill Lynch Investment Clock framework. 

Analyze the following economic indicators for ${countryName} and determine BOTH the current position and predict the future position (3-6 months ahead) on the Investment Clock.

CURRENT ECONOMIC DATA:
${economicData.map(d => 
  `• ${d.indicator.toUpperCase()}: ${d.current_value} (Previous: ${d.previous_value}, Change: ${d.change}%)`
).join('\n')}

HISTORICAL TRENDS (Last 12 months):
${formatHistoricalData(historicalData)}

MERRILL LYNCH INVESTMENT CLOCK FRAMEWORK (CRITICAL - FOLLOW EXACTLY):
- Recovery: Growth ↑, Inflation ↓ (Growth Trend: 0 to +100, Inflation Trend: -100 to -1)
- Overheat: Growth ↑, Inflation ↑ (Growth Trend: 0 to +100, Inflation Trend: 0 to +100)  
- Stagflation: Growth ↓, Inflation ↑ (Growth Trend: -100 to -1, Inflation Trend: 0 to +100)
- Recession: Growth ↓, Inflation ↓ (Growth Trend: -100 to -1, Inflation Trend: -100 to -1)

QUADRANT DETERMINATION RULES:
- If Growth >= 0 AND Inflation < 0 → Recovery
- If Growth >= 0 AND Inflation >= 0 → Overheat  
- If Growth < 0 AND Inflation >= 0 → Stagflation
- If Growth < 0 AND Inflation < 0 → Recession

ANALYSIS REQUIREMENTS:
1. Determine CURRENT position based on latest data
2. Predict FUTURE position (3-6 months ahead) considering:
   - Historical momentum and trends
   - Economic cycles and typical progression patterns
   - Leading vs lagging indicators
   - Policy implications and economic outlook
3. Explain the reasoning for both current and future positions

ANALYSIS GUIDELINES:
1. PMI Composite/Manufacturing > 50 = expansion, < 50 = contraction
2. PMI trends indicate growth momentum direction
3. CPI YoY and Core PCE indicate inflation trends and direction
4. GDPNow indicates real-time growth assessment
5. Consider month-over-month changes and momentum
6. Growth Trend scale: -100 (severe contraction) to +100 (strong expansion)
7. Inflation Trend scale: -100 (deflation) to +100 (high inflation)

Please respond ONLY with a valid JSON object in this exact format:
{
  "current_position": {
    "growth_trend": [number between -100 and 100],
    "inflation_trend": [number between -100 and 100], 
    "quadrant": "[recovery|overheat|stagflation|recession]",
    "confidence": [number between 0 and 100],
    "reasoning": "Brief explanation of current position analysis (2-3 sentences)"
  },
  "future_position": {
    "growth_trend": [number between -100 and 100],
    "inflation_trend": [number between -100 and 100], 
    "quadrant": "[recovery|overheat|stagflation|recession]",
    "confidence": [number between 0 and 100],
    "time_horizon": "3-6 months",
    "reasoning": "Detailed explanation of future position prediction including key factors and trends driving the change (3-4 sentences)"
  }
}
`;

  try {
    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from response (handle potential markdown formatting)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('AI response does not contain valid JSON');
    }
    
    const analysisData = JSON.parse(jsonMatch[0]);
    
    // Validate the response structure
    const validatedAnalysis = EnhancedAIAnalysisSchema.parse(analysisData);
    
    return {
      growth_trend: validatedAnalysis.current_position.growth_trend,
      inflation_trend: validatedAnalysis.current_position.inflation_trend,
      quadrant: validatedAnalysis.current_position.quadrant,
      confidence: validatedAnalysis.current_position.confidence,
      reasoning: validatedAnalysis.current_position.reasoning,
      future_position: validatedAnalysis.future_position,
    };
  } catch (error) {
    console.error('Error in enhanced AI economic analysis:', error);
    
    // Fallback to basic analysis if enhanced fails
    const basicAnalysis = await analyzeEconomicPosition(indicators, countryName);
    return {
      ...basicAnalysis,
      future_position: {
        growth_trend: basicAnalysis.growth_trend,
        inflation_trend: basicAnalysis.inflation_trend,
        quadrant: basicAnalysis.quadrant,
        confidence: 30, // Lower confidence for fallback
        time_horizon: "3-6 months",
        reasoning: "Fallback prediction based on current position due to enhanced analysis unavailability.",
      },
    };
  }
}

/**
 * Analyze economic indicators using Google Gemini to determine Investment Clock position
 */
export async function analyzeEconomicPosition(
  indicators: EconomicIndicator[],
  countryName: string
): Promise<AIAnalysis> {
  if (!geminiModel) {
    throw new Error('Gemini AI is not configured. Please set GEMINI_API_KEY.');
  }

  // Prepare economic data for analysis
  const economicData = indicators.map(indicator => ({
    indicator: indicator.indicator_type,
    current_value: indicator.value,
    previous_value: indicator.previous_value,
    change: indicator.previous_value 
      ? ((indicator.value - indicator.previous_value) / indicator.previous_value * 100).toFixed(2)
      : 'N/A',
    date: indicator.date,
  }));

  const prompt = `
You are an expert macroeconomic analyst specializing in the Merrill Lynch Investment Clock framework. 

Analyze the following economic indicators for ${countryName} and determine the country's position on the Investment Clock.

ECONOMIC DATA:
${economicData.map(d => 
  `• ${d.indicator.toUpperCase()}: ${d.current_value} (Previous: ${d.previous_value}, Change: ${d.change}%)`
).join('\n')}

MERRILL LYNCH INVESTMENT CLOCK FRAMEWORK (CRITICAL - FOLLOW EXACTLY):
- Recovery: Growth ↑, Inflation ↓ (Growth Trend: 0 to +100, Inflation Trend: -100 to -1)
- Overheat: Growth ↑, Inflation ↑ (Growth Trend: 0 to +100, Inflation Trend: 0 to +100)  
- Stagflation: Growth ↓, Inflation ↑ (Growth Trend: -100 to -1, Inflation Trend: 0 to +100)
- Recession: Growth ↓, Inflation ↓ (Growth Trend: -100 to -1, Inflation Trend: -100 to -1)

QUADRANT DETERMINATION RULES:
- If Growth >= 0 AND Inflation < 0 → Recovery
- If Growth >= 0 AND Inflation >= 0 → Overheat  
- If Growth < 0 AND Inflation >= 0 → Stagflation
- If Growth < 0 AND Inflation < 0 → Recession

ANALYSIS GUIDELINES:
1. PMI Composite/Manufacturing > 50 = expansion, < 50 = contraction
2. PMI trends indicate growth momentum direction
3. CPI YoY and Core PCE indicate inflation trends and direction
4. GDPNow indicates real-time growth assessment
5. Consider month-over-month changes and momentum
6. Growth Trend scale: -100 (severe contraction) to +100 (strong expansion)
7. Inflation Trend scale: -100 (deflation) to +100 (high inflation)

Please respond ONLY with a valid JSON object in this exact format:
{
  "growth_trend": [number between -100 and 100],
  "inflation_trend": [number between -100 and 100], 
  "quadrant": "[recovery|overheat|stagflation|recession]",
  "confidence": [number between 0 and 100],
  "reasoning": "Brief explanation of the analysis (2-3 sentences)"
}
`;

  try {
    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from response (handle potential markdown formatting)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('AI response does not contain valid JSON');
    }
    
    const analysisData = JSON.parse(jsonMatch[0]);
    
    // Validate the response structure
    const validatedAnalysis = AIAnalysisSchema.parse(analysisData);
    
    return validatedAnalysis;
  } catch (error) {
    console.error('Error in AI economic analysis:', error);
    
    // Fallback to basic rule-based analysis if AI fails
    return fallbackAnalysis(indicators);
  }
}

/**
 * Fallback rule-based analysis if AI is unavailable
 */
function fallbackAnalysis(indicators: EconomicIndicator[]): AIAnalysis {
  const pmiComposite = indicators.find(i => i.indicator_type === 'pmi_composite');
  const cpiYoy = indicators.find(i => i.indicator_type === 'cpi_yoy');
  
  // Simple rule-based growth assessment
  let growthTrend = 0;
  if (pmiComposite) {
    growthTrend = (pmiComposite.value - 50) * 2; // Scale PMI to -100/+100
  }
  
  // Simple rule-based inflation assessment  
  let inflationTrend = 0;
  if (cpiYoy) {
    inflationTrend = Math.min(80, Math.max(-80, (cpiYoy.value - 2) * 20)); // Target 2%, scale
  }
  
  // Determine quadrant
  let quadrant: Quadrant;
  if (growthTrend > 0 && inflationTrend < 0) quadrant = 'recovery';
  else if (growthTrend > 0 && inflationTrend > 0) quadrant = 'overheat';
  else if (growthTrend < 0 && inflationTrend > 0) quadrant = 'stagflation';
  else quadrant = 'recession';
  
  return {
    growth_trend: Math.round(growthTrend),
    inflation_trend: Math.round(inflationTrend),
    quadrant,
    confidence: 50, // Lower confidence for fallback
    reasoning: 'Fallback rule-based analysis used due to AI unavailability.',
  };
}

/**
 * Store enhanced AI analysis results with future position in history table
 */
export async function storeEnhancedAIAnalysis(
  supabaseClient: SupabaseClient,
  countryCode: string,
  countryName: string,
  indicators: EconomicIndicator[]
): Promise<EnhancedAIAnalysis> {
  const analysis = await analyzeEconomicPositionEnhanced(indicators, countryCode, countryName);
  
  // Log to AI analysis history with future position data
  const { error: historyError } = await supabaseClient
    .from('ai_analysis_history')
    .insert({
      country_code: countryCode.toUpperCase(),
      country_name: countryName,
      analysis_date: new Date().toISOString().split('T')[0],
      growth_trend: analysis.growth_trend,
      inflation_trend: analysis.inflation_trend,
      quadrant: analysis.quadrant,
      confidence: analysis.confidence,
      reasoning: analysis.reasoning,
      future_growth_trend: analysis.future_position.growth_trend,
      future_inflation_trend: analysis.future_position.inflation_trend,
      future_quadrant: analysis.future_position.quadrant,
      future_confidence: analysis.future_position.confidence,
      future_time_horizon: analysis.future_position.time_horizon,
      future_reasoning: analysis.future_position.reasoning,
      economic_indicators: indicators,
    });
  
  if (historyError) {
    console.warn('Error logging enhanced AI analysis history:', historyError);
    // Don't throw error for history logging failure
  }
  
  console.log(`✅ Enhanced AI analyzed ${countryName} - Current: ${analysis.quadrant} (Growth: ${analysis.growth_trend}, Inflation: ${analysis.inflation_trend}) | Future: ${analysis.future_position.quadrant} (Growth: ${analysis.future_position.growth_trend}, Inflation: ${analysis.future_position.inflation_trend})`);
  
  return analysis;
}

/**
 * Store AI analysis results in history table (no longer updates positions table)
 */
export async function storeAIAnalysis(
  supabaseClient: SupabaseClient,
  countryCode: string,
  countryName: string,
  indicators: EconomicIndicator[]
): Promise<AIAnalysis> {
  const analysis = await analyzeEconomicPosition(indicators, countryName);
  
  // Log to AI analysis history only (positions are now calculated on-the-fly)
  const { error: historyError } = await supabaseClient
    .from('ai_analysis_history')
    .insert({
      country_code: countryCode.toUpperCase(),
      country_name: countryName,
      analysis_date: new Date().toISOString().split('T')[0],
      growth_trend: analysis.growth_trend,
      inflation_trend: analysis.inflation_trend,
      quadrant: analysis.quadrant,
      confidence: analysis.confidence,
      reasoning: analysis.reasoning,
      economic_indicators: indicators,
    });
  
  if (historyError) {
    console.warn('Error logging AI analysis history:', historyError);
    // Don't throw error for history logging failure
  }
  
  console.log(`✅ AI analyzed ${countryName} position: ${analysis.quadrant} (Growth: ${analysis.growth_trend}, Inflation: ${analysis.inflation_trend}, Confidence: ${analysis.confidence}%)`);
  
  return analysis;
}
