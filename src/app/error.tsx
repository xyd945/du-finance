'use client';

import { useEffect } from 'react';
import { ErrorMessage } from '@/components/error-message';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <ErrorMessage
        title="Something went wrong"
        message={error.message || 'An unexpected error occurred'}
        onRetry={reset}
      />
    </div>
  );
}
