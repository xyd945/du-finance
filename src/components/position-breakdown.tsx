'use client';

import { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { CountryData } from '@/types';
import { calculateInvestmentClockPosition } from '@/lib/investment-clock-calculator';
import { clsx } from 'clsx';

interface PositionBreakdownProps {
  countryData: CountryData;
  className?: string;
}

export function PositionBreakdown({ countryData, className }: PositionBreakdownProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Calculate the breakdown
  const calculatedPosition = calculateInvestmentClockPosition(countryData.indicators);

  const formatComponent = (name: string, value: number) => {
    const sign = value > 0 ? '+' : '';
    const color = value > 0 ? 'text-green-600' : value < 0 ? 'text-red-600' : 'text-gray-600';
    return (
      <div key={name} className="flex justify-between text-xs">
        <span className="text-gray-600">{name}:</span>
        <span className={color}>{sign}{value.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <div className={clsx('border border-gray-200 rounded-lg', className)}>
      {/* Header - Always Visible */}
      <div 
        className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <span className="text-sm font-medium text-gray-700">
            Rule-Based Calculated Position
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="text-xs text-gray-500">
            {calculatedPosition.confidence}% confidence
          </div>
          {isExpanded ? (
            <ChevronUpIcon className="h-4 w-4 text-gray-400" />
          ) : (
            <ChevronDownIcon className="h-4 w-4 text-gray-400" />
          )}
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-3 pb-3 space-y-3 border-t border-gray-100">
          {/* Current Position Summary */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-gray-600">Growth Trend</div>
              <div className={clsx(
                'font-semibold',
                calculatedPosition.growth_trend > 0 ? 'text-green-600' : 'text-red-600'
              )}>
                {calculatedPosition.growth_trend > 0 ? '+' : ''}{calculatedPosition.growth_trend}
              </div>
            </div>
            <div>
              <div className="text-gray-600">Inflation Trend</div>
              <div className={clsx(
                'font-semibold',
                calculatedPosition.inflation_trend > 0 ? 'text-red-600' : 'text-green-600'
              )}>
                {calculatedPosition.inflation_trend > 0 ? '+' : ''}{calculatedPosition.inflation_trend}
              </div>
            </div>
          </div>

          {/* Quadrant */}
          <div>
            <div className="text-gray-600 text-sm">Quadrant</div>
            <div className="font-semibold capitalize text-sm">
              {calculatedPosition.quadrant}
            </div>
          </div>

          {/* Growth Components Breakdown */}
          <div>
            <div className="text-gray-700 font-medium text-xs mb-1">
              📈 Growth Components:
            </div>
            <div className="space-y-1 pl-2">
              {Object.entries(calculatedPosition.components.growth_components).map(
                ([name, value]) => formatComponent(name, value)
              )}
            </div>
          </div>

          {/* Inflation Components Breakdown */}
          <div>
            <div className="text-gray-700 font-medium text-xs mb-1">
              🔥 Inflation Components:
            </div>
            <div className="space-y-1 pl-2">
              {Object.entries(calculatedPosition.components.inflation_components).map(
                ([name, value]) => formatComponent(name, value)
              )}
            </div>
          </div>

          {/* Calculation Method */}
          <div className="pt-2 border-t border-gray-100">
            <div className="text-xs text-gray-500">
              Method: <span className="font-medium">{calculatedPosition.calculation_method}</span>
              <span className="mx-2">•</span>
              Confidence: <span className="font-medium">{calculatedPosition.confidence}%</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
