'use client';

import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { clsx } from 'clsx';

interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorMessage({
  title = 'Error',
  message,
  onRetry,
  className,
}: ErrorMessageProps) {
  return (
    <div className={clsx('max-w-md mx-auto text-center', className)}>
      <div className="flex flex-col items-center space-y-4">
        <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full">
          <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          <p className="mt-1 text-sm text-gray-500">{message}</p>
        </div>

        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
}
