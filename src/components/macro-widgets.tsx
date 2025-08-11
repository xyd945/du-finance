'use client';

import { CountryData, INDICATOR_CONFIGS } from '@/types';
import { IndicatorCard } from './indicator-card';
import { AIAnalysisButton } from './ai-analysis-button';
import { PositionBreakdown } from './position-breakdown';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { clsx } from 'clsx';

interface MacroWidgetsProps {
  countryData: CountryData | null;
  isLoading?: boolean;
  onRefresh?: () => void;
  className?: string;
}

export function MacroWidgets({
  countryData,
  isLoading = false,
  onRefresh,
  className,
}: MacroWidgetsProps) {
  if (!countryData) {
    return (
      <div className={clsx('space-y-4', className)}>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            Economic Indicators
          </h2>
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className={clsx(
              'p-2 rounded-md border border-gray-300 bg-white shadow-sm',
              'hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            <ArrowPathIcon
              className={clsx('h-4 w-4', isLoading && 'animate-spin')}
            />
          </button>
        </div>

        <div className="text-center py-8 text-gray-500">
          <p>Select a country to view economic indicators</p>
        </div>
      </div>
    );
  }

  return (
    <div className={clsx('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Economic Indicators
          </h2>
          <p className="text-sm text-gray-600">{countryData.country_name}</p>
        </div>
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className={clsx(
            'p-2 rounded-md border border-gray-300 bg-white shadow-sm',
            'hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          <ArrowPathIcon
            className={clsx('h-4 w-4', isLoading && 'animate-spin')}
          />
        </button>
      </div>

      {/* Investment Clock Position Summary */}
      <div className="p-4 bg-gray-50 rounded-lg border">
        <h3 className="text-sm font-medium text-gray-700 mb-2">
          Current Position
        </h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-gray-600">Growth Trend</div>
            <div className="font-semibold">
              {countryData.position.growth_trend.toFixed(1)}
            </div>
          </div>
          <div>
            <div className="text-gray-600">Inflation Trend</div>
            <div className="font-semibold">
              {countryData.position.inflation_trend.toFixed(1)}
            </div>
          </div>
        </div>
        <div className="mt-2">
          <div className="text-gray-600">Quadrant</div>
          <div className="font-semibold capitalize">
            {countryData.position.quadrant}
          </div>
        </div>
        
        {/* AI Analysis Button */}
        <div className="mt-3 pt-3 border-t border-gray-200">
          <AIAnalysisButton
            countryCode={countryData.country_code}
            countryName={countryData.country_name}
            onAnalysisComplete={onRefresh}
          />
        </div>
      </div>

      {/* Position Calculation Breakdown */}
      <PositionBreakdown countryData={countryData} />

      {/* Indicator Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4">
        {INDICATOR_CONFIGS.map(config => {
          const indicator = countryData.indicators.find(
            ind => ind.indicator_type === config.key
          );

          const historicalData =
            countryData.historical_data?.[config.key] || [];

          if (!indicator) {
            return (
              <div
                key={config.key}
                className="p-4 rounded-lg border border-gray-200 bg-gray-50"
              >
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  {config.label}
                </h3>
                <div className="text-center py-4 text-gray-500 text-sm">
                  No data available
                </div>
              </div>
            );
          }

          return (
            <IndicatorCard
              key={config.key}
              indicator={indicator}
              config={config}
              historicalData={historicalData}
            />
          );
        })}
      </div>

      {/* Last Updated */}
      <div className="text-xs text-gray-500 text-center">
        Last updated: {new Date().toLocaleString()}
      </div>
    </div>
  );
}
