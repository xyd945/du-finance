import useSWR from 'swr';
import {
  fetchCountryData,
  fetchAllInvestmentClockPositions,
  withRetry,
  handleApiError,
} from '@/lib/api';
import { CountryData, InvestmentClockPosition, ApiError } from '@/types';

/**
 * SWR configuration
 */
const swrConfig = {
  refreshInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  revalidateOnFocus: true,
  revalidateOnReconnect: true,
  dedupingInterval: 60 * 1000, // Dedupe requests for 1 minute
  errorRetryInterval: 30 * 1000, // Retry failed requests every 30 seconds
  errorRetryCount: 3,
  onError: (error: unknown) => {
    console.error('SWR Error:', handleApiError(error));
  },
};

/**
 * Hook to fetch comprehensive country data
 */
export function useCountryData(countryCode: string) {
  const { data, error, isLoading, mutate } = useSWR<CountryData | null>(
    countryCode ? `country-data-${countryCode}` : null,
    () => withRetry(() => fetchCountryData(countryCode)),
    swrConfig
  );

  return {
    data: data || null,
    error: error ? handleApiError(error) : null,
    isLoading,
    refresh: mutate,
  };
}

/**
 * Hook to fetch all Investment Clock positions
 */
export function useAllInvestmentClockPositions() {
  const { data, error, isLoading, mutate } = useSWR<InvestmentClockPosition[]>(
    'all-investment-clock-positions',
    () => withRetry(() => fetchAllInvestmentClockPositions()),
    swrConfig
  );

  return {
    data: data || [],
    error: error ? handleApiError(error) : null,
    isLoading,
    refresh: mutate,
  };
}

/**
 * Hook to fetch data for multiple countries (simplified version)
 * For proper multi-country support, consider using a different pattern
 * or call this hook separately for each country in the component
 */
export function useMultipleCountriesData(_countryCodes: string[]) {
  // For now, we'll just return empty data and let components handle individual hooks
  // This avoids the React hooks rules violation
  return {
    data: [] as CountryData[],
    errors: [] as ApiError[],
    isLoading: false,
    refresh: () => {},
  };
}

/**
 * Helper hook for real-time updates
 */
export function useRealTimeUpdates() {
  const { refresh: refreshAllPositions } = useAllInvestmentClockPositions();

  const triggerGlobalRefresh = () => {
    refreshAllPositions();
    // You can add more global refresh logic here
  };

  return {
    triggerGlobalRefresh,
  };
}