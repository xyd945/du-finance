'use client';

import { useMemo } from 'react';
import { scaleLinear } from 'd3-scale';
import {
  InvestmentClockPosition,
  QUADRANT_CONFIGS,
  ClockPosition,
} from '@/types';
import { clsx } from 'clsx';

interface InvestmentClockProps {
  positions: InvestmentClockPosition[];
  selectedCountry?: string;
  onCountrySelect?: (countryCode: string) => void;
  className?: string;
}

const CHART_SIZE = 400;
const CHART_PADDING = 60;
const CHART_INNER_SIZE = CHART_SIZE - 2 * CHART_PADDING;

export function InvestmentClock({
  positions,
  selectedCountry,
  onCountrySelect,
  className,
}: InvestmentClockProps) {
  // Create scales for positioning
  const xScale = useMemo(
    () =>
      scaleLinear()
        .domain([-100, 100]) // inflation_trend range
        .range([0, CHART_INNER_SIZE]),
    []
  );

  const yScale = useMemo(
    () =>
      scaleLinear()
        .domain([-100, 100]) // growth_trend range (flipped for SVG coordinates)
        .range([CHART_INNER_SIZE, 0]),
    []
  );

  // Transform positions for rendering
  const clockPositions: ClockPosition[] = useMemo(
    () =>
      positions.map(position => ({
        x: xScale(position.inflation_trend),
        y: yScale(position.growth_trend),
        country_code: position.country_code,
        country_name: position.country_name,
        quadrant: position.quadrant,
      })),
    [positions, xScale, yScale]
  );

  // Get quadrant background areas
  const quadrantAreas = useMemo(() => {
    const centerX = CHART_INNER_SIZE / 2;
    const centerY = CHART_INNER_SIZE / 2;

    return QUADRANT_CONFIGS.map(config => {
      const x = config.position.x === 'left' ? 0 : centerX;
      const y = config.position.y === 'top' ? 0 : centerY;

      return {
        ...config,
        x,
        y,
        width: centerX,
        height: centerY,
      };
    });
  }, []);

  return (
    <div className={clsx('flex flex-col items-center', className)}>
      {/* Chart Title */}
      <div className="mb-4 text-center">
        <h2 className="text-2xl font-bold text-gray-900">
          Merrill Lynch Investment Clock
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Global Economic Positioning
        </p>
      </div>

      {/* SVG Chart */}
      <div className="relative">
        <svg
          width={CHART_SIZE}
          height={CHART_SIZE}
          className="border border-gray-200 rounded-lg shadow-sm bg-white"
        >
          <defs>
            {/* Gradient definitions for quadrants */}
            {QUADRANT_CONFIGS.map(config => (
              <linearGradient
                key={`gradient-${config.key}`}
                id={`gradient-${config.key}`}
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop
                  offset="0%"
                  stopColor={config.color
                    .replace('bg-', '')
                    .replace('-100', '')}
                  stopOpacity="0.1"
                />
                <stop
                  offset="100%"
                  stopColor={config.color
                    .replace('bg-', '')
                    .replace('-100', '')}
                  stopOpacity="0.05"
                />
              </linearGradient>
            ))}
          </defs>

          {/* Chart background and quadrants */}
          <g transform={`translate(${CHART_PADDING}, ${CHART_PADDING})`}>
            {/* Quadrant backgrounds */}
            {quadrantAreas.map(area => (
              <rect
                key={area.key}
                x={area.x}
                y={area.y}
                width={area.width}
                height={area.height}
                fill={`url(#gradient-${area.key})`}
                stroke="none"
              />
            ))}

            {/* Grid lines */}
            <g stroke="#e5e7eb" strokeWidth="1" strokeDasharray="2,2">
              {/* Vertical center line */}
              <line
                x1={CHART_INNER_SIZE / 2}
                y1={0}
                x2={CHART_INNER_SIZE / 2}
                y2={CHART_INNER_SIZE}
              />
              {/* Horizontal center line */}
              <line
                x1={0}
                y1={CHART_INNER_SIZE / 2}
                x2={CHART_INNER_SIZE}
                y2={CHART_INNER_SIZE / 2}
              />
            </g>

            {/* Axes */}
            <g>
              {/* X-axis (inflation) */}
              <line
                x1={0}
                y1={CHART_INNER_SIZE}
                x2={CHART_INNER_SIZE}
                y2={CHART_INNER_SIZE}
                stroke="#374151"
                strokeWidth="2"
              />
              {/* Y-axis (growth) */}
              <line
                x1={0}
                y1={0}
                x2={0}
                y2={CHART_INNER_SIZE}
                stroke="#374151"
                strokeWidth="2"
              />
            </g>

            {/* Country positions */}
            {clockPositions.map(position => (
              <g key={position.country_code}>
                {/* Country dot */}
                <circle
                  cx={position.x}
                  cy={position.y}
                  r={selectedCountry === position.country_code ? 8 : 6}
                  fill={
                    selectedCountry === position.country_code
                      ? '#ef4444'
                      : '#3b82f6'
                  }
                  stroke="white"
                  strokeWidth="2"
                  className="cursor-pointer transition-all duration-200 hover:r-8"
                  onClick={() => onCountrySelect?.(position.country_code)}
                />

                {/* Country label */}
                <text
                  x={position.x}
                  y={position.y - 12}
                  textAnchor="middle"
                  className="text-xs font-medium fill-gray-700 pointer-events-none"
                >
                  {position.country_code}
                </text>
              </g>
            ))}
          </g>

          {/* Axis labels */}
          <g>
            {/* X-axis label (inflation) */}
            <text
              x={CHART_SIZE / 2}
              y={CHART_SIZE - 10}
              textAnchor="middle"
              className="text-sm font-medium fill-gray-600"
            >
              Inflation Trend →
            </text>

            {/* Y-axis label (growth) */}
            <text
              x={15}
              y={CHART_SIZE / 2}
              textAnchor="middle"
              transform={`rotate(-90, 15, ${CHART_SIZE / 2})`}
              className="text-sm font-medium fill-gray-600"
            >
              ← Growth Trend
            </text>
          </g>
        </svg>

        {/* Quadrant labels overlay */}
        <div className="absolute inset-0 pointer-events-none">
          {QUADRANT_CONFIGS.map(config => {
            const leftOffset =
              config.position.x === 'left'
                ? CHART_PADDING + 10
                : CHART_PADDING + CHART_INNER_SIZE / 2 + 10;
            const topOffset =
              config.position.y === 'top'
                ? CHART_PADDING + 10
                : CHART_PADDING + CHART_INNER_SIZE / 2 + 10;

            return (
              <div
                key={config.key}
                className="absolute text-xs font-semibold"
                style={{
                  left: leftOffset,
                  top: topOffset,
                }}
              >
                <div
                  className={clsx(
                    'px-2 py-1 rounded',
                    config.color,
                    config.textColor
                  )}
                >
                  {config.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
        {QUADRANT_CONFIGS.map(config => (
          <div key={config.key} className="flex items-center space-x-2">
            <div className={clsx('w-4 h-4 rounded', config.color)} />
            <div>
              <div className="font-medium">{config.label}</div>
              <div className="text-gray-600 text-xs">{config.description}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
