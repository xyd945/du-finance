import useSWR from 'swr';
import { CountryData, InvestmentClockPosition, EconomicIndicator, ApiError } from '@/types';

const swrConfig = {
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  dedupingInterval: 1000, // Reduced to 1 second for faster updates
  errorRetryCount: 3,
};

// Generic fetcher for API routes
const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }
  return response.json();
};

/**
 * Hook to fetch complete country data
 */
export function useCountryData(countryCode: string) {
  const { data, error, isLoading, mutate } = useSWR<CountryData>(
    countryCode ? `/api/countries/${countryCode}` : null,
    fetcher,
    swrConfig
  );

  return {
    data: data || null,
    error: error ? { message: error.message, code: 'FETCH_ERROR' } : null,
    isLoading,
    refresh: mutate,
  };
}

/**
 * Hook to fetch all Investment Clock positions
 */
export function useAllInvestmentClockPositions() {
  const { data, error, isLoading, mutate } = useSWR<InvestmentClockPosition[]>(
    '/api/positions',
    fetcher,
    swrConfig
  );

  return {
    data: data || [],
    error: error ? { message: error.message, code: 'FETCH_ERROR' } : null,
    isLoading,
    refresh: mutate,
  };
}

/**
 * Hook to fetch economic indicators for AI analysis
 */
export function useEconomicIndicators(countryCode: string) {
  const { data, error, isLoading, mutate } = useSWR<EconomicIndicator[]>(
    countryCode ? `/api/indicators/${countryCode}` : null,
    fetcher,
    swrConfig
  );

  return {
    data: data || [],
    error: error ? { message: error.message, code: 'FETCH_ERROR' } : null,
    isLoading,
    refresh: mutate,
  };
}

/**
 * Hook to fetch data for multiple countries (simplified version)
 * For proper multi-country support, consider using a different pattern
 * or call this hook separately for each country in the component
 */
export function useMultipleCountriesData() {
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
 * Hook for real-time updates with manual refresh capability
 */
export function useRealTimeUpdates() {
  const triggerGlobalRefresh = () => {
    // Trigger a global revalidation of all SWR hooks
    import('swr').then(({ mutate }) => {
      // Specifically invalidate positions data first
      mutate('/api/positions', undefined, { revalidate: true });
      // Then invalidate all other data
      mutate(() => true, undefined, { revalidate: true });
    });
  };

  return {
    triggerGlobalRefresh,
  };
}