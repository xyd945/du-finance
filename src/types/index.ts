import { z } from 'zod';

// Economic Indicator Types
export const IndicatorTypeSchema = z.enum([
  'pmi_composite',
  'pmi_manufacturing',
  'cpi_yoy',
  'core_pce',
  'gdp_now',
]);

export type IndicatorType = z.infer<typeof IndicatorTypeSchema>;

// Investment Clock Quadrants
export const QuadrantSchema = z.enum([
  'recovery',
  'overheat',
  'stagflation',
  'recession',
]);

export type Quadrant = z.infer<typeof QuadrantSchema>;

// Economic Indicator Schema
export const EconomicIndicatorSchema = z.object({
  id: z.number(),
  country_code: z.string().length(3),
  country_name: z.string(),
  indicator_type: IndicatorTypeSchema,
  value: z.number(),
  previous_value: z.number().nullable(),
  date: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type EconomicIndicator = z.infer<typeof EconomicIndicatorSchema>;

// Historical Indicator Schema
export const HistoricalIndicatorSchema = z.object({
  id: z.number(),
  country_code: z.string().length(3),
  indicator_type: IndicatorTypeSchema,
  value: z.number(),
  date: z.string(),
  created_at: z.string(),
});

export type HistoricalIndicator = z.infer<typeof HistoricalIndicatorSchema>;

// Investment Clock Position Schema
export const InvestmentClockPositionSchema = z.object({
  id: z.number(),
  country_code: z.string().length(3),
  country_name: z.string(),
  growth_trend: z.number().min(-100).max(100),
  inflation_trend: z.number().min(-100).max(100),
  quadrant: QuadrantSchema,
  date: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type InvestmentClockPosition = z.infer<
  typeof InvestmentClockPositionSchema
>;

// Consolidated country data for display
export const CountryDataSchema = z.object({
  country_code: z.string().length(3),
  country_name: z.string(),
  position: InvestmentClockPositionSchema,
  indicators: z.array(EconomicIndicatorSchema),
  historical_data: z.record(z.string(), z.array(HistoricalIndicatorSchema)),
});

export type CountryData = z.infer<typeof CountryDataSchema>;

// API Response Schemas
export const EconomicIndicatorResponseSchema = z.array(EconomicIndicatorSchema);
export const HistoricalIndicatorResponseSchema = z.array(
  HistoricalIndicatorSchema
);
export const InvestmentClockPositionResponseSchema = z.array(
  InvestmentClockPositionSchema
);

// Chart Data Types
export interface ChartDataPoint {
  date: string;
  value: number;
}

export interface ClockPosition {
  x: number; // inflation_trend
  y: number; // growth_trend
  country_code: string;
  country_name: string;
  quadrant: Quadrant;
}

// Indicator Display Configuration
export interface IndicatorConfig {
  key: IndicatorType;
  label: string;
  unit: string;
  format: (value: number) => string;
  color: string;
}

// Countries Configuration
export interface CountryConfig {
  code: string;
  name: string;
  flag: string;
  enabled: boolean;
}

// AI Analysis Interface
export interface AIAnalysis {
  growth_trend: number;
  inflation_trend: number;
  quadrant: Quadrant;
  confidence: number;
  reasoning: string;
}

// App Configuration
export const COUNTRIES: CountryConfig[] = [
  {
    code: 'USA',
    name: 'United States',
    flag: 'US',
    enabled: true,
  },
  // Additional countries can be added here
];

export const INDICATOR_CONFIGS: IndicatorConfig[] = [
  {
    key: 'pmi_composite',
    label: 'Composite PMI',
    unit: '',
    format: (value: number) => value.toFixed(1),
    color: 'blue',
  },
  {
    key: 'pmi_manufacturing',
    label: 'Manufacturing PMI',
    unit: '',
    format: (value: number) => value.toFixed(1),
    color: 'indigo',
  },
  {
    key: 'cpi_yoy',
    label: 'CPI YoY',
    unit: '%',
    format: (value: number) => `${value.toFixed(1)}%`,
    color: 'red',
  },
  {
    key: 'core_pce',
    label: 'Core PCE',
    unit: '%',
    format: (value: number) => `${value.toFixed(1)}%`,
    color: 'orange',
  },
  {
    key: 'gdp_now',
    label: 'GDPNow',
    unit: '%',
    format: (value: number) => `${value.toFixed(1)}%`,
    color: 'green',
  },
];

// Asset allocation priority for each asset class
export interface AssetAllocation {
  asset: string;
  priority: number; // 1 = highest priority, 4 = lowest priority
  reasoning: string;
  icon: string;
}

// Investment Clock Quadrant Configurations
export interface QuadrantConfig {
  key: Quadrant;
  label: string;
  description: string;
  color: string;
  textColor: string;
  position: {
    x: 'left' | 'right';
    y: 'top' | 'bottom';
  };
  assetAllocation: AssetAllocation[];
  investmentStrategy: string;
}

export const QUADRANT_CONFIGS: QuadrantConfig[] = [
  {
    key: 'recovery',
    label: 'Recovery',
    description: 'Improving growth, declining inflation',
    color: 'bg-green-100',
    textColor: 'text-green-800',
    position: { x: 'left', y: 'top' },
    investmentStrategy: 'Focus on equities as corporate earnings accelerate while interest rates remain low',
    assetAllocation: [
      {
        asset: 'Stocks',
        priority: 1,
        reasoning: 'Corporate earnings improve with economic recovery',
        icon: '📈'
      },
      {
        asset: 'Bonds',
        priority: 2,
        reasoning: 'Still attractive as rates haven\'t risen yet',
        icon: '🏛️'
      },
      {
        asset: 'Commodities',
        priority: 3,
        reasoning: 'Moderate allocation as demand picks up',
        icon: '🥇'
      },
      {
        asset: 'Cash',
        priority: 4,
        reasoning: 'Low returns in recovering economy',
        icon: '💵'
      }
    ]
  },
  {
    key: 'overheat',
    label: 'Overheat',
    description: 'Strong growth, rising inflation',
    color: 'bg-red-100',
    textColor: 'text-red-800',
    position: { x: 'right', y: 'top' },
    investmentStrategy: 'Shift towards commodities and real assets as inflation accelerates and rates rise',
    assetAllocation: [
      {
        asset: 'Commodities',
        priority: 1,
        reasoning: 'Best inflation hedge during economic expansion',
        icon: '🥇'
      },
      {
        asset: 'Stocks',
        priority: 2,
        reasoning: 'Still positive but facing headwinds from rising rates',
        icon: '📈'
      },
      {
        asset: 'Cash',
        priority: 3,
        reasoning: 'Rising short-term rates improve returns',
        icon: '💵'
      },
      {
        asset: 'Bonds',
        priority: 4,
        reasoning: 'Vulnerable to rising interest rates',
        icon: '🏛️'
      }
    ]
  },
  {
    key: 'stagflation',
    label: 'Stagflation',
    description: 'Weak growth, high inflation',
    color: 'bg-orange-100',
    textColor: 'text-orange-800',
    position: { x: 'right', y: 'bottom' },
    investmentStrategy: 'Defensive positioning with cash and commodities while avoiding bonds and stocks',
    assetAllocation: [
      {
        asset: 'Cash',
        priority: 1,
        reasoning: 'Safety and liquidity during economic uncertainty',
        icon: '💵'
      },
      {
        asset: 'Commodities',
        priority: 2,
        reasoning: 'Continued inflation protection despite weak growth',
        icon: '🥇'
      },
      {
        asset: 'Bonds',
        priority: 3,
        reasoning: 'Some government bonds for safety',
        icon: '🏛️'
      },
      {
        asset: 'Stocks',
        priority: 4,
        reasoning: 'Weak earnings and multiple compression',
        icon: '📈'
      }
    ]
  },
  {
    key: 'recession',
    label: 'Recession',
    description: 'Declining growth, falling inflation',
    color: 'bg-blue-100',
    textColor: 'text-blue-800',
    position: { x: 'left', y: 'bottom' },
    investmentStrategy: 'Prioritize bonds and cash for safety, prepare for next recovery cycle',
    assetAllocation: [
      {
        asset: 'Bonds',
        priority: 1,
        reasoning: 'Declining rates boost bond prices and provide safety',
        icon: '🏛️'
      },
      {
        asset: 'Cash',
        priority: 2,
        reasoning: 'Liquidity and optionality for opportunities',
        icon: '💵'
      },
      {
        asset: 'Stocks',
        priority: 3,
        reasoning: 'Selective opportunities at attractive valuations',
        icon: '📈'
      },
      {
        asset: 'Commodities',
        priority: 4,
        reasoning: 'Weak demand during economic contraction',
        icon: '🥇'
      }
    ]
  },
];

// Error Types
export const ApiErrorSchema = z.object({
  message: z.string(),
  code: z.string().optional(),
  details: z.unknown().optional(),
});

export type ApiError = z.infer<typeof ApiErrorSchema>;
