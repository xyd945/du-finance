import { geminiModel } from './gemini';
import { EconomicIndicator, Quadrant } from '@/types';
import { z } from 'zod';

// Schema for AI response validation
const AIAnalysisSchema = z.object({
  growth_trend: z.number().min(-100).max(100),
  inflation_trend: z.number().min(-100).max(100),
  quadrant: z.enum(['recovery', 'overheat', 'stagflation', 'recession']),
  confidence: z.number().min(0).max(100),
  reasoning: z.string(),
});

export type AIAnalysis = z.infer<typeof AIAnalysisSchema>;

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

MERRILL LYNCH INVESTMENT CLOCK FRAMEWORK:
- Recovery: Growth accelerating ↑, Inflation declining ↓ (Growth Trend: +20 to +80, Inflation Trend: -80 to -20)
- Overheat: Growth strong ↑, Inflation rising ↑ (Growth Trend: +20 to +80, Inflation Trend: +20 to +80)  
- Stagflation: Growth slowing ↓, Inflation high ↑ (Growth Trend: -80 to -20, Inflation Trend: +20 to +80)
- Recession: Growth declining ↓, Inflation falling ↓ (Growth Trend: -80 to -20, Inflation Trend: -80 to -20)

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
  const pmiManufacturing = indicators.find(i => i.indicator_type === 'pmi_manufacturing');
  const cpiYoy = indicators.find(i => i.indicator_type === 'cpi_yoy');
  const corePce = indicators.find(i => i.indicator_type === 'core_pce');
  
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
 * Store AI analysis results in history table (no longer updates positions table)
 */
export async function storeAIAnalysis(
  supabase: any,
  countryCode: string,
  countryName: string,
  indicators: EconomicIndicator[]
): Promise<AIAnalysis> {
  const analysis = await analyzeEconomicPosition(indicators, countryName);
  
  // Log to AI analysis history only (positions are now calculated on-the-fly)
  const { error: historyError } = await supabase
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
