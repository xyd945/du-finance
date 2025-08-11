'use client';

import { useMemo } from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { HistoricalIndicator } from '@/types';

interface SparklineProps {
  data: HistoricalIndicator[];
  color?: string;
  height?: number;
  className?: string;
}

export function Sparkline({
  data,
  color = '#3b82f6',
  height = 40,
  className,
}: SparklineProps) {
  const chartData = useMemo(
    () =>
      data
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .map(item => ({
          date: item.date,
          value: item.value,
        })),
    [data]
  );

  if (chartData.length === 0) {
    return (
      <div
        className={`flex items-center justify-center ${className}`}
        style={{ height }}
      >
        <div className="text-xs text-gray-400">No data</div>
      </div>
    );
  }

  return (
    <div className={className} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={1.5}
            dot={false}
            activeDot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
