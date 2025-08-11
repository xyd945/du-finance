'use client';

import { useState } from 'react';
import { SparklesIcon } from '@heroicons/react/24/outline';
import { clsx } from 'clsx';
import { AIAnalysis } from '@/types';

interface AIAnalysisButtonProps {
  countryCode: string;
  countryName: string;
  onPositionsRefresh?: () => void;
  className?: string;
}

export function AIAnalysisButton({
  countryCode,
  countryName,
  onPositionsRefresh,
  className,
}: AIAnalysisButtonProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState<AIAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runAIAnalysis = async () => {
    setIsAnalyzing(true);
    setError(null);
    
    try {
      const response = await fetch('/api/analyze-position', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          countryCode,
          countryName,
        }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Analysis failed');
      }
      
      setLastAnalysis(result.analysis);
      
      // Only refresh chart positions, not the entire page
      onPositionsRefresh?.();
      
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className={clsx('space-y-2', className)}>
      <button
        onClick={runAIAnalysis}
        disabled={isAnalyzing}
        className={clsx(
          'flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-md',
          'border border-purple-300 bg-gradient-to-r from-purple-50 to-blue-50',
          'hover:from-purple-100 hover:to-blue-100 focus:outline-none focus:ring-2',
          'focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed',
          'transition-all duration-200'
        )}
      >
        <SparklesIcon 
          className={clsx(
            'h-4 w-4 text-purple-600',
            isAnalyzing && 'animate-spin'
          )}
        />
        <span className="text-purple-700">
          {isAnalyzing ? 'Analyzing...' : 'AI Analysis'}
        </span>
      </button>

      {/* Analysis Results */}
      {lastAnalysis && (
        <div className="text-xs bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-md p-3">
          <div className="font-semibold text-purple-800 mb-1">
            ✨ AI Analysis Results
          </div>
          <div className="space-y-1 text-purple-700">
            <div>
              <strong>Position:</strong> {lastAnalysis.quadrant} 
              <span className="text-gray-500 ml-2">
                ({lastAnalysis.confidence}% confidence)
              </span>
            </div>
            <div>
              <strong>Growth:</strong> {lastAnalysis.growth_trend > 0 ? '+' : ''}{lastAnalysis.growth_trend}
              <span className="mx-2">|</span>
              <strong>Inflation:</strong> {lastAnalysis.inflation_trend > 0 ? '+' : ''}{lastAnalysis.inflation_trend}
            </div>
            <div className="text-xs text-gray-600 mt-1">
              {lastAnalysis.reasoning}
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="text-xs bg-red-50 border border-red-200 rounded-md p-2">
          <div className="text-red-600">
            <strong>Error:</strong> {error}
          </div>
          {error.includes('GEMINI_API_KEY') && (
            <div className="text-red-500 mt-1">
              Please configure your Gemini API key in .env.local
            </div>
          )}
        </div>
      )}
    </div>
  );
}
