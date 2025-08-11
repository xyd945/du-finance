# AI-Powered Investment Clock Setup Guide

This guide explains how to set up Google Gemini AI to automatically determine Investment Clock positions based on economic indicators.

## 🧠 **How It Works**

The AI analysis system:
1. **Fetches** current economic indicators for a country
2. **Analyzes** the data using Google Gemini AI with economic expertise
3. **Determines** growth trend (-100 to +100) and inflation trend (-100 to +100)
4. **Calculates** the appropriate Investment Clock quadrant
5. **Updates** the database with the AI-determined position
6. **Logs** the analysis history for tracking

## 🔧 **Setup Instructions**

### Step 1: Get Google Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Sign in with your Google account
3. Click "Get API Key" 
4. Create a new API key or use an existing project
5. Copy your API key

### Step 2: Update Environment Variables

Add to your `.env.local` file:
```env
# Google Gemini AI Configuration
GEMINI_API_KEY=your_google_gemini_api_key_here
```

### Step 3: Update Database Schema

Run the additional schema in your Supabase SQL Editor:
```sql
-- Copy and run the contents of ai-analysis-schema.sql
```

This adds:
- `ai_analysis_history` table for tracking AI analyses
- Additional columns to `investment_clock_positions` for AI metadata

### Step 4: Restart Your Application

```bash
npm run dev
```

## 🎯 **Using AI Analysis**

### Via UI (Recommended)

1. **Select a country** in the dropdown
2. **Click "AI Analysis"** in the Economic Indicators panel
3. **Wait for analysis** (usually 2-5 seconds)
4. **View results** showing position, confidence, and reasoning
5. **See updated position** on the Investment Clock chart

### Via API

```bash
# POST request to analyze a country
curl -X POST http://localhost:3001/api/analyze-position \
  -H "Content-Type: application/json" \
  -d '{"countryCode": "USA", "countryName": "United States"}'
```

## 📊 **AI Analysis Logic**

The AI considers:

### **Economic Indicators**
- **PMI Composite/Manufacturing**: Growth momentum (>50 = expansion)
- **CPI YoY**: Inflation level and direction
- **Core PCE**: Underlying inflation trends
- **GDPNow**: Real-time growth assessment

### **Merrill Lynch Framework**
- **Recovery**: Growth ↑, Inflation ↓ (Growth: +20 to +80, Inflation: -80 to -20)
- **Overheat**: Growth ↑, Inflation ↑ (Growth: +20 to +80, Inflation: +20 to +80)
- **Stagflation**: Growth ↓, Inflation ↑ (Growth: -80 to -20, Inflation: +20 to +80)
- **Recession**: Growth ↓, Inflation ↓ (Growth: -80 to -20, Inflation: -80 to -20)

### **AI Prompt Engineering**
The system uses a sophisticated prompt that:
- Provides economic context and framework
- Analyzes current vs. previous values
- Considers momentum and trends
- Returns structured JSON with confidence scores
- Includes reasoning for transparency

## 🔍 **Troubleshooting**

### Common Issues

1. **"Gemini AI is not configured"**
   - Check your `GEMINI_API_KEY` in `.env.local`
   - Restart the development server

2. **API Key Invalid**
   - Verify your key at [Google AI Studio](https://aistudio.google.com/)
   - Ensure no extra spaces or characters

3. **No Economic Indicators**
   - Ensure you have indicators in the database for the country
   - Run the main `database-setup.sql` first

4. **Analysis Fails**
   - The system will fall back to rule-based analysis
   - Check browser console for detailed error messages

### Fallback System

If AI analysis fails, the system automatically uses rule-based logic:
- PMI scores mapped to growth trends
- CPI levels mapped to inflation trends
- Simple quadrant determination

## 📈 **Benefits of AI Analysis**

### **Accuracy**
- Considers multiple indicators simultaneously
- Understands economic relationships and context
- Adapts to different economic environments

### **Consistency**
- Eliminates manual bias in positioning
- Uses systematic analysis framework
- Provides confidence scores and reasoning

### **Scalability**
- Easy to add new countries
- Automatic updates when indicators change
- Historical tracking of analysis decisions

## 🔄 **Automated Workflows**

### **Scheduled Analysis** (Future Enhancement)
You can set up automated analysis using:
```javascript
// Example: Analyze all countries daily
setInterval(async () => {
  const countries = ['USA', 'GBR', 'DEU', 'JPN'];
  for (const country of countries) {
    await analyzeCountry(country);
  }
}, 24 * 60 * 60 * 1000); // Daily
```

### **Data Pipeline Integration**
- Trigger analysis when new economic data arrives
- Update positions automatically on indicator changes
- Alert on significant quadrant shifts

## 📊 **Analysis History**

The system tracks all AI analyses in the `ai_analysis_history` table:
- Date and time of analysis
- Economic indicators used
- AI confidence level
- Reasoning provided
- Historical position changes

This enables:
- Audit trail of position changes
- Confidence trending over time
- Model performance evaluation
- Historical analysis comparison

## 🚀 **Advanced Features**

### **Custom Prompts**
Modify the AI prompt in `src/lib/economic-analysis.ts` to:
- Add new economic indicators
- Adjust analysis framework
- Include country-specific context

### **Confidence Thresholds**
Set minimum confidence levels:
```typescript
if (analysis.confidence < 70) {
  // Use fallback analysis or request human review
}
```

### **Multi-Model Analysis**
Compare results from different AI models for increased accuracy.

## 💰 **Cost Considerations**

- Google Gemini API is very cost-effective
- Each analysis costs approximately $0.001-0.005
- Consider caching results for frequent requests
- Monitor usage in Google AI Studio dashboard

## 🔒 **Security**

- API keys are server-side only (not exposed to client)
- Use environment variables for all credentials
- Monitor API usage for unusual activity
- Consider rate limiting for production use
