'use client';

import { useState, useMemo } from 'react';
import { InvestmentClock } from './investment-clock';
import { MacroWidgets } from './macro-widgets';
import { CountrySelector } from './country-selector';
import { LoadingSpinner } from './loading-spinner';
import { ErrorMessage } from './error-message';

import {
  useAllInvestmentClockPositions,
  useCountryData,
  useRealTimeUpdates,
} from '@/hooks/use-economic-data';
import { COUNTRIES } from '@/types';

export function Dashboard() {
  const [selectedCountry, setSelectedCountry] = useState<string>('USA');

  // Fetch all investment clock positions for the chart
  const {
    data: allPositions,
    error: positionsError,
    isLoading: positionsLoading,
    refresh: refreshPositions,
  } = useAllInvestmentClockPositions();

  // Fetch detailed data for the selected country
  const {
    data: countryData,
    isLoading: countryLoading,
    refresh: refreshCountryData,
  } = useCountryData(selectedCountry);

  const { triggerGlobalRefresh } = useRealTimeUpdates();

  // Handle country selection
  const handleCountrySelect = (countryCode: string) => {
    setSelectedCountry(countryCode);
  };

  // Handle refresh
  const handleRefresh = () => {
    // Force refresh positions data to get new AI analysis
    refreshPositions();
    refreshCountryData();
    triggerGlobalRefresh();
  };

  // Get available countries from positions data
  const availableCountries = useMemo(() => {
    const positionCountries = allPositions.map(pos => ({
      code: pos.country_code,
      name: pos.country_name,
    }));

    // Merge with predefined countries
    const allCountries = COUNTRIES.map(country => {
      const positionCountry = positionCountries.find(
        pc => pc.code === country.code
      );
      return {
        ...country,
        name: positionCountry?.name || country.name,
        enabled: country.enabled && !!positionCountry,
      };
    });

    // Add any additional countries from positions that aren't in COUNTRIES
    positionCountries.forEach(pc => {
      if (!allCountries.find(c => c.code === pc.code)) {
        allCountries.push({
          code: pc.code,
          name: pc.name,
          flag: pc.code.slice(0, 2), // Fallback flag code
          enabled: true,
        });
      }
    });

    return allCountries.filter(c => c.enabled);
  }, [allPositions]);

  // Show loading state for initial load
  if (positionsLoading && allPositions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  // Show error state
  if (positionsError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <ErrorMessage
          title="Failed to load data"
          message={positionsError.message}
          onRetry={handleRefresh}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                du.finance
              </h1>
              <p className="text-sm text-gray-600">
                Economics & Investment Research Lab
              </p>
            </div>

            <div className="flex items-center space-x-4">
              {/* Navigation items can be added here in the future */}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title and Controls */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="mb-4 sm:mb-0">
              <h2 className="text-3xl font-bold text-gray-900">
                Global Investment Clock
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                Real-time economic positioning across global markets
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <CountrySelector
                countries={availableCountries}
                selectedCountry={selectedCountry}
                onCountrySelect={handleCountrySelect}
                className="w-56"
              />
            </div>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="block lg:hidden space-y-8">
          {/* Investment Clock */}
          <section className="bg-white rounded-lg shadow-sm p-6">
            <InvestmentClock
              positions={allPositions}
              selectedCountry={selectedCountry}
              onCountrySelect={handleCountrySelect}
            />
          </section>

          {/* Macro Widgets */}
          <section className="bg-white rounded-lg shadow-sm p-6">
            <MacroWidgets
              countryData={countryData}
              isLoading={countryLoading}
              onRefresh={handleRefresh}
              onPositionsRefresh={refreshPositions}
            />
          </section>
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:grid lg:grid-cols-3 lg:gap-8">
          {/* Investment Clock - Left Side (2/3 width) */}
          <section className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
            <InvestmentClock
              positions={allPositions}
              selectedCountry={selectedCountry}
              onCountrySelect={handleCountrySelect}
            />
          </section>

          {/* Macro Widgets - Right Side (1/3 width) */}
          <section className="bg-white rounded-lg shadow-sm p-6">
            <MacroWidgets
              countryData={countryData}
              isLoading={countryLoading}
              onRefresh={handleRefresh}
              onPositionsRefresh={refreshPositions}
            />
          </section>
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center text-sm text-gray-500">
          <p>
            The Global Investment Clock (Merrill Lynch Investment Clock) is built by du.finance labs, all rights reserved, 2025.
          </p>
        </footer>
      </main>


    </div>
  );
}
