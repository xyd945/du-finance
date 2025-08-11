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
}

export const QUADRANT_CONFIGS: QuadrantConfig[] = [
  {
    key: 'recovery',
    label: 'Recovery',
    description: 'Improving growth, declining inflation',
    color: 'bg-green-100',
    textColor: 'text-green-800',
    position: { x: 'left', y: 'top' },
  },
  {
    key: 'overheat',
    label: 'Overheat',
    description: 'Strong growth, rising inflation',
    color: 'bg-red-100',
    textColor: 'text-red-800',
    position: { x: 'right', y: 'top' },
  },
  {
    key: 'stagflation',
    label: 'Stagflation',
    description: 'Weak growth, high inflation',
    color: 'bg-orange-100',
    textColor: 'text-orange-800',
    position: { x: 'right', y: 'bottom' },
  },
  {
    key: 'recession',
    label: 'Recession',
    description: 'Declining growth, falling inflation',
    color: 'bg-blue-100',
    textColor: 'text-blue-800',
    position: { x: 'left', y: 'bottom' },
  },
];

// Error Types
export const ApiErrorSchema = z.object({
  message: z.string(),
  code: z.string().optional(),
  details: z.unknown().optional(),
});

export type ApiError = z.infer<typeof ApiErrorSchema>;
