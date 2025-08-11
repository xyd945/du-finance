'use client';

import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';
import {
  EconomicIndicator,
  HistoricalIndicator,
  IndicatorConfig,
} from '@/types';
import { Sparkline } from './sparkline';
import { clsx } from 'clsx';

interface IndicatorCardProps {
  indicator: EconomicIndicator;
  config: IndicatorConfig;
  historicalData?: HistoricalIndicator[];
  className?: string;
}

export function IndicatorCard({
  indicator,
  config,
  historicalData = [],
  className,
}: IndicatorCardProps) {
  const change = indicator.previous_value
    ? indicator.value - indicator.previous_value
    : 0;

  const changePercent = indicator.previous_value
    ? ((indicator.value - indicator.previous_value) /
        indicator.previous_value) *
      100
    : 0;

  const isPositive = change > 0;
  const isNegative = change < 0;

  const getChangeColor = () => {
    if (isPositive) return 'text-green-600';
    if (isNegative) return 'text-red-600';
    return 'text-gray-500';
  };

  const getBackgroundColor = () => {
    switch (config.color) {
      case 'blue':
        return 'bg-blue-50 border-blue-200';
      case 'indigo':
        return 'bg-indigo-50 border-indigo-200';
      case 'red':
        return 'bg-red-50 border-red-200';
      case 'orange':
        return 'bg-orange-50 border-orange-200';
      case 'green':
        return 'bg-green-50 border-green-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getSparklineColor = () => {
    switch (config.color) {
      case 'blue':
        return '#3b82f6';
      case 'indigo':
        return '#6366f1';
      case 'red':
        return '#ef4444';
      case 'orange':
        return '#f97316';
      case 'green':
        return '#10b981';
      default:
        return '#6b7280';
    }
  };

  return (
    <div
      className={clsx('p-4 rounded-lg border', getBackgroundColor(), className)}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-700">{config.label}</h3>
        {change !== 0 && (
          <div className={clsx('flex items-center text-xs', getChangeColor())}>
            {isPositive ? (
              <ArrowUpIcon className="h-3 w-3 mr-1" />
            ) : (
              <ArrowDownIcon className="h-3 w-3 mr-1" />
            )}
            {Math.abs(changePercent).toFixed(1)}%
          </div>
        )}
      </div>

      {/* Main Value */}
      <div className="flex items-end justify-between mb-3">
        <div>
          <div className="text-2xl font-bold text-gray-900">
            {config.format(indicator.value)}
          </div>
          {indicator.previous_value && (
            <div className="text-xs text-gray-500">
              Previous: {config.format(indicator.previous_value)}
            </div>
          )}
        </div>
      </div>

      {/* Sparkline */}
      {historicalData.length > 0 && (
        <div className="mb-2">
          <Sparkline
            data={historicalData}
            color={getSparklineColor()}
            height={30}
            className="w-full"
          />
        </div>
      )}

      {/* Footer Info */}
      <div className="text-xs text-gray-500">
        {new Date(indicator.date).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })}
      </div>
    </div>
  );
}
